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
  Edit,
  Add,
  NavigateNext,
  NavigateBefore,
  Today,
  ViewWeek,
  ViewModule,
  Notifications,
  NotificationsActive,
  MoreVert
} from '@mui/icons-material';
import { useToast } from '../hooks/useToast';

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

// ========== COMPONENT ==========
const PersonalizedRoadmap = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('roadmap'); // roadmap, calendar
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('month'); // month, week
  const [selectedDate, setSelectedDate] = useState(null);

  // Mock roadmap data
  const [roadmapData, setRoadmapData] = useState({
    overallProgress: 65,
    completedMilestones: 8,
    totalMilestones: 15,
    currentStreak: 12,
    estimatedCompletion: '2 tháng nữa'
  });

  const [milestones, setMilestones] = useState([
    {
      id: 1,
      title: 'Hoàn thành Unit 1: Basics',
      description: 'Nắm vững các kiến thức cơ bản về ngữ pháp và từ vựng',
      progress: 100,
      status: 'completed',
      lessons: 10,
      completedLessons: 10,
      estimatedDays: 7,
      actualDays: 6
    },
    {
      id: 2,
      title: 'Đạt 100 điểm trong Practice Test',
      description: 'Hoàn thành bài kiểm tra với điểm số tối thiểu 100',
      progress: 85,
      status: 'current',
      lessons: 5,
      completedLessons: 4,
      estimatedDays: 3,
      actualDays: 2
    },
    {
      id: 3,
      title: 'Học thuộc 200 từ vựng mới',
      description: 'Mở rộng vốn từ vựng với các chủ đề thông dụng',
      progress: 45,
      status: 'current',
      lessons: 8,
      completedLessons: 3,
      estimatedDays: 14,
      actualDays: 6
    },
    {
      id: 4,
      title: 'Hoàn thành Unit 2: Intermediate',
      description: 'Nâng cao kỹ năng với các cấu trúc ngữ pháp phức tạp hơn',
      progress: 0,
      status: 'locked',
      lessons: 12,
      completedLessons: 0,
      estimatedDays: 10,
      actualDays: 0
    }
  ]);

  // Mock calendar events
  const [events, setEvents] = useState([
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
    },
    {
      id: 3,
      date: new Date(2024, 10, 18),
      title: 'Ôn tập từ vựng Unit 2',
      time: '18:00',
      color: '#3b82f6',
      type: 'review'
    }
  ]);

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
            <Tab
              active={activeTab === 'roadmap'}
              onClick={() => setActiveTab('roadmap')}
            >
              <Timeline />
              Lộ trình học tập
            </Tab>
            <Tab
              active={activeTab === 'calendar'}
              onClick={() => setActiveTab('calendar')}
            >
              <CalendarMonth />
              Lịch học
            </Tab>
          </TabsContainer>

          {activeTab === 'roadmap' && (
            <RoadmapSection>
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
                          <ActionButton
                            primary
                            onClick={() => navigate('/learn')}
                          >
                            <NavigateNext />
                            {milestone.status === 'completed' ? 'Xem lại' : 'Tiếp tục học'}
                          </ActionButton>
                          <ActionButton>
                            <Schedule />
                            {milestone.actualDays}/{milestone.estimatedDays} ngày
                          </ActionButton>
                        </MilestoneActions>
                      )}
                    </MilestoneCard>
                  </MilestoneItem>
                ))}
              </MilestoneTimeline>
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
                  <ViewButton
                    active={calendarView === 'month'}
                    onClick={() => setCalendarView('month')}
                  >
                    <ViewModule />
                    Tháng
                  </ViewButton>
                  <ViewButton
                    active={calendarView === 'week'}
                    onClick={() => setCalendarView('week')}
                  >
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
    </PageWrapper>
  );
};

export default PersonalizedRoadmap;