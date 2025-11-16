# 🍰 Cake-Style Speaking Practice - Complete Guide

## 📋 Tổng quan

Hệ thống Cake-Style Speaking Practice cho phép học sinh luyện phát âm theo **từng câu một** với phụ đề song ngữ **(English + Vietnamese)**, nhận điểm ngay lập tức cho mỗi câu, và theo dõi tiến độ chi tiết.

## ✨ Tính năng chính

### 1. **Sentence-by-Sentence Practice**
- Hiển thị 1 câu tại 1 thời điểm
- Phụ đề song ngữ (English + Vietnamese)
- Thu âm và chấm điểm riêng cho từng câu
- Tiến độ qua từng câu (1/10, 2/10, ...)

### 2. **Real-Time Scoring**
- **Accuracy Score** (50%): Độ chính xác từng từ
- **Pronunciation Score** (30%): Phát âm
- **Fluency Score** (20%): Độ lưu loát
- **Overall Score**: Tổng điểm tổng hợp

### 3. **Word-Level Feedback**
- ✅ **Correct** (green): Từ phát âm đúng (≥80%)
- ⚠️ **Partial** (orange): Từ gần đúng (50-79%)
- ❌ **Incorrect** (red): Từ sai (<50%)

### 4. **Progress Tracking**
- Danh sách tất cả câu trong video
- Trạng thái hoàn thành cho mỗi câu
- Điểm cao nhất (best score) mỗi câu
- Rating 1-3 sao dựa trên điểm
- Tổng tiến độ % cho video

### 5. **Flexible Practice Flow**
- Try again: Luyện lại câu hiện tại
- Next sentence: Chuyển sang câu tiếp theo
- Jump to any sentence: Click vào danh sách câu

---

## 🏗️ Cấu trúc hệ thống

### Backend

#### Models

**SpeakingVideo** (`backend/src/models/SpeakingVideo.js`)
```javascript
{
  title: String,
  description: String,
  videoUrl: String,
  sentences: [{
    order: Number,
    english: String,      // Câu tiếng Anh
    vietnamese: String,   // Dịch tiếng Việt
    startTime: Number,    // Thời gian bắt đầu (giây)
    endTime: Number       // Thời gian kết thúc (giây)
  }],
  level: String,         // beginner, intermediate, advanced
  category: String,      // conversation, pronunciation, vocabulary, etc.
  practiceMode: String   // 'sentence' cho Cake-style
}
```

**SpeakingAttempt** (`backend/src/models/SpeakingAttempt.js`)
```javascript
{
  user: ObjectId,
  video: ObjectId,
  attemptType: String,   // 'sentence' cho Cake-style
  sentenceIndex: Number, // Index câu đang luyện
  originalSentence: String,
  audioUrl: String,
  transcription: String,
  accuracyScore: Number,
  pronunciationScore: Number,
  fluencyScore: Number,
  overallScore: Number,
  comparison: {
    correctWords: Number,
    totalWords: Number,
    similarityPercentage: Number,
    wordScores: [{
      word: String,
      score: Number,
      status: String  // 'correct', 'partial', 'incorrect'
    }]
  },
  feedback: String,
  xpEarned: Number,
  status: String  // 'processing', 'completed', 'failed'
}
```

#### Controllers

**cakeSpeakingController.js** - 3 endpoints chính:

1. **Submit Sentence** - `POST /api/speaking/cake/submit-sentence`
```javascript
Body: { videoId, sentenceIndex }
File: audio (multipart/form-data)
Response: { success, message, data: { attemptId } }
```

2. **Get Progress** - `GET /api/speaking/cake/progress/:videoId`
```javascript
Response: {
  videoId,
  videoTitle,
  sentenceProgress: [{
    sentenceIndex,
    english,
    vietnamese,
    completed,
    bestScore,
    stars  // 1-3 based on score
  }],
  stats: {
    totalSentences,
    completedSentences,
    overallProgress,
    averageScore
  }
}
```

3. **Create Video with Sentences** - `POST /api/speaking/cake/create-with-sentences` (Admin)
```javascript
Body: {
  title,
  description,
  videoUrl,
  sentences: [{ english, vietnamese, startTime, endTime }],
  level,
  category
}
```

#### Services

