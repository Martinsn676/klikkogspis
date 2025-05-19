export const template = {
  orderCard(item) {
    return `
    <div class="card-title">${item.number ? `Nr ${item.number} ` : ""}${
      item.title
    }</div>
    <div class="top-part flex-row">
        <div class="image-container">
        <img src="${item.image}">
        </div>
        <div class="allergieses-container">
        ${item.allergiesDiv}
        </div>
    </div>
    <div class="middle-part flex-row">
        <div class="card-description">${item.description}</div>
    </div>
    <div class="bottom-part flex-row">
        <div class="card-price">${item.price} kr</div>
    </div>`;
  },
  paymentCard(item) {
    return `
    <div class="flex-row align">
        <div class="card-title">${item.number ? `Nr ${item.number} ` : ""}${
      item.title
    }</div>          
    ${!item.fixed ? `<div class="">${item.price} kr</div>` : ""}

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
