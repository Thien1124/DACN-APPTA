# Hệ Thống Phát Hiện Hoạt Động Đáng Ngờ
# Suspicious Activity Detection System

## 📊 Tổng Quan / Overview

Hệ thống tự động phân tích mỗi lần đăng nhập và tính điểm rủi ro (Risk Score) dựa trên **6 quy tắc bảo mật**. Điểm càng cao = càng đáng ngờ.

The system automatically analyzes each login and calculates a Risk Score based on **6 security rules**. Higher score = more suspicious.

---

## 🎯 6 Quy Tắc Phát Hiện / 6 Detection Rules

### ✅ Đăng Nhập Bình Thường (Risk Score: 0-14)
**Normal Login** - No suspicious activities detected

**Ví dụ:**
- ✅ Đăng nhập từ thiết bị đã tin cậy
- ✅ Vị trí thường xuyên (nhà, công ty)
- ✅ Giờ giấc bình thường (6 AM - 2 AM)
- ✅ Không có nhiều phiên đồng thời

---

### ⚠️ Quy Tắc 1: Quá Nhiều Phiên Hoạt Động
**Rule 1: Too Many Active Sessions**

**Điều kiện kích hoạt:**
- Có hơn 5 phiên đang hoạt động cùng lúc
- More than 5 active sessions simultaneously

**Điểm rủi ro:** +20 points

**Ví dụ:**
```
User có 6 phiên active:
1. iPhone 13 - Chrome (Vietnam)
2. MacBook Pro - Safari (Vietnam)
3. Windows PC - Edge (Vietnam)
4. Android Tablet - Chrome (Vietnam)  
5. iPad - Safari (Vietnam)
6. Unknown Device - Chrome (Vietnam) ← Phiên thứ 6 = Đáng ngờ!
```

**Lý do đáng ngờ:**
- Người dùng thông thường chỉ dùng 2-3 thiết bị
- 5+ thiết bị có thể là dấu hiệu tài khoản bị chia sẻ hoặc hack

---

### 🚨 Quy Tắc 2: Nhiều Quốc Gia Trong Thời Gian Ngắn
**Rule 2: Multiple Countries in Short Time**

**Điều kiện kích hoạt:**
- Đăng nhập từ 2+ quốc gia khác nhau trong vòng 30 phút
- Logins from 2+ different countries within 30 minutes

**Điểm rủi ro:** +30 points
**Mức độ:** HIGH (Cao)

**Ví dụ:**
```
10:00 AM - Login từ Vietnam
10:15 AM - Login từ USA ← Không thể di chuyển nhanh vậy!
10:25 AM - Login từ Singapore ← CỰC KỲ ĐÁNG NGỜ!
```

**Lý do đáng ngờ:**
- Con người không thể di chuyển giữa các quốc gia trong 30 phút
- Rất có thể là:
  * Tài khoản bị hack bởi nhiều người ở nhiều nơi
  * Sử dụng VPN để giả mạo vị trí
  * Botnet tấn công tài khoản

---

### ⚠️ Quy Tắc 3: Thiết Bị Lạ Từ Vị Trí Lạ
**Rule 3: Unknown Device from Unknown Location**

**Điều kiện kích hoạt:**
- Thiết bị chưa từng đăng nhập (isFirstTime = true)
- VÀ không có trong danh sách thiết bị đáng tin cậy
- Device never logged in before AND not in trusted device list

**Điểm rủi ro:** +15 points

**Ví dụ:**
```
Thiết bị thường dùng:
✅ iPhone 13 (fingerprint: abc123) - Trusted
✅ MacBook Pro (fingerprint: def456) - Trusted

Thiết bị mới:
⚠️ Unknown Android (fingerprint: xyz789) - NOT Trusted
   └─> Đăng nhập lần đầu = Đáng ngờ!
```

**Lý do đáng ngờ:**
- Người dùng thật thường dùng cùng một vài thiết bị
- Thiết bị lạ đột ngột xuất hiện có thể là:
  * Hacker dùng thiết bị khác
  * Phishing attack
  * Credential stuffing

---

### 🌙 Quy Tắc 4: Thời Gian Đăng Nhập Bất Thường
**Rule 4: Unusual Login Time**

**Điều kiện kích hoạt:**
- Đăng nhập từ 2:00 AM đến 5:00 AM (giờ địa phương)
- Login between 2:00 AM - 5:00 AM (local time)

