import { lang } from "./lang.mjs";
import { createButton, createForm } from "./lazyFunctions.mjs";

export const modal = {
  init() {
    this.mainContainer = document.getElementById("modal-container");
    this.mainContainer.innerHTML = `       <div id="modal-background"></div>   
        <div id="modal">
          
            <div id="modal-content">
            <div id="modal-top-row"></div>
            <div id="modal-header"></div>
            <div id="modal-body"></div>
            <div id="modal-footer"></div>
          </div>
        </div>`;

    this.header = document.getElementById("modal-header");
    this.body = document.getElementById("modal-body");
    this.content = document.getElementById("modal-content");
    this.footer = document.getElementById("modal-footer");
    this.topRow = document.getElementById("modal-top-row");
    this.backGround = document.getElementById("modal-background");
    this.reopenButton = document.createElement("div");
    this.backGround.addEventListener("click", () => {
      this.reopenButton.classList.remove("d-none");
      this.closeModal();
    });
    this.reopenButton.id = "reopenButton";
    this.reopenButton.classList =
      "d-none button bootstrap-btn bootstrap-btn-primary";
    this.reopenButton.innerText = lang({ no: "Åpne igjen", en: "Open again" });
    document.body.appendChild(this.reopenButton);
    this.reopenButton.addEventListener("click", () => {
      document.body.classList.add("showing-modal");
      this.reopenButton.classList.add("d-none");
    });
  },

  closeModal() {
    document.body.classList.remove("showing-modal");
    console.log("close modal");
  },
  restartModal() {
    console.log("restart modal");
    this.header.innerHTML = "";
    this.content.classList.remove("no-header");
    this.body.innerHTML = "";
    this.footer.innerHTML = "";
    this.topRow.innerHTML = "";
    this.selectedDayContainer = false;
    this.reopenButton.classList.add("d-none");
    document.body.classList.add("showing-modal");
    this.topRow.appendChild(
      createButton({
        id: "help-button-modal",
        text: "?",
        classes: "button bootstrap-btn-secondary left-side",
        action: () => {
          if (document.body.classList.contains("showHelp")) {
            document.body.classList.remove("showHelp");
          } else {
            document.body.classList.add("showHelp");
          }
        },
      })
    );
    // const appHeight = window.innerHeight + "px";
    // document.documentElement.style.setProperty("--app-height", appHeight);
    // window.scrollTo({
    //   top: 0,
    //   behavior: "instant",
    // });
  },

  setFooterButtons(buttons) {
    this.footer.innerHTML = "";
    const footer = document.createElement("div");
    footer.id = "modal-footer-buttons";
    buttons.forEach((data) => {
      const button = document.createElement("div");
      if (data.id) {
        button.id = data.id;
      }

      button.classList = `button ${data.classes}`;
      if (!data.disabled) {
        button.addEventListener("click", () => data.function());
      }
      button.innerHTML = `<div>${data.name}</div>`;

      footer.appendChild(button);
    });
    this.footer.appendChild(footer);
  },
};
