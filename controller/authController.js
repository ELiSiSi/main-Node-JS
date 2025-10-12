import asyncHandler from 'express-async-handler';
import JWT from 'jsonwebtoken';
import crypto from 'crypto';

import User from '../models/userModel.js';
import AppError from '../utils/appError.js';
import sendEmail from '../utils/email.js';

//----------------------------------------------------------------------------------------
const signToken = (id) => {
  return JWT.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions={
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
     httpOnly: true,
  }

  if(process.env.NODE_ENV==='production') cookieOptions.secure= true,

  user.password=undefined

  res.cookie('jwt', token,cookieOptions   );

  res.status(statusCode).json({
    status: 'success',
    token,
    date: {
      user,
    },
  });
};

//----------------------------------------------------------------------------------------
export const signup = asyncHandler(async (req, res, next) => {
  const newUser = await User.create(req.body);
  createSendToken(newUser, 201, res);
});

//----------------------------------------------------------------------------------------
export const login = asyncHandler(async (req, res, next) => {
  const { password, email } = req.body;

  if (!email || !password) {
    return next(new AppError(' please provide email and password !!!', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('incorrect email OR password !!!', 401));
  }

  createSendToken(user, 200, res);
});

//----------------------------------------------------------------------------------------
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError(' You are not logged in! Please log in to get access.', 401)
    );
  }

  let decoded = JWT.verify(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(new AppError('The user no longer exists.', 401));
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please login again.', 401)
    );
  }
  req.user = currentUser;

  next();
});

//-----------------------------------------------------------------------------------
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

//-----------------------------------------------------------------------------------
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/user/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and
passwordConfirm to: ${resetURL}.\n If you didn't forget your password, please ignore this
email `;

  try {
    await sendEmail({
      email: user.email,
      subject: ' your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email !',
      resetToken,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        ' there was an error sending the email . try again later !!!',
        500
      )
    );
  }
});

//-----------------------------------------------------------------------------------
export const resetPassword = asyncHandler(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError(' token is invalid or has expirted ', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  createSendToken(user, 200, res);
});

// -----------------------------------------------------------
export const updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('your Current password is wrong', 401));
  }
  if (req.body.password !== req.body.passwordConfirm) {
    return next(new AppError('كلمة السر غير متطابقة ⚠️', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  createSendToken(user, 200, res);
});
