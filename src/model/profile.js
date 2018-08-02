import mongoose from 'mongoose';

const profileSchema = mongoose.Schema({
  account: { 
    type: mongoose.Schema.Types.ObjectId,
    required: true, 
    unique: true, 
  },
  name: {
    type: String,
    required: true,
  },
  calendar: {
    type: Object,
    required: true,
  },
  projects: {
    type: Array,
    default: [],
    required: true,
  },
  preferences: {
    type: Object,
  },
  phoneNumber: {
    type: Number,
    required: true,
  },
});

export default mongoose.model('profile', profileSchema);
