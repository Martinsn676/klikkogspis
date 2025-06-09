import fetch from "node-fetch";

import {
  authHeaders,
  makeCopy,
  tryParse,
  verifyUserID,
} from "../utils/general";

export async function handler(event) {
  const baseUrl = "https://kos.craftedbymartin.com";
  const productsUrl =
    "/wp-json/wc/v3/custom-products?per_page=100&restaurant_owner=";
  const { storeID, token } = JSON.parse(event.body);
  const userID = await verifyUserID(token);
  const fullUrl = baseUrl + productsUrl + storeID;
  try {
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: authHeaders,
    });

    json = await response.json();

    const returnJson = [];
    json.forEach((element) => {
      const object = element;

      if (object.status == "publish" || userID) {
        returnJson.push(object);
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: 200,
        ok: true,
        content: returnJson,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Internal Server Error: ${err}` }),
    };
  }
}
