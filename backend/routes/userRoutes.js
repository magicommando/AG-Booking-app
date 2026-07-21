const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/role/gunsmiths', userController.getGunsmiths);
router.get('/role/clients', userController.getClients);

router.get('/:id', userController.getUser);
router.put('/:id', userController.updateUser);

module.exports = router;
