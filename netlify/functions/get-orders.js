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

    const responseData = await response.json();

    return res.status(200).json({
      type: "basic",
      url: fullUrl,
      redirected: false,
      status: 200,
      ok: true,
      data: responseData,
    });
  } catch (error) {
    console.log("error", error.message);
    return res.status(500).json({ error: `Failed to get orders!` });
  }
};
