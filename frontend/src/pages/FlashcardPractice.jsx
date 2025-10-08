import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Swal from 'sweetalert2';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';

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
      ? 'radial-gradient(circle at 20% 50%, rgba(28, 176, 246, 0.1) 0%, transparent 70%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 70%)'
      : 'radial-gradient(circle at 20% 50%, rgba(28, 176, 246, 0.05) 0%, transparent 70%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.05) 0%, transparent 70%)'
    };
    z-index: -1;
  }
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  background: ${props => props.theme === 'dark' 
    ? 'rgba(26, 26, 26, 0.95)' 
    : 'rgba(255, 255, 255, 0.95)'
  };
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  padding: 1rem 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const HeaderContent = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

const CloseButton = styled.button`
  background: ${props => props.theme === 'dark' ? '#374151' : '#f3f4f6'};
  border: none;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  color: ${props => props.theme === 'dark' ? '#e5e7eb' : '#374151'};

  &:hover {
    background: ${props => props.theme === 'dark' ? '#4B5563' : '#e5e7eb'};
    transform: scale(1.1);
  }
`;

const ProgressBarContainer = styled.div`
  flex: 1;
  height: 16px;
  background: ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  border-radius: 8px;
  overflow: hidden;
  position: relative;
`;

const ProgressBarFill = styled.div`
  height: 100%;
  width: ${props => props.progress}%;
  background: linear-gradient(90deg, #1CB0F6 0%, #0891b2 100%);
  transition: width 0.5s ease;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(28, 176, 246, 0.3);
`;

const ProgressText = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.75rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#e5e7eb' : '#374151'};
  z-index: 1;
`;

const ScoreDisplay = styled.div`
  font-size: 1rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#e5e7eb' : '#374151'};
  white-space: nowrap;
`;

const LessonContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const FlashcardContainer = styled.div`
  perspective: 1000px;
  margin-bottom: 2rem;
`;

const Flashcard = styled.div`
  width: 100%;
  height: 400px;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s;
  cursor: pointer;
  transform: ${props => props.flipped ? 'rotateY(180deg)' : 'rotateY(0)'};

  @media (max-width: 768px) {
    height: 300px;
  }
`;

const CardFace = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
  box-shadow: ${props => props.theme === 'dark'
    ? '0 20px 60px rgba(0, 0, 0, 0.5)'
    : '0 20px 60px rgba(0, 0, 0, 0.1)'
  };

  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

const CardBack = styled(CardFace)`
  transform: rotateY(180deg);
  background: linear-gradient(135deg, #1CB0F6 0%, #0891b2 100%);
  color: white;
`;

const CardLabel = styled.div`
  font-size: 0.875rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-bottom: 2rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

const CardWord = styled.h2`
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-align: center;
  color: ${props => props.color || (props.theme === 'dark' ? '#f9fafb' : '#1a1a1a')};

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const CardPhonetic = styled.div`
  font-size: 1.25rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-bottom: 1rem;
  font-style: italic;
`;

const CardMeaning = styled.div`
  font-size: 1.5rem;
  text-align: center;
  line-height: 1.6;
  opacity: 0.95;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const CardExample = styled.div`
  font-size: 1rem;
  text-align: center;
  margin-top: 1.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-style: italic;
`;

const AudioButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: rgba(28, 176, 246, 0.2);
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(28, 176, 246, 0.3);
    transform: scale(1.1);
  }
`;

const ModeToggle = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center;
`;

const ModeButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  border: 2px solid ${props => {
    if (props.active) return '#1CB0F6';
    return props.theme === 'dark' ? '#374151' : '#e5e7eb';
  }};
  background: ${props => {
    if (props.active) return 'rgba(28, 176, 246, 0.1)';
    return props.theme === 'dark' ? '#1f2937' : '#ffffff';
  }};
  color: ${props => {
    if (props.active) return '#1CB0F6';
    return props.theme === 'dark' ? '#e5e7eb' : '#374151';
  }};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    border-color: #1CB0F6;
    transform: translateY(-2px);
  }

  span:first-child {
    font-size: 1.25rem;
  }
`;

const TypeInInput = styled.input`
  width: 100%;
  padding: 1.5rem;
  font-size: 1.5rem;
  border: 3px solid ${props => {
    if (props.checked && props.correct) return '#10b981';
    if (props.checked && !props.correct) return '#ef4444';
    return props.theme === 'dark' ? '#374151' : '#e5e7eb';
  }};
  border-radius: 16px;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  transition: all 0.3s ease;
  text-align: center;
  font-weight: 600;

  &:focus {
    outline: none;
    border-color: #1CB0F6;
    box-shadow: 0 0 0 4px rgba(28, 176, 246, 0.1);
  }

  &::placeholder {
    color: ${props => props.theme === 'dark' ? '#6b7280' : '#9ca3af'};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ActionButton = styled.button`
  flex: 1;
  max-width: 200px;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  ${props => {
    if (props.variant === 'primary') {
      return `
        background: linear-gradient(135deg, #1CB0F6 0%, #0891b2 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(28, 176, 246, 0.3);
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(28, 176, 246, 0.4);
        }
      `;
    }
    if (props.variant === 'success') {
      return `
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
        }
      `;
    }
    if (props.variant === 'danger') {
      return `
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

