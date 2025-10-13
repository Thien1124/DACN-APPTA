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
  grid-template-columns: repeat(5, 1fr);
  gap: 1.5rem;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 768px) {
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
  flex-wrap: wrap;
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

const TableSection = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  border-radius: 12px;
  
  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${props => props.theme === 'dark' ? '#1f2937' : '#f3f4f6'};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #f59e0b;
    border-radius: 4px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
`;

const TableHead = styled.thead`
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#f9fafb'};
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.theme === 'dark' ? 'rgba(245, 158, 11, 0.05)' : 'rgba(245, 158, 11, 0.03)'};
  }
`;

const TableHeader = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const TableCell = styled.td`
  padding: 1rem;
  color: ${props => props.theme === 'dark' ? '#d1d5db' : '#4b5563'};
  font-size: 0.875rem;
`;

const WordCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const Word = styled.div`
  font-size: 1rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
`;

const Phonetic = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#1CB0F6' : '#0891b2'};
  font-style: italic;
`;

const TypeBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: bold;
  background: ${props => {
    if (props.type === 'noun') return 'rgba(88, 204, 2, 0.2)';
    if (props.type === 'verb') return 'rgba(28, 176, 246, 0.2)';
    if (props.type === 'adjective') return 'rgba(139, 92, 246, 0.2)';
    if (props.type === 'adverb') return 'rgba(245, 158, 11, 0.2)';
    return 'rgba(156, 163, 175, 0.2)';
  }};
  color: ${props => {
    if (props.type === 'noun') return '#58CC02';
    if (props.type === 'verb') return '#1CB0F6';
    if (props.type === 'adjective') return '#8b5cf6';
    if (props.type === 'adverb') return '#f59e0b';
    return '#6b7280';
  }};
  text-transform: uppercase;
`;

const LevelBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: bold;
  background: ${props => {
    if (props.level === 'A1') return 'rgba(16, 185, 129, 0.2)';
    if (props.level === 'A2') return 'rgba(88, 204, 2, 0.2)';
    if (props.level === 'B1') return 'rgba(28, 176, 246, 0.2)';
    if (props.level === 'B2') return 'rgba(139, 92, 246, 0.2)';
    if (props.level === 'C1') return 'rgba(245, 158, 11, 0.2)';
    if (props.level === 'C2') return 'rgba(239, 68, 68, 0.2)';
    return 'rgba(156, 163, 175, 0.2)';
  }};
  color: ${props => {
    if (props.level === 'A1') return '#10b981';
    if (props.level === 'A2') return '#58CC02';
    if (props.level === 'B1') return '#1CB0F6';
    if (props.level === 'B2') return '#8b5cf6';
    if (props.level === 'C1') return '#f59e0b';
    if (props.level === 'C2') return '#ef4444';
    return '#6b7280';
  }};
  font-weight: bold;
`;

