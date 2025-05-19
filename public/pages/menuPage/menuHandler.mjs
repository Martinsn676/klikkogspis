import { mainHandler } from "../../js/mainHandler.mjs";
import { navigateTo } from "../../js/pageNav.mjs";
import { lang } from "./../../shared/js/lang.mjs";
import { createButtons, createP } from "./../../shared/js/lazyFunctions.mjs";
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
  init() {
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
    </div>

    `;
    const date = new Date();
    const dayNumber = date.getDay() - 1;
    console.log(dayNumber);
    const splitValue = dayNumber == 0 ? 7 : dayNumber;
    const sortedDays = [
      ...openingHours.slice(splitValue),
      ...openingHours.slice(0, splitValue),
    ];
    console.log(sortedDays);
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
      {
        text: mainHandler.lng == "en" ? "Norsk" : "English",

        onClick: (event) => {
          const params = new URLSearchParams(location.search);
          params.set("lng", mainHandler.lng == "en" ? "no" : "en"); // or whatever value you want to set
          const newUrl = `${location.pathname}?${params.toString()}`;

          mainHandler.lng = mainHandler.lng == "en" ? "no" : "en";
          console.log("mainHandler.lng ", mainHandler.lng);
          history.pushState(null, "", newUrl); // Updates the URL without reloading the page

          mainHandler.reload(true);
        },
        classes: "bootstrap-btn-neutral",
      },
    ];

    createButtons(this.mainContainer, buttons);

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
