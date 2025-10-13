import React, { useState } from 'react';
import styled from 'styled-components';
import Swal from 'sweetalert2';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import TeacherLayout from '../layouts/TeacherLayout';

// ========== STYLED COMPONENTS ==========

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
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

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  }
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: ${props => props.color || '#58CC02'}22;
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
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }
`;

const CreateButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
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
    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  }
`;

const DeckHeader = styled.div`
  background: ${props => props.color || 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'};
  padding: 1.5rem;
  color: white;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    height: 100px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transform: translate(30%, -30%);
  }
`;

const DeckTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
`;

const DeckMeta = styled.div`
  display: flex;
  gap: 1rem;
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
`;

const DeckInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const InfoBadge = styled.span`
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: bold;
  background: ${props => props.color || '#8b5cf6'}22;
  color: ${props => props.color || '#8b5cf6'};
`;

const DeckActions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
`;

const ActionButton = styled.button`
  padding: 0.75rem;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  ${props => {
    if (props.variant === 'primary') {
      return `
        background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        color: white;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
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
    title: 'TOEIC Vocabulary 500',
    description: 'Bộ từ vựng TOEIC cơ bản 500 từ thông dụng nhất',
    cards: 500,
    assigned: 28,
    icon: '📚',
    color: 'linear-gradient(135deg, #58CC02 0%, #45a302 100%)',
  },
  {
    id: 2,
    title: 'Business Idioms',
    description: 'Thành ngữ tiếng Anh thương mại',
    cards: 150,
    assigned: 15,
    icon: '💼',
    color: 'linear-gradient(135deg, #1CB0F6 0%, #0891b2 100%)',
  },
  {
    id: 3,
    title: 'IELTS Speaking Topics',
    description: 'Chủ đề speaking IELTS phổ biến',
    cards: 200,
    assigned: 20,
    icon: '🎤',
    color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  },
];

// ========== COMPONENT ==========

const TeacherDecks = () => {
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [decks] = useState(mockDecks);
  const [searchTerm, setSearchTerm] = useState('');

  const stats = {
    total: decks.length,
    cards: decks.reduce((sum, d) => sum + d.cards, 0),
    assigned: decks.reduce((sum, d) => sum + d.assigned, 0),
    avgCards: Math.round(decks.reduce((sum, d) => sum + d.cards, 0) / decks.length),
  };

  const filteredDecks = decks.filter(deck =>
    deck.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deck.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateDeck = () => {
    showToast('info', 'Thông báo', 'Chức năng tạo deck đang phát triển');
  };

  const handleAssign = (deck) => {
    showToast('success', 'Đã giao!', `Deck "${deck.title}" đã được giao`);
  };

  const handleEdit = (deck) => {
    showToast('info', 'Thông báo', `Chỉnh sửa deck "${deck.title}"`);
  };

  return (
    <TeacherLayout pageTitle="🗂️ Deck & Flashcard">
      <Toast toast={toast} onClose={hideToast} />
      
      <PageContainer>
        {/* Stats */}
        <StatsGrid>
          <StatCard theme={theme}>
            <StatIcon color="#8b5cf6">🗂️</StatIcon>
            <StatValue theme={theme}>{stats.total}</StatValue>
            <StatLabel theme={theme}>Tổng deck</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#58CC02">📇</StatIcon>
            <StatValue theme={theme}>{stats.cards}</StatValue>
            <StatLabel theme={theme}>Tổng thẻ</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#1CB0F6">✅</StatIcon>
            <StatValue theme={theme}>{stats.assigned}</StatValue>
            <StatLabel theme={theme}>Đã giao</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#f59e0b">📊</StatIcon>
            <StatValue theme={theme}>{stats.avgCards}</StatValue>
            <StatLabel theme={theme}>TB thẻ/deck</StatLabel>
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
          
          <CreateButton onClick={handleCreateDeck}>
            <span>➕</span>
            Tạo deck mới
          </CreateButton>
        </ControlBar>

        {/* Decks Grid */}
        <DecksGrid>
          {filteredDecks.map(deck => (
            <DeckCard key={deck.id} theme={theme}>
              <DeckHeader color={deck.color}>
                <DeckTitle>
                  {deck.icon} {deck.title}
                </DeckTitle>
                <DeckMeta>
                  <span>📇 {deck.cards} thẻ</span>
                  <span>👥 {deck.assigned} học viên</span>
                </DeckMeta>
              </DeckHeader>
              
              <DeckBody>
                <DeckDescription theme={theme}>
                  {deck.description}
                </DeckDescription>

                <DeckActions theme={theme}>
                  <ActionButton
                    theme={theme}
                    variant="primary"
                    onClick={() => handleAssign(deck)}
                  >
                    ✅ Giao deck
                  </ActionButton>
                  <ActionButton
                    theme={theme}
                    onClick={() => handleEdit(deck)}
                  >
                    ✏️ Chỉnh sửa
                  </ActionButton>
                </DeckActions>
              </DeckBody>
            </DeckCard>
          ))}
        </DecksGrid>
      </PageContainer>
    </TeacherLayout>
  );
};

export default TeacherDecks;