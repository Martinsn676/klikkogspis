import { lang } from "../../shared/js/lang.mjs";
import { paymentHandler } from "../paymentPage/paymentHandler.mjs";

export const template = {
  orderCard(item) {
    return `
    <div class="card-title">${item.number ? `Nr ${item.number} ` : ""}${lang(
      item.title
    )}</div>
    <div class="top-part flex-row">
        <div class="image-container">
        <img src="${item.image}">
        </div>
        <div class="allergieses-container">
        ${item.allergiesDiv}
        </div>
    </div>
    <div class="middle-part flex-row">
        <div class="card-description">${lang(item.description)}</div>
    </div>
    <div class="bottom-part flex-row">
        <div class="card-price">${item.price} kr</div>
    </div>`;
  },
  paymentCard(item, count = 1) {
    let additionalText = document.createElement("div");
    let totalPrice = item.price * count;
    additionalText.classList.add("flex-column");
    if (item.cartItemDetails) {
      for (const id in item.cartItemDetails.options) {
        if (item.cartItemDetails.options[id] != 0) {
          const details = item.options.find((option) => "id" + option.id == id);

          additionalText.innerHTML += `<div>${details.title}</div>`;
          totalPrice += details.price;
        }
      }
    }
    if (count) {
    }
    console.log("count", count);
    paymentHandler.totalCost += totalPrice;
    return `
    <div class="flex-column">
      <div class="flex-row align">
          <div class="card-title">${item.number ? `Nr ${item.number} ` : ""}${
      item.title
    }</div>          

          <div class="payment-card-price">${totalPrice} kr</div>


      </div>
      ${additionalText.outerHTML}
    </div>`;
  },
  checkoutCard(item) {
    return `
    <div class="top-part flex-row">
    ${
      item.image
        ? `  <div class="image-container">
                    <img src="${item.image}">
                </div>`
        : ""
    }
    <div class="flex-column right-side">
        <div class="card-title">${item.number ? `Nr ${item.number} ` : ""}${
      item.title
    }</div>          
    
    ${
      !item.fixed
        ? `<div class="middle-part flex-row align">${item.price} kr`
        : ""
    }
        <div class="adder"></div>
        </div></div>
    </div>`;
  },
};
