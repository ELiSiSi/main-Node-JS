import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import dotenv from 'dotenv';
dotenv.config();  
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';


import AppError from './utils/appError.js';
import  errorController  from './controller/errorController.js';
import userRouter from './routes/userRoute.js';
import tourRouter from './routes/tourRoute.js';
import reviewRouter from './routes/reviewRoute.js';
 


const MONGO_URI = process.env.MONGO_URI;
const app = express();
const port = process.env.PORT || 3000;


app.use(express.json());

// حل مشكلة __dirname في ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(`${__dirname}/public`));

//-----------------------------------------------------------------------------------------
 const limiter = rateLimit({
  max: 100, 
  windowMs: 60 * 60 * 1000,  
  message: 'Too many requests from this IP, please try again later.'
});

 app.use('/api', limiter);

// Set Security HTTP Headers
 app.use(helmet());

 app.use(express.json({ limit: '10kb' }));

 
// 2) تنظيف البيانات من NoSQL Injection
app.use(mongoSanitize());


// 3) تنظيف البيانات من XSS Attack
app.use(xss());
 
//-----------------------------------------------------------------------------------------
app.use(morgan('dev'));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

 
  next();
});

app.use(hpp());

//-----------------------------------------------------------------------------------------
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/reviews', reviewRouter);
 



// Handle undefined routes
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});





app.use(errorController);



//----------------------------------------------------------------------------------------------------------
process.on('unhandledRejection', (err) => {
  console.log('❌ Unhandled Rejection 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.log('❌ Uncaught Exception 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});


//-----------------------------------------------------------------------------------------
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');

    // شغل السيرفر بعد ما DB تتوصل
    app.listen(port, () => {
      console.log(` app listening at http://localhost:${port}`);
    });
  })
  .catch((err) => console.error('❌ MongoDB Error:', err));

// Start the server
export default app;
