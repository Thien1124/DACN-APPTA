import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import {
  Replay,
  NavigateNext,
  NavigateBefore,
  VolumeUp,
  Shuffle,
  Star,
  StarBorder,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Cancel,
  Help,
  Speed,
  Settings,
  Lightbulb,
  ArrowBack,
  FullscreenExit,
  Fullscreen
} from '@mui/icons-material';
import { useToast } from '../hooks/useToast';
import { flashcardService } from '../services/flashcardServices';

// ========== ANIMATIONS ==========
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const flipCard = keyframes`
  from { transform: rotateY(0deg); }
  to { transform: rotateY(180deg); }
`;

const slideInLeft = keyframes`
  from { opacity: 0; transform: translateX(-100px); }
  to { opacity: 1; transform: translateX(0); }
`;

const slideInRight = keyframes`
  from { opacity: 0; transform: translateX(100px); }
  to { opacity: 1; transform: translateX(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
`;

const celebrate = keyframes`
  0% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.2) rotate(-10deg); }
  50% { transform: scale(1.3) rotate(10deg); }
  75% { transform: scale(1.2) rotate(-5deg); }
  100% { transform: scale(1) rotate(0deg); }
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

const ContentInner = styled.div`
  width: 100%;
  max-width: ${props => props.fullscreen ? '100%' : '900px'};
  margin: 0 auto;
  transition: max-width 0.3s ease;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: white;
  border: 2px solid #e6f3e6;
  border-radius: 12px;
  color: #166a0b;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #f0fbef;
    border-color: #58cc02;
    transform: translateX(-4px);
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: white;
  border: 2px solid #e6f3e6;
  border-radius: 12px;
  color: ${props => props.active ? '#58cc02' : '#6b7280'};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #e6f7e8;
    border-color: #58cc02;
    transform: scale(1.05);
  }
`;

const ProgressSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ProgressText = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #6b7280;
`;

const ProgressStats = styled.div`
  display: flex;
  gap: 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.color || '#6b7280'};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 12px;
  background: #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #58cc02, #45a302);
  border-radius: 6px;
  width: ${props => props.width}%;
  transition: width 0.5s ease;
`;

const CardContainer = styled.div`
  perspective: 1000px;
  margin-bottom: 2rem;
`;

const FlashcardWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  transform: ${props => props.flipped ? 'rotateY(180deg)' : 'rotateY(0)'};
  cursor: pointer;

  @media (max-width: 768px) {
    height: 350px;
  }
`;

const CardFace = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 20px;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
  animation: ${props => props.shake ? shake : 'none'} 0.5s ease;

  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

const CardFront = styled(CardFace)`
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
  border: 3px solid #e6f3e6;
