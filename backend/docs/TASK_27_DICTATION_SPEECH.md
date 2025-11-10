# Task 27: Dictation & Speech Recognition (Nghe-Điền & Phát Âm)

## Overview

Task 27 cung cấp 2 features nâng cao để luyện kỹ năng **nghe** và **nói**:

### **Feature 1: Dictation (Nghe-Điền)**
- ✅ Nghe audio của flashcard
- ✅ Điền từ/câu người dùng nghe được
- ✅ So sánh với đáp án đúng
- ✅ Tính accuracy (% đúng)
- ✅ Highlight các vị trí sai
- ✅ Lưu lịch sử attempts

### **Feature 2: Speech Recognition (Phát Âm)**
- ✅ Thu âm giọng nói người dùng
- ✅ Transcribe speech → text
- ✅ So sánh với IPA chuẩn
- ✅ Tính pronunciation score (0-100)
- ✅ Phân tích intonation (cao-thấp-dài-ngắn)
- ✅ Feedback chi tiết về lỗi phát âm

---

## Use Cases

### **Dictation Use Cases**
1. **Listening Practice**: Luyện nghe từ vựng/câu tiếng Anh
2. **Spelling Test**: Kiểm tra chính tả thông qua nghe
3. **Sentence Completion**: Nghe câu và điền vào chỗ trống
4. **Adaptive Difficulty**: Tăng độ khó dựa trên performance
5. **Progress Tracking**: Theo dõi cải thiện kỹ năng nghe

### **Speech Recognition Use Cases**
1. **Pronunciation Check**: Kiểm tra phát âm có đúng không
2. **IPA Comparison**: So sánh với phiên âm chuẩn IPA
3. **Intonation Analysis**: Phân tích ngữ điệu, trọng âm
4. **Accent Detection**: Phát hiện accent (US/UK/...)
5. **Speaking Confidence**: Xây dựng tự tin khi nói

---

## Architecture

