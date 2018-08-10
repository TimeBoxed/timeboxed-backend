'use strict';

import express from 'express';
import cors from 'cors';
import googleRouter from '../routes/google-oauth';
import profileRouter from '../routes/profile-router';
import logger from './logger';

const app = express();
const server = null;

app.use(cors({
  credentials: true,
  origin: ['http://localhost:8080'],
}));
app.use(googleRouter);
app.use(profileRouter);

app.all('*', (request, response) => {
  logger.log(logger.INFO, 'Returning a 404 from the catch/all default route');
  return response.sendStatus(404);
});

const startServer = () => {
  return app.listen(process.env.PORT, () => {
    console.log(`Server is listening on Port ${process.env.PORT}`);
    logger.log(logger.INFO, `SERVER IS LISTENING ON PORT ${process.env.PORT}`);
  });
};

const stopServer = () => {
  return server.close(() => {
    logger.log(logger.INFO, 'SERVER IS OFF');
  });
};

export { startServer, stopServer };
