# 📚 Hướng dẫn Test API - Duolingo-like Features

## 🎯 Tổng quan

Tài liệu này hướng dẫn test các API cho các tính năng giống Duolingo:
- **Task 11**: Streak System - Theo dõi số ngày học liên tục
- **Task 12**: XP System - Điểm kinh nghiệm
- **Task 13**: Mission System - Nhiệm vụ
- **Task 14**: Heart System - Giới hạn số lần sai
- **Task 15**: Shop System - Cửa hàng vật phẩm

---

## 🔐 

Tất cả các API đều yêu cầu **JWT Token** trong header:

```
Authorization: Bearer {your_token}
```

**Lấy token:** Đăng nhập qua `/api/auth/login` hoặc `/api/auth/register`

---

## 📊 TASK 11: STREAK SYSTEM - Theo dõi số ngày học liên tục

### 1. Cập nhật Streak
**Endpoint:** `POST /api/streak/update`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:** (không cần)

**Response Success:**
```json
{
  "success": true,
  "streak": 5,
  "lastActivityDate": "2025-01-15T00:00:00.000Z",
  "message": "Streak đã được cập nhật thành công"
}
```

**Test Cases:**
1. ✅ Học lần đầu tiên → `streak = 1`
2. ✅ Học liên tiếp hôm sau → `streak` tăng
3. ✅ Bỏ lỡ 1 ngày → `streak` reset về 1
4. ✅ Học lại trong cùng ngày → `streak` không đổi

**cURL:**
```bash
curl -X POST http://localhost:1124/api/streak/update \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 2. Lấy thông tin Streak
**Endpoint:** `GET /api/streak`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "streak": {
    "count": 5,
    "lastActivityDate": "2025-01-15T00:00:00.000Z"
  }
}
```

**cURL:**
```bash
curl -X GET http://localhost:1124/api/streak \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎮 TASK 12: XP SYSTEM - Điểm kinh nghiệm

### 1. Cập nhật XP
**Endpoint:** `POST /api/xp/update`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "xpEarned": 50
}
```

**Response Success:**
```json
{
  "success": true,
  "xp": {
    "total": 250,
    "level": 2
  },
  "leveledUp": true,
  "message": "Chúc mừng! Bạn đã lên cấp"
}
```

**Test Cases:**
1. ✅ Hoàn thành bài học → tăng XP
2. ✅ Đủ XP → lên level
3. ✅ XP âm → trả về lỗi

**cURL:**
```bash
curl -X POST http://localhost:1124/api/xp/update \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"xpEarned": 50}'
```

---

### 2. Lấy thông tin XP
**Endpoint:** `GET /api/xp`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "xp": {
    "total": 250,
    "level": 2
  },
  "nextLevelXP": 400,
  "xpNeeded": 150
}
```

**cURL:**
```bash
curl -X GET http://localhost:1124/api/xp \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎯 TASK 13: MISSION SYSTEM - Nhiệm vụ

### 1. Lấy danh sách nhiệm vụ
**Endpoint:** `GET /api/missions`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "missions": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "title": "Hoàn thành 5 bài học",
      "description": "Hoàn thành 5 bài học trong ngày",
      "type": "daily",
      "requirement": {
        "type": "lesson_complete",
        "count": 5
      },
      "rewards": {
        "xp": 100,
        "gems": 50,
        "hearts": 2
      },
      "progress": 3,
      "isCompleted": false,
      "rewardClaimed": false
    }
  ]
}
```

**cURL:**
```bash
curl -X GET http://localhost:1124/api/missions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 2. Cập nhật tiến độ nhiệm vụ
**Endpoint:** `POST /api/missions/progress`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "missionId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "progress": 1
}
```

**Note:** `progress` là optional. Nếu không có, mặc định tăng +1.

**Response:**
```json
{
  "success": true,
  "mission": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "title": "Hoàn thành 5 bài học",
    "progress": 4,
    "required": 5,
    "isCompleted": false
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:1124/api/missions/progress \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"missionId": "60f7b3b3b3b3b3b3b3b3b3b3", "progress": 1}'
```

---

### 3. Nhận phần thưởng
**Endpoint:** `POST /api/missions/claim-reward`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "missionId": "60f7b3b3b3b3b3b3b3b3b3b3"
}
```

