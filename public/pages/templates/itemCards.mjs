import { lang } from "../../shared/js/lang.mjs";
import { paymentHandler } from "../paymentPage/paymentHandler.mjs";

export const template = {
  orderCard(item) {
    return `
    <div class="card-title">${item.number ? `Nr ${item.number} ` : ""}${lang(
      item.name
    )}</div>
    <div class="top-part flex-row">
        <div class="image-container">
        <img src="${item.images && item.images[0] ? item.images[0].src : ""}">
        </div>
        <div class="allergieses-container">
        ${item.allergiesDiv}
        </div>
    </div>
    <div class="middle-part flex-row">
        <div class="card-description">${lang(item.description)}</div>
    </div>
    <div class="bottom-part flex-row">
        <div class="card-price">${item.regular_price} kr</div>
    </div>`;
  },
  paymentCard(item, count = 1) {
    let additionalText = document.createElement("div");
    let totalPrice = item.regular_price * count;
    additionalText.classList.add("flex-column");
    if (item.cartItemDetails) {
      for (const id in item.cartItemDetails.options) {
        if (item.cartItemDetails.options[id] != 0) {
          const details = item.options.find((option) => "id" + option.id == id);

          additionalText.innerHTML += `<div>${details.name}</div>`;
          totalPrice += details.price;
        }
      }
    }
    if (count) {
    }

    paymentHandler.totalCost += totalPrice;
    return `
    <div class="flex-column">
      <div class="flex-row align">
          <div class="card-title">${item.number ? `Nr ${item.number} ` : ""}${
      item.name
    }</div>          

          <div class="payment-card-price">${totalPrice} kr</div>


      </div>
      ${additionalText.outerHTML}
    </div>`;
  },
  checkoutCard(item) {
    console.warn(item);
    return `
    <div class="top-part flex-row">
    ${
      item.images && item.images.length > 0
        ? `  <div class="image-container">
                    <img src="${item.images[0].src}">
                </div>`
        : ""
    }
    <div class="flex-column right-side">
        <div class="card-title">${
          item.meta.itemNumber ? `Nr ${item.number} ` : ""
        }${item.name}</div>          
    
    ${
      !item.fixed
        ? `<div class="middle-part flex-row align">${item.regular_price} kr`
        : ""
    }
        <div class="adder"></div>
        </div></div>
    </div>`;
  },
};
