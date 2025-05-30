import { waitingHandler } from "../pages/waitingPage/waitingHandler.mjs";
import { lang } from "../shared/js/lang.mjs";
import { makeCopy } from "../shared/js/lazyFunctions.mjs";
import { mainHandler } from "./mainHandler.mjs";
import { mockProducts } from "./mockProducts.mjs";

export function navigateTo(
  pageName = "menu",
  reload,
  endDetails,
  skipHistory = false
) {
  let validPages = ["menu", "payment", "checkout", "waiting", "ordering"];
  if (!validPages.find((e) => e == pageName)) {
    pageName = "menu";
  }
  console.log(pageName);
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
mainHandler.init();

const rows = [];
mockProducts.forEach((element, index) => {
  if (index > -1) {
    if (!element.description) element.description = "";
    const line = [
      "simple",
      element.number,
      element.title.no
        ? JSON.stringify(element.title.no).replace(/"/g, '""')
        : element.title,
      "1",
      element.image || "",
      "0",
      element.description.no
        ? JSON.stringify(element.description).replace(/"/g, '""')
        : element.description,
      "1",
      "1000",
      element.price,
      "", // Categories empty
      element.title.no ? JSON.stringify(element.title).replace(/"/g, '""') : "",
      element.description.no
        ? JSON.stringify(element.description).replace(/"/g, '""')
        : "{}",
      element.allergies
        ? JSON.stringify(element.allergies).replace(/"/g, '""')
        : "{}",
      element.options
        ? JSON.stringify(element.options).replace(/"/g, '""').replace(/\n/g, "")
        : "[]",
      element.fixed ? true : false,
      element.number || "",
    ]
      .map((field) => `"${field}"`)
      .join(",");

    rows.push(line);
  }
});
const header =
  "Type,SKU,Name,Published,Images,Is featured?,Description,In stock?,Stock,Regular price,Categories,meta:title_translations,meta:description_translations,meta:allergies,meta:foodOptions,meta:fixedItem,meta:itemNumber";

const csvContent = [header, ...rows].join("\n");
console.warn(csvContent);
