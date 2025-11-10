# Task 33: Multi-Device Management & Session Tracking
# Task 33: Quản Lý Đa Thiết Bị & Theo Dõi Phiên

## English Documentation

### Overview
Task 33 implements comprehensive multi-device session management with security features including device tracking, suspicious activity detection, remote logout capabilities, and login history monitoring. This system helps users manage their active sessions across multiple devices and detect unauthorized access attempts.

### Features
1. **Device Session Tracking**: Track all user sessions across different devices with detailed device information
2. **Suspicious Activity Detection**: Automated detection of suspicious login patterns and unusual activities
3. **Remote Logout**: Ability to revoke sessions remotely from any device
4. **Trusted Devices**: Manage and verify trusted devices
5. **Login History**: Complete audit trail of all login attempts (successful and failed)
6. **Real-time Session Monitoring**: Track active sessions with last activity timestamps
7. **Security Alerts**: Notifications for suspicious activities
8. **Device Fingerprinting**: Unique device identification for enhanced security

### Tech Stack
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with session tracking
- **Device Parsing**: ua-parser-js for user agent analysis
- **Security**: Crypto for fingerprinting, multi-factor risk assessment

### Database Models

#### 1. DeviceSession Schema
Tracks user login sessions across multiple devices.

**Key Fields:**
- `user`: Reference to User model (indexed)
- `deviceInfo`: Device details
  - `deviceId`: Unique device identifier
  - `deviceName`: Human-readable device name
  - `deviceType`: desktop | mobile | tablet | unknown
  - `os`: Operating system (name, version)
  - `browser`: Browser information (name, version)
  - `fingerprint`: Device fingerprint for tracking
- `location`: Geolocation data
  - `ip`: IP address
  - `country`, `city`: Location details
  - `timezone`: User timezone
  - `coordinates`: Latitude and longitude
- `sessionToken`: Unique session identifier
- `jwtToken`: Associated JWT token
- `status`: active | expired | revoked | suspicious
- `isTrusted`: Whether device is trusted
- `isFirstTime`: First login from this device
- `requiresVerification`: Needs additional verification
- `suspiciousActivity`: Suspicious activity details
  - `isSuspicious`: Boolean flag
  - `reasons`: Array of reasons
  - `riskLevel`: low | medium | high | critical
- `activityLog[]`: Array of session activities
- `expiresAt`: Session expiration (30 days default)

**Methods:**
- `isValid()`: Check if session is still valid
- `updateActivity(action, ip, details)`: Log activity
- `markAsSuspicious(reasons, riskLevel)`: Flag as suspicious
- `revoke(reason)`: Revoke session
- `verifyDevice()`: Mark device as verified and trusted

#### 2. LoginHistory Schema
Tracks all login attempts (successful and failed).

**Key Fields:**
- `user`: User reference
- `email`: Login email
- `status`: success | failed | blocked
- `failureReason`: Reason for failed login
- `deviceInfo`: Device details
- `location`: IP and location
- `isSuspicious`: Suspicious flag
- `suspiciousReasons[]`: Array of reasons
- `riskScore`: 0-100 risk score
- `loginMethod`: password | google | facebook | apple | 2fa
- `timestamp`: Login timestamp

#### 3. TrustedDevice Schema
Stores verified trusted devices.

**Key Fields:**
- `user`: User reference
- `deviceInfo`: Device details with fingerprint
- `trustedAt`: When device was trusted
- `lastUsedAt`: Last usage timestamp
- `trustLevel`: full | partial | revoked
- `loginCount`: Number of logins from this device
- `isActive`: Whether trust is still active

**Methods:**
- `updateLastUsed(ip, location)`: Update usage stats
- `revokeTrust(reason)`: Revoke device trust

### API Endpoints

All endpoints require JWT authentication (`Authorization: Bearer <token>`).

#### 1. Get All Sessions
```
GET /api/devices/sessions?includeExpired=false
```

**Query Parameters:**
- `includeExpired` (boolean): Include expired sessions (default: false)

