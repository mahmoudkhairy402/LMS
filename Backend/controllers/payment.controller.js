const stripe = require("../utils/stripe");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");

const Course = require("../models/course.model");
const Enrollment = require("../models/enrollment.model");
const Payment = require("../models/payment.model");

async function upsertEnrollmentFromPayment(payment, chargeReceiptUrl = null) {
  const existingEnrollment = await Enrollment.findOne({
    student: payment.student,
    course: payment.course,
  });

  if (existingEnrollment) {
    if (!existingEnrollment.payment) {
      existingEnrollment.payment = payment._id;
      await existingEnrollment.save();
    }

    return { enrollment: existingEnrollment, created: false };
  }

  const enrollment = await Enrollment.create({
    student: payment.student,
    course: payment.course,
    payment: payment._id,
  });

  await Course.updateOne(
    { _id: payment.course },
    { $inc: { enrolledCount: 1 } },
  );

  if (chargeReceiptUrl) {
    await Payment.updateOne(
      { _id: payment._id },
      { receiptUrl: chargeReceiptUrl },
    );
  }

  return { enrollment, created: true };
}

// Create Payment Intent
exports.createPaymentIntent = asyncHandler(async (req, res) => {
  const user = req.user;
  const { courseId } = req.body;

  if (!courseId) {
    throw new AppError("courseId is required", 400);
  }

  const course = await Course.findById(courseId);
  if (!course || !course.isPublished) {
    throw new AppError("Course not found or not available", 404);
  }

  // Prevent paying again if already enrolled
  const existingEnrollment = await Enrollment.findOne({
    student: user._id,
    course: course._id,
  });

  if (existingEnrollment) {
    return res.status(200).json({
      success: true,
      message: "Already enrolled",
      enrolled: true,
    });
  }

  const amount = Math.round((course.price || 0) * 100);

  if (amount <= 0) {
    throw new AppError("This course is free or has invalid price", 400);
  }

  // Create PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "usd",
    metadata: {
      courseId: String(course._id),
      studentId: String(user._id),
    },
  });

  // Save payment record
  const payment = await Payment.create({
    student: user._id,
    course: course._id,
    amount,
    currency: "usd",
    status: "pending",
    stripePaymentIntentId: paymentIntent.id,
    stripeCustomerId: paymentIntent.customer || null,
    metadata: { courseTitle: course.title, studentEmail: user.email },
  });

  return res.status(201).json({
    success: true,
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    paymentId: payment._id,
  });
});

// Confirm payment (explicit confirm endpoint - optional)
exports.confirmPayment = asyncHandler(async (req, res) => {
  const user = req.user;
  const { paymentIntentId } = req.body;

  if (!paymentIntentId) {
    throw new AppError("paymentIntentId is required", 400);
  }

  const payment = await Payment.findOne({
    stripePaymentIntentId: paymentIntentId,
  });
  if (!payment) {
    throw new AppError("Payment record not found", 404);
  }

  if (String(payment.student) !== String(user._id)) {
    throw new AppError("Unauthorized for this payment", 403);
  }

  const pi = await stripe.paymentIntents.retrieve(paymentIntentId, {
    expand: ["charges.data.balance_transaction"],
  });

  if (pi.status !== "succeeded") {
    throw new AppError("Payment not completed", 400);
  }

  // Update payment
  const charge = pi.charges && pi.charges.data && pi.charges.data[0];
  await Payment.updateOne(
    { _id: payment._id },
    { status: "succeeded", receiptUrl: charge ? charge.receipt_url : null },
  );

  const receiptUrl =
    pi.charges && pi.charges.data && pi.charges.data[0]
      ? pi.charges.data[0].receipt_url
      : null;

  await Payment.updateOne(
    { _id: payment._id },
    { status: "succeeded", receiptUrl },
  );

  const { enrollment, created } = await upsertEnrollmentFromPayment(
    payment,
    receiptUrl,
  );

  return res.status(200).json({
    success: true,
    message: created
      ? "Payment confirmed and enrollment created"
      : "Already enrolled",
    enrollmentId: enrollment._id,
  });
});

// Get payment status
exports.getPaymentStatus = asyncHandler(async (req, res) => {
  const { paymentIntentId } = req.params;

  if (!paymentIntentId) {
    throw new AppError("paymentIntentId is required", 400);
  }

  const payment = await Payment.findOne({
    stripePaymentIntentId: paymentIntentId,
  });
  if (!payment) {
    throw new AppError("Payment not found", 404);
  }

  const enrollment = await Enrollment.findOne({ payment: payment._id }).select(
    "_id student course status progressPercent enrolledAt",
  );

  return res.status(200).json({
    success: true,
    status: payment.status,
    payment,
    enrollment,
  });
});

// Stripe webhook handler - expects raw body
exports.handleStripeWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["stripe-signature"];

  let event = null;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const type = event.type;
  const data = event.data.object;

  // Handle events
  if (type === "payment_intent.succeeded") {
    const pi = data;
    const intentId = pi.id;
    const payment = await Payment.findOne({ stripePaymentIntentId: intentId });
    if (payment) {
      const charge = pi.charges && pi.charges.data && pi.charges.data[0];
      const receiptUrl = charge ? charge.receipt_url : null;

      await Payment.updateOne(
        { _id: payment._id },
        { status: "succeeded", receiptUrl },
      );

      await upsertEnrollmentFromPayment(payment, receiptUrl);
    }
  }

  if (type === "payment_intent.payment_failed") {
    const pi = data;
    const intentId = pi.id;
    const payment = await Payment.findOne({ stripePaymentIntentId: intentId });
    if (payment) {
      await Payment.updateOne(
        { _id: payment._id },
        {
          status: "failed",
          errorMessage:
            (pi.last_payment_error && pi.last_payment_error.message) || null,
        },
      );
    }
  }

  if (type === "charge.refunded" || type === "charge.refund.updated") {
    // Optional: handle refunds by updating payment/enrollment
    const charge = data;
    if (charge && charge.payment_intent) {
      const payment = await Payment.findOne({
        stripePaymentIntentId: charge.payment_intent,
      });
      if (payment) {
        await Payment.updateOne({ _id: payment._id }, { status: "refunded" });
        // Remove enrollment if desired - business decision
      }
    }
  }

  res.json({ received: true });
});
