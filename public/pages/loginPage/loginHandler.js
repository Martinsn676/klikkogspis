import { navigateTo } from "../../js/pageNav.js";
import { api } from "../../shared/js/api.js";
import { lang } from "../../shared/js/lang.js";
import { createButton, createForm } from "../../shared/js/lazyFunctions.js";
import { lsList, ssList } from "../../shared/js/lists.js";
import { modal } from "../../shared/js/modalHandler.js";
import { userMessageHandler } from "../../shared/js/userMessageHandler.js";
import { menuHandler } from "../menuPage/menuHandler.js";

export const loginHandler = {
  async open() {
    modal.restartModal("login");
    await this.build();
  },
  async build() {
    const form = createForm({
      id: "userForm",
      inputSettings: {
        inputs: [
          {
            label: lang({ no: "E-post", en: "E-mail" }),
            name: "email",
            type: "email",
            value: await ssList.get("email"),
          },
          {
            label: lang({ no: "Passord", en: "Password" }),
            type: "password",
            name: "password",
            value: await ssList.get("last_name"),
          },
        ],

        classes: "bootstrap-input",
      },
    });
    modal.body.appendChild(form);
    modal.body.appendChild(
      createButton({
        id: "forgot-password-button",
        text: lang({ no: "Glemt passord?", en: "Forgot password?" }),
        action: async () => {
          const emailInput = document.querySelector('input[name="email"]');
          if (emailInput) {
            if (emailInput.value == "" || !emailInput.value.includes("@")) {
              userMessageHandler.displayNegativeMesage(
                "Vennligst skriv eposten"
              );
            } else {
              const tokenResponse = await api.try("resetPassword", {
                username: emailInput.value,
              });
              console.log("tokenResponse", tokenResponse);
              if (tokenResponse.code) {
                userMessageHandler.displayNegativeMesage(tokenResponse.message);
              } else {
                userMessageHandler.displayMesage("Reset email sendt!");
                // modal.restartModal();

                place.innerHTML = `<h5 class="center-text">Vennligst følg linken sendt på eposten ${emailInput.value}</h5>`;
              }
            }
          }
        },
      })
    );
    modal.setFooterButtons([
      {
        name: lang({ no: "Tilbake", en: "Back" }),
        function: () => {
          modal.closeModal();
        },
        classes: "bootstrap-btn-secondary button",
      },
      {
        name: lang({ no: "Logg inn", en: "Log in" }),
        function: async () => {
          console.log("logging in");
          const email = modal.body.querySelector('input[name="email"]').value;
          const passord = modal.body.querySelector(
            'input[name="password"]'
          ).value;
          console.log("email", email);
          console.log("passord", passord);
          const response = await api.try("getToken", {
            username: email,
            password: passord,
          });
          console.log("response", response);
          if (response.content.code == "authentication_error") {
          } else if (response.statusCode == 200 && response.content.token) {
            await lsList.save("token", response.content.token);
            menuHandler.init();
            navigateTo("menu");
            modal.closeModal();
          }
        },
        classes: "bootstrap-btn-success button",
      },
    ]);
  },
};
