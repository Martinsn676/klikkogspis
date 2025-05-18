import { mainHandler } from "../../js/mainHandler.mjs";
import { navigateTo } from "../../js/pageNav.mjs";
import { lang } from "./../../shared/js/lang.mjs";
import { createButtons, createP } from "./../../shared/js/lazyFunctions.mjs";
const address = "Sentrumsvegen 15, 5460 Husnes";
export const menuHandler = {
  init() {
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
    `;
    const buttons = [
      {
        text: lang({ no: "Se menyen", en: "See menu" }),
        icon: "./icons/restaurantMenuIcon.png",
        page: "ordering",
        change: this.mainContentContainer,
        classes: "",
        action: () => navigateTo("ordering"),
      },
      {
        text: lang({ no: "Om oss", en: "About us" }),
        icon: "./icons/infoIcon.png",
        page: "ordering",
        change: this.mainContentContainer,
        classes: "",
        action: () => console.log("Open about us"),
      },
      {
        text: lang({ no: "Finn oss", en: "Find us" }),
        icon: "./icons/mapIcon.png",
        page: "ordering",
        change: this.mainContentContainer,
        classes: "",
        action: () =>
          window.open("https://maps.app.goo.gl/mnEBGD6N2fzBMYc8A", "_new"),
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
