import { makeCopy, tryParse, verifyUserID } from "../utils/general.js";
exports.handler = async (event) => {
  let response;
  const baseUrl = "https://kos.craftedbymartin.com";
  const productsUrl =
    "/wp-json/wc/v3/custom-products?per_page=100&restaurant_owner=";
  const apiKey = process.env.CONSUMER_KEY;
  const apiSecret = process.env.CONSUMER_SECRET;
  const userID = await verifyUserID(token);
  try {
    // Parse request body

    // Validate required fields
    if (!storeID) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          status: 400,
          ok: false,
          message: "Missing required fields: storeID",
        }),
      };
    }

    // const userID = await verifyUserID(token);
    // if (!userID) {
    //   return {
    //     statusCode: 401,
    //     body: JSON.stringify({
    //       status: 401,
    //       ok: false,
    //       message: "Token not valid",
    //     }),
    //   };
    // }
    const fullUrl = baseUrl + productsUrl + storeID;

    response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        Authorization:
          "Basic " + Buffer.from(apiKey + ":" + apiSecret).toString("base64"),
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    });

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
    let json;
    // const keepThese = [
    //   "images",
    //   "name",
    //   "description",
    //   "regular_price",
    //   "id",
    //   "categories",
    //   "stock_quantity",
    //   "status",
    // ];
    // const keepTheseMeta = [
    //   "title_translations",
    //   "description_translations",
    //   "allergies",
    //   "foodoptions",
    //   "fixeditem",
    //   "itemnumber",
    // ];
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
