# Task 16: Tìm kiếm bộ thẻ theo từ khóa và tags

## 📋 Mô tả
Hệ thống tìm kiếm nâng cao cho phép người dùng tìm kiếm bộ thẻ (deck) bằng từ khóa hoặc tags liên quan. Kết quả được sắp xếp theo độ liên quan và hỗ trợ nhiều bộ lọc.

## 🎯 Tính năng

### 1. Tìm kiếm theo từ khóa
- Tìm trong **title**, **description**, **tags**, **subcategory**
- Hỗ trợ tìm kiếm không phân biệt hoa thường
- Tìm kiếm partial match (từ khóa nằm trong chuỗi)

### 2. Tìm kiếm theo tags
- Tìm kiếm chính xác hoặc partial match
- Hỗ trợ nhiều tags cùng lúc (OR logic)
- Hiển thị tags khớp trong kết quả

### 3. Bộ lọc nâng cao
- **Category**: ACADEMIC, TRAVEL, BUSINESS, etc.
- **Level**: A1, A2, B1, B2, C1, C2
- **Difficulty**: BEGINNER, INTERMEDIATE, ADVANCED
- **Card Count**: Min/Max số thẻ
- **Rating**: Đánh giá tối thiểu

### 4. Sắp xếp kết quả
- **relevance**: Theo độ liên quan (studyCount + viewCount + rating)
- **popular**: Theo lượt học
- **rating**: Theo đánh giá
- **newest**: Mới nhất
- **cards**: Theo số lượng thẻ

### 5. Search Suggestions (Autocomplete)
- Gợi ý deck titles
- Gợi ý tags phổ biến
- Gợi ý categories

### 6. Tag Management
- Lấy tất cả tags với số lượng deck
- Lọc tags theo category
- Giới hạn tags theo popularity

---

## 🔌 API Endpoints

### 1. Advanced Search
```http
GET /api/decks/search
```

**Query Parameters:**
```javascript
{
  // Required (ít nhất 1 trong 2)
  "keyword": "business english",     // Từ khóa tìm kiếm
  "tags": "ielts,business,speaking", // Tags (comma-separated)
  
  // Optional Filters
  "category": "BUSINESS",            // Category
  "level": "B1,B2",                  // Levels (comma-separated)
  "difficulty": "INTERMEDIATE",      // Difficulty
  "minCards": "20",                  // Số thẻ tối thiểu
  "maxCards": "100",                 // Số thẻ tối đa
  "minRating": "4.0",                // Rating tối thiểu
  
  // Pagination & Sort
  "sort": "relevance",               // relevance|popular|rating|newest|cards
  "page": "1",
  "limit": "20"
}
```

**Response:**
```json
{
  "success": true,
  "count": 15,
  "data": {
    "decks": [
      {
        "_id": "deck123",
        "title": "Business English Essentials",
        "description": "Learn essential business vocabulary",
        "category": "BUSINESS",
        "level": "B1",
        "difficulty": "INTERMEDIATE",
        "tags": ["business", "ielts", "vocabulary"],
        "matchedTags": ["business", "ielts"],
        "totalCards": 50,
        "studyCount": 1250,
        "viewCount": 3400,
        "rating": 4.7,
        "ratingCount": 89,
        "createdBy": {
          "_id": "user123",
          "fullName": "John Doe",
          "avatar": "avatar.jpg"
        },
        "createdAt": "2025-10-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "pages": 1
    },
    "searchQuery": {
      "keyword": "business english",
      "tags": ["ielts", "business", "speaking"],
      "filters": {
        "category": "BUSINESS",
        "level": "B1,B2",
        "difficulty": "INTERMEDIATE",
        "minCards": "20",
        "maxCards": "100",
        "minRating": "4.0"
      },
      "sort": "relevance"
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Vui lòng nhập từ khóa hoặc tag để tìm kiếm"
}
```

---

### 2. Search Suggestions (Autocomplete)
```http
GET /api/decks/search/suggestions?q=business&limit=10
```

