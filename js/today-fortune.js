(function () {
  "use strict";

  const date = document.getElementById("today-page-date");
  const copy = document.getElementById("today-fortune-copy");
  if (!date || !copy) return;

  date.textContent = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    timeZone: "Asia/Seoul"
  }).format(new Date());

  const readings = {
    overall: "마음이 한결 가벼워지는 하루야. 미뤄둔 안부를 먼저 건네면 기분 좋은 대화로 이어질 수 있어.",
    love: "솔직하고 다정한 말 한마디가 마음의 거리를 좁혀줘. 먼저 웃으며 건네는 인사가 좋은 시작이 될 거야.",
    work: "차근차근 쌓아온 일이 빛을 보기 시작해. 새로운 제안은 서두르지 말고 한 번 더 살펴보자."
  };

  document.querySelectorAll("[data-today-kind]").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll("[data-today-kind]").forEach((item) => {
        const selected = item === tab;
        item.setAttribute("aria-selected", String(selected));
      });
      copy.textContent = readings[tab.dataset.todayKind];
    });
  });
}());
