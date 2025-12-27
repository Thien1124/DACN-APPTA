# 👔 Hệ Thống Trang Phục (Outfit System)

## 📋 Tổng quan

Hệ thống trang phục cho phép người dùng mua và trang bị các trang phục khác nhau bằng kim cương (gems). Mỗi trang phục có độ hiếm, màu sắc, và danh mục riêng.

## 🎯 Tính năng

### 1. Loại Trang Phục

Trang phục được phân loại theo:

#### **Danh mục (Category)**
- `casual` - Trang phục thường ngày
- `formal` - Trang phục trang trọng
- `sporty` - Trang phục thể thao
- `fantasy` - Trang phục kỳ ảo
- `seasonal` - Trang phục theo mùa
- `premium` - Trang phục cao cấp

#### **Độ Hiếm (Rarity)**
- `common` - Thường (80-150 gems)
- `rare` - Hiếm (250-400 gems)
- `epic` - Sử thi (500-600 gems)
- `legendary` - Huyền thoại (1000+ gems)

### 2. Dữ liệu Trang Phục

Mỗi trang phục có:
- **name**: Tên trang phục
- **description**: Mô tả
- **price**: Giá gems
- **outfitData**:
  - `category`: Danh mục
  - `rarity`: Độ hiếm
  - `color`: Màu sắc (hex code)
  - `iconEmoji`: Biểu tượng emoji

## 🚀 API Endpoints

### 1. Lấy Danh Sách Trang Phục

```http
GET /api/shop/items?type=outfit
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "items": [
    {
      "_id": "...",
      "name": "Kimono Nhật Bản",
      "description": "Trang phục truyền thống Nhật Bản sang trọng",
      "type": "outfit",
      "price": {
        "gems": 500
      },
      "outfitData": {
        "category": "fantasy",
        "rarity": "epic",
        "color": "#E91E63",
        "iconEmoji": "👘"
      },
      "isAvailable": true
    }
  ]
}
```

### 2. Mua Trang Phục

```http
POST /api/shop/purchase
Authorization: Bearer {token}
Content-Type: application/json

{
  "itemId": "outfit_id_here"
}
```

**Response Success:**
```json
{
  "success": true,
  "message": "Mua vật phẩm thành công",
  "item": {
    "_id": "...",
    "name": "Kimono Nhật Bản",
    "type": "outfit",
    "outfitData": { ... }
  },
  "userStats": {
    "gems": {
      "amount": 4500
    },
    "hearts": {
      "current": 5,
      "max": 5
    }
  }
}
```

**Response Error (Không đủ gems):**
```json
{
  "success": false,
  "message": "Không đủ gems để mua vật phẩm này"
}
```

### 3. Trang Bị Outfit

```http
POST /api/shop/equip-outfit
Authorization: Bearer {token}
Content-Type: application/json

{
  "outfitId": "outfit_id_here"
}
```

**Response Success:**
```json
{
  "success": true,
  "message": "Đã trang bị outfit thành công",
  "currentOutfit": {
    "_id": "...",
    "name": "Kimono Nhật Bản",
    "outfitData": {
      "category": "fantasy",
      "rarity": "epic",
      "color": "#E91E63",
      "iconEmoji": "👘"
    }
  }
}
```

**Response Error (Chưa sở hữu):**
```json
{
  "success": false,
  "message": "Bạn chưa sở hữu outfit này. Vui lòng mua trước khi trang bị."
}
```

### 4. Lấy Outfit Hiện Tại

```http
GET /api/shop/current-outfit
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "currentOutfit": {
    "_id": "...",
    "name": "Kimono Nhật Bản",
    "outfitData": {
      "category": "fantasy",
      "rarity": "epic",
      "color": "#E91E63",
      "iconEmoji": "👘"
    }
  }
}
```

### 5. Xem Kho Đồ Outfit

