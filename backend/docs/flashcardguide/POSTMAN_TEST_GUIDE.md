# 🚀 HƯỚNG DẪN TEST FLASHCARD API VỚI POSTMAN

## 📋 Mục lục
1. [Setup ban đầu](#setup)
2. [Test Authentication](#auth)
3. [Test Browse Decks (Public)](#browse)
4. [Test Study Session](#study)
5. [Test Progress & Stats](#stats)
6. [Postman Collection Export](#collection)

---

## 🔧 Setup ban đầu {#setup}

### Bước 1: Chạy seed data
```bash
node scripts/seedFlashcards.js
```

### Bước 2: Start server
```bash
npm run dev
```

Server chạy tại: `http://localhost:1124`

### Bước 3: Tạo Environment trong Postman
1. Click vào ⚙️ (Settings) > Environments
2. Tạo environment mới: "English Master Local"
3. Thêm biến:
   - `base_url`: `http://localhost:1124`
   - `token`: (để trống, sẽ tự động set sau khi login)
   - `session_id`: (để trống)
   - `deck_id`: (để trống)

---

## 🔐 1. TEST AUTHENTICATION {#auth}

### 1.1. Register (Tùy chọn)
```
POST {{base_url}}/api/auth/register
Content-Type: application/json

Body (raw JSON):
{
  "name": "Test User",
  "email": "testuser@example.com",
  "password": "password123"
}
```

**Response mẫu:**
```json
{
  "success": true,
  "message": "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.",
  "data": {
    "user": {
      "id": "...",
      "email": "testuser@example.com"
    }
  }
}
```

---

### 1.2. Login (QUAN TRỌNG - LẤY TOKEN)
```
POST {{base_url}}/api/auth/login
Content-Type: application/json

Body (raw JSON):
{
  "email": "admin@englishmaster.com",
  "password": "admin123"
}
```

**Response mẫu:**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "673eb8dcf78bb53d2cfeef38",
      "name": "Admin",
      "email": "admin@englishmaster.com",
      "role": "admin"
    }
  }
}
```

**⚠️ LƯU Ý:**
1. Copy giá trị `token` trong response
2. Vào Environment và paste vào biến `token`
3. Hoặc dùng Test script để tự động (xem cuối section)

**Auto-save token script:**
Thêm vào tab "Tests" của request Login:
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("token", jsonData.data.token);
    console.log("Token saved:", jsonData.data.token);
}
```

---

## 🏪 2. TEST BROWSE DECKS (PUBLIC - KHÔNG CẦN TOKEN) {#browse}

### 2.1. Browse All Decks
```
GET {{base_url}}/api/decks/browse
```

**Với filters:**
```
GET {{base_url}}/api/decks/browse?category=ACADEMIC&level=B1&sort=popular&page=1&limit=10
```

**Query Parameters:**
- `category`: ACADEMIC, TRAVEL, BUSINESS, DAILY_LIFE, TECHNOLOGY, HEALTH, ENTERTAINMENT, FOOD, GENERAL
- `level`: A1, A2, B1, B2, C1, C2
- `difficulty`: BEGINNER, INTERMEDIATE, ADVANCED
- `sort`: newest, popular, rating, oldest
- `page`: 1, 2, 3...
- `limit`: 10, 20, 50...
- `search`: từ khóa tìm kiếm

**Response mẫu:**
```json
{
  "success": true,
  "count": 4,
  "data": {
    "decks": [
      {
        "_id": "673eb8dcf78bb53d2cfeef39",
        "title": "IELTS Vocabulary - Level A1",
        "description": "Từ vựng cơ bản cho người mới bắt đầu học tiếng Anh",
        "category": "ACADEMIC",
        "level": "A1",
        "difficulty": "BEGINNER",
        "totalCards": 10,
        "isPublic": true,
        "isFeatured": true,
        "viewCount": 0,
        "studyCount": 0
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 4,
      "pages": 1
    }
  }
}
```

**💡 LẤY DECK_ID:** Copy `_id` của deck đầu tiên, lưu vào environment variable `deck_id`

---

### 2.2. Get Featured Decks
```
GET {{base_url}}/api/decks/featured?limit=5
```

---

### 2.3. Get Popular Decks
```
GET {{base_url}}/api/decks/popular?limit=5
```

---

### 2.4. Get Categories
```
GET {{base_url}}/api/decks/categories
```

**Response mẫu:**
```json
{
  "success": true,
  "data": [
    {
      "category": "ACADEMIC",
      "deckCount": 2,
      "totalCards": 20
    },
    {
      "category": "BUSINESS",
      "deckCount": 1,
      "totalCards": 10
    }
  ]
}
```

---

### 2.5. Get Deck Detail
```
GET {{base_url}}/api/decks/{{deck_id}}
```

**Response:** Thông tin chi tiết deck + danh sách flashcards

---

## 🎮 3. TEST STUDY SESSION (CẦN TOKEN) {#study}

### 3.1. Start Study Session
```
POST {{base_url}}/api/study/sessions/start
Authorization: Bearer {{token}}
Content-Type: application/json

Body (raw JSON):
{
  "deckId": "{{deck_id}}",
  "studyMode": "TYPE_IN",
  "sessionType": "LEARN_NEW",
  "cardLimit": 5
}
```

**studyMode options:**
- `FLIP` - Lật thẻ
- `TYPE_IN` - Gõ đáp án
- `MULTIPLE_CHOICE` - Trắc nghiệm
- `MIXED` - Kết hợp

**sessionType options:**
- `LEARN_NEW` - Học từ mới
- `REVIEW` - Ôn tập
- `PRACTICE` - Luyện tập
- `TEST` - Kiểm tra

**Response mẫu:**
```json
{
  "success": true,
  "message": "Phiên học đã được khởi tạo",
  "data": {
    "session": {
      "sessionId": "673ec123f78bb53d2cfeef50",
      "deckId": "673eb8dcf78bb53d2cfeef39",
      "deckTitle": "IELTS Vocabulary - Level A1",
      "studyMode": "TYPE_IN",
      "sessionType": "LEARN_NEW",
      "totalCards": 5,
      "startTime": "2025-11-01T10:00:00.000Z"
    },
    "flashcards": [
      {
        "_id": "673eb8dcf78bb53d2cfeef3a",
        "front": "hello",
        "back": "xin chào",
        "example": "Hello! How are you?",
        "imageUrl": "",
        "audioUrl": ""
      },
      {
        "_id": "673eb8dcf78bb53d2cfeef3b",
        "front": "goodbye",
        "back": "tạm biệt",
        "example": "Goodbye! See you later.",
        "imageUrl": "",
        "audioUrl": ""
      }
    ],
    "stats": {
      "newCards": 5,
      "reviewCards": 0
    }
  }
}
```

**💡 LƯU SESSION_ID:** Copy `session.sessionId` và lưu vào environment variable `session_id`

**Auto-save script (tab Tests):**
```javascript
if (pm.response.code === 201) {
    var jsonData = pm.response.json();
    pm.environment.set("session_id", jsonData.data.session.sessionId);
    console.log("Session ID saved:", jsonData.data.session.sessionId);
}
```

---

### 3.2. Submit Answer (Lặp lại cho từng thẻ)

#### Câu trả lời ĐÚNG:
```
POST {{base_url}}/api/study/sessions/{{session_id}}/answer
Authorization: Bearer {{token}}
Content-Type: application/json

Body (raw JSON):
{
  "flashcardId": "673eb8dcf78bb53d2cfeef3a",
  "userAnswer": "xin chào",
  "correct": true,
  "skipped": false,
  "responseTime": 5,
  "quality": 4
}
```

#### Câu trả lời SAI:
```json
{
  "flashcardId": "673eb8dcf78bb53d2cfeef3b",
  "userAnswer": "tạm biệt nhé",
  "correct": false,
  "skipped": false,
  "responseTime": 8,
  "quality": 2
}
```

#### BỎ QUA thẻ:
```json
{
  "flashcardId": "673eb8dcf78bb53d2cfeef3c",
  "userAnswer": "",
  "correct": false,
  "skipped": true,
  "responseTime": 2,
  "quality": 0
}
```

**Quality Rating (0-5):**
- `5`: Rất dễ - nhớ ngay
- `4`: Dễ - nhớ sau chút suy nghĩ
- `3`: Vừa - nhớ với chút khó khăn
- `2`: Khó - gần như quên
- `1`: Rất khó - quên hoàn toàn
- `0`: Quên hoàn toàn / Bỏ qua

**Response mẫu:**
```json
{
  "success": true,
  "message": "Đã ghi nhận câu trả lời",
  "data": {
    "session": {
      "sessionId": "673ec123f78bb53d2cfeef50",
      "completedCards": 1,
      "totalCards": 5,
      "correctAnswers": 1,
      "incorrectAnswers": 0,
      "streakCount": 1,
      "maxStreak": 1,
      "isCompleted": false
    },
    "progress": {
      "status": "LEARNING",
      "nextReviewDate": "2025-11-02T10:00:00.000Z",
      "accuracy": 100,
      "totalReviews": 1
    }
  }
}
```

---

### 3.3. Complete Session
```
POST {{base_url}}/api/study/sessions/{{session_id}}/complete
Authorization: Bearer {{token}}
```

**Response mẫu:**
```json
{
  "success": true,
  "message": "Chúc mừng! Bạn đã hoàn thành phiên học",
  "data": {
    "session": {
      "sessionId": "673ec123f78bb53d2cfeef50",
      "deck": {
        "id": "673eb8dcf78bb53d2cfeef39",
        "title": "IELTS Vocabulary - Level A1",
        "imageUrl": "/images/default-deck.png"
      },
      "studyMode": "TYPE_IN",
      "sessionType": "LEARN_NEW",
      "totalCards": 5,
      "completedCards": 5,
      "correctAnswers": 4,
      "incorrectAnswers": 1,
      "skippedCards": 0,
      "score": 80,
      "duration": 45,
      "xpEarned": 70,
      "maxStreak": 3,
      "startTime": "2025-11-01T10:00:00.000Z",
      "endTime": "2025-11-01T10:00:45.000Z"
    },
    "deckStats": {
      "totalSessions": 1,
      "totalCards": 5,
      "totalCorrect": 4,
      "totalIncorrect": 1,
      "totalXP": 70,
      "totalTime": 45,
      "averageScore": 80,
      "maxStreak": 3,
      "accuracy": 80
    }
  }
}
```

---

### 3.4. Get Session Details
```
GET {{base_url}}/api/study/sessions/{{session_id}}
Authorization: Bearer {{token}}
```

---

### 3.5. Abandon Session (Hủy phiên học)
```
POST {{base_url}}/api/study/sessions/{{session_id}}/abandon
Authorization: Bearer {{token}}
```

---

## 📊 4. TEST PROGRESS & STATS {#stats}

### 4.1. Get Deck Progress
```
GET {{base_url}}/api/study/progress/{{deck_id}}
Authorization: Bearer {{token}}
```

**Response mẫu:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalCards": 10,
      "studiedCards": 5,
      "unstudiedCards": 5,
      "newCards": 0,
      "learningCards": 3,
      "reviewingCards": 2,
      "masteredCards": 0,
      "dueCards": 2,
      "progressPercentage": 50
    },
    "recentProgress": [
      {
        "_id": "...",
        "flashcard": {
          "_id": "...",
          "front": "hello",
          "back": "xin chào"
        },
        "status": "LEARNING",
        "nextReviewDate": "2025-11-02T10:00:00.000Z",
        "accuracy": 100,
        "totalReviews": 1
      }
    ]
  }
}
```

---

### 4.2. Get Study Stats (Tổng quan)
```
GET {{base_url}}/api/study/stats
Authorization: Bearer {{token}}
```

**Với filter theo deck:**
```
GET {{base_url}}/api/study/stats?deckId={{deck_id}}
Authorization: Bearer {{token}}
```

**Response mẫu:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalSessions": 3,
      "totalCards": 15,
      "totalCorrect": 12,
      "totalIncorrect": 3,
      "totalXP": 210,
      "totalTime": 180,
      "averageScore": 80,
      "maxStreak": 5,
      "accuracy": 80
    },
    "recentSessions": [
      {
        "_id": "...",
        "deck": {
          "_id": "...",
          "title": "IELTS Vocabulary - Level A1",
          "imageUrl": "..."
        },
        "score": 80,
        "xpEarned": 70,
        "createdAt": "2025-11-01T10:00:00.000Z"
      }
    ],
    "dueCardsCount": 5
  }
}
```

