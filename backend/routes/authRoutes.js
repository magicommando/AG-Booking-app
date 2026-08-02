const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middleware/validateMiddleware');
const { authSchemas } = require('../validation/validationSchemas');

router.post('/register', validate(authSchemas.register), authController.register);
router.post('/login', authController.login);

module.exports = router;