```http
GET /api/shop/inventory?type=outfit
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "inventory": [
    {
      "_id": "...",
      "itemId": {
        "_id": "...",
        "name": "Kimono Nhật Bản",
        "type": "outfit",
        "outfitData": { ... }
      },
      "purchasedAt": "2025-12-27T...",
      "isActive": true
    }
  ]
}
```

## 🎨 Frontend Implementation

### Shop Page

Tab "Trang phục" hiển thị:
- Danh sách tất cả outfits có sẵn
- Màu gradient theo màu của outfit
- Emoji icon đại diện
- Giá gems
- Độ hiếm (common, rare, epic, legendary)

### Flow Mua & Trang Bị

1. User click vào outfit muốn mua
2. Hiện popup xác nhận với giá gems
3. Nếu đủ gems → mua thành công
4. Hỏi có muốn trang bị ngay không
5. Nếu Yes → gọi API equip-outfit
6. Outfit hiện tại được cập nhật

## 📝 Test Cases

### Test 1: Mua Outfit Thành Công
1. Đăng nhập và lấy token
2. Kiểm tra số gems hiện tại (GET /api/shop/gems)
3. Lấy danh sách outfits (GET /api/shop/items?type=outfit)
4. Mua một outfit (POST /api/shop/purchase)
5. Verify: gems giảm, outfit xuất hiện trong inventory

### Test 2: Mua Outfit Không Đủ Gems
1. Thử mua outfit đắt tiền (1200 gems) khi chỉ có ít gems
2. Verify: trả về error "Không đủ gems"

### Test 3: Trang Bị Outfit
1. Mua một outfit
2. Trang bị outfit (POST /api/shop/equip-outfit)
3. Lấy outfit hiện tại (GET /api/shop/current-outfit)
4. Verify: outfit đã được trang bị

### Test 4: Trang Bị Outfit Chưa Sở Hữu
1. Thử trang bị outfit chưa mua
2. Verify: trả về error "Bạn chưa sở hữu outfit này"

## 📊 Dữ Liệu Mẫu

### Common Outfits (80-100 gems)
- Áo Thun Xanh Cơ Bản - 100 gems
- Quần Jean Đơn Giản - 80 gems

### Rare Outfits (250-300 gems)
- Bộ Đồ Thể Thao - 250 gems
- Vest Lịch Lãm - 300 gems

### Epic Outfits (400-600 gems)
- Kimono Nhật Bản - 500 gems
- Bộ Đồ Ninja - 600 gems
- Bộ Đồ Giáng Sinh - 400 gems

### Legendary Outfits (1000-1200 gems)
- Bộ Giáp Vàng Huyền Thoại - 1000 gems
- Áo Choàng Phù Thủy - 1200 gems

## 🔧 Models

### ShopItem Model (Updated)
```javascript
{
  type: {
    enum: ['heart', 'boost', 'theme', 'avatar', 'outfit', 'other']
  },
  outfitData: {
    category: String,
    rarity: String,
    color: String,
    iconEmoji: String
  }
}
```

### User Model (Updated)
```javascript
{
  currentOutfit: {
    type: ObjectId,
    ref: 'ShopItem'
  }
}
```

## ✅ Checklist Hoàn Thành

- [x] Cập nhật ShopItem Model với outfit type và outfitData
- [x] Cập nhật User Model với currentOutfit field
- [x] Tạo seed data với 10+ outfits
- [x] Tạo API endpoint equip-outfit
- [x] Tạo API endpoint get current-outfit
- [x] Cập nhật frontend Shop.jsx để hiển thị outfits
- [x] Thêm logic tự động equip sau khi mua
- [x] Test các API endpoints

## 🎉 Kết Quả

Hệ thống trang phục đã được triển khai đầy đủ với:
- 10+ trang phục đa dạng
- 4 mức độ hiếm
- 6 danh mục khác nhau
- API đầy đủ cho mua, trang bị, và quản lý
- UI đẹp mắt với màu sắc và emoji

Người dùng có thể mua và trang bị trang phục để cá nhân hóa trải nghiệm học tập của mình!
