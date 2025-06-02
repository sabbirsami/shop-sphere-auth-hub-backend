import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import { CustomError } from './app/interface/error.interface';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import router from './routes';

const app: Application = express();

//parsers
app.use(express.json());
const corsConfig = {
  origin: ['http://localhost:5173/', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
app.use(cors(corsConfig));
app.use(cookieParser());

// application routes
app.use('/api/', router);

app.get('/', (req, res) => {
  res.send('Working');
});

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
