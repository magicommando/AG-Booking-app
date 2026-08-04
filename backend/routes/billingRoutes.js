const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const allow = require('../middleware/roles');
const billingController = require('../controllers/billingController');

router.post('/create-invoice', auth, allow(['gunsmith', 'admin']), billingController.createInvoice);
router.put('/update-invoice/:id', auth, allow(['gunsmith', 'admin']), billingController.updateInvoice);
router.get('/get-invoices', auth, allow(['gunsmith', 'admin', 'client']), billingController.getInvoices);
router.post('/pay/:id', auth, allow(['client', 'gunsmith', 'admin']), billingController.payInvoice);
router.post('/stripe-webhook', billingController.stripeWebhook);
router.post('/refund/:id', auth, allow(['gunsmith', 'admin']), billingController.refundInvoice);
router.post('/add-part/:id', auth, allow(['gunsmith', 'admin']), billingController.addPart);
router.post('/add-labor/:id', auth, allow(['gunsmith', 'admin']), billingController.addLabor);

module.exports = router;
