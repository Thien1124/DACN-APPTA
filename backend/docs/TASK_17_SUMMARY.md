# Task 17: Deck Preview & Reviews - Summary

## ✅ Đã hoàn thành

### 1. Model: DeckReview
- Rating 1-5 sao (required)
- Comment (tối đa 1000 ký tự)
- Detailed aspects: content, difficulty, organization
- Helpful system: helpfulCount, helpfulUsers
- Report system: isReported, reportCount
- Auto-update deck rating

### 2. API Endpoints (7 endpoints)

#### Public (không cần login):
1. **GET /api/decks/:id/preview** - Xem preview với sample cards
2. **GET /api/decks/:id/reviews** - Lấy tất cả reviews

#### Private (cần login):
3. **POST /api/decks/:id/reviews** - Tạo/cập nhật review
4. **DELETE /api/decks/:id/reviews** - Xóa review của mình
5. **GET /api/decks/:id/reviews/my** - Lấy review của mình
6. **POST /api/reviews/:reviewId/helpful** - Toggle helpful vote
7. **POST /api/reviews/:reviewId/report** - Báo cáo review

### 3. Features

✅ **Preview System:**
- Deck info (title, description, stats)
- 5 sample cards ngẫu nhiên
- Rating distribution (1-5 stars)
- 3 recent reviews

✅ **Review System:**
- Create/Update/Delete review
- 1 user = 1 review per deck
- Rating với aspects (content, difficulty, organization)
- Auto-update deck rating

✅ **Social Features:**
- Helpful votes (like/unlike)
- Report inappropriate reviews
- Sort: newest, helpful, rating-high, rating-low
- Filter by rating (1-5)

---

## 📁 Files

**Created:**
1. `src/models/DeckReview.js` - Review model
2. `src/controllers/deckPreviewController.js` - 7 controller functions
3. `src/routes/reviewRoutes.js` - Review action routes
4. `docs/TASK_17_PREVIEW_REVIEWS.md` - Documentation
5. `scripts/testDeckReviews.js` - Test script

**Updated:**
1. `src/routes/deckRoutes.js` - Thêm preview & review routes
2. `server.js` - Register review routes
3. `todo.md` - Task 17 completed

---

## 🧪 Quick Test

```bash
# 1. Test với script
node scripts/testDeckReviews.js

# 2. Test với Postman
# Public - Preview deck
GET http://localhost:1124/api/decks/DECK_ID/preview

# Public - Get reviews
GET http://localhost:1124/api/decks/DECK_ID/reviews?sort=helpful

# Private - Create review (need token)
POST http://localhost:1124/api/decks/DECK_ID/reviews
Authorization: Bearer YOUR_TOKEN
Body: {
  "rating": 5,
  "comment": "Great deck!"
}

# Private - Mark helpful
POST http://localhost:1124/api/reviews/REVIEW_ID/helpful
Authorization: Bearer YOUR_TOKEN
```

---

## 🔥 Key Points

1. **1 user = 1 review** per deck (unique index)
2. **Auto-update rating**: Deck rating tự động cập nhật khi có review mới/sửa/xóa
3. **Public preview**: Ai cũng xem được preview & reviews
4. **Protected actions**: Chỉ logged-in users mới tạo/sửa/xóa review
5. **Helpful toggle**: Click lần 1 = mark helpful, click lần 2 = unmark

---

## 📊 Database Schema

```javascript
DeckReview {
  deck: ObjectId (ref Deck)
  user: ObjectId (ref User)
  rating: Number (1-5, required)
  comment: String (max 1000)
  aspects: {
    content: Number (1-5)
    difficulty: Number (1-5)
    organization: Number (1-5)
  }
  helpfulCount: Number
  helpfulUsers: [ObjectId]
  isReported: Boolean
  reportCount: Number
  timestamps
}
```

**Indexes:**
- Compound unique: `{ deck: 1, user: 1 }`
- Sort helpful: `{ helpfulCount: -1, createdAt: -1 }`

---

## 🎯 Next Steps

1. **Frontend**: Build preview & review UI
2. **Testing**: Test với nhiều users
3. **Admin Panel**: Xem reported reviews
4. **Analytics**: Track popular decks based on reviews

---

**Status**: ✅ Backend Complete  
**Date**: 2025-11-01  
**Task**: #17 - Preview & Reviews
