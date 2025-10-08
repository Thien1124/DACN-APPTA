import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Swal from 'sweetalert2';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import Header from '../components/Header';

// ========== STYLED COMPONENTS ==========

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%)'
    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e0 100%)'
  };
  position: relative;
  overflow-x: hidden;

  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.theme === 'dark'
      ? 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 70%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 70%), radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 70%)'
      : 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 70%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.05) 0%, transparent 70%), radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.05) 0%, transparent 70%)'
    };
    z-index: -1;
  }
`;

const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  span:first-child {
    font-size: 3rem;
  }

  @media (max-width: 768px) {
    font-size: 2rem;
    
    span:first-child {
      font-size: 2.5rem;
    }
  }
`;

const PageSubtitle = styled.p`
  font-size: 1.125rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;

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
  animation: slideUp 0.6s ease;
  animation-delay: ${props => props.delay || '0s'};
  animation-fill-mode: both;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
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

const FilterSection = styled.div`
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
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SearchWrapper = styled.div`
  position: relative;
`;

const SearchIcon = styled.span`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.25rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border-radius: 12px;
  border: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #58CC02;
    box-shadow: 0 0 0 3px rgba(88, 204, 2, 0.1);
  }

  &::placeholder {
    color: ${props => props.theme === 'dark' ? '#6b7280' : '#9ca3af'};
  }
`;

const FilterSelect = styled.select`
  padding: 1rem;
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
    border-color: #58CC02;
    box-shadow: 0 0 0 3px rgba(88, 204, 2, 0.1);
  }
`;

const TagsSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  span:first-child {
    font-size: 1.75rem;
  }
`;

const TagsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const TagCard = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1rem 1.5rem;
  border: 2px solid ${props => {
    if (props.selected) return props.color || '#58CC02';
    return props.theme === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)';
  }};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    border-color: ${props => props.color || '#58CC02'};
  }
`;

const TagIcon = styled.span`
  font-size: 1.5rem;
`;

const TagInfo = styled.div``;

const TagName = styled.div`
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 1rem;
`;

const TagCount = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const WordsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const WordCard = styled.div`
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
  position: relative;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  }
`;

const WordHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const WordTitle = styled.div`
  flex: 1;
`;

const WordText = styled.h3`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.25rem;
`;

const WordPhonetic = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-style: italic;
`;

const AudioBtn = styled.button`
  background: rgba(88, 204, 2, 0.1);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(88, 204, 2, 0.2);
    transform: scale(1.1);
  }
`;

const WordType = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: bold;
  background: ${props => props.color || '#58CC02'}22;
  color: ${props => props.color || '#58CC02'};
  margin-bottom: 1rem;
`;

const WordMeaning = styled.div`
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#d1d5db' : '#4b5563'};
  margin-bottom: 1rem;
  line-height: 1.6;
`;

const WordExample = styled.div`
  padding: 1rem;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#f9fafb'};
  border-radius: 12px;
  border-left: 3px solid #58CC02;
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-style: italic;
  margin-bottom: 1rem;
`;

const WordTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const WordTag = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  background: ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  color: ${props => props.theme === 'dark' ? '#d1d5db' : '#4b5563'};
`;

const WordActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ActionBtn = styled.button`
  flex: 1;
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
        background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
        color: white;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(88, 204, 2, 0.3);
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

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
`;

const EmptyIcon = styled.div`
  font-size: 5rem;
  margin-bottom: 1rem;
  opacity: 0.5;
`;

const EmptyText = styled.div`
  font-size: 1.25rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-weight: 600;
`;

const LoadMoreButton = styled.button`
  width: 100%;
  max-width: 400px;
  margin: 2rem auto;
  display: block;
  padding: 1rem 2rem;
  border-radius: 12px;
  background: ${props => props.theme === 'dark' ? '#374151' : '#f3f4f6'};
  color: ${props => props.theme === 'dark' ? '#e5e7eb' : '#374151'};
  border: 2px solid ${props => props.theme === 'dark' ? '#4B5563' : '#e5e7eb'};
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.theme === 'dark' ? '#4B5563' : '#e5e7eb'};
    transform: translateY(-2px);
  }
