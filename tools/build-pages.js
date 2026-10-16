// 모든 HTML 페이지의 공통 헤더와 스크립트 목록을 일관되게 만든다. 반복 실행해도 같은 결과가 나온다.
// 사용법: node tools/build-pages.js
const fs = require("fs");
const path = require("path");

const htmlDir = path.join(__dirname, "..", "html");
const logo = '<span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M12 3.5a8.5 8.5 0 0 1 0 17 4.25 4.25 0 0 0 0-8.5 4.25 4.25 0 0 1 0-8.5Z" fill="#D74750"/><path d="M12 3.5a8.5 8.5 0 0 0 0 17 4.25 4.25 0 0 1 0-8.5 4.25 4.25 0 0 0 0-8.5Z" fill="#31518A"/></svg></span>';

const menu = [
  ["tojeong.html", "토정비결"],
  ["classic-saju.html", "정통 사주"],
  ["sal-pul-i.html", "살풀이"],
  ["compatibility.html", "궁합보기"]
];

function header(page) {
  const links = menu.map(([href, label]) => `<a href="${href}"${href === page ? ' aria-current="page"' : ""}>${label}</a>`).join("");
  return `<header class="topbar"><div class="topbar-inner">
      <a class="brand" href="index.html" aria-label="미키사주 홈">${logo}<span>미키사주</span></a>
      <nav class="top-links" aria-label="주요 메뉴">${links}</nav>
      <a class="profile-button profile-link" id="home-member-link" data-site-member-link href="member.html"${page === "member.html" ? ' aria-current="page"' : ""}><span class="profile-avatar" aria-hidden="true">☘</span><span data-site-member-label>로그인</span></a>
    </div></header>`;
}

const libs = [
  "lib-stem-1", "lib-stem-2", "lib-stem-3", "lib-stem-4", "lib-stem-5", "lib-tengod-1", "lib-tengod-2",
  "lib-month-1", "lib-month-2", "lib-element", "lib-branch-1", "lib-branch-2", "lib-relation-1", "lib-relation-2",
  "lib-tojeong", "lib-year", "lib-sal", "lib-compat"
];
const tag = (file) => `<script src="../js/${file}.js"></script>`;
const base = [
  '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>',
  tag("supabase-config"), tag("supabase-client"), tag("saju-terms"), tag("saju-lunar"), tag("saju-core"),
  tag("miki-common"), tag("miki-account")
];
const reportStack = [...libs.map(tag), tag("saju-analysis"), tag("report-engine"), tag("report-view"), tag("birth-fields")];

const scripts = {
  "index.html": [...base, tag("front"), tag("member-home")],
  "services.html": base,
  "today-fortune.html": [...base, tag("today-fortune")],
  "member.html": [...base, tag("birth-fields"), tag("member-app")],
  "compatibility.html": [...base, ...libs.map(tag), tag("saju-analysis"), tag("report-engine"), tag("report-view"), tag("compatibility-core"), tag("compatibility-app")],
  "saju-result.html": [...base, tag("saju-result")],
  "tojeong.html": [...base, ...reportStack, tag("service-page")],
  "classic-saju.html": [...base, ...reportStack, tag("service-page")],
  "sal-pul-i.html": [...base, ...reportStack, tag("service-page")],
  "year-saju.html": [...base, ...reportStack, tag("service-page")]
};

const services = {
  "tojeong.html": {
    key: "tojeong", title: "토정비결", eyebrow: "한 해의 흐름을 열두 달로 살펴보기",
    intro: "입춘부터 이어지는 열두 절기월마다 어떤 기운이 내 일간과 만나는지, 달별로 천천히 풀어볼게."
  },
  "classic-saju.html": {
    key: "classic", title: "정통 사주", eyebrow: "연·월·일·시, 네 기둥으로 보는 나",
    intro: "사주 원국과 음양오행을 차근차근 펼쳐서, 타고난 성향과 일상의 선택을 길고 깊게 읽어볼게."
  },
  "sal-pul-i.html": {
    key: "sal", title: "살풀이", eyebrow: "두려움보다 나를 이해하는 풀이",
    intro: "살이라는 전통 표현을 겁주거나 단정 짓지 않고, 성향과 마음 돌봄의 이야기로 풀어볼게."
  },
  "year-saju.html": {
    key: "year", title: "올해의 사주", eyebrow: "올해의 기운과 나의 명식",
    intro: "태어난 명식과 입춘 기준 올해의 간지를 나란히 놓고, 일과 관계에서 참고할 흐름을 살펴봐."
  }
};

