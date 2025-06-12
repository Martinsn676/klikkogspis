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
    console.log("checkOutHandler.content", checkOutHandler.content);
    this.products.forEach((item) => {
      const { id, title, meta, description, price, allergies, image, fixed } =
        item;
      const allergiesDiv = document.createElement("div");
      allergiesDiv.classList = "allergies-container";
      if (!fixed) {
        const itemCard = document.createElement("div");
        itemCard.classList = "flex-column item-card";
        itemCard.id = "order-item-" + id;

        const allergiesDetalis = {
          eggs: {
            icon: "./icons/eggsAllergy.png",
            text: lang({ no: "Inneholder egg", en: "Contains eggs" }),
          },
          gluten: {
            icon: "./icons/glutenAllergy.png",
            text: lang({
              no: "Inneholder gluten",
              en: "Contains gluten",
            }),
          },
          nuts: {
            icon: "./icons/peanutAllergy.png",
            text: lang({ no: "Inneholder nøtter", en: "Contains nuts" }),
          },
        };
        if (meta.allergies) {
          for (const allergy in meta.allergies) {
            if (meta.allergies[allergy] == true) {
              if (allergiesDetalis[allergy]) {
                const { icon, text } = allergiesDetalis[allergy];
                const allergyDiv = document.createElement("div");
                allergyDiv.classList = "flex-row align";
                allergyDiv.innerHTML = ` <img class="allergy-icon" src="${icon}">
                <span>${text}</span>`;
                allergiesDiv.appendChild(allergyDiv);
              } else {
                console.warn("Couldn't fnd allegry:", allergy, "for", item);
              }
            }
          }
        }

        itemCard.innerHTML = template.orderCard(item, allergiesDiv);
        const orderButton = document.createElement("button");

        orderButton.classList =
          "button bootstrap-btn bootstrap-btn-primary order-button";

        if (checkOutHandler.content.find((e) => e.id == item.id)) {
          orderButton.innerText = lang({ no: "Lagt til!", en: "Added!" });
          orderButton.classList.remove("bootstrap-btn-primary");
          orderButton.classList.add("bootstrap-btn-success");
        } else {
          orderButton.innerText = lang({ no: "Legg til", en: "Add" });
        }
        orderButton.addEventListener("click", async (event) => {
          const newItem = { id, count: 1 };
          newItem.options = {};
          item.meta.foodoptions.forEach((e) => {
            if (e.type == "toggle") {
              newItem.options["id" + e.id] = e.toggle == "yes" ? 1 : 0;
            } else {
              newItem.options["id" + e.id] = 0;
            }
          });

          checkOutHandler.content.unshift(newItem);
          mainHandler.refresh();
          checkOutHandler.build();
          event.target.innerText = lang({ no: "Lagt til!", en: "Added!" });
          event.target.classList.remove("bootstrap-btn-primary");
          event.target.classList.add("bootstrap-btn-success");
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
