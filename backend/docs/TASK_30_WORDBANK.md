# Task 30: Worldbank Vocabulary Notebook - API Documentation

## Tổng Quan

Task 30 triển khai tính năng **Sổ Tay Từ Vựng (Wordbank)** - hệ thống quản lý và học từ vựng toàn diện với nguồn dữ liệu từ Worldbank. Người dùng có thể:

1. **Khám Phá Từ Vựng** - Tìm kiếm theo tag, chủ đề, độ khó
2. **Sổ Tay Cá Nhân** - Lưu từ vào sổ tay riêng, thêm ghi chú
3. **Học Thông Minh** - Hệ thống Spaced Repetition (SM-2)
4. **Theo Dõi Tiến Độ** - Thống kê chi tiết, theo dõi cải thiện
5. **Bộ Sưu Tập** - Collections theo chủ đề sẵn có

**Đặc điểm nổi bật:**
- 📚 Từ điển phong phú từ Worldbank với pronunciation, examples, collocations
- 🏷️ Phân loại theo topic, tag, difficulty (A1-C2), frequency
- 🧠 Spaced Repetition với thuật toán SM-2
- 📊 Thống kê chi tiết: confidence, mastery percentage, review schedule
- 🔍 Tìm kiếm thông minh: related words, synonyms, antonyms, word families
- 📦 Export/Import: JSON, CSV
- 🎯 Gợi ý từ cá nhân hóa dựa trên lịch sử học

---

## Mục Lục

