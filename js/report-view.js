(function () {
  "use strict";

  // 장문 보고서를 요약 → 목차 → 1열 본문 순서로 그린다. 문장은 textContent로만 넣는다.
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };

  function renderBlocks(section, container) {
    let list = null;
    section.blocks.forEach((block) => {
      if (block.t === "h") container.append(make("h3", "report-h3", block.text));
      else if (block.t === "ev") container.append(make("p", "report-evidence", block.text));
      else if (block.items) {
        list = make("ul", "report-list");
        block.items.forEach((item) => list.append(make("li", null, item)));
        container.append(list);
      } else container.append(make("p", "report-p", block.text));
    });
  }

  function render(report, host, options) {
    const opts = options || {};
    host.replaceChildren();
    host.hidden = false;

    const head = make("header", "report-head");
    head.append(make("h2", "report-title", report.title));
    head.append(make("p", "report-count", `공백 포함 약 ${report.chars.toLocaleString("ko-KR")}자 · ${report.sections.length}개 항목`));
    host.append(head);

    const summary = make("section", "report-summary");
    summary.setAttribute("aria-labelledby", "report-summary-title");
    summary.append(Object.assign(make("h3", "report-summary-title", "핵심 요약"), { id: "report-summary-title" }));
    const ul = make("ul", "report-summary-list");
    report.summary.forEach((line) => ul.append(make("li", null, line)));
    summary.append(ul);
    host.append(summary);

    const toc = make("nav", "report-toc");
    toc.setAttribute("aria-label", "보고서 목차");
    toc.append(make("h3", "report-toc-title", "전체 목차"));
    const ol = make("ol", "report-toc-list");
    report.toc.forEach((item) => {
      const li = make("li");
      const a = make("a", null, item.title);
      a.href = `#${opts.prefix || "r"}-${item.id}`;
      a.addEventListener("click", (event) => {
        const target = document.getElementById(`${opts.prefix || "r"}-${item.id}`);
        if (!target) return;
        event.preventDefault();
        if (target.tagName === "DETAILS") target.open = true;
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", `#${target.id}`);
      });
      li.append(a);
      ol.append(li);
    });
    toc.append(ol);
    host.append(toc);

    const tools = make("div", "report-tools");
    const expand = make("button", "text-button", "모든 항목 펼치기");
    expand.type = "button";
    const collapse = make("button", "text-button", "핵심만 보기");
    collapse.type = "button";
    tools.append(expand, collapse);
    host.append(tools);

    const body = make("div", "report-body");
    report.sections.forEach((section, index) => {
      const details = make("details", "report-section");
      details.id = `${opts.prefix || "r"}-${section.id}`;
      details.open = section.core;
      details.dataset.core = String(section.core);
      const summaryEl = make("summary", "report-section-title");
      summaryEl.append(make("span", "report-section-no", String(index + 1).padStart(2, "0")), make("span", null, section.title));
      details.append(summaryEl);
      const inner = make("div", "report-section-body");
      renderBlocks(section, inner);
      details.append(inner);
      body.append(details);
    });
    host.append(body);
    expand.addEventListener("click", () => body.querySelectorAll("details").forEach((d) => { d.open = true; }));
    collapse.addEventListener("click", () => body.querySelectorAll("details").forEach((d) => { d.open = d.dataset.core === "true"; }));

    if (opts.footer) host.append(opts.footer);

    let top = host.querySelector(".back-to-top");
    if (!top) {
      top = make("a", "back-to-top", "맨 위로");
      top.href = "#top";
      top.addEventListener("click", (event) => { event.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); });
      host.append(top);
    }
    return host;
  }

  window.MikiReportView = Object.freeze({ render });
}());