**Scoring Algorithm** (`calculateSentenceScore`):
1. Normalize text (lowercase, remove punctuation)
2. Split into words
3. Compare word-by-word using string-similarity
4. Calculate:
   - Word-level scores (0-100%)
   - Overall similarity percentage
   - Correct/partial/incorrect status per word
5. Generate feedback based on overall score

---

### Frontend

#### Pages

**CakeSpeakingPractice.jsx** - Main practice page
- Path: `/speaking/cake/:id`
- Features:
  - Video player with YouTube embed
  - Current sentence display (bilingual)
  - Progress bar (% completed)
  - Record button with timer
  - Audio preview player
  - Real-time score display
  - Word-by-word feedback visualization
  - Sentence list with completion status

**SpeakingVideos.jsx** - Video list (updated)
- Path: `/speaking`
- Shows 2 buttons per video:
  - 🍰 **Cake Style** → `/speaking/cake/:id`
  - 🎤 **Full Transcript** → `/speaking/:id`

#### Services

**speakingService.js** - API wrapper functions:
```javascript
- getCakeProgress(videoId)
- submitSentenceAudio(videoId, sentenceIndex, audioBlob)
- getAttemptResult(attemptId)
```

---

## 🎨 UI Components

### 1. Progress Bar
- Top of page
- Shows: "X% hoàn thành"
- Green fill animation

### 2. Sentence Card
- Purple gradient when active
- Shows: "Câu X / Y"
- English sentence (large, bold)
- Vietnamese translation (italic, smaller)

### 3. Record Button
- 140px circular button
- Green → 🎤 (ready to record)
- Red → ⏹ (recording)
- Pulse animation when recording
- Timer display below

### 4. Score Result Card
- Purple gradient background
- Large score number (5rem)
- Feedback message
- 3-column breakdown (Accuracy, Pronunciation, Fluency)
- Word-by-word comparison with color coding

### 5. Sentence List
- Scrollable list below practice area
- Each item shows:
  - English + Vietnamese text
  - Completion status (green background)
  - Best score + star rating
  - Click to jump to that sentence

---

## 📊 Scoring System

### Score Ranges & Feedback
- **95-100%**: 🎉 Perfect! Phát âm xuất sắc!
- **85-94%**: 👏 Excellent! Rất tốt!
- **70-84%**: 👍 Good! Khá tốt, hãy tiếp tục!
- **50-69%**: 💪 Keep trying! Cố gắng thêm nhé!
- **0-49%**: 📚 Try again! Hãy nghe lại và thử lại!

### Star Rating
- ⭐⭐⭐ (3 stars): Score ≥ 90%
- ⭐⭐ (2 stars): Score 75-89%
- ⭐ (1 star): Score < 75%

### XP Rewards
- XP per sentence = `max(5, round(overallScore / 5))`
- Example: 85% score → 17 XP

---

## 🔄 User Flow

1. **Video List** (`/speaking`)
   - User chọn video
   - Click "🍰 Cake Style" button

2. **Practice Page** (`/speaking/cake/:id`)
   - Load video + progress data
   - Display first incomplete sentence
   - User clicks 🎤 to start recording

3. **Recording**
   - Timer starts
   - Red pulse animation
   - Click ⏹ to stop

4. **Preview**
   - Audio player appears
   - User can listen back
   - Options: 🔄 Try again | ✅ Submit

5. **Processing**
   - Show "⏳ Đang xử lý..."
   - Backend transcribes audio
   - Calculate scores
   - Store in database

6. **Result Display**
   - Score card animation
   - Word-by-word comparison
   - Feedback message
   - Options: 🔄 Try again | ➡️ Next sentence

7. **Progress**
   - Mark sentence as completed
   - Update progress bar
   - Move to next sentence or finish

---

## 🔧 Setup & Testing

### 1. Seed Sample Data
```bash
cd backend
node scripts/seedSpeakingVideos.js
```

### 2. Test API Endpoints

**Get Progress:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:1124/api/speaking/cake/progress/VIDEO_ID
```

**Submit Sentence:**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "videoId=VIDEO_ID" \
  -F "sentenceIndex=0" \
  -F "audio=@recording.webm" \
  http://localhost:1124/api/speaking/cake/submit-sentence
```

