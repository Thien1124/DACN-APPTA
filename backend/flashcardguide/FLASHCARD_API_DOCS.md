# 📚 Flashcard Study System API Documentation

## 🎯 Tổng quan

Hệ thống Flashcard với **Spaced Repetition Algorithm (SM-2)** giúp người dùng học và ghi nhớ từ vựng hiệu quả.

### ✨ Tính năng chính:
- ✅ **Ôn tập lật thẻ (Flip Mode)** - Lật thẻ xem đáp án
- ✅ **Gõ đáp án (Type-In Mode)** - Nhập câu trả lời để kiểm tra
- ✅ **Trắc nghiệm (Multiple Choice)** - Chọn đáp án đúng
- ✅ **Spaced Repetition** - Thuật toán lặp lại theo khoảng thời gian
- ✅ **Progress Tracking** - Theo dõi tiến độ học
- ✅ **Statistics** - Thống kê chi tiết

---

## 📖 API Endpoints

### 1️⃣ Study Session Management

#### **Bắt đầu phiên học mới**
```http
POST /api/study/sessions/start
Authorization: Bearer {token}
Content-Type: application/json

{
  "deckId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "studyMode": "FLIP",           // FLIP | TYPE_IN | MULTIPLE_CHOICE | MIXED
  "sessionType": "LEARN_NEW",    // LEARN_NEW | REVIEW | PRACTICE | TEST
  "cardLimit": 10                // Số thẻ tối đa (optional)
}
```

**Response:**
```json
{
  "success": true,
  "message": "Phiên học đã được khởi tạo",
  "data": {
    "session": {
      "sessionId": "60f7b3b3b3b3b3b3b3b3b3b3",
      "deckId": "60f7b3b3b3b3b3b3b3b3b3b3",
      "deckTitle": "IELTS Vocabulary - Unit 1",
      "studyMode": "FLIP",
      "sessionType": "LEARN_NEW",
      "totalCards": 10,
      "startTime": "2025-11-01T10:00:00.000Z"
    },
    "flashcards": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "front": "accomplish",
        "back": "hoàn thành, đạt được",
        "example": "She accomplished her goal of learning English.",
        "imageUrl": "/images/accomplish.jpg",
        "audioUrl": "/audio/accomplish.mp3"
      }
    ],
    "stats": {
      "newCards": 10,
      "reviewCards": 0
    }
  }
}
```

---

#### **Gửi câu trả lời**
```http
POST /api/study/sessions/:sessionId/answer
Authorization: Bearer {token}
Content-Type: application/json

{
  "flashcardId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "userAnswer": "hoàn thành",       // Câu trả lời của user (nếu TYPE_IN)
  "correct": true,                   // true/false
  "skipped": false,                  // true nếu bỏ qua
  "responseTime": 5,                 // Thời gian trả lời (giây)
  "quality": 4                       // 0-5 (độ khó: 0=rất khó, 5=rất dễ)
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đã ghi nhận câu trả lời",
  "data": {
    "session": {
      "sessionId": "60f7b3b3b3b3b3b3b3b3b3b3",
      "completedCards": 1,
      "totalCards": 10,
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

#### **Hoàn thành phiên học**
```http
POST /api/study/sessions/:sessionId/complete
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Chúc mừng! Bạn đã hoàn thành phiên học",
  "data": {
    "session": {
      "sessionId": "60f7b3b3b3b3b3b3b3b3b3b3",
      "deck": {
        "id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "title": "IELTS Vocabulary - Unit 1",
        "imageUrl": "/images/deck1.jpg"
      },
      "studyMode": "FLIP",
      "sessionType": "LEARN_NEW",
      "totalCards": 10,
      "completedCards": 10,
      "correctAnswers": 8,
      "incorrectAnswers": 2,
      "skippedCards": 0,
      "score": 80,
      "duration": 300,
      "xpEarned": 110,
      "maxStreak": 5,
      "startTime": "2025-11-01T10:00:00.000Z",
      "endTime": "2025-11-01T10:05:00.000Z"
    },
    "deckStats": {
      "totalSessions": 5,
      "totalCards": 50,
      "totalCorrect": 42,
      "totalIncorrect": 8,
      "totalXP": 550,
      "totalTime": 1500,
      "averageScore": 84,
      "maxStreak": 12,
      "accuracy": 84
    }
  }
}
```

---

#### **Hủy phiên học**
```http
POST /api/study/sessions/:sessionId/abandon
Authorization: Bearer {token}
```

---

#### **Lấy chi tiết phiên học**
```http
GET /api/study/sessions/:sessionId
Authorization: Bearer {token}
```

---

### 2️⃣ Progress & Statistics

#### **Lấy tiến độ học của một deck**
```http
GET /api/study/progress/:deckId
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalCards": 100,
      "studiedCards": 45,
      "unstudiedCards": 55,
      "newCards": 5,
      "learningCards": 15,
      "reviewingCards": 20,
      "masteredCards": 5,
      "dueCards": 10,
      "progressPercentage": 45
    },
    "recentProgress": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "flashcard": {
          "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
          "front": "accomplish",
          "back": "hoàn thành"
        },
        "status": "REVIEWING",
        "nextReviewDate": "2025-11-02T10:00:00.000Z",
        "accuracy": 85,
        "totalReviews": 7
      }
    ]
  }
}
```

---

#### **Lấy thống kê tổng quan**
```http
GET /api/study/stats?deckId=xxx&period=week
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalSessions": 25,
      "totalCards": 250,
      "totalCorrect": 210,
      "totalIncorrect": 40,
      "totalXP": 2500,
      "totalTime": 7200,
      "averageScore": 84,
      "maxStreak": 15,
      "accuracy": 84
    },
    "recentSessions": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "deck": {
          "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
          "title": "IELTS Vocabulary - Unit 1",
          "imageUrl": "/images/deck1.jpg"
        },
        "score": 85,
        "xpEarned": 120,
        "createdAt": "2025-11-01T10:00:00.000Z"
      }
    ],
    "dueCardsCount": 15
  }
}
```

---

### 3️⃣ Deck Management (Public)

#### **Browse & Filter Decks**
```http
GET /api/decks/browse?category=ACADEMIC&level=B1&sort=popular&page=1&limit=20
```

**Query Parameters:**
- `category`: ACADEMIC | TRAVEL | BUSINESS | DAILY_LIFE | TECHNOLOGY | HEALTH | ENTERTAINMENT | FOOD | GENERAL
- `level`: A1 | A2 | B1 | B2 | C1 | C2
- `difficulty`: BEGINNER | INTERMEDIATE | ADVANCED
- `tags`: comma-separated tags
- `isFeatured`: true | false
- `search`: text search
- `sort`: newest | popular | rating | oldest
- `page`: page number (default: 1)
- `limit`: items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "count": 20,
  "data": {
    "decks": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    },
    "filters": {
      "category": "ACADEMIC",
      "level": "B1",
      "sort": "popular"
    }
  }
}
```