**Response Success:**
```json
{
  "success": true,
  "message": "Đã nhận phần thưởng thành công",
  "rewards": {
    "xp": 100,
    "gems": 50,
    "hearts": 2
  },
  "userStats": {
    "xp": { "total": 350, "level": 2 },
    "gems": { "amount": 50 },
    "hearts": { "current": 5, "max": 5 }
  }
}
```

**Test Cases:**
1. ✅ Nhiệm vụ chưa hoàn thành → lỗi
2. ✅ Đã nhận phần thưởng → lỗi (không cho nhận 2 lần)
3. ✅ Nhận thành công → tăng XP, Gems, Hearts

**cURL:**
```bash
curl -X POST http://localhost:1124/api/missions/claim-reward \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"missionId": "60f7b3b3b3b3b3b3b3b3b3b3"}'
```

---

## ❤️ TASK 14: HEART SYSTEM - Giới hạn số lần sai

### 1. Sử dụng Tim (khi trả lời sai)
**Endpoint:** `POST /api/hearts/use`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:** (không cần)

**Response Success:**
```json
{
  "success": true,
  "hearts": {
    "current": 4,
    "max": 5,
    "nextRecoveryAt": "2025-01-15T10:30:00.000Z",
    "recoveryTime": 30
  },
  "message": "Đã sử dụng 1 tim"
}
```

**Response Error (hết tim):**
```json
{
  "success": false,
  "message": "Bạn đã hết tim, vui lòng chờ hoặc mua thêm tim",
  "hearts": {
    "current": 0,
    "max": 5,
    "nextRecoveryAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:1124/api/hearts/use \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 2. Kiểm tra và nạp tim tự động
**Endpoint:** `GET /api/hearts/refill`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "hearts": {
    "current": 5,
    "max": 5,
    "nextRecoveryAt": null,
    "recoveryTime": 30
  },
  "timeUntilNextHeart": 0
}
```

**Note:** Tim tự động phục hồi mỗi 30 phút. API này kiểm tra và phục hồi tự động.

**cURL:**
```bash
curl -X GET http://localhost:1124/api/hearts/refill \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 3. Mua thêm tim bằng Gems
**Endpoint:** `POST /api/hearts/buy`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "amount": 1
}
```

**Note:** 1 tim = 5 gems

**Response Success:**
```json
{
  "success": true,
  "hearts": {
    "current": 5,
    "max": 5
  },
  "gems": {
    "amount": 45
  },
  "message": "Đã mua thành công 1 tim",
  "cost": 5
}
```

**Response Error (không đủ gems):**
```json
{
  "success": false,
  "message": "Không đủ gems để mua tim",
  "required": 5,
  "current": 3
}
```

**cURL:**
```bash
curl -X POST http://localhost:1124/api/hearts/buy \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 1}'
```

---

## 🛒 TASK 15: SHOP SYSTEM - Cửa hàng vật phẩm

### 1. Lấy danh sách vật phẩm
**Endpoint:** `GET /api/shop/items?type=heart`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Params:**
- `type` (optional): `heart`, `boost`, `theme`, `avatar`, `other`

**Response:**
```json
{
  "success": true,
  "items": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "name": "1 Tim",
      "description": "Thêm 1 tim ngay lập tức",
      "type": "heart",
      "price": {
        "gems": 5
      },
      "effects": {
        "hearts": 1
      },
      "duration": 0,
      "isAvailable": true
    }
  ]
}
```

**cURL:**
```bash
curl -X GET "http://localhost:1124/api/shop/items?type=heart" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 2. Mua vật phẩm
**Endpoint:** `POST /api/shop/purchase`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "itemId": "60f7b3b3b3b3b3b3b3b3b3b3"
}
```

**Response Success:**
```json
{
  "success": true,
  "message": "Mua vật phẩm thành công",
  "item": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "1 Tim",
    "price": { "gems": 5 }
  },
  "userStats": {
    "gems": { "amount": 45 },
    "hearts": { "current": 5, "max": 5 }
  }
}
```