`;

// ========== MOCK DATA ==========

const mockTags = [
  { id: 'business', name: 'Business', icon: '💼', count: 245, color: '#1CB0F6' },
  { id: 'academic', name: 'Academic', icon: '🎓', count: 189, color: '#8b5cf6' },
  { id: 'travel', name: 'Travel', icon: '✈️', count: 156, color: '#f59e0b' },
  { id: 'technology', name: 'Technology', icon: '💻', count: 203, color: '#10b981' },
  { id: 'daily', name: 'Daily Life', icon: '🏠', count: 312, color: '#58CC02' },
  { id: 'health', name: 'Health', icon: '🏥', count: 134, color: '#ef4444' },
  { id: 'food', name: 'Food & Drink', icon: '🍔', count: 178, color: '#f59e0b' },
  { id: 'sports', name: 'Sports', icon: '⚽', count: 98, color: '#06b6d4' },
];

const mockWords = [
  {
    id: 1,
    word: 'Accomplish',
    phonetic: '/əˈkʌmplɪʃ/',
    type: 'verb',
    typeColor: '#10b981',
    meaning: 'Hoàn thành, đạt được (mục tiêu, nhiệm vụ)',
    example: 'She accomplished all her goals this year.',
    exampleTranslation: 'Cô ấy đã hoàn thành tất cả mục tiêu của mình trong năm nay.',
    tags: ['business', 'academic'],
    level: 'B2',
    mastered: false,
  },
  {
    id: 2,
    word: 'Infrastructure',
    phonetic: '/ˈɪnfrəstrʌktʃər/',
    type: 'noun',
    typeColor: '#1CB0F6',
    meaning: 'Cơ sở hạ tầng',
    example: 'The government invested heavily in infrastructure development.',
    exampleTranslation: 'Chính phủ đầu tư mạnh vào phát triển cơ sở hạ tầng.',
    tags: ['business', 'technology'],
    level: 'C1',
    mastered: true,
  },
  {
    id: 3,
    word: 'Destination',
    phonetic: '/ˌdestɪˈneɪʃn/',
    type: 'noun',
    typeColor: '#1CB0F6',
    meaning: 'Điểm đến, nơi đến',
    example: 'Paris is a popular tourist destination.',
    exampleTranslation: 'Paris là một điểm đến du lịch nổi tiếng.',
    tags: ['travel'],
    level: 'B1',
    mastered: false,
  },
  {
    id: 4,
    word: 'Innovative',
    phonetic: '/ˈɪnəveɪtɪv/',
    type: 'adjective',
    typeColor: '#8b5cf6',
    meaning: 'Đổi mới, sáng tạo',
    example: 'The company is known for its innovative products.',
    exampleTranslation: 'Công ty này nổi tiếng với các sản phẩm đổi mới.',
    tags: ['business', 'technology'],
    level: 'B2',
    mastered: false,
  },
  {
    id: 5,
    word: 'Essential',
    phonetic: '/ɪˈsenʃl/',
    type: 'adjective',
    typeColor: '#8b5cf6',
    meaning: 'Cần thiết, thiết yếu',
    example: 'Water is essential for life.',
    exampleTranslation: 'Nước là thứ thiết yếu cho sự sống.',
    tags: ['daily', 'health'],
    level: 'B1',
    mastered: true,
  },
  {
    id: 6,
    word: 'Collaborate',
    phonetic: '/kəˈlæbəreɪt/',
    type: 'verb',
    typeColor: '#10b981',
    meaning: 'Cộng tác, hợp tác',
    example: 'We collaborated with other teams on this project.',
    exampleTranslation: 'Chúng tôi đã cộng tác với các nhóm khác trong dự án này.',
    tags: ['business', 'academic'],
    level: 'B2',
    mastered: false,
  },
];

// ========== COMPONENT ==========

const Wordbank = () => {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [theme, setTheme] = useState('light');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [displayedWords, setDisplayedWords] = useState(mockWords);
  const [itemsToShow, setItemsToShow] = useState(6);

  const stats = {
    total: 1567,
    mastered: 456,
    learning: 234,
    new: 877,
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const speakWord = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const handleTagSelect = (tagId) => {
    setSelectedTag(tagId);
    filterWords(searchTerm, tagId, levelFilter);
  };

  const filterWords = (search, tag, level) => {
    let filtered = mockWords;

    if (search) {
      filtered = filtered.filter(word =>
        word.word.toLowerCase().includes(search.toLowerCase()) ||
        word.meaning.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (tag !== 'all') {
      filtered = filtered.filter(word => word.tags.includes(tag));
    }

    if (level !== 'all') {
      filtered = filtered.filter(word => word.level === level);
    }

    setDisplayedWords(filtered);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    filterWords(value, selectedTag, levelFilter);
  };

  const handleLevelFilter = (value) => {
    setLevelFilter(value);
    filterWords(searchTerm, selectedTag, value);
  };

  const handleAddToFlashcard = (word) => {
    showToast('success', 'Đã thêm!', `"${word.word}" đã được thêm vào flashcard của bạn`);
  };

  const handleViewDetail = (word) => {
    Swal.fire({
      title: word.word,
      html: `
        <div style="text-align: left; padding: 1rem;">
          <p><strong>📖 Phát âm:</strong> ${word.phonetic}</p>
          <p><strong>📝 Loại từ:</strong> ${word.type}</p>
          <p><strong>🎯 Nghĩa:</strong> ${word.meaning}</p>
          <p><strong>💡 Ví dụ:</strong> ${word.example}</p>
          <p style="font-style: italic; color: #6b7280;">→ ${word.exampleTranslation}</p>
          <p><strong>📊 Level:</strong> ${word.level}</p>
          <p><strong>🏷️ Tags:</strong> ${word.tags.join(', ')}</p>
        </div>
      `,
      icon: 'info',
      confirmButtonColor: '#58CC02',
      confirmButtonText: 'Đóng',
      showCancelButton: true,
      cancelButtonText: '🔊 Phát âm',
      cancelButtonColor: '#1CB0F6',
    }).then((result) => {
      if (result.dismiss === Swal.DismissReason.cancel) {
        speakWord(word.word);
      }
    });
  };

  return (
    <PageWrapper theme={theme}>
      <Toast toast={toast} onClose={hideToast} />

      <Header
        theme={theme}
        onThemeToggle={toggleTheme}
        userName="vinhsonvlog"
        userEmail="vinhsonvlog@example.com"
        notificationCount={3}
        showNotification={true}
        showAvatar={true}
      />

      <DashboardContainer>
        {/* Page Header */}
        <PageHeader>
          <PageTitle theme={theme}>
            <span>📚</span>
            Sổ tay từ vựng
          </PageTitle>
          <PageSubtitle theme={theme}>
            Hệ thống từ vựng phân loại theo chủ đề từ nguồn Wordbank
          </PageSubtitle>
        </PageHeader>

        {/* Stats */}
        <StatsRow>
          <StatCard theme={theme} delay="0.1s">
            <StatIcon color="#58CC02">📖</StatIcon>
            <StatValue theme={theme}>{stats.total}</StatValue>
            <StatLabel theme={theme}>Tổng từ vựng</StatLabel>
          </StatCard>

          <StatCard theme={theme} delay="0.2s">
            <StatIcon color="#10b981">✅</StatIcon>
            <StatValue theme={theme}>{stats.mastered}</StatValue>
            <StatLabel theme={theme}>Đã nắm vững</StatLabel>
          </StatCard>

          <StatCard theme={theme} delay="0.3s">
            <StatIcon color="#1CB0F6">📝</StatIcon>
            <StatValue theme={theme}>{stats.learning}</StatValue>
            <StatLabel theme={theme}>Đang học</StatLabel>
          </StatCard>

          <StatCard theme={theme} delay="0.4s">
            <StatIcon color="#f59e0b">🆕</StatIcon>
            <StatValue theme={theme}>{stats.new}</StatValue>
            <StatLabel theme={theme}>Chưa học</StatLabel>
          </StatCard>
        </StatsRow>

        {/* Filters */}
        <FilterSection theme={theme}>
          <FilterGrid>
            <SearchWrapper>
              <SearchIcon theme={theme}>🔍</SearchIcon>
              <SearchInput
                theme={theme}
                placeholder="Tìm kiếm từ vựng..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </SearchWrapper>

            <FilterSelect
              theme={theme}
              value={levelFilter}
              onChange={(e) => handleLevelFilter(e.target.value)}
            >
              <option value="all">Tất cả cấp độ</option>
              <option value="A1">A1 - Beginner</option>
              <option value="A2">A2 - Elementary</option>
              <option value="B1">B1 - Intermediate</option>
              <option value="B2">B2 - Upper-Intermediate</option>
              <option value="C1">C1 - Advanced</option>
              <option value="C2">C2 - Proficiency</option>
            </FilterSelect>

            <FilterSelect theme={theme}>
              <option>Sắp xếp: A-Z</option>
              <option>Sắp xếp: Z-A</option>
              <option>Mới nhất</option>
              <option>Cũ nhất</option>
            </FilterSelect>
          </FilterGrid>
        </FilterSection>

        {/* Tags */}
        <TagsSection>
          <SectionTitle theme={theme}>
            <span>🏷️</span>
            Chủ đề
          </SectionTitle>
          <TagsGrid>
            <TagCard
              theme={theme}
              selected={selectedTag === 'all'}
              color="#58CC02"
              onClick={() => handleTagSelect('all')}
            >
              <TagIcon>📋</TagIcon>
              <TagInfo>
                <TagName theme={theme}>Tất cả</TagName>
                <TagCount theme={theme}>{stats.total} từ</TagCount>
              </TagInfo>
            </TagCard>

            {mockTags.map(tag => (
              <TagCard
                key={tag.id}
                theme={theme}
                color={tag.color}
                selected={selectedTag === tag.id}
                onClick={() => handleTagSelect(tag.id)}
              >
                <TagIcon>{tag.icon}</TagIcon>
                <TagInfo>
                  <TagName theme={theme}>{tag.name}</TagName>
                  <TagCount theme={theme}>{tag.count} từ</TagCount>
                </TagInfo>
              </TagCard>
            ))}
          </TagsGrid>
        </TagsSection>

        {/* Words */}
        {displayedWords.length > 0 ? (
          <>
            <WordsGrid>
              {displayedWords.slice(0, itemsToShow).map(word => (
                <WordCard
                  key={word.id}
                  theme={theme}
                  onClick={() => handleViewDetail(word)}
                >
                  <WordHeader>
                    <WordTitle>
                      <WordText theme={theme}>{word.word}</WordText>
                      <WordPhonetic theme={theme}>{word.phonetic}</WordPhonetic>
                    </WordTitle>
                    <AudioBtn onClick={(e) => {
                      e.stopPropagation();
                      speakWord(word.word);
                    }}>
                      🔊
                    </AudioBtn>
                  </WordHeader>

                  <WordType color={word.typeColor}>{word.type}</WordType>

                  <WordMeaning theme={theme}>{word.meaning}</WordMeaning>

                  <WordExample theme={theme}>
                    "{word.example}"
                  </WordExample>

                  <WordTags>
                    {word.tags.map(tag => (
                      <WordTag key={tag} theme={theme}>
                        {mockTags.find(t => t.id === tag)?.icon} {tag}
                      </WordTag>
                    ))}
                    <WordTag theme={theme}>📊 {word.level}</WordTag>
                  </WordTags>

                  <WordActions>
                    <ActionBtn
                      theme={theme}
                      variant="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToFlashcard(word);
                      }}
                    >
                      <span>➕</span>
                      Thêm vào Flashcard
                    </ActionBtn>
                  </WordActions>
                </WordCard>
              ))}
            </WordsGrid>

            {itemsToShow < displayedWords.length && (
              <LoadMoreButton
                theme={theme}
                onClick={() => setItemsToShow(prev => prev + 6)}
              >
                Tải thêm từ vựng
              </LoadMoreButton>
            )}
          </>
        ) : (
          <EmptyState>
            <EmptyIcon>🔍</EmptyIcon>
            <EmptyText theme={theme}>
              Không tìm thấy từ vựng nào
            </EmptyText>
          </EmptyState>
        )}
      </DashboardContainer>
    </PageWrapper>
  );
};

export default Wordbank;