# 🔒 Ràng Buộc Mua Trang Phục 1 Lần Duy Nhất

## 📋 Mô Tả

Mỗi trang phục chỉ có thể được mua **1 lần duy nhất**. Sau khi đã sở hữu, trang phục sẽ hiển thị trạng thái "Đã sở hữu" và không thể mua lại.

## 🎯 Tính Năng

### Backend (API)

#### 1. Kiểm Tra Sở Hữu Khi Mua

Khi user mua outfit, hệ thống kiểm tra:
- Đã có outfit này trong inventory chưa?
- Nếu có → Trả về lỗi: "Bạn đã sở hữu trang phục này rồi"
- Nếu chưa → Cho phép mua

**Code trong `shopController.js`:**

```javascript
// Kiểm tra nếu là outfit, user đã sở hữu chưa
if (item.type === 'outfit') {
  const existingOutfit = await UserInventory.findOne({
    userId,
    itemId,
    isActive: true
  });
  
  if (existingOutfit) {
    return res.status(400).json({ 
      success: false, 
      message: 'Bạn đã sở hữu trang phục này rồi' 
    });
  }
}
```

#### 2. Response Error

```json
{
  "success": false,
  "message": "Bạn đã sở hữu trang phục này rồi"
}
```

### Frontend (UI)

#### 1. State Management

Thêm state để track outfits đã sở hữu:

```javascript
const [ownedOutfitIds, setOwnedOutfitIds] = useState([]);
```

#### 2. Load Owned Outfits

Khi load shop data, lấy danh sách outfit IDs đã sở hữu:

```javascript
// Load inventory
const inventoryData = await shopService.getInventory();
if (inventoryData.success) {
  setInventory(inventoryData.inventory);
  
  // Extract owned outfit IDs
  const outfitIds = inventoryData.inventory
    .filter(item => item.itemId?.type === 'outfit')
    .map(item => item.itemId._id);
  setOwnedOutfitIds(outfitIds);
}
```

#### 3. UI Display

**Badge "Đã Sở Hữu":**
- Hiển thị badge màu xanh lá
- Icon checkmark (✓)
- Text: "ĐÃ SỞ HỮU"

**Price Display:**
- Outfit chưa mua: Hiển thị giá gems bình thường (màu xanh dương)
- Outfit đã mua: Hiển thị "Đã sở hữu" (màu xám)

**Card Style:**
- Outfit chưa mua: Opacity 100%, cursor pointer
- Outfit đã mua: Opacity 70%, cursor not-allowed

**Code:**

```jsx
{currentProducts.map(product => {
  const formattedProduct = formatProduct(product);
  const isOwned = formattedProduct.type === 'outfit' && ownedOutfitIds.includes(formattedProduct._id);
  const canPurchase = !isPurchasing && !isOwned;
  
  return (
    <ProductCard 
      onClick={() => canPurchase && handlePurchase(formattedProduct)}
      style={{ 
        opacity: isOwned ? 0.7 : (isPurchasing ? 0.6 : 1), 
        cursor: canPurchase ? 'pointer' : 'not-allowed'
      }}
    >
      {isOwned && <OwnedBadge>✓ ĐÃ SỞ HỮU</OwnedBadge>}
      {/* ... rest of card ... */}
      <ProductPrice style={{ 
        background: isOwned ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)' : undefined 
      }}>
        <span>{isOwned ? 'Đã sở hữu' : formattedProduct.price}</span>
      </ProductPrice>
    </ProductCard>
  );
})}
```

#### 4. Refresh After Purchase

Sau khi mua thành công, cập nhật lại `ownedOutfitIds`:

```javascript
// Refresh inventory
const inventoryData = await shopService.getInventory();
if (inventoryData.success) {
  setInventory(inventoryData.inventory);
  
  // Update owned outfit IDs
  const outfitIds = inventoryData.inventory
    .filter(item => item.itemId?.type === 'outfit')
    .map(item => item.itemId._id);
  setOwnedOutfitIds(outfitIds);
}
```

