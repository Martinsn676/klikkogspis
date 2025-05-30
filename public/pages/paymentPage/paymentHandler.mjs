import { mainHandler } from "../../js/mainHandler.mjs";
import { navigateTo } from "../../js/pageNav.mjs";
import { lang } from "../../shared/js/lang.mjs";
import { createButton } from "../../shared/js/lazyFunctions.mjs";
import { checkOutHandler } from "../checkoutPage/checkoutHandler.mjs";
import { orderHandler } from "../orderPage/orderHandler.mjs";
import { template } from "../templates/itemCards.mjs";
import { waitingHandler } from "../waitingPage/waitingHandler.mjs";

export const paymentHandler = {
  content: [],
  async init() {
    this.topBar = document.getElementById("payment-top-bar");
    this.itemsContainer = document.getElementById("payment-items-container");
    this.bottomBar = document.getElementById("payment-bottom-bar");
    this.buildBottomBar();
    this.buildTopBar();
    this.build();
  },
  build() {
    this.itemsContainer.innerHTML = "";
    this.totalCost = 0;

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

      if (!fixed) {
        item.count = cartItem.count;
        // totalCost += cartItem.count * item.price;
        item.cartItemDetails = cartItem;
        addItem(item);
      } else if (options) {
        options.forEach((option) => {
          if (cartItem.options["id" + option.id]) {
            option.count = cartItem.options["id" + option.id];
            // totalCost += option.count * option.price;

            addItem(option, option.count);
          }
        });
      }
    });

    function addItem(item, count) {
      const itemDiv = document.createElement("div");
      itemDiv.classList.add("payment-card");
      itemDiv.innerHTML = template.paymentCard(item, count);
      paymentHandler.itemsContainer.appendChild(itemDiv);
    }
    if (this.totalCost == 0) {
      const noItemsDiv = document.createElement("div");
      noItemsDiv.innerHTML = `<div id="payment-message">${lang({
        no: "Du har ingenting i bestillingen din",
        en: "You have nothing in your order",
      })}</div>`;
      document.getElementById("send-order-button").disabled = true;
      paymentHandler.itemsContainer.appendChild(noItemsDiv);
    } else {
      const totalDiv = document.createElement("div");
      totalDiv.innerHTML = `<div id="payment-total">${this.totalCost} kr</div>`;
      paymentHandler.itemsContainer.appendChild(totalDiv);
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
        id: "send-order-button",
        action: () => {
          waitingHandler.init();
          navigateTo("waiting", false, { order: "asdadaw3424" });
        },
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
