# Task 24: Leech Detection, Suspend & Bury System

## 📚 Tổng quan

Hệ thống quản lý flashcard nâng cao với các tính năng:
- 🐛 **Leech Detection** - Tự động phát hiện thẻ "hay quên"
- ⏸️ **Suspend** - Tạm ẩn thẻ khỏi queue ôn tập (vô thời hạn)
- 🪦 **Bury** - Chôn thẻ tạm thời (tự động hiện lại sau)
- 📊 **Smart Filtering** - Chỉ hiện thẻ active trong review

**Inspired by Anki's leech system** - Industry standard for spaced repetition

---

## 🎯 Use Cases

### 1. Leech Detection (Thẻ Hay Quên)
**Vấn đề**: Một số thẻ người dùng liên tục trả lời sai, làm giảm hiệu quả ôn tập

**Giải pháp**: 
- Tự động đánh dấu thẻ "leech" khi:
  - Consecutive fails >= 8 (có thể tùy chỉnh)
  - Total fails >= threshold
- Người dùng có thể:
  - Xem danh sách tất cả leech cards
  - Suspend hoặc edit lại leech cards
  - Track progress cải thiện

### 2. Suspend (Tạm Ẩn)
**Use Case**: 
- Thẻ quá khó, muốn học sau
- Thẻ không còn liên quan
- Tập trung vào thẻ quan trọng hơn

**Behavior**:
- Ẩn khỏi review queue vĩnh viễn
- Không ảnh hưởng deck stats
- Có thể unsuspend bất kỳ lúc nào

### 3. Bury (Chôn Tạm Thời)
**Use Case**:
- Vừa học xong, muốn nghỉ đến ngày mai
- Thẻ xuất hiện quá nhiều trong một session
- Cần focus vào thẻ khác trước

**Behavior**:
- Ẩn đến thời điểm chỉ định (default: next day midnight)
- Tự động unbury khi hết hạn
- Có thể unbury manually

---

## 🗂️ Database Schema

### Flashcard Model - New Fields

```javascript
{
  // ==================== TASK 24: LEECH, SUSPEND, BURY ====================
  
  // Leech detection
  isLeech: {
    type: Boolean,
    default: false
  },
  
  // Fail counters
  failCount: {
    type: Number,
    default: 0
  },
  
  consecutiveFails: {
    type: Number,
    default: 0
  },
  
  // Threshold for leech detection
  leechThreshold: {
    type: Number,
    default: 8 // Anki default
  },
  
  // Card status
  status: {
    type: String,
    enum: ['active', 'suspended', 'buried'],
    default: 'active'
  },
  
  // Timestamps
  buriedUntil: {
    type: Date
  },
  
  suspendedAt: {
    type: Date
  },
  
  leechDetectedAt: {
    type: Date
  }
}
```

---

## 🔌 API Endpoints

### Base URL: `/api/leeches`

All endpoints require authentication (`Authorization: Bearer <token>`)

---

### 1. Mark as Leech (Manual)

**POST** `/api/leeches/mark/:id`

Đánh dấu flashcard là leech manually.

**Parameters:**
- `id` (URL param) - Flashcard ID

**Response:**
```json
{
  "success": true,
  "message": "Đã đánh dấu flashcard là leech",
  "data": {
    "_id": "flashcard_id",
    "front": "irregardless",
    "isLeech": true,
    "failCount": 10,
    "consecutiveFails": 5,
    "leechDetectedAt": "2025-11-08T10:30:00.000Z"
  }
}
```

---

### 2. Unmark Leech

**POST** `/api/leeches/unmark/:id`

Bỏ đánh dấu leech và reset fail counters.

**Response:**
```json
{
  "success": true,
  "message": "Đã bỏ đánh dấu leech",
  "data": {
    "_id": "flashcard_id",
    "isLeech": false,
    "failCount": 0,
    "consecutiveFails": 0,
    "leechDetectedAt": null
  }
}
```

