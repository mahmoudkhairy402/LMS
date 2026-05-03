const Stripe = require('stripe');

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set in environment variables.');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-11-15',
});

module.exports = stripe;
