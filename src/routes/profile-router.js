'use strict';

import { Router } from 'express';
import { json } from 'body-parser';
import HttpError from 'http-errors';

import Profile from '../model/profile';
import Preferences from '../model/preferences';
import logger from '../lib/logger';
import bearerAuthMiddleware from '../lib/bearer-auth-middleware';

const profileRouter = new Router();
const jsonParser = json();

profileRouter.get('/profiles/me', bearerAuthMiddleware, (request, response, next) => {
  return Profile.findOne({ account: request.account.id })
    .then((profile) => {
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

profileRouter.delete('/profile/:id', bearerAuthMiddleware, (request, response, next) => {
  return Profile.findById(request.params.id)
    .then((profile) => {
      if (!profile) return next(new HttpError(404, 'profile not found.'));
      Preferences.findById(profile.preferences)
        .then((pref) => {
          logger.log(logger.INFO, 'DELETE - Preferences removed from DB');
          pref.remove();
        });
      logger.log(logger.INFO, 'DELETE - Profile successfully deleted.');
      profile.remove();
      return response.sendStatus(204);
    })
    .catch(next);
});

export default profileRouter;