const ActionButtons2 = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;

  ${props => {
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
    if (props.variant === 'audio') {
      return `
        background: rgba(28, 176, 246, 0.1);
        color: #1CB0F6;
        
        &:hover {
          background: rgba(28, 176, 246, 0.2);
          transform: translateY(-2px);
        }
      `;
    }
    return '';
  }}
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
`;

const PaginationInfo = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const PaginationButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: none;
  background: ${props => {
    if (props.active) return '#f59e0b';
    return props.theme === 'dark' ? '#374151' : '#f3f4f6';
  }};
  color: ${props => {
    if (props.active) return 'white';
    return props.theme === 'dark' ? '#e5e7eb' : '#374151';
  }};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.active ? '#d97706' : (props.theme === 'dark' ? '#4B5563' : '#e5e7eb')};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

// ========== MOCK DATA ==========

const mockWords = [
  {
    id: 1,
    word: 'achievement',
    phonetic: '/əˈtʃiːvmənt/',
    type: 'noun',
    meaning: 'Thành tựu, thành tích',
    example: 'Winning the competition was a great achievement.',
    level: 'B2',
    category: 'Business',
  },
  {
    id: 2,
    word: 'collaborate',
    phonetic: '/kəˈlæbəreɪt/',
    type: 'verb',
    meaning: 'Cộng tác, hợp tác',
    example: 'We need to collaborate to finish this project.',
    level: 'B1',
    category: 'Business',
  },
  {
    id: 3,
    word: 'efficient',
    phonetic: '/ɪˈfɪʃənt/',
    type: 'adjective',
    meaning: 'Hiệu quả, có năng suất',
    example: 'This is a very efficient method.',
    level: 'B2',
    category: 'General',
  },
  {
    id: 4,
    word: 'implement',
    phonetic: '/ˈɪmplɪment/',
    type: 'verb',
    meaning: 'Thực hiện, triển khai',
    example: 'We will implement the new policy next month.',
    level: 'C1',
    category: 'Business',
  },
  {
    id: 5,
    word: 'significantly',
    phonetic: '/sɪɡˈnɪfɪkəntli/',
    type: 'adverb',
    meaning: 'Đáng kể, có ý nghĩa',
    example: 'Sales have increased significantly this quarter.',
    level: 'B2',
    category: 'Academic',
  },
];

// ========== COMPONENT ==========

const AdminWordbank = () => {
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [words] = useState(mockWords);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
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
    total: 15678,
    nouns: 6234,
    verbs: 4567,
    adjectives: 3456,
    adverbs: 1421,
  };

  const filteredWords = words.filter(word => {
    const matchSearch = word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       word.meaning.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'all' || word.type === filterType;
    const matchLevel = filterLevel === 'all' || word.level === filterLevel;
    return matchSearch && matchType && matchLevel;
  });

  const handleCreateWord = () => {
    Swal.fire({
      title: '➕ Thêm từ mới',
      html: `
        <div style="display:flex;flex-direction:column;gap:1rem;text-align:left;">
          <label style="display:flex;flex-direction:column;gap:0.5rem;">
            <span style="font-weight:600;color:#1e293b;">📝 Từ vựng *</span>
            <input id="wordText" class="swal2-input" placeholder="VD: achievement" style="margin:0;width:100%;">
          </label>
          
          <label style="display:flex;flex-direction:column;gap:0.5rem;">
            <span style="font-weight:600;color:#1e293b;">🔊 Phiên âm</span>
            <input id="wordPhonetic" class="swal2-input" placeholder="/əˈtʃiːvmənt/" style="margin:0;width:100%;">
          </label>
          
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
            <label style="display:flex;flex-direction:column;gap:0.5rem;">
              <span style="font-weight:600;color:#1e293b;">📚 Loại từ *</span>
              <select id="wordType" class="swal2-select" style="margin:0;width:100%;">
                <option value="noun">Noun (Danh từ)</option>
                <option value="verb">Verb (Động từ)</option>
                <option value="adjective">Adjective (Tính từ)</option>
                <option value="adverb">Adverb (Trạng từ)</option>
              </select>
            </label>
            
            <label style="display:flex;flex-direction:column;gap:0.5rem;">
              <span style="font-weight:600;color:#1e293b;">🎯 Cấp độ *</span>
              <select id="wordLevel" class="swal2-select" style="margin:0;width:100%;">
                <option value="A1">A1 - Beginner</option>
                <option value="A2">A2 - Elementary</option>
                <option value="B1">B1 - Intermediate</option>
                <option value="B2">B2 - Upper-Intermediate</option>
                <option value="C1">C1 - Advanced</option>
                <option value="C2">C2 - Proficiency</option>
              </select>
            </label>
          </div>
          
          <label style="display:flex;flex-direction:column;gap:0.5rem;">
            <span style="font-weight:600;color:#1e293b;">💭 Nghĩa *</span>
            <input id="wordMeaning" class="swal2-input" placeholder="Thành tựu, thành tích" style="margin:0;width:100%;">
          </label>
          
          <label style="display:flex;flex-direction:column;gap:0.5rem;">
            <span style="font-weight:600;color:#1e293b;">📖 Ví dụ</span>
            <textarea id="wordExample" class="swal2-textarea" placeholder="This is a great achievement." style="margin:0;width:100%;min-height:60px;"></textarea>
          </label>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '✨ Thêm từ',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#6b7280',
      width: 700,
      preConfirm: () => {
        const word = document.getElementById('wordText').value.trim();
        const meaning = document.getElementById('wordMeaning').value.trim();
        
        if (!word || !meaning) {
          Swal.showValidationMessage('Vui lòng nhập từ vựng và nghĩa');
          return false;
        }
        
        return { word, meaning };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        showToast('success', 'Thành công!', `Từ "${result.value.word}" đã được thêm vào từ điển`);
      }
    });
  };

  const handlePlayAudio = (word) => {
    showToast('info', '🔊 Phát âm', `Đang phát âm từ "${word.word}"`);
  };

  const handleEditWord = (word) => {
    showToast('info', 'Chỉnh sửa', `Chỉnh sửa từ "${word.word}"`);
  };

  const handleDeleteWord = (word) => {
    Swal.fire({
      title: 'Xác nhận xóa?',
      text: `Bạn có chắc muốn xóa từ "${word.word}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        showToast('success', 'Đã xóa!', `Từ "${word.word}" đã được xóa khỏi từ điển`);
      }
    });
  };

  return (
    <AdminLayout pageTitle="📖 Wordbank">
      <Toast toast={toast} onClose={hideToast} />
      
      <PageContainer>
        {/* Welcome Card */}
        <WelcomeCard theme={theme}>
          <WelcomeContent>
            <WelcomeTitle theme={theme}>
              Quản lý Từ điển 📖
            </WelcomeTitle>
            <WelcomeSubtitle theme={theme}>
              Kho từ vựng tiếng Anh với phiên âm và ví dụ
            </WelcomeSubtitle>
            <DateTime theme={theme}>
              <span>🕐</span>
              {formatDateTime(currentTime)} UTC | 👤 vinhsonvlog
            </DateTime>
          </WelcomeContent>
          <WelcomeIllustration>📖</WelcomeIllustration>
        </WelcomeCard>

        {/* Stats */}
        <StatsGrid>
          <StatCard theme={theme}>
            <StatIcon color="#f59e0b">📖</StatIcon>
            <StatValue theme={theme}>{stats.total.toLocaleString()}</StatValue>
            <StatLabel theme={theme}>Tổng từ</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#58CC02">📦</StatIcon>
            <StatValue theme={theme}>{stats.nouns.toLocaleString()}</StatValue>
            <StatLabel theme={theme}>Danh từ</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#1CB0F6">⚡</StatIcon>
            <StatValue theme={theme}>{stats.verbs.toLocaleString()}</StatValue>
            <StatLabel theme={theme}>Động từ</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#8b5cf6">✨</StatIcon>
            <StatValue theme={theme}>{stats.adjectives.toLocaleString()}</StatValue>
            <StatLabel theme={theme}>Tính từ</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#f59e0b">💫</StatIcon>
            <StatValue theme={theme}>{stats.adverbs.toLocaleString()}</StatValue>
            <StatLabel theme={theme}>Trạng từ</StatLabel>
          </StatCard>
        </StatsGrid>

        {/* Control Bar */}
        <ControlBar theme={theme}>
          <SearchWrapper>
            <SearchInput
              theme={theme}
              placeholder="Tìm kiếm từ vựng hoặc nghĩa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchWrapper>
          
          <ActionButtons>
            <FilterSelect
              theme={theme}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Tất cả loại từ</option>
              <option value="noun">📦 Noun</option>
              <option value="verb">⚡ Verb</option>
              <option value="adjective">✨ Adjective</option>
              <option value="adverb">💫 Adverb</option>
            </FilterSelect>

            <FilterSelect
              theme={theme}
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
            >
              <option value="all">Tất cả cấp độ</option>
              <option value="A1">A1 - Beginner</option>
              <option value="A2">A2 - Elementary</option>
              <option value="B1">B1 - Intermediate</option>
              <option value="B2">B2 - Upper-Intermediate</option>
              <option value="C1">C1 - Advanced</option>
              <option value="C2">C2 - Proficiency</option>
            </FilterSelect>
            
            <CreateButton onClick={handleCreateWord}>
              <span>➕</span>
              Thêm từ
            </CreateButton>
          </ActionButtons>
        </ControlBar>

        {/* Table */}
        <TableSection theme={theme}>
          <TableWrapper theme={theme}>
            <Table>
              <TableHead theme={theme}>
                <TableRow>
                  <TableHeader theme={theme}>Từ vựng</TableHeader>
                  <TableHeader theme={theme}>Loại từ</TableHeader>
                  <TableHeader theme={theme}>Nghĩa</TableHeader>
                  <TableHeader theme={theme}>Ví dụ</TableHeader>
                  <TableHeader theme={theme}>Cấp độ</TableHeader>
                  <TableHeader theme={theme}>Hành động</TableHeader>
                </TableRow>
              </TableHead>
              <tbody>
                {filteredWords.map(word => (
                  <TableRow key={word.id} theme={theme}>
                    <TableCell>
                      <WordCell>
                        <Word theme={theme}>{word.word}</Word>
                        <Phonetic theme={theme}>{word.phonetic}</Phonetic>
                      </WordCell>
                    </TableCell>
                    <TableCell>
                      <TypeBadge type={word.type}>{word.type}</TypeBadge>
                    </TableCell>
                    <TableCell>{word.meaning}</TableCell>
                    <TableCell>
                      <div style={{ fontStyle: 'italic', color: '#6b7280' }}>
                        {word.example}
                      </div>
                    </TableCell>
                    <TableCell>
                      <LevelBadge level={word.level}>{word.level}</LevelBadge>
                    </TableCell>
                    <TableCell>
                      <ActionButtons2>
                        <ActionButton
                          variant="audio"
                          onClick={() => handlePlayAudio(word)}
                          title="Phát âm"
                        >
                          🔊
                        </ActionButton>
                        <ActionButton
                          variant="edit"
                          onClick={() => handleEditWord(word)}
                          title="Chỉnh sửa"
                        >
                          ✏️
                        </ActionButton>
                        <ActionButton
                          variant="delete"
                          onClick={() => handleDeleteWord(word)}
                          title="Xóa"
                        >
                          🗑️
                        </ActionButton>
                      </ActionButtons2>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </TableWrapper>

          <Pagination theme={theme}>
            <PaginationInfo theme={theme}>
              Hiển thị 1-5 trong tổng số 15,678 từ
            </PaginationInfo>
            <PaginationButtons>
              <PaginationButton theme={theme} disabled>
                ← Trước
              </PaginationButton>
              <PaginationButton theme={theme} active>1</PaginationButton>
              <PaginationButton theme={theme}>2</PaginationButton>
              <PaginationButton theme={theme}>3</PaginationButton>
              <PaginationButton theme={theme}>...</PaginationButton>
              <PaginationButton theme={theme}>314</PaginationButton>
              <PaginationButton theme={theme}>
                Sau →
              </PaginationButton>
            </PaginationButtons>
          </Pagination>
        </TableSection>
      </PageContainer>
    </AdminLayout>
  );
};

export default AdminWordbank;