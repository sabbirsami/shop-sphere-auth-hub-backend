/* eslint-disable @typescript-eslint/no-explicit-any */
// app.ts
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import { CustomError } from './app/interface/error.interface';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import router from './routes';

const app: Application = express();

// Parsers
app.use(express.json());

// Enhanced CORS configuration for subdomains
const corsConfig = {
  origin: [
    'http://localhost:5173',
    'http://*.localhost:5173',
    'https://localhost:5173',
    'https://*.localhost:5173',
    'http://localhost:3000',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsConfig));
app.use(cookieParser());

// In your Express app configuration
app.use((req: Request, res: Response, next: NextFunction) => {
  const originalCookie = res.cookie.bind(res);
  res.cookie = function (name: string, val: any, options: any = {}) {
    const defaultOptions = {
      domain:
        process.env.NODE_ENV === 'production'
          ? '.yourdomain.com'
          : '.localhost',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
    };
    return originalCookie(name, val, { ...defaultOptions, ...options });
  };
  next();
});

// Application routes
app.use('/api', router);

// Health check
app.get('/', (req, res) => {
  res.send('Working');
});

// Error handling
app.use(globalErrorHandler);

// Not Found
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  const error: CustomError = new Error(
    `Can't find ${req.originalUrl} route on the server`
  );
  error.status = 404;
  next(error);
});

export default app;
