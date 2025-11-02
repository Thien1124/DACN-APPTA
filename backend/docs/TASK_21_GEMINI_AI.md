# Task 21: Google Gemini AI Integration

## 📚 Tổng quan

Tích hợp Google Gemini AI để:
- 🤖 **Tự động phân tích từ** - Phát âm IPA, nghĩa, từ loại
- 🔍 **Phát hiện đa nghĩa** - Detect polysemous words
- 💬 **Sinh câu ví dụ tự nhiên** - Natural example sentences
- 🔗 **Gợi ý collocations** - Common word combinations
- 🖼️ **Gợi ý từ khóa hình ảnh** - Image search keywords
- 📦 **Xử lý hàng loạt** - Batch processing

---

## 🔑 Setup

### 1. Lấy API Key từ Google AI Studio

1. Truy cập: https://makersuite.google.com/app/apikey
2. Tạo API key mới
3. Copy API key

### 2. Thêm vào `.env`

```bash
GEMINI_API_KEY=your_api_key_here
```

### 3. Khởi động lại server

```bash
npm run dev
```

---

## 🎯 API Endpoints

### 1. Analyze Word (Phân tích từ)

**POST** `/api/ai/analyze`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "word": "beautiful",
  "context": "She has a beautiful smile" // optional
}
```

**Response:**
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
      },
      {
        "definition": "of a very high standard; excellent",
        "example": "What beautiful weather!",
        "translation": "tuyệt vời, xuất sắc"
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
    "usageNotes": "Commonly used to describe appearance",
    "grammarNotes": "Regular adjective, comparative: more beautiful",
    "tags": ["appearance", "adjective", "common"],
    "difficulty": "elementary",
    "cefrLevel": "A2"
  }
}
```

---

### 2. Analyze & Create Flashcard

**POST** `/api/ai/analyze-and-create`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "deckId": "deck_id_here",
  "word": "amazing",
  "context": "That's an amazing performance!" // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tạo flashcard với AI thành công",
  "data": {
    "flashcard": {
      "_id": "flashcard_id",
      "deck": "deck_id",
      "noteType": "WORD",
      "front": "amazing [/əˈmeɪzɪŋ/] (adjective)",
      "back": "causing great surprise or wonder - tuyệt vời",
      "pronunciation": "/əˈmeɪzɪŋ/",
      "partOfSpeech": "adjective",
      "meanings": [...],
      "synonyms": [...],
      "collocations": [...],
      "difficulty": "intermediate",
      "cefrLevel": "B1"
    },
    "aiAnalysis": {
      "isPolysemous": true,
      "meaningCount": 2
    }
  }
}
```

---

### 3. Detect Polysemy (Phát hiện đa nghĩa)

**POST** `/api/ai/detect-polysemy`

**Request Body:**
```json
{
  "word": "bank"
}
```

**Response:**
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
      },
      {
        "definition": "to rely or depend on",
        "example": "You can bank on me.",
        "frequency": "less common"
      }
    ],
    "note": "Highly polysemous word with distinct meanings"
  }
}
```

---

### 4. Generate Examples (Sinh câu ví dụ)

**POST** `/api/ai/generate-examples`

**Request Body:**
```json
{
  "word": "happy",
  "meaning": "feeling pleased or satisfied", // optional
  "count": 3
}
```

**Response:**
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
      },
      {
        "sentence": "We had a happy childhood together.",
        "context": "Talking about memories",
        "level": "B1"
      }
    ]
  }
}
```

---

### 5. Suggest Image Keywords (Gợi ý từ khóa hình ảnh)

**POST** `/api/ai/suggest-images`

**Request Body:**
```json
{
  "word": "mountain",
  "meaning": "large natural elevation" // optional
}
```

**Response:**
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
    "visualDescription": "High elevation landform with peak, typically with rocky terrain or snow coverage",
    "searchTips": "Use 'landscape' or 'scenery' for better stock photo results"
  }
}
```

---

### 6. Suggest Collocations (Gợi ý kết hợp từ)

**POST** `/api/ai/suggest-collocations`

**Request Body:**
```json
{
  "word": "make",
  "partOfSpeech": "verb" // optional
}
```

**Response:**
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
        "example": "We need to make a decision soon.",
        "frequency": "very common"
      },
      {
        "phrase": "make progress",
        "meaning": "tiến bộ",
        "example": "She's making good progress.",
        "frequency": "very common"
      },
      {
        "phrase": "make a mistake",
        "meaning": "phạm lỗi",
        "example": "Everyone makes mistakes.",
        "frequency": "very common"
      }
    ]
  }
}
```

---

### 7. Enrich Flashcard (Làm giàu flashcard có sẵn)

**POST** `/api/ai/enrich/:id`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "regenerate": false  // false: chỉ fill missing data, true: replace all
}
```