**Test Cases:**
1. ✅ Mua vật phẩm tim → tự động thêm tim, tiêu thụ ngay
2. ✅ Mua vật phẩm boost → lưu vào kho đồ
3. ✅ Không đủ gems → lỗi

**cURL:**
```bash
curl -X POST http://localhost:1124/api/shop/purchase \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"itemId": "60f7b3b3b3b3b3b3b3b3b3b3"}'
```

---

### 3. Sử dụng vật phẩm từ kho đồ
**Endpoint:** `POST /api/shop/use`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "inventoryId": "60f7b3b3b3b3b3b3b3b3b3b3"
}
```

**Response Success:**
```json
{
  "success": true,
  "message": "Đã thêm 1 tim",
  "userStats": {
    "hearts": { "current": 5, "max": 5 },
    "gems": { "amount": 50 }
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:1124/api/shop/use \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"inventoryId": "60f7b3b3b3b3b3b3b3b3b3b3"}'
```

---

### 4. Lấy kho đồ của user
**Endpoint:** `GET /api/shop/inventory?type=boost`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Params:**
- `type` (optional): Lọc theo loại vật phẩm

**Response:**
```json
{
  "success": true,
  "inventory": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "itemId": {
        "_id": "...",
        "name": "XP Boost 2x",
        "type": "boost",
        "effects": { "xpBoost": 2 }
      },
      "purchasedAt": "2025-01-15T10:00:00.000Z",
      "expiresAt": null,
      "isActive": true
    }
  ]
}
```

**cURL:**
```bash
curl -X GET "http://localhost:1124/api/shop/inventory?type=boost" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🧪 Test Flow Mẫu

### Flow 1: Hoàn thành bài học
```bash
# 1. Hoàn thành bài học → cập nhật streak
POST /api/streak/update

# 2. Nhận XP
POST /api/xp/update
Body: { "xpEarned": 50 }

# 3. Cập nhật tiến độ nhiệm vụ
POST /api/missions/progress
Body: { "missionId": "...", "progress": 1 }

# 4. Nếu trả lời sai → mất tim
POST /api/hearts/use
```

### Flow 2: Mua tim khi hết
```bash
# 1. Kiểm tra tim
GET /api/hearts/refill

# 2. Mua tim bằng gems
POST /api/hearts/buy
Body: { "amount": 1 }

# Hoặc mua từ shop
POST /api/shop/purchase
Body: { "itemId": "..." }
```

### Flow 3: Hoàn thành nhiệm vụ
```bash
# 1. Xem nhiệm vụ
GET /api/missions

# 2. Cập nhật tiến độ (khi hoàn thành)
POST /api/missions/progress
Body: { "missionId": "...", "progress": 1 }

# 3. Nhận phần thưởng (khi nhiệm vụ hoàn thành)
POST /api/missions/claim-reward
Body: { "missionId": "..." }
```

---

## 📝 Notes

1. **Tim tự động phục hồi:** Mỗi 30 phút phục hồi 1 tim (có thể tùy chỉnh trong Heart model)
2. **Streak reset:** Nếu bỏ lỡ 1 ngày, streak sẽ reset về 1
3. **XP và Level:** Level được tính theo công thức: `level = 1 + floor(sqrt(totalXP / 100))`
4. **Gems:** Được nhận từ nhiệm vụ, có thể dùng để mua vật phẩm trong shop
5. **Heart Model:** Sử dụng Heart model riêng (không lưu trong User model) để quản lý tim

---

## 🔧 Postman Collection

Có thể import vào Postman để test dễ dàng hơn. Tất cả endpoints đã có sẵn trong codebase.

---

## ✅ Checklist Test

