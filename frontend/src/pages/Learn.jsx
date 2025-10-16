import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import chibiImg from '../assets/chibi.png';
import US from '../assets/US.png';

// ========== ANIMATIONS ==========
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

// ========== STYLED COMPONENTS ==========
const PageWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(180deg, #f7f9fc 0%, #ffffff 100%);
`;

const MainContent = styled.div`
  flex: 1;
  margin-left: 280px;
  margin-right: 380px;
  padding: 2rem;
  max-width: 1200px;
  animation: ${fadeIn} 0.6s ease;

  @media (max-width: 1400px) {
    margin-right: 320px;
  }

  @media (max-width: 1200px) {
    margin-right: 0;
  }

  @media (max-width: 1024px) {
    margin-left: 240px;
  }

  @media (max-width: 768px) {
    margin-left: 0;
    padding: 1rem;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const UnitHeader = styled.div`
  background: ${props => props.color || '#58CC02'};
  color: white;
  padding: 1.5rem 2rem;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 0 ${props => props.shadowColor || '#46A302'};
  margin-bottom: 2rem;
  animation: ${fadeIn} 0.6s ease;

  @media (max-width: 768px) {
    padding: 1.25rem 1.5rem;
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
`;

const UnitInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const UnitTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 700;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const UnitDescription = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const GuideButton = styled.button`
  background: rgba(255, 255, 255, 0.25);
  border: 2px solid white;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  text-transform: uppercase;

  &:hover {
    background: rgba(255, 255, 255, 0.35);
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const LessonPath = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0rem;
  padding: 2rem 0;
  position: relative;
`;

const LessonNode = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  position: absolute;
  z-index: 2;
  
  ${props => {
    const spacing = 140;
    const amplitude = 60;
    const x = props.index % 2 === 0 ? -amplitude : amplitude;
    const y = props.index * spacing + 35;
    return `
      top: ${y}px;
      left: 50%;
      transform: translate(calc(-50% + ${x}px), -50%);
    `;
  }}

  @media (max-width: 768px) {
    ${props => {
      const spacing = 140;
      const y = props.index * spacing + 35;
      return `
        top: ${y}px;
        left: 50%;
        transform: translate(-50%, -50%);
      `;
    }}
  }
`;

const LessonButton = styled.button`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: none;
  background: ${props => {
    if (props.completed) return 'linear-gradient(180deg, #FFD700 0%, #FFA500 100%)';
    if (props.current) return 'linear-gradient(180deg, #58CC02 0%, #46A302 100%)';
    if (props.locked) return 'linear-gradient(180deg, #e5e7eb 0%, #d1d5db 100%)';
    return 'linear-gradient(180deg, #e5e7eb 0%, #d1d5db 100%)';
  }};
  box-shadow: ${props => {
    if (props.completed) return '0 5px 0 #CC8800';
    if (props.current) return '0 5px 0 #46A302';
    return '0 5px 0 #9ca3af';
  }};
  cursor: ${props => props.locked ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  position: relative;
  animation: ${props => props.current ? pulse : 'none'} 2s ease infinite;

  &:hover:not(:disabled) {
    transform: translateY(-4px);
    box-shadow: ${props => {
      if (props.completed) return '0 9px 0 #CC8800';
      if (props.current) return '0 9px 0 #46A302';
      return '0 9px 0 #9ca3af';
    }};
  }

  &:active:not(:disabled) {
    transform: translateY(2px);
    box-shadow: ${props => {
      if (props.completed) return '0 2px 0 #CC8800';
      if (props.current) return '0 2px 0 #46A302';
      return '0 2px 0 #9ca3af';
    }};
  }

  ${props => props.locked && `
    opacity: 0.6;
    filter: grayscale(100%);
  `}

  @media (max-width: 768px) {
    width: 65px;
    height: 65px;
    font-size: 1.5rem;
  }
`;

const LessonLabel = styled.div`
  font-size: 0.8125rem;
  font-weight: 700;
  color: ${props => props.locked ? '#9ca3af' : '#1f2937'};
  text-align: center;
  max-width: 140px;
  line-height: 1.3;

  @media (max-width: 768px) {
    font-size: 0.75rem;
    max-width: 120px;
  }
`;

const LessonProgress = styled.div`
  font-size: 0.6875rem;
  color: #6b7280;
  text-align: center;
  font-weight: 600;
`;

const StarBadge = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  background: #FFD700;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  border: 2.5px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  animation: ${bounce} 2s ease infinite;

  @media (max-width: 768px) {
    width: 24px;
    height: 24px;
    font-size: 0.75rem;
    top: -6px;
    right: -6px;
  }
`;

const PathSVG = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
`;

const PathContainer = styled.div`
  position: relative;
  width: 100%;
  min-height: ${props => props.lessonCount * 140 + 100}px;
`;

const StatsBar = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: white;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  font-weight: 700;
  color: #1f2937;
  transition: all 0.3s ease;

  &:hover {
    border-color: #58CC02;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(88, 204, 2, 0.2);
  }
`;

const StatIcon = styled.div`
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FlagImage = styled.img`
  width: 28px;
  height: 28px;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid #e5e7eb;
`;

const StatValue = styled.span`
  font-size: 1.125rem;
`;

const SectionDivider = styled.div`
  text-align: center;
  padding: 2rem 0;
  color: #9ca3af;
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 40%;
    height: 2px;
    background: linear-gradient(to right, transparent, #e5e7eb, transparent);
  }

  &::before {
    left: 0;
  }

  &::after {
    right: 0;
  }
`;

const CharacterImage = styled.img`
  width: 110px;
  height: 110px;
  object-fit: contain;
  position: absolute;
  left: -160px;
  top: 50%;
  transform: translateY(-50%);
  animation: ${bounce} 3s ease infinite;

  @media (max-width: 768px) {
    display: none;
  }
`;

const TrophyButton = styled(LessonButton)`
  background: linear-gradient(180deg, #FFD700 0%, #FFA500 100%) !important;
  box-shadow: 0 6px 0 #CC8800 !important;
  
  &:hover {
    box-shadow: 0 10px 0 #CC8800 !important;
  }
`;

const StoryButton = styled(LessonButton)`
  background: linear-gradient(180deg, #CE82FF 0%, #A855F7 100%) !important;
  box-shadow: 0 6px 0 #7C3AED !important;
  
  &:hover {
    box-shadow: 0 10px 0 #7C3AED !important;
  }
`;

const PracticeButton = styled(LessonButton)`
  background: linear-gradient(180deg, #1CB0F6 0%, #0D9ED8 100%) !important;
  box-shadow: 0 6px 0 #0B7BA8 !important;
  border-radius: 16px !important;
  
  &:hover {
    box-shadow: 0 10px 0 #0B7BA8 !important;
  }
`;

const UnitSection = styled.div`
  margin-bottom: 4rem;
`;

const IntroText = styled.div`
  text-align: center;
  max-width: 400px;
  margin: 0 auto 2rem;
  color: #6b7280;
  font-size: 0.9375rem;
  line-height: 1.6;
`;

const LevelUpBanner = styled.div`
  background: linear-gradient(135deg, #CE82FF 0%, #A855F7 100%);
  color: white;
  padding: 2rem;
  border-radius: 16px;
  text-align: center;
  margin: 2rem 0;
  box-shadow: 0 4px 0 #7C3AED;
  animation: ${fadeIn} 0.6s ease;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 0 #7C3AED;
  }
`;

const LevelUpText = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const LevelUpSubtext = styled.div`
  font-size: 0.9375rem;
  opacity: 0.9;
`;

// ========== MOCK DATA ==========
const unitsData = [
  {
    id: 1,
    unitNumber: 1,
    title: 'Nói về thử cúng của bạn',
    color: '#58CC02',
    shadowColor: '#46A302',
    lessons: [
      { id: 1, type: 'lesson', icon: '📖', label: 'Mời khách xơi nước', completed: true, stars: 3, progress: '5/5' },
      { id: 2, type: 'lesson', icon: '⭐', label: 'Đồ uống', completed: false, current: true, stars: 0, progress: '0/5' },
      { id: 3, type: 'practice', icon: '💪', label: 'Luyện tập', locked: true },
      { id: 4, type: 'lesson', icon: '💬', label: 'Hội thoại', locked: true },
      { id: 5, type: 'story', icon: '📚', label: 'Câu chuyện', locked: true },
      { id: 6, type: 'lesson', icon: '🍕', label: 'Đồ ăn', locked: true },
      { id: 7, type: 'lesson', icon: '👋', label: 'Chào hỏi', locked: true },
      { id: 8, type: 'practice', icon: '💪', label: 'Luyện tập 2', locked: true },
      { id: 9, type: 'trophy', icon: '🏆', label: 'Kiểm tra cửa 1', locked: true },
      { id: 10, type: 'lesson', icon: '📖', label: 'Review', locked: true },
    ]
  },
  {
    id: 2,
    unitNumber: 2,
    title: 'Học từ, cụm từ và chủ điểm ngữ pháp để giao tiếp cơ bản',
    color: '#CE82FF',
    shadowColor: '#A855F7',
    lessons: [
      { id: 11, type: 'lesson', icon: '🔒', label: 'Bài học tiếp theo', locked: true },
    ]
  }
];

// ========== COMPONENT ==========
const Learn = () => {
  const navigate = useNavigate();
  const [stats] = useState({
    streak: 1,
    gems: 505,
    hearts: 4,
    flag: US,
    flagCount: 5
  });

  const handleLessonClick = (lesson, unitId) => {
    if (lesson.locked) return;
    
    if (lesson.type === 'lesson' || lesson.type === 'practice') {
      navigate(`/lesson/${unitId}-${lesson.id}`);
    } else if (lesson.type === 'story') {
      navigate(`/story/${unitId}-${lesson.id}`);
    } else if (lesson.type === 'trophy') {
      navigate(`/unit-review/${unitId}`);
    }
  };

  const getLessonIcon = (lesson) => {
    if (lesson.completed) return '⭐';
    if (lesson.current) return lesson.icon;
    if (lesson.locked) return '🔒';
    return lesson.icon;
  };

  const renderLessonButton = (lesson, unitId) => {
    if (lesson.type === 'trophy') {
      return (
        <TrophyButton
          locked={lesson.locked}
          onClick={() => handleLessonClick(lesson, unitId)}
          disabled={lesson.locked}
        >
          {getLessonIcon(lesson)}
        </TrophyButton>
      );
    }

    if (lesson.type === 'story') {
      return (
        <StoryButton
          locked={lesson.locked}
          onClick={() => handleLessonClick(lesson, unitId)}
          disabled={lesson.locked}
        >
          {getLessonIcon(lesson)}
        </StoryButton>
      );
    }

    if (lesson.type === 'practice') {
      return (
        <PracticeButton
          locked={lesson.locked}
          completed={lesson.completed}
          onClick={() => handleLessonClick(lesson, unitId)}
          disabled={lesson.locked}
        >
          {getLessonIcon(lesson)}
        </PracticeButton>
      );
    }

    return (
      <LessonButton
        completed={lesson.completed}
        current={lesson.current}
        locked={lesson.locked}
        onClick={() => handleLessonClick(lesson, unitId)}
        disabled={lesson.locked}
      >
        {getLessonIcon(lesson)}
        {lesson.completed && lesson.stars > 0 && (
          <StarBadge>⭐</StarBadge>
        )}
      </LessonButton>
    );
  };

  // Function to generate curved path - FIXED
  const generateCurvedPath = (lessonsCount) => {
    const spacing = 140;
    const amplitude = 60;
    let pathD = `M 50% 35`;

    for (let i = 1; i < lessonsCount; i++) {
      const y = i * spacing + 35;
      const x = i % 2 === 0 ? `calc(50% - ${amplitude}px)` : `calc(50% + ${amplitude}px)`;
      const controlY = (i - 0.5) * spacing + 35;
      
      pathD += ` Q 50% ${controlY}, ${x} ${y}`;
    }

    return pathD;
  };

  return (
    <PageWrapper>
      {/* Left Sidebar - Using Component */}
      <LeftSidebar />

      {/* Main Content */}
      <MainContent>
        <Header>
          <StatsBar>
            <StatItem>
              <StatIcon>
                <FlagImage src={stats.flag} alt="US Flag" />
              </StatIcon>
              <StatValue>{stats.flagCount}</StatValue>
            </StatItem>
            <StatItem>
              <StatIcon>🔥</StatIcon>
              <StatValue>{stats.streak}</StatValue>
            </StatItem>
            <StatItem>
              <StatIcon>💎</StatIcon>
              <StatValue>{stats.gems}</StatValue>
            </StatItem>
            <StatItem>
              <StatIcon>❤️</StatIcon>
              <StatValue>{stats.hearts}</StatValue>
            </StatItem>
          </StatsBar>
        </Header>

        {unitsData.map((unit, unitIndex) => (
          <UnitSection key={unit.id}>
            <UnitHeader color={unit.color} shadowColor={unit.shadowColor}>
              <UnitInfo>
                <UnitTitle>Phần {unit.unitNumber}, Cửa {unitIndex === 0 ? '1-10' : '11-20'}</UnitTitle>
                <UnitDescription>{unit.title}</UnitDescription>
              </UnitInfo>
              <GuideButton>
                📋 Hướng dẫn
              </GuideButton>
            </UnitHeader>

            {unitIndex === 0 && unit.id === 1 && (
              <IntroText>
                Hãy bắt đầu với những từ và cụm từ đơn giản!
              </IntroText>
            )}

            <PathContainer lessonCount={unit.lessons.length}>
              {/* SVG Curved Path */}
              <PathSVG viewBox="0 0 100% 100%" preserveAspectRatio="none">
                <defs>
                  <linearGradient id={`gradient-${unit.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: unitIndex === 0 ? '#58CC02' : '#e5e7eb', stopOpacity: 1 }} />
                    <stop offset="40%" style={{ stopColor: unitIndex === 0 ? '#58CC02' : '#e5e7eb', stopOpacity: 0.6 }} />
                    <stop offset="100%" style={{ stopColor: '#e5e7eb', stopOpacity: 0.3 }} />
                  </linearGradient>
                </defs>
                <path
                  d={(() => {
                    const spacing = 140;
                    const amplitude = 60;
                    const containerWidth = 100;
                    const center = 50;
                    
                    let pathD = `M ${center} 35`;
                    
                    for (let i = 1; i < unit.lessons.length; i++) {
                      const y = i * spacing + 35;
                      const xOffset = i % 2 === 0 ? -amplitude/10 : amplitude/10;
                      const x = center + xOffset;
                      const controlY = (i - 0.5) * spacing + 35;
                      
                      pathD += ` Q ${center} ${controlY}, ${x} ${y}`;
                    }
                    
                    return pathD;
                  })()}
                  stroke={`url(#gradient-${unit.id})`}
                  strokeWidth="5"
                  fill="none"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              </PathSVG>
              
              {unit.lessons.map((lesson, lessonIndex) => (
                <LessonNode key={lesson.id} index={lessonIndex}>
                  {lessonIndex === 0 && unitIndex === 0 && (
                    <CharacterImage src={chibiImg} alt="Character" />
                  )}
                  
                  {renderLessonButton(lesson, unit.id)}
                  
                  <LessonLabel locked={lesson.locked}>
                    {lesson.label}
                  </LessonLabel>
                  
                  {lesson.progress && !lesson.locked && (
                    <LessonProgress>{lesson.progress}</LessonProgress>
                  )}
                </LessonNode>
              ))}
            </PathContainer>

            {unitIndex === 0 && (
              <SectionDivider>Giới thiệu góc gác</SectionDivider>
            )}
          </UnitSection>
        ))}

        <LevelUpBanner>
          <LevelUpText>🎉 Hoàn thành Phần 1 để mở khóa Phần 2!</LevelUpText>
          <LevelUpSubtext>Tiếp tục học để khám phá thêm nhiều nội dung thú vị</LevelUpSubtext>
        </LevelUpBanner>
      </MainContent>

      {/* Right Sidebar - Using Component */}
      <RightSidebar
        lessonsToUnlock={8}
        dailyGoal={{
          current: 10,
          target: 10,
          label: 'Kiếm 10 KN'
        }}
        streak={stats.streak}
        showProfile={true}
      />
    </PageWrapper>
  );
};

export default Learn;