'use strict';

import mongoose from 'mongoose';
import HttpError from 'http-errors';
import Account from './account';
import logger from '../lib/logger';

const profileSchema = mongoose.Schema({
  username: { 
    type: String, 
    required: true,
  },
  email: { 
    type: String, 
    required: true,
    unique: true,
  },
  phoneNumber: {
    type: String,
  },
  privacySigned: {
    type: Boolean,
    required: true,
    default: false,
  },
  account: {
    type: mongoose.Schema.ObjectId,
    required: true,
    unique: true,
  },
  calendars: {
    type: Array,
  },
  preferences: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'preferences',
  },
  tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'task',
    },
  ],
});

function profilePreHook(done) {
  return Account.findById(this.account)
    .then((accountFound) => {
      if (!accountFound) throw new HttpError(404, 'Account not found');
      if (!accountFound.profile) accountFound.profile = this._id;
      else return done();
      return accountFound.save();
    })
    .then(() => done())
    .catch(done);
}

function profilePostHook(done) {
  return Account.findByIdAndRemove(this.account)
    .then((response) => {
      if (!response) return new HttpError(404, 'Account not found in post hook.');
      logger.log(logger.INFO, 'DELETE - Account successfully deleted.');
      return response.sendStatus(204);
    })
    .catch(done);
}

profileSchema.pre('save', profilePreHook);
profileSchema.post('remove', profilePostHook);

export default mongoose.model('profile', profileSchema);
