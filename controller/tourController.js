import asyncHandler from 'express-async-handler';

import Tour from '../models/tourModel.js';
import AppError from '../utils/appError.js';
import {deleteOne,updateOne,createOne} from './handlerFactory.js'

//----------------------------------------------------------------------------------------
export const createTour = createOne(Tour);

//-------------------------------------------------------------------------------------------
export const getTour = asyncHandler(async (req, res, next) => {



  const tours = await Tour.find({});

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

//----------------------------------------------------------------------------------------
export const getTourById = asyncHandler(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id)
    .populate({
      path: 'guides',
      select: '-__v -updatedAt -createdAt',
    })
    .populate('reviews');

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { tour },
  });
});

//----------------------------------------------------------------------------------------
export const updateTour = updateOne(Tour)

//----------------------------------------------------------------------------------------
export const deleteTour = deleteOne(Tour)
