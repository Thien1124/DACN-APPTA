# 🚀 Hướng Dẫn Test Nhanh Device Management
# Quick Test Guide for Device Management

## 📋 Mục Lục / Table of Contents

1. [Setup và Login](#setup-và-login)
2. [Test Đăng Nhập Bình Thường](#test-đăng-nhập-bình-thường)
3. [Test Thiết Bị Mới](#test-thiết-bị-mới)
4. [Test Remote Logout](#test-remote-logout)
5. [Test Suspicious Activity](#test-suspicious-activity)
6. [Troubleshooting](#troubleshooting)

---

## 1. Setup và Login

### Bước 1: Khởi động server
```powershell
cd c:\Users\Thien\DACN-APPTA\backend
npm start
```

**Expected output:**
```
[SUCCESS] Server running on port 1124
[SUCCESS] Connected to MongoDB
```

### Bước 2: Đăng nhập để lấy token
```bash
POST http://localhost:1124/api/auth/login
Content-Type: application/json

{
  "email": "your-email@example.com",
  "password": "your-password"
}
```

**Response (MỚI - bây giờ có session info!):**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "user": {
      "id": "673...",
      "name": "Your Name",
      "email": "your-email@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "session": {
      "sessionId": "673abc123def...",
      "deviceName": "Chrome on Windows",
      "isSuspicious": false,
      "riskLevel": "low"
    }
  }
}
```

**💡 LƯU TOKEN vào biến:**
```bash
# Trong terminal hoặc Postman
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 2. Test Đăng Nhập Bình Thường

### Test 2.1: Xem tất cả sessions
```bash
GET http://localhost:1124/api/devices/sessions
Authorization: Bearer YOUR_TOKEN
```

**Expected response:**
```json
{
  "success": true,
  "message": "Sessions retrieved successfully",
  "data": {
    "sessions": [
      {
        "_id": "673abc123...",
        "deviceInfo": {
          "deviceName": "Chrome on Windows",
          "deviceType": "desktop",
          "os": {
            "name": "Windows",
            "version": "10"
          },
          "browser": {
            "name": "Chrome",
            "version": "120"
          }
        },
        "location": {
          "ip": "1.2.3.4",
          "country": "Vietnam",
          "city": "Ho Chi Minh City"
        },
        "status": "active",
        "isTrusted": false,
        "isCurrent": true,
        "createdAt": "2025-11-10T10:00:00Z",
        "lastActivityAt": "2025-11-10T10:05:00Z",
        "expiresAt": "2025-12-10T10:00:00Z",
        "suspiciousActivity": {
          "isSuspicious": false,
          "riskLevel": "low"
        }
      }
    ],
    "total": 1
  }
}
```

**✅ Kiểm tra:**
- `total`: 1 (chỉ có 1 phiên)
- `status`: "active"
- `isSuspicious`: false
- `riskLevel`: "low"

---

### Test 2.2: Xem phiên hiện tại
```bash
GET http://localhost:1124/api/devices/sessions/current
Authorization: Bearer YOUR_TOKEN
```

**Expected response:**
```json
{
  "success": true,
  "message": "Current session retrieved successfully",
  "data": {
    "session": {
      "_id": "673abc123...",
      "deviceInfo": {
        "deviceName": "Chrome on Windows"
      },
      "isCurrent": true,
      "activityLog": [
        {
          "action": "login",
          "timestamp": "2025-11-10T10:00:00Z",
          "ip": "1.2.3.4"
        }
      ]
    }
  }
}
```

---

### Test 2.3: Xem login history
```bash
GET http://localhost:1124/api/devices/history?limit=10
Authorization: Bearer YOUR_TOKEN
```

**Expected response:**
```json
{
  "success": true,
  "message": "Login history retrieved successfully",
  "data": {
    "history": [
      {
        "status": "success",
        "email": "your-email@example.com",
        "deviceInfo": {
          "deviceName": "Chrome on Windows"
        },
        "location": {
          "ip": "1.2.3.4",
          "city": "Ho Chi Minh City",
          "country": "Vietnam"
        },
        "isSuspicious": false,
        "riskScore": 0,
        "loginMethod": "password",
        "timestamp": "2025-11-10T10:00:00Z"
      }
    ],
    "total": 1
  }
}
```

**✅ Kiểm tra:**
- `status`: "success"
- `isSuspicious`: false
- `riskScore`: 0

---

### Test 2.4: Xem statistics
```bash
GET http://localhost:1124/api/devices/statistics
Authorization: Bearer YOUR_TOKEN
```

**Expected response:**
```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "activeSessions": 1,
    "suspiciousSessions": 0,
    "trustedDevices": 0,
    "recentLogins": 1
  }
}
```

---

## 3. Test Thiết Bị Mới

### Test 3.1: Đăng nhập từ User-Agent khác

**Simulate iPhone:**
```bash
POST http://localhost:1124/api/auth/login
Content-Type: application/json
User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1

{
  "email": "your-email@example.com",
  "password": "your-password"
}
```

**Expected response:**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "token": "new_token_here...",
    "session": {
      "sessionId": "new_session_id...",
      "deviceName": "Safari on iPhone",
      "isSuspicious": true,      // ← ĐÃ ĐÁNH DẤU ĐÁNG NGỜ!
      "riskLevel": "medium"       // ← MEDIUM vì thiết bị mới
    }
  }
}
```

### Test 3.2: Kiểm tra suspicious sessions
```bash
GET http://localhost:1124/api/devices/suspicious
Authorization: Bearer YOUR_FIRST_TOKEN
```

**Expected response:**
```json
{
  "success": true,
  "message": "Suspicious sessions retrieved successfully",
  "data": {
    "sessions": [
      {
        "_id": "new_session_id...",
        "deviceInfo": {
          "deviceName": "Safari on iPhone"
        },
        "suspiciousActivity": {
          "isSuspicious": true,
          "reasons": [
            "New device from new location"
          ],
          "riskLevel": "medium",
          "detectedAt": "2025-11-10T10:15:00Z"
        }
      }
    ],
    "total": 1,
    "warning": "Suspicious activity detected. Please review and revoke if necessary."
  }
}
```

**✅ Kiểm tra:**
- `total`: 1
- `reasons`: ["New device from new location"]
- `riskLevel`: "medium"

---

## 4. Test Remote Logout

### Test 4.1: Xem danh sách sessions
```bash
GET http://localhost:1124/api/devices/sessions
Authorization: Bearer YOUR_TOKEN
```

**Expected: Có 2 sessions** (Windows + iPhone)

### Test 4.2: Revoke session iPhone
```bash
# Lấy session_id của iPhone từ response trên
POST http://localhost:1124/api/devices/sessions/NEW_SESSION_ID/revoke
Authorization: Bearer YOUR_FIRST_TOKEN
Content-Type: application/json

{
  "reason": "Unknown device detected"
}
```

**Expected response:**
```json
{
  "success": true,
  "message": "Session revoked successfully",
  "messageVietnamese": "Thu hồi phiên thành công",
  "data": {
    "session": {
      "_id": "new_session_id...",
      "status": "revoked",
      "revokedAt": "2025-11-10T10:20:00Z",
      "revokedReason": "Unknown device detected"
    }
  }
}
```

### Test 4.3: Verify session đã bị revoked
```bash
GET http://localhost:1124/api/devices/sessions
Authorization: Bearer YOUR_FIRST_TOKEN
```

**Expected: Chỉ còn 1 session** (Windows)

### Test 4.4: Test token của iPhone không còn hoạt động
```bash
GET http://localhost:1124/api/devices/sessions
Authorization: Bearer NEW_TOKEN_FROM_IPHONE
```

**Expected response (ERROR):**
```json
{
  "success": false,
  "message": "Session has been revoked or expired"
}
```

---

## 5. Test Suspicious Activity

### Test 5.1: Test Too Many Sessions (Rule 1)

**Đăng nhập 6 lần từ các User-Agent khác nhau:**
```bash
# Login 1: Chrome
POST http://localhost:1124/api/auth/login
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0

# Login 2: Firefox
POST http://localhost:1124/api/auth/login
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/120.0

# Login 3: Safari
POST http://localhost:1124/api/auth/login
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) Safari/605.1

# Login 4: Edge
POST http://localhost:1124/api/auth/login
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/120.0

# Login 5: Opera
POST http://localhost:1124/api/auth/login
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Opera/105.0

# Login 6: Mobile Chrome
POST http://localhost:1124/api/auth/login
User-Agent: Mozilla/5.0 (Linux; Android 12) Chrome/120.0 Mobile
```

**Check suspicious sau login thứ 6:**
```bash
GET http://localhost:1124/api/devices/suspicious
Authorization: Bearer ANY_TOKEN
```

**Expected:**
```json
{
  "data": {
    "sessions": [
      {
        "suspiciousActivity": {
          "isSuspicious": true,
          "reasons": [
            "Too many active sessions",
            "New device from new location"
          ],
          "riskLevel": "medium",
          "riskScore": 35
        }
      }
    ]
  }
}
```

**✅ Kiểm tra:**
- `reasons` chứa "Too many active sessions"
- `riskScore`: 20+ (Rule 1) + 15 (Rule 3) = 35+

---

### Test 5.2: Test Rapid Session Creation (Rule 5)

**Đăng nhập 4 lần trong 5 phút:**
```bash
# Login 1
POST http://localhost:1124/api/auth/login
# Wait 1 minute

# Login 2
POST http://localhost:1124/api/auth/login
# Wait 1 minute

# Login 3
POST http://localhost:1124/api/auth/login
# Wait 1 minute

# Login 4 ← Kích hoạt Rule 5!
POST http://localhost:1124/api/auth/login
```

**Check suspicious:**
```bash
GET http://localhost:1124/api/devices/suspicious
```

**Expected:**
```json
{
  "data": {
    "sessions": [
      {
        "suspiciousActivity": {
          "isSuspicious": true,
          "reasons": [
            "Rapid session creation",
            "Too many active sessions"
          ],
          "riskLevel": "critical",  // ← CRITICAL!
          "riskScore": 60           // ← 25 + 20 + 15 = 60
        }
      }
    ]
  }
}
```

**✅ Kiểm tra:**
- `riskLevel`: "critical"
- `reasons` chứa "Rapid session creation"
- `riskScore`: 50+

---

### Test 5.3: Test Unusual Login Time (Rule 4)

**Chỉ test được nếu hiện tại là 2-5 AM:**
```bash
# Nếu hiện tại là 3 AM
POST http://localhost:1124/api/auth/login

# Check history
GET http://localhost:1124/api/devices/history?limit=1
```

**Expected:**
```json
{
  "data": {
    "history": [
      {
        "isSuspicious": true,
        "suspiciousReasons": [
          "Unusual login time"
        ],
        "riskScore": 10
      }
    ]
  }
}
```

---

### Test 5.4: Test Logout All Other Sessions

```bash
# Login từ 3 devices
# Device 1: Windows Chrome (current)
# Device 2: iPhone Safari
# Device 3: Android Chrome

# Từ Device 1, logout tất cả devices khác:
POST http://localhost:1124/api/devices/sessions/revoke-all
Authorization: Bearer DEVICE_1_TOKEN
```

**Expected response:**
```json
{
  "success": true,
  "message": "Successfully logged out from 2 device(s)",
  "messageVietnamese": "Đã đăng xuất thành công khỏi 2 thiết bị",
  "data": {
    "revokedCount": 2
  }
}
```

**Verify:**
```bash
GET http://localhost:1124/api/devices/sessions
Authorization: Bearer DEVICE_1_TOKEN
```

**Expected: Chỉ còn 1 session** (Device 1)

---

## 6. Troubleshooting

### Vấn đề 1: "No sessions found"

**Nguyên nhân:** Bạn đăng nhập trước khi code được update

**Giải pháp:**
```bash
# 1. Đăng xuất
POST http://localhost:1124/api/auth/logout
Authorization: Bearer YOUR_TOKEN

# 2. Đăng nhập lại
POST http://localhost:1124/api/auth/login
{
  "email": "your-email@example.com",
  "password": "your-password"
}

# 3. Kiểm tra lại
GET http://localhost:1124/api/devices/sessions
Authorization: Bearer NEW_TOKEN
```

---

### Vấn đề 2: "Login history empty"

**Nguyên nhân:** Database chưa có records

**Giải pháp:** Đăng nhập ít nhất 1 lần sau khi update code

---

### Vấn đề 3: Risk score luôn = 0

**Nguyên nhân:** Chỉ đăng nhập 1 lần từ 1 thiết bị

**Giải pháp:** 
- Đăng nhập từ nhiều User-Agent khác nhau
- Tạo nhiều sessions trong thời gian ngắn

---

### Vấn đề 4: Token không hoạt động sau revoke

**✅ Đây là ĐÚNG!** Session bị revoked = token không còn valid

**Giải pháp:** Đăng nhập lại để lấy token mới

---

### Vấn đề 5: "Cannot find module 'ua-parser-js'"

**Giải pháp:**
```powershell
cd c:\Users\Thien\DACN-APPTA\backend
npm install ua-parser-js
npm start
```

---

## 📊 Quick Test Summary

### ✅ Test Checklist:
- [ ] Login và nhận được session info
- [ ] Xem danh sách sessions
- [ ] Xem session hiện tại
- [ ] Xem login history
- [ ] Xem statistics
- [ ] Đăng nhập từ thiết bị mới → Suspicious detected
- [ ] Revoke specific session
- [ ] Verify revoked session không hoạt động
- [ ] Đăng nhập 6+ lần → Too many sessions warning
- [ ] Đăng nhập nhanh 4 lần → Rapid creation critical
- [ ] Logout all other devices

---

## 🎯 Expected Results Summary

| Test | Risk Score | Risk Level | Status |
|------|------------|------------|---------|
| Đăng nhập bình thường | 0 | LOW | ✅ Normal |
| Thiết bị mới | 15 | MEDIUM | ⚠️ Suspicious |
| 6+ sessions | 20-35 | MEDIUM | ⚠️ Suspicious |
| 4 logins in 10 min | 50+ | CRITICAL | 🚨 Very suspicious |
| Multiple countries | 30+ | HIGH | 🔴 Alert |
| Unusual time (2-5 AM) | 10 | LOW | ⚠️ Minor |
| VPN/Proxy | 10 | LOW | ⚠️ Minor |

---

## 📚 Tài Liệu Liên Quan

- **Chi tiết về Detection Rules:** `SUSPICIOUS_ACTIVITY_DETECTION.md`
- **API Documentation:** `TASK_33_DEVICE_MANAGEMENT.md`
- **Source Code:** 
  - `src/services/deviceService.js`
  - `src/controllers/deviceController.js`

---

**Last Updated:** November 10, 2025
**Version:** 1.0.0
