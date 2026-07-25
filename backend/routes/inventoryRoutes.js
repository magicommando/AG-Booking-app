const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const allow = require('../middleware/roles');
const validate = require('../middleware/validateMiddleware');
const { inventorySchemas } = require('../validation/validationSchemas');
const inventoryController = require('../controllers/inventoryController');

// Add inventory item
router.post(
  '/',
  auth,
  allow(['gunsmith']),
  validate(inventorySchemas.create),
  inventoryController.addItem
);

// Update inventory item
router.put(
  '/:id',
  auth,
  allow(['gunsmith']),
  validate(inventorySchemas.update),
  inventoryController.updateItem
);

// Delete inventory item
router.delete(
  '/:id',
  auth,
  allow(['gunsmith']),
  inventoryController.deleteItem
);

module.exports = router;
