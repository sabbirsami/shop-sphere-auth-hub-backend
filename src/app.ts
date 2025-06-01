import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import { CustomError } from './app/interface/error.interface';

const app: Application = express();

//parsers
app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Working');
});

// Not Found
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  const error: CustomError = new Error(
    `Can't find ${req.originalUrl} route on the server`
  );
  error.status = 404;
  next(error);
});

export default app;
