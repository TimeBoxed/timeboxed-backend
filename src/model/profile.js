'use strict';

import mongoose from 'mongoose';
import HttpError from 'http-errors';
import Account from './account';

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
  account: {
    type: mongoose.Schema.ObjectId,
    required: true,
    unique: true,
  },
  calendars: {
    type: Array,
  },
  tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'task',
    },
  ],
});

function savePreHook(done) {
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

profileSchema.pre('save', savePreHook);

export default mongoose.model('profile', profileSchema);
