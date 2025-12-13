const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Maqsad nomi kiritish shart'],
    trim: true,
    maxlength: [200, 'Maqsad nomi 200 ta belgidan oshmasin']
  },
  description: {
    type: String,
    maxlength: [500, 'Tavsif 500 ta belgidan oshmasin']
  },
  type: {
    type: String,
    enum: ['weekly', 'monthly'],
    default: 'weekly'
  },
  targetCount: {
    type: Number,
    required: [true, 'Maqsad soni kiritish shart'],
    min: [1, 'Kamida 1 bo\'lsin']
  },
  category: {
    type: String,
    enum: ['all', 'work', 'study', 'home', 'personal', 'health'],
    default: 'all'
  },
  reward: {
    type: String,
    maxlength: [200, 'Mukofot 200 ta belgidan oshmasin']
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Goal', GoalSchema);
