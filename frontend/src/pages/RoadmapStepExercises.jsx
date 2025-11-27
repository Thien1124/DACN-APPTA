import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { roadmapTopicService } from '../services/roadmapTopicService';
import useToast from '../hooks/useToast';
import Swal from 'sweetalert2';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import {
  CheckCircle,
  RadioButtonUnchecked,
  ArrowBack,
  ArrowForward,
  School,
  Timer,
  Flag,
  VolumeUp
} from '@mui/icons-material';

// ========== ANIMATIONS ==========
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const progressFill = keyframes`
  from { width: 0%; }
  to { width: var(--progress-width); }
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
  max-width: 1200px;
  margin: 0 auto;
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

const TabsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e6f3e6;
`;

const Tab = styled.button`
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 3px solid ${props => props.active ? '#58cc02' : 'transparent'};
  color: ${props => props.active ? '#166a0b' : '#6b7280'};
  font-weight: ${props => props.active ? '700' : '600'};
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    color: #166a0b;
    background: #f0fbef;
  }
`;

// ========== ROADMAP STYLES ==========
const RoadmapSection = styled.div`
  animation: ${fadeIn} 0.5s ease;
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
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(88, 204, 2, 0.15);
  }
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

const ProgressOverview = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
`;

const ProgressTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #166a0b;
  margin: 0 0 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 16px;
  background: #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #58cc02, #45a302);
  border-radius: 8px;
  width: ${props => props.width}%;
  transition: width 0.8s ease;
  animation: ${progressFill} 1s ease;
  --progress-width: ${props => props.width}%;
`;

const ProgressInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95rem;
  color: #6b7280;
  font-weight: 600;
`;

const MilestoneTimeline = styled.div`
  position: relative;
  padding-left: 3rem;

  &::before {
    content: '';
    position: absolute;
    left: 1.25rem;
    top: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(180deg, #58cc02, #e5e7eb);
  }
`;

const MilestoneItem = styled.div`
  position: relative;
  margin-bottom: 2.5rem;
  animation: ${fadeIn} 0.6s ease;
  animation-delay: ${props => props.delay}s;
`;

const MilestoneMarker = styled.div`
  position: absolute;
  left: -2.75rem;
  top: 0.5rem;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: ${props => {
    if (props.completed) return 'linear-gradient(135deg, #58cc02, #45a302)';
    if (props.current) return 'linear-gradient(135deg, #fbbf24, #f59e0b)';
    return '#e5e7eb';
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1;
  animation: ${props => props.current ? pulse : 'none'} 2s infinite;
`;

const MilestoneCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-left: 4px solid ${props => {
    if (props.completed) return '#58cc02';
    if (props.current) return '#fbbf24';
    return '#d1d5db';
  }};
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(8px);
    box-shadow: 0 8px 24px rgba(88, 204, 2, 0.15);
  }
`;

const MilestoneHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 0.75rem;
`;

const MilestoneTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #166a0b;
  margin: 0;
`;

const MilestoneBadge = styled.div`
  padding: 0.5rem 1rem;
  background: ${props => {
    if (props.completed) return '#e6f7e8';
    if (props.current) return '#fff7e6';
    return '#f3f4f6';
  }};
  color: ${props => {
    if (props.completed) return '#166a0b';
    if (props.current) return '#c77700';
    return '#6b7280';
  }};
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const MilestoneDescription = styled.p`
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0 0 1rem;
  line-height: 1.6;
`;

const MilestoneProgress = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const MiniProgressBar = styled(ProgressBar)`
  height: 8px;
  flex: 1;
`;

const MiniProgressFill = styled(ProgressFill)`
  height: 100%;
`;

const MilestoneActions = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${props => props.primary ? 'linear-gradient(135deg, #58cc02, #45a302)' : 'white'};
  color: ${props => props.primary ? 'white' : '#166a0b'};
  border: 2px solid ${props => props.primary ? 'transparent' : '#e6f3e6'};
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(88, 204, 2, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

// ========== CALENDAR STYLES ==========
const CalendarSection = styled.div`
  animation: ${fadeIn} 0.5s ease;
`;

const CalendarControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const CalendarNav = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const NavButton = styled.button`
  background: white;
  border: 2px solid #e6f3e6;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #166a0b;

  &:hover {
    background: #e6f7e8;
    border-color: #58cc02;
    transform: scale(1.05);
  }
`;

const CurrentMonth = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #166a0b;
  min-width: 200px;
  text-align: center;
`;

const ViewToggle = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ViewButton = styled.button`
  padding: 0.75rem 1rem;
  background: ${props => props.active ? '#58cc02' : 'white'};
  color: ${props => props.active ? 'white' : '#166a0b'};
  border: 2px solid ${props => props.active ? '#58cc02' : '#e6f3e6'};
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${props => props.active ? '#45a302' : '#e6f7e8'};
  }
