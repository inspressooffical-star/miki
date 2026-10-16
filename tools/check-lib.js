// 보고서 문장 라이브러리(js/lib-*.js)의 구조·분량·금지 표현을 점검한다.
// 사용법: node tools/check-lib.js js/lib-stem-1.js [더 많은 파일...]
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const S = (min, max) => ({ t: "s", min, max });
const A = (n, min, max) => ({ t: "a", n, min, max });
const O = (keys, leaf) => ({ t: "o", keys, leaf });
const obj = (spec) => ({ t: "f", spec });

const STEMS = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
const BRANCHES = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
const GODS = ["비견", "겁재", "식신", "상관", "편재", "정재", "편관", "정관", "편인", "정인"];
const ELS = ["목", "화", "토", "금", "수"];
const POS4 = ["year", "month", "day", "hour"];
const POS6 = ["년월", "년일", "년시", "월일", "월시", "일시"];

const stemFields = {};
["core", "outer", "inner", "bright", "excess", "emotion", "stress", "study", "work", "leadership", "money", "love",
  "conflict", "family", "friends", "rhythm", "yearView", "monthView", "salView", "pairView"].forEach((k) => { stemFields[k] = S(220, 560); });
stemFields.examples = A(3, 110, 280);
stemFields.advice = A(3, 100, 240);

const godFields = {};
["meaning", "whenStrong", "whenWeak", "balanced", "work", "money", "relation", "study", "hidden", "advice"].forEach((k) => { godFields[k] = S(180, 520); });
godFields.pillar = O(POS4, S(90, 280));

const rel = (keys, min = 220, max = 520) => O(keys, S(min, max));
const posObj = O(POS6, S(120, 320));

const SPEC = {
  stem: O(STEMS, obj(stemFields)),
  tenGod: O(GODS, obj(godFields)),
  month: O(BRANCHES, obj({
    season: S(220, 560), lifeStyle: S(200, 520), rhythm: S(180, 460), byElement: O(ELS, S(160, 380))
  })),
  element: O(ELS, obj({
    lack: S(220, 520), low: S(220, 520), balanced: S(220, 520), high: S(220, 520), excess: S(220, 520),
    daily: S(180, 460), rhythm: S(180, 460), advice: A(3, 100, 240)
  })),
  flow: obj({
    sheng: rel(["목화", "화토", "토금", "금수", "수목"], 220, 520),
    ke: rel(["목토", "토수", "수화", "화금", "금목"], 220, 520),
    same: rel(ELS, 200, 480)
  }),
  branch: O(BRANCHES, obj({
    image: S(180, 480), asDay: S(220, 520), asYear: S(180, 440), asHour: S(180, 460), hiddenNote: S(180, 480)
  })),
  relation: obj({
    stemHap: rel(["갑기", "을경", "병신", "정임", "무계"]),
    stemChung: rel(["갑경", "을신", "병임", "정계"]),
    branchHap: rel(["자축", "인해", "묘술", "진유", "사신", "오미"]),
    branchChung: rel(["자오", "축미", "인신", "묘유", "진술", "사해"]),
    hyung: rel(["인사신", "축술미", "자묘", "자형"]),
    pa: rel(["자유", "축진", "인해", "묘오", "사신", "미술"]),
    hae: rel(["자미", "축오", "인사", "묘진", "신해", "유술"]),
    samhap: rel(["수국", "목국", "화국", "금국"]),
    banhap: rel(["수국", "목국", "화국", "금국"]),
    position: obj({ hap: posObj, chung: posObj, hyung: posObj, pa: posObj, hae: posObj })
  }),
  tojeong: obj({
    monthTheme: O(BRANCHES, S(180, 440)),
    byGod: O(GODS, obj({
      focus: S(180, 440), work: S(180, 440), relation: S(180, 440), money: S(180, 440), care: S(180, 440), actions: A(2, 100, 220)
    }))
  }),
  year: obj({
    byGod: O(GODS, obj({
      overall: S(200, 480), work: S(200, 480), money: S(200, 480), relation: S(200, 480),
      study: S(200, 480), rhythm: S(200, 480), caution: S(200, 480), plan: S(200, 480)
    })),
    byBranchGod: O(GODS, obj({ overall: S(180, 440), caution: S(180, 440) }))
  }),
  sal: obj({
    items: O(["도화", "역마", "화개", "귀인"], obj({
      meaning: S(200, 480), present: S(200, 480), absent: S(200, 480), soft: S(200, 480), care: S(200, 480),
      position: O(POS4, S(90, 260)), practices: A(3, 100, 240)
    })),
    care: O(ELS, S(250, 600))
  }),
  compat: obj({
    stemRel: O(["sameSame", "sameDiff", "aGenB", "bGenA", "aKeB", "bKeA"], obj({
      communication: S(200, 480), daily: S(200, 480), conflict: S(200, 480), growth: S(200, 480), role: S(200, 480)
    })),
    godView: O(GODS, obj({ view: S(200, 480), conflict: S(200, 480), tip: S(200, 480) })),
    lack: O(ELS, S(200, 480))
  })
};

