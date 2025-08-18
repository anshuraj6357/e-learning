// routes/webhookRouter.js
const express = require('express');
const { stripeWeb } = require('../controller/coursepurchase');

const router = express.Router();

router.post(
  '/webhook',
  express.raw({ type: 'application/json' }), // keep raw body
  stripeWeb
);

module.exports = router;