**Response:**
```json
{
  "success": true,
  "message": "Sessions retrieved successfully",
  "messageVietnamese": "Lấy danh sách phiên thành công",
  "data": {
    "sessions": [
      {
        "_id": "session_id",
        "deviceInfo": {
          "deviceName": "Chrome on Windows",
          "deviceType": "desktop",
          "os": { "name": "Windows", "version": "10" },
          "browser": { "name": "Chrome", "version": "120" }
        },
        "location": {
          "ip": "1.2.3.4",
          "country": "Vietnam",
          "city": "Ho Chi Minh City"
        },
        "status": "active",
        "isTrusted": true,
        "isCurrent": true,
        "createdAt": "2025-11-10T10:00:00Z",
        "lastActivityAt": "2025-11-10T15:30:00Z",
        "expiresAt": "2025-12-10T10:00:00Z"
      }
    ],
    "total": 3
  }
}
```

#### 2. Get Current Session
```
GET /api/devices/sessions/current
```

Returns detailed information about the current active session.

#### 3. Revoke Specific Session (Remote Logout)
```
POST /api/devices/sessions/:sessionId/revoke
```

**Request Body:**
```json
{
  "reason": "Suspicious activity detected" // Optional
}
```

**Use Case:** 
- User sees unknown device in session list
- User wants to logout from a specific device remotely
- Security measure after suspicious activity

#### 4. Revoke All Other Sessions
```
POST /api/devices/sessions/revoke-all
```

Logs out from all devices except current one.

**Response:**
```json
{
  "success": true,
  "message": "Successfully logged out from 3 device(s)",
  "messageVietnamese": "Đã đăng xuất thành công khỏi 3 thiết bị",
  "data": {
    "revokedCount": 3
  }
}
```

**Use Case:**
- Forgot to logout from public computer
- Security precaution after password change
- Suspected account compromise

#### 5. Verify Device
```
POST /api/devices/sessions/:sessionId/verify
```

**Request Body:**
```json
{
  "verificationCode": "123456" // Optional: For future 2FA integration
}
```

Mark device as trusted after verification.

#### 6. Get Trusted Devices
```
GET /api/devices/trusted
```

Returns list of all trusted devices.

#### 7. Revoke Trusted Device
```
DELETE /api/devices/trusted/:deviceId
```

**Request Body:**
```json
{
  "reason": "Device lost or stolen" // Optional
}
```

Revokes trust and logs out all sessions from that device.

#### 8. Get Login History
```
GET /api/devices/history?limit=50&status=success&isSuspicious=false&startDate=2025-01-01&endDate=2025-12-31
```

**Query Parameters:**
- `limit` (number): Number of records (default: 50)
- `status`: success | failed | blocked
- `isSuspicious` (boolean): Filter suspicious logins
- `startDate`, `endDate`: Date range filter

**Response:**
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "status": "success",
        "deviceInfo": { "deviceName": "Chrome on Windows" },
        "location": { "ip": "1.2.3.4", "city": "Ho Chi Minh City" },
        "isSuspicious": false,
        "riskScore": 5,
        "loginMethod": "password",
        "timestamp": "2025-11-10T10:00:00Z"
      }
    ],
    "total": 25
  }
}
```

#### 9. Get Suspicious Sessions
```
GET /api/devices/suspicious
```

Returns all sessions flagged as suspicious.

**Response:**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "_id": "session_id",
        "suspiciousActivity": {
          "isSuspicious": true,
          "reasons": [
            "Multiple countries in short time",
            "Unusual login time"
          ],
          "riskLevel": "high",
          "detectedAt": "2025-11-10T02:30:00Z"
        },
        "location": { "country": "Unknown", "ip": "192.168.1.1" }
      }
    ],
    "total": 1,
    "warning": "Suspicious activity detected. Please review and revoke if necessary.",
    "warningVietnamese": "Phát hiện hoạt động đáng ngờ. Vui lòng xem xét và thu hồi nếu cần thiết."
  }
}
```

#### 10. Get Session Statistics
```
GET /api/devices/statistics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "activeSessions": 3,
    "suspiciousSessions": 1,
    "trustedDevices": 2,
    "recentLogins": 15
  }
}
```

#### 11. Cleanup Expired Sessions (Admin)
```
POST /api/devices/cleanup
```

Admin endpoint to manually clean up expired sessions.

