import { mainHandler } from "../../js/mainHandler.js";
import { api } from "../../shared/js/api.js";
import { getFormData, makeCopy } from "../../shared/js/lazyFunctions.js";

export async function exportHandler(event, item, orgItem, action) {
  event.preventDefault();
  console.log("orgItem", orgItem);
  console.log("item", item);
  const data = getFormData(event.target);
  console.warn(data["product-type"]);
  console.log("data", data);
  console.log(makeCopy(item.meta_data));
  if (!item.meta_data) item.meta_data = [];
  for (const key in item.meta) {
    console.log("item.meta_data", item.meta_data);
    const foundMeta = item.meta_data.find((meta) => {
      console.log(meta.key == key);
      return meta.key == key;
    });
    if (foundMeta) {
      foundMeta.value = item.meta[key];
    } else if ((item.meta[key] != "") & (item.meta[key].length != 0)) {
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
  if (item.images && typeof item.images[0] == "string") {
    delete item.images;
  }

  const response = await api.try("make-change", {
    body: item,
    action,
    restaurant_id: mainHandler.restaurant_id,
  });
  console.log("response", response);
  console.log("json", await response.json);
  return response;
}
