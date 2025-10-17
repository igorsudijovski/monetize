require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('cookie-session');
const passport = require('passport');
const setupAuth = require('./auth');
const { json } = require('body-parser');
const payments = require('./routes/payments');
const products = require('./routes/products');
const licenses = require('./routes/licenses');

const app = express();
const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(cors({ origin: FRONTEND, credentials: true }));
app.use(json());

// raw body for stripe webhook
app.use((req, res, next) => {
  if (req.originalUrl === '/api/payments/webhook') return next();
  express.json()(req, res, next);
});

// app.use(session({ name: 'session', keys: [process.env.SESSION_SECRET || 'secret'], maxAge: 24*60*60*1000 }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'], failureRedirect: '/auth/failure' }), (req, res) => {
  res.redirect(FRONTEND + '/dashboard');
});
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/auth/failure' }), (req, res) => {
  res.redirect(FRONTEND + '/dashboard');
});
app.get('/auth/failure', (req, res) => res.status(401).send('Auth failed'));

app.use('/api/payments', payments);
app.use('/api/products', products);
app.use('/api/licenses', licenses);

app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
