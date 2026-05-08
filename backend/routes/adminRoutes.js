const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/users', adminController.getUsers);
router.put('/users/:userId', adminController.updateUser);
router.put('/users/:userId/password', adminController.resetUserPassword);
router.delete('/users/:userId', adminController.deleteUser);

module.exports = router;