# Task 23: Bulk Edit, Tags & Organization

## 📚 Tổng quan

Tính năng chỉnh sửa hàng loạt, gắn tag, và tổ chức flashcards giúp:
- ✏️ **Chỉnh sửa hàng loạt** - Cập nhật nhiều flashcards cùng lúc
- 🏷️ **Quản lý tags** - Thêm/xóa tags cho nhiều flashcards
- 📊 **Phân loại theo Part of Speech** - Tổ chức theo loại từ
- 🔍 **Lọc và tìm kiếm** - Filter flashcards theo tags, POS, difficulty
- 📈 **Thống kê** - Xem thống kê flashcards theo nhiều tiêu chí
- 🗑️ **Xóa hàng loạt** - Xóa nhiều flashcards cùng lúc

---

## 🎯 API Endpoints

### 1. Bulk Update Flashcards

**PUT** `/api/flashcards-bulk/bulk-update`

Chỉnh sửa nhiều flashcards cùng lúc.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "flashcardIds": [
    "flashcard_id_1",
    "flashcard_id_2",
    "flashcard_id_3"
  ],
  "updates": {
    "difficulty": "intermediate",
    "cefrLevel": "B1",
    "tags": ["business", "formal"],
    "usageNotes": "Commonly used in professional settings"
  }
}
```

**Allowed Update Fields:**
- `tags` - Array of strings
- `difficulty` - `beginner`, `elementary`, `intermediate`, `upper-intermediate`, `advanced`
- `cefrLevel` - `A1`, `A2`, `B1`, `B2`, `C1`, `C2`
- `partOfSpeech` - `noun`, `verb`, `adjective`, `adverb`, etc.
- `usageNotes` - String
- `grammarNotes` - String
- `hints` - String

**Limits:**
- Maximum 100 flashcards per request

**Response:**
```json
{
  "success": true,
  "message": "Đã cập nhật 3 flashcards",
  "data": {
    "matchedCount": 3,
    "modifiedCount": 3,
    "updates": {
      "difficulty": "intermediate",
      "cefrLevel": "B1",
      "tags": ["business", "formal"]
    }
  }
}
```

---

### 2. Bulk Add Tags

**PUT** `/api/flashcards-bulk/bulk-add-tags`

Thêm tags cho nhiều flashcards (tránh duplicate).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "flashcardIds": [
    "flashcard_id_1",
    "flashcard_id_2"
  ],
  "tags": ["business", "formal", "communication"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đã thêm tags cho 2 flashcards",
  "data": {
    "matchedCount": 2,
    "modifiedCount": 2,
    "addedTags": ["business", "formal", "communication"]
  }
}
```

---

### 3. Bulk Remove Tags

**PUT** `/api/flashcards-bulk/bulk-remove-tags`

Xóa tags khỏi nhiều flashcards.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "flashcardIds": [
    "flashcard_id_1",
    "flashcard_id_2"
  ],
  "tags": ["old-tag", "deprecated"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đã xoá tags khỏi 2 flashcards",
  "data": {
    "matchedCount": 2,
    "modifiedCount": 2,
    "removedTags": ["old-tag", "deprecated"]
  }
}
```

---

### 4. Bulk Delete Flashcards

**DELETE** `/api/flashcards-bulk/bulk-delete`

Xóa nhiều flashcards cùng lúc.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "flashcardIds": [
    "flashcard_id_1",
    "flashcard_id_2",
    "flashcard_id_3"
  ]
}
```

**Limits:**
- Maximum 100 flashcards per request

**Response:**
```json
{
  "success": true,
  "message": "Đã xoá 3 flashcards",
  "data": {
    "deletedCount": 3
  }
}
```

---

### 5. Get Flashcards By Tags

**GET** `/api/flashcards-bulk/by-tags?tags=business,formal&deckId=xxx`

Lọc flashcards theo tags.

**Query Parameters:**
- `tags` - Comma-separated tags (e.g., `business,formal,communication`)
- `deckId` - Optional: Filter by specific deck
- `partOfSpeech` - Optional: Filter by Part of Speech
- `difficulty` - Optional: Filter by difficulty level
- `cefrLevel` - Optional: Filter by CEFR level

