const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

router.post('/', appointmentController.createAppointment);
router.get('/client/:clientId', appointmentController.getClientAppointments);
router.get('/gunsmith/:gunsmithId', appointmentController.getGunsmithAppointments);
router.put('/:id/status', appointmentController.updateAppointmentStatus);
router.put('/:id/notes', appointmentController.addAppointmentNotes);

module.exports = router;
