import { accessAllowed } from "../utils/access";
import { verifyUserID } from "../utils/general";

exports.handler = async (event) => {
  const apiKey = process.env.CONSUMER_KEY;
  const apiSecret = process.env.CONSUMER_SECRET;
  const links = {
    baseUrl: "https://kos.craftedbymartin.com",
    ordersUrl: "/wp-json/wc/v3/orders/",
  };

  try {
    // Parse request body
    const { restaurant_id, token, orderID, body } = JSON.parse(event.body);

    // Validate required fields
    if ((!restaurant_id, !token, !orderID, !body)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          status: 400,
          ok: false,
          message:
            "Missing required fields: restaurant_id, token, orderID, body",
        }),
      };
    }

    const userID = await verifyUserID(token);
    if (!userID) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          status: 401,
          ok: false,
          message: "Token not valid",
        }),
      };
    }
    if (!accessAllowed(userID, restaurant_id)) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          status: 401,
          ok: false,
          message: "Token not valid",
        }),
      };
    }
    const fullUrl = links.baseUrl + links.ordersUrl + orderID;
    const response = await fetch(fullUrl, {
      method: "PUT",
      headers: {
        Authorization:
          "Basic " + Buffer.from(apiKey + ":" + apiSecret).toString("base64"),
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      console.log("response", response);
    }
    // Check if response is OK
    if (!response.ok) {
      const errorDetails = await response.json();
      throw {
        statusCode: response.status,
        message: "Failed to fetch tracking data",
        details: errorDetails,
      };
    }
    if (response.status === 403) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          status: 403,
          ok: false,
          message: "Access forbidden",
        }),
      };
    }
    const responseData = await response.json(); // Parse the JSON data
    return {
      statusCode: 200,
      body: JSON.stringify({
        type: "basic",
        url: fullUrl,
        redirected: false,
        status: 200,
        ok: true,
        data: responseData, // Return the parsed JSON data
      }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({
        error: error.message || "Internal Server Error",

        statusCode: error.statusCode,
      }),
    };
  }
};
