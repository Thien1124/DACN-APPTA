# Postman Testing Guide - Task 16: Deck Search

## 🎯 Overview
Hướng dẫn test chi tiết các API tìm kiếm bộ thẻ theo từ khóa và tags.

---

## 📋 Setup

### 1. Import Collection vào Postman
Tạo một Collection mới tên "Task 16 - Deck Search"

### 2. Environment Variables
Tạo environment với variables:
```
base_url: http://localhost:1124
api_path: /api/decks
```

---

## 🧪 Test Cases

### Test 1: Tìm kiếm theo từ khóa đơn giản
**Mục đích**: Tìm deck có từ "business" trong title hoặc description

```
Method: GET
URL: {{base_url}}{{api_path}}/search?keyword=business&page=1&limit=10

Expected Result:
- Status: 200
- Trả về danh sách decks có chứa "business"
- Pagination info
- Search query details
```

**Sample Response:**
```json
{
  "success": true,
  "count": 5,
  "data": {
    "decks": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "pages": 1
    },
    "searchQuery": {
      "keyword": "business",
      "tags": [],
      "filters": {},
      "sort": "relevance"
    }
  }
}
```

---

### Test 2: Tìm kiếm theo tags
**Mục đích**: Tìm deck có tag "ielts" hoặc "business"

```
Method: GET
URL: {{base_url}}{{api_path}}/search?tags=ielts,business&sort=popular

Expected Result:
- Status: 200
- Trả về decks có tags khớp
- matchedTags array trong mỗi deck
```

**Validation:**
```javascript
// Tests tab in Postman
pm.test("Status code is 200", () => {
  pm.response.to.have.status(200);
});

pm.test("Response has decks array", () => {
  const jsonData = pm.response.json();
  pm.expect(jsonData.success).to.be.true;
  pm.expect(jsonData.data.decks).to.be.an('array');
});

pm.test("Each deck has matchedTags", () => {
  const jsonData = pm.response.json();
  jsonData.data.decks.forEach(deck => {
    pm.expect(deck).to.have.property('matchedTags');
    pm.expect(deck.matchedTags).to.be.an('array');
  });
});
```

---

### Test 3: Tìm kiếm kết hợp keyword + tags + filters
**Mục đích**: Search phức tạp với nhiều filters

```
Method: GET
URL: {{base_url}}{{api_path}}/search?keyword=english&tags=ielts&category=ACADEMIC&level=B1,B2&difficulty=INTERMEDIATE&minRating=4.0&sort=rating

Expected Result:
- Status: 200
- Kết quả được lọc theo tất cả filters
- Sắp xếp theo rating
```

**Filters Testing:**
```javascript
pm.test("All decks match filters", () => {
  const jsonData = pm.response.json();
  const decks = jsonData.data.decks;
  
  decks.forEach(deck => {
    // Check category
    pm.expect(deck.category).to.equal('ACADEMIC');
    
    // Check level
    pm.expect(['B1', 'B2']).to.include(deck.level);
    
    // Check difficulty
    pm.expect(deck.difficulty).to.equal('INTERMEDIATE');
    
    // Check rating
    pm.expect(deck.rating).to.be.at.least(4.0);
  });
});
```

---

### Test 4: Search với minCards và maxCards
**Mục đích**: Lọc theo số lượng thẻ

```
Method: GET
URL: {{base_url}}{{api_path}}/search?keyword=vocabulary&minCards=20&maxCards=50&sort=cards

Expected Result:
- Status: 200
- Tất cả decks có totalCards từ 20-50
- Sắp xếp theo số thẻ giảm dần
```

**Validation:**
```javascript
pm.test("Card count within range", () => {
  const jsonData = pm.response.json();
  jsonData.data.decks.forEach(deck => {
    pm.expect(deck.totalCards).to.be.at.least(20);
    pm.expect(deck.totalCards).to.be.at.most(50);
  });
});

pm.test("Sorted by card count", () => {
  const jsonData = pm.response.json();
  const decks = jsonData.data.decks;
  
  for (let i = 0; i < decks.length - 1; i++) {
    pm.expect(decks[i].totalCards).to.be.at.least(decks[i+1].totalCards);
  }
});
```

---

### Test 5: Search suggestions (Autocomplete)
**Mục đích**: Test autocomplete khi user gõ "bus"

