# 🤖 AI Integration - Quick Reference

## 🔑 Setup (1 minute)

```bash
# 1. Get API Key
https://makersuite.google.com/app/apikey

# 2. Add to .env
GEMINI_API_KEY=your_key_here

# 3. Restart server
npm run dev
```

---

## 📍 Endpoints Summary

| Method | Endpoint | Access | Purpose |
|--------|----------|--------|---------|
| POST | `/api/ai/analyze` | User | Analyze word |
| POST | `/api/ai/detect-polysemy` | User | Check multiple meanings |
| POST | `/api/ai/generate-examples` | User | Generate examples |
| POST | `/api/ai/suggest-images` | User | Image keywords |
| POST | `/api/ai/suggest-collocations` | User | Collocations |
| POST | `/api/ai/analyze-and-create` | Admin/Teacher | Create flashcard |
| POST | `/api/ai/enrich/:id` | Admin/Teacher | Enrich flashcard |
| POST | `/api/ai/batch-analyze` | Admin/Teacher | Analyze multiple |
| POST | `/api/ai/batch-create` | Admin/Teacher | Create multiple |

---

## 🚀 Quick Tests

### 1. Simple Word Analysis
```bash
POST /api/ai/analyze
{
  "word": "beautiful"
}
```

### 2. Create Flashcard
```bash
POST /api/ai/analyze-and-create
{
  "deckId": "deck_id",
  "word": "amazing"
}
```

### 3. Check Polysemy
```bash
POST /api/ai/detect-polysemy
{
  "word": "bank"
}
```

### 4. Batch Create
```bash
POST /api/ai/batch-create
{
  "deckId": "deck_id",
  "words": ["happy", "sad", "angry"]
}
```

---

## 📊 AI Output Structure

```json
{
  "word": "beautiful",
  "pronunciation": "/ˈbjuːtɪfl/",
  "partOfSpeech": "adjective",
  "isPolysemous": true,
  "meanings": [
    {
      "definition": "pleasing aesthetically",
      "example": "She has a beautiful smile.",
      "translation": "đẹp"
    }
  ],
  "synonyms": [
    { "word": "pretty", "note": "less formal" }
  ],
  "antonyms": [
    { "word": "ugly" }
  ],
  "collocations": [
    {
      "phrase": "beautiful weather",
      "meaning": "thời tiết đẹp",
      "example": "We had beautiful weather."
    }
  ],
  "usageNotes": "...",
  "grammarNotes": "...",
  "tags": ["adjective", "appearance"],
  "difficulty": "elementary",
  "cefrLevel": "A2"
}
```

---

## 💡 Use Cases

### Teacher Workflow
```
1. Login → Get admin token
2. Select deck → Get deck ID
3. Prepare word list (max 20)
4. POST /api/ai/batch-create
5. ✅ All flashcards created!
```

### Student Workflow
```
1. Login → Get user token
2. Enter unknown word
3. POST /api/ai/analyze
4. View meanings, examples, collocations
5. Understand word better
```

### Content Creator
```
1. Upload word list
2. AI analyzes all
3. Review & edit if needed
4. Publish deck
```

---

## ⚠️ Important Notes

- **API Key Required** - Won't work without it
- **Rate Limits** - Max 20 words per batch
- **Admin Access** - Creation endpoints need admin/teacher role
- **Context Helps** - Provide example sentence for better results
- **Review Output** - AI is helpful but not 100% accurate

---

## 🔗 Related Tasks

- **Task 19** - Note Type System (WORD/PHRASE/SENTENCE/CLOZE)
- **Task 20** - Rich Flashcard Data (meanings, synonyms, images)
- **Task 18** - Deck Management (clone/merge/split)

---

## 📚 Full Documentation

- `docs/TASK_21_GEMINI_AI.md` - Complete API docs
- `docs/POSTMAN_TASK_21.md` - Testing guide
- `TASK_21_COMPLETE.md` - Summary

---

**Ready to use!** 🎉
