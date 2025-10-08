import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// ========== STYLED COMPONENTS ==========

const HeaderContainer = styled.header`
  position: sticky;
  top: 0;
  background: ${props => props.theme === 'dark' 
    ? 'rgba(26, 26, 26, 0.95)' 
    : 'rgba(255, 255, 255, 0.95)'
  };
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  z-index: 100;
  box-shadow: ${props => props.scrolled 
    ? '0 4px 12px rgba(0,0,0,0.1)' 
    : '0 2px 4px rgba(0,0,0,0.05)'
  };
  transition: box-shadow 0.3s ease;
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
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }

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

const NotificationBtn = styled.button`
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
  position: relative;

  &:hover {
    transform: scale(1.1);
    background: ${props => props.theme === 'dark' ? '#4B5563' : '#e5e7eb'};
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: 5px;
  right: 5px;
  background: #ef4444;
  color: white;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
`;

const UserAvatar = styled.div`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(88, 204, 2, 0.3);

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(88, 204, 2, 0.4);
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

  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
`;

// ========== COMPONENT ==========

const Header = ({ 
  theme = 'light',
  onThemeToggle,
  userName = 'User',
  notificationCount = 0,
  showNotification = true,
  showAvatar = true,
  showBackButton = false,
  onBackClick,
  scrolled = false,
}) => {
  const navigate = useNavigate();

  return (
    <HeaderContainer theme={theme} scrolled={scrolled}>
      <HeaderContent>
        <Logo onClick={() => navigate('/dashboard')}>
          <span>🦉</span>
          <span>EnglishMaster</span>
        </Logo>
        
        <HeaderActions>
          {onThemeToggle && (
            <ThemeToggle theme={theme} onClick={onThemeToggle}>
              {theme === 'light' ? '🌙' : '☀️'}
            </ThemeToggle>
          )}
          
          {showNotification && (
            <NotificationBtn theme={theme} onClick={() => navigate('/notifications')}>
              🔔
              {notificationCount > 0 && (
                <NotificationBadge>{notificationCount}</NotificationBadge>
              )}
            </NotificationBtn>
          )}
          
          {showAvatar && (
            <UserAvatar onClick={() => navigate('/profile')}>
              👤
            </UserAvatar>
          )}
          
          {showBackButton && (
            <BackButton theme={theme} onClick={onBackClick || (() => navigate(-1))}>
              <span>←</span>
              Quay lại
            </BackButton>
          )}
        </HeaderActions>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;