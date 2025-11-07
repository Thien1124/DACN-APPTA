import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import { Search, VolumeUp, Star, StarBorder, BookmarkBorder, Bookmark, FilterList, School } from '@mui/icons-material';
import { vocabularyService } from '../services/vocabularyService'; // ✅ Thêm import

// ========== ANIMATIONS ==========
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

// ========== STYLED COMPONENTS ==========
const PageWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #f0fbef 0%, #e6f8e3 40%, #dff4d6 100%);
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><g fill="%2358CC02" opacity="0.03"><circle cx="120" cy="80" r="120"/><circle cx="560" cy="160" r="100"/><circle cx="400" cy="420" r="140"/></g></svg>');
  background-repeat: no-repeat;
  background-position: right 10% top 10%;
  position: relative; /* Thêm dòng này */
`;

const MainContent = styled.main`
  flex: 1;
  padding: 7rem 2rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
  animation: ${fadeIn} 0.6s ease;
  
  /* Đảm bảo không bị che */
  position: relative;
  z-index: 1;

  /* Màn hình > 1400px */
  margin-left: 300px;  /* 280px + 20px spacing */
  margin-right: 400px; /* 380px + 20px spacing */

  @media (max-width: 1400px) {
    margin-left: 300px;
    margin-right: 340px;
  }

  @media (max-width: 1200px) {
    margin-left: 300px;
    margin-right: 2rem;
  }

  @media (max-width: 1024px) {
    padding: 6rem 1.5rem 1.5rem;
    margin-left: 260px;
    margin-right: 1.5rem;
  }

  @media (max-width: 768px) {
    padding: 5.5rem 1rem 1rem;
    margin-left: 1rem;
    margin-right: 1rem;
  }
`;
const Header = styled.div`
  margin-bottom: 2rem;
  animation: ${slideIn} 0.5s ease;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: #166a0b;
  margin: 0 0 0.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #5b6b5b;
  margin: 0;
`;

const ControlsBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchBox = styled.div`
  flex: 1;
  position: relative;
  min-width: 300px;

  @media (max-width: 768px) {
    min-width: 100%;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.9rem 1rem 0.9rem 3rem;
  border: 2px solid #e6f3e6;
  border-radius: 12px;
  font-size: 1rem;
  background: white;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #58cc02;
    box-shadow: 0 4px 12px rgba(88, 204, 2, 0.1);
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #5b6b5b;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.9rem 1.5rem;
  background: ${props => props.active ? '#58cc02' : 'white'};
  color: ${props => props.active ? 'white' : '#166a0b'};
  border: 2px solid ${props => props.active ? '#58cc02' : '#e6f3e6'};
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(88, 204, 2, 0.2);
  }
`;

const StatsBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  text-align: center;
  animation: ${fadeIn} 0.6s ease;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: #58cc02;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.95rem;
  color: #5b6b5b;
  font-weight: 600;
`;

const VocabGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const VocabCard = styled.div`
  background: white;
  border-radius: 14px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.6s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(88, 204, 2, 0.15);
  }
`;

const VocabHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
`;

const VocabWord = styled.div`
  flex: 1;
`;

const Word = styled.h3`
  font-size: 1.5rem;
  font-weight: 800;
  color: #166a0b;
  margin: 0 0 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Pronunciation = styled.div`
  font-size: 0.95rem;
  color: #5b6b5b;
  font-style: italic;
`;

const VocabActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IconButton = styled.button`
  background: ${props => props.active ? '#58cc02' : '#f3f4f6'};
  color: ${props => props.active ? 'white' : '#5b6b5b'};
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
    background: ${props => props.active ? '#46a302' : '#e6f3e6'};
  }
`;

const VocabMeaning = styled.div`
  font-size: 1rem;
  color: #374151;
  margin-bottom: 1rem;
  line-height: 1.5;
`;

const VocabExample = styled.div`
  background: #f9fafb;
  padding: 1rem;
  border-radius: 8px;
  border-left: 3px solid #58cc02;
  font-size: 0.95rem;
  color: #4b5563;
  line-height: 1.6;
  font-style: italic;
`;

const VocabTags = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const Tag = styled.span`
  background: #e6f7e8;
  color: #166a0b;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  animation: ${fadeIn} 0.6s ease;
`;

const EmptyIcon = styled(School)`
  font-size: 5rem;
  color: #d1d5db;
  margin-bottom: 1rem;
`;

const EmptyText = styled.p`
  font-size: 1.25rem;
  color: #6b7280;
  font-weight: 600;
`;

