import { mainHandler } from "../../js/mainHandler.mjs";
import { navigateTo } from "../../js/pageNav.mjs";
import { lang } from "../../shared/js/lang.mjs";
import {
  createButton,
  numberAdjuster,
} from "../../shared/js/lazyFunctions.mjs";
import { lsList } from "../../shared/js/lists.mjs";
import { orderHandler } from "../orderPage/orderHandler.mjs";

export const checkOutHandler = {
  content: [],
  async init() {
    this.topBar = document.getElementById("checkout-top-bar");
    this.itemsContainer = document.getElementById("checkout-items-container");
    this.content = (await lsList.get("cart")) || [
      { id: 24, options: {}, count: 0 },
      { id: 25, options: {}, count: 0 },
    ];
    this.bottomBar = document.getElementById("checkout-bottom-bar");
    this.build();
    this.buildBottomBar();
    this.buildTopBar();
  },
  add(id, value) {
    const foundItemIndex = this.content.findIndex((e) => e.id == id);
    let returnValue;

    console.log("id, value", id, value, foundItemIndex);
    if (foundItemIndex >= 0) {
      this.content[foundItemIndex].count += value;
      returnValue = this.content[foundItemIndex].count;
    } else {
      this.content.unshift({ id, count: 1, options: {} });
      returnValue = 1;
    }
    if (returnValue == 0) {
      this.content.splice(foundItemIndex, 1);
    }
    console.log("returnValue", returnValue);
    lsList.save("cart", this.content);
    this.updateTotal();
    return returnValue;
  },
  updateTotal() {
    let totalCost = 0;
    let totalCount = 0;
    this.content.forEach((cartItem) => {
      const item = mainHandler.products.find((e) => e.id == cartItem.id);
      totalCost += cartItem.count * item.price;
      totalCount += item.count;
      if (cartItem.options) {
        for (const optionID in cartItem.options) {
          const option = item.options.find((e) => e.id == optionID);

          totalCost += cartItem.options[optionID] * option.price;
          totalCount += cartItem.options[optionID];
        }
      }
      this.cartTotal.innerText = `${totalCost} kr`;
    });
  },
  buildTopBar() {
    this.topBar.classList = "flex-row";
    this.topBar.innerHTML = "";
    const container = document.createElement("div");
    container.classList = "container flex-column top-bar";
    container.innerHTML = `
    <div class="top-bar-title">Din bestilling</div>
    <div id="cart-total"></div>
    `;

    this.topBar.appendChild(container);
    this.cartTotal = this.topBar.querySelector("#cart-total");
    this.updateTotal();
  },
  build() {
    console.log("    this.content", this.content);
    this.itemsContainer.innerHTML = "";
    this.content.forEach((cartItem) => {
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
        stock,
      } = item;
      const itemCard = document.createElement("div");
      itemCard.classList = "flex-column item-card";
      itemCard.id = number;
      const optionContainer = document.createElement("div");
      optionContainer.classList = "flex-column options-container";
      if (options) {
        options.forEach((option) => {
          const optionsDiv = document.createElement("div");
          optionsDiv.classList = "flex-row align option";
          const cartData = cartItem.options[option.id];
          optionsDiv.innerHTML += `
            <div class="option-title">${option.title}, ${option.price}kr</div>
            <div class="option-adder flex-row align">
            </div>`;

          numberAdjuster({
            place: optionsDiv.querySelector(".option-adder"),
            startValue: cartData || 0,
            maxValue: option.stock,
            minusAction: () => {
              if (cartItem.options[option.id]) {
                cartItem.options[option.id]--;
              } else {
                cartItem.options[option.id] = 0;
              }

              lsList.save("cart", this.content);
              this.updateTotal();
            },
            plussAction: () => {
              if (cartItem.options[option.id]) {
                cartItem.options[option.id]++;
              } else {
                cartItem.options[option.id] = 1;
              }

              lsList.save("cart", this.content);
              this.updateTotal();
            },
          });

          optionContainer.appendChild(optionsDiv);
        });
      }
      itemCard.innerHTML = `
        <div class="top-part flex-row">
        ${
          image
            ? `  <div class="image-container">
                        <img src="${image}">
                    </div>`
            : ""
        }
        <div class="flex-column right-side">
            <div class="card-title">${
              number ? `Nr ${number} ` : ""
            }${title}</div>          
       ${!fixed ? `<div class="">${price} kr</div>` : ""}
            <div class="adder"></div>
            </div>
        </div>`;
      if (!fixed) {
        numberAdjuster({
          place: itemCard.querySelector(".adder"),
          startValue: cartItem.count,
          minusAction: () => {
            const newValue = this.add(id, -1);
            if (newValue == 0) {
              itemCard.classList.add("d-none");
            } else {
              newValue;
            }
          },
          plussAction: () => this.add(id, 1),
        });
      }
      const imageContainer = itemCard.querySelector(".image-container");
      if (imageContainer) {
        imageContainer.addEventListener("click", () => {
          navigateTo("ordering");

          const targetItem = document.getElementById("order-item-" + number);
          targetItem.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
      itemCard.appendChild(optionContainer);
      this.itemsContainer.appendChild(itemCard);
    });
  },
  buildBottomBar() {
    this.bottomBar.innerHTML = "";
    this.bottomBar.appendChild(
      createButton({
        text: lang({ no: "Se meny", en: "See menu" }),
        action: () => navigateTo("ordering"),
      })
    );
    this.bottomBar.appendChild(
      createButton({
        text: lang({ no: "Betaling", en: "Payment" }),
        action: () => {
          lsList.remove("cart");
          navigateTo("payment");
        },
      })
    );
  },
};