const BANNED = [/반드시/, /틀림없/, /확실히 (?:된|될|생길|일어)/, /죽/, /사망/, /암에|암이|질병에 걸/, /사고(?:가|를) 당/, /수익을? 보장/, /무조건/, /100%/, /\"/];

function check(node, spec, where, out, stats) {
  if (spec.t === "s") {
    if (typeof node !== "string") return out.push(`${where}: 문자열이 아님`);
    const n = [...node].length;
    stats.chars += n;
    if (n < Math.floor(spec.min * 0.6) || n > spec.max) out.push(`${where}: 길이 ${n} (허용 ${Math.floor(spec.min * 0.6)}~${spec.max})`);
    BANNED.forEach((re) => { if (re.test(node)) out.push(`${where}: 금지 표현 ${re}`); });
    if (/\n/.test(node)) out.push(`${where}: 줄바꿈 포함`);
  } else if (spec.t === "a") {
    if (!Array.isArray(node) || node.length !== spec.n) return out.push(`${where}: 배열 ${spec.n}개 필요`);
    node.forEach((item, i) => check(item, S(spec.min, spec.max), `${where}[${i}]`, out, stats));
  } else if (spec.t === "o") {
    if (!node || typeof node !== "object") return out.push(`${where}: 객체가 아님`);
    spec.keys.forEach((key) => {
      if (!(key in node)) out.push(`${where}.${key}: 없음`);
    });
    Object.keys(node).forEach((key) => {
      if (!spec.keys.includes(key)) out.push(`${where}.${key}: 정의되지 않은 키`);
      else check(node[key], spec.leaf, `${where}.${key}`, out, stats);
    });
  } else if (spec.t === "f") {
    Object.keys(spec.spec).forEach((key) => {
      if (!(key in node)) out.push(`${where}.${key}: 없음`);
      else check(node[key], spec.spec[key], `${where}.${key}`, out, stats);
    });
    Object.keys(node).forEach((key) => { if (!(key in spec.spec)) out.push(`${where}.${key}: 정의되지 않은 키`); });
  }
}

function load(files) {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  files.forEach((file) => vm.runInContext(fs.readFileSync(file, "utf8"), sandbox, { filename: file }));
  return sandbox.window.MikiLib || {};
}

if (require.main === module) {
  const files = process.argv.slice(2).map((f) => path.resolve(f));
  const lib = load(files);
  const errors = [];
  const stats = { chars: 0 };
  Object.keys(lib).forEach((key) => {
    if (!SPEC[key]) return errors.push(`${key}: 알 수 없는 라이브러리 키`);
    // 파일에 포함된 항목만 검사한다(여러 파일이 같은 키를 나눠 채운다).
    const spec = SPEC[key];
    if (spec.t === "o") {
      Object.keys(lib[key]).forEach((entry) => {
        if (!spec.keys.includes(entry)) errors.push(`${key}.${entry}: 정의되지 않은 항목`);
        else check(lib[key][entry], spec.leaf, `${key}.${entry}`, errors, stats);
      });
    } else {
      Object.keys(lib[key]).forEach((entry) => {
        if (!spec.spec[entry]) errors.push(`${key}.${entry}: 정의되지 않은 항목`);
        else if (spec.spec[entry].t === "o" && lib[key][entry] && typeof lib[key][entry] === "object") {
          const sub = spec.spec[entry];
          sub.keys.forEach((k) => { if (!(k in lib[key][entry])) errors.push(`${key}.${entry}.${k}: 없음`); });
          Object.keys(lib[key][entry]).forEach((k) => {
            if (!sub.keys.includes(k)) errors.push(`${key}.${entry}.${k}: 정의되지 않은 키`);
            else check(lib[key][entry][k], sub.leaf, `${key}.${entry}.${k}`, errors, stats);
          });
        } else check(lib[key][entry], spec.spec[entry], `${key}.${entry}`, errors, stats);
      });
    }
    const keys = Object.keys(lib[key]);
    console.log(`${key}: ${keys.length}개 항목 [${keys.join(",")}]`);
  });
  console.log(`총 글자 수(공백 포함): ${stats.chars}`);
  if (errors.length) {
    console.log(`문제 ${errors.length}건`);
    errors.slice(0, 80).forEach((e) => console.log(" -", e));
    process.exit(1);
  }
  console.log("통과");
}

module.exports = { SPEC, load, check, STEMS, BRANCHES, GODS, ELS };
