# Postman Testing Guide - Task 21: AI Integration

## 📋 Prerequisites

### 1. Setup API Key
Add to `.env`:
```bash
GEMINI_API_KEY=your_api_key_here
```

Get your key from: https://makersuite.google.com/app/apikey

### 2. Authentication
Most endpoints require authentication. Get your token first:

**Login:**
```
POST http://localhost:1124/api/auth/login
Body:
{
  "email": "admin@example.com",
  "password": "your_password"
}
```

Copy the `token` from response.

---

## 🧪 Test Endpoints

### Test 1: Analyze Word ✅

**Endpoint:** `POST /api/ai/analyze`

**Headers:**
```
Authorization: Bearer <your_token>
Content-Type: application/json
```

**Body:**
```json
{
  "word": "beautiful"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Phân tích từ thành công",
  "data": {
    "word": "beautiful",
    "pronunciation": "/ˈbjuːtɪfl/",
    "partOfSpeech": "adjective",
    "isPolysemous": true,
    "meanings": [
      {
        "definition": "pleasing the senses or mind aesthetically",
        "example": "She has a beautiful smile.",
        "translation": "đẹp, hấp dẫn về mặt thẩm mỹ"
      }
    ],
    "synonyms": [...],
    "antonyms": [...],
    "collocations": [...],
    "difficulty": "elementary",
    "cefrLevel": "A2"
  }
}
```

---

### Test 2: Analyze Word with Context

**Body:**
```json
{
  "word": "bank",
  "context": "I went to the bank to deposit money"
}
```

**Note:** Context helps AI understand which meaning you want (financial institution vs river bank)

---

### Test 3: Detect Polysemy ✅

**Endpoint:** `POST /api/ai/detect-polysemy`

**Headers:**
```
Authorization: Bearer <your_token>
Content-Type: application/json
```

**Body:**
```json
{
  "word": "bank"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Phát hiện đa nghĩa thành công",
  "data": {
    "word": "bank",
    "isPolysemous": true,
    "meaningCount": 3,
    "mainMeanings": [
      {
        "definition": "financial institution",
        "example": "I need to go to the bank.",
        "frequency": "very common"
      },
      {
        "definition": "edge of a river",
        "example": "We sat on the river bank.",
        "frequency": "common"
      }
    ]
  }
}
```

---

### Test 4: Generate Examples ✅

**Endpoint:** `POST /api/ai/generate-examples`

**Body:**
```json
{
  "word": "happy",
  "meaning": "feeling pleased or satisfied",
  "count": 3
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Tạo ví dụ thành công",
  "data": {
    "word": "happy",
    "examples": [
      {
        "sentence": "I'm so happy to see you!",
        "context": "Greeting a friend",
        "level": "A1"
      },
      {
        "sentence": "She looks happy with her new job.",
        "context": "Describing someone's state",
        "level": "A2"
      }
    ]
  }
}
```

---

### Test 5: Suggest Image Keywords ✅

**Endpoint:** `POST /api/ai/suggest-images`

**Body:**
```json
{
  "word": "mountain",
  "meaning": "large natural elevation"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Gợi ý từ khóa hình ảnh thành công",
  "data": {
    "word": "mountain",
    "imageKeywords": [
      "mountain landscape photography",
      "snowy mountain peak",
      "mountain range scenery"
    ],
    "visualDescription": "High elevation landform...",
    "searchTips": "Use 'landscape' for better results"
  }
}
```

---

### Test 6: Suggest Collocations ✅

**Endpoint:** `POST /api/ai/suggest-collocations`

**Body:**
```json
{
  "word": "make",
  "partOfSpeech": "verb"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Gợi ý collocations thành công",
  "data": {
    "word": "make",
    "collocations": [
      {
        "phrase": "make a decision",
        "meaning": "đưa ra quyết định",
        "example": "We need to make a decision.",
        "frequency": "very common"
      },
      {
        "phrase": "make progress",
        "meaning": "tiến bộ",
        "example": "She's making good progress.",
        "frequency": "very common"
      }
    ]
  }
}
```

---

### Test 7: Create Flashcard with AI ✅ (Admin/Teacher Only)

**Endpoint:** `POST /api/ai/analyze-and-create`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Prerequisites:** Get a deck ID first
```
GET /api/decks
```

**Body:**
```json
{
  "deckId": "6728d123456789abcdef0001",
  "word": "amazing"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Tạo flashcard với AI thành công",
  "data": {
    "flashcard": {
      "_id": "...",
      "deck": "6728d123456789abcdef0001",
      "noteType": "WORD",
      "front": "amazing [/əˈmeɪzɪŋ/] (adjective)",
      "back": "causing great surprise or wonder - tuyệt vời",
      "pronunciation": "/əˈmeɪzɪŋ/",
      "partOfSpeech": "adjective",
      "meanings": [
        {
          "definition": "causing great surprise",
          "example": "That's amazing!",
          "translation": "tuyệt vời"
        }
      ],
      "synonyms": [
        { "word": "wonderful" },
        { "word": "fantastic" }
      ],
      "difficulty": "intermediate",
      "cefrLevel": "B1",
      "createdAt": "2025-11-02T..."
    },
    "aiAnalysis": {
      "isPolysemous": false,
      "meaningCount": 1
    }
  }
}
```

