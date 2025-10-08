import React from 'react';
import styled from 'styled-components';

// ========== STYLED COMPONENTS ==========

const SpinnerContainer = styled.div`
  display: ${props => props.fullScreen ? 'flex' : 'inline-flex'};
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 1rem;
  
  ${props => props.fullScreen && `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props.theme === 'dark' 
      ? 'rgba(0, 0, 0, 0.8)' 
      : 'rgba(255, 255, 255, 0.8)'
    };
    backdrop-filter: blur(8px);
    z-index: 9999;
  `}
`;

const Spinner = styled.div`
  width: ${props => {
    if (props.size === 'small') return '24px';
    if (props.size === 'large') return '64px';
    return '48px';
  }};
  height: ${props => {
    if (props.size === 'small') return '24px';
    if (props.size === 'large') return '64px';
    return '48px';
  }};
  border: ${props => {
    if (props.size === 'small') return '3px';
    if (props.size === 'large') return '6px';
    return '5px';
  }} solid ${props => {
    if (props.color === 'primary') return 'rgba(88, 204, 2, 0.2)';
    if (props.color === 'secondary') return 'rgba(28, 176, 246, 0.2)';
    if (props.color === 'white') return 'rgba(255, 255, 255, 0.2)';
    return props.theme === 'dark' ? 'rgba(229, 231, 235, 0.2)' : 'rgba(55, 65, 81, 0.2)';
  }};
  border-radius: 50%;
  border-top-color: ${props => {
    if (props.color === 'primary') return '#58CC02';
    if (props.color === 'secondary') return '#1CB0F6';
    if (props.color === 'white') return '#ffffff';
    return props.theme === 'dark' ? '#e5e7eb' : '#374151';
  }};
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const SpinnerText = styled.p`
  font-size: ${props => {
    if (props.size === 'small') return '0.875rem';
    if (props.size === 'large') return '1.25rem';
    return '1rem';
  }};
  font-weight: 600;
  color: ${props => {
    if (props.color === 'white') return '#ffffff';
    return props.theme === 'dark' ? '#e5e7eb' : '#374151';
  }};
  margin: 0;
`;

const Logo = styled.div`
  font-size: ${props => {
    if (props.size === 'small') return '2rem';
    if (props.size === 'large') return '4rem';
    return '3rem';
  }};
  margin-bottom: 1rem;
  animation: bounce 1s ease-in-out infinite;

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
`;

// ========== COMPONENT ==========

const LoadingSpinner = ({
  size = 'medium',
  color = 'primary',
  text,
  fullScreen = false,
  theme = 'light',
  showLogo = false,
}) => {
  return (
    <SpinnerContainer fullScreen={fullScreen} theme={theme}>
      {showLogo && <Logo size={size}>🦉</Logo>}
      <Spinner size={size} color={color} theme={theme} />
      {text && <SpinnerText size={size} theme={theme} color={color}>{text}</SpinnerText>}
    </SpinnerContainer>
  );
};

export default LoadingSpinner;