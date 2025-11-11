import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import LinhThuTini from '../assets/LinhThuTini.gif'; // ← THAY ĐỔI TỪ chibiImg
import US from '../assets/US.png';

import { BiLock } from 'react-icons/bi';
import { AiFillStar } from 'react-icons/ai';

import { 
  Star, Lock, LocalLibrary, LocalBar, Chat, Restaurant, 
  FitnessCenter, EmojiEvents, MenuBook,
  Whatshot, Diamond, Favorite, WorkspacePremium // New Material Icons
} from '@mui/icons-material';

// Import services
import { xpService } from '../services/xpService';
import { streakService } from '../services/streakService';
import { heartService } from '../services/heartService';
import { shopService } from '../services/shopService'; // ← THÊM DÒNG NÀY
import courseService from '../services/courseService';
import { lessonService } from '../services/lessonService';
import progressService from '../services/progressService';

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

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

// ========== STYLED COMPONENTS ==========
const PageWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(180deg, #f7f9fc 0%, #ffffff 100%);
  position: relative;
`;

// Loading overlay
const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
`;

const LoadingSpinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid #e5e7eb;
  border-top-color: #58CC02;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  position: absolute;
  margin-top: 100px;
  font-size: 1rem;
  font-weight: 600;
  color: #6b7280;
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
  display: none;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
  overflow: visible;
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
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: ${props => {
      if (props.type === 'streak') return '#FF9600';
      if (props.type === 'gems') return '#1CB0F6';
      if (props.type === 'hearts') return '#FF4B4B';
      return '#58CC02';
    }};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${props => {
      if (props.type === 'streak') return 'rgba(255, 150, 0, 0.2)';
      if (props.type === 'gems') return 'rgba(28, 176, 246, 0.2)';
      if (props.type === 'hearts') return 'rgba(255, 75, 75, 0.2)';
      return 'rgba(88, 204, 2, 0.2)';
    }};
  }

  ${props => props.isLoading && `
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.5) 50%,
        transparent 100%
      );
      animation: ${shimmer} 2s infinite;
      background-size: 200% 100%;
    }
  `}
