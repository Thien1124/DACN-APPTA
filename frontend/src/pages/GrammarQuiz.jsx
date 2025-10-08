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
      ? 'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 70%), radial-gradient(circle at 80% 20%, rgba(88, 204, 2, 0.1) 0%, transparent 70%)'
      : 'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.05) 0%, transparent 70%), radial-gradient(circle at 80% 20%, rgba(88, 204, 2, 0.05) 0%, transparent 70%)'
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
  background: linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%);
  transition: width 0.5s ease;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
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

const QuestionCard = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 3rem;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
  box-shadow: ${props => props.theme === 'dark'
    ? '0 20px 60px rgba(0, 0, 0, 0.5)'
    : '0 20px 60px rgba(0, 0, 0, 0.1)'
  };
  animation: slideIn 0.5s ease;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }
`;

const QuestionType = styled.div`
  display: inline-block;
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
`;

const QuestionText = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 2rem;
  line-height: 1.6;

  span {
    color: #8b5cf6;
    text-decoration: underline;
  }
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const OptionButton = styled.button`
  padding: 1.5rem;
  border-radius: 16px;
  border: 3px solid ${props => {
    if (props.selected && props.showResult) {
      return props.correct ? '#58CC02' : '#ef4444';
    }
    if (props.selected) {
      return '#8b5cf6';
    }
    return props.theme === 'dark' ? '#374151' : '#e5e7eb';
  }};
  background: ${props => {
    if (props.selected && props.showResult) {
      return props.correct 
        ? 'rgba(88, 204, 2, 0.1)' 
        : 'rgba(239, 68, 68, 0.1)';
    }
    if (props.selected) {
      return 'rgba(139, 92, 246, 0.1)';
    }
    return props.theme === 'dark' ? '#1f2937' : '#ffffff';
  }};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 1rem;

  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  }

  &:disabled {
    cursor: not-allowed;
  }

  span:first-child {
    font-size: 1.5rem;
  }
`;

const Explanation = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#f9fafb'};
  border-radius: 12px;
  border-left: 4px solid #8b5cf6;
`;

