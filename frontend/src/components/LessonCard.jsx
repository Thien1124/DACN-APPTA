import React from 'react';
import styled from 'styled-components';

// ========== STYLED COMPONENTS ==========

const Card = styled.div`
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
  display: flex;
  align-items: center;
  gap: 1.5rem;

  &:hover {
    transform: ${props => props.status !== 'locked' ? 'translateX(10px)' : 'none'};
    box-shadow: ${props => props.status !== 'locked' ? '0 8px 24px rgba(0,0,0,0.15)' : 'none'};
  }

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const IconWrapper = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${props => {
    if (props.status === 'completed') return 'linear-gradient(135deg, #58CC02 0%, #45a302 100%)';
    if (props.status === 'current') return 'linear-gradient(135deg, #1CB0F6 0%, #0891b2 100%)';
    return props.theme === 'dark' ? '#374151' : '#e5e7eb';
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  flex-shrink: 0;
  position: relative;

  ${props => props.status === 'locked' && `
    &::after {
      content: '🔒';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 2rem;
    }
  `}
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin: 0;
`;

const Description = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin: 0;
`;

const ProgressContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
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
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
`;

const ProgressText = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  min-width: 45px;
  text-align: right;
`;

const StatusBadge = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.375rem 0.875rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: bold;
  background: ${props => {
    if (props.status === 'completed') return 'rgba(88, 204, 2, 0.2)';
    if (props.status === 'current') return 'rgba(28, 176, 246, 0.2)';
    return 'rgba(107, 114, 128, 0.2)';
  }};
  color: ${props => {
    if (props.status === 'completed') return '#58CC02';
    if (props.status === 'current') return '#1CB0F6';
    return '#6b7280';
  }};

  @media (max-width: 768px) {
    position: static;
    display: inline-block;
    margin-top: 0.5rem;
  }
`;

// ========== COMPONENT ==========

const LessonCard = ({
  icon = '📚',
  title,
  description,
  progress = 0,
  status = 'locked', // 'completed', 'current', 'locked'
  theme = 'light',
  onClick,
  showProgress = true,
  showBadge = true,
}) => {
  const getStatusText = () => {
    switch (status) {
      case 'completed':
        return '✓ Hoàn thành';
      case 'current':
        return '▶ Đang học';
      case 'locked':
        return '🔒 Khóa';
      default:
        return '';
    }
  };

  return (
    <Card theme={theme} status={status} onClick={onClick}>
      <IconWrapper theme={theme} status={status}>
        {status !== 'locked' && icon}
      </IconWrapper>

      <Content>
        <Title theme={theme}>{title}</Title>
        {description && <Description theme={theme}>{description}</Description>}
        
        {showProgress && status !== 'locked' && (
          <ProgressContainer>
            <ProgressBar theme={theme}>
              <ProgressFill progress={progress} />
            </ProgressBar>
            <ProgressText theme={theme}>{progress}%</ProgressText>
          </ProgressContainer>
        )}
      </Content>

      {showBadge && (
        <StatusBadge status={status}>
          {getStatusText()}
        </StatusBadge>
      )}
    </Card>
  );
};

export default LessonCard;