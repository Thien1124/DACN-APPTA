# TODO List

## ✅ Task: Flashcard System (COMPLETED - Nov 1, 2025)

**Tính năng:** Hệ thống ôn tập flashcard với Spaced Repetition Algorithm

### Đã hoàn thành:
- ✅ Model `StudyProgress` - Theo dõi tiến độ học của user
- ✅ Model `StudySession` - Quản lý phiên học
- ✅ Controller `studyController` - Xử lý logic ôn tập
- ✅ Routes `/api/study/*` - API endpoints
- ✅ Spaced Repetition Algorithm (SM-2)
- ✅ Multiple study modes (FLIP, TYPE_IN, MULTIPLE_CHOICE)
- ✅ Progress tracking & Statistics
- ✅ XP calculation & Streak tracking
- ✅ Browse & Filter Decks (public)
- ✅ API Documentation
- ✅ Seed script cho test data

### Files tạo mới:
1. `/src/models/StudyProgress.js` - Model tiến độ học
2. `/src/models/StudySession.js` - Model phiên học
3. `/src/controllers/studyController.js` - Controller
4. `/src/routes/studyRoutes.js` - Routes
5. `/scripts/seedFlashcards.js` - Script seed data
6. `/FLASHCARD_API_DOCS.md` - Documentation

### Files đã cập nhật:
1. `server.js` - Thêm study routes
2. `src/routes/deckRoutes.js` - Đã có sẵn (không cần sửa)
3. `src/controllers/deckController.js` - Đã có browse/filter

---

## ⏳ Task 10: Tích hợp 2FA vào login flow (PENDING)

**Trạng thái:** ✅ 2FA đã hoàn thành (setup/enable/verify/disable)
**Chưa làm:** Tích hợp vào login flow

### Khi nào cần làm:
- Trước khi deploy lên production
- Khi hoàn thành tất cả tính năng khác
- Khi cần test 2FA đầy đủ với frontend

### Các file cần sửa:
1. `src/controllers/authController.js`
   - Sửa function `login()` để kiểm tra 2FA
   - Trả về tempToken nếu user bật 2FA

2. `src/middleware/auth.js`
   - Thêm middleware `requireFullToken`
   - Phân biệt tempToken và fullToken

3. `src/controllers/twoFactorController.js`
   - Sửa `verify2FA()` để trả về fullToken sau khi verify

---

## 🚀 Next Tasks (Suggestions)

### 1. Frontend Integration
- Tạo UI cho Study Session
- Implement các study modes
- Progress dashboard
- Results screen

### 2. Gamification
- Achievement system
- Daily challenges
- Leaderboard
- Badges & Rewards

### 3. Social Features
- Share progress
- Friend system
- Study groups
- Collaborative decks

### 4. Advanced Features
- Audio pronunciation
- Image recognition
- Voice input
- Offline mode
- Mobile app



