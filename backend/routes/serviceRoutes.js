const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const allow = require('../middleware/roles');
const validate = require('../middleware/validateMiddleware');
const { serviceSchemas } = require('../validation/validationSchemas');
const serviceController = require('../controllers/serviceController');

// Add service
router.post(
  '/',
  auth,
  allow(['gunsmith']),
  validate(serviceSchemas.create),
  serviceController.addService
);

// Get services for gunsmith
router.get(
  '/:gunsmithId',
  auth,
  allow(['client', 'gunsmith']),
  serviceController.getGunsmithServices
);

module.exports = router;
