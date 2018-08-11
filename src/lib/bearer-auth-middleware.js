'use strict';

import HttpError from 'http-errors';
import jsonWebToken from 'jsonwebtoken';
import Account from '../model/account';

const promisify = callbackStyleFunction => (...args) => {
  return new Promise((resolve, reject) => {
    callbackStyleFunction(...args, (error, data) => {
      if (error) {
        return reject(error);
      }
      return resolve(data);
    });
  });
};

export default (request, response, next) => {
  if (!request.headers.authorization) {
    return next(new HttpError(400, 'AUTH BEARER - no headers invalid Response'));
  }
  const token = request.headers.authorization.split('Bearer ')[1];
  if (!token) {
    return next(new HttpError(401, 'AUTH BEARER - no token invalid Response'));
  }

  return promisify(jsonWebToken.verify)(token, process.env.HASH_SECRET_STRING)
    .then((decryptedToken) => {
      return Account.findOne({ tokenSeed: decryptedToken.tokenSeed });
    })
    .then((account) => {
      if (!account) {
        return next(new HttpError(400, 'AUTH BEARER - invalid Response'));
      }
      request.account = account;
      return next();
    })
    .catch((error) => {
      return next(new HttpError(400, `AUTH BEARER - Json webtoken Error ${error}`));
    });
};