// ========== MOCK DATA ==========

const mockFlashcards = [
  {
    id: 1,
    word: 'Accomplish',
    phonetic: '/əˈkʌmplɪʃ/',
    meaning: 'Hoàn thành, đạt được',
    example: 'She accomplished all her goals this year.',
    exampleTranslation: 'Cô ấy đã hoàn thành tất cả mục tiêu của mình trong năm nay.',
  },
  {
    id: 2,
    word: 'Benefit',
    phonetic: '/ˈbenɪfɪt/',
    meaning: 'Lợi ích, có lợi',
    example: 'Regular exercise has many health benefits.',
    exampleTranslation: 'Tập thể dục đều đặn có nhiều lợi ích cho sức khỏe.',
  },
  {
    id: 3,
    word: 'Colleague',
    phonetic: '/ˈkɒliːɡ/',
    meaning: 'Đồng nghiệp',
    example: 'I discussed the project with my colleagues.',
    exampleTranslation: 'Tôi đã thảo luận dự án với các đồng nghiệp.',
  },
  {
    id: 4,
    word: 'Diligent',
    phonetic: '/ˈdɪlɪdʒənt/',
    meaning: 'Siêng năng, cần cù',
    example: 'She is a diligent student who never misses class.',
    exampleTranslation: 'Cô ấy là một học sinh siêng năng không bao giờ bỏ lớp.',
  },
  {
    id: 5,
    word: 'Essential',
    phonetic: '/ɪˈsenʃl/',
    meaning: 'Cần thiết, thiết yếu',
    example: 'Water is essential for life.',
    exampleTranslation: 'Nước là thứ thiết yếu cho sự sống.',
  },
];

// ========== COMPONENT ==========