---

### 3. Suspend Card

**POST** `/api/leeches/suspend/:id`

Tạm ẩn flashcard khỏi review queue (vô thời hạn).

**Response:**
```json
{
  "success": true,
  "message": "Đã tạm ẩn flashcard",
  "data": {
    "_id": "flashcard_id",
    "status": "suspended",
    "suspendedAt": "2025-11-08T10:35:00.000Z"
  }
}
```

**Effects:**
- Card không xuất hiện trong `getDueCards()`
- Card không xuất hiện trong `getNewCards()`
- Deck stats không bị ảnh hưởng

---

### 4. Unsuspend Card

**POST** `/api/leeches/unsuspend/:id`

Kích hoạt lại flashcard đã bị suspend.

**Response:**
```json
{
  "success": true,
  "message": "Đã kích hoạt lại flashcard",
  "data": {
    "_id": "flashcard_id",
    "status": "active",
    "suspendedAt": null
  }
}
```

---

### 5. Bury Card

**POST** `/api/leeches/bury/:id`

Chôn flashcard đến thời điểm chỉ định.

**Request Body:**
```json
{
  "untilDate": "2025-11-09T00:00:00.000Z" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đã chôn flashcard đến 09/11/2025",
  "data": {
    "_id": "flashcard_id",
    "status": "buried",
    "buriedUntil": "2025-11-09T00:00:00.000Z"
  }
}
```

**Default Behavior:**
- Nếu không có `untilDate` → Chôn đến 00:00 ngày mai
- Auto-unbury khi `buriedUntil` passed

---

### 6. Unbury Card

**POST** `/api/leeches/unbury/:id`

Bỏ chôn flashcard ngay lập tức.

**Response:**
```json
{
  "success": true,
  "message": "Đã bỏ chôn flashcard",
  "data": {
    "_id": "flashcard_id",
    "status": "active",
    "buriedUntil": null
  }
}
```

---

### 7. Get Leeched Cards

**GET** `/api/leeches/:deckId`

Lấy tất cả flashcards đã bị đánh dấu leech trong deck.

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách leech thành công",
  "data": {
    "leeches": [
      {
        "_id": "card1",
        "front": "irregardless",
        "failCount": 12,
        "consecutiveFails": 8,
        "leechDetectedAt": "2025-11-08T10:30:00.000Z",
        "status": "active"
      },
      {
        "_id": "card2",
        "front": "albeit",
        "failCount": 10,
        "consecutiveFails": 6,
        "leechDetectedAt": "2025-11-07T15:20:00.000Z",
        "status": "suspended"
      }
    ],
    "stats": {
      "total": 2,
      "active": 1,
      "suspended": 1
    },
    "count": 2
  }
}
```

**Sort:** By `failCount` descending (worst leeches first)

---

### 8. Get Buried Cards

**GET** `/api/leeches/buried/:deckId`

Lấy tất cả flashcards đang bị chôn trong deck.

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách flashcard bị chôn thành công",
  "data": {
    "buried": [
      {
        "_id": "card1",
        "front": "sophisticated",
        "buriedUntil": "2025-11-09T00:00:00.000Z",
        "status": "buried"
      }
    ],
    "count": 1
  }
}
```

**Sort:** By `buriedUntil` ascending (soonest to unbury first)

---

### 9. Get Suspended Cards

**GET** `/api/leeches/suspended/:deckId`