**Điểm rủi ro:** +10 points

**Ví dụ:**
```
Lịch sử đăng nhập bình thường:
✅ 08:00 AM - Login (Normal)
✅ 12:30 PM - Login (Normal)
✅ 06:00 PM - Login (Normal)
✅ 11:00 PM - Login (Normal)

Đăng nhập đáng ngờ:
⚠️ 03:30 AM - Login ← Giờ lạ!
```

**Lý do đáng ngờ:**
- Đa số người dùng ngủ từ 2-5 AM
- Đăng nhập giờ này có thể là:
  * Bot tự động
  * Hacker ở múi giờ khác
  * Brute force attack

**Lưu ý:** 
- Có một số người dùng thật làm việc đêm
- Nên kết hợp với các quy tắc khác để xác định

---

### 🔥 Quy Tắc 5: Tạo Phiên Quá Nhanh
**Rule 5: Rapid Session Creation**

**Điều kiện kích hoạt:**
- Tạo hơn 3 phiên trong vòng 10 phút
- More than 3 sessions created within 10 minutes

**Điểm rủi ro:** +25 points
**Mức độ:** CRITICAL (Nghiêm trọng)

**Ví dụ:**
```
10:00:00 - Session 1 created
10:02:30 - Session 2 created
10:05:15 - Session 3 created
10:07:45 - Session 4 created ← Session thứ 4 trong 10 phút!

RiskLevel = CRITICAL! 🚨
```

**Lý do đáng ngờ:**
- Người dùng thật không cần login liên tục nhiều lần
- Có thể là:
  * **Brute force attack**: Thử nhiều mật khẩu
  * **Credential stuffing**: Dùng leaked passwords
  * **Automated bot**: Tấn công tự động
  * **Account takeover attempt**: Cố chiếm tài khoản

---

### 🔒 Quy Tắc 6: Phát Hiện VPN/Proxy
**Rule 6: VPN/Proxy Detection**

**Điều kiện kích hoạt:**
- IP address nằm trong dải private IP
- IP address is in private IP range

**Điểm rủi ro:** +10 points

**Các dải IP đáng ngờ:**
```
10.0.0.0    - 10.255.255.255   (Class A)
172.16.0.0  - 172.31.255.255   (Class B)
192.168.0.0 - 192.168.255.255  (Class C)
```

**Ví dụ:**
```
Normal IP:
✅ 203.162.4.190 (Vietnam ISP) - OK

Suspicious IP:
⚠️ 10.0.0.15 (Private IP) - Có thể là VPN/Proxy
⚠️ 192.168.1.100 (Local network) - Đằng sau firewall
```

**Lý do đáng ngờ:**
- Private IP thường bị NAT/Proxy che giấu
- Hacker dùng VPN để ẩn danh
- Có thể là:
  * VPN commercial (NordVPN, ExpressVPN)
  * Tor network
  * Corporate proxy
  * Botnet proxy

**Lưu ý:**
- Một số công ty dùng VPN hợp pháp
- Cần cải thiện detection với database VPN thực

---

## 📊 Bảng Tính Điểm Rủi Ro / Risk Score Table

| Quy Tắc | Điều Kiện | Điểm | Mức Độ |
|---------|-----------|------|---------|
| Rule 1 | >5 active sessions | +20 | Medium |
| Rule 2 | 2+ countries in 30 min | +30 | **HIGH** |
| Rule 3 | New device + new location | +15 | Medium |
| Rule 4 | Login at 2-5 AM | +10 | Low |
| Rule 5 | >3 sessions in 10 min | +25 | **CRITICAL** |
| Rule 6 | VPN/Proxy detected | +10 | Low |

**Tổng điểm có thể:** 0 - 110 points

---

## 🎨 Phân Loại Mức Độ Rủi Ro / Risk Level Classification

### 🟢 LOW (Thấp) - Risk Score: 0-14
**Đăng nhập bình thường / Normal login**

**Đặc điểm:**
- Thiết bị đã biết
- Vị trí thường xuyên
- Giờ giấc hợp lý
- Không có dấu hiệu bất thường

**Hành động:** Không cần làm gì ✅

---

### 🟡 MEDIUM (Trung Bình) - Risk Score: 15-29
**Hơi đáng ngờ / Slightly suspicious**

