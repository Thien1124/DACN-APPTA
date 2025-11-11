import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import {
  Timeline,
  CalendarMonth,
  CheckCircle,
  RadioButtonUnchecked,
  Lock,
  Star,
  TrendingUp,
  Schedule,
  EmojiEvents,
  Refresh,
  Add,
  NavigateNext,
  NavigateBefore,
  Today,
  ViewWeek,
  ViewModule,
  PlayArrow,
  AutoAwesome
} from '@mui/icons-material';
import { useToast } from '../hooks/useToast';
import { roadmapTopicService } from '../services/roadmapTopicService';
import { roadmapService } from '../services/roadmapService';
import { geminiService } from '../services/geminiService'; // Thêm import nếu chưa có
import Swal from 'sweetalert2';

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
  position: relative;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 7rem 2rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
  animation: ${fadeIn} 0.6s ease;
  position: relative;
  z-index: 1;
  margin-left: 300px;
  margin-right: 400px;

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

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  animation: ${fadeIn} 0.6s ease;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1.5rem;
  animation: ${pulse} 2s infinite;
`;

const EmptyTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: #166a0b;
  margin: 0 0 0.75rem;
`;

const EmptyDescription = styled.p`
  font-size: 1.125rem;
  color: #6b7280;
  margin: 0 0 2rem;
  line-height: 1.6;
`;

const EmptyButton = styled.button`
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #58cc02, #45a302);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.125rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(88, 204, 2, 0.3);
  }
`;

const RoadmapHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const RoadmapInfo = styled.div`
  flex: 1;
`;

const RoadmapTopicTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: #166a0b;
  margin: 0 0 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const RoadmapMeta = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: center;
  color: #6b7280;
  font-size: 0.95rem;
  font-weight: 600;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RoadmapActions = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const IconButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: ${props => props.danger ? '#fee2e2' : '#e6f7e8'};
  color: ${props => props.danger ? '#dc2626' : '#166a0b'};
  border: 2px solid ${props => props.danger ? '#fecaca' : '#e6f3e6'};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px ${props => props.danger ? 'rgba(220, 38, 38, 0.2)' : 'rgba(88, 204, 2, 0.2)'};
  }
`;

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

const CreateRoadmapButton = styled.button`
  position: fixed;
  bottom: 2rem;
  right: 420px;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #58cc02, #45a302);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(88, 204, 2, 0.3);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  z-index: 100;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(88, 204, 2, 0.4);
  }

  @media (max-width: 1200px) {
    right: 2rem;
    bottom: 5rem;
  }

  @media (max-width: 768px) {
    padding: 0.875rem 1.25rem;
    font-size: 0.875rem;
  }
