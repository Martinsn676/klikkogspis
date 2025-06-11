import { mainHandler } from "../../js/mainHandler.js";
import { navigateTo } from "../../js/pageNav.js";
import { api } from "../../shared/js/api.js";
import { lang } from "../../shared/js/lang.js";
import { createButtons, makeCopy } from "../../shared/js/lazyFunctions.js";
import { lsList } from "../../shared/js/lists.js";

export const adminOrdersHandler = {
  init() {
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
<option value=""></option>
<option value="processing">${lang({
      no: "Uferdige",
      en: "Unfinished",
    })}</option>
<option value="completed">${lang({ no: "Ferdige", en: "Finished" })}</option>`;
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
    this.getOrders();
  },
  async getOrders() {
    const token = await lsList.get("token");
    const response = await api.try("get-orders", {
      restaurant_id: mainHandler.restaurant_id,
      token,
    });
    if (response.ok) {
      this.orders = response.data;
      this.build();
    }
  },
  build() {
    this.itemsContainer.innerHTML = "";
    if (this.orderCountdownInterval) {
      clearInterval(this.orderCountdownInterval);
    }
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
      order.items.forEach(
        (e) => (orderItemsContainer.innerHTML += `<div>${e.name}</div>`)
      );

      card.innerHTML = `
    <div class="card-display">
      <div class="flex-row align">#${order.order_id} ${order.customer.first_name} ${order.customer.last_name}</div>
      ${orderItemsContainer.outerHTML}
      <div class="countdown flex-column align" id="countdown-${order.order_id}">Loading...</div>
      <div class="countdown-adjustment flex-column align" id="countdown-adjustment-${order.order_id}"></div>

    </div>
    <div class="card-menu flex-row align"></div>
    <div class="card-menu-confirm flex-row align"></div>
    <div class="card-menu-finished flex-row align"></div>`;
      card.querySelector(".card-display").addEventListener("click", () => {
        if (order.minutesLeft != false) {
          order.minutesLeft = order.orgMinutesLeft;
          order.card.classList.remove("display-menu-edited");
          order.countdownAdjustment.innerText = "";
          updateTimeFor(order);
        }
        card.classList.toggle("display-menu");
      });

      createButtons(card.querySelector(".card-menu"), [
        {
          text: lang({
            no: "-1",
            en: "-1",
          }),
          action: () => {
            console.log("click");
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
            console.log("click");
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
            console.log("click");
            order.countdownAdjustment.innerText =
              order.minutesLeft > 0 ? order.minutesLeft * -1 : "";
            order.minutesLeft = false;

            updateTimeFor(order);
            order.countdown.innerHTML = `<img src="./icons/checkmark.svg">`;
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
            if (order.minutesLeft != false) {
              order.minutesLeft = order.orgMinutesLeft;
              order.card.classList.remove("display-menu-edited");
              order.countdownAdjustment.innerText = "";
              countdown.innerText = order.minutesLeft;
            }
          },
          classes: "bootstrap-btn-danger",
        },
        {
          text: lang({
            no: "Lagre",
            en: "Save",
          }),
          action: async () => {
            if (Number(order.countdownAdjustment.innerText)) {
              const date = new Date(
                order.ready_for_pickup_at.replace("T", " ") + "Z"
              );
              date.setMinutes(
                date.getMinutes() + Number(order.countdownAdjustment.innerText)
              );
              order.ready_for_pickup_at = date.toISOString().slice(0, 19);

              const response = await api.try("edit-order", {
                estaurant_id: mainHandler.restaurant_id,
                token: await lsList.get("token"),
                orderID: order.id,
                body: { ready_for_pickup_at: order.ready_for_pickup_at },
              });
              console.log("response", response);
              this.build();
            }
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
          action: () => {
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
      const pickupTime = new Date(order.ready_for_pickup_at);
      const diffMs = pickupTime - now;
      const diffMinutes = Math.ceil(diffMs / 60000);

      order.minutesLeft = diffMinutes;
      order.orgMinutesLeft = order.minutesLeft;
      order.card = card;
      countdown.innerText = order.minutesLeft;
      updateTimeFor(order);
    });

    this.itemsContainer.appendChild(container);
    function updateTimeFor(order) {
      if (order.minutesLeft != false || order.minutesLeft == 0) {
        if (order.minutesLeft < 0) {
          order.countdown.classList.add("count-down-negative");
        } else {
          order.countdown.classList.remove("count-down-negative");
        }

        order.countdown.innerText = order.minutesLeft;
      } else {
        order.countdown.innerHTML = `<img src="./icons/checkmark.svg">`;
      }

      if (order.orgMinutesLeft != order.minutesLeft) {
        order.card.classList.add("display-menu-edited");
      } else {
        order.card.classList.remove("display-menu-edited");
      }

      if (order.orgMinutesLeft == false) {
        order.card.classList.add("finished");
      } else {
        order.card.classList.remove("finished");
      }
    }
    this.orderCountdownInterval = setInterval(() => {
      adminOrdersHandler.orders.forEach((order) => {
        if (order.minutesLeft !== false) {
          order.minutesLeft--;
          order.orgMinutesLeft--;
          updateTimeFor(order);
        }
      });
    }, 60000);
  },
};
