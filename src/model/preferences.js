'use strict';

import mongoose from 'mongoose';

const preferencesSchema = mongoose.Schema({
  phoneNumber: {
    type: String,
  },
  email: {
    type: String,
  },
  agendaReceiveTime: {
    type: Date,
  },
  taskLengthDefault: {
    type: Number,
    default: 30,
  },
  breatherTime: {
    type: Number,
    default: 15,
  },
  selectedCalendarId: {
    type: Object,
  },
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'profile',
  },
});

export default mongoose.model('preferences', preferencesSchema);