---

## 📦 5. POSTMAN COLLECTION EXPORT {#collection}

### Tạo Collection hoàn chỉnh:

1. **Tạo Collection mới:** "Flashcard Study System"

2. **Tạo các folder:**
   - 📁 Authentication
   - 📁 Browse Decks (Public)
   - 📁 Study Session
   - 📁 Progress & Stats

3. **Thêm các requests theo hướng dẫn trên**

4. **Export Collection:**
   - Click vào collection > ... > Export
   - Chọn Collection v2.1
   - Save file JSON

---

## 🎯 FLOW TEST HOÀN CHỈNH

### Scenario: Test một phiên học hoàn chỉnh

```
1. Login
   POST /api/auth/login
   → Lấy token

2. Browse Decks
   GET /api/decks/browse
   → Chọn một deck, lấy deckId

3. Start Session
   POST /api/study/sessions/start
   Body: { deckId, studyMode: "TYPE_IN", sessionType: "LEARN_NEW" }
   → Lấy sessionId và danh sách flashcards

4. Submit Answers (lặp cho từng thẻ)
   POST /api/study/sessions/:sessionId/answer
   Body: { flashcardId, userAnswer, correct, quality }
   → Làm cho tất cả các thẻ

5. Complete Session
   POST /api/study/sessions/:sessionId/complete
   → Xem kết quả, XP, score

6. Check Progress
   GET /api/study/progress/:deckId
   → Xem tiến độ deck

7. Check Stats
   GET /api/study/stats
   → Xem thống kê tổng quan
```

