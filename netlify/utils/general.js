export const apiKey = process.env.CONSUMER_KEY;
export const apiSecret = process.env.CONSUMER_SECRET;
const baseUrl = "https://kos.craftedbymartin.com";
export const authHeaders = {
  Authorization:
    "Basic " + Buffer.from(apiKey + ":" + apiSecret).toString("base64"),
  "Content-Type": "application/json",
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
};

export function tryParse(element) {
  try {
    return JSON.parse(element);
  } catch {
    return element;
  }
}

export function makeCopy(array) {
  try {
    return JSON.parse(JSON.stringify(array));
  } catch {
    return array;
  }
}
export async function verifyUserID(token) {
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
