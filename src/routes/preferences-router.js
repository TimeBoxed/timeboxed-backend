'use strict';

import { Router } from 'express';
import { json } from 'body-parser';
import Preferences from '../model/preferences';
import logger from '../lib/logger';
import bearerAuthMiddleware from '../lib/bearer-auth-middleware';

const preferencesRouter = new Router();
const jsonParser = json();

preferencesRouter.get('/preferences/:id', bearerAuthMiddleware, (request, response, next) => {
  return Preferences.findOne(request.params.id)
    .then((preferences) => {
      logger.log(logger.INFO, 'Returning a 200 status code and requested Preferences');
      return response.json(preferences);
    })
    .catch(next);
});

preferencesRouter.put('/preferences/:id', bearerAuthMiddleware, jsonParser, (request, response, next) => {
  const options = { runValidators: true, new: true };
  return Preferences.findByIdAndUpdate(request.params.id, request.body, options)
    .then((preferences) => {
      logger.log(logger.INFO, 'Returning a 200 status code and updated Preferences');
      return response.json(preferences);
    })
    .catch(next);
});

export default preferencesRouter;
