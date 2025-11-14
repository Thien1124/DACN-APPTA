import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import PronunciationChecker from './PronunciationChecker';
import { flashcardService } from '../services/flashcardServices';
import { deckService } from '../services/deckService';
import { ArrowBack, School } from '@mui/icons-material';

// ========== STYLED COMPONENTS ==========

const PageWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${props => props.theme === 'dark'
    ? 'linear-gradient(135deg, #1a1f2c 0%, #2d3748 50%, #4a5568 100%)'
    : 'linear-gradient(135deg, #EBF4FF 0%, #E6FFFA 50%, #F0FFF4 100%)'
  };
`;

const MainContent = styled.div`
  flex: 1;
  margin-left: 280px;
  margin-right: 380px;
  padding: 2rem;
  max-width: 1200px;

  @media (max-width: 1400px) {
    margin-right: 320px;
  }

  @media (max-width: 1200px) {
    margin-right: 0;
  }

  @media (max-width: 1024px) {
    margin-left: 240px;
  }

  @media (max-width: 768px) {
    margin-left: 0;
    padding: 1rem;
  }
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #2563eb;
    transform: translateY(-2px);
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme === 'dark' ? '#ffffff' : '#1f2937'};
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1rem;
`;

const LoadingSpinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  padding: 1.5rem;
  background: rgba(239, 68, 68, 0.1);
  border: 2px solid #ef4444;
  border-radius: 12px;
  color: #ef4444;
  text-align: center;
  font-weight: 600;
`;

const DeckInfo = styled.div`
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  h3 {
    margin: 0 0 0.5rem 0;
    color: ${props => props.theme === 'dark' ? '#60a5fa' : '#2563eb'};
  }

  p {
    margin: 0.25rem 0;
    color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
    font-size: 0.875rem;
  }
`;

const FlashcardList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const FlashcardItem = styled.button`
  padding: 1rem;
  background: ${props => props.active 
    ? 'linear-gradient(135deg, #58cc02 0%, #45a302 100%)'
    : props.theme === 'dark' ? '#374151' : '#f3f4f6'
  };
  color: ${props => props.active ? 'white' : props.theme === 'dark' ? '#f9fafb' : '#1f2937'};
  border: 2px solid ${props => props.active ? '#58cc02' : 'transparent'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
  text-align: center;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

// ========== COMPONENT ==========

const PronunciationCheckerPage = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [theme] = useState('light');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deck, setDeck] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);

  useEffect(() => {
    loadDeckAndFlashcards();
  }, [deckId]);

  const loadDeckAndFlashcards = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get deck info
      const deckResponse = await deckService.getById(deckId);
      
      if (!deckResponse.success) {
        throw new Error('Không thể tải thông tin bộ thẻ');
      }

      setDeck(deckResponse.data);

      // Get flashcards in deck
      const flashcardsResponse = await flashcardService.getByDeck1(deckId);
      
      if (!flashcardsResponse.success) {
        throw new Error('Không thể tải flashcards');
      }

      const cards = flashcardsResponse.data || [];
      
      if (cards.length === 0) {
        setError('Bộ thẻ này chưa có flashcards nào để luyện phát âm');
      } else {
        setFlashcards(cards);
      }

    } catch (err) {
      console.error('Load deck error:', err);
      setError(err.message || 'Đã xảy ra lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = (analysis) => {
    console.log('Pronunciation analysis complete:', analysis);
    
    // Auto next to next flashcard after 2 seconds
    setTimeout(() => {
      if (currentFlashcardIndex < flashcards.length - 1) {
        setCurrentFlashcardIndex(currentFlashcardIndex + 1);
      }
    }, 2000);
  };

  const selectFlashcard = (index) => {
    setCurrentFlashcardIndex(index);
  };

  return (
    <PageWrapper theme={theme}>
      <LeftSidebar />
      <MainContent>
        <Header>
          <BackButton onClick={() => navigate(-1)}>
            <ArrowBack />
            Quay lại
          </BackButton>
          <Title theme={theme}>
            <School />
            Luyện phát âm
          </Title>
        </Header>

        {loading && (
          <LoadingContainer>
            <LoadingSpinner />
            <p>Đang tải dữ liệu...</p>
          </LoadingContainer>
        )}

        {error && (
          <ErrorMessage>
            {error}
          </ErrorMessage>
        )}

        {!loading && !error && deck && flashcards.length > 0 && (
          <>
            {/* Deck Info */}
            <DeckInfo theme={theme}>
              <h3>{deck.title}</h3>
              <p>{deck.description || 'Không có mô tả'}</p>
              <p>📚 {flashcards.length} flashcards • 🎯 {deck.category}</p>
            </DeckInfo>

            {/* Flashcard List */}
            <FlashcardList>
              {flashcards.map((card, index) => (
                <FlashcardItem
                  key={card._id}
                  theme={theme}
                  active={index === currentFlashcardIndex}
                  onClick={() => selectFlashcard(index)}
                >
                  {index + 1}. {card.front}
                </FlashcardItem>
              ))}
            </FlashcardList>

            {/* Pronunciation Checker */}
            <PronunciationChecker
              flashcard={flashcards[currentFlashcardIndex]}
              theme={theme}
              onComplete={handleComplete}
            />
          </>
        )}
      </MainContent>
      <RightSidebar />
    </PageWrapper>
  );
};

export default PronunciationCheckerPage;