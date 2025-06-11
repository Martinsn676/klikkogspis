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

    this.build();
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
    this.itemsContainer.innerHTML = "";
    this.orderDetails.items.forEach((e) => {
      const options = e.meta.find((meta) => meta.key == "option");
      let optionsText = "";
      if (options) {
        const parsedOptions = tryParse(options.value);
        console.log("parsedOptions", parsedOptions);

        parsedOptions.forEach((option) => {
          if (option.value != "no" && Number(option.value) != 0) {
            optionsText += `<div>${
              Number(option.value) > 0 ? `${option.value} x ` : ""
            }${lang({
              no: option.no,
              en: option.en,
            })}</div>`;
          }
        });
      }

      this.itemsContainer.innerHTML += `<div class="p-3 flex-column"><div class="title">${
        e.qty && e.qty > 1 ? `${e.qty} x ` : ""
      }${e.name}</div>${optionsText}</div>`;
    });
    this.orderCountdownInterval = setInterval(() => {
      this.build();
    }, 60000);
  },
  buildTopBar() {
    this.topBar.innerHTML = "";
    const now = new Date();
    console.warn(this.orderDetails.ready_for_pickup_at);
    const pickupTime = new Date(this.orderDetails.ready_for_pickup_at);
    const diffMs = pickupTime - now;
    const diffMinutes = Math.ceil(diffMs / 60000);
    console.log("diffMinutes", diffMinutes);
    let countDownText;
    if (diffMinutes > 0) {
      countDownText = `${lang({
        no: "Ordre klar om:",
        en: "Order ready in:",
      })} ${diffMinutes} min`;
    } else {
      countDownText = `${lang({
        no: "Ordre forsinket med:",
        en: "Order delayed with:",
      })} ${diffMinutes} min`;
      // countDownText = `${lang({
      //   no: "Ordren er klar for henting!:",
      //   en: "Order ready to pick up!",
      // })}`;
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
        // icon: "./icons/callIcon.png",
        change: this.mainContentContainer,
        // classes: "bootstrap-btn-neutral",

        action: () => window.open("tel:90418429", "_new"),
      })
    );
  },
};
