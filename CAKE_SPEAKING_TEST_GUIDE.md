# 🍰 HƯỚNG DẪN TEST CAKE-STYLE SPEAKING

## ✅ Đã hoàn tất

1. **Backend:**
   - ✅ Models với bilingual sentences
   - ✅ Controller Cake-style với 3 endpoints
   - ✅ Routes đã cấu hình
   - ✅ Seed script tạo 5 videos (33 câu tổng cộng)

2. **Frontend:**
   - ✅ CakeSpeakingPractice.jsx - Trang luyện tập
   - ✅ SpeakingVideos.jsx - Danh sách video (chỉ Cake-style)
   - ✅ Routes đã cập nhật: `/speaking/:id` → Cake practice
   - ✅ Xóa old SpeakingPractice page

3. **Data:**
   - ✅ 5 videos với bilingual sentences:
     - Basic English Greetings (8 câu)
     - Introducing Yourself (6 câu)  
     - Ordering Food at Restaurant (6 câu)
     - Daily Routines (7 câu)
     - Making Small Talk - Weather (6 câu)

---

## 🚀 CÁCH TEST

### 1. Truy cập trang Speaking
```
URL: http://localhost:3000/speaking
```

**Expected:**
- Tiêu đề: "🍰 Speaking Practice - Cake Style"
- Subtitle: "Luyện phát âm từng câu với phụ đề song ngữ..."
- 5 video cards với:
  - Thumbnail
  - Level badge (beginner/intermediate)
  - Category badge
  - Số lượng câu (ví dụ: "🎯 8 câu")
  - Nút "🍰 Bắt đầu luyện tập" (màu tím)

### 2. Chọn video để luyện tập
Click vào nút "🍰 Bắt đầu luyện tập" của video bất kỳ

**Expected:**
- Chuyển đến `/speaking/{videoId}`
- Hiển thị video YouTube embed
- Progress bar ở trên (0% hoàn thành lúc đầu)
- Current sentence hiển thị:
  - "Câu 1 / 8"
  - English text (lớn, bold)
  - Vietnamese translation (nhỏ hơn, italic)

### 3. Thu âm câu đầu tiên

**Bước 1: Click nút 🎤 (mic button)**
- Browser sẽ hỏi permission microphone → Click "Allow"
- Nút chuyển sang màu đỏ với icon ⏹
- Timer bắt đầu đếm: 00:00, 00:01, ...
- Text hiển thị: "🔴 Đang ghi âm..."

**Bước 2: Đọc câu tiếng Anh**
Ví dụ câu 1: "Hello! How are you today?"

**Bước 3: Click nút ⏹ để dừng**
- Recording dừng
- Audio player xuất hiện (có thể nghe lại)
- 2 nút hiển thị:
  - 🔄 Thử lại (record lại)
  - ✅ Gửi (submit để chấm điểm)

### 4. Submit và xem kết quả

**Click nút "✅ Gửi"**

**Expected:**
- Nút chuyển thành "⏳ Đang xử lý..."
- Backend xử lý:
  1. Transcribe audio (giả lập hoặc thật)
  2. So sánh với original sentence
  3. Tính điểm accuracy, pronunciation, fluency
  4. Tạo word-by-word comparison

**Sau ~2-3 giây, hiển thị kết quả:**
- **Score Card** (background tím gradient):
  - Điểm tổng lớn (ví dụ: "85%")
  - Feedback message (ví dụ: "👏 Excellent! Rất tốt!")
  - 3 cột breakdown:
    - Accuracy: X%
    - Pronunciation: Y%
    - Fluency: Z%

- **Word-by-word comparison:**
  - Mỗi từ được highlight màu:
    - ✅ Xanh lá: Đúng (≥80% similarity)
    - ⚠️ Cam: Gần đúng (50-79%)
    - ❌ Đỏ: Sai (<50%)
  - Hiển thị số từ đúng/tổng số từ

- **2 nút:**
  - 🔄 Thử lại câu này
  - ➡️ Câu tiếp theo

### 5. Tiếp tục với câu tiếp theo

**Click "➡️ Câu tiếp theo"**

**Expected:**
- Chuyển sang câu 2/8
- Result card biến mất
- Sentence card mới hiển thị câu 2
- Progress bar tăng lên (ví dụ: 12.5% nếu có 8 câu)
- Có thể record câu 2

### 6. Kiểm tra danh sách câu

**Scroll xuống phía dưới practice area**

**Expected:**
- Section "📋 Danh sách câu"
- List tất cả 8 câu:
  - Câu đã hoàn thành: background xanh lá, có điểm + sao
  - Câu chưa làm: background xám
  - Câu hiện tại: border xanh lá đậm
- Click vào câu bất kỳ → Jump to that sentence

### 7. Test jump to sentence

**Click vào câu số 5 trong danh sách**

**Expected:**
- Current sentence chuyển sang câu 5
- Sentence card update
- Có thể record câu 5
- Progress không đổi (chỉ tăng khi complete sentence)

### 8. Hoàn thành tất cả câu

**Lặp lại: Record → Submit → Next cho đến câu cuối cùng**

**Ở câu cuối cùng (8/8), sau khi có điểm:**
- Nút "➡️" đổi thành "🎉 Hoàn thành"
- Click → Toast message: "🎉 Hoàn thành - Bạn đã hoàn thành tất cả câu!"
- Redirect về `/speaking`

### 9. Kiểm tra progress persistence

**Quay lại video đã làm (click vào video đó lần 2)**

