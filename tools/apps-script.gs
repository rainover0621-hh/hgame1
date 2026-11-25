/**
 * 한문 요괴 원정기 기록 모으기 · 오늘의 순위 · 교사 기록 보기용 구글 Apps Script
 * 구글 시트에서 [확장 프로그램] → [Apps Script]에 이 코드를 붙여 넣고 웹 앱으로 배포한다.
 * 자세한 방법은 docs/결과수집.md 참고.
 *
 * 시트 탭 (없으면 자동으로 만든다)
 *  - 기록            : 판마다 한 줄 (게임이 끝날 때 학생 기기에서 보낸다)
 *  - 오답            : 틀린 문제마다 한 줄
 *  - 요약            : 학생마다 한 줄 (플레이 횟수 · 완주 횟수 · 최고 점수 · 평균 정답률 · 마지막 플레이)
 *  - 많이 틀린 문제  : 문제별 틀린 횟수, 많은 순
 *  - 명렬            : 선생님이 학년 · 반 · 번호 · 이름을 붙여 넣어 두면, 오른쪽 칸에 학생별 기록을 채운다
 * 요약 · 많이 틀린 문제 · 명렬은 기록이 들어올 때 1분에 한 번쯤 저절로 다시 정리된다.
 * 바로 정리하려면 시트 메뉴 [원정기 기록] → [지금 정리하기].
 * 시험 모드(?stage= · ?boss=) 기록은 '기록' 탭에만 남고(시험 모드 O), 정리 · 순위에서는 빠진다.
 */

// 교사 기록 보기에 쓸 비밀번호. 학생에게 알려 주지 말고 꼭 바꿔서 쓴다.
const TEACHER_KEY = '여기에-비밀번호';

const VERSION = '2026-11-25d';
const TZ = 'Asia/Seoul';

const LOG = '기록', WRONG = '오답', SUM = '요약', TOP = '많이 틀린 문제', ROSTER = '명렬';
const LOG_HEAD = ['받은 시각', '학년', '반', '번호', '이름', '결과', '완주(1)', '점수', '맞힌 수', '푼 수', '정답률',
  '도달', '물리친 적', '최고 연속', '출제 범위', '플레이(초)', '틀린 문제', '주인공', '남은 HP', '시험 모드', '여정의 선택'];
const WRONG_HEAD = ['받은 시각', '학년', '반', '번호', '이름', '틀린 문제'];
const SUM_HEAD = ['학년', '반', '번호', '이름', '플레이 횟수', '완주 횟수', '최고 점수', '평균 정답률', '마지막 플레이'];
const TOP_HEAD = ['문제', '틀린 횟수'];
const ROSTER_STAT = ['플레이 횟수', '완주 횟수', '최고 점수', '평균 정답률', '오늘 최고 점수', '마지막 플레이'];

function ss_() { return SpreadsheetApp.getActiveSpreadsheet(); }

function tab_(name, head) {
  const ss = ss_();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    if (ss.getSpreadsheetTimeZone() !== TZ) ss.setSpreadsheetTimeZone(TZ);
  }
  if (head && sh.getLastRow() === 0) {
    sh.appendRow(head);
    sh.getRange(1, 1, 1, head.length).setFontWeight('bold').setBackground('#f1ead7');
    sh.setFrozenRows(1);
  }
  return sh;
}

// 결과 이름: 완주하면 정답률에 따라 대첩(90% 이상) · 승전(75% 이상) · 신승, 완주하지 못하면 패퇴
function verdict_(won, acc) {
  if (!won) return '패퇴';
  return acc >= 90 ? '대첩' : acc >= 75 ? '승전' : '신승';
}

