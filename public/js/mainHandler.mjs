import { checkOutHandler } from "../pages/checkoutPage/checkoutHandler.mjs";
import { menuHandler } from "../pages/menuPage/menuHandler.mjs";
import { orderHandler } from "../pages/orderPage/orderHandler.mjs";
import { paymentHandler } from "../pages/paymentPage/paymentHandler.mjs";
import { mockProducts } from "./mockProducts.mjs";
import { navigateTo } from "./pageNav.mjs";
export const mainHandler = {
  versionNr: "0.0.1",
  restaurantName: "China Restaurant Husnes",
  async init() {
    this.reload();
  },
  async reload() {
    console.log("reload");
    menuHandler.init();
    await this.loadProducts();
    orderHandler.init();

    await checkOutHandler.init();
    orderHandler.init();
    paymentHandler.init();
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

function updateAppHeight() {
  const appHeight = window.innerHeight + "px";
  document.documentElement.style.setProperty("--app-height", appHeight);
}
window.addEventListener("resize", updateAppHeight);
window.addEventListener("popstate", (event) => {
  const pageName = new URLSearchParams(location.search).get("page") || "menu";
  navigateTo(pageName);
});
const pageName = new URLSearchParams(location.search).get("page") || "menu";
navigateTo(pageName);
mainHandler.init();
updateAppHeight();