`;

const CardBack = styled(CardFace)`
  background: linear-gradient(135deg, #e6f7e8 0%, #d1f0d4 100%);
  border: 3px solid #58cc02;
  transform: rotateY(180deg);
`;

const CardBadge = styled.div`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  padding: 0.5rem 1rem;
  background: ${props => props.starred ? '#fbbf24' : '#f3f4f6'};
  color: ${props => props.starred ? 'white' : '#6b7280'};
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CardLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
`;

const CardContent = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  color: #166a0b;
  text-align: center;
  line-height: 1.3;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const CardPhonetic = styled.div`
  font-size: 1.25rem;
  color: #6b7280;
  font-style: italic;
  margin-bottom: 1rem;
`;

const CardExample = styled.div`
  font-size: 1rem;
  color: #4b5563;
  font-style: italic;
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  margin-top: 1rem;
  line-height: 1.6;
`;

const SpeakButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #58cc02, #45a302);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(88, 204, 2, 0.3);

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 8px 20px rgba(88, 204, 2, 0.4);
  }

  &:active {
    animation: ${pulse} 0.3s ease;
  }
`;

const FlipHint = styled.div`
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.875rem;
  color: #9ca3af;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: ${pulse} 2s infinite;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: ${props => {
    if (props.variant === 'easy') return 'linear-gradient(135deg, #58cc02, #45a302)';
    if (props.variant === 'hard') return 'linear-gradient(135deg, #ef4444, #dc2626)';
    if (props.variant === 'again') return 'linear-gradient(135deg, #f59e0b, #d97706)';
    return 'white';
  }};
  color: ${props => props.variant ? 'white' : '#166a0b'};
  border: 2px solid ${props => props.variant ? 'transparent' : '#e6f3e6'};
  border-radius: 14px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props => props.variant ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none'};

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: white;
  color: #166a0b;
  border: 2px solid #e6f3e6;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;

  &:hover:not(:disabled) {
    background: #e6f7e8;
    border-color: #58cc02;
    transform: translateX(${props => props.direction === 'prev' ? '-4px' : '4px'});
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const CompletionCard = styled.div`
  background: white;
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
  text-align: center;
  animation: ${fadeIn} 0.6s ease;
`;

const CompletionIcon = styled.div`
  font-size: 5rem;
  margin-bottom: 1.5rem;
  animation: ${celebrate} 1s ease;
`;

const CompletionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 800;
  color: #166a0b;
  margin: 0 0 1rem;
`;

const CompletionStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
`;

const CompletionStatCard = styled.div`
  background: ${props => props.bgColor || '#f3f4f6'};
  padding: 1.5rem;
  border-radius: 12px;
`;

const CompletionStatNumber = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: ${props => props.color || '#166a0b'};
  margin-bottom: 0.5rem;
`;

const CompletionStatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 600;
`;

const CompletionActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
  flex-wrap: wrap;
`;

const SettingsPanel = styled.div`
  position: fixed;
  top: 56px;
  right: ${props => props.show ? '0' : '-400px'};
  width: 380px;
  height: calc(100vh - 56px);
  background: white;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  overflow-y: auto;
  transition: right 0.3s ease;
  z-index: 1000;

  @media (max-width: 768px) {
    width: 100%;
    right: ${props => props.show ? '0' : '-100%'};
  }
`;

const SettingsTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #166a0b;
  margin: 0 0 1.5rem;
`;

const SettingItem = styled.div`
  margin-bottom: 1.5rem;
`;

const SettingLabel = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
`;

const ToggleSwitch = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
`;

const Switch = styled.input.attrs({ type: 'checkbox' })`
  appearance: none;
  width: 52px;
  height: 28px;
  background: ${props => props.checked ? '#58cc02' : '#d1d5db'};
  border-radius: 14px;
  position: relative;
  cursor: pointer;
  transition: background 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    width: 24px;
    height: 24px;
    background: white;
    border-radius: 50%;
    top: 2px;
    left: ${props => props.checked ? '26px' : '2px'};
    transition: left 0.3s ease;
  }
