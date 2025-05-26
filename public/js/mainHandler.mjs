import { checkOutHandler } from "../pages/checkoutPage/checkoutHandler.mjs";
import { menuHandler } from "../pages/menuPage/menuHandler.mjs";
import { orderHandler } from "../pages/orderPage/orderHandler.mjs";
import { paymentHandler } from "../pages/paymentPage/paymentHandler.mjs";
import { lsList } from "../shared/js/lists.mjs";
import { mockProducts } from "./mockProducts.mjs";
import { navigateTo } from "./pageNav.mjs";
export const mainHandler = {
  versionNr: "0.5.0",
  restaurantName: "China Restaurant Husnes",
  async init() {
    this.reload();
  },
  async reload() {
    console.info("relaoding");
    menuHandler.init();
    await this.loadProducts();
    orderHandler.init();

    await checkOutHandler.init();
    orderHandler.init();
    paymentHandler.init();
    this.refresh();
  },
  async refresh(full) {
    await lsList.save("cart", checkOutHandler.content);
    checkOutHandler.content = checkOutHandler.content.filter(
      (cartItem) => cartItem.count !== 0 || cartItem.fixed
    );
    console.log("checkOutHandler.content", checkOutHandler.content);
    orderHandler.updateCount();
    checkOutHandler.updateTotal();
    paymentHandler.build();
    if (full) {
      checkOutHandler.build();
    }
  },
  async loadProducts() {
    this.products = mockProducts.sort((a, b) => {
      if (a.number) {
        return a.number.localeCompare(b.number);
      }
    });
    console.log("this.products", this.products);
  },
};

// window.addEventListener("popstate", (event) => {
//   const pageName = new URLSearchParams(location.search).get("page") || "menu";
//   navigateTo(pageName);
// });
// const pageName = new URLSearchParams(location.search).get("page") || "menu";
// navigateTo(pageName);
// mainHandler.init();
