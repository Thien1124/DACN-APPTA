import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Swal from 'sweetalert2';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import AdminLayout from '../layouts/AdminLayout';

// ========== STYLED COMPONENTS ==========

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const WelcomeCard = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(135deg, #1f2937 0%, #111827 100%)' 
    : 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)'
  };
  border-radius: 24px;
  padding: 2rem;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 300px;
    height: 300px;
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    opacity: 0.05;
    border-radius: 50%;
    transform: translate(30%, -30%);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
`;

const WelcomeContent = styled.div`
  flex: 1;
  z-index: 1;
`;

const WelcomeTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.5rem;
`;

const WelcomeSubtitle = styled.p`
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-bottom: 0.75rem;
`;

const DateTime = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  span:first-child {
    font-size: 1rem;
  }
`;

const WelcomeIllustration = styled.div`
  font-size: 5rem;
  z-index: 1;

  @media (max-width: 768px) {
    font-size: 4rem;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  }
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: ${props => props.color || '#f59e0b'}22;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-weight: 600;
`;

const ControlBar = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const SearchWrapper = styled.div`
  position: relative;
  flex: 1;
  min-width: 250px;
  
  &::before {
    content: '🔍';
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1.25rem;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border-radius: 12px;
  border: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #f59e0b;
    box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
  }

  &::placeholder {
    color: ${props => props.theme === 'dark' ? '#6b7280' : '#9ca3af'};
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
`;

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #f59e0b;
  }
`;

const CreateButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border: none;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  white-space: nowrap;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
  }
`;

const DecksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DeckCard = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  }
`;

const DeckHeader = styled.div`
  background: ${props => props.color || 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'};
  padding: 1.5rem;
  color: white;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 120px;
    height: 120px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transform: translate(30%, -30%);
  }
`;

const DeckIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
`;

const DeckTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
`;

const DeckCategory = styled.div`
  font-size: 0.875rem;
  opacity: 0.9;
  position: relative;
  z-index: 1;
`;

const DeckBody = styled.div`
  padding: 1.5rem;
`;

const DeckDescription = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-bottom: 1rem;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const DeckStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const DeckStatItem = styled.div`
  text-align: center;
  padding: 0.75rem;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#f9fafb'};
  border-radius: 10px;
`;

const DeckStatValue = styled.div`
  font-size: 1.25rem;
  font-weight: bold;
  color: ${props => props.color || '#f59e0b'};
  margin-bottom: 0.25rem;
`;

const DeckStatLabel = styled.div`
  font-size: 0.7rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-weight: 600;
  text-transform: uppercase;
`;

const DeckMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const MetaBadge = styled.span`
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: bold;
  background: ${props => props.color || '#f59e0b'}22;
  color: ${props => props.color || '#f59e0b'};
`;

const DeckActions = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
`;

const ActionButton = styled.button`
  padding: 0.75rem;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  ${props => {
    if (props.variant === 'view') {
      return `
        background: rgba(28, 176, 246, 0.1);
        color: #1CB0F6;
        
        &:hover {
          background: rgba(28, 176, 246, 0.2);
          transform: translateY(-2px);
        }
      `;
    }
    if (props.variant === 'edit') {
      return `
        background: rgba(245, 158, 11, 0.1);
        color: #f59e0b;
        
        &:hover {
          background: rgba(245, 158, 11, 0.2);
          transform: translateY(-2px);
        }
      `;
    }
    if (props.variant === 'delete') {
      return `
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
        
        &:hover {
          background: rgba(239, 68, 68, 0.2);
          transform: translateY(-2px);
        }
      `;
    }
    return `
      background: ${props.theme === 'dark' ? '#374151' : '#f3f4f6'};
      color: ${props.theme === 'dark' ? '#e5e7eb' : '#374151'};
      
      &:hover {
        background: ${props.theme === 'dark' ? '#4B5563' : '#e5e7eb'};
      }
    `;
  }}
