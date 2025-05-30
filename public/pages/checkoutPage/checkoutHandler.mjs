import { mainHandler } from "../../js/mainHandler.mjs";
import { navigateTo } from "../../js/pageNav.mjs";
import { lang } from "../../shared/js/lang.mjs";
import {
  createButton,
  makeCopy,
  numberAdjuster,
  toggleAdjuster,
} from "../../shared/js/lazyFunctions.mjs";
import { lsList } from "../../shared/js/lists.mjs";
import { orderHandler } from "../orderPage/orderHandler.mjs";
import { template } from "../templates/itemCards.mjs";

export const checkOutHandler = {
  content: [],
  async init() {
    this.topBar = document.getElementById("checkout-top-bar");
    this.itemsContainer = document.getElementById("checkout-items-container");
    this.content = await lsList.get("cart");
    if (!this.content || this.content.length == 0) {
      this.content = [];
      mainHandler.products.forEach((e) => {
        if (e.meta.fixeditem) {
          this.content.push({
            id: e.id,
            options: {},
            count: 0,
            fixed: true,
          });
        }
      });
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
  //     // console.log("returnValue", returnValue);
  //     // return returnValue;
  //     // this.content[id].count += value;
  //     // returnValue = this.content[id].count;
  //     // if (returnValue == 0) {
  //     //   this.content.splice(id, 1);
  //     // }
  //   }
  //   console.log("  this.content", this.content);
  //   lsList.save("cart", this.content);
  //   this.updateTotal();
  //   console.log("returnValue", returnValue);
  //   return returnValue;
  // },
  updateTotal() {
    let totalCost = 0;
    let totalCount = 0;

    this.content.forEach((cartItem) => {
      const item = mainHandler.products.find((e) => e.id == cartItem.id);
      const count = Number(cartItem.count) || 0;
      const price = Number(item.regular_price) || 0;

      totalCost += count * price;

      totalCount += item.count;
      if (cartItem.options) {
        for (const optionString in cartItem.options) {
          const optionID = optionString.replace("id", "");
          const option = item.meta.foodoptions.find((e) => e.id == optionID);

          totalCost += cartItem.options[optionString] * option.price;
          totalCount += cartItem.options[optionString];
        }
      }
      this.cartTotal.innerText = `${totalCost} kr`;
    });
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
      const item = mainHandler.products.find((e) => e.id == cartItem.id);

      if (!item.fixed) {
        cartItem.number = item.number;
        newSort.push(cartItem);
      }
    });
    newSort.products = newSort.sort((a, b) => {
      if (a.number) {
        return a.number.localeCompare(b.number);
      }
    });

    this.content.forEach((cartItem, index) => {
      const item = mainHandler.products.find((e) => e.id == cartItem.id);
      if (item.fixed) {
        newSort.push(cartItem);
      }
    });
    this.content = newSort;
    console.log("    this.content", this.content);
    this.content.forEach((cartItem, index) => {
      const item = mainHandler.products.find((e) => e.id == cartItem.id);
      const {
        id,
        title,
        number,
        description,
        price,
        allergies,
        image,

        stock,
      } = item;

      const options = item.meta.foodoptions;
      item.fixed = cartItem.fixed;

      const itemCard = document.createElement("div");
      itemCard.classList = "flex-column item-card";
      itemCard.id = id;
      const optionContainer = document.createElement("div");
      optionContainer.classList = "flex-column options-container";
      if (options) {
        options.forEach((option) => {
          const optionsDiv = document.createElement("div");
          optionsDiv.classList = "flex-row align option";
          const cartData = cartItem.options["id" + option.id];
          if (!option.toggle) {
            optionsDiv.innerHTML += `
            <div class="option-title">${option.title}, ${option.price}kr</div>
            <div class="option-adder flex-row align"></div>`;

            numberAdjuster({
              place: optionsDiv.querySelector(".option-adder"),
              startValue: cartData || 0,
              maxValue: option.stock,
              minusAction: () => {
                if (cartItem.options["id" + option.id]) {
                  cartItem.options["id" + option.id]--;
                } else {
                  cartItem.options["id" + option.id] = 0;
                }
              },
              plussAction: () => {
                if (cartItem.options["id" + option.id]) {
                  cartItem.options["id" + option.id]++;
                } else {
                  cartItem.options["id" + option.id] = 1;
                }
              },
              endAction: async () => {
                mainHandler.refresh();
              },
            });
          } else {
            optionsDiv.innerHTML = `
               <div class="option-title">${option.title}?${
              option.regular_price ? ` ${option.regular_price} kr` : ""
            }</div>
              <div class="option-changer flex-row align"></div>`;
            const cartData = cartItem.options["id" + option.id];

            toggleAdjuster({
              place: optionsDiv.querySelector(".option-changer"),
              startValue: cartData ? "yes" : option.toggle,
              noAction: () => {
                cartItem.options["id" + option.id] = 0;
              },
              yesAction: () => {
                cartItem.options["id" + option.id] = 1;
              },
              endAction: async () => {
                mainHandler.refresh();
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
              },
            })
          );
          // numberAdjuster({
          //   place: itemCard.querySelector(".adder"),
          //   startValue: cartItem.count,
          //   minusAction: () => {
          //     cartItem.count -= 1;
          //     if (cartItem.count <= 0) {
          //       itemCard.classList.add("d-none");
          //     }
          //   },
          //   plussAction: () => (cartItem.count += 1),
          //   endAction: () => {
          //     this.updateTotal();
          //     lsList.save("cart", this.content);
          //     orderHandler.updateCount();
          //   },
          // });
        }
        const imageContainer = itemCard.querySelector(".image-container");
        if (imageContainer) {
          imageContainer.addEventListener("click", () => {
            navigateTo("ordering");
            const targetItem = document.getElementById("order-item-" + number);
            targetItem.scrollIntoView({ behavior: "smooth", block: "start" });
            console.error("targetItem", targetItem);
            targetItem.classList.remove("bump-card");
            setInterval(() => {
              targetItem.classList.add("bump-card");
            }, 10);
          });
        }
        itemCard.appendChild(optionContainer);

        this.itemsContainer.appendChild(itemCard);
      }
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
          navigateTo("payment");
        },
      })
    );
  },
};
