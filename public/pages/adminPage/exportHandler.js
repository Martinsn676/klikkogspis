import { api } from "../../shared/js/api.js";
import { getFormData } from "../../shared/js/lazyFunctions.js";

export async function exportHandler(event, item, orgItem, action) {
  event.preventDefault();
  console.log("orgItem", orgItem);
  console.log("item", item);
  const data = getFormData(event.target);
  console.warn(data["product-type"]);
  console.log("data", data);
  if (!item.meta_data) item.meta_data = [];
  for (const key in item.meta) {
    console.log("item.meta_data", item.meta_data);
    const foundMeta = item.meta_data.find((meta) => {
      console.log(meta.id == key);
      return meta.id == key;
    });
    if (foundMeta) {
      foundMeta.value = item.meta[key];
    } else {
      item.meta_data.push({ key, value: item.meta[key] });
    }
  }
  console.log("item", item);
  if (!item.id) {
    action = "POST";
  }
  item.name = item.meta.title_translations.no;
  item.description = item.meta.description_translations.no;
  console.log("item", item);

  const response = await api.try("make-change", { body: item, action });
  console.log("response", response);
  console.log("json", await response.json);
  return response;
}
