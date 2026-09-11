import express, { Request, Response, NextFunction } from 'express';

const app = express();

app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

export default app;