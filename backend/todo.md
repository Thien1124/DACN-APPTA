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

## ✅ Task 20: Rich Flashcard Data (COMPLETED - Nov 2, 2025)

**Tính năng:** Thêm dữ liệu phong phú cho flashcard: IPA, meanings, synonyms, antonyms, collocations, images, audios

### Đã hoàn thành:
- ✅ Extended `Flashcard` model với rich data fields
- ✅ Multiple meanings với definition + example + translation
- ✅ Synonyms (đồng nghĩa) với note
- ✅ Antonyms (trái nghĩa) với note
- ✅ Collocations (kết hợp từ) với phrase + meaning + example
- ✅ Multiple images với caption
- ✅ Multiple audios với accent (US/UK/AU) + speaker
- ✅ Part of speech (noun, verb, adjective, etc.)
- ✅ Usage notes & Grammar notes
- ✅ Tags, difficulty level, CEFR level
- ✅ 14 API endpoints cho rich data
- ✅ API Documentation

### Features:
1. **Vocabulary Data** - Word + IPA + part of speech
2. **Multiple Meanings** - Definition + example + translation per meaning
3. **Related Words** - Synonyms & antonyms with notes
4. **Collocations** - Common word combinations
5. **Media** - Multiple images & audio files (US/UK accents)
6. **Metadata** - Tags, difficulty, CEFR level
7. **Notes** - Usage notes & grammar notes
8. **Search** - By tags, difficulty, CEFR, part of speech

### Files tạo mới:
1. `/src/controllers/richFlashcardController.js` - 14 controllers for rich data
2. `/src/routes/richFlashcardRoutes.js` - Rich flashcard routes
3. `/docs/TASK_20_RICH_DATA.md` - Full documentation

### Files đã cập nhật:
1. `/src/models/Flashcard.js` - Added partOfSpeech, meanings, synonyms, antonyms, collocations, images, audios, usageNotes, grammarNotes, tags, difficulty, cefrLevel
2. `server.js` - Added `/api/flashcards-rich` routes

### Test Commands:
```bash
# Create vocabulary card
POST /api/flashcards-rich/vocabulary
{
  "deckId": "...",
  "word": "amazing",
  "pronunciation": "/əˈmeɪzɪŋ/",
  "meanings": [{ "definition": "...", "example": "..." }],
  "synonyms": [{ "word": "wonderful" }]
}

# Add synonym
POST /api/flashcards-rich/:id/synonyms
{ "word": "fantastic", "note": "informal" }

# Search by tags
GET /api/flashcards-rich/search/tags?tags=adjective,common
```

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

## ✅ Task 21: Google Gemini AI Integration (COMPLETED - Nov 2, 2025)

**Tính năng:** Tích hợp Google Gemini AI để tự động sinh dữ liệu phong phú cho flashcard

### Đã hoàn thành:
- ✅ Gemini Service với 6 functions
- ✅ 9 API endpoints cho AI features
- ✅ Analyze word - Phân tích toàn diện
- ✅ Detect polysemy - Phát hiện từ đa nghĩa
- ✅ Generate examples - Sinh câu ví dụ tự nhiên
- ✅ Suggest collocations - Gợi ý kết hợp từ
- ✅ Image keywords - Gợi ý từ khóa hình ảnh
- ✅ Batch processing - Xử lý hàng loạt (max 20 words)
- ✅ Create flashcard with AI - Tạo flashcard tự động
- ✅ Enrich existing flashcard - Làm giàu flashcard cũ
- ✅ API Documentation

### Features:
1. **Word Analysis** - IPA, meanings, synonyms, antonyms, collocations, usage notes
2. **Polysemy Detection** - Phát hiện từ có nhiều nghĩa khác nhau
3. **Example Generation** - Sinh câu ví dụ tự nhiên theo context
4. **Collocation Suggestions** - Gợi ý kết hợp từ thường gặp
5. **Image Keywords** - Gợi ý từ khóa để tìm hình minh họa
6. **Batch Operations** - Phân tích/tạo nhiều flashcards cùng lúc
7. **Smart Enrichment** - Fill missing data hoặc regenerate all
8. **Auto Difficulty** - Tự động phân loại difficulty & CEFR level

### Files tạo mới:
1. `/src/services/geminiService.js` - AI service với Gemini API
2. `/src/controllers/aiController.js` - 9 controllers
3. `/src/routes/aiRoutes.js` - AI routes
4. `/docs/TASK_21_GEMINI_AI.md` - Full documentation
5. `/TASK_21_COMPLETE.md` - Summary

### Files đã cập nhật:
1. `server.js` - Added `/api/ai` routes
2. `package.json` - Added `@google/generative-ai` dependency

### Setup Required:
1. **Install**: `npm install @google/generative-ai` ✅
2. **Get API Key**: https://makersuite.google.com/app/apikey
3. **Add to .env**: `GEMINI_API_KEY=your_key`
4. **Restart server**: `npm run dev`

### Test Commands:
```bash
# Analyze word
POST /api/ai/analyze
Body: { "word": "beautiful" }

# Create flashcard with AI
POST /api/ai/analyze-and-create
Body: { "deckId": "...", "word": "amazing" }

# Detect polysemy
POST /api/ai/detect-polysemy
Body: { "word": "bank" }

# Batch create
POST /api/ai/batch-create
Body: { "deckId": "...", "words": ["happy", "sad", "angry"] }

# Enrich existing
POST /api/ai/enrich/:flashcardId
Body: { "regenerate": false }
```

### Use Cases:
- ✅ **Quick Create** - Teacher nhập từ → AI tạo flashcard đầy đủ
- ✅ **Batch Import** - Import list 20 từ → AI tạo tất cả
- ✅ **Polysemy Alert** - Cảnh báo từ đa nghĩa → Tạo nhiều thẻ
- ✅ **Enrich Old Cards** - Làm giàu flashcard cũ với AI data

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



