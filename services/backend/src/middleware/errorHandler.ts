// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  const status = err.status ?? 500;
  const message = err.message ?? 'Something went wrong';
  res.status(status).json({ message });
};

export default errorHandler;