### **System Components**

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  - Audio Player (Dictation)                             │
│  - Audio Recorder (Speech)                              │
│  - Waveform Visualization                               │
│  - Real-time Feedback UI                                │
└─────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────┐
│                 Backend API (Express)                    │
│  - POST /api/dictation/start/:flashcardId              │
│  - POST /api/dictation/submit                           │
│  - POST /api/speech/analyze                             │
│  - GET /api/speech/history                              │
└─────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────┐
│              External Services                           │
│  - Google Cloud Speech-to-Text API                      │
│  - Google Cloud Text-to-Speech API                      │
│  - Web Speech API (browser fallback)                    │
└─────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  Database (MongoDB)                      │
│  - DictationAttempt collection                          │
│  - SpeechAttempt collection                             │
│  - Flashcard collection (with audioUrl, IPA)            │
└─────────────────────────────────────────────────────────┘
```

---

## Database Models

### **1. DictationAttempt Model**

```javascript
{
  user: ObjectId,                    // User reference
  flashcard: ObjectId,               // Flashcard reference
  userAnswer: String,                // What user typed
  correctAnswer: String,             // Expected answer
  accuracy: Number,                  // 0-100%
  mistakePositions: [Number],        // Array of wrong char indices
  mistakeDetails: [{
    position: Number,
    expected: String,
    actual: String,
    type: String                     // 'missing', 'extra', 'wrong'
  }],
  timeTaken: Number,                 // Seconds
  hintsUsed: Number,                 // Number of hints
  difficulty: String,                // 'easy', 'medium', 'hard'
  createdAt: Date,
  score: Number                      // Points earned
}
```

### **2. SpeechAttempt Model**

```javascript
{
  user: ObjectId,                    // User reference
  flashcard: ObjectId,               // Flashcard reference
  audioUrl: String,                  // User's recording URL
  transcription: String,             // Speech-to-Text result
  expectedText: String,              // Target pronunciation
  expectedIPA: String,               // Target IPA
  pronunciationScore: Number,        // 0-100
  confidenceScore: Number,           // Speech API confidence
  ipaComparison: {
    matched: [String],               // Correctly pronounced phonemes
    errors: [{
      phoneme: String,
      expected: String,
      actual: String,
      severity: String               // 'minor', 'moderate', 'major'
    }]
  },
  intonationAnalysis: {
    pitch: String,                   // 'rising', 'falling', 'flat'
    stress: [Number],                // Stress positions
    speed: Number,                   // Words per minute
    fluency: Number                  // 0-100
  },
  feedback: [String],                // AI-generated feedback
  createdAt: Date,
  duration: Number                   // Recording length in seconds
}
```

---

## API Endpoints

### **Dictation Endpoints**

#### **1. Start Dictation Exercise**

**Endpoint**: `POST /api/dictation/start/:flashcardId`

**Description**: Bắt đầu bài tập dictation cho một flashcard

**Auth**: Required (JWT)

**Response**:
```json
{
  "success": true,
  "exercise": {
    "flashcardId": "65a1b2c3...",
    "audioUrl": "https://storage.googleapis.com/tts/hello.mp3",
    "difficulty": "medium",
    "hints": [
      "5 letters",
      "Starts with 'H'",
      "A greeting"
    ],
    "duration": 2.5,
    "maxAttempts": 3
  }
}
```

---

#### **2. Submit Dictation Answer**

**Endpoint**: `POST /api/dictation/submit`

**Description**: Submit câu trả lời dictation

**Auth**: Required (JWT)

**Request**:
```json
{
  "flashcardId": "65a1b2c3...",
  "userAnswer": "Helo",
  "timeTaken": 15,
  "hintsUsed": 1
}
```

**Response**:
```json
{
  "success": true,
  "result": {
    "correct": false,
    "accuracy": 80,
    "correctAnswer": "Hello",
    "userAnswer": "Helo",
    "mistakePositions": [3],
    "mistakeDetails": [
      {
        "position": 3,
        "expected": "ll",
        "actual": "l",
        "type": "missing",
        "message": "Missing letter 'l' at position 3"
      }
    ],
    "score": 8,
    "feedback": "Almost perfect! Watch out for double letters."
  }
}
```

---

#### **3. Get Dictation History**

**Endpoint**: `GET /api/dictation/history?limit=20&flashcardId=...`

**Description**: Lấy lịch sử attempts của user

**Auth**: Required (JWT)

**Response**:
```json
{
  "success": true,
  "history": [
    {
      "id": "67a1b2c3...",
      "flashcard": {
        "id": "65a1b2c3...",
        "front": "Hello",
        "pronunciation": "/həˈloʊ/"
      },
      "accuracy": 100,
      "score": 10,
      "createdAt": "2025-11-08T10:30:00Z"
    }
  ],
  "stats": {
    "totalAttempts": 50,
    "averageAccuracy": 87.5,
    "perfectCount": 35,
    "improvementRate": 5.2
  }
}
```

---

#### **4. Get Dictation Statistics**

**Endpoint**: `GET /api/dictation/stats`

**Description**: Lấy thống kê tổng quan về dictation

**Auth**: Required (JWT)

**Response**:
```json
{
  "success": true,
  "stats": {
    "totalAttempts": 150,
    "averageAccuracy": 85.3,
    "perfectCount": 89,
    "mostDifficultWords": [
      { "word": "Massachusetts", "accuracy": 45.2 },
      { "word": "February", "accuracy": 62.1 }
    ],
    "progressByDay": [
      { "date": "2025-11-01", "attempts": 10, "avgAccuracy": 75 },
      { "date": "2025-11-02", "attempts": 12, "avgAccuracy": 82 }
    ],
    "timeSpent": 7200,
    "currentStreak": 7
  }
}
```

---

### **Speech Recognition Endpoints**

#### **1. Analyze Speech**

**Endpoint**: `POST /api/speech/analyze`

**Description**: Phân tích phát âm từ audio recording

**Auth**: Required (JWT)

**Request** (multipart/form-data):
- `audio`: Audio file (MP3/WAV/WebM, max 10MB)
- `flashcardId`: Flashcard ID (string)

**Response**:
```json
{
  "success": true,
  "analysis": {
    "transcription": "Hello",
    "expectedText": "Hello",
    "expectedIPA": "/həˈloʊ/",
    "pronunciationScore": 92,
    "confidenceScore": 0.95,
    "match": true,
    "ipaComparison": {
      "matched": ["/h/", "/ə/", "/l/", "/oʊ/"],
      "errors": []
    },
    "intonationAnalysis": {
      "pitch": "rising",
      "stress": [1],
      "speed": 120,
      "fluency": 88,
      "naturalness": 85
    },
    "feedback": [
      "✅ Excellent pronunciation!",
      "✅ Good intonation and stress pattern",
      "💡 Try to speak slightly slower for clarity"
    ],
    "audioUrl": "https://storage.googleapis.com/recordings/user123_1234567890.mp3"
  }
}
```

---

#### **2. Get Speech Feedback**

**Endpoint**: `GET /api/speech/feedback/:attemptId`

**Description**: Lấy feedback chi tiết cho một attempt

**Auth**: Required (JWT)

**Response**:
```json
{
  "success": true,
  "feedback": {
    "attemptId": "67a1b2c3...",
    "overallScore": 92,
    "strengths": [
      "Clear consonant sounds",
      "Good vowel pronunciation",
      "Natural speaking pace"
    ],
    "improvements": [
      {
        "area": "Stress Pattern",
        "current": 75,
        "target": 90,
        "tip": "Emphasize the first syllable more: HE-llo"
      },
      {
        "area": "Final Sound",
        "current": 80,
        "target": 95,
        "tip": "Make the 'o' sound longer and more rounded"
      }
    ],
    "phonemeBreakdown": [
      { "phoneme": "/h/", "score": 95, "status": "correct" },
      { "phoneme": "/ə/", "score": 90, "status": "correct" },
      { "phoneme": "/l/", "score": 88, "status": "minor_error" },
      { "phoneme": "/oʊ/", "score": 92, "status": "correct" }
    ],
    "comparisonAudio": {
      "userAudio": "https://...",
      "referenceAudio": "https://...",
      "sideBySideUrl": "https://..."
    }
  }
}
```

---

#### **3. Get Speech History**

**Endpoint**: `GET /api/speech/history?limit=20`

**Description**: Lấy lịch sử speech attempts

**Auth**: Required (JWT)

**Response**:
```json
{
  "success": true,
  "history": [
    {
      "id": "67a1b2c3...",
      "flashcard": {
        "front": "Hello",
        "pronunciation": "/həˈloʊ/"
      },
      "transcription": "Hello",
      "pronunciationScore": 92,
      "createdAt": "2025-11-08T10:30:00Z",
      "audioUrl": "https://..."
    }
  ],
  "stats": {
    "totalAttempts": 80,
    "averageScore": 87.2,
    "perfectCount": 45,
    "improvement": "+12% from last month"
  }
}
```

---

#### **4. Compare Pronunciation**

**Endpoint**: `POST /api/speech/compare`

**Description**: So sánh 2 recordings (user vs reference)

**Auth**: Required (JWT)

**Request**:
```json
{
  "userRecordingId": "67a1b2c3...",
  "referenceRecordingId": "68b2c3d4..."
}
```

**Response**:
```json
{
  "success": true,
  "comparison": {
    "similarityScore": 88,
    "differences": [
      {
        "timestamp": 0.5,
        "phoneme": "/l/",
        "userScore": 85,
        "referenceScore": 95,
        "difference": -10,
        "note": "Try to touch your tongue to the roof of your mouth"
      }
    ],
    "waveformComparison": {
      "userWaveform": [...],
      "referenceWaveform": [...],
      "alignmentPoints": [...]
    }
  }
}
```

---

## Google Cloud Setup

### **Step 1: Create Google Cloud Project**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project: "English-Learning-App"
3. Enable APIs:
   - **Cloud Speech-to-Text API**
   - **Cloud Text-to-Speech API**

### **Step 2: Create Service Account**

1. Go to **IAM & Admin** → **Service Accounts**
2. Create service account: `speech-service`
3. Grant roles:
   - **Cloud Speech Client**
   - **Cloud Text-to-Speech Client**
4. Create key → Download JSON

### **Step 3: Setup Environment Variables**

```bash
# .env
GOOGLE_APPLICATION_CREDENTIALS='{"type":"service_account","project_id":"...","private_key":"..."}'
GOOGLE_CLOUD_PROJECT_ID='your-project-id'
GOOGLE_CLOUD_BUCKET='your-audio-bucket'

