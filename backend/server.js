import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

const store = [];

function asDate(input) {
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, now: new Date().toISOString() });
});

app.post('/api/diagnosis', (req, res) => {
  const body = req.body || {};
  if (!body.profile?.name || !body.profile?.email) {
    return res.status(400).json({ message: 'name and email are required' });
  }

  const record = {
    diagnosisId: uuidv4(),
    answeredAt: new Date().toISOString(),
    ...body,
  };

  store.push(record);
  res.status(201).json({ diagnosisId: record.diagnosisId });
});

app.get('/api/diagnosis', (req, res) => {
  const { date_from, date_to, industry, type, score_min, score_max, delivery } = req.query;

  let rows = [...store];

  if (date_from) {
    const from = asDate(date_from);
    if (from) rows = rows.filter(r => new Date(r.answeredAt) >= from);
  }
  if (date_to) {
    const to = asDate(date_to);
    if (to) rows = rows.filter(r => new Date(r.answeredAt) <= to);
  }
  if (industry) rows = rows.filter(r => r.profile?.industryCategory === industry);
  if (type) rows = rows.filter(r => r.typeResult === type);
  if (delivery) rows = rows.filter(r => r.profile?.deliveryFormat === delivery);
  if (score_min) rows = rows.filter(r => Number(r.totalScore) >= Number(score_min));
  if (score_max) rows = rows.filter(r => Number(r.totalScore) <= Number(score_max));

  res.json({ total: rows.length, rows });
});

app.get('/api/diagnosis/:id', (req, res) => {
  const found = store.find(r => r.diagnosisId === req.params.id);
  if (!found) return res.status(404).json({ message: 'not found' });
  res.json(found);
});

app.get('/api/diagnosis/export.csv', (req, res) => {
  const header = [
    'diagnosisId', 'answeredAt', 'name', 'email', 'industryCategory',
    'deliveryFormat', 'totalScore', 'normalizedScore', 'typeResult'
  ];

  const lines = [header.join(',')];
  for (const r of store) {
    lines.push([
      r.diagnosisId,
      r.answeredAt,
      (r.profile?.name || '').replaceAll(',', ' '),
      (r.profile?.email || '').replaceAll(',', ' '),
      (r.profile?.industryCategory || '').replaceAll(',', ' '),
      (r.profile?.deliveryFormat || '').replaceAll(',', ' '),
      r.totalScore,
      r.normalizedScore,
      (r.typeResult || '').replaceAll(',', ' ')
    ].join(','));
  }

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="diagnosis.csv"');
  res.send(lines.join('\n'));
});

app.listen(port, () => {
  console.log(`moneyblock backend listening on :${port}`);
});