**Response:**
```json
{
  "success": true,
  "message": "Làm giàu flashcard với AI thành công",
  "data": {
    "_id": "flashcard_id",
    "front": "happy",
    "pronunciation": "/ˈhæpi/",
    "meanings": [...],
    "synonyms": [...],
    "collocations": [...]
  }
}
```

---

### 8. Batch Analyze (Phân tích hàng loạt)

**POST** `/api/ai/batch-analyze`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "words": ["happy", "sad", "angry", "excited", "nervous"]
}
```

**Limits:**
- Maximum 20 words per request
- Rate limit: 5 words processed per second

**Response:**
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

### 9. Batch Create Flashcards

**POST** `/api/ai/batch-create`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "deckId": "deck_id_here",
  "words": ["amazing", "wonderful", "fantastic"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tạo 3 flashcard với AI thành công",
  "data": [
    {
      "_id": "flashcard_1",
      "front": "amazing [/əˈmeɪzɪŋ/] (adjective)",
      "back": "...",
      "meanings": [...]
    },
    {
      "_id": "flashcard_2",
      "front": "wonderful [/ˈwʌndərfl/] (adjective)",
      "back": "...",
      "meanings": [...]
    }
    // ... more
  ]
}
```

---

## 🎨 Frontend Integration

### 1. Analyze Word Before Creating Flashcard

```jsx
const AnalyzeAndCreate = () => {
  const [word, setWord] = useState('');
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeWord = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ word })
      });
      const data = await response.json();
      setAiData(data.data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const createFlashcard = async () => {
    try {
      const response = await fetch('/api/ai/analyze-and-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          deckId: selectedDeckId,
          word
        })
      });
      const data = await response.json();
      alert('Flashcard created!');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <input 
        value={word} 
        onChange={(e) => setWord(e.target.value)}
        placeholder="Enter word..."
      />
      <button onClick={analyzeWord} disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze with AI'}
      </button>

      {aiData && (
        <div className="ai-preview">
          <h3>{aiData.word} [{aiData.pronunciation}]</h3>
          <p><strong>Part of Speech:</strong> {aiData.partOfSpeech}</p>
          
          <div>
            <strong>Meanings:</strong>
            {aiData.meanings.map((m, i) => (
              <div key={i}>
                <p>{i + 1}. {m.definition}</p>
                <p className="translation">→ {m.translation}</p>
                <p className="example">💬 {m.example}</p>
              </div>
            ))}
          </div>

          {aiData.isPolysemous && (
            <div className="badge">⚠️ Polysemous ({aiData.meanings.length} meanings)</div>
          )}

          <button onClick={createFlashcard}>
            Create Flashcard with This Data
          </button>
        </div>
      )}
    </div>
  );
};
```

### 2. Batch Import with AI

```jsx
const BatchImport = () => {
  const [wordList, setWordList] = useState('');
  const [progress, setProgress] = useState(0);

  const batchCreate = async () => {
    const words = wordList.split('\n').map(w => w.trim()).filter(Boolean);
    
    if (words.length > 20) {
      alert('Maximum 20 words per batch');
      return;
    }

    try {
      const response = await fetch('/api/ai/batch-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          deckId: selectedDeckId,
          words
        })
      });
      
      const data = await response.json();
      alert(`Created ${data.data.length} flashcards!`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h3>Batch Import with AI</h3>
      <textarea
        value={wordList}
        onChange={(e) => setWordList(e.target.value)}
        placeholder="Enter words (one per line)&#10;Example:&#10;beautiful&#10;amazing&#10;wonderful"
        rows={10}
      />
      <button onClick={batchCreate}>
        🤖 Create All Flashcards with AI
      </button>
    </div>
  );
};
```

### 3. Enrich Existing Flashcard

```jsx
const EnrichButton = ({ flashcardId }) => {
  const [loading, setLoading] = useState(false);

  const enrichFlashcard = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ai/enrich/${flashcardId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ regenerate: false })
      });
      
      const data = await response.json();
      alert('Flashcard enriched with AI data!');
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <button onClick={enrichFlashcard} disabled={loading}>
      {loading ? '⏳ Enriching...' : '🤖 Enrich with AI'}
    </button>
  );
};
```

### 4. Polysemy Warning

