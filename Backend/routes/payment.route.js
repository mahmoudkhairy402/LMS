const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/payment.controller");
const { protect } = require("../middlewares/auth.middleware");

router.post("/create-intent", protect, paymentController.createPaymentIntent);
router.post("/confirm", protect, paymentController.confirmPayment);
router.get(
  "/get-status/:paymentIntentId",
  protect,
  paymentController.getPaymentStatus,
);

module.exports = router;
