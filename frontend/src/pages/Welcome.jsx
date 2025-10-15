import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import logo from '../assets/logo.png';
// Import hình ảnh cấp độ
import cap0 from '../assets/cap0.png';
import cap1 from '../assets/cap1.png';
import cap2 from '../assets/cap2.png';
import cap3 from '../assets/cap3.png';
import cap4 from '../assets/cap4.png';

import speaking from '../assets/speaking.png';
import vocabulary from '../assets/vocabulary.png';
import habit from '../assets/habit.png';
import basics from '../assets/basics.png';
import placement from '../assets/placement.png';
// Import reason images nếu bạn có
import fun from '../assets/fun.png';
import study from '../assets/study.png';
import travel from '../assets/travel.png';
import career from '../assets/career.png';
import brain from '../assets/brain.png';
import orther from '../assets/other.png';

// ========== ANIMATIONS ==========
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
`;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

// ========== STYLED COMPONENTS ==========
const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #ffffff 0%, #f0f9ff 100%);
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
`;

const ProgressBar = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: #e5e7eb;
  z-index: 1000;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: #58CC02;
  width: ${props => props.progress}%;
  transition: width 0.5s ease;
  border-radius: 0 3px 3px 0;
`;

const BackButton = styled.button`
  position: fixed;
  top: 10px;
  left: 10px;
  background: none;
  border: none;
  color: #6b7280;
  font-size: 1rem;
  cursor: pointer;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  z-index: 999;

  &:hover {
    background: #f3f4f6;
    color: #1f2937;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    top: 12px;
    left: 12px;
    width: 40px;
    height: 40px;
    font-size: 1.25rem;
  }
`;

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 60px 1rem 90px;
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  animation: ${fadeIn} 0.6s ease;

  @media (max-width: 768px) {
    padding: 50px 1rem 90px;
    max-width: 100%;
  }
`;

const DuoCharacter = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${bounce} 2s ease-in-out infinite;

  @media (max-width: 768px) {
    width: 70px;
    height: 70px;
    margin-bottom: 0.75rem;
  }
`;

const DuoImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const SpeechBubble = styled.div`
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 14px;
  padding: 0.875rem 1.25rem;
  margin: 0 auto 1.5rem;
  max-width: 480px;
  width: 100%;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  animation: ${slideIn} 0.6s ease;

  &::before {
    content: '';
    position: absolute;
    bottom: 100%;
    left: 35px;
    border: 8px solid transparent;
    border-bottom-color: white;
    margin-bottom: -2px;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 100%;
    left: 35px;
    border: 10px solid transparent;
    border-bottom-color: #e5e7eb;
  }

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    margin-bottom: 1.25rem;
    
    &::before {
      left: 28px;
      border-width: 7px;
    }
    
    &::after {
      left: 28px;
      border-width: 9px;
    }
  }
`;

const BubbleText = styled.p`
  font-size: 1rem;
  color: #1f2937;
  font-weight: 600;
  margin: 0;
  line-height: 1.4;
  text-align: center;

  .highlight {
    color: #8b5cf6;
    font-weight: 700;
  }

  @media (max-width: 768px) {
    font-size: 0.9375rem;
  }
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  max-width: 560px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;

  @media (max-width: 768px) {
    gap: 0.625rem;
  }
`;

const ReasonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  max-width: 560px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 0.625rem;
  }
`;

const ReasonCard = styled.button`
  background: white;
  border: 2px solid ${props => props.selected ? '#58CC02' : '#e5e7eb'};
  border-radius: 12px;
  padding: 1rem 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  box-shadow: ${props => props.selected 
    ? '0 6px 20px rgba(88, 204, 2, 0.2)' 
    : '0 2px 8px rgba(0, 0, 0, 0.06)'
  };

  &:hover {
    border-color: #58CC02;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(88, 204, 2, 0.15);
  }

  @media (max-width: 768px) {
    padding: 0.875rem 0.625rem;
  }
`;

const ReasonImage = styled.img`
  width: 60px;
  height: 60px;
  margin: 0 auto 0.5rem;
  object-fit: contain;

  @media (max-width: 768px) {
    width: 52px;
    height: 52px;
  }
`;

const ReasonTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  line-height: 1.3;

  @media (max-width: 768px) {
    font-size: 0.8125rem;
  }
