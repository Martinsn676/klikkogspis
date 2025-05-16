import { checkOutHandler } from "../pages/checkoutPage/checkoutHandler.mjs";
import { menuHandler } from "../pages/menuPage/menuHandler.mjs";
import { orderHandler } from "../pages/orderPage/orderHandler.mjs";
import { mockProducts } from "./mockProducts.mjs";
import { navigateTo } from "./pageNav.mjs";
export const mainHandler = {
  versionNr: "0.0.1",
  restaurantName: "China Restaurant Husnes",
  async init() {
    menuHandler.init();
    checkOutHandler.init();
    await this.loadProducts();
    orderHandler.init();
  },
  async loadProducts() {
    this.products = mockProducts;
    console.log("this.products", this.products);
  },
};

function updateAppHeight() {
  const appHeight = window.innerHeight + "px";
  document.documentElement.style.setProperty("--app-height", appHeight);
}
window.addEventListener("resize", updateAppHeight);
window.addEventListener("popstate", (event) => {
  const pageName =
    new URLSearchParams(location.search).get("page") || "calendar";
  navigateTo(pageName);
});
const pageName = new URLSearchParams(location.search).get("page") || "calendar";
navigateTo(pageName);
mainHandler.init();
updateAppHeight();
