import { mainHandler } from "../../js/mainHandler.mjs";
import { navigateTo } from "../../js/pageNav.mjs";
import { createButton, makeCopy } from "../../shared/js/lazyFunctions.mjs";
import { checkOutHandler } from "../checkoutPage/checkoutHandler.mjs";

export const orderHandler = {
  async init() {
    this.mainContainer = document.getElementById("ordering-page");
    this.itemsContainer = document.getElementById("ordering-items-container");
    this.topBar = document.getElementById("ordering-top-bar");
    this.bottomBar = document.getElementById("ordering-bottom-bar");
    this.buildTopBar();
    this.buildBottomBar();
    this.build();
    this.updateCount();
  },
  build() {
    this.products = makeCopy(mainHandler.products);
    this.itemsContainer.innerHTML = "";
    this.products.forEach((item) => {
      const { id, title, number, description, price, allergies, image } = item;

      const itemCard = document.createElement("div");
      itemCard.classList = "flex-column item-card";
      itemCard.id = number;
      itemCard.innerHTML = `
        <div class="card-title">${number ? `Nr ${number} ` : ""}${title}</div>
        <div class="top-part flex-row">
          <div class="image-container">
            <img src="${image}">
          </div>
          <div class="allergieses-container">
          </div>
        </div>
        <div class="middle-part flex-row">
          <div class="card-description">${description}</div>
        </div>
        <div class="bottom-part flex-row">

        </div>
  
`;
      const orderButton = document.createElement("button");
      orderButton.innerText = "Legg til";
      orderButton.classList =
        "button bootstrap-btn bootstrap-btn-success order-button";
      orderButton.addEventListener("click", (event) => {
        console.log("Ordering!", number);
        checkOutHandler.add(id, 1);
        event.target.innerText = "Lagt til!";

        this.updateCount();
        checkOutHandler.build();
      });
      itemCard.querySelector(".bottom-part").appendChild(orderButton);
      this.itemsContainer.appendChild(itemCard);
    });
  },
  buildTopBar() {
    this.topBar.classList = "flex-row";
    const container = document.createElement("div");
    container.classList = "container flex-row";

    container.innerHTML = `
    <div id="order-restaurant-title">${mainHandler.restaurantName}</div>
    <div id="order-icon-container">
      <div id="order-icon">
      <img class="icon" src="./icons/orderIcon.png">
      <div id="order-counter" class="flex-column align">0</div>
      </div>
    </div>
    `;
    container
      .querySelector("#order-icon-container")
      .addEventListener("click", () => navigateTo("checkout"));
    this.topBar.appendChild(container);
  },
  buildBottomBar() {
    this.bottomBar.appendChild(
      createButton({ text: "Meny", action: () => navigateTo("menu") })
    );
    this.bottomBar.appendChild(
      createButton({ text: "Utsjekking", action: () => navigateTo("checkout") })
    );
  },
  updateCount() {
    let count = 0;
    checkOutHandler.content.forEach((e) => (count += e.count));
    document.getElementById("order-counter").innerText = count;
  },
};
