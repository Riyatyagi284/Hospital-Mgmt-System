import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import logger from './config/logger.config.js';
import { HttpError } from 'http-errors';
import container from './container.js';
import { PatientRoutes } from './modules/patients/patients.routes.js';

const app = express();

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

app.use(express.json());

app.get('/', async (req, res) => {
  res.send('Welcome to Auth service');
});

const patientRoutes = container.get<PatientRoutes>('PatientRoutes');

app.use('/api/v1/patients', patientRoutes.router);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(err.message);
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    error: [
      {
        type: err.name,
        msg: err.message,
        path: '',
        location: '',
      },
    ],
  });
});

export default app;
