import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import volume from '../assets/audio.png';

import done from '../assets/done.png'
// ========== ANIMATIONS ==========
const slideUp = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(100%); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

const checkmark = keyframes`
  0% {
    height: 0;
    width: 0;
  }
  25% {
    height: 0;
    width: 28px;
  }
  50% {
    height: 52px;
    width: 28px;
  }
  100% {
    height: 52px;
    width: 28px;
  }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
`;

const celebrationAnimation = keyframes`
  0% { transform: scale(0) rotate(-180deg); }
  50% { transform: scale(1.2) rotate(10deg); }
  100% { transform: scale(1) rotate(0deg); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`;

const slideInFromBottom = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(50px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

const modalFadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;

// ========== STYLED COMPONENTS ==========

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #ffffff;
`;

const HeaderContainer = styled.div`
  padding: 1.25rem 2.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: white;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;

  @media (max-width: 1024px) {
    padding: 1rem 2rem;
    gap: 1.25rem;
  }

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    gap: 1rem;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.75rem;
  color: #afafaf;
  cursor: pointer;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  flex-shrink: 0;

  &:hover {
    background: #f3f4f6;
    color: #6b7280;
  }

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    font-size: 1.5rem;
  }
`;

const ProgressBarContainer = styled.div`
  flex: 1;
  height: 18px;
  background: #e5e7eb;
  border-radius: 100px;
  overflow: hidden;
  position: relative;

  @media (max-width: 768px) {
    height: 16px;
  }
`;

const ProgressBarFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #58CC02 0%, #45a302 100%);
  width: ${props => props.progress}%;
  transition: width 0.5s cubic-bezier(0.4, 0.0, 0.2, 1);
  border-radius: 100px;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 2rem 140px;  // Tăng padding-bottom để không bị Footer che
  max-width: 900px;
  margin: 0 auto;
  width: 100%;

  @media (max-width: 768px) {
    padding: 1.5rem 1rem 160px;
  }
`;

const QuestionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 400;
  color: #3c3c3c;
  margin-bottom: 3rem;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 2rem;
  }
`;

const SpeakerButton = styled.button`
  background: linear-gradient(135deg, #1CB0F6 0%, #0d9ed8 100%);
  border: none;
  width: 140px;
  height: 140px;
  border-radius: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 0 #0891b2, 0 12px 24px rgba(28, 176, 246, 0.3);
  margin-bottom: 3rem;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 0 #0891b2, 0 16px 28px rgba(28, 176, 246, 0.4);
  }

  &:active {
    transform: translateY(4px);
    box-shadow: 0 4px 0 #0891b2, 0 8px 16px rgba(28, 176, 246, 0.2);
  }

  @media (max-width: 768px) {
    width: 110px;
    height: 110px;
    border-radius: 22px;
  }
`;

const SpeakerIcon = styled.img`
  width: 68px;
  height: 68px;
  object-fit: contain;
  filter: brightness(0) invert(1);

  @media (max-width: 768px) {
    width: 56px;
    height: 56px;
  }
`;

const OptionsContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  width: 100%;
  max-width: 700px;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const OptionButton = styled.button`
  flex: 1;
  background: white;
  border: 2px solid ${props => {
    if (props.isCorrect && props.showFeedback) return '#58CC02';
    if (props.isWrong && props.showFeedback) return '#ef4444';
    if (props.selected && !props.showFeedback) return '#1CB0F6';
    return '#e5e7eb';
  }};
  border-radius: 16px;
  padding: 1.5rem;
  font-size: 1.25rem;
  font-weight: 400;
  color: #3c3c3c;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: flex-start;
  box-shadow: ${props => {
    if (props.isCorrect && props.showFeedback) return '0 6px 18px rgba(88, 204, 2, 0.2)';
    if (props.isWrong && props.showFeedback) return '0 6px 18px rgba(239, 68, 68, 0.2)';
    return '0 2px 4px rgba(0, 0, 0, 0.04)';
  }};
  animation: ${props => props.isWrong && props.showFeedback ? shake : 'none'} 0.5s ease;
  opacity: ${props => props.disabled && !props.selected && !props.isCorrect ? 0.5 : 1};

  &:hover:not(:disabled) {
    border-color: ${props => {
      if (props.showFeedback) {
        if (props.isCorrect) return '#58CC02';
        if (props.isWrong) return '#ef4444';
      }
      return '#1CB0F6';
    }};
    transform: ${props => props.disabled ? 'none' : 'scale(1.02)'};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    padding: 1.25rem;
    font-size: 1.125rem;
  }