---

#### **Lấy danh sách categories**
```http
GET /api/decks/categories
```

---

#### **Lấy decks nổi bật**
```http
GET /api/decks/featured?limit=10
```

---

#### **Lấy decks phổ biến**
```http
GET /api/decks/popular?category=ACADEMIC&limit=10
```

---

## 🎮 Study Modes

### 1. FLIP Mode (Lật thẻ)
- User xem mặt trước → click để xem mặt sau
- Tự đánh giá: Again | Hard | Good | Easy
- `quality`: 0-2 (Again), 2-3 (Hard), 3-4 (Good), 4-5 (Easy)

### 2. TYPE_IN Mode (Gõ đáp án)
- User nhập câu trả lời
- Hệ thống so sánh với đáp án đúng
- Cho phép sai chính tả nhẹ (có thể config)

### 3. MULTIPLE_CHOICE Mode (Trắc nghiệm)
- Hiển thị 4 lựa chọn
- User chọn đáp án đúng

### 4. MIXED Mode
- Kết hợp các mode trên

---

## 🧠 Spaced Repetition Algorithm (SM-2)

### Công thức:
```
I(n) = I(n-1) × EF
```

- **I(n)**: Interval (khoảng thời gian đến lần review tiếp theo)
- **EF**: Ease Factor (độ khó - từ 1.3 đến 2.5)

### Quality Rating:
- **5**: Rất dễ - nhớ ngay
- **4**: Dễ - nhớ sau một chút suy nghĩ
- **3**: Vừa - nhớ với một chút khó khăn
- **2**: Khó - gần như quên
- **1**: Rất khó - quên hoàn toàn nhưng nhớ lại được
- **0**: Quên hoàn toàn

### Card Status:
- **NEW**: Chưa học
- **LEARNING**: Đang học (interval < 7 ngày)
- **REVIEWING**: Ôn tập (interval >= 7 ngày)
- **MASTERED**: Đã thành thạo (repetitions >= 5, accuracy >= 90%)

---

## 📊 XP Calculation

```javascript
XP = (correctAnswers × 10) + accuracyBonus + streakBonus + completionBonus

// Accuracy Bonus:
- 90-100%: +50 XP
- 80-89%: +30 XP
- 70-79%: +15 XP

// Streak Bonus:
- 10+ streak: +25 XP
- 5-9 streak: +10 XP

// Completion Bonus:
- Complete all cards: +20 XP
```

---

## 🔧 Frontend Integration

### Flow học Flashcard:

```javascript
// 1. Khởi tạo phiên học
const session = await startStudySession({
  deckId: '...',
  studyMode: 'TYPE_IN',
  sessionType: 'LEARN_NEW'
});

// 2. Loop qua các flashcards
for (const card of session.flashcards) {
  // Hiển thị card
  displayCard(card);
  
  // Đợi user trả lời
  const answer = await getUserAnswer();
  
  // Gửi kết quả
  await submitAnswer({
    flashcardId: card._id,
    userAnswer: answer.text,
    correct: answer.isCorrect,
    responseTime: answer.time,
    quality: answer.quality
  });
}

// 3. Hoàn thành
const result = await completeSession(session.sessionId);
showResults(result);
```

---

## 🎨 UI/UX Suggestions

### Study Screen:
- Progress bar (5/10 cards)
- Current streak indicator
- Timer
- Card với animation lật
- Buttons: Skip | Check Answer | Continue

### Results Screen:
- Score với confetti animation
- XP earned với progress bar
- Accuracy chart
- Review mistakes button
- Continue learning button

### Progress Dashboard:
- Cards by status (pie chart)
- Study streak calendar
- Daily/Weekly study time graph
- Mastered words count

---

## 🚀 Next Steps

### Có thể thêm:
1. **Achievements** - Huy hiệu khi đạt milestone
2. **Daily Goals** - Mục tiêu học hàng ngày
3. **Leaderboard** - Bảng xếp hạng
4. **Social Features** - Chia sẻ tiến độ
5. **Offline Mode** - Học offline
6. **Audio Pronunciation** - Phát âm từ vựng
7. **Image Recognition** - Học qua hình ảnh
8. **Voice Input** - Nhập bằng giọng nói

---

Chúc bạn code vui! 🎉
