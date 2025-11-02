# Task 20: Rich Flashcard Data System

## 📚 Tổng quan

Hệ thống thẻ flashcard với dữ liệu phong phú bao gồm:
- 📝 **Vocabulary** - Từ vựng chi tiết với IPA, nghĩa, ví dụ
- 🔊 **Audio** - Phát âm với nhiều giọng (US/UK/AU)
- 🖼️ **Images** - Nhiều hình ảnh minh họa
- 🔗 **Collocations** - Kết hợp từ thường gặp
- 🔄 **Synonyms/Antonyms** - Từ đồng nghĩa & trái nghĩa
- 📊 **Metadata** - Tags, difficulty, CEFR level

---

## 🎯 Rich Data Fields

### 1. Basic Vocabulary Data
```javascript
{
  front: "beautiful [/ˈbjuːtɪfl/] (adjective)",
  back: "đẹp, xinh đẹp",
  pronunciation: "/ˈbjuːtɪfl/",
  partOfSpeech: "adjective"  // noun, verb, adjective, adverb, etc.
}
```

### 2. Multiple Meanings
```javascript
meanings: [
  {
    definition: "pleasing the senses or mind aesthetically",
    example: "She has a beautiful smile.",
    translation: "đẹp, hấp dẫn về mặt thẩm mỹ"
  },
  {
    definition: "of a very high standard; excellent",
    example: "What beautiful weather!",
    translation: "tuyệt vời, xuất sắc"
  }
]
```

### 3. Synonyms (Đồng nghĩa)
```javascript
synonyms: [
  { word: "pretty", note: "less formal" },
  { word: "gorgeous", note: "stronger" },
  { word: "stunning", note: "very strong" }
]
```

### 4. Antonyms (Trái nghĩa)
```javascript
antonyms: [
  { word: "ugly", note: "opposite" },
  { word: "unattractive", note: "more formal" }
]
```

### 5. Collocations
```javascript
collocations: [
  {
    phrase: "beautiful weather",
    meaning: "thời tiết đẹp",
    example: "We had beautiful weather on our vacation."
  },
  {
    phrase: "beautiful smile",
    meaning: "nụ cười rạng rỡ",
    example: "She greeted us with a beautiful smile."
  }
]
```

### 6. Multiple Images
```javascript
images: [
  {
    url: "https://example.com/beautiful-landscape.jpg",
    caption: "Beautiful landscape"
  },
  {
    url: "https://example.com/beautiful-sunset.jpg",
    caption: "Beautiful sunset"
  }
]
```

### 7. Multiple Audio Files
```javascript
audios: [
  {
    url: "https://example.com/beautiful-us.mp3",
    accent: "US",
    speaker: "Rachel (Female)"
  },
  {
    url: "https://example.com/beautiful-uk.mp3",
    accent: "UK",
    speaker: "James (Male)"
  }
]
```

### 8. Additional Metadata
```javascript
{
  usageNotes: "Commonly used to describe appearance, but can also describe abstract concepts",
  grammarNotes: "Regular adjective, comparative: more beautiful, superlative: most beautiful",
  tags: ["appearance", "adjective", "common", "IELTS"],
  difficulty: "elementary",
  cefrLevel: "A2"
}
```

---

## 🔌 API Endpoints

### 1. Create Rich Flashcard

**POST** `/api/flashcards-rich/rich`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body (Full Example):**
```json
{
  "deckId": "deck_id_here",
  "noteType": "WORD",
  "front": "beautiful",
  "back": "đẹp, xinh đẹp",
  "pronunciation": "/ˈbjuːtɪfl/",
  "partOfSpeech": "adjective",
  "meanings": [
    {
      "definition": "pleasing the senses or mind aesthetically",
      "example": "She has a beautiful smile.",
      "translation": "đẹp, hấp dẫn về mặt thẩm mỹ"
    },
    {
      "definition": "of a very high standard",
      "example": "What beautiful weather!",
      "translation": "tuyệt vời"
    }
  ],
  "synonyms": [
    { "word": "pretty", "note": "less formal" },
    { "word": "gorgeous", "note": "stronger" }
  ],
  "antonyms": [
    { "word": "ugly", "note": "opposite" }
  ],
  "collocations": [
    {
      "phrase": "beautiful weather",
      "meaning": "thời tiết đẹp",
      "example": "We had beautiful weather."
    }
  ],
  "images": [
    {
      "url": "https://example.com/beautiful.jpg",
      "caption": "Beautiful landscape"
    }
  ],
  "audios": [
    {
      "url": "https://example.com/beautiful-us.mp3",
      "accent": "US",
      "speaker": "Rachel"
    }
  ],
  "usageNotes": "Common in everyday English",
  "grammarNotes": "Regular adjective",
  "tags": ["adjective", "appearance", "common"],
  "difficulty": "elementary",
  "cefrLevel": "A2"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tạo flashcard với dữ liệu phong phú thành công",
  "data": {
    "_id": "flashcard_id",
    "noteType": "WORD",
    "front": "beautiful",
    "pronunciation": "/ˈbjuːtɪfl/",
    "meanings": [...],
    "synonyms": [...],
    "createdAt": "2025-11-02T..."
  }
}
```