`;

const OptionNumber = styled.span`
  min-width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  color: #afafaf;

  @media (max-width: 768px) {
    min-width: 32px;
    height: 32px;
    font-size: 0.9375rem;
  }
`;

const Footer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1.5rem 2.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
  z-index: 100;

  @media (max-width: 1024px) {
    padding: 1.5rem 2rem;
  }

  @media (max-width: 768px) {
    padding: 1.25rem 1rem;
    flex-direction: column-reverse;
    gap: 1rem;
  }
`;

const FooterContent = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column-reverse;
    gap: 1rem;
  }
`;

const SkipButton = styled.button`
  background: white;
  border: 2px solid #e5e7eb;
  color: #afafaf;
  padding: 0.875rem 2rem;
  border-radius: 16px;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &:hover {
    border-color: #d1d5db;
    background: #f9fafb;
    color: #6b7280;
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 0.875rem 1.5rem;
  }
`;

const CheckButton = styled.button`
  background: ${props => props.disabled ? '#e5e7eb' : 'linear-gradient(135deg, #58CC02 0%, #45a302 100%)'};
  border: none;
  color: ${props => props.disabled ? '#afafaf' : 'white'};
  padding: 0.875rem 3rem;
  border-radius: 16px;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  box-shadow: ${props => props.disabled ? 'none' : '0 4px 0 #46A302'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 150px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 0 #46A302;
  }

  &:active:not(:disabled) {
    transform: translateY(2px);
    box-shadow: 0 2px 0 #46A302;
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 0.875rem 2rem;
  }
`;

const FeedbackBanner = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${props => props.isCorrect ? '#d7ffb8' : '#ffdfe0'};
  padding: 1.5rem 2.5rem;
  display: ${props => props.show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 101;
  animation: ${slideUp} 0.4s ease-out;
  border-top: 1px solid ${props => props.isCorrect ? '#58CC02' : '#ef4444'};

  @media (max-width: 1024px) {
    padding: 1.25rem 2rem;
  }

  @media (max-width: 768px) {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
    border-top-width: 3px;
  }
`;

const FeedbackWrapper = styled.div`
  max-width: 1200px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const FeedbackContent = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;

  @media (max-width: 768px) {
    gap: 1rem;
    width: 100%;
  }
`;

const FeedbackIconWrapper = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: ${props => props.isCorrect ? '#58CC02' : '#ef4444'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;

  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
  }
`;

const CheckmarkIcon = styled.div`
  width: 28px;
  height: 52px;
  border-right: 7px solid white;
  border-bottom: 7px solid white;
  transform: rotate(45deg);
  animation: ${checkmark} 0.4s cubic-bezier(0.65, 0, 0.35, 1);
  margin-bottom: 10px;
  margin-left: 5px;

  @media (max-width: 768px) {
    width: 24px;
    height: 48px;
    border-right-width: 6px;
    border-bottom-width: 6px;
  }
`;

const CrossIcon = styled.div`
  position: relative;
  width: 52px;
  height: 52px;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 7px;
    height: 44px;
    background: white;
    transform: translate(-50%, -50%) rotate(45deg);
  }

  &::after {
    transform: translate(-50%, -50%) rotate(-45deg);
  }

  @media (max-width: 768px) {
    width: 44px;
    height: 44px;

    &::before,
    &::after {
      width: 6px;
      height: 38px;
    }
  }
`;

const FeedbackTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;

  @media (max-width: 768px) {
    gap: 0.375rem;
  }
`;

const FeedbackTitle = styled.h3`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.isCorrect ? '#58CC02' : '#ef4444'};
  margin: 0;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 1.625rem;
  }
`;

const FeedbackSubtext = styled.p`
  font-size: 1.125rem;
  font-weight: 700;
  color: #3c3c3c;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  line-height: 1.4;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const ContinueButton = styled.button`
  background: ${props => props.isCorrect ? '#58CC02' : '#ff4b4b'};
  border: none;
  color: white;
  padding: 1rem 3rem;
  border-radius: 16px;
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 0 ${props => props.isCorrect ? '#46A302' : '#dc2626'};
  min-width: 180px;
  flex-shrink: 0;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 0 ${props => props.isCorrect ? '#46A302' : '#dc2626'};
  }

  &:active {
    transform: translateY(2px);
    box-shadow: 0 2px 0 ${props => props.isCorrect ? '#46A302' : '#dc2626'};
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 1rem 2rem;
    font-size: 1rem;
  }
