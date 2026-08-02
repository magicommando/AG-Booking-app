const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const allow = require('../middleware/roles');
const validate = require('../middleware/validateMiddleware');
const upload = require('../middleware/fileUpload');
const { workOrderSchemas } = require('../validation/validationSchemas');
const workOrderController = require('../controllers/workOrderController');

router.get('/', auth, allow(['gunsmith']), workOrderController.getWorkOrders);
router.get('/appointment/:appointmentId', auth, allow(['gunsmith']), workOrderController.getWorkOrder);
router.get('/:id', auth, allow(['gunsmith']), workOrderController.getWorkOrderById);

router.post('/', auth, allow(['gunsmith']), validate(workOrderSchemas.create), workOrderController.createWorkOrder);

router.put('/:id', auth, allow(['gunsmith']), validate(workOrderSchemas.update), workOrderController.updateWorkOrder);
router.put('/:id/complete', auth, allow(['gunsmith']), workOrderController.completeWorkOrder);

// NEW: upload work order photo
router.post(
  '/photo/:id',
  auth,
  allow(['gunsmith']),
  upload.single('photo'),
  workOrderController.uploadPhoto
);

module.exports = router;
