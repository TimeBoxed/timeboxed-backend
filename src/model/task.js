'use strict';

import mongoose from 'mongoose';
import Profile from './profile';

const taskSchema = mongoose.Schema({
  title: { 
    type: String, 
    required: true,
  },
  timeEstimate: {
    type: Number,
    default: 30, // TODO: replace with user's specified default size
  },
  completed: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
  },
  notes: {
    type: String,
    default: '',
  },
  createdOn: {
    type: Date,
    default: () => new Date(),
  },
  dueDate: {
    type: Date,
    default: '',
  },
  profile: {
    type: mongoose.Schema.ObjectId,
    required: true,
  },
  dependencies: {
    type: Array,
  },
});

function savePreHook(done) {
  return Profile.findById(this.profile)
    .then((profileFound) => {
      if (profileFound.tasks.indexOf(this._id) < 0) {
        profileFound.tasks.push(this._id);
      }
      return profileFound.save();
    })
    .then(() => {
      return done();
    })
    .catch(done);
}

taskSchema.pre('save', savePreHook);

export default mongoose.model('task', taskSchema);