`;

const CompletionOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
  animation: ${modalFadeIn} 0.5s ease;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const CelebrationIcon = styled.div`
  font-size: 5rem;
  animation: ${celebrationAnimation} 1s ease;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    font-size: 4rem;
    margin-bottom: 1.5rem;
  }
`;

const CompletionCharacters = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  animation: ${float} 3s ease-in-out infinite;

  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
  }
`;

const CharacterIcon = styled.img`
  width: 120px;
  height: 120px;
  object-fit: contain;
  filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.2));

  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
  }
`;

const CompletionTitle = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  color: white;
  margin: 0 0 3rem 0;
  text-align: center;
  text-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  animation: ${scaleIn} 0.6s ease;

  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 2rem;
  }
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 3rem;
  animation: ${slideInFromBottom} 0.8s ease;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 2rem;
    width: 100%;
  }
`;

const StatCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2rem 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 4px solid ${props => props.color};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 768px) {
    padding: 1.5rem 2rem;
    width: 100%;
  }
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 700;
  color: ${props => props.color};
  text-transform: uppercase;
  letter-spacing: 1px;

  @media (max-width: 768px) {
    font-size: 0.8125rem;
  }
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${props => props.color};
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const CompletionButtons = styled.div`
  display: flex;
  gap: 1.5rem;
  animation: ${slideInFromBottom} 1s ease;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    gap: 1rem;
  }
`;

const CompletionButton = styled.button`
  background: ${props => props.primary ? 'white' : 'rgba(255, 255, 255, 0.2)'};
  border: 3px solid white;
  color: ${props => props.primary ? '#667eea' : 'white'};
  padding: 1.25rem 3rem;
  border-radius: 16px;
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    background: ${props => props.primary ? '#f8f9fa' : 'rgba(255, 255, 255, 0.3)'};
  }

  &:active {
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 1rem 2rem;
    font-size: 1rem;
  }
`;

const StreakBadge = styled.div`
  position: fixed;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
  padding: 1rem 2rem;
  border-radius: 16px;
  font-size: 1.5rem;
  font-weight: 700;
  box-shadow: 0 8px 32px rgba(251, 191, 36, 0.5);
  z-index: 1001;
  animation: ${scaleIn} 0.6s ease, ${float} 3s ease-in-out infinite;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  @media (max-width: 768px) {
    top: 80px;
    padding: 0.875rem 1.5rem;
    font-size: 1.25rem;
  }
