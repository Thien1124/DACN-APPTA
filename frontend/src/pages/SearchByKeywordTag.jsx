import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
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

const SearchSection = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
`;

const SearchBar = styled.div`
  position: relative;
  margin-bottom: 1.5rem;

  &::before {
    content: '🔍';
    position: absolute;
    left: 1.5rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1.5rem;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem 1.5rem 1rem 4rem;
  border-radius: 16px;
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

const TagsSection = styled.div`
  margin-bottom: 1.5rem;
`;

const SectionLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.75rem;
`;

const TagsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const Tag = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 12px;
  border: 2px solid ${props => {
    if (props.active) return '#58CC02';
    return props.theme === 'dark' ? '#374151' : '#e5e7eb';
  }};
  background: ${props => {
    if (props.active) return 'rgba(88, 204, 2, 0.1)';
    return 'transparent';
  }};
  color: ${props => {
    if (props.active) return '#58CC02';
    return props.theme === 'dark' ? '#e5e7eb' : '#374151';
  }};
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #58CC02;
    transform: translateY(-2px);
  }
`;

const ResultsSection = styled.div`
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

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ResultsTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
`;

const ResultsCount = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
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
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#f9fafb'};
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  border: 2px solid transparent;

  &:hover {
    border-color: #58CC02;
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(88, 204, 2, 0.2);
  }
`;

const DeckHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const DeckIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: ${props => props.color || 'linear-gradient(135deg, #58CC02 0%, #45a302 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const DeckInfo = styled.div`
  flex: 1;
`;

const DeckTitle = styled.h3`
  font-size: 1rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.5rem;
`;

const DeckMeta = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  display: flex;
  gap: 0.75rem;
`;

const DeckDescription = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  line-height: 1.5;
  margin-bottom: 1rem;
`;

const DeckTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const DeckTag = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => props.color || 'rgba(88, 204, 2, 0.1)'};
  color: ${props => props.color ? props.color : '#58CC02'};
`;

const DeckActions = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;

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
        background: rgba(88, 204, 2, 0.1);
        color: #58CC02;
        &:hover { background: rgba(88, 204, 2, 0.2); }
      `;
    }
    return '';
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
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

// ========== MOCK DATA ==========

const availableTags = [
  { id: 1, name: 'TOEIC', icon: '📝' },
  { id: 2, name: 'IELTS', icon: '🎯' },
  { id: 3, name: 'Business', icon: '💼' },
  { id: 4, name: 'Grammar', icon: '📖' },
  { id: 5, name: 'Vocabulary', icon: '📚' },
  { id: 6, name: 'Speaking', icon: '🗣️' },
  { id: 7, name: 'Listening', icon: '👂' },
  { id: 8, name: 'Writing', icon: '✍️' },
];

const mockDecks = [
  {
    id: 1,
    icon: '📚',
    title: 'TOEIC Vocabulary 990',
    author: 'Teacher A',
    cards: 990,
    description: 'Bộ từ vựng TOEIC 990 từ thiết yếu cho mục tiêu 850+',
    tags: [{ name: 'TOEIC', color: '#58CC02' }, { name: 'Vocabulary', color: '#1CB0F6' }],
    color: 'linear-gradient(135deg, #58CC02 0%, #45a302 100%)',
  },
  {
    id: 2,
    icon: '💼',
    title: 'Business English Essentials',
    author: 'Teacher B',
    cards: 450,
    description: 'Từ vựng và cụm từ tiếng Anh thương mại cần thiết',
    tags: [{ name: 'Business', color: '#8b5cf6' }, { name: 'Vocabulary', color: '#1CB0F6' }],
    color: 'linear-gradient(135deg, #1CB0F6 0%, #0891b2 100%)',
  },
  {
    id: 3,
    icon: '🎯',
    title: 'IELTS Academic Vocabulary',
    author: 'Teacher C',
    cards: 750,
    description: 'Từ vựng học thuật IELTS band 7.0+',
    tags: [{ name: 'IELTS', color: '#f59e0b' }, { name: 'Vocabulary', color: '#1CB0F6' }],
    color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  },
];

// ========== COMPONENT ==========

const SearchByKeywordTag = () => {
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [filteredDecks, setFilteredDecks] = useState(mockDecks);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let results = mockDecks;

    if (searchQuery) {
      results = results.filter(deck =>
        deck.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deck.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedTags.length > 0) {
      results = results.filter(deck =>
        deck.tags.some(tag => selectedTags.includes(tag.name))
      );
    }

    setFilteredDecks(results);
  }, [searchQuery, selectedTags]);

  const formatDateTime = () => {
    const year = currentTime.getUTCFullYear();
    const month = String(currentTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(currentTime.getUTCDate()).padStart(2, '0');
    const hours = String(currentTime.getUTCHours()).padStart(2, '0');
    const minutes = String(currentTime.getUTCMinutes()).padStart(2, '0');
    const seconds = String(currentTime.getUTCSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const handleTagClick = (tagName) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter(t => t !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  };

  const handleStudyDeck = (deck) => {
    showToast('info', 'Bắt đầu học', `Bắt đầu học bộ thẻ "${deck.title}"`);
  };

  const handleViewDeck = (deck) => {
    showToast('info', 'Xem chi tiết', `Xem chi tiết bộ thẻ "${deck.title}"`);
  };

  return (
    <PageWrapper theme={theme}>
      <Header theme={theme} userName="vinhsonvlog" />
      <Toast toast={toast} onClose={hideToast} />
      
      <Container>
        <WelcomeCard theme={theme}>
          <WelcomeTitle theme={theme}>
            <span>🔍</span>
            Tìm kiếm theo từ khóa & Tag
          </WelcomeTitle>
          <WelcomeSubtitle theme={theme}>
            Tìm kiếm bộ thẻ bằng từ khóa hoặc tag liên quan để hỗ trợ học tập nhanh chóng
          </WelcomeSubtitle>
          <DateTime theme={theme}>
            🕐 {formatDateTime()} UTC | 👤 vinhsonvlog
          </DateTime>
        </WelcomeCard>

        <SearchSection theme={theme}>
          <SearchBar>
            <SearchInput
              theme={theme}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bộ thẻ..."
            />
          </SearchBar>

          <TagsSection>
            <SectionLabel theme={theme}>🏷️ Lọc theo tag:</SectionLabel>
            <TagsGrid>
              {availableTags.map(tag => (
                <Tag
                  key={tag.id}
                  theme={theme}
                  active={selectedTags.includes(tag.name)}
                  onClick={() => handleTagClick(tag.name)}
                >
                  {tag.icon} {tag.name}
                </Tag>
              ))}
            </TagsGrid>
          </TagsSection>
        </SearchSection>

        <ResultsSection theme={theme}>
          <ResultsHeader>
            <ResultsTitle theme={theme}>📋 Kết quả tìm kiếm</ResultsTitle>
            <ResultsCount theme={theme}>
              Tìm thấy {filteredDecks.length} kết quả
            </ResultsCount>
          </ResultsHeader>

          {filteredDecks.length > 0 ? (
            <DecksGrid>
              {filteredDecks.map(deck => (
                <DeckCard key={deck.id} theme={theme}>
                  <DeckHeader>
                    <DeckIcon color={deck.color}>{deck.icon}</DeckIcon>
                    <DeckInfo>
                      <DeckTitle theme={theme}>{deck.title}</DeckTitle>
                      <DeckMeta theme={theme}>
                        <span>👨‍🏫 {deck.author}</span>
                        <span>📇 {deck.cards} thẻ</span>
                      </DeckMeta>
                    </DeckInfo>
                  </DeckHeader>

                  <DeckDescription theme={theme}>
                    {deck.description}
                  </DeckDescription>

                  <DeckTags>
                    {deck.tags.map((tag, index) => (
                      <DeckTag key={index} color={tag.color}>
                        {tag.name}
                      </DeckTag>
                    ))}
                  </DeckTags>

                  <DeckActions>
                    <ActionButton variant="primary" onClick={() => handleStudyDeck(deck)}>
                      📚 Học ngay
                    </ActionButton>
                    <ActionButton variant="secondary" onClick={() => handleViewDeck(deck)}>
                      👁️ Xem
                    </ActionButton>
                  </DeckActions>
                </DeckCard>
              ))}
            </DecksGrid>
          ) : (
            <EmptyState>
              <EmptyIcon>🔍</EmptyIcon>
              <EmptyText theme={theme}>
                Không tìm thấy kết quả phù hợp
              </EmptyText>
            </EmptyState>
          )}
        </ResultsSection>
      </Container>
    </PageWrapper>
  );
};

export default SearchByKeywordTag;