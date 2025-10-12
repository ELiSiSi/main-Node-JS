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




app.use(errorController);

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