**Response:**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "_id": "flashcard_id",
      "front": "negotiate",
      "back": "to discuss with others to reach an agreement",
      "tags": ["business", "formal", "communication"],
      "partOfSpeech": "verb",
      "difficulty": "intermediate",
      "cefrLevel": "B2",
      "deck": {
        "_id": "deck_id",
        "name": "Business English"
      }
    }
    // ... more flashcards
  ]
}
```

---

### 6. Get Flashcards By Part of Speech

**GET** `/api/flashcards-bulk/by-pos?partOfSpeech=verb&deckId=xxx`

Lọc flashcards theo loại từ (Part of Speech).

**Query Parameters:**
- `partOfSpeech` - Required: `noun`, `verb`, `adjective`, `adverb`, etc.
- `deckId` - Optional: Filter by specific deck

**Response:**
```json
{
  "success": true,
  "count": 25,
  "partOfSpeech": "verb",
  "data": [
    {
      "_id": "flashcard_id",
      "front": "achieve",
      "back": "to successfully complete or obtain something",
      "partOfSpeech": "verb",
      "tags": ["common", "goal-oriented"],
      "difficulty": "elementary"
    }
    // ... more verbs
  ]
}
```

---

### 7. Get All Tags

**GET** `/api/flashcards-bulk/tags/all`

Lấy danh sách tất cả tags unique từ flashcards của user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "count": 42,
  "data": [
    "academic",
    "business",
    "casual",
    "communication",
    "formal",
    "idiom",
    "informal",
    "phrasal-verb",
    "slang",
    "technical"
    // ... all unique tags sorted alphabetically
  ]
}
```

---

### 8. Get Flashcard Statistics

**GET** `/api/flashcards-bulk/statistics?deckId=xxx`

Xem thống kê flashcards theo nhiều tiêu chí.

**Query Parameters:**
- `deckId` - Optional: Statistics for specific deck (omit for all user's decks)

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 350,
    "byPartOfSpeech": [
      { "partOfSpeech": "noun", "count": 120 },
      { "partOfSpeech": "verb", "count": 95 },
      { "partOfSpeech": "adjective", "count": 70 },
      { "partOfSpeech": "adverb", "count": 35 },
      { "partOfSpeech": "phrase", "count": 30 }
    ],
    "byDifficulty": [
      { "difficulty": "elementary", "count": 80 },
      { "difficulty": "intermediate", "count": 150 },
      { "difficulty": "upper-intermediate", "count": 70 },
      { "difficulty": "advanced", "count": 50 }
    ],
    "byCefrLevel": [
      { "level": "A1", "count": 30 },
      { "level": "A2", "count": 50 },
      { "level": "B1", "count": 100 },
      { "level": "B2", "count": 90 },
      { "level": "C1", "count": 60 },
      { "level": "C2", "count": 20 }
    ],
    "byNoteType": [
      { "noteType": "WORD", "count": 280 },
      { "noteType": "PHRASE", "count": 50 },
      { "noteType": "SENTENCE", "count": 15 },
      { "noteType": "CLOZE", "count": 5 }
    ],
    "topTags": [
      { "tag": "business", "count": 85 },
      { "tag": "common", "count": 72 },
      { "tag": "formal", "count": 65 },
      { "tag": "academic", "count": 48 },
      { "tag": "communication", "count": 42 }
      // ... top 20 tags
    ]
  }
}
```

---

## 💡 Use Cases

### 1. Organize New Import
Sau khi import một batch từ mới từ sách giáo khoa:

```javascript
// Step 1: Add subject tags
POST /api/flashcards-bulk/bulk-add-tags
{
  "flashcardIds": [...],
  "tags": ["unit-5", "shopping", "retail"]
}

// Step 2: Set difficulty based on unit level
PUT /api/flashcards-bulk/bulk-update
{
  "flashcardIds": [...],
  "updates": {
    "difficulty": "intermediate",
    "cefrLevel": "B1"
  }
}
```

### 2. Clean Up Old Tags
Xóa tags lỗi thời hoặc sai chính tả:

```javascript
// Remove old tags
PUT /api/flashcards-bulk/bulk-remove-tags
{
  "flashcardIds": [...],
  "tags": ["old-tag", "deprecated", "typo-tag"]
}

// Add corrected tags
PUT /api/flashcards-bulk/bulk-add-tags
{
  "flashcardIds": [...],
  "tags": ["correct-tag", "updated"]
}
```

### 3. Filter for Review Session
Lọc flashcards theo tiêu chí để ôn tập:

```javascript
// Get all intermediate verbs with "business" tag
GET /api/flashcards-bulk/by-tags?tags=business&partOfSpeech=verb&difficulty=intermediate
```

### 4. Part of Speech Organization
Tổ chức flashcards theo loại từ:

```javascript
// Get all nouns in a deck
GET /api/flashcards-bulk/by-pos?partOfSpeech=noun&deckId=deck123