- [Mô Hình Dữ Liệu](#mô-hình-dữ-liệu)
- [API Endpoints](#api-endpoints)
  - [Discovery & Search](#1-discovery--search)
  - [Personal Wordbank](#2-personal-wordbank)
  - [Learning & Progress](#3-learning--progress)
  - [Collections](#4-collections)
  - [Statistics & Export](#5-statistics--export)
- [Learning System](#learning-system)
- [Frontend Integration](#frontend-integration)
- [Testing Guide](#hướng-dẫn-kiểm-thử)

---

## Mô Hình Dữ Liệu

### 1. WordbankEntry (Từ trong Worldbank)

```javascript
{
  // Core information
  word: "communicate",
  
  // Pronunciation
  pronunciation: {
    ipa: "/kəˈmjuː.nɪ.keɪt/",
    audio: "https://example.com/audio/communicate.mp3",
    syllables: "com-mu-ni-cate"
  },
  
  // Definitions (multiple meanings)
  definitions: [{
    partOfSpeech: "verb",
    meaning: "to share information with others by speaking, writing, etc.",
    translation: "giao tiếp, truyền đạt",
    examples: [{
      english: "We communicate by email.",
      vietnamese: "Chúng tôi giao tiếp qua email."
    }]
  }],
  
  // Categorization
  topics: ["communication", "daily-life", "business"],
  tags: ["common", "essential", "general-english"],
  difficulty: "B1",           // A1, A2, B1, B2, C1, C2
  frequency: 85,              // 0-100, higher = more common
  
  // Related words
  synonyms: ["converse", "talk", "express"],
  antonyms: ["withhold", "conceal"],
  
  collocations: [{
    phrase: "communicate effectively",
    meaning: "giao tiếp hiệu quả",
    example: "It's important to communicate effectively at work."
  }],
  
  wordFamilies: [{
    word: "communication",
    partOfSpeech: "noun",
    meaning: "the act of communicating"
  }, {
    word: "communicative",
    partOfSpeech: "adjective",
    meaning: "willing to talk and share information"
  }],
  
  // Usage information
  usageNotes: "Can be used in formal and informal contexts",
  formalityLevel: "neutral",
  registerType: "general",
  
  // Visual learning
  imageUrl: "https://example.com/images/communicate.jpg",
  
  // Statistics
  totalLearners: 1500,
  totalAddedToDecks: 2300,
  averageRating: 4.5
}
```

### 2. UserWordbank (Từ trong Sổ Tay Cá Nhân)

```javascript
{
  user: ObjectId,
  word: ObjectId,              // Ref to WordbankEntry
  
  // Learning status
  status: "learning",          // 'new', 'learning', 'reviewing', 'mastered'
  
  // Progress tracking
  timesReviewed: 5,
  correctCount: 8,
  incorrectCount: 2,
  confidence: 80,              // 0-100 (correctCount / total × 100)
  
  // Personal notes
  personalNotes: "Remember: used for both people and data",
  personalExamples: [{
    sentence: "I like to communicate with my friends on social media.",
    createdAt: "2025-11-09T10:00:00.000Z"
  }],
  personalTags: ["study-for-exam", "work-vocabulary"],
  
  sourceContext: "Found in Unit 5 lesson",
  
  // Spaced Repetition (SM-2 Algorithm)
  nextReviewDate: "2025-11-15T10:00:00.000Z",
  reviewInterval: 6,           // Days until next review
  easeFactor: 2.5,             // Difficulty multiplier (min 1.3)
  
  // Bookmarking
  isFavorite: true,
  isPriority: false,
  userRating: 5,
  
  // Dates
  addedAt: "2025-11-01T10:00:00.000Z",
  lastReviewedAt: "2025-11-09T10:00:00.000Z",
  masteredAt: null
}
```

**Spaced Repetition - SM-2 Algorithm:**
```javascript
// Review intervals:
// First review: 1 day
// Second review: 6 days
// Third review: interval × easeFactor days
// If failed (quality < 3): reset to 1 day

// easeFactor calculation:
newEF = oldEF + (0.1 - (5 - quality) × (0.08 + (5 - quality) × 0.02))
// quality: 0-5 (0 = complete blackout, 5 = perfect recall)
```

### 3. WordbankCollection (Bộ Sưu Tập Từ)

```javascript
{
  name: "IELTS Speaking Topics",
  nameVietnamese: "Chủ đề IELTS Speaking",
  
  description: "Essential vocabulary for IELTS Speaking test",
  descriptionVietnamese: "Từ vựng thiết yếu cho kỳ thi IELTS Speaking",
  
  icon: "🎤",
  color: "#4CAF50",
  
  category: "exam-prep",       // academic, business, daily-life, travel, etc.
  words: [ObjectId, ...],      // Array of WordbankEntry IDs
  
  difficulty: "B2",
  estimatedStudyTime: 120,     // Minutes
  tags: ["ielts", "speaking", "exam"],
  
  // Statistics
  totalWords: 150,
  subscriberCount: 3500,
  
  isPublic: true,
  isOfficial: true
}
```

---

## API Endpoints

### 1. Discovery & Search

#### 1.1. Search Words

```http
GET /api/wordbank/search?q=communicate&difficulty=B1&topics=communication&page=1&limit=20
```

**Query Parameters:**
- `q`: Search query (word or meaning)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `difficulty`: Filter by difficulty (A1, A2, B1, B2, C1, C2)
- `topics`: Comma-separated topics (e.g., "communication,business")
- `tags`: Comma-separated tags
- `minFrequency`: Minimum frequency (0-100)
- `maxFrequency`: Maximum frequency (0-100)
- `sortBy`: Sort field (frequency, word, difficulty, popularity)
- `sortOrder`: Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "words": [
      {
        "_id": "674a5f8d...",
        "word": "communicate",
        "pronunciation": {
          "ipa": "/kəˈmjuː.nɪ.keɪt/",
          "audio": "...",
          "syllables": "com-mu-ni-cate"
        },
        "definitions": [...],
        "topics": ["communication", "daily-life"],
        "difficulty": "B1",
        "frequency": 85,
        "totalLearners": 1500
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 20,
      "pages": 8
    }
  }
}
```

#### 1.2. Get Word Details

```http
GET /api/wordbank/words/:wordId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "674a5f8d...",
    "word": "communicate",
    "pronunciation": {...},
    "definitions": [{
      "partOfSpeech": "verb",
      "meaning": "to share information with others",
      "translation": "giao tiếp",
      "examples": [...]
    }],
    "topics": ["communication"],
    "tags": ["common", "essential"],
    "difficulty": "B1",
    "frequency": 85,
    "synonyms": ["converse", "talk"],
    "antonyms": ["withhold"],
    "collocations": [...],
    "wordFamilies": [...],
    "usageNotes": "...",
    "formalityLevel": "neutral",
    "imageUrl": "...",
    "totalLearners": 1500,
    "averageRating": 4.5
  }
}
```

#### 1.3. Get Related Words

```http
GET /api/wordbank/words/:wordId/related
```

**Response:**
```json
{
  "success": true,
  "data": {
    "synonyms": [
      {
        "_id": "674a5f8d...",
        "word": "converse",
        "definitions": {...},
        "pronunciation": {...}
      }
    ],
    "antonyms": [...],
    "wordFamilies": [],
    "sameTopic": [
      {
        "_id": "674a5f8d...",
        "word": "conversation",
        "topics": ["communication"]
      }
    ]
  }
}
```

#### 1.4. Get All Topics

```http
GET /api/wordbank/topics
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "topic": "communication",
      "count": 250
    },
    {
      "topic": "business",
      "count": 180
    },
    {
      "topic": "daily-life",
      "count": 320
    }
  ]
}
```

#### 1.5. Get Words by Topic

```http
GET /api/wordbank/topics/communication?page=1&limit=20&difficulty=B1
```

#### 1.6. Get All Tags

```http
GET /api/wordbank/tags
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "tag": "common",
      "count": 500
    },
    {
      "tag": "essential",
      "count": 300
    }
  ]
}
```

#### 1.7. Get Words by Tag

```http
GET /api/wordbank/tags/common?page=1&limit=20
```

#### 1.8. Get Words by Difficulty

```http
GET /api/wordbank/difficulty/B1?page=1&limit=20
```

#### 1.9. Get Random Words

```http
GET /api/wordbank/random?count=10&difficulty=B1&topics=communication
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "674a5f8d...",
      "word": "communicate",
      "definitions": [...],
      "difficulty": "B1"
    }
  ]
}
```

---

### 2. Personal Wordbank

#### 2.1. Add Word to Personal Wordbank

```http
POST /api/wordbank/my-words/:wordId
Authorization: Bearer <token>
Content-Type: application/json