# Optional: Web Speech API fallback
USE_WEB_SPEECH_API=false
```

### **Step 4: Test API**

```bash
# Test Speech-to-Text
curl -X POST \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "encoding": "LINEAR16",
      "sampleRateHertz": 16000,
      "languageCode": "en-US"
    },
    "audio": {
      "uri": "gs://your-bucket/test.wav"
    }
  }' \
  "https://speech.googleapis.com/v1/speech:recognize"
```

---

## Frontend Integration

### **Example 1: Dictation Component**

```jsx
import React, { useState, useRef } from 'react';
import axios from 'axios';

const DictationExercise = ({ flashcardId }) => {
  const [exercise, setExercise] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  // Start exercise
  const startExercise = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`/api/dictation/start/${flashcardId}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setExercise(res.data.exercise);
      setResult(null);
      setUserAnswer('');
    } catch (error) {
      console.error('Start error:', error);
      alert('Cannot start dictation');
    } finally {
      setLoading(false);
    }
  };

  // Play audio
  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  // Submit answer
  const submitAnswer = async () => {
    if (!userAnswer.trim()) {
      alert('Please enter your answer');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/dictation/submit', {
        flashcardId: exercise.flashcardId,
        userAnswer,
        timeTaken: 30,
        hintsUsed: 0
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setResult(res.data.result);
    } catch (error) {
      console.error('Submit error:', error);
      alert('Submission failed');
    } finally {
      setLoading(false);
    }
  };

  // Render answer with highlights
  const renderAnswer = () => {
    if (!result) return null;

    const { correctAnswer, userAnswer, mistakePositions } = result;
    
    return (
      <div className="answer-comparison">
        <div className="correct-answer">
          <strong>Correct:</strong> {correctAnswer}
        </div>
        <div className="user-answer">
          <strong>Your answer:</strong>{' '}
          {userAnswer.split('').map((char, idx) => (
            <span
              key={idx}
              className={mistakePositions.includes(idx) ? 'mistake' : 'correct'}
            >
              {char}
            </span>
          ))}
        </div>
        <div className="accuracy">
          Accuracy: {result.accuracy}%
        </div>
      </div>
    );
  };

  return (
    <div className="dictation-exercise">
      <h2>Dictation Exercise</h2>

      {!exercise ? (
        <button onClick={startExercise} disabled={loading}>
          {loading ? 'Loading...' : 'Start Exercise'}
        </button>
      ) : (
        <div className="exercise-container">
          {/* Audio Player */}
          <div className="audio-player">
            <audio
              ref={audioRef}
              src={exercise.audioUrl}
              onEnded={() => setPlaying(false)}
            />
            <button onClick={playAudio} disabled={playing}>
              {playing ? '🔊 Playing...' : '▶️ Play Audio'}
            </button>
            <p>Duration: {exercise.duration}s</p>
          </div>

          {/* Input */}
          {!result && (
            <div className="input-section">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type what you hear..."
                onKeyPress={(e) => e.key === 'Enter' && submitAnswer()}
              />
              <button onClick={submitAnswer} disabled={loading}>
                {loading ? 'Checking...' : 'Submit'}
              </button>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="result-section">
              {renderAnswer()}
              
              {/* Feedback */}
              <div className="feedback">
                <p>{result.feedback}</p>
                <p>Score: {result.score} points</p>
              </div>

              {/* Mistakes */}
              {result.mistakeDetails.length > 0 && (
                <div className="mistakes">
                  <h4>Mistakes:</h4>
                  <ul>
                    {result.mistakeDetails.map((mistake, idx) => (
                      <li key={idx}>
                        Position {mistake.position}: Expected "{mistake.expected}", got "{mistake.actual}"
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Try Again */}
              <button onClick={startExercise}>Try Again</button>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .mistake {
          color: red;
          background: #ffebee;
          padding: 2px 4px;
          border-radius: 3px;
        }
        .correct {
          color: green;
        }
        .audio-player button {
          padding: 10px 20px;
          background: #2196f3;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default DictationExercise;
```

---

### **Example 2: Speech Recognition Component**

```jsx
import React, { useState, useRef } from 'react';
import axios from 'axios';

const SpeechRecognition = ({ flashcard }) => {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (error) {
      console.error('Microphone error:', error);
      alert('Cannot access microphone');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  // Analyze pronunciation
  const analyzePronunciation = async () => {
    if (!audioBlob) {
      alert('Please record first');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('flashcardId', flashcard._id);

      const res = await axios.post('/api/speech/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setAnalysis(res.data.analysis);
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  // Render pronunciation score with color
  const renderScore = (score) => {
    let color = 'red';
    if (score >= 90) color = 'green';
    else if (score >= 70) color = 'orange';

    return (
      <div className="score" style={{ color }}>
        <h2>{score}/100</h2>
        <p>{score >= 90 ? 'Excellent!' : score >= 70 ? 'Good!' : 'Keep practicing!'}</p>
      </div>
    );
  };

  return (
    <div className="speech-recognition">
      <h2>Pronunciation Practice</h2>

      {/* Flashcard Info */}
      <div className="flashcard-info">
        <h3>{flashcard.front}</h3>
        <p className="ipa">{flashcard.pronunciation || 'No IPA available'}</p>
        {flashcard.audioUrl && (
          <audio controls src={flashcard.audioUrl}>
            Your browser doesn't support audio.
          </audio>
        )}
      </div>

      {/* Recording Controls */}
      <div className="recording-controls">
        {!recording ? (
          <button onClick={startRecording} className="btn-record">
            🎤 Start Recording
          </button>
        ) : (
          <button onClick={stopRecording} className="btn-stop">
            ⏹ Stop Recording
          </button>
        )}

        {audioBlob && !recording && (
          <div className="audio-preview">
            <audio controls src={URL.createObjectURL(audioBlob)} />
            <button onClick={analyzePronunciation} disabled={loading}>
              {loading ? 'Analyzing...' : '✓ Analyze Pronunciation'}
            </button>
          </div>
        )}
      </div>

      {/* Analysis Result */}
      {analysis && (
        <div className="analysis-result">
          {/* Score */}
          {renderScore(analysis.pronunciationScore)}

          {/* Transcription */}
          <div className="transcription">
            <h4>What you said:</h4>
            <p className="user-text">{analysis.transcription}</p>
            <p className="expected-text">Expected: {analysis.expectedText}</p>
            {analysis.match ? (
              <span className="match-badge">✓ Perfect match!</span>
            ) : (
              <span className="no-match-badge">✗ Not quite</span>
            )}
          </div>

          {/* IPA Comparison */}
          <div className="ipa-comparison">
            <h4>Phoneme Analysis:</h4>
            <div className="phonemes">
              {analysis.ipaComparison.matched.map((phoneme, idx) => (
                <span key={idx} className="phoneme correct">
                  {phoneme}
                </span>
              ))}
              {analysis.ipaComparison.errors.map((error, idx) => (
                <span key={idx} className="phoneme error" title={`Expected: ${error.expected}`}>
                  {error.phoneme}
                </span>
              ))}
            </div>
          </div>

          {/* Intonation */}
          <div className="intonation">
            <h4>Intonation & Fluency:</h4>
            <p>Pitch: {analysis.intonationAnalysis.pitch}</p>
            <p>Speed: {analysis.intonationAnalysis.speed} WPM</p>
            <p>Fluency: {analysis.intonationAnalysis.fluency}/100</p>
          </div>

          {/* Feedback */}
          <div className="feedback">
            <h4>Feedback:</h4>
            <ul>
              {analysis.feedback.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Try Again */}
          <button onClick={() => {
            setAudioBlob(null);
            setAnalysis(null);
          }}>
            🔄 Try Again
          </button>
        </div>
      )}

      <style jsx>{`
        .btn-record {
          background: #4caf50;
          color: white;
          padding: 15px 30px;
          border: none;
          border-radius: 50px;
          font-size: 18px;
          cursor: pointer;
          animation: pulse 2s infinite;
        }
        .btn-stop {
          background: #f44336;
          color: white;
          padding: 15px 30px;
          border: none;
          border-radius: 50px;
          font-size: 18px;
          cursor: pointer;
        }
        .phoneme {
          display: inline-block;
          margin: 5px;
          padding: 5px 10px;
          border-radius: 5px;
        }
        .phoneme.correct {
          background: #c8e6c9;
          color: #2e7d32;
        }
        .phoneme.error {
          background: #ffcdd2;
          color: #c62828;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default SpeechRecognition;
```

---

## Audio Processing Guide

### **1. Recording Audio in Browser**

```javascript
// Record audio using MediaRecorder API
const recordAudio = async (duration = 5000) => {
  const stream = await navigator.mediaDevices.getUserMedia({ 
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      sampleRate: 16000
    } 
  });

  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'audio/webm;codecs=opus'
  });

  const chunks = [];
  mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

  mediaRecorder.start();

  // Stop after duration
  setTimeout(() => {
    mediaRecorder.stop();
    stream.getTracks().forEach(track => track.stop());
  }, duration);

  return new Promise((resolve) => {
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      resolve(blob);
    };
  });
};

