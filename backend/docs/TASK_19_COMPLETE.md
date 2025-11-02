# ✅ Task 19 Complete - Flashcard Note Type System

## 🎉 Hoàn thành

Hệ thống tạo flashcard với **4 kiểu note** khác nhau để đa dạng hóa cách học!

---

## 📁 Files

### Created (2 files):
1. **`src/controllers/noteTypeController.js`**
   - `createNoteTypeFlashcard()` - Tạo thẻ theo note type
   - `createBulkNoteTypeFlashcards()` - Tạo nhiều thẻ
   - `getFlashcardsByNoteType()` - Lấy thẻ theo type
   - `updateNoteTypeFlashcard()` - Cập nhật thẻ
   - `getNoteTypeStats()` - Thống kê note types

2. **`docs/TASK_19_NOTE_TYPE_SYSTEM.md`**
   - API documentation đầy đủ

### Updated (3 files):
1. **`src/models/Flashcard.js`**
   - Added `noteType` (WORD/PHRASE/SENTENCE/CLOZE)
   - Added `clozeText` & `clozeAnswers` for CLOZE
   - Added `pronunciation` (IPA format)
   - Added `hints` field

2. **`src/routes/flashcardRoutes.js`**
   - Added 5 note type routes

3. **`todo.md`**
   - Marked Task 19 complete

---

## 🎯 4 Note Types

### ✅ 1. WORD (Từ đơn)
**Use case:** Học từ vựng cơ bản

**Fields:**
- `word` - Từ (e.g., "beautiful")
- `meaning` - Nghĩa (e.g., "đẹp")
- `pronunciation` - IPA (e.g., "/ˈbjuːtɪfl/")
- `example` - Câu ví dụ

**JSON Example:**
```json
{
  "noteType": "WORD",
  "deckId": "...",
  "word": "beautiful",
  "meaning": "đẹp, xinh đẹp",
  "pronunciation": "/ˈbjuːtɪfl/",
  "example": "She has a beautiful smile.",
  "audioUrl": "https://...",
  "imageUrl": "https://..."
}
```

---

### ✅ 2. PHRASE (Cụm từ)
**Use case:** Học idioms, phrasal verbs, collocations

**Fields:**
- `phrase` - Cụm từ (e.g., "break down")
- `meaning` - Nghĩa
- `example` - Ví dụ

**JSON Example:**
```json
{
  "noteType": "PHRASE",
  "deckId": "...",
  "phrase": "break down",
  "meaning": "hỏng hóc, suy sụp",
  "example": "My car broke down on the highway.",
  "hints": "Phrasal verb"
}
```

---

### ✅ 3. SENTENCE (Câu)
**Use case:** Học câu giao tiếp, dịch câu

**Fields:**
- `sentence` - Câu tiếng Anh
- `translation` - Dịch tiếng Việt
- `context` - Ngữ cảnh

**JSON Example:**
```json
{
  "noteType": "SENTENCE",
  "deckId": "...",
  "sentence": "How have you been lately?",
  "translation": "Dạo này bạn thế nào rồi?",
  "context": "Casual greeting",
  "audioUrl": "https://..."
}
```

---

### ✅ 4. CLOZE (Điền khuyết)
**Use case:** Luyện ngữ pháp, test comprehension

**Fields:**
- `clozeText` - Câu với {{c1::answer}} format
- `clozeAnswers` - Array of answers

**JSON Example:**
```json
{
  "noteType": "CLOZE",
  "deckId": "...",
  "clozeText": "I {{c1::went}} to the store and {{c2::bought}} some milk.",
  "clozeAnswers": ["went", "bought"],
  "hints": "Use past simple tense"
}
```

**Cloze Format:**
- `{{c1::answer}}` - First blank
- `{{c2::answer}}` - Second blank
- etc.

---

## 🔌 API Endpoints

### 1. Create Single Flashcard
```
POST /api/flashcards/note-type
Authorization: Bearer <token>
```

### 2. Create Bulk Flashcards
```
POST /api/flashcards/note-type/bulk
Authorization: Bearer <token>

Body:
{
  "deckId": "...",
  "flashcards": [
    { "noteType": "WORD", "word": "...", "meaning": "..." },
    { "noteType": "CLOZE", "clozeText": "...", "clozeAnswers": [...] }
  ]
}
```

### 3. Get by Note Type
```
GET /api/flashcards/note-type/WORD
GET /api/flashcards/note-type/CLOZE?deckId=xxx
```

