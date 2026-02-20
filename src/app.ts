import cookieParser from "cookie-parser"
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { AuthRoutes } from './modules/Auth/auth.route';

const app: Application = express();

// parsers
app.use(express.json());
app.use(cors());
app.use(cookieParser())

// application routes
app.use('/api/auth', AuthRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from FoodHub');
});

export default app;
