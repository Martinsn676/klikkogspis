import { adminOrdersHandler } from "../pages/adminOrders/adminOrdersHandler.js";
import { adminHandler } from "../pages/adminPage/adminHandler.js";
import { checkOutHandler } from "../pages/checkoutPage/checkoutHandler.js";
import { menuHandler } from "../pages/menuPage/menuHandler.js";
import { orderHandler } from "../pages/orderPage/orderHandler.js";
import { paymentHandler } from "../pages/paymentPage/paymentHandler.js";
import { api } from "../shared/js/api.js";
import { tryParse } from "../shared/js/lazyFunctions.js";
import { lsList } from "../shared/js/lists.js";
import { mockProducts } from "./mockProducts.js";
import { navigateTo } from "./pageNav.js";
export const mainHandler = {
  versionNr: "0.5.0",
  restaurantName: "China Restaurant Husnes",
  async init() {
    const response = await api.try("get-orders", { storeID: "china" });
    console.log("response", response);
    this.orders = response.data;
    adminOrdersHandler.init();

    this.reload();
  },
  async reload() {
    console.info("relaoding");
    menuHandler.init();
    await this.loadProducts();
    orderHandler.init();
    adminHandler.init();
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
    const response = await api.try("getProducts", { storeID: "china" });
    console.log(response.content.find((e) => e.id == 92));

    let allProducts = response.content;
    allProducts = allProducts.sort((a, b) => {
      const aVal = String(a.meta.itemnumber || "");
      const bVal = String(b.meta.itemnumber || "");

      const aMatch = aVal.match(/^(\d+)([a-zA-Z]?)$/);
      const bMatch = bVal.match(/^(\d+)([a-zA-Z]?)$/);

      const aNum = aMatch ? parseInt(aMatch[1]) : 0;
      const bNum = bMatch ? parseInt(bMatch[1]) : 0;

      if (aNum !== bNum) {
        return aNum - bNum;
      }

      const aSuffix = aMatch ? aMatch[2] : "";
      const bSuffix = bMatch ? bMatch[2] : "";

      return aSuffix.localeCompare(bSuffix);
    });

    this.drinks = [];
    this.foods = [];
    this.mainItems = [];
    allProducts.forEach((e) => {
      if (e.categories.find((cat) => cat.name == "drinks")) {
        this.drinks.push(e);
      } else if (e.categories.find((cat) => cat.name == "foods")) {
        this.foods.push(e);
      } else {
        this.mainItems.push(e);
      }
    });

    this.products = allProducts;

    // this.products.forEach((e) => {
    //   e.title = tryParse(e.meta["title_translations"]);
    //   e.options = tryParse(e.meta["foodoptions"]);
    //   e.description = tryParse(e.meta["description_translations"]);
    // });
  },
};

// window.addEventListener("popstate", (event) => {
//   const pageName = new URLSearchParams(location.search).get("page") || "menu";
//   navigateTo(pageName);
// });
// const pageName = new URLSearchParams(location.search).get("page") || "menu";
// navigateTo(pageName);
// mainHandler.init();