// 학생 기록 받기 (게임이 판을 마칠 때 보낸다)
function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  const clip = (v, n) => String(v == null ? '' : v).slice(0, n);
  const num = v => Number(v) || 0;
  const now = new Date();
  const acc = num(d.acc), won = !!d.won, test = !!d.test;
  const wrong = Array.isArray(d.wrongList) ? d.wrongList.map(w => clip(w, 300)).slice(0, 60)
    : String(d.wrong || '').split(' / ').filter(Boolean);
  const who = [clip(d.grade, 2), clip(d.cls, 3), clip(d.no, 3), clip(d.name, 10)];

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const log = tab_(LOG, LOG_HEAD);
    log.appendRow([now].concat(who, [
      verdict_(won, acc), won ? 1 : 0, num(d.score), num(d.correct), num(d.total), acc / 100,
      clip(d.stage, 40), num(d.kills), num(d.combo), clip(d.units, 300), Math.min(num(d.secs), 36000),
      clip(wrong.join('\n'), 5000), clip(d.char, 20), num(d.hp), test ? 'O' : '', clip(d.journey, 500)
    ]));
    log.getRange(log.getLastRow(), 11).setNumberFormat('0%');
    if (!test && wrong.length) {
      const w = tab_(WRONG, WRONG_HEAD), at = w.getLastRow() + 1;
      w.getRange(at, 1, wrong.length, 6).setValues(wrong.map(q => [now].concat(who, [q])));
    }
  } finally {
    lock.releaseLock();
  }
  // 정리 탭은 1분에 한 번쯤만 다시 만든다 (여러 학생이 한꺼번에 보내도 느려지지 않게)
  const cache = CacheService.getScriptCache();
  if (!cache.get('refreshing')) {
    cache.put('refreshing', '1', 60);
    try { refresh_(); } catch (err) { console.error(err); }
  }
  return ContentService.createTextOutput('ok');
}

const day_ = v => { const d = v instanceof Date ? v : new Date(v); return isNaN(d) ? String(v) : Utilities.formatDate(d, TZ, 'yyyy-MM-dd'); };
const stamp_ = (v, f) => { const d = v instanceof Date ? v : new Date(v); return isNaN(d) ? String(v) : Utilities.formatDate(d, TZ, f); };
const pct_ = v => { const n = Number(v) || 0; return n <= 1 ? Math.round(n * 100) : Math.round(n); };

function rows_() {
  const sh = ss_().getSheetByName(LOG);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, LOG_HEAD.length).getValues().filter(r => r[0] !== '').map(r => ({
    at: r[0], time: stamp_(r[0], 'yyyy-MM-dd HH:mm'), date: day_(r[0]),
    grade: String(r[1]), cls: String(r[2]), no: String(r[3]), name: String(r[4]),
    result: String(r[5]), won: Number(r[6]) === 1, score: Number(r[7]) || 0, correct: Number(r[8]) || 0, total: Number(r[9]) || 0,
    acc: pct_(r[10]), stage: String(r[11]), kills: Number(r[12]) || 0, combo: Number(r[13]) || 0, units: String(r[14]),
    secs: Number(r[15]) || 0, wrong: String(r[16]).split('\n').filter(Boolean).join(' / '), char: String(r[17]), hp: Number(r[18]) || 0,
    test: r[19] === 'O', journey: String(r[20])
  }));
}

const key_ = (g, c, n) => [g, c, n].map(v => String(v).trim().replace(/^0+(?=\d)/, '')).join('|');

