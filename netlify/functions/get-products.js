import fetch from "node-fetch";
import { authHeaders, makeCopy, tryParse } from "./utils/common.js";

export async function handler(event) {
  const baseUrl = "https://kos.craftedbymartin.com";
  const productsUrl = "/wp-json/wc/v3/products?per_page=100";
  const { storeID } = JSON.parse(event.body || "{}");
  const fullUrl = baseUrl + productsUrl + "&restaurant_owner=" + storeID;

  try {
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: authHeaders,
    });

    const json = await response.json();
    const rawJson = makeCopy(json);

    const keepThese = [
      "images",
      "name",
      "description",
      "regular_price",
      "id",
      "categories",
      "stock_quantity",
      "status",
    ];
    const keepTheseMeta = [
      "title_translations",
      "description_translations",
      "allergies",
      "foodoptions",
      "fixeditem",
      "itemnumber",
    ];

    const returnJson = json.map((element) => {
      const object = { meta_data: [], meta: {} };
      keepThese.forEach((key) => (object[key] = element[key]));

      keepTheseMeta.forEach((metaKey) => {
        const meta = element.meta_data.find((m) => m.key === metaKey);
        if (meta) {
          meta.value = tryParse(meta.value);
          object.meta_data.push(meta);
          object.meta[meta.key] = meta.value;
        }
      });

      return object;
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: 200,
        ok: true,
        content: returnJson,
        raw: rawJson,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Internal Server Error: ${err}` }),
    };
  }
}
