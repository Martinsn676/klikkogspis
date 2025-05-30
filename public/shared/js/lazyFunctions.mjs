import { helpBlock } from "./helpBlock.mjs";
import { lang } from "./lang.mjs";

export function editStringFormat(string, settings) {
  if (typeof string != "string") {
    string = JSON.stringify(string);
  }
  let split = string.split("");
  split.reverse();
  for (const place in settings) {
    if (split.length > place) {
      split.splice(place, 0, settings[place]);
    }
  }
  return split.reverse().join("");
}

/**
 * Adds a 0 if needed and makes it a string
 * @param {number string} value
 * @returns
 */
export function fixDate(value) {
  if (typeof value == "number") {
    if (value > 9) {
      return JSON.stringify(value);
    } else {
      return `0${JSON.stringify(value)}`;
    }
  }

  if (typeof value == "string") {
    if (value.length > 1) {
      return value;
    } else {
      return `0${value}`;
    }
  }
}
/**
 * Send the event, it will replace the value if its the first
 * @param {event} event
 */
export function capitalizeFirstLetter(event) {
  let string = event.target.value;
  if (event.target.value.length == 1) {
    string = string.charAt(0).toUpperCase() + string.slice(1);
    event.target.value = string;
  }
}
/**
 * Makes clicks more userfirendly with margin of drag
 * @param {node} object What the click targets
 * @param {function} effect Effect of click
 * @param {number} margin Margin for error, standard is 50
 */
export function tonjeFriendlyClick(object, effect, margin = 50) {
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTarget = null;
  let isTap = false; // Track if it's a valid tap
  const TAP_THRESHOLD = margin; // Maximum movement allowed for a tap

  // Handle touch start
  object.addEventListener(
    "touchstart",
    (event) => {
      const touch = event.touches[0]; // Get first touch point
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartTarget = event.target;
      isTap = true; // Assume it's a tap initially
    },
    { passive: true }
  );

  // Handle touch move (detect dragging)
  object.addEventListener(
    "touchmove",
    (event) => {
      const touch = event.touches[0];
      const deltaX = Math.abs(touch.clientX - touchStartX);
      const deltaY = Math.abs(touch.clientY - touchStartY);

      // If movement exceeds threshold, cancel tap action
      if (deltaX > TAP_THRESHOLD || deltaY > TAP_THRESHOLD) {
        isTap = false; // User moved too much → not a tap
      }
    },
    { passive: true }
  );

  // Handle touch end (only trigger if it’s a valid tap)
  object.addEventListener(
    "touchend",
    (event) => {
      if (isTap && touchStartTarget === event.target) {
        // Small delay to prevent accidental clicks
        effect();
      }
    },
    { passive: true }
  );
  object.addEventListener("click", (event) => {
    effect();
  });
}

/**
 * Make a copy of the array that won't change the original array
 * @param {array} array
 * @returns
 */
export function makeCopy(array) {
  try {
    return JSON.parse(JSON.stringify(array));
  } catch (err) {
    return array;
  }
}
/**
 * Make rgb into hex
 * @param {rgb} rgbString
 * @returns
 */
export function rgbToHex(rgbString) {
  const rgbMatch = rgbString.match(/\d+/g);
  if (!rgbMatch || rgbMatch.length < 3) return "#000000"; // fallback

  const [r, g, b] = rgbMatch.map(Number);
  return (
    "#" + [r, g, b].map((val) => val.toString(16).padStart(2, "0")).join("")
  );
}
export function createForm({
  id,
  classes,
  inputSettings,
  button,
  action,
  secondaryAlternative,
}) {
  const form = document.createElement("form");
  form.id = id;
  form.classList = classes;

  inputSettings.place = form;
  createManyInputs(inputSettings);

  const buttonDiv = document.createElement("button");
  buttonDiv.innerText = button.text;
  buttonDiv.classList = button.classes;
  buttonDiv.type = "submit";
  if (secondaryAlternative) {
    const secondaryButtonDiv = document.createElement("div");
    secondaryButtonDiv.innerText = secondaryAlternative.text;
    secondaryButtonDiv.classList = secondaryAlternative.classes;
    secondaryButtonDiv.addEventListener("click", () =>
      secondaryAlternative.action()
    );
    form.appendChild(secondaryButtonDiv);
  }
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    action(form);
  });

  form.appendChild(buttonDiv);

  return form;
}

