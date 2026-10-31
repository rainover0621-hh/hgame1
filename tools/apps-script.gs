/**
 * 한문 요괴 원정기 기록 모으기 · 오늘의 순위 · 교사 기록 보기용 구글 Apps Script
 * 구글 시트에서 [확장 프로그램] → [Apps Script]에 이 코드를 붙여 넣고 웹 앱으로 배포한다.
 * 자세한 방법은 docs/결과수집.md 참고.
 */

// 교사 기록 보기에 쓸 비밀번호. 학생에게 알려 주지 말고 꼭 바꿔서 쓴다.
const TEACHER_KEY = '여기에-비밀번호';

const HEADERS = ['보낸 시각', '날짜', '학년', '반', '번호', '이름', '주인공', '점수', '정답', '문제 수', '정답률(%)',
  '도착한 곳', '완주', '최고 콤보', '남은 HP', '출제 범위', '시험 모드', '여정의 선택', '틀린 문제'];
const TZ = 'Asia/Seoul';

function sheet_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sh.getLastRow() === 0) sh.appendRow(HEADERS);
  return sh;
}

// 학생 기록 받기 (게임이 판을 마칠 때 보낸다)
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents);
    const clip = (v, n) => String(v == null ? '' : v).slice(0, n);
    const now = new Date();
    sheet_().appendRow([
      now, Utilities.formatDate(now, TZ, 'yyyy-MM-dd'),
      clip(d.grade, 2), clip(d.cls, 3), clip(d.no, 3), clip(d.name, 10), clip(d.char, 20),
      Number(d.score) || 0, Number(d.correct) || 0, Number(d.total) || 0, Number(d.acc) || 0,
      clip(d.stage, 20), d.won ? 'O' : 'X', Number(d.combo) || 0, Number(d.hp) || 0,
      clip(d.units, 100), d.test ? 'O' : '', clip(d.journey, 500), clip(d.wrong, 1000)
    ]);
    return ContentService.createTextOutput('ok');
  } finally {
    lock.releaseLock();
  }
}

function rows_() {
  const sh = sheet_();
  const n = sh.getLastRow() - 1;
  if (n <= 0) return [];
  return sh.getRange(2, 1, n, HEADERS.length).getValues().map(r => ({
    time: Utilities.formatDate(new Date(r[0]), TZ, 'yyyy-MM-dd HH:mm'), date: String(r[1]),
    grade: String(r[2]), cls: String(r[3]), no: String(r[4]), name: String(r[5]), char: String(r[6]),
    score: Number(r[7]) || 0, correct: Number(r[8]) || 0, total: Number(r[9]) || 0, acc: Number(r[10]) || 0,
    stage: String(r[11]), won: r[12] === 'O', combo: Number(r[13]) || 0, hp: Number(r[14]) || 0,
    units: String(r[15]), test: r[16] === 'O', journey: String(r[17]), wrong: String(r[18])
  }));
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

// ?action=today       오늘의 순위 (이름 가운데는 가림, 시험 모드 제외)
// ?action=all&key=…   교사용 전체 기록
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action === 'today') {
    const today = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');
    const mask = n => n.length <= 1 ? n : n.length === 2 ? n[0] + '○' : n[0] + '○'.repeat(n.length - 2) + n[n.length - 1];
    const rows = rows_().filter(r => r.date === today && !r.test)
      .map(r => ({ grade: r.grade, cls: r.cls, no: r.no, name: mask(r.name), char: r.char, score: r.score, acc: r.acc, stage: r.stage, won: r.won }));
    return json_({ ok: true, date: today, rows: rows });
  }
  if (p.action === 'all') {
    if (p.key !== TEACHER_KEY) return json_({ ok: false, error: '비밀번호가 맞지 않습니다.' });
    return json_({ ok: true, rows: rows_() });
  }
  return ContentService.createTextOutput('한문 요괴 원정기 기록 모으는 중');
}
