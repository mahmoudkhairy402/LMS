const nodemailer = require("nodemailer");

function buildTransport() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || "false") === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  if (
    process.env.SMTP_SERVICE &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  ) {
    return nodemailer.createTransport({
      service: process.env.SMTP_SERVICE,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  throw new Error(
    "SMTP configuration is missing. Set SMTP_HOST/SMTP_USER/SMTP_PASS or SMTP_SERVICE/SMTP_USER/SMTP_PASS",
  );
}

async function sendEmail({ to, subject, text, html }) {
  const transporter = buildTransport();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });

  const acceptedCount = Array.isArray(info.accepted) ? info.accepted.length : 0;
  if (acceptedCount === 0) {
    const rejected = Array.isArray(info.rejected)
      ? info.rejected.join(", ")
      : "unknown";
    throw new Error(
      `Email was not accepted by SMTP provider. Rejected: ${rejected}`,
    );
  }

  console.log(`Email accepted by SMTP. messageId=${info.messageId}`);
}

module.exports = sendEmail;
