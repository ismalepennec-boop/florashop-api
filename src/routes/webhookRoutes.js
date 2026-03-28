const router = require('express').Router();
const { stripeWebhook } = require('../controllers/webhookController');

router.post('/stripe', stripeWebhook);

module.exports = router;
