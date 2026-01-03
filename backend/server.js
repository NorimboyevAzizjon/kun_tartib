const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Env faylni yuklash
dotenv.config();

// MongoDB ga ulanish
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/ai', require('./routes/ai'));

// Asosiy route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🎯 KunTartib API ishlayapti!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      tasks: '/api/tasks',
      goals: '/api/goals'
    }
  });
});
      ai: '/api/ai/chat'
    }
   });
  });

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route topilmadi'
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server xatosi',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║                                           ║
  ║   🎯 KunTartib Backend Server             ║
  ║                                           ║
  ║   🚀 Port: ${PORT}                           ║
  ║   📡 API: http://localhost:${PORT}/api      ║
  ║   🌐 Status: Running                      ║
  ║                                           ║
  ╚═══════════════════════════════════════════╝
  `);
});
