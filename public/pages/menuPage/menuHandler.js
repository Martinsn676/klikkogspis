import { mainHandler } from "../../js/mainHandler.js";
import { navigateTo } from "../../js/pageNav.js";
import { adminHandler } from "../adminPage/adminHandler.js";
import { lang } from "../../shared/js/lang.js";
import { createButtons, createP } from "../../shared/js/lazyFunctions.js";
import { lsList } from "../../shared/js/lists.js";
import { loginHandler } from "../loginPage/loginHandler.js";
const address = "Sentrumsvegen 15, 5460 Husnes";
const openingHours = [
  [lang({ no: "Mandag", en: "Monday" })],
  [lang({ no: "Tirsdag", en: "Tuesday" })],
  [lang({ no: "Onsdag", en: "Wednesday" }), 14, 22],
  [lang({ no: "Torsdag", en: "Thursday" }), 14, 22],
  [lang({ no: "Fredag", en: "Friday" }), 14, 22],
  [lang({ no: "Lørdag", en: "Saturday" }), 14, 22],
  [lang({ no: "Søndag", en: "Sunday" }), 14, 22],
];

export const menuHandler = {
  async init() {
    console.log("===menuHandler===");
    this.mainContainer = document.getElementById("main-menu-page");
    this.mainContainer.innerHTML = "";
    this.mainContainer.classList = "flex-column align";
    const menuText = document.createElement("div");
    menuText.id = "menu-text";

    this.mainContainer.innerHTML = `
    <div>
      <img id="main-image" src="./icons/mainImage.png">
    </div>
    <div>
      <div class="text-center">${address}</div>
    </div>
        <div>
      <div class="text-center">Mandag-Tirdag: Stengt</div>
      <div class="text-center">Onsdag-Søndag: 14:00-22:00</div>
    </div>`;
    const date = new Date();
    const dayNumber = date.getDay() - 1;
    const splitValue = dayNumber == 0 ? 7 : dayNumber;
    const sortedDays = [
      ...openingHours.slice(splitValue),
      ...openingHours.slice(0, splitValue),
    ];
    const openingHoursDiv = document.createElement("div");
    sortedDays.forEach((name, opening, closing) => {
      openingHoursDiv.innerHTML += `<div>${name}</div>`;
    });
    // this.mainContainer.appendChild(openingHoursDiv);
    const buttons = [
      {
        text: lang({ no: "Se menyen", en: "See menu" }),
        icon: "./icons/restaurantMenuIcon.png",
        page: "ordering",
        change: this.mainContentContainer,
        classes: "bootstrap-btn-neutral",
        action: () => navigateTo("ordering"),
      },
      {
        text: lang({ no: "Om oss", en: "About us" }),
        icon: "./icons/infoIcon.png",
        page: "ordering",
        change: this.mainContentContainer,
        classes: "bootstrap-btn-neutral",
        action: () => console.log("Open about us"),
      },
      {
        text: lang({ no: "Finn oss", en: "Find us" }),
        icon: "./icons/mapIcon.png",
        page: "ordering",
        change: this.mainContentContainer,
        classes: "bootstrap-btn-neutral",
        action: () =>
          window.open("https://maps.app.goo.gl/mnEBGD6N2fzBMYc8A", "_new"),
      },
      {
        text: lang({ no: "Se bilder", en: "View images" }),
        icon: "./icons/photoIcon.png",
        page: "ordering",
        change: this.mainContentContainer,
        classes: "bootstrap-btn-neutral",
        action: () => console.log("Open about us"),
      },
      {
        text: lang({ no: "Ring oss", en: "Call us" }),
        icon: "./icons/callIcon.png",
        change: this.mainContentContainer,
        classes: "bootstrap-btn-neutral",

        action: () => window.open("tel:90418429", "_new"),
      },
    ];
    const publicButtons = [
      {
        text: mainHandler.lng == "en" ? "Norsk" : "English",

        onClick: (event) => {
          const params = new URLSearchParams(location.search);
          params.set("lng", mainHandler.lng == "en" ? "no" : "en"); // or whatever value you want to set
          const newUrl = `${location.pathname}?${params.toString()}`;

          mainHandler.lng = mainHandler.lng == "en" ? "no" : "en";
          history.pushState(null, "", newUrl); // Updates the URL without reloading the page

          mainHandler.refresh(true);
        },
        classes: "bootstrap-btn-neutral",
      },
      {
        text: lang({
          no: "Se andre restauranter",
          en: "See other restaurants",
        }),
        // icon: "./icons/restaurantMenuIcon.png",
        page: "restaurants",
        change: this.mainContentContainer,
        classes: "bootstrap-btn-neutral",
        action: () => navigateTo("restaurants"),
      },
    ];
    let adminButtons = [];

    const tokenFound = await lsList.get("token");
    console.log("tokenFound", tokenFound);
    if (tokenFound) {
      adminButtons.push({
        text: lang({ no: "Admin produkter", en: "Admin products" }),
        // icon: "./icons/infoIcon.png",
        page: "admin",
        change: this.mainContentContainer,
        classes: "bootstrap-btn-neutral",
        action: () => navigateTo("admin"),
      });
      adminButtons.push({
        text: lang({ no: "Admin orders", en: "Admin bestillinger" }),
        // icon: "./icons/infoIcon.png",
        page: "admin-orders",
        change: this.mainContentContainer,
        classes: "bootstrap-btn-neutral",
        action: () => navigateTo("admin-orders"),
      });
      adminButtons.push({
        text: lang({ no: "Logg ut", en: "Log out" }),
        // icon: "./icons/infoIcon.png",
        page: "menu",
        change: this.mainContentContainer,
        classes: "bootstrap-btn-neutral",
        action: async () => {
          await lsList.remove("token");
          mainHandler.refresh(true);
        },
      });
    } else {
      adminButtons.push({
        text: lang({ no: "Logg inn", en: "Log in" }),
        // icon: "./icons/infoIcon.png",
        page: "menu",
        change: this.mainContentContainer,
        classes: "bootstrap-btn-neutral",
        action: async () => {
          const token = await lsList.get("token");
          if (!token) {
            loginHandler.open();
          }
        },
      });
    }
    const orderID = new URLSearchParams(location.search).get("order");
    if (orderID) {
      buttons.splice(1, 0, {
        text: lang({ no: "Se din bestilling", en: "See your order" }),
        // icon: "./icons/infoIcon.png",
        page: "waiting",
        change: this.mainContentContainer,
        classes: "bootstrap-btn-neutral",
        action: () => {
          adminHandler.init();
          navigateTo("waiting");
        },
      });
    }
    const divider = document.createElement("div");
    divider.classList = "menu-divider";
    divider.innerText = lang({ no: "Annet", en: "Other" });
    createButtons(this.mainContainer, buttons);
    this.mainContainer.appendChild(divider);
    createButtons(this.mainContainer, publicButtons);
    const divider2 = document.createElement("div");
    divider2.classList = "menu-divider";
    divider2.innerText = tokenFound
      ? lang({
          no: "Administrasjon",
          en: "Administration",
        })
      : lang({
          no: "Resturanteier?",
          en: "Restaurant owner?",
        });
    this.mainContainer.appendChild(divider2);
    createButtons(this.mainContainer, adminButtons);
    this.mainContainer.appendChild(
      createP(
        lang({
          no: `Versjon ${mainHandler.versionNr}`,
          en: `Version ${mainHandler.versionNr}`,
        })
      )
    );
  },
};
