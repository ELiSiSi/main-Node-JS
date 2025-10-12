import AppError from '../utils/appError.js';

//---------------------------------------------------------------------------------------------------
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

//---------------------------------------------------------------------------------------------------
const handleDuplicateFieldsDB = (err) => {
  const value = err.keyValue ? Object.values(err.keyValue)[0] : 'unknown';
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

//---------------------------------------------------------------------------------------------------
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

//---------------------------------------------------------------------------------------------------
const handleJWTError = ( ) => {
  new AppError('The user no longer exists.', 401);
};

//---------------------------------------------------------------------------------------------------
const handleJWTExpiredError=( )=>{

new AppError(' your Token has expired !!! please log in again ' ,401)

}


//---------------------------------------------------------------------------------------------------
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

//---------------------------------------------------------------------------------------------------
const sendErrorPro = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

//---------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------
export default (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = err;

    if (err.name === 'CastError') {
      error = handleCastErrorDB(err);
    } else if (err.code === 11000) {
      error = handleDuplicateFieldsDB(err);
    } else if (err.name === 'ValidationError') {
      error = handleValidationErrorDB(err);
    } else if (err.name === 'jsonWebTokenError') {
      error = handleJWTError( );
    }else if (err.name==='TokenExpiredError'){
error = handleJWTExpiredError( )

    }

    sendErrorPro(error, res);
  }
};