### Suspicious Activity Detection

The system automatically detects suspicious activities based on multiple factors:

#### Detection Rules:

1. **Too Many Active Sessions**
   - Risk Score: +20
   - Trigger: More than 5 active sessions simultaneously

2. **Multiple Countries in Short Time**
   - Risk Score: +30
   - Risk Level: High
   - Trigger: Logins from 2+ countries within 30 minutes

3. **Unknown Device from Unknown Location**
   - Risk Score: +15
   - Trigger: First-time device + no trusted device match

4. **Unusual Login Time**
   - Risk Score: +10
   - Trigger: Login between 2 AM - 5 AM local time

5. **Rapid Session Creation**
   - Risk Score: +25
   - Risk Level: Critical
   - Trigger: More than 3 sessions created within 10 minutes

6. **VPN/Proxy Detection**
   - Risk Score: +10
   - Trigger: Private IP ranges detected

#### Risk Levels:
- **Low** (0-14): Normal activity
- **Medium** (15-29): Slightly suspicious
- **High** (30-49): Very suspicious, requires attention
- **Critical** (50+): Potential account compromise

### Security Features

#### 1. Device Fingerprinting
Generates unique identifier based on:
- User agent
- Accept-Language header
- Accept-Encoding header
- IP address

#### 2. Session Expiration
- Default: 30 days
- Automatic cleanup via MongoDB TTL index
- Manual revocation available

#### 3. Activity Logging
Every session logs:
- Login timestamp
- Each activity with IP and details
- Logout/revocation with reason
- Suspicious activity detection events

#### 4. Trusted Device Management
- First-time devices require verification
- Trusted devices skip additional checks
- Trust can be revoked at any time
- Separate tracking from sessions

### Integration with Authentication

The auth middleware has been enhanced to:

1. **Track Device Session**: Automatically find and attach session to request
2. **Update Activity**: Log every authenticated request
3. **Check Suspicious Status**: Warn if session is flagged
4. **Session Validation**: Verify session is active and valid

### Testing Guide

#### Prerequisites
1. Install dependencies: `npm install ua-parser-js`
2. Start server: `npm start`
3. Obtain JWT token via login

#### Test Scenarios

