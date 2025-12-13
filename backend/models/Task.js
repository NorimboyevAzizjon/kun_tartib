const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Vazifa nomi kiritish shart'],
    trim: true,
    maxlength: [200, 'Vazifa nomi 200 ta belgidan oshmasin']
  },
  description: {
    type: String,
    maxlength: [1000, 'Tavsif 1000 ta belgidan oshmasin']
  },
  date: {
    type: String,
    required: [true, 'Sana kiritish shart']
  },
  time: {
    type: String,
    required: [true, 'Vaqt kiritish shart']
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
  completed: {
    type: Boolean,
    default: false
  },
  reminder: {
    type: Boolean,
    default: false
  },
  reminderTime: {
    type: Number,
    default: 10
  },
  recurringId: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Yangilash vaqtini avtomatik o'zgartirish
TaskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Task', TaskSchema);
