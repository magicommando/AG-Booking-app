const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validateMiddleware');
const { userSchemas } = require('../validation/validationSchemas');
const userController = require('../controllers/userController');

router.get('/role/gunsmiths', userController.getGunsmiths);
router.get('/role/clients', userController.getClients);

router.put('/profile', auth, validate(userSchemas.profileUpdate), userController.updateOwnProfile);

router.get('/:id', auth, userController.getUser);
router.put('/:id', auth, validate(userSchemas.profileUpdate), userController.updateUser);

module.exports = router;
