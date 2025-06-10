const fs = require("fs");
const https = require("https");
const FormData = require("form-data");
const { IncomingForm } = require("formidable");
const { verifyUserID } = require("../utils/general");

exports.handler = async (event) => {
  console.log("🛬 /api/uploadImage Netlify Function triggered");

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const { fields, files } = await new Promise((resolve, reject) => {
      const form = new IncomingForm({ multiples: false });

      // Netlify passes body as base64 string when binary content
      const buffer = Buffer.from(
        event.body,
        event.isBase64Encoded ? "base64" : "utf8"
      );

      form.parse(
        {
          headers: event.headers,
          method: event.httpMethod,
          url: event.rawUrl || "/",
          body: buffer,
        },
        (err, fields, files) => {
          if (err) {
            console.error("❌ Form parse error:", err);
            reject(err);
          } else {
            console.log("✅ Form parsed successfully");
            console.log("📦 Fields:", fields);
            console.log("📎 Files:", files);
            resolve({ fields, files });
          }
        }
      );
    });

    const token = fields.token;
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!token || !file) {
      throw new Error("Missing token or file");
    }

    const userID = await verifyUserID(token);
    if (!userID) throw new Error("Invalid user token");
    console.log("✅ Token verified, user ID:", userID);

    const filePath = file.filepath;
    const fileName = file.originalFilename;
    const fileType = file.mimetype;
    const fileSize = fs.statSync(filePath).size;

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

    const uploadResult = await new Promise((resolve, reject) => {
      const req = https.request(requestOptions, (wpRes) => {
        let body = "";
        wpRes.on("data", (chunk) => (body += chunk));
        wpRes.on("end", () => {
          try {
            const json = JSON.parse(body);
            if (wpRes.statusCode >= 400) {
              console.error("❌ WP Error:", json);
              return reject({
                statusCode: wpRes.statusCode,
                body: JSON.stringify(json),
              });
            }
            console.log("✅ WP upload success:", json);
            resolve({
              statusCode: 200,
              body: JSON.stringify({ statusCode: 200, content: json }),
            });
          } catch (e) {
            console.error("❌ Failed to parse WP response:", body);
            reject({
              statusCode: 500,
              body: JSON.stringify({ error: "Failed to parse response" }),
            });
          }
        });
      });

      req.on("error", (e) => {
        console.error("❌ Upload error:", e);
        reject({
          statusCode: 500,
          body: JSON.stringify({ error: "Failed to upload file" }),
        });
      });

      formData.pipe(req);
    });

    return uploadResult;
  } catch (err) {
    console.error("❌ Upload error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || "Upload failed" }),
    };
  }
};