`;

// ========== DATA ==========

const pronunciationQuestions = [
  {
    id: 1,
    type: 'listen',
    question: 'Bạn nghe được gì?',
    audio: 'dock',
    options: ['dock', 'deck'],
    correctAnswer: 'dock'
  },
  {
    id: 2,
    type: 'listen',
    question: 'Bạn nghe được gì?',
    audio: 'cat',
    options: ['cat', 'cut'],
    correctAnswer: 'cat'
  },
  {
    id: 3,
    type: 'match_audio',
    question: 'Chọn cặp từ',
    pairs: [
      { audio: 'got', text: 'got' },
      { audio: 'get', text: 'get' },
      { audio: 'dock', text: 'dock' },
      { audio: 'deck', text: 'deck' }
    ],
    correctPairs: {
      'got': 'got',
      'get': 'get',
      'dock': 'dock',
      'deck': 'deck'
    }
  },
  {
    id: 4,
    type: 'listen_multiple',
    question: 'Nghe và trả lời',
    audio1: 'cat',
    audio2: 'dog',
    question_text: 'Bạn nghe thấy gì?',
    options: ['cùng một từ', 'hai từ khác nhau'],
    correctAnswer: 'hai từ khác nhau'
  },
  {
    id: 5,
    type: 'listen',
    question: 'Bạn nghe được gì?',
    audio: 'ship',
    options: ['ship', 'sheep'],
    correctAnswer: 'ship'
  }
];

// ========== COMPONENT ==========

const PronunciationPractice = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [totalXP, setTotalXP] = useState(0);
  const [showStreakNotice, setShowStreakNotice] = useState(false);
  const [matchedPairs, setMatchedPairs] = useState({});
  const [selectedLeft, setSelectedLeft] = useState(null);
  const hasPlayedAudio = useRef(false);

  const question = pronunciationQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / pronunciationQuestions.length) * 100;

  // Check if it's first lesson of the day
  useEffect(() => {
    const lastLessonDate = localStorage.getItem('lastLessonDate');
    const today = new Date().toDateString();
    
    if (lastLessonDate !== today) {
      setShowStreakNotice(true);
      setTimeout(() => setShowStreakNotice(false), 3000);
      localStorage.setItem('lastLessonDate', today);
    }
  }, []);

  useEffect(() => {
    hasPlayedAudio.current = false;
    
    const timer = setTimeout(() => {
      if (!hasPlayedAudio.current && question.type === 'listen') {
        playAudio(question.audio);
        hasPlayedAudio.current = true;
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [currentQuestion]);

  // Sound effect function (giống Lesson.jsx)
  const playSound = (type) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === 'correct') {
      const frequencies = [523.25, 659.25, 783.99];
      const duration = 0.15;
      
      frequencies.forEach((freq, index) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.frequency.value = freq;
        osc.type = 'sine';
        
        gain.gain.setValueAtTime(0.3, audioContext.currentTime + index * duration);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + (index + 1) * duration);
        
        osc.start(audioContext.currentTime + index * duration);
        osc.stop(audioContext.currentTime + (index + 1) * duration);
      });
    } else if (type === 'wrong') {
      oscillator.type = 'sawtooth';
      oscillator.frequency.value = 100;
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  };

  const playAudio = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleOptionClick = (option) => {
    if (!showFeedback) {
      setSelectedAnswer(option);
      // Chỉ đọc nếu không phải là câu listen_multiple (tiếng Việt)
      if (question.type !== 'listen_multiple') {
        speakText(option);
      }
    }
  };

  const handlePairClick = (audio, text) => {
    if (showFeedback) return;

    if (selectedLeft === null) {
      // Chọn audio từ cột trái
      setSelectedLeft(audio);
      playAudio(audio);
    } else {
      // Đã chọn audio, giờ chọn text
      if (text !== null) {
        // Thêm cặp vào matchedPairs
        setMatchedPairs(prev => ({...prev, [selectedLeft]: text}));
        setSelectedLeft(null);
      }
    }
  };

  const handleCheck = () => {
    if (!selectedAnswer && Object.keys(matchedPairs).length === 0) return;

    let correct = false;
    if (question.type === 'match_audio') {
      // Kiểm tra xem tất cả cặp đã match đúng chưa
      const allPairsMatched = Object.keys(matchedPairs).length === Object.keys(question.correctPairs).length;
      
      if (allPairsMatched) {
        // Kiểm tra từng cặp có đúng không
        correct = Object.keys(matchedPairs).every(key => 
          matchedPairs[key] === question.correctPairs[key]
        );
      } else {
        correct = false;
      }
    } else {
      correct = selectedAnswer === question.correctAnswer;
    }

    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      playSound('correct');
      setCorrectCount(prev => prev + 1);
      setTotalXP(prev => prev + 10);
    } else {
      playSound('wrong');
    }
  };

  const handleContinue = () => {
    if (currentQuestion < pronunciationQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setMatchedPairs({});
      setSelectedLeft(null);
    } else {
      setShowCompletion(true);
    }
  };

  const handleSkip = () => {
    setIsCorrect(false);
    setShowFeedback(true);
    setSelectedAnswer(null);
    playSound('wrong');
  };

  const handleClose = () => {
    if (window.confirm('Bạn có chắc muốn thoát? Tiến trình của bạn sẽ không được lưu.')) {
      navigate('/characters');
    }
  };

  const handleContinueToLearn = () => {
    navigate('/characters');
  };

  const calculateAccuracy = () => {
    if (pronunciationQuestions.length === 0) return 0;
    return Math.round((correctCount / pronunciationQuestions.length) * 100);
  };

  const renderQuestion = () => {
    switch (question.type) {
      case 'match_audio':
        return (
          <>
            <QuestionTitle>{question.question}</QuestionTitle>
            <MatchContainer>
              <AudioColumn>
                {question.pairs.map((pair, index) => (
                  <AudioCard
                    key={`audio-${index}`}
                    selected={selectedLeft === pair.audio}
                    matched={!!matchedPairs[pair.audio]}
                    onClick={() => handlePairClick(pair.audio, null)}
                    disabled={!!matchedPairs[pair.audio]}
                  >
                    <OptionNumber>{index + 1}</OptionNumber>
                    <AudioIcon onClick={(e) => { 
                      e.stopPropagation(); 
                      playAudio(pair.audio); 
                    }}>
                      🔊
                    </AudioIcon>
                  </AudioCard>
                ))}
              </AudioColumn>
              <TextColumn>
                {question.pairs.map((pair, index) => (
                  <TextCard
                    key={`text-${index}`}
                    matched={Object.values(matchedPairs).includes(pair.text)}
                    onClick={() => {
                      if (selectedLeft) {
                        handlePairClick(selectedLeft, pair.text);
                      }
                    }}
                    disabled={Object.values(matchedPairs).includes(pair.text)}
                  >
                    <OptionNumber>{index + 5}</OptionNumber>
                    {pair.text}
                  </TextCard>
                ))}
              </TextColumn>
            </MatchContainer>
          </>
        );

      case 'listen_multiple':
        return (
          <>
            <QuestionTitle>{question.question}</QuestionTitle>
            <MultiAudioContainer>
              <AudioButton onClick={() => playAudio(question.audio1)}>
                🔊
              </AudioButton>
              <AudioButton onClick={() => playAudio(question.audio2)}>
                🔊
              </AudioButton>
            </MultiAudioContainer>
            <QuestionSubtitle>{question.question_text}</QuestionSubtitle>
            <OptionsContainer>
              {question.options.map((option, index) => (
                <OptionButton
                  key={index}
                  selected={selectedAnswer === option && !showFeedback}
                  isCorrect={showFeedback && option === question.correctAnswer}
                  isWrong={showFeedback && selectedAnswer === option && option !== question.correctAnswer}
                  showFeedback={showFeedback}
                  onClick={() => handleOptionClick(option)}
                  disabled={showFeedback}
                >
                  <OptionNumber>{index + 1}</OptionNumber>
                  {option}
                </OptionButton>
              ))}
            </OptionsContainer>
          </>
        );

      default:
        return (
          <>
            <QuestionTitle>{question.question}</QuestionTitle>
            <SpeakerButton onClick={() => playAudio(question.audio)}>
              <SpeakerIcon src={volume} alt="Play audio" />
            </SpeakerButton>
            <OptionsContainer>
              {question.options.map((option, index) => (
                <OptionButton
                  key={index}
                  selected={selectedAnswer === option && !showFeedback}
                  isCorrect={showFeedback && option === question.correctAnswer}
                  isWrong={showFeedback && selectedAnswer === option && option !== question.correctAnswer}
                  showFeedback={showFeedback}
                  onClick={() => handleOptionClick(option)}
                  disabled={showFeedback}
                >
                  <OptionNumber>{index + 1}</OptionNumber>
                  {option}
                </OptionButton>
              ))}
            </OptionsContainer>
          </>
        );
    }
  };

  return (
    <PageWrapper>
      {showStreakNotice && (
        <StreakBadge>
          🔥 +1 Chuỗi
        </StreakBadge>
      )}

      {showCompletion ? (
        <CompletionOverlay>
          
          <CompletionCharacters>
            <CharacterIcon src={done} alt="Done" />
            
          </CompletionCharacters>

          <CompletionTitle>Hoàn thành bài học!</CompletionTitle>

          <StatsContainer>
            <StatCard color="#fbbf24">
              <StatLabel color="#f59e0b">Tổng điểm xp</StatLabel>
              <StatValue color="#f59e0b">⚡ {totalXP}</StatValue>
            </StatCard>

            <StatCard color="#58CC02">
              <StatLabel color="#45a302">Chính xác</StatLabel>
              <StatValue color="#45a302">🎯 {calculateAccuracy()}%</StatValue>
            </StatCard>
          </StatsContainer>

          <CompletionButtons>
            <CompletionButton primary onClick={handleContinueToLearn}>
              Tiếp tục
            </CompletionButton>
          </CompletionButtons>
        </CompletionOverlay>
      ) : (
        <>
          <HeaderContainer>
            <CloseButton onClick={handleClose}>✕</CloseButton>
            <ProgressBarContainer>
              <ProgressBarFill progress={progress} />
            </ProgressBarContainer>
          </HeaderContainer>

          <Content>
            {renderQuestion()}
          </Content>

          {!showFeedback && (
            <Footer>
              <FooterContent>
                <SkipButton onClick={handleSkip}>Bỏ qua</SkipButton>
                <CheckButton 
                  onClick={handleCheck} 
                  disabled={!selectedAnswer && Object.keys(matchedPairs).length === 0}
                >
                  Kiểm tra
                </CheckButton>
              </FooterContent>
            </Footer>
          )}

          <FeedbackBanner show={showFeedback} isCorrect={isCorrect}>
            <FeedbackWrapper>
              <FeedbackContent>
                <FeedbackIconWrapper isCorrect={isCorrect}>
                  {isCorrect ? <CheckmarkIcon /> : <CrossIcon />}
                </FeedbackIconWrapper>
                <FeedbackTextWrapper>
                  <FeedbackTitle isCorrect={isCorrect}>
                    {isCorrect ? 'Tuyệt vời!' : 'Đáp án đúng:'}
                  </FeedbackTitle>
                  {!isCorrect && (
                    <FeedbackSubtext>
                      {question.correctAnswer}
                    </FeedbackSubtext>
                  )}
                </FeedbackTextWrapper>
              </FeedbackContent>
              <ContinueButton onClick={handleContinue} isCorrect={isCorrect}>
                Tiếp tục
              </ContinueButton>
            </FeedbackWrapper>
          </FeedbackBanner>
        </>
      )}
    </PageWrapper>
  );
};

export default PronunciationPractice;

// Thêm các styled components cho match audio và multi audio
const MatchContainer = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  width: 100%;
  max-width: 800px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
  }
`;

const AudioColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TextColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

// Cập nhật styled components
const AudioCard = styled.button`
  background: white;
  border: 3px solid ${props => {
    if (props.matched) return '#58CC02';
    if (props.selected) return '#1CB0F6';
    return '#e5e7eb';
  }};
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  opacity: ${props => props.disabled ? 0.5 : 1};
  min-height: 72px;
  width: 100%;
  justify-content: space-between;

  &:hover:not(:disabled) {
    border-color: #1CB0F6;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(28, 176, 246, 0.2);
  }

  @media (max-width: 768px) {
    min-height: 64px;
    padding: 1rem 1.25rem;
  }
`;
const TextCard = styled.button`
  background: white;
  border: 3px solid ${props => props.matched ? '#58CC02' : '#e5e7eb'};
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  font-size: 1.125rem;
  font-weight: 400;
  color: ${props => props.matched ? '#afafaf' : '#3c3c3c'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  min-height: 72px;
  width: 100%;
  justify-content: flex-start;

  &:hover:not(:disabled) {
    border-color: #1CB0F6;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(28, 176, 246, 0.2);
  }

  @media (max-width: 768px) {
    min-height: 64px;
    padding: 1rem 1.25rem;
    font-size: 1rem;
  }
`;


const AudioIcon = styled.button`
  background: ${props => props.selected ? '#1CB0F6' : '#e5e7eb'};
  border: none;
  border-radius: 30%;
  padding: 0;
  width: 32px;
  height: 32px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${props => props.selected ? 'white' : '#afafaf'};
  font-size: 1rem;

  &:hover {
    background: #1CB0F6;
    color: white;
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }

  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
    font-size: 0.875rem;
  }
`;

const MultiAudioContainer = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    gap: 1.5rem;
  }
`;

const AudioButton = styled.button`
  background: linear-gradient(135deg, #1CB0F6 0%, #0d9ed8 100%);
  border: none;
  width: 120px;
  height: 120px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 0 #0891b2, 0 10px 20px rgba(28, 176, 246, 0.3);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 0 #0891b2, 0 14px 24px rgba(28, 176, 246, 0.4);
  }

  &:active {
    transform: translateY(2px);
    box-shadow: 0 4px 0 #0891b2, 0 6px 12px rgba(28, 176, 246, 0.2);
  }

  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
    font-size: 2.5rem;
  }
`;

const QuestionSubtitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #3c3c3c;
  margin-bottom: 2rem;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 1.25rem;
    margin-bottom: 1.5rem;
  }
`;