**Đặc điểm:**
- Có 1-2 dấu hiệu bất thường
- Ví dụ: Thiết bị mới HOẶC giờ lạ

**Hành động:**
- ⚠️ Đánh dấu phiên là "suspicious"
- 📧 Gửi email thông báo cho user
- 🔔 Hiển thị notification trong app
- Cho phép tiếp tục sử dụng (không block)

**Email mẫu:**
```
Subject: Đăng nhập mới phát hiện từ thiết bị lạ

Xin chào,

Chúng tôi phát hiện đăng nhập mới vào tài khoản của bạn:
- Thiết bị: Chrome on Windows
- Vị trí: Ho Chi Minh City, Vietnam
- Thời gian: 2025-11-10 15:30:00

Nếu đây là bạn, bạn có thể bỏ qua email này.
Nếu không phải bạn, vui lòng đổi mật khẩu ngay!

[Xem tất cả phiên đăng nhập] [Đổi mật khẩu]
```

---

### 🟠 HIGH (Cao) - Risk Score: 30-49
**Rất đáng ngờ / Very suspicious**

**Đặc điểm:**
- Có nhiều dấu hiệu bất thường
- Ví dụ: Nhiều quốc gia + thiết bị lạ

**Hành động:**
- 🚨 Đánh dấu phiên là "suspicious" với HIGH risk
- 📧 Gửi email cảnh báo KHẨN CẤP
- 🔔 Push notification ngay lập tức
- 🔐 **YÊU CẦU 2FA** để tiếp tục
- ⏸️ Tạm khóa một số tính năng nhạy cảm (chuyển tiền, đổi password)

**Email mẫu:**
```
Subject: ⚠️ CẢNH BÁO: Hoạt động đáng ngờ phát hiện!

CẢNH BÁO BẢO MẬT!

Chúng tôi phát hiện hoạt động BẤT THƯỜNG:
- Đăng nhập từ 2 quốc gia khác nhau trong 30 phút
- Thiết bị: Unknown Android
- Vị trí: USA (Trước đó: Vietnam)
- Điểm rủi ro: 45/100

⚠️ HÀNH ĐỘNG NGAY:
1. Xem xét tất cả phiên đăng nhập
2. Đăng xuất các thiết bị lạ
3. Đổi mật khẩu ngay lập tức
4. Bật xác thực 2 yếu tố (2FA)

[Xem phiên đăng nhập] [Đổi mật khẩu ngay] [Đăng xuất tất cả]
```

---

### 🔴 CRITICAL (Nghiêm Trọng) - Risk Score: 50+
**Rất có thể tài khoản bị xâm phạm / Likely account compromise**

**Đặc điểm:**
- Nhiều dấu hiệu nghiêm trọng
- Ví dụ: Tạo phiên quá nhanh + nhiều quốc gia + VPN

**Hành động:**
- 🚨 **TẠM KHÓA PHIÊN NGAY LẬP TỨC**
- 📧 Gửi email cảnh báo NGHIÊM TRỌNG
- 📱 Gửi SMS verification code
- 🔐 **BẮT BUỘC 2FA** để mở khóa
- ⛔ Khóa tất cả tính năng nhạy cảm
- 👮 Báo cáo cho admin/security team
- 📊 Log vào security audit trail

**Email mẫu:**
```
Subject: 🚨 KHẨN CẤP: Tài khoản có thể bị xâm phạm!

⛔ CẢNH BÁO NGHIÊM TRỌNG ⛔

Tài khoản của bạn đang có dấu hiệu BỊ TẤN CÔNG:
- 5 lần đăng nhập thất bại trong 5 phút
- Đăng nhập từ 3 quốc gia khác nhau
- Sử dụng VPN/Proxy
- Điểm rủi ro: 75/100 (CRITICAL)

🔒 TÀI KHOẢN ĐÃ BỊ TẠM KHÓA để bảo vệ bạn!

Để mở khóa:
1. Xác nhận danh tính qua email
2. Nhập mã OTP từ SMS
3. Đổi mật khẩu ngay lập tức
4. Xem xét và xóa tất cả phiên lạ

[Xác minh danh tính] [Liên hệ hỗ trợ]
```

---

## 🔍 Ví Dụ Tình Huống / Example Scenarios

### Tình Huống 1: Người Dùng Bình Thường ✅
**Normal User**

