# 🎙️ Speaking Video & Shadowing Practice - Hướng dẫn sử dụng

## 📋 Tổng quan tính năng

Tính năng cho phép:
- **Admin**: Upload video tiếng Anh kèm transcript (văn bản)
- **Học sinh**: Xem video, thu âm đọc lại, và nhận điểm số đánh giá độ chính xác

---

## 🔧 Backend đã triển khai

### 1. Models

**`SpeakingVideo.js`** - Lưu video speaking
```javascript
{
  title: String,              // Tiêu đề video
  description: String,        // Mô tả
  videoUrl: String,           // URL video (YouTube, Vimeo, etc.)
  transcript: String,         // Văn bản cần đọc
  duration: Number,           // Thời lượng (giây)
  level: String,              // beginner | intermediate | advanced
  category: String,           // conversation | pronunciation | vocabulary | grammar
  thumbnailUrl: String,       // URL thumbnail
  totalAttempts: Number,      // Tổng số lần thử
  averageScore: Number,       // Điểm trung bình
  isActive: Boolean           // Hiển thị hay không
}
```

**`SpeakingAttempt.js`** - Lưu bài thu âm của học sinh
```javascript
{
  user: ObjectId,             // ID học sinh
  video: ObjectId,            // ID video
  audioUrl: String,           // URL file audio đã thu
  transcription: String,      // Văn bản nhận diện được
  accuracyScore: Number,      // Điểm độ chính xác (0-100)
  pronunciationScore: Number, // Điểm phát âm (0-100)
  fluencyScore: Number,       // Điểm lưu loát (0-100)
  overallScore: Number,       // Điểm tổng thể (0-100)
  comparison: {
    correctWords: Number,
    totalWords: Number,
    missedWords: [String],
    extraWords: [String],
    similarityPercentage: Number
  },
  feedback: String,           // Nhận xét tự động
  xpEarned: Number,           // XP nhận được
  status: String              // processing | completed | failed
}
```

### 2. API Endpoints

#### Admin APIs
```
POST   /api/speaking/videos              - Tạo video mới
GET    /api/speaking/videos/admin        - Lấy tất cả video (admin)
PUT    /api/speaking/videos/:id          - Cập nhật video
DELETE /api/speaking/videos/:id          - Xóa video
```

#### User APIs
```
GET    /api/speaking/videos              - Lấy danh sách video (active only)
GET    /api/speaking/videos/:id          - Lấy chi tiết video + lịch sử attempts
POST   /api/speaking/attempts            - Submit bài thu âm (multipart/form-data)
GET    /api/speaking/attempts/:id        - Lấy kết quả attempt
GET    /api/speaking/attempts/my-attempts - Lấy lịch sử attempts của mình
```

### 3. Speech Recognition Service

File `speakingAttemptController.js` xử lý:
- **Transcribe audio** → Chuyển speech thành text (sử dụng `speechService.transcribeAudio()`)
- **So sánh với transcript gốc** → Tính độ chính xác
- **Tính điểm**:
  - `accuracyScore`: % từ đúng
  - `pronunciationScore`: Giả lập (có thể tích hợp API chuyên dụng)
  - `fluencyScore`: Giả lập
  - `overallScore`: Tổng hợp (40% accuracy + 30% pronunciation + 30% fluency)
- **Award XP**: User nhận XP dựa trên điểm số

---

## 🎨 Frontend đã triển khai

### 1. Trang Admin - `/admin/speaking-videos`

**Component**: `AdminSpeakingVideos.jsx`

**Tính năng**:
- ✅ Hiển thị grid danh sách video
- ✅ Filter theo level, category, search
- ✅ Tạo video mới (modal form)
- ✅ Sửa video (modal form)
- ✅ Xóa video (với xác nhận)
- ✅ Toggle active/inactive
- ✅ Hiển thị thống kê (total attempts, average score)

**Form fields**:
- Title, Description
- Video URL (YouTube, Vimeo, etc.)
- Transcript (văn bản cần đọc)
- Thumbnail URL
- Duration, Level, Category, Order

### 2. Trang danh sách Video - `/speaking`

**Component**: `SpeakingVideos.jsx`

**Tính năng**:
- ✅ Grid card hiển thị video
- ✅ Filter theo level, category
- ✅ Click vào card → chuyển đến trang practice
- ✅ Responsive design

### 3. Trang luyện tập - `/speaking/:id`

**Component**: `SpeakingPractice.jsx`

**Tính năng**:
- ✅ Hiển thị video (YouTube embed)
- ✅ Hiển thị transcript (văn bản cần đọc)
- ✅ **Thu âm giọng nói**:
  - Nút record lớn, đẹp mắt
  - Hiển thị timer khi đang ghi
  - Preview audio sau khi ghi xong
  - Submit và chấm điểm
- ✅ **Hiển thị kết quả**:
  - Điểm tổng thể (lớn, nổi bật)
  - Breakdown: Accuracy, Pronunciation, Fluency
  - Feedback tự động
  - So sánh transcript gốc vs transcript nhận diện
  - Hiển thị từ đúng/sai
- ✅ Lịch sử các lần thử (attempts history)
- ✅ Nút "Thử lại"

---

