/**
 * Google Apps Script (Webアプリ) 受信用コード
 * - 下記 SPREADSHEET_ID と SHEET_NAME を変更
 * - デプロイ: [デプロイ] > [新しいデプロイ] > [ウェブアプリ]
 */
const SPREADSHEET_ID = 'ここにスプレッドシートID';
const SHEET_NAME = 'シート1';

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('指定シートが見つかりません: ' + SHEET_NAME);

    const answers = Array.isArray(payload.answers) ? payload.answers : [];
    const row = [
      payload.timestamp || new Date().toISOString(),
      payload.name || '',
      payload.job || '',
      payload.email || '',
      payload.totalScore || '',
      payload.businessBaseScore || '',
      payload.aiDialogueScore || '',
      payload.pipelineScore || '',
      payload.typeName || '',
      payload.bottleneck || '',
      payload.pipelineBottleneck || '',
      answers[0] || '', answers[1] || '', answers[2] || '', answers[3] || '', answers[4] || '',
      answers[5] || '', answers[6] || '', answers[7] || '', answers[8] || '', answers[9] || '',
      answers[10] || '', answers[11] || '', answers[12] || '', answers[13] || '', answers[14] || '',
      payload.userAgent || '',
      payload.pageUrl || ''
    ];

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, message: 'saved' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, message: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 初期ヘッダー作成（必要時に一度だけ実行）
 */
function setupHeader() {
  const headers = [
    'タイムスタンプ','名前','仕事内容','メールアドレス','総合スコア','ビジネス土台スコア','AI対話力スコア','売上パイプラインスコア','タイプ名',
    '最大ボトルネック','売上パイプライン最大ボトルネック',
    'Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8','Q9','Q10','Q11','Q12','Q13','Q14','Q15',
    'ユーザーエージェント','ページURL'
  ];
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
}
