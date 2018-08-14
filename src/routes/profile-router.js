'use strict';

import { Router } from 'express';
import { json } from 'body-parser';
import Profile from '../model/profile';
import logger from '../lib/logger';
import bearerAuthMiddleware from '../lib/bearer-auth-middleware';

const profileRouter = new Router();
const jsonParser = json();

profileRouter.get('/profiles/me', bearerAuthMiddleware, (request, response, next) => {
  console.log(request.account.id);
  return Profile.findOne({ account: request.account.id })
    .then((profile) => {
      console.log(profile, 'inside profile router');
      logger.log(logger.INFO, 'Returning a 200 status code and requested Profile');
      return response.json(profile);
    })
    .catch(next);
});

profileRouter.get('/profiles/:id', bearerAuthMiddleware, (request, response, next) => {
  return Profile.findById(request.params.id)
    .then((profile) => {
      logger.log(logger.INFO, 'Returning a 200 status code and requested Profile');
      return response.json(profile);
    })
    .catch(next);
});

profileRouter.get('/profile/calendars/:id', bearerAuthMiddleware, (request, response, next) => {
  return Profile.findById(request.params.id)
    .then((profile) => {
      logger.log(logger.INFO, 'Returning a 200 status code and requested Calendars in Profile Router');
      return response.send(profile.calendars);
    })
    .catch(next);
});

profileRouter.put('/profile', bearerAuthMiddleware, jsonParser, (request, response, next) => {
  const options = { runValidators: true, new: true };
  return Profile.findByIdAndUpdate(request.account.profile, request.body, options)
    .then((profile) => {
      logger.log(logger.INFO, 'Returning a 200 status code and updated Profile');
      return response.json(profile);
    })
    .catch(next);
});

export default profileRouter;