---

## 🔥 TIPS & TRICKS

### 1. Sử dụng Variables
```javascript
// Trong tab Tests của request
pm.environment.set("variable_name", value);
pm.environment.get("variable_name");
```

### 2. Pre-request Script (Auto login nếu token hết hạn)
```javascript
// Thêm vào Pre-request Script của các request cần auth
const token = pm.environment.get("token");
if (!token) {
    pm.sendRequest({
        url: pm.environment.get("base_url") + "/api/auth/login",
        method: 'POST',
        header: {
            'Content-Type': 'application/json',
        },
        body: {
            mode: 'raw',
            raw: JSON.stringify({
                email: "admin@englishmaster.com",
                password: "admin123"
            })
        }
    }, function (err, res) {
        pm.environment.set("token", res.json().data.token);
    });
}
```

### 3. Test Script mẫu
```javascript
// Kiểm tra status code
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Kiểm tra response có success = true
pm.test("Response success is true", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
});

// Kiểm tra có data
pm.test("Response has data", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data).to.exist;
});
```

---

## ⚠️ TROUBLESHOOTING

### Error: Unauthorized
- Kiểm tra token có đúng không
- Token có hết hạn không (default 7 days)
- Thử login lại

### Error: Deck not found
- Chạy lại seed script
- Kiểm tra deck_id có đúng không

### Error: Session not found
- Session đã complete rồi
- Hoặc đã abandon
- Tạo session mới

### Error: Port 1124 in use
```bash
# Windows
netstat -ano | findstr :1124
taskkill /PID {pid} /F
```

---

## 📝 NOTES

- **Token expires:** Default 7 ngày
- **OTP expires:** 10 phút (nếu test register)
- **Session:** Có thể có nhiều session đồng thời
- **Quality rating:** Ảnh hưởng đến spaced repetition

---

## 🎉 DONE!

Bạn đã có đầy đủ để test Flashcard API!

**Bắt đầu:**
1. Seed data
2. Start server
3. Import vào Postman
4. Test từng endpoint
5. Hoặc test full flow

Chúc bạn test vui! 🚀
