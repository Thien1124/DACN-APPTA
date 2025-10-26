import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import LeftSidebar from '../components/LeftSidebar';
import useToast from '../hooks/useToast';
import CircularProgress from '@mui/material/CircularProgress';
import ErrorOutline from '@mui/icons-material/ErrorOutline';

import {
  School,
  VolumeUp,
  ArrowBack,
  CheckCircle,
  Timer,
  ImageOutlined,
  MenuBook,
  Star
} from '@mui/icons-material';
import { geminiService } from '../services/geminiService';

const PageWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${props => props.theme === 'dark'
    ? 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%)'
    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e0 100%)'
  };
`;

const MainContent = styled.div`
  flex: 1;
  margin-left: 280px;
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1rem;

  &:hover {
    color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Stats = styled.div`
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-size: 0.875rem;
`;

const FlashcardStage = styled.div`
  max-width: 600px;
  margin: 0 auto;
  perspective: 1000px;
`;

const FlashcardInner = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  text-align: center;
  transition: transform 0.8s;
  transform-style: preserve-3d;
  cursor: pointer;
  transform: ${props => props.flipped ? 'rotateY(180deg)' : 'rotateY(0)'};
`;

const CardFace = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 20px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: ${props => props.theme === 'dark'
    ? 'rgba(31, 41, 55, 0.95)'
    : 'rgba(255, 255, 255, 0.95)'
  };
  border: 1px solid ${props => props.theme === 'dark'
    ? 'rgba(75, 85, 99, 0.3)'
    : 'rgba(229, 231, 235, 0.5)'
  };
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const FrontFace = styled(CardFace)``;

const BackFace = styled(CardFace)`
  transform: rotateY(180deg);
`;

const CardWord = styled.h2`
  font-size: 2.5rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 1rem;
`;

const CardPhonetic = styled.div`
  font-size: 1.25rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-bottom: 2rem;
`;

const CardMeaning = styled.div`
  font-size: 1.75rem;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 1rem;
`;

const CardExample = styled.div`
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-style: italic;
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 12px;
  background: ${props => props.theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)'};
`;

const Translation = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-top: 0.5rem;
  font-style: italic;
`;

const Controls = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
`;

const ControlButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${props => {
    if (props.variant === 'sound') return '#1CB0F6';
    if (props.variant === 'next') return '#58CC02';
    return props.theme === 'dark' ? '#374151' : '#f3f4f6';
  }};
  color: ${props => {
    if (props.variant === 'sound' || props.variant === 'next') return 'white';
    return props.theme === 'dark' ? '#f9fafb' : '#1a1a1a';
  }};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;

const Progress = styled.div`
  width: 100%;
  height: 8px;
  background: ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  border-radius: 4px;
  margin: 2rem 0;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${props => props.progress}%;
  background: #58CC02;
  transition: width 0.3s ease;
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
  color: ${props => props.theme === 'dark' ? '#ef4444' : '#dc2626'};
`;

const RetryButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  background: #ef4444;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #dc2626;
    transform: translateY(-2px);
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 64px);
  padding: 0 1rem;
`;

const LoadingText = styled.div`
  font-size: 1.25rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const ErrorText = styled.div`
  font-size: 1.25rem;
  color: ${props => props.theme === 'dark' ? '#ef4444' : '#dc2626'};
`;

const Card = styled.div`
  position: relative;
  width: 100%;
  max-width: 600px;
  height: 400px;
  margin: 0 auto;
  perspective: 1000px;
  cursor: pointer;
  transition: transform 0.8s;
  transform-style: preserve-3d;
  transform: ${props => props.isFlipped ? 'rotateY(180deg)' : 'rotateY(0)'};
`;

const CardInner = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.8s;
  transform-style: preserve-3d;
`;

const CardFront = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  border-radius: 20px;
  background: ${props => props.theme === 'dark'
    ? 'rgba(31, 41, 55, 0.95)'
    : 'rgba(255, 255, 255, 0.95)'
  };
  border: 1px solid ${props => props.theme === 'dark'
    ? 'rgba(75, 85, 99, 0.3)'
    : 'rgba(229, 231, 235, 0.5)'
  };
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const CardBack = styled(CardFront)`
  transform: rotateY(180deg);
`;

const Word = styled.h2`
  font-size: 2.5rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 1rem;
`;

const Phonetic = styled.div`
  font-size: 1.25rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-bottom: 2rem;
`;


const Example = styled.div`
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-style: italic;
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 12px;
  background: ${props => props.theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)'};
`;

const ExampleTranslation = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-top: 0.5rem;
  font-style: italic;
`;



const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${props => props.theme === 'dark' ? '#374151' : '#f3f4f6'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  &:disabled {
    background: ${props => props.theme === 'dark' ? '#525252' : '#d1d5db'};
    cursor: not-allowed;
  }
`;

const TopicFlashcards = () => {
  const [theme] = useState('light');
  const [flipped, setFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [topic, setTopic] = useState('');
  const navigate = useNavigate();
  const { topicId } = useParams();
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    const generateFlashcards = async (retryCount = 0) => {
      try {
        setLoading(true);
        setError(null);

        if (!topicId) {
          throw new Error('Không tìm thấy chủ đề');
        }

        const topic = decodeURIComponent(topicId);
        setTopic(topic);

        // Check API key configuration
        if (!process.env.REACT_APP_GEMINI_API_KEY) {
          throw new Error('Vui lòng cấu hình API key trong file .env');
        }
        
        const cards = await geminiService.generateFlashcards(topic);
        
        if (!cards || cards.length === 0) {
          throw new Error('Không thể tạo flashcard cho chủ đề này');
        }

        setFlashcards(cards);

      } catch (err) {
        console.error('Generate flashcards error:', err);
        setError(err.message);
        showToast('error', 'Lỗi', err.message);
      } finally {
        setLoading(false);
      }
    };

    if (topicId) {
      generateFlashcards();
    }
  }, [topicId]);

  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  const handleNext = () => {
  if (currentIndex < flashcards.length - 1) {
    setCurrentIndex(currentIndex + 1);
    setFlipped(false);
  } else {
    showToast('success', 'Hoàn thành', 'Bạn đã học xong bộ flashcard này!');
  }
};
  const handleSaveToDeck = async () => {
    try {
      const deckId = "your_deck_id"; // Lấy từ props hoặc state
      await geminiService.saveFlashcardsToDeck(deckId, flashcards);
      // Hiển thị thông báo thành công
      showToast('success', 'Đã lưu thành công', 'Flashcards đã được thêm vào deck');
    } catch (error) {
      showToast('error', 'Lỗi', error.message);
    }
  };
  const handleBack = () => {
    navigate('/topics');
  };

  const playSound = () => {
    // Implement sound playing logic
  };

  // Thêm loading state
  if (loading) {
    return (
      <PageWrapper theme={theme}>
        <LeftSidebar />
        <MainContent>
          <LoadingState theme={theme}>
            <CircularProgress />
            <div>Đang tạo flashcards...</div>
          </LoadingState>
        </MainContent>
      </PageWrapper>
    );
  }

  // Thêm error state 
  if (error) {
    return (
      <PageWrapper theme={theme}>
        <LeftSidebar />
        <MainContent>
          <ErrorState theme={theme}>
            <ErrorOutline sx={{ fontSize: 48, color: '#ef4444' }} />
            <div>{error}</div>
            <RetryButton onClick={() => window.location.reload()}>
              Thử lại
            </RetryButton>
          </ErrorState>
        </MainContent>
      </PageWrapper>
    );
  }

  // Thêm kiểm tra trong phần render
  if (!flashcards.length && !loading && !error) {
    return (
      <PageWrapper theme={theme}>
        <LeftSidebar />
        <MainContent>
          <ErrorState theme={theme}>
            <ErrorOutline sx={{ fontSize: 48, color: '#ef4444' }} />
            <div>Không có flashcard nào được tạo</div>
            <RetryButton onClick={() => window.location.reload()}>
              Thử lại
            </RetryButton>
          </ErrorState>
        </MainContent>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper theme={theme}>
      <LeftSidebar />
      <MainContent>
        <Header>
          <BackButton onClick={handleBack} theme={theme}>
            <ArrowBack /> Trở về
          </BackButton>
          <Title theme={theme}>
            <School /> Chủ đề: {topic}
          </Title>
          <Stats>
            <StatItem theme={theme}>
              <MenuBook /> 30 từ vựng
            </StatItem>
            <StatItem theme={theme}>
              <Timer /> ~15 phút
            </StatItem>
            <StatItem theme={theme}>
              <Star /> 100 XP
            </StatItem>
          </Stats>
        </Header>

        <Progress theme={theme}>
          <ProgressFill progress={progress} />
        </Progress>

        <FlashcardStage>
          {flashcards[currentIndex] ? (
            <FlashcardInner flipped={flipped} onClick={handleFlip}>
              <FrontFace theme={theme}>
                <CardWord theme={theme}>{flashcards[currentIndex].front}</CardWord>
                <CardPhonetic theme={theme}>{flashcards[currentIndex].phonetic}</CardPhonetic>
                <CardExample theme={theme}>Click to reveal meaning</CardExample>
              </FrontFace>
              <BackFace theme={theme}>
                <CardMeaning theme={theme}>{flashcards[currentIndex].back}</CardMeaning>
                <CardExample theme={theme}>
                  {flashcards[currentIndex].example}
                  <Translation theme={theme}>
                    {flashcards[currentIndex].translation}
                  </Translation>
                </CardExample>
              </BackFace>
            </FlashcardInner>
          ) : (
            <LoadingState theme={theme}>
              <div>Không tìm thấy flashcard</div>
            </LoadingState>
          )}

        </FlashcardStage>

        <Controls>
          <ControlButton variant="sound" onClick={playSound}>
            <VolumeUp /> Phát âm
          </ControlButton>
          <ControlButton variant="next" onClick={handleNext}>
            <CheckCircle /> Tiếp theo
          </ControlButton>
        </Controls>
      </MainContent>
    </PageWrapper>
  );
};

export default TopicFlashcards;