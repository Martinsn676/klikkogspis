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
  versionNr: "0.6.0",
  restaurantName: "China Restaurant Husnes",
  async init() {
    checkOutHandler.content = (await lsList.get("cart")) || [];
    if (!Array.isArray(checkOutHandler.content)) {
      checkOutHandler.content = [];
      await lsList.save("cart", []);
    }
    checkOutHandler.content = checkOutHandler.content.filter(
      (cartItem) => cartItem.count !== 0 || cartItem.fixed
    );
    menuHandler.init();

    await this.loadProducts();
    paymentHandler.init();
    checkOutHandler.init();
    orderHandler.init();
    const token = await lsList.get("token");
    if (token) {
      adminHandler.init();
      adminOrdersHandler.orders = await adminOrdersHandler.getOrders();
      adminOrdersHandler.init();
    }
  },
  async initAll() {
    console.warn("not in use");
  },
  async refresh(full) {
    await lsList.save("cart", checkOutHandler.content);
    checkOutHandler.content = checkOutHandler.content.filter(
      (cartItem) => cartItem.count > 0 || cartItem.fixed
    );

    if (full) {
      menuHandler.init();
      orderHandler.init();
      checkOutHandler.init();
      paymentHandler.init();
      const token = await lsList.get("token");
      if (token) {
        adminHandler.init();
        adminOrdersHandler.init();
      }
    }
    orderHandler.updateCount();
    checkOutHandler.updateTotal();
    // checkOutHandler.build();
    paymentHandler.build();
  },
  async loadProducts() {
    console.log("mainHandler.restaurantID", mainHandler.restaurant_id);
    const response = await api.try("get-products", {
      storeID: mainHandler.restaurant_id,
      token: [await lsList.get("token")],
    });
    console.log(response.content.find((e) => e.id == 92));

    let allProducts = response.content;

    allProducts = allProducts.sort((a, b) => {
      const aVal = String(a.meta.itemnumber || "");
      const bVal = String(b.meta.itemnumber || "");

      const aMatch = aVal.match(/^(\d+)([a-zA-Z]?)$/);
      const bMatch = bVal.match(/^(\d+)([a.sort-zA-Z]?)$/);

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
      if (!e.meta.description_translations) {
        e.meta.description_translations = {};
      }
      if (!e.meta.title_translations) {
        e.meta.title_translations = {};
      }
      if (!e.meta.foodoptions) {
        e.meta.foodoptions = [];
      }
      if (!e.meta.title_translations) {
        e.meta.title_translations = {};
      }
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
