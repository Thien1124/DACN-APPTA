import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import StreakCounter from '../components/StreakCounter'; 

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

const WelcomeSection = styled.section`
  margin-bottom: 2rem;
  animation: fadeIn 0.6s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const WelcomeCard = styled.div`
  background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
  border-radius: 24px;
  padding: 2rem;
  color: white;
  box-shadow: 0 8px 24px rgba(88, 204, 2, 0.3);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -10%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    border-radius: 50%;
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const WelcomeContent = styled.div`
  position: relative;
  z-index: 1;
`;

const WelcomeTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 0.5rem;
  font-weight: bold;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const WelcomeText = styled.p`
  font-size: 1.125rem;
  opacity: 0.95;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const WelcomeEmoji = styled.span`
  font-size: 3rem;
  position: absolute;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
  animation: wave 2s ease-in-out infinite;

  @keyframes wave {
    0%, 100% {
      transform: translateY(-50%) rotate(0deg);
    }
    25% {
      transform: translateY(-50%) rotate(10deg);
    }
    75% {
      transform: translateY(-50%) rotate(-10deg);
    }
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const StatsGrid = styled.div`
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
`;

const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: ${props => props.color || '#58CC02'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 1rem;
  box-shadow: 0 4px 12px ${props => props.color || '#58CC02'}33;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-weight: 600;
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const LessonsSection = styled.section``;

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

const LessonPath = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  position: relative;
  padding-left: 2rem;

  &::before {
    content: '';
    position: absolute;
    left: 28px;
    top: 60px;
    bottom: 60px;
    width: 4px;
    background: ${props => props.theme === 'dark' 
      ? 'linear-gradient(180deg, #58CC02 0%, #374151 100%)'
      : 'linear-gradient(180deg, #58CC02 0%, #e5e7eb 100%)'
    };
    border-radius: 2px;
  }

  @media (max-width: 768px) {
    padding-left: 0;

    &::before {
      display: none;
    }
  }
`;

const LessonCard = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem;
  border: 2px solid ${props => {
    if (props.status === 'completed') return '#58CC02';
    if (props.status === 'current') return '#1CB0F6';
    return props.theme === 'dark' ? '#374151' : '#e5e7eb';
  }};
  position: relative;
  transition: all 0.3s ease;
  cursor: ${props => props.status === 'locked' ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.status === 'locked' ? '0.6' : '1'};

  &:hover {
    transform: ${props => props.status !== 'locked' ? 'translateX(10px)' : 'none'};
    box-shadow: ${props => props.status !== 'locked' ? '0 8px 24px rgba(0,0,0,0.15)' : 'none'};
  }
`;

const LessonIconWrapper = styled.div`
  position: absolute;
  left: -2rem;
  top: 50%;
  transform: translateY(-50%);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${props => {
    if (props.status === 'completed') return 'linear-gradient(135deg, #58CC02 0%, #45a302 100%)';
    if (props.status === 'current') return 'linear-gradient(135deg, #1CB0F6 0%, #0891b2 100%)';
    return props.theme === 'dark' ? '#374151' : '#e5e7eb';
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  border: 4px solid ${props => props.theme === 'dark' ? '#1a1a1a' : '#f8fafc'};

  @media (max-width: 768px) {
    position: static;
    transform: none;
    margin-bottom: 1rem;
  }
`;

const LessonContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const LessonInfo = styled.div`
  flex: 1;
`;

const LessonTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.5rem;
`;

const LessonDescription = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-bottom: 0.75rem;
`;

const LessonProgress = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 8px;
  background: ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${props => props.progress}%;
  background: linear-gradient(90deg, #58CC02 0%, #45a302 100%);
  transition: width 0.5s ease;
`;

const ProgressText = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const LessonButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: bold;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  ${props => {
    if (props.status === 'completed') {
      return `
        background: rgba(88, 204, 2, 0.1);
        color: #58CC02;
        border: 2px solid #58CC02;
        
        &:hover {
          background: rgba(88, 204, 2, 0.2);
        }
      `;
    }
    if (props.status === 'current') {
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
    return `
      background: ${props.theme === 'dark' ? '#374151' : '#e5e7eb'};
      color: ${props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
      cursor: not-allowed;
    `;
  }}

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SidebarCard = styled.div`
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
  animation-delay: 0.3s;
  animation-fill-mode: both;
`;

const SidebarTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  span:first-child {
    font-size: 1.5rem;
  }
`;


const DailyGoalCard = styled(SidebarCard)``;

const GoalProgress = styled.div`
  margin-top: 1rem;
`;

const GoalItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const GoalIcon = styled.span`
  font-size: 1.5rem;
`;

const GoalInfo = styled.div`
  flex: 1;
`;

const GoalTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#e5e7eb' : '#374151'};
  margin-bottom: 0.25rem;
`;

const GoalBar = styled.div`
  height: 6px;
  background: ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  border-radius: 3px;
  overflow: hidden;
`;

const GoalFill = styled.div`
  height: 100%;
  width: ${props => props.progress}%;
  background: ${props => props.color || '#58CC02'};
  transition: width 0.5s ease;
`;

const GoalValue = styled.span`
  font-size: 0.875rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const AchievementsCard = styled(SidebarCard)``;

const AchievementsList = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
`;

const AchievementBadge = styled.div`
  aspect-ratio: 1;
  border-radius: 12px;
  background: ${props => props.unlocked 
    ? `linear-gradient(135deg, ${props.color} 0%, ${props.color}dd 100%)`
    : props.theme === 'dark' ? '#374151' : '#e5e7eb'
  };
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: ${props => props.unlocked ? '1' : '0.4'};

  &:hover {
    transform: ${props => props.unlocked ? 'scale(1.1)' : 'none'};
  }
`;

const QuickActionsCard = styled(SidebarCard)``;

const ActionButton = styled.button`
  width: 100%;
  padding: 1rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  border: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e5e7eb' : '#374151'};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    border-color: #58CC02;
    background: ${props => props.theme === 'dark' ? '#374151' : '#f0f9ff'};
    transform: translateY(-2px);
  }

  span:first-child {
    font-size: 1.25rem;
  }
`;
// ========== COMPONENT ==========

const Dashboard = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(true); 

  // Mock user data
  const user = {
    name: 'Vinh Son',
    streak: 7,
    xp: 2850,
    level: 12,
    lessonsCompleted: 28,
    wordsLearned: 456,
  };

  // Mock lessons data
  const lessons = [
    {
      id: 1,
      title: 'Unit 1: Greetings',
      description: 'Learn basic greetings and introductions',
      progress: 100,
      status: 'completed',
      icon: '👋',
    },
    {
      id: 2,
      title: 'Unit 2: Family',
      description: 'Talk about your family members',
      progress: 100,
      status: 'completed',
      icon: '👨‍👩‍👧‍👦',
    },
    {
      id: 3,
      title: 'Unit 3: Numbers',
      description: 'Count from 1 to 100 and beyond',
      progress: 65,
      status: 'current',
      icon: '🔢',
    },
    {
      id: 4,
      title: 'Unit 4: Colors',
      description: 'Describe colors and objects',
      progress: 0,
      status: 'locked',
      icon: '🎨',
    },
    {
      id: 5,
      title: 'Unit 5: Food & Drinks',
      description: 'Order food at a restaurant',
      progress: 0,
      status: 'locked',
      icon: '🍔',
    },
  ];

  // Mock achievements
  const achievements = [
    { icon: '🏆', color: '#FFD700', unlocked: true },
    { icon: '⭐', color: '#58CC02', unlocked: true },
    { icon: '🎯', color: '#1CB0F6', unlocked: true },
    { icon: '🔥', color: '#FF9600', unlocked: true },
    { icon: '💎', color: '#8B5CF6', unlocked: false },
    { icon: '👑', color: '#F59E0B', unlocked: false },
  ];
   useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLessonClick = (lesson) => {
    if (lesson.status !== 'locked') {
      navigate(`/lesson/${lesson.id}`);
    }
  };
  if (loading) {
    return (
      <LoadingSpinner 
        fullScreen 
        size="large" 
        text="Đang tải Dashboard..." 
        showLogo 
        theme={theme}
      />
    );
  }
  return (
    <PageWrapper theme={theme}>
      {/* Header */}
      <Header
        theme={theme}
        onThemeToggle={toggleTheme}
        userName={user.name}
        notificationCount={3}
        showNotification={true}
        showAvatar={true}
      />

      <DashboardContainer>
        {/* Welcome Section */}
        <WelcomeSection>
          <WelcomeCard>
            <WelcomeContent>
              <WelcomeTitle>Chào mừng trở lại, {user.name}! 🎉</WelcomeTitle>
              <WelcomeText>
                Bạn đã học {user.lessonsCompleted} bài và đạt {user.xp} XP. Hãy tiếp tục phát huy nhé!
              </WelcomeText>
            </WelcomeContent>
            <WelcomeEmoji>📚</WelcomeEmoji>
          </WelcomeCard>
        </WelcomeSection>

        {/* Stats Grid */}
        <StatsGrid>
          <StatCard theme={theme} delay="0.1s">
            <StatIcon color="rgba(88, 204, 2, 0.2)">🎯</StatIcon>
            <StatValue theme={theme}>{user.xp}</StatValue>
            <StatLabel theme={theme}>Tổng XP</StatLabel>
          </StatCard>
          <StatCard theme={theme} delay="0.2s">
            <StatIcon color="rgba(28, 176, 246, 0.2)">📊</StatIcon>
            <StatValue theme={theme}>Level {user.level}</StatValue>
            <StatLabel theme={theme}>Cấp độ</StatLabel>
          </StatCard>
          <StatCard theme={theme} delay="0.3s">
            <StatIcon color="rgba(255, 150, 0, 0.2)">🔥</StatIcon>
            <StatValue theme={theme}>{user.streak}</StatValue>
            <StatLabel theme={theme}>Ngày liên tiếp</StatLabel>
          </StatCard>
          <StatCard theme={theme} delay="0.4s">
            <StatIcon color="rgba(139, 92, 246, 0.2)">📚</StatIcon>
            <StatValue theme={theme}>{user.wordsLearned}</StatValue>
            <StatLabel theme={theme}>Từ vựng</StatLabel>
          </StatCard>
        </StatsGrid>

        {/* Main Content */}
        <MainContent>
          {/* Lessons Section */}
          <LessonsSection>
            <SectionTitle theme={theme}>
              <span>📖</span>
              Hành trình học tập
            </SectionTitle>
            <LessonPath theme={theme}>
              {lessons.map((lesson, index) => (
                <LessonCard
                  key={lesson.id}
                  theme={theme}
                  status={lesson.status}
                  onClick={() => handleLessonClick(lesson)}
                >
                  <LessonIconWrapper theme={theme} status={lesson.status}>
                    {lesson.icon}
                  </LessonIconWrapper>
                  <LessonContent>
                    <LessonInfo>
                      <LessonTitle theme={theme}>{lesson.title}</LessonTitle>
                      <LessonDescription theme={theme}>
                        {lesson.description}
                      </LessonDescription>
                      {lesson.status !== 'locked' && (
                        <LessonProgress>
                          <ProgressBar theme={theme}>
                            <ProgressFill progress={lesson.progress} />
                          </ProgressBar>
                          <ProgressText theme={theme}>
                            {lesson.progress}%
                          </ProgressText>
                        </LessonProgress>
                      )}
                    </LessonInfo>
                    <LessonButton theme={theme} status={lesson.status}>
                      {lesson.status === 'completed' && '✓ Hoàn thành'}
                      {lesson.status === 'current' && 'Tiếp tục'}
                      {lesson.status === 'locked' && '🔒 Khóa'}
                    </LessonButton>
                  </LessonContent>
                </LessonCard>
              ))}
            </LessonPath>
          </LessonsSection>

          {/* Sidebar */}
          <Sidebar>
            
            {/* Streak Card */}
            <StreakCounter
              streak={user.streak}
              theme={theme}
              showDays={true}
              showMilestone={true}
              showMotivation={true}
              iconSize="4rem"
              numberSize="3.5rem"
              textSize="1.125rem"
            />

            {/* Daily Goals */}
            <DailyGoalCard theme={theme}>
              <SidebarTitle theme={theme}>
                <span>🎯</span>
                Mục tiêu hàng ngày
              </SidebarTitle>
              <GoalProgress>
                <GoalItem>
                  <GoalIcon>📖</GoalIcon>
                  <GoalInfo>
                    <GoalTitle theme={theme}>Hoàn thành 3 bài học</GoalTitle>
                    <GoalBar theme={theme}>
                      <GoalFill progress={66} color="#58CC02" />
                    </GoalBar>
                  </GoalInfo>
                  <GoalValue theme={theme}>2/3</GoalValue>
                </GoalItem>
                <GoalItem>
                  <GoalIcon>💪</GoalIcon>
                  <GoalInfo>
                    <GoalTitle theme={theme}>Đạt 50 XP</GoalTitle>
                    <GoalBar theme={theme}>
                      <GoalFill progress={80} color="#1CB0F6" />
                    </GoalBar>
                  </GoalInfo>
                  <GoalValue theme={theme}>40/50</GoalValue>
                </GoalItem>
                <GoalItem>
                  <GoalIcon>🗣️</GoalIcon>
                  <GoalInfo>
                    <GoalTitle theme={theme}>Luyện phát âm 10 phút</GoalTitle>
                    <GoalBar theme={theme}>
                      <GoalFill progress={50} color="#FF9600" />
                    </GoalBar>
                  </GoalInfo>
                  <GoalValue theme={theme}>5/10</GoalValue>
                </GoalItem>
              </GoalProgress>
            </DailyGoalCard>

            {/* Achievements */}
            <AchievementsCard theme={theme}>
              <SidebarTitle theme={theme}>
                <span>🏆</span>
                Thành tích
              </SidebarTitle>
              <AchievementsList>
                {achievements.map((achievement, index) => (
                  <AchievementBadge
                    key={index}
                    theme={theme}
                    unlocked={achievement.unlocked}
                    color={achievement.color}
                  >
                    {achievement.icon}
                  </AchievementBadge>
                ))}
              </AchievementsList>
            </AchievementsCard>

            {/* Quick Actions */}
            <QuickActionsCard theme={theme}>
              <SidebarTitle theme={theme}>
                <span>⚡</span>
                Hành động nhanh
              </SidebarTitle>
              <ActionButton theme={theme} onClick={() => navigate('/practice')}>
                <span>💪</span>
                Luyện tập ngay
              </ActionButton>
              <ActionButton theme={theme} onClick={() => navigate('/progress')}>
                <span>📈</span>
                Xem tiến độ
              </ActionButton>
              <ActionButton theme={theme} onClick={() => navigate('/profile')}>
                <span>⚙️</span>
                Cài đặt
              </ActionButton>
            </QuickActionsCard>
          </Sidebar>
        </MainContent>
      </DashboardContainer>
    </PageWrapper>
  );
};

export default Dashboard;