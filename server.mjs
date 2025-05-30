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
  const { storeName } = req.body;
  console.log("storeName", storeName);
  const fullUrl = baseUrl + productsUrl;
  console.log(apiKey + "   " + apiSecret);
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
    const keepThese = ["images", "name", "description", "regular_price", "id"];
    const keepTheseMeta = [
      "title_translations",
      "description_translations",
      "allergies",
      "foodoptions",
      "fixeditem",
      "itemNumber",
    ];
    json = await response.json();
    const rawJson = makeCopy(json);
    const returnJson = [];
    json.forEach((element) => {
      const object = { meta: {} };

      keepThese.forEach((i) => (object[i] = element[i]));
      const meta = {};
      element.meta_data.forEach(({ key, value }) => (meta[key] = value));
      keepTheseMeta.forEach((i) => (object.meta[i] = tryParse(meta[i])));
      returnJson.push(object);
    });

    res.status(200).json({
      status: 200,
      ok: true,
      content: returnJson,
      raw: rawJson,
    });
  } catch (err) {
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
app.listen(PORT, () => {
  console.log(`Local server is running on port ${PORT}`);
});
