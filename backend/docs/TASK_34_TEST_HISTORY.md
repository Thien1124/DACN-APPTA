# Task 34: Test History & Progress Tracking
# Task 34: Lịch Sử Thi & Theo Dõi Tiến Độ

## English Documentation

### Overview
Task 34 implements a comprehensive test history and progress tracking system that allows users to review their past test attempts, analyze performance, compare results across multiple attempts, and track learning progress over time.

### Features
1. **Test History List**: View all past test attempts with filters and pagination
2. **Detailed Results**: See complete breakdown of each test attempt including all answers
3. **Attempt Comparison**: Compare multiple attempts of the same test to track improvement
4. **Overall Statistics**: Get comprehensive statistics about test performance
5. **Progress Trends**: Visualize learning progress over time with trend data

---

## API Endpoints

All endpoints require JWT authentication (`Authorization: Bearer <token>`).

### 1. Get Test History

```
GET /api/test-history?page=1&limit=10&status=COMPLETED&sortBy=completedAt&sortOrder=desc
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page |
| status | string | COMPLETED | Test status: COMPLETED \| IN_PROGRESS \| ABANDONED \| ALL |
| sortBy | string | completedAt | Sort field: completedAt \| score \| percentage |
| sortOrder | string | desc | Sort order: desc \| asc |
| testId | string | - | Filter by specific test |
| courseId | string | - | Filter by course |
| lessonId | string | - | Filter by lesson |
| startDate | string | - | Filter from date (ISO format) |
| endDate | string | - | Filter to date (ISO format) |
| minScore | number | - | Minimum score filter (0-100) |
| maxScore | number | - | Maximum score filter (0-100) |
| passed | boolean | - | Filter by pass/fail status |

**Response:**

```json
{
  "success": true,
  "message": "Test history retrieved successfully",
  "messageVietnamese": "Lấy lịch sử thi thành công",
  "data": {
    "history": [
      {
        "attemptId": "673abc123...",
        "test": {
          "id": "672def456...",
          "title": "Unit 1 Final Test",
          "description": "Comprehensive test for Unit 1",
          "difficulty": "medium",
          "passingScore": 70,
          "timeLimit": 3600,
          "lesson": {
            "id": "671ghi789...",
            "title": "Lesson 5: Review",
            "course": {
              "id": "670jkl012...",
              "title": "English A1"
            }
          }
        },
        "score": 85,
        "totalPoints": 100,
        "percentage": 85,
        "correctAnswers": 17,
        "totalQuestions": 20,
        "passed": true,
        "status": "COMPLETED",
        "timeSpent": 2400,
        "startedAt": "2025-11-10T10:00:00Z",
        "completedAt": "2025-11-10T10:40:00Z",
        "attemptNumber": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

**Use Cases:**
- View all completed tests
- Filter tests by course or lesson
- Find tests taken in a specific date range
- Filter by pass/fail status
- Sort by score or date

---

### 2. Get Attempt Detail

```
GET /api/test-history/:attemptId
```

**Response:**

```json
{
  "success": true,
  "message": "Attempt detail retrieved successfully",
  "messageVietnamese": "Lấy chi tiết kết quả thi thành công",
  "data": {
    "attemptId": "673abc123...",
    "test": {
      "id": "672def456...",
      "title": "Unit 1 Final Test",
      "difficulty": "medium",
      "passingScore": 70
    },
    "result": {
      "score": 85,
      "totalPoints": 100,
      "percentage": 85,
      "correctAnswers": 17,
      "totalQuestions": 20,
      "passed": true,
      "status": "COMPLETED",
      "timeSpent": 2400,
      "startedAt": "2025-11-10T10:00:00Z",
      "completedAt": "2025-11-10T10:40:00Z"
    },
    "answers": [
      {
        "questionId": "674mno345...",
        "questionText": "What is the capital of France?",
        "questionType": "multiple_choice",
        "options": ["London", "Paris", "Berlin", "Madrid"],
        "userAnswer": "Paris",
        "correctAnswer": "Paris",
        "isCorrect": true,
        "pointsEarned": 5,
        "pointsAvailable": 5,
        "timeSpent": 15,
        "explanation": "Paris is the capital and largest city of France."
      },
      {
        "questionId": "674pqr678...",
        "questionText": "The Earth is flat.",
        "questionType": "true_false",
        "options": ["True", "False"],
        "userAnswer": "True",
        "correctAnswer": "False",
        "isCorrect": false,
        "pointsEarned": 0,
        "pointsAvailable": 3,
        "timeSpent": 8,
        "explanation": "The Earth is round (spherical), not flat."
      }
    ],
    "statistics": {
      "byQuestionType": {
        "multiple_choice": {
          "total": 10,
          "correct": 8,
          "percentage": 80
        },
        "true_false": {
          "total": 5,
          "correct": 4,
          "percentage": 80
        },
        "fill_blank": {
          "total": 5,
          "correct": 5,
          "percentage": 100
        }
      },
      "averageTimePerQuestion": 120
    }
  }
}
```

**Use Cases:**
- Review all answers from a specific test
- See which questions were answered correctly/incorrectly
- Read explanations for wrong answers
- Analyze performance by question type
- Check time spent per question

---

### 3. Compare Attempts

```
GET /api/test-history/compare/:testId
```

**Response:**

```json
{
  "success": true,
  "message": "Attempts comparison retrieved successfully",
  "messageVietnamese": "Lấy so sánh các lần thi thành công",
  "data": {
    "testId": "672def456...",
    "attempts": [
      {
        "attemptNumber": 1,
        "attemptId": "673abc111...",
        "score": 65,
        "percentage": 65,
        "correctAnswers": 13,
        "totalQuestions": 20,
        "timeSpent": 3000,
        "completedAt": "2025-11-01T10:00:00Z",
        "passed": false
      },
      {
        "attemptNumber": 2,
        "attemptId": "673abc222...",
        "score": 75,
        "percentage": 75,
        "correctAnswers": 15,
        "totalQuestions": 20,
        "timeSpent": 2700,
        "completedAt": "2025-11-05T14:30:00Z",
        "passed": true
      },
      {
        "attemptNumber": 3,
        "attemptId": "673abc333...",
        "score": 90,
        "percentage": 90,
        "correctAnswers": 18,
        "totalQuestions": 20,
        "timeSpent": 2400,
        "completedAt": "2025-11-10T10:40:00Z",
        "passed": true
      }
    ],
    "improvement": {
      "scoreImprovement": 25,
      "percentageImprovement": 25,
      "timeImprovement": 600,
      "averageScore": 77,
      "averagePercentage": 77,
      "totalAttempts": 3,
      "passedAttempts": 2,
      "bestAttempt": {
        "attemptNumber": 3,
        "percentage": 90,
        "completedAt": "2025-11-10T10:40:00Z"
      },
      "worstAttempt": {
        "attemptNumber": 1,
        "percentage": 65,
        "completedAt": "2025-11-01T10:00:00Z"
      }
    }
  }
}
```

**Use Cases:**
- Track improvement over multiple attempts
- See if scores are getting better
- Compare time efficiency across attempts
- Identify best and worst performances
- Motivate learners with visible progress

---

### 4. Get Overall Statistics

```
GET /api/test-history/statistics?courseId=670jkl012
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| courseId | string | Filter by course |
| lessonId | string | Filter by lesson |
| startDate | string | Filter from date |
| endDate | string | Filter to date |

**Response:**

```json
{
  "success": true,
  "message": "User test statistics retrieved successfully",
  "messageVietnamese": "Lấy thống kê thi của người dùng thành công",
  "data": {
    "totalAttempts": 25,
    "totalPassed": 20,
    "totalFailed": 5,
    "passRate": 80,
    "averageScore": 78,
    "averagePercentage": 78,
    "averageTimeSpent": 2500,
    "byDifficulty": {
      "easy": {
        "total": 8,
        "passed": 8,
        "failed": 0,
        "averageScore": 92,
        "passRate": 100
      },
      "medium": {
        "total": 12,
        "passed": 10,
        "failed": 2,
        "averageScore": 75,
        "passRate": 83
      },
      "hard": {
        "total": 5,
        "passed": 2,
        "failed": 3,
        "averageScore": 60,
        "passRate": 40
      }
    },
    "recentActivity": [
      {
        "attemptId": "673abc555...",
        "testId": "672def456...",
        "percentage": 90,
        "passed": true,
        "completedAt": "2025-11-10T10:40:00Z"
      }
    ],
    "dateRange": {
      "startDate": "2025-10-01T00:00:00Z",
      "endDate": "2025-11-10T23:59:59Z"
    }
  }
}
```

**Use Cases:**
- Dashboard overview of test performance
- Identify weak areas (low pass rate on hard tests)
- Track overall improvement
- Compare performance by difficulty level
- See recent activity

---

### 5. Get Progress Trend

```
GET /api/test-history/progress-trend?period=month&testId=672def456
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| period | string | week | Time period: week \| month \| year |
| testId | string | - | Filter by specific test (optional) |

**Response:**

```json
{
  "success": true,
  "message": "Progress trend retrieved successfully",
  "messageVietnamese": "Lấy xu hướng tiến độ thành công",
  "data": {
    "period": "month",
    "startDate": "2025-10-10T00:00:00Z",
    "endDate": "2025-11-10T23:59:59Z",
    "totalDataPoints": 15,
    "trend": [
      {
        "date": "2025-10-15",
        "totalAttempts": 2,
        "averageScore": 70,
        "averagePercentage": 70,
        "passCount": 1,
        "passRate": 50
      },
      {
        "date": "2025-10-20",
        "totalAttempts": 3,
        "averageScore": 75,
        "averagePercentage": 75,
        "passCount": 2,
        "passRate": 67
      },
      {
        "date": "2025-11-01",
        "totalAttempts": 2,
        "averageScore": 85,
        "averagePercentage": 85,
        "passCount": 2,
        "passRate": 100
      }
    ]
  }
}
```

**Use Cases:**
- Visualize learning progress over time
- Create progress charts/graphs
- Identify learning patterns
- Track consistency of performance
- Motivate with upward trends

---

## Vietnamese Documentation

### Tổng Quan

Task 34 triển khai hệ thống theo dõi lịch sử thi và tiến độ học tập toàn diện, cho phép người dùng xem lại các bài thi đã làm, phân tích kết quả, so sánh điểm số qua nhiều lần thi, và theo dõi tiến bộ học tập theo thời gian.

### Tính Năng Chính

1. **Danh Sách Lịch Sử**: Xem tất cả bài thi đã làm với bộ lọc và phân trang
2. **Chi Tiết Kết Quả**: Xem phân tích đầy đủ từng lần thi bao gồm tất cả câu trả lời
3. **So Sánh Các Lần Thi**: So sánh nhiều lần thi cùng một bài để theo dõi tiến bộ
4. **Thống Kê Tổng Quan**: Nhận thống kê toàn diện về hiệu suất thi
5. **Xu Hướng Tiến Độ**: Trực quan hóa tiến độ học tập theo thời gian

### Các Endpoint API

#### 1. Lấy Lịch Sử Thi

**Endpoint:** `GET /api/test-history`

**Tham số query:**
- `page`: Số trang (mặc định: 1)
- `limit`: Số mục mỗi trang (mặc định: 10)
- `status`: Trạng thái (COMPLETED | IN_PROGRESS | ABANDONED | ALL)
- `sortBy`: Sắp xếp theo (completedAt | score | percentage)
- `sortOrder`: Thứ tự (desc | asc)
- `testId`: Lọc theo bài test cụ thể
- `courseId`: Lọc theo khóa học
- `lessonId`: Lọc theo bài học
- `startDate`: Từ ngày
- `endDate`: Đến ngày
- `minScore`: Điểm tối thiểu (0-100)
- `maxScore`: Điểm tối đa (0-100)
- `passed`: Lọc theo đậu/rớt

**Ví dụ sử dụng:**

```bash
# Xem tất cả bài thi đã hoàn thành
GET /api/test-history?status=COMPLETED&page=1&limit=10

# Xem bài thi trong 1 tháng qua
GET /api/test-history?startDate=2025-10-10&endDate=2025-11-10

# Xem bài thi đạt điểm cao
GET /api/test-history?minScore=80&sortBy=percentage&sortOrder=desc

# Xem bài thi của một khóa học
GET /api/test-history?courseId=670jkl012
```

#### 2. Xem Chi Tiết Một Lần Thi

**Endpoint:** `GET /api/test-history/:attemptId`

**Trả về:**
- Thông tin test
- Kết quả tổng quan
- Tất cả câu hỏi và câu trả lời
- Thống kê theo loại câu hỏi

**Ví dụ:**

```bash
GET /api/test-history/673abc123def456
```

#### 3. So Sánh Các Lần Thi

**Endpoint:** `GET /api/test-history/compare/:testId`

**Trả về:**
- Danh sách tất cả lần thi (theo thứ tự thời gian)
- Điểm cải thiện
- Lần thi tốt nhất/tệ nhất
- Điểm trung bình

**Ví dụ:**

```bash
GET /api/test-history/compare/672def456
```

#### 4. Thống Kê Tổng Quan

**Endpoint:** `GET /api/test-history/statistics`

**Trả về:**
- Tổng số lần thi
- Tỷ lệ đậu/rớt
- Điểm trung bình
- Thống kê theo độ khó
- Hoạt động gần đây

**Ví dụ:**

```bash
# Thống kê tổng quan
GET /api/test-history/statistics

# Thống kê theo khóa học
GET /api/test-history/statistics?courseId=670jkl012
```

#### 5. Xu Hướng Tiến Độ

**Endpoint:** `GET /api/test-history/progress-trend`

**Tham số:**
- `period`: Khoảng thời gian (week | month | year)
- `testId`: Lọc theo test (tùy chọn)

**Trả về:**
- Dữ liệu theo ngày
- Điểm trung bình mỗi ngày
- Tỷ lệ đậu mỗi ngày

**Ví dụ:**

```bash
# Xu hướng 1 tuần
GET /api/test-history/progress-trend?period=week

# Xu hướng 1 tháng cho test cụ thể
GET /api/test-history/progress-trend?period=month&testId=672def456
```

---

## Testing Guide

### Test 1: Get Test History

```bash
GET http://localhost:1124/api/test-history?page=1&limit=5&status=COMPLETED
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response:**
- List of completed tests
- Pagination info
- Test details with scores

### Test 2: Get Attempt Detail

```bash
# First, get attemptId from test history
GET http://localhost:1124/api/test-history

# Then get detail
GET http://localhost:1124/api/test-history/ATTEMPT_ID
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response:**
- Full test result
- All questions and answers
- Statistics by question type

### Test 3: Compare Attempts

```bash
# First, take same test multiple times
# Then compare
GET http://localhost:1124/api/test-history/compare/TEST_ID
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response:**
- List of all attempts
- Improvement metrics
- Best/worst attempts

### Test 4: Get Statistics

```bash
GET http://localhost:1124/api/test-history/statistics
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response:**
- Overall statistics
- Pass rate
- Statistics by difficulty

### Test 5: Get Progress Trend

```bash
GET http://localhost:1124/api/test-history/progress-trend?period=week
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response:**
- Trend data by date
- Average scores over time

---

## Use Cases

### Student Dashboard
```javascript
// Overview statistics
const stats = await fetch('/api/test-history/statistics');

// Recent tests
const history = await fetch('/api/test-history?limit=5&sortBy=completedAt');

// Progress chart
const trend = await fetch('/api/test-history/progress-trend?period=month');
```

### Review Wrong Answers
```javascript
// Get test detail
const detail = await fetch(`/api/test-history/${attemptId}`);

// Filter wrong answers
const wrongAnswers = detail.answers.filter(a => !a.isCorrect);

// Show explanations
wrongAnswers.forEach(answer => {
   (answer.explanation);
});
```

### Track Improvement
```javascript
// Compare attempts
const comparison = await fetch(`/api/test-history/compare/${testId}`);

// Show improvement
 (`Score improved by: ${comparison.improvement.scoreImprovement}%`);
 (`Time improved by: ${comparison.improvement.timeImprovement} seconds`);
```

---

## Implementation Details

### Files Created

1. **src/services/testHistoryService.js** (500+ lines)
   - `getTestHistory()`: Get filtered test history with pagination
   - `getAttemptDetail()`: Get detailed result of specific attempt
   - `compareAttempts()`: Compare multiple attempts of same test
   - `getUserTestStatistics()`: Get overall statistics
   - `getProgressTrend()`: Get progress trend over time

2. **src/controllers/testHistoryController.js** (150+ lines)
   - 5 controller functions
   - Comprehensive error handling
   - Bilingual responses

3. **src/routes/testHistoryRoutes.js** (50+ lines)
   - 5 protected routes at `/api/test-history`
   - RESTful design

4. **server.js** (Updated)
   - Registered test history routes

### Database Queries

- Uses existing `TestAttempt` model
- Optimized with indexes on `userId`, `testId`, `status`
- Efficient population of related data
- Aggregation for statistics

### Features

✅ Pagination and filtering
✅ Multiple sort options
✅ Date range filtering
✅ Score range filtering
✅ Pass/fail filtering
✅ Course/lesson filtering
✅ Detailed answer breakdown
✅ Question type statistics
✅ Attempt comparison
✅ Improvement tracking
✅ Overall statistics
✅ Progress trends
✅ Bilingual support

---

## Best Practices

### For Students:
1. Review wrong answers after each test
2. Compare attempts to track improvement
3. Focus on weak areas (question types with low scores)
4. Track progress trends to stay motivated
5. Retake failed tests to improve

### For Developers:
1. Cache statistics for better performance
2. Add indexes for frequently queried fields
3. Implement pagination for large datasets
4. Consider archiving old test attempts
5. Add analytics tracking for user engagement

---

## Future Enhancements

1. **Recommended Tests**: Based on weak areas
2. **Study Plans**: Personalized based on test results
3. **Peer Comparison**: Compare with other students
4. **Achievements**: Badges for milestones
5. **Export Reports**: PDF/CSV export of test history
6. **AI Insights**: AI-powered learning recommendations

---

**Last Updated:** November 10, 2025
**Version:** 1.0.0
**Status:** ✅ Complete - Ready for testing
