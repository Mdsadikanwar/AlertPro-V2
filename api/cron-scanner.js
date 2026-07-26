module.exports = async (req, res) => {
    try {
        console.log("Vercel Cron Execution Engine Triggered");

        return res.status(200).json({
            status: "success",
            message: "Cron Engine Executed Successfully",
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};
