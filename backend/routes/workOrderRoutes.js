const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const allow = require('../middleware/roles');
const validate = require('../middleware/validateMiddleware');
const upload = require('../middleware/fileUpload');
const { workOrderSchemas } = require('../validation/validationSchemas');
const workOrderController = require('../controllers/workOrderController');

router.post('/', auth, allow(['gunsmith']), validate(workOrderSchemas.create), workOrderController.createWorkOrder);

router.put('/:id', auth, allow(['gunsmith']), validate(workOrderSchemas.update), workOrderController.updateWorkOrder);

// NEW: upload work order photo
router.post(
  '/photo/:id',
  auth,
  allow(['gunsmith']),
  upload.single('photo'),
  workOrderController.uploadPhoto
);

module.exports = router;