{
  "sourceContext": "Unit 5 - Communication",
  "personalNotes": "Important for IELTS speaking",
  "personalTags": ["ielts", "speaking"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Word added to your wordbank",
  "data": {
    "_id": "674a5f8d...",
    "user": "674a5f8d...",
    "word": "674a5f8d...",
    "status": "new",
    "confidence": 0,
    "nextReviewDate": "2025-11-09T10:00:00.000Z"
  }
}
```

#### 2.2. Get Personal Wordbank

```http
GET /api/wordbank/my-words?status=learning&isFavorite=true&page=1&limit=20
Authorization: Bearer <token>
```

**Query Parameters:**
- `status`: Filter by status (new, learning, reviewing, mastered)
- `isFavorite`: Filter favorites (true/false)
- `isPriority`: Filter priority words (true/false)
- `sortBy`: Sort field (addedAt, confidence, nextReview)
- `sortOrder`: Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "words": [
      {
        "_id": "674a5f8d...",
        "word": {
          "word": "communicate",
          "pronunciation": {...},
          "definitions": [...],
          "difficulty": "B1"
        },
        "status": "learning",
        "confidence": 75,
        "timesReviewed": 5,
        "correctCount": 6,
        "incorrectCount": 2,
        "personalNotes": "Important for IELTS",
        "isFavorite": true,
        "nextReviewDate": "2025-11-15T10:00:00.000Z",
        "addedAt": "2025-11-01T10:00:00.000Z"
      }
    ],
    "pagination": {...}
  }
}
```

#### 2.3. Update User Word

```http
PUT /api/wordbank/my-words/:wordId
Authorization: Bearer <token>
Content-Type: application/json

{
  "personalNotes": "Updated notes",
  "personalTags": ["exam", "important"],
  "isFavorite": true,
  "isPriority": true,
  "userRating": 5
}
```

#### 2.4. Remove from Personal Wordbank

```http
DELETE /api/wordbank/my-words/:wordId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Word removed from your wordbank"
}
```

---

### 3. Learning & Progress

#### 3.1. Update Word Progress

```http
POST /api/wordbank/my-words/:wordId/progress
Authorization: Bearer <token>
Content-Type: application/json

{
  "isCorrect": true,
  "timeSpent": 30,
  "quality": 4
}
```

**Fields:**
- `isCorrect`: Whether user answered correctly
- `timeSpent`: Time spent on this review (seconds)
- `quality`: SM-2 quality (0-5)
  - 0: Complete blackout
  - 1: Incorrect, but remembered after seeing answer
  - 2: Incorrect, but seemed familiar
  - 3: Correct, but difficult
  - 4: Correct, with hesitation
  - 5: Perfect recall

**Response:**
```json
{
  "success": true,
  "message": "Progress updated",
  "data": {
    "_id": "674a5f8d...",
    "status": "reviewing",
    "confidence": 80,
    "timesReviewed": 6,
    "correctCount": 7,
    "incorrectCount": 2,
    "nextReviewDate": "2025-11-20T10:00:00.000Z",
    "reviewInterval": 11,
    "easeFactor": 2.6
  }
}
```

#### 3.2. Get Words for Review

```http
GET /api/wordbank/my-words/review?limit=20
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "674a5f8d...",
      "word": {
        "word": "communicate",
        "definitions": [...],
        "pronunciation": {...}
      },
      "status": "learning",
      "confidence": 70,
      "nextReviewDate": "2025-11-09T08:00:00.000Z",
      "timesReviewed": 3
    }
  ]
}
```

#### 3.3. Get Suggested Words

```http
GET /api/wordbank/suggestions?limit=10
Authorization: Bearer <token>
```

**Gợi ý dựa trên:**
- Topics user quan tâm (từ words đã học)
- Difficulty phù hợp với level hiện tại
- Từ chưa có trong wordbank
- Frequency cao

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "674a5f8d...",
      "word": "conversation",
      "definitions": [...],
      "topics": ["communication"],
      "difficulty": "B1",
      "frequency": 82
    }
  ]
}
```

---

### 4. Collections

#### 4.1. Get All Collections

```http
GET /api/wordbank/collections?category=exam-prep&difficulty=B2&page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "collections": [
      {
        "_id": "674a5f8d...",
        "name": "IELTS Speaking Topics",
        "nameVietnamese": "Chủ đề IELTS Speaking",
        "description": "Essential vocabulary for IELTS Speaking",
        "icon": "🎤",
        "color": "#4CAF50",
        "category": "exam-prep",
        "difficulty": "B2",
        "totalWords": 150,
        "estimatedStudyTime": 120,
        "subscriberCount": 3500
      }
    ],
    "pagination": {...}
  }
}
```

#### 4.2. Get Collection Details

```http
GET /api/wordbank/collections/:collectionId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "674a5f8d...",
    "name": "IELTS Speaking Topics",
    "description": "...",
    "words": [
      {
        "_id": "674a5f8d...",
        "word": "communicate",
        "definitions": [...],
        "difficulty": "B1"
      }
    ],
    "totalWords": 150,
    "estimatedStudyTime": 120
  }
}
```

#### 4.3. Subscribe to Collection

```http
POST /api/wordbank/collections/:collectionId/subscribe
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Collection added to your wordbank",
  "data": {
    "added": 145,
    "skipped": 5,
    "errors": []
  }
}
```

---

### 5. Statistics & Export

#### 5.1. Get User Statistics

```http
GET /api/wordbank/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalWords": 150,
    "masteredWords": 45,
    "reviewsDue": 12,
    "byStatus": [
      {
        "_id": "new",
        "count": 30,
        "avgConfidence": 0
      },
      {
        "_id": "learning",
        "count": 50,
        "avgConfidence": 65
      },
      {
        "_id": "reviewing",
        "count": 25,
        "avgConfidence": 82
      },
      {
        "_id": "mastered",
        "count": 45,
        "avgConfidence": 95
      }
    ],
    "masteryPercentage": "30.00",
    "recentWords": [
      {
        "word": "communicate",
        "addedAt": "2025-11-09T10:00:00.000Z",
        "status": "learning"
      }
    ]
  }
}
```

#### 5.2. Get Learning Progress Over Time

```http
GET /api/wordbank/progress?days=30
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "2025-11-01",
      "wordsAdded": 10,
      "avgConfidence": 65
    },
    {
      "_id": "2025-11-02",
      "wordsAdded": 8,
      "avgConfidence": 68
    },
    {
      "_id": "2025-11-09",
      "wordsAdded": 5,
      "avgConfidence": 75
    }
  ]
}
```

#### 5.3. Export Wordbank

```http
GET /api/wordbank/export?format=json
Authorization: Bearer <token>
```

**Formats:**
- `json`: JSON format (default)
- `csv`: CSV format

**Response (JSON):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "674a5f8d...",
      "word": {
        "word": "communicate",
        "definitions": [...],
        "pronunciation": {...}
      },
      "status": "learning",
      "confidence": 75,
      "personalNotes": "..."
    }
  ]
}
```

