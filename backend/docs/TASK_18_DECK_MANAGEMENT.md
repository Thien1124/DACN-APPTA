# Task 18: Tạo/Sao chép/Hợp nhất/Tách Deck

## 📋 Mô tả
Quản lý deck nâng cao: sao chép, hợp nhất, tách deck để tùy chỉnh nội dung học tập cá nhân.

## 🎯 Tính năng

### 1. Clone Deck (Sao chép)
- Sao chép toàn bộ deck + flashcards
- Tạo bản sao riêng để tùy chỉnh
- Chọn public/private cho deck mới

### 2. Merge Decks (Hợp nhất)
- Gộp nhiều deck thành 1
- Kết hợp flashcards từ tất cả deck
- Merge tags tự động

### 3. Split Deck (Tách)
- Tách deck theo số lượng
- Tách thành N deck bằng nhau
- Tách theo custom (chọn cards cụ thể)

---

## 🔌 API Endpoints

### 1. POST /api/decks/:id/clone (Private)
Sao chép deck

**Body:**
```json
{
  "newTitle": "My Copy of Business English",
  "isPublic": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đã sao chép bộ thẻ thành công (50 thẻ)",
  "data": {
    "_id": "new_deck_id",
    "title": "My Copy of Business English",
    "totalCards": 50,
    ...
  }
}
```

---

### 2. POST /api/decks/merge (Private)
Hợp nhất nhiều deck

**Body:**
```json
{
  "deckIds": ["deck1_id", "deck2_id", "deck3_id"],
  "newTitle": "Combined English Vocabulary",
  "newDescription": "Hợp nhất từ 3 deck",
  "category": "GENERAL",
  "level": "B1",
  "difficulty": "INTERMEDIATE",
  "isPublic": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đã hợp nhất 3 bộ thẻ thành công (120 thẻ)",
  "data": {
    "mergedDeck": {
      "_id": "merged_deck_id",
      "title": "Combined English Vocabulary",
      "totalCards": 120
    },
    "sourceDecks": [
      { "id": "deck1_id", "title": "Deck 1" },
      { "id": "deck2_id", "title": "Deck 2" }
    ],
    "totalFlashcards": 120
  }
}
```

---

### 3. POST /api/decks/:id/split (Private)
Tách deck

#### A. Tách theo size (số thẻ mỗi deck)
```json
{
  "splitBy": "size",
  "criteria": "25",
  "newTitles": ["Part 1", "Part 2"]
}
```

#### B. Tách thành N deck bằng nhau
```json
{
  "splitBy": "count",
  "criteria": "3",
  "newTitles": ["Deck 1", "Deck 2", "Deck 3"]
}
```

#### C. Tách custom (chọn cards cụ thể)
```json
{
  "splitBy": "custom",
  "criteria": [
    ["card1_id", "card2_id"],
    ["card3_id", "card4_id"]
  ],
  "newTitles": ["Easy Cards", "Hard Cards"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đã tách bộ thẻ thành 3 bộ mới",
  "data": {
    "originalDeck": {
      "id": "original_id",
      "title": "Original Deck",
      "totalCards": 75
    },
    "newDecks": [
      { "id": "new1_id", "title": "Part 1", "totalCards": 25 },
      { "id": "new2_id", "title": "Part 2", "totalCards": 25 },
      { "id": "new3_id", "title": "Part 3", "totalCards": 25 }
    ],
    "totalCards": 75
  }
}
```

---

## 🧪 Test với Postman

### Test 1: Clone deck
```
POST http://localhost:1124/api/decks/DECK_ID/clone
Authorization: Bearer YOUR_TOKEN

Body:
{
  "newTitle": "My Personal Copy",
  "isPublic": false
}
```

### Test 2: Merge decks
```
POST http://localhost:1124/api/decks/merge
Authorization: Bearer YOUR_TOKEN

Body:
{
  "deckIds": ["deck1_id", "deck2_id"],
  "newTitle": "Merged Deck",
  "category": "GENERAL",
  "isPublic": false
}
```

### Test 3: Split deck (by size)
```
POST http://localhost:1124/api/decks/DECK_ID/split
Authorization: Bearer YOUR_TOKEN

Body:
{
  "splitBy": "size",
  "criteria": "20"
}
```

### Test 4: Split deck (by count)
```
POST http://localhost:1124/api/decks/DECK_ID/split
Authorization: Bearer YOUR_TOKEN

Body:
{
  "splitBy": "count",
  "criteria": "3",
  "newTitles": ["Easy", "Medium", "Hard"]
}
```

---

## 💡 Use Cases

**1. Clone deck để tùy chỉnh:**
```
User thấy deck public hay
→ Clone về
→ Sửa/thêm cards riêng
→ Deck riêng của mình
```

**2. Merge decks cùng chủ đề:**
```
Có 3 decks: Travel 1, Travel 2, Travel 3
→ Merge thành 1 deck "Complete Travel"
→ Dễ quản lý và học
```

**3. Split deck quá lớn:**
```
Deck có 100 cards (quá nhiều)
→ Split thành 4 decks x 25 cards
→ Học từng phần nhỏ
```

---

## 📝 Notes

- **Clone**: Chỉ clone được deck public hoặc deck của mình
- **Merge**: Cần ít nhất 2 decks
- **Split**: Chỉ split được deck của mình
- **Ownership**: Deck mới luôn thuộc về user thực hiện
- **Flashcards**: Tự động copy toàn bộ (front, back, example, images)
- **Original deck**: Không bị xóa/thay đổi

---

## ⚠️ Validation

| Action | Requirements |
|--------|-------------|
| Clone | Deck phải public HOẶC thuộc về user |
| Merge | Min 2 decks, tất cả phải accessible |
| Split | Deck phải thuộc về user |
| Split size | Criteria phải > 0 |
| Split count | Criteria phải >= 2 |

---

**Files:**
- Controller: `src/controllers/deckManagementController.js`
- Routes: `src/routes/deckRoutes.js` (updated)
