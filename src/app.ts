import cookieParser from "cookie-parser"
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import router from "./routes";
import { notFound } from "./middlewares/notFound";
import { errorHandler } from "./middlewares/globalErrorHandler";

const app: Application = express();

// parsers
app.use(express.json());
app.use(cors());
app.use(cookieParser())

// application routes
app.use("/api", router)


app.get('/', (req: Request, res: Response) => {
  res.send('Hello from FoodHub');
});


app.use(errorHandler)
app.use(notFound)


export default app;