const FlashcardPractice = () => {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [theme, setTheme] = useState('light');
  const [mode, setMode] = useState('flip'); // 'flip' or 'type-in'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [typeAnswer, setTypeAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [masteredCards, setMasteredCards] = useState([]);

  const currentCard = mockFlashcards[currentIndex];
  const progress = ((currentIndex + 1) / mockFlashcards.length) * 100;

  const speakWord = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const handleFlip = () => {
    if (mode === 'flip') {
      setFlipped(!flipped);
    }
  };

  const handleCheck = () => {
    const isCorrect = typeAnswer.toLowerCase().trim() === currentCard.word.toLowerCase();
    setChecked(true);
    setCorrect(isCorrect);
    
    if (isCorrect) {
      setScore(score + 1);
      showToast('success', 'Chính xác!', `Bạn đã nhập đúng "${currentCard.word}"`);
    } else {
      showToast('error', 'Chưa đúng!', `Đáp án đúng là "${currentCard.word}"`);
    }
  };

  const handleKnow = () => {
    setMasteredCards([...masteredCards, currentCard.id]);
    setScore(score + 1);
    showToast('success', 'Tuyệt vời!', 'Bạn đã nắm vững từ này!');
    handleNext();
  };

  const handleNotKnow = () => {
    showToast('info', 'Tiếp tục luyện tập!', 'Hãy xem lại từ này nhé!');
    handleNext();
  };

  const handleNext = () => {
    if (currentIndex < mockFlashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setFlipped(false);
      setTypeAnswer('');
      setChecked(false);
      setCorrect(false);
    } else {
      // Finish
      Swal.fire({
        icon: 'success',
        title: 'Hoàn thành!',
        html: `
          <p>Bạn đã hoàn thành ${mockFlashcards.length} thẻ!</p>
          <p><strong>Điểm: ${score}/${mockFlashcards.length}</strong></p>
          <p>Số thẻ đã nắm vững: ${masteredCards.length}</p>
        `,
        confirmButtonText: 'Quay lại',
        confirmButtonColor: '#1CB0F6',
      }).then(() => {
        navigate('/practice');
      });
    }
  };

  const handleClose = () => {
      Swal.fire({
        title: 'Bạn có chắc muốn thoát?',
        text: 'Tiến độ học tập sẽ không được lưu!',
        icon: 'warning',
        iconColor: '#FF9600',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: '✓ Đồng ý, thoát',
        cancelButtonText: '✗ Hủy bỏ',
        background: theme === 'dark' ? '#1f2937' : '#ffffff',
        color: theme === 'dark' ? '#f9fafb' : '#1a1a1a',
        backdrop: 'rgba(0,0,0,0.7)',
        customClass: {
          popup: 'custom-swal-popup',
          confirmButton: 'custom-confirm-button',
          cancelButton: 'custom-cancel-button'
        },
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            icon: 'info',
            title: 'Đã thoát khỏi bài học',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            background: theme === 'dark' ? '#1f2937' : '#ffffff',
            color: theme === 'dark' ? '#f9fafb' : '#1a1a1a',
          });
          navigate('/dashboard');
        }
      });
    };

  return (
    <PageWrapper theme={theme}>
      <Toast toast={toast} onClose={hideToast} />

      <Header theme={theme}>
        <HeaderContent>
          <CloseButton theme={theme} onClick={handleClose}>
            ✕
          </CloseButton>
          <ProgressBarContainer theme={theme}>
            <ProgressBarFill progress={progress} />
            <ProgressText theme={theme}>
              {currentIndex + 1}/{mockFlashcards.length}
            </ProgressText>
          </ProgressBarContainer>
          <ScoreDisplay theme={theme}>
            🎯 {score}/{mockFlashcards.length}
          </ScoreDisplay>
        </HeaderContent>
      </Header>

      <LessonContainer>
        <ModeToggle>
          <ModeButton
            theme={theme}
            active={mode === 'flip'}
            onClick={() => setMode('flip')}
          >
            <span>🔄</span>
            Lật thẻ
          </ModeButton>
          <ModeButton
            theme={theme}
            active={mode === 'type-in'}
            onClick={() => setMode('type-in')}
          >
            <span>⌨️</span>
            Gõ đáp án
          </ModeButton>
        </ModeToggle>

        {mode === 'flip' ? (
          <>
            <FlashcardContainer>
              <Flashcard flipped={flipped} onClick={handleFlip}>
                <CardFace theme={theme}>
                  <CardLabel theme={theme}>Từ vựng</CardLabel>
                  <CardWord theme={theme}>{currentCard.word}</CardWord>
                  <CardPhonetic theme={theme}>{currentCard.phonetic}</CardPhonetic>
                  <AudioButton onClick={(e) => {
                    e.stopPropagation();
                    speakWord(currentCard.word);
                  }}>
                    🔊
                  </AudioButton>
                  <div style={{ 
                    marginTop: '2rem', 
                    color: '#1CB0F6',
                    fontSize: '1rem',
                    fontWeight: 'bold'
                  }}>
                    👆 Click để xem nghĩa
                  </div>
                </CardFace>
                
                <CardBack>
                  <CardLabel style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Nghĩa
                  </CardLabel>
                  <CardMeaning>{currentCard.meaning}</CardMeaning>
                  <CardExample>
                    📝 {currentCard.example}
                    <br />
                    <br />
                    → {currentCard.exampleTranslation}
                  </CardExample>
                </CardBack>
              </Flashcard>
            </FlashcardContainer>

            <ButtonGroup>
              <ActionButton
                theme={theme}
                variant="danger"
                onClick={handleNotKnow}
              >
                <span>❌</span>
                Chưa biết
              </ActionButton>
              <ActionButton
                theme={theme}
                variant="success"
                onClick={handleKnow}
              >
                <span>✅</span>
                Đã biết
              </ActionButton>
            </ButtonGroup>
          </>
        ) : (
          <>
            <FlashcardContainer>
              <Flashcard>
                <CardFace theme={theme}>
                  <CardLabel theme={theme}>Nghe và nhập từ</CardLabel>
                  <AudioButton onClick={() => speakWord(currentCard.word)}>
                    🔊
                  </AudioButton>
                  <CardMeaning theme={theme} style={{ marginBottom: '2rem' }}>
                    {currentCard.meaning}
                  </CardMeaning>
                  <TypeInInput
                    theme={theme}
                    placeholder="Nhập từ vựng..."
                    value={typeAnswer}
                    onChange={(e) => setTypeAnswer(e.target.value)}
                    checked={checked}
                    correct={correct}
                    disabled={checked}
                  />
                  {checked && (
                    <div style={{
                      marginTop: '1rem',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      color: correct ? '#10b981' : '#ef4444'
                    }}>
                      {correct ? '✅ Chính xác!' : `❌ Đáp án: ${currentCard.word}`}
                    </div>
                  )}
                </CardFace>
              </Flashcard>
            </FlashcardContainer>

            <ButtonGroup>
              {!checked ? (
                <ActionButton
                  theme={theme}
                  variant="primary"
                  onClick={handleCheck}
                  disabled={!typeAnswer.trim()}
                >
                  <span>✓</span>
                  Kiểm tra
                </ActionButton>
              ) : (
                <ActionButton
                  theme={theme}
                  variant="success"
                  onClick={handleNext}
                >
                  <span>→</span>
                  Tiếp tục
                </ActionButton>
              )}
            </ButtonGroup>
          </>
        )}
      </LessonContainer>
    </PageWrapper>
  );
};

export default FlashcardPractice;