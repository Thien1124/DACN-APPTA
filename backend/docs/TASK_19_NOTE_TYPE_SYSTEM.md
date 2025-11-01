# Task 19: Flashcard Note Type System

## 📚 Tổng quan

Hệ thống tạo flashcard với 4 kiểu note khác nhau để đa dạng hóa cách học:
- **WORD** - Từ đơn
- **PHRASE** - Cụm từ
- **SENTENCE** - Câu ví dụ
- **CLOZE** - Điền khuyết (fill in the blank)

---

## 🎯 4 Loại Note Type

### 1. WORD (Từ đơn)
Học từ vựng đơn lẻ với nghĩa, phát âm, ví dụ

**Trường hợp sử dụng:**
- Học từ vựng cơ bản
- Flashcard từ điển
- Ôn tập vocabulary TOEIC/IELTS

**Ví dụ:**
```
Front: beautiful [/ˈbjuːtɪfl/]
Back: đẹp, xinh đẹp
Example: She has a beautiful smile.
```

### 2. PHRASE (Cụm từ)
Học cụm từ, idioms, collocations

**Trường hợp sử dụng:**
- Học idioms
- Phrasal verbs
- Collocations

**Ví dụ:**
```
Front: break down
Back: hỏng hóc, suy sụp
Example: My car broke down on the highway.
```

### 3. SENTENCE (Câu hoàn chỉnh)
Học câu tiếng Anh và dịch nghĩa

**Trường hợp sử dụng:**
- Học ngữ pháp trong context
- Luyện dịch câu
- Học câu giao tiếp

**Ví dụ:**
```
Front: How have you been lately?
Back: Dạo này bạn thế nào rồi?
Context: Casual greeting between friends
```

### 4. CLOZE (Điền khuyết)
Điền từ vào chỗ trống trong câu

**Trường hợp sử dụng:**
- Luyện ngữ pháp
- Học từ trong context
- Test comprehension

**Ví dụ:**
```
Cloze Text: I {{c1::went}} to the store and {{c2::bought}} some milk.
Answers: ["went", "bought"]
```

---

## 🔌 API Endpoints

### 1. Create Single Flashcard with Note Type

**POST** `/api/flashcards/note-type`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body (WORD):**
```json
{
  "noteType": "WORD",
  "deckId": "deck_id_here",
  "word": "beautiful",
  "meaning": "đẹp, xinh đẹp",
  "pronunciation": "/ˈbjuːtɪfl/",
  "example": "She has a beautiful smile.",
  "imageUrl": "https://example.com/image.jpg",
  "audioUrl": "https://example.com/audio.mp3",
  "hints": "Tính từ, mô tả vẻ đẹp"
}
```

**Request Body (PHRASE):**
```json
{
  "noteType": "PHRASE",
  "deckId": "deck_id_here",
  "phrase": "break down",
  "meaning": "hỏng hóc, suy sụp",
  "pronunciation": "/breɪk daʊn/",
  "example": "My car broke down on the highway.",
  "hints": "Phrasal verb"
}
```

**Request Body (SENTENCE):**
```json
{
  "noteType": "SENTENCE",
  "deckId": "deck_id_here",
  "sentence": "How have you been lately?",
  "translation": "Dạo này bạn thế nào rồi?",
  "context": "Casual greeting between friends",
  "audioUrl": "https://example.com/sentence.mp3"
}
```

**Request Body (CLOZE):**
```json
{
  "noteType": "CLOZE",
  "deckId": "deck_id_here",
  "clozeText": "I {{c1::went}} to the store and {{c2::bought}} some milk.",
  "clozeAnswers": ["went", "bought"],
  "example": "Past tense practice",
  "hints": "Use past simple tense"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Tạo thẻ WORD thành công",
  "data": {
    "_id": "flashcard_id",
    "noteType": "WORD",
    "front": "beautiful",
    "back": "đẹp, xinh đẹp",
    "pronunciation": "/ˈbjuːtɪfl/",
    "example": "She has a beautiful smile.",
    "deck": "deck_id",
    "createdAt": "2025-11-01T..."
  }
}
```

---

### 2. Create Bulk Flashcards with Note Types

**POST** `/api/flashcards/note-type/bulk`

**Request Body:**
```json
{
  "deckId": "deck_id_here",
  "flashcards": [
    {
      "noteType": "WORD",
      "word": "amazing",
      "meaning": "tuyệt vời",
      "pronunciation": "/əˈmeɪzɪŋ/",
      "example": "That's amazing!"
    },
    {
      "noteType": "PHRASE",
      "phrase": "give up",
      "meaning": "từ bỏ",
      "example": "Never give up on your dreams."
    },
    {
      "noteType": "CLOZE",
      "clozeText": "She {{c1::is}} a teacher.",
      "clozeAnswers": ["is"]
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tạo 3 thẻ thành công",
  "count": 3,
  "data": [...]
}
```

---

### 3. Get Flashcards by Note Type

**GET** `/api/flashcards/note-type/:noteType?deckId=xxx`

**Examples:**
```
GET /api/flashcards/note-type/WORD
GET /api/flashcards/note-type/CLOZE?deckId=123abc
```

**Response:**
```json
{
  "success": true,
  "count": 15,
  "noteType": "WORD",
  "data": [...]
}
```

---

### 4. Get Note Type Statistics

