import { mainHandler } from "../../js/mainHandler.mjs";
import { navigateTo } from "../../js/pageNav.mjs";
import { lang } from "../../shared/js/lang.mjs";
import { createButton } from "../../shared/js/lazyFunctions.mjs";
import { checkOutHandler } from "../checkoutPage/checkoutHandler.mjs";
import { orderHandler } from "../orderPage/orderHandler.mjs";
import { template } from "../templates/itemCards.mjs";

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
  build() {
    this.itemsContainer.innerHTML = "";
    checkOutHandler.content.forEach((cartItem) => {
      const item = mainHandler.products.find((e) => e.id == cartItem.id);

      const { id, title, number, description, price, allergies, image, fixed } =
        item;
      const itemDiv = document.createElement("div");
      itemDiv.classList.add("payment-card");
      console.log(template.paymentCard(item));
      itemDiv.innerHTML = template.paymentCard(item);
      this.itemsContainer.appendChild(itemDiv);
    });
  },
  buildBottomBar() {
    this.bottomBar.innerHTML = "";
    this.bottomBar.appendChild(
      createButton({
        text: lang({ no: "Se ordre", en: "See order" }),
        action: () => navigateTo("checkout"),
      })
    );
    this.bottomBar.appendChild(
      createButton({
        text: lang({ no: "Send ordre", en: "Send order" }),
        action: () => {},
      })
    );
  },
  buildTopBar() {
    this.topBar.innerHTML = "";
    const container = document.createElement("div");
    container.classList = "container flex-row top-bar";
    container.classList = "container flex-column top-bar";
    container.innerHTML = `
    <div class="top-bar-title">${lang({ no: "Betaling", en: "Payment" })}</div>
    <div id="cart-total"></div>
    `;

    this.topBar.appendChild(container);
  },
};