### 4. Get Statistics
```
GET /api/flashcards/note-type/stats/:deckId

Response:
{
  "total": 50,
  "breakdown": [
    { "noteType": "WORD", "count": 20 },
    { "noteType": "PHRASE", "count": 15 },
    { "noteType": "SENTENCE", "count": 10 },
    { "noteType": "CLOZE", "count": 5 }
  ]
}
```

### 5. Update Flashcard
```
PUT /api/flashcards/note-type/:id
```

---

## 📊 Database Changes

**Flashcard Schema:**
```javascript
{
  // NEW FIELDS
  noteType: {
    type: String,
    enum: ['WORD', 'PHRASE', 'SENTENCE', 'CLOZE'],
    default: 'WORD',
    required: true
  },
  
  clozeText: String,        // For CLOZE type
  clozeAnswers: [String],   // For CLOZE type
  pronunciation: String,     // IPA format
  hints: String,            // Learning hints
  
  // EXISTING FIELDS (unchanged)
  front: String,
  back: String,
  example: String,
  imageUrl: String,
  audioUrl: String,
  deck: ObjectId
}
```

---

## 🧪 Quick Test

```bash
# 1. Get a deck ID
GET http://localhost:1124/api/decks/browse

# 2. Create WORD flashcard
POST http://localhost:1124/api/flashcards/note-type
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "noteType": "WORD",
  "deckId": "DECK_ID_HERE",
  "word": "amazing",
  "meaning": "tuyệt vời",
  "pronunciation": "/əˈmeɪzɪŋ/",
  "example": "That's amazing!"
}

# 3. Create CLOZE flashcard
POST http://localhost:1124/api/flashcards/note-type
Authorization: Bearer YOUR_TOKEN

{
  "noteType": "CLOZE",
  "deckId": "DECK_ID_HERE",
  "clozeText": "I {{c1::am}} a student.",
  "clozeAnswers": ["am"],
  "hints": "Use 'be' verb"
}

# 4. Get statistics
GET http://localhost:1124/api/flashcards/note-type/stats/DECK_ID_HERE
Authorization: Bearer YOUR_TOKEN
```

---

## 🎨 Frontend TODO

### 1. Note Type Selector
```jsx
<select onChange={(e) => setNoteType(e.target.value)}>
  <option value="WORD">📖 Từ đơn</option>
  <option value="PHRASE">💬 Cụm từ</option>
  <option value="SENTENCE">📝 Câu</option>
  <option value="CLOZE">✏️ Điền khuyết</option>
</select>
```

### 2. Conditional Forms
```jsx
{noteType === 'WORD' && <WordForm />}
{noteType === 'PHRASE' && <PhraseForm />}
{noteType === 'SENTENCE' && <SentenceForm />}
{noteType === 'CLOZE' && <ClozeForm />}
```

### 3. Cloze Editor
```jsx
<textarea 
  placeholder="Enter: I {{c1::am}} happy."
  value={clozeText}
  onChange={handleClozeInput}
/>
<div>Detected: {extractedAnswers.join(', ')}</div>
```

### 4. Display by Type
```jsx
const CardDisplay = ({ card }) => {
  switch(card.noteType) {
    case 'WORD':
      return <WordCard {...card} />;
    case 'CLOZE':
      return <ClozeCard {...card} />;
    // ...
  }
};
```

---

## 📝 Key Features

✅ **4 Note Types** - WORD, PHRASE, SENTENCE, CLOZE  
✅ **Auto-fill** - front/back based on noteType  
✅ **CLOZE Support** - {{c1::answer}} format  
✅ **Pronunciation** - IPA field for phonetics  
✅ **Hints** - Optional learning hints  
✅ **Bulk Create** - Create multiple cards at once  
✅ **Statistics** - Count cards by note type  
✅ **Backward Compatible** - Old cards default to WORD  
✅ **Validation** - Required fields per note type  

---

## ⚡ Auto-processing

- **WORD**: `front = word`, `back = meaning`
- **PHRASE**: `front = phrase`, `back = meaning`
- **SENTENCE**: `front = sentence`, `back = translation`
- **CLOZE**: `front = clozeText`, `back = answers.join(', ')`

---

**Status**: ✅ Backend Complete  
**Date**: 2025-11-01  
**Task**: #19 - Note Type System  
**Files**: 2 created, 3 updated