```jsx
const PolysemyWarning = ({ word }) => {
  const [isPolysemous, setIsPolysemous] = useState(false);
  const [meanings, setMeanings] = useState([]);

  useEffect(() => {
    const checkPolysemy = async () => {
      const response = await fetch('/api/ai/detect-polysemy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ word })
      });
      
      const data = await response.json();
      setIsPolysemous(data.data.isPolysemous);
      setMeanings(data.data.mainMeanings);
    };

    if (word) {
      checkPolysemy();
    }
  }, [word]);

  if (!isPolysemous) return null;

  return (
    <div className="polysemy-warning">
      <h4>⚠️ This word has multiple meanings!</h4>
      <p>Consider creating separate flashcards for each meaning:</p>
      <ul>
        {meanings.map((m, i) => (
          <li key={i}>
            <strong>{m.definition}</strong>
            <p>{m.example}</p>
            <span className="frequency">{m.frequency}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
```

---

## 🧪 Testing Examples

### Test 1: Analyze a word
```bash
curl -X POST http://localhost:1124/api/ai/analyze \
-H "Authorization: Bearer <token>" \
-H "Content-Type: application/json" \
-d '{"word": "beautiful"}'
```

### Test 2: Create flashcard with AI
```bash
curl -X POST http://localhost:1124/api/ai/analyze-and-create \
-H "Authorization: Bearer <admin_token>" \
-H "Content-Type: application/json" \
-d '{
  "deckId": "deck_id",
  "word": "amazing"
}'
```

### Test 3: Detect polysemy
```bash
curl -X POST http://localhost:1124/api/ai/detect-polysemy \
-H "Authorization: Bearer <token>" \
-H "Content-Type: application/json" \
-d '{"word": "bank"}'
```

### Test 4: Batch create
```bash
curl -X POST http://localhost:1124/api/ai/batch-create \
-H "Authorization: Bearer <admin_token>" \
-H "Content-Type: application/json" \
-d '{
  "deckId": "deck_id",
  "words": ["happy", "sad", "angry"]
}'
```

---

## 💡 Use Cases

### 1. Quick Flashcard Creation
- Teacher enters word → AI analyzes → Flashcard created
- Saves time on finding definitions, examples, synonyms
- Automatic pronunciation and part of speech

### 2. Vocabulary Import
- Import word list from textbook
- AI generates all flashcard data
- Batch processing for efficiency

### 3. Polysemy Detection
- Warns when word has multiple meanings
- Suggests creating separate cards
- Helps avoid confusion

### 4. Example Generation
- Get natural, conversational examples
- Multiple difficulty levels
- Contextual usage

### 5. Collocation Discovery
- Find common word combinations
- Improve natural language usage
- Learn phrases, not just words

### 6. Enrich Old Flashcards
- Add AI data to existing cards
- Fill in missing information
- Update with current usage

---

## ⚙️ Configuration

### Rate Limits
- **Analyze**: No limit (standard Gemini API limits apply)
- **Batch**: Max 20 words per request
- **Processing**: ~5 words per second

### AI Model
- **Model**: `gemini-pro`
- **Temperature**: Default (0.7)
- **Max Tokens**: Auto

### Error Handling
- Graceful fallback if AI fails
- Error messages in Vietnamese
- Retry logic for transient errors

---

## 🔒 Security

### Authentication
- All routes require JWT token
- Admin/Teacher only for creation endpoints
- Students can analyze but not create

### API Key
- Store in `.env` (never commit)
- Server-side only (never expose to frontend)
- Rotate regularly

---

## 📊 Performance

### Caching (Future Enhancement)
- Cache common words
- Redis for fast lookup
- Reduce API calls

### Batch Processing
- Process in chunks of 5
- 1 second delay between chunks
- Avoid rate limits

---

## ✅ Best Practices

1. **Always check polysemy** - Multi-meaning words need multiple cards
2. **Review AI output** - AI is helpful but not perfect
3. **Use context** - Provide example sentences for better analysis
4. **Batch when possible** - More efficient than one-by-one
5. **Enrich existing data** - Don't overwrite user edits
6. **Set appropriate difficulty** - Trust AI's CEFR levels

---

## 🚀 Future Enhancements

- [ ] Image generation (Imagen API)
- [ ] Audio generation (Text-to-Speech)
- [ ] Translation improvements
- [ ] Context-aware analysis
- [ ] Word frequency data
- [ ] Etymology information
- [ ] Cultural notes
- [ ] Usage trends

---

**Status**: ✅ Complete  
**Date**: 2025-11-02  
**Task**: #21 - Google Gemini AI Integration
