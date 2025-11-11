# Task 29: Shadowing Audio Practice - API Documentation

## Tổng Quan

Task 29 triển khai tính năng **Shadowing Audio** - phương pháp luyện phát âm và độ trôi chảy (fluency) bằng cách nghe và bắt chước theo audio của đoạn hội thoại. Hệ thống bao gồm:

1. **Audio Playback với Speed Control** - Phát audio với tốc độ từ 0.5x đến 2.0x
2. **A-B Repeat** - Lặp lại đoạn audio từ điểm A đến điểm B
3. **Recording & Analysis** - Ghi âm và phân tích phát âm bằng Google Speech API
4. **Segment Practice** - Luyện từng đoạn nhỏ trong bài tập
5. **Progress Tracking** - Theo dõi tiến độ và cải thiện qua thời gian

**Đặc điểm nổi bật:**
- ⚡ Điều chỉnh tốc độ phát audio (0.5x - 2.0x)
- 🔁 Lặp lại đoạn A-B không giới hạn
- 🎤 Ghi âm và so sánh với bản gốc
- 📊 Phân tích chi tiết: phát âm, độ chính xác, độ trôi chảy
- 📈 Thống kê tiến độ cải thiện

---

## Mục Lục

- [Mô Hình Dữ Liệu](#mô-hình-dữ-liệu)
- [API Endpoints](#api-endpoints)
  - [Exercise Management](#1-exercise-management)
  - [Attempt Management](#2-attempt-management)
  - [Recording & Analysis](#3-recording--analysis)
  - [Statistics & Progress](#4-statistics--progress)
- [Workflow](#workflow)
- [Frontend Integration](#frontend-integration)
- [Testing Guide](#hướng-dẫn-kiểm-thử)

---

## Mô Hình Dữ Liệu

### 1. ShadowingExercise (Bài Tập Shadowing)

```javascript
{
  title: String,                    // Tiêu đề bài tập
  description: String,              // Mô tả
  deck: ObjectId,                   // Ref Deck
  createdBy: ObjectId,              // Ref User
  
  // Audio file
  audioUrl: String,                 // URL file audio
  audioDuration: Number,            // Độ dài audio (giây)
  
  // Transcript với timestamps
  transcript: String,               // Toàn bộ nội dung
  segments: [{
    text: String,                   // Nội dung đoạn
    startTime: Number,              // Thời gian bắt đầu (giây)
    endTime: Number,                // Thời gian kết thúc (giây)
    speaker: String                 // 'A', 'B', 'Narrator', etc.
  }],
  
  // Settings
  difficulty: String,               // 'beginner', 'intermediate', 'advanced'
  tags: [String],                   // Tags
  defaultSpeed: Number,             // Tốc độ mặc định (0.5-2.0)
  isPublic: Boolean,                // Công khai
  
  // Statistics
  totalAttempts: Number,            // Tổng số lần luyện
  averageScore: Number,             // Điểm trung bình
  
  createdAt: Date,
  updatedAt: Date
}
```

### 2. ShadowingAttempt (Lượt Luyện Shadowing)

```javascript
{
  user: ObjectId,                   // Ref User
  exercise: ObjectId,               // Ref ShadowingExercise
  
  // Playback settings
  playbackSpeed: Number,            // Tốc độ phát (0.5-2.0)
  
  // A-B Repeat markers
  abRepeat: {
    enabled: Boolean,               // Bật/tắt
    startTime: Number,              // Thời điểm A (giây)
    endTime: Number,                // Thời điểm B (giây)
    loopCount: Number               // Số lần lặp
  },
  
  // Recording
  recordingUrl: String,             // URL bản ghi âm
  recordingDuration: Number,        // Độ dài ghi âm (giây)
  
  // Pronunciation analysis
  transcription: String,            // Nội dung người dùng nói
  pronunciationScore: Number,       // Điểm phát âm (0-100)
  accuracyScore: Number,            // Độ chính xác (0-100)
  fluencyScore: Number,             // Độ trôi chảy (0-100)
  completenessScore: Number,        // Độ đầy đủ (0-100)
  
  // Detailed feedback
  segmentScores: [{
    segmentIndex: Number,
    expectedText: String,
    spokenText: String,
    score: Number,
    errors: [{
      word: String,
      type: String,                 // 'pronunciation', 'omission', 'insertion', 'substitution'
      suggestion: String
    }]
  }],
  
  // Time tracking
  timeSpent: Number,                // Tổng thời gian (giây)
  pauseCount: Number,               // Số lần tạm dừng
  replayCount: Number,              // Số lần phát lại
  
  // Overall score (weighted average)
  score: Number,                    // Điểm tổng (0-100)
  
  // Status
  status: String,                   // 'in-progress', 'completed', 'abandoned'
  completedAt: Date,
  
  createdAt: Date,
  updatedAt: Date
}
```

**Công Thức Tính Điểm:**
```javascript
// Weighted average
score = pronunciationScore × 0.4 +
        accuracyScore × 0.3 +
        fluencyScore × 0.2 +
        completenessScore × 0.1
```

---

## API Endpoints

### 1. Exercise Management

#### 1.1. Tạo Bài Tập Shadowing

```http
POST /api/shadowing/exercises
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Daily Conversation - At the Restaurant",
  "description": "Practice ordering food in English",
  "deck": "674a5f8d...",
  "audioUrl": "https://example.com/audio/restaurant.mp3",
  "audioDuration": 120,
  "transcript": "Waiter: Good evening. Are you ready to order?\nCustomer: Yes, I'd like the pasta, please.",
  "segments": [
    {
      "text": "Good evening. Are you ready to order?",
      "startTime": 0,
      "endTime": 3,
      "speaker": "A"
    },
    {
      "text": "Yes, I'd like the pasta, please.",
      "startTime": 3.5,
      "endTime": 6,
      "speaker": "B"
    }
  ],
  "difficulty": "intermediate",
  "tags": ["conversation", "restaurant", "daily-english"],
  "defaultSpeed": 1.0,
  "isPublic": false
}
```

**Phản Hồi:**
```json
{
  "success": true,
  "data": {
    "_id": "674a5f8d...",
    "title": "Daily Conversation - At the Restaurant",
    "audioUrl": "https://example.com/audio/restaurant.mp3",
    "audioDuration": 120,
    "segments": [...],
    "difficulty": "intermediate",
    "createdBy": {
      "_id": "674a5f8d...",
      "name": "John Doe"
    },
    "createdAt": "2025-11-09T10:00:00.000Z"
  }
}
```

#### 1.2. Lấy Bài Tập Theo ID

```http
GET /api/shadowing/exercises/:exerciseId
Authorization: Bearer <token>
```

**Phản Hồi:**
```json
{
  "success": true,
  "data": {
    "_id": "674a5f8d...",
    "title": "Daily Conversation - At the Restaurant",
    "description": "Practice ordering food in English",
    "audioUrl": "https://example.com/audio/restaurant.mp3",
    "audioDuration": 120,
    "transcript": "...",
    "segments": [...],
    "difficulty": "intermediate",
    "defaultSpeed": 1.0,
    "totalAttempts": 15,
    "averageScore": 78
  }
}
```

#### 1.3. Lấy Danh Sách Bài Tập Của User

```http
GET /api/shadowing/exercises?difficulty=intermediate&page=1&limit=20
Authorization: Bearer <token>
```

**Phản Hồi:**
```json
{
  "success": true,
  "data": {
    "exercises": [
      {
        "_id": "674a5f8d...",
        "title": "Daily Conversation - At the Restaurant",
        "difficulty": "intermediate",
        "audioDuration": 120,
        "totalAttempts": 15,
        "averageScore": 78
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "pages": 3
    }
  }
}
```

#### 1.4. Lấy Bài Tập Theo Deck

```http
GET /api/shadowing/exercises/deck/:deckId
Authorization: Bearer <token>
```

#### 1.5. Cập Nhật Bài Tập

```http
PUT /api/shadowing/exercises/:exerciseId
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "difficulty": "advanced",
  "isPublic": true
}
```

#### 1.6. Xóa Bài Tập

```http
DELETE /api/shadowing/exercises/:exerciseId
Authorization: Bearer <token>
```

---

### 2. Attempt Management

#### 2.1. Bắt Đầu Luyện Tập

```http
POST /api/shadowing/exercises/:exerciseId/start
Authorization: Bearer <token>
Content-Type: application/json

{
  "playbackSpeed": 0.8
}
```

**Phản Hồi:**
```json
{
  "success": true,
  "data": {
    "attemptId": "674a5f8d...",
    "exercise": {
      "_id": "674a5f8d...",
      "title": "Daily Conversation - At the Restaurant",
      "audioUrl": "https://example.com/audio/restaurant.mp3",
      "audioDuration": 120,
      "transcript": "...",
      "segments": [...],
      "difficulty": "intermediate"
    },
    "playbackSpeed": 0.8
  }
}
```

#### 2.2. Điều Chỉnh Tốc Độ Phát

```http
PUT /api/shadowing/attempts/:attemptId/speed
Authorization: Bearer <token>
Content-Type: application/json

{
  "speed": 1.2
}
```

**Phản Hồi:**
```json
{
  "success": true,
  "data": {
    "attemptId": "674a5f8d...",
    "playbackSpeed": 1.2
  }
}
```

**Lưu ý:** Tốc độ phải trong khoảng 0.5x - 2.0x

#### 2.3. Thiết Lập A-B Repeat

```http
POST /api/shadowing/attempts/:attemptId/ab-repeat
Authorization: Bearer <token>
Content-Type: application/json

{
  "startTime": 10.5,
  "endTime": 25.3
}
```

**Phản Hồi:**
```json
{
  "success": true,
  "data": {
    "attemptId": "674a5f8d...",
    "abRepeat": {
      "enabled": true,
      "startTime": 10.5,
      "endTime": 25.3,
      "loopCount": 1
    }
  }
}
```

#### 2.4. Xóa A-B Repeat

```http
DELETE /api/shadowing/attempts/:attemptId/ab-repeat
Authorization: Bearer <token>
```

**Phản Hồi:**
```json
{
  "success": true,
  "data": {
    "attemptId": "674a5f8d...",
    "abRepeat": {
      "enabled": false,
      "startTime": 0,
      "endTime": 0,
      "loopCount": 0
    }
  }
}
```

---

### 3. Recording & Analysis

#### 3.1. Ghi Âm và Phân Tích

```http
POST /api/shadowing/attempts/:attemptId/record
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData:
- audio: <audio-file>         // File audio (webm, ogg, mp3, wav, m4a)
- segmentIndex: 0              // (Optional) Index của segment cần phân tích
```

**Phản Hồi:**
```json
{
  "success": true,
  "data": {
    "attemptId": "674a5f8d...",
    "transcription": "Good evening. Are you ready to order?",
    "scores": {
      "pronunciation": 85,
      "accuracy": 90,
      "fluency": 78,
      "completeness": 95,
      "overall": 86
    },
    "errors": [
      {
        "word": "evening",
        "type": "pronunciation",
        "suggestion": "Improve pronunciation of \"evening\""
      }
    ],
    "feedback": "Phát âm tốt, hãy tiếp tục luyện tập! Độ chính xác cao! Độ trôi chảy rất tốt!"
  }
}
```

**Các loại lỗi:**
- `pronunciation` - Phát âm chưa chính xác
- `omission` - Thiếu từ
- `insertion` - Thêm từ không cần thiết
- `substitution` - Nói sai từ

#### 3.2. Hoàn Thành Luyện Tập

```http
POST /api/shadowing/attempts/:attemptId/complete
Authorization: Bearer <token>
Content-Type: application/json

{
  "timeSpent": 180
}
```

**Phản Hồi:**
```json
{
  "success": true,
  "data": {
    "attemptId": "674a5f8d...",
    "score": 86,
    "pronunciationScore": 85,
    "accuracyScore": 90,
    "fluencyScore": 78,
    "completenessScore": 95,
    "timeSpent": 180
  }
}
```

#### 3.3. Xem Chi Tiết Lượt Luyện

```http
GET /api/shadowing/attempts/:attemptId
Authorization: Bearer <token>
```

**Phản Hồi:**
```json
{
  "success": true,
  "data": {
    "_id": "674a5f8d...",
    "user": {...},
    "exercise": {...},
    "playbackSpeed": 1.0,
    "abRepeat": {...},
    "transcription": "...",
    "pronunciationScore": 85,
    "accuracyScore": 90,
    "fluencyScore": 78,
    "completenessScore": 95,
    "score": 86,
    "segmentScores": [...],
    "timeSpent": 180,
    "replayCount": 5,
    "status": "completed",
    "completedAt": "2025-11-09T11:00:00.000Z"
  }
}
```

#### 3.4. Lấy Lịch Sử Luyện Tập

```http
GET /api/shadowing/attempts?exerciseId=674a5f8d...&status=completed&page=1&limit=20
Authorization: Bearer <token>
```

**Phản Hồi:**
```json
{
  "success": true,
  "data": {
    "attempts": [
      {
        "_id": "674a5f8d...",
        "exercise": {
          "_id": "674a5f8d...",
          "title": "Daily Conversation",
          "difficulty": "intermediate"
        },
        "score": 86,
        "pronunciationScore": 85,
        "timeSpent": 180,
        "completedAt": "2025-11-09T11:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 30,
      "page": 1,
      "limit": 20,
      "pages": 2
    }
  }
}
```

---

### 4. Statistics & Progress

#### 4.1. Xem Thống Kê

```http
GET /api/shadowing/stats?exerciseId=674a5f8d...&startDate=2025-11-01
Authorization: Bearer <token>
```

**Phản Hồi:**
```json
{
  "success": true,
  "data": {
    "totalAttempts": 30,
    "averageScore": 82,
    "averagePronunciation": 85,
    "averageAccuracy": 88,
    "averageFluency": 75,
    "totalTimeSpent": 5400,
    "bestScore": 95,
    "improvement": 15
  }
}
```

**Giải thích:**
- `improvement`: Sự cải thiện điểm số (so sánh 3 lần đầu vs 3 lần cuối)
- `totalTimeSpent`: Tổng thời gian luyện (giây)

#### 4.2. Xem Tiến Độ Theo Thời Gian

```http
GET /api/shadowing/progress?exerciseId=674a5f8d...
Authorization: Bearer <token>
```

**Phản Hồi:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2025-11-01T10:00:00.000Z",
      "score": 70,
      "pronunciation": 68,
      "accuracy": 75,
      "fluency": 65
    },
    {
      "date": "2025-11-02T10:00:00.000Z",
      "score": 75,
      "pronunciation": 73,
      "accuracy": 80,
      "fluency": 70
    },
    {
      "date": "2025-11-09T10:00:00.000Z",
      "score": 86,
      "pronunciation": 85,
      "accuracy": 90,
      "fluency": 78
    }
  ]
}
```

---

## Workflow

### Luồng Sử Dụng Cơ Bản

```
1. Tạo/Chọn bài tập
   POST /api/shadowing/exercises
   GET /api/shadowing/exercises

2. Bắt đầu luyện tập
   POST /api/shadowing/exercises/:exerciseId/start
   
3. Trong quá trình luyện:
   
   3a. Điều chỉnh tốc độ (nếu cần)
       PUT /api/shadowing/attempts/:attemptId/speed
   
   3b. Thiết lập A-B repeat (lặp đoạn khó)
       POST /api/shadowing/attempts/:attemptId/ab-repeat
   
   3c. Ghi âm và nhận phản hồi
       POST /api/shadowing/attempts/:attemptId/record
       (Có thể ghi nhiều lần cho các đoạn khác nhau)
   
   3d. Lặp lại 3a-3c cho đến khi hài lòng

4. Hoàn thành bài tập
   POST /api/shadowing/attempts/:attemptId/complete

5. Xem tiến độ và thống kê
   GET /api/shadowing/stats
   GET /api/shadowing/progress
```

### Chiến Lược Luyện Tập Hiệu Quả

1. **Bước 1: Nghe toàn bộ** (Speed 1.0x)
   - Nghe qua 2-3 lần để hiểu nội dung

2. **Bước 2: Luyện từng đoạn** (Speed 0.7x-0.8x)
   - Dùng A-B repeat cho từng câu
   - Ghi âm và kiểm tra điểm
   - Lặp lại cho đến khi đạt 80%+

3. **Bước 3: Tăng tốc độ dần** (Speed 0.9x → 1.0x → 1.2x)
   - Khi đã quen, tăng tốc độ lên
   - Luyện toàn bộ bài với tốc độ mới

4. **Bước 4: Shadow liên tục**
   - Tắt A-B repeat
   - Shadow toàn bộ bài không dừng

---

## Frontend Integration

### Ví Dụ: Component Shadowing Player (React)

```jsx
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ShadowingPlayer = ({ exerciseId }) => {
  const [exercise, setExercise] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [abRepeat, setAbRepeat] = useState({ enabled: false, start: 0, end: 0 });
  const [isRecording, setIsRecording] = useState(false);
  const [currentScore, setCurrentScore] = useState(null);
  
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  
  // Start practice
  useEffect(() => {
    const startPractice = async () => {
      try {
        const response = await axios.post(
          `/api/shadowing/exercises/${exerciseId}/start`,
          { playbackSpeed: 1.0 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setExercise(response.data.data.exercise);
        setAttemptId(response.data.data.attemptId);
      } catch (error) {
        console.error('Error starting practice:', error);
      }
    };
    
    startPractice();
  }, [exerciseId]);
  
  // Change playback speed
  const handleSpeedChange = async (speed) => {
    try {
      await axios.put(
        `/api/shadowing/attempts/${attemptId}/speed`,
        { speed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setPlaybackSpeed(speed);
      if (audioRef.current) {
        audioRef.current.playbackRate = speed;
      }
    } catch (error) {
      console.error('Error changing speed:', error);
    }
  };
  
  // Set A-B repeat
  const handleSetABRepeat = async () => {
    const currentTime = audioRef.current.currentTime;
    
    if (!abRepeat.enabled) {
      // Set point A
      setAbRepeat({ ...abRepeat, start: currentTime });
    } else if (abRepeat.start && !abRepeat.end) {
      // Set point B
      try {
        await axios.post(
          `/api/shadowing/attempts/${attemptId}/ab-repeat`,
          { startTime: abRepeat.start, endTime: currentTime },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setAbRepeat({ enabled: true, start: abRepeat.start, end: currentTime });
      } catch (error) {
        console.error('Error setting A-B repeat:', error);
      }
    }
  };
  
  // Clear A-B repeat
  const handleClearABRepeat = async () => {
    try {
      await axios.delete(
        `/api/shadowing/attempts/${attemptId}/ab-repeat`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setAbRepeat({ enabled: false, start: 0, end: 0 });
    } catch (error) {
      console.error('Error clearing A-B repeat:', error);
    }
  };
  
  // Handle audio time update (for A-B loop)
  const handleTimeUpdate = () => {
    if (abRepeat.enabled && abRepeat.end && audioRef.current) {
      if (audioRef.current.currentTime >= abRepeat.end) {
        audioRef.current.currentTime = abRepeat.start;
      }
    }
  };
  
  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];
      
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        await submitRecording(blob);
      };
      
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  // Submit recording for analysis
  const submitRecording = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      
      const response = await axios.post(
        `/api/shadowing/attempts/${attemptId}/record`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      setCurrentScore(response.data.data);
      alert(response.data.data.feedback);
    } catch (error) {
      console.error('Error submitting recording:', error);
    }
  };
  
  // Complete practice
  const handleComplete = async () => {
    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      
      const response = await axios.post(
        `/api/shadowing/attempts/${attemptId}/complete`,
        { timeSpent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert(`Hoàn thành! Điểm: ${response.data.data.score}`);
    } catch (error) {
      console.error('Error completing practice:', error);
    }
  };
  
  if (!exercise) return <div>Đang tải...</div>;
  
  return (
    <div className="shadowing-player">
      <h2>{exercise.title}</h2>
      
      {/* Audio Player */}
      <audio
        ref={audioRef}
        src={exercise.audioUrl}
        controls
        onTimeUpdate={handleTimeUpdate}
      />
      
      {/* Speed Control */}
      <div className="speed-control">
        <label>Tốc độ: {playbackSpeed}x</label>
        <input
          type="range"
          min="0.5"
          max="2.0"
          step="0.1"
          value={playbackSpeed}
          onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
        />
      </div>
      
      {/* A-B Repeat */}
      <div className="ab-repeat">
        <button onClick={handleSetABRepeat}>
          {!abRepeat.enabled ? 'Đặt điểm A' : !abRepeat.end ? 'Đặt điểm B' : 'Đặt lại A-B'}
        </button>
        {abRepeat.enabled && abRepeat.end && (
          <button onClick={handleClearABRepeat}>Xóa A-B</button>
        )}
        {abRepeat.enabled && abRepeat.end && (
          <span>Lặp: {abRepeat.start.toFixed(1)}s - {abRepeat.end.toFixed(1)}s</span>
        )}
      </div>
      
      {/* Recording */}
      <div className="recording">
        {!isRecording ? (
          <button onClick={startRecording}>🎤 Bắt đầu ghi âm</button>
        ) : (
          <button onClick={stopRecording} className="recording-active">
            ⏹️ Dừng ghi âm
          </button>
        )}
      </div>
      
      {/* Score Display */}
      {currentScore && (
        <div className="score-display">
          <h3>Kết quả:</h3>
          <p>Phát âm: {currentScore.scores.pronunciation}/100</p>
          <p>Độ chính xác: {currentScore.scores.accuracy}/100</p>
          <p>Độ trôi chảy: {currentScore.scores.fluency}/100</p>
          <p>Tổng điểm: {currentScore.scores.overall}/100</p>
          {currentScore.errors.length > 0 && (
            <div className="errors">
              <h4>Lỗi:</h4>
              {currentScore.errors.map((err, i) => (
                <p key={i}>{err.suggestion}</p>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Transcript */}
      <div className="transcript">
        <h3>Transcript:</h3>
        <div className="segments">
          {exercise.segments.map((seg, i) => (
            <div key={i} className="segment">
              <span className="speaker">{seg.speaker}:</span>
              <span className="text">{seg.text}</span>
              <span className="time">[{seg.startTime}s - {seg.endTime}s]</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Complete Button */}
      <button onClick={handleComplete} className="complete-btn">
        Hoàn thành bài tập
      </button>
    </div>
  );
};

export default ShadowingPlayer;
```

---

## Hướng Dẫn Kiểm Thử

### 1. Tạo Bài Tập Test

```bash
curl -X POST http://localhost:1124/api/shadowing/exercises \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Shadowing Exercise",
    "description": "Test exercise for shadowing",
    "audioUrl": "https://example.com/audio/test.mp3",
    "audioDuration": 60,
    "transcript": "Hello, how are you today?",
    "segments": [
      {
        "text": "Hello, how are you today?",
        "startTime": 0,
        "endTime": 3,
        "speaker": "A"
      }
    ],
    "difficulty": "beginner",
    "defaultSpeed": 1.0
  }'
```

### 2. Bắt Đầu Luyện Tập

```bash
curl -X POST http://localhost:1124/api/shadowing/exercises/EXERCISE_ID/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"playbackSpeed": 0.8}'
```

### 3. Thay Đổi Tốc Độ

```bash
curl -X PUT http://localhost:1124/api/shadowing/attempts/ATTEMPT_ID/speed \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"speed": 1.2}'
```

### 4. Thiết Lập A-B Repeat

```bash
curl -X POST http://localhost:1124/api/shadowing/attempts/ATTEMPT_ID/ab-repeat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"startTime": 5.5, "endTime": 15.3}'
```

### 5. Ghi Âm và Phân Tích

```powershell
# PowerShell
$headers = @{
  "Authorization" = "Bearer YOUR_TOKEN"
}

$form = @{
  audio = Get-Item -Path "path\to\recording.webm"
}

Invoke-RestMethod -Uri "http://localhost:1124/api/shadowing/attempts/ATTEMPT_ID/record" `
  -Method POST -Headers $headers -Form $form
```

### 6. Hoàn Thành Bài Tập

```bash
curl -X POST http://localhost:1124/api/shadowing/attempts/ATTEMPT_ID/complete \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"timeSpent": 180}'
```

### 7. Xem Thống Kê

```bash
curl -X GET http://localhost:1124/api/shadowing/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 8. Xem Tiến Độ

```bash
curl -X GET "http://localhost:1124/api/shadowing/progress?exerciseId=EXERCISE_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Các Lỗi Thường Gặp

### 1. "Tốc độ phải từ 0.5x đến 2.0x"
- **Nguyên nhân:** Speed value nằm ngoài phạm vi cho phép
- **Giải pháp:** Đảm bảo `speed` trong khoảng [0.5, 2.0]

### 2. "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc"
- **Nguyên nhân:** `startTime >= endTime` khi set A-B repeat
- **Giải pháp:** Kiểm tra lại giá trị startTime và endTime

### 3. "Thiếu file audio"
- **Nguyên nhân:** Không attach file khi POST /record
- **Giải pháp:** Đảm bảo gửi file với field name là "audio"

### 4. "Không tìm thấy lượt luyện tập"
- **Nguyên nhân:** attemptId không đúng hoặc không thuộc về user
- **Giải pháp:** Kiểm tra attemptId và token

### 5. Google Speech API Error
- **Nguyên nhân:** Credential chưa cấu hình hoặc file audio không hợp lệ
- **Giải pháp:** 
  - Kiểm tra GOOGLE_APPLICATION_CREDENTIALS
  - Đảm bảo audio format hợp lệ (webm, ogg, mp3, wav, m4a)
  - Kiểm tra sample rate (khuyến nghị 48000Hz)

---

## Best Practices

### 1. Tạo Bài Tập Hiệu Quả

✅ **Nên:**
- Chia audio thành segments ngắn (3-5 giây mỗi segment)
- Cung cấp timestamp chính xác cho mỗi segment
- Thêm speaker labels để dễ phân biệt
- Sử dụng audio chất lượng cao

❌ **Không nên:**
- Segments quá dài (>10 giây)
- Timestamps không chính xác
- Audio có nhiễu, chất lượng kém

### 2. Luyện Tập Hiệu Quả

✅ **Chiến lược tốt:**
1. Bắt đầu với speed 0.7x-0.8x
2. Luyện từng segment với A-B repeat
3. Ghi âm và kiểm tra điểm thường xuyên
4. Tăng speed dần khi đạt 80%+ accuracy
5. Shadow liên tục khi đạt speed 1.0x

❌ **Tránh:**
- Bỏ qua bước luyện chậm
- Không ghi âm để kiểm tra
- Cố gắng đạt perfect score ngay lần đầu

### 3. Tối Ưu Performance

- Cache exercise data ở frontend
- Sử dụng Web Audio API để xử lý playback speed
- Nén audio trước khi upload
- Giới hạn recording duration (max 5 phút)

---

## Công Thức Tính Điểm

### Score Components

```javascript
// 1. Pronunciation Score (40%)
pronunciationScore = confidence × 100
// confidence từ Google Speech API

// 2. Accuracy Score (30%)
accuracyScore = levenshteinSimilarity(expected, actual)
// Levenshtein distance để tính độ giống nhau

// 3. Fluency Score (20%)
fluencyScore = (confidence × 0.7 + wordRatio × 0.3) × 100
wordRatio = min(spokenWords / expectedWords, 1)

// 4. Completeness Score (10%)
completenessScore = (spokenWords / expectedWords) × 100

// Overall Score
overallScore = 
  pronunciationScore × 0.4 +
  accuracyScore × 0.3 +
  fluencyScore × 0.2 +
  completenessScore × 0.1
```

### Improvement Calculation

```javascript
// So sánh 3 lần đầu vs 3 lần cuối
firstThreeAvg = (attempt1.score + attempt2.score + attempt3.score) / 3
lastThreeAvg = (attemptN-2.score + attemptN-1.score + attemptN.score) / 3
improvement = lastThreeAvg - firstThreeAvg
```

---

## Tích Hợp Google Speech API

### Setup

1. Tạo Google Cloud Project
2. Enable Speech-to-Text API
3. Tạo Service Account và download JSON key
4. Set environment variable:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
```

### Audio Requirements

- **Formats:** WEBM_OPUS, OGG_OPUS, MP3, LINEAR16, FLAC
- **Sample Rate:** 16000-48000 Hz (khuyến nghị 48000 Hz)
- **Channels:** Mono hoặc Stereo
- **Max Duration:** 60 seconds per request
- **Max File Size:** 10 MB

---

## Roadmap & Future Features

### Phase 1 (Current)
- ✅ Basic shadowing with speed control
- ✅ A-B repeat functionality
- ✅ Recording and pronunciation analysis
- ✅ Progress tracking

### Phase 2 (Planned)
- 📅 Real-time pronunciation feedback (during recording)
- 📅 Video shadowing support
- 📅 Multi-language support
- 📅 Collaborative shadowing (study with friends)

### Phase 3 (Future)
- 🔮 AI-powered personalized exercises
- 🔮 Gamification (challenges, badges)
- 🔮 Live shadowing sessions with tutors
- 🔮 Mobile app integration

---

## FAQ

**Q: Tốc độ tối ưu để bắt đầu là bao nhiêu?**  
A: Bắt đầu với 0.7x-0.8x để nghe rõ từng từ, sau đó tăng dần lên 1.0x và cao hơn.

**Q: Nên luyện bao lâu mỗi ngày?**  
A: 15-30 phút mỗi ngày sẽ hiệu quả hơn 1-2 giờ một lần.

**Q: Điểm bao nhiêu là tốt?**  
A: 
- 90-100: Xuất sắc
- 80-89: Tốt
- 70-79: Khá
- 60-69: Trung bình
- <60: Cần cải thiện

**Q: A-B repeat hoạt động như thế nào?**  
A: Bạn đặt điểm A (bắt đầu) và điểm B (kết thúc), audio sẽ tự động lặp lại đoạn A-B cho đến khi bạn tắt.

**Q: Có thể luyện offline không?**  
A: Hiện tại cần internet để phân tích phát âm với Google Speech API.

---

**Cập Nhật Lần Cuối:** 9 tháng 11, 2025  
**Phiên Bản:** 1.0.0  
**Tác Giả:** Đội Phát Triển APPTA
