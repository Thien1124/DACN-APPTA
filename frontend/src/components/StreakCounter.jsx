import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
// Import icons
import { GiFire, GiAchievement } from 'react-icons/gi';
import { FaCrown, FaStar, FaBullseye, FaTrophy, FaGem } from 'react-icons/fa';

// ========== ANIMATIONS ==========

const flameFlicker = keyframes`
  0%, 100% {
    transform: scale(1) translateY(0);
  }
  50% {
    transform: scale(1.1) translateY(-5px);
  }
`;

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(255, 150, 0, 0.5);
  }
  50% {
    box-shadow: 0 0 40px rgba(255, 150, 0, 0.8);
  }
`;

const countUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// ========== STYLED COMPONENTS ==========

const Container = styled.div`
  background: ${props => props.theme === 'dark'
    ? 'linear-gradient(135deg, #FF9600 0%, #FF6B00 100%)'
    : 'linear-gradient(135deg, #FF9600 0%, #FF6B00 100%)'
  };
  border-radius: 24px;
  padding: 2rem;
  text-align: center;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(255, 150, 0, 0.3);
  animation: ${glow} 2s ease-in-out infinite;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    animation: rotate 10s linear infinite;
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const FlameIcon = styled.div`
  font-size: ${props => props.size || '5rem'};
  animation: ${flameFlicker} 1.5s ease-in-out infinite;
  margin-bottom: 1rem;
  filter: drop-shadow(0 0 10px rgba(255, 150, 0, 0.8));
  position: relative;
  z-index: 1;
`;

const StreakNumber = styled.div`
  font-size: ${props => props.size || '4rem'};
  font-weight: bold;
  margin: 1rem 0;
  text-shadow: 0 4px 8px rgba(0,0,0,0.3);
  animation: ${countUp} 0.8s ease;
  position: relative;
  z-index: 1;
`;

const StreakText = styled.p`
  font-size: ${props => props.size || '1.25rem'};
  opacity: 0.95;
  margin: 0;
  font-weight: 600;
  position: relative;
  z-index: 1;
`;

const StreakDays = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
`;

const DayCircle = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.active 
    ? 'rgba(255, 255, 255, 0.3)' 
    : 'rgba(0, 0, 0, 0.2)'
  };
  border: 2px solid ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.3)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: bold;
  transition: all 0.3s ease;
  cursor: ${props => props.active ? 'pointer' : 'default'};

  &:hover {
    transform: ${props => props.active ? 'scale(1.1)' : 'none'};
  }
`;

const Milestone = styled.div`
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;
`;

const MotivationText = styled.div`
  margin-top: 1rem;
  font-size: 1rem;
  font-style: italic;
  opacity: 0.9;
  position: relative;
  z-index: 1;
`;

// Thêm styled component mới cho icon wrapper
const IconWrapper = styled.span`
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 0 10px rgba(255, 150, 0, 0.8));
`;

// ========== COMPONENT ==========

const StreakCounter = ({
  streak = 0,
  theme = 'light',
  showDays = true,
  showMilestone = true,
  showMotivation = true,
  iconSize = '5rem',
  numberSize = '4rem',
  textSize = '1.25rem',
  maxDaysDisplay = 7,
}) => {
  const [animatedStreak, setAnimatedStreak] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const increment = streak / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= streak) {
        setAnimatedStreak(streak);
        clearInterval(timer);
      } else {
        setAnimatedStreak(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [streak]);

  const getMilestone = () => {
    if (streak >= 365) return (
      <>
        <IconWrapper><FaCrown size={24} /></IconWrapper>
        {' Một năm liên tiếp! Tuyệt vời!'}
      </>
    );
    if (streak >= 100) return (
      <>
        <IconWrapper><FaGem size={24} /></IconWrapper>
        {' 100 ngày! Bạn là huyền thoại!'}
      </>
    );
    if (streak >= 30) return (
      <>
        <IconWrapper><FaStar size={24} /></IconWrapper>
        {' 30 ngày! Xuất sắc!'}
      </>
    );
    if (streak >= 7) return (
      <>
        <IconWrapper><FaBullseye size={24} /></IconWrapper>
        {' 1 tuần! Tiếp tục phát huy!'}
      </>
    );
    return (
      <>
        <IconWrapper><GiFire size={24} /></IconWrapper>
        {' Giữ vững phong độ!'}
      </>
    );
  };

  const getMotivation = () => {
    if (streak === 0) return 'Bắt đầu chuỗi ngày học hôm nay!';
    if (streak < 3) return 'Tuyệt vời! Hãy tiếp tục!';
    if (streak < 7) return 'Bạn đang làm rất tốt!';
    if (streak < 30) return 'Không gì có thể cản bước bạn!';
    return 'Bạn là nguồn cảm hứng!';
  };

  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const currentDay = new Date().getDay();
  
  return (
    <Container theme={theme}>
      <FlameIcon size={iconSize}>
        <IconWrapper>
          <GiFire size={parseInt(iconSize)} />
        </IconWrapper>
      </FlameIcon>
      <StreakNumber size={numberSize}>{animatedStreak}</StreakNumber>
      <StreakText size={textSize}>Ngày học liên tiếp!</StreakText>

      {showDays && streak > 0 && (
        <StreakDays>
          {days.map((day, index) => (
            <DayCircle 
              key={index} 
              active={index <= currentDay && streak >= (currentDay - index + 1)}
            >
              {day}
            </DayCircle>
          ))}
        </StreakDays>
      )}

      {showMilestone && streak > 0 && (
        <Milestone>{getMilestone()}</Milestone>
      )}

      {showMotivation && (
        <MotivationText>
          <IconWrapper><GiAchievement size={16} /></IconWrapper>
          {` "${getMotivation()}"`}
        </MotivationText>
      )}
    </Container>
  );
};

export default StreakCounter;