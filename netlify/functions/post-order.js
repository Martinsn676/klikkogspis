exports.handler = async (event) => {
  const apiKey = process.env.CONSUMER_KEY;
  const apiSecret = process.env.CONSUMER_SECRET;

  const links = {
    baseUrl: "https://kos.craftedbymartin.com",
    ordersUrl: "/wp-json/custom-orders/v1/create",
    productsUrl: "/wp-json/wc/v3/products?include=",
  };

  const { cartContent, userData, restaurant_id } = JSON.parse(event.body);
  const body = {
    restaurant_id,
    payment_intent_id: "pi_123456789",
    customer: {
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      phone: userData.phone,
    },
  };

  let productsIDS = cartContent.map((e) => e.id).join(",");
  const fillProductsUrl = links.baseUrl + links.productsUrl + productsIDS;
  let finalTotal = 0;
  const sendItems = [];

  try {
    const productsResponse = await fetch(fillProductsUrl, {
      method: "GET",
      headers: {
        Authorization:
          "Basic " + Buffer.from(apiKey + ":" + apiSecret).toString("base64"),
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    });

    let json = await productsResponse.json();
    const products = json;

    cartContent.forEach((e) => {
      const item = products.find((item) => item.id == e.id);
      finalTotal += e.count * item.regular_price;
      const meta = [];
      item.metaOptions = tryParse(
        item.meta_data.find((e) => e.key == "foodoptions")
      );

      if (item.metaOptions) {
        for (const string in e.options) {
          const optionID = string.replace("id", "");
          const details = item.metaOptions.value.find((e) => e.id == optionID);
          if (details.regular_price) {
            finalTotal += details.regular_price * e.options[string];
          }

          let value = e.options[string];
          if (details.type == "toggle") {
            value = Number(e.options[string]) === 0 ? "no" : "yes";
          }

          meta.push({
            key: "option",
            value: {
              no: details.nameNO,
              en: details.nameEN,
              value,
            },
          });
        }
      }
      sendItems.push({
        product_id: item.id,
        quantity: e.count,
        meta,
      });
    });
  } catch (err) {
    console.log("err", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Failed to fetch products` }),
    };
  }

  body.items = sendItems;

  const pickupTime = new Date();
  pickupTime.setMinutes(pickupTime.getMinutes() + 30);
  pickupTime.setHours(pickupTime.getHours() + 2);
  const readyForPickupAt = pickupTime.toISOString().slice(0, 19);
  body["ready_for_pickup_at"] = readyForPickupAt;

  try {
    const fullUrl = links.baseUrl + links.ordersUrl;
    const response = await fetch(fullUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: `Failed to post order` }),
      };
    }

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
};

function tryParse(element) {
  try {
    return JSON.parse(element);
  } catch (err) {
    return element;
  }
}
