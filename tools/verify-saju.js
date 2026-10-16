// 사주 계산 검증 도구(개발용). 사용법: npm i lunar-javascript 후 node tools/verify-saju.js
// 기준 구현: lunar-javascript(만세력 라이브러리). 입력 시각은 한국 표준시이며,
// 절기 비교용으로만 중국 표준시(-1시간)로 바꿔 넣고 일주·시주는 입력 시계를 그대로 비교한다.
const fs = require("fs");
const path = require("path");
global.window = {};
for (const file of ["saju-terms.js", "saju-lunar.js", "saju-core.js"]) {
  // eslint-disable-next-line no-eval
  (0, eval)(fs.readFileSync(path.join(__dirname, "..", "js", file), "utf8"));
}
const core = window.SajuCore;
const { Solar, Lunar, LunarYear } = require("lunar-javascript");

let failures = 0;
const fail = (message) => { failures += 1; if (failures <= 40) console.log("불일치:", message); };
const gz = (p) => p.stem.hanja + p.branch.hanja;
const pad = (n) => String(n).padStart(2, "0");

// 1) 알려진 기준 사례(한국천문연구원 공개 절기 시각 등)
const knownTerms = [
  ["2021-02-03T23:58", 2021], ["2022-02-04T05:51", 2022], ["2023-02-04T11:42", 2023],
  ["2024-02-04T17:27", 2024], ["2025-02-03T23:10", 2025], ["2026-02-04T05:02", 2026]
];
knownTerms.forEach(([stamp, year]) => {
  const t = new Date(core.solarTerm(year, 2) + 9 * 3600000).toISOString().slice(0, 16);
  if (Math.abs(Date.parse(t + "Z") - Date.parse(stamp + "Z")) > 60000) fail(`${year} 입춘 ${t} ≠ ${stamp}`);
});
const cases = [
  ["2000-01-01", "12:00", "己卯丙子戊午戊午"],
  ["1999-11-20", "03:36", "己卯乙亥丙子庚寅"],
  ["2024-02-04", "17:26", "癸卯乙丑戊戌辛酉"],
  ["2024-02-04", "17:27", "甲辰丙寅戊戌辛酉"]
];
cases.forEach(([date, time, expected]) => {
  const c = core.calculate({ birthDate: date, calendar: "solar", birthTime: time });
  const actual = [c.yearPillar, c.monthPillar, c.dayPillar, c.hourPillar].map(gz).join("");
  if (actual !== expected) fail(`${date} ${time} ${actual} ≠ ${expected}`);
});

// 2) 무작위 양력 날짜·시각 비교 (연·월은 절기 시각 기준 순간, 일·시는 시계 기준)
let seed = 12345;
const rand = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
let checked = 0;
for (let i = 0; i < 6000; i += 1) {
  const year = 1901 + Math.floor(rand() * 199);
  const month = 1 + Math.floor(rand() * 12);
  const day = 1 + Math.floor(rand() * 28);
  const hour = Math.floor(rand() * 24);
  const minute = Math.floor(rand() * 60);
  const c = core.calculate({ birthDate: `${year}-${pad(month)}-${pad(day)}`, calendar: "solar", birthTime: `${pad(hour)}:${pad(minute)}` });
  const clock = Solar.fromYmdHms(year, month, day, hour, minute, 0).getLunar().getEightChar();
  clock.setSect(1);
  const bj = new Date(Date.UTC(year, month - 1, day, hour - 1, minute));
  const instant = Solar.fromYmdHms(bj.getUTCFullYear(), bj.getUTCMonth() + 1, bj.getUTCDate(), bj.getUTCHours(), bj.getUTCMinutes(), 0).getLunar().getEightChar();
  const expected = instant.getYear() + instant.getMonth() + clock.getDay() + clock.getTime();
  const actual = [c.yearPillar, c.monthPillar, c.dayPillar, c.hourPillar].map(gz).join("");
  checked += 1;
  if (actual !== expected) fail(`${year}-${month}-${day} ${hour}:${minute} ${actual} ≠ ${expected}`);
}
console.log(`무작위 명식 ${checked}건 비교`);