`;

// Calendar styles (keep existing calendar styles...)
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

// ========== COMPONENT ==========
const PersonalizedRoadmap = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('roadmap');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('month');
  const [selectedDate, setSelectedDate] = useState(null);
  const [roadmapData, setRoadmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [milestones, setMilestones] = useState([]);

  // Mock calendar events
  const [events] = useState([
    {
      id: 1,
      date: new Date(2024, 10, 15),
      title: 'Bài học: Present Perfect',
      time: '19:00',
      color: '#58cc02',
      type: 'lesson'
    },
    {
      id: 2,
      date: new Date(2024, 10, 15),
      title: 'Practice Test',
      time: '20:30',
      color: '#fbbf24',
      type: 'test'
    }
  ]);

  // Thêm state để kiểm tra đăng nhập
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Kiểm tra token để xác định đăng nhập
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    loadRoadmap();
  }, []);

  const loadRoadmap = async () => {
    try {
      setLoading(true);
      const response = await roadmapTopicService.getCurrent();
      
      if (response.success) {
        const roadmap = response.data;
        
        setRoadmapData({
          topic: roadmap.topic,
          category: roadmap.category,
          level: roadmap.level,
          overallProgress: roadmap.overallProgress,
          completedMilestones: roadmap.steps.filter(s => s.isCompleted).length,
          totalMilestones: roadmap.steps.length,
          currentStreak: 12,
          estimatedCompletion: new Date(roadmap.estimatedCompletionDate).toLocaleDateString('vi-VN'),
          totalXP: roadmap.totalXP,
          startedAt: new Date(roadmap.startedAt).toLocaleDateString('vi-VN')
        });

        const transformedMilestones = roadmap.steps.map(step => ({
          id: step._id,
          title: step.title,
          description: step.description,
          progress: step.isCompleted ? 100 : (roadmap.currentStep === step.stepNumber ? 50 : 0),
          status: step.isCompleted ? 'completed' : (roadmap.currentStep === step.stepNumber ? 'current' : 'locked'),
          lessons: step.exercises.length,
          completedLessons: step.isCompleted ? step.exercises.length : 0,
          difficulty: step.difficulty,
          minScore: step.minScore,
          xpReward: step.xpReward,
          estimatedTime: step.estimatedTime,
          roadmapId: roadmap._id,
          stepNumber: step.stepNumber
        }));

        setMilestones(transformedMilestones);
      }
    } catch (error) {
      console.error('Load roadmap error:', error);
      if (error.response?.status === 404) {
        setRoadmapData(null);
        setMilestones([]);
      } else {
        showToast('error', 'Lỗi', 'Không thể tải lộ trình học');
      }
    } finally {
      setLoading(false);
    }
  };

  const showCreateRoadmapDialog = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Tạo Lộ trình học toàn diện',
      html: `
        <div style="text-align: left; padding: 1rem;">
          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 700; color: #166a0b; font-size: 1rem;">
              Chủ đề học tập
            </label>
            <input id="swal-topic" class="swal2-input" style="margin: 0; width: 100%; padding: 0.875rem; border: 2px solid #e6f3e6; border-radius: 8px; font-size: 1rem;" placeholder="VD: Tiếng Anh tổng quát" value="General English" />
          </div>
          
          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 700; color: #166a0b; font-size: 1rem;">
              Trình độ bắt đầu
            </label>
            <select id="swal-start-level" class="swal2-select" style="margin: 0; width: 100%; padding: 0.875rem; border: 2px solid #e6f3e6; border-radius: 8px; font-size: 1rem; background: white;">
              <option value="A1">A1 - Beginner (Mới bắt đầu)</option>
              <option value="A2">A2 - Elementary (Sơ cấp)</option>
              <option value="B1">B1 - Intermediate (Trung cấp)</option>
              <option value="B2">B2 - Upper Intermediate (Trung cấp cao)</option>
              <option value="C1">C1 - Advanced (Nâng cao)</option>
              <option value="C2">C2 - Mastery (Thành thạo)</option>
            </select>
          </div>
          
          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 700; color: #166a0b; font-size: 1rem;">
              Trình độ kết thúc
            </label>
            <select id="swal-end-level" class="swal2-select" style="margin: 0; width: 100%; padding: 0.875rem; border: 2px solid #e6f3e6; border-radius: 8px; font-size: 1rem; background: white;">
              <option value="A2">A2 - Elementary (Sơ cấp)</option>
              <option value="B1" selected>B1 - Intermediate (Trung cấp)</option>
              <option value="B2">B2 - Upper Intermediate (Trung cấp cao)</option>
              <option value="C1">C1 - Advanced (Nâng cao)</option>
              <option value="C2">C2 - Mastery (Thành thạo)</option>
            </select>
          </div>

          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 700; color: #166a0b; font-size: 1rem;">
              Số bài tập cho mỗi trình độ
            </label>
            <input id="swal-steps-per-level" type="number" class="swal2-input" style="margin: 0; width: 100%; padding: 0.875rem; border: 2px solid #e6f3e6; border-radius: 8px; font-size: 1rem;" placeholder="20" value="20" min="5" max="50" />
          </div>

          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 700; color: #166a0b; font-size: 1rem;">
              Tỷ lệ độ khó (Easy/Medium/Hard)
            </label>
            <div style="display: flex; gap: 0.5rem;">
              <input id="swal-easy-ratio" type="number" class="swal2-input" style="flex: 1; padding: 0.875rem; border: 2px solid #e6f3e6; border-radius: 8px; font-size: 1rem;" placeholder="35" value="35" min="0" max="100" />
              <input id="swal-medium-ratio" type="number" class="swal2-input" style="flex: 1; padding: 0.875rem; border: 2px solid #e6f3e6; border-radius: 8px; font-size: 1rem;" placeholder="35" value="35" min="0" max="100" />
              <input id="swal-hard-ratio" type="number" class="swal2-input" style="flex: 1; padding: 0.875rem; border: 2px solid #e6f3e6; border-radius: 8px; font-size: 1rem;" placeholder="30" value="30" min="0" max="100" />
            </div>
            <small style="color: #6b7280; font-size: 0.875rem;">Tổng tỷ lệ phải bằng 100%</small>
          </div>

          <div style="background: #e6f7e8; border-left: 4px solid #58cc02; padding: 1rem; border-radius: 8px; margin-top: 1.5rem;">
            <p style="margin: 0; color: #166a0b; font-size: 0.875rem; line-height: 1.6;">
              <strong>💡 Lưu ý:</strong> Lộ trình sẽ bao gồm tất cả skills (vocabulary, grammar, listening, reading, speaking, writing, mixed) từ trình độ bắt đầu đến kết thúc. Từ vựng sẽ được tạo riêng cho từng trình độ. Độ khó tăng dần theo tỷ lệ bạn chọn.
            </p>
          </div>
        </div>
      `,
      width: '600px',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Tạo lộ trình',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#58cc02',
      cancelButtonColor: '#6b7280',
      preConfirm: () => {
        const topic = document.getElementById('swal-topic').value;
        const startLevel = document.getElementById('swal-start-level').value;
        const endLevel = document.getElementById('swal-end-level').value;
        const stepsPerLevel = parseInt(document.getElementById('swal-steps-per-level').value);
        const easyRatio = parseInt(document.getElementById('swal-easy-ratio').value);
        const mediumRatio = parseInt(document.getElementById('swal-medium-ratio').value);
        const hardRatio = parseInt(document.getElementById('swal-hard-ratio').value);
        
        if (!topic || topic.trim().length < 3) {
          Swal.showValidationMessage('⚠️ Vui lòng nhập chủ đề (tối thiểu 3 ký tự)');
          return false;
        }
        
        const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

        // Thêm validation trước khi so sánh
        if (!levels.includes(startLevel) || !levels.includes(endLevel)) {
          Swal.showValidationMessage('⚠️ Trình độ bắt đầu và kết thúc phải là A1, A2, B1, B2, C1 hoặc C2');
          return false;
        }

        if (levels.indexOf(startLevel) >= levels.indexOf(endLevel)) {
          Swal.showValidationMessage('⚠️ Trình độ kết thúc phải cao hơn trình độ bắt đầu');
          return false;
        }

        if (stepsPerLevel < 5 || stepsPerLevel > 50) {
          Swal.showValidationMessage('⚠️ Số bài tập cho mỗi trình độ phải từ 5 đến 50');
          return false;
        }

        if (easyRatio + mediumRatio + hardRatio !== 100) {
          Swal.showValidationMessage('⚠️ Tổng tỷ lệ độ khó phải bằng 100%');
          return false;
        }
        
        return { topic: topic.trim(), startLevel, endLevel, stepsPerLevel, easyRatio, mediumRatio, hardRatio };
      }
    });

    if (formValues) {
      await createRoadmap(formValues.startLevel, formValues.endLevel, formValues.topic, formValues.stepsPerLevel, formValues.easyRatio, formValues.mediumRatio, formValues.hardRatio);
    }
  };

  const createRoadmap = async (startLevel, endLevel, topic, stepsPerLevel, easyRatio, mediumRatio, hardRatio) => {
    try {
      setLoading(true);
      const response = await roadmapTopicService.generate(startLevel, endLevel, topic, stepsPerLevel, easyRatio, mediumRatio, hardRatio);
      
      if (response.success) {
        showToast('success', 'Thành công', response.message);
        await loadRoadmap();
      }
    } catch (error) {
      console.error('Create roadmap error:', error);
      showToast('error', 'Lỗi', error.response?.data?.message || 'Không thể tạo lộ trình học');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async (milestone) => {
    try {
      console.log('🚀 Navigate to roadmap step:', {
        roadmapId: milestone.roadmapId,
        stepNumber: milestone.stepNumber,
        milestone
      });

      // ✅ Kiểm tra có roadmapId và stepNumber không
      if (!milestone.roadmapId || !milestone.stepNumber) {
        showToast('error', 'Lỗi', 'Không thể mở bài tập: Thiếu thông tin lộ trình');
        return;
      }

      navigate(`/roadmap-step/${milestone.roadmapId}/${milestone.stepNumber}`);
    } catch (error) {
      console.error('❌ Navigate error:', error);
      showToast('error', 'Lỗi', 'Không thể mở bài tập');
    }
  };

  const handleGenerateAIExercises = async (milestone) => {
    try {
      showToast('info', 'Đang tạo', '🤖 AI đang tạo bài tập...');

      const response = await geminiService.generateExercisesForStep({
        roadmapId: milestone.roadmapId,
        stepNumber: milestone.stepNumber,
        count: 5, // Có thể cho phép người dùng chọn số lượng
        difficulty: milestone.difficulty || 'medium'
      });

      if (response.success) {
        showToast('success', 'Thành công', `✅ Đã tạo ${response.data.length} bài tập cho bước này`);
        await loadRoadmap(); // Làm mới dữ liệu để hiển thị exercises mới
      }
    } catch (error) {
      console.error('Generate AI exercises error:', error);
      showToast('error', 'Lỗi', error.response?.data?.message || 'Không thể tạo bài tập AI');
    }
  };

  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

    let current = new Date(startDate);
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const getEventsForDate = (date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const getStatusIcon = (status) => {
    if (status === 'completed') return <CheckCircle />;
    if (status === 'current') return <RadioButtonUnchecked />;
    return <Lock />;
  };

  const getStatusText = (status) => {
    if (status === 'completed') return 'Hoàn thành';
    if (status === 'current') return 'Đang học';
    return 'Khóa';
  };

  if (loading) {
    return (
      <PageWrapper>
        <LeftSidebar />
        <MainContent>
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
            <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>Đang tải lộ trình học...</p>
          </div>
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
            <Title>
              <Timeline />
              Lộ trình Cá nhân hóa
            </Title>
            <Subtitle>Theo dõi tiến độ học tập và lịch học của bạn</Subtitle>
          </Header>

          <TabsContainer>
            <Tab active={activeTab === 'roadmap'} onClick={() => setActiveTab('roadmap')}>
              <Timeline />
              Lộ trình học tập
            </Tab>
            <Tab active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')}>
              <CalendarMonth />
              Lịch học
            </Tab>
          </TabsContainer>

          {activeTab === 'roadmap' && (
            <RoadmapSection>
              {!roadmapData ? (
                <EmptyState>
                  <EmptyIcon>🗺️</EmptyIcon>
                  <EmptyTitle>Chưa có lộ trình học tập</EmptyTitle>
                  <EmptyDescription>
                    Tạo lộ trình học tập cá nhân hóa để bắt đầu hành trình chinh phục tiếng Anh của bạn!
                    <br />
                    Hệ thống sẽ tự động tạo các bước học từ DỄ → TRUNG BÌNH → KHÓ.
                  </EmptyDescription>
                  <EmptyButton onClick={showCreateRoadmapDialog}>
                    <Add />
                    Tạo lộ trình đầu tiên
                  </EmptyButton>
                </EmptyState>
              ) : (
                <>
                  <RoadmapHeader>
                    <RoadmapInfo>
                      <RoadmapTopicTitle>
                        <EmojiEvents />
                        {roadmapData.topic}
                      </RoadmapTopicTitle>
                      <RoadmapMeta>
                        <MetaItem>
                          <Star sx={{ fontSize: 18, color: '#fbbf24' }} />
                          {roadmapData.level}
                        </MetaItem>
                        <MetaItem>
                          <Schedule sx={{ fontSize: 18 }} />
                          Bắt đầu: {roadmapData.startedAt}
                        </MetaItem>
                        <MetaItem>
                          <TrendingUp sx={{ fontSize: 18 }} />
                          {roadmapData.totalXP} XP
                        </MetaItem>
                      </RoadmapMeta>
                    </RoadmapInfo>
                    <RoadmapActions>
                      <IconButton onClick={showCreateRoadmapDialog} title="Tạo lộ trình mới">
                        <Add />
                      </IconButton>
                      <IconButton onClick={loadRoadmap} title="Làm mới">
                        <Refresh />
                      </IconButton>
                    </RoadmapActions>
                  </RoadmapHeader>

                  <StatsBar>
                    <StatCard>
                      <StatNumber>{roadmapData.overallProgress}%</StatNumber>
                      <StatLabel>Tiến độ tổng thể</StatLabel>
                    </StatCard>
                    <StatCard>
                      <StatNumber>{roadmapData.completedMilestones}/{roadmapData.totalMilestones}</StatNumber>
                      <StatLabel>Cột mốc hoàn thành</StatLabel>
                    </StatCard>
                    <StatCard>
                      <StatNumber>{roadmapData.currentStreak}</StatNumber>
                      <StatLabel>Chuỗi ngày liên tiếp</StatLabel>
                    </StatCard>
                    <StatCard>
                      <StatNumber>{roadmapData.estimatedCompletion}</StatNumber>
                      <StatLabel>Dự kiến hoàn thành</StatLabel>
                    </StatCard>
                  </StatsBar>

                  <ProgressOverview>
                    <ProgressTitle>
                      <TrendingUp />
                      Tiến độ tổng thể
                    </ProgressTitle>
                    <ProgressBar>
                      <ProgressFill width={roadmapData.overallProgress} />
                    </ProgressBar>
                    <ProgressInfo>
                      <span>{roadmapData.overallProgress}% hoàn thành</span>
                      <span>{roadmapData.completedMilestones} / {roadmapData.totalMilestones} cột mốc</span>
                    </ProgressInfo>
                  </ProgressOverview>

                  <MilestoneTimeline>
                    {milestones.map((milestone, index) => (
                      <MilestoneItem key={milestone.id} delay={index * 0.1}>
                        <MilestoneMarker
                          completed={milestone.status === 'completed'}
                          current={milestone.status === 'current'}
                        >
                          {getStatusIcon(milestone.status)}
                        </MilestoneMarker>
                        <MilestoneCard
                          completed={milestone.status === 'completed'}
                          current={milestone.status === 'current'}
                        >
                          <MilestoneHeader>
                            <MilestoneTitle>{milestone.title}</MilestoneTitle>
                            <MilestoneBadge
                              completed={milestone.status === 'completed'}
                              current={milestone.status === 'current'}
                            >
                              {milestone.status === 'completed' && <EmojiEvents />}
                              {getStatusText(milestone.status)}
                            </MilestoneBadge>
                          </MilestoneHeader>
                          <MilestoneDescription>{milestone.description}</MilestoneDescription>
                          
                          <MilestoneProgress>
                            <MiniProgressBar>
                              <MiniProgressFill width={milestone.progress} />
                            </MiniProgressBar>
                            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>
                              {milestone.completedLessons}/{milestone.lessons} bài
                            </span>
                          </MilestoneProgress>

                          {milestone.status !== 'locked' && (
                            <MilestoneActions>
                              <ActionButton primary onClick={() => handleContinue(milestone)}>
                                <PlayArrow />
                                {milestone.status === 'completed' ? 'Xem lại' : 'Bắt đầu học'}
                              </ActionButton>
                              
                              {/* Chỉ hiển thị nếu đăng nhập và milestone không khóa */}
                              {isLoggedIn && milestone.status !== 'locked' && (
                                <ActionButton onClick={() => handleGenerateAIExercises(milestone)}>
                                  <AutoAwesome />
                                  Tạo bài tập AI
                                </ActionButton>
                              )}
                            </MilestoneActions>
                          )}
                        </MilestoneCard>
                      </MilestoneItem>
                    ))}
                  </MilestoneTimeline>
                </>
              )}
            </RoadmapSection>
          )}

          {activeTab === 'calendar' && (
            <CalendarSection>
              <CalendarControls>
                <CalendarNav>
                  <NavButton onClick={handlePrevMonth}>
                    <NavigateBefore />
                  </NavButton>
                  <CurrentMonth>
                    Tháng {currentDate.getMonth() + 1}, {currentDate.getFullYear()}
                  </CurrentMonth>
                  <NavButton onClick={handleNextMonth}>
                    <NavigateNext />
                  </NavButton>
                  <NavButton onClick={handleToday}>
                    <Today />
                  </NavButton>
                </CalendarNav>

                <ViewToggle>
                  <ViewButton active={calendarView === 'month'} onClick={() => setCalendarView('month')}>
                    <ViewModule />
                    Tháng
                  </ViewButton>
                  <ViewButton active={calendarView === 'week'} onClick={() => setCalendarView('week')}>
                    <ViewWeek />
                    Tuần
                  </ViewButton>
                </ViewToggle>
              </CalendarControls>

              <CalendarGrid>
                <WeekdayHeader>
                  {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(day => (
                    <WeekdayLabel key={day}>{day}</WeekdayLabel>
                  ))}
                </WeekdayHeader>

                <DaysGrid>
                  {getCalendarDays().map((date, index) => {
                    const dayEvents = getEventsForDate(date);
                    return (
                      <DayCell
                        key={index}
                        today={isToday(date)}
                        hasEvent={dayEvents.length > 0}
                        otherMonth={!isSameMonth(date)}
                        onClick={() => handleDateClick(date)}
                      >
                        <DayNumber>{date.getDate()}</DayNumber>
                        {dayEvents.length > 0 && (
                          <EventDots>
                            {dayEvents.slice(0, 3).map(event => (
                              <EventDot key={event.id} today={isToday(date)} />
                            ))}
                          </EventDots>
                        )}
                      </DayCell>
                    );
                  })}
                </DaysGrid>

                {selectedDate && getEventsForDate(selectedDate).length > 0 && (
                  <EventsList>
                    <EventsTitle>
                      Sự kiện ngày {selectedDate.getDate()}/{selectedDate.getMonth() + 1}
                    </EventsTitle>
                    {getEventsForDate(selectedDate).map(event => (
                      <EventCard key={event.id} color={event.color}>
                        <EventHeader>
                          <EventTitle>{event.title}</EventTitle>
                          <EventTime>
                            <Schedule />
                            {event.time}
                          </EventTime>
                        </EventHeader>
                        {event.description && (
                          <EventDescription>{event.description}</EventDescription>
                        )}
                      </EventCard>
                    ))}
                  </EventsList>
                )}
              </CalendarGrid>

              <AddEventButton onClick={() => showToast('info', 'Thông báo', 'Tính năng đang phát triển')}>
                <Add />
              </AddEventButton>
            </CalendarSection>
          )}
        </ContentInner>
      </MainContent>
      <RightSidebar />

      <CreateRoadmapButton onClick={showCreateRoadmapDialog}>
        <Add />
        Tạo lộ trình mới
      </CreateRoadmapButton>
    </PageWrapper>
  );
};

export default PersonalizedRoadmap;