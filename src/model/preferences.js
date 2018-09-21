'use strict';

import mongoose from 'mongoose';
import HttpError from 'http-errors';
import Profile from './profile';
// import logger from '../lib/logger';

const preferencesSchema = mongoose.Schema({
  phoneNumber: {
    type: String,
    default: 'Not yet added',
  },
  email: {
    type: String,
  },
  agendaReceiveTime: {
    type: String,
    default: '07:30',
  },
  taskLengthDefault: {
    type: Number,
    default: 30,
  },
  breatherTime: {
    type: Number,
    default: 15,
  },
  selectedCalendar: {
    type: Object,
  },
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'profile',
  },
});

function savePreHook(done) {
  return Profile.findById(this.profile)
    .then((profileFound) => {
      if (!profileFound) throw new HttpError(404, 'Profile not found');
      if (!profileFound.preferences) profileFound.preferences = this._id;
      else return done();
      return profileFound.save();
    })
    .then(() => done())
    .catch(done);
}

// function prefPostHook(done) {
//   return Profile.findByIdAndRemove(this.profile)
//     .then((response) => {
//       if (!response) return new HttpError(404, 'Profile not found in post hook.');
//       logger.log(logger.INFO, 'DELETE - Pdffddfdfsasdfreferences successfully deleted.');
//       return response.sendStatus(204);
//     })
//     .catch(done);
// }

preferencesSchema.pre('save', savePreHook);
// preferencesSchema.post('remove', prefPostHook);

export default mongoose.model('preferences', preferencesSchema);
