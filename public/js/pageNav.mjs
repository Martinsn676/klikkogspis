import { lang } from "../shared/js/lang.mjs";
import { mainHandler } from "./mainHandler.mjs";

export function navigateTo(pageName, reload) {
  // Change URL without reloading
  window.scrollTo({ top: 0, behavior: "instant" });

  if (pageName) document.getElementById("main-content").dataset.page = pageName;

  const lng = new URLSearchParams(location.search).get("lng") || "no";
  mainHandler.lng = lng;
  const titleTranslates = {
    main: "",
    ordering: lang({ no: "Bestilling", en: "Ordering" }),
  };
  document.title = titleTranslates[pageName]
    ? `China Restaurant Husnes - ${titleTranslates[pageName]}`
    : "China Restaurant Husnes";
  let newUrl = `?lng=${lng}&page=${pageName}`;
  history.pushState({ page: pageName }, "", newUrl);
  if (reload) window.location.reload();
}
