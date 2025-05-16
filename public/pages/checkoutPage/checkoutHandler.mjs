import { mainHandler } from "../../js/mainHandler.mjs";
import { navigateTo } from "../../js/pageNav.mjs";
import { createButton } from "../../shared/js/lazyFunctions.mjs";
import { lsList } from "../../shared/js/lists.mjs";

export const checkOutHandler = {
  content: [],
  async init() {
    this.topBar = document.getElementById("checkout-top-bar");
    this.itemsContainer = document.getElementById("checkout-items-container");
    this.content = (await lsList.get("cart")) || [];
    this.bottomBar = document.getElementById("checkout-bottom-bar");
    this.build();
    this.buildBottomBar();
    this.buildTopBar();
  },
  add(number) {
    const foundItem = this.content.find((e) => e.id == number);
    if (foundItem) {
      foundItem.count++;
    } else {
      this.content.push({ id: number, count: 1, options: {} });
    }
    lsList.save("cart", this.content);
  },
  buildTopBar() {
    this.topBar.innerHTML = `<div class="container">Top bar</div>`;
  },
  build() {
    console.log(" this.content", this.content);
    this.itemsContainer.innerHTML = "";
    this.content.forEach((cartItem) => {
      console.log("cartItem.number", cartItem.id);
      const item = mainHandler.products.find((e) => e.number == cartItem.id);
      console.log("item", item);
      const { title, number, description, price, allergies, image, options } =
        item;
      const itemCard = document.createElement("div");
      itemCard.classList = "flex-column item-card";
      itemCard.id = number;
      const optionContainer = document.createElement("div");
      optionContainer.classList = "flex-column options-container";
      console.log("options", options);
      if (options) {
        options.forEach((option) => {
          const optionsDiv = document.createElement("div");
          optionsDiv.classList = "flex-row align option";
          const cartData = cartItem.options[option.id];
          optionsDiv.innerHTML += `
            <div class="option-title">${option.title}, ${option.price}kr</div>
            <div class="option-adder flex-row align">
                <button class="minus-button button bootstrap-btn">-</button>
                <div class="option-count">${cartData || 0}</div>
                <button class="pluss-button button bootstrap-btn">+</button>
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
              console.log("this.content", this.content);
              lsList.save("cart", this.content);
            });
          optionContainer.appendChild(optionsDiv);
        });
      }
      itemCard.innerHTML = `
        <div class="top-part flex-row">
            <div class="image-container">
                <img src="${image}">
            </div>
            <div class="flex-column right-side">
                <div class="card-title">Nr ${number} ${title}</div>
                <div class="card-count">${cartItem.count} stk</div>
            </div>
        </div>

 
    
`;
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