**Expected:**
- Progress bar hiển thị % đã làm
- Danh sách câu phía dưới:
  - Câu đã làm: có điểm + sao
  - Best score được lưu (nếu làm lại và điểm cao hơn thì update)
- Tự động nhảy đến câu chưa hoàn thành đầu tiên

---

## 🐛 TEST CASES

### TC1: Microphone Permission Denied
**Steps:**
1. Click 🎤
2. Click "Block" khi browser hỏi permission

**Expected:**
- Toast error: "Không thể bắt đầu ghi âm"
- Recording không bắt đầu

### TC2: Submit Without Recording
**Steps:**
1. Không click mic
2. Click "✅ Gửi"

**Expected:**
- Toast error: "Vui lòng thu âm trước khi gửi"

### TC3: Try Again
**Steps:**
1. Record một câu
2. Click "🔄 Thử lại"

**Expected:**
- Audio player biến mất
- Có thể record lại
- Không submit lần record cũ

### TC4: Network Error
**Steps:**
1. Tắt backend server
2. Submit audio

**Expected:**
- Toast error: "Không thể gửi bài speaking"
- Status không thay đổi

### TC5: Empty Video List
**Steps:**
1. Xóa tất cả videos trong DB
2. Truy cập `/speaking`

**Expected:**
- Empty state hiển thị:
  - "🎥 Chưa có video nào"
  - "Video speaking sẽ sớm được cập nhật"

---

## 📊 API ENDPOINTS TO TEST

### 1. Get All Videos
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:1124/api/speaking/videos
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "videos": [
      {
        "_id": "...",
        "title": "Basic English Greetings",
        "sentences": [
          { "order": 0, "english": "...", "vietnamese": "..." }
        ],
        "level": "beginner",
        "category": "conversation"
      }
    ]
  }
}
```

### 2. Get Video Progress
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:1124/api/speaking/cake/progress/VIDEO_ID
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "sentenceProgress": [
      {
        "sentenceIndex": 0,
        "english": "Hello! How are you today?",
        "vietnamese": "Xin chào! Hôm nay bạn thế nào?",
        "completed": true,
        "bestScore": 85,
        "stars": 2
      }
    ],
    "stats": {
      "totalSentences": 8,
      "completedSentences": 3,
      "overallProgress": 37,
      "averageScore": 82
    }
  }
}
```

### 3. Submit Sentence Audio
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "videoId=VIDEO_ID" \
  -F "sentenceIndex=0" \
  -F "audio=@test.webm" \
  http://localhost:1124/api/speaking/cake/submit-sentence
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Đang xử lý audio của bạn...",
  "data": { "attemptId": "..." }
}
```

### 4. Get Attempt Result
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:1124/api/speaking/attempts/ATTEMPT_ID
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "attempt": {
      "overallScore": 85,
      "accuracyScore": 80,
      "pronunciationScore": 88,
      "fluencyScore": 87,
      "feedback": "👏 Excellent! Rất tốt!",
      "comparison": {
        "wordScores": [
          { "word": "hello", "score": 95, "status": "correct" }
        ],
        "correctWords": 4,
        "totalWords": 5
      },
      "status": "completed"
    }
  }
}
```

---

## 🎯 EXPECTED BEHAVIOR

### Scoring System
- **95-100%**: 🎉 Perfect! (3 sao)
- **85-94%**: 👏 Excellent! (3 sao)
- **75-84%**: 👍 Good! (2 sao)
- **50-74%**: 💪 Keep trying! (1 sao)
- **0-49%**: 📚 Try again! (1 sao)

### XP Rewards
- Mỗi câu: 5-20 XP (dựa trên điểm)
- Ví dụ: 85% → 17 XP

### Progress Calculation
- Overall progress = (completedSentences / totalSentences) × 100
- Average score = sum(bestScores) / completedSentences

---

## 🔍 DEBUG TIPS

### Check Backend Logs
```bash
# Terminal backend
# Xem logs khi submit audio:
[INFO] Processing sentence audio for attempt ...
[SUCCESS] Processed sentence attempt ... - Score: 85
```

### Check MongoDB Data
```bash
# Mongo shell
use dacn_appta

# Xem videos
db.speakingvideos.find({}, {title:1, sentences:1}).pretty()

# Xem attempts
db.speakingattempts.find({}, {
  sentenceIndex:1, 
  overallScore:1, 
  status:1
}).sort({createdAt:-1}).limit(5)
```

### Check Browser Console
```javascript
// Kiểm tra state
console.log('Current sentence:', currentSentenceIndex)
console.log('Audio blob:', audioBlob)
console.log('Result:', result)
```

---

## ✅ SUCCESS CRITERIA

Hệ thống hoạt động đúng nếu:

1. ✅ Danh sách video hiển thị với bilingual sentence count
2. ✅ Click video → Chuyển đến practice page
3. ✅ Sentence hiển thị English + Vietnamese
4. ✅ Recording hoạt động (mic permission, timer, audio player)
5. ✅ Submit → Processing → Result card với scores
6. ✅ Word-by-word comparison với color coding
7. ✅ Next sentence hoạt động, progress tăng
8. ✅ Sentence list hiển thị completed status
9. ✅ Jump to sentence hoạt động
10. ✅ Complete video → Redirect về list
11. ✅ Progress persistence (làm lại video vẫn giữ điểm)

---

**Ready to test! 🚀**

Frontend: http://localhost:3000/speaking
Backend: http://localhost:1124