```
User: John Doe
Devices: iPhone 13, MacBook Pro (both trusted)
Location: Always Vietnam
Login times: 8 AM - 11 PM

Latest login:
- Device: iPhone 13 (trusted)
- Location: Vietnam
- Time: 10:00 AM
- Active sessions: 2

Risk Analysis:
✅ Rule 1: 2 sessions < 5 → OK (0 points)
✅ Rule 2: Only 1 country → OK (0 points)
✅ Rule 3: Trusted device → OK (0 points)
✅ Rule 4: 10 AM normal time → OK (0 points)
✅ Rule 5: No rapid creation → OK (0 points)
✅ Rule 6: Public IP → OK (0 points)

Total Risk Score: 0
Risk Level: LOW 🟢
Action: None needed
```

---

### Tình Huống 2: Du Lịch Nước Ngoài ⚠️
**Traveling Abroad**

```
User: Jane Smith
Usual location: Vietnam

Travel log:
09:00 AM - Login from Vietnam (trusted iPhone)
02:00 PM - Flight to Singapore
06:00 PM - Login from Singapore (same iPhone)

Risk Analysis:
✅ Rule 1: 2 sessions < 5 → OK (0 points)
⚠️ Rule 2: 2 countries in 9 hours → OK (0 points) [> 30 min]
✅ Rule 3: Trusted device → OK (0 points)
✅ Rule 4: 6 PM normal time → OK (0 points)
✅ Rule 5: 2 sessions in 9 hours → OK (0 points)
✅ Rule 6: Public IP → OK (0 points)

Total Risk Score: 0
Risk Level: LOW 🟢
Action: None (Same trusted device, realistic travel time)
```

---

### Tình Huống 3: Thiết Bị Mới 🟡
**New Device**

```
User: Mike Johnson
Usual devices: iPhone, MacBook (trusted)

New activity:
11:00 PM - Login from new Windows PC
Location: Vietnam (same as usual)

Risk Analysis:
✅ Rule 1: 3 sessions < 5 → OK (0 points)
✅ Rule 2: Only 1 country → OK (0 points)
⚠️ Rule 3: NEW device, same location → +15 points
✅ Rule 4: 11 PM acceptable → OK (0 points)
✅ Rule 5: No rapid creation → OK (0 points)
✅ Rule 6: Public IP → OK (0 points)

Total Risk Score: 15
Risk Level: MEDIUM 🟡
Action: 
- Send notification email
- Suggest device verification
- Allow login but monitor
```

---

### Tình Huống 4: Tài Khoản Bị Hack 🔴
**Account Compromised**

```
User: Sarah Lee
Usual: Vietnam, 2 devices

Suspicious activity detected:
10:00 AM - Login from Vietnam (iPhone - normal)
10:15 AM - Login from USA (Unknown Android) ← WEIRD!
10:20 AM - Login from Russia (Unknown Windows) ← VERY WEIRD!
10:25 AM - Login from China (Unknown Device) ← EXTREMELY WEIRD!
10:30 AM - Failed login attempt x 5

Risk Analysis:
🚨 Rule 1: 7 active sessions → +20 points
🚨 Rule 2: 4 countries in 30 min → +30 points
🚨 Rule 3: 3 new devices → +15 points
✅ Rule 4: 10 AM normal → OK (0 points)
🚨 Rule 5: 4 sessions in 30 min → +25 points
🚨 Rule 6: 2 VPN IPs detected → +10 points

Total Risk Score: 100
Risk Level: CRITICAL 🔴
Action:
- IMMEDIATELY LOCK ALL SESSIONS
- Force password reset
- Require 2FA verification
- Send SMS + Email alerts
- Notify security team
- Create incident report
```

---

### Tình Huống 5: Brute Force Attack 🔴
**Brute Force Attack**