Lấy tất cả flashcards đang bị suspend trong deck.

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách flashcard bị tạm ẩn thành công",
  "data": {
    "suspended": [
      {
        "_id": "card1",
        "front": "aberration",
        "suspendedAt": "2025-11-08T10:35:00.000Z",
        "failCount": 15,
        "status": "suspended"
      }
    ],
    "count": 1
  }
}
```

**Sort:** By `suspendedAt` descending (most recent first)

---

### 10. Bulk Suspend

**POST** `/api/leeches/bulk/suspend`

Tạm ẩn nhiều flashcards cùng lúc.

**Request Body:**
```json
{
  "flashcardIds": ["id1", "id2", "id3"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đã tạm ẩn 3 flashcard",
  "data": {
    "modifiedCount": 3
  }
}
```

**Use Case:**
- Suspend tất cả leech cards cùng lúc
- Suspend một nhóm thẻ theo topic

---

### 11. Bulk Bury

**POST** `/api/leeches/bulk/bury`

Chôn nhiều flashcards cùng lúc.

**Request Body:**
```json
{
  "flashcardIds": ["id1", "id2", "id3"],
  "untilDate": "2025-11-09T00:00:00.000Z" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đã chôn 3 flashcard đến 09/11/2025",
  "data": {
    "modifiedCount": 3,
    "buriedUntil": "2025-11-09T00:00:00.000Z"
  }
}
```

---

### 12. Auto-Unbury Expired Cards

**POST** `/api/leeches/unbury-expired`

Tự động bỏ chôn các thẻ đã hết hạn bury.

**Response:**
```json
{
  "success": true,
  "message": "Đã tự động bỏ chôn 5 flashcard",
  "data": {
    "count": 5
  }
}
```

**Recommended:** Run daily via cron job at midnight

**Cron Setup (Node):**
```javascript
const cron = require('node-cron');

// Run every day at 00:00
cron.schedule('0 0 * * *', async () => {
  await leechService.unburyExpiredCards();
   ('✅ Auto-unbury completed');
});
```

---

## 🤖 Automatic Leech Detection

### How It Works

Leech detection happens **automatically** when user answers incorrectly during review.

### Algorithm

```javascript
// In your review submission handler
if (userAnswer === 'incorrect') {
  const result = await leechService.recordFailure(flashcardId);
  
  if (result.justBecameLeech) {
    // Show notification to user
    notification.send({
      type: 'warning',
      title: 'Leech Detected!',
      message: `Card "${flashcard.front}" marked as leech. Consider editing or suspending it.`
    });
  }
}
```

### Leech Threshold

**Default:** 8 consecutive fails (Anki standard)

**Can be customized per card:**
```javascript
flashcard.leechThreshold = 10; // More lenient
await flashcard.save();
```

### Reset on Success

```javascript
if (userAnswer === 'correct') {
  await leechService.recordSuccess(flashcardId);
  // Resets consecutiveFails to 0
}
```

---

## 🔧 Integration with Review System

### Modified Functions

#### 1. `getDueCards()` - Filter Out Suspended/Buried

**Before:**
```javascript
studyProgressSchema.statics.getDueCards = async function(userId, deckId) {
  return this.find({
    user: userId,
    deck: deckId,
    nextReviewDate: { $lte: new Date() }
  })
  .populate('flashcard')
  .limit(20);
};
```

**After (Task 24):**
```javascript
studyProgressSchema.statics.getDueCards = async function(userId, deckId) {
  const dueCards = await this.find({
    user: userId,
    deck: deckId,
    nextReviewDate: { $lte: new Date() }
  })
  .populate({
    path: 'flashcard',
    match: { status: 'active' } // ✅ Only active cards
  })
  .limit(20);
  
  // Filter out nulls (suspended/buried cards)
  return dueCards.filter(card => card.flashcard !== null);
};
```

#### 2. `getNewCards()` - Filter Out Suspended/Buried

**Before:**
```javascript
studyProgressSchema.statics.getNewCards = async function(userId, deckId, limit) {
  const studiedIds = await this.distinct('flashcard', { user: userId, deck: deckId });
  
  return Flashcard.find({
    deck: deckId,
    _id: { $nin: studiedIds }
  }).limit(limit);
};
```

**After (Task 24):**
```javascript
studyProgressSchema.statics.getNewCards = async function(userId, deckId, limit) {
  const studiedIds = await this.distinct('flashcard', { user: userId, deck: deckId });
  
  return Flashcard.find({
    deck: deckId,
    _id: { $nin: studiedIds },
    status: 'active' // ✅ Only active cards
  }).limit(limit);
};
```

---

## 📊 Statistics & Analytics

### Get Leech Stats for Deck

```javascript
const stats = await leechService.getLeechStats(deckId);

// Returns:
{
  total: 5,       // Total leeches
  active: 3,      // Active leeches
  suspended: 2    // Suspended leeches
}
```

### Use in Dashboard

```jsx
const DeckStats = ({ deckId }) => {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    fetchLeechStats();
  }, [deckId]);
  
  return (
    <StatsCard warning={stats.active > 0}>
      <StatTitle>⚠️ Leech Cards</StatTitle>
      <StatNumber>{stats.total}</StatNumber>
      <StatDetail>
        {stats.active} active, {stats.suspended} suspended
      </StatDetail>
      {stats.active > 0 && (
        <ActionButton onClick={handleViewLeeches}>
          View & Fix Leeches
        </ActionButton>
      )}
    </StatsCard>
  );
};
```

---

## 🎨 Frontend Integration

### 1. Leech Management Page

```jsx
import { useState, useEffect } from 'react';
import { leechService } from '../services/leechService';

