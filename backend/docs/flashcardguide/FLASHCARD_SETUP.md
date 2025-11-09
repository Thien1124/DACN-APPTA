# 🎴 Flashcard Study System - Quick Start Guide

## 🚀 Setup & Installation

### 1. Cài đặt dependencies (nếu chưa có)
```bash
cd backend
npm install
```

### 2. Cấu hình môi trường (.env)
Đảm bảo file `.env` có đầy đủ:
```env
PORT=1124
MONGO_URI=mongodb://localhost:27017/english-master
JWT_SECRET=your-secret-key
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### 3. Seed dữ liệu mẫu
```bash
node scripts/seedFlashcards.js
```

Sẽ tạo:
- ✅ 4 decks mẫu (IELTS A1, B1, Business, Travel)
- ✅ 40 flashcards
- ✅ Admin user (nếu chưa có)

### 4. Khởi động server
```bash
npm run dev
```

Server chạy tại: `http://localhost:1124`

---

## 📚 API Endpoints Overview

### Authentication
```
POST   /api/auth/login       - Đăng nhập
POST   /api/auth/register    - Đăng ký
```

### Decks (Public - không cần login)
```
GET    /api/decks/browse              - Browse & filter decks
GET    /api/decks/categories          - Lấy danh sách categories
GET    /api/decks/featured            - Decks nổi bật
GET    /api/decks/popular             - Decks phổ biến
GET    /api/decks/:id                 - Chi tiết deck
POST   /api/decks/:id/view            - Tăng lượt xem
```

### Study (Requires Authentication)
```
POST   /api/study/sessions/start      - Bắt đầu phiên học
POST   /api/study/sessions/:id/answer - Gửi câu trả lời
POST   /api/study/sessions/:id/complete - Hoàn thành
POST   /api/study/sessions/:id/abandon  - Hủy phiên học
GET    /api/study/sessions/:id        - Chi tiết phiên học
GET    /api/study/progress/:deckId    - Tiến độ học của deck
GET    /api/study/stats               - Thống kê tổng quan
```

---

## 🎮 Cách sử dụng

### Flow 1: Browse Decks (Không cần login)

```javascript
// 1. Lấy categories
GET /api/decks/categories

// 2. Browse decks với filter
GET /api/decks/browse?category=ACADEMIC&level=B1&sort=popular&page=1&limit=20

// 3. Xem chi tiết deck
GET /api/decks/:deckId

// 4. Tăng lượt xem
POST /api/decks/:deckId/view
```

### Flow 2: Study Flow (Cần login)

```javascript
// 1. Login
POST /api/auth/login
Body: { email, password }
=> Lấy token

// 2. Start session
POST /api/study/sessions/start
Headers: { Authorization: "Bearer {token}" }
Body: {
  deckId: "...",
  studyMode: "TYPE_IN",
  sessionType: "LEARN_NEW",
  cardLimit: 10
}
=> Nhận sessionId và flashcards

// 3. Loop qua từng thẻ và submit answer
POST /api/study/sessions/:sessionId/answer
Body: {
  flashcardId: "...",
  userAnswer: "...",
  correct: true/false,
  responseTime: 5,
  quality: 4
}

// 4. Complete session
POST /api/study/sessions/:sessionId/complete
=> Nhận kết quả, XP, statistics
```

---

## 🧪 Test với Postman/Thunder Client

### 1. Import Collection
Tạo collection với các request sau:

#### Login
```
POST http://localhost:1124/api/auth/login
Content-Type: application/json

{
  "email": "admin@englishmaster.com",
  "password": "admin123"
}
```

#### Browse Decks
```
GET http://localhost:1124/api/decks/browse?category=ACADEMIC&level=B1
```

#### Start Study Session
```
POST http://localhost:1124/api/study/sessions/start
Authorization: Bearer {your-token}
Content-Type: application/json

{
  "deckId": "673eb8dcf78bb53d2cfeef39",
  "studyMode": "TYPE_IN",
  "sessionType": "LEARN_NEW",
  "cardLimit": 5
}
```

