import express from 'express';

import { restrictTo, protect } from '../controller/authController.js';

import {
  getTour,
  createTour,
  getTourById,
  updateTour,
  deleteTour,
} from '../controller/tourController.js';

import reviewRouter from './reviewRoute.js';



const router = express.Router();

router.use('/:tourId/reviews',reviewRouter)

router
  .route('/')
  .get(protect, getTour)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);

router
  .route('/:id')
  .get(protect, getTourById)
  .patch(protect, restrictTo('admin', 'lead-guide'), updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);



export default router;
