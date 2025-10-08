import React from 'react';
import styled from 'styled-components';

// ========== STYLED COMPONENTS ==========

const Container = styled.div`
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

const CircleContainer = styled.div`
  position: relative;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
`;

const SVG = styled.svg`
  transform: rotate(-90deg);
  filter: drop-shadow(0 2px 8px rgba(0,0,0,0.1));
`;

const CircleBackground = styled.circle`
  fill: none;
  stroke: ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  stroke-width: ${props => props.strokeWidth};
`;

const CircleProgress = styled.circle`
  fill: none;
  stroke: url(#gradient-${props => props.id});
  stroke-width: ${props => props.strokeWidth};
  stroke-linecap: round;
  stroke-dasharray: ${props => props.circumference};
  stroke-dashoffset: ${props => props.offset};
  transition: stroke-dashoffset 1s ease;
`;

const CenterContent = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const PercentageText = styled.div`
  font-size: ${props => props.size / 4}px;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  line-height: 1;
`;

const Label = styled.div`
  font-size: ${props => props.size / 8}px;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-top: 4px;
`;

const Icon = styled.div`
  font-size: ${props => props.size / 3}px;
  margin-bottom: 4px;
`;

const BottomLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#e5e7eb' : '#374151'};
  text-align: center;
`;

// ========== COMPONENT ==========

const ProgressCircle = ({
  progress = 0,
  size = 120,
  strokeWidth = 8,
  theme = 'light',
  color = '#58CC02',
  secondaryColor = '#45a302',
  showPercentage = true,
  showIcon = false,
  icon = '🎯',
  label = '',
  bottomLabel = '',
  animated = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  const uniqueId = Math.random().toString(36).substr(2, 9);

  return (
    <Container>
      <CircleContainer size={size}>
        <SVG width={size} height={size}>
          <defs>
            <linearGradient id={`gradient-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor={secondaryColor} />
            </linearGradient>
          </defs>

          <CircleBackground
            theme={theme}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />

          <CircleProgress
            id={uniqueId}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            circumference={circumference}
            offset={animated ? offset : circumference}
            style={{
              animation: animated ? `dash 1s ease forwards` : 'none'
            }}
          />
        </SVG>

        <CenterContent>
          {showIcon && <Icon size={size}>{icon}</Icon>}
          {showPercentage && (
            <>
              <PercentageText size={size} theme={theme}>
                {Math.round(progress)}%
              </PercentageText>
              {label && <Label size={size} theme={theme}>{label}</Label>}
            </>
          )}
        </CenterContent>
      </CircleContainer>

      {bottomLabel && <BottomLabel theme={theme}>{bottomLabel}</BottomLabel>}

      <style>{`
        @keyframes dash {
          from {
            stroke-dashoffset: ${circumference};
          }
          to {
            stroke-dashoffset: ${offset};
          }
        }
      `}</style>
    </Container>
  );
};

export default ProgressCircle;