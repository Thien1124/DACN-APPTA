# 🐛 Debug Hướng Dẫn: Session Issues
# Debug Guide: Session Issues

## Vấn Đề Phổ Biến / Common Issues

### 1. "Current session not found" khi gọi revoke-all

**Nguyên nhân:**
- JWT token trong request không khớp với session trong database
- Session chưa được tạo khi login
- Session đã bị xóa hoặc expired

**Giải pháp:**

#### Bước 1: Kiểm tra xem session có tồn tại không
```bash
GET http://localhost:1124/api/devices/debug/all
Authorization: Bearer YOUR_TOKEN
```

**Response sẽ cho biết:**
```json
{
  "data": {
    "sessions": [
      {
        "_id": "session_id",
        "jwtTokenPreview": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
        "jwtTokenMatch": true,  // ← TRUE = Token khớp!
        "status": "active"
      }
    ],
    "currentTokenPreview": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "total": 1
  }
}
```

**Kiểm tra:**
- ✅ `total > 0` → Có sessions
- ✅ `jwtTokenMatch: true` → Token khớp với session
- ❌ `total = 0` → KHÔNG có sessions → **Cần login lại!**
- ❌ `jwtTokenMatch: false` → Token KHÔNG khớp → **Cần login lại!**

---

#### Bước 2: Nếu không có sessions → Login lại
```bash
POST http://localhost:1124/api/auth/login
Content-Type: application/json

{
  "email": "your-email@example.com",
  "password": "your-password"
}
```

**Response mới (sau khi update code):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",  // ← Lưu token mới này!
    "session": {
      "sessionId": "673abc...",
      "deviceName": "Chrome on Windows",
      "isSuspicious": false
    }
  }
}
```

**💡 LƯU Ý:** Dùng token MỚI từ response này!

---

#### Bước 3: Test lại revoke-all với token mới
```bash
POST http://localhost:1124/api/devices/sessions/revoke-all
Authorization: Bearer NEW_TOKEN_HERE
```

**Expected response:**
```json
{
  "success": true,
  "message": "Successfully logged out from 2 device(s)",
  "data": {
    "revokedCount": 2
  }
}
```

---

### 2. "Session not found" khi revoke specific session

**Nguyên nhân:**
- SessionId không đúng
- Session đã bị revoke rồi
- Session không thuộc về user hiện tại

**Giải pháp:**

#### Bước 1: Lấy danh sách sessions
```bash
GET http://localhost:1124/api/devices/sessions
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "data": {
    "sessions": [
      {
        "_id": "673abc123def456...",  // ← Copy _id này
        "deviceName": "Chrome on Windows",
        "status": "active"
      },
      {
        "_id": "673def456ghi789...",  // ← Copy _id này
        "deviceName": "Safari on iPhone",
        "status": "active"
      }
    ]
  }
}
```

#### Bước 2: Revoke với đúng session ID
```bash
POST http://localhost:1124/api/devices/sessions/673def456ghi789.../revoke
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "reason": "Unknown device"
}
```

**💡 Chú ý:** 
- Session ID phải là `_id` từ response, không phải `sessionToken`
- Không thể revoke session hiện tại (current session)

---

### 3. Warning: "Valid JWT but no active session found"

**Nguyên nhân:**
- Bạn đang dùng token CŨ (trước khi update code)
- Session đã bị xóa hoặc revoked
- Session expired

**Giải pháp:**

```bash
# 1. Logout với token cũ
POST http://localhost:1124/api/auth/logout
Authorization: Bearer OLD_TOKEN

# 2. Login lại để tạo session mới
POST http://localhost:1124/api/auth/login
{
  "email": "your-email@example.com",
  "password": "your-password"
}

# 3. Dùng token MỚI từ response
```

---

### 4. Sessions trống ngay sau khi login

**Nguyên nhân:** Code chưa được update hoặc server chưa restart

**Giải pháp:**

```bash
# 1. Stop server
Ctrl + C

# 2. Restart server
npm start

# 3. Login lại
POST http://localhost:1124/api/auth/login

# 4. Check sessions
GET http://localhost:1124/api/devices/sessions
```

---

## 🔍 Debug Commands Checklist

### Step 1: Check Server Status
```bash
# Server phải running
npm start

# Expected output:
# [SUCCESS] Server running on port 1124
# [SUCCESS] Connected to MongoDB
```

### Step 2: Login Fresh
```bash
POST http://localhost:1124/api/auth/login
{
  "email": "test@example.com",
  "password": "password123"
}

# Save response.data.token
```

### Step 3: Verify Session Created
```bash
GET http://localhost:1124/api/devices/debug/all
Authorization: Bearer TOKEN_FROM_STEP_2

# Expected: total > 0, jwtTokenMatch = true
```

### Step 4: Test Get Sessions
```bash
GET http://localhost:1124/api/devices/sessions
Authorization: Bearer TOKEN_FROM_STEP_2

# Expected: At least 1 session with status: "active"
```

### Step 5: Test Revoke All
```bash
# Login from 2nd device first (different User-Agent)
POST http://localhost:1124/api/auth/login
User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 15_0) Safari/604.1
{
  "email": "test@example.com",
  "password": "password123"
}

# Now should have 2 sessions
GET http://localhost:1124/api/devices/sessions
Authorization: Bearer TOKEN_FROM_STEP_2

# Revoke all except current
POST http://localhost:1124/api/devices/sessions/revoke-all
Authorization: Bearer TOKEN_FROM_STEP_2

# Expected: revokedCount = 1
```

---

## 🎯 Quick Fix Summary

| Lỗi | Nguyên Nhân | Giải Pháp |
|-----|-------------|-----------|
| Current session not found | Token cũ hoặc session không tồn tại | Login lại để tạo session mới |
| Session not found | SessionId sai | Lấy đúng _id từ GET /sessions |
| Valid JWT but no active session | Token cũ | Logout + Login lại |
| Sessions trống | Server chưa restart | Restart server + Login lại |
| jwtTokenMatch = false | Token không khớp | Dùng đúng token từ login response |

---

## 🔧 Code Changes Summary

### 1. Enhanced `revokeAllOtherSessions`
- ✅ Tự động tìm current session bằng JWT token
- ✅ Fallback: Nếu không tìm thấy → Revoke ALL sessions
- ✅ Better error messages

### 2. Enhanced `revokeSession`
- ✅ Debug logging
- ✅ Check if session exists
- ✅ Check if session belongs to user
- ✅ Handle already revoked sessions

### 3. New Debug Endpoint
- ✅ `GET /api/devices/debug/all`
- ✅ Shows JWT token match status
- ✅ Shows all sessions including revoked

---

## 📞 Need More Help?

Nếu vẫn gặp lỗi:

1. **Check server logs** - Xem console output
2. **Use debug endpoint** - `GET /api/devices/debug/all`
3. **Clear database** - Xóa tất cả sessions cũ
4. **Fresh login** - Đăng nhập lại với token mới

```bash
# Clear all sessions trong MongoDB (if needed)
# Connect to MongoDB:
mongosh

# Switch to database:
use your_database_name

# Delete all sessions:
db.devicesessions.deleteMany({})

# Exit:
exit
```

---

**Last Updated:** November 10, 2025
**Version:** 1.1.0 (Fixed revoke-all issue)
