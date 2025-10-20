import asyncHandler from 'express-async-handler';
import JWT from 'jsonwebtoken';
import crypto from 'crypto';

import User from '../models/userModel.js';
import AppError from '../utils/appError.js';
import {deleteOne,updateOne,createOne  } from './handlerFactory.js'

//-------------------------------------------------------------------------------------------
export  const createUser= createOne(User);

//-------------------------------------------------------------------------------------------
const filterObj = (Obj, ...allowedFields) => {
  const newObj = {};

  Object.keys(Obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = Obj[el];
  });
  return newObj; 
};

//----------------------------------------------------------------------------------------
export const getUsers = asyncHandler(async (req, res, next) => {
  const Users = await User.find({});

  res.status(200).json({
    status: 'success',
    results: Users.length,
    data: {
      Users,
    },
  });
});

//----------------------------------------------------------------------------------------
export const updateMe = asyncHandler(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        ' This  route is not for password updates . Please use /updateMyPassword .',
        400
      )
    );
  }

  const filteredBody = filterObj(req.body, 'name', 'email ');
  const updateuser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'succes',
    date: {
      user: updateuser,
    },
  });
});

//----------------------------------------------------------------------------------------
export const deleteMe = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(200).json({
    status: 'succes',
    date: {
      user: null,
    },
  });
});


//----------------------------------------------------------------------------------------
export const updateUser =   updateOne(User);

//----------------------------------------------------------------------------------------
export const deleteUser =   deleteOne(User);

