 import asyncHandler from 'express-async-handler';

import AppError from '../utils/appError.js';



//----------------------------------------------------------------------------------------
export const createOne = Model => asyncHandler(async (req, res, next) => {
  const doc = await Model.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
});

//----------------------------------------------------------------------------------------
export const updateOne = Model => asyncHandler(async (req, res, next) => {
  const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!doc ) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
});



//----------------------------------------------------------------------------------------
export const deleteOne = Model => asyncHandler(async (req, res, next) => {
  const doc = await Model.findByIdAndDelete(req.params.id);

  if (!doc) {
    return next(new AppError(`No ${Model} found with that ID`, 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});