```
Attacker IP: 192.168.1.100 (Proxy)

Activity log:
03:15 AM - Login attempt #1 (Failed)
03:16 AM - Login attempt #2 (Failed)
03:17 AM - Login attempt #3 (Failed)
03:18 AM - Login attempt #4 (Failed)
03:19 AM - Login attempt #5 (Success!) ← Password cracked!

Risk Analysis:
✅ Rule 1: First successful session → OK (0 points)
✅ Rule 2: Same location → OK (0 points)
⚠️ Rule 3: New device + location → +15 points
🚨 Rule 4: 3 AM unusual time → +10 points
🚨 Rule 5: 5 attempts in 5 min → +25 points
🚨 Rule 6: Private IP (Proxy) → +10 points

Total Risk Score: 60
Risk Level: CRITICAL 🔴

Additional factors:
- Multiple failed attempts before success
- Unusual hour (3 AM)
- Sequential timing (1 min apart)
- Proxy IP

Action:
- BLOCK SESSION IMMEDIATELY
- Lock account
- Require identity verification
- Force password reset + 2FA
- Add IP to blocklist
- Investigate breach source
```

---

## 📱 Giao Diện User / User Interface

### Dashboard Quản Lý Phiên
**Session Management Dashboard**

```
╔════════════════════════════════════════════════════════╗
║  🔐 Quản Lý Phiên Đăng Nhập                           ║
╠════════════════════════════════════════════════════════╣
║                                                         ║
║  📊 Thống Kê:                                          ║
║  • Phiên hoạt động: 3                                  ║
║  • Phiên đáng ngờ: 1 ⚠️                               ║
║  • Thiết bị đáng tin: 2                                ║
║                                                         ║
║  ─────────────────────────────────────────────────────  ║
║                                                         ║
║  📱 PHIÊN HIỆN TẠI (Bạn đang ở đây)                    ║
║  ┌─────────────────────────────────────────────────┐  ║
║  │ 🖥️  Chrome on Windows                           │  ║
║  │ 📍  Ho Chi Minh City, Vietnam                    │  ║
║  │ ⏰  Hoạt động: 2 phút trước                       │  ║
║  │ 🟢  Trạng thái: Active | Risk: LOW               │  ║
║  └─────────────────────────────────────────────────┘  ║
║                                                         ║
║  ─────────────────────────────────────────────────────  ║
║                                                         ║
║  📱 PHIÊN KHÁC                                          ║
║  ┌─────────────────────────────────────────────────┐  ║
║  │ 📱  Safari on iPhone 13                          │  ║
║  │ 📍  Ho Chi Minh City, Vietnam                    │  ║
║  │ ⏰  Hoạt động: 1 giờ trước                        │  ║
║  │ 🟢  Trạng thái: Active | Risk: LOW               │  ║
║  │                                                   │  ║
║  │     [Xem chi tiết] [Đăng xuất thiết bị này]     │  ║
║  └─────────────────────────────────────────────────┘  ║
║                                                         ║
║  ┌─────────────────────────────────────────────────┐  ║
║  │ 🤖  Unknown Android Device                       │  ║
║  │ 📍  United States                                 │  ║
║  │ ⏰  Hoạt động: 5 phút trước                       │  ║
║  │ 🟠  Trạng thái: Suspicious | Risk: HIGH          │  ║
║  │                                                   │  ║
║  │ ⚠️  Cảnh báo: Thiết bị lạ từ quốc gia khác!      │  ║
║  │                                                   │  ║
║  │  [🚨 ĐĂNG XUẤT NGAY] [Đánh dấu an toàn]         │  ║
║  └─────────────────────────────────────────────────┘  ║
║                                                         ║
║  ─────────────────────────────────────────────────────  ║
║                                                         ║
║  [🔒 Đăng xuất tất cả thiết bị khác]                  ║
║  [📜 Xem lịch sử đăng nhập đầy đủ]                    ║
║                                                         ║
╚════════════════════════════════════════════════════════╝
```

---

## 🛠️ Cách Test / How to Test

### Test 1: Kiểm Tra Đăng Nhập Bình Thường
```bash
# Login bình thường
POST http://localhost:1124/api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

# Check session
GET http://localhost:1124/api/devices/sessions
Authorization: Bearer YOUR_TOKEN

# Expected: Risk score = 0, Level = LOW
```

### Test 2: Simulate Thiết Bị Mới
```bash
# Đăng nhập từ user agent khác
POST http://localhost:1124/api/auth/login
Headers:
  User-Agent: Mozilla/5.0 (Android 12; Mobile) Chrome/95.0

# Check suspicious
GET http://localhost:1124/api/devices/suspicious

# Expected: Risk score = 15+, Level = MEDIUM
```

