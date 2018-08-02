import mongoose from 'mongoose';

const projectSchema = mongoose.Schema({
  tite: {
    type: String,
    default: 'New Project',
  },
  deadline: {
    type: String,
    default: () => {
      const nowDate = new Date();
      const weekDate = nowDate.setDate(nowDate.getDate() + 14);
      const month = weekDate.getUTCMonth();
      const date = weekDate.getUTCDate();
      const day = weekDate.getUTCDay();
      return `${day} ${month} ${date}`;
    },
  },
  priority: {
    type: Number,
    default: 3,
  },
  tasks: {
    type: Array,
    default: [],
  },
  overSubscribed: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model('project', projectSchema);
