import { mainHandler } from "../../js/mainHandler.mjs";
import { navigateTo } from "../../js/pageNav.mjs";
import { lang } from "./../../shared/js/lang.mjs";
import { createButtons, createP } from "./../../shared/js/lazyFunctions.mjs";

export const menuHandler = {
  init() {
    this.mainContainer = document.getElementById("main-menu-page");
    this.mainContainer.innerHTML = "";
    this.mainContainer.classList = "flex-column align";
    const menuText = document.createElement("div");
    menuText.id = "menu-text";

    menuText.innerText = this.userName
      ? lang({
          no: `Logget inn som ${this.userName}`,
          en: `Logged in as ${this.userName}`,
        })
      : "";
    this.mainContainer.appendChild(menuText);

    const buttons = [
      {
        text: lang({ no: "Bestill", en: "Order" }),
        page: "ordering",
        change: this.mainContentContainer,
        classes: "bootstrap-btn-primary",
        action: changePage,
      },
      {
        text: lang({ no: "Markering", en: "Markings" }),
        page: "mark-calendar",
        change: this.mainContentContainer,
        action: changePage,
        classes: "bootstrap-btn-primary",
      },

      {
        text: lang({ no: "Instillinger", en: "Settings" }),
        page: "settings",
        change: this.mainContentContainer,
        action: changePage,
        classes: "bootstrap-btn-primary",
      },
      {
        text: mainHandler.lng == "en" ? "Norsk" : "English",

        onClick: (event) => {
          const params = new URLSearchParams(location.search);
          params.set("lng", mainHandler.lng == "en" ? "no" : "en"); // or whatever value you want to set
          const newUrl = `${location.pathname}?${params.toString()}`;
          mainHandler.lng = mainHandler.lng == "en" ? "no" : "en";
          history.pushState(null, "", newUrl); // Updates the URL without reloading the page
          mainHandler.reload(true);
          settingsHandler.build();
          mainHandler.addSideMenu();
          mainHandler.addTopMenu();
        },
        classes: "bootstrap-btn-primary",
      },
      {
        text: lang({ no: "Logg ut", en: "Log out" }),
        action: async () => {
          await lsList.clearAll();
          await ssList.clearAll();
          changePage();

          userLogin();
        },

        classes: "bootstrap-btn-danger",
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
    function changePage(data) {
      document.body.classList.remove("menuOpen");
      document.body.classList.add("menuClosed");
      if (data && data.page) {
        navigateTo(data.page);
        // data.change.dataset.page = data.page;
      }
      // setTimeout(() => {
      //   document.body.classList.remove("menuClosed");
      // }, 500);
    }
  },
};