`;

const LevelCard = styled.button`
  background: ${props => props.selected ? '#e0f2fe' : 'white'};
  border: 2px solid ${props => props.selected ? '#1CB0F6' : '#e5e7eb'};
  border-radius: 12px;
  padding: 0.875rem 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  box-shadow: ${props => props.selected 
    ? '0 6px 20px rgba(28, 176, 246, 0.2)' 
    : '0 2px 8px rgba(0, 0, 0, 0.06)'
  };

  &:hover {
    border-color: #1CB0F6;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(28, 176, 246, 0.15);
  }

  @media (max-width: 768px) {
    padding: 0.75rem 0.875rem;
    gap: 0.75rem;
  }
`;

const LevelImageWrapper = styled.div`
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.selected ? 'rgba(28, 176, 246, 0.15)' : '#f3f4f6'};
  border-radius: 10px;
  transition: all 0.3s ease;

  ${LevelCard}:hover & {
    background: rgba(28, 176, 246, 0.2);
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    width: 52px;
    height: 52px;
  }
`;

const LevelImage = styled.img`
  width: 44px;
  height: 44px;
  object-fit: contain;

  @media (max-width: 768px) {
    width: 38px;
    height: 38px;
  }
`;
const LevelContent = styled.div`
    flex: 1;   
    `;

const LevelTitle = styled.h4`
  font-size: 0.9375rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  line-height: 1.3;

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const OverviewSection = styled.div`
  margin-bottom: 1.5rem;
  max-width: 560px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
`;

const AchievementCard = styled.div`
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 14px;
  padding: 1rem;
  margin-bottom: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  @media (max-width: 768px) {
    padding: 0.875rem;
    gap: 0.75rem;
  }
`;

const AchievementIconWrapper = styled.div`
  width: 54px;
  height: 54px;
  background: ${props => props.bgColor || 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)'};
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 48px;
    height: 48px;
  }
`;

const AchievementImage = styled.img`
  width: 34px;
  height: 34px;
  object-fit: contain;

  @media (max-width: 768px) {
    width: 30px;
    height: 30px;
  }
`;
const AchievementContent = styled.div`
  flex: 1;
`;
const AchievementTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.25rem 0;

  @media (max-width: 768px) {
    font-size: 0.9375rem;
  }
`;

const AchievementText = styled.p`
  font-size: 0.8125rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;

  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`;

const GoalCard = styled.button`
  background: ${props => props.selected ? '#e0f2fe' : 'white'};
  border: 2px solid ${props => props.selected ? '#1CB0F6' : '#e5e7eb'};
  border-radius: 12px;
  padding: 0.875rem 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: ${props => props.selected 
    ? '0 6px 20px rgba(28, 176, 246, 0.2)' 
    : '0 2px 8px rgba(0, 0, 0, 0.06)'
  };

  &:hover {
    border-color: #1CB0F6;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(28, 176, 246, 0.15);
  }

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
  }
`;

const GoalText = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;

  @media (max-width: 768px) {
    font-size: 0.9375rem;
  }
`;

const GoalBadge = styled.span`
  font-size: 0.75rem;
  font-weight: 700;
  color: ${props => {
    if (props.level === 'easy') return '#1CB0F6';
    if (props.level === 'medium') return '#58CC02';
    if (props.level === 'hard') return '#FF9600';
    if (props.level === 'veryhard') return '#ec4899';
    return '#6b7280';
  }};

  @media (max-width: 768px) {
    font-size: 0.6875rem;
  }
`;

const OptionCard = styled.button`
  background: white;
  border: 2px solid ${props => props.selected ? '#58CC02' : '#e5e7eb'};
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  box-shadow: ${props => props.selected 
    ? '0 6px 20px rgba(88, 204, 2, 0.2)' 
    : '0 2px 8px rgba(0, 0, 0, 0.06)'
  };

  &:hover {
    border-color: #58CC02;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(88, 204, 2, 0.15);
  }

  @media (max-width: 768px) {
    padding: 0.875rem;
    gap: 0.75rem;
  }
`;

const OptionImageWrapper = styled.div`
  width: 54px;
  height: 54px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 48px;
    height: 48px;
  }
    `;
const OptionImage = styled.img`
    width: 44px;
    height: 44px;
    object-fit: contain;
`;
const OptionContent = styled.div`
    flex: 1;
    `;

const OptionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.1875rem 0;

  @media (max-width: 768px) {
    font-size: 0.9375rem;
  }
`;

const OptionDescription = styled.p`
  font-size: 0.8125rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.3;

  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`;

const ButtonContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 1rem 1rem;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: center;
  z-index: 100;

  @media (max-width: 768px) {
    padding: 0.875rem 1rem;
  }
`;

const NextButton = styled.button`
  background: #58CC02;
  border: none;
  color: white;
  padding: 0.75rem 2.25rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(88, 204, 2, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 160px;

  &:hover:not(:disabled) {
    background: #45a302;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(88, 204, 2, 0.4);
  }

  &:disabled {
    background: #e5e7eb;
    color: #9ca3af;
    cursor: not-allowed;
    box-shadow: none;
  }

  @media (max-width: 768px) {
    padding: 0.6875rem 2rem;
    font-size: 0.9375rem;
    min-width: 140px;
  }
`;

// ========== COMPONENT ==========
const Welcome = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState({
    reason: '',
    proficiency: '',
    dailyGoal: '',
    path: ''
  });

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  // Image URLs
  const duoImage = logo;
  
  const reasonImages = {
    fun: fun,
    study: study,
    travel: travel,
    career: career,
    brain: brain,
    other: orther
  };

  const levelImages = {
    beginner: cap0,
    elementary: cap1,
    intermediate: cap2,
    advanced: cap3,
    expert: cap4
  };

  const achievementImages = {
    speaking: speaking,
    vocabulary: vocabulary,
    habit: habit
  };

  const pathImages = {
    basics: basics,
    placement: placement
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      localStorage.setItem('onboardingComplete', 'true');
      localStorage.setItem('userPreferences', JSON.stringify(selections));
      navigate('/lesson');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const canProceed = () => {
    switch(step) {
      case 1: return selections.reason !== '';
      case 2: return selections.proficiency !== '';
      case 3: return true;
      case 4: return selections.dailyGoal !== '';
      case 5: return selections.path !== '';
      default: return false;
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <>
            <DuoCharacter>
              <DuoImage src={duoImage} alt="Duo" />
            </DuoCharacter>
            <SpeechBubble>
              <BubbleText>Tại sao bạn học tiếng Anh?</BubbleText>
            </SpeechBubble>
            <ReasonGrid>
              <ReasonCard
                selected={selections.reason === 'fun'}
                onClick={() => setSelections({...selections, reason: 'fun'})}
              >
                <ReasonImage src={reasonImages.fun} alt="Giải trí" />
                <ReasonTitle>Giải trí</ReasonTitle>
              </ReasonCard>

              <ReasonCard
                selected={selections.reason === 'brain'}
                onClick={() => setSelections({...selections, reason: 'brain'})}
              >
                <ReasonImage src={reasonImages.brain} alt="Tận dụng thời gian rảnh" />
                <ReasonTitle>Tận dụng thời gian rảnh</ReasonTitle>
              </ReasonCard>

              <ReasonCard
                selected={selections.reason === 'study'}
                onClick={() => setSelections({...selections, reason: 'study'})}
              >
                <ReasonImage src={reasonImages.study} alt="Hỗ trợ việc học tập" />
                <ReasonTitle>Hỗ trợ việc học tập</ReasonTitle>
              </ReasonCard>

              <ReasonCard
                selected={selections.reason === 'travel'}
                onClick={() => setSelections({...selections, reason: 'travel'})}
              >
                <ReasonImage src={reasonImages.travel} alt="Chuẩn bị đi du lịch" />
                <ReasonTitle>Chuẩn bị đi du lịch</ReasonTitle>
              </ReasonCard>

              <ReasonCard
                selected={selections.reason === 'career'}
                onClick={() => setSelections({...selections, reason: 'career'})}
              >
                <ReasonImage src={reasonImages.career} alt="Phát triển sự nghiệp" />
                <ReasonTitle>Phát triển sự nghiệp</ReasonTitle>
              </ReasonCard>

              <ReasonCard
                selected={selections.reason === 'other'}
                onClick={() => setSelections({...selections, reason: 'other'})}
              >
                <ReasonImage src={reasonImages.other} alt="Khác" />
                <ReasonTitle>Khác</ReasonTitle>
              </ReasonCard>
            </ReasonGrid>
          </>
        );

      case 2:
        return (
          <>
            <DuoCharacter>
              <DuoImage src={duoImage} alt="Duo" />
            </DuoCharacter>
            <SpeechBubble>
              <BubbleText>Trình độ tiếng Anh của bạn ở mức nào?</BubbleText>
            </SpeechBubble>
            <OptionsContainer>
              <LevelCard
                selected={selections.proficiency === 'beginner'}
                onClick={() => setSelections({...selections, proficiency: 'beginner'})}
              >
                <LevelImageWrapper selected={selections.proficiency === 'beginner'}>
                  <LevelImage src={levelImages.beginner} alt="Beginner" />
                </LevelImageWrapper>
                <LevelContent>
                  <LevelTitle>Tôi mới học tiếng Anh</LevelTitle>
                </LevelContent>
              </LevelCard>

              <LevelCard
                selected={selections.proficiency === 'elementary'}
                onClick={() => setSelections({...selections, proficiency: 'elementary'})}
              >
                <LevelImageWrapper selected={selections.proficiency === 'elementary'}>
                  <LevelImage src={levelImages.elementary} alt="Elementary" />
                </LevelImageWrapper>
                <LevelContent>
                  <LevelTitle>Tôi biết một vài từ thông dụng</LevelTitle>
                </LevelContent>
              </LevelCard>

              <LevelCard
                selected={selections.proficiency === 'intermediate'}
                onClick={() => setSelections({...selections, proficiency: 'intermediate'})}
              >
                <LevelImageWrapper selected={selections.proficiency === 'intermediate'}>
                  <LevelImage src={levelImages.intermediate} alt="Intermediate" />
                </LevelImageWrapper>
                <LevelContent>
                  <LevelTitle>Tôi có thể giao tiếp cơ bản</LevelTitle>
                </LevelContent>
              </LevelCard>

              <LevelCard
                selected={selections.proficiency === 'advanced'}
                onClick={() => setSelections({...selections, proficiency: 'advanced'})}
              >
                <LevelImageWrapper selected={selections.proficiency === 'advanced'}>
                  <LevelImage src={levelImages.advanced} alt="Advanced" />
                </LevelImageWrapper>
                <LevelContent>
                  <LevelTitle>Tôi có thể nói về nhiều chủ đề</LevelTitle>
                </LevelContent>
              </LevelCard>

              <LevelCard
                selected={selections.proficiency === 'expert'}
                onClick={() => setSelections({...selections, proficiency: 'expert'})}
              >
                <LevelImageWrapper selected={selections.proficiency === 'expert'}>
                  <LevelImage src={levelImages.expert} alt="Expert" />
                </LevelImageWrapper>
                <LevelContent>
                  <LevelTitle>Tôi có thể đi sâu vào hầu hết các chủ đề</LevelTitle>
                </LevelContent>
              </LevelCard>
            </OptionsContainer>
          </>
        );

      case 3:
        return (
          <>
            <DuoCharacter>
              <DuoImage src={duoImage} alt="Duo" />
            </DuoCharacter>
            <SpeechBubble>
              <BubbleText>Và đây là những thành quả bạn sẽ có thể đạt được!</BubbleText>
            </SpeechBubble>
            <OverviewSection>
              <AchievementCard>
                <AchievementIconWrapper bgColor="linear-gradient(135deg, #e0d4f7 0%, #d4bfff 100%)">
                  <AchievementImage src={achievementImages.speaking} alt="Speaking" />
                </AchievementIconWrapper>
                <AchievementContent>
                  <AchievementTitle>Tự tin giao tiếp</AchievementTitle>
                  <AchievementText>Luyện nghe nói không áp lực</AchievementText>
                </AchievementContent>
              </AchievementCard>

              <AchievementCard>
                <AchievementIconWrapper bgColor="linear-gradient(135deg, #bae6fd 0%, #7dd3fc 100%)">
                  <AchievementImage src={achievementImages.vocabulary} alt="Vocabulary" />
                </AchievementIconWrapper>
                <AchievementContent>
                  <AchievementTitle>Kho từ vựng đa dạng</AchievementTitle>
                  <AchievementText>
                    Các từ và cụm từ phổ biến, thiết thực trong đời sống
                  </AchievementText>
                </AchievementContent>
              </AchievementCard>

              <AchievementCard>
                <AchievementIconWrapper bgColor="linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)">
                  <AchievementImage src={achievementImages.habit} alt="Habit" />
                </AchievementIconWrapper>
                <AchievementContent>
                  <AchievementTitle>Tạo thói quen học tập</AchievementTitle>
                  <AchievementText>
                    Nhắc nhở thông minh, thử thách vui nhộn và còn nhiều tính năng thú vị khác
                  </AchievementText>
                </AchievementContent>
              </AchievementCard>
            </OverviewSection>
          </>
        );

      case 4:
        return (
          <>
            <DuoCharacter>
              <DuoImage src={duoImage} alt="Duo" />
            </DuoCharacter>
            <SpeechBubble>
              <BubbleText>
                Mục tiêu học hằng ngày của bạn là gì?
              </BubbleText>
            </SpeechBubble>
            <OptionsContainer>
              <GoalCard
                selected={selections.dailyGoal === '5'}
                onClick={() => setSelections({...selections, dailyGoal: '5'})}
              >
                <GoalText>5 phút / ngày</GoalText>
                <GoalBadge level="easy">Dễ</GoalBadge>
              </GoalCard>

              <GoalCard
                selected={selections.dailyGoal === '10'}
                onClick={() => setSelections({...selections, dailyGoal: '10'})}
              >
                <GoalText>10 phút / ngày</GoalText>
                <GoalBadge level="medium">Vừa</GoalBadge>
              </GoalCard>

              <GoalCard
                selected={selections.dailyGoal === '15'}
                onClick={() => setSelections({...selections, dailyGoal: '15'})}
              >
                <GoalText>15 phút / ngày</GoalText>
                <GoalBadge level="hard">Khó</GoalBadge>
              </GoalCard>

              <GoalCard
                selected={selections.dailyGoal === '20'}
                onClick={() => setSelections({...selections, dailyGoal: '20'})}
              >
                <GoalText>20 phút / ngày</GoalText>
                <GoalBadge level="veryhard">Siêu khó</GoalBadge>
              </GoalCard>
            </OptionsContainer>
          </>
        );

      case 5:
        return (
          <>
            <DuoCharacter>
              <DuoImage src={duoImage} alt="Duo" />
            </DuoCharacter>
            <SpeechBubble>
              <BubbleText>Giờ mình cùng tìm điểm khởi hành phù hợp nhé!</BubbleText>
            </SpeechBubble>
            <OptionsContainer>
              <OptionCard
                selected={selections.path === 'basics'}
                onClick={() => setSelections({...selections, path: 'basics'})}
              >
                <OptionImageWrapper>
                  <OptionImage src={pathImages.basics} alt="Cơ bản" />
                </OptionImageWrapper>
                <OptionContent>
                  <OptionTitle>Bắt đầu từ cơ bản</OptionTitle>
                  <OptionDescription>
                    Học từ những bài dễ nhất trong khóa học Tiếng Anh
                  </OptionDescription>
                </OptionContent>
              </OptionCard>

              <OptionCard
                selected={selections.path === 'placement'}
                onClick={() => setSelections({...selections, path: 'placement'})}
              >
                <OptionImageWrapper>
                  <OptionImage src={pathImages.placement} alt="Đánh giá" />
                </OptionImageWrapper>
                <OptionContent>
                  <OptionTitle>Xác định trình độ hiện tại</OptionTitle>
                  <OptionDescription>
                    Hãy để Duo giúp bạn xác định điểm khởi đầu phù hợp nhé
                  </OptionDescription>
                </OptionContent>
              </OptionCard>
            </OptionsContainer>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <PageWrapper>
      <ProgressBar>
        <ProgressFill progress={progress} />
      </ProgressBar>

      <BackButton onClick={handleBack} disabled={step === 1}>
        ←
      </BackButton>

      <Container>
        {renderStep()}
      </Container>

      <ButtonContainer>
        <NextButton onClick={handleNext} disabled={!canProceed()}>
          {step === totalSteps ? 'Hoàn thành' : 'Tiếp tục'}
        </NextButton>
      </ButtonContainer>
    </PageWrapper>
  );
};

export default Welcome;