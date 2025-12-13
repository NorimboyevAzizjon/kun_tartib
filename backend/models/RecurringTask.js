const mongoose = require('mongoose');

const RecurringTaskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Vazifa nomi kiritish shart'],
    trim: true
  },
  category: {
    type: String,
    enum: ['work', 'study', 'home', 'personal', 'health'],
    default: 'personal'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  time: {
    type: String,
    default: '09:00'
  },
  recurrence: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    default: 'daily'
  },
  daysOfWeek: [{
    type: Number,
    min: 0,
    max: 6
  }],
  dayOfMonth: {
    type: Number,
    min: 1,
    max: 31
  },
  endDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('RecurringTask', RecurringTaskSchema);
