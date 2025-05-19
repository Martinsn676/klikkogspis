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
    let totalCost = 0;
    checkOutHandler.content.forEach((cartItem) => {
      const item = mainHandler.products.find((e) => e.id == cartItem.id);

      const {
        id,
        title,
        number,
        description,
        price,
        allergies,
        image,
        options,
        fixed,
      } = item;

      console.log(item);
      if (!fixed) {
        item.count = cartItem.count;
        totalCost += cartItem.count * item.price;
        addItem(item);
      } else if (options) {
        options.forEach((option) => {
          if (cartItem.options[option.id]) {
            option.count = cartItem.options[option.id];
            totalCost += option.count * option.price;
            addItem(option);
          }
        });
      }
    });
    console.warn(totalCost);
    const totalDiv = document.createElement("div");
    totalDiv.innerHTML = `<div id="payment-total">${totalCost} kr</div>`;
    paymentHandler.itemsContainer.appendChild(totalDiv);
    function addItem(item) {
      console.log(item);
      const itemDiv = document.createElement("div");
      itemDiv.classList.add("payment-card");
      itemDiv.innerHTML = template.paymentCard(item);
      console.log(itemDiv.innerHTML);
      paymentHandler.itemsContainer.appendChild(itemDiv);
      console.log(checkOutHandler.itemsContainer);
    }
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
