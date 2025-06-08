import { mainHandler } from "../../js/mainHandler.js";
import { navigateTo } from "../../js/pageNav.js";
import { lang } from "../../shared/js/lang.js";
import {
  createButton,
  makeCopy,
  numberAdjuster,
  toggleAdjuster,
} from "../../shared/js/lazyFunctions.js";
import { lsList } from "../../shared/js/lists.js";
import { orderHandler } from "../orderPage/orderHandler.js";
import { paymentHandler } from "../paymentPage/paymentHandler.js";
import { template } from "../templates/itemCards.js";

export const checkOutHandler = {
  content: [],
  async init() {
    this.topBar = document.getElementById("checkout-top-bar");
    this.itemsContainer = document.getElementById("checkout-items-container");
    this.content = await lsList.get("cart");

    if (!this.content || this.content.length == 0) {
      this.content = [];
      console.warn("===adding starter===");
      // mainHandler.products.forEach((e) => {
      //   if (e.meta.fixeditem) {
      //     this.content.push({
      //       id: e.id,
      //       options: {},
      //       count: 0,
      //       fixed: true,
      //     });
      //   }
      // });
    }

    this.bottomBar = document.getElementById("checkout-bottom-bar");
    this.build();
    this.buildBottomBar();
    this.buildTopBar();
  },
  // add(id, value, newAdd) {
  //   fasdf;
  //   let returnValue;
  //   if (newAdd) {
  //     this.content.unshift({
  //       id,
  //       count: 1,
  //       options: {},
  //       place: this.content.length,
  //     });
  //   } else {
  //     // const foundItemIndex = this.content.findIndex((e) => e.id == id);
  //     // let returnValue;
  //     // if (foundItemIndex >= 0) {
  //     //   this.content[foundItemIndex].count += value;
  //     //   returnValue = this.content[foundItemIndex].count;
  //     // } else {
  //     //   this.content.unshift({ id, count: 1, options: {} });
  //     //   returnValue = 1;
  //     // }
  //     // if (returnValue == 0) {
  //     //   this.content.splice(foundItemIndex, 1);
  //     // }
  //     // lsList.save("cart", this.content);
  //     // this.updateTotal();

  //     // return returnValue;
  //     // this.content[id].count += value;
  //     // returnValue = this.content[id].count;
  //     // if (returnValue == 0) {
  //     //   this.content.splice(id, 1);
  //     // }
  //   }

  //   lsList.save("cart", this.content);
  //   this.updateTotal();

  //   return returnValue;
  // },
  updateTotal() {
    let totalCost = 0;
    let totalCount = 0;
    this.content = this.content.filter((e) => e.count > 0);

    this.content.forEach((cartItem) => {
      const item = mainHandler.products.find((e) => {
        return e.id == cartItem.id;
      });
      const count = Number(cartItem.count) || 0;
      const price = Number(item.regular_price) || 0;

      totalCost += count * price;

      if (cartItem.options) {
        for (const optionString in cartItem.options) {
          const optionID = optionString.replace("id", "");
          const option = item.meta.foodoptions.find((e) => e.id == optionID);

          if (!option) {
            console.warn("deleting", optionID);
            delete cartItem.options[optionString];
          } else {
            const price = option.regular_price;

            totalCost += cartItem.options[optionString] * price;
            totalCount += cartItem.options[optionString];
          }
        }
      }
    });

    this.cartTotal.innerText = `${totalCost} kr`;
  },
  buildTopBar() {
    this.topBar.classList.add("flex-row");
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
    this.itemsContainer.innerHTML = "";
    const newSort = [];

    this.content.forEach((cartItem, index) => {
      if (!cartItem.fixed) {
        console.log("cartItem.id", cartItem.id);
        const item = mainHandler.products.find((e) => e.id == cartItem.id);
        if (!item) {
          console.warn("couldnt find", cartItem.id);
        }

        if (!item.fixed) {
          cartItem.number = item.meta.itemnumber;
          newSort.push(cartItem);
        }
      }
    });
    // newSort.products = newSort.sort((a, b) => {
    //   if (a.number) {
    //     return a.number.localeCompare(b.number);
    //   }
    // });

    // this.content.forEach((cartItem, index) => {
    //   const item = mainHandler.products.find((e) => e.id == cartItem.id);
    //   if (item.fixed) {
    //     newSort.push(cartItem);
    //   }
    // });
    // this.content = newSort;
    this.content.forEach((cartItem, index) => {
      if (!cartItem.fixed) {
        const item = mainHandler.products.find((e) => e.id == cartItem.id);
        this.createCard(item, cartItem);
      }
    });

    this.createCheckoutOnlyCategory(
      "foodextra",
      mainHandler.foods,
      lang({ no: "Tilbehør", en: "Accessories" })
    );
    this.createCheckoutOnlyCategory(
      "drinkextra",
      mainHandler.drinks,
      lang({ no: "Drikker", en: "Drinks" })
    );
  },
  createCheckoutOnlyCategory(nameID, items, titleName) {
    const itemCard = document.createElement("div");
    itemCard.classList = "flex-column item-card";
    itemCard.id = nameID;
    const title = document.createElement("div");
    title.classList = "category-title";
    title.innerText = titleName;
    itemCard.appendChild(title);
    const optionContainer = document.createElement("div");
    optionContainer.classList = "flex-column options-container";
    items.forEach((option) => {
      let cartItem = this.content.find((e) => e.id == option.id);

      const optionsDiv = document.createElement("div");
      optionsDiv.classList = "flex-row align option";

      optionsDiv.innerHTML += `
            <div class="option-title">${option.name}, ${option.regular_price}kr</div>
            <div class="option-adder flex-row align"></div>`;

      numberAdjuster({
        place: optionsDiv.querySelector(".option-adder"),
        startValue: cartItem ? cartItem.count : 0,
        maxValue: option.stock_quantity,

        minusAction: () => {
          let cartItem = this.content.find((e) => e.id == option.id);
          if (!cartItem) {
            this.content.push({ id: option.id, count: 0, fixed: true });
          } else {
            cartItem.count--;
          }
        },
        plussAction: () => {
          let cartItem = this.content.find((e) => e.id == option.id);
          if (!cartItem) {
            this.content.push({ id: option.id, count: 1, fixed: true });
          } else {
            cartItem.count++;
          }
        },
        endAction: async () => {
          mainHandler.refresh();
        },
      });

      optionContainer.appendChild(optionsDiv);
    });
    itemCard.appendChild(optionContainer);

    this.itemsContainer.appendChild(itemCard);
  },
  createCard(item, cartItem) {
    const { id, number } = item;

    const options = item.meta.foodoptions || item.meta.categoryItems;
    item.fixed = cartItem.fixed;

    const itemCard = document.createElement("div");
    itemCard.classList = "flex-column item-card";
    itemCard.id = id;
    const optionContainer = document.createElement("div");
    optionContainer.classList = "flex-column options-container";
    if (options) {
      item.meta.foodoptions.forEach((option) => {
        const optionsDiv = document.createElement("div");
        optionsDiv.classList = "flex-row align option";

        optionsDiv.innerHTML += `
            <div class="option-title">${lang(
              {
                no: option.nameNO,
                en: option.nameEN,
              },
              option.nameNO
            )}${
          option.regular_price && option.regular_price != "0"
            ? `, ${option.regular_price}kr`
            : ""
        }</div>
            <div class="option-adder flex-row align"></div>`;

        if (option.type == "toggle") {
          // let cartItem = cartItem.find((e) => e.id == option.id);
          if (!cartItem.options) {
            cartItem[options] = {};
          }
          toggleAdjuster({
            place: optionsDiv.querySelector(".option-adder"),
            startValue: cartItem.options["id" + option.id] || option.toggle,
            noAction: () => {
              cartItem.options["id" + option.id] = 0;
            },
            yesAction: () => {
              cartItem.options["id" + option.id] = 1;
            },
            endAction: async () => {
              // mainHandler.refresh();
              checkOutHandler.updateTotal();
              paymentHandler.build();
            },
          });
        } else {
          if (!cartItem.options) {
            cartItem[options] = {};
          }
          numberAdjuster({
            place: optionsDiv.querySelector(".option-adder"),
            startValue: cartItem.options["id" + option.id] || 0,
            maxValue: option.stock,

            minusAction: () => {
              if (!cartItem.options["id" + option.id]) {
                cartItem.options["id" + option.id] = 0;
              }
              cartItem.options["id" + option.id]--;
            },
            plussAction: () => {
              if (!cartItem.options["id" + option.id]) {
                cartItem.options["id" + option.id] = 0;
              }
              cartItem.options["id" + option.id]++;
            },
            endAction: async () => {
              mainHandler.refresh();
              this.updateTotal();
            },
          });
        }

        optionContainer.appendChild(optionsDiv);
      });
    }
    if (cartItem.count > 0 || cartItem.fixed) {
      itemCard.innerHTML = template.checkoutCard(item);

      if (!cartItem.fixed) {
        itemCard.appendChild(
          createButton({
            text: lang({ no: "Fjern", en: "Remove" }),
            classes: "checkout-remove-button",
            action: () => {
              cartItem.count -= 1;
              if (cartItem.count <= 0) {
                itemCard.classList.add("d-none");
              }
              mainHandler.refresh();
              this.updateTotal();
            },
          })
        );
      }
      const imageContainer = itemCard.querySelector(".image-container");
      if (imageContainer) {
        imageContainer.addEventListener("click", () => {
          navigateTo("ordering");
          const targetItem = document.getElementById("order-item-" + item.id);

          targetItem.scrollIntoView({ behavior: "smooth", block: "start" });

          // targetItem.classList.remove("bump-card");
          // setInterval(() => {
          //   targetItem.classList.add("bump-card");
          // }, 10);
        });
      }
      itemCard.appendChild(optionContainer);

      this.itemsContainer.appendChild(itemCard);
    }
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
          navigateTo("payment");
        },
      })
    );
  },
};