export function createButton(data) {
  const {
    id,
    text,
    classes,
    page,
    scrollTop,
    onClick,
    action,
    action2,
    action3,
    icon,
  } = data;

  const button = document.createElement("button");
  button.classList = "button bootstrap-btn flex-column align ";
  if (classes) button.classList += classes;
  if (icon) {
    button.classList.add("custom-button-text");
    button.innerHTML = `<div class="flex-row align">${text}<img src="${icon}" class="icon"></div>`;
  } else {
    button.innerHTML = text || "Click";
  }

  if (text)
    button.id = id || text?.toLowerCase().replace(/\s+/g, "-") + "-button";
  if (onClick) {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      onClick(event);
    });
  }
  if (action) {
    button.addEventListener("click", (event) => {
      event.preventDefault();

      if (action) action(data);
      if (action2) action2(data);
      if (action3) action3(data);
    });
  }

  return button;
}
export function createButtons(place, buttons) {
  buttons.forEach((button) => place.appendChild(createButton(button)));
}
/**
 * Try to parse object, or returns the original
 * @param {object} element
 * @returns
 */
export function tryParse(element) {
  try {
    const parsedElement = JSON.parse(element);
    return parsedElement;
  } catch (err) {
    return element;
  }
}
/**
 * Custom create input
 * @param {number/string} id
 * @param {string} classes class for input
 * @param {string} name
 * @param {string} type
 * @param {string} value
 * @param {string} placeHolder
 * @param {string} label
 * @param {string} divClass class for formDIV
 * @param {array} suggestions
 * @param {function} onChange effect on change ()=>function?
 * @returns
 */
export function createInput(options) {
  let {
    id = "",
    classes = "",
    name = "",
    type = "",
    value = "",
    placeHolder = "",
    label = "",
    divClass = "",
    suggestions = "",
    onChange = "",
    disabled = false,
    helpText = "",
    only = "",
    checked = "",
    reverseOrder = "",
    onKeyUp = "",
    valueChange = "",
    autoComplete = "",
    settings = {},
    enter = "",
    minLength = "",
    button = "",
    onLabelClick = "",
  } = options;
  const formDiv = document.createElement("div");
  let valid = true;
  if (helpText) {
    formDiv.appendChild(helpBlock.add(helpText));
  }
  if (divClass) formDiv.classList = divClass;
  formDiv.classList.add("formDiv");
  const labelDiv = document.createElement("label");
  if (label) {
    labelDiv.innerText = label;
    if (label && id) {
      labelDiv.setAttribute("for", id);
    }
  }

  let input = suggestions
    ? document.createElement("select")
    : document.createElement("input");
  if (type == "textarea") {
    input = document.createElement("textarea");
    type = "";
  }
  if (id) input.id = id;
  if (classes) input.classList = classes;
  if (name) input.name = name;

  if (valueChange) input.dataset.valueChange = valueChange;
  for (const setting in settings) {
    input[setting] = settings[setting];
  }
  if (type == "smart-textarea") {
    makeInputExpandable(input, options);
    type = "textarea";
  }
  if (type) input.type = type;
  if (autoComplete) input.autocomplete = autoComplete;
  if (disabled) input.disabled = true;
  if (checked == "true" || checked == true || checked == "on") {
    input.checked = checked;
  }

  //Check if select
  if (value) input.value = value;
  if (placeHolder) input.placeholder = placeHolder;

  if (Array.isArray(suggestions)) {
    suggestions.forEach((suggestion, index) => {
      let optionValue;
      let optionName;
      if (Array.isArray(suggestion)) {
        optionValue = suggestion[0];
        optionName = suggestion[1];
      } else {
        optionValue = suggestion;
        optionName = suggestion;
      }
      if (optionName || index == 0) {
        input.innerHTML += `<option ${
          suggestion == value ? "selected" : ""
        } value="${optionValue}">${optionName}</option>`;
      }
    });
  }
  if (only) {
    input.addEventListener("keypress", (event) => {
      // if (only == "text") {
      //   allowOnlyLetters(event);
      // }
      if (only == "number") {
        allowOnlyNumbers(event);
      }
      if (only == "normal") {
        allowOnlyLettersAndNumbers(event);
      }
    });
  }
  if (onChange) {
    input.addEventListener("change", (event) => {
      onChange(event);
    });
  }
  if (onLabelClick && labelDiv) {
    labelDiv.addEventListener("click", (event) => {
      onLabelClick(event);
    });
    labelDiv.classList.add("clickable");
  }
  let buttonDiv;
  if (button) {
    buttonDiv = createButton(button);
  }
  if (minLength && input.value.length < minLength) {
    valid = false;
    buttonDiv.classList.add("disabled");
  }
  if (onKeyUp || minLength) {
    input.addEventListener("keyup", (event) => {
      valid = true;
      if (minLength) {
        if (input.value.length >= minLength) {
          displayMessage("");
          buttonDiv.classList.remove("disabled");
        } else {
          // displayMessage(
          //   lang({
          //     no: `Minimum ${minLength} tegn`,
          //     en: `Minimum ${minLength} signs`,
          //   }),
          //   "light-danger"
          // );
          valid = false;
          buttonDiv.classList.add("disabled");
        }
      }
      if (onKeyUp) onKeyUp(event);
      input.dataset.valid = valid;
    });
  }
  if (enter) {
    input.addEventListener("keyup", (event) => {
      if (event.key == "Enter") {
        enter();
      }
    });
  }
  const messageDiv = document.createElement("div");
  function displayMessage(message, status) {
    messageDiv.innerText = message;
    messageDiv.classList = status;
  }
  if (reverseOrder) {
    formDiv.appendChild(input);

    if (label) formDiv.appendChild(labelDiv);
  } else {
    if (label) formDiv.appendChild(labelDiv);

    formDiv.appendChild(input);
    formDiv.appendChild(messageDiv);
  }
  input.dataset.valid = valid;
  if (buttonDiv) formDiv.appendChild(buttonDiv);
  return formDiv;
}
/**
 * Make the input to be type=input nromally and textare when in focus
 * @param {data} original
 */
