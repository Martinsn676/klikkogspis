import { navigateTo } from "../../js/pageNav.mjs";
import { createButton } from "../../shared/js/lazyFunctions.mjs";

export const paymentHandler = {
  content: [],
  async init() {
    this.topBar = document.getElementById("payment-top-bar");
    this.itemsContainer = document.getElementById("payment-items-container");
    this.bottomBar = document.getElementById("payment-bottom-bar");
    this.build();
    this.buildBottomBar();
    this.buildTopBar();
  },
  build() {},
  buildBottomBar() {
    this.bottomBar.appendChild(
      createButton({ text: "Utsjekking", action: () => navigateTo("checkout") })
    );
    this.bottomBar.appendChild(
      createButton({
        text: "Send ordre",
        action: () => {},
      })
    );
  },
  buildTopBar() {
    this.topBar.classList = "flex-row";
    const container = document.createElement("div");
    container.classList = "container flex-column top-bar";
    container.innerHTML = `
    <div class="top-bar-title">Din bestilling</div>
    <div id="cart-total"></div>
    `;

    this.topBar.appendChild(container);
  },
};