- [ ] Streak: Học liên tiếp → streak tăng
- [ ] Streak: Bỏ lỡ ngày → streak reset
- [ ] XP: Hoàn thành bài → tăng XP
- [ ] XP: Đủ XP → lên level
- [ ] Mission: Cập nhật tiến độ → progress tăng
- [ ] Mission: Hoàn thành → nhận phần thưởng
- [ ] Heart: Trả lời sai → mất tim
- [ ] Heart: Chờ 30 phút → tim phục hồi
- [ ] Heart: Mua tim → tăng tim ngay
- [ ] Shop: Mua vật phẩm → trừ gems
- [ ] Shop: Mua tim → tự động thêm tim
- [ ] Shop: Mua boost → lưu vào kho đồ

---

---

## 📚 TASK 16: PRACTICE SYSTEM - Collocation/Phrasal Verbs/Word Family

### 1. Lấy danh sách bài tập luyện tập
**Endpoint:** `GET /api/practice/exercises`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Params:**
- `category`: `collocation` | `phrasal-verb` | `word-family` (optional)
- `level`: `A1` | `A2` | `B1` | `B2` | `C1` | `C2` (optional)
- `difficulty`: `easy` | `medium` | `hard` (optional)
- `limit`: số lượng (default: 10)
- `page`: số trang (default: 1)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "category": "collocation",
      "targetWord": "make",
      "question": "Choose the correct collocation",
      "contextSentence": "I need to ___ a decision",
      "questionType": "multiple-choice",
      "options": [
        { "text": "make" },
        { "text": "do" }
      ],
      "points": 10,
      "level": "B1"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50
  }
}
```

**cURL:**
```bash
curl -X GET "http://localhost:1124/api/practice/exercises?category=collocation&level=B1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 2. Lấy chi tiết một bài tập
**Endpoint:** `GET /api/practice/exercises/:id`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "category": "collocation",
    "targetWord": "make",
    "question": "Choose the correct collocation",
    "contextSentence": "I need to ___ a decision",
    "questionType": "multiple-choice",
    "options": [
      { "text": "make" },
      { "text": "do" }
    ],
    "points": 10,
    "examples": [...]
  }
}
```

**cURL:**
```bash
curl -X GET http://localhost:1124/api/practice/exercises/60f7b3b3b3b3b3b3b3b3b3b3 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 3. Nộp đáp án bài tập
**Endpoint:** `POST /api/practice/exercises/:id/submit`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "userAnswer": "make",
  "timeSpent": 15
}
```

**Response Success (đúng):**
```json
{
  "success": true,
  "isCorrect": true,
  "correctAnswer": "make",
  "explanation": "Make a decision là collocation đúng",
  "pointsEarned": 10,
  "xpEarned": 10,
  "userStats": {
    "xp": { "total": 260, "level": 2 },
    "gems": { "amount": 50 }
  }
}
```

**Response Error (sai):**
```json
{
  "success": true,
  "isCorrect": false,
  "correctAnswer": "make",
  "userAnswer": "do",
  "explanation": "Make a decision là collocation đúng. 'Do' không đi với 'decision'",
  "examples": [...],
  "pointsEarned": 0,
  "xpEarned": 0
}
```

**cURL:**
```bash
curl -X POST http://localhost:1124/api/practice/exercises/60f7b3b3b3b3b3b3b3b3b3b3/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userAnswer": "make", "timeSpent": 15}'
```

---

### 4. Lấy lịch sử làm bài
**Endpoint:** `GET /api/practice/history`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "practiceExercise": {
        "_id": "...",
        "category": "collocation",
        "targetWord": "make",
        "question": "..."
      },
      "isCorrect": true,
      "pointsEarned": 10,
      "completedAt": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

**cURL:**
```bash
curl -X GET http://localhost:1124/api/practice/history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📖 TASK 17: GRAMMAR QUIZ SYSTEM - Mini-quiz ngữ pháp gắn với flashcard