**Response (CSV):**
```csv
word,definition,translation,status,confidence,notes
communicate,"to share information","giao tiếp",learning,75,"Important for IELTS"
conversation,"talk between people","cuộc trò chuyện",reviewing,85,""
```

---

## Learning System

### Spaced Repetition - SM-2 Algorithm

#### Cách Hoạt Động

1. **First Review**: Sau 1 ngày
2. **Second Review**: Sau 6 ngày
3. **Subsequent Reviews**: `interval × easeFactor` ngày

#### Quality Ratings

```
0: Complete blackout (hoàn toàn không nhớ)
1: Incorrect, but remembered after seeing answer (sai nhưng nhớ lại khi thấy đáp án)
2: Incorrect, but seemed familiar (sai nhưng cảm giác quen)
3: Correct, but difficult (đúng nhưng khó nhớ)
4: Correct, with hesitation (đúng nhưng chần chừ)
5: Perfect recall (nhớ hoàn hảo)
```

#### Ease Factor Calculation

```javascript
newEF = oldEF + (0.1 - (5 - quality) × (0.08 + (5 - quality) × 0.02))

// Minimum easeFactor: 1.3
if (newEF < 1.3) newEF = 1.3
```

#### Review Interval

```javascript
if (quality < 3) {
  // Failed - reset to 1 day
  newInterval = 1
} else {
  if (interval === 0) newInterval = 1
  else if (interval === 1) newInterval = 6
  else newInterval = Math.round(interval × easeFactor)
}
```

