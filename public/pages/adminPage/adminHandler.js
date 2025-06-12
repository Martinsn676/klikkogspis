import { mainHandler } from "../../js/mainHandler.js";
import { navigateTo } from "../../js/pageNav.js";
import { universal } from "../../js/variables.js";
import { api } from "../../shared/js/api.js";
import { lang } from "../../shared/js/lang.js";
import {
  createInput,
  createManyInputs,
  makeCopy,
} from "../../shared/js/lazyFunctions.js";
import { lsList } from "../../shared/js/lists.js";
import { template } from "../templates/itemCards.js";
import { exportHandler } from "./exportHandler.js";

export const adminHandler = {
  init() {
    this.topBar = document.getElementById("admin-top-bar");
    this.mainContainer = document.getElementById("admin-items-container");
    this.bottomBar = document.getElementById("admin-bottom-bar");
    this.topBar.innerHTML = "";
    const backButton = document.createElement("button");
    backButton.innerText = "Back";

    backButton.id = "test-back-button";
    backButton.addEventListener("click", () => navigateTo("menu"));
    this.topBar.appendChild(backButton);
    this.build();
  },

  build() {
    this.mainContainer.innerHTML = "";
    this.itemsContainer = document.createElement("div");
    this.itemsContainer.id = "items-container";
    const types = [
      [universal.catNormalID, lang({ no: "Vanlig", en: "Normal" })],
      [universal.catDrinksID, lang({ no: "Drikke", en: "Drink" })],
      [universal.catFoodsID, lang({ no: "Tilbehør", en: "Extras" })],
    ];
    const statuses = [
      ["publish", lang({ no: "Aktiv", en: "Active" })],
      ["draft", lang({ no: "Utilgjengelig", en: "Unavailable" })],
      ["private", lang({ no: "Skjult", en: "Hidden" })],
    ];
    const neededMetas = {
      allergies: {},
      description_translations: { no: "", en: "" },
      fixeditem: false,
      foodoptions: [],
      title_translations: { no: "", en: "" },
      itemnumber: "",
    };
    let testIDS;
    // testIDS = [201, 92, 155];
    function updatePreview(place, item) {
      place.innerText = `${
        item.meta.itemnumber ? `Nr ${item.meta.itemnumber} ` : ""
      }${item.meta.title_translations.no || item.name}${
        item.regular_price ? `, ${item.regular_price} kr` : ""
      }`;
    }

    const filterSelect = document.createElement("select");
    filterSelect.classList = "bootstrap-select";
    filterSelect.id = "filter-select";
    const filterOptions = [
      ["", lang({ no: "Alle", en: "All" })],
      [universal.catNormalID, lang({ no: "Menyer", en: "Menus" })],
      [universal.catDrinksID, lang({ no: "Drikker", en: "Drinks" })],
      [universal.catFoodsID, lang({ no: "Tilbehør", en: "Accessories" })],
    ];
    filterSelect.innerHTML = filterOptions
      .map(([value, label]) => `<option value="${value}">${label}</option>`)
      .join("");
    filterSelect.addEventListener("change", (e) => {
      this.itemsContainer.dataset.filtertype = e.target.value;
    });
    this.itemsContainer.appendChild(filterSelect);

    mainHandler.products.forEach((item) =>
      adminHandler.itemsContainer.appendChild(createAdminItem(item))
    );
    function createAdminItem(item, startOpen) {
      const orgItem = makeCopy(item);

      if (!testIDS || testIDS.find((e) => e == item.id)) {
        for (const value in neededMetas) {
          if (!item.meta[value]) item.meta[value] = neededMetas[value];
        }
        if (testIDS) {
          console.info(item);
        }
        const imageContainer = document.createElement("div");
        imageContainer.classList = "image-container only-normal";
        const productImage = document.createElement("img");

        productImage.src =
          item.images && item.images[0]
            ? item.images[0]
            : "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";

        const itemDiv = document.createElement("form");
        const title = document.createElement("div");
        title.classList = "title";
        const icons = document.createElement("div");
        icons.classList = "icon-div flex-row align";
        icons.innerHTML = `
<img class="hidden-icon" src="./icons/hidden.svg" alt="Hidden icon" />
<img class="unavailable-icon" src="./icons/unavailable.svg" alt="Unavailable icon" />
<img class="save-icon" src="./icons/save.svg" alt="Save icon" />
`;
        itemDiv.appendChild(icons);
        const submitButton = document.createElement("button");

        submitButton.classList =
          "submit-button bootstrap-btn button bootstrap-btn-success left-button";
        submitButton.innerText = lang({ no: "Lagre", en: "Save" });
        updatePreview(title, item);

        itemDiv.appendChild(title);

        const container = document.createElement("div");
        container.classList = "container hidden-container";
        title.addEventListener("click", () => {
          container.classList.toggle("hidden-container");
          if (!container.classList.contains("hidden-container")) {
            const yOffset = -40; // Negative means scroll a bit *above* the element
            const y =
              itemDiv.getBoundingClientRect().top +
              window.pageYOffset +
              yOffset;

            window.scrollTo({
              top: y,
              behavior: "smooth",
            });
          }
        });
        if (startOpen) {
          container.classList.remove("hidden-container");
        }
        const standardInputs = document.createElement("div");

        const fileInput = document.createElement("div");
        fileInput.classList = "formDiv only-normal";
        fileInput.innerHTML = `
        <label name="imageUrl">${lang({ no: "Bilde", en: "Image" })}</label>
        <input name="imageUrl" type="file" accept="image/*" capture="environment">
`;
        standardInputs.appendChild(fileInput);
        createManyInputs({
          place: standardInputs,
          classes: "bootstrap-input",
          inputs: [
            {
              label: lang({
                no: "Navn NO",
                en: "Name NO",
              }),
              value: item.meta.title_translations.no || "",
              name: "meta-title_translations-no",
            },
            {
              label: lang({
                no: "Navn EN",
                en: "Name EN",
              }),
              value: item.meta.title_translations.en,
              name: "meta-title_translations-en",
            },
            {
              label: lang({
                no: "Beskrivelse NO",
                en: "Description NO",
              }),
              value:
                item.meta.description_translations.no ||
                (item.description && item.description.innerText) ||
                "",
              name: "meta-description_translations-no",
              divClass: "only-normal",
              textarea: true,
              type: "textarea",
            },
            {
              label: lang({
                no: "Beskrivelse EN",
                en: "Description EN",
              }),
              value: item.meta.description_translations.en,
              name: "meta-description_translations-en",
              divClass: "only-normal",
              textarea: true,
              type: "textarea",
            },

            {
              label: lang({ no: "Pris", en: "Price" }),
              value: item.regular_price || 0,
              name: "regular_price",

              inputClasses: "bootstrap-input-number",
              only: "number",
            },
            {
              label: lang({ no: "Nummer", en: "Number" }),
              value: item.meta.itemnumber,
              name: "meta-itemnumber",
              divClass: "only-normal",
            },
            {
              label: lang({ no: "Antall på lager", en: "Amount in stock" }),
              value:
                !item.stock_quantity || item.stock_quantity == "null"
                  ? ""
                  : item.stock_quantity,
              name: "stock_quantity",
              placeHolder: "Ubegrenset",
              inputClasses: "bootstrap-input-number",
              only: "number",
            },
          ],
        });

        fileInput.addEventListener("change", async (event) => {
          const file = event.target.files[0];
          if (!file) return;

          const token = await lsList.get("token");

          const formData = new FormData();
          formData.append("file", file);
          formData.append("name", file.name); // Optional
          formData.append("token", token);
          adminHandler.saving = true;
          // const response = await api.try("upload-image", { formData });
          const response = await fetch("/.netlify/functions/upload-image", {
            method: "POST",
            body: formData, // ← This sets content-type to multipart/form-data automatically
          });
          const result = await response.json();
          adminHandler.saving = false;
          console.log("response", result);

          productImage.src = result.content.source_url;
          item.images = [{ id: result.content.id }];
        });
        // <div class="formDiv only-normal">
        //   <label name="imageUrl">${lang({ no: "Bilde", en: "Image" })}</label>
        //   <input name="imageUrl" type="file" accept="image/*" capture="environment">
        // </div>`;
        if (item.meta.foodoptions) {
          const alternativesContainer = document.createElement("div");
          alternativesContainer.classList =
            "alternatives-container only-normal-inside";
          alternativesContainer.innerHTML = `<div class="option-title">${lang({
            no: "Alternativer",
            en: "Alternatives",
          })}`;
          item.meta.foodoptions.forEach((e, index) => {
            e.id = index;
            const inputField = document.createElement("div");
            inputField.innerHTML = createOptionHTML(e, item.id);
            alternativesContainer.appendChild(inputField);
          });

          standardInputs.appendChild(alternativesContainer);
          const addOption = document.createElement("button");
          addOption.classList =
            "bootstrap-btn button bootstrap-btn-primary right-button only-normal";
          addOption.innerText = lang({
            no: "Legg til alternativ",
            en: "Add an alternative",
          });
          addOption.addEventListener("click", (event) => {
            event.preventDefault();
            const newObject = {
              id: item.meta.foodoptions.length,
              type: "number",
            };
            item.meta.foodoptions.push(newObject);
            const inputField = document.createElement("div");
            inputField.innerHTML = createOptionHTML(newObject, item.id);
            alternativesContainer.appendChild(inputField);
          });
          standardInputs.appendChild(addOption);
        }

        let startCategory;
        const typeSelector = document.createElement("select");
        typeSelector.classList = "bootstrap-select";
        typeSelector.name = "category";
        types.forEach(([value, name]) => {
          const selected = item.categories
            ? item.categories.find((e) => e.id == value)
              ? "selected"
              : ""
            : false;
          if (selected) {
            itemDiv.dataset.typeView = value;
            itemDiv.dataset.type = value;
            startCategory = value;
          }
          typeSelector.innerHTML += `<option ${selected} value="${value}">${name}</option>`;
        });
        if (!startCategory) {
          itemDiv.dataset.typeView = universal.catNormalID;
          itemDiv.dataset.type = universal.catNormalID;
        }
        typeSelector.addEventListener("change", (event) => {
          itemDiv.dataset.typeView = event.target.value;

          if (!event.target.value == "normal") {
            item.meta.fixed = "true";
          }
        });
        container.appendChild(typeSelector);

        imageContainer.appendChild(productImage);

        const statusSelector = document.createElement("select");
        statusSelector.classList = "bootstrap-select mt-2";
        statusSelector.name = "status";
        statuses.forEach(([value, name]) => {
          const selected = item.status == value ? "selected" : "";
          if (selected) {
            itemDiv.dataset.status = value;
            startCategory = value;
          }
          statusSelector.innerHTML += `<option ${selected} value="${value}">${name}</option>`;
        });

        statusSelector.addEventListener("change", (event) => {
          itemDiv.dataset.status = event.target.value;
          item.status = event.target.value;
        });
        container.appendChild(statusSelector);
        container.appendChild(imageContainer);
        container.appendChild(standardInputs);

        container.appendChild(submitButton);
        itemDiv.appendChild(container);

        const itemLength = makeCopy(JSON.stringify(item));
        itemDiv.addEventListener("keyup", (event) => handleChange(event));
        itemDiv.addEventListener("change", (event) => handleChange(event));
        itemDiv.addEventListener("submit", async (event) => {
          event.preventDefault();
          if (!adminHandler.saving) {
            adminHandler.saving = true;

            const activeFoodOptions = [];
            const inactiveFoodOptions = [];
            item.meta.foodoptions.forEach((e) => {
              if (e.type == "delete") {
                inactiveFoodOptions.push(e);
              } else {
                activeFoodOptions.push(e);
              }
            });

            item.meta.foodoptions = activeFoodOptions;

            const response = await exportHandler(event, item, orgItem, "PUT");
            if (response.ok) {
              itemDiv.dataset.type = itemDiv.dataset.typeView;
              // this.itemsContainer.dataset.filtertype = e.filtertype;
              inactiveFoodOptions.forEach((e) =>
                document
                  .getElementById(`${item.id}-option-${e.id}`)
                  .classList.add("d-none")
              );
              itemDiv.dataset.editing = "no";
            }
            adminHandler.saving = false;
          }
        });
        function handleChange(event) {
          const splitData = event.target.name.split("-");

          const value = event.target.value
            ? event.target.value
            : event.target.innerText;
          if (splitData[0] == "meta") {
            if (splitData[2]) {
              item.meta[splitData[1]][splitData[2]] = value;
            } else {
              item.meta[splitData[1]] = value;
            }
          } else if (splitData[0] == "option") {
            const itemFound = item.meta.foodoptions.find(
              (e) => e.id == splitData[1]
            );

            if (itemFound) {
              const splitValue = value.split("-");
              if (splitValue[0] == "toggle") {
                itemFound["toggle"] = splitValue[1];
                itemFound["type"] = "toggle";
              } else {
                itemFound[splitData[2]] = value;
              }
            }
          } else if (splitData[0] == "category") {
            item.categories = [{ id: Number(value) }];
          } else if (splitData[0] == "stock_quantity") {
            if (value == "") {
            }
          } else {
            item[splitData[0]] = value;
          }

          const newItemLength = makeCopy(JSON.stringify(item));

          if (newItemLength.length == itemLength.length) {
            itemDiv.dataset.editing = "no";
          } else {
            itemDiv.dataset.editing = "yes";
          }
          itemDiv.dataset.editing = "yes";
          updatePreview(title, item);
        }
        return itemDiv;
      }
    }
    const addNewItemButton = document.createElement("button");
    addNewItemButton.classList = "bootstrap-btn bootstrap-btn-primary button";
    addNewItemButton.innerText = lang({
      no: "Legg til nytt produkt",
      en: "Add new product",
    });
    addNewItemButton.addEventListener("click", () => {
      const newForm = createAdminItem(
        {
          meta: { title_translations: {} },
          meta_data: [],
          restaurant_owner: mainHandler.restaurant_id,
          categories: [{ id: this.itemsContainer.dataset.filtertype || 19 }],
          name: lang({ no: "Nytt produkt", en: "New product" }),
        },
        true
      );
      newForm.dataset.editing = "yes";
      adminHandler.itemsContainer.appendChild(newForm);
    });

    this.mainContainer.appendChild(this.itemsContainer);
    this.mainContainer.appendChild(addNewItemButton);
  },
};

