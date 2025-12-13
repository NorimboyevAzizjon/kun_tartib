const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ism kiritish shart'],
    trim: true,
    maxlength: [50, 'Ism 50 ta belgidan oshmasin']
  },
  email: {
    type: String,
    required: [true, 'Email kiritish shart'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email noto\'g\'ri']
  },
  password: {
    type: String,
    required: [true, 'Parol kiritish shart'],
    minlength: [6, 'Parol kamida 6 ta belgi bo\'lsin'],
    select: false
  },
  avatar: {
    type: String,
    default: '👤'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Parolni hash qilish
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Parolni tekshirish
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
