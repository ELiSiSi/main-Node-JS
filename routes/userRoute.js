import express from 'express';

import {
  signup,
  login,
  restrictTo,
  protect,
  forgotPassword,
  resetPassword,
  updatePassword,
} from '../controller/authController.js';

import {
  createUser,
  getUsers,
  updateMe,
  deleteMe,
  deleteUser,
  updateUser,
} from '../controller/userController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
router.patch('/updatePassword', protect, updatePassword);

router.route('/').get(getUsers).post(createUser);

router.patch('/updateMe', protect, updateMe);
router.delete('/deleteMe', protect, deleteMe);

router
  .route('/:id')
  .patch(protect, restrictTo('user'), updateUser)
  .delete(protect, restrictTo('user'), deleteUser);

export default router;
