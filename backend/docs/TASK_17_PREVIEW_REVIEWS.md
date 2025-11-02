# Task 17: Xem trước thẻ & Đánh giá Deck

## 📋 Mô tả
Cho phép user xem trước các thẻ mẫu và đọc đánh giá từ người dùng khác trước khi quyết định học deck đó.

## 🎯 Tính năng

### 1. Deck Preview
- Xem thông tin deck (title, description, stats)
- Xem 5 thẻ mẫu ngẫu nhiên
- Xem phân bố rating (1-5 sao)
- Xem 3 review gần nhất

### 2. Review System
- Đánh giá 1-5 sao
- Viết nhận xét (tối đa 1000 ký tự)
- Đánh giá chi tiết (content, difficulty, organization)
- Sửa/xóa review của mình

### 3. Review Actions
- Đánh dấu review hữu ích (helpful)
- Báo cáo review không phù hợp
- Lọc & sắp xếp reviews

---

## 🔌 API Endpoints

### 1. GET /api/decks/:id/preview (Public)
Xem trước deck với sample cards

**Response:**
```json
{
  "success": true,
  "data": {
    "deck": {
      "_id": "deck123",
      "title": "Business English",
      "totalCards": 50,
      "rating": 4.5,
      "ratingCount": 120
    },
    "sampleCards": [
      {
        "front": "negotiate",
        "back": "thương lượng",
        "example": "Let's negotiate the price"
      }
    ],
    "totalCards": 50,
    "ratingDistribution": {
      "5": 60,
      "4": 40,
      "3": 15,
      "2": 3,
      "1": 2
    },
    "recentReviews": [...]
  }
}
```

---

### 2. GET /api/decks/:id/reviews (Public)
Lấy tất cả reviews của deck

**Query:**
- `sort`: newest | helpful | rating-high | rating-low
- `rating`: 1-5 (lọc theo rating)
- `page`, `limit`: phân trang

**Response:**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "_id": "review123",
        "rating": 5,
        "comment": "Deck rất hay!",
        "helpfulCount": 15,
        "user": {
          "fullName": "Nguyễn Văn A",
          "avatar": "avatar.jpg"
        },
        "createdAt": "2025-10-15"
      }
    ],
    "ratingDistribution": {...},
    "pagination": {...}
  }
}
```

---

### 3. POST /api/decks/:id/reviews (Private)
Tạo hoặc cập nhật review

**Body:**
```json
{
  "rating": 5,
  "comment": "Deck rất hữu ích cho người mới bắt đầu",
  "aspects": {
    "content": 5,
    "difficulty": 4,
    "organization": 5
  }
}
```

---

### 4. DELETE /api/decks/:id/reviews (Private)
Xóa review của mình

---

### 5. GET /api/decks/:id/reviews/my (Private)
Lấy review của mình cho deck này

---

### 6. POST /api/reviews/:reviewId/helpful (Private)
Đánh dấu review hữu ích (toggle)

---

### 7. POST /api/reviews/:reviewId/report (Private)
Báo cáo review không phù hợp

**Body:**
```json
{
  "reason": "Spam/Inappropriate content"
}
```

---

## 🧪 Test với Postman

### Test 1: Xem preview deck
```
GET http://localhost:1124/api/decks/DECK_ID/preview?sampleSize=5
```

### Test 2: Lấy tất cả reviews
```
GET http://localhost:1124/api/decks/DECK_ID/reviews?sort=helpful&page=1&limit=10
```

### Test 3: Tạo review (cần login)
```
POST http://localhost:1124/api/decks/DECK_ID/reviews
Headers: Authorization: Bearer YOUR_TOKEN
Body: {
  "rating": 5,
  "comment": "Deck rất tốt!"
}
```

### Test 4: Đánh dấu helpful (cần login)
```
POST http://localhost:1124/api/reviews/REVIEW_ID/helpful
Headers: Authorization: Bearer YOUR_TOKEN
```

### Test 5: Lọc review theo rating
```
GET http://localhost:1124/api/decks/DECK_ID/reviews?rating=5&sort=newest
```

---

## 💡 Use Cases

**1. User xem deck trước khi học:**
```
1. GET /api/decks/:id/preview
   -> Xem info + sample cards + recent reviews
   
2. GET /api/decks/:id/reviews?sort=helpful
   -> Đọc reviews hữu ích nhất
   
3. Quyết định học hoặc không
```

**2. User đánh giá deck sau khi học:**
```
1. Học xong deck
2. POST /api/decks/:id/reviews
   -> Viết đánh giá
```

**3. User đọc và tương tác với reviews:**
```
1. GET /api/decks/:id/reviews
2. POST /api/reviews/:reviewId/helpful
   -> Đánh dấu review hữu ích
```

---

## 📝 Notes

- **Public**: Preview & Reviews list không cần login
- **Private**: Tạo/sửa/xóa review, helpful, report cần login
- **1 user = 1 review** cho mỗi deck
- Auto update deck rating khi có review mới
- Rating: 1-5 sao (integer only)

---

**Files:**
- Model: `src/models/DeckReview.js`
- Controller: `src/controllers/deckPreviewController.js`
- Routes: `src/routes/deckRoutes.js`, `src/routes/reviewRoutes.js`
