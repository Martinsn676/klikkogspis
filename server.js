import express from "express";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3002;

const apiKey = process.env.CONSUMER_KEY;
const apiSecret = process.env.CONSUMER_SECRET;
const postalKey = process.env.POSTAL_KYE;

// Middleware to enable CORS
// Middleware to enable CORS
app.use((req, res, next) => {
  const allowedOrigins = [
    "http://127.0.0.1:5502",
    "http://127.0.0.1:5500",
    "http://localhost:3000",
  ];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Set Content Security Policy header
  const csp =
    "default-src 'self'; script-src 'self' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; script-src-elem 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net; img-src 'self' https://store.craftedbymartin.com; connect-src 'self' http://localhost:3000;";
  res.setHeader("Content-Security-Policy", csp);

  next();
});
app.use(express.json());
// Endpoint to make the API call to WooCommerce
app.post("/api/getProducts", async (req, res) => {
  const baseUrl = "https://kos.craftedbymartin.com";
  const productsUrl = "/wp-json/wc/v3/products?per_page=100";
  const { storeID } = req.body;

  const fullUrl = baseUrl + productsUrl + "&restaurant_owner=" + storeID;

  try {
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        Authorization:
          "Basic " + Buffer.from(apiKey + ":" + apiSecret).toString("base64"),
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    });
    let json;
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
    json = await response.json();
    const rawJson = makeCopy(json);
    const returnJson = [];
    json.forEach((element) => {
      const object = { meta_data: [], meta: {} };

      keepThese.forEach((i) => (object[i] = element[i]));
      const meta = {};
      // element.meta_data.forEach(({ key, value,id }) => (meta[key] = value));
      keepTheseMeta.forEach((i) => {
        const meta = element.meta_data.find((meta) => {
          return meta.key == i;
        });
        if (meta) {
          meta.value = tryParse(meta.value);
          object.meta_data.push(meta);
          object.meta[meta.key] = meta.value;
        }
      });
      returnJson.push(object);
    });

    res.status(200).json({
      status: 200,
      ok: true,
      content: returnJson,
      raw: rawJson,
    });
  } catch (err) {
    console.log("err", err);
    res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});
