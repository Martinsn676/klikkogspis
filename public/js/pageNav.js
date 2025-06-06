import { adminHandler } from "../pages/adminPage/adminHandler.js";
import { waitingHandler } from "../pages/waitingPage/waitingHandler.js";
import { lang } from "../shared/js/lang.js";
import { makeCopy } from "../shared/js/lazyFunctions.js";
import { modal } from "../shared/js/modalHandler.js";
import { userMessageHandler } from "../shared/js/userMessageHandler.js";
import { mainHandler } from "./mainHandler.js";
import { mockProducts } from "./mockProducts.js";

export function navigateTo(
  pageName = "menu",
  reload,
  endDetails,
  skipHistory = false
) {
  let validPages = [
    "menu",
    "payment",
    "checkout",
    "waiting",
    "ordering",
    "admin",
    "admin-orders",
  ];
  if (!validPages.find((e) => e == pageName)) {
    pageName = "menu";
  }

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

  let newUrl = "";
  if (oldInformation["lng"]) {
    newUrl += `?lng=` + oldInformation["lng"];
    delete oldInformation["lng"];
  } else {
    newUrl += `?lng=no`;
  }
  newUrl += `&page=${pageName}`;
  delete oldInformation["page"];

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

  if (pageName == "waiting" && oldInformation["order"]) {
    waitingHandler.init();
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
    navigateTo(pageName, false, null, true);
  }
});
userMessageHandler.init();
modal.init();
mainHandler.init();
