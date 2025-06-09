import {
  authHeaders,
  makeCopy,
  tryParse,
  verifyUserID,
} from "../utils/general";
exports.handler = async (event) => {
  let response;
  const baseUrl = "https://calendar.craftedbymartin.com";

  try {
    // Parse request body
    const { username, password } = JSON.parse(event.body);
    const getTokenUrl = `https://kos.craftedbymartin.com/wp-json/custom-jwt-auth/v1/token`;
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
    return {
      statusCode: 200,
      body: JSON.stringify({
        statusCode: 200,
        content: json,
        message: tokenResponse,
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
