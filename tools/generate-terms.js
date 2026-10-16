// 절기(節) 시각 표 생성 도구: 개발 환경에서만 사용하고 사이트에는 포함되지 않는다.
// 사용법: npm i lunar-javascript 후 node tools/generate-terms.js > js/saju-terms.js
const { Solar } = require("lunar-javascript");

const jie = ["小寒", "立春", "惊蛰", "清明", "立夏", "芒种", "小暑", "立秋", "白露", "寒露", "立冬", "大雪"];
const rows = [];
for (let year = 1900; year <= 2100; year += 1) {
  const table = Solar.fromYmd(year, 6, 1).getLunar().getJieQiTable();
  const cells = jie.map((name) => {
    const s = table[name];
    if (!s || s.getYear() !== year) throw new Error(`${year} ${name} 없음`);
    // 라이브러리는 중국 표준시(UTC+8)이므로 한국 표준시(UTC+9)로 바꾸고 가장 가까운 분으로 반올림한다(공개 절기 시각과 ±1분 차이가 날 수 있다).
    const stamp = Date.UTC(s.getYear(), s.getMonth() - 1, s.getDay(), s.getHour(), s.getMinute(), s.getSecond());
    const kst = new Date(Math.round((stamp + 3600000) / 60000) * 60000);
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(kst.getUTCMonth() + 1)}${pad(kst.getUTCDate())}${pad(kst.getUTCHours())}${pad(kst.getUTCMinutes())}`;
  });
  rows.push(`    ${year}: "${cells.join("")}"`);
}

console.log(`(function () {
  "use strict";

  // 연도별 12절기(소한·입춘·경칩·청명·입하·망종·소서·입추·백로·한로·입동·대설)의 한국 표준시 시각.
  // 각 절기는 MMDDHHmm 여덟 글자이며, 오픈소스 lunar-javascript(MIT)의 절기 표를 한국 표준시로 변환했다.
  window.MikiSolarTerms = Object.freeze({
${rows.join(",\n")}
  });
}());`);
