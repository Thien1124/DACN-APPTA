# Task 31: AI Word Explanation & Synonym Comparison - API Documentation

## Tổng Quan

Task 31 triển khai hệ thống **AI giải thích từ vựng** sử dụng Google Gemini AI để:

1. **Giải Thích Nghĩa** - Detailed meaning, etymology, examples
2. **Phân Tích Sắc Thái** - Nuances, formality levels, emotional connotation
3. **Ngữ Cảnh Sử Dụng** - Context-specific usage and appropriateness
4. **So Sánh Từ Đồng Nghĩa** - Detailed comparison of synonyms with when to use each
5. **Usage Tips** - Common mistakes, collocations, pronunciation tips
6. **Ví Dụ Tình Huống** - Situation-specific examples and dialogues

**Đặc điểm nổi bật:**
- 🤖 Powered by Google Gemini AI (gemini-2.5-flash model - same as Task 21)
- 💾 Smart caching (30 days) - tiết kiệm API calls
- 🇻🇳 Vietnamese translations included
- 📊 Detailed nuance analysis with formality levels
- 🔄 Compare multiple synonyms simultaneously
- 📝 Context-specific examples with do's and don'ts
- ⭐ User ratings and feedback system

---

## Mục Lục

- [Mô Hình Dữ Liệu](#mô-hình-dữ-liệu)
- [API Endpoints](#api-endpoints)
  - [Word Explanation](#1-word-explanation)
  - [Synonym Comparison](#2-synonym-comparison)
  - [Context Examples](#3-context-examples)
  - [Nuance Analysis](#4-nuance-analysis)
  - [Usage Tips](#5-usage-tips)
  - [Ratings & Feedback](#6-ratings--feedback)
- [AI Prompts](#ai-prompts)
- [Frontend Integration](#frontend-integration)
- [Testing Guide](#hướng-dẫn-kiểm-thử)

---

## Mô Hình Dữ Liệu

### 1. WordExplanation

```javascript
{
  word: "communicate",
  
  // Basic explanation
  basicMeaning: "to share information with others by speaking, writing, etc.",
  basicMeaningVietnamese: "giao tiếp, truyền đạt thông tin",
  
  // Detailed explanation
  detailedExplanation: "Communication involves the exchange of information...",
  detailedExplanationVietnamese: "Giao tiếp là quá trình trao đổi thông tin...",
  
  // Nuances (sắc thái)
  nuances: [{
    context: "formal",
    description: "Used in professional/academic settings",
    descriptionVietnamese: "Dùng trong môi trường chuyên nghiệp/học thuật",
    example: "We need to communicate our findings to the board.",
    exampleVietnamese: "Chúng ta cần truyền đạt kết quả cho hội đồng."
  }],
  
  // Usage contexts
  usageContexts: [{
    situation: "business meeting",
    appropriateness: "appropriate",
    explanation: "Very suitable for professional communication",
    explanationVietnamese: "Rất phù hợp cho giao tiếp chuyên nghiệp",
    example: "Let's communicate our strategy clearly.",
    exampleVietnamese: "Hãy truyền đạt chiến lược của chúng ta một cách rõ ràng."
  }],
  
  // Common collocations
  commonCollocations: [{
    phrase: "communicate effectively",
    meaning: "to share information in a clear and efficient way",
    meaningVietnamese: "giao tiếp hiệu quả",
    example: "It's important to communicate effectively with your team.",
    exampleVietnamese: "Quan trọng là giao tiếp hiệu quả với nhóm.",
    frequency: "very common"
  }],
  
  // Common mistakes
  commonMistakes: [{
    mistake: "communicate to someone",
    correction: "communicate with someone",
    explanation: "We use 'with' not 'to' when talking about two-way communication",
    explanationVietnamese: "Dùng 'with' chứ không phải 'to' khi nói về giao tiếp hai chiều"
  }],
  
  // Usage tips
  usageTips: [{
    tip: "Can be both formal and informal depending on context",
    tipVietnamese: "Có thể dùng trong cả văn phong trang trọng và thân mật",
    category: "usage"
  }],
  
  // Related words
  relatedWords: [{
    word: "converse",
    relationship: "synonym",
    difference: "More formal and typically implies spoken dialogue",
    differenceVietnamese: "Trang trọng hơn và thường ám chỉ đối thoại bằng lời nói",
    whenToUse: "Use in formal settings or literary contexts",
    whenToUseVietnamese: "Dùng trong văn cảnh trang trọng hoặc văn học"
  }],
  
  // Formality analysis
  formalityAnalysis: {
    level: "neutral",
    explanation: "Can be used in both formal and informal contexts",
    explanationVietnamese: "Có thể dùng trong cả văn cảnh trang trọng và thân mật",
    alternatives: [{
      word: "talk",
      level: "informal",
      context: "casual conversation"
    }, {
      word: "converse",
      level: "formal",
      context: "professional discussion"
    }]
  },
  
  // Emotional connotation
  emotionalConnotation: {
    type: "neutral",
    intensity: "mild",
    explanation: "Generally neutral, focusing on information exchange",
    explanationVietnamese: "Thường trung tính, tập trung vào việc trao đổi thông tin"
  },
  
  // Cultural notes
  culturalNotes: [{
    note: "In business contexts, Americans value direct communication",
    noteVietnamese: "Trong bối cảnh kinh doanh, người Mỹ coi trọng giao tiếp trực tiếp",
    region: "US"
  }],
  
  // Metadata
  aiModel: "gemini-2.5-flash",
  requestCount: 15,
  averageRating: 4.5,
  expiresAt: "2025-12-09T10:00:00.000Z"
}
```

### 2. SynonymComparison

```javascript
{
  words: ["communicate", "talk", "converse", "discuss"],
  
  // Overall comparison
  summary: "All words relate to exchanging information, but differ in formality...",
  summaryVietnamese: "Tất cả các từ đều liên quan đến trao đổi thông tin...",
  
  // Detailed comparison
  wordDetails: [{
    word: "communicate",
    mainMeaning: "to share information or ideas",
    mainMeaningVietnamese: "chia sẻ thông tin hoặc ý tưởng",
    distinctiveFeatures: [{
      feature: "Versatility",
      featureVietnamese: "Tính linh hoạt",
      explanation: "Can be used in any context",
      explanationVietnamese: "Có thể dùng trong mọi ngữ cảnh"
    }],
    formality: "neutral",
    frequency: "very high",
    bestContexts: ["business", "education", "daily life"],
    examples: [{
      sentence: "We communicate daily via email.",
      sentenceVietnamese: "Chúng tôi giao tiếp hàng ngày qua email.",
      context: "professional"
    }]
  }],
  
  // Usage guidelines
  usageGuidelines: [{
    scenario: "Formal business presentation",
    scenarioVietnamese: "Thuyết trình kinh doanh trang trọng",
    recommendedWord: "communicate",
    reason: "Professional and clear",
    reasonVietnamese: "Chuyên nghiệp và rõ ràng",
    example: "We need to communicate our results effectively.",
    exampleVietnamese: "Chúng ta cần truyền đạt kết quả một cách hiệu quả."
  }],
  
  // Common confusions
  commonConfusions: [{
    confusion: "When to use 'talk' vs 'communicate'",
    confusionVietnamese: "Khi nào dùng 'talk' và 'communicate'",
    clarification: "'Talk' is more casual and usually spoken, while 'communicate' is broader",
    clarificationVietnamese: "'Talk' thân mật hơn và thường là nói, còn 'communicate' rộng hơn"
  }],
  
  // Comparison matrix
  comparisonMatrix: [{
    criterion: "Formality",
    criterionVietnamese: "Mức độ trang trọng",
    values: {
      "communicate": "neutral",
      "talk": "informal",
      "converse": "formal",
      "discuss": "formal"
    }
  }, {
    criterion: "Frequency",
    criterionVietnamese: "Tần suất sử dụng",
    values: {
      "communicate": "very high",
      "talk": "very high",
      "converse": "low",
      "discuss": "high"
    }
  }],
  
  // Metadata
  aiModel: "gemini-2.5-flash",
  requestCount: 8,
  helpfulCount: 12,
  notHelpfulCount: 1
}
```

### 3. ContextExample

```javascript
{
  word: "negotiate",
  context: "business meeting",
  
  // Examples
  examples: [{
    situation: "Salary negotiation with new employer",
    situationVietnamese: "Đàm phán lương với nhà tuyển dụng mới",
    dialogue: [{
      speaker: "Candidate",
      text: "I'd like to negotiate the compensation package.",
      textVietnamese: "Tôi muốn thương lượng về gói lương thưởng.",
      explanation: "Direct but polite way to start negotiation"
    }, {
      speaker: "Employer",
      text: "Of course, what are you looking for?",
      textVietnamese: "Tất nhiên, bạn mong muốn điều gì?",
      explanation: "Open-ended response showing willingness to discuss"
    }],
    keyPoints: [
      "Be clear about what you want",
      "Remain professional and polite",
      "Have alternatives ready"
    ],
    keyPointsVietnamese: [
      "Rõ ràng về điều bạn muốn",
      "Giữ thái độ chuyên nghiệp và lịch sự",
      "Chuẩn bị các phương án thay thế"
    ]
  }],
  
  // Do's
  dos: [{
    point: "Use confident but respectful language",
    pointVietnamese: "Dùng ngôn ngữ tự tin nhưng tôn trọng",
    example: "I believe we can find a mutually beneficial arrangement.",
    exampleVietnamese: "Tôi tin chúng ta có thể tìm ra thỏa thuận có lợi cho cả hai bên."
  }],
  
  // Don'ts
  donts: [{
    point: "Don't be too aggressive",
    pointVietnamese: "Đừng quá hung hăng",
    wrongExample: "I demand a higher salary!",
    correctExample: "I'd like to discuss the possibility of a higher salary.",
    explanation: "The corrected version is more professional and likely to succeed",
    explanationVietnamese: "Phiên bản sửa chuyên nghiệp hơn và có khả năng thành công cao hơn"
  }]
}
```

---

## API Endpoints

### 1. Word Explanation

#### 1.1. Explain Word

```http
POST /api/ai-explain/word
Authorization: Bearer <token>
Content-Type: application/json

{
  "word": "communicate",
  "includeVietnamese": true,
  "forceRefresh": false
}
```

**Parameters:**
- `word` (required): Word to explain
- `includeVietnamese` (optional, default: true): Include Vietnamese translations
- `forceRefresh` (optional, default: false): Force new AI generation, ignore cache

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "674a5f8d...",
    "word": "communicate",
    "basicMeaning": "to share information with others",
    "basicMeaningVietnamese": "chia sẻ thông tin với người khác",
    "detailedExplanation": "...",
    "nuances": [...],
    "usageContexts": [...],
    "commonCollocations": [...],
    "commonMistakes": [...],
    "usageTips": [...],
    "relatedWords": [...],
    "formalityAnalysis": {...},
    "emotionalConnotation": {...},
    "culturalNotes": [...],
    "requestCount": 15,
    "averageRating": 4.5
  }
}
```

#### 1.2. Get Cached Explanation

```http
GET /api/ai-explain/cache/explanation/:word
Authorization: Bearer <token>
```

**Response:**
- 200: Returns cached explanation if available and valid
- 404: No cached explanation found

---

### 2. Synonym Comparison

#### 2.1. Compare Synonyms

```http
POST /api/ai-explain/compare
Authorization: Bearer <token>
Content-Type: application/json

{
  "words": ["communicate", "talk", "converse", "discuss"],
  "includeVietnamese": true,
  "forceRefresh": false
}
```

**Parameters:**
- `words` (required): Array of words to compare (minimum 2)
- `includeVietnamese` (optional, default: true)
- `forceRefresh` (optional, default: false)

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "674a5f8d...",
    "words": ["communicate", "converse", "discuss", "talk"],
    "summary": "All words relate to exchanging information...",
    "summaryVietnamese": "...",
    "wordDetails": [{
      "word": "communicate",
      "mainMeaning": "...",
      "distinctiveFeatures": [...],
      "formality": "neutral",
      "frequency": "very high",
      "bestContexts": ["business", "education"],
      "examples": [...]
    }],
    "usageGuidelines": [...],
    "commonConfusions": [...],
    "comparisonMatrix": [{
      "criterion": "Formality",
      "values": {
        "communicate": "neutral",
        "talk": "informal",
        "converse": "formal",
        "discuss": "formal"
      }
    }]
  }
}
```

#### 2.2. Get Cached Comparison

```http
GET /api/ai-explain/cache/comparison?words=communicate,talk,converse
Authorization: Bearer <token>
```

---

### 3. Context Examples

#### 3.1. Get Context Examples

```http
POST /api/ai-explain/context-examples
Authorization: Bearer <token>
Content-Type: application/json

{
  "word": "negotiate",
  "context": "business meeting",
  "includeVietnamese": true,
  "forceRefresh": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "674a5f8d...",
    "word": "negotiate",
    "context": "business meeting",
    "examples": [{
      "situation": "Salary negotiation",
      "situationVietnamese": "Đàm phán lương",
      "dialogue": [{
        "speaker": "Candidate",
        "text": "I'd like to negotiate...",
        "textVietnamese": "Tôi muốn thương lượng...",
        "explanation": "..."
      }],
      "keyPoints": [...],
      "keyPointsVietnamese": [...]
    }],
    "dos": [{
      "point": "Use confident language",
      "pointVietnamese": "Dùng ngôn ngữ tự tin",
      "example": "..."
    }],
    "donts": [{
      "point": "Don't be too aggressive",
      "pointVietnamese": "Đừng quá hung hăng",
      "wrongExample": "I demand...",
      "correctExample": "I'd like to discuss...",
      "explanation": "..."
    }]
  }
}
```

#### 3.2. Generate Situation Examples

```http
POST /api/ai-explain/situation-examples
Authorization: Bearer <token>
Content-Type: application/json

{
  "word": "apologize",
  "situation": "customer service",
  "count": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": [{
    "sentence": "I sincerely apologize for the inconvenience.",
    "sentenceVietnamese": "Tôi chân thành xin lỗi vì sự bất tiện.",
    "explanation": "Formal and professional apology",
    "difficulty": "intermediate"
  }]
}
```

---

### 4. Nuance Analysis

#### 4.1. Analyze Nuances

```http
POST /api/ai-explain/nuances
Authorization: Bearer <token>
Content-Type: application/json

{
  "word": "smart",
  "includeVietnamese": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "word": "smart",
    "nuances": [{
      "context": "intelligence",
      "description": "Refers to mental capability",
      "descriptionVietnamese": "Ám chỉ khả năng trí tuệ",
      "example": "She's very smart in mathematics.",
      "exampleVietnamese": "Cô ấy rất thông minh về toán."
    }, {
      "context": "appearance",
      "description": "Well-dressed, stylish",
      "descriptionVietnamese": "Ăn mặc đẹp, phong cách",
      "example": "He looks smart in that suit.",
      "exampleVietnamese": "Anh ấy trông bảnh bao trong bộ vest đó."
    }],
    "formalityAnalysis": {
      "level": "neutral",
      "explanation": "...",
      "alternatives": [...]
    },
    "emotionalConnotation": {
      "type": "positive",
      "intensity": "moderate",
      "explanation": "..."
    },
    "usageContexts": [...],
    "culturalNotes": [...]
  }
}
```

---

### 5. Usage Tips

#### 5.1. Get Usage Tips

```http
POST /api/ai-explain/usage-tips
Authorization: Bearer <token>
Content-Type: application/json

{
  "word": "affect",
  "includeVietnamese": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "word": "affect",
    "usageTips": [{
      "tip": "Not to be confused with 'effect' (noun)",
      "tipVietnamese": "Không nhầm lẫn với 'effect' (danh từ)",
      "category": "grammar"
    }, {
      "tip": "Stress on second syllable: af-FECT",
      "tipVietnamese": "Nhấn âm ở vần thứ hai: af-FECT",
      "category": "pronunciation"
    }],
    "commonMistakes": [{
      "mistake": "The decision will effect us.",
      "correction": "The decision will affect us.",
      "explanation": "Use 'affect' as verb, 'effect' as noun",
      "explanationVietnamese": "Dùng 'affect' là động từ, 'effect' là danh từ"
    }],
    "commonCollocations": [{
      "phrase": "adversely affect",
      "meaning": "to have a negative impact",
      "meaningVietnamese": "có tác động tiêu cực",
      "example": "Pollution adversely affects our health.",
      "exampleVietnamese": "Ô nhiễm ảnh hưởng xấu đến sức khỏe.",
      "frequency": "very common"
    }]
  }
}
```

#### 5.2. Explain Difference Between Two Words

```http
POST /api/ai-explain/difference
Authorization: Bearer <token>
Content-Type: application/json

{
  "word1": "affect",
  "word2": "effect",
  "includeVietnamese": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": "Affect is typically a verb meaning to influence...",
    "summaryVietnamese": "...",
    "word1Analysis": {
      "meaning": "to influence or change",
      "usage": "Use as a verb",
      "examples": [
        "The weather affects my mood.",
        "Don't let criticism affect you."
      ]
    },
    "word2Analysis": {
      "meaning": "a result or consequence",
      "usage": "Use as a noun",
      "examples": [
        "The effect was immediate.",
        "It had no effect."
      ]
    },
    "keyDifferences": [{
      "aspect": "Part of Speech",
      "word1Characteristic": "Verb",
      "word2Characteristic": "Noun",
      "explanation": "This is the primary difference..."
    }],
    "exampleComparisons": [{
      "situation": "Discussing environmental issues",
      "word1Example": "Climate change affects polar bears.",
      "word2Example": "The effects of climate change are visible.",
      "explanation": "First uses verb form, second uses noun form"
    }]
  }
}
```

---

### 6. Ratings & Feedback

#### 6.1. Rate Explanation

```http
POST /api/ai-explain/explanations/:explanationId/rate
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "feedback": "Very helpful and detailed!"
}
```

**Parameters:**
- `rating` (required): 1-5 stars
- `feedback` (optional): Text feedback

**Response:**
```json
{
  "success": true,
  "message": "Thank you for your feedback",
  "data": {
    "averageRating": 4.7,
    "totalRatings": 23
  }
}
```

#### 6.2. Rate Comparison

```http
POST /api/ai-explain/comparisons/:comparisonId/feedback
Authorization: Bearer <token>
Content-Type: application/json

{
  "isHelpful": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Thank you for your feedback",
  "data": {
    "helpfulCount": 15,
    "notHelpfulCount": 2
  }
}
```

---

## AI Prompts

### Word Explanation Prompt

```
You are an expert English language teacher. Provide a comprehensive explanation of the word "communicate" in JSON format.

Include the following:
1. basicMeaning: A simple, clear definition (1-2 sentences)
2. detailedExplanation: A detailed explanation (3-4 sentences)
3. nuances: Array of different nuances/contexts (at least 3)
4. usageContexts: Array of situations where used (at least 3)
5. commonCollocations: Array of common phrases (at least 5)
6. commonMistakes: Array of common mistakes (at least 2)
7. usageTips: Array of practical tips (at least 3)
8. relatedWords: Array with detailed comparison (at least 4)
9. formalityAnalysis: Object with level, explanation, alternatives
10. emotionalConnotation: Object with type, intensity, explanation
11. culturalNotes: Array of cultural notes (if any)

Also provide Vietnamese translations for all fields.
Return ONLY valid JSON without markdown code blocks.
```

### Synonym Comparison Prompt

```
Compare these synonym words: communicate, talk, converse, discuss

Provide a comprehensive comparison in JSON format:

1. summary: Overall summary (2-3 sentences)
2. wordDetails: Array with details for each word
   - mainMeaning, distinctiveFeatures, formality, frequency, bestContexts, examples
3. usageGuidelines: Array of scenarios with recommendations
4. commonConfusions: Array of common confusions
5. comparisonMatrix: Array of comparison criteria with values

Include Vietnamese translations.
Return ONLY valid JSON.
```

---

## Frontend Integration

### Example: Word Explanation Component

```jsx
import { useState } from 'react';
import axios from 'axios';

const WordExplanation = ({ word }) => {
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const explainWord = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        '/api/ai-explain/word',
        {
          word,
          includeVietnamese: true,
          forceRefresh: false
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setExplanation(response.data.data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error explaining word');
    } finally {
      setLoading(false);
    }
  };
  
  const rateExplanation = async (rating, feedback) => {
    try {
      await axios.post(
        `/api/ai-explain/explanations/${explanation._id}/rate`,
        { rating, feedback },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Thank you for your feedback!');
    } catch (error) {
      console.error('Error rating:', error);
    }
  };
  
  if (loading) return <div>Loading AI explanation...</div>;
  
  if (!explanation) {
    return <button onClick={explainWord}>Explain "{word}"</button>;
  }
  
  return (
    <div className="word-explanation">
      <h2>{explanation.word}</h2>
      
      {/* Basic Meaning */}
      <section className="basic-meaning">
        <h3>Basic Meaning</h3>
        <p>{explanation.basicMeaning}</p>
        <p className="vietnamese">{explanation.basicMeaningVietnamese}</p>
      </section>
      
      {/* Detailed Explanation */}
      <section className="detailed">
        <h3>Detailed Explanation</h3>
        <p>{explanation.detailedExplanation}</p>
        <p className="vietnamese">{explanation.detailedExplanationVietnamese}</p>
      </section>
      
      {/* Nuances */}
      <section className="nuances">
        <h3>Nuances (Sắc thái)</h3>
        {explanation.nuances.map((nuance, i) => (
          <div key={i} className="nuance-card">
            <h4>{nuance.context}</h4>
            <p>{nuance.description}</p>
            <p className="vietnamese">{nuance.descriptionVietnamese}</p>
            <div className="example">
              <strong>Example:</strong> {nuance.example}
              <br />
              <span className="vietnamese">{nuance.exampleVietnamese}</span>
            </div>
          </div>
        ))}
      </section>
      
      {/* Formality Analysis */}
      <section className="formality">
        <h3>Formality Level</h3>
        <div className="formality-badge">{explanation.formalityAnalysis.level}</div>
        <p>{explanation.formalityAnalysis.explanation}</p>
        <p className="vietnamese">{explanation.formalityAnalysis.explanationVietnamese}</p>
        
        <h4>Alternatives:</h4>
        {explanation.formalityAnalysis.alternatives.map((alt, i) => (
          <div key={i} className="alternative">
            <strong>{alt.word}</strong> ({alt.level}) - {alt.context}
          </div>
        ))}
      </section>
      
      {/* Common Collocations */}
      <section className="collocations">
        <h3>Common Collocations</h3>
        {explanation.commonCollocations.map((col, i) => (
          <div key={i} className="collocation">
            <strong>{col.phrase}</strong>
            <span className="frequency">{col.frequency}</span>
            <p>{col.meaning}</p>
            <p className="vietnamese">{col.meaningVietnamese}</p>
            <div className="example">{col.example}</div>
          </div>
        ))}
      </section>
      
      {/* Common Mistakes */}
      <section className="mistakes">
        <h3>Common Mistakes</h3>
        {explanation.commonMistakes.map((mistake, i) => (
          <div key={i} className="mistake-card">
            <div className="wrong">❌ {mistake.mistake}</div>
            <div className="correct">✅ {mistake.correction}</div>
            <p>{mistake.explanation}</p>
            <p className="vietnamese">{mistake.explanationVietnamese}</p>
          </div>
        ))}
      </section>
      
      {/* Usage Tips */}
      <section className="tips">
        <h3>Usage Tips</h3>
        {explanation.usageTips.map((tip, i) => (
          <div key={i} className="tip">
            <span className="category">{tip.category}</span>
            <p>{tip.tip}</p>
            <p className="vietnamese">{tip.tipVietnamese}</p>
          </div>
        ))}
      </section>
      
      {/* Rating */}
      <section className="rating">
        <h3>Rate this explanation</h3>
        <div className="stars">
          {[1, 2, 3, 4, 5].map(star => (
            <button key={star} onClick={() => rateExplanation(star, '')}>
              ⭐
            </button>
          ))}
        </div>
        <p>Average: {explanation.averageRating}/5</p>
      </section>
    </div>
  );
};

export default WordExplanation;
```

### Example: Synonym Comparison Component

```jsx
const SynonymComparison = () => {
  const [words, setWords] = useState(['communicate', 'talk', 'converse']);
  const [comparison, setComparison] = useState(null);
  
  const compareWords = async () => {
    try {
      const response = await axios.post(
        '/api/ai-explain/compare',
        {
          words,
          includeVietnamese: true
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setComparison(response.data.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  if (!comparison) {
    return (
      <div>
        <input
          value={words.join(', ')}
          onChange={(e) => setWords(e.target.value.split(',').map(w => w.trim()))}
          placeholder="Enter words to compare (comma-separated)"
        />
        <button onClick={compareWords}>Compare</button>
      </div>
    );
  }
  
  return (
    <div className="synonym-comparison">
      <h2>Comparing: {comparison.words.join(', ')}</h2>
      
      {/* Summary */}
      <section className="summary">
        <p>{comparison.summary}</p>
        <p className="vietnamese">{comparison.summaryVietnamese}</p>
      </section>
      
      {/* Comparison Matrix */}
      <section className="matrix">
        <h3>Quick Comparison</h3>
        <table>
          <thead>
            <tr>
              <th>Criterion</th>
              {comparison.words.map(word => (
                <th key={word}>{word}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparison.comparisonMatrix.map((row, i) => (
              <tr key={i}>
                <td>{row.criterion}</td>
                {comparison.words.map(word => (
                  <td key={word}>{row.values[word]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      
      {/* Detailed Word Analysis */}
      <section className="word-details">
        <h3>Detailed Analysis</h3>
        {comparison.wordDetails.map((detail, i) => (
          <div key={i} className="word-detail-card">
            <h4>{detail.word}</h4>
            <p><strong>Meaning:</strong> {detail.mainMeaning}</p>
            <p><strong>Formality:</strong> {detail.formality}</p>
            <p><strong>Frequency:</strong> {detail.frequency}</p>
            
            <div className="features">
              <h5>Distinctive Features:</h5>
              {detail.distinctiveFeatures.map((feature, j) => (
                <div key={j}>
                  <strong>{feature.feature}:</strong> {feature.explanation}
                </div>
              ))}
            </div>
            
            <div className="examples">
              <h5>Examples:</h5>
              {detail.examples.map((ex, j) => (
                <div key={j}>
                  <p>{ex.sentence}</p>
                  <p className="vietnamese">{ex.sentenceVietnamese}</p>
                  <span className="context">Context: {ex.context}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
      
      {/* Usage Guidelines */}
      <section className="guidelines">
        <h3>When to Use Each Word</h3>
        {comparison.usageGuidelines.map((guide, i) => (
          <div key={i} className="guideline">
            <h4>{guide.scenario}</h4>
            <p className="vietnamese">{guide.scenarioVietnamese}</p>
            <p><strong>Recommended:</strong> {guide.recommendedWord}</p>
            <p><strong>Why:</strong> {guide.reason}</p>
            <p className="vietnamese">{guide.reasonVietnamese}</p>
            <div className="example">{guide.example}</div>
          </div>
        ))}
      </section>
    </div>
  );
};
```

---

## Hướng Dẫn Kiểm Thử

### 1. Explain Word

```bash
curl -X POST http://localhost:1124/api/ai-explain/word \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "word": "communicate",
    "includeVietnamese": true
  }'
```

### 2. Compare Synonyms

```bash
curl -X POST http://localhost:1124/api/ai-explain/compare \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "words": ["communicate", "talk", "converse", "discuss"],
    "includeVietnamese": true
  }'
```

### 3. Get Context Examples

```bash
curl -X POST http://localhost:1124/api/ai-explain/context-examples \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "word": "negotiate",
    "context": "business meeting",
    "includeVietnamese": true
  }'
```

### 4. Analyze Nuances

```bash
curl -X POST http://localhost:1124/api/ai-explain/nuances \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "word": "smart",
    "includeVietnamese": true
  }'
```

### 5. Get Usage Tips

```bash
curl -X POST http://localhost:1124/api/ai-explain/usage-tips \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "word": "affect",
    "includeVietnamese": true
  }'
```

### 6. Explain Difference

```bash
curl -X POST http://localhost:1124/api/ai-explain/difference \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "word1": "affect",
    "word2": "effect",
    "includeVietnamese": true
  }'
```

### 7. Rate Explanation

```bash
curl -X POST http://localhost:1124/api/ai-explain/explanations/EXPLANATION_ID/rate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "feedback": "Very helpful!"
  }'
```

---

## Best Practices

### 1. Caching Strategy

✅ **Use cache efficiently:**
- First request generates explanation and caches for 30 days
- Subsequent requests use cached data (much faster)
- Use `forceRefresh: true` only when needed
- Check cache first with `/cache/explanation/:word`

### 2. Cost Optimization

- Cache reduces API costs by 90%+
- Batch similar requests together
- Use cached comparisons when possible
- Clear expired cache periodically (admin)

### 3. User Experience

- Show loading state during AI generation (can take 5-10 seconds)
- Display cache age to users
- Allow users to refresh if explanation seems outdated
- Collect ratings to improve quality

---

## Environment Variables

Add to `.env`:

```bash
# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here
```

Get API key from: https://makersuite.google.com/app/apikey

---

## FAQ

**Q: Mất bao lâu để AI generate explanation?**  
A: Thường 5-10 giây cho lần đầu. Các lần sau dùng cache nên tức thì.

**Q: Cache hoạt động như thế nào?**  
A: Explanation được cache 30 ngày. Sau đó tự động expire và sẽ generate lại khi có request mới.

**Q: Có giới hạn số lần request không?**  
A: Phụ thuộc vào Gemini API quota. Nên dùng cache để tiết kiệm.

**Q: Độ chính xác của AI như thế nào?**  
A: Rất cao với Gemini 2.5 Flash (model mới nhất, tương tự Task 21), nhưng nên có system rating để users feedback.

**Q: Có thể compare nhiều hơn 4 từ không?**  
A: Có, nhưng response sẽ dài hơn. Khuyến nghị 2-4 từ cho dễ đọc.

**Q: forceRefresh khi nào nên dùng?**  
A: Khi phát hiện explanation cũ không chính xác hoặc cần update với knowledge mới.

**Q: Tại sao dùng Gemini 2.5 Flash thay vì Gemini Pro?**  
A: Gemini 2.5 Flash nhanh hơn, cost-effective hơn, và hỗ trợ các tính năng mới nhất. Đã được test và sử dụng ổn định ở Task 21.

---

**Cập Nhật Lần Cuối:** 9 tháng 11, 2025  
**Phiên Bản:** 1.0.1  
**AI Model:** Google Gemini 2.5 Flash (consistent with Task 21)  
**Tác Giả:** Đội Phát Triển APPTA