**Test 1: View Active Sessions**
```bash
curl -X GET http://localhost:1124/api/devices/sessions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Test 2: Remote Logout**
```bash
curl -X POST http://localhost:1124/api/devices/sessions/SESSION_ID/revoke \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Unknown device"}'
```

**Test 3: Logout from All Other Devices**
```bash
curl -X POST http://localhost:1124/api/devices/sessions/revoke-all \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Test 4: View Login History**
```bash
curl -X GET "http://localhost:1124/api/devices/history?limit=20&status=success" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Test 5: Check Suspicious Sessions**
```bash
curl -X GET http://localhost:1124/api/devices/suspicious \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Test 6: View Statistics**
```bash
curl -X GET http://localhost:1124/api/devices/statistics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Best Practices

#### For Users:
1. **Regular Review**: Check active sessions weekly
2. **Immediate Action**: Revoke unknown sessions immediately
3. **Trust Management**: Only trust personal devices
4. **Monitor Alerts**: Review suspicious activity notifications
5. **Secure Logout**: Use "Logout All" after password changes

#### For Developers:
1. **Geolocation**: Integrate proper IP geolocation service (MaxMind, IP-API)
2. **Email Notifications**: Send alerts for suspicious activities
3. **2FA Integration**: Require 2FA for high-risk sessions
4. **Rate Limiting**: Implement rate limits on session creation
5. **Monitoring**: Set up alerts for critical risk levels

### Error Handling

Common error scenarios:
- Session not found
- Cannot revoke current session
- Invalid session ID
- Unauthorized access
- Database connection issues

All errors return appropriate HTTP status codes and bilingual messages.

### Performance Considerations

- **Indexes**: Optimized for user, deviceId, status, expiresAt
- **TTL Index**: Automatic cleanup of expired sessions
- **Lean Queries**: Use `.lean()` for read-only operations
- **Selective Fields**: Don't expose sensitive tokens in responses
- **Batch Operations**: Use Promise.all for multiple revocations

---

## Tài Liệu Tiếng Việt

### Tổng Quan
Task 33 triển khai hệ thống quản lý phiên đa thiết bị toàn diện với các tính năng bảo mật bao gồm theo dõi thiết bị, phát hiện hoạt động đáng ngờ, khả năng đăng xuất từ xa và giám sát lịch sử đăng nhập. Hệ thống giúp người dùng quản lý các phiên hoạt động của họ trên nhiều thiết bị và phát hiện các nỗ lực truy cập trái phép.

### Tính Năng Chính

1. **Theo Dõi Phiên Thiết Bị**: Theo dõi tất cả phiên người dùng trên các thiết bị khác nhau với thông tin thiết bị chi tiết
2. **Phát Hiện Hoạt Động Đáng Ngờ**: Tự động phát hiện các mẫu đăng nhập đáng ngờ và hoạt động bất thường
3. **Đăng Xuất Từ Xa**: Khả năng thu hồi phiên từ xa từ bất kỳ thiết bị nào
4. **Thiết Bị Đáng Tin Cậy**: Quản lý và xác minh các thiết bị đáng tin cậy
5. **Lịch Sử Đăng Nhập**: Dấu vết kiểm tra đầy đủ của tất cả nỗ lực đăng nhập
6. **Giám Sát Phiên Real-time**: Theo dõi các phiên hoạt động với timestamp hoạt động cuối cùng
7. **Cảnh Báo Bảo Mật**: Thông báo cho các hoạt động đáng ngờ
8. **Dấu Vân Tay Thiết Bị**: Nhận dạng thiết bị duy nhất để tăng cường bảo mật

### Các Endpoint API

Tất cả endpoints yêu cầu xác thực JWT (`Authorization: Bearer <token>`).

#### 1. Xem Tất Cả Phiên
```
GET /api/devices/sessions
```

Lấy danh sách tất cả phiên hoạt động của người dùng hiện tại.

#### 2. Xem Phiên Hiện Tại
```
GET /api/devices/sessions/current
```

Lấy thông tin chi tiết về phiên đang hoạt động.

#### 3. Đăng Xuất Từ Xa
```
POST /api/devices/sessions/:sessionId/revoke
```

Thu hồi một phiên cụ thể (đăng xuất thiết bị từ xa).

**Trường hợp sử dụng:**
- Người dùng thấy thiết bị lạ trong danh sách phiên
- Muốn đăng xuất từ một thiết bị cụ thể từ xa
- Biện pháp bảo mật sau khi phát hiện hoạt động đáng ngờ

#### 4. Đăng Xuất Khỏi Tất Cả Thiết Bị Khác
```
POST /api/devices/sessions/revoke-all
```

Đăng xuất khỏi tất cả thiết bị trừ thiết bị hiện tại.

**Trường hợp sử dụng:**
- Quên đăng xuất từ máy tính công cộng
- Biện pháp phòng ngừa sau khi đổi mật khẩu
- Nghi ngờ tài khoản bị xâm phạm

#### 5. Xác Minh Thiết Bị
```
POST /api/devices/sessions/:sessionId/verify
```

Đánh dấu thiết bị là đáng tin cậy sau khi xác minh.

#### 6. Xem Thiết Bị Đáng Tin Cậy
```
GET /api/devices/trusted
```

Trả về danh sách tất cả thiết bị đáng tin cậy.

#### 7. Thu Hồi Thiết Bị Đáng Tin Cậy
```
DELETE /api/devices/trusted/:deviceId
```

Thu hồi lòng tin và đăng xuất tất cả phiên từ thiết bị đó.

#### 8. Xem Lịch Sử Đăng Nhập
```
GET /api/devices/history
```

Lấy lịch sử đầy đủ các lần đăng nhập (thành công và thất bại).

#### 9. Xem Phiên Đáng Ngờ
```
GET /api/devices/suspicious
```

Trả về tất cả phiên được đánh dấu là đáng ngờ.

#### 10. Xem Thống Kê Phiên
```
GET /api/devices/statistics
```

Thống kê tổng quan về phiên và hoạt động.

#### 11. Dọn Dẹp Phiên Hết Hạn (Admin)
```
POST /api/devices/cleanup
```

Endpoint quản trị để dọn dẹp thủ công các phiên hết hạn.

### Phát Hiện Hoạt Động Đáng Ngờ

Hệ thống tự động phát hiện hoạt động đáng ngờ dựa trên nhiều yếu tố:

#### Quy Tắc Phát Hiện:

1. **Quá Nhiều Phiên Hoạt Động**
   - Điểm Rủi Ro: +20
   - Kích Hoạt: Hơn 5 phiên hoạt động đồng thời

2. **Nhiều Quốc Gia Trong Thời Gian Ngắn**
   - Điểm Rủi Ro: +30
   - Mức Rủi Ro: Cao
   - Kích Hoạt: Đăng nhập từ 2+ quốc gia trong vòng 30 phút

3. **Thiết Bị Lạ Từ Vị Trí Lạ**
   - Điểm Rủi Ro: +15
   - Kích Hoạt: Thiết bị lần đầu + không khớp thiết bị đáng tin cậy

4. **Thời Gian Đăng Nhập Bất Thường**
   - Điểm Rủi Ro: +10
   - Kích Hoạt: Đăng nhập giữa 2-5 giờ sáng giờ địa phương

5. **Tạo Phiên Nhanh Chóng**
   - Điểm Rủi Ro: +25
   - Mức Rủi Ro: Nghiêm Trọng
   - Kích Hoạt: Hơn 3 phiên được tạo trong vòng 10 phút

6. **Phát Hiện VPN/Proxy**
   - Điểm Rủi Ro: +10
   - Kích Hoạt: Phát hiện dải IP riêng tư

#### Mức Độ Rủi Ro:
- **Thấp** (0-14): Hoạt động bình thường
- **Trung Bình** (15-29): Hơi đáng ngờ
- **Cao** (30-49): Rất đáng ngờ, cần chú ý
- **Nghiêm Trọng** (50+): Có thể tài khoản bị xâm phạm

### Tính Năng Bảo Mật

#### 1. Dấu Vân Tay Thiết Bị
Tạo định danh duy nhất dựa trên:
- User agent
- Accept-Language header
- Accept-Encoding header
- Địa chỉ IP

#### 2. Hết Hạn Phiên
- Mặc định: 30 ngày
- Tự động dọn dẹp qua MongoDB TTL index
- Thu hồi thủ công có sẵn

#### 3. Ghi Log Hoạt Động
Mỗi phiên ghi log:
- Timestamp đăng nhập
- Mỗi hoạt động với IP và chi tiết
- Đăng xuất/thu hồi với lý do
- Sự kiện phát hiện hoạt động đáng ngờ

#### 4. Quản Lý Thiết Bị Đáng Tin Cậy
- Thiết bị lần đầu yêu cầu xác minh
- Thiết bị đáng tin cậy bỏ qua kiểm tra bổ sung
- Lòng tin có thể được thu hồi bất cứ lúc nào
- Theo dõi riêng biệt với phiên

### Tích Hợp Với Xác Thực

Middleware auth đã được nâng cao để:

1. **Theo Dõi Phiên Thiết Bị**: Tự động tìm và đính kèm phiên vào request
2. **Cập Nhật Hoạt Động**: Ghi log mỗi request đã xác thực
3. **Kiểm Tra Trạng Thái Đáng Ngờ**: Cảnh báo nếu phiên được đánh dấu
4. **Xác Thực Phiên**: Xác minh phiên đang hoạt động và hợp lệ

### Hướng Dẫn Kiểm Thử

#### Chuẩn Bị
1. Cài đặt dependencies: `npm install ua-parser-js`
2. Khởi động server: `npm start`
3. Lấy JWT token qua đăng nhập

#### Kịch Bản Kiểm Thử

**Test 1: Xem Phiên Hoạt Động**
```bash
curl -X GET http://localhost:1124/api/devices/sessions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Test 2: Đăng Xuất Từ Xa**
```bash
curl -X POST http://localhost:1124/api/devices/sessions/SESSION_ID/revoke \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Thiết bị lạ"}'
```

