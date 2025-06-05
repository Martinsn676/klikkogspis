import { mainHandler } from "../../js/mainHandler.js";
import { navigateTo } from "../../js/pageNav.js";

export const adminOrdersHandler = {
  init() {
    this.topBar = document.getElementById("admin-orders-top-bar");
    this.itemsContainer = document.getElementById(
      "admin-orders-items-container"
    );
    this.bottomBar = document.getElementById("admin-orders-bottom-bar");
    const backButton = document.createElement("button");
    backButton.innerText = "Back";
    backButton.id = "test-back-button";
    backButton.addEventListener("click", () => navigateTo("menu"));
    this.topBar.appendChild(backButton);
    this.build();
  },
  build() {
    this.itemsContainer.innerHTML = "";
    const container = document.createElement("div");
    container.classLisst = "flex-column";

    mainHandler.orders.forEach((order) => {
      const card = document.createElement("div");
      card.classList = "flex-column order-card";
      card.id = `order-${order.order_id}`;

      let items = "";
      order.items.forEach((e) => (items += `<div>${e.name}</div>`));

      card.innerHTML = `
      <div class="flex-row align">${order.order_id} ${order.customer.first_name} ${order.customer.last_name}</div>
      ${items}
      <div class="countdown" id="countdown-${order.order_id}">Loading...</div>
    `;

      container.appendChild(card);
    });

    this.itemsContainer.appendChild(container);
    updateTime();
    setInterval(() => {
      updateTime();
    }, 60000); // Change to 60000 for production
    function updateTime() {
      const now = new Date();

      mainHandler.orders.forEach((order) => {
        const pickupTime = new Date(order.ready_for_pickup_at);
        const diffMs = pickupTime - now;
        const diffMinutes = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;

        const countdownEl = document.getElementById(
          `countdown-${order.order_id}`
        );

        if (!countdownEl) return;

        if (diffMs <= 0) {
          countdownEl.innerHTML = `<div class="count-down-negative">Ordre over tiden: ${Math.abs(
            hours
          )}h ${Math.abs(minutes)}m</div>`;
        } else {
          countdownEl.innerHTML = `Ready in: ${
            hours ? `${hours}h ` : ""
          }${minutes}m`;
        }
      });
    }
  },
};
