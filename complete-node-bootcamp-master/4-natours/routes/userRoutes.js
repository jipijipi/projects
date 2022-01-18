const express = require('express');

const userController = require('./../controllers/userController');
const router = express.Router();


//route handlers




router.route('/').get(userController.getAllusers).post(userController.addUser);
router.route('/:id').get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser);

module.exports = router;