**Test 3: Đăng Xuất Khỏi Tất Cả Thiết Bị Khác**
```bash
curl -X POST http://localhost:1124/api/devices/sessions/revoke-all \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Test 4: Xem Lịch Sử Đăng Nhập**
```bash
curl -X GET "http://localhost:1124/api/devices/history?limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Test 5: Kiểm Tra Phiên Đáng Ngờ**
```bash
curl -X GET http://localhost:1124/api/devices/suspicious \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Thực Hành Tốt Nhất

#### Cho Người Dùng:
1. **Xem Xét Định Kỳ**: Kiểm tra phiên hoạt động hàng tuần
2. **Hành Động Ngay Lập Tức**: Thu hồi phiên lạ ngay lập tức
3. **Quản Lý Lòng Tin**: Chỉ tin tưởng thiết bị cá nhân
4. **Giám Sát Cảnh Báo**: Xem xét thông báo hoạt động đáng ngờ
5. **Đăng Xuất An Toàn**: Sử dụng "Đăng Xuất Tất Cả" sau khi đổi mật khẩu

#### Cho Nhà Phát Triển:
1. **Geolocation**: Tích hợp dịch vụ định vị IP phù hợp (MaxMind, IP-API)
2. **Thông Báo Email**: Gửi cảnh báo cho hoạt động đáng ngờ
3. **Tích Hợp 2FA**: Yêu cầu 2FA cho phiên có rủi ro cao
4. **Giới Hạn Tốc Độ**: Triển khai giới hạn tốc độ trên tạo phiên
5. **Giám Sát**: Thiết lập cảnh báo cho mức rủi ro nghiêm trọng

### Xử Lý Lỗi

Các tình huống lỗi phổ biến:
- Không tìm thấy phiên
- Không thể thu hồi phiên hiện tại
- ID phiên không hợp lệ
- Truy cập trái phép
- Vấn đề kết nối database

Tất cả lỗi trả về mã trạng thái HTTP phù hợp và thông báo song ngữ.

---

## Implementation Details

### Files Created

1. **src/models/DeviceSession.js**
   - DeviceSessionSchema: Track all user sessions
   - LoginHistorySchema: Audit trail of login attempts
   - TrustedDeviceSchema: Manage verified devices

2. **src/services/deviceService.js**
   - createDeviceSession()
   - getUserSessions()
   - revokeSession()
   - revokeAllSessionsExceptCurrent()
   - detectSuspiciousActivity()
   - verifyDevice()
   - getTrustedDevices()
   - getLoginHistory()
   - getSuspiciousSessions()
   - getSessionStatistics()

3. **src/controllers/deviceController.js**
   - 11 controller functions
   - Comprehensive error handling
   - Bilingual responses

4. **src/routes/deviceRoutes.js**
   - 11 protected routes
   - JWT authentication
   - RESTful design

5. **src/middleware/auth.js** (Updated)
   - Integrated device session tracking
   - Activity logging on each request
   - Suspicious activity warnings

6. **server.js** (Updated)
   - Route registration at `/api/devices`

### Dependencies

**Required Installation:**
```bash
npm install ua-parser-js
```

Already installed:
- `mongoose` - MongoDB ODM
- `express` - Web framework
- `jsonwebtoken` - JWT authentication
- `crypto` - Built-in Node.js module

### Database Indexes

Optimized for performance:
- `user` field indexed in all schemas
- `deviceId` indexed for device lookup
- `status` indexed for session queries
- `expiresAt` with TTL index for auto-cleanup
- Compound indexes for user + status queries

---

## Summary

Task 33 provides a comprehensive device and session management system that:

✅ Tracks all user sessions across multiple devices
✅ Detects suspicious activities automatically
✅ Enables remote logout from any device
✅ Manages trusted devices separately
✅ Maintains complete login history audit trail
✅ Provides real-time session monitoring
✅ Implements device fingerprinting for security
✅ Offers flexible session revocation options
✅ Full bilingual support (English + Vietnamese)
✅ Integrates seamlessly with existing auth system
✅ Comprehensive security features
✅ Production-ready with error handling

The system is ready for testing after installing `ua-parser-js`! 🚀

## Installation Command

```bash
cd backend
npm install ua-parser-js
```