// 요약 · 많이 틀린 문제 · 명렬 다시 만들기
function refresh_() {
  const all = rows_().filter(r => !r.test);
  const today = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');

  // 학생별 모으기
  const by = {};
  for (const r of all) {
    const k = key_(r.grade, r.cls, r.no);
    const s = by[k] || (by[k] = { grade: r.grade, cls: r.cls, no: r.no, name: r.name, n: 0, won: 0, best: 0, accSum: 0, todayBest: null, last: null });
    s.name = r.name; s.n++; s.won += r.won ? 1 : 0; s.best = Math.max(s.best, r.score); s.accSum += r.acc;
    if (r.date === today) s.todayBest = Math.max(s.todayBest || 0, r.score);
    const t = new Date(r.at); if (!s.last || t > s.last) s.last = t;
  }
  const num = v => Number(v) || 0;
  const list = Object.values(by).sort((a, b) => num(a.grade) - num(b.grade) || num(a.cls) - num(b.cls) || num(a.no) - num(b.no));

  // 요약
  const sum = tab_(SUM, SUM_HEAD);
  if (sum.getLastRow() > 1) sum.getRange(2, 1, sum.getLastRow() - 1, SUM_HEAD.length).clearContent();
  if (list.length) {
    sum.getRange(2, 1, list.length, SUM_HEAD.length).setValues(list.map(s =>
      [s.grade, s.cls, s.no, s.name, s.n, s.won, s.best, s.accSum / s.n / 100, stamp_(s.last, 'yyyy-MM-dd HH:mm')]));
    sum.getRange(2, 8, list.length, 1).setNumberFormat('0%');
  }

  // 많이 틀린 문제 (오답 탭 기준)
  const w = ss_().getSheetByName(WRONG), cnt = {};
  if (w && w.getLastRow() > 1) w.getRange(2, 6, w.getLastRow() - 1, 1).getValues().forEach(([q]) => { if (q) cnt[q] = (cnt[q] || 0) + 1; });
  const top = Object.entries(cnt).sort((a, b) => b[1] - a[1]);
  const tp = tab_(TOP, TOP_HEAD);
  if (tp.getLastRow() > 1) tp.getRange(2, 1, tp.getLastRow() - 1, 2).clearContent();
  if (top.length) tp.getRange(2, 1, top.length, 2).setValues(top);

  // 명렬: A~D(학년 · 반 · 번호 · 이름)는 선생님이 넣은 그대로 두고, E~J에 기록을 채운다
  const ro = tab_(ROSTER, ['학년', '반', '번호', '이름'].concat(ROSTER_STAT));
  ro.getRange(1, 5, 1, ROSTER_STAT.length).setValues([ROSTER_STAT]).setFontWeight('bold').setBackground('#f1ead7');
  const n = ro.getLastRow() - 1;
  if (n > 0) {
    const ids = ro.getRange(2, 1, n, 3).getValues();
    ro.getRange(2, 5, n, ROSTER_STAT.length).setValues(ids.map(([g, c, no]) => {
      if (g === '' && c === '' && no === '') return ['', '', '', '', '', ''];
      const s = by[key_(g, c, no)];
      return s ? [s.n, s.won, s.best, s.accSum / s.n / 100, s.todayBest == null ? '-' : s.todayBest, stamp_(s.last, 'MM-dd HH:mm')]
        : [0, 0, '-', '-', '-', '-'];
    }));
    ro.getRange(2, 8, n, 1).setNumberFormat('0%');
  }
}

// 시트를 열면 위쪽 메뉴에 [원정기 기록]이 생긴다
function onOpen() {
  SpreadsheetApp.getUi().createMenu('원정기 기록').addItem('지금 정리하기', 'refreshNow').addToUi();
}
function refreshNow() {
  refresh_();
  SpreadsheetApp.getActive().toast('요약 · 많이 틀린 문제 · 명렬을 다시 정리했습니다.', '원정기 기록', 4);
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

// ?action=ping        점검용: 코드 버전과 기록 수(이름 등 개인 정보 없음)
// ?action=today       오늘의 순위 (시험 모드 제외)
// ?action=all&key=…   교사용 전체 기록
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action === 'ping') {
    const all = rows_(), today = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');
    return json_({ ok: true, version: VERSION, rows: all.length, today: all.filter(r => r.date === today).length,
      lastDate: all.length ? all[all.length - 1].date : '' });
  }
  if (p.action === 'today') {
    const today = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');
    const rows = rows_().filter(r => r.date === today && !r.test)
      .map(r => ({ grade: r.grade, cls: r.cls, no: r.no, name: r.name, char: r.char, score: r.score, acc: r.acc, stage: r.stage, won: r.won }));
    return json_({ ok: true, date: today, rows: rows });
  }
  if (p.action === 'all') {
    if (p.key !== TEACHER_KEY) return json_({ ok: false, error: '비밀번호가 맞지 않습니다.' });
    return json_({ ok: true, rows: rows_().map(r => { const o = Object.assign({}, r); delete o.at; return o; }) });
  }
  return ContentService.createTextOutput('한문 요괴 원정기 기록 모으는 중');
}