`;

const CalendarGrid = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const WeekdayHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`;

const WeekdayLabel = styled.div`
  text-align: center;
  font-weight: 700;
  color: #6b7280;
  font-size: 0.875rem;
  padding: 0.75rem;
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
`;

const DayCell = styled.div`
  aspect-ratio: 1;
  padding: 0.75rem;
  border-radius: 12px;
  background: ${props => {
    if (props.today) return 'linear-gradient(135deg, #58cc02, #45a302)';
    if (props.hasEvent) return '#e6f7e8';
    if (props.otherMonth) return '#f9fafb';
    return 'white';
  }};
  border: 2px solid ${props => {
    if (props.today) return '#58cc02';
    if (props.hasEvent) return '#58cc02';
    return '#e5e7eb';
  }};
  color: ${props => {
    if (props.today) return 'white';
    if (props.otherMonth) return '#d1d5db';
    return '#1f2937';
  }};
  font-weight: ${props => props.hasEvent ? '700' : '600'};
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(88, 204, 2, 0.2);
    z-index: 1;
  }
`;

const DayNumber = styled.div`
  font-size: 1rem;
  margin-bottom: 0.25rem;
`;

const EventDots = styled.div`
  display: flex;
  gap: 2px;
`;

const EventDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${props => props.today ? 'white' : '#58cc02'};
`;

const EventsList = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid #e5e7eb;
`;

const EventsTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #166a0b;
  margin: 0 0 1rem;
`;

const EventCard = styled.div`
  background: white;
  padding: 1.25rem;
  border-radius: 12px;
  border-left: 4px solid ${props => props.color || '#58cc02'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 1rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(4px);
    box-shadow: 0 4px 16px rgba(88, 204, 2, 0.1);
  }
`;

const EventHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 0.5rem;
`;

const EventTitle = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
`;

const EventTime = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const EventDescription = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.5rem;
`;

const AddEventButton = styled.button`
  position: fixed;
  bottom: 2rem;
  right: 320px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #58cc02, #45a302);
  color: white;
  border: none;
  box-shadow: 0 8px 24px rgba(88, 204, 2, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;

  &:hover {
    transform: scale(1.1) rotate(90deg);
    box-shadow: 0 12px 32px rgba(88, 204, 2, 0.4);
  }

  @media (max-width: 1100px) {
    right: 2rem;
  }
`;

// ========== EXERCISE STYLES ==========
const ExerciseContainer = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  animation: ${fadeIn} 0.6s ease;
`;

const ExerciseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
`;

const ExerciseInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const QuestionNumber = styled.div`
  background: linear-gradient(135deg, #58cc02, #45a302);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.875rem;
`;

const ExerciseTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #166a0b;
  margin: 0;
`;

const ProgressIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-weight: 600;
`;

const QuestionPrompt = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const QuestionHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const QuestionText = styled.div`
  flex: 1;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.6;
`;

const SpeakButton = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #58cc02, #45a302);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(88, 204, 2, 0.3);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const ChoicesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const ChoiceButton = styled.button`
  padding: 1.5rem;
  background: ${props => {
    if (props.$selected && props.$showResult) {
      return props.$isCorrect ? '#e6f7e8' : '#fee2e2';
    }
    return props.$selected ? '#e6f7e8' : 'white';
  }};
  border: 2px solid ${props => {
    if (props.$selected && props.$showResult) {
      return props.$isCorrect ? '#58cc02' : '#ef4444';
    }
    return props.$selected ? '#58cc02' : '#e5e7eb';
  }};
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  color: ${props => {
    if (props.$selected && props.$showResult) {
      return props.$isCorrect ? '#166a0b' : '#dc2626';
    }
    return '#1f2937';
  }};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
  text-align: left;

  &:hover:not(:disabled) {
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(88, 204, 2, 0.1);
    border-color: #58cc02;
  }

  &:disabled {
    opacity: 0.7;
  }
