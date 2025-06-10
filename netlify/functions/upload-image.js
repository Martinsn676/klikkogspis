import { IncomingForm } from "formidable";
import fs from "fs";
import https from "https";
import FormData from "form-data";
import { verifyUserID } from "../utils/general.js";

// Prevent Netlify from parsing body
export const config = {
  bodyParser: false,
};

export async function handler(event) {
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
      form.uploadDir = "/tmp"; // Required for Netlify
      form.keepExtensions = true;

      form.parse(event, (err, fields, files) => {
        if (err) {
          console.error("❌ Form parse error:", err);
          return reject(err);
        }
        console.log("✅ Form parsed successfully");
        console.log("📦 Fields:", fields);
        console.log("📎 Files:", files);
        resolve({ fields, files });
      });
    });

    const token = fields.token;
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!token || !file) throw new Error("Missing token or file");

    const userID = await verifyUserID(token);
    if (!userID) throw new Error("Invalid user token");
    console.log("✅ Token verified for user ID:", userID);

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

    console.log("📤 Uploading to WordPress...");

    const uploadResult = await new Promise((resolve, reject) => {
      const req = https.request(
        {
          hostname: "kos.craftedbymartin.com",
          path: "/wp-json/wp/v2/media",
          method: "POST",
          headers: {
            Authorization: "Bearer " + token,
            ...formData.getHeaders(),
          },
        },
        (wpRes) => {
          let body = "";
          wpRes.on("data", (chunk) => (body += chunk));
          wpRes.on("end", () => {
            try {
              const json = JSON.parse(body);
              if (wpRes.statusCode >= 400) {
                console.error("❌ WP error:", json);
                return reject({
                  statusCode: wpRes.statusCode,
                  body: JSON.stringify(json),
                });
              }
              console.log("✅ Upload success:", json);
              resolve({
                statusCode: 200,
                body: JSON.stringify(json),
              });
            } catch (e) {
              console.error("❌ Failed to parse WP response:", body);
              reject({
                statusCode: 500,
                body: JSON.stringify({ error: "Invalid JSON from WordPress" }),
              });
            }
          });
        }
      );

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
    console.error("❌ Upload handler error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || "Upload failed" }),
    };
  }
}