function makeInputExpandable(original) {
  const handleFocus = (inputElement) => {
    const textarea = document.createElement("textarea");
    textarea.className = inputElement.className;
    textarea.classList.add("expand-y");

    for (const key in inputElement.dataset) {
      textarea.dataset[key] = inputElement.dataset[key];
    }

    textarea.name = inputElement.name;
    textarea.value = inputElement.value;
    textarea.rows = 3;
    textarea.id = inputElement.id;

    inputElement.replaceWith(textarea);
    textarea.focus();

    textarea.addEventListener("blur", () => {
      const newInput = document.createElement("input");
      newInput.type = "text";
      newInput.className = textarea.className;
      textarea.classList.remove("expand-y");
      for (const key in textarea.dataset) {
        newInput.dataset[key] = textarea.dataset[key];
      }

      newInput.name = textarea.name;
      newInput.value = textarea.value;
      newInput.id = textarea.id;

      textarea.replaceWith(newInput);
      // Reapply the same behavior for next focus
      makeInputExpandable(newInput);
    });
  };

  original.addEventListener("focus", () => handleFocus(original), {
    once: true,
  });
}

export function createManyInputs(settings) {
  settings.inputs.forEach((input) => {
    for (const settingName in settings) {
      if (
        !input[settingName] &&
        (settingName !== "inputs" || settingName !== "place")
      ) {
        input[settingName] = settings[settingName];
      }
    }

    settings.place.appendChild(createInput(input));
  });
}
/**
 * Returns p nodw with the text
 * @param {string} text
 * @returns
 */
export function createP(text) {
  const p = document.createElement("p");
  p.classList = "center-text";
  p.innerText = text;
  return p;
}
/**
 * Get all inputs, checkboxes, textarea and .custom-input instead of the simple version
 * @param {form} place
 * @returns
 */
export function getFormData(place) {
  const formData = new FormData();
  place.querySelectorAll("input, select, textarea").forEach((input) => {
    if (input.type === "checkbox") {
      // For checkboxes, store "true" if checked, otherwise "false"
      formData.append(input.name, input.checked ? "true" : "false");
    } else {
      // Append all other input types (including readonly & disabled)

      formData.append(input.name, input.value);
    }
  });
  place.querySelectorAll(".custom-input").forEach((input) => {
    if (input.dataset.name) {
      formData.append(input.dataset.name, input.innerHTML);
    } else {
      console.warn("Missing database.name", console.trace());
    }
  });

  const orderData = {};
  formData.forEach((value, key) => {
    orderData[key] = value;
  });

  return orderData;
}

function allowOnlyLetters(event) {
  const char = event.key;
  if (
    !/^[a-zA-ZæøåÆØÅ]$/.test(char) &&
    char !== " " &&
    char !== "Tab" &&
    char !== "Enter"
  ) {
    event.preventDefault();
  }
}

// Allow only numbers + space, tab, enter
function allowOnlyNumbers(event) {
  const char = event.key;
  if (
    !/^[0-9]$/.test(char) &&
    char !== " " &&
    char !== "Tab" &&
    char !== "Enter"
  ) {
    event.preventDefault();
  }
}

// Allow only letters, numbers + space, tab, enter
function allowOnlyLettersAndNumbers(event) {
  const char = event.key;
  if (
    !/^[a-zA-Z0-9æøåÆØÅ]$/.test(char) &&
    char !== " " &&
    char !== "Tab" &&
    char !== "Enter"
  ) {
    event.preventDefault();
  }
}

