import express from 'express';

import {
  signup,
  login,
    restrictTo,
  protect,
  forgotPassword,
  resetPassword,
  updatePassword
} from '../controller/authController.js';

import {getUsers,updateMe,deleteMe}  from '../controller/userController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
router.patch('/updatePassword',protect, updatePassword);

router.get('/', protect, getUsers);
router.patch('/updateMe',protect, updateMe)
router.delete('/updateMe',protect, deleteMe)
 
export default router;