const LeechManagement = ({ deckId }) => {
  const [leeches, setLeeches] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchLeeches();
  }, [deckId]);
  
  const fetchLeeches = async () => {
    try {
      const response = await leechService.getLeechedCards(deckId);
      setLeeches(response.data.leeches);
    } catch (error) {
      console.error('Error fetching leeches:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSuspend = async (cardId) => {
    try {
      await leechService.suspendCard(cardId);
      toast.success('Card suspended');
      fetchLeeches(); // Refresh
    } catch (error) {
      toast.error('Failed to suspend');
    }
  };
  
  const handleUnmark = async (cardId) => {
    try {
      await leechService.unmarkLeech(cardId);
      toast.success('Leech unmarked');
      fetchLeeches();
    } catch (error) {
      toast.error('Failed to unmark');
    }
  };
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <LeechContainer>
      <Header>
        <Title>🐛 Leech Cards ({leeches.length})</Title>
        <Subtitle>Cards you frequently get wrong</Subtitle>
      </Header>
      
      {leeches.length === 0 ? (
        <EmptyState>
          <EmptyIcon>✅</EmptyIcon>
          <EmptyText>No leech cards! Great job!</EmptyText>
        </EmptyState>
      ) : (
        <LeechList>
          {leeches.map(card => (
            <LeechCard key={card._id} status={card.status}>
              <CardHeader>
                <CardFront>{card.front}</CardFront>
                <LeechBadge>
                  🐛 Leech
                </LeechBadge>
              </CardHeader>
              
              <CardStats>
                <Stat>
                  <StatLabel>Total Fails</StatLabel>
                  <StatValue>{card.failCount}</StatValue>
                </Stat>
                <Stat>
                  <StatLabel>Consecutive</StatLabel>
                  <StatValue>{card.consecutiveFails}</StatValue>
                </Stat>
                <Stat>
                  <StatLabel>Detected</StatLabel>
                  <StatValue>
                    {new Date(card.leechDetectedAt).toLocaleDateString()}
                  </StatValue>
                </Stat>
              </CardStats>
              
              <CardActions>
                <ActionButton 
                  variant="edit" 
                  onClick={() => handleEdit(card._id)}
                >
                  ✏️ Edit
                </ActionButton>
                <ActionButton 
                  variant="suspend" 
                  onClick={() => handleSuspend(card._id)}
                >
                  ⏸️ Suspend
                </ActionButton>
                <ActionButton 
                  variant="unmark" 
                  onClick={() => handleUnmark(card._id)}
                >
                  ✅ Unmark
                </ActionButton>
              </CardActions>
            </LeechCard>
          ))}
        </LeechList>
      )}
    </LeechContainer>
  );
};
```

### 2. Suspend/Bury Modal during Review

```jsx
const ReviewPage = () => {
  const [showActionModal, setShowActionModal] = useState(false);
  const [currentCard, setCurrentCard] = useState(null);
  
  const handleCardActions = (card) => {
    setCurrentCard(card);
    setShowActionModal(true);
  };
  
  return (
    <>
      {/* Review UI */}
      <ReviewCard>
        {/* ... card content ... */}
        <CardMenu>
          <MenuButton onClick={() => handleCardActions(card)}>
            ⋮ More Actions
          </MenuButton>
        </CardMenu>
      </ReviewCard>
      
      {/* Action Modal */}
      {showActionModal && (
        <Modal onClose={() => setShowActionModal(false)}>
          <ModalTitle>Card Actions</ModalTitle>
          <ModalBody>
            <ActionList>
              <ActionItem onClick={async () => {
                await leechService.suspendCard(currentCard._id);
                toast.success('Card suspended');
                setShowActionModal(false);
              }}>
                <ActionIcon>⏸️</ActionIcon>
                <ActionText>
                  <ActionLabel>Suspend</ActionLabel>
                  <ActionDesc>Hide indefinitely</ActionDesc>
                </ActionText>
              </ActionItem>
              
              <ActionItem onClick={async () => {
                await leechService.buryCard(currentCard._id);
                toast.success('Card buried until tomorrow');
                setShowActionModal(false);
              }}>
                <ActionIcon>🪦</ActionIcon>
                <ActionText>
                  <ActionLabel>Bury Until Tomorrow</ActionLabel>
                  <ActionDesc>See again next day</ActionDesc>
                </ActionText>
              </ActionItem>
              
              {currentCard.isLeech && (
                <ActionItem onClick={async () => {
                  await leechService.unmarkLeech(currentCard._id);
                  toast.success('Leech unmarked');
                  setShowActionModal(false);
                }}>
                  <ActionIcon>✅</ActionIcon>
                  <ActionText>
                    <ActionLabel>Unmark as Leech</ActionLabel>
                    <ActionDesc>Reset fail counters</ActionDesc>
                  </ActionText>
                </ActionItem>
              )}
            </ActionList>
          </ModalBody>
        </Modal>
      )}
    </>
  );
};
```

### 3. Leech Warning during Review

```jsx
const ReviewCard = ({ card, onAnswer }) => {
  const [showLeechWarning, setShowLeechWarning] = useState(false);
  
  const handleAnswer = async (quality) => {
    const result = await onAnswer(quality);
    
    if (result.justBecameLeech) {
      setShowLeechWarning(true);
    }
  };
  
  return (
    <>
      {/* Card UI */}
      
      {showLeechWarning && (
        <WarningBanner variant="leech">
          <WarningIcon>🐛</WarningIcon>
          <WarningContent>
            <WarningTitle>Leech Detected!</WarningTitle>
            <WarningText>
              You've gotten this card wrong {card.failCount} times.
              Consider editing, suspending, or breaking it into smaller cards.
            </WarningText>
          </WarningContent>
          <WarningActions>
            <WarnButton onClick={() => handleSuspend(card._id)}>
              Suspend
            </WarnButton>
            <WarnButton onClick={() => handleEdit(card._id)}>
              Edit
            </WarnButton>
            <WarnButton onClick={() => setShowLeechWarning(false)}>
              Continue
            </WarnButton>
          </WarningActions>
        </WarningBanner>
      )}
    </>
  );
};
```

---

## 🧪 Testing

### Test Leech Detection

```javascript
// Test file: tests/leech.test.js
const { recordFailure, shouldMarkAsLeech } = require('../services/leechService');
const Flashcard = require('../models/Flashcard');

