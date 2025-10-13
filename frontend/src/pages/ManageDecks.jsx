import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Swal from 'sweetalert2';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import Header from '../components/Header';

// ========== STYLED COMPONENTS ==========

const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${props => props.theme === 'dark'
    ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
    : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
  };
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const WelcomeCard = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 300px;
    height: 300px;
    background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
    opacity: 0.05;
    border-radius: 50%;
    transform: translate(30%, -30%);
  }
`;

const WelcomeTitle = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const WelcomeSubtitle = styled.p`
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-bottom: 1rem;
`;

const DateTime = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-weight: 600;
`;

const ActionsBar = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  border: none;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;

  ${props => {
    if (props.variant === 'primary') {
      return `
        background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
        color: white;
        &:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(88, 204, 2, 0.3); }
      `;
    }
    if (props.variant === 'secondary') {
      return `
        background: linear-gradient(135deg, #1CB0F6 0%, #0891b2 100%);
        color: white;
        &:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(28, 176, 246, 0.3); }
      `;
    }
    if (props.variant === 'info') {
      return `
        background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        color: white;
        &:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3); }
      `;
    }
    if (props.variant === 'warning') {
      return `
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: white;
        &:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3); }
      `;
    }
    return '';
  }}
`;

const DecksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
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
  position: relative;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  }
`;

const DeckHeader = styled.div`
  background: ${props => props.color || 'linear-gradient(135deg, #58CC02 0%, #45a302 100%)'};
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

const SelectCheckbox = styled.input`
  position: absolute;
  top: 1rem;
  left: 1rem;
  width: 20px;
  height: 20px;
  cursor: pointer;
  z-index: 1;
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
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const DeckActions = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
`;

const DeckButton = styled.button`
  padding: 0.75rem;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  font-size: 1rem;
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
        &:hover { background: rgba(28, 176, 246, 0.2); transform: translateY(-2px); }
      `;
    }
    if (props.variant === 'edit') {
      return `
        background: rgba(245, 158, 11, 0.1);
        color: #f59e0b;
        &:hover { background: rgba(245, 158, 11, 0.2); transform: translateY(-2px); }
      `;
    }
    if (props.variant === 'delete') {
      return `
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
        &:hover { background: rgba(239, 68, 68, 0.2); transform: translateY(-2px); }
      `;
    }
    return '';
  }}
`;

// ========== MOCK DATA ==========

const mockDecks = [
  {
    id: 1,
    icon: '📚',
    title: 'TOEIC Vocabulary 990',
    description: 'Bộ từ vựng TOEIC 990 từ thiết yếu',
    cards: 990,
    created: '2025-10-01',
    color: 'linear-gradient(135deg, #58CC02 0%, #45a302 100%)',
  },
  {
    id: 2,
    icon: '💼',
    title: 'Business English',
    description: 'Tiếng Anh thương mại cơ bản',
    cards: 450,
    created: '2025-09-28',
    color: 'linear-gradient(135deg, #1CB0F6 0%, #0891b2 100%)',
  },
  {
    id: 3,
    icon: '🎯',
    title: 'IELTS Academic',
    description: 'Từ vựng học thuật IELTS',
    cards: 750,
    created: '2025-09-25',
    color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  },
];

// ========== COMPONENT ==========

