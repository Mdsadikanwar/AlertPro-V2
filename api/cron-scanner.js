export default async function handler(req, res) {
  // CORS Headers allow karte hain taaki browser/external CRON easily request bhej sake
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Auto-Trading Cron Scanner Triggered Successfully.`);

    // Cron execution response
    return res.status(200).json({
      success: true,
      status: "ACTIVE",
      message: "Bot Cron Scanner is running smoothly!",
      timestamp: timestamp
    });
  } catch (error) {
    console.error("Cron Scanner Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal Server Error"
    });
  }
}
