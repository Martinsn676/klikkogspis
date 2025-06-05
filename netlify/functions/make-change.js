import fetch from "node-fetch";
import { authHeaders } from "./utils/common.js";

export async function handler(event) {
  const links = {
    baseUrl: "https://kos.craftedbymartin.com",
    productsUrl: "/wp-json/wc/v3/products",
  };

  try {
    const { body, action } = JSON.parse(event.body || "{}");

    const fullUrl = body.id
      ? `${links.baseUrl}${links.productsUrl}/${body.id}`
      : `${links.baseUrl}${links.productsUrl}`;

    const response = await fetch(fullUrl, {
      method: action,
      headers: authHeaders,
      body: JSON.stringify(body),
    });

    const responseData = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        type: "basic",
        url: fullUrl,
        redirected: false,
        status: 200,
        ok: true,
        data: responseData,
      }),
    };
  } catch (error) {
    console.error("make-change error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to upload!" }),
    };
  }
}