### 1. Lấy quiz gắn với một flashcard
**Endpoint:** `GET /api/grammar-quiz/flashcard/:flashcardId`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "flashcard": {
    "_id": "...",
    "front": "happy",
    "back": "vui vẻ"
  },
  "quizzes": [
    {
      "_id": "...",
      "grammarTopic": "word-class",
      "question": "What part of speech is 'happy'?",
      "sentence": "She is very ___ today",
      "questionType": "multiple-choice",
      "options": [
        { "text": "adjective" },
        { "text": "noun" }
      ],
      "points": 10
    }
  ]
}
```

**cURL:**
```bash
curl -X GET http://localhost:1124/api/grammar-quiz/flashcard/60f7b3b3b3b3b3b3b3b3b3b3 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 2. Lấy danh sách quiz ngữ pháp
**Endpoint:** `GET /api/grammar-quiz/quizzes`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Params:**
- `grammarTopic`: `word-class` | `tense` | `article` | ... (optional)
- `level`: `A1` | `A2` | `B1` | `B2` | `C1` | `C2` (optional)
- `difficulty`: `easy` | `medium` | `hard` (optional)
- `flashcardId`: ID của flashcard (optional)
- `limit`: số lượng (default: 10)
- `page`: số trang (default: 1)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "flashcard": {
        "_id": "...",
        "front": "happy",
        "back": "vui vẻ"
      },
      "grammarTopic": "word-class",
      "question": "What part of speech is 'happy'?",
      "sentence": "She is very ___ today",
      "points": 10
    }
  ],
  "pagination": {...}
}
```

**cURL:**
```bash
curl -X GET "http://localhost:1124/api/grammar-quiz/quizzes?grammarTopic=word-class&level=B1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 3. Lấy chi tiết một quiz
**Endpoint:** `GET /api/grammar-quiz/quizzes/:id`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "flashcard": {
      "_id": "...",
      "front": "happy",
      "back": "vui vẻ",
      "example": "..."
    },
    "grammarTopic": "word-class",
    "question": "What part of speech is 'happy'?",
    "sentence": "She is very ___ today",
    "questionType": "multiple-choice",
    "options": [
      { "text": "adjective" },
      { "text": "noun" }
    ],
    "points": 10
  }
}
```

**cURL:**
```bash
curl -X GET http://localhost:1124/api/grammar-quiz/quizzes/60f7b3b3b3b3b3b3b3b3b3b3 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 4. Nộp đáp án quiz
**Endpoint:** `POST /api/grammar-quiz/quizzes/:id/submit`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "userAnswer": "adjective",
  "timeSpent": 20
}
```

**Response Success (đúng):**
```json
{
  "success": true,
  "isCorrect": true,
  "correctAnswer": "adjective",
  "grammarExplanation": "'Happy' là tính từ (adjective) mô tả cảm xúc",
  "grammarRule": "Tính từ thường đứng sau động từ 'be' hoặc trước danh từ",
  "examples": [
    {
      "sentence": "She is happy",
      "explanation": "Happy là tính từ đứng sau 'is'"
    }
  ],
  "pointsEarned": 10,
  "xpEarned": 10,
  "userStats": {
    "xp": { "total": 270, "level": 2 }
  }
}
```

**Response Error (sai):**
```json
{
  "success": true,
  "isCorrect": false,
  "correctAnswer": "adjective",
  "userAnswer": "noun",
  "grammarExplanation": "'Happy' là tính từ (adjective), không phải danh từ (noun)",
  "commonMistake": {
    "wrongAnswer": "noun",
    "explanation": "'Happy' không phải danh từ",
    "grammarRule": "Danh từ là từ chỉ người, vật, sự việc"
  },
  "pointsEarned": 0,
  "xpEarned": 0
}
```

**cURL:**
```bash
curl -X POST http://localhost:1124/api/grammar-quiz/quizzes/60f7b3b3b3b3b3b3b3b3b3b3/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userAnswer": "adjective", "timeSpent": 20}'
```

---

### 5. Lấy lịch sử làm quiz
**Endpoint:** `GET /api/grammar-quiz/history`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "grammarQuiz": {
        "_id": "...",
        "grammarTopic": "word-class",
        "question": "..."
      },
      "flashcard": {
        "_id": "...",
        "front": "happy",
        "back": "vui vẻ"
      },
      "isCorrect": true,
      "pointsEarned": 10,
      "completedAt": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

**cURL:**
```bash
curl -X GET http://localhost:1124/api/grammar-quiz/history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🧪 Test Flow Mẫu cho Task 16 & 17

