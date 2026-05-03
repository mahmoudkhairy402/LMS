const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "usd",
    },
    status: {
      type: String,
      enum: ["pending", "succeeded", "failed", "refunded", "canceled"],
      default: "pending",
    },
    stripePaymentIntentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    stripeCustomerId: {
      type: String,
      default: null,
    },
    receiptUrl: {
      type: String,
      default: null,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

paymentSchema.index({ student: 1, course: 1 });

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
