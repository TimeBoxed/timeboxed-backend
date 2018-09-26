'use strict';

import { Router } from 'express';
import HttpError from 'http-errors';
import logger from '../lib/logger';
import Account from '../model/account';
import bearerAuthMiddleware from '../lib/bearer-auth-middleware';

const accountRouter = new Router();

accountRouter.delete('/account', bearerAuthMiddleware, (request, response, next) => {
  return Account.findById(request.account._id)
    .then((account) => {
      if (!account) return next(new HttpError(404, 'account not found'));
      logger.log(logger.INFO, 'DELETE - Account successfully deleted.');
      return account.remove();
    })
    .then(() => response.sendStatus(204))
    .catch(next);
});

export default accountRouter;
