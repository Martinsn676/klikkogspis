exports.handler = async (event) => {
  const links = {
    baseUrl: "https://kos.craftedbymartin.com",
    ordersUrl: "/wp-json/custom-orders/v1/track?key=",
  };

  const { tracking_token } = JSON.parse(event.body);

  if (!tracking_token) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `missing tracking_token!` }),
    };
  }
  console.log("tracking_token", tracking_token);
  try {
    const fullUrl = links.baseUrl + links.ordersUrl + tracking_token;

    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    });

    if (!response.ok) {
      console.log("response", response);
    }
    const responseData = await response.json(); // Parse the JSON data
    return {
      statusCode: 200,
      body: JSON.stringify({
        type: "basic",
        url: fullUrl,
        redirected: false,
        status: 200,
        ok: true,
        data: responseData, // Return the parsed JSON data
      }),
    };
  } catch (error) {
    console.log("error", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Failed to get orders!` }),
    };
  }
};
