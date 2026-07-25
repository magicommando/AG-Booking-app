const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const allow = require('../middleware/roles');
const validate = require('../middleware/validateMiddleware');
const { appointmentSchemas } = require('../validation/validationSchemas');
const appointmentController = require('../controllers/appointmentController');

// Create appointment
router.post(
  '/',
  auth,
  allow(['client']),
  validate(appointmentSchemas.create),
  appointmentController.createAppointment
);

// Get client appointments
router.get(
  '/client/:clientId',
  auth,
  allow(['client']),
  appointmentController.getClientAppointments
);

// Get gunsmith appointments
router.get(
  '/gunsmith/:gunsmithId',
  auth,
  allow(['gunsmith']),
  appointmentController.getGunsmithAppointments
);

// Update appointment status
router.put(
  '/:id/status',
  auth,
  allow(['gunsmith']),
  validate(appointmentSchemas.updateStatus),
  appointmentController.updateAppointmentStatus
);

module.exports = router;