const ExplanationTitle = styled.div`
  font-weight: bold;
  color: #8b5cf6;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ExplanationText = styled.div`
  color: ${props => props.theme === 'dark' ? '#d1d5db' : '#6b7280'};
  line-height: 1.6;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: center;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ActionButton = styled.button`
  flex: 1;
  max-width: 250px;
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
        background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
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

const mockQuestions = [
  {
    id: 1,
    type: 'Từ loại (Parts of Speech)',
    question: 'The company made a _____ decision to expand its business.',
    options: [
      { id: 1, text: 'strategy', correct: false },
      { id: 2, text: 'strategic', correct: true },
      { id: 3, text: 'strategically', correct: false },
      { id: 4, text: 'strategize', correct: false },
    ],
    explanation: 'Cần tính từ "strategic" để bổ nghĩa cho danh từ "decision". Strategy (n), strategically (adv), strategize (v).',
  },
  {
    id: 2,
    type: 'Chia thì (Tenses)',
    question: 'By the time you arrive, we _____ the project.',
    options: [
      { id: 1, text: 'finished', correct: false },
      { id: 2, text: 'finish', correct: false },
      { id: 3, text: 'will finish', correct: false },
      { id: 4, text: 'will have finished', correct: true },
    ],
    explanation: 'Sử dụng thì tương lai hoàn thành (Future Perfect) vì hành động hoàn thành trước một thời điểm trong tương lai.',
  },
  {
    id: 3,
    type: 'Mạo từ (Articles)',
    question: '_____ information you provided was very helpful.',
    options: [
      { id: 1, text: 'A', correct: false },
      { id: 2, text: 'An', correct: false },
      { id: 3, text: 'The', correct: true },
      { id: 4, text: 'No article', correct: false },
    ],
    explanation: 'Dùng "The" vì thông tin được đề cập cụ thể (information you provided - thông tin mà bạn cung cấp).',
  },
  {
    id: 4,
    type: 'Giới từ (Prepositions)',
    question: 'The meeting has been scheduled _____ 3 PM next Friday.',
    options: [
      { id: 1, text: 'at', correct: true },
      { id: 2, text: 'in', correct: false },
      { id: 3, text: 'on', correct: false },
      { id: 4, text: 'by', correct: false },
    ],
    explanation: 'Dùng "at" trước giờ cụ thể. "On" dùng cho ngày, "in" cho tháng/năm, "by" cho thời hạn.',
  },
  {
    id: 5,
    type: 'Từ nối (Conjunctions)',
    question: '_____ it was raining heavily, they decided to go hiking.',
    options: [
      { id: 1, text: 'Because', correct: false },
      { id: 2, text: 'Although', correct: true },
      { id: 3, text: 'If', correct: false },
      { id: 4, text: 'When', correct: false },
    ],
    explanation: 'Dùng "Although" để thể hiện sự tương phản: mặc dù mưa lớn nhưng vẫn đi leo núi.',
  },
];

// ========== COMPONENT ==========

const GrammarQuiz = () => {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [theme, setTheme] = useState('light');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = mockQuestions[currentIndex];
  const progress = ((currentIndex + 1) / mockQuestions.length) * 100;

  const handleOptionSelect = (option) => {
    if (showResult) return;
    setSelectedAnswer(option.id);
  };

  const handleCheck = () => {
    const selectedOption = currentQuestion.options.find(opt => opt.id === selectedAnswer);
    const isCorrect = selectedOption?.correct || false;
    
    setShowResult(true);
    
    if (isCorrect) {
      setScore(score + 1);
      showToast('success', 'Chính xác!', 'Bạn đã trả lời đúng! +10 XP');
    } else {
      showToast('error', 'Chưa đúng!', 'Hãy xem giải thích để hiểu rõ hơn nhé!');
    }
  };

  const handleNext = () => {
    if (currentIndex < mockQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Finish
      Swal.fire({
        icon: 'success',
        title: 'Hoàn thành Mini-Quiz!',
        html: `
          <p>Bạn đã hoàn thành ${mockQuestions.length} câu hỏi ngữ pháp!</p>
          <p><strong>Điểm: ${score}/${mockQuestions.length}</strong></p>
          <p>Tỷ lệ đúng: ${Math.round((score / mockQuestions.length) * 100)}%</p>
        `,
        confirmButtonText: 'Quay lại',
        confirmButtonColor: '#8b5cf6',
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
              {currentIndex + 1}/{mockQuestions.length}
            </ProgressText>
          </ProgressBarContainer>
          <ScoreDisplay theme={theme}>
            📝 {score}/{mockQuestions.length}
          </ScoreDisplay>
        </HeaderContent>
      </Header>

      <LessonContainer>
        <QuestionCard theme={theme}>
          <QuestionType>
            {currentQuestion.type}
          </QuestionType>

          <QuestionText theme={theme}>
            {currentQuestion.question}
          </QuestionText>

          <OptionsGrid>
            {currentQuestion.options.map((option) => (
              <OptionButton
                key={option.id}
                theme={theme}
                selected={selectedAnswer === option.id}
                correct={option.correct}
                showResult={showResult}
                onClick={() => handleOptionSelect(option)}
                disabled={showResult}
              >
                <span>
                  {showResult && option.correct ? '✓' : 
                   showResult && selectedAnswer === option.id && !option.correct ? '✗' : '⚪'}
                </span>
                {option.text}
              </OptionButton>
            ))}
          </OptionsGrid>

          {showResult && (
            <Explanation theme={theme}>
              <ExplanationTitle>
                <span>💡</span>
                Giải thích
              </ExplanationTitle>
              <ExplanationText theme={theme}>
                {currentQuestion.explanation}
              </ExplanationText>
            </Explanation>
          )}

          <ButtonGroup>
            {!showResult ? (
              <ActionButton
                theme={theme}
                variant="primary"
                onClick={handleCheck}
                disabled={!selectedAnswer}
              >
                <span>✓</span>
                Kiểm tra
              </ActionButton>
            ) : (
              <ActionButton
                theme={theme}
                variant="primary"
                onClick={handleNext}
              >
                <span>→</span>
                {currentIndex < mockQuestions.length - 1 ? 'Câu tiếp theo' : 'Hoàn thành'}
              </ActionButton>
            )}
          </ButtonGroup>
        </QuestionCard>
      </LessonContainer>
    </PageWrapper>
  );
};

export default GrammarQuiz;