const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

router.post('/', serviceController.addService);
router.get('/', serviceController.getServices);

module.exports = router;