### Status Progression

```
new → learning → reviewing → mastered

Conditions:
- new → learning: after first review
- learning → reviewing: confidence >= 70% and reviewed >= 3 times
- reviewing → mastered: confidence >= 90% and reviewed >= 5 times
```

---

## Frontend Integration

### Example: Personal Wordbank Component

```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const PersonalWordbank = () => {
  const [words, setWords] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    fetchWordbank();
    fetchStats();
  }, [filter]);
  
  const fetchWordbank = async () => {
    try {
      const params = {};
      if (filter !== 'all') params.status = filter;
      
      const response = await axios.get('/api/wordbank/my-words', {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setWords(response.data.data.words);
    } catch (error) {
      console.error('Error fetching wordbank:', error);
    }
  };
  
  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/wordbank/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };
  
  const addWord = async (wordId) => {
    try {
      await axios.post(
        `/api/wordbank/my-words/${wordId}`,
        {
          sourceContext: 'Manual addition',
          personalNotes: ''
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      alert('Word added!');
      fetchWordbank();
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding word');
    }
  };
  
  const updateProgress = async (wordId, isCorrect, quality) => {
    try {
      const response = await axios.post(
        `/api/wordbank/my-words/${wordId}/progress`,
        {
          isCorrect,
          timeSpent: 30,
          quality
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
       ('Next review:', response.data.data.nextReviewDate);
      fetchWordbank();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };
  
  return (
    <div className="personal-wordbank">
      <h2>My Wordbank</h2>
      
      {/* Statistics */}
      {stats && (
        <div className="stats">
          <div className="stat-card">
            <h3>{stats.totalWords}</h3>
            <p>Total Words</p>
          </div>
          <div className="stat-card">
            <h3>{stats.masteredWords}</h3>
            <p>Mastered</p>
          </div>
          <div className="stat-card">
            <h3>{stats.reviewsDue}</h3>
            <p>Due for Review</p>
          </div>
          <div className="stat-card">
            <h3>{stats.masteryPercentage}%</h3>
            <p>Mastery</p>
          </div>
        </div>
      )}
      
      {/* Filters */}
      <div className="filters">
        <button onClick={() => setFilter('all')}>All</button>
        <button onClick={() => setFilter('new')}>New</button>
        <button onClick={() => setFilter('learning')}>Learning</button>
        <button onClick={() => setFilter('reviewing')}>Reviewing</button>
        <button onClick={() => setFilter('mastered')}>Mastered</button>
      </div>
      
      {/* Word List */}
      <div className="word-list">
        {words.map(userWord => (
          <div key={userWord._id} className="word-card">
            <div className="word-header">
              <h3>{userWord.word.word}</h3>
              <span className={`status ${userWord.status}`}>
                {userWord.status}
              </span>
            </div>
            
            <div className="pronunciation">
              {userWord.word.pronunciation?.ipa}
              {userWord.word.pronunciation?.audio && (
                <audio controls src={userWord.word.pronunciation.audio} />
              )}
            </div>
            
            <div className="definition">
              {userWord.word.definitions[0]?.meaning}
            </div>
            
            <div className="translation">
              {userWord.word.definitions[0]?.translation}
            </div>
            
            <div className="progress">
              <div className="confidence-bar">
                <div 
                  className="confidence-fill" 
                  style={{ width: `${userWord.confidence}%` }}
                />
              </div>
              <span>Confidence: {userWord.confidence}%</span>
            </div>
            
            <div className="stats-row">
              <span>Reviewed: {userWord.timesReviewed} times</span>
              <span>Correct: {userWord.correctCount}</span>
              <span>Incorrect: {userWord.incorrectCount}</span>
            </div>
            
            {userWord.personalNotes && (
              <div className="notes">
                <strong>Notes:</strong> {userWord.personalNotes}
              </div>
            )}
            
            <div className="next-review">
              Next review: {new Date(userWord.nextReviewDate).toLocaleDateString()}
            </div>
            
            <div className="actions">
              <button onClick={() => updateProgress(userWord.word._id, true, 5)}>
                ✓ Know
              </button>
              <button onClick={() => updateProgress(userWord.word._id, false, 1)}>
                ✗ Don't Know
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PersonalWordbank;
```

