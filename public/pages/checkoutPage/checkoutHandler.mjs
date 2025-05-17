import { mainHandler } from "../../js/mainHandler.mjs";
import { navigateTo } from "../../js/pageNav.mjs";
import { createButton } from "../../shared/js/lazyFunctions.mjs";
import { lsList } from "../../shared/js/lists.mjs";

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
    this.content.forEach((cartItem) => {
      const item = mainHandler.products.find((e) => e.id == cartItem.id);
      totalCost += cartItem.count * item.price;
      if (cartItem.options) {
        for (const optionID in cartItem.options) {
          const option = item.options.find((e) => e.id == optionID);

          totalCost += cartItem.options[optionID] * option.price;
        }
      }
      this.cartTotal.innerText = totalCost;
    });
  },
  buildTopBar() {
    this.topBar.innerHTML = `<div class="container"><div id="cart-total"></div></div>`;
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
                <button class="minus-button button bootstrap-btn flex-column align">-</button>
                <div class="option-count">${cartData || 0}</div>
                <button class="pluss-button button bootstrap-btn flex-column align">+</button>
            </div>`;
          const counter = optionsDiv.querySelector(".option-count");

          optionsDiv
            .querySelector(".minus-button")
            .addEventListener("click", () => {
              if (cartItem.options[option.id]) {
                cartItem.options[option.id]--;
              } else {
                cartItem.options[option.id] = 0;
              }
              counter.innerText = cartItem.options[option.id];
              lsList.save("cart", this.content);
              this.updateTotal();
            });
          optionsDiv
            .querySelector(".pluss-button")
            .addEventListener("click", () => {
              if (cartItem.options[option.id]) {
                cartItem.options[option.id]++;
              } else {
                cartItem.options[option.id] = 1;
              }
              counter.innerText = cartItem.options[option.id];

              lsList.save("cart", this.content);
              this.updateTotal();
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
           ${
             !fixed
               ? ` 
            <div class="card-adder flex-row align">
                <button class="minus-button button bootstrap-btn flex-column align">-</button>
                <div class="option-count">${cartItem.count}</div>
                <button class="pluss-button button bootstrap-btn flex-column align">+</button>
            </div>
            `
               : ""
           }
            </div>
        </div>`;
      // <div class="card-count">${
      //   cartItem.count ? `${cartItem.count} stk` : ""
      // }</div>

      if (!fixed) {
        const optionCount = itemCard.querySelector(".option-count");
        itemCard
          .querySelector(".minus-button")
          .addEventListener("click", () => {
            const newValue = this.add(id, -1);
            if (newValue == 0) {
              itemCard.classList.add("d-none");
            } else {
              optionCount.innerText = newValue;
            }
          });
        itemCard
          .querySelector(".pluss-button")
          .addEventListener("click", () => {
            optionCount.innerText = this.add(id, 1);
          });
      }

      itemCard.appendChild(optionContainer);
      this.itemsContainer.appendChild(itemCard);
    });
  },
  buildBottomBar() {
    this.bottomBar.appendChild(
      createButton({ text: "Bestilling", action: () => navigateTo("ordering") })
    );
    this.bottomBar.appendChild(
      createButton({ text: "Betaling", action: () => navigateTo("payment") })
    );
  },
};
