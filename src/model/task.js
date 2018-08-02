import mongoose from 'mongoose';

const taskSchema = mongoose.Schema({
  title: {
    type: String,
    default: 'New Task',
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'project',
  },
  deadline: {
    type: Date,
    default: mongoose.Schema.Types.Date,
    ref: 'project',
  },
  timeEst: {
    type: Number,
  },
  priority: {
    type: Number,
    default: 3,
  },
  formerTasks: {
    type: Array,
    default: [],
  },
  overDue: {
    type: Boolean,
    default: false, 
  },
  breathe: {
    type: Number,
  },
  active: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model('task', taskSchema);