**Get Attempt Result:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:1124/api/speaking/attempts/ATTEMPT_ID
```

### 3. Frontend Test Flow
1. Login as student
2. Navigate to `/speaking`
3. Select video with bilingual sentences
4. Click "🍰 Cake Style"
5. Grant microphone permission
6. Record first sentence
7. Wait for score
8. Try "Next sentence" button
9. Check sentence list
10. Jump to different sentence

---

## 🎯 Key Differences: Cake vs Full Transcript

| Feature | Cake Style | Full Transcript |
|---------|-----------|----------------|
| **Practice Unit** | Single sentence | Entire transcript |
| **Display** | One sentence + translation | Full transcript only |
| **Recording** | Per sentence | One full recording |
| **Scoring** | Immediate per sentence | After full completion |
| **Feedback** | Word-level visualization | Overall score only |
| **Progress** | Sentence-by-sentence tracking | Video completion only |
| **XP** | 5-20 XP per sentence | 50-100 XP per video |
| **User Experience** | Interactive, step-by-step | Single long practice |

---

## 📝 Admin: Creating Cake-Style Videos

### Manual via API
```javascript
POST /api/speaking/cake/create-with-sentences
{
  "title": "Daily Conversation - At the Restaurant",
  "description": "Learn common phrases for ordering food",
  "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
  "level": "beginner",
  "category": "conversation",
  "sentences": [
    {
      "english": "Good evening, table for two please.",
      "vietnamese": "Chào buổi tối, xin cho 2 người.",
      "startTime": 5,
      "endTime": 8
    },
    {
      "english": "Can I see the menu?",
      "vietnamese": "Cho tôi xem thực đơn được không?",
      "startTime": 10,
      "endTime": 12
    }
  ]
}
```

### Via Admin UI (Upcoming)
- AdminSpeakingVideos.jsx cần update để:
  - Input array of sentences
  - Add/remove sentence rows dynamically
  - Fields: English, Vietnamese, Start Time, End Time

---

## 🐛 Troubleshooting

### Issue: Progress không cập nhật
**Solution**: Kiểm tra API `/api/speaking/cake/progress/:videoId` trả về đúng sentenceProgress array

### Issue: Audio không ghi được
**Solution**: 
- Check browser microphone permissions
- Ensure HTTPS hoặc localhost
- Verify MediaRecorder API support

### Issue: Điểm luôn là 0
**Solution**:
- Kiểm tra `speechService.transcribeAudio()` hoạt động
- Log `calculateSentenceScore()` input/output
- Verify string-similarity package installed

### Issue: Sentence index sai
**Solution**: Backend kiểm tra `sentenceIndex < video.sentences.length`

---

## 🚀 Future Enhancements

1. **Slow-motion playback** - Phát chậm câu hiện tại
2. **Loop sentence** - Repeat câu nhiều lần
3. **Hide Vietnamese** - Practice mode không hiển thị dịch
4. **Speak along** - Ghi âm đồng thời với video
5. **Pronunciation heatmap** - Highlight từ khó trong câu
6. **Sentence favorites** - Bookmark câu khó để luyện lại
7. **Daily challenge** - Random 5 câu mỗi ngày
8. **Streak tracking** - Streak cho Cake practice

---

## 📚 Related Documentation

- `/backend/docs/SPEAKING_FEATURE_SUMMARY.md` - Full system overview
- `/backend/docs/SPEAKING_VIDEO_GUIDE.md` - Admin guide for video management
- `/backend/docs/TESTING_SPEECH_AUDIO.md` - Audio testing guide
- `/SPEAKING_README.md` - Project-level speaking feature docs

---

## ✅ Completion Checklist

**Backend:**
- [x] SpeakingVideo model with sentences array
- [x] SpeakingAttempt model with sentence attempts
- [x] cakeSpeakingController with 3 endpoints
- [x] Routes registered in speakingRoutes.js
- [x] Scoring algorithm with word-level comparison
- [x] Progress tracking per sentence

**Frontend:**
- [x] CakeSpeakingPractice.jsx with full UI
- [x] speakingService.js API functions
- [x] App.js route: `/speaking/cake/:id`
- [x] SpeakingVideos.jsx dual buttons
- [x] Toast notifications
- [x] Loading states
- [x] Error handling

**Pending:**
- [ ] Update AdminSpeakingVideos.jsx for sentence input
- [ ] Update seedSpeakingVideos.js with bilingual data
- [ ] Add tests for Cake-style endpoints
- [ ] Performance optimization for large sentence arrays

---

**Last Updated**: 2024-01-XX  
**Status**: ✅ **Production Ready** (Frontend & Backend Complete)
