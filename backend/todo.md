# TODO: Cập nhật sau

## Task 10: Tích hợp 2FA vào login flow

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

### Code mẫu:
- Đã được cung cấp trong chat ngày 2025-10-24
- Tìm với từ khóa: "Tích hợp 2FA vào login flow"