### Example: Word Search Component

```jsx
const WordSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  
  useEffect(() => {
    fetchTopics();
  }, []);
  
  const fetchTopics = async () => {
    const response = await axios.get('/api/wordbank/topics');
    setTopics(response.data.data);
  };
  
  const searchWords = async () => {
    try {
      const response = await axios.get('/api/wordbank/search', {
        params: {
          q: query,
          topics: selectedTopic,
          limit: 20
        }
      });
      
      setResults(response.data.data.words);
    } catch (error) {
      console.error('Error searching:', error);
    }
  };
  
  return (
    <div className="word-search">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search words..."
      />
      
      <select 
        value={selectedTopic} 
        onChange={(e) => setSelectedTopic(e.target.value)}
      >
        <option value="">All Topics</option>
        {topics.map(t => (
          <option key={t.topic} value={t.topic}>
            {t.topic} ({t.count})
          </option>
        ))}
      </select>
      
      <button onClick={searchWords}>Search</button>
      
      <div className="results">
        {results.map(word => (
          <WordCard key={word._id} word={word} />
        ))}
      </div>
    </div>
  );
};
```

---

## Hướng Dẫn Kiểm Thử

### 1. Search Words

```bash
curl "http://localhost:1124/api/wordbank/search?q=communicate&difficulty=B1"
```

### 2. Add Word to Personal Wordbank

```bash
curl -X POST http://localhost:1124/api/wordbank/my-words/WORD_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "personalNotes": "Important word",
    "personalTags": ["exam"]
  }'
```

### 3. Get Personal Wordbank

```bash
curl "http://localhost:1124/api/wordbank/my-words?status=learning" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Update Progress

```bash
curl -X POST http://localhost:1124/api/wordbank/my-words/WORD_ID/progress \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isCorrect": true,
    "timeSpent": 30,
    "quality": 5
  }'
```

### 5. Get Words for Review

```bash
curl "http://localhost:1124/api/wordbank/my-words/review?limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 6. Get Statistics

```bash
curl "http://localhost:1124/api/wordbank/stats" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 7. Subscribe to Collection

```bash
curl -X POST http://localhost:1124/api/wordbank/collections/COLLECTION_ID/subscribe \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 8. Export Wordbank

```bash
# JSON format
curl "http://localhost:1124/api/wordbank/export?format=json" \
  -H "Authorization: Bearer YOUR_TOKEN"

# CSV format
curl "http://localhost:1124/api/wordbank/export?format=csv" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o wordbank.csv
```

