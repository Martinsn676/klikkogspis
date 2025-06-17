import { mainHandler } from "../../js/mainHandler.js";
import { navigateTo } from "../../js/pageNav.js";
import { api } from "../../shared/js/api.js";
import { lang } from "../../shared/js/lang.js";
import {
  createButtons,
  makeCopy,
  tryParse,
} from "../../shared/js/lazyFunctions.js";
import { lsList } from "../../shared/js/lists.js";
const finishedIcon = `<img src="./icons/checkmark.svg">`;
export const adminOrdersHandler = {
  async init() {
    this.topBar = document.getElementById("admin-orders-top-bar");
    this.mainContainer = document.getElementById(
      "admin-orders-items-container"
    );

    const selectFilter = document.createElement("select");
    selectFilter.classList = "bootstrap-select";
    selectFilter.id = "filter-orders-select";
    this.itemsContainer = document.createElement("div");
    this.itemsContainer.id = "items-container";
    selectFilter.innerHTML = `
<option value="processing" selected>${lang({
      no: "Uferdige",
      en: "Unfinished",
    })}</option>
<option value="completed">${lang({ no: "Ferdige", en: "Finished" })}</option>`;
    this.itemsContainer.dataset.filter = "processing";
    selectFilter.addEventListener("change", (event) => {
      this.itemsContainer.dataset.filter = event.target.value;
    });
    this.mainContainer.appendChild(selectFilter);

    this.mainContainer.appendChild(this.itemsContainer);
    this.bottomBar = document.getElementById("admin-orders-bottom-bar");
    this.topBar.innerHTML = "";
    const backButton = document.createElement("button");
    backButton.innerText = "Back";
    backButton.id = "test-back-button";
    backButton.addEventListener("click", () => navigateTo("menu"));
    this.topBar.appendChild(backButton);

    this.build();
  },
  async getOrders() {
    const token = await lsList.get("token");
    const today = new Date().toISOString().slice(0, 10);

    const response = await api.try("get-orders", {
      restaurant_id: mainHandler.restaurant_id,
      token,
      date: today,
    });
    if (response.ok) {
      return response.data;
    }
  },
  build() {
    this.updateSkipTimer = 0;
    this.itemsContainer.innerHTML = "";
    if (this.orderCountdownInterval) {
      clearInterval(this.orderCountdownInterval);
    }
    if (this.updateSkipInterval) {
      clearInterval(this.updateSkipInterval);
    }
    this.updateSkipInterval = setInterval(async () => {
      if (this.updateSkipTimer > 60) {
        this.updateSkipTimer = 60;
      }
      if (this.updateSkipTimer > 0) {
        this.updateSkipTimer--;
      }
    }, 1000);
    this.orders.forEach((order) => {
      order.pickupTime = new Date(order.ready_for_pickup_at);
    });
    this.orders = this.orders.sort((a, b) => {
      return a.pickupTime < b.pickupTime;
    });
    const container = document.createElement("div");
    container.classLisst = "flex-column";

    const now = new Date();
    this.orders.forEach((order) => {
      const card = document.createElement("div");
      card.classList = "flex-column order-card";
      card.id = `order-${order.order_id}`;
      card.dataset.status = order.status;
      let orderItemsContainer = document.createElement("div");
      orderItemsContainer.classList = "orderItemsContainer";

      order.items.forEach((item) => {
        item.optionHTML = "";

        if (item.meta) {
          item.meta.forEach((option) => {
            const parsedValue = tryParse(option.value);

            parsedValue.forEach((e) => {
              if (e.title) {
                item.details = e;
              } else {
                if (e.value != "no" && Number(e.value) != 0) {
                  item.optionHTML += `<span class="option-text">${
                    e.value > 1 ? `${e.value} x ` : ""
                  }${lang(e)}</span>`;
                }
              }
            });
          });
        }
      });
      const grouped = {};
      order.items.forEach((item) => {
        if (grouped[item.name + item.optionHTML]) {
          grouped[item.name + item.optionHTML].quantity++;
        } else {
          grouped[item.name + item.optionHTML] = {
            name: item.name,
            number: item.meta.itemnumber,
            quantity: 1,

            optionHTML: item.optionHTML,
          }; // clone to avoid mutating original
          if (item.details) {
            grouped[item.name + item.optionHTML].name = item.details.title;
            grouped[item.name + item.optionHTML].id = item.details.id;
            grouped[item.name + item.optionHTML].number = item.details.number;
          }
        }
      });
      for (const item in grouped) {
        const { quantity, name, optionHTML, number } = grouped[item];

        orderItemsContainer.innerHTML += `
      <div class="flex-column item-container"><div class="title">${
        quantity > 1 ? `${quantity} x ` : ""
      }${number ? `Nr ${number} ` : ""}${name}</div>
                  <div class="options flex-column">${optionHTML}</div>
              </div>`;
      }

      card.innerHTML = `
    <div class="card-display">
      <div class="flex-row align">#${order.order_id} ${order.customer.first_name} ${order.customer.last_name}</div>
      ${orderItemsContainer.outerHTML}
      <div class="countdown flex-column align" id="countdown-${order.order_id}">Loading...</div>
      <div class="countdown-adjustment flex-column align" id="countdown-adjustment-${order.order_id}"></div>

    </div>
    <div class="card-menu card-menu-adjuster flex-row align"></div>
    <div class="card-menu card-menu-confirm flex-row align"></div>
    <div class="card-menu card-menu-finished flex-row align"></div>
    <div class="card-menu card-menu-complete flex-row align"></div>`;
      function resetCard() {
        order.ready = order.ready_for_pickup == "1" ? true : false;
        order.minutesLeft = order.orgMinutesLeft;
        order.card.classList.remove("display-menu-edited");
        order.countdownAdjustment.innerText = "";
        countdown.innerText = order.minutesLeft;
        updateTimeFor(order);
      }
      card.querySelector(".card-display").addEventListener("click", () => {
        resetCard();

        card.classList.toggle("display-menu");
      });
      createButtons(card.querySelector(".card-menu-complete"), [
        {
          text: lang({
            no: "Angre hentet",
            en: "Regret picked up",
          }),
          action: async () => {
            const body = {
              status: "processing",
              meta_data: [],
            };
            order.readyConfirmed = false;
            order.ready_for_pickup = "0";
            order.status = "processing";
            order.ready = false;
            body.meta_data.push({
              key: "_ready_for_pickup",
              value: order.ready,
            });
            const response = await api.try("edit-order", {
              restaurant_id: mainHandler.restaurant_id,
              token: await lsList.get("token"),
              orderID: order.order_id,
              body,
            });

            this.build();
          },
          classes: "bootstrap-btn-secondary",
        },
        // {
        //   text: lang({
        //     no: "Lagre",
        //     en: "Save",
        //   }),
        //   action: async () => {
        //     const body = {
        //       meta_data: [],
        //     };
        //     order.readyConfirmed = false;
        //     order.ready_for_pickup = "0";
        //     if (order.ready) {
        //       order.readyConfirmed = true;
        //       order.ready_for_pickup = "1";
        //     }
        //     body.meta_data.push({
        //       key: "_ready_for_pickup",
        //       value: order.ready,
        //     });

        //     const date = new Date(
        //       order.ready_for_pickup_at.replace("T", " ") + "Z"
        //     );

        //     date.setMinutes(
        //       date.getMinutes() + Number(order.countdownAdjustment.innerText)
        //     );

        //     order.ready_for_pickup_at = date.toISOString().slice(0, 19);
        //     body.meta_data.push({
        //       key: "_ready_for_pickup_at",
        //       value: order.ready_for_pickup_at,
        //     });

        //     const response = await api.try("edit-order", {
        //       restaurant_id: mainHandler.restaurant_id,
        //       token: await lsList.get("token"),
        //       orderID: order.order_id,
        //       body,
        //     });

        //     this.build();
        //   },
        //   classes: "bootstrap-btn-success",
        // },
      ]);
      createButtons(card.querySelector(".card-menu-adjuster"), [
        {
          text: lang({
            no: "-1",
            en: "-1",
          }),
          action: () => {
            order.ready = false;
            order.minutesLeft--;
            order.countdownAdjustment.innerText--;

            updateTimeFor(order);
          },
          classes: "bootstrap-btn-success",
        },
        {
          text: lang({
            no: "+1",
            en: "+1",
          }),
          action: () => {
            order.ready = false;

            order.minutesLeft++;
            order.countdownAdjustment.innerText++;
            updateTimeFor(order);
          },
          classes: "bootstrap-btn-danger",
        },

        {
          text: lang({
            no: "Klar!",
            en: "Ready!",
          }),
          action: () => {
            order.ready = true;

            updateTimeFor(order);
          },
          classes: "bootstrap-btn-success",
        },
        {
          text: lang({
            no: "Ring",
            en: "Call",
          }),
          action: () => window.open("tel:" + order.customer.phone, "_new"),
          classes: "bootstrap-btn-primary",
        },
      ]);
      createButtons(card.querySelector(".card-menu-confirm"), [
        {
          text: lang({
            no: "Avbryt",
            en: "Cancel",
          }),
          action: () => {
            resetCard();
          },
          classes: "bootstrap-btn-danger",
        },
        {
          text: lang({
            no: "Lagre",
            en: "Save",
          }),
          action: async () => {
            const body = {
              meta_data: [],
            };
            order.readyConfirmed = false;
            order.ready_for_pickup = "0";
            if (order.ready) {
              order.readyConfirmed = true;
              order.ready_for_pickup = "1";
            }
            body.meta_data.push({
              key: "_ready_for_pickup",
              value: order.ready,
            });

            const date = new Date(
              order.ready_for_pickup_at.replace("T", " ") + "Z"
            );

            date.setMinutes(
              date.getMinutes() + Number(order.countdownAdjustment.innerText)
            );

            order.ready_for_pickup_at = date.toISOString().slice(0, 19);
            body.meta_data.push({
              key: "_ready_for_pickup_at",
              value: order.ready_for_pickup_at,
            });

            const response = await api.try("edit-order", {
              restaurant_id: mainHandler.restaurant_id,
              token: await lsList.get("token"),
              orderID: order.order_id,
              body,
            });

            this.build();
          },
          classes: "bootstrap-btn-success",
        },
      ]);
      createButtons(card.querySelector(".card-menu-finished"), [
        {
          text: lang({
            no: "Hentet",
            en: "Picked up",
          }),
          action: async () => {
            order.status = "completed";
            const response = await api.try("edit-order", {
              restaurant_id: mainHandler.restaurant_id,
              token: await lsList.get("token"),
              orderID: order.order_id,
              body: { status: "completed" },
            });
            card.classList.add("d-none");
          },

          classes: "bootstrap-btn-success finish-order-button",
        },
      ]);
      container.appendChild(card);
      const countdownAdjustment = card.querySelector(
        `#countdown-adjustment-${order.order_id}`
      );
      const countdown = card.querySelector(`#countdown-${order.order_id}`);
      // updateTime();
      order.countdown = countdown;
      order.countdownAdjustment = countdownAdjustment;
      order.card = card;
      order.ready = order.ready_for_pickup == "1" ? true : false;
      if (order.ready) {
        order.readyConfirmed = true;
      }
      const pickupTime = new Date(order.ready_for_pickup_at);

      const diffMs = pickupTime - now;
      order.minutesLeft = Math.ceil(diffMs / 60000);

      order.orgMinutesLeft = order.minutesLeft;

      countdown.innerText = order.minutesLeft;
      updateTimeFor(order, true);
    });

    this.itemsContainer.appendChild(container);
    function updateTimeFor(order, isSetup) {
      if (!isSetup) adminOrdersHandler.updateSkipTimer += 10;
      if (order.ready || order.status == "completed") {
        order.countdown.innerHTML = finishedIcon;
      } else {
        if (order.minutesLeft < 0) {
          order.countdown.classList.add("count-down-negative");
        } else {
          order.countdown.classList.remove("count-down-negative");
        }

        order.countdown.innerText = order.minutesLeft;
      }

      if (
        order.orgMinutesLeft != order.minutesLeft ||
        (order.ready && !order.readyConfirmed)
      ) {
        order.card.classList.add("display-menu-edited");
      } else {
        order.card.classList.remove("display-menu-edited");
      }

      if (order.readyConfirmed) {
        order.card.classList.add("finished");
      } else {
        order.card.classList.remove("finished");
      }
    }
    this.orderCountdownInterval = setInterval(async () => {
      if (this.updateSkipTimer > 0) {
        this.orders = await this.getOrders();
        this.build();
      }
    }, 60000);
  },
};
