// 음력 표 생성 도구: 개발 환경에서만 사용한다.
// 사용법: npm i lunar-javascript 후 node tools/generate-lunar.js > js/saju-lunar.js
const { Lunar, LunarYear } = require("lunar-javascript");

const pad = (n) => String(n).padStart(2, "0");
const rows = [];
for (let year = 1900; year <= 2100; year += 1) {
  const months = LunarYear.fromYear(year).getMonths().filter((month) => month.getYear() === year);
  const leap = months.find((month) => month.getMonth() < 0);
  const first = Lunar.fromYmd(year, 1, 1).getSolar();
  const lengths = months.map((month) => (month.getDayCount() === 30 ? "1" : "0")).join("");
  rows.push(`    ${year}: "${leap ? pad(-leap.getMonth()) : "00"}${pad(first.getMonth())}${pad(first.getDay())}${lengths}"`);
}

console.log(`(function () {
  "use strict";

  // 연도별 음력 달력표. 각 값은 [윤달 달 번호 2자리][음력 1월 1일의 양력 월일 4자리][달별 일수 비트열: 1=30일, 0=29일]이며
  // 달은 1월부터 순서대로, 윤달은 해당 달 바로 뒤에 들어간다. 오픈소스 lunar-javascript(MIT)의 만세력 표를 변환했다.
  window.MikiLunarTable = Object.freeze({
${rows.join(",\n")}
  });
}());`);
