const express = require('express');
const router = express.Router();
const firearmController = require('../controllers/firearmController');

router.post('/', firearmController.addFirearm);
router.get('/user/:userId', firearmController.getUserFirearms);
router.get('/:id', firearmController.getFirearm);
router.put('/:id', firearmController.updateFirearm);
router.delete('/:id', firearmController.deleteFirearm);

module.exports = router;