**Query Parameters:**
```javascript
{
  "q": "business",      // Query string (min 2 chars)
  "limit": "10"         // Số gợi ý (default: 10)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "titles": [
      {
        "id": "deck123",
        "title": "Business English Essentials",
        "category": "BUSINESS"
      },
      {
        "id": "deck456",
        "title": "Business Communication",
        "category": "BUSINESS"
      }
    ],
    "tags": [
      {
        "tag": "business",
        "count": 45
      },
      {
        "tag": "business-english",
        "count": 23
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

---

### 3. Get All Tags
```http
GET /api/decks/tags
```

**Query Parameters:**
```javascript
{
  "category": "BUSINESS",    // Lọc theo category (optional)
  "minCount": "5",           // Số deck tối thiểu (default: 1)
  "limit": "50"              // Số tags (default: 50)
}
```

**Response:**
```json
{
  "success": true,
  "count": 25,
  "data": [
    {
      "tag": "ielts",
      "deckCount": 156,
      "categories": ["ACADEMIC", "BUSINESS", "GENERAL"]
    },
    {
      "tag": "business",
      "deckCount": 89,
      "categories": ["BUSINESS", "DAILY_LIFE"]
    },
    {
      "tag": "vocabulary",
      "deckCount": 234,
      "categories": ["ACADEMIC", "BUSINESS", "TRAVEL"]
    }
  ]
}
```

---

## 📊 Database Indexes

Các indexes đã được thêm vào `Deck` model:

```javascript
// Text search index
deckSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Tag search index
deckSchema.index({ tags: 1, isPublic: 1 });

// Existing indexes
deckSchema.index({ category: 1, level: 1, isPublic: 1 });
deckSchema.index({ difficulty: 1, isPublic: 1 });
deckSchema.index({ studyCount: -1 });
deckSchema.index({ createdAt: -1 });
```

---

## 🧪 Testing với Postman

### Test 1: Tìm kiếm theo từ khóa
```
GET http://localhost:1124/api/decks/search?keyword=business&sort=relevance&page=1&limit=10
```

### Test 2: Tìm kiếm theo tags
```
GET http://localhost:1124/api/decks/search?tags=ielts,business&sort=popular
```

### Test 3: Tìm kiếm kết hợp
```
GET http://localhost:1124/api/decks/search?keyword=english&tags=ielts&category=ACADEMIC&level=B1,B2&minRating=4.0
```

### Test 4: Search suggestions
```
GET http://localhost:1124/api/decks/search/suggestions?q=bus&limit=10
```

### Test 5: Get all tags
```
GET http://localhost:1124/api/decks/tags?category=BUSINESS&minCount=5&limit=30
```

### Test 6: Sắp xếp theo rating
```
GET http://localhost:1124/api/decks/search?keyword=vocabulary&sort=rating&minRating=4.5
```

### Test 7: Lọc theo số lượng thẻ
```
GET http://localhost:1124/api/decks/search?keyword=grammar&minCards=30&maxCards=100
```

---

## 💡 Use Cases

### 1. Student tìm kiếm deck để học IELTS
```
GET /api/decks/search?tags=ielts&level=B2&sort=rating&minRating=4.0
```

### 2. Teacher tìm deck về Business English
```
GET /api/decks/search?keyword=business english&category=BUSINESS&difficulty=INTERMEDIATE
```

### 3. User tìm deck có nhiều thẻ
```
GET /api/decks/search?keyword=vocabulary&minCards=100&sort=cards
```

### 4. Autocomplete khi user gõ "bus"
```
GET /api/decks/search/suggestions?q=bus
```

### 5. Hiển thị tag cloud
```
GET /api/decks/tags?minCount=10&limit=50
```

---

## 🎨 Frontend Integration Examples

### 1. Search Form Component
```javascript
const searchDecks = async (searchParams) => {
  const params = new URLSearchParams({
    keyword: searchParams.keyword,
    tags: searchParams.tags.join(','),
    category: searchParams.category,
    level: searchParams.levels.join(','),
    difficulty: searchParams.difficulty,
    minRating: searchParams.minRating,
    sort: searchParams.sort,
    page: searchParams.page,
    limit: 20
  });
  
  const response = await fetch(`/api/decks/search?${params}`);
  return response.json();
};
```

### 2. Autocomplete Component
```javascript
const getSearchSuggestions = async (query) => {
  if (query.length < 2) return { titles: [], tags: [], categories: [] };
  
  const response = await fetch(
    `/api/decks/search/suggestions?q=${encodeURIComponent(query)}&limit=10`
  );
  return response.json();
};

