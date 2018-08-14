'use strict';

import { Router } from 'express';
import { json } from 'body-parser';
import Account from '../model/account';
import logger from '../lib/logger';
import bearerAuthMiddleware from '../lib/bearer-auth-middleware';

const accountRouter = new Router();
const jsonParser = json();

accountRouter.put('/privacy-policy-signed', bearerAuthMiddleware, jsonParser, (request, response, next) => {
  console.log('__ACCOUNT_ID__ROUTER', request.account);
  const options = { runValidators: true, new: true };
  return Account.findByIdAndUpdate(request.account, request.body, options)
    .then((account) => {
      console.log('__ACCOUNT__', account);
      logger.log(logger.INFO, 'Returning a 200 status code and updated Account');
      return response.json(account);
    })
    .catch(next);
});

export default accountRouter;
