import fs from "fs";
import https from "https";
import path from "path";
import { tmpdir } from "os";
import Busboy from "busboy";
import FormData from "form-data";
import { verifyUserID } from "../utils/general.js";

export const config = {
  bodyParser: false, // REQUIRED for Busboy to work
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
    const fields = {};
    let filePath = "";
    let fileName = "";
    let fileType = "";
    let token = "";

    await new Promise((resolve, reject) => {
      const busboy = Busboy({
        headers: event.headers,
      });

      busboy.on("field", (fieldname, val) => {
        fields[fieldname] = val;
        if (fieldname === "token") token = val;
      });

      busboy.on("file", (fieldname, file, info) => {
        const { filename, mimeType } = info;
        fileName = filename;
        fileType = mimeType;

        const tmpPath = path.join(tmpdir(), filename);
        filePath = tmpPath;
        const writeStream = fs.createWriteStream(tmpPath);
        file.pipe(writeStream);

        writeStream.on("close", () => {
          console.log("✅ File saved to:", tmpPath);
        });
      });

      busboy.on("finish", () => {
        console.log("✅ Parsing done");
        resolve();
      });

      busboy.on("error", (err) => {
        console.error("❌ Busboy error:", err);
        reject(err);
      });

      busboy.end(Buffer.from(event.body, "base64"));
    });

    if (!token || !filePath) {
      throw new Error("Missing token or file");
    }

    const userID = await verifyUserID(token);
    if (!userID) throw new Error("Invalid user token");

    const fileSize = fs.statSync(filePath).size;
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath), {
      filename: fileName,
      contentType: fileType,
      knownLength: fileSize,
    });
    console.log("token", token);
    const requestOptions = {
      method: "POST",
      host: "kos.craftedbymartin.com",
      path: "/wp-json/wp/v2/media",
      protocol: "https:",
      headers: {
        Authorization: "Bearer " + token,
        "User-Agent": "NetlifyUploader/1.0",
        ...formData.getHeaders(),
      },
    };

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
            console.error("❌ WP JSON parse error:", body);
            reject({
              statusCode: 500,
              body: JSON.stringify({ error: "Failed to parse WP response" }),
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
}
