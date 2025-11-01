# TODO List

## ✅ Task: Flashcard System (COMPLETED - Nov 1, 2025)

**Tính năng:** Hệ thống ôn tập flashcard với Spaced Repetition Algorithm

### Đã hoàn thành:
- ✅ Model `StudyProgress` - Theo dõi tiến độ học của user
- ✅ Model `StudySession` - Quản lý phiên học
- ✅ Controller `studyController` - Xử lý logic ôn tập
- ✅ Routes `/api/study/*` - API endpoints
- ✅ Spaced Repetition Algorithm (SM-2)
- ✅ Multiple study modes (FLIP, TYPE_IN, MULTIPLE_CHOICE)
- ✅ Progress tracking & Statistics
- ✅ XP calculation & Streak tracking
- ✅ Browse & Filter Decks (public)
- ✅ API Documentation
- ✅ Seed script cho test data

### Files tạo mới:
1. `/src/models/StudyProgress.js` - Model tiến độ học
2. `/src/models/StudySession.js` - Model phiên học
3. `/src/controllers/studyController.js` - Controller
4. `/src/routes/studyRoutes.js` - Routes
5. `/scripts/seedFlashcards.js` - Script seed data
6. `/FLASHCARD_API_DOCS.md` - Documentation

### Files đã cập nhật:
1. `server.js` - Thêm study routes
2. `src/routes/deckRoutes.js` - Đã có sẵn (không cần sửa)
3. `src/controllers/deckController.js` - Đã có browse/filter

---

## ✅ Task 19: Note Type System (COMPLETED - Nov 1, 2025)

**Tính năng:** Tạo flashcard với 4 kiểu note: WORD, PHRASE, SENTENCE, CLOZE

### Đã hoàn thành:
- ✅ Updated `Flashcard` model với noteType field
- ✅ 4 note types: WORD, PHRASE, SENTENCE, CLOZE
- ✅ API `/note-type` - Tạo flashcard theo note type
- ✅ API `/note-type/bulk` - Tạo nhiều flashcards
- ✅ API `/note-type/:noteType` - Lấy flashcards theo type
- ✅ API `/note-type/stats/:deckId` - Thống kê note types
- ✅ CLOZE support với {{c1::answer}} format
- ✅ Pronunciation field (IPA)
- ✅ Hints field
- ✅ Auto-fill front/back based on noteType
- ✅ API Documentation

### Features:
1. **WORD** - Từ đơn (word, meaning, pronunciation, example)
2. **PHRASE** - Cụm từ (phrase, meaning, example)
3. **SENTENCE** - Câu (sentence, translation, context)
4. **CLOZE** - Điền khuyết (clozeText, clozeAnswers)

### Files tạo mới:
1. `/src/controllers/noteTypeController.js` - Controller cho note types
2. `/docs/TASK_19_NOTE_TYPE_SYSTEM.md` - Documentation

### Files đã cập nhật:
1. `/src/models/Flashcard.js` - Thêm noteType, clozeText, clozeAnswers, pronunciation, hints
2. `/src/routes/flashcardRoutes.js` - Thêm note type routes

### Test Commands:
```bash
# Create WORD
POST /api/flashcards/note-type
{
  "noteType": "WORD",
  "deckId": "...",
  "word": "beautiful",
  "meaning": "đẹp"
}

# Create CLOZE
POST /api/flashcards/note-type
{
  "noteType": "CLOZE",
  "deckId": "...",
  "clozeText": "I {{c1::am}} happy.",
  "clozeAnswers": ["am"]
}

# Get stats
GET /api/flashcards/note-type/stats/:deckId
```

---

## ✅ Task 16: Tìm kiếm theo từ khóa và tags (COMPLETED - Nov 1, 2025)

**Tính năng:** Tìm kiếm bộ thẻ bằng từ khóa hoặc tag liên quan

### Đã hoàn thành:
- ✅ Text indexes cho full-text search
- ✅ API `/search` - Tìm kiếm nâng cao với keyword & tags
- ✅ API `/search/suggestions` - Autocomplete suggestions
- ✅ API `/tags` - Lấy tất cả tags với counts
- ✅ Multiple filters (category, level, difficulty, cards, rating)
- ✅ Multiple sort options (relevance, popular, rating, newest, cards)
- ✅ Pagination support
- ✅ Matched tags highlighting
- ✅ Error handling & validation
- ✅ API Documentation
- ✅ Postman test guide

### Features:
1. **Keyword Search** - Tìm trong title, description, tags, subcategory
2. **Tag Search** - Tìm theo tags (exact/partial match)
3. **Advanced Filters** - Category, Level, Difficulty, Card count, Rating
4. **Sort Options** - Relevance, Popular, Rating, Newest, Cards
5. **Autocomplete** - Suggestions cho titles, tags, categories
6. **Tag Cloud** - Lấy all tags để hiển thị tag cloud

### Files đã cập nhật:
1. `/src/models/Deck.js` - Thêm text indexes
2. `/src/routes/deckRoutes.js` - Thêm search routes
3. `/src/controllers/deckController.js` - Thêm search controllers

### Files tạo mới:
1. `/docs/TASK_16_SEARCH.md` - API documentation
2. `/docs/POSTMAN_TASK_16.md` - Postman test guide

