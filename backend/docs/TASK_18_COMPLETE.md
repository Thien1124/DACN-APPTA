# ✅ Task 18 Complete - Deck Management

## 🎉 Hoàn thành

Hệ thống quản lý deck nâng cao đã được implement!

---

## 📁 Files

### Created (2 files):
1. **`src/controllers/deckManagementController.js`**
   - `cloneDeck()` - Sao chép deck
   - `mergeDecks()` - Hợp nhất decks
   - `splitDeck()` - Tách deck

2. **`docs/TASK_18_DECK_MANAGEMENT.md`**
   - API documentation ngắn gọn

### Updated (2 files):
1. **`src/routes/deckRoutes.js`**
   - Added 3 routes (clone, merge, split)

2. **`todo.md`**
   - Marked Task 18 complete

---

## 🎯 Features

### ✅ 1. Clone Deck
**Endpoint:** `POST /api/decks/:id/clone`

**Tính năng:**
- Sao chép toàn bộ deck + flashcards
- Tạo deck riêng để tùy chỉnh
- Chọn public/private

**Body:**
```json
{
  "newTitle": "My Copy",
  "isPublic": false
}
```

**Use case:**
- User thấy deck public hay → Clone về để sửa/thêm cards

---

### ✅ 2. Merge Decks
**Endpoint:** `POST /api/decks/merge`

**Tính năng:**
- Gộp 2+ decks thành 1
- Merge tất cả flashcards
- Kết hợp tags tự động

**Body:**
```json
{
  "deckIds": ["deck1", "deck2", "deck3"],
  "newTitle": "Combined Deck",
  "category": "GENERAL",
  "isPublic": false
}
```

**Use case:**
- Có nhiều decks cùng chủ đề → Merge để dễ quản lý

---

### ✅ 3. Split Deck
**Endpoint:** `POST /api/decks/:id/split`

**Tính năng:**
- Tách theo **size** (số thẻ mỗi deck)
- Tách theo **count** (số deck muốn tách)
- Tách **custom** (chọn cards cụ thể)

**Examples:**

#### Split by size (25 cards/deck):
```json
{
  "splitBy": "size",
  "criteria": "25"
}
```

#### Split into 3 equal decks:
```json
{
  "splitBy": "count",
  "criteria": "3",
  "newTitles": ["Easy", "Medium", "Hard"]
}
```

#### Split custom:
```json
{
  "splitBy": "custom",
  "criteria": [
    ["card1_id", "card2_id"],
    ["card3_id", "card4_id"]
  ]
}
```

**Use case:**
- Deck quá lớn (100+ cards) → Tách thành nhiều deck nhỏ

---

## 🔒 Permissions

| Action | Rule |
|--------|------|
| **Clone** | Deck public HOẶC owned by user |
| **Merge** | All decks must be accessible (public or owned) |
| **Split** | Must own the deck |

---

## 🧪 Quick Test

```bash
# 1. Get a deck ID first
GET http://localhost:1124/api/decks/browse

# 2. Clone deck
POST http://localhost:1124/api/decks/DECK_ID/clone
Authorization: Bearer YOUR_TOKEN
Body: { "newTitle": "Test Copy" }

# 3. Merge 2 decks
POST http://localhost:1124/api/decks/merge
Authorization: Bearer YOUR_TOKEN
Body: {
  "deckIds": ["id1", "id2"],
  "newTitle": "Merged Test"
}

# 4. Split deck into 2 parts
POST http://localhost:1124/api/decks/DECK_ID/split
Authorization: Bearer YOUR_TOKEN
Body: {
  "splitBy": "count",
  "criteria": "2"
}
```

---

## 📊 Technical Details

### Clone Process:
1. Find original deck
2. Check permissions (public or owned)
3. Create new deck with same attributes
4. Copy all flashcards
5. Update totalCards
6. Return new deck

### Merge Process:
1. Validate deckIds (min 2)
2. Check permissions for all decks
3. Collect all tags (unique)
4. Create merged deck
5. Copy flashcards from all decks
6. Update totalCards
7. Return merged deck + stats

### Split Process:
1. Find original deck
2. Check ownership
3. Get all flashcards
4. Split based on criteria:
   - **size**: chunks of N cards
   - **count**: N equal decks
   - **custom**: by card IDs
5. Create new decks
6. Copy flashcards to each deck
7. Return all new decks

---

## ⚡ Auto-features

- ✅ Auto-copy flashcards (front, back, example, images)
- ✅ Auto-update totalCards
- ✅ Auto-merge tags (unique)
- ✅ Original deck unchanged
- ✅ New decks owned by current user

---

## 📝 Notes

1. **Original deck safe**: Không bị xóa/thay đổi
2. **Flashcard copy**: Deep copy tất cả fields
3. **Permission checks**: Đảm bảo user có quyền
4. **New ownership**: Deck mới luôn thuộc về user thực hiện
5. **Private by default**: Split/Clone tạo deck private (có thể chọn public)

---

**Status**: ✅ Backend Complete  
**Date**: 2025-11-01  
**Task**: #18 - Deck Management  
**Files**: 2 created, 2 updated
