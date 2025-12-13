# KunTartib Backend API

## 🚀 Ishga tushirish

### 1. MongoDB o'rnatish

**Windows uchun:**
1. [MongoDB Community Server](https://www.mongodb.com/try/download/community) yuklab oling
2. O'rnating va MongoDB Compass ham o'rnating
3. MongoDB service avtomatik ishga tushadi

**Yoki MongoDB Atlas (cloud) ishlatish:**
1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) ga ro'yxatdan o'ting
2. Bepul cluster yarating
3. Connection string oling
4. `.env` faylga qo'shing

### 2. Dependencies o'rnatish

```bash
cd backend
npm install
```

### 3. Serverni ishga tushirish

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server `http://localhost:5000` da ishlaydi.

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Tavsif |
|--------|----------|--------|
| POST | `/api/auth/register` | Ro'yxatdan o'tish |
| POST | `/api/auth/login` | Kirish |
| GET | `/api/auth/me` | Joriy foydalanuvchi |
| PUT | `/api/auth/profile` | Profilni yangilash |

### Tasks
| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/api/tasks` | Barcha vazifalar |
| GET | `/api/tasks/:id` | Bitta vazifa |
| POST | `/api/tasks` | Yangi vazifa |
| PUT | `/api/tasks/:id` | Vazifani yangilash |
| DELETE | `/api/tasks/:id` | Vazifani o'chirish |
| PATCH | `/api/tasks/:id/toggle` | Status o'zgartirish |

### Goals
| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/api/goals` | Barcha maqsadlar |
| POST | `/api/goals` | Yangi maqsad |
| PUT | `/api/goals/:id` | Maqsadni yangilash |
| DELETE | `/api/goals/:id` | Maqsadni o'chirish |

---

## 🔐 Authentication

Har bir himoyalangan endpoint uchun `Authorization` header kerak:

```
Authorization: Bearer <token>
```

---

## 📝 Request/Response formatlar

### Register
```json
// Request
{
  "name": "Ism Familiya",
  "email": "email@example.com",
  "password": "parol123"
}

// Response
{
  "success": true,
  "message": "Ro'yxatdan o'tish muvaffaqiyatli!",
  "data": {
    "_id": "...",
    "name": "Ism Familiya",
    "email": "email@example.com",
    "token": "jwt_token..."
  }
}
```

### Create Task
```json
// Request
{
  "title": "Vazifa nomi",
  "date": "2024-12-13",
  "time": "09:00",
  "category": "work",
  "priority": "high",
  "description": "Tavsif"
}

// Response
{
  "success": true,
  "message": "Vazifa qo'shildi!",
  "data": { ... }
}
```

---

## 🛠️ Texnologiyalar

- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **cors** - Cross-Origin Resource Sharing