---

### Test 8: Batch Analyze ✅ (Admin/Teacher Only)

**Endpoint:** `POST /api/ai/batch-analyze`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body:**
```json
{
  "words": ["happy", "sad", "angry", "excited", "nervous"]
}
```

**Note:** Maximum 20 words per request

**Expected Response:**
```json
{
  "success": true,
  "message": "Phân tích 5 từ thành công",
  "data": [
    {
      "word": "happy",
      "pronunciation": "/ˈhæpi/",
      "meanings": [...]
    },
    {
      "word": "sad",
      "pronunciation": "/sæd/",
      "meanings": [...]
    }
    // ... 3 more
  ]
}
```

---

### Test 9: Batch Create Flashcards ✅ (Admin/Teacher Only)

**Endpoint:** `POST /api/ai/batch-create`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body:**
```json
{
  "deckId": "6728d123456789abcdef0001",
  "words": ["amazing", "wonderful", "fantastic"]
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Tạo 3 flashcard với AI thành công",
  "data": [
    {
      "_id": "...",
      "front": "amazing [/əˈmeɪzɪŋ/] (adjective)",
      "pronunciation": "/əˈmeɪzɪŋ/",
      "meanings": [...]
    },
    {
      "_id": "...",
      "front": "wonderful [/ˈwʌndərfl/] (adjective)",
      "pronunciation": "/ˈwʌndərfl/",
      "meanings": [...]
    },
    {
      "_id": "...",
      "front": "fantastic [/fænˈtæstɪk/] (adjective)",
      "pronunciation": "/fænˈtæstɪk/",
      "meanings": [...]
    }
  ]
}
```

---

### Test 10: Enrich Existing Flashcard ✅ (Admin/Teacher Only)

**Endpoint:** `POST /api/ai/enrich/:id`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Prerequisites:** Get a flashcard ID first
```
GET /api/decks/:deckId/flashcards
```

**Body:**
```json
{
  "regenerate": false
}
```

**Options:**
- `regenerate: false` - Only fill in missing fields
- `regenerate: true` - Replace all data with AI-generated

**Expected Response:**
```json
{
  "success": true,
  "message": "Làm giàu flashcard với AI thành công",
  "data": {
    "_id": "flashcard_id",
    "front": "happy",
    "back": "feeling pleased",
    "pronunciation": "/ˈhæpi/",
    "meanings": [...],
    "synonyms": [...],
    "collocations": [...]
  }
}
```

---

## 🔍 Common Issues

### Issue 1: "Không thể phân tích từ với AI"

**Cause:** Missing or invalid `GEMINI_API_KEY`

**Solution:**
1. Check `.env` file has `GEMINI_API_KEY=...`
2. Verify API key is valid at https://makersuite.google.com/app/apikey
3. Restart server after adding key

---

### Issue 2: Rate Limit Error

**Cause:** Too many requests to Gemini API

**Solution:**
- Wait 1 minute before retrying
- Use batch endpoints instead of multiple single requests
- Consider upgrading Gemini API tier

---

### Issue 3: JSON Parse Error

**Cause:** AI sometimes returns malformed JSON

**Solution:**
- This is handled automatically by the service
- If persists, try adding more context to the word
- Report the word that causes issues

---

### Issue 4: "Không tìm thấy deck"

**Cause:** Invalid `deckId`

**Solution:**
1. Get valid deck IDs: `GET /api/decks`
2. Make sure you own the deck or it's public
3. Use correct ObjectId format

---

## 📊 Performance Tips

### 1. Use Batch Operations
Instead of:
```
POST /api/ai/analyze-and-create (word 1)
POST /api/ai/analyze-and-create (word 2)
POST /api/ai/analyze-and-create (word 3)
```

Use:
```
POST /api/ai/batch-create
Body: { "words": ["word1", "word2", "word3"] }
```

### 2. Cache Common Words
- Store AI results for common words
- Reuse data for similar flashcards
- Reduces API calls

### 3. Provide Context
- Adding context improves accuracy
- Helps with polysemous words
- Gives better examples

---

## 🎯 Complete Workflow Example

### Scenario: Create 5 vocabulary flashcards for IELTS

**Step 1:** Get deck ID
```
GET /api/decks
```

**Step 2:** Prepare word list
```json
{
  "words": [
    "sophisticated",
    "resilient",
    "ambitious",
    "innovative",
    "comprehensive"
  ]
}
```

**Step 3:** Batch create with AI
```
POST /api/ai/batch-create
Body: {
  "deckId": "6728d...",
  "words": ["sophisticated", "resilient", ...]
}
```

**Step 4:** Verify flashcards created
```
GET /api/decks/6728d.../flashcards
```

**Done!** 5 flashcards with full data in ~10 seconds

---

## ✅ Checklist

Before testing AI endpoints:

- [ ] `.env` has `GEMINI_API_KEY`
- [ ] Server restarted after adding key
- [ ] Have valid authentication token
- [ ] Have admin/teacher role (for creation endpoints)
- [ ] Have valid deck ID (for flashcard creation)
- [ ] Tested `/api/ai/analyze` first (simplest endpoint)

---

**Happy Testing!** 🚀
