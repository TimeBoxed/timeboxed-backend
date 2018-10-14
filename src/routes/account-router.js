'use strict';

import { Router } from 'express';
import HttpError from 'http-errors';
import logger from '../lib/logger';
import Account from '../model/account';
import Profile from '../model/profile';
import Preferences from '../model/preferences';
import Tasks from '../model/task';
import bearerAuthMiddleware from '../lib/bearer-auth-middleware';

const accountRouter = new Router();

accountRouter.delete('/account', bearerAuthMiddleware, (request, response, next) => {
  return Account.findById(request.account._id)
    .then((account) => {
      if (!account) return next(new HttpError(404, 'account not found'));
      if (account.profile) {
        Profile.findById(account.profile)
          .then((profile) => {
            if (profile.preferences) {
              Preferences.findById(profile.preferences)
                .then((pref) => {
                  pref.remove();
                });
            }
            while (profile.tasks.length > 0) {
              Tasks.findById(profile.tasks.pop())
                .then((task) => {
                  task.remove();
                });
            }
            profile.remove();
          });
      }
      logger.log(logger.INFO, 'DELETE - Account successfully deleted.');
      return account.remove();
    })
    .then(() => response.sendStatus(204))
    .catch(next);
});

export default accountRouter;
