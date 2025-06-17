import { mainHandler } from "../../js/mainHandler.js";
import { navigateTo } from "../../js/pageNav.js";
import { api } from "../../shared/js/api.js";
import { lang } from "../../shared/js/lang.js";
import {
  createButton,
  createForm,
  createInput,
  getFormData,
  tryParse,
} from "../../shared/js/lazyFunctions.js";
import { lsList, ssList } from "../../shared/js/lists.js";
import { checkOutHandler } from "../checkoutPage/checkoutHandler.js";
import { orderHandler } from "../orderPage/orderHandler.js";
import { template } from "../templates/itemCards.js";
import { waitingHandler } from "../waitingPage/waitingHandler.js";

export const paymentHandler = {
  content: [],
  async init() {
    this.topBar = document.getElementById("payment-top-bar");
    this.mainContainer = document.getElementById("payment-items-container");
    this.bottomBar = document.getElementById("payment-bottom-bar");
    this.itemsContainer = document.createElement("div");
    this.mainContainer.appendChild(this.itemsContainer);
    this.remember = (await lsList.get("first_name")) ? true : false;
    this.userForm = createForm({
      id: "userForm",
      inputSettings: {
        inputs: [
          {
            label: lang({ no: "Fornavn", en: "First name" }),
            name: "first_name",
            minLength: 2,
            value:
              (await lsList.get("first_name")) ||
              (await ssList.get("first_name")),
          },
          {
            label: lang({ no: "Etternavn", en: "Last name" }),
            name: "last_name",
            minLength: 2,
            value:
              (await lsList.get("last_name")) ||
              (await ssList.get("last_name")),
          },
          {
            label: lang({ no: "Tlf", en: "Phone" }),
            name: "phone",
            type: "number",
            minLength: 8,
            only: "number",
            value: (await lsList.get("phone")) || (await ssList.get("phone")),
          },
          {
            label: lang({ no: "Email", en: "E-mail" }),
            name: "email",
            type: "email",
            value: (await lsList.get("email")) || (await ssList.get("email")),
            checkValdidEmail: true,
          },
          {
            label: lang({ no: "Husk meg?", en: "Remember me?" }),
            type: "checkbox",
            divClass: "flex-row align p-3",
            checked: this.remember,
            onChange: (event) => {
              paymentHandler.remember = event.target.checked;
            },
          },
        ],
        classes: "bootstrap-input",
      },
    });
    this.mainContainer.appendChild(this.userForm);

    this.userForm.addEventListener("change", ({ target }) => {
      this.checkIfReady();

      if (target.name) {
        if (paymentHandler.remember) {
          lsList.save(target.name, target.value);
        } else {
          ssList.save(target.name, target.value);
        }
      }
    });

    this.buildBottomBar();
    this.buildTopBar();
    this.build();
  },
  checkIfReady() {
    const finishButton = document.getElementById("send-order-button");
    if (this.totalCost && this.totalCost > 0) {
      let allValid = true;
      this.userForm.querySelectorAll("input").forEach((e) => {
        if (e.type != "checkbox" && e.dataset.valid == "false") {
          allValid = false;
        }
      });

      if (allValid) {
        finishButton.disabled = false;
      } else {
        finishButton.disabled = true;
      }
    } else {
      finishButton.disabled = true;
    }
  },
  build() {
    this.itemsContainer.innerHTML = "";
    this.totalCost = 0;
    const menuTitle = document.createElement("div");
    menuTitle.classList = "sub-title d-none";
    menuTitle.innerText = lang({
      no: "Matretter",
      en: "Menuitems",
    });
    paymentHandler.itemsContainer.appendChild(menuTitle);

    checkOutHandler.content.forEach((cartItem) => {
      const item = mainHandler.products.find((e) => e.id == cartItem.id);
      const { options, fixed } = item;
      if (!cartItem.fixed) {
        menuTitle.classList.remove("d-none");
        item.count = cartItem.count;
        item.cartItemDetails = cartItem;

        addItem(item, cartItem.count > 1 ? cartItem.count : 1);
      }
    });
    const accessoryTitle = document.createElement("div");
    accessoryTitle.classList = "sub-title d-none";
    accessoryTitle.innerText = lang({
      no: "Tilbehør",
      en: "Accessories",
    });

    paymentHandler.itemsContainer.appendChild(accessoryTitle);
    checkOutHandler.content.forEach((cartItem) => {
      const item = mainHandler.products.find((e) => e.id == cartItem.id);
      const options = item.meta.foodoptions;

      if (cartItem.fixed) {
        accessoryTitle.classList.remove("d-none");

        item.count = cartItem.count;
        item.cartItemDetails = cartItem;

        addItem(item, cartItem.count);

        // options.forEach((option) => {
        //   if (cartItem.options["id" + option.id]) {
        //     option.count = cartItem.options["id" + option.id];
        //     addItem(option, option.count);
        //   }
        // });
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
      this.checkIfReady();
      paymentHandler.itemsContainer.appendChild(noItemsDiv);
    } else {
      this.checkIfReady();
      const totalDiv = document.createElement("div");
      totalDiv.id = "payment-total-div";
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
        disabled: true,
        action: async () => {
          if (!paymentHandler.submittingOrder) {
            paymentHandler.submittingOrder = true;

            const restaurant_id = mainHandler.restaurant_id;
            const formData = getFormData(this.userForm);

            const response = await api.try("post-order", {
              cartContent: checkOutHandler.content,
              userData: formData,
              restaurant_id,
            });
            document.getElementById("send-order-button").innerText = lang({
              no: "Sendt!",
              en: "Sent!",
            });
            await lsList.remove("cart");
            mainHandler.refresh();
            this.userForm.querySelectorAll("input").forEach((input) => {
              this.checkIfReady();

              if (input.name) {
                if (paymentHandler.remember) {
                  lsList.save(input.name, input.value);
                } else {
                  ssList.save(input.name, input.value);
                }
              }
            });

            if (response.data.tracking_token) {
              await ssList.save("tracking_token", response.data.tracking_token);
              setTimeout(() => {
                navigateTo("waiting", false, {
                  order: response.data.tracking_token,
                });
              }, 1000);
            }
            paymentHandler.submittingOrder = false;
          }
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