---

## Best Practices

### 1. Learning Strategy

✅ **Recommended:**
1. Start with high-frequency words (frequency > 70)
2. Focus on one topic at a time
3. Review words daily (especially those due for review)
4. Add personal notes and examples
5. Use quality ratings honestly (1-5)

❌ **Avoid:**
- Adding too many words at once (>20/day)
- Skipping reviews
- Not using personal notes
- Always rating perfect (5) when not truly perfect

### 2. Using Collections

✅ **Best way:**
1. Browse collections by category
2. Check difficulty level matches your level
3. Subscribe to 1-2 collections at a time
4. Complete one collection before starting another

### 3. Progress Tracking

- Review daily statistics
- Monitor mastery percentage
- Track improvement over time
- Adjust learning pace based on confidence

---

## Topics & Tags Structure

### Common Topics

```javascript
// Academic
["academic-writing", "research", "presentation", "essay"]

// Business
["business-meeting", "negotiation", "marketing", "finance"]

// Daily Life
["shopping", "transportation", "food", "housing"]

// Travel
["airport", "hotel", "directions", "sightseeing"]

// Technology
["computer", "internet", "software", "mobile"]

// Health
["medical", "fitness", "mental-health", "nutrition"]
```

### Common Tags

```javascript
["common", "essential", "advanced", "formal", "informal", 
 "idiom", "phrasal-verb", "collocation", "academic", "business"]
```

---

## Database Seeding

### Sample Data for Testing

```javascript
// Sample WordbankEntry
{
  word: "communicate",
  pronunciation: {
    ipa: "/kəˈmjuː.nɪ.keɪt/",
    syllables: "com-mu-ni-cate"
  },
  definitions: [{
    partOfSpeech: "verb",
    meaning: "to share information with others",
    translation: "giao tiếp",
    examples: [{
      english: "We communicate by email.",
      vietnamese: "Chúng tôi giao tiếp qua email."
    }]
  }],
  topics: ["communication", "daily-life"],
  tags: ["common", "essential"],
  difficulty: "B1",
  frequency: 85,
  synonyms: ["converse", "talk"],
  antonyms: ["withhold"],
  collocations: [{
    phrase: "communicate effectively",
    meaning: "giao tiếp hiệu quả",
    example: "It's important to communicate effectively."
  }],
  wordFamilies: [{
    word: "communication",
    partOfSpeech: "noun",
    meaning: "the act of communicating"
  }],
  usageNotes: "Can be used in formal and informal contexts",
  formalityLevel: "neutral"
}
```

---

## FAQ

**Q: Spaced Repetition hoạt động như thế nào?**  
A: Hệ thống sử dụng thuật toán SM-2. Từ sẽ được review sau 1 ngày, 6 ngày, rồi tăng dần dựa trên độ khó (easeFactor). Nếu trả lời sai, interval reset về 1 ngày.

**Q: Quality rating nên chọn sao cho đúng?**  
A:
- 5: Nhớ ngay lập tức, không chần chừ
- 4: Nhớ được nhưng mất vài giây
- 3: Nhớ nhưng khó khăn
- 2: Không nhớ nhưng khi thấy đáp án thì "ah, đúng rồi"
- 1: Hoàn toàn không nhớ
- 0: Complete blackout

**Q: Nên học bao nhiêu từ mới mỗi ngày?**  
A: 10-15 từ/ngày là tối ưu. Quan trọng là review từ cũ hơn là thêm quá nhiều từ mới.

**Q: Làm sao để tìm từ phù hợp với level của mình?**  
A: Dùng filter `difficulty` và bắt đầu từ level thấp hơn 1 bậc. Ví dụ: nếu bạn B2, bắt đầu với B1.

**Q: Collection vs Personal Wordbank khác gì?**  
A: Collection là bộ từ có sẵn theo chủ đề. Personal Wordbank là sổ tay riêng của bạn. Bạn có thể subscribe collection để thêm tất cả từ vào wordbank.

**Q: Export để làm gì?**  
A: Backup dữ liệu, in flashcard giấy, hoặc import vào app khác.

---

**Cập Nhật Lần Cuối:** 9 tháng 11, 2025  
**Phiên Bản:** 1.0.0  
**Tác Giả:** Đội Phát Triển APPTA