function tryParse(element) {
  try {
    const parsedElement = JSON.parse(element);
    return parsedElement;
  } catch (err) {
    return element;
  }
}
function makeCopy(array) {
  try {
    return JSON.parse(JSON.stringify(array));
  } catch (err) {
    return array;
  }
}
app.post("/api/make-change", async (req, res) => {
  const links = {
    baseUrl: "https://kos.craftedbymartin.com",
    productsUrl: "/wp-json/wc/v3/products",
    categoriesUrl: "/wp-json/wc/v3/products/categories",
    ordersUrl: "/wp-json/wc/v3/orders",
  };
  let apiUrl;
  const { body, action } = req.body;

  // Parse exportBody back to JSON object
  try {
    // Determine the base URL for the WooCommerce API based on the provided endUrl
    // if (!password || password != "AbvaE344rfv") {
    //   throw new Error("You are not allowed to do this");
    // }

    const fullUrl = body.id
      ? links.baseUrl + links.productsUrl + "/" + body.id
      : links.baseUrl + links.productsUrl;
    // Fetch data from the WooCommerce API
    const response = await fetch(fullUrl, {
      method: action,
      headers: {
        Authorization:
          "Basic " + Buffer.from(apiKey + ":" + apiSecret).toString("base64"),
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
      body: JSON.stringify(body),
    });

    const responseData = await response.json(); // Parse the JSON data
    res.status(200).json({
      type: "basic",
      url: fullUrl,
      redirected: false,
      status: 200,
      ok: true,
      data: responseData, // Return the parsed JSON data
    });
  } catch (error) {
    console.log(error);
    console.log("error", error.message);
    // Return error in JSON format with a 500 status code
    res.status(500).json({ error: `Failed to upload!` });
  }
});
app.post("/api/get-orders", async (req, res) => {
  const links = {
    baseUrl: "https://kos.craftedbymartin.com",
    ordersUrl: "/wp-json/custom-orders/v1/restaurant",
  };

  const { restaurant_id = 33 } = req.body;

  // Parse exportBody back to JSON object
  try {
    // Determine the base URL for the WooCommerce API based on the provided endUrl
    // if (!password || password != "AbvaE344rfv") {
    //   throw new Error("You are not allowed to do this");
    // }

    const fullUrl = links.baseUrl + links.ordersUrl + "/" + restaurant_id;
    // Fetch data from the WooCommerce API
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        // Authorization:
        //   "Basic " + Buffer.from(apiKey + ":" + apiSecret).toString("base64"),
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    });
    if (!response.ok) {
      console.log("response", response);
    }
    const responseData = await response.json(); // Parse the JSON data
    res.status(200).json({
      type: "basic",
      url: fullUrl,
      redirected: false,
      status: 200,
      ok: true,
      data: responseData, // Return the parsed JSON data
    });
  } catch (error) {
    console.log(error);
    console.log("error", error.message);
    // Return error in JSON format with a 500 status code
    res.status(500).json({ error: `Failed to get orders!` });
  }
});
app.post("/api/public-get-order", async (req, res) => {
  const links = {
    baseUrl: "https://kos.craftedbymartin.com",
    ordersUrl: "/wp-json/custom-orders/v1/track?token=",
  };

  const { tracking_token } = req.body;

  if (!tracking_token) {
    res.status(500).json({ error: `Missing token` });
  }
  // Parse exportBody back to JSON object
  try {
    // Determine the base URL for the WooCommerce API based on the provided endUrl
    // if (!password || password != "AbvaE344rfv") {
    //   throw new Error("You are not allowed to do this");
    // }

    const fullUrl = links.baseUrl + links.ordersUrl + tracking_token;
    // Fetch data from the WooCommerce API
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        // Authorization:
        //   "Basic " + Buffer.from(apiKey + ":" + apiSecret).toString("base64"),
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    });
    if (!response.ok) {
      console.log("response", response);
    }
    const responseData = await response.json(); // Parse the JSON data
    res.status(200).json({
      type: "basic",
      url: fullUrl,
      redirected: false,
      status: 200,
      ok: true,
      data: responseData, // Return the parsed JSON data
    });
  } catch (error) {
    console.log(error);
    console.log("error", error.message);
    // Return error in JSON format with a 500 status code
    res.status(500).json({ error: `Failed to get orders!` });
  }
});
app.post("/api/post-order", async (req, res) => {
  const links = {
    baseUrl: "https://kos.craftedbymartin.com",
    ordersUrl: "/wp-json/custom-orders/v1/create",
    productsUrl: "/wp-json/wc/v3/products?include=",
  };

  const { cartContent, userData, restaurant_id } = req.body;

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

  let productsIDS = "";
  cartContent.forEach((e, index) => {
    if (index == 0) {
      productsIDS += e.id;
    } else {
      productsIDS += "," + e.id;
    }
  });
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

    cartContent.forEach((e, index) => {
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
            if (Number(e.options[string]) == 0) {
              value = "no";
            } else {
              value = "yes";
            }
          }
          console.log("details.type", details.type, value);
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
  }

  body.items = sendItems;
  const pickupTime = new Date();

  // Add 30 minutes
  pickupTime.setMinutes(pickupTime.getMinutes() + 30);

  // Offset for Norway (UTC+2 in summer)
  pickupTime.setHours(pickupTime.getHours() + 2);

  // Format as "YYYY-MM-DDTHH:mm:ss"
  const readyForPickupAt = pickupTime.toISOString().slice(0, 19);
  body["ready_for_pickup_at"] = readyForPickupAt;

  try {
    // Determine the base URL for the WooCommerce API based on the provided endUrl
    // if (!password || password != "AbvaE344rfv") {
    //   throw new Error("You are not allowed to do this");
    // }

    const fullUrl = links.baseUrl + links.ordersUrl;
    // Fetch data from the WooCommerce API

    const response = await fetch(fullUrl, {
      method: "POST",
      headers: {
        // Authorization:
        //   "Basic " + Buffer.from(apiKey + ":" + apiSecret).toString("base64"),
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      console.log("response", response);
    }
    const responseData = await response.json(); // Parse the JSON data
    res.status(200).json({
      type: "basic",
      url: fullUrl,
      redirected: false,
      status: 200,
      ok: true,
      data: responseData, // Return the parsed JSON data
      sendItems,
    });
  } catch (error) {
    console.log("error", error.message);
    // Return error in JSON format with a 500 status code
    res.status(500).json({ error: `Failed to upload!` });
  }
});

app.listen(PORT, () => {
  console.log(`Local server is running on port ${PORT}`);
});