// Usage with debounce
const handleSearchInput = debounce(async (value) => {
  const suggestions = await getSearchSuggestions(value);
  setSuggestions(suggestions.data);
}, 300);
```

### 3. Tag Filter Component
```javascript
const TagCloud = () => {
  const [tags, setTags] = useState([]);
  
  useEffect(() => {
    fetch('/api/decks/tags?minCount=5&limit=50')
      .then(res => res.json())
      .then(data => setTags(data.data));
  }, []);
  
  return (
    <div className="tag-cloud">
      {tags.map(tag => (
        <button 
          key={tag.tag}
          onClick={() => searchByTag(tag.tag)}
          style={{ fontSize: `${10 + tag.deckCount/10}px` }}
        >
          {tag.tag} ({tag.deckCount})
        </button>
      ))}
    </div>
  );
};
```

### 4. Search Results Display
```javascript
const SearchResults = ({ results }) => {
  return (
    <div className="search-results">
      <div className="results-header">
        Tìm thấy {results.pagination.total} bộ thẻ
        {results.searchQuery.keyword && (
          <span> cho "{results.searchQuery.keyword}"</span>
        )}
      </div>
      
      <div className="results-grid">
        {results.decks.map(deck => (
          <DeckCard 
            key={deck._id} 
            deck={deck}
            highlightedTags={deck.matchedTags}
          />
        ))}
      </div>
      
      <Pagination data={results.pagination} />
    </div>
  );
};
```

---

## 🔍 Search Algorithm Details

### 1. Relevance Score
```javascript
// Sort by relevance = studyCount + viewCount + rating weight
const relevanceScore = {
  studyCount: -1,    // Primary: Most studied
  viewCount: -1,     // Secondary: Most viewed
  rating: -1         // Tertiary: Highest rated
};
```

### 2. Keyword Matching
- **Exact match**: Ưu tiên kết quả khớp chính xác
- **Partial match**: Từ khóa nằm trong chuỗi
- **Case insensitive**: Không phân biệt hoa thường

### 3. Tag Matching
- **OR logic**: Deck có bất kỳ tag nào khớp
- **Partial match**: Tag chứa từ khóa tìm kiếm
- **Highlighted tags**: Trả về tags khớp để highlight

### 4. Filter Priority
```
1. Public only (isPublic: true)
2. Keyword/Tag search (OR conditions)
3. Category filter
4. Level filter (multiple levels)
5. Difficulty filter (multiple difficulties)
6. Card count range
7. Minimum rating (exclude unrated)
```

---

## 🚀 Performance Tips

### 1. Indexes
- Text index cho full-text search
- Compound indexes cho filters phổ biến
- Index cho sort fields

### 2. Pagination
- Luôn sử dụng limit
- Default limit: 20
- Max limit: 100

### 3. Caching (Optional)
```javascript
// Cache popular search queries
const cacheKey = `search:${keyword}:${tags}:${sort}:${page}`;
// TTL: 5 minutes
```

### 4. Query Optimization
- Sử dụng `.lean()` để giảm memory
- Select only needed fields
- Populate minimal data

---

## 📝 Notes

1. **Text Search**: MongoDB text index không hỗ trợ wildcard đầu chuỗi (`*word`)
2. **Tag Format**: Nên lowercase và trim tags khi lưu vào DB
3. **Performance**: Với >10,000 decks, nên implement Elasticsearch
4. **Validation**: Đảm bảo ít nhất keyword hoặc tags được cung cấp
5. **Security**: Public endpoint, không cần authentication

---

## 🔄 Future Enhancements

1. **Fuzzy Search**: Sửa lỗi chính tả tự động
2. **Search History**: Lưu lịch sử tìm kiếm của user
3. **Trending Tags**: Tags đang được tìm kiếm nhiều
4. **Related Searches**: Gợi ý tìm kiếm liên quan
5. **Advanced Filters**: Lọc theo creator, date range, etc.
6. **Elasticsearch Integration**: Cho search engine mạnh hơn

---

## ✅ Checklist

- [x] Text indexes cho Deck model
- [x] Search endpoint với keyword & tags
- [x] Advanced filters (category, level, difficulty, etc.)
- [x] Multiple sort options
- [x] Search suggestions/autocomplete
- [x] Get all tags endpoint
- [x] Pagination support
- [x] Matched tags highlighting
- [x] Error handling
- [x] API documentation
- [ ] Frontend implementation
- [ ] Unit tests
- [ ] Integration tests
- [ ] Performance testing với large dataset

---

**Created**: 2025-11-01  
**Task**: #16 - Tìm kiếm theo từ khóa và tags  
**Status**: ✅ Backend Complete
