export default function handler(req, res) {
  try {
    res.status(200).json({
      status: "success",
      message: "Cron Engine Executed Successfully",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
}