`;

const ChoiceIcon = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ChoiceText = styled.div`
  flex: 1;
`;

const FeedbackBanner = styled.div`
  padding: 1.5rem;
  background: ${props => props.$isCorrect ? '#e6f7e8' : '#fee2e2'};
  border: 2px solid ${props => props.$isCorrect ? '#58cc02' : '#ef4444'};
  border-radius: 12px;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  animation: ${slideIn} 0.4s ease;
`;

const FeedbackIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${props => props.$isCorrect ? '#58cc02' : '#ef4444'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const FeedbackContent = styled.div`
  flex: 1;
`;

const FeedbackTitle = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${props => props.$isCorrect ? '#166a0b' : '#dc2626'};
  margin-bottom: 0.25rem;
`;

const FeedbackText = styled.div`
  font-size: 1rem;
  color: ${props => props.$isCorrect ? '#15803d' : '#b91c1c'};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const ActionBtn = styled.button`
  padding: 1rem 2rem;
  background: ${props => props.primary ? 'linear-gradient(135deg, #58cc02, #45a302)' : 'white'};
  color: ${props => props.primary ? 'white' : '#166a0b'};
  border: 2px solid ${props => props.primary ? 'transparent' : '#e6f3e6'};
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(88, 204, 2, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #6b7280;
`;

const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #58cc02;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  margin-top: 1rem;
  font-size: 1.125rem;
  font-weight: 600;
`;
const InputContainer = styled.div`
  margin-bottom: 2rem;
`;

const InputLabel = styled.label`
  display: block;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.75rem;
`;

const InputField = styled.input`
  width: 100%;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #58cc02;
    box-shadow: 0 0 0 3px rgba(88, 204, 2, 0.1);
  }

  &:disabled {
    background: #f9fafb;
    cursor: not-allowed;
  }
`;
const RoadmapStepExercises = () => {
  const { roadmapId, stepNumber } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // ✅ Debug logs
  useEffect(() => {
    console.log('🔍 RoadmapStepExercises mounted:', {
      roadmapId,
      stepNumber,
      params: { roadmapId, stepNumber }
    });
  }, [roadmapId, stepNumber]);

  const [loading, setLoading] = useState(true);
  const [stepData, setStepData] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (roadmapId && stepNumber) {
      loadStepExercises();
    } else {
      console.error('❌ Missing roadmapId or stepNumber');
      showToast('error', 'Lỗi', 'Không tìm thấy thông tin lộ trình');
      navigate('/roadmap');
    }
  }, [roadmapId, stepNumber]);

  const loadStepExercises = async () => {
    try {
      setLoading(true);
      console.log('📥 Loading exercises for:', { roadmapId, stepNumber });
      
      const response = await roadmapTopicService.getStepExercises(roadmapId, stepNumber);
      
      console.log('✅ Step exercises response:', response);
      console.log('📋 Exercises data:', response.data.exercises);
      
      // ✅ Debug first exercise structure
      if (response.data.exercises && response.data.exercises.length > 0) {
        console.log('🔍 First exercise:', response.data.exercises[0]);
        console.log('🔍 Choices field:', response.data.exercises[0].choices || response.data.exercises[0].questions);
      }
      
      if (response.success) {
        setStepData(response.data.step);
        setExercises(response.data.exercises);
      }
    } catch (error) {
      console.error('❌ Load step exercises error:', error);
      showToast('error', 'Lỗi', 'Không thể tải bài tập');
      navigate('/roadmap');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (choiceId) => {
    if (!showFeedback) {
      setSelectedAnswer(choiceId);
    }
  };

  const handleCheckAnswer = () => {
    if (!selectedAnswer) {
      showToast('warning', 'Chưa chọn đáp án', 'Vui lòng chọn/nhập đáp án');
      return;
    }

    const currentExercise = exercises[currentExerciseIndex];
    
    let correct = false;
    
    // ✅ Check theo type
    if (currentExercise.type === 'multiple-choice') {
      correct = selectedAnswer === currentExercise.correctAnswer;
    } else {
      // Fill-in-blank, translation, listening: so sánh string (case-insensitive)
      correct = selectedAnswer.toLowerCase().trim() === currentExercise.correctAnswer.toLowerCase().trim();
    }
    
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      setScore(prev => prev + (100 / exercises.length));
    }

    setUserAnswers(prev => [...prev, {
      exerciseId: currentExercise._id,
      answer: selectedAnswer,
      isCorrect: correct
    }]);
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setIsCorrect(false);
    } else {
      handleCompleteStep();
    }
  };

  const handleCompleteStep = async () => {
    try {
      const finalScore = Math.round(score);
      const response = await roadmapTopicService.completeStep(roadmapId, parseInt(stepNumber), finalScore);
      
      if (response.success) {
        await Swal.fire({
          icon: 'success',
          title: '🎉 Hoàn thành bước!',
          html: `
            <div style="text-align: center;">
              <p style="font-size: 1.125rem; margin: 1rem 0;">
                Điểm số: <strong style="color: #58cc02; font-size: 2rem;">${finalScore}</strong>/100
              </p>
              <p style="font-size: 1rem; color: #6b7280; margin: 0.5rem 0;">
                Số câu đúng: ${userAnswers.filter(a => a.isCorrect).length}/${exercises.length}
              </p>
              <div style="padding: 1rem; background: #fef3c7; border-radius: 12px; margin-top: 1rem;">
                <p style="margin: 0; font-size: 1.125rem; font-weight: 700; color: #c77700;">
                  +${stepData.xpReward} XP
                </p>
              </div>
            </div>
          `,
          confirmButtonText: '🎯 Tiếp tục lộ trình',
          confirmButtonColor: '#58cc02',
          allowOutsideClick: false
        });
        
        navigate('/roadmap');
      }
    } catch (error) {
      console.error('Complete step error:', error);
      
      await Swal.fire({
        icon: 'warning',
        title: '⚠️ Chưa đủ điểm',
        html: `
          <div style="text-align: center;">
            <p style="font-size: 1rem; color: #6b7280; margin: 1rem 0;">
              ${error.response?.data?.message || 'Vui lòng thử lại để đạt điểm cao hơn'}
            </p>
            <p style="font-size: 1rem; margin: 0.5rem 0;">
              Điểm của bạn: <strong>${Math.round(score)}</strong>/100
            </p>
            <p style="font-size: 1rem; margin: 0.5rem 0;">
              Điểm tối thiểu: <strong>${stepData?.minScore || 70}</strong>/100
            </p>
          </div>
        `,
        confirmButtonText: '🔄 Làm lại',
        confirmButtonColor: '#f59e0b',
        allowOutsideClick: false
      });
      
      // Reset to retry
      setCurrentExerciseIndex(0);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setIsCorrect(false);
      setUserAnswers([]);
      setScore(0);
    }
  };

    
    const speakText = (text) => {
      if (!text || !text.toString().trim()) {
        console.warn('⚠️ Không có text để phát âm');
        return;
      }
    
      // ✅ Cancel bất kỳ speech nào đang chạy
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    
      // ✅ Hàm chọn giọng ENGLISH tốt nhất
      const getEnglishVoice = (voices) => {
        console.log('📋 Available voices:', voices.map(v => `${v.name} (${v.lang})`));
    
        // ✅ 1. Ưu tiên Google US English
        let voice = voices.find(v => 
          v.lang === 'en-US' && 
          v.name.toLowerCase().includes('google')
        );
        if (voice) {
          console.log('✅ Chọn Google US:', voice.name);
          return voice;
        }
    
        // ✅ 2. Microsoft David/Zira (Windows)
        voice = voices.find(v => 
          v.lang === 'en-US' && 
          (v.name.includes('David') || v.name.includes('Zira'))
        );
        if (voice) {
          console.log('✅ Chọn Microsoft:', voice.name);
          return voice;
        }
    
        // ✅ 3. Samantha (macOS)
        voice = voices.find(v => 
          v.lang === 'en-US' && 
          v.name.includes('Samantha')
        );
        if (voice) {
          console.log('✅ Chọn Samantha:', voice.name);
          return voice;
        }
    
        // ✅ 4. BẤT KỲ giọng en-US nào (KHÔNG phải en-GB)
        voice = voices.find(v => v.lang === 'en-US');
        if (voice) {
          console.log('✅ Chọn en-US:', voice.name);
          return voice;
        }
    
        // ✅ 5. Bất kỳ giọng English nào (en-GB, en-AU...)
        voice = voices.find(v => v.lang && v.lang.startsWith('en-'));
        if (voice) {
          console.log('✅ Chọn English:', voice.name);
          return voice;
        }
    
        // ✅ 6. LOẠI BỎ tất cả giọng Vietnamese
        voice = voices.find(v => 
          v.lang && 
          !v.lang.startsWith('vi') && 
          !v.name.toLowerCase().includes('vietnam')
        );
        if (voice) {
          console.log('⚠️ Fallback voice:', voice.name);
          return voice;
        }
    
        console.error('❌ Không tìm thấy giọng English!');
        return null;
      };
    
      // ✅ Hàm thực hiện speak
      const doSpeak = (selectedVoice) => {
        const utterance = new SpeechSynthesisUtterance(text.toString());
        
        // ✅ QUAN TRỌNG: Set voice TRƯỚC khi set lang
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
        
        // ✅ Luôn set lang = en-US
        utterance.lang = 'en-US';
        
        // ✅ Điều chỉnh giọng nói
        utterance.rate = 0.9;   // Tốc độ (0.1 - 10)
        utterance.pitch = 1.0;  // Cao độ (0 - 2)
        utterance.volume = 1.0; // Âm lượng (0 - 1)
    
        utterance.onstart = () => {
          console.log(`🔊 Đang đọc: "${text}"`);
          console.log(`   Voice: ${utterance.voice?.name || 'default'}`);
          console.log(`   Lang: ${utterance.lang}`);
        };
    
        utterance.onend = () => {
          console.log('✅ Hoàn thành');
        };
    
        utterance.onerror = (err) => {
          if (err.error !== 'canceled') {
            console.error('❌ Lỗi:', err.error);
          }
        };
    
        window.speechSynthesis.speak(utterance);
      };
    
      // ✅ Lấy danh sách voices
      let voices = window.speechSynthesis.getVoices();
    
      if (voices.length > 0) {
        // ✅ Đã có voices, chọn ngay
        const englishVoice = getEnglishVoice(voices);
        doSpeak(englishVoice);
      } else {
        
        // ✅ Chỉ set event 1 lần
        window.speechSynthesis.onvoiceschanged = () => {
          voices = window.speechSynthesis.getVoices();
          console.log(`✅ Loaded ${voices.length} voices`);
          
          const englishVoice = getEnglishVoice(voices);
          doSpeak(englishVoice);
          
          // ✅ Clear event sau khi dùng xong
          window.speechSynthesis.onvoiceschanged = null;
        };
      }
    };
  
  

  const renderExercise = () => {
    if (exercises.length === 0) return null;

    const currentExercise = exercises[currentExerciseIndex];

    console.log('🎯 Current exercise:', {
      index: currentExerciseIndex,
      exercise: currentExercise,
      type: currentExercise.type,
      hasOptions: !!currentExercise.options,
      optionsLength: currentExercise.options?.length,
      content: currentExercise.content
    });

    // ✅ Kiểm tra có options không (cho multiple-choice)
    const hasChoices = currentExercise.options && currentExercise.options.length > 0;

    return (
      <ExerciseContainer>
        <ExerciseHeader>
          <ExerciseInfo>
            <QuestionNumber>
              Câu {currentExerciseIndex + 1}/{exercises.length}
            </QuestionNumber>
            <ExerciseTitle>{stepData?.title}</ExerciseTitle>
          </ExerciseInfo>
          <ProgressIndicator>
            <Flag />
            Điểm: {Math.round(score)}/100
          </ProgressIndicator>
        </ExerciseHeader>

        <QuestionHeader>
          <QuestionText>{currentExercise.content}</QuestionText>
          <SpeakButton 
            onClick={() => speakText(currentExercise.content)}
            title="Đọc câu hỏi"
          >
            <VolumeUp />
          </SpeakButton>
        </QuestionHeader>

        {/* ✅ Render choices nếu là multiple-choice */}
        {currentExercise.type === 'multiple-choice' && hasChoices && (
          <ChoicesContainer>
            {currentExercise.options.map((option, index) => (
              <ChoiceButton
                key={index}
                $selected={selectedAnswer === option}
                onClick={() => handleSelectAnswer(option)}
                disabled={showFeedback}
                $showResult={showFeedback}
                $isCorrect={option === currentExercise.correctAnswer}
              >
                <ChoiceIcon>
                  {selectedAnswer === option ? (
                    <CheckCircle style={{ color: showFeedback ? (isCorrect ? '#58cc02' : '#ef4444') : '#58cc02' }} />
                  ) : (
                    <RadioButtonUnchecked style={{ color: '#d1d5db' }} />
                  )}
                </ChoiceIcon>
                <ChoiceText>{option}</ChoiceText>
              </ChoiceButton>
            ))}
          </ChoicesContainer>
        )}

        {/* ✅ Render input nếu là fill-in-blank, translation, listening */}
        {['fill-in-blank', 'translation', 'listening'].includes(currentExercise.type) && (
          <InputContainer>
            <InputLabel>
              {currentExercise.type === 'fill-in-blank' ? 'Điền vào chỗ trống:' : 
               currentExercise.type === 'translation' ? 'Dịch câu sau:' : 
               'Nghe và nhập đáp án:'}
            </InputLabel>
            <InputField
              type="text"
              value={selectedAnswer || ''}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              placeholder="Nhập đáp án..."
              disabled={showFeedback}
            />
          </InputContainer>
        )}

        {showFeedback && (
          <FeedbackBanner $isCorrect={isCorrect}>
            <FeedbackIcon $isCorrect={isCorrect}>
              {isCorrect ? '✓' : '✗'}
            </FeedbackIcon>
            <FeedbackContent>
              <FeedbackTitle $isCorrect={isCorrect}>
                {isCorrect ? 'Chính xác!' : 'Chưa đúng'}
              </FeedbackTitle>
              <FeedbackText $isCorrect={isCorrect}>
                {isCorrect 
                  ? 'Bạn đã trả lời đúng câu hỏi này'
                  : `Đáp án đúng là: ${currentExercise.correctAnswer}`
                }
              </FeedbackText>
            </FeedbackContent>
          </FeedbackBanner>
        )}

        <ActionButtons>
          {!showFeedback ? (
            <ActionBtn 
              primary 
              onClick={handleCheckAnswer}
              disabled={!selectedAnswer}
            >
              <CheckCircle />
              Kiểm tra
            </ActionBtn>
          ) : (
            <ActionBtn primary onClick={handleNextExercise}>
              {currentExerciseIndex < exercises.length - 1 ? (
                <>
                  Tiếp theo
                  <ArrowForward />
                </>
              ) : (
                <>
                  Hoàn thành
                  <Flag />
                </>
              )}
            </ActionBtn>
          )}
        </ActionButtons>
      </ExerciseContainer>
    );
  };

  if (loading) {
    return (
      <PageWrapper>
        <LeftSidebar />
        <MainContent>
          <LoadingContainer>
            <LoadingSpinner />
            <LoadingText>Đang tải bài tập...</LoadingText>
          </LoadingContainer>
        </MainContent>
        <RightSidebar />
      </PageWrapper>
    );
  }

  if (!stepData || exercises.length === 0) {
    return (
      <PageWrapper>
        <LeftSidebar />
        <MainContent>
          <LoadingContainer>
            <School style={{ fontSize: '4rem', color: '#d1d5db', marginBottom: '1rem' }} />
            <LoadingText style={{ color: '#6b7280' }}>
              Không có bài tập cho bước này
            </LoadingText>
            <ActionBtn 
              primary 
              onClick={() => navigate('/roadmap')}
              style={{ marginTop: '1rem' }}
            >
              <ArrowBack />
              Quay về lộ trình
            </ActionBtn>
          </LoadingContainer>
        </MainContent>
        <RightSidebar />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <LeftSidebar />
      <MainContent>
        <ContentInner>
          <Header>
            <ActionBtn onClick={() => navigate('/roadmap')}>
              <ArrowBack />
              Quay về
            </ActionBtn>
            <Title>
              <School />
              {stepData.title}
            </Title>
            <Subtitle>
              Hoàn thành {exercises.length} bài tập để mở khóa bước tiếp theo
            </Subtitle>
          </Header>

          {renderExercise()}
        </ContentInner>
      </MainContent>
      <RightSidebar />
    </PageWrapper>
  );
};

export default RoadmapStepExercises;