function tabs(page) {
  const items = [["tojeong.html", "토정비결"], ["classic-saju.html", "정통 사주"], ["sal-pul-i.html", "살풀이"]];
  return `<nav class="service-tabs" aria-label="개인 사주 풀이 바꿔 보기"><ul>${items.map(([href, label]) =>
    `<li><a href="${href}"${href === page ? ' aria-current="page"' : ""}>${label}</a></li>`).join("")}</ul></nav>`;
}

function servicePage(file, info) {
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#f7f7f5">
  <title>${info.title} | 미키사주</title>
  <link rel="stylesheet" href="../css/style.css">
</head>
<body>
  <div class="app service-page-app">
    ${header(file)}
    <main class="service-page-main" id="top" data-service-page="${info.key}">
      <section class="service-page-intro"><span class="result-eyebrow">${info.eyebrow}</span><h1>${info.title}</h1><p>${info.intro}</p></section>
      ${tabs(file)}
      <section class="service-input-card" id="service-input" hidden>
        <h2>내 사주를 알려줘</h2>
        <p>로그인하지 않아도 바로 볼 수 있어. 입력한 정보는 이 브라우저 탭에 임시로만 보관돼.</p>
        <form id="service-form" novalidate>
          <label class="member-field"><span>명식 이름 <small>(선택, 저장할 때 쓰여)</small></span><input name="name" maxlength="40" placeholder="예: 나" autocomplete="off"></label>
          <fieldset class="auth-gender"><legend class="form-label">성별</legend>
            <div class="choice-buttons profile-gender">
              <label class="choice-button"><input class="visually-hidden" type="radio" name="gender" value="female"><span>여성</span></label>
              <label class="choice-button"><input class="visually-hidden" type="radio" name="gender" value="male"><span>남성</span></label>
              <label class="choice-button"><input class="visually-hidden" type="radio" name="gender" value="undisclosed"><span>선택 안 함</span></label>
            </div>
          </fieldset>
          <p class="field-error" data-error-for="gender" role="alert" hidden></p>
          <div id="service-birth"></div>
          <p class="form-error" id="service-form-error" role="alert" hidden></p>
          <button class="primary-button dialog-submit" type="submit">풀이 보기</button>
        </form>
      </section>
      <section class="service-current" id="service-current" hidden></section>
      <article class="long-report" id="service-report" hidden aria-live="polite"></article>
    </main>
    <footer><div class="footer-inner"><span class="footer-brand">미키사주</span><span>네가 너다운 하루를 만들어가도록 응원할게.</span></div></footer>
  </div>
${scripts[file].map((line) => `  ${line}`).join("\n")}
</body>
</html>
`;
}

Object.keys(scripts).forEach((file) => {
  const target = path.join(htmlDir, file);
  if (services[file]) {
    fs.writeFileSync(target, servicePage(file, services[file]), "utf8");
    return;
  }
  let html = fs.readFileSync(target, "utf8");
  html = html.replace(/<header class="topbar">[\s\S]*?<\/header>/, header(file));
  html = html.replace(/(?:[ \t]*<script\b[^>]*><\/script>\s*)+(?=<\/body>)/, `${scripts[file].map((line) => `  ${line}`).join("\n")}\n`);
  if (file === "index.html") {
    html = html.replace('<a class="story-button" href="member.html">', '<a class="story-button" href="tojeong.html">');
    html = html.replace(/<a class="primary-button" href="member.html">\s*<span id="home-hero-cta">[^<]*<\/span>/, '<a class="primary-button" href="year-saju.html">\n              <span>올해의 사주 보기</span>');
    html = html.replace(/\s*<dialog id="birth-dialog"[\s\S]*?<\/dialog>/, "");
  }
  fs.writeFileSync(target, html, "utf8");
});
console.log("페이지를 갱신했어:", Object.keys(scripts).join(", "));