// Usage
const audioBlob = await recordAudio(5000); // 5 seconds
```

### **2. Audio Format Conversion**

```javascript
// Convert WebM to WAV (if needed)
const convertToWAV = async (webmBlob) => {
  const audioContext = new AudioContext();
  const arrayBuffer = await webmBlob.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  // Create WAV file
  const wavBlob = audioBufferToWav(audioBuffer);
  return wavBlob;
};

// Helper function
const audioBufferToWav = (buffer) => {
  const numberOfChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  // ... WAV encoding logic
  // (Use library like 'audiobuffer-to-wav' for production)
};
```

### **3. Audio Upload with Progress**

```javascript
const uploadAudio = async (audioBlob, flashcardId, onProgress) => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');
  formData.append('flashcardId', flashcardId);

  const response = await axios.post('/api/speech/analyze', formData, {
    headers: { 
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`
    },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      onProgress(percentCompleted);
    }
  });

  return response.data;
};
```

---

## Testing Guide

### **Test Dictation**

```bash
# 1. Start dictation
curl -X POST http://localhost:1124/api/dictation/start/FLASHCARD_ID \
  -H "Authorization: Bearer TOKEN"

# 2. Submit answer
curl -X POST http://localhost:1124/api/dictation/submit \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "flashcardId": "FLASHCARD_ID",
    "userAnswer": "Hello",
    "timeTaken": 15,
    "hintsUsed": 0
  }'

# 3. Get history
curl -X GET http://localhost:1124/api/dictation/history?limit=10 \
  -H "Authorization: Bearer TOKEN"
```

### **Test Speech Recognition**

```bash
# 1. Analyze speech (with audio file)
curl -X POST http://localhost:1124/api/speech/analyze \
  -H "Authorization: Bearer TOKEN" \
  -F "audio=@recording.webm" \
  -F "flashcardId=FLASHCARD_ID"

# 2. Get speech history
curl -X GET http://localhost:1124/api/speech/history?limit=10 \
  -H "Authorization: Bearer TOKEN"

# 3. Get feedback
curl -X GET http://localhost:1124/api/speech/feedback/ATTEMPT_ID \
  -H "Authorization: Bearer TOKEN"
```

---

## Error Handling

### **Common Errors**

| Error Code | Message | Cause | Solution |
|------------|---------|-------|----------|
| **400** | Invalid audio format | File không phải audio | Use MP3/WAV/WebM |
| **403** | Microphone permission denied | User chưa cho phép mic | Request permission |
| **413** | Audio file too large | File > 10MB | Limit recording time |
| **500** | Speech API error | Google API quota exceeded | Check API quota |
| **503** | TTS service unavailable | External service down | Use fallback TTS |

---

## Performance Optimization

### **Audio Optimization**
- **Compression**: Use Opus codec (best quality/size ratio)
- **Sample Rate**: 16kHz sufficient for speech
- **Bitrate**: 32kbps for speech, 128kbps for music
- **Max Duration**: Limit to 30 seconds
- **Streaming**: Use chunked upload for large files

### **API Optimization**
- **Caching**: Cache TTS audio for common words
- **Batch Processing**: Process multiple recordings together
- **CDN**: Serve audio files via CDN
- **Lazy Loading**: Load audio on-demand

---

## Best Practices

### **Dictation Best Practices**
1. **Progressive Difficulty**: Start với từ đơn giản → câu phức tạp
2. **Hint System**: Cung cấp hints sau 2 attempts sai
3. **Repeat Audio**: Cho phép nghe lại nhiều lần
4. **Spell Check**: Use fuzzy matching để chấp nhận lỗi nhỏ
5. **Time Limit**: Set thời gian để tạo thử thách

### **Speech Recognition Best Practices**
1. **Noise Reduction**: Enable noise suppression trong recording
2. **Clear Feedback**: Highlight phonemes sai rõ ràng
3. **Native Comparison**: So sánh với native speaker audio
4. **Practice Mode**: Cho phép luyện tập không giới hạn
5. **Progress Tracking**: Visualize improvement over time

---

## Security Considerations

1. **Audio Privacy**: Không lưu trữ recordings quá 30 ngày
2. **API Key Security**: Không expose Google API keys
3. **Rate Limiting**: Limit 100 requests/hour/user
4. **File Validation**: Validate audio format và size
5. **HTTPS Only**: Chỉ accept recordings qua HTTPS

---

## Future Enhancements

- [ ] **Real-time Feedback**: Live pronunciation feedback khi đang nói
- [ ] **Accent Training**: Specific training cho US/UK/AU accents
- [ ] **Sentence Stress**: Visual stress pattern overlay
- [ ] **Peer Comparison**: So sánh với learners khác
- [ ] **AI Coach**: AI-powered personalized feedback
- [ ] **Gamification**: Badges, streaks, challenges
- [ ] **Offline Mode**: Offline speech recognition fallback
- [ ] **Video Lip Reading**: Analyze mouth movements

---

## Complete Checklist

### **Backend**
- [x] DictationAttempt model
- [x] SpeechAttempt model
- [x] Dictation service
- [x] Speech service
- [x] Dictation controller
- [x] Speech controller
- [x] Audio upload middleware
- [x] Routes registered
- [x] Google Cloud setup

### **Frontend Tasks**
- [ ] Dictation component
- [ ] Speech recorder component
- [ ] Waveform visualization
- [ ] Real-time feedback UI
- [ ] Audio player controls
- [ ] Microphone permission handler
- [ ] Progress tracker

### **Testing**
- [ ] Test dictation flow
- [ ] Test speech recording
- [ ] Test Google Speech API
- [ ] Test accuracy calculation
- [ ] Test error handling
- [ ] Test audio upload
- [ ] Performance testing

---

## Changelog

**Version 1.0** (2025-11-08)
- ✅ Initial implementation of Task 27
- ✅ Dictation exercise system
- ✅ Speech recognition with IPA comparison
- ✅ Google Cloud Speech/TTS integration
- ✅ Audio upload and processing
- ✅ Comprehensive documentation

---

**Task 27: Dictation & Speech Recognition Implementation Complete! 🎉**

Total Features: 2 major features (Dictation + Speech Recognition)
Total Endpoints: 8 endpoints
Backend Status: ✅ **READY FOR TESTING**