### Flow: Làm bài tập Practice
```bash
# 1. Lấy danh sách bài tập collocation
GET /api/practice/exercises?category=collocation&level=B1

# 2. Lấy chi tiết một bài tập
GET /api/practice/exercises/:id

# 3. Nộp đáp án
POST /api/practice/exercises/:id/submit
Body: { "userAnswer": "make", "timeSpent": 15 }

# 4. Xem lịch sử
GET /api/practice/history
```

### Flow: Làm Grammar Quiz từ flashcard
```bash
# 1. Xem flashcard
GET /api/flashcards/:id

# 2. Lấy quiz gắn với flashcard
GET /api/grammar-quiz/flashcard/:flashcardId

# 3. Làm quiz
GET /api/grammar-quiz/quizzes/:id

# 4. Nộp đáp án
POST /api/grammar-quiz/quizzes/:id/submit
Body: { "userAnswer": "adjective", "timeSpent": 20 }

# 5. Xem lịch sử
GET /api/grammar-quiz/history
```

---

## ✅ Checklist Test cho Task 16 & 17

### Task 16 - Practice:
- [ ] Lấy danh sách bài tập theo category
- [ ] Lấy chi tiết bài tập (ẩn đáp án)
- [ ] Nộp đáp án đúng → nhận XP và điểm
- [ ] Nộp đáp án sai → nhận giải thích và examples
- [ ] Xem lịch sử làm bài

### Task 17 - Grammar Quiz:
- [ ] Lấy quiz gắn với flashcard
- [ ] Lấy danh sách quiz theo grammar topic
- [ ] Làm quiz → nhận giải thích ngữ pháp chi tiết
- [ ] Trả lời sai → nhận common mistakes
- [ ] Xem lịch sử làm quiz

---

---

## 🤖 TASK 18: Phân tích lỗi cá nhân & Next-Best-Card

### 1) Tóm tắt lỗi cá nhân
Endpoint: `GET /api/analytics/errors/summary?deckId=...&days=30&limit=10`

Headers:
```
Authorization: Bearer {token}
```

Response:
```json
{
  "success": true,
  "since": "2025-01-01T00:00:00.000Z",
  "progressSummary": [
    {
      "flashcard": { "_id": "...", "front": "...", "back": "..." },
      "errorRate": 60,
      "incorrectCount": 12,
      "totalReviews": 20,
      "averageResponseTime": 5
    }
  ],
  "practiceSummary": [ { "_id": "practiceExerciseId", "wrongAttempts": 5, "lastWrongAt": "..." } ],
  "grammarSummary":  [ { "_id": "grammarQuizId",    "wrongAttempts": 4, "lastWrongAt": "..." } ]
}
```

curl:
```bash
curl -X GET "http://localhost:1124/api/analytics/errors/summary?days=30&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 2) Đề xuất thẻ tiếp theo (Next-Best-Card)
Endpoint: `GET /api/analytics/next-best-card?deckId=...&fallbackNew=1`

Headers:
```
Authorization: Bearer {token}
```

Response (due card):
```json
{
  "success": true,
  "type": "DUE_CARD",
  "card": { "_id": "...", "front": "...", "back": "..." },
  "metrics": {
    "accuracy": 40,
    "incorrectCount": 10,
    "averageResponseTime": 7,
    "nextReviewDate": "2025-01-15T10:00:00.000Z",
    "score": 13.5
  }
}
```

Response (new card fallback):
```json
{ "success": true, "type": "NEW_CARD", "card": { "_id": "...", "front": "..." } }
```

curl:
```bash
curl -X GET "http://localhost:1124/api/analytics/next-best-card?deckId=DECK_ID&fallbackNew=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🧩 TASK 19: Tạo bộ quiz phụ từ thẻ hay sai

### Tạo quiz phụ
Endpoint: `POST /api/analytics/weak-quiz/generate`

Headers:
```
Authorization: Bearer {token}
Content-Type: application/json
```