const ManageDecks = () => {
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDecks, setSelectedDecks] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateTime = () => {
    const year = currentTime.getUTCFullYear();
    const month = String(currentTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(currentTime.getUTCDate()).padStart(2, '0');
    const hours = String(currentTime.getUTCHours()).padStart(2, '0');
    const minutes = String(currentTime.getUTCMinutes()).padStart(2, '0');
    const seconds = String(currentTime.getUTCSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const handleSelectDeck = (deckId) => {
    if (selectedDecks.includes(deckId)) {
      setSelectedDecks(selectedDecks.filter(id => id !== deckId));
    } else {
      setSelectedDecks([...selectedDecks, deckId]);
    }
  };

  const handleCreateDeck = () => {
    Swal.fire({
      title: '➕ Tạo Deck mới',
      html: `
        <div style="display:flex;flex-direction:column;gap:1rem;text-align:left;">
          <label>
            <span style="font-weight:600;color:#1e293b;display:block;margin-bottom:0.5rem;">📝 Tên Deck</span>
            <input id="deckName" class="swal2-input" placeholder="VD: TOEIC 500" style="margin:0;width:100%;">
          </label>
          <label>
            <span style="font-weight:600;color:#1e293b;display:block;margin-bottom:0.5rem;">📖 Mô tả</span>
            <textarea id="deckDesc" class="swal2-textarea" placeholder="Mô tả deck..." style="margin:0;width:100%;min-height:80px;"></textarea>
          </label>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '✨ Tạo Deck',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#58CC02',
      cancelButtonColor: '#6b7280',
      width: 600,
    }).then((result) => {
      if (result.isConfirmed) {
        showToast('success', 'Thành công!', 'Deck mới đã được tạo');
      }
    });
  };

  const handleCopyDeck = () => {
    if (selectedDecks.length === 0) {
      showToast('warning', 'Cảnh báo', 'Vui lòng chọn ít nhất 1 deck');
      return;
    }
    showToast('success', 'Đã sao chép!', `${selectedDecks.length} deck đã được sao chép`);
  };

  const handleMergeDecks = () => {
    if (selectedDecks.length < 2) {
      showToast('warning', 'Cảnh báo', 'Vui lòng chọn ít nhất 2 deck để hợp nhất');
      return;
    }
    Swal.fire({
      title: '🔗 Hợp nhất Decks',
      text: `Hợp nhất ${selectedDecks.length} decks đã chọn thành một deck mới?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#58CC02',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '🔗 Hợp nhất',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        showToast('success', 'Thành công!', 'Decks đã được hợp nhất');
        setSelectedDecks([]);
      }
    });
  };

  const handleSplitDeck = (deck) => {
    Swal.fire({
      title: '✂️ Tách Deck',
      html: `
        <div style="text-align:left;">
          <p style="margin-bottom:1rem;">Tách deck "${deck.title}" thành bao nhiêu phần?</p>
          <input id="splitCount" type="number" class="swal2-input" placeholder="2" value="2" min="2" max="10" style="width:100%;">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '✂️ Tách Deck',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#6b7280',
    }).then((result) => {
      if (result.isConfirmed) {
        showToast('success', 'Thành công!', `Deck đã được tách thành ${document.getElementById('splitCount').value} phần`);
      }
    });
  };

  const handleViewDeck = (deck) => {
    showToast('info', 'Xem deck', `Xem chi tiết deck "${deck.title}"`);
  };

  const handleEditDeck = (deck) => {
    showToast('info', 'Chỉnh sửa', `Chỉnh sửa deck "${deck.title}"`);
  };

  const handleDeleteDeck = (deck) => {
    Swal.fire({
      title: 'Xác nhận xóa?',
      text: `Bạn có chắc muốn xóa deck "${deck.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '🗑️ Xóa',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        showToast('success', 'Đã xóa!', `Deck "${deck.title}" đã được xóa`);
      }
    });
  };

  return (
    <PageWrapper theme={theme}>
      <Header theme={theme} userName="vinhsonvlog" />
      <Toast toast={toast} onClose={hideToast} />
      
      <Container>
        <WelcomeCard theme={theme}>
          <WelcomeTitle theme={theme}>
            <span>🗂️</span>
            Quản lý Decks
          </WelcomeTitle>
          <WelcomeSubtitle theme={theme}>
            Tạo, sao chép, hợp nhất hoặc tách deck để quản lý nội dung học tập cá nhân
          </WelcomeSubtitle>
          <DateTime theme={theme}>
            🕐 {formatDateTime()} UTC | 👤 vinhsonvlog
          </DateTime>
        </WelcomeCard>

        <ActionsBar theme={theme}>
          <ActionButton variant="primary" onClick={handleCreateDeck}>
            <span>➕</span>
            Tạo mới
          </ActionButton>
          <ActionButton variant="secondary" onClick={handleCopyDeck}>
            <span>📋</span>
            Sao chép ({selectedDecks.length})
          </ActionButton>
          <ActionButton variant="info" onClick={handleMergeDecks}>
            <span>🔗</span>
            Hợp nhất ({selectedDecks.length})
          </ActionButton>
        </ActionsBar>

        <DecksGrid>
          {mockDecks.map(deck => (
            <DeckCard key={deck.id} theme={theme}>
              <DeckHeader color={deck.color}>
                <SelectCheckbox
                  type="checkbox"
                  checked={selectedDecks.includes(deck.id)}
                  onChange={() => handleSelectDeck(deck.id)}
                />
                <DeckIcon>{deck.icon}</DeckIcon>
                <DeckTitle>{deck.title}</DeckTitle>
                <DeckMeta>
                  <span>📇 {deck.cards} thẻ</span>
                  <span>📅 {deck.created}</span>
                </DeckMeta>
              </DeckHeader>

              <DeckBody>
                <DeckDescription theme={theme}>
                  {deck.description}
                </DeckDescription>

                <DeckActions>
                  <DeckButton variant="view" onClick={() => handleViewDeck(deck)}>
                    👁️
                  </DeckButton>
                  <DeckButton variant="edit" onClick={() => handleEditDeck(deck)}>
                    ✏️
                  </DeckButton>
                  <DeckButton variant="delete" onClick={() => handleDeleteDeck(deck)}>
                    🗑️
                  </DeckButton>
                </DeckActions>

                <ActionButton 
                  variant="warning" 
                  onClick={() => handleSplitDeck(deck)}
                  style={{ marginTop: '1rem', width: '100%' }}
                >
                  <span>✂️</span>
                  Tách Deck
                </ActionButton>
              </DeckBody>
            </DeckCard>
          ))}
        </DecksGrid>
      </Container>
    </PageWrapper>
  );
};

export default ManageDecks;