'use strict';

import mongoose from 'mongoose';
import crypto from 'crypto';
import jsonWebToken from 'jsonwebtoken';
import HttpError from 'http-errors';

const TOKEN_SEED_LENGTH = 128;

const accountSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  tokenSeed: {
    type: String,
    required: true,
    unique: true,
  },
  googleToken: {
    type: String,
    required: true,
    unique: true,
  },
  refreshToken: {
    type: String,
    unique: true,
  },
  username: {
    type: String,
    required: true,
  },
  createdOn: {
    type: Date,
    default: () => new Date(),
  },
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'profile',
  },
});

function pCreateLoginToken() {
  this.tokenSeed = crypto.randomBytes(TOKEN_SEED_LENGTH).toString('hex');
  return this.save()
    .then((account) => {
      return jsonWebToken.sign({ tokenSeed: account.tokenSeed }, process.env.HASH_SECRET_STRING);
    })
    .catch(err => new HttpError('400', err));
}

accountSchema.methods.pCreateLoginToken = pCreateLoginToken;

const Account = mongoose.model('account', accountSchema);

Account.create = (email, username, googleToken, refreshToken) => {
  const tokenSeed = crypto.randomBytes(TOKEN_SEED_LENGTH).toString('hex');
  return new Account({
    username,
    email,
    tokenSeed,
    googleToken,
    refreshToken,
  }).save();
};

export default Account;
