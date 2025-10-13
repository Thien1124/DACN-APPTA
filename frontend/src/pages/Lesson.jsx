import React, { useState, useEffect,useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import Swal from 'sweetalert2';
import confetti from 'canvas-confetti';
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
        ? 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 70%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 70%)'
        : 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 70%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.05) 0%, transparent 70%)'
    };
    z-index: -1;
  }
`;
const SwalStyles = createGlobalStyle`
  .custom-swal-popup {
    border-radius: 24px !important;
    padding: 2rem !important;
  }

  .custom-confirm-button {
    border-radius: 12px !important;
    padding: 0.75rem 2rem !important;
    font-weight: bold !important;
    font-size: 1rem !important;
    transition: all 0.3s ease !important;
  }

  .custom-confirm-button:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4) !important;
  }

  .custom-cancel-button {
    border-radius: 12px !important;
    padding: 0.75rem 2rem !important;
    font-weight: bold !important;
    font-size: 1rem !important;
    transition: all 0.3s ease !important;
  }

  .custom-cancel-button:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 4px 12px rgba(107, 114, 128, 0.4) !important;
  }

  .swal2-title {
    font-size: 1.75rem !important;
    font-weight: bold !important;
  }

  .swal2-html-container {
    font-size: 1rem !important;
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
  background: linear-gradient(90deg, #58CC02 0%, #45a302 100%);
  transition: width 0.5s ease;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(88, 204, 2, 0.3);
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

const HeartsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;

  @media (max-width: 480px) {
    display: none;
  }
`;

const Heart = styled.span`
  font-size: 1.5rem;
  opacity: ${props => props.filled ? '1' : '0.3'};
  transition: all 0.3s ease;
  animation: ${props => props.pulse ? 'heartBeat 0.5s ease' : 'none'};

  @keyframes heartBeat {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.3);
    }
  }
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
  background: rgba(88, 204, 2, 0.1);
  color: #58CC02;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