---

### 2. Create Vocabulary Card (Simplified)

**POST** `/api/flashcards-rich/vocabulary`

**Request Body:**
```json
{
  "deckId": "deck_id_here",
  "word": "amazing",
  "pronunciation": "/əˈmeɪzɪŋ/",
  "partOfSpeech": "adjective",
  "meanings": [
    {
      "definition": "causing great surprise or wonder",
      "example": "That's amazing!",
      "translation": "tuyệt vời, đáng kinh ngạc"
    }
  ],
  "synonyms": [
    { "word": "wonderful" },
    { "word": "fantastic" }
  ],
  "tags": ["adjective", "positive", "common"],
  "difficulty": "intermediate",
  "cefrLevel": "B1"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tạo thẻ từ vựng thành công",
  "data": {
    "_id": "flashcard_id",
    "front": "amazing [/əˈmeɪzɪŋ/] (adjective)",
    "back": "causing great surprise or wonder - tuyệt vời, đáng kinh ngạc",
    "meanings": [...],
    "synonyms": [...]
  }
}
```

---

### 3. Add Synonym

**POST** `/api/flashcards-rich/:id/synonyms`

**Request Body:**
```json
{
  "word": "gorgeous",
  "note": "stronger than beautiful"     
}
```

---

### 4. Add Antonym

**POST** `/api/flashcards-rich/:id/antonyms`

**Request Body:**
```json
{
  "word": "ugly",
  "note": "complete opposite"
}
```

---

### 5. Add Collocation

**POST** `/api/flashcards-rich/:id/collocations`

**Request Body:**
```json
{
  "phrase": "make a decision",
  "meaning": "đưa ra quyết định",
  "example": "We need to make a decision soon."
}
```

---

### 6. Add Meaning

**POST** `/api/flashcards-rich/:id/meanings`

**Request Body:**
```json
{
  "definition": "of a very high standard",
  "example": "Beautiful work!",
  "translation": "xuất sắc, tuyệt vời"
}
```

---

### 7. Add Image

**POST** `/api/flashcards-rich/:id/images`

**Request Body:**
```json
{
  "url": "https://example.com/image.jpg",
  "caption": "Beautiful sunset over the ocean"
}
```

---

### 8. Add Audio

**POST** `/api/flashcards-rich/:id/audios`

**Request Body:**
```json
{
  "url": "https://example.com/audio-uk.mp3",
  "accent": "UK",
  "speaker": "James (Male)"
}
```

**Accent Options:** `US`, `UK`, `AU`, `other`

---

### 9. Update Rich Data

**PUT** `/api/flashcards-rich/:id/rich`

**Request Body:**
```json
{
  "usageNotes": "Updated usage notes",
  "grammarNotes": "Updated grammar info",
  "difficulty": "advanced",
  "cefrLevel": "C1"
}
```

---

### 10. Get Flashcard with Rich Data

