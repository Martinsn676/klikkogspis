import { navigateTo } from "../../js/pageNav.js";
import { api } from "../../shared/js/api.js";
import { lang } from "../../shared/js/lang.js";
import { createButton, tryParse } from "../../shared/js/lazyFunctions.js";

export const waitingHandler = {
  async init() {
    this.topBar = document.getElementById("waiting-top-bar");
    this.itemsContainer = document.getElementById("waiting-items-container");
    this.bottomBar = document.getElementById("waiting-bottom-bar");

    this.buildBottomBar();
    this.itemsContainer.innerHTML = "";
    this.build();
    if (this.orderCountdownInterval) {
      clearInterval(this.orderCountdownInterval);
    }
    this.orderCountdownInterval = setInterval(() => {
      console.warn("======interval public update======");
      if (
        (this.tracking_token = new URLSearchParams(location.search).get(
          "order"
        ))
      ) {
        this.build();
      }
    }, 60000);
  },
  async getOrder() {
    this.tracking_token = new URLSearchParams(location.search).get("order");
    if (this.tracking_token) {
      const response = await api.try("public-get-order", {
        tracking_token: this.tracking_token,
      });
      this.orderID = response.data.order_id;
      this.orderDetails = response.data;
    }
  },
  async build() {
    await this.getOrder();
    this.buildTopBar();
    let codeArray = this.tracking_token.split("");
    codeArray = codeArray.splice(0, 3);

    const code = codeArray.join("");
    this.itemsContainer.innerHTML = `<div class="text-center p-3"><p>${lang({
      no: "Takk for din bestilling! Estimert tid vises ovenfor, og vil bli oppdatert for å være mest nøyaktig",
      en: "Thank you for your order! Estimated time for it to be ready will be displayed above, and will be updated for best accuracy",
    })}`;
    // this.itemsContainer.innerHTML += `<div class="text-center p-3"><p>${lang({
    //   no: "Hentekode:",
    //   en: "Pickupcode:",
    // })} ${code}`;
    this.orderDetails.items.forEach((e) => {
      const options = e.meta.find((meta) => meta.key == "option");
      let optionsText = "";
      let itemDetails;
      if (options) {
        const parsedOptions = tryParse(options.value);

        parsedOptions.forEach((option) => {
          if (option.title) {
            itemDetails = option;
          } else {
            if (option.value != "no" && Number(option.value) != 0) {
              optionsText += `<div>${
                Number(option.value) > 0 ? `${option.value} x ` : ""
              }${lang({
                no: option.no,
                en: option.en,
              })}</div>`;
            }
          }
        });
      }
      console.log(e);
      if (!itemDetails) {
        itemDetails = {
          title: e.name,
        };
        itemDetails.number = "";
        itemDetails.title = e.name;
      }
      this.itemsContainer.innerHTML += `<div class="p-3 flex-column"><div class="title">${
        e.qty && e.qty > 1 ? `${e.qty} x ` : ""
      }${itemDetails.number ? `Nr ${itemDetails.number} ` : ""}${
        itemDetails.title
      }</div>${optionsText}</div>`;
    });
  },
  buildTopBar() {
    this.topBar.innerHTML = "";
    const now = new Date();

    const pickupTime = new Date(this.orderDetails.ready_for_pickup_at);
    const diffMs = pickupTime - now;
    const diffMinutes = Math.ceil(diffMs / 60000);

    let countDownText;
    if (diffMinutes > 0) {
      countDownText = `${lang({
        no: "Ordre klar om ca",
        en: "Order ready in about",
      })} ${diffMinutes} min`;
    } else {
      countDownText = `${lang({
        no: "Ordre forsinket med",
        en: "Order delayed with",
      })} ${diffMinutes * -1} min`;
    }

    const container = document.createElement("div");
    container.classList = "container flex-row top-bar";
    container.classList = "container flex-column top-bar";
    container.innerHTML = `
    <div class="top-bar-title">${lang({
      no: `Ordre: #${this.orderID}`,
      en: `Order: #${this.orderID}`,
    })}</div>
    <div id="time-counter">${countDownText}</div>
    `;

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
        text: lang({ no: "Ring oss", en: "Call us" }),

        change: this.mainContentContainer,

        action: () => window.open("tel:90418429", "_new"),
      })
    );
  },
};
