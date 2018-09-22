'use strict';

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import googleRouter from '../routes/google-oauth';
import profileRouter from '../routes/profile-router';
import taskRouter from '../routes/task-router';
import preferencesRouter from '../routes/preferences-router';
import accountRouter from '../routes/account-router';
import logger from './logger';

const app = express();
let server = null;

app.use(cors({
  credentials: true,
  origin: [process.env.CLIENT_URL],
}));
app.use(googleRouter);
app.use(profileRouter);
app.use(accountRouter);
app.use(taskRouter);
app.use(preferencesRouter);

app.all('*', (request, response) => {
  logger.log(logger.INFO, 'Returning a 404 from the catch/all default route');
  return response.sendStatus(404);
});

const startServer = () => {
  return mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })
    .then(() => {
      server = app.listen(process.env.PORT, () => {
        logger.log(logger.INFO, `SERVER IS LISTENING ON PORT ${process.env.PORT}`);
      });
    })
    .catch((err) => {
      logger.log(logger.ERROR, `SERVER START ERROR ${JSON.stringify(err)}`);
    });
};

const stopServer = () => {
  return mongoose.disconnect()
    .then(() => {
      server.close(() => {
        logger.log(logger.INFO, 'SERVER IS OFF');
      });
    })
    .catch((err) => {
      logger.log(logger.ERROR, `STOP SERVER ERROR, ${JSON.stringify(err)}`);
    });
};

export { startServer, stopServer };