`;

const StatIcon = styled.div`
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => {
    if (props.type === 'streak') return '#FF9600';
    if (props.type === 'gems') return '#1CB0F6';
    if (props.type === 'hearts') return '#FF4B4B';
    return 'inherit';
  }};
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
  min-width: 30px;
  text-align: left;
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
  width: 100px;
  height: 100px;
  max-width: none;
  object-fit: contain;
  position: absolute;
  top: 50%;
  transform: translateY(-60%);
  z-index: 5;
  pointer-events: none;
  display: block;

  /* Nếu side === 'left' đặt hình ở bên trái nút, ngược lại đặt bên phải */
  ${props => props.side === 'left' ? `
    right: calc(100% + 12px);
    left: auto;
  ` : `
    left: calc(100% + 12px);
    right: auto;
  `}

  @media (max-width: 1024px) {
    width: 120px;
    height: 120px;
  }

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
const calculateLevel = (xp) => {
  // Each level requires 100 XP
  // Level 1: 0-99 XP
  // Level 2: 100-199 XP
  // etc.
  return Math.floor(xp / 100) + 1;
};
// ========== COMPONENT ==========
const Learn = () => {
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    streak: 0,
    totalXP: 0,
    level: 1,
    hearts: 5,
    gems: 0,
    flag: US
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState({
    streak: false,
    xp: false,
    hearts: false,
    gems: false
  });
  const [unitsData, setUnitsData] = useState([]);
  const [userProgress, setUserProgress] = useState({
    completedLessons: [],
    currentLesson: null
  });

// ========== FETCH UNITS FROM API ==========
useEffect(() => {
  const loadCoursesAndLessons = async () => {
    try {
      setIsLoading(true);

      // ✅ 1. Lấy tất cả courses published (không cần enroll)
      const coursesResponse = await courseService.getPublishedCourses();
      const courses = coursesResponse.data || [];

      if (courses.length === 0) {
        console.warn('No published courses found');
        setUnitsData([]);
        return;
      }

      // 2. Lấy user progress (nếu có login)
      let progress = { completedLessons: [], currentLesson: null };
      try {
        const progressResponse = await progressService.getUserProgress();
        progress = progressResponse.data || progress;
      } catch (error) {
        console.warn('User not logged in or no progress data:', error);
        // Không có progress thì tất cả lessons đều unlock để xem
      }
      setUserProgress(progress);

      // 3. Lấy units và lessons cho mỗi course
      const allUnits = [];

      for (const course of courses) {
        const unitsResponse = await courseService.getUnits(course._id);
        const units = unitsResponse.data || [];

        for (const unit of units) {
          if (!unit.isPublished) continue;

          const lessonsResponse = await lessonService.getLessonsByUnit(unit._id);
          const lessons = lessonsResponse.data || [];

          // 🆕 THÊM: Tự động xác định currentLessonId dựa trên tiến độ
          let currentLessonId = progress.currentLesson;
          if (!currentLessonId) {
            // Nếu backend không cung cấp currentLesson, tìm lesson đầu tiên chưa hoàn thành
            const sortedLessons = lessons.sort((a, b) => a.order - b.order);
            for (const lesson of sortedLessons) {
              if (!progress.completedLessons.includes(lesson._id)) {
                currentLessonId = lesson._id;
                break;
              }
            }
            // Nếu tất cả đã hoàn thành, không set current (hoặc set lesson cuối cùng nếu cần)
          }

          const transformedUnit = {
            id: unit._id,
            unitNumber: unit.order,
            title: unit.title,
            color: unit.order === 1 ? '#58CC02' : '#CE82FF',
            shadowColor: unit.order === 1 ? '#46A302' : '#A855F7',
            lessons: lessons
              .filter(l => l.isPublished)
              .sort((a, b) => a.order - b.order)
              .map((lesson, index) => {
                let frontendType = 'lesson';
                if (lesson.type === 'vocabulary') frontendType = 'lesson';
                else if (lesson.type === 'grammar' || lesson.type === 'reading') frontendType = 'practice';
                else if (lesson.type === 'listening') frontendType = 'story';
                else if (lesson.type === 'mixed') frontendType = 'trophy';

                const isCompleted = progress.completedLessons.includes(lesson._id);
                // 🆕 SỬA: current chỉ dựa trên currentLessonId tự xác định
                const isCurrent = lesson._id === currentLessonId;
                
                // ✅ Logic lock chính xác:
                let isLocked = false;
                if (index === 0) {
                  // Lesson đầu tiên luôn unlock
                  isLocked = false;
                } else {
                  // Các lesson sau chỉ unlock nếu lesson trước đã completed
                  const previousLesson = lessons[index - 1];
                  const isPreviousCompleted = progress.completedLessons.includes(previousLesson._id);
                  isLocked = !isPreviousCompleted && !isCurrent;
                }

                return {
                  id: lesson._id,
                  type: frontendType,
                  icon: getLessonIconByType(frontendType),
                  label: lesson.title,
                  completed: isCompleted,
                  current: isCurrent,  // 🆕 Đã sửa, loại bỏ phần || cũ
                  locked: isLocked,
                  stars: isCompleted ? 3 : 0,
                  progress: isCompleted ? '5/5' : isCurrent ? '2/5' : '0/5'
                };
              })
          };

          allUnits.push(transformedUnit);
        }
      }

      setUnitsData(allUnits);
    } catch (error) {
      console.error('Error loading courses and lessons:', error);
      setUnitsData([]);
    } finally {
      setIsLoading(false);
    }
  };

  loadCoursesAndLessons();
}, []);


  // Helper function map icon theo type
  const getLessonIconByType = (type) => {
    const iconMap = {
      'lesson': <LocalLibrary sx={{ fontSize: 24 }} />,
      'vocabulary': <LocalLibrary sx={{ fontSize: 24 }} />,
      'grammar': <Star sx={{ fontSize: 24 }} />,
      'practice': <FitnessCenter sx={{ fontSize: 24 }} />,
      'conversation': <Chat sx={{ fontSize: 24 }} />,
      'story': <MenuBook sx={{ fontSize: 24 }} />,
      'food': <Restaurant sx={{ fontSize: 24 }} />,
      'trophy': <EmojiEvents sx={{ fontSize: 24 }} />,
      'review': <EmojiEvents sx={{ fontSize: 24 }} />
    };
    return iconMap[type] || <LocalLibrary sx={{ fontSize: 24 }} />;
  };

  // ========== LOAD STATS FROM BACKEND ==========
  useEffect(() => {
    const loadStats = async () => {
      try {
        const [xpData, streakData, heartsData, gemsData] = await Promise.all([
          xpService.getXP().catch(() => ({ totalXP: 0 })),
          streakService.getStreak().catch(() => ({ currentStreak: 0 })),
          heartService.refillHearts().catch(() => ({ hearts: 5 })),
          shopService.getGems().catch(() => ({ gems: 0 }))
        ]);

        const totalXP = xpData.totalXP || 0;
        const level = calculateLevel(totalXP);

        setStats({
          totalXP,
          level,
          streak: streakData.currentStreak || 0,
          hearts: heartsData.hearts || 5,
          gems: gemsData.gems || 0,
          flag: US
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };

    loadStats();
    const interval = setInterval(loadStats, 60000);
    return () => clearInterval(interval);
  }, []);

  // ========== REFRESH INDIVIDUAL STAT ==========
  const refreshStat = async (type) => {
    setIsLoadingStats(prev => ({ ...prev, [type]: true }));
    
    try {
      switch (type) {
        case 'xp':
          const xpData = await xpService.getXP();
          const totalXP = xpData.totalXP || 0;
          setStats(prev => ({ ...prev, totalXP, level: calculateLevel(totalXP) }));
          break;
        case 'streak':
          const streakData = await streakService.getStreak();
          setStats(prev => ({ ...prev, streak: streakData.currentStreak || 0 }));
          break;
        case 'hearts':
          const heartsData = await heartService.refillHearts();
          setStats(prev => ({ ...prev, hearts: heartsData.hearts || 5 }));
          break;
        case 'gems':
          const gemsData = await shopService.getGems();
          setStats(prev => ({ ...prev, gems: gemsData.gems || 0 }));
          break;
      }
    } catch (error) {
      console.error(`Error refreshing ${type}:`, error);
    } finally {
      setIsLoadingStats(prev => ({ ...prev, [type]: false }));
    }
  };

  // ========== EVENT HANDLERS ==========
  const handleLessonClick = (lesson, unitId) => {
    if (lesson.locked) return;
    
    if (lesson.type === 'lesson' || lesson.type === 'practice') {
      navigate(`/lesson/${lesson.id}`); // Sửa: chỉ cần lessonId
    } else if (lesson.type === 'story') {
      navigate(`/story/${lesson.id}`);
    } else if (lesson.type === 'trophy') {
      navigate(`/unit-review/${unitId}`);
    }
  };

  const handleGuideClick = (unitId) => {
    navigate(`/guidebook/${unitId}/1`);
  };

  const getLessonIcon = (lesson) => {
    if (lesson.completed) return <AiFillStar size={24} color="#FFD700" />;
    if (lesson.current) return lesson.icon;
    if (lesson.locked) return <BiLock size={24} color="#9ca3af" />;
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

  // ========== RENDER ==========
  if (isLoading) {
    return (
      <PageWrapper>
        <LoadingOverlay>
          <div style={{ textAlign: 'center' }}>
            <LoadingSpinner />
            <LoadingText>Đang tải dữ liệu...</LoadingText>
          </div>
        </LoadingOverlay>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <LeftSidebar />

      <MainContent>
        <Header>
          <StatsBar>
            {/* Level Stat */}
            <StatItem 
              type="level"
              onClick={() => navigate('/profile')}
              title="Cấp độ của bạn"
              style={{ cursor: 'pointer' }}
            >
              <StatIcon type="level" style={{ color: '#FFD700' }}>
                <FlagImage src={stats.flag} alt="US Flag" />
              </StatIcon>
              <StatValue>{stats.level}</StatValue>
            </StatItem>

            {/* Streak Stat */}
            <StatItem 
              type="streak"
              isLoading={isLoadingStats.streak}
              onClick={() => refreshStat('streak')}
              title="Click để làm mới"
              style={{ cursor: 'pointer' }}
            >
              <StatIcon type="streak">
                <Whatshot sx={{ fontSize: 24 }} />
              </StatIcon>
              <StatValue>{stats.streak}</StatValue>
            </StatItem>

            {/* Gems Stat */}
            <StatItem 
              type="gems"
              isLoading={isLoadingStats.gems}
              onClick={() => refreshStat('gems')}
              title="Click để làm mới"
              style={{ cursor: 'pointer' }}
            >
              <StatIcon type="gems">
                <Diamond sx={{ fontSize: 24 }} />
              </StatIcon>
              <StatValue>{stats.gems}</StatValue>
            </StatItem>

            {/* Hearts Stat */}
            <StatItem 
              type="hearts"
              isLoading={isLoadingStats.hearts}
              onClick={() => refreshStat('hearts')}
              title="Click để làm mới"
              style={{ cursor: 'pointer' }}
            >
              <StatIcon type="hearts">
                <Favorite sx={{ fontSize: 24 }} />
              </StatIcon>
              <StatValue>{stats.hearts}</StatValue>
            </StatItem>
          </StatsBar>
        </Header>

        {/* Hiển thị message nếu không có units */}
        {unitsData.length === 0 ? (
          <IntroText style={{ marginTop: '3rem', fontSize: '1.125rem' }}>
            Chưa có khóa học nào. Vui lòng liên hệ admin để được thêm khóa học.
          </IntroText>
        ) : (
          <>
            {unitsData.map((unit, unitIndex) => (
              <UnitSection key={unit.id}>
                <UnitHeader color={unit.color} shadowColor={unit.shadowColor}>
                  <UnitInfo>
                    <UnitTitle>Phần {unit.unitNumber}, Cửa 1-10</UnitTitle>
                    <UnitDescription>{unit.title}</UnitDescription>
                  </UnitInfo>
                  <GuideButton onClick={() => handleGuideClick(unit.id)}>
                    📋 Hướng dẫn
                  </GuideButton>
                </UnitHeader>

                {unitIndex === 0 && (
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
                  
                  {unit.lessons.map((lesson, lessonIndex) => {
                    const side = lessonIndex % 2 === 0 ? 'left' : 'right';
                    return (
                      <LessonNode key={lesson.id} index={lessonIndex}>
                        {lesson.current && (
                          <CharacterImage src={LinhThuTini} alt="LinhThuTini" side={side} />
                        )}

                        {renderLessonButton(lesson, unit.id)}

                        <LessonLabel locked={lesson.locked}>
                          {lesson.label}
                        </LessonLabel>

                        {lesson.progress && !lesson.locked && (
                          <LessonProgress>{lesson.progress}</LessonProgress>
                        )}
                      </LessonNode>
                    );
                  })}
                </PathContainer>

                {unitIndex === 0 && unitsData.length > 1 && (
                  <SectionDivider>Giới thiệu góc gác</SectionDivider>
                )}
              </UnitSection>
            ))}

            {unitsData.length > 0 && (
              <LevelUpBanner>
                <LevelUpText>🎉 Hoàn thành Phần 1 để mở khóa Phần 2!</LevelUpText>
                <LevelUpSubtext>Tiếp tục học để khám phá thêm nhiều nội dung thú vị</LevelUpSubtext>
              </LevelUpBanner>
            )}
          </>
        )}
      </MainContent>

      <RightSidebar
        lessonsToUnlock={8}
        dailyGoal={{
          current: stats.totalXP % 50,
          target: 50,
          label: 'Kiếm 50 XP'
        }}
        streak={stats.streak}
        showProfile={true}
      />
    </PageWrapper>
  );
};

export default Learn;