export const calc = {
  /**
   * Adds together numbers no matter if they are string or not
   * @param {string/number} val1
   * @param {string/number} val2
   * @param {string/number} val3
   * @returns
   */
  add(val1, val2, val3) {
    let number = 0;
    if (val1) number += Number(val1);
    if (val2) number += Number(val2);
    if (val3) number += Number(val3);
    return number;
  },
};
/**
 * Makes the text turn into an input on click and focus
 * @param {inputData} data
 * @returns
 */
export function clickInput(data) {
  const orgName = data.value;

  const container = document.createElement("div");
  container.classList.add("clickable");
  const titleText = document.createElement("h4");
  titleText.innerText = orgName;
  const titleInput = document.createElement("input");

  let newName = orgName;
  container.appendChild(titleText);
  container.addEventListener("click", () => {
    titleText.innerHTML = "";
    titleInput.value = newName;
    titleText.classList.add("center-text");
    titleText.appendChild(titleInput);
    titleInput.focus();
    titleInput.addEventListener("focusout", () => {
      newName = titleInput.value;
      container.innerHTML = "";
      titleText.innerText = newName;
      container.appendChild(titleText);
      data.onChange(newName);
    });
  });
  return container;
}
/**
 * Builds the family if not present
 * @param {object} base start object
 * @param {string} steps string of the next step
 * @param {any} value end value for final step
 */
export function tryFamily(base, steps, value) {
  let currentObject = base;
  const lastIndex = steps.length - 1;

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (i === lastIndex) {
      currentObject[step] = value;
    } else {
      currentObject = currentObject[step] ||= {};
    }
  }
}
/**
 * Add fake load bar at top
 * @param {number} sec Amount of secunds for load
 */
export function showLoadBar(sec) {
  document.documentElement.style.setProperty("--app-loadTime", sec * 1.2 + "s");
  const bar = document.createElement("div");
  bar.id = "load-bar";
  document.body.appendChild(bar);
  setTimeout(() => bar.remove(), sec * 1200); // optional cleanup
}

export function numberAdjuster({
  place,
  minusAction,
  plussAction,
  startValue = 0,
  maxValue,
  endAction,
}) {
  place.classList.add("custom-adder-container");
  const div = document.createElement("div");
  div.classList = "custom-adder flex-row align";

  const minusButton = document.createElement("button");
  minusButton.classList = "minus-button button bootstrap-btn flex-column align";
  minusButton.innerText = "-";
  minusButton.addEventListener("click", () => {
    const oldValue = Number(display.innerText);
    if (oldValue > 0) {
      display.innerText = oldValue - 1;
      generalClick();
      minusAction();
      if (endAction) endAction();
    }
  });
  div.appendChild(minusButton);
  const display = document.createElement("div");
  display.classList = "option-count";
  display.innerText = startValue;
  div.appendChild(display);
  const plussButton = document.createElement("button");
  plussButton.classList = "button bootstrap-btn flex-column align";
  plussButton.innerText = "+";
  plussButton.addEventListener("click", () => {
    const oldValue = Number(display.innerText);
    if (!maxValue || oldValue < maxValue) {
      display.innerText = oldValue + 1;
      generalClick();
      plussAction();
      if (endAction) endAction();
    }
  });
  div.appendChild(plussButton);
  generalClick();
  place.appendChild(div);
  function generalClick() {
    minusButton.classList.remove("capped");
    plussButton.classList.remove("capped");
    const newValue = Number(display.innerText);
    if (newValue == 0) {
      minusButton.classList.add("capped");
    } else if (maxValue && newValue == maxValue) {
      plussButton.classList.add("capped");
    }
  }
}
export function toggleAdjuster({
  place,
  noAction,
  yesAction,
  startValue,

  endAction,
}) {
  const div = document.createElement("div");
  place.classList.add("custom-toggler-container");
  div.classList = "custom-toggler flex-row align";

  const noButton = document.createElement("button");
  noButton.classList = "no-button button bootstrap-btn flex-column align";
  noButton.innerText = lang({ no: "Nei", en: "No" });
  noButton.addEventListener("click", () => {
    noAction();
    if (endAction) endAction();
    div.dataset.selected = "no";
  });
  div.appendChild(noButton);

  const yesButton = document.createElement("button");
  yesButton.classList = "yes-button button bootstrap-btn flex-column align";
  yesButton.innerText = lang({ no: "Ja", en: "Yes" });
  yesButton.addEventListener("click", () => {
    yesAction();
    if (endAction) endAction();
    div.dataset.selected = "yes";
  });
  div.appendChild(yesButton);
  div.dataset.selected = startValue;
  place.appendChild(div);
}
