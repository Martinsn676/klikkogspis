import { modal } from "./modalHandler.js";

export const helpBlock = {
  add(message) {
    const helpBlockDiv = document.createElement("div");
    helpBlockDiv.classList.add("help-block");
    const helpBlockTextDiv = document.createElement("div");
    const lng = new URLSearchParams(location.search).get("lng");

    if (!message.no || !message.en) {
      console.warn("Missing a language in", message, console.trace());
      return helpBlockDiv;
    }
    let lngMessage = message[lng];
    if (lngMessage) {
      if (lngMessage.toLowerCase().includes("instillingene")) {
        lngMessage = lngMessage.replace("instillingene", `instillingene=>`);
        helpBlockDiv.classList.add("clickable");
        helpBlockDiv.addEventListener("click", () => {
          modal.closeModal();
          document.body.classList.remove("menuOpen");
          document.body.classList.add("menuClosed");
          document.getElementById("main-content").dataset.page = "settings";
          window.scrollTo({ top: 0, behavior: "smooth" });
          setTimeout(() => {
            document.body.classList.remove("menuClosed");
          }, 500);
        });
      }
      if (lngMessage.toLowerCase().includes("settings")) {
        lngMessage = lngMessage.replace("settings", `settings=>`);

        helpBlockDiv.addEventListener("click", () => {
          modal.closeModal();
          document.body.classList.remove("menuOpen");
          document.body.classList.add("menuClosed");
          document.getElementById("main-content").dataset.page = "settings";
          window.scrollTo({ top: 0, behavior: "smooth" });
          setTimeout(() => {
            document.body.classList.remove("menuClosed");
          }, 500);
        });
      }
      helpBlockTextDiv.innerText = lngMessage;
      helpBlockTextDiv.classList.add("help-block-message");

      helpBlockDiv.appendChild(helpBlockTextDiv);
      return helpBlockDiv;
    } else {
      console.warn("Missing language");
      return helpBlockDiv;
    }
  },
};
