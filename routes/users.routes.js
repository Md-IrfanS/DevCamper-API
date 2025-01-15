const express = require('express');
const router = express.Router();
const {getUsers, getUser, createUser, updateUser, deleteUser} = require('../controllers/users.controller');
const advancedResults = require('../middleware/advancedResults');
const UserModel = require('../models/User.model');
const { protect, authorize } = require('../middleware/auth');


router.use(protect);
router.use(authorize('admin'));

router.route('/').get(advancedResults(UserModel), getUsers).post(createUser)

router.route('/:userId').get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;