// backend/routes/ai.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

// OpenAI API kalitini .env faylidan oling
env = process.env;
const OPENAI_API_KEY = env.OPENAI_API_KEY || 'sk-demo-key'; // Demo uchun

router.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Savol yuborilmadi.' });

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Siz foydalanuvchiga qisqa va aniq javob beradigan o‘zbek tilidagi yordamchi AI botsiz.' },
          { role: 'user', content: message }
        ],
        max_tokens: 256,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const aiText = response.data.choices[0].message.content.trim();
    res.json({ answer: aiText });
  } catch (err) {
    res.status(500).json({ error: 'AI javob bera olmadi.' });
  }
});

module.exports = router;