### Test 3: Simulate Rapid Login (Brute Force)
```bash
# Đăng nhập 4 lần trong 5 phút
for i in 1..4:
  POST http://localhost:1124/api/auth/login
  wait 1 minute

# Check suspicious
GET http://localhost:1124/api/devices/suspicious

# Expected: Risk score = 25+, Level = CRITICAL
```

### Test 4: Kiểm Tra Remote Logout
```bash
# Get session ID
GET http://localhost:1124/api/devices/sessions

# Revoke specific session
POST http://localhost:1124/api/devices/sessions/{SESSION_ID}/revoke
{
  "reason": "Unknown device"
}

# Verify revoked
GET http://localhost:1124/api/devices/sessions
# Expected: Session không còn trong list
```

---

## 🔧 Cải Tiến Trong Tương Lai / Future Improvements

### 1. IP Geolocation Service
```javascript
// Thay thế placeholder bằng real API
const geoip = require('geoip-lite');
const geo = geoip.lookup(ip);

session.location = {
  ip,
  country: geo.country,
  city: geo.city,
  timezone: geo.timezone,
  coordinates: {
    latitude: geo.ll[0],
    longitude: geo.ll[1]
  }
};
```

### 2. Machine Learning Model
```javascript
// Train model dựa trên lịch sử người dùng
const model = await tf.loadModel('suspicious-detection-model');
const prediction = model.predict(sessionFeatures);
const riskScore = prediction.dataSync()[0] * 100;
```

### 3. Device Fingerprinting Nâng Cao
```javascript
// Thêm nhiều thông tin hơn
const fingerprint = generateFingerprint({
  userAgent,
  screenResolution: req.body.screenResolution,
  timezone: req.body.timezone,
  language: req.headers['accept-language'],
  plugins: req.body.plugins,
  canvas: req.body.canvasFingerprint,
  webgl: req.body.webglFingerprint
});
```

### 4. Behavioral Biometrics
```javascript
// Phân tích hành vi người dùng
const behaviorAnalysis = {
  typingSpeed: calculateTypingSpeed(keystrokes),
  mouseMovement: analyzeMousePattern(movements),
  navigationPattern: analyzeNavigationPath(clicks),
  timeSpentOnPages: calculateAverageTime(sessions)
};
```

### 5. Real-time Alerts với WebSocket
```javascript
// Push notification ngay lập tức
if (riskLevel === 'high' || riskLevel === 'critical') {
  io.to(userId).emit('security-alert', {
    type: 'suspicious-login',
    session: sessionInfo,
    riskScore,
    timestamp: new Date()
  });
}
```

---

## 📚 Tài Liệu Tham Khảo / References

1. **OWASP Authentication Cheat Sheet**
   - https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html

2. **NIST Digital Identity Guidelines**
   - https://pages.nist.gov/800-63-3/

3. **Device Fingerprinting Best Practices**
   - https://github.com/fingerprintjs/fingerprintjs

4. **IP Geolocation Services**
   - MaxMind GeoIP2: https://www.maxmind.com/
   - IP-API: https://ip-api.com/

5. **Behavioral Biometrics**
   - BioCatch: https://www.biocatch.com/
   - BehavioSec: https://www.behaviosec.com/

---

## ✅ Checklist Bảo Mật / Security Checklist

- [x] Detect multiple active sessions
- [x] Detect rapid country changes
- [x] Track trusted vs unknown devices
- [x] Flag unusual login times
- [x] Detect rapid session creation
- [x] Basic VPN/Proxy detection
- [x] Calculate risk scores
- [x] Classify risk levels (LOW/MEDIUM/HIGH/CRITICAL)
- [x] Log all login history
- [x] Remote logout capability
- [x] Session management dashboard
- [ ] Send email alerts (framework ready)
- [ ] Send SMS notifications
- [ ] Require 2FA for high-risk
- [ ] Automatic session revocation for CRITICAL
- [ ] Real-time WebSocket alerts
- [ ] IP geolocation integration
- [ ] Advanced device fingerprinting
- [ ] Machine learning model
- [ ] Behavioral biometrics

---

## 📞 Liên Hệ / Support

Nếu có câu hỏi về hệ thống phát hiện hoạt động đáng ngờ, vui lòng liên hệ:
- Email: security@yourdomain.com
- Documentation: /docs/TASK_33_DEVICE_MANAGEMENT.md

---

**Last Updated:** November 10, 2025
**Version:** 1.0.0
**Author:** DACN-APPTA Team