```
Method: GET
URL: {{base_url}}{{api_path}}/search/suggestions?q=bus&limit=10

Expected Result:
- Status: 200
- Trả về titles, tags, categories suggestions
```

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "titles": [
      {
        "id": "deck123",
        "title": "Business English Essentials",
        "category": "BUSINESS"
      }
    ],
    "tags": [
      {
        "tag": "business",
        "count": 45
      }
    ],
    "categories": [
      {
        "category": "BUSINESS",
        "displayName": "BUSINESS"
      }
    ]
  }
}
```

**Validation:**
```javascript
pm.test("Suggestions have all sections", () => {
  const jsonData = pm.response.json();
  const data = jsonData.data;
  
  pm.expect(data).to.have.property('titles');
  pm.expect(data).to.have.property('tags');
  pm.expect(data).to.have.property('categories');
  
  pm.expect(data.titles).to.be.an('array');
  pm.expect(data.tags).to.be.an('array');
  pm.expect(data.categories).to.be.an('array');
});
```

---

### Test 6: Get all tags
**Mục đích**: Lấy tất cả tags để hiển thị tag cloud

```
Method: GET
URL: {{base_url}}{{api_path}}/tags?minCount=5&limit=50

Expected Result:
- Status: 200
- Trả về max 50 tags
- Mỗi tag có deckCount >= 5
```

**Validation:**
```javascript
pm.test("Tags meet minimum count", () => {
  const jsonData = pm.response.json();
  jsonData.data.forEach(tag => {
    pm.expect(tag.deckCount).to.be.at.least(5);
  });
});

pm.test("Tags sorted by count", () => {
  const jsonData = pm.response.json();
  const tags = jsonData.data;
  
  for (let i = 0; i < tags.length - 1; i++) {
    pm.expect(tags[i].deckCount).to.be.at.least(tags[i+1].deckCount);
  }
});
```

---

### Test 7: Get tags by category
**Mục đích**: Lấy tags của category BUSINESS

```
Method: GET
URL: {{base_url}}{{api_path}}/tags?category=BUSINESS&minCount=3

Expected Result:
- Status: 200
- Tất cả tags đều thuộc BUSINESS category
```

**Validation:**
```javascript
pm.test("All tags include BUSINESS category", () => {
  const jsonData = pm.response.json();
  jsonData.data.forEach(tag => {
    pm.expect(tag.categories).to.include('BUSINESS');
  });
});
```

---

### Test 8: Pagination
**Mục đích**: Test phân trang

```
Method: GET
URL: {{base_url}}{{api_path}}/search?keyword=english&page=2&limit=5

Expected Result:
- Status: 200
- Pagination.page = 2
- Decks.length <= 5
```

**Validation:**
```javascript
pm.test("Pagination works correctly", () => {
  const jsonData = pm.response.json();
  const pagination = jsonData.data.pagination;
  
  pm.expect(pagination.page).to.equal(2);
  pm.expect(pagination.limit).to.equal(5);
  pm.expect(jsonData.data.decks.length).to.be.at.most(5);
  pm.expect(pagination.pages).to.equal(Math.ceil(pagination.total / pagination.limit));
});
```

---

### Test 9: Sort by different fields
**Mục đích**: Test các sort options

#### 9a. Sort by relevance (default)
```
URL: {{base_url}}{{api_path}}/search?keyword=english&sort=relevance
```

#### 9b. Sort by popular
```
URL: {{base_url}}{{api_path}}/search?keyword=english&sort=popular
```

#### 9c. Sort by rating
```
URL: {{base_url}}{{api_path}}/search?keyword=english&sort=rating
```

#### 9d. Sort by newest
```
URL: {{base_url}}{{api_path}}/search?keyword=english&sort=newest
```

#### 9e. Sort by cards
```
URL: {{base_url}}{{api_path}}/search?keyword=english&sort=cards
```

**Validation for Popular Sort:**
```javascript
pm.test("Sorted by studyCount descending", () => {
  const jsonData = pm.response.json();
  const decks = jsonData.data.decks;
  
  for (let i = 0; i < decks.length - 1; i++) {
    pm.expect(decks[i].studyCount).to.be.at.least(decks[i+1].studyCount);
  }
});
```

---

### Test 10: Error cases

#### 10a. Missing keyword and tags
```
Method: GET
URL: {{base_url}}{{api_path}}/search

Expected Result:
- Status: 400
- Error message: "Vui lòng nhập từ khóa hoặc tag để tìm kiếm"
```

**Validation:**
```javascript
pm.test("Returns 400 for missing params", () => {
  pm.response.to.have.status(400);
});

pm.test("Has error message", () => {
  const jsonData = pm.response.json();
  pm.expect(jsonData.success).to.be.false;
  pm.expect(jsonData.message).to.include("từ khóa hoặc tag");
});
```

#### 10b. Short query for suggestions
```
Method: GET
URL: {{base_url}}{{api_path}}/search/suggestions?q=a

