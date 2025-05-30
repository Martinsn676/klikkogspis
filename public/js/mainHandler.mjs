import { checkOutHandler } from "../pages/checkoutPage/checkoutHandler.mjs";
import { menuHandler } from "../pages/menuPage/menuHandler.mjs";
import { orderHandler } from "../pages/orderPage/orderHandler.mjs";
import { paymentHandler } from "../pages/paymentPage/paymentHandler.mjs";
import { api } from "../shared/js/api.mjs";
import { tryParse } from "../shared/js/lazyFunctions.mjs";
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

    orderHandler.updateCount();
    checkOutHandler.updateTotal();
    paymentHandler.build();
    if (full) {
      checkOutHandler.build();
    }
  },
  async loadProducts() {
    const response = await api.try("getProducts", { storeName: "china" });
    console.log("response", response);
    this.products = response.content;
    this.products = this.products.sort((a, b) => {
      if (a.number) {
        return a.number.localeCompare(b.number);
      }
    });
    // this.products.forEach((e) => {
    //   e.title = tryParse(e.meta["title_translations"]);
    //   e.options = tryParse(e.meta["foodoptions"]);
    //   e.description = tryParse(e.meta["description_translations"]);
    // });
    console.log("   this.products ", this.products);
  },
};

// window.addEventListener("popstate", (event) => {
//   const pageName = new URLSearchParams(location.search).get("page") || "menu";
//   navigateTo(pageName);
// });
// const pageName = new URLSearchParams(location.search).get("page") || "menu";
// navigateTo(pageName);
// mainHandler.init();
