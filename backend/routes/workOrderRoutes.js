const express = require('express');
const router = express.Router();
const workOrderController = require('../controllers/workOrderController');

router.post('/', workOrderController.createWorkOrder);
router.get('/:appointmentId', workOrderController.getWorkOrder);
router.put('/:appointmentId', workOrderController.updateWorkOrder);

module.exports = router;
