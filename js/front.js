(function () {
  "use strict";

  const dateElement = document.getElementById("today-date");
  if (dateElement) {
    dateElement.textContent = new Intl.DateTimeFormat("ko-KR", {
      year: "numeric", month: "long", day: "numeric", weekday: "long"
    }).format(new Date());
  }

  const fortunes = {
    overall: "마음이 한결 가벼워지는 하루예요. 미뤄둔 안부를 먼저 건네면 기분 좋은 소식으로 이어질 수 있어요.",
    love: "솔직하고 다정한 말 한마디가 마음의 거리를 좁혀줘요. 먼저 웃으며 건네는 인사가 좋은 시작이 될 거예요.",
    work: "차근차근 쌓아온 일이 빛을 보기 시작해요. 새로운 제안은 서두르지 말고 한 번 더 살펴보세요."
  };
  const tabs = document.querySelectorAll(".tab");
  const fortuneCopy = document.getElementById("fortune-copy");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((item) => item.setAttribute("aria-selected", String(item === tab)));
      if (fortuneCopy) fortuneCopy.textContent = fortunes[tab.dataset.kind];
    });
  });
}());