Body:
```json
{
  "deckId": "OPTIONAL_DECK_ID",
  "limit": 10,
  "sources": ["studyProgress","practiceResult","grammarQuizResult"]
}
```

Response:
```json
{
  "success": true,
  "quiz": {
    "_id": "...",
    "title": "Weakness Drill",
    "totalItems": 10,
    "items": [
      { "type": "flashcard", "refId": "...", "source": "studyProgress", "reason": "low-accuracy" },
      { "type": "practice",  "refId": "...", "source": "practiceResult", "reason": "recent-wrong" }
    ]
  }
}
```

curl:
```bash
curl -X POST http://localhost:1124/api/analytics/weak-quiz/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"limit":10,"sources":["studyProgress","practiceResult","grammarQuizResult"]}'
```

---

---

## 🧭 TASK 20: Lộ trình theo mục tiêu (Roadmap)

### Tạo lộ trình
Endpoint: `POST /api/roadmap/generate`

Headers:
```
Authorization: Bearer {token}
Content-Type: application/json
```

Body:
```json
{
  "goalType": "TOEIC_CORE_650",
  "targetScore": 650,
  "targetDate": "2025-03-31",
  "weeks": 8
}
```

Response: `{ success, roadmap }`

### Lấy lộ trình hiện tại
Endpoint: `GET /api/roadmap/current`

### Cập nhật tiến độ unit
Endpoint: `POST /api/roadmap/progress`

Body:
```json
{ "unitIndex": 2, "completed": true }
```

---

## 🗓️ TASK 21: Lịch học & Google Calendar

### Tạo lịch học
Endpoint: `POST /api/schedule`

Body:
```json
{
  "title": "Weekly Plan",
  "timezone": "Asia/Ho_Chi_Minh",
  "pattern": "weekly",
  "items": [
    { "dayOfWeek": 1, "startTime": "19:00", "endTime": "19:45", "focus": "vocab" },
    { "dayOfWeek": 3, "startTime": "19:00", "endTime": "19:45", "focus": "grammar" }
  ]
}
```

### Lấy lịch học của tôi
Endpoint: `GET /api/schedule`

### Cập nhật lịch học
Endpoint: `PUT /api/schedule/:id`

### Xoá (vô hiệu) lịch
Endpoint: `DELETE /api/schedule/:id`

### Kết nối Google (stub)
Endpoint: `POST /api/calendar/connect`

Body:
```json
{ "accessToken": "TEST", "refreshToken": "TEST", "tokenExpiry": "2025-12-31T00:00:00.000Z", "calendarId": "primary" }
```

### Trạng thái kết nối
Endpoint: `GET /api/calendar/status`

### Đồng bộ lịch lên Google (stub events)
Endpoint: `POST /api/calendar/sync`

Body:
```json
{ "scheduleId": "YOUR_SCHEDULE_ID" }
```

Response: `{ success, syncedEvents, calendar }`

---

**Chúc bạn test thành công! 🎉**

---

## 👥 TASK 22: Friends/Social - Follow & Feed

### Follow người dùng
Endpoint: `POST /api/friends/follow`

Headers:
```
Authorization: Bearer {token}
Content-Type: application/json
```

Body:
```json
{ "userId": "TARGET_USER_ID" }
```

### Unfollow
Endpoint: `DELETE /api/friends/unfollow/:userId`

### Danh sách đang theo dõi
Endpoint: `GET /api/friends/following`

### Danh sách theo dõi tôi
Endpoint: `GET /api/friends/followers`

### Feed tiến độ bạn bè (7 ngày gần nhất)
Endpoint: `GET /api/friends/feed`

Response mẫu:
```json
{
  "success": true,
  "feed": [
    {
      "user": { "_id": "...", "name": "Alice" },
      "deck": { "_id": "...", "title": "IELTS B1" },
      "studyMode": "FLIP",
      "sessionType": "LEARN_NEW",
      "score": 85,
      "xpEarned": 30,
      "startTime": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

### Gửi lời chúc mừng
Endpoint: `POST /api/friends/congrats`

Body:
```json
{ "userId": "TARGET_USER_ID", "message": "Quá đỉnh!" }
```


