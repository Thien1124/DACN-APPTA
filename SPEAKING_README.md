# 🎙️ Speaking Video & Shadowing Practice Feature

## 📖 Tổng quan

Tính năng cho phép Admin upload video tiếng Anh kèm transcript, và học sinh xem video, thu âm đọc lại, nhận điểm đánh giá độ chính xác phát âm.

**Workflow**:
1. Admin upload video + transcript
2. Học sinh xem video và đọc theo
3. Thu âm giọng nói
4. Hệ thống tự động chấm điểm (0-100%)
5. Hiển thị feedback chi tiết và so sánh văn bản

---

## 🚀 Quick Start

### 1. Seed sample data
```bash
cd backend
node scripts/seedSpeakingVideos.js
```

### 2. Test Admin
```
URL: /admin/speaking-videos
Login với admin account
- Xem 10 sample videos
- Tạo/Sửa/Xóa video
- Toggle active/inactive
```

### 3. Test Student
```
URL: /speaking
Login với user account
- Browse videos
- Click vào video để practice
- Thu âm và nhận điểm
```

---

## 📂 Cấu trúc Files

### Backend
```
src/
├── models/
│   ├── SpeakingVideo.js          # Model video
│   └── SpeakingAttempt.js        # Model bài thu âm
├── controllers/
│   ├── speakingVideoController.js    # CRUD video (7 APIs)
│   └── speakingAttemptController.js  # Submit & scoring (4 APIs)
├── routes/
│   └── speakingRoutes.js         # Routes /api/speaking/*
└── services/
    └── speechService.js          # Speech-to-Text (cần implement)

uploads/
└── speaking/                     # Audio files storage

scripts/
└── seedSpeakingVideos.js        # Seed 10 sample videos
```

### Frontend
```
src/pages/
├── AdminSpeakingVideos.jsx      # Admin management page
├── SpeakingVideos.jsx            # Student list page
└── SpeakingPractice.jsx          # Practice & recording page
```

---

## 🔌 API Endpoints

### Admin APIs
```
POST   /api/speaking/videos              Create video
GET    /api/speaking/videos/admin        Get all (admin)
PUT    /api/speaking/videos/:id          Update
DELETE /api/speaking/videos/:id          Delete
```

### User APIs
```
GET    /api/speaking/videos              List active videos
GET    /api/speaking/videos/:id          Get detail + attempts
POST   /api/speaking/attempts            Submit audio (multipart)
GET    /api/speaking/attempts/:id        Get result
GET    /api/speaking/attempts/my-attempts Get history
```

---

## 💾 Database Schema

### SpeakingVideo
```javascript
{
  title: String,              // "English Conversation"
  description: String,
  videoUrl: String,           // YouTube URL
  transcript: String,         // Text to read
  duration: Number,           // Seconds
  level: String,              // beginner|intermediate|advanced
  category: String,           // conversation|pronunciation|vocabulary
  thumbnailUrl: String,
  totalAttempts: Number,
  averageScore: Number,
  isActive: Boolean,
  uploadedBy: ObjectId(User),
  order: Number
}
```

### SpeakingAttempt
```javascript
{
  user: ObjectId(User),
  video: ObjectId(SpeakingVideo),
  audioUrl: String,           // /uploads/speaking/xxx.webm
  transcription: String,      // Recognized text
  accuracyScore: Number,      // 0-100
  pronunciationScore: Number,
  fluencyScore: Number,
  overallScore: Number,       // Weighted average
  comparison: {
    correctWords: Number,
    totalWords: Number,
    missedWords: [String],
    extraWords: [String],
    similarityPercentage: Number
  },
  feedback: String,           // Auto-generated
  xpEarned: Number,
  status: String,             // processing|completed|failed
  duration: Number
}
```

---

## 🎯 Features

### Admin Features
- ✅ Create/Edit/Delete videos
- ✅ Upload video URL (YouTube, Vimeo, etc.)
- ✅ Add transcript (text students read)
- ✅ Set level & category
- ✅ Toggle active/inactive
- ✅ View statistics (attempts, avg score)
- ✅ Search & filter

### Student Features
- ✅ Browse videos by level/category
- ✅ Watch video with embedded player
- ✅ View transcript
- ✅ **Record audio** with Web Audio API
- ✅ Timer display during recording
- ✅ Preview audio before submit
- ✅ **Auto-scoring system**:
  - Accuracy (40%): % correct words
  - Pronunciation (30%): Simulated
  - Fluency (30%): Simulated
- ✅ Detailed feedback
- ✅ Comparison: Original vs Recognized text
- ✅ XP rewards based on score
- ✅ Attempts history tracking
- ✅ Try again feature

---

## 🎨 UI/UX Highlights

### Admin Page
- Grid layout với video cards
- Filter dropdowns + search bar
- Modal form (Create/Edit)
- Beautiful stats display
- Smooth animations

### Practice Page
- Full-width video player
- Transcript panel
- **Prominent record button** (120px circle)
- Real-time timer
- Audio waveform preview
- **Result display**:
  - Large overall score
  - Breakdown cards
  - Feedback box
  - Text comparison
- Attempts history list

---

## 🔧 Setup & Configuration

### 1. Install Dependencies
```bash
cd backend
npm install string-similarity
```

### 2. Configure Speech-to-Text

Edit `backend/src/services/speechService.js`:

