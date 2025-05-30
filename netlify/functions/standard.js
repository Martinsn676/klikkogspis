import { verifyUserID } from "../utils/auth.js";

exports.handler = async (event) => {
  let response;
  const baseUrl = "https://calendar.craftedbymartin.com";

  try {
    // Parse request body
    const { token, month, year } = JSON.parse(event.body);

    // Validate required fields
    if (!token || !month || !year) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          status: 400,
          ok: false,
          message: "Missing required fields: token, month, or year",
        }),
      };
    }

    const userID = await verifyUserID(token);
    if (!userID) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          status: 401,
          ok: false,
          message: "Token not valid",
        }),
      };
    }
    const url =
      baseUrl +
      `/wp-json/calendar/v1/tracking/?user_id=${userID}&month=${month}&year=${year}`;

    console.log("url", url);
    response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
    });

    // Check if response is OK
    if (!response.ok) {
      const errorDetails = await response.json();
      throw {
        statusCode: response.status,
        message: "Failed to fetch tracking data",
        details: errorDetails,
      };
    }
    if (response.status === 403) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          status: 403,
          ok: false,
          message: "Access forbidden",
        }),
      };
    }
    const json = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify({
        status: 200,
        ok: true,
        content: json,
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
