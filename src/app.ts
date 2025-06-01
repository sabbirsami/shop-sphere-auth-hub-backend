import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application } from 'express';

const app: Application = express();

//parsers
app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Working');
});

export default app;
