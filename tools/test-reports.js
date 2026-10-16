// 보고서 엔진 점검: 분량, 서비스별 차이, 명식별 차이, 반복 문단, 금지 표현.
// 사용법: node tools/test-reports.js [--print classic|tojeong|year|sal|compat]
const fs = require("fs");
const path = require("path");
global.window = global;
const js = path.join(__dirname, "..", "js");
["saju-terms", "saju-lunar", "saju-core", "saju-analysis"].forEach((f) => require(path.join(js, f + ".js")));
fs.readdirSync(js).filter((f) => /^lib-.*\.js$/.test(f)).forEach((f) => require(path.join(js, f)));
require(path.join(js, "report-engine.js"));

const R = global.MikiReport;
const now = new Date("2026-06-01T03:00:00Z");
const charts = [
  { label: "A 1990-05-15 14:30 여", input: { birthDate: "1990-05-15", calendar: "solar", leapMonth: false, birthTime: "14:30" }, gender: "female" },
  { label: "B 1984-11-03 07:10 남", input: { birthDate: "1984-11-03", calendar: "solar", leapMonth: false, birthTime: "07:10" }, gender: "male" },
  { label: "C 2001-02-04 시간미상 선택안함", input: { birthDate: "2001-02-04", calendar: "solar", leapMonth: false, birthTime: "" }, gender: "undisclosed" },
  { label: "D 1975-08-22 23:40 여", input: { birthDate: "1975-08-22", calendar: "solar", leapMonth: false, birthTime: "23:40" }, gender: "female" }
];
const banned = [/반드시/, /틀림없/, /무조건/, /100%/, /사망/, /죽/, /용신/, /수익을? 보장/];
const text = (r) => R.toPlainText(r);
const paras = (r) => r.sections.flatMap((s) => s.blocks.filter((b) => b.t === "p").map((b) => b.text));

let failed = false;
const results = {};
for (const kind of ["classic", "tojeong", "year", "sal"]) {
  results[kind] = [];
  charts.forEach((chart) => {
    const r = R.build(kind, chart.input, { gender: chart.gender, now, name: "" });
    const p = paras(r);
    const dup = p.length - new Set(p).size;
    const hit = banned.filter((re) => re.test(text(r)));
    results[kind].push({ chart: chart.label, chars: r.chars, sections: r.sections.length, dup, banned: hit.map(String) });
    if (dup || hit.length) failed = true;
  });
}
const compat = R.buildCompat(charts[0].input, charts[1].input, { first: { gender: "female", name: "가" }, second: { gender: "male", name: "나" }, now });
console.log("종류별 글자 수(공백 포함)");
Object.entries(results).forEach(([kind, rows]) => rows.forEach((row) => console.log(kind.padEnd(8), row.chart.padEnd(34), String(row.chars).padStart(7), "절", row.sections, "중복", row.dup, row.banned.join(""))));
console.log("compat".padEnd(8), "A×B".padEnd(34), String(compat.chars).padStart(7), "절", compat.sections.length);

const a = text(R.build("classic", charts[0].input, { gender: "female", now }));
const b = text(R.build("classic", charts[1].input, { gender: "male", now }));
const sa = new Set(a.split("\n").filter((x) => x.length > 40));
const shared = b.split("\n").filter((x) => x.length > 40 && sa.has(x)).length;
console.log(`명식 A·B 정통 사주 공통 문단 ${shared} / ${sa.size}`);
const c = R.build("classic", charts[2].input, { gender: "undisclosed", now });
console.log("시간 미상: 시주 문구", /시주 [가-힣]{2}\(/.test(text(c)) ? "있음(오류)" : "없음(정상)", "· 대운", /대운은 이번에 계산하지 않았어/.test(text(c)) ? "미계산 안내" : "확인필요");
const arg = process.argv.indexOf("--print");
if (arg > -1) {
  const kind = process.argv[arg + 1];
  const chart = charts[0];
  const rep = kind === "compat" ? compat : R.build(kind, chart.input, { gender: chart.gender, now, name: "" });
  console.log("\n" + text(rep) + `\n\n[총 ${rep.chars}자]`);
  const out = process.argv.indexOf("--out");
  if (out > -1) fs.writeFileSync(process.argv[out + 1], text(rep) + `\n\n[총 ${rep.chars}자]\n`, "utf8");
}
process.exit(failed ? 1 : 0);
