/**
 * 한문 요괴 원정기 결과 수집용 구글 Apps Script
 * 구글 시트에서 [확장 프로그램] → [Apps Script]에 이 코드를 붙여 넣고 웹 앱으로 배포한다.
 * 자세한 방법은 docs/결과수집.md 참고.
 */
const HEADERS = ['보낸 시각', '이름', '반-번호', '주인공', '점수', '정답', '문제 수', '정답률(%)',
  '도착한 곳', '완주', '최고 콤보', '남은 HP', '여정의 선택', '틀린 문제'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
    const d = JSON.parse(e.postData.contents);
    const clip = (v, n) => String(v == null ? '' : v).slice(0, n);
    sheet.appendRow([
      new Date(), clip(d.name, 20), clip(d.sid, 12), clip(d.char, 20),
      Number(d.score) || 0, Number(d.correct) || 0, Number(d.total) || 0, Number(d.acc) || 0,
      clip(d.stage, 20), d.won ? 'O' : 'X', Number(d.combo) || 0, Number(d.hp) || 0,
      clip(d.journey, 500), clip(d.wrong, 1000)
    ]);
    return ContentService.createTextOutput('ok');
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput('한문 요괴 원정기 결과 수집 중');
}
