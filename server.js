import express from "express";
import dotenv from "dotenv";
import formidable from "formidable";
import fs from "fs";
import FormData from "form-data";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3002;

const apiKey = process.env.CONSUMER_KEY;
const apiSecret = process.env.CONSUMER_SECRET;
const postalKey = process.env.POSTAL_KYE;
const baseUrl = "https://kos.craftedbymartin.com";
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
  const productsUrl =
    "/wp-json/wc/v3/custom-products?per_page=100&restaurant_owner=";
  const { storeID, token } = req.body;
  const userID = await verifyUserID(token);
  const fullUrl = baseUrl + productsUrl + storeID;
  console.log("fullUrl", fullUrl);
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
      if (object.status == "publish" || userID) {
        returnJson.push(object);
      }
    });

    res.status(200).json({
      status: 200,
      ok: true,
      content: json,
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
      ? baseUrl + links.productsUrl + "/" + body.id
      : baseUrl + links.productsUrl;

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

  const { restaurant_id, token } = req.body;
  console.log("token========", token);
  const userID = await verifyUserID(token);
  console.log("userID", userID);
  const access = { id2: [33] };
  let allowed = false;
  console.log("access[userID", access["id" + userID]);
  if (access["id" + userID]) {
    if (
      access["id" + userID].find((e) => {
        console.log(e, restaurant_id);
        return e == restaurant_id;
      })
    ) {
      console.log("===allowed");
      allowed = true;
    }
  }
  console.log("allowed", allowed);
  if (!allowed) {
    res.status(403).json({ error: `Not allowed!` });
    return;
  }
  // Parse exportBody back to JSON object
  try {
    // Determine the base URL for the WooCommerce API based on the provided endUrl
    // if (!password || password != "AbvaE344rfv") {
    //   throw new Error("You are not allowed to do this");
    // }

    const fullUrl = baseUrl + links.ordersUrl + "/" + restaurant_id;
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

    const fullUrl = baseUrl + links.ordersUrl + tracking_token;
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
  const fillProductsUrl = baseUrl + links.productsUrl + productsIDS;
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

    const fullUrl = baseUrl + links.ordersUrl;
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
app.post("/api/getToken", async (req, res) => {
  console.log("getToken================");
  const { username, password } = req.body;
  const getTokenUrl = baseUrl + `/wp-json/custom-jwt-auth/v1/token`;
  let tokenResponse;

  try {
    tokenResponse = await fetch(getTokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
  } catch (error) {
    console.warn(error);
  } finally {
  }

  if (tokenResponse.status == 429) {
    res.status(429).json({
      statusCode: 429,
      content: { message: "For mange forsøk, vent noen sekunder" },
    });
    return;
  }
  if (tokenResponse.status == 503) {
    res.status(503).json({
      statusCode: 503,
      content: {
        message: "For mange forsøk, prøv igjen senere",
      },
    });
    return;
  }
  let json;
  try {
    json = await tokenResponse.json();
  } catch (err) {
    console.log("err", err);
    json = err;
  }
  res.status(200).json({
    statusCode: 200,
    content: json,
    message: tokenResponse,
  });
});

app.post("/api/upload-image", async (req, res) => {
  console.log("🛬 /api/uploadImage POST endpoint triggered");

  try {
    const { fields, files } = await new Promise((resolve, reject) => {
      const form = formidable({ multiples: false });

      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error("❌ Form parse error:", err);
          reject(err);
        } else {
          console.log("✅ Form parsed successfully");
          console.log("📦 Fields:", fields);
          console.log("📎 Files:", files);
          resolve({ fields, files });
        }
      });
    });

    const token = fields.token;
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!token || !file) {
      throw new Error("Missing token or file");
    }

    console.log("🔐 Verifying token...");
    const userID = await verifyUserID(token);
    if (!userID) throw new Error("Invalid user token");
    console.log("✅ Token verified, user ID:", userID);

    const filePath = file.filepath;
    const fileName = file.originalFilename;
    const fileType = file.mimetype;
    const fileSize = fs.statSync(filePath).size;

    console.log("🧵 Preparing file stream for:", fileName);
    console.log("📁 file path:", filePath);
    console.log("📎 mimetype:", fileType);
    console.log("📏 file size:", fileSize);

    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath), {
      filename: fileName,
      contentType: fileType,
      knownLength: fileSize,
    });

    const requestOptions = {
      method: "POST",
      host: "kos.craftedbymartin.com",
      path: "/wp-json/wp/v2/media",
      protocol: "https:",
      headers: {
        Authorization: "Bearer " + token,
        ...formData.getHeaders(),
      },
    };

    console.log("📤 Uploading file to WordPress...");
    formData.submit(requestOptions, (err, wpRes) => {
      if (err) {
        console.error("❌ Upload error:", err);
        return res.status(500).json({ error: "Failed to upload file" });
      }

      let body = "";
      wpRes.on("data", (chunk) => (body += chunk));
      wpRes.on("end", () => {
        try {
          const json = JSON.parse(body);
          if (wpRes.statusCode >= 400) {
            console.error("❌ WP Error:", json);
            return res.status(wpRes.statusCode).json(json);
          }
          console.log("✅ WP upload success:", json);
          res.status(200).json({ statusCode: 200, content: json });
        } catch (e) {
          console.error("❌ Failed to parse WP response:", body);
          res.status(500).json({ error: "Failed to parse response" });
        }
      });
    });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ error: err.message || "Upload failed" });
  }
});

async function verifyUserID(token) {
  if (!token) {
    return false;
  }
  const validateUrl = baseUrl + `/wp-json/custom-jwt-auth/v1/validate`;

  let tokenResponse;
  try {
    tokenResponse = await fetch(validateUrl, {
      method: "POST",
      headers: {
        // Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });
  } catch (error) {
    console.warn(error);
  } finally {
  }

  if (!token || tokenResponse.status == 403) {
    return false;
  } else {
    const parts =
      typeof token == "string" ? token.split(".") : token[0].split(".");
    if (parts.length !== 3) {
      throw new Error("Token structure incorrect");
    }
    try {
      const payloadBase64 = parts[1];
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);
      const userID = payload.data.user.id;

      return userID;
    } catch (err) {
      return false;
    }
  }
}
app.listen(PORT, () => {
  console.log(`Local server is running on port ${PORT}`);
});
