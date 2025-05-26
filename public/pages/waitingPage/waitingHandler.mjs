import { navigateTo } from "../../js/pageNav.mjs";
import { lang } from "../../shared/js/lang.mjs";
import { createButton } from "../../shared/js/lazyFunctions.mjs";

export const waitingHandler = {
  init() {
    this.topBar = document.getElementById("waiting-top-bar");
    this.itemsContainer = document.getElementById("waiting-page-container");
    this.bottomBar = document.getElementById("waiting-bottom-bar");
    this.buildTopBar();
    this.buildBottomBar();
  },
  buildTopBar() {
    const orderID = new URLSearchParams(location.search).get("order");
    this.topBar.innerHTML = "";
    const container = document.createElement("div");
    container.classList = "container flex-row top-bar";
    container.classList = "container flex-column top-bar";
    container.innerHTML = `
    <div class="top-bar-title">${lang({
      no: `Ordre: ${orderID}`,
      en: `Order: ${orderID}`,
    })}</div>
    <div id="cart-total"></div>
    `;

    this.topBar.appendChild(container);
  },
  buildBottomBar() {
    this.bottomBar.innerHTML = "";
    this.bottomBar.appendChild(
      createButton({
        text: lang({ no: "Hovedmeny", en: "Main menu" }),
        action: () => navigateTo("menu"),
      })
    );
    this.bottomBar.appendChild(
      createButton({
        text: lang({ no: "Ring oss", en: "Call us" }),
        // icon: "./icons/callIcon.png",
        change: this.mainContentContainer,
        // classes: "bootstrap-btn-neutral",

        action: () => window.open("tel:90418429", "_new"),
      })
    );
  },
};