describe('Leech Detection', () => {
  it('should mark card as leech after 8 consecutive fails', async () => {
    const card = await Flashcard.create({
      front: 'Test',
      back: 'Test',
      deck: deckId,
      consecutiveFails: 7
    });
    
    const result = await recordFailure(card._id);
    
    expect(result.isLeech).toBe(true);
    expect(result.justBecameLeech).toBe(true);
    expect(result.consecutiveFails).toBe(8);
  });
  
  it('should not mark as leech before threshold', async () => {
    const card = await Flashcard.create({
      front: 'Test',
      back: 'Test',
      deck: deckId,
      consecutiveFails: 5
    });
    
    const result = await recordFailure(card._id);
    
    expect(result.isLeech).toBe(false);
    expect(result.consecutiveFails).toBe(6);
  });
});
```

### Test Review System Filtering

```javascript
describe('Review System with Suspend/Bury', () => {
  it('should not return suspended cards in getDueCards', async () => {
    // Create cards
    const activeCard = await createCard({ status: 'active' });
    const suspendedCard = await createCard({ status: 'suspended' });
    
    // Create study progress for both
    await createProgress(userId, activeCard._id, { nextReviewDate: yesterday });
    await createProgress(userId, suspendedCard._id, { nextReviewDate: yesterday });
    
    // Get due cards
    const dueCards = await StudyProgress.getDueCards(userId, deckId);
    
    // Should only have active card
    expect(dueCards.length).toBe(1);
    expect(dueCards[0].flashcard._id.toString()).toBe(activeCard._id.toString());
  });
  
  it('should not return buried cards in getNewCards', async () => {
    const activeCard = await createCard({ status: 'active' });
    const buriedCard = await createCard({ status: 'buried' });
    
    const newCards = await StudyProgress.getNewCards(userId, deckId, 10);
    
    const cardIds = newCards.map(c => c._id.toString());
    expect(cardIds).toContain(activeCard._id.toString());
    expect(cardIds).not.toContain(buriedCard._id.toString());
  });
});
```

---

## 📝 Best Practices

### 1. When to Suspend vs Bury

| Action | Use When | Duration | Effect on Stats |
|--------|----------|----------|-----------------|
| **Suspend** | Card is too hard/irrelevant | Indefinite | Not counted in due |
| **Bury** | Want break from card | Until specified date | Not counted in due |
| **Delete** | Card is wrong/duplicate | Permanent | Removed completely |

### 2. Dealing with Leeches

**Option A: Edit the Card**
- Make front side clearer
- Add mnemonic hints
- Break into smaller cards

**Option B: Suspend Temporarily**
- Come back after learning related concepts
- Review when more advanced

**Option C: Delete**
- If fundamentally flawed
- If no longer relevant

### 3. Leech Threshold Guidelines

| Level | Threshold | Reasoning |
|-------|-----------|-----------|
| Beginner | 5-6 | More lenient, allow mistakes |
| Intermediate | 8 (default) | Balanced approach |
| Advanced | 10-12 | Higher expectation |
| Very Hard Deck | 15+ | Expect difficulty |

### 4. Bury Strategy

**Scenario 1: Related Cards Appearing Together**
```javascript
// Bury related cards until tomorrow
const relatedCards = await Flashcard.find({
  deck: deckId,
  tags: { $in: ['irregular-verbs'] }
});