## 🚀 Cách sử dụng

### Bước 1: Admin tạo video

1. Đăng nhập với tài khoản admin
2. Vào `/admin/speaking-videos`
3. Click "Tạo Video Mới"
4. Điền form:
   ```
   Title: "English Conversation - At the Restaurant"
   Video URL: https://youtube.com/watch?v=abc123
   Transcript: "Hello, I would like to order some food. Can I see the menu please?"
   Level: Beginner
   Category: Conversation
   ```
5. Submit → Video được tạo

### Bước 2: Học sinh luyện tập

1. Đăng nhập với tài khoản học sinh
2. Vào `/speaking` → Chọn video
3. Xem video và đọc transcript
4. Click nút 🎤 để bắt đầu thu âm
5. Đọc theo transcript
6. Click nút ⏹ để dừng
7. Nghe lại audio preview
8. Click "Gửi và Chấm điểm"
9. Đợi xử lý (2-10 giây)
10. Xem kết quả:
    - Điểm tổng: 85%
    - Accuracy: 90%, Pronunciation: 82%, Fluency: 83%
    - Feedback: "Tốt lắm! Bạn đã phát âm khá chính xác"
    - Nhận 42 XP

### Bước 3: Thử lại để cải thiện

- Click "Thử lại" để thu âm lần nữa
- Xem lịch sử để theo dõi tiến bộ

---

## 📦 Dependencies

Backend cần cài:
```bash
npm install string-similarity
```

Frontend sử dụng:
- React Hooks (useState, useEffect, useRef)
- Web Audio API (MediaRecorder)
- styled-components

---

## 🔧 Cấu hình cần thiết

### 1. Speech Service

File `backend/src/services/speechService.js` cần implement:
```javascript
const speechService = {
  transcribeAudio: async (audioPath) => {
    // Sử dụng Google Speech-to-Text, AWS Transcribe, hoặc tương tự
    // Return: { success: true, text: "transcribed text", duration: 10 }
  }
};
```

**Gợi ý API**:
- Google Cloud Speech-to-Text
- AWS Transcribe
- Azure Speech Services
- AssemblyAI

### 2. File Storage

Uploads được lưu tại: `backend/uploads/speaking/`

Cần đảm bảo:
- Thư mục tồn tại và có quyền write
- Multer đã cấu hình đúng (đã có trong `speakingRoutes.js`)

---

## 🎯 Mở rộng trong tương lai

1. **Tích hợp Speech Recognition API thật**
   - Hiện tại sử dụng `speechService.transcribeAudio()` (cần implement)
   - Có thể dùng Google Cloud Speech-to-Text

2. **Đánh giá phát âm chuyên sâu**
   - Sử dụng API như Speechace, ELSA API
   - Phân tích từng phoneme

3. **Video hosting riêng**
   - Thay vì YouTube embed, upload video lên server riêng
   - Sử dụng AWS S3, Cloudinary

4. **Gamification**
   - Thêm badges khi đạt điểm cao
   - Leaderboard cho speaking practice
   - Streak system

5. **Social features**
   - Share audio với bạn bè
   - Comment, like
   - Thách thức bạn bè

---

## 📝 Notes quan trọng

1. **Browser Compatibility**
   - MediaRecorder API: Chrome 47+, Firefox 25+, Edge 79+
   - Safari cần polyfill hoặc fallback

2. **Microphone Permission**
   - User phải cho phép quyền microphone
   - Handle error khi user deny

3. **Audio Format**
   - WebM (Chrome, Firefox)
   - MP4/M4A (Safari)
   - Backend xử lý nhiều format

4. **Performance**
   - Audio files có thể lớn (1-5 MB)
   - Giới hạn filesize: 10MB
   - Compression nếu cần

5. **Security**
   - Validate audio file type
   - Rate limiting cho API submit
   - Chỉ user chủ sở hữu mới xem được attempt

---

## ✅ Checklist triển khai

- [x] Backend Models (SpeakingVideo, SpeakingAttempt)
- [x] Backend Controllers (speakingVideoController, speakingAttemptController)
- [x] Backend Routes (speakingRoutes)
- [x] Backend Speech Service integration point
- [x] Frontend Admin page (AdminSpeakingVideos)
- [x] Frontend User list page (SpeakingVideos)
- [x] Frontend Practice page (SpeakingPractice)
- [x] Routes trong App.js
- [ ] Implement Speech-to-Text API (cần config)
- [ ] Testing với audio thật
- [ ] Deploy và test production

---

## 🐛 Troubleshooting

**Problem**: Audio không ghi được
- **Solution**: Kiểm tra microphone permission, thử browser khác

**Problem**: Submit bị lỗi
- **Solution**: Kiểm tra filesize, format, network

**Problem**: Điểm luôn 0%
- **Solution**: Speech service chưa implement đúng

**Problem**: Video không load
- **Solution**: Kiểm tra YouTube URL, CORS policy

---

## 📞 Support

Nếu cần hỗ trợ:
1. Kiểm tra console logs (browser & server)
2. Xem network tab (XHR requests)
3. Test với Postman/Thunder Client
4. Đọc lại docs này

---

**Chúc bạn triển khai thành công! 🚀**