`;

// ========== COMPONENT ==========
const FlashcardReview = () => {
  const navigate = useNavigate();
  const { deckId } = useParams();
  const { showToast } = useToast();

  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    reviewed: 0,
    correct: 0,
    difficult: 0,
    toReview: 0
  });

  // Settings
  const [settings, setSettings] = useState({
    autoPlay: true,
    shuffle: false,
    showPhonetic: true,
    showExample: true,
    autoFlip: false
  });

  // Animation states
  const [shakeCard, setShakeCard] = useState(false);

  useEffect(() => {
    fetchFlashcards();
  }, [deckId]);

  const fetchFlashcards = async () => {
    try {
      // TODO: Replace with real API call
      // const response = await flashcardService.getByDeck(deckId);
      // setFlashcards(response.data);

      // Mock data
      const mockCards = [
        {
          id: 1,
          word: 'Hello',
          phonetic: '/həˈloʊ/',
          meaning: 'Xin chào',
          example: 'Hello, how are you today?',
          starred: true,
          reviewed: false
        },
        {
          id: 2,
          word: 'Beautiful',
          phonetic: '/ˈbjuː.tɪ.fəl/',
          meaning: 'Đẹp, xinh đẹp',
          example: 'She has a beautiful smile.',
          starred: false,
          reviewed: false
        },
        {
          id: 3,
          word: 'Challenge',
          phonetic: '/ˈtʃæl.ɪndʒ/',
          meaning: 'Thử thách',
          example: 'Learning English is a fun challenge.',
          starred: true,
          reviewed: false
        },
        {
          id: 4,
          word: 'Adventure',
          phonetic: '/ədˈven.tʃər/',
          meaning: 'Cuộc phiêu lưu',
          example: 'Life is a great adventure.',
          starred: false,
          reviewed: false
        },
        {
          id: 5,
          word: 'Wonderful',
          phonetic: '/ˈwʌn.də.fəl/',
          meaning: 'Tuyệt vời',
          example: 'What a wonderful day!',
          starred: false,
          reviewed: false
        }
      ];

      const shuffled = settings.shuffle 
        ? mockCards.sort(() => Math.random() - 0.5)
        : mockCards;

      setFlashcards(shuffled);
      setStats({
        reviewed: 0,
        correct: 0,
        difficult: 0,
        toReview: shuffled.length
      });
    } catch (error) {
      console.error('Fetch flashcards error:', error);
      showToast('error', 'Lỗi', 'Không thể tải flashcards');
    }
  };

  const currentCard = flashcards[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    setShowAnswer(!showAnswer);
    if (settings.autoPlay && !isFlipped) {
      speakWord(currentCard.word);
    }
  };

  const handleEasy = () => {
    markCard('easy');
    nextCard();
  };

  const handleHard = () => {
    markCard('hard');
    setShakeCard(true);
    setTimeout(() => setShakeCard(false), 500);
    nextCard();
  };

  const handleAgain = () => {
    markCard('again');
    setIsFlipped(false);
    setShowAnswer(false);
    showToast('info', 'Ôn lại', 'Thẻ này sẽ xuất hiện lại sau');
  };

  const markCard = (difficulty) => {
    const updatedCards = [...flashcards];
    updatedCards[currentIndex].reviewed = true;
    updatedCards[currentIndex].difficulty = difficulty;
    setFlashcards(updatedCards);

    setStats(prev => ({
      ...prev,
      reviewed: prev.reviewed + 1,
      correct: difficulty === 'easy' ? prev.correct + 1 : prev.correct,
      difficult: difficulty === 'hard' ? prev.difficult + 1 : prev.difficult,
      toReview: prev.toReview - 1
    }));
  };

  const nextCard = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      setShowAnswer(false);
    } else {
      setIsCompleted(true);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
      setShowAnswer(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowAnswer(false);
    setIsCompleted(false);
    setStats({
      reviewed: 0,
      correct: 0,
      difficult: 0,
      toReview: flashcards.length
    });
    fetchFlashcards();
  };

  const toggleStar = () => {
    const updatedCards = [...flashcards];
    updatedCards[currentIndex].starred = !updatedCards[currentIndex].starred;
    setFlashcards(updatedCards);
    showToast('success', 'Đã cập nhật', 'Đánh dấu thẻ thành công');
  };

  const speakWord = (word) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    if (key === 'shuffle') {
      fetchFlashcards();
    }
  };

  if (isCompleted) {
    const accuracy = stats.reviewed > 0 ? Math.round((stats.correct / stats.reviewed) * 100) : 0;

    return (
      <PageWrapper fullscreen={fullscreen}>
        {!fullscreen && <LeftSidebar />}
        <MainContent>
          <ContentInner fullscreen={fullscreen}>
            <CompletionCard>
              <CompletionIcon>🎉</CompletionIcon>
              <CompletionTitle>Xuất sắc! Bạn đã hoàn thành!</CompletionTitle>
              
              <CompletionStats>
                <CompletionStatCard bgColor="#e6f7e8">
                  <CompletionStatNumber color="#58cc02">{stats.reviewed}</CompletionStatNumber>
                  <CompletionStatLabel>Đã ôn tập</CompletionStatLabel>
                </CompletionStatCard>
                <CompletionStatCard bgColor="#e6f7e8">
                  <CompletionStatNumber color="#58cc02">{stats.correct}</CompletionStatNumber>
                  <CompletionStatLabel>Đúng</CompletionStatLabel>
                </CompletionStatCard>
                <CompletionStatCard bgColor="#fff7e6">
                  <CompletionStatNumber color="#f59e0b">{stats.difficult}</CompletionStatNumber>
                  <CompletionStatLabel>Khó</CompletionStatLabel>
                </CompletionStatCard>
                <CompletionStatCard bgColor="#e6f7e8">
                  <CompletionStatNumber color="#166a0b">{accuracy}%</CompletionStatNumber>
                  <CompletionStatLabel>Độ chính xác</CompletionStatLabel>
                </CompletionStatCard>
              </CompletionStats>

              <CompletionActions>
                <ActionButton variant="easy" onClick={handleRestart}>
                  <Replay />
                  Ôn lại
                </ActionButton>
                <ActionButton onClick={() => navigate('/decks')}>
                  <ArrowBack />
                  Về danh sách
                </ActionButton>
              </CompletionActions>
            </CompletionCard>
          </ContentInner>
        </MainContent>
        {!fullscreen && <RightSidebar />}
      </PageWrapper>
    );
  }

  if (!currentCard) {
    return (
      <PageWrapper>
        <LeftSidebar />
        <MainContent>
          <ContentInner>
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              Đang tải flashcards...
            </div>
          </ContentInner>
        </MainContent>
        <RightSidebar />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper fullscreen={fullscreen}>
      {!fullscreen && <LeftSidebar />}
      <MainContent>
        <ContentInner fullscreen={fullscreen}>
          <Header>
            <BackButton onClick={() => navigate('/decks')}>
              <ArrowBack />
              Quay lại
            </BackButton>

            <HeaderActions>
              <IconButton onClick={toggleStar} active={currentCard.starred}>
                {currentCard.starred ? <Star /> : <StarBorder />}
              </IconButton>
              <IconButton onClick={() => updateSetting('shuffle', !settings.shuffle)} active={settings.shuffle}>
                <Shuffle />
              </IconButton>
              <IconButton onClick={() => setShowSettings(!showSettings)}>
                <Settings />
              </IconButton>
              <IconButton onClick={toggleFullscreen}>
                {fullscreen ? <FullscreenExit /> : <Fullscreen />}
              </IconButton>
            </HeaderActions>
          </Header>

          <ProgressSection>
            <ProgressHeader>
              <ProgressText>
                Thẻ {currentIndex + 1} / {flashcards.length}
              </ProgressText>
              <ProgressStats>
                <StatItem color="#58cc02">
                  <CheckCircle /> {stats.correct}
                </StatItem>
                <StatItem color="#f59e0b">
                  <Help /> {stats.difficult}
                </StatItem>
                <StatItem color="#6b7280">
                  Còn lại: {stats.toReview}
                </StatItem>
              </ProgressStats>
            </ProgressHeader>
            <ProgressBar>
              <ProgressFill width={(stats.reviewed / flashcards.length) * 100} />
            </ProgressBar>
          </ProgressSection>

          <CardContainer>
            <FlashcardWrapper flipped={isFlipped} onClick={handleFlip}>
              <CardFront shake={shakeCard}>
                <CardBadge starred={currentCard.starred}>
                  {currentCard.starred ? <Star /> : <StarBorder />}
                  {currentCard.starred ? 'Quan trọng' : 'Bình thường'}
                </CardBadge>

                <CardLabel>Từ vựng</CardLabel>
                <CardContent>{currentCard.word}</CardContent>
                
                {settings.showPhonetic && currentCard.phonetic && (
                  <CardPhonetic>{currentCard.phonetic}</CardPhonetic>
                )}

                <SpeakButton onClick={(e) => {
                  e.stopPropagation();
                  speakWord(currentCard.word);
                }}>
                  <VolumeUp />
                </SpeakButton>

                <FlipHint>
                  <Visibility />
                  Nhấn để xem nghĩa
                </FlipHint>
              </CardFront>

              <CardBack>
                <CardBadge starred={currentCard.starred}>
                  {currentCard.starred ? <Star /> : <StarBorder />}
                  Nghĩa tiếng Việt
                </CardBadge>

                <CardLabel>Nghĩa</CardLabel>
                <CardContent>{currentCard.meaning}</CardContent>

                {settings.showExample && currentCard.example && (
                  <CardExample>
                    <Lightbulb style={{ fontSize: '1rem', marginRight: '0.5rem', color: '#fbbf24' }} />
                    {currentCard.example}
                  </CardExample>
                )}

                <FlipHint>
                  <VisibilityOff />
                  Nhấn để quay lại
                </FlipHint>
              </CardBack>
            </FlashcardWrapper>
          </CardContainer>

          {showAnswer && (
            <ActionButtons>
              <ActionButton variant="again" onClick={handleAgain}>
                <Replay />
                Ôn lại
              </ActionButton>
              <ActionButton variant="hard" onClick={handleHard}>
                <Cancel />
                Khó
              </ActionButton>
              <ActionButton variant="easy" onClick={handleEasy}>
                <CheckCircle />
                Dễ
              </ActionButton>
            </ActionButtons>
          )}

          <NavigationButtons>
            <NavButton 
              direction="prev"
              onClick={prevCard} 
              disabled={currentIndex === 0}
            >
              <NavigateBefore />
              Trước
            </NavButton>
            <NavButton 
              direction="next"
              onClick={nextCard} 
              disabled={currentIndex === flashcards.length - 1}
            >
              Sau
              <NavigateNext />
            </NavButton>
          </NavigationButtons>
        </ContentInner>
      </MainContent>
      {!fullscreen && <RightSidebar />}

      <SettingsPanel show={showSettings}>
        <SettingsTitle>Cài đặt ôn tập</SettingsTitle>
        
        <SettingItem>
          <ToggleSwitch>
            <SettingLabel>Tự động phát âm</SettingLabel>
            <Switch
              checked={settings.autoPlay}
              onChange={(e) => updateSetting('autoPlay', e.target.checked)}
            />
          </ToggleSwitch>
        </SettingItem>

        <SettingItem>
          <ToggleSwitch>
            <SettingLabel>Trộn thẻ ngẫu nhiên</SettingLabel>
            <Switch
              checked={settings.shuffle}
              onChange={(e) => updateSetting('shuffle', e.target.checked)}
            />
          </ToggleSwitch>
        </SettingItem>

        <SettingItem>
          <ToggleSwitch>
            <SettingLabel>Hiển thị phiên âm</SettingLabel>
            <Switch
              checked={settings.showPhonetic}
              onChange={(e) => updateSetting('showPhonetic', e.target.checked)}
            />
          </ToggleSwitch>
        </SettingItem>

        <SettingItem>
          <ToggleSwitch>
            <SettingLabel>Hiển thị ví dụ</SettingLabel>
            <Switch
              checked={settings.showExample}
              onChange={(e) => updateSetting('showExample', e.target.checked)}
            />
          </ToggleSwitch>
        </SettingItem>

        <SettingItem>
          <ToggleSwitch>
            <SettingLabel>Tự động lật thẻ</SettingLabel>
            <Switch
              checked={settings.autoFlip}
              onChange={(e) => updateSetting('autoFlip', e.target.checked)}
            />
          </ToggleSwitch>
        </SettingItem>
      </SettingsPanel>
    </PageWrapper>
  );
};

export default FlashcardReview;