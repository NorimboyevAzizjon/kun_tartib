const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;


  // Tokenni header yoki cookie dan olish
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Token mavjudligini tekshirish
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Avtorizatsiya talab qilinadi'
    });
  }

  try {
    // Tokenni verify qilish
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Foydalanuvchini topish
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Foydalanuvchi topilmadi'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token noto\'g\'ri yoki muddati tugagan'
    });
  }
};

module.exports = { protect };
