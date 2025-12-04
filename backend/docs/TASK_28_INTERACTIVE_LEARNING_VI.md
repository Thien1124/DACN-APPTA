# Task 28: Trò Chơi Học Tập Tương Tác - Tài Liệu API

## Tổng Quan

Task 28 triển khai 4 chế độ trò chơi học tập tương tác giúp người dùng luyện từ vựng theo cách thú vị:

1. **Ghép Hình Với Từ** - Kết nối hình ảnh với từ đúng
2. **Trắc Nghiệm** - Câu hỏi truyền thống với nhiều dạng khác nhau
3. **Ghép Cặp** - Nối các cặp (từ-nghĩa, hình-từ, audio-từ)
4. **Thi Đánh Vần** - Đánh vần từ theo audio với gợi ý

Tất cả các chế độ đều bao gồm:
- Tự động tính điểm với thưởng thời gian
- Theo dõi độ chính xác
- Thống kê và lịch sử
- Phân tích tiến độ

---

## Mục Lục

- [Mô Hình Dữ Liệu](#mô-hình-dữ-liệu)
- [API Endpoints](#api-endpoints)
  - [Ghép Hình Với Từ](#1-ghép-hình-với-từ)
  - [Trắc Nghiệm](#2-trắc-nghiệm)
  - [Ghép Cặp](#3-ghép-cặp)
  - [Thi Đánh Vần](#4-thi-đánh-vần)
  - [Thống Kê & Lịch Sử](#5-thống-kê--lịch-sử)
- [Hệ Thống Tính Điểm](#hệ-thống-tính-điểm)
- [Tích Hợp Frontend](#tích-hợp-frontend)
- [Hướng Dẫn Kiểm Thử](#hướng-dẫn-kiểm-thử)

---

## Mô Hình Dữ Liệu

### 1. ImageMatchAttempt (Lượt Chơi Ghép Hình)

```javascript
{
  user: ObjectId,              // Người dùng
  deck: ObjectId,              // Bộ thẻ
  flashcards: [ObjectId],      // Danh sách thẻ
  answers: [{
    flashcardId: ObjectId,     // ID thẻ
    selectedWord: String,      // Từ được chọn
    isCorrect: Boolean,        // Đúng/sai
    timeTaken: Number          // Thời gian (giây)
  }],
  score: Number,               // Điểm (tự động tính)
  accuracy: Number,            // Độ chính xác (0-100%)
  timeSpent: Number,           // Tổng thời gian
  completedAt: Date            // Thời gian hoàn thành
}
```

**Công Thức Tính Điểm:**
```
điểmCơBản = sốCâuĐúng × 10
thưởngThờiGian = Math.max(0, 50 - tổngThờiGian) // Tối đa 50 điểm
điểmCuốiCùng = điểmCơBản + thưởngThờiGian
```

### 2. MultipleChoiceAttempt (Lượt Chơi Trắc Nghiệm)

```javascript
{
  user: ObjectId,
  deck: ObjectId,
  questions: [{
    flashcardId: ObjectId,
    questionType: String,      // 'word-to-meaning', 'meaning-to-word', 'image-to-word', 'audio-to-word'
    question: String,          // Câu hỏi
    options: [String],         // 4 đáp án
    correctAnswer: String,     // Đáp án đúng
    selectedAnswer: String,    // Đáp án đã chọn
    isCorrect: Boolean,
    timeTaken: Number
  }],
  score: Number,               // Tự động tính
  accuracy: Number,            // Tự động tính
  difficulty: String,          // 'easy', 'medium', 'hard'
  completedAt: Date
}
```

**Công Thức Tính Điểm:**
```
điểmCơBản = sốCâuĐúng × 15
thưởngThờiGian = Math.max(0, 100 - tổngThờiGian) // Tối đa 100 điểm
điểmCuốiCùng = điểmCơBản + thưởngThờiGian
```

### 3. MatchingAttempt (Lượt Chơi Ghép Cặp)

```javascript
{
  user: ObjectId,
  deck: ObjectId,
  pairs: [{
    flashcardId: ObjectId,
    left: String,              // Từ hoặc hình
    right: String,             // Nghĩa hoặc từ
    matchType: String          // 'word-meaning', 'image-word', 'audio-word'
  }],
  matches: [{
    leftId: String,            // ID bên trái
    rightId: String,           // ID bên phải
    attempts: Number,          // Số lần thử
    isCorrect: Boolean
  }],
  totalAttempts: Number,       // Tổng số lần thử
  score: Number,               // Tự động tính
  accuracy: Number,            // Tự động tính
  timeSpent: Number,
  completedAt: Date
}
```

**Công Thức Tính Điểm:**
```
Với mỗi cặp:
  điểmCơBản = 20
  phạt = (sốLầnThử - 1) × 2
  điểm = Math.max(5, điểmCơBản - phạt)
điểmCuốiCùng = tổng điểm tất cả các cặp
```

### 4. SpellingBeeAttempt (Lượt Thi Đánh Vần)

```javascript
{
  user: ObjectId,
  deck: ObjectId,
  words: [{
    flashcardId: ObjectId,
    word: String,              // Từ đúng
    userSpelling: String,      // Cách đánh vần của người dùng
    attempts: Number,          // Số lần thử (tối đa 3)
    hintsUsed: Number,         // Số gợi ý đã dùng
    isCorrect: Boolean,
    points: Number             // Điểm cho từ này
  }],
  perfectWords: Number,        // Số từ đúng ngay lần đầu
  score: Number,               // Tự động tính
  accuracy: Number,            // Tự động tính
  audioPlayCount: Number,      // Số lần phát audio
  completedAt: Date
}
```

**Công Thức Tính Điểm:**
```
Với mỗi từ:
  điểmCơBản = 25
  phạtThử = (sốLầnThử - 1) × 5
  phạtGợiÝ = sốGợiÝDùng × 3
  điểm = Math.max(5, điểmCơBản - phạtThử - phạtGợiÝ)
điểmCuốiCùng = tổng điểm tất cả các từ
```

---

## API Endpoints

### 1. Ghép Hình Với Từ

#### Bắt Đầu Trò Chơi Ghép Hình

```http
POST /api/interactive/image-match/:deckId/start
Authorization: Bearer <token>
Content-Type: application/json

{
  "count": 10,              // Số thẻ (mặc định: 10)
  "difficulty": "medium"    // 'easy', 'medium', 'hard' (tùy chọn)
}
```

**Phản Hồi:**
```json
{
  "success": true,
  "data": {
    "gameId": "674a5f8d...",
    "images": [
      {
        "flashcardId": "674a5f8d...",
        "imageUrl": "https://example.com/image.jpg"
      }
    ],
    "wordOptions": ["táo", "chuối", "cam", "nho", ...],
    "timeLimit": 300
  }
}
```

**Lỗi:**
- `404` - Không tìm thấy bộ thẻ
- `403` - Không có quyền truy cập
- `400` - Không đủ thẻ có hình ảnh

#### Nộp Đáp Án Ghép Hình

```http
POST /api/interactive/image-match/:deckId/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "answers": [
    {
      "flashcardId": "674a5f8d...",
      "selectedWord": "táo",
      "timeTaken": 5
    }
  ]
}
```

**Phản Hồi:**
```json
{
  "success": true,
  "data": {
    "attemptId": "674a5f8d...",
    "score": 85,
    "accuracy": 80,
    "correctAnswers": 8,
    "totalQuestions": 10,
    "timeSpent": 120,
    "details": [
      {
        "flashcardId": "674a5f8d...",
        "isCorrect": true,
        "correctAnswer": "táo"
      }
    ]
  }
}
```

---

### 2. Trắc Nghiệm

#### Bắt Đầu Bài Trắc Nghiệm

```http
POST /api/interactive/multiple-choice/:deckId/start
Authorization: Bearer <token>
Content-Type: application/json

{
  "count": 15,
  "questionType": "word-to-meaning",  // 'word-to-meaning', 'meaning-to-word', 'image-to-word', 'audio-to-word', 'mixed'
  "difficulty": "medium"
}
```

**Phản Hồi:**
```json
{
  "success": true,
  "data": {
    "gameId": "674a5f8d...",
    "questions": [
      {
        "questionId": "1",
        "flashcardId": "674a5f8d...",
        "questionType": "word-to-meaning",
        "question": "Nghĩa của từ 'beautiful' là gì?",
        "options": [
          "đẹp",
          "xấu",
          "nhanh",
          "chậm"
        ]
      }
    ],
    "timeLimit": 450
  }
}
```

**Các Dạng Câu Hỏi:**
- `word-to-meaning`: "Nghĩa của từ [từ] là gì?"
- `meaning-to-word`: "Từ nào có nghĩa là [nghĩa]?"
- `image-to-word`: "Hình ảnh này biểu thị từ gì?"
- `audio-to-word`: "Nghe và chọn từ đúng"
- `mixed`: Trộn ngẫu nhiên tất cả các dạng

#### Nộp Đáp Án Trắc Nghiệm

```http
POST /api/interactive/multiple-choice/:deckId/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "questions": [
    {
      "flashcardId": "674a5f8d...",
      "selectedAnswer": "đẹp",
      "timeTaken": 8
    }
  ]
}
```

**Phản Hồi:**
```json
{
  "success": true,
  "data": {
    "attemptId": "674a5f8d...",
    "score": 195,
    "accuracy": 93.33,
    "correctAnswers": 14,
    "totalQuestions": 15,
    "timeSpent": 180
  }
}
```

---

### 3. Ghép Cặp

#### Bắt Đầu Trò Chơi Ghép Cặp

```http
POST /api/interactive/matching/:deckId/start
Authorization: Bearer <token>
Content-Type: application/json

{
  "count": 8,
  "matchType": "word-meaning",  // 'word-meaning', 'image-word', 'audio-word'
  "difficulty": "medium"
}
```

**Phản Hồi:**
```json
{
  "success": true,
  "data": {
    "gameId": "674a5f8d...",
    "leftItems": [
      {
        "id": "left_1",
        "content": "beautiful",
        "type": "text"
      },
      {
        "id": "left_2",
        "content": "https://example.com/image.jpg",
        "type": "image"
      }
    ],
    "rightItems": [
      {
        "id": "right_1",
        "content": "đẹp",
        "flashcardId": "674a5f8d..."
      }
    ],
    "matchType": "word-meaning"
  }
}
```

**Các Loại Ghép:**
- `word-meaning`: Ghép từ với nghĩa
- `image-word`: Ghép hình với từ
- `audio-word`: Ghép audio với từ

#### Nộp Kết Quả Ghép Cặp

```http
POST /api/interactive/matching/:deckId/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "pairs": [
    {
      "flashcardId": "674a5f8d...",
      "left": "beautiful",
      "right": "đẹp",
      "matchType": "word-meaning"
    }
  ],
  "matches": [
    {
      "leftId": "left_1",
      "rightId": "right_1",
      "attempts": 1,
      "isCorrect": true
    }
  ],
  "timeSpent": 90
}
```

**Phản Hồi:**
```json
{
  "success": true,
  "data": {
    "attemptId": "674a5f8d...",
    "score": 156,
    "accuracy": 100,
    "correctMatches": 8,
    "totalPairs": 8,
    "totalAttempts": 10,
    "timeSpent": 90
  }
}
```

---

### 4. Thi Đánh Vần

#### Bắt Đầu Thi Đánh Vần

```http
POST /api/interactive/spelling-bee/:deckId/start
Authorization: Bearer <token>
Content-Type: application/json

{
  "count": 10,
  "difficulty": "medium"
}
```

**Phản Hồi:**
```json
{
  "success": true,
  "data": {
    "gameId": "674a5f8d...",
    "words": [
      {
        "flashcardId": "674a5f8d...",
        "audioUrl": "https://example.com/audio/beautiful.mp3",
        "hint": "B _ _ _ _ _ _ _ L",
        "wordLength": 9
      }
    ],
    "maxAttemptsPerWord": 3
  }
}
```

#### Kiểm Tra Đánh Vần (Phản hồi thời gian thực)

```http
POST /api/interactive/spelling-bee/check
Authorization: Bearer <token>
Content-Type: application/json

{
  "flashcardId": "674a5f8d...",
  "userSpelling": "beatiful"
}
```
    
**Phản Hồi:**
```json
{
  "success": true,
  "data": {
    "isCorrect": false,
    "similarity": 88.89,
    "feedback": "Rất gần rồi! Kiểm tra lại chính tả.",
    "correctAnswer": null  // Chỉ hiện sau 3 lần thử
  }
}
```

**Mức Độ Phản Hồi:**
- `90-100%`: "Rất gần rồi! Kiểm tra lại chính tả."
- `70-89%`: "Bạn đang làm tốt! Thử lại xem."
- `50-69%`: "Chưa đúng lắm. Thử lại nhé."
- `<50%`: "Khác khá nhiều. Thử lại xem."

#### Nộp Kết Quả Thi Đánh Vần

```http
POST /api/interactive/spelling-bee/:deckId/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "words": [
    {
      "flashcardId": "674a5f8d...",
      "userSpelling": "beautiful",
      "attempts": 1,
      "hintsUsed": 0,
      "isCorrect": true
    }
  ]
}
```

**Phản Hồi:**
```json
{
  "success": true,
  "data": {
    "attemptId": "674a5f8d...",
    "score": 235,
    "accuracy": 90,
    "correctWords": 9,
    "totalWords": 10,
    "perfectWords": 5,
    "audioPlayCount": 15
  }
}
```

---

### 5. Thống Kê & Lịch Sử

#### Xem Thống Kê Người Dùng

```http
GET /api/interactive/stats?deckId=674a5f8d...
Authorization: Bearer <token>
```

**Phản Hồi:**
```json
{
  "success": true,
  "data": {
    "imageMatch": {
      "totalGames": 15,
      "averageScore": 85.5,
      "averageAccuracy": 82.3,
      "totalTimeSpent": 1800,
      "bestScore": 95
    },
    "multipleChoice": {
      "totalGames": 25,
      "averageScore": 180.2,
      "averageAccuracy": 88.5,
      "totalTimeSpent": 3600,
      "bestScore": 225
    },
    "matching": {
      "totalGames": 10,
      "averageScore": 145.8,
      "averageAccuracy": 90.0,
      "totalTimeSpent": 900,
      "bestScore": 160
    },
    "spellingBee": {
      "totalGames": 20,
      "averageScore": 210.5,
      "averageAccuracy": 85.2,
      "totalTimeSpent": 2400,
      "bestScore": 250
    },
    "overall": {
      "totalGames": 70,
      "averageScore": 155.5,
      "totalTimeSpent": 8700
    }
  }
}
```

#### Xem Lịch Sử Chơi

```http
GET /api/interactive/history/image-match?deckId=674a5f8d...&limit=20&page=1
Authorization: Bearer <token>
```

**Các Loại Trò Chơi:**
- `image-match` - Ghép hình
- `multiple-choice` - Trắc nghiệm
- `matching` - Ghép cặp
- `spelling-bee` - Thi đánh vần

**Phản Hồi:**
```json
{
  "success": true,
  "data": {
    "attempts": [
      {
        "_id": "674a5f8d...",
        "deck": {
          "_id": "674a5f8d...",
          "name": "Từ Vựng Thường Dùng"
        },
        "score": 85,
        "accuracy": 80,
        "timeSpent": 120,
        "completedAt": "2025-11-09T10:30:00.000Z"
      }
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "limit": 20,
      "pages": 1
    }
  }
}
```

#### Xem Chi Tiết Lượt Chơi

```http
GET /api/interactive/attempt/image-match/674a5f8d...
Authorization: Bearer <token>
```

**Phản Hồi:**
```json
{
  "success": true,
  "data": {
    "_id": "674a5f8d...",
    "user": "674a5f8d...",
    "deck": {
      "_id": "674a5f8d...",
      "name": "Từ Vựng Thường Dùng"
    },
    "flashcards": [
      {
        "_id": "674a5f8d...",
        "word": "beautiful",
        "meaning": "đẹp",
        "imageUrl": "https://example.com/image.jpg"
      }
    ],
    "answers": [
      {
        "flashcardId": "674a5f8d...",
        "selectedWord": "beautiful",
        "isCorrect": true,
        "timeTaken": 5
      }
    ],
    "score": 85,
    "accuracy": 80,
    "timeSpent": 120,
    "completedAt": "2025-11-09T10:30:00.000Z"
  }
}
```

---

## Hệ Thống Tính Điểm

### Chi Tiết Điểm Theo Từng Chế Độ

| Chế Độ | Điểm Cơ Bản | Thưởng Thời Gian | Phạt | Điểm Tối Đa |
|--------|------------|------------------|------|-------------|
| **Ghép Hình** | 10/câu đúng | Tối đa 50 | Không | Tùy số câu |
| **Trắc Nghiệm** | 15/câu đúng | Tối đa 100 | Không | Tùy số câu |
| **Ghép Cặp** | 20/cặp | Không | -2/lần thử | Tối thiểu 5/cặp |
| **Thi Đánh Vần** | 25/từ | Không | -5/thử lại, -3/gợi ý | Tối thiểu 5/từ |

### Tính Độ Chính Xác

```javascript
độChínhXác = (sốCâuĐúng / tổngSốCâu) × 100
```

### Công Thức Thưởng Thời Gian

**Ghép Hình:**
```javascript
thưởngThờiGian = Math.max(0, 50 - tổngThờiGian)
// Ví dụ: Hoàn thành trong 30 giây = 20 điểm thưởng
```

**Trắc Nghiệm:**
```javascript
thưởngThờiGian = Math.max(0, 100 - tổngThờiGian)
// Ví dụ: Hoàn thành trong 60 giây = 40 điểm thưởng
```

### Phạt Thử Lại (Ghép Cặp)

```javascript
phạt = (sốLầnThử - 1) × 2
điểm = Math.max(5, 20 - phạt)
// Ví dụ: 3 lần thử = 20 - (3-1)×2 = 16 điểm
```

### Tính Điểm Thi Đánh Vần

```javascript
phạtThử = (sốLầnThử - 1) × 5
phạtGợiÝ = sốGợiÝDùng × 3
điểm = Math.max(5, 25 - phạtThử - phạtGợiÝ)
// Ví dụ: 2 lần thử, 1 gợi ý = 25 - 5 - 3 = 17 điểm
```

---

## Tích Hợp Frontend

### Ví Dụ: Component Ghép Hình (React)

```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const TroChoiGhepHinh = ({ deckId, onComplete }) => {
  const [gameData, setGameData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [startTime, setStartTime] = useState(null);

  // Bắt đầu trò chơi
  useEffect(() => {
    const batDau = async () => {
      try {
        const response = await axios.post(
          `/api/interactive/image-match/${deckId}/start`,
          { count: 10, difficulty: 'medium' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setGameData(response.data.data);
        setStartTime(Date.now());
      } catch (error) {
        console.error('Lỗi khi bắt đầu:', error);
      }
    };
    batDau();
  }, [deckId]);

  // Xử lý chọn đáp án
  const handleChon = (flashcardId, word) => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    setAnswers({
      ...answers,
      [flashcardId]: { selectedWord: word, timeTaken }
    });
  };

  // Nộp đáp án
  const handleNop = async () => {
    try {
      const answersArray = Object.entries(answers).map(([flashcardId, data]) => ({
        flashcardId,
        ...data
      }));

      const response = await axios.post(
        `/api/interactive/image-match/${deckId}/submit`,
        { answers: answersArray },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onComplete(response.data.data);
    } catch (error) {
      console.error('Lỗi khi nộp bài:', error);
    }
  };

  if (!gameData) return <div>Đang tải...</div>;

  return (
    <div className="tro-choi-ghep-hinh">
      <h2>Ghép Hình Với Từ</h2>
      <div className="luoi-hinh">
        {gameData.images.map((image) => (
          <div key={image.flashcardId} className="muc-hinh">
            <img src={image.imageUrl} alt="Ghép" />
            <select
              onChange={(e) => handleChon(image.flashcardId, e.target.value)}
              value={answers[image.flashcardId]?.selectedWord || ''}
            >
              <option value="">Chọn từ...</option>
              {gameData.wordOptions.map((word) => (
                <option key={word} value={word}>{word}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <button onClick={handleNop} disabled={Object.keys(answers).length < gameData.images.length}>
        Nộp Bài
      </button>
    </div>
  );
};
```

### Ví Dụ: Component Thi Đánh Vần

```jsx
const ThiDanhVan = ({ deckId, onComplete }) => {
  const [gameData, setGameData] = useState(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [attempts, setAttempts] = useState({});
  const [feedback, setFeedback] = useState('');

  // Bắt đầu trò chơi
  useEffect(() => {
    const batDau = async () => {
      const response = await axios.post(
        `/api/interactive/spelling-bee/${deckId}/start`,
        { count: 10 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGameData(response.data.data);
    };
    batDau();
  }, [deckId]);

  // Phát audio
  const phatAudio = () => {
    const audio = new Audio(gameData.words[currentWordIndex].audioUrl);
    audio.play();
  };

  // Kiểm tra đánh vần theo thời gian thực
  const kiemTraDanhVan = async () => {
    const currentWord = gameData.words[currentWordIndex];
    
    try {
      const response = await axios.post(
        '/api/interactive/spelling-bee/check',
        {
          flashcardId: currentWord.flashcardId,
          userSpelling: userInput
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { isCorrect, feedback: fbText } = response.data.data;
      setFeedback(fbText);

      if (isCorrect) {
        // Chuyển sang từ tiếp theo
        setAttempts({
          ...attempts,
          [currentWord.flashcardId]: {
            userSpelling: userInput,
            attempts: (attempts[currentWord.flashcardId]?.attempts || 0) + 1,
            isCorrect: true
          }
        });
        setCurrentWordIndex(currentWordIndex + 1);
        setUserInput('');
        setFeedback('');
      } else {
        // Ghi nhận lần thử
        setAttempts({
          ...attempts,
          [currentWord.flashcardId]: {
            userSpelling: userInput,
            attempts: (attempts[currentWord.flashcardId]?.attempts || 0) + 1,
            isCorrect: false
          }
        });
      }
    } catch (error) {
      console.error('Lỗi kiểm tra:', error);
    }
  };

  // Nộp kết quả cuối cùng
  const handleNop = async () => {
    const words = Object.entries(attempts).map(([flashcardId, data]) => ({
      flashcardId,
      ...data
    }));

    const response = await axios.post(
      `/api/interactive/spelling-bee/${deckId}/submit`,
      { words },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    onComplete(response.data.data);
  };

  if (!gameData) return <div>Đang tải...</div>;
  if (currentWordIndex >= gameData.words.length) {
    return (
      <div>
        <h2>Hoàn thành tất cả các từ!</h2>
        <button onClick={handleNop}>Xem Kết Quả</button>
      </div>
    );
  }

  const currentWord = gameData.words[currentWordIndex];

  return (
    <div className="thi-danh-van">
      <h2>Thi Đánh Vần</h2>
      <p>Từ {currentWordIndex + 1} / {gameData.words.length}</p>
      
      <button onClick={phatAudio}>🔊 Phát Audio</button>
      <p>Gợi ý: {currentWord.hint}</p>
      
      <input
        type="text"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Nhập từ..."
        onKeyPress={(e) => e.key === 'Enter' && kiemTraDanhVan()}
      />
      
      <button onClick={kiemTraDanhVan}>Kiểm Tra</button>
      
      {feedback && <p className="phan-hoi">{feedback}</p>}
      
      <p>Số lần thử: {attempts[currentWord.flashcardId]?.attempts || 0} / 3</p>
    </div>
  );
};
```

---

## Hướng Dẫn Kiểm Thử

### Yêu Cầu Trước Khi Test

1. **Tạo bộ thẻ test với flashcards:**
   - Ít nhất 10 thẻ
   - Có trường `imageUrl` cho Ghép Hình
   - Có trường `audioUrl` cho Thi Đánh Vần
   - Từ đa dạng cho Trắc Nghiệm

2. **Lấy token xác thực:**
   ```bash
   POST /api/auth/login
   {
     "email": "test@example.com",
     "password": "password123"
   }
   ```

### Các Tình Huống Test

#### 1. Test Ghép Hình

```bash
# Bắt đầu trò chơi
curl -X POST http://localhost:1124/api/interactive/image-match/YOUR_DECK_ID/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"count": 5, "difficulty": "easy"}'

# Nộp đáp án
curl -X POST http://localhost:1124/api/interactive/image-match/YOUR_DECK_ID/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      {"flashcardId": "FLASHCARD_ID_1", "selectedWord": "táo", "timeTaken": 5},
      {"flashcardId": "FLASHCARD_ID_2", "selectedWord": "chuối", "timeTaken": 6}
    ]
  }'
```

#### 2. Test Trắc Nghiệm

```bash
# Bắt đầu bài test
curl -X POST http://localhost:1124/api/interactive/multiple-choice/YOUR_DECK_ID/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"count": 5, "questionType": "word-to-meaning", "difficulty": "medium"}'

# Nộp đáp án
curl -X POST http://localhost:1124/api/interactive/multiple-choice/YOUR_DECK_ID/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "questions": [
      {"flashcardId": "FLASHCARD_ID_1", "selectedAnswer": "đẹp", "timeTaken": 8}
    ]
  }'
```

#### 3. Test Ghép Cặp

```bash
# Bắt đầu trò chơi
curl -X POST http://localhost:1124/api/interactive/matching/YOUR_DECK_ID/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"count": 6, "matchType": "word-meaning", "difficulty": "medium"}'

# Nộp kết quả
curl -X POST http://localhost:1124/api/interactive/matching/YOUR_DECK_ID/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pairs": [
      {"flashcardId": "FLASHCARD_ID_1", "left": "beautiful", "right": "đẹp", "matchType": "word-meaning"}
    ],
    "matches": [
      {"leftId": "left_1", "rightId": "right_1", "attempts": 1, "isCorrect": true}
    ],
    "timeSpent": 60
  }'
```

#### 4. Test Thi Đánh Vần

```bash
# Bắt đầu thi
curl -X POST http://localhost:1124/api/interactive/spelling-bee/YOUR_DECK_ID/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"count": 5, "difficulty": "medium"}'

# Kiểm tra đánh vần (thời gian thực)
curl -X POST http://localhost:1124/api/interactive/spelling-bee/check \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"flashcardId": "FLASHCARD_ID_1", "userSpelling": "beautiful"}'

# Nộp kết quả cuối cùng
curl -X POST http://localhost:1124/api/interactive/spelling-bee/YOUR_DECK_ID/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "words": [
      {"flashcardId": "FLASHCARD_ID_1", "userSpelling": "beautiful", "attempts": 1, "hintsUsed": 0, "isCorrect": true}
    ]
  }'
```

#### 5. Test Thống Kê

```bash
# Xem thống kê tổng thể
curl -X GET http://localhost:1124/api/interactive/stats \
  -H "Authorization: Bearer YOUR_TOKEN"

# Xem thống kê theo bộ thẻ
curl -X GET "http://localhost:1124/api/interactive/stats?deckId=YOUR_DECK_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Xem lịch sử
curl -X GET "http://localhost:1124/api/interactive/history/image-match?limit=10&page=1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Xem chi tiết lượt chơi
curl -X GET http://localhost:1124/api/interactive/attempt/image-match/ATTEMPT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Các Lỗi Thường Gặp

**Lỗi: "Not enough flashcards with images"**
- Giải pháp: Thêm trường `imageUrl` vào flashcards trong bộ thẻ
- Tối thiểu: 4 thẻ có hình cho Ghép Hình

**Lỗi: "Not enough flashcards for quiz"**
- Giải pháp: Cần ít nhất 4 thẻ (1 đúng + 3 sai)
- Trắc Nghiệm yêu cầu tối thiểu 4 thẻ

**Lỗi: "No flashcards available"**
- Giải pháp: Kiểm tra bộ thẻ có thẻ hoạt động (không bị tạm ngưng/ẩn)
- Xác minh quyền sở hữu hoặc isPublic=true

**Lỗi: Độ tương đồng đánh vần quá thấp**
- Giải pháp: Thuật toán Levenshtein không phân biệt hoa thường
- Kiểm tra lỗi chính tả, khoảng trắng
- Độ tương đồng < 50% = "khác khá nhiều"

---

## Cân Nhắc Về Hiệu Suất

### Mẹo Tối Ưu

1. **Index Database:**
   - Tất cả models có index `{ user: 1, completedAt: -1 }`
   - Cân nhắc thêm `{ deck: 1, completedAt: -1 }` cho truy vấn theo bộ thẻ

2. **Caching:**
   - Cache flashcards của bộ thẻ khi tạo trò chơi
   - Dùng Redis cho session trò chơi đang chơi

3. **Phân Trang:**
   - Giới hạn mặc định: 20 item/trang
   - Giới hạn tối đa: 100 item/trang
   - Luôn phân trang cho endpoint lịch sử

4. **Tải Hình Ảnh:**
   - Dùng CDN cho URL hình ảnh
   - Implement lazy loading ở frontend
   - Tối ưu kích thước (đề xuất tối đa 500KB)

5. **File Audio:**
   - Dùng format nén (MP3, AAC)
   - Implement preload audio ở frontend
   - Kích thước tối đa đề xuất: 2MB

---

## Cải Tiến Tương Lai

### Tính Năng Tiềm Năng

1. **Chế Độ Nhiều Người:**
   - Thi đấu thời gian thực
   - Bảng xếp hạng theo từng chế độ
   - Thách đấu bạn bè

2. **Độ Khó Thích Ứng:**
   - Điều chỉnh độ khó dựa trên hiệu suất
   - Tạo câu hỏi bằng AI
   - Lộ trình học tập cá nhân hóa

3. **Thành Tích:**
   - Huy hiệu điểm hoàn hảo
   - Thưởng tốc độ
   - Theo dõi chuỗi ngày học

4. **Tính Năng Xã Hội:**
   - Chia sẻ kết quả
   - So sánh với bạn bè
   - Xếp hạng toàn cầu

5. **Phân Tích Nâng Cao:**
   - Trực quan hóa đường cong học tập
   - Xác định điểm yếu
   - Dự đoán tiến độ

---

## Giới Hạn Tốc Độ API

- **Bắt đầu trò chơi:** 10 request/phút/người dùng
- **Nộp bài:** 10 request/phút/người dùng
- **Kiểm tra đánh vần:** 30 request/phút/người dùng
- **Thống kê/Lịch sử:** 20 request/phút/người dùng

Giới hạn áp dụng cho mỗi token xác thực.

---

## Hỗ Trợ & Khắc Phục Lỗi

### Mã Lỗi

| Mã | Thông Báo | Giải Pháp |
|----|-----------|-----------|
| 400 | Không đủ thẻ | Thêm thẻ vào bộ thẻ |
| 403 | Không có quyền truy cập | Kiểm tra quyền sở hữu/public |
| 404 | Không tìm thấy bộ thẻ | Xác minh deckId tồn tại |
| 404 | Không tìm thấy lượt chơi | Kiểm tra attemptId và loại trò chơi |
| 500 | Lỗi server | Xem logs, liên hệ hỗ trợ |

### Chế Độ Debug

Bật logging debug:
```javascript
// Trong file service
const DEBUG = process.env.DEBUG_INTERACTIVE === 'true';
if (DEBUG)  ('Dữ liệu trò chơi:', gameData);
```

### Liên Hệ

Để được hỗ trợ hoặc đặt câu hỏi:
- Email: support@appta.com
- GitHub Issues: https://github.com/Thien1124/DACN-APPTA/issues
- Discord: Cộng Đồng APPTA

---

**Cập Nhật Lần Cuối:** 9 tháng 11, 2025  
**Phiên Bản:** 1.0.0  
**Tác Giả:** Đội Phát Triển APPTA