**GET** `/api/flashcards/note-type/stats/:deckId`

**Response:**
```json
{
  "success": true,
  "deckId": "deck_id",
  "total": 50,
  "breakdown": [
    { "noteType": "WORD", "count": 20 },
    { "noteType": "PHRASE", "count": 15 },
    { "noteType": "SENTENCE", "count": 10 },
    { "noteType": "CLOZE", "count": 5 }
  ]
}
```

---

### 5. Update Flashcard with Note Type

**PUT** `/api/flashcards/note-type/:id`

**Request Body (Change to CLOZE):**
```json
{
  "noteType": "CLOZE",
  "clozeText": "She {{c1::went}} to school.",
  "clozeAnswers": ["went"]
}
```

---

## 📊 Database Schema

**Flashcard Model (Updated):**
```javascript
{
  noteType: {
    type: String,
    enum: ['WORD', 'PHRASE', 'SENTENCE', 'CLOZE'],
    default: 'WORD',
    required: true
  },
  
  // Common fields
  front: String (required),
  back: String (required),
  example: String,
  
  // CLOZE-specific
  clozeText: String,
  clozeAnswers: [String],
  
  // Additional
  pronunciation: String,  // IPA format
  imageUrl: String,
  audioUrl: String,
  hints: String,
  
  deck: ObjectId (required)
}
```

---

## 🎨 Frontend Implementation Guide

### 1. Create Form với Note Type Selector

```jsx
const [noteType, setNoteType] = useState('WORD');

<select onChange={(e) => setNoteType(e.target.value)}>
  <option value="WORD">Từ đơn</option>
  <option value="PHRASE">Cụm từ</option>
  <option value="SENTENCE">Câu</option>
  <option value="CLOZE">Điền khuyết</option>
</select>

{noteType === 'WORD' && <WordForm />}
{noteType === 'PHRASE' && <PhraseForm />}
{noteType === 'SENTENCE' && <SentenceForm />}
{noteType === 'CLOZE' && <ClozeForm />}
```

### 2. Word Form Component

```jsx
<input placeholder="Word (e.g., beautiful)" name="word" />
<input placeholder="Meaning (e.g., đẹp)" name="meaning" />
<input placeholder="Pronunciation (e.g., /ˈbjuːtɪfl/)" name="pronunciation" />
<textarea placeholder="Example sentence" name="example" />
<input type="file" accept="image/*" name="image" />
<input type="file" accept="audio/*" name="audio" />
```

### 3. Cloze Form Component

```jsx
<textarea 
  placeholder="Enter text with {{c1::answer}} format"
  value={clozeText}
  onChange={handleClozeChange}
/>
<p>Detected blanks: {clozeAnswers.join(', ')}</p>
```

### 4. Display Card by Type

```jsx
const renderCard = (card) => {
  switch(card.noteType) {
    case 'WORD':
      return <WordCard word={card.front} meaning={card.back} />;
    case 'CLOZE':
      return <ClozeCard text={card.clozeText} answers={card.clozeAnswers} />;
    // ...
  }
};
```

---

## 🧪 Testing Examples

### Test 1: Create WORD flashcard
```bash
curl -X POST http://localhost:1124/api/flashcards/note-type \
-H "Authorization: Bearer <token>" \
-H "Content-Type: application/json" \
-d '{
  "noteType": "WORD",
  "deckId": "your_deck_id",
  "word": "amazing",
  "meaning": "tuyệt vời",
  "pronunciation": "/əˈmeɪzɪŋ/"
}'
```

### Test 2: Create CLOZE flashcard
```bash
curl -X POST http://localhost:1124/api/flashcards/note-type \
-H "Authorization: Bearer <token>" \
-H "Content-Type: application/json" \
-d '{
  "noteType": "CLOZE",
  "deckId": "your_deck_id",
  "clozeText": "I {{c1::am}} a student.",
  "clozeAnswers": ["am"]
}'
```

### Test 3: Get statistics
```bash
curl -X GET http://localhost:1124/api/flashcards/note-type/stats/your_deck_id \
-H "Authorization: Bearer <token>"
```

---

## ✅ Validation Rules

### WORD:
- ✅ `word` (required)
- ✅ `meaning` (required)
- ⭕ `pronunciation` (optional, IPA format)
- ⭕ `example` (optional)

### PHRASE:
- ✅ `phrase` (required)
- ✅ `meaning` (required)
- ⭕ `pronunciation` (optional)
- ⭕ `example` (optional)

### SENTENCE:
- ✅ `sentence` (required)
- ✅ `translation` (required)
- ⭕ `context` (optional)

### CLOZE:
- ✅ `clozeText` (required, must contain {{c1::...}})
- ✅ `clozeAnswers` (required, array of strings)
- ⭕ `hints` (optional)

---

## 📝 Notes

1. **Backward Compatibility**: Existing flashcards sẽ có `noteType: 'WORD'` by default
2. **Cloze Format**: Dùng `{{c1::answer}}` để đánh dấu chỗ trống
3. **Pronunciation**: Recommend dùng IPA format (e.g., /ˈhɛloʊ/)
4. **Auto-fill**: `front` và `back` tự động fill dựa trên noteType

---

**Status**: ✅ Complete  
**Date**: 2025-11-01  
**Task**: #19 - Note Type System
