const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const allow = require('../middleware/roles');
const validate = require('../middleware/validateMiddleware');
const upload = require('../middleware/fileUpload');
const { firearmSchemas } = require('../validation/validationSchemas');
const firearmController = require('../controllers/firearmController');

router.post('/', auth, allow(['client']), validate(firearmSchemas.create), firearmController.addFirearm);

router.get('/user/:userId', auth, allow(['client', 'gunsmith']), firearmController.getUserFirearms);

router.put('/:id', auth, allow(['client']), validate(firearmSchemas.update), firearmController.updateFirearm);

router.delete('/:id', auth, allow(['client']), firearmController.deleteFirearm);

// NEW: Upload firearm photo
router.post(
  '/photo/:id',
  auth,
  allow(['client']),
  upload.single('photo'),
  firearmController.uploadPhoto
);

module.exports = router;
