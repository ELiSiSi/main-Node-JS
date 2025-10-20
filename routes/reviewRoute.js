 import express from 'express';

import {setTourUserIds, createReview, getAllReviews ,deleteReview ,updateReview} from '../controller/reviewController.js';
import {
  restrictTo,
  protect,
} from '../controller/authController.js'; 

const router = express.Router( {mergeParams:true});

router
  .route('/')
  .get(protect, getAllReviews)
  .post(protect, restrictTo('user'), setTourUserIds, createReview);

  router
  .route('/:id') 
    .patch(updateReview)
  .delete( deleteReview)

export default router;