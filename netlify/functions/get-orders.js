export default async (req, res) => {
  const links = {
    baseUrl: "https://kos.craftedbymartin.com",
    ordersUrl: "/wp-json/custom-orders/v1/restaurant",
  };

  const { restaurant_id = 33 } = req.body;

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
        url,
        redirected: false,
        status: 200,
        ok: true,
        data,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Failed to get orders!` }),
    };
  }
};