await leechService.autoBuryUntilNextDay(
  relatedCards.map(c => c._id)
);
```

**Scenario 2: After Intensive Study**
```javascript
// After completing 50 cards, bury all for rest of day
await leechService.autoBuryUntilNextDay(reviewedCardIds);
```

---

## 🔄 Maintenance Tasks

### Daily Cron Jobs

```javascript
const cron = require('node-cron');
const leechService = require('./services/leechService');

// Run at midnight every day
cron.schedule('0 0 * * *', async () => {
   ('🔄 Running daily maintenance...');
  
  // 1. Unbury expired cards
  const unburiedCount = await leechService.unburyExpiredCards();
   (`✅ Unburied ${unburiedCount} cards`);
  
  // 2. Generate leech reports for admins
  // ... your implementation
  
   ('✅ Daily maintenance completed');
});
```

### Weekly Cleanup

```javascript
// Run every Sunday at 2 AM
cron.schedule('0 2 * * 0', async () => {
  // Remove old suspended cards (suspended > 30 days ago)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const result = await Flashcard.updateMany(
    {
      status: 'suspended',
      suspendedAt: { $lt: thirtyDaysAgo }
    },
    {
      status: 'active',
      suspendedAt: null
    }
  );
  
   (`✅ Auto-unsuspended ${result.modifiedCount} old cards`);
});
```

---

## 🚀 Performance Considerations

### Indexing

```javascript
// Add indexes for better query performance
flashcardSchema.index({ status: 1, deck: 1 });
flashcardSchema.index({ isLeech: 1, deck: 1 });
flashcardSchema.index({ buriedUntil: 1 });
```

### Pagination for Large Leech Lists

```javascript
exports.getLeechedCards = async (req, res) => {
  const { deckId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  
  const skip = (page - 1) * limit;
  
  const leeches = await Flashcard.find({
    deck: deckId,
    isLeech: true
  })
  .sort({ failCount: -1 })
  .skip(skip)
  .limit(parseInt(limit));
  
  const total = await Flashcard.countDocuments({
    deck: deckId,
    isLeech: true
  });
  
  res.json({
    success: true,
    data: {
      leeches,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
};
```

---

## 📊 Analytics Dashboard Ideas

### Leech Trend Chart

```jsx
const LeechTrend = ({ deckId }) => {
  // Show how leech count changes over time
  // X-axis: Week
  // Y-axis: Number of leeches
  
  return (
    <LineChart data={leechHistory}>
      <Line dataKey="leechCount" stroke="#ff4444" />
      <XAxis dataKey="week" />
      <YAxis />
    </LineChart>
  );
};
```

### Leech Heatmap

```jsx
const LeechHeatmap = ({ deckId }) => {
  // Show which cards are most frequently failing
  // Color intensity = fail count
  
  return (
    <Heatmap>
      {cards.map(card => (
        <HeatmapCell 
          key={card._id}
          intensity={card.failCount / maxFailCount}
          tooltip={`${card.front}: ${card.failCount} fails`}
        />
      ))}
    </Heatmap>
  );
};
```

---

## ✅ Checklist

### Implementation
- [x] Update Flashcard model with leech/suspend/bury fields
- [x] Create leechService.js with detection logic
- [x] Create leechController.js with 13 endpoints
- [x] Create leechRoutes.js
- [x] Update StudyProgress.getDueCards() to filter suspended/buried
- [x] Update StudyProgress.getNewCards() to filter suspended/buried
- [x] Register routes in server.js

### Testing
- [ ] Test leech auto-detection
- [ ] Test suspend/unsuspend flow
- [ ] Test bury/unbury flow
- [ ] Test bulk operations
- [ ] Test review system filtering
- [ ] Test auto-unbury cron job

### Frontend
- [ ] Leech management page
- [ ] Suspend/bury modal during review
- [ ] Leech warning notification
- [ ] Stats dashboard with leech metrics
- [ ] Suspended/buried cards tabs

### Documentation
- [x] API documentation
- [x] Integration guide
- [x] Best practices guide
- [ ] Video tutorial

---

## 🎓 Learning Resources

- [Anki Manual - Leeches](https://docs.ankiweb.net/leeches.html)
- [SuperMemo Algorithm](https://www.supermemo.com/en/archives1990-2015/english/ol/sm2)
- [Spaced Repetition Best Practices](https://www.gwern.net/Spaced-repetition)

---

**Status**: ✅ Complete  
**Date**: 2025-11-08  
**Task**: #24 - Leech Detection, Suspend & Bury System  
**Version**: 1.0.0
