# Task 17: Quick Start Guide

## 🚀 Bắt đầu nhanh

### 1. Cài đặt (nếu chưa làm)
```bash
cd backend
npm install
```

### 2. Chạy server
```bash
npm run dev
```

### 3. Test với script
```bash
# Tạo sample reviews
node scripts/testDeckReviews.js
```

### 4. Test API

#### A. Preview Deck (Public - không cần token)
```bash
GET http://localhost:1124/api/decks/DECK_ID/preview
```

**Response:**
- Deck info
- 5 sample cards
- Rating distribution
- 3 recent reviews

#### B. Get All Reviews (Public)
```bash
GET http://localhost:1124/api/decks/DECK_ID/reviews?sort=helpful&page=1
```

#### C. Create Review (Private - cần token)
```bash
POST http://localhost:1124/api/decks/DECK_ID/reviews
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "rating": 5,
  "comment": "Deck này rất hay, giúp tôi học IELTS hiệu quả!",
  "aspects": {
    "content": 5,
    "difficulty": 4,
    "organization": 5
  }
}
```

#### D. Update Review (Private)
```bash
POST http://localhost:1124/api/decks/DECK_ID/reviews
Authorization: Bearer YOUR_TOKEN

{
  "rating": 4,
  "comment": "Updated comment"
}
```

#### E. Delete Review (Private)
```bash
DELETE http://localhost:1124/api/decks/DECK_ID/reviews
Authorization: Bearer YOUR_TOKEN
```

#### F. Mark Helpful (Private)
```bash
POST http://localhost:1124/api/reviews/REVIEW_ID/helpful
Authorization: Bearer YOUR_TOKEN
```

#### G. Report Review (Private)
```bash
POST http://localhost:1124/api/reviews/REVIEW_ID/report
Authorization: Bearer YOUR_TOKEN

{
  "reason": "Spam"
}
```

---

## 📊 Postman Collection

### Collection Setup

**Environment Variables:**
```
base_url: http://localhost:1124
token: YOUR_JWT_TOKEN
deck_id: DECK_ID_FROM_DATABASE
review_id: REVIEW_ID_FROM_RESPONSE
```

### Auto-save Token
Thêm vào **Scripts > Post-response** của Login request:
```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    pm.environment.set('token', jsonData.token);
     ('Token saved!');
}
```

---

## 🧪 Test Scenarios

### Scenario 1: Guest xem preview
1. Không cần login
2. GET `/api/decks/:id/preview`
3. Xem sample cards & reviews

### Scenario 2: User tạo review
1. Login để lấy token
2. POST `/api/decks/:id/reviews` với rating & comment
3. GET `/api/decks/:id/reviews` để xem review vừa tạo

### Scenario 3: User sửa review
1. POST `/api/decks/:id/reviews` với rating mới
2. Review được update (không tạo mới)

### Scenario 4: User đánh dấu helpful
1. GET `/api/decks/:id/reviews` để lấy review_id
2. POST `/api/reviews/:reviewId/helpful`
3. GET lại để xem helpfulCount tăng

### Scenario 5: User xóa review
1. DELETE `/api/decks/:id/reviews`
2. Deck rating tự động update

---

## 📋 Checklist

**Backend:**
- [x] DeckReview model
- [x] 7 API endpoints
- [x] Auto-update deck rating
- [x] Helpful system
- [x] Report system
- [x] Documentation
- [x] Test script

**Testing:**
- [ ] Test preview với deck có flashcards
- [ ] Test tạo review từ nhiều users
- [ ] Test update review
- [ ] Test delete review
- [ ] Test helpful toggle
- [ ] Test pagination
- [ ] Test sort options
- [ ] Test filter by rating
- [ ] Test report review
- [ ] Verify deck rating auto-update

**Frontend (TODO):**
- [ ] Preview page UI
- [ ] Review list component
- [ ] Create review form
- [ ] Rating stars component
- [ ] Helpful button
- [ ] Report button
- [ ] Pagination
- [ ] Sort & filter

---

## ❗ Lưu ý

1. **1 user = 1 review** per deck
   - Gọi POST lần đầu = CREATE
   - Gọi POST lần sau = UPDATE

2. **Rating range**: 1-5 (integer only)
   - Frontend nên validate trước khi gửi

3. **Comment length**: Max 1000 ký tự

4. **Helpful toggle**:
   - Click lần 1: Mark helpful
   - Click lần 2: Unmark helpful

5. **Auto-update rating**:
   - Khi create/update/delete review
   - Deck rating tự động tính lại

---

## 🎯 Next Steps

1. Test tất cả endpoints
2. Implement frontend
3. Add pagination cho reviews
4. Add admin panel để xem reported reviews
5. Add analytics cho popular decks

---

**Date**: 2025-11-01  
**Status**: ✅ Ready to test
