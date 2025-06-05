export const apiKey = process.env.CONSUMER_KEY;
export const apiSecret = process.env.CONSUMER_SECRET;

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
