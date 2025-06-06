exports.handler = async (event) => {
  const links = {
    baseUrl: "https://kos.craftedbymartin.com",
    ordersUrl: "/wp-json/custom-orders/v1/restaurant",
  };

  const { restaurant_id = 33 } = JSON.parse(event.body);

  try {
    const fullUrl = links.baseUrl + links.ordersUrl + "/" + restaurant_id;

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

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        type: "basic",
        redirected: false,
        status: 200,
        ok: true,
        data,
        utl: fullUrl,
      }),
    };
  } catch (error) {
    console.warn("error", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Failed to get orders!` }),
    };
  }
};