## 🎨 Styled Components

### OwnedBadge

```javascript
const OwnedBadge = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: #10b981;  // Green
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;
```

## 📸 Visual States

### 1. Outfit Chưa Mua
```
┌──────────────────────┐
│                      │
│        👘           │
│                      │
│  Kimono Nhật Bản    │
│  Trang phục truyền  │
│  thống...           │
│                      │
│  💎 500 gems        │ <- Màu xanh dương
└──────────────────────┘
Cursor: pointer
Opacity: 100%
```

### 2. Outfit Đã Mua
```
┌──────────────────────┐
│ ✓ ĐÃ SỞ HỮU        │ <- Badge xanh lá
│        👘           │
│                      │
│  Kimono Nhật Bản    │
│  Trang phục truyền  │
│  thống...           │
│                      │
│  Đã sở hữu          │ <- Màu xám
└──────────────────────┘
Cursor: not-allowed
Opacity: 70%
```

## 🧪 Test Cases

### Test 1: Xem Outfit Chưa Mua
1. Vào trang Shop → Tab "Trang phục"
2. Xem outfit chưa sở hữu
3. **Kết quả**: 
   - Không có badge "Đã sở hữu"
   - Hiển thị giá gems màu xanh
   - Click được

### Test 2: Mua Outfit Lần Đầu
1. Click mua outfit
2. Xác nhận thanh toán
3. **Kết quả**: 
   - Mua thành công
   - Badge "Đã sở hữu" xuất hiện
   - Price đổi thành "Đã sở hữu" màu xám
   - Không click được nữa

### Test 3: Thử Mua Lại Outfit Đã Có
1. Click vào outfit đã sở hữu
2. **Kết quả**: 
   - Không có phản ứng (cursor: not-allowed)
   - Không hiện popup mua

### Test 4: Thử Call API Mua Lại
1. Dùng Postman/API client
2. Gọi POST `/api/shop/purchase` với outfit đã mua
3. **Kết quả**:
```json
{
  "success": false,
  "message": "Bạn đã sở hữu trang phục này rồi"
}
```

### Test 5: Refresh Page
1. Mua một outfit
2. Refresh trang
3. **Kết quả**: 
   - Badge "Đã sở hữu" vẫn hiển thị
   - State được load lại đúng

## 🔄 Flow Diagram

```
User clicks outfit
       ↓
Is outfit owned?
   ↙      ↘
 Yes      No
  ↓        ↓
Nothing  Show confirm popup
         ↓
    User confirms?
       ↙    ↘
     Yes    No
      ↓      ↓
  Call API  Cancel
      ↓
  Check owned (Backend)
     ↙    ↘
  Owned  Not owned
    ↓      ↓
  Error  Purchase success
         ↓
    Refresh inventory
         ↓
    Update ownedOutfitIds
         ↓
    UI updates badge
```

## ✅ Files Changed

### Backend
- `backend/src/controllers/shopController.js` - Thêm validation kiểm tra outfit đã sở hữu

### Frontend
- `frontend/src/pages/Shop.jsx`:
  - Thêm `ownedOutfitIds` state
  - Thêm `OwnedBadge` styled component
  - Cập nhật render logic để hiển thị trạng thái
  - Cập nhật refresh logic sau khi mua

## 🎉 Benefits

1. **Tránh mua trùng**: User không thể mua outfit đã có
2. **UI rõ ràng**: Biết ngay outfit nào đã sở hữu
3. **UX tốt hơn**: Không bị click nhầm vào outfit đã có
4. **Data integrity**: Backend validation đảm bảo không có duplicate
5. **Visual feedback**: Badge và màu sắc giúp phân biệt nhanh

## 🚀 Tương Lai

Có thể mở rộng:
- Hiển thị số lượng outfit đã sở hữu / tổng số
- Filter: "Đã sở hữu" / "Chưa sở hữu"
- Sort theo trạng thái sở hữu
- Collection progress bar