function createOptionHTML(e, itemID) {
  let optionsHTML = "";
  const typeOptions = [
    ["delete", lang({ no: "Fjern", en: "Delete" })],
    ["number", lang({ no: "Antall", en: "Amount" })],
    ["toggle-yes", lang({ no: "Ja/Nei", en: "Yes/No" })],
    ["toggle-no", lang({ no: "Nei/Ja", en: "No/Yes" })],
  ];
  typeOptions.forEach(([value, name]) => {
    let selected =
      e.type == value || `${e.type}-${e.toggle}` == value ? "selected" : "";
    optionsHTML += `<option ${selected} value="${value}">${name}</option>`;
  });
  e.regular_price = e.regular_price || 0;
  return `
        <div id="${itemID}-option-${
    e.id
  }" class="flex-row align option-container">
<div class="flex-column w-6 m-1">
          <div class="formDiv w-12">
              <label name="option-${e.id}-nameNO">${lang({
    no: "Navn NO",
    en: "Name NO",
  })}</label>
              <input class="bootstrap-input" name="option-${
                e.id
              }-nameNO" value="${e.nameNO || ""}">
          </div>
          <div class="formDiv w-12">
              <label name="option-${e.id}-nameEN">${lang({
    no: "Navn EN",
    en: "Name EN",
  })}</label>
              <input class="bootstrap-input" name="option-${
                e.id
              }-nameEN" value="${e.nameEN || ""}">
          </div>
</div>
<div class="flex-column w-6 m-1">
          <div class="formDiv w-12">
              <label name="option-${e.id}-regular_price">${lang({
    no: "Pris",
    en: "Price",
  })}</label>
              <input class="bootstrap-input" name="option-${
                e.id
              }-regular_price" value="${e.regular_price || 0}">
          </div>
          <div class="formDiv w-12">
              <label name="option-${e.id}-type">Type</label>
              <select name="option-${e.id}-type" class="bootstrap-select">
${optionsHTML}
              </select>
          </div></div>
        </div>
          `;
}
