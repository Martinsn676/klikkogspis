import { mainHandler } from "../../js/mainHandler.js";
import { navigateTo } from "../../js/pageNav.js";
import { lang } from "../../shared/js/lang.js";
import { createButton, makeCopy } from "../../shared/js/lazyFunctions.js";
import { lsList } from "../../shared/js/lists.js";
import { checkOutHandler } from "../checkoutPage/checkoutHandler.js";
import { paymentHandler } from "../paymentPage/paymentHandler.js";
import { template } from "../templates/itemCards.js";

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
    this.products = makeCopy(mainHandler.mainItems);
    this.itemsContainer.innerHTML = "";
    this.products.forEach((item) => {
      const { id, title, meta, description, price, allergies, image, fixed } =
        item;
      if (!fixed) {
        const itemCard = document.createElement("div");
        itemCard.classList = "flex-column item-card";
        itemCard.id = "order-item-" + id;
        item.allergiesDiv = "";

        for (const allergy in allergies) {
          if (allergies[allergy] == true) {
            if (allergy == "eggs") {
              item.allergiesDiv += `<img class="allergy-icon" src="./icons/eggsAllergy.png">`;
            } else if (allergy == "gluten") {
              item.allergiesDiv += `<img class="allergy-icon" src="./icons/glutenAllergy.png">`;
            } else if (allergy == "nuts") {
              item.allergiesDiv += `<img class="allergy-icon" src="./icons/peanutAllergy.png">`;
            }
          }
        }
        itemCard.innerHTML = template.orderCard(item);
        const orderButton = document.createElement("button");
        orderButton.innerText = lang({ no: "Legg til", en: "Add" });
        orderButton.classList =
          "button bootstrap-btn bootstrap-btn-primary order-button";
        orderButton.addEventListener("click", async (event) => {
          checkOutHandler.content.unshift({
            id,
            count: 1,
            options: {},
          });
          mainHandler.refresh(true);
          event.target.innerText = lang({ no: "Lagt til!", en: "Added!" });

          orderHandler.orderIcon.classList.remove("bump");
          setTimeout(() => {
            orderHandler.orderIcon.classList.add("bump");
          }, 10);
        });
        itemCard.querySelector(".bottom-part").appendChild(orderButton);
        this.itemsContainer.appendChild(itemCard);
      }
    });
  },
  buildTopBar() {
    this.topBar.classList.add("flex-row");
    this.topBar.innerHTML = "";
    const container = document.createElement("div");
    container.classList = "container flex-row top-bar";

    container.innerHTML = `
    <div class="top-bar-title">${mainHandler.restaurantName}</div>
    <div id="order-icon-container">
      <div id="order-icon">
        <img class="icon" src="./icons/orderIcon.png">
        <div id="order-counter" class="flex-column align">0</div>
      </div>
    </div>
    `;
    this.orderIcon = container.querySelector("#order-icon");
    container
      .querySelector("#order-icon-container")
      .addEventListener("click", () => navigateTo("checkout"));

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
        text: lang({ no: "Se ordre", en: "See order" }),
        action: () => navigateTo("checkout"),
      })
    );
  },
  updateCount() {
    let count = 0;

    checkOutHandler.content.forEach((e) => (count += e.count));
    document.getElementById("order-counter").innerText = count;
  },
};