// 3) 절기 직전·직후 1분 경계: 한국 표준시 절기 시각 기준으로 월주가 바뀌는지
const jie = ["小寒", "立春", "惊蛰", "清明", "立夏", "芒种", "小暑", "立秋", "白露", "寒露", "立冬", "大雪"];
let boundaries = 0;
for (let year = 1902; year <= 2098; year += 1) {
  const table = Solar.fromYmd(year, 6, 1).getLunar().getJieQiTable();
  jie.forEach((name, i) => {
    const stamp = core.solarTerm(year, i * 2);
    const at = (offset) => {
      const d = new Date(stamp + offset * 60000 + 9 * 3600000);
      return core.calculate({
        birthDate: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`,
        calendar: "solar", birthTime: `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
      });
    };
    const before = at(-1), after = at(0);
    boundaries += 1;
    if (before.monthPillar.cycleIndex === after.monthPillar.cycleIndex) fail(`${year} ${name} 월주가 경계에서 바뀌지 않음`);
    if (i === 1 && before.yearPillar.cycleIndex === after.yearPillar.cycleIndex) fail(`${year} 입춘 연주가 바뀌지 않음`);
    const ref = table[name];
    const bj = Date.UTC(ref.getYear(), ref.getMonth() - 1, ref.getDay(), ref.getHour(), ref.getMinute(), ref.getSecond()) - 8 * 3600000;
    if (Math.abs(bj - stamp) > 60000) fail(`${year} ${name} 표 시각 차이 ${(bj - stamp) / 1000}초`);
  });
}
console.log(`절기 경계 ${boundaries}건 확인`);

// 4) 음력→양력 변환(윤달 포함) 비교
let lunarChecked = 0;
for (let year = 1901; year <= 2099; year += 1) {
  const ly = LunarYear.fromYear(year);
  ly.getMonths().forEach((m) => {
    if (m.getYear() !== year) return;
    [1, 15, m.getDayCount()].forEach((day) => {
      const lm = m.getMonth();
      const leap = lm < 0;
      const ref = Lunar.fromYmd(year, lm, day).getSolar();
      const lunarDate = `${year}-${pad(Math.abs(lm))}-${pad(day)}`;
      let ours;
      try { ours = core.calculate({ birthDate: lunarDate, calendar: "lunar", leapMonth: leap }).solarDate; } catch (error) { fail(`${lunarDate} 윤달 ${leap} 오류 ${error.message}`); return; }
      lunarChecked += 1;
      if (ours.year !== ref.getYear() || ours.month !== ref.getMonth() || ours.day !== ref.getDay()) fail(`음력 ${lunarDate}${leap ? "(윤)" : ""} → ${ours.year}-${ours.month}-${ours.day} ≠ ${ref.toYmd()}`);
    });
  });
}
console.log(`음력 변환 ${lunarChecked}건 비교`);

// 5) 시간 미상: 시주를 만들지 않고, 절기 당일에는 불확실 표시
const unknown = core.calculate({ birthDate: "2024-02-04", calendar: "solar", birthTime: "" });
if (unknown.hourPillar || unknown.pillars.length !== 3) fail("시간 미상인데 시주가 생성됨");
if (!unknown.termBoundary || !unknown.termBoundary.isLiChun) fail("입춘 당일 시간 미상 불확실 표시 없음");
const plain = core.calculate({ birthDate: "2024-03-10", calendar: "solar", birthTime: "" });
if (plain.hourPillar || plain.termBoundary) fail("일반 날짜 시간 미상 처리 오류");

// 6) 자시 경계: 23:00부터 다음 날 일주·시주(자시 기준)
const night = core.calculate({ birthDate: "2000-01-01", calendar: "solar", birthTime: "23:30" });
const next = core.calculate({ birthDate: "2000-01-02", calendar: "solar", birthTime: "00:30" });
if (gz(night.dayPillar) !== gz(next.dayPillar) || gz(night.hourPillar) !== gz(next.hourPillar)) fail("자시 경계 일주·시주 불일치");

if (failures) { console.log(`실패 ${failures}건`); process.exit(1); }
console.log("모든 검증 통과");
