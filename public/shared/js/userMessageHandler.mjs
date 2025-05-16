import { makeCopy } from "./lazyFunctions.mjs";

export const userMessageHandler = {
  timerBeforeNextMessage: 2000,
  init() {
    this.messages = [];
    setInterval(() => {
      if (this.messages.length > 0) {
        if (!this.messages[0][2]) {
          this.displayFromArray();
        }
        setTimeout(() => {
          this.messages.splice(0, 1);
        }, this.timerBeforeNextMessage);
      }
    }, this.timerBeforeNextMessage);
  },
  displayFromArray() {
    const arrayMessage = this.messages[0];

    if (arrayMessage) {
      if (arrayMessage[1]) {
        arrayMessage[0](arrayMessage[1]);
      }

      this.messages[0][2] = true;
    }
  },
  removeAllMessages(upTo = 0) {
    const deleteNumber = this.messages.length - upTo;

    if (deleteNumber > 0) {
      this.messages.splice(0, deleteNumber);
    }
  },
  addMessageToArray(array) {
    let startNow;
    const lastOldMessage = this.messages[this.messages.length - 1];

    if (this.messages.length == 0) {
      startNow = true;
    } else if (this.messages[this.messages.length - 1]) {
    }
    if (lastOldMessage && lastOldMessage[1] == array[1]) {
    } else {
      this.messages.push(array);
    }

    if (startNow) {
      this.displayFromArray();
    }
  },
  displayError(error) {
    this.addMessageToArray([renderError, error.message]);
  },

  displayMesage(message) {
    this.addMessageToArray([renderMessage, message]);
  },

  displayNegativeMesage(message) {
    this.addMessageToArray([renderNegativeMesage, message]);
  },
};
function renderError(message) {
  const errorMessage = document.createElement("div");
  errorMessage.classList = "message-container";
  errorMessage.innerHTML = `
    <div class="error-message flex-column align">${message}</div>`;
  document.body.appendChild(errorMessage);
  setTimeout(() => {
    errorMessage.classList.add("d-none");
  }, 5000);
}
function renderMessage(message) {
  const errorMessage = document.createElement("div");
  errorMessage.classList = "message-container";
  errorMessage.innerHTML = `
    <div class="success-message flex-column align">${message}</div>
`;
  document.body.appendChild(errorMessage);
  setTimeout(() => {
    errorMessage.classList.add("d-none");
  }, 5000);
}
function renderNegativeMesage(message) {
  const errorMessage = document.createElement("div");
  errorMessage.classList = "message-container";
  errorMessage.innerHTML = `
    <div class="error-message flex-column align">${message}</div>
`;
  document.body.appendChild(errorMessage);
  setTimeout(() => {
    errorMessage.classList.add("d-none");
  }, 5000);
}
