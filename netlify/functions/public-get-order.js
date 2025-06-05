export default async (req, res) => {
  const links = {
    baseUrl: "https://kos.craftedbymartin.com",
    ordersUrl: "/wp-json/custom-orders/v1/track?token=",
  };

  const { tracking_token } = req.body;

  if (!tracking_token) {
    return res.status(500).json({ error: `Missing token` });
  }

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

    const responseData = await response.json();

    res.status(200).json({
      type: "basic",
      url: fullUrl,
      redirected: false,
      status: 200,
      ok: true,
      data: responseData,
    });
  } catch (error) {
    console.log("error", error.message);
    res.status(500).json({ error: `Failed to get orders!` });
  }
};
