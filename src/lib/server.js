'use strict';

import express from 'express';
// import logger from './logger';

const app = express();
const server = null;

app.all('*', (request, response) => {
  // logger.log(logger.INFO, 'Returning a 404 from the catch/all default route');
  return response.sendStatus(404);
});

const startServer = () => {
  return app.listen(process.env.PORT, () => {
    console.log(`Server is listening on Port ${process.env.PORT}`);
    // logger.log(logger.INFO, `SERVER IS LISTENING ON PORT ${process.env.PORT}`);
  });
};

const stopServer = () => {
  return server.close(() => {
    // logger.log(logger.INFO, 'SERVER IS OFF');
  });
};

export { startServer, stopServer };
