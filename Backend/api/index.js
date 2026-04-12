const app = require("../app");
const connectDB = require("../config/db");

module.exports = async function handler(req, res) {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server initialization failed",
      error: error.message,
    });
  }
};
