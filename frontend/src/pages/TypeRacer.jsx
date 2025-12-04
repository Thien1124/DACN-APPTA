import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import LeftSidebar from '../components/LeftSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Speed, EmojiEvents, Psychology, Autorenew } from '@mui/icons-material';
import { flashcardService } from '../services/flashcardServices';

const socket = io('http://localhost:1124');

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #fcfffcff 0%, #ffffffff 100%);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3), transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(140, 82, 255, 0.3), transparent 50%);
    animation: pulse 8s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 1;
  margin-left: 280px;
  margin-top: 80px;
  padding: 2rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled(motion.h1)`
  font-size: 4rem;
  font-weight: 900;
  background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
  text-shadow: 0 4px 20px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.2rem;
  font-weight: 500;
`;

const UserInfo = styled.div`
  position: absolute;
  top: 2rem;
  right: 2rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 1rem 1.5rem;
  border-radius: 50px;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
`;

const UserName = styled.span`
  color: white;
  font-weight: 600;
  font-size: 1rem;
`;

const GameCard = styled(motion.div)`
  max-width: 900px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 30px;
  padding: 3rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

const StartButton = styled(motion.button)`
  padding: 1.5rem 4rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border: none;
  border-radius: 60px;
  cursor: pointer;
  box-shadow: 0 15px 35px rgba(245, 87, 108, 0.4);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0 auto;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 20px 45px rgba(245, 87, 108, 0.5);
  }

  &:active {
    transform: translateY(-1px);
  }
`;

const SearchingContainer = styled(motion.div)`
  text-align: center;
  padding: 4rem;
`;

const SearchingText = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: green;
  margin-top: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

const LoadingDots = styled.span`
  display: inline-flex;
  gap: 0.5rem;
  
  span {
    width: 12px;
    height: 12px;
    background: green;
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;
    
    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
  }

  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }
`;

const ProgressSection = styled.div`
  margin-bottom: 3rem;
`;

const PlayerRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: ${props => props.isPlayer ? 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)' : 'linear-gradient(135deg, #f093fb15 0%, #f5576c15 100%)'};
  border-radius: 20px;
  border: 2px solid ${props => props.isPlayer ? '#667eea' : '#f5576c'};
`;

const PlayerAvatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${props => props.isPlayer ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.3rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
`;

const PlayerInfo = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 120px;
`;

const PlayerName = styled.div`
  font-weight: 700;
  font-size: 1.1rem;
  color: #1a1a1a;
`;

const PlayerLabel = styled.div`
  font-size: 0.85rem;
  color: #666;
`;

const ProgressBarContainer = styled.div`
  flex: 1;
`;

const ProgressStats = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #666;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 20px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: ${props => props.isPlayer ? 'linear-gradient(90deg, #68ef7fff 0%, #4ba252ff 100%)' : 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)'};
  border-radius: 10px;
  box-shadow: 0 0 15px ${props => props.isPlayer ? 'rgba(102, 126, 234, 0.5)' : 'rgba(245, 87, 108, 0.5)'};
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const SentenceDisplay = styled.div`
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 20px;
  margin-bottom: 2rem;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 1.5rem;
  line-height: 2.2;
  letter-spacing: 0.5px;
  text-align: left;
  user-select: none;
  border: 3px solid #e9ecef;
  box-shadow: inset 0 2px 10px rgba(0,0,0,0.05);
`;

const CharSpan = styled.span`
  color: ${props => {
    if (props.state === 'correct') return '#10b981';
    if (props.state === 'incorrect') return '#ef4444';
    return '#9ca3af';
  }};
  background: ${props => props.state === 'incorrect' ? 'rgba(239, 68, 68, 0.1)' : 'transparent'};
  padding: ${props => props.state === 'incorrect' ? '0 2px' : '0'};
  border-radius: 3px;
  transition: all 0.1s ease;
  font-weight: ${props => props.state !== 'pending' ? '600' : '400'};
`;

const InputField = styled.input`
  width: 100%;
  padding: 1.5rem;
  font-size: 1.3rem;
  border: 3px solid #667eea;
  border-radius: 15px;
  outline: none;
  transition: all 0.3s ease;
  font-family: 'Monaco', 'Courier New', monospace;

  &:focus {
    border-color: #764ba2;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
  }

  &:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
  }
`;

const ResultContainer = styled(motion.div)`
  text-align: center;
  padding: 3rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 25px;
  margin-top: 2rem;
`;

const ResultTitle = styled.h2`
  font-size: 4rem;
  font-weight: 900;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  
  ${props => props.won ? `
    background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  ` : `
    color: #ef4444;
  `}
`;

const PlayAgainButton = styled(motion.button)`
  padding: 1rem 3rem;
  font-size: 1.2rem;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 40px rgba(102, 126, 234, 0.5);
  }
`;

const TypeRacer = () => {
  // Use safe access to avoid destructuring `undefined` when auth slice is not populated
  const user = useSelector((state) => state.auth?.user);
  const [status, setStatus] = useState('idle'); // idle, searching, playing, finished
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [myProgress, setMyProgress] = useState(0);
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [roomID, setRoomID] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Lắng nghe sự kiện từ server
    socket.on('waiting_for_opponent', () => setStatus('searching'));
    
    socket.on('game_start', async (data) => {
      setStatus('playing');
      setRoomID(data.roomID);
      setMyProgress(0);
      setOpponentProgress(0);
      setInput('');
      setResult(null);
      setCurrentIndex(0);
      
      // Nếu server gửi flashcards, dùng nó; nếu không thì lấy từ API
      if (data.flashcards && data.flashcards.length > 0) {
        setFlashcards(data.flashcards);
      } else {
        await loadFlashcards();
      }
    });

    socket.on('opponent_progress', (prog) => {
      setOpponentProgress(prog);
    });

    socket.on('game_over', ({ winnerId }) => {
      setStatus('finished');
      if (winnerId === socket.id) {
        setResult('YOU WON! 🎉');
        setShowConfetti(true);
      } else {
        setResult('YOU LOST 😢');
      }
    });

    return () => {
      socket.off('waiting_for_opponent');
      socket.off('game_start');
      socket.off('opponent_progress');
      socket.off('game_over');
    };
  }, []);

  // Fire confetti when winner
  useEffect(() => {
    if (!showConfetti) return;
    confetti({ particleCount: 150, spread: 120, origin: { y: 0.6 } });
    const t = setTimeout(() => setShowConfetti(false), 3500);
    return () => clearTimeout(t);
  }, [showConfetti]);

  const loadFlashcards = async () => {
    try {
      setLoading(true);
      const response = await flashcardService.getRandomForTypeRacer(10);
      if (response.success && response.flashcards) {
        setFlashcards(response.flashcards);
      }
    } catch (error) {
      console.error('Error loading flashcards:', error);
      // Fallback data
      setFlashcards([
        { id: '1', vietnamese: 'Xin chào', english: 'Hello' },
        { id: '2', vietnamese: 'Cảm ơn', english: 'Thank you' },
        { id: '3', vietnamese: 'Tạm biệt', english: 'Goodbye' },
        { id: '4', vietnamese: 'Vui lòng', english: 'Please' },
        { id: '5', vietnamese: 'Xin lỗi', english: 'Sorry' },
        { id: '6', vietnamese: 'Yêu', english: 'Love' },
        { id: '7', vietnamese: 'Bạn', english: 'Friend' },
        { id: '8', vietnamese: 'Nhà', english: 'House' },
        { id: '9', vietnamese: 'Nước', english: 'Water' },
        { id: '10', vietnamese: 'Thức ăn', english: 'Food' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const findMatch = async () => {
    setStatus('searching');
    await loadFlashcards();
    socket.emit('find_match', { name: user?.name || 'Guest' });
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);

    const currentFlashcard = flashcards[currentIndex];
    if (!currentFlashcard) return;

    const correctAnswer = currentFlashcard.english.toLowerCase().trim();
    const userAnswer = val.toLowerCase().trim();

    // Tính toán % tiến độ dựa trên số từ đã hoàn thành
    const percent = Math.floor((currentIndex / flashcards.length) * 100);
    setMyProgress(percent);
    
    // Gửi tiến độ lên server
    socket.emit('update_progress', { roomID, progress: percent });

    // Kiểm tra nếu nhập đúng (so sánh không phân biệt hoa thường)
    if (userAnswer === correctAnswer) {
      if (currentIndex < flashcards.length - 1) {
        // Chuyển sang từ tiếp theo
        setTimeout(() => {
          setCurrentIndex(currentIndex + 1);
          setInput('');
        }, 200);
      } else {
        // Hoàn thành tất cả
        setMyProgress(100);
        socket.emit('update_progress', { roomID, progress: 100 });
        socket.emit('player_won', { roomID });
      }
    }
  };

  const isAuthenticated = !!user;
  const avatarInitials = user?.name ? user.name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() : 'GM';

  return (
    <PageContainer>
      <LeftSidebar leftSideVar="type-racer" />
      <ContentWrapper>
        {isAuthenticated && (
          <UserInfo>
            <Avatar>{avatarInitials}</Avatar>
            <UserName>{user?.name}</UserName>
          </UserInfo>
        )}

        <Header>
          <Title
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Speed style={{ fontSize: '4rem' }} />
            Speed Typing Battle
          </Title>
          <Subtitle>Thách thức tốc độ gõ phím của bạn!</Subtitle>
        </Header>

        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ textAlign: 'center' }}
            >
              <StartButton
                onClick={findMatch}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Psychology style={{ fontSize: '2rem' }} />
                Tìm Trận Đấu
              </StartButton>
            </motion.div>
          )}

          {status === 'searching' && (
            <SearchingContainer
              key="searching"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Autorenew style={{ fontSize: '5rem', color: 'green' }} />
              </motion.div>
              <SearchingText>
                Đang tìm đối thủ
                <LoadingDots>
                  <span></span>
                  <span></span>
                  <span></span>
                </LoadingDots>
              </SearchingText>
            </SearchingContainer>
          )}

          {(status === 'playing' || status === 'finished') && (
            <GameCard
              key="playing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ProgressSection>
                <PlayerRow isPlayer={true}>
                  <PlayerAvatar isPlayer={true}>{avatarInitials}</PlayerAvatar>
                  <PlayerInfo>
                    <PlayerName>{user?.name || 'Guest'}</PlayerName>
                    <PlayerLabel>Bạn</PlayerLabel>
                  </PlayerInfo>
                  <ProgressBarContainer>
                    <ProgressStats>
                      <span>Tiến độ</span>
                      <span style={{ color: '#667eea', fontWeight: '700' }}>{myProgress}%</span>
                    </ProgressStats>
                    <ProgressBar>
                      <ProgressFill
                        isPlayer={true}
                        initial={{ width: 0 }}
                        animate={{ width: `${myProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </ProgressBar>
                  </ProgressBarContainer>
                </PlayerRow>

                <PlayerRow isPlayer={false}>
                  <PlayerAvatar isPlayer={false}>👤</PlayerAvatar>
                  <PlayerInfo>
                    <PlayerName>Đối thủ</PlayerName>
                    <PlayerLabel>Opponent</PlayerLabel>
                  </PlayerInfo>
                  <ProgressBarContainer>
                    <ProgressStats>
                      <span>Tiến độ</span>
                      <span style={{ color: '#f5576c', fontWeight: '700' }}>{opponentProgress}%</span>
                    </ProgressStats>
                    <ProgressBar>
                      <ProgressFill
                        isPlayer={false}
                        initial={{ width: 0 }}
                        animate={{ width: `${opponentProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </ProgressBar>
                  </ProgressBarContainer>
                </PlayerRow>
              </ProgressSection>

              <div style={{textAlign: 'center', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: '600', color: '#667eea'}}>
                Từ {currentIndex + 1} / {flashcards.length}
              </div>

              <SentenceDisplay>
                <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#764ba2', marginBottom: '1rem' }}>
                  🇻🇳 {flashcards[currentIndex]?.vietnamese || ''}
                </div>
                
                
              </SentenceDisplay>

              <InputField
                type="text"
                value={input}
                onChange={handleInputChange}
                disabled={status === 'finished' || loading}
                placeholder="Nhập từ tiếng Anh..."
                autoFocus
                onPaste={(e) => e.preventDefault()}
              />

              {status === 'finished' && (
                <ResultContainer
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <ResultTitle won={result?.includes('WON')}>
                    {result?.includes('WON') ? (
                      <>
                        <EmojiEvents style={{ fontSize: '4rem', color: '#ffd700' }} />
                        CHIẾN THẮNG! 🎉
                      </>
                    ) : (
                      <>
                        TRY AGAIN 💪
                      </>
                    )}
                  </ResultTitle>
                  <PlayAgainButton
                    onClick={findMatch}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Chơi lại ngay
                  </PlayAgainButton>
                </ResultContainer>
              )}
            </GameCard>
          )}
        </AnimatePresence>
      </ContentWrapper>
    </PageContainer>
  );
};

export default TypeRacer;