// Update all adjectives with grammar notes
PUT /api/flashcards-bulk/bulk-update
{
  "flashcardIds": [...], // all adjective IDs
  "updates": {
    "grammarNotes": "Comparative: more + adj; Superlative: most + adj"
  }
}
```

### 5. Statistics Dashboard
Hiển thị overview của flashcard collection:

```javascript
// Get statistics for a deck
GET /api/flashcards-bulk/statistics?deckId=deck123

// Display:
// - Pie chart: Distribution by Part of Speech
// - Bar chart: Distribution by Difficulty
// - Tag cloud: Top 20 most used tags
// - CEFR progression chart
```

---

## 🎨 Frontend Integration Examples

### 1. Bulk Edit UI Component

```jsx
const BulkEditPanel = ({ selectedFlashcardIds }) => {
  const [tags, setTags] = useState([]);
  const [difficulty, setDifficulty] = useState('');
  const [cefrLevel, setCefrLevel] = useState('');

  const handleBulkUpdate = async () => {
    const updates = {};
    if (difficulty) updates.difficulty = difficulty;
    if (cefrLevel) updates.cefrLevel = cefrLevel;
    if (tags.length > 0) updates.tags = tags;

    const response = await fetch('/api/flashcards-bulk/bulk-update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        flashcardIds: selectedFlashcardIds,
        updates
      })
    });

    const data = await response.json();
    alert(`Updated ${data.data.modifiedCount} flashcards`);
  };

  return (
    <div className="bulk-edit-panel">
      <h3>Edit {selectedFlashcardIds.length} flashcards</h3>
      
      <TagInput 
        value={tags} 
        onChange={setTags}
        placeholder="Add tags..."
      />
      
      <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
        <option value="">Select Difficulty</option>
        <option value="beginner">Beginner</option>
        <option value="elementary">Elementary</option>
        <option value="intermediate">Intermediate</option>
        <option value="upper-intermediate">Upper-Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>
      
      <select value={cefrLevel} onChange={e => setCefrLevel(e.target.value)}>
        <option value="">Select CEFR Level</option>
        <option value="A1">A1</option>
        <option value="A2">A2</option>
        <option value="B1">B1</option>
        <option value="B2">B2</option>
        <option value="C1">C1</option>
        <option value="C2">C2</option>
      </select>
      
      <button onClick={handleBulkUpdate}>
        Apply to All Selected
      </button>
    </div>
  );
};
```

### 2. Tag Manager Component

```jsx
const TagManager = ({ flashcardIds }) => {
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    // Load all available tags
    fetch('/api/flashcards-bulk/tags/all', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setAllTags(data.data));
  }, []);

  const addTags = async () => {
    const response = await fetch('/api/flashcards-bulk/bulk-add-tags', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        flashcardIds,
        tags: selectedTags
      })
    });

    const data = await response.json();
    alert(`Added tags to ${data.data.modifiedCount} flashcards`);
  };

  const removeTags = async () => {
    const response = await fetch('/api/flashcards-bulk/bulk-remove-tags', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        flashcardIds,
        tags: selectedTags
      })
    });

    const data = await response.json();
    alert(`Removed tags from ${data.data.modifiedCount} flashcards`);
  };

  return (
    <div className="tag-manager">
      <h3>Manage Tags</h3>
      
      <div className="tag-cloud">
        {allTags.map(tag => (
          <span 
            key={tag}
            className={selectedTags.includes(tag) ? 'selected' : ''}
            onClick={() => {
              setSelectedTags(prev => 
                prev.includes(tag) 
                  ? prev.filter(t => t !== tag)
                  : [...prev, tag]
              );
            }}
          >
            {tag}
          </span>
        ))}
      </div>
      
      <div className="actions">
        <button onClick={addTags}>Add Selected Tags</button>
        <button onClick={removeTags}>Remove Selected Tags</button>
      </div>
    </div>
  );
};
```

### 3. Filter Panel Component

```jsx
const FlashcardFilter = ({ deckId, onFilteredResults }) => {
  const [selectedTags, setSelectedTags] = useState([]);
  const [partOfSpeech, setPartOfSpeech] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [cefrLevel, setCefrLevel] = useState('');

  const applyFilter = async () => {
    const params = new URLSearchParams();
    if (deckId) params.append('deckId', deckId);
    if (selectedTags.length > 0) params.append('tags', selectedTags.join(','));
    if (partOfSpeech) params.append('partOfSpeech', partOfSpeech);
    if (difficulty) params.append('difficulty', difficulty);
    if (cefrLevel) params.append('cefrLevel', cefrLevel);

    const response = await fetch(`/api/flashcards-bulk/by-tags?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    onFilteredResults(data.data);
  };

  return (
    <div className="filter-panel">
      <h3>Filter Flashcards</h3>
      
      <TagSelector value={selectedTags} onChange={setSelectedTags} />
      
      <select value={partOfSpeech} onChange={e => setPartOfSpeech(e.target.value)}>
        <option value="">All Parts of Speech</option>
        <option value="noun">Noun</option>
        <option value="verb">Verb</option>
        <option value="adjective">Adjective</option>
        <option value="adverb">Adverb</option>
      </select>
      
      <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
        <option value="">All Difficulties</option>
        <option value="beginner">Beginner</option>
        <option value="elementary">Elementary</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>
      
      <select value={cefrLevel} onChange={e => setCefrLevel(e.target.value)}>
        <option value="">All CEFR Levels</option>
        <option value="A1">A1</option>
        <option value="A2">A2</option>
        <option value="B1">B1</option>
        <option value="B2">B2</option>
        <option value="C1">C1</option>
        <option value="C2">C2</option>
      </select>
      
      <button onClick={applyFilter}>Apply Filter</button>
    </div>
  );
};
```

### 4. Statistics Dashboard Component

```jsx
const StatisticsDashboard = ({ deckId }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const url = deckId 
        ? `/api/flashcards-bulk/statistics?deckId=${deckId}`
        : '/api/flashcards-bulk/statistics';
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      setStats(data.data);
    };

    fetchStats();
  }, [deckId]);

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="statistics-dashboard">
      <h2>Flashcard Statistics</h2>
      
      <div className="stat-card">
        <h3>Total Flashcards</h3>
        <div className="number">{stats.total}</div>
      </div>
      
      <div className="chart-section">
        <h3>Distribution by Part of Speech</h3>
        <PieChart data={stats.byPartOfSpeech} />
      </div>
      
      <div className="chart-section">
        <h3>Distribution by Difficulty</h3>
        <BarChart data={stats.byDifficulty} />
      </div>
      
      <div className="chart-section">
        <h3>CEFR Level Progression</h3>
        <LineChart data={stats.byCefrLevel} />
      </div>
      
      <div className="chart-section">
        <h3>Top Tags</h3>
        <TagCloud data={stats.topTags} />
      </div>
    </div>
  );
};
```

---

## 🔒 Security & Permissions

### Role-Based Access
- **Students**: Can only bulk edit/delete their own flashcards
- **Teachers**: Can bulk edit/delete flashcards in their courses
- **Admins**: Can bulk edit/delete any flashcards

### Validation
- Maximum 100 flashcards per bulk operation
- Only allowed fields can be updated in bulk
- Deck ownership is checked for each flashcard

---

## ✅ Best Practices

### 1. Tagging Strategy
```
✅ Good tags:
- Specific: "business-meeting", "formal-email"
- Hierarchical: "grammar-tense-present-perfect"
- Functional: "IELTS-speaking", "TOEFL-writing"

❌ Bad tags:
- Too generic: "english", "word"
- Redundant: "vocabulary", "flashcard"
- Inconsistent: "Business" vs "business" vs "BUSINESS"
```

### 2. Bulk Operations Workflow
```
1. Filter flashcards → 2. Review selection → 3. Apply changes → 4. Verify results
```

### 3. Organization Tips
- Use tags for topics: `business`, `travel`, `academic`
- Use Part of Speech for grammar: `noun`, `verb`, `adjective`
- Use difficulty for learning path: `beginner` → `advanced`
- Use CEFR levels for exam preparation: `A1` → `C2`

---

## 🚀 Future Enhancements

- [ ] **Smart Auto-Tagging**: AI suggests tags based on content
- [ ] **Bulk Import with Tags**: CSV import with tag columns
- [ ] **Tag Synonyms**: Map related tags automatically
- [ ] **Saved Filters**: Save filter combinations for quick access
- [ ] **Bulk Move**: Move flashcards between decks
- [ ] **Bulk Clone**: Duplicate flashcards with modifications
- [ ] **Tag Analytics**: Track which tags improve learning
- [ ] **Bulk Export**: Export filtered flashcards to CSV/JSON

---

**Status**: ✅ Complete  
**Date**: 2025-11-08  
**Task**: #23 - Bulk Edit, Tags & Organization