`;

// ========== MOCK DATA ==========

const mockDecks = [
  {
    id: 1,
    icon: '📚',
    title: 'TOEIC Vocabulary 990',
    category: 'TOEIC',
    description: 'Bộ từ vựng TOEIC 990 từ thiết yếu cho mục tiêu 850+',
    cards: 990,
    users: 1245,
    reviews: 8567,
    level: 'Advanced',
    language: 'English',
    color: 'linear-gradient(135deg, #58CC02 0%, #45a302 100%)',
  },
  {
    id: 2,
    icon: '💼',
    title: 'Business English Essentials',
    category: 'Business',
    description: 'Từ vựng và cụm từ tiếng Anh thương mại cần thiết',
    cards: 450,
    users: 867,
    reviews: 5234,
    level: 'Intermediate',
    language: 'English',
    color: 'linear-gradient(135deg, #1CB0F6 0%, #0891b2 100%)',
  },
  {
    id: 3,
    icon: '🎯',
    title: 'IELTS Academic Vocabulary',
    category: 'IELTS',
    description: 'Từ vựng học thuật IELTS band 7.0+',
    cards: 750,
    users: 956,
    reviews: 6123,
    level: 'Advanced',
    language: 'English',
    color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  },
  {
    id: 4,
    icon: '🔤',
    title: 'English Grammar in Use',
    category: 'Grammar',
    description: 'Ngữ pháp tiếng Anh cơ bản đến nâng cao',
    cards: 320,
    users: 2134,
    reviews: 12456,
    level: 'All Levels',
    language: 'English',
    color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  },
  {
    id: 5,
    icon: '🗣️',
    title: 'Daily Conversation',
    category: 'Speaking',
    description: 'Hội thoại tiếng Anh hàng ngày thông dụng',
    cards: 280,
    users: 1567,
    reviews: 9234,
    level: 'Beginner',
    language: 'English',
    color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  },
  {
    id: 6,
    icon: '✈️',
    title: 'Travel English',
    category: 'Travel',
    description: 'Tiếng Anh du lịch thiết yếu cho mọi hành trình',
    cards: 190,
    users: 1823,
    reviews: 8765,
    level: 'Beginner',
    language: 'English',
    color: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
  },
];

// ========== COMPONENT ==========

const AdminFlashcards = () => {
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [decks] = useState(mockDecks);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date) => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const stats = {
    totalDecks: decks.length,
    totalCards: decks.reduce((sum, d) => sum + d.cards, 0),
    totalUsers: decks.reduce((sum, d) => sum + d.users, 0),
    totalReviews: decks.reduce((sum, d) => sum + d.reviews, 0),
  };

  const filteredDecks = decks.filter(deck => {
    const matchSearch = deck.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       deck.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = filterCategory === 'all' || deck.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const handleCreateDeck = () => {
    Swal.fire({
      title: '➕ Tạo Deck mới',
      html: `
        <div style="display:flex;flex-direction:column;gap:1rem;text-align:left;">
          <label style="display:flex;flex-direction:column;gap:0.5rem;">
            <span style="font-weight:600;color:#1e293b;">🗂️ Tên Deck *</span>
            <input id="deckTitle" class="swal2-input" placeholder="VD: TOEIC Vocabulary 500" style="margin:0;width:100%;">
          </label>
          
          <label style="display:flex;flex-direction:column;gap:0.5rem;">
            <span style="font-weight:600;color:#1e293b;">📁 Danh mục *</span>
            <select id="deckCategory" class="swal2-select" style="margin:0;width:100%;">
              <option value="TOEIC">TOEIC</option>
              <option value="IELTS">IELTS</option>
              <option value="Grammar">Grammar</option>
              <option value="Business">Business</option>
              <option value="Speaking">Speaking</option>
              <option value="Travel">Travel</option>
            </select>
          </label>
          
          <label style="display:flex;flex-direction:column;gap:0.5rem;">
            <span style="font-weight:600;color:#1e293b;">📝 Mô tả</span>
            <textarea id="deckDescription" class="swal2-textarea" placeholder="Mô tả ngắn về deck..." style="margin:0;width:100%;min-height:80px;"></textarea>
          </label>
          
          <label style="display:flex;flex-direction:column;gap:0.5rem;">
            <span style="font-weight:600;color:#1e293b;">🎯 Cấp độ</span>
            <select id="deckLevel" class="swal2-select" style="margin:0;width:100%;">
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="All Levels">All Levels</option>
            </select>
          </label>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '✨ Tạo Deck',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#6b7280',
      width: 600,
      preConfirm: () => {
        const title = document.getElementById('deckTitle').value.trim();
        const category = document.getElementById('deckCategory').value;
        
        if (!title) {
          Swal.showValidationMessage('Vui lòng nhập tên Deck');
          return false;
        }
        
        return { title, category };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        showToast('success', 'Thành công!', `Deck "${result.value.title}" đã được tạo`);
      }
    });
  };

  const handleViewDeck = (deck) => {
    showToast('info', 'Xem Deck', `Đang xem chi tiết deck "${deck.title}"`);
  };

  const handleEditDeck = (deck) => {
    showToast('info', 'Chỉnh sửa', `Chỉnh sửa deck "${deck.title}"`);
  };

  const handleDeleteDeck = (deck) => {
    Swal.fire({
      title: 'Xác nhận xóa?',
      text: `Bạn có chắc muốn xóa deck "${deck.title}"? Tất cả ${deck.cards} thẻ sẽ bị xóa.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        showToast('success', 'Đã xóa!', `Deck "${deck.title}" đã được xóa`);
      }
    });
  };

  return (
    <AdminLayout pageTitle="🗂️ Flashcards">
      <Toast toast={toast} onClose={hideToast} />
      
      <PageContainer>
        {/* Welcome Card */}
        <WelcomeCard theme={theme}>
          <WelcomeContent>
            <WelcomeTitle theme={theme}>
              Quản lý Flashcards 🗂️
            </WelcomeTitle>
            <WelcomeSubtitle theme={theme}>
              Tạo và quản lý các bộ thẻ học tập
            </WelcomeSubtitle>
            <DateTime theme={theme}>
              <span>🕐</span>
              {formatDateTime(currentTime)} UTC | 👤 vinhsonvlog
            </DateTime>
          </WelcomeContent>
          <WelcomeIllustration>🗂️</WelcomeIllustration>
        </WelcomeCard>

        {/* Stats */}
        <StatsGrid>
          <StatCard theme={theme}>
            <StatIcon color="#f59e0b">🗂️</StatIcon>
            <StatValue theme={theme}>{stats.totalDecks}</StatValue>
            <StatLabel theme={theme}>Tổng Deck</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#58CC02">📇</StatIcon>
            <StatValue theme={theme}>{stats.totalCards.toLocaleString()}</StatValue>
            <StatLabel theme={theme}>Tổng thẻ</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#1CB0F6">👥</StatIcon>
            <StatValue theme={theme}>{stats.totalUsers.toLocaleString()}</StatValue>
            <StatLabel theme={theme}>Người dùng</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#8b5cf6">📊</StatIcon>
            <StatValue theme={theme}>{stats.totalReviews.toLocaleString()}</StatValue>
            <StatLabel theme={theme}>Lượt ôn tập</StatLabel>
          </StatCard>
        </StatsGrid>

        {/* Control Bar */}
        <ControlBar theme={theme}>
          <SearchWrapper>
            <SearchInput
              theme={theme}
              placeholder="Tìm kiếm deck..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchWrapper>
          
          <ActionButtons>
            <FilterSelect
              theme={theme}
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">Tất cả danh mục</option>
              <option value="TOEIC">📚 TOEIC</option>
              <option value="IELTS">🎯 IELTS</option>
              <option value="Grammar">🔤 Grammar</option>
              <option value="Business">💼 Business</option>
              <option value="Speaking">🗣️ Speaking</option>
              <option value="Travel">✈️ Travel</option>
            </FilterSelect>
            
            <CreateButton onClick={handleCreateDeck}>
              <span>➕</span>
              Tạo Deck
            </CreateButton>
          </ActionButtons>
        </ControlBar>

        {/* Decks Grid */}
        <DecksGrid>
          {filteredDecks.map(deck => (
            <DeckCard key={deck.id} theme={theme}>
              <DeckHeader color={deck.color}>
                <DeckIcon>{deck.icon}</DeckIcon>
                <DeckTitle>{deck.title}</DeckTitle>
                <DeckCategory>{deck.category}</DeckCategory>
              </DeckHeader>
              
              <DeckBody>
                <DeckDescription theme={theme}>
                  {deck.description}
                </DeckDescription>
                
                <DeckStats>
                  <DeckStatItem theme={theme}>
                    <DeckStatValue color="#58CC02">{deck.cards}</DeckStatValue>
                    <DeckStatLabel theme={theme}>Thẻ</DeckStatLabel>
                  </DeckStatItem>
                  <DeckStatItem theme={theme}>
                    <DeckStatValue color="#1CB0F6">{deck.users}</DeckStatValue>
                    <DeckStatLabel theme={theme}>Users</DeckStatLabel>
                  </DeckStatItem>
                  <DeckStatItem theme={theme}>
                    <DeckStatValue color="#8b5cf6">{deck.reviews}</DeckStatValue>
                    <DeckStatLabel theme={theme}>Reviews</DeckStatLabel>
                  </DeckStatItem>
                </DeckStats>
                
                <DeckMeta>
                  <MetaBadge color="#f59e0b">
                    🎯 {deck.level}
                  </MetaBadge>
                  <MetaBadge color="#10b981">
                    🌐 {deck.language}
                  </MetaBadge>
                </DeckMeta>

                <DeckActions theme={theme}>
                  <ActionButton
                    theme={theme}
                    variant="view"
                    onClick={() => handleViewDeck(deck)}
                    title="Xem chi tiết"
                  >
                    👁️
                  </ActionButton>
                  <ActionButton
                    theme={theme}
                    variant="edit"
                    onClick={() => handleEditDeck(deck)}
                    title="Chỉnh sửa"
                  >
                    ✏️
                  </ActionButton>
                  <ActionButton
                    theme={theme}
                    variant="delete"
                    onClick={() => handleDeleteDeck(deck)}
                    title="Xóa"
                  >
                    🗑️
                  </ActionButton>
                </DeckActions>
              </DeckBody>
            </DeckCard>
          ))}
        </DecksGrid>
      </PageContainer>
    </AdminLayout>
  );
};

export default AdminFlashcards;