#### Submit Answer
```
POST http://localhost:1124/api/study/sessions/{sessionId}/answer
Authorization: Bearer {your-token}
Content-Type: application/json

{
  "flashcardId": "673eb8dcf78bb53d2cfeef3a",
  "userAnswer": "hoàn thành",
  "correct": true,
  "responseTime": 5,
  "quality": 4
}
```

---

## 🎯 Study Modes

### 1. FLIP Mode
- User xem mặt trước, click để xem mặt sau
- Tự đánh giá: Again (0-2) | Hard (2-3) | Good (3-4) | Easy (4-5)

### 2. TYPE_IN Mode
- User gõ đáp án
- Hệ thống so sánh và chấm điểm

### 3. MULTIPLE_CHOICE Mode
- Hiển thị 4 lựa chọn
- Chọn đáp án đúng

### 4. MIXED Mode
- Kết hợp các mode trên

---

## 📊 Spaced Repetition Algorithm

Hệ thống sử dụng **SM-2 Algorithm**:

### Card Status Progression:
```
NEW → LEARNING → REVIEWING → MASTERED
```

### Review Intervals:
- Repetition 1: 1 day
- Repetition 2: 6 days
- Repetition 3+: Previous interval × Ease Factor

### Ease Factor:
- Khởi đầu: 2.5
- Min: 1.3
- Tự động điều chỉnh dựa trên quality rating

### Quality Ratings:
- **5**: Perfect (rất dễ)
- **4**: Correct with hesitation (dễ)
- **3**: Correct with difficulty (vừa)
- **2**: Incorrect but remembered (khó)
- **1**: Incorrect, completely forgot (rất khó)
- **0**: Complete blackout (quên hoàn toàn)

---

## 🏆 XP System

```javascript
XP = (correct × 10) + accuracyBonus + streakBonus + completionBonus

Accuracy Bonus:
- 90-100%: +50 XP
- 80-89%: +30 XP
- 70-79%: +15 XP

Streak Bonus:
- 10+ streak: +25 XP
- 5-9 streak: +10 XP

Completion Bonus:
- Complete all cards: +20 XP
```

---

## 📱 Frontend Integration Tips

### React Component Structure
```
/pages
  /decks
    - DeckBrowse.jsx       # Browse & filter
    - DeckDetail.jsx       # Deck info
  /study
    - StudySession.jsx     # Main study screen
    - StudyResults.jsx     # Results after session
  /progress
    - ProgressDashboard.jsx # Overall stats
    - DeckProgress.jsx      # Progress per deck
```

### State Management (Redux/Context)
```javascript
const studyState = {
  currentSession: null,
  flashcards: [],
  currentCardIndex: 0,
  answers: [],
  stats: {}
}
```

### Study Screen UI Elements
- Progress bar (5/10 cards)
- Timer
- Streak counter
- Card component (with flip animation)
- Answer input/buttons
- Skip button
- Keyboard shortcuts

---

## 🐛 Troubleshooting

### Port already in use
```bash
# Windows
netstat -ano | findstr :1124
taskkill /PID {pid} /F

# Mac/Linux
lsof -ti:1124 | xargs kill
```

### MongoDB connection error
- Kiểm tra MongoDB đang chạy
- Kiểm tra MONGO_URI trong .env

### Cannot find module
```bash
npm install
```

---

## 📖 Documentation

Chi tiết đầy đủ xem tại: `FLASHCARD_API_DOCS.md`

---

## 🚀 Next Steps

1. ✅ Test API với Postman
2. ✅ Chạy seed script
3. ✅ Implement frontend
4. ⏳ Add audio/images
5. ⏳ Add achievements
6. ⏳ Add leaderboard

---

Chúc bạn code vui! 🎉
