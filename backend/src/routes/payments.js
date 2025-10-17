const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

router.post('/create-checkout-session', async (req, res) => {
  const { productId } = req.body;
  const p = await db.query('SELECT * FROM products WHERE id=$1', [productId]);
  const product = p.rows[0];
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: product.currency,
        product_data: { name: product.name },
        unit_amount: product.price_cents
      },
      quantity: 1
    }],
    success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/`,
    metadata: { productId: product.id }
  });

  await db.query('INSERT INTO orders (stripe_session_id, product_id, buyer_email) VALUES ($1,$2,$3)', [session.id, product.id, session.customer_details && session.customer_details.email]);
  res.json({ url: session.url });
});

// stripe webhook - raw body expected
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log('Webhook signature failed', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const productId = session.metadata.productId;
    const key = uuidv4().toUpperCase();
    await db.query('INSERT INTO licenses (key, product_id, owner_id, status) VALUES ($1,$2,$3,$4)', [key, productId, null, 'active']);
    console.log('Issued license', key);
    // Optionally: send email to customer (not implemented)
  }

  res.json({ received: true });
});

module.exports = router;
