// backend/routes/ai.js

const express = require('express');
const router = express.Router();
const axios = require('axios');

// Hugging Face Zephyr-7B modelidan foydalanish (bepul, lekin sekin va cheklangan)
router.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Savol yuborilmadi.' });

  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta',
      { inputs: message },
      {
        headers: {
          // 'Authorization': 'Bearer YOUR_HF_API_KEY', // Agar ro'yxatdan o'tgan bo'lsangiz, API kalitini yozing. Ba'zi modellar kalitsiz ham ishlaydi.
          'Content-Type': 'application/json'
        },
        timeout: 60000 // 60 sekund kutish
      }
    );
    let aiText = 'AI javob bera olmadi.';
    if (Array.isArray(response.data)) {
      aiText = response.data[0]?.generated_text || aiText;
    } else if (typeof response.data === 'object' && response.data.generated_text) {
      aiText = response.data.generated_text;
    }
    res.json({ answer: aiText });
  } catch (err) {
    res.status(500).json({ error: 'AI javob bera olmadi.' });
  }
});

module.exports = router;