**GET** `/api/flashcards-rich/:id/rich`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "flashcard_id",
    "noteType": "WORD",
    "front": "beautiful",
    "back": "đẹp",
    "pronunciation": "/ˈbjuːtɪfl/",
    "partOfSpeech": "adjective",
    "meanings": [...],
    "synonyms": [...],
    "antonyms": [...],
    "collocations": [...],
    "images": [...],
    "audios": [...],
    "tags": [...],
    "difficulty": "elementary",
    "cefrLevel": "A2",
    "deck": {
      "_id": "deck_id",
      "title": "Essential Vocabulary"
    }
  }
}
```

---

### 11. Search by Tags

**GET** `/api/flashcards-rich/search/tags?tags=adjective,common&deckId=xxx`

**Query Params:**
- `tags` (required) - Comma-separated tags
- `deckId` (optional) - Filter by deck

**Response:**
```json
{
  "success": true,
  "count": 15,
  "data": [...]
}
```

---

### 12. Get by Difficulty

**GET** `/api/flashcards-rich/difficulty/:level?deckId=xxx`

**Levels:** `beginner`, `elementary`, `intermediate`, `upper-intermediate`, `advanced`

**Response:**
```json
{
  "success": true,
  "count": 25,
  "difficulty": "intermediate",
  "data": [...]
}
```

---

### 13. Get by CEFR Level

**GET** `/api/flashcards-rich/cefr/:level?deckId=xxx`

**Levels:** `A1`, `A2`, `B1`, `B2`, `C1`, `C2`

**Response:**
```json
{
  "success": true,
  "count": 30,
  "cefrLevel": "B1",
  "data": [...]
}
```

---

### 14. Get by Part of Speech

**GET** `/api/flashcards-rich/pos/:partOfSpeech?deckId=xxx`

**Parts of Speech:** `noun`, `verb`, `adjective`, `adverb`, `preposition`, `conjunction`, `pronoun`, `interjection`, `phrase`, `idiom`, `other`

**Response:**
```json
{
  "success": true,
  "count": 40,
  "partOfSpeech": "adjective",
  "data": [...]
}
```

---

## 📊 Database Schema (Extended)

```javascript
{
  // Basic fields (Task 19)
  noteType: String,
  front: String,
  back: String,
  example: String,
  pronunciation: String,
  
  // Task 20: Rich data
  partOfSpeech: String,
  meanings: [{
    definition: String,
    example: String,
    translation: String
  }],
  synonyms: [{
    word: String,
    note: String
  }],
  antonyms: [{
    word: String,
    note: String
  }],
  collocations: [{
    phrase: String,
    meaning: String,
    example: String
  }],
  images: [{
    url: String,
    caption: String
  }],
  audios: [{
    url: String,
    accent: String,  // US, UK, AU, other
    speaker: String
  }],
  usageNotes: String,
  grammarNotes: String,
  tags: [String],
  difficulty: String,  // beginner, elementary, intermediate, upper-intermediate, advanced
  cefrLevel: String,   // A1, A2, B1, B2, C1, C2
  
  deck: ObjectId
}
```

---

## 🎨 Frontend Implementation Guide

### 1. Display Rich Vocabulary Card

```jsx
const VocabularyCard = ({ card }) => {
  return (
    <div className="rich-card">
      {/* Word with pronunciation */}
      <h2>
        {card.front}
        {card.pronunciation && (
          <span className="ipa"> [{card.pronunciation}]</span>
        )}
        {card.partOfSpeech && (
          <span className="pos">({card.partOfSpeech})</span>
        )}
      </h2>
      
      {/* Audio buttons */}
      {card.audios?.map((audio, i) => (
        <button key={i} onClick={() => playAudio(audio.url)}>
          🔊 {audio.accent} ({audio.speaker})
        </button>
      ))}
      
      {/* Meanings */}
      <div className="meanings">
        {card.meanings?.map((m, i) => (
          <div key={i}>
            <p><strong>{i + 1}.</strong> {m.definition}</p>
            {m.translation && <p className="translation">→ {m.translation}</p>}
            {m.example && <p className="example">💬 {m.example}</p>}
          </div>
        ))}
      </div>
      
      {/* Synonyms & Antonyms */}
      <div className="related-words">
        {card.synonyms?.length > 0 && (
          <div>
            <strong>🔄 Synonyms:</strong>
            {card.synonyms.map((s, i) => (
              <span key={i}>{s.word} {s.note && `(${s.note})`}</span>
            ))}
          </div>
        )}
        
        {card.antonyms?.length > 0 && (
          <div>
            <strong>↔️ Antonyms:</strong>
            {card.antonyms.map((a, i) => (
              <span key={i}>{a.word}</span>
            ))}
          </div>
        )}
      </div>
      
      {/* Collocations */}
      {card.collocations?.length > 0 && (
        <div className="collocations">
          <strong>🔗 Collocations:</strong>
          {card.collocations.map((c, i) => (
            <div key={i}>
              <span className="phrase">{c.phrase}</span>
              <span className="meaning">- {c.meaning}</span>
              {c.example && <p className="example">💬 {c.example}</p>}
            </div>
          ))}
        </div>
      )}
      
      {/* Images */}
      {card.images?.length > 0 && (
        <div className="images">
          {card.images.map((img, i) => (
            <figure key={i}>
              <img src={img.url} alt={img.caption} />
              <figcaption>{img.caption}</figcaption>
            </figure>
          ))}
        </div>
      )}
      
      {/* Metadata */}
      <div className="metadata">
        {card.difficulty && <span className="badge">{card.difficulty}</span>}
        {card.cefrLevel && <span className="badge">{card.cefrLevel}</span>}
        {card.tags?.map((tag, i) => (
          <span key={i} className="tag">{tag}</span>
        ))}
      </div>
    </div>
  );
};
```

### 2. Create Rich Vocabulary Form

```jsx
const CreateVocabularyForm = () => {
  const [formData, setFormData] = useState({
    word: '',
    pronunciation: '',
    partOfSpeech: 'noun',
    meanings: [{ definition: '', example: '', translation: '' }],
    synonyms: [],
    antonyms: [],
    collocations: [],
    tags: [],
    difficulty: 'intermediate'
  });
  
  const addMeaning = () => {
    setFormData({
      ...formData,
      meanings: [...formData.meanings, { definition: '', example: '', translation: '' }]
    });
  };
  
  const addSynonym = () => {
    const word = prompt('Enter synonym:');
    if (word) {
      setFormData({
        ...formData,
        synonyms: [...formData.synonyms, { word, note: '' }]
      });
    }
  };
  
  // ... similar for other fields
  
  return (
    <form onSubmit={handleSubmit}>
      <input name="word" placeholder="Word" />
      <input name="pronunciation" placeholder="IPA /.../" />
      <select name="partOfSpeech">
        <option value="noun">Noun</option>
        <option value="verb">Verb</option>
        <option value="adjective">Adjective</option>
        {/* ... */}
      </select>
      
      {/* Meanings */}
      <div>
        <h3>Meanings</h3>
        {formData.meanings.map((m, i) => (
          <div key={i}>
            <input placeholder="Definition" />
            <input placeholder="Example" />
            <input placeholder="Translation (Vietnamese)" />
          </div>
        ))}
        <button type="button" onClick={addMeaning}>+ Add Meaning</button>
      </div>
      
      {/* Synonyms */}
      <div>
        <h3>Synonyms</h3>
        {formData.synonyms.map((s, i) => (
          <span key={i}>{s.word}</span>
        ))}
        <button type="button" onClick={addSynonym}>+ Add Synonym</button>
      </div>
      
      {/* ... similar for other fields */}
      
      <button type="submit">Create Vocabulary Card</button>
    </form>
  );
};
```

---

## 🧪 Testing Examples

### Test 1: Create rich vocabulary card
```bash
curl -X POST http://localhost:1124/api/flashcards-rich/vocabulary \
-H "Authorization: Bearer <admin_token>" \
-H "Content-Type: application/json" \
-d '{
  "deckId": "deck_id",
  "word": "amazing",
  "pronunciation": "/əˈmeɪzɪŋ/",
  "partOfSpeech": "adjective",
  "meanings": [
    {
      "definition": "causing great surprise",
      "example": "That'\''s amazing!",
      "translation": "tuyệt vời"
    }
  ],
  "synonyms": [
    { "word": "wonderful" }
  ],
  "tags": ["adjective", "positive"],
  "difficulty": "intermediate"
}'
```

### Test 2: Add synonym
```bash
curl -X POST http://localhost:1124/api/flashcards-rich/FLASHCARD_ID/synonyms \
-H "Authorization: Bearer <admin_token>" \
-H "Content-Type: application/json" \
-d '{
  "word": "fantastic",
  "note": "informal"
}'
```

### Test 3: Search by tags
```bash
curl -X GET "http://localhost:1124/api/flashcards-rich/search/tags?tags=adjective,positive" \
-H "Authorization: Bearer <token>"
```

### Test 4: Get by difficulty
```bash
curl -X GET http://localhost:1124/api/flashcards-rich/difficulty/intermediate \
-H "Authorization: Bearer <token>"
```

---

## 📝 Use Cases

### 1. Dictionary-Style Learning
- Full word entry with multiple definitions
- Audio pronunciations (US/UK)
- Example sentences for each meaning
- Part of speech information

### 2. Vocabulary Building
- Synonyms to expand vocabulary
- Antonyms to understand contrasts
- Collocations for natural usage
- Tags for themed learning

### 3. Visual Learning
- Multiple images for context
- Captions for clarity
- Visual memory aids

### 4. Comprehensive Study
- Usage notes for proper context
- Grammar notes for rules
- CEFR levels for progression tracking
- Difficulty levels for personalization

---

## ✅ Best Practices

1. **Always add pronunciation** - Use IPA format
2. **Include multiple meanings** - Cover common usages
3. **Add real examples** - From actual usage
4. **Tag consistently** - Use standard tags
5. **Include audio** - Both US and UK if possible
6. **Add images** - Visual aids improve retention
7. **Use collocations** - Teach natural combinations
8. **Set difficulty** - Help users find appropriate content

---

**Status**: ✅ Complete  
**Date**: 2025-11-02  
**Task**: #20 - Rich Flashcard Data System