### Test với Postman:
```bash
# Search by keyword
GET /api/decks/search?keyword=business

# Search by tags
GET /api/decks/search?tags=ielts,business

# Combined search
GET /api/decks/search?keyword=english&tags=ielts&category=ACADEMIC&level=B1,B2

# Autocomplete
GET /api/decks/search/suggestions?q=bus

# Get all tags
GET /api/decks/tags?minCount=5
```

---

## ✅ Task 17: Xem trước thẻ & Đánh giá Deck (COMPLETED - Nov 1, 2025)

**Tính năng:** Xem trước sample cards và đọc reviews trước khi học deck

### Đã hoàn thành:
- ✅ Model `DeckReview` - Đánh giá & nhận xét deck
- ✅ Deck preview với sample cards
- ✅ Review system (create, update, delete)
- ✅ Rating 1-5 sao với aspects (content, difficulty, organization)
- ✅ Helpful votes system (like/unlike reviews)
- ✅ Report review system
- ✅ Rating distribution display
- ✅ Auto update deck rating
- ✅ Filter & sort reviews (newest, helpful, rating)
- ✅ Public & Private endpoints
- ✅ API Documentation

### Features:
1. **Deck Preview** - Xem deck info + 5 sample cards + recent reviews
2. **Create Review** - Rating 1-5 + comment + detailed aspects
3. **Update/Delete Review** - Sửa/xóa review của mình
4. **Helpful System** - Đánh dấu review hữu ích
5. **Report System** - Báo cáo review không phù hợp
6. **Rating Stats** - Phân bố rating 1-5 sao

### Files tạo mới:
1. `/src/models/DeckReview.js` - Review model với auto-update rating
2. `/src/controllers/deckPreviewController.js` - Preview & Review controllers
3. `/src/routes/reviewRoutes.js` - Review action routes
4. `/docs/TASK_17_PREVIEW_REVIEWS.md` - Documentation

### Files đã cập nhật:
1. `/src/routes/deckRoutes.js` - Thêm preview & review routes
2. `server.js` - Thêm review routes

### Test với Postman:
```bash
# Preview deck (Public)
GET /api/decks/:id/preview?sampleSize=5

# Get reviews (Public)
GET /api/decks/:id/reviews?sort=helpful&page=1

# Create review (Private - need token)
POST /api/decks/:id/reviews
Body: { "rating": 5, "comment": "Great deck!" }

# Mark helpful (Private)
POST /api/reviews/:reviewId/helpful
```

---

## ✅ Task 18: Tạo/Sao chép/Hợp nhất/Tách Deck (COMPLETED - Nov 1, 2025)

**Tính năng:** Quản lý deck nâng cao để tùy chỉnh nội dung học tập

### Đã hoàn thành:
- ✅ Clone/Copy deck - Sao chép deck + flashcards
- ✅ Merge decks - Hợp nhất nhiều deck thành 1
- ✅ Split deck - Tách deck theo size/count/custom
- ✅ Permission checks (ownership, public access)
- ✅ Auto-copy flashcards
- ✅ Tags merging
- ✅ API Documentation

### Features:
1. **Clone Deck** - Sao chép toàn bộ deck với flashcards
2. **Merge Decks** - Gộp 2+ decks thành 1 deck mới
3. **Split Deck** - Tách deck theo:
   - Size (số thẻ mỗi deck)
   - Count (số deck muốn tách)
   - Custom (chọn cards cụ thể)

### Files tạo mới:
1. `/src/controllers/deckManagementController.js` - 3 controllers
2. `/docs/TASK_18_DECK_MANAGEMENT.md` - Documentation

### Files đã cập nhật:
1. `/src/routes/deckRoutes.js` - Thêm 3 routes mới

### Test với Postman:
```bash
# Clone deck
POST /api/decks/:id/clone
Body: { "newTitle": "My Copy", "isPublic": false }

# Merge decks
POST /api/decks/merge
Body: { "deckIds": ["id1", "id2"], "newTitle": "Merged" }

# Split deck
POST /api/decks/:id/split
Body: { "splitBy": "count", "criteria": "3" }
```

---

## ⏳ Task 10: Tích hợp 2FA vào login flow (PENDING)

**Trạng thái:** ✅ 2FA đã hoàn thành (setup/enable/verify/disable)
**Chưa làm:** Tích hợp vào login flow

### Khi nào cần làm:
- Trước khi deploy lên production
- Khi hoàn thành tất cả tính năng khác
- Khi cần test 2FA đầy đủ với frontend

### Các file cần sửa:
1. `src/controllers/authController.js`
   - Sửa function `login()` để kiểm tra 2FA
   - Trả về tempToken nếu user bật 2FA

2. `src/middleware/auth.js`
   - Thêm middleware `requireFullToken`
   - Phân biệt tempToken và fullToken

3. `src/controllers/twoFactorController.js`
   - Sửa `verify2FA()` để trả về fullToken sau khi verify

---

## 🚀 Next Tasks (Suggestions)

### 1. Frontend Integration
- Tạo UI cho Study Session
- Implement các study modes
- Progress dashboard
- Results screen

### 2. Gamification
- Achievement system
- Daily challenges
- Leaderboard
- Badges & Rewards

### 3. Social Features
- Share progress
- Friend system
- Study groups
- Collaborative decks

### 4. Advanced Features
- Audio pronunciation
- Image recognition
- Voice input
- Offline mode
- Mobile app