Expected Result:
- Status: 200
- Empty suggestions (query < 2 chars)
```

---

### Test 11: Multiple levels
**Mục đích**: Tìm decks có nhiều levels

```
Method: GET
URL: {{base_url}}{{api_path}}/search?keyword=grammar&level=A1,A2,B1

Expected Result:
- Status: 200
- Decks có level = A1, A2, hoặc B1
```

**Validation:**
```javascript
pm.test("Levels match query", () => {
  const jsonData = pm.response.json();
  const allowedLevels = ['A1', 'A2', 'B1'];
  
  jsonData.data.decks.forEach(deck => {
    pm.expect(allowedLevels).to.include(deck.level);
  });
});
```

---

### Test 12: Multiple difficulties
**Mục đích**: Tìm decks có nhiều difficulties

```
Method: GET
URL: {{base_url}}{{api_path}}/search?tags=vocabulary&difficulty=BEGINNER,INTERMEDIATE

Expected Result:
- Status: 200
- Decks có difficulty = BEGINNER hoặc INTERMEDIATE
```

---

## 📊 Test Scenarios

### Scenario 1: Student tìm deck IELTS level B2
```bash
1. GET /api/decks/search/suggestions?q=iel
   -> Chọn tag "ielts" từ suggestions
   
2. GET /api/decks/search?tags=ielts&level=B2&sort=rating
   -> Xem kết quả với rating cao nhất
```

### Scenario 2: Teacher tìm deck Business English cho intermediate
```bash
1. GET /api/decks/categories
   -> Chọn category BUSINESS
   
2. GET /api/decks/tags?category=BUSINESS&minCount=5
   -> Xem các tags phổ biến
   
3. GET /api/decks/search?category=BUSINESS&difficulty=INTERMEDIATE&sort=popular
   -> Xem decks phổ biến nhất
```

### Scenario 3: User tìm deck có nhiều thẻ
```bash
1. GET /api/decks/search?keyword=vocabulary&minCards=50&sort=cards
   -> Tìm decks có >= 50 thẻ, sắp xếp theo số thẻ
```

---

## 🔧 Postman Collection Variables

```json
{
  "base_url": "http://localhost:1124",
  "api_path": "/api/decks",
  "test_keyword": "business",
  "test_tags": "ielts,business",
  "test_category": "BUSINESS",
  "test_level": "B1,B2",
  "page": "1",
  "limit": "20"
}
```

---

## 📝 Pre-request Script (Optional)

```javascript
// Generate random search keyword
const keywords = ['business', 'travel', 'grammar', 'vocabulary', 'speaking'];
const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
pm.environment.set('test_keyword', randomKeyword);

 ('Testing with keyword:', randomKeyword);
```

---

## 🎯 Test Collection Setup

### Collection-level Tests
```javascript
// Runs after every request
pm.test("Response time is less than 1000ms", () => {
  pm.expect(pm.response.responseTime).to.be.below(1000);
});

pm.test("Content-Type is JSON", () => {
  pm.response.to.have.header("Content-Type", /json/);
});
```

---

## ✅ Complete Test Checklist

- [ ] Test 1: Tìm kiếm theo từ khóa đơn giản
- [ ] Test 2: Tìm kiếm theo tags
- [ ] Test 3: Tìm kiếm kết hợp với nhiều filters
- [ ] Test 4: Lọc theo số lượng thẻ
- [ ] Test 5: Search suggestions
- [ ] Test 6: Get all tags
- [ ] Test 7: Get tags by category
- [ ] Test 8: Pagination
- [ ] Test 9: Tất cả sort options (5 options)
- [ ] Test 10: Error cases (2 cases)
- [ ] Test 11: Multiple levels
- [ ] Test 12: Multiple difficulties
- [ ] Scenario 1: Student workflow
- [ ] Scenario 2: Teacher workflow
- [ ] Scenario 3: User workflow

---

## 🚀 Quick Start

1. **Start server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Seed test data** (nếu chưa có)
   ```bash
   node scripts/seedFlashcards.js
   ```

3. **Import Postman collection**
   - Copy các requests trên vào Postman
   - Set environment variables
   - Run collection

4. **Run tests**
   - Manual: Click "Send" cho từng request
   - Automated: Click "Run" trên collection

---

## 📈 Expected Performance

- Search with keyword: < 500ms
- Search with filters: < 800ms
- Suggestions: < 200ms
- Get tags: < 300ms

---

**Last Updated**: 2025-11-01  
**Task**: #16 - Tìm kiếm theo từ khóa và tags
