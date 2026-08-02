const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const allow = require('../middleware/roles');
const scheduleController = require('../controllers/scheduleController');

router.get(
  '/:gunsmithId/:day',
  auth,
  allow(['client', 'gunsmith']),
  scheduleController.getScheduleForDay
);

router.put(
  '/:gunsmithId/:day',
  auth,
  allow(['gunsmith']),
  scheduleController.saveScheduleForDay
);

module.exports = router;