```javascript
// Option 1: Google Cloud Speech-to-Text
const speech = require('@google-cloud/speech');
const client = new speech.SpeechClient();

const transcribeAudio = async (audioPath) => {
  const file = fs.readFileSync(audioPath);
  const audioBytes = file.toString('base64');
  
  const request = {
    audio: { content: audioBytes },
    config: {
      encoding: 'WEBM_OPUS',
      sampleRateHertz: 48000,
      languageCode: 'en-US',
    },
  };
  
  const [response] = await client.recognize(request);
  const transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join(' ');
  
  return {
    success: true,
    text: transcription,
    duration: 0 // Calculate from audio
  };
};

// Option 2: AWS Transcribe, Azure Speech, AssemblyAI...
```

### 3. Environment Variables
```env
# Google Cloud
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# Or AWS
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=us-east-1
```

### 4. Seed Data
```bash
node backend/scripts/seedSpeakingVideos.js
```

---

## 🧪 Testing

### Manual Testing Flow

**Admin**:
1. Go to `/admin/speaking-videos`
2. Click "Tạo Video Mới"
3. Fill form:
   - Title: "Test Speaking"
   - Video URL: YouTube link
   - Transcript: "Hello world"
   - Level: Beginner
4. Submit → Video appears in grid

**Student**:
1. Go to `/speaking`
2. Click on a video card
3. Watch video
4. Click 🎤 microphone button
5. Speak into microphone
6. Click ⏹ stop button
7. Listen to preview
8. Click "Gửi và Chấm điểm"
9. Wait 2-10 seconds
10. See result with scores

### API Testing (Postman)

**Create Video**:
```http
POST /api/speaking/videos
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "title": "Test Video",
  "videoUrl": "https://youtube.com/watch?v=xxx",
  "transcript": "Hello world",
  "level": "beginner",
  "category": "conversation"
}
```

**Submit Audio**:
```http
POST /api/speaking/attempts
Authorization: Bearer {user_token}
Content-Type: multipart/form-data

videoId: {video_id}
audio: {audio_file}
```

---

## 📊 Scoring Algorithm

```javascript
// 1. Transcribe audio → text
const transcription = await speechService.transcribeAudio(audioPath);

// 2. Calculate accuracy
const accuracy = compareTwoStrings(original, transcription);
const accuracyScore = Math.round(accuracy * 100);

// 3. Calculate other scores (can be enhanced with specialized APIs)
const pronunciationScore = accuracyScore + random(0, 10);
const fluencyScore = accuracyScore + random(0, 15);

// 4. Overall score (weighted average)
const overallScore = 
  (accuracyScore * 0.4) + 
  (pronunciationScore * 0.3) + 
  (fluencyScore * 0.3);

// 5. Award XP
const xpEarned = Math.max(10, Math.round(overallScore / 2));
```

---

## 🎓 Educational Value

Students benefit from:
- **Listening comprehension** (watch video)
- **Reading practice** (follow transcript)
- **Speaking practice** (record audio)
- **Pronunciation feedback** (see scores)
- **Progress tracking** (attempts history)
- **Gamification** (XP rewards)

---

## 🔐 Security

- ✅ JWT authentication required
- ✅ Admin-only endpoints protected
- ✅ File upload validation (size, type)
- ✅ User can only view own attempts
- ✅ Rate limiting recommended
- ✅ Audio files stored securely

---

## 🐛 Known Issues & Limitations

1. **Speech Recognition**:
   - Requires API integration (not included)
   - Accuracy depends on audio quality
   - Background noise affects results

2. **Browser Compatibility**:
   - MediaRecorder API: Chrome 47+, Firefox 25+
   - Safari needs polyfill

3. **Performance**:
   - Large audio files (1-5 MB)
   - Processing time: 2-10 seconds
   - Concurrent uploads may slow server

---

## 🚀 Future Enhancements

1. **Advanced Scoring**:
   - Phoneme-level analysis
   - Intonation checking
   - Stress pattern detection

2. **More Features**:
   - Word-by-word highlighting
   - Slow playback mode
   - Practice hints
   - Difficult words bookmarking

3. **Social**:
   - Share recordings
   - Peer comparison
   - Challenges

4. **Analytics**:
   - Progress over time
   - Weak points identification
   - Personalized recommendations

---

## 📚 Documentation

- Full guide: `backend/docs/SPEAKING_VIDEO_GUIDE.md`
- Summary: `SPEAKING_FEATURE_SUMMARY.md`
- This file: `SPEAKING_README.md`

---

## ✅ Checklist

- [x] Backend models
- [x] Backend controllers & routes
- [x] Frontend admin page
- [x] Frontend student pages
- [x] Audio recording UI
- [x] Result display UI
- [x] Seed script
- [ ] Speech-to-Text integration (needs config)
- [ ] Production testing
- [ ] Performance optimization

---

## 🆘 Troubleshooting

**Problem**: Microphone not working
- Check browser permissions
- Try different browser
- Check system audio settings

**Problem**: Submit fails
- Check file size (< 10MB)
- Check network connection
- View console errors

**Problem**: Score always 0
- Speech service not configured
- Check `speechService.js`
- Test with mock data

**Problem**: Video not loading
- Check YouTube URL format
- Try different video
- Check CORS settings

---

## 📞 Support

For issues:
1. Check console logs (browser F12 & server terminal)
2. Review this README
3. Check `SPEAKING_VIDEO_GUIDE.md`
4. Test with seed data
5. Verify API endpoints with Postman

---

**Built with ❤️ for language learners**
