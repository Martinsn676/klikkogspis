import { lang } from "../../shared/js/lang.js";
import { paymentHandler } from "../paymentPage/paymentHandler.js";

export const template = {
  orderCard(item, allergiesDiv) {
    return `
    <div class="card-title">${
      item.meta.itemnumber ? `Nr ${item.meta.itemnumber} ` : ""
    }${lang(item.meta.title_translations, item.name)}</div>
    <div class="top-part flex-row">
        <div class="image-container">
        <img src="${
          item.images[0] ||
          "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg"
        }" alt="item-iamge">
        </div>
      
        ${allergiesDiv.outerHTML}
    
    </div>
    <div class="middle-part flex-row">
        <div class="card-description">${lang(
          item.meta.description_translations,
          item.description
        )}</div>
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
        const count = Number(item.cartItemDetails.options[id]);
        if (count != 0) {
          const details = item.meta.foodoptions.find(
            (option) => "id" + option.id == id
          );

          additionalText.innerHTML += `<div>${
            count && count > 1 ? `${count} x ` : ""
          }${lang(
            {
              no: details.nameNO,
              en: details.nameEN,
            },
            details.nameNO
          )}</div>`;
          totalPrice += Number(details.regular_price) * count;
        }
      }
    }

    paymentHandler.totalCost += totalPrice;
    return `
    <div class="flex-column">
      <div class="flex-row align">
          <div class="card-title">${count > 1 ? `${count} x ` : ""}${
      item.meta.itemnumber ? `Nr ${item.meta.itemnumber} ` : ""
    }${item.name}</div>          

          <div class="payment-card-price">${totalPrice} kr</div>


      </div>
      ${additionalText.outerHTML}
    </div>`;
  },
  checkoutCard(item) {
    return `
    <div class="top-part flex-row">
 <div class="image-container">
                    <img src="${
                      item.images[0] ||
                      "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg"
                    }">
                </div>
  

    <div class="flex-column right-side">
        <div class="card-title">${
          item.meta.itemnumber ? `Nr ${item.meta.itemnumber} ` : ""
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
  adminItemCards(item) {
    return `
      <div>${item.name}</div>
      <div class="admin-item-container">
      </div>

`;
  },
};