// ========== COMPONENT ==========
const Worldbank = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, starred, learned
  const [vocabularies, setVocabularies] = useState([]);
  const [filteredVocabs, setFilteredVocabs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    learned: 0,
    starred: 0
  });

  // Mock data - replace with API call
  useEffect(() => {
    const fetchLearnedVocabularies = async () => {
      try {
        const response = await vocabularyService.getLearnedVocabularies();
        const vocabs = response.data || [];
        
        setVocabularies(vocabs);
        updateStats(vocabs);
      } catch (error) {
        console.error('Error fetching learned vocabularies:', error);
        // Fallback to empty array
        setVocabularies([]);
        updateStats([]);
      }
    };

    fetchLearnedVocabularies();
  }, []);

  useEffect(() => {
    filterVocabularies();
  }, [searchTerm, filterType, vocabularies]);

  const updateStats = (vocabs) => {
    setStats({
      total: vocabs.length,
      learned: vocabs.filter(v => v.isLearned).length,
      starred: vocabs.filter(v => v.isStarred).length
    });
  };

  const filterVocabularies = () => {
    let filtered = vocabularies;

    if (searchTerm) {
      filtered = filtered.filter(v =>
        v.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.meaning.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType === 'starred') {
      filtered = filtered.filter(v => v.isStarred);
    } else if (filterType === 'learned') {
      filtered = filtered.filter(v => v.isLearned);
    }

    setFilteredVocabs(filtered);
  };

  const toggleStar = async (id) => {
    // TODO: Implement starring API later
    // Hiện tại chỉ update local state
    setVocabularies(prev => {
      const updated = prev.map(v =>
        v.id === id ? { ...v, isStarred: !v.isStarred } : v
      );
      updateStats(updated);
      return updated;
    });
  };

  const toggleLearned = async (id) => {
    // TODO: Implement API to update mastery/review count
    setVocabularies(prev => {
      const updated = prev.map(v =>
        v.id === id ? { ...v, isLearned: !v.isLearned } : v
      );
      updateStats(updated);
      return updated;
    });
  };

  const speakWord = (word) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <PageWrapper>
      <LeftSidebar />
      <MainContent>
        <Header>
          <Title>
            <School />
            Sổ tay từ vựng
          </Title>
          <Subtitle>Quản lý và ôn tập từ vựng đã học</Subtitle>
        </Header>

        <StatsBar>
          <StatCard>
            <StatNumber>{stats.total}</StatNumber>
            <StatLabel>Tổng từ vựng</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{stats.learned}</StatNumber>
            <StatLabel>Đã học</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{stats.starred}</StatNumber>
            <StatLabel>Đánh dấu</StatLabel>
          </StatCard>
        </StatsBar>

        <ControlsBar>
          <SearchBox>
            <SearchIcon />
            <SearchInput
              type="text"
              placeholder="Tìm kiếm từ vựng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBox>
          <FilterButton
            active={filterType === 'all'}
            onClick={() => setFilterType('all')}
          >
            <FilterList />
            Tất cả
          </FilterButton>
          <FilterButton
            active={filterType === 'starred'}
            onClick={() => setFilterType('starred')}
          >
            <Star />
            Đánh dấu
          </FilterButton>
          <FilterButton
            active={filterType === 'learned'}
            onClick={() => setFilterType('learned')}
          >
            <BookmarkBorder />
            Đã học
          </FilterButton>
        </ControlsBar>

        {filteredVocabs.length > 0 ? (
          <VocabGrid>
            {filteredVocabs.map((vocab) => (
              <VocabCard key={vocab.id}>
                <VocabHeader>
                  <VocabWord>
                    <Word>
                      {vocab.word}
                      <IconButton onClick={() => speakWord(vocab.word)}>
                        <VolumeUp style={{ fontSize: '1.2rem' }} />
                      </IconButton>
                    </Word>
                    <Pronunciation>{vocab.pronunciation}</Pronunciation>
                  </VocabWord>
                  <VocabActions>
                    <IconButton
                      active={vocab.isStarred}
                      onClick={() => toggleStar(vocab.id)}
                    >
                      {vocab.isStarred ? <Star /> : <StarBorder />}
                    </IconButton>
                    <IconButton
                      active={vocab.isLearned}
                      onClick={() => toggleLearned(vocab.id)}
                    >
                      {vocab.isLearned ? <Bookmark /> : <BookmarkBorder />}
                    </IconButton>
                  </VocabActions>
                </VocabHeader>
                <VocabMeaning>{vocab.meaning}</VocabMeaning>
                <VocabExample>{vocab.example}</VocabExample>
                <VocabTags>
                  {vocab.tags.map((tag, index) => (
                    <Tag key={index}>{tag}</Tag>
                  ))}
                </VocabTags>
              </VocabCard>
            ))}
          </VocabGrid>
        ) : (
          <EmptyState>
            <EmptyIcon />
            <EmptyText>Không tìm thấy từ vựng nào</EmptyText>
          </EmptyState>
        )}
      </MainContent>
      <RightSidebar />
    </PageWrapper>
  );
};

export default Worldbank;