`;

const QuestionText = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 2rem;
  line-height: 1.4;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const AudioButton = styled.button`
  background: linear-gradient(135deg, #1CB0F6 0%, #0891b2 100%);
  border: none;
  padding: 1.5rem;
  border-radius: 50%;
  font-size: 3rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 24px rgba(28, 176, 246, 0.3);
  margin: 2rem auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  position: relative;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 12px 32px rgba(28, 176, 246, 0.4);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const ImageContainer = styled.div`
  width: 100%;
  max-width: 400px;
  margin: 2rem auto;
  text-align: center;
`;

const QuestionImage = styled.div`
  width: 100%;
  aspect-ratio: 1;
  background: ${props => props.theme === 'dark' ? '#374151' : '#f3f4f6'};
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8rem;
  margin-bottom: 1rem;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);

  @media (max-width: 768px) {
    font-size: 5rem;
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
            return '#1CB0F6';
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
            return 'rgba(28, 176, 246, 0.1)';
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

const InputContainer = styled.div`
  margin-top: 2rem;
`;

const TextInput = styled.input`
  width: 100%;
  padding: 1rem;  /* ⬅️ Giảm từ 1.5rem xuống 1rem */
  font-size: 1.25rem;  /* ⬅️ Giảm từ 1.5rem xuống 1.25rem */
  border: 3px solid ${props => {
        if (props.showResult) {
            return props.correct ? '#58CC02' : '#ef4444';
        }
        return props.theme === 'dark' ? '#374151' : '#e5e7eb';
    }};
  border-radius: 16px;
  background: ${props => {
        if (props.showResult) {
            return props.correct
                ? 'rgba(88, 204, 2, 0.1)'
                : 'rgba(239, 68, 68, 0.1)';
        }
        return props.theme === 'dark' ? '#1f2937' : '#ffffff';
    }};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  transition: all 0.3s ease;
  text-align: center;
  font-weight: 600;
  box-sizing: border-box;  /* ⬅️ THÊM dòng này */

  &:focus {
    outline: none;
    border-color: #1CB0F6;
    box-shadow: 0 0 0 4px rgba(28, 176, 246, 0.1);
  }

  &::placeholder {
    color: ${props => props.theme === 'dark' ? '#6b7280' : '#9ca3af'};
    font-size: 1rem;  /* ⬅️ THÊM: Placeholder nhỏ hơn */
  }

  /* ⬅️ THÊM responsive cho mobile */
  @media (max-width: 768px) {
    padding: 0.875rem;
    font-size: 1.125rem;
  }

  @media (max-width: 480px) {
    padding: 0.75rem;
    font-size: 1rem;
  }
`;

const WordBank = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 2rem;
  justify-content: center;
`;

const WordChip = styled.button`
  padding: 1rem 1.5rem;
  border-radius: 12px;
  border: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  background: ${props => {
        if (props.selected) return 'rgba(28, 176, 246, 0.1)';
        return props.theme === 'dark' ? '#1f2937' : '#ffffff';
    }};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: ${props => props.used ? '0.3' : '1'};
  pointer-events: ${props => props.used ? 'none' : 'auto'};

  &:hover:not(:disabled) {
    transform: translateY(-3px);
    background: rgba(28, 176, 246, 0.2);
  }
`;

const SelectedWords = styled.div`
  min-height: 80px;
  padding: 1.5rem;
  border: 3px dashed ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  border-radius: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#f9fafb'};
`;

const FeedbackContainer = styled.div`
  position: fixed;
  top: 5rem;
  right: 2rem;
  transform: translateX(${props => props.show ? '0' : '120%'});
  background: ${props => {
        if (props.correct) return 'linear-gradient(135deg, #58CC02 0%, #45a302 100%)';
        return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    }};
  padding: 1.25rem 1.75rem;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  z-index: 200;
  max-width: 400px;
  transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  
  border: 2px solid rgba(255,255,255,0.3);
  
  /* Auto hide sau 3 giây */
  ${props => props.show && `
    animation: slideInRight 0.5s ease, slideOutRight 0.5s ease 2.5s forwards;
  `}
  
  @keyframes slideInRight {
    from {
      transform: translateX(120%);
    }
    to {
      transform: translateX(0);
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(120%);
    }
  }
  
  @media (max-width: 768px) {
    top: 4rem;
    right: 1rem;
    left: 1rem;
    max-width: none;
  }
`;

const FeedbackContent = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
`;

const FeedbackIcon = styled.div`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: rgba(255,255,255,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  animation: ${props => props.correct ? 'bounceIn 0.6s ease' : 'shakeX 0.5s ease'};
  
  @keyframes bounceIn {
    0% { transform: scale(0); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
  
  @keyframes shakeX {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-8px); }
    75% { transform: translateX(8px); }
  }
`;

const FeedbackMessage = styled.div`
  flex: 1;
`;

const FeedbackTitle = styled.div`
  font-size: 1.125rem;
  font-weight: 900;
  margin-bottom: 0.25rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
`;

const FeedbackText = styled.div`
  font-size: 0.875rem;
  opacity: 0.95;
`;




const ButtonBase = styled.button`
  padding: 1rem 2rem;
  border-radius: 16px;
  font-size: 1.125rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;

  &:hover {
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;


const AudioIcon = styled.span`
  animation: ${props => props.isPlaying ? 'wave 1s ease-in-out infinite' : 'none'};
  
  @keyframes wave {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
  }
`;
const CheckButton = styled(ButtonBase)`
  width: 100%;
  max-width: 400px;
  margin: 2rem auto 0;
  background: ${props => props.disabled
        ? (props.theme === 'dark' ? '#374151' : '#e5e7eb')
        : 'linear-gradient(135deg, #58CC02 0%, #45a302 100%)'
    };
  color: white;
  box-shadow: ${props => props.disabled
        ? 'none'
        : '0 4px 12px rgba(88, 204, 2, 0.3)'
    };
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: block;

  &:hover {
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.disabled
        ? 'none'
        : '0 6px 20px rgba(88, 204, 2, 0.4)'
    };
  }
`;

const SkipButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  padding: 0.5rem;
  transition: color 0.3s ease;
  display: block;
  margin-left: auto;
  margin-right: auto;

  &:hover {
    color: ${props => props.theme === 'dark' ? '#e5e7eb' : '#374151'};
    text-decoration: underline;
  }
`;

const CompletionCard = styled.div`
  text-align: center;
  animation: celebration 0.8s ease;

  @keyframes celebration {
    0% {
      opacity: 0;
      transform: scale(0.8) rotate(-5deg);
    }
    50% {
      transform: scale(1.1) rotate(5deg);
    }
    100% {
      opacity: 1;
      transform: scale(1) rotate(0);
    }
  }
`;

const CompletionEmoji = styled.div`
  font-size: 8rem;
  margin-bottom: 2rem;
  animation: bounce 1s ease infinite;

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-20px);
    }
  }
`;

const CompletionTitle = styled.h2`
  font-size: 3rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const CompletionStats = styled.div`
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin: 2rem 0;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
  }
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 3rem;
  font-weight: bold;
  color: #58CC02;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-weight: 600;
`;

const CompletionButton = styled(ButtonBase)`
  background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(88, 204, 2, 0.3);
  font-size: 1.25rem;
  padding: 1.25rem 3rem;
  margin-top: 2rem;

  &:hover {
    box-shadow: 0 6px 20px rgba(88, 204, 2, 0.4);
  }
`;
const GameOverCard = styled.div`
  text-align: center;
  animation: fadeInScale 0.6s ease;

  @keyframes fadeInScale {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

const GameOverEmoji = styled.div`
  font-size: 8rem;
  margin-bottom: 2rem;
  animation: shake 0.8s ease;

  @keyframes shake {
    0%, 100% { transform: translateX(0) rotate(0deg); }
    25% { transform: translateX(-20px) rotate(-5deg); }
    75% { transform: translateX(20px) rotate(5deg); }
  }
`;

const GameOverTitle = styled.h2`
  font-size: 3rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const GameOverText = styled.p`
  font-size: 1.25rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-bottom: 2rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const RetryButton = styled(CompletionButton)`
  background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
`;

const HomeButton = styled(CompletionButton)`
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
`;
// ========== MOCK DATA ==========

const mockQuestions = [
    {
        id: 1,
        type: 'multiple-choice',
        question: 'What is this?',
        image: '🍎',
        options: [
            { id: 1, text: 'Apple', correct: true },
            { id: 2, text: 'Banana', correct: false },
            { id: 3, text: 'Orange', correct: false },
            { id: 4, text: 'Grape', correct: false },
        ],
    },
    {
        id: 2,
        type: 'listening',
        question: 'Listen and choose the correct answer',
        audioText: 'Hello, how are you?', // ⬅️ THÊM DÒNG NÀY
        options: [
            { id: 1, text: 'Hello, how are you?', correct: true },
            { id: 2, text: 'Goodbye, see you later', correct: false },
            { id: 3, text: 'What is your name?', correct: false },
            { id: 4, text: 'Where are you from?', correct: false },
        ],
    },
    {
        id: 3,
        type: 'fill-in-blank',
        question: 'Complete the sentence',
        prompt: 'I ___ a student.',
        correctAnswer: 'am',
        placeholder: 'Type your answer...',
    },
    {
        id: 4,
        type: 'word-order',
        question: 'Translate this sentence',
        prompt: 'Tôi yêu tiếng Anh',
        words: ['I', 'love', 'English', 'very', 'much'],
        correctOrder: ['I', 'love', 'English'],
    },
    {
        id: 5,
        type: 'multiple-choice',
        question: 'Choose the correct translation',
        prompt: '"Good morning" means:',
        options: [
            { id: 1, text: 'Chào buổi sáng', correct: true },
            { id: 2, text: 'Chào buổi tối', correct: false },
            { id: 3, text: 'Tạm biệt', correct: false },
            { id: 4, text: 'Cảm ơn', correct: false },
        ],
    },
];

// ========== COMPONENT ==========
const Lesson = () => {
  const navigate = useNavigate();
  const [theme] = useState('light');
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [selectedWords, setSelectedWords] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hearts, setHearts] = useState(3);
  const [heartPulse, setHeartPulse] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false); // ⬅️ THÊM state Game Over
  
  // ⬅️ THÊM: Ref để lưu timeout
  const autoNextTimeoutRef = useRef(null);

  // ⬅️ THÊM: Cleanup khi unmount
  useEffect(() => {
    return () => {
      if (autoNextTimeoutRef.current) {
        clearTimeout(autoNextTimeoutRef.current);
      }
    };
  }, []);

  const speakText = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsPlaying(false);
    };
    
    window.speechSynthesis.speak(utterance);
  };

  const currentQuestion = mockQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / mockQuestions.length) * 100;

  const handleOptionSelect = (option) => {
    if (showFeedback) return;
    setSelectedAnswer(option.id);
  };

  const handleWordSelect = (word, index) => {
    if (showFeedback) return;
    setSelectedWords([...selectedWords, { word, index }]);
  };

  const handleWordRemove = (indexToRemove) => {
    if (showFeedback) return;
    setSelectedWords(selectedWords.filter((_, i) => i !== indexToRemove));
  };

  // ⬅️ CẬP NHẬT: checkAnswer với logic kiểm tra hearts
  const checkAnswer = () => {
    let correct = false;

    if (currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'listening') {
      const selectedOption = currentQuestion.options.find(opt => opt.id === selectedAnswer);
      correct = selectedOption?.correct || false;
    } else if (currentQuestion.type === 'fill-in-blank') {
      correct = textAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase();
    } else if (currentQuestion.type === 'word-order') {
      const userAnswer = selectedWords.map(w => w.word).join(' ');
      const correctAnswer = currentQuestion.correctOrder.join(' ');
      correct = userAnswer === correctAnswer;
    }

    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setScore(score + 10);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x: 0.9, y: 0.2 },
        colors: ['#58CC02', '#45a302', '#FFD700', '#FF9600']
      });

      // Tự động chuyển câu sau 2 giây nếu đúng
      autoNextTimeoutRef.current = setTimeout(() => {
        handleContinue();
      }, 2000);
    } else {
      const newHearts = hearts - 1;
      setHearts(newHearts);
      setHeartPulse(true);
      setTimeout(() => setHeartPulse(false), 500);

      // ⬅️ KIỂM TRA: Nếu còn 1 heart thì cảnh báo
      if (newHearts === 1) {
        Swal.fire({
          title: '⚠️ Cẩn thận!',
          text: 'Bạn chỉ còn 1 trái tim! Cố gắng lên nhé!',
          icon: 'warning',
          iconColor: '#FF9600',
          toast: true,
          position: 'top',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          background: theme === 'dark' ? '#1f2937' : '#ffffff',
          color: theme === 'dark' ? '#f9fafb' : '#1a1a1a',
        });
      }

      // ⬅️ KIỂM TRA: Nếu hết hearts (= 0)
      if (newHearts <= 0) {
        autoNextTimeoutRef.current = setTimeout(() => {
          setShowFeedback(false);
          setIsGameOver(true);
        }, 2000);
      } else {
        // Còn hearts - Tiếp tục
        autoNextTimeoutRef.current = setTimeout(() => {
          handleContinue();
        }, 2000);
      }
    }
  };

  const handleContinue = () => {
    // Clear timeout nếu user click manual
    if (autoNextTimeoutRef.current) {
      clearTimeout(autoNextTimeoutRef.current);
    }

    setShowFeedback(false);
    setSelectedAnswer(null);
    setTextAnswer('');
    setSelectedWords([]);

    if (currentQuestionIndex < mockQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsCompleted(true);
    }
  };

  // ⬅️ CẬP NHẬT: handleSkip với kiểm tra hearts
  const handleSkip = () => {
    Swal.fire({
      title: 'Bỏ qua câu hỏi?',
      text: 'Bạn sẽ mất 1 trái tim ❤️',
      icon: 'info',
      iconColor: '#FF9600',
      showCancelButton: true,
      confirmButtonColor: '#FF9600',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Bỏ qua',
      cancelButtonText: 'Hủy',
      background: theme === 'dark' ? '#1f2937' : '#ffffff',
      color: theme === 'dark' ? '#f9fafb' : '#1a1a1a',
    }).then((result) => {
      if (result.isConfirmed) {
        const newHearts = hearts - 1;
        setHearts(newHearts);
        setHeartPulse(true);
        setTimeout(() => setHeartPulse(false), 500);

        // ⬅️ KIỂM TRA hearts khi skip
        if (newHearts <= 0) {
          setIsGameOver(true);
        } else {
          handleContinue();
        }
      }
    });
  };

  // ⬅️ THÊM: Hàm reset bài học
  const handleRetry = () => {
    setIsGameOver(false);
    setCurrentQuestionIndex(0);
    setHearts(3);
    setScore(0);
    setSelectedAnswer(null);
    setTextAnswer('');
    setSelectedWords([]);
    setShowFeedback(false);
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

  const handleFinish = () => {
    navigate('/dashboard');
  };

  const canCheck = () => {
    if (currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'listening') {
      return selectedAnswer !== null;
    } else if (currentQuestion.type === 'fill-in-blank') {
      return textAnswer.trim().length > 0;
    } else if (currentQuestion.type === 'word-order') {
      return selectedWords.length > 0;
    }
    return false;
  };

  // ⬅️ THÊM: Game Over Screen
  if (isGameOver) {
    return (
      <PageWrapper theme={theme}>
        <SwalStyles />
        <Header theme={theme}>
          <HeaderContent>
            <div style={{ flex: 1 }}></div>
          </HeaderContent>
        </Header>
        <LessonContainer>
          <QuestionCard theme={theme}>
            <GameOverCard>
              <GameOverEmoji>💔</GameOverEmoji>
              <GameOverTitle theme={theme}>
                Hết lượt rồi!
              </GameOverTitle>
              <GameOverText>
                Bạn đã hết trái tim ❤️
              </GameOverText>
              <CompletionStats>
                <StatItem>
                  <StatValue>{score}</StatValue>
                  <StatLabel theme={theme}>XP Đạt được</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{currentQuestionIndex + 1}/{mockQuestions.length}</StatValue>
                  <StatLabel theme={theme}>Câu hỏi</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{Math.round((score / (mockQuestions.length * 10)) * 100)}%</StatValue>
                  <StatLabel theme={theme}>Độ chính xác</StatLabel>
                </StatItem>
              </CompletionStats>
              <ButtonGroup>
                <RetryButton onClick={handleRetry}>
                  🔄 Thử lại
                </RetryButton>
                <HomeButton onClick={() => navigate('/dashboard')}>
                  🏠 Về trang chủ
                </HomeButton>
              </ButtonGroup>
            </GameOverCard>
          </QuestionCard>
        </LessonContainer>
      </PageWrapper>
    );
  }

  if (isCompleted) {
    return (
      <PageWrapper theme={theme}>
        <SwalStyles />
        <Header theme={theme}>
          <HeaderContent>
            <div style={{ flex: 1 }}></div>
          </HeaderContent>
        </Header>
        <LessonContainer>
          <QuestionCard theme={theme}>
            <CompletionCard>
              <CompletionEmoji>🎉</CompletionEmoji>
              <CompletionTitle theme={theme}>
                Hoàn thành bài học!
              </CompletionTitle>
              <CompletionStats>
                <StatItem>
                  <StatValue>{score}</StatValue>
                  <StatLabel theme={theme}>XP Đạt được</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{mockQuestions.length}</StatValue>
                  <StatLabel theme={theme}>Câu hỏi</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{Math.round((score / (mockQuestions.length * 10)) * 100)}%</StatValue>
                  <StatLabel theme={theme}>Độ chính xác</StatLabel>
                </StatItem>
              </CompletionStats>
              <CompletionButton onClick={handleFinish}>
                Hoàn tất
              </CompletionButton>
            </CompletionCard>
          </QuestionCard>
        </LessonContainer>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper theme={theme}>
      <SwalStyles />
      <Header theme={theme}>
        <HeaderContent>
          <CloseButton theme={theme} onClick={handleClose}>
            ✕
          </CloseButton>
          <ProgressBarContainer theme={theme}>
            <ProgressBarFill progress={progress} />
            <ProgressText theme={theme}>
              {currentQuestionIndex + 1}/{mockQuestions.length}
            </ProgressText>
          </ProgressBarContainer>
          <HeartsContainer hearts={hearts}>
            {[1, 2, 3].map((_, index) => (
              <Heart
                key={index}
                filled={index < hearts}
                pulse={heartPulse && index === hearts}
              >
                ❤️
              </Heart>
            ))}
          </HeartsContainer>
        </HeaderContent>
      </Header>

      <LessonContainer>
        <QuestionCard theme={theme}>
          <QuestionType>
            {currentQuestion.type === 'multiple-choice' && '📝 Multiple Choice'}
            {currentQuestion.type === 'listening' && '🎧 Listening'}
            {currentQuestion.type === 'fill-in-blank' && '✍️ Fill in the Blank'}
            {currentQuestion.type === 'word-order' && '🔤 Word Order'}
          </QuestionType>

          <QuestionText theme={theme}>
            {currentQuestion.question}
          </QuestionText>

          {currentQuestion.prompt && (
            <QuestionText theme={theme} style={{ fontSize: '1.5rem', color: '#1CB0F6' }}>
              {currentQuestion.prompt}
            </QuestionText>
          )}

          {currentQuestion.image && (
            <ImageContainer>
              <QuestionImage theme={theme}>
                {currentQuestion.image}
              </QuestionImage>
            </ImageContainer>
          )}

          {currentQuestion.type === 'listening' && (
            <>
              <AudioButton
                isPlaying={isPlaying}
                onClick={() => speakText(currentQuestion.audioText)}
              >
                <AudioIcon isPlaying={isPlaying}>
                  {isPlaying ? '🔊' : '🔈'}
                </AudioIcon>
              </AudioButton>
              {isPlaying && (
                <p style={{
                  textAlign: 'center',
                  color: '#1CB0F6',
                  fontWeight: 'bold',
                  marginTop: '-1rem',
                  marginBottom: '2rem',
                  fontSize: '1rem'
                }}>
                  🎵 Đang phát âm thanh...
                </p>
              )}
            </>
          )}

          {(currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'listening') && (
            <OptionsGrid>
              {currentQuestion.options.map((option) => (
                <OptionButton
                  key={option.id}
                  theme={theme}
                  selected={selectedAnswer === option.id}
                  correct={option.correct}
                  showResult={showFeedback}
                  onClick={() => handleOptionSelect(option)}
                  disabled={showFeedback}
                >
                  <span>
                    {showFeedback && option.correct ? '✓' :
                      showFeedback && selectedAnswer === option.id && !option.correct ? '✗' : '⚪'}
                  </span>
                  {option.text}
                </OptionButton>
              ))}
            </OptionsGrid>
          )}

          {currentQuestion.type === 'fill-in-blank' && (
            <InputContainer>
              <TextInput
                theme={theme}
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder={currentQuestion.placeholder}
                disabled={showFeedback}
                showResult={showFeedback}
                correct={isCorrect}
              />
            </InputContainer>
          )}

          {currentQuestion.type === 'word-order' && (
            <>
              <SelectedWords theme={theme}>
                {selectedWords.length === 0 ? (
                  <span style={{
                    color: theme === 'dark' ? '#6b7280' : '#9ca3af',
                    fontSize: '1.125rem'
                  }}>
                    Chọn từ để tạo câu...
                  </span>
                ) : (
                  selectedWords.map((item, index) => (
                    <WordChip
                      key={index}
                      theme={theme}
                      selected={true}
                      onClick={() => handleWordRemove(index)}
                    >
                      {item.word}
                    </WordChip>
                  ))
                )}
              </SelectedWords>
              <WordBank>
                {currentQuestion.words.map((word, index) => (
                  <WordChip
                    key={index}
                    theme={theme}
                    onClick={() => handleWordSelect(word, index)}
                    used={selectedWords.some(w => w.index === index)}
                  >
                    {word}
                  </WordChip>
                ))}
              </WordBank>
            </>
          )}

          {!showFeedback && (
            <>
              <CheckButton
                theme={theme}
                disabled={!canCheck()}
                onClick={checkAnswer}
              >
                Kiểm tra
              </CheckButton>
              <SkipButton theme={theme} onClick={handleSkip}>
                Bỏ qua câu này →
              </SkipButton>
            </>
          )}
        </QuestionCard>
      </LessonContainer>

      {showFeedback && (
        <FeedbackContainer show={showFeedback} correct={isCorrect}>
          <FeedbackContent>
            <FeedbackIcon correct={isCorrect}>
              {isCorrect ? '✓' : '✗'}
            </FeedbackIcon>
            <FeedbackMessage>
              <FeedbackTitle>
                {isCorrect ? 'Chính xác! 🎉' : 'Chưa đúng!'}
              </FeedbackTitle>
              <FeedbackText>
                {isCorrect
                  ? '+10 XP'
                  : 'Thử lại lần sau!'}
              </FeedbackText>
            </FeedbackMessage>
          </FeedbackContent>
        </FeedbackContainer>
      )}
    </PageWrapper>
  );
};

export default Lesson;