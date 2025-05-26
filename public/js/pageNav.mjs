import { waitingHandler } from "../pages/waitingPage/waitingHandler.mjs";
import { lang } from "../shared/js/lang.mjs";
import { makeCopy } from "../shared/js/lazyFunctions.mjs";
import { mainHandler } from "./mainHandler.mjs";

export function navigateTo(
  pageName = "menu",
  reload,
  endDetails,
  skipHistory = false
) {
  // Change URL without reloading
  window.scrollTo({ top: 0, behavior: "instant" });

  if (document.getElementById("main-content").dataset.page == pageName) {
    skipHistory = true;
  }
  if (pageName) {
    document.getElementById("main-content").dataset.page = pageName;
  }
  const lng = new URLSearchParams(location.search).get("lng") || "no";
  mainHandler.lng = lng;
  const titleTranslates = {
    main: "",
    ordering: lang({ no: "Bestilling", en: "Ordering" }),
  };
  document.title = titleTranslates[pageName]
    ? `China Restaurant Husnes - ${titleTranslates[pageName]}`
    : "China Restaurant Husnes";

  const params = new URLSearchParams(location.search);
  const oldInformation = {};
  for (const [key, value] of params.entries()) {
    oldInformation[key] = value;
  }
  console.log(makeCopy(oldInformation));
  let newUrl = "";
  if (oldInformation["lng"]) {
    newUrl += `?lng=` + oldInformation["lng"];
    delete oldInformation["lng"];
  } else {
    newUrl += `?lng=no`;
  }
  newUrl += `&page=${pageName}`;
  delete oldInformation["page"];
  console.log("oldInformation", oldInformation);
  if (endDetails) {
    for (const detail in endDetails) {
      oldInformation[detail] = endDetails[detail];
    }
  }
  if (oldInformation) {
    for (const detail in oldInformation) {
      newUrl += `&${detail}=${oldInformation[detail]}`;
    }
  }
  mainHandler.urlDetails = oldInformation;
  if (!skipHistory) {
    history.pushState({ page: pageName }, "", newUrl);
  }
  console.log("pageName", pageName);
  if (pageName == "waiting" && oldInformation["order"]) {
    console.log(oldInformation["order"]);
    waitingHandler.init();
  } else {
    console.log("pageName", pageName);
    mainHandler.init();
  }
  if (reload) window.location.reload();
}
const pageName = new URLSearchParams(location.search).get("page");
navigateTo(pageName);
function updateAppHeight() {
  const appHeight = window.innerHeight + "px";
  document.documentElement.style.setProperty("--app-height", appHeight);
}
window.addEventListener("resize", updateAppHeight);
updateAppHeight();
window.addEventListener("popstate", (event) => {
  const pageName = event.state?.page;
  if (pageName) {
    console.log("Back/forward clicked, go to:", pageName);
    navigateTo(pageName, false, null, true);
  }
});
