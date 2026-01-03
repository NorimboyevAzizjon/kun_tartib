# AI Integratsiya Hujjati

Bu hujjat frontend va backend o‘rtasida AI funksiyasi uchun qanday integratsiya amalga oshirilishini tushuntiradi.

## 1. API Endpoint

- **URL:** `/api/ai`
- **Method:** `POST`
- **Request Body:**

  ```json
  {
    "message": "Foydalanuvchi so‘rovi matni"
  }
  ```

- **Response:**

  ```json
  {
    "reply": "AI javobi matni"
  }
  ```

## 2. Autentifikatsiya

- AI endpointdan foydalanish uchun foydalanuvchi JWT token bilan autentifikatsiyadan o‘tgan bo‘lishi kerak.
- Har bir so‘rovda `Authorization: Bearer <token>` header yuboriladi.

## 3. Frontenddan So‘rov Yuborish

```js
// Misol uchun src/services/api.js
export async function sendAIMessage(message, token) {
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ message })
  });
  return res.json();
}
```

## 4. Error Handling

- Backendda xatolik yuz bersa, quyidagi formatda javob qaytariladi:

  ```json
  {
    "error": "Xatolik haqida ma’lumot"
  }
  ```

- Frontendda xatolik xabari foydalanuvchiga ko‘rsatiladi.

## 5. Security

- Input validation: `message` maydoni bo‘sh bo‘lmasligi va uzunligi cheklangan bo‘lishi kerak.
- Rate limiting: Bir foydalanuvchi ma’lum vaqt ichida ko‘p so‘rov yubora olmasligi kerak.
- Token tekshiruvi: Har bir so‘rovda token haqiqiyligini tekshirish.

## 6. Test Misollari

- To‘g‘ri so‘rov: AI javobi qaytadi.
- Noto‘g‘ri token: 401 xatolik.
- Bo‘sh message: 400 xatolik.


## 7. Qo‘shimcha
- Agar tashqi AI API ishlatilsa, API kaliti .env faylida saqlanadi va kodda ochiq ko‘rinmaydi.

---

Savollar yoki kengaytirish uchun: [backend/routes/ai.js], [src/components/AssistantAI.jsx] fayllarini ko‘ring.