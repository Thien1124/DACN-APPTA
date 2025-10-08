import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import StreakCounter from '../components/StreakCounter';
import ProgressCircle from '../components/ProgressCircle'; 

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
      ? 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 70%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 70%), radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 70%)'
      : 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 70%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.05) 0%, transparent 70%), radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.05) 0%, transparent 70%)'
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
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: bold;
  color: #58CC02;
  cursor: pointer;

  span:first-child {
    font-size: 2rem;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ThemeToggle = styled.button`
  background: ${props => props.theme === 'dark' ? '#374151' : '#f3f4f6'};
  border: none;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: rotate(20deg) scale(1.1);
    background: ${props => props.theme === 'dark' ? '#4B5563' : '#e5e7eb'};
  }
`;

const BackButton = styled.button`
  background: ${props => props.theme === 'dark' ? '#374151' : '#f3f4f6'};
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#e5e7eb' : '#374151'};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${props => props.theme === 'dark' ? '#4B5563' : '#e5e7eb'};
    transform: translateY(-2px);
  }
`;

const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  span:first-child {
    font-size: 3rem;
  }

  @media (max-width: 768px) {
    font-size: 2rem;
    
    span:first-child {
      font-size: 2.5rem;
    }
  }
`;

const PageSubtitle = styled.p`
  font-size: 1.125rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-bottom: 2rem;
`;

const TimeFilter = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  border: 2px solid ${props => {
    if (props.active) return '#58CC02';
    return props.theme === 'dark' ? '#374151' : '#e5e7eb';
  }};
  background: ${props => {
    if (props.active) return 'rgba(88, 204, 2, 0.1)';
    return props.theme === 'dark' ? '#1f2937' : '#ffffff';
  }};
  color: ${props => {
    if (props.active) return '#58CC02';
    return props.theme === 'dark' ? '#e5e7eb' : '#374151';
  }};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #58CC02;
    transform: translateY(-2px);
  }
`;

const StatsOverview = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
  transition: all 0.3s ease;
  animation: slideUp 0.6s ease;
  animation-delay: ${props => props.delay || '0s'};
  animation-fill-mode: both;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    height: 100px;
    background: ${props => props.color || '#58CC02'};
    opacity: 0.05;
    border-radius: 50%;
    transform: translate(30%, -30%);
  }
`;

const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: ${props => props.color || '#58CC02'}22;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const StatChange = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.positive ? '#10b981' : '#ef4444'};
  display: flex;
  align-items: center;
  gap: 0.25rem;

  span:first-child {
    font-size: 1rem;
  }
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 2rem;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
  animation: slideUp 0.6s ease;
  animation-delay: 0.3s;
  animation-fill-mode: both;
`;

const ChartTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  span:first-child {
    font-size: 1.75rem;
  }
`;

const WeeklyChart = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 300px;
  gap: 0.5rem;
  padding: 1rem 0;

  @media (max-width: 768px) {
    height: 200px;
  }
`;

const Bar = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

const BarColumn = styled.div`
  width: 100%;
  background: ${props => {
    if (props.isToday) return 'linear-gradient(180deg, #58CC02 0%, #45a302 100%)';
    return props.theme === 'dark' 
      ? 'linear-gradient(180deg, #374151 0%, #1f2937 100%)'
      : 'linear-gradient(180deg, #cbd5e0 0%, #94a3b8 100%)';
  }};
  border-radius: 8px 8px 0 0;
  height: ${props => props.height}%;
  min-height: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;

  &:hover {
    transform: scaleY(1.05);
    opacity: 0.8;
  }

  &::after {
    content: '${props => props.value}';
    position: absolute;
    top: -1.5rem;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.75rem;
    font-weight: bold;
    color: ${props => props.theme === 'dark' ? '#e5e7eb' : '#374151'};
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::after {
    opacity: 1;
  }
`;

const BarLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${props => {
    if (props.isToday) return '#58CC02';
    return props.theme === 'dark' ? '#9ca3af' : '#6b7280';
  }};
`;

const CircularProgress = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
`;

const CircleContainer = styled.div`
  position: relative;
  width: 200px;
  height: 200px;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    width: 150px;
    height: 150px;
  }
`;

const CircleSVG = styled.svg`
  transform: rotate(-90deg);
`;

const CircleBackground = styled.circle`
  fill: none;
  stroke: ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  stroke-width: 12;
`;

const CircleForeground = styled.circle`
  fill: none;
  stroke: url(#gradient);
  stroke-width: 12;
  stroke-linecap: round;
  stroke-dasharray: ${props => 2 * Math.PI * 90};
  stroke-dashoffset: ${props => 2 * Math.PI * 90 * (1 - props.progress / 100)};
  transition: stroke-dashoffset 1s ease;
`;

const CircleText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
`;

const CircleValue = styled.div`
  font-size: 3rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const CircleLabel = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-weight: 600;
`;

const ProgressDetail = styled.div`
  width: 100%;
  padding: 1rem;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#f9fafb'};
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
`;

const DetailItem = styled.div`
  text-align: center;
`;

const DetailValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.color || (props.theme === 'dark' ? '#f9fafb' : '#1a1a1a')};
`;

const DetailLabel = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-top: 0.25rem;
`;

const SkillsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SkillCard = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
  animation: slideUp 0.6s ease;
  animation-delay: ${props => props.delay || '0s'};
  animation-fill-mode: both;
`;

const SkillHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const SkillName = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 1.125rem;

  span:first-child {
    font-size: 1.5rem;
  }
`;

const SkillLevel = styled.div`
  font-size: 0.875rem;
  font-weight: bold;
  color: ${props => props.color || '#58CC02'};
  background: ${props => props.color || '#58CC02'}22;
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
`;

const SkillProgressBar = styled.div`
  height: 8px;
  background: ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
`;

const SkillProgressFill = styled.div`
  height: 100%;
  width: ${props => props.progress}%;
  background: ${props => props.color || '#58CC02'};
  border-radius: 4px;
  transition: width 1s ease;
`;

const SkillStats = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const AchievementsSection = styled.section`
  margin-top: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  span:first-child {
    font-size: 2rem;
  }
`;

const AchievementsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
`;

const AchievementCard = styled.div`
  background: ${props => {
    if (!props.unlocked) {
      return props.theme === 'dark' ? 'rgba(31, 41, 55, 0.5)' : 'rgba(255, 255, 255, 0.5)';
    }
    return props.theme === 'dark' 
      ? 'rgba(31, 41, 55, 0.8)' 
      : 'rgba(255, 255, 255, 0.9)';
  }};
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem;
  border: 2px solid ${props => {
    if (props.unlocked) return props.color || '#58CC02';
    return props.theme === 'dark' ? '#374151' : '#e5e7eb';
  }};
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: ${props => props.unlocked ? '1' : '0.5'};
  position: relative;

  &:hover {
    transform: ${props => props.unlocked ? 'translateY(-5px) scale(1.05)' : 'none'};
    box-shadow: ${props => props.unlocked ? '0 8px 20px rgba(0,0,0,0.15)' : 'none'};
  }
`;

const AchievementIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 0.75rem;
  filter: ${props => props.unlocked ? 'none' : 'grayscale(100%)'};

  @media (max-width: 768px) {
    font-size: 3rem;
  }
`;

const AchievementName = styled.div`
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
`;

const AchievementDesc = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  line-height: 1.4;
`;

const LockedOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  background: rgba(0,0,0,0.3);
  border-radius: 20px;
`;

// ========== COMPONENT ==========

const Progress = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');
  const [timeFilter, setTimeFilter] = useState('week');

  const weeklyData = [
    { day: 'T2', value: 45, isToday: false },
    { day: 'T3', value: 60, isToday: false },
    { day: 'T4', value: 30, isToday: false },
    { day: 'T5', value: 75, isToday: false },
    { day: 'T6', value: 50, isToday: false },
    { day: 'T7', value: 85, isToday: false },
    { day: 'CN', value: 40, isToday: true },
  ];

  const skills = [
    { name: 'Vocabulary', icon: '📚', progress: 75, level: 'B2', color: '#58CC02', words: '1,234 / 2,000' },
    { name: 'Grammar', icon: '📝', progress: 60, level: 'B1', color: '#8b5cf6', lessons: '24 / 40' },
    { name: 'Listening', icon: '🎧', progress: 85, level: 'C1', color: '#06b6d4', hours: '45h' },
    { name: 'Speaking', icon: '🎤', progress: 50, level: 'A2', color: '#f59e0b', sessions: '67' },
  ];

  const achievements = [
    { icon: '🏆', name: 'First Steps', desc: 'Hoàn thành bài đầu tiên', unlocked: true, color: '#FFD700' },
    { icon: '🔥', name: '7 Day Streak', desc: 'Học 7 ngày liên tiếp', unlocked: true, color: '#FF6B00' },
    { icon: '⭐', name: 'Star Student', desc: 'Đạt 1000 XP', unlocked: true, color: '#58CC02' },
    { icon: '🎯', name: 'Perfect Score', desc: 'Đạt 100% bài kiểm tra', unlocked: true, color: '#1CB0F6' },
    { icon: '📚', name: 'Bookworm', desc: 'Học 100 từ vựng', unlocked: true, color: '#8b5cf6' },
    { icon: '💎', name: 'Diamond League', desc: 'Top 3 trong tuần', unlocked: false, color: '#3b82f6' },
    { icon: '👑', name: 'Master', desc: 'Hoàn thành toàn bộ khóa học', unlocked: false, color: '#f59e0b' },
    { icon: '🚀', name: 'Speed Demon', desc: 'Hoàn thành 20 bài trong 1 ngày', unlocked: false, color: '#ef4444' },
  ];

  const maxValue = Math.max(...weeklyData.map(d => d.value));

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <PageWrapper theme={theme}>
      {/* Header */}
      <Header theme={theme}>
        <HeaderContent>
          <Logo onClick={() => navigate('/dashboard')}>
            <span>🦉</span>
            <span>EnglishMaster</span>
          </Logo>
          <HeaderActions>
            <ThemeToggle theme={theme} onClick={toggleTheme}>
              {theme === 'light' ? '🌙' : '☀️'}
            </ThemeToggle>
            <BackButton theme={theme} onClick={() => navigate('/dashboard')}>
              <span>←</span>
              Quay lại
            </BackButton>
          </HeaderActions>
        </HeaderContent>
      </Header>

      <DashboardContainer>
        {/* Page Header */}
        <PageTitle theme={theme}>
          <span>📈</span>
          Tiến độ học tập
        </PageTitle>
        <PageSubtitle theme={theme}>
          Theo dõi sự tiến bộ và thành tích của bạn
        </PageSubtitle>
        
        {/* Time Filter */}
        <TimeFilter>
          <FilterButton 
            theme={theme} 
            active={timeFilter === 'week'}
            onClick={() => setTimeFilter('week')}
          >
            Tuần này
          </FilterButton>
          <FilterButton 
            theme={theme} 
            active={timeFilter === 'month'}
            onClick={() => setTimeFilter('month')}
          >
            Tháng này
          </FilterButton>
          <FilterButton 
            theme={theme} 
            active={timeFilter === 'year'}
            onClick={() => setTimeFilter('year')}
          >
            Năm nay
          </FilterButton>
          <FilterButton 
            theme={theme} 
            active={timeFilter === 'all'}
            onClick={() => setTimeFilter('all')}
          >
            Tất cả
          </FilterButton>
        </TimeFilter>

        {/* Stats Overview */}
        <StatsOverview>
          <StatCard theme={theme} color="#58CC02" delay="0.1s">
            <StatIcon color="#58CC02">🎯</StatIcon>
            <StatValue theme={theme}>2,850</StatValue>
            <StatLabel theme={theme}>Tổng XP</StatLabel>
            <StatChange positive={true}>
              <span>↑</span> +285 tuần này
            </StatChange>
          </StatCard>

          <StatCard theme={theme} color="#1CB0F6" delay="0.2s">
            <StatIcon color="#1CB0F6">📊</StatIcon>
            <StatValue theme={theme}>Level 12</StatValue>
            <StatLabel theme={theme}>Cấp độ</StatLabel>
            <StatChange positive={true}>
              <span>↑</span> +2 level
            </StatChange>
          </StatCard>

          <StatCard theme={theme} color="#FF9600" delay="0.3s">
            <StatIcon color="#FF9600">🔥</StatIcon>
            <StatValue theme={theme}>7 ngày</StatValue>
            <StatLabel theme={theme}>Streak hiện tại</StatLabel>
            <StatChange positive={true}>
              <span>↑</span> Tốt nhất: 15
            </StatChange>
          </StatCard>

          <StatCard theme={theme} color="#8b5cf6" delay="0.4s">
            <StatIcon color="#8b5cf6">⏱️</StatIcon>
            <StatValue theme={theme}>12.5h</StatValue>
            <StatLabel theme={theme}>Thời gian học</StatLabel>
            <StatChange positive={true}>
              <span>↑</span> +3.2h tuần này
            </StatChange>
          </StatCard>
        </StatsOverview>

        {/* Charts */}
        <ChartsGrid>
          {/* Weekly Activity Chart */}
          <ChartCard theme={theme}>
            <ChartTitle theme={theme}>
              <span>📊</span>
              Hoạt động trong tuần
            </ChartTitle>
            <WeeklyChart>
              {weeklyData.map((data, index) => (
                <Bar key={index}>
                  <BarColumn
                    theme={theme}
                    height={(data.value / maxValue) * 100}
                    value={data.value}
                    isToday={data.isToday}
                  />
                  <BarLabel theme={theme} isToday={data.isToday}>
                    {data.day}
                  </BarLabel>
                </Bar>
              ))}
            </WeeklyChart>
          </ChartCard>

          {/* Daily Goal Progress */}
          <ChartCard theme={theme}>
            <ChartTitle theme={theme}>
              <span>🎯</span>
              Mục tiêu hôm nay
            </ChartTitle>
            <CircularProgress>
              <CircleContainer>
                <CircleSVG width="200" height="200">
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#58CC02" />
                      <stop offset="100%" stopColor="#45a302" />
                    </linearGradient>
                  </defs>
                  <CircleBackground theme={theme} cx="100" cy="100" r="90" />
                  <CircleForeground progress={75} cx="100" cy="100" r="90" />
                </CircleSVG>
                <CircleText>
                  <CircleValue theme={theme}>75%</CircleValue>
                  <CircleLabel theme={theme}>Hoàn thành</CircleLabel>
                </CircleText>
              </CircleContainer>
              <ProgressDetail theme={theme}>
                <DetailItem>
                  <DetailValue theme={theme} color="#58CC02">3/4</DetailValue>
                  <DetailLabel theme={theme}>Bài học</DetailLabel>
                </DetailItem>
                <DetailItem>
                  <DetailValue theme={theme} color="#1CB0F6">38/50</DetailValue>
                  <DetailLabel theme={theme}>XP</DetailLabel>
                </DetailItem>
              </ProgressDetail>
            </CircularProgress>
          </ChartCard>
        </ChartsGrid>

        {/* Skills Progress */}
        <ChartCard theme={theme}>
          <ChartTitle theme={theme}>
            <span>💪</span>
            Kỹ năng
          </ChartTitle>
          <SkillsGrid>
            {skills.map((skill, index) => (
              <SkillCard key={index} theme={theme} delay={`${0.1 * index}s`}>
                <SkillHeader>
                  <SkillName theme={theme}>
                    <span>{skill.icon}</span>
                    {skill.name}
                  </SkillName>
                  <SkillLevel color={skill.color}>
                    {skill.level}
                  </SkillLevel>
                </SkillHeader>
                <SkillProgressBar theme={theme}>
                  <SkillProgressFill progress={skill.progress} color={skill.color} />
                </SkillProgressBar>
                <SkillStats theme={theme}>
                  <span>{skill.progress}% hoàn thành</span>
                  <span>{skill.words || skill.lessons || skill.hours || skill.sessions}</span>
                </SkillStats>
              </SkillCard>
            ))}
          </SkillsGrid>
        </ChartCard>

        {/* Achievements */}
        <AchievementsSection>
          <SectionTitle theme={theme}>
            <span>🏆</span>
            Thành tích
          </SectionTitle>
          <AchievementsGrid>
            {achievements.map((achievement, index) => (
              <AchievementCard
                key={index}
                theme={theme}
                unlocked={achievement.unlocked}
                color={achievement.color}
              >
                <AchievementIcon unlocked={achievement.unlocked}>
                  {achievement.icon}
                </AchievementIcon>
                <AchievementName theme={theme}>
                  {achievement.name}
                </AchievementName>
                <AchievementDesc theme={theme}>
                  {achievement.desc}
                </AchievementDesc>
                {!achievement.unlocked && (
                  <LockedOverlay>🔒</LockedOverlay>
                )}
              </AchievementCard>
            ))}
          </AchievementsGrid>
        </AchievementsSection>
      </DashboardContainer>
    </PageWrapper>
  );
};

export default Progress;