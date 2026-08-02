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
  allow(['client', 'gunsmith']),
  appointmentController.getClientAppointments
);

// Get gunsmith appointments
router.get(
  '/gunsmith/:gunsmithId',
  auth,
  allow(['gunsmith']),
  appointmentController.getGunsmithAppointments
);

// Client updates/reschedules own appointment
router.put(
  '/:id',
  auth,
  allow(['client']),
  validate(appointmentSchemas.create),
  appointmentController.updateAppointmentByClient
);

// Client cancels own appointment
router.delete(
  '/:id',
  auth,
  allow(['client']),
  appointmentController.cancelAppointment
);

// Update appointment status
router.put(
  '/:id/status',
  auth,
  allow(['gunsmith']),
  validate(appointmentSchemas.updateStatus),
  appointmentController.updateAppointmentStatus
);

// Admin-side update/reschedule appointment
router.put(
  '/:id/admin',
  auth,
  allow(['gunsmith']),
  validate(appointmentSchemas.updateAdmin),
  appointmentController.updateAppointmentByAdmin
);

router.get(
  '/:id',
  auth,
  allow(['client', 'gunsmith']),
  appointmentController.getAppointmentById
);

module.exports = router;
