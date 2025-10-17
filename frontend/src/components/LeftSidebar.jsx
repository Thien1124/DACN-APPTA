import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import logo from '../assets/logo.png';
import home123 from '../assets/home123.png';
import speaking123 from '../assets/speaking123.png';
import rankings from '../assets/rankings.png';
import mission from '../assets/mission.png';
import store from '../assets/store.png';
import Profile from '../assets/profile.png';
// ========== ANIMATIONS ==========
const fadeIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

// ========== STYLED COMPONENTS ==========
const SidebarContainer = styled.div`
  width: 280px;
  background: white;
  border-right: 2px solid #e5e7eb;
  padding: 1.5rem 1rem;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
  z-index: 100;
  animation: ${fadeIn} 0.6s ease;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f3f4f6;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }

  @media (max-width: 1024px) {
    width: 240px;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  padding: 0 0.5rem;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const LogoImage = styled.img`
  width: 40px;
  height: 40px;
`;

const LogoText = styled.h1`
  font-size: 1.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
`;

const NavMenu = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const NavItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.active ? '#DDF4FF' : 'transparent'};
  border: 2px solid ${props => props.active ? '#84D8FF' : 'transparent'};
  position: relative;

  &:hover {
    background: ${props => props.active ? '#DDF4FF' : '#f3f4f6'};
    transform: translateX(4px);
  }

  ${props => props.active && `
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 70%;
      background: #1CB0F6;
      border-radius: 0 4px 4px 0;
    }
  `}
`;

const NavIcon = styled.div`
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
`;

const NavText = styled.span`
  font-size: 0.9375rem;
  font-weight: 700;
  color: ${props => props.active ? '#1CB0F6' : '#4b5563'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex: 1;
`;

const NavBadge = styled.span`
  background: ${props => props.variant === 'danger' ? '#ef4444' : '#f59e0b'};
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  min-width: 24px;
  text-align: center;
  animation: pulse 2s ease infinite;

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
`;

const Divider = styled.div`
  height: 1px;
  background: #e5e7eb;
  margin: 1rem 0;
`;

const SidebarFooter = styled.div`
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 2px solid #e5e7eb;
`;

const FooterText = styled.div`
  font-size: 0.75rem;
  color: #9ca3af;
  text-align: center;
  padding: 0.5rem;
  line-height: 1.5;
`;

const SocialLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
`;

const NavIconImage = styled.img`
  width: 28px;
  height: 28px;
  object-fit: contain;
  transition: all 0.3s ease;
  filter: ${props => props.active ? 'none' : 'grayscale(50%) opacity(0.7)'};

  ${NavItem}:hover & {
    filter: none;
    transform: scale(1.1);
  }

  ${props => props.active && `
    filter: brightness(1.1);
  `}
`;
const SocialIcon = styled.a`
  width: 36px;
  height: 36px;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  font-size: 1.25rem;

  &:hover {
    background: #1CB0F6;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(28, 176, 246, 0.3);
  }
`;

// ========== COMPONENT ==========
const LeftSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { 
      id: 'learn', 
      icon: home123, 
      text: 'Học', 
      path: '/learn'
    },
    { 
      id: 'pronunciation', 
      icon: speaking123, 
      text: 'Phát âm', 
      path: '/characters'
    },
    { 
      id: 'leaderboard', 
      icon: rankings, 
      text: 'Bảng xếp hạng', 
      path: '/leaderboard'
    },
    { 
      id: 'quests', 
      icon: mission, 
      text: 'Nhiệm vụ', 
      path: '/quests',
      badge: '3',
      variant: 'danger'
    },
    { 
      id: 'shop', 
      icon: store, 
      text: 'Cửa hàng', 
      path: '/shop'
    },
    { 
      id: 'profile', 
      icon: Profile, 
      text: 'Hồ sơ', 
      path: '/profile'
    },
    { 
      id: 'settings', 
      icon: '⚙️', 
      text: 'Xem thêm', 
      path: '/settings'
    },
  ];

  const handleNavClick = (item) => {
    navigate(item.path);
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <SidebarContainer>
      <Logo onClick={() => navigate('/dashboard')}>
        <LogoImage src={logo} alt="EnglishMaster" />
        <LogoText>EnglishMaster</LogoText>
      </Logo>

      <NavMenu>
        {navItems.map((item, index) => (
          <React.Fragment key={item.id}>
            <NavItem
              active={isActive(item.path)}
              onClick={() => handleNavClick(item)}
            >
              <NavIcon>
                {typeof item.icon === 'string' && item.icon.startsWith('http') || item.icon.endsWith('.png') ? (
                  <NavIconImage 
                    src={item.icon} 
                    alt={item.text}
                    active={isActive(item.path)}
                  />
                ) : (
                  <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                )}
              </NavIcon>
              <NavText active={isActive(item.path)}>{item.text}</NavText>
              {item.badge && (
                <NavBadge variant={item.variant}>
                  {item.badge}
                </NavBadge>
              )}
            </NavItem>
            {index === 5 && <Divider />}
          </React.Fragment>
        ))}
      </NavMenu>

      <SidebarFooter>
        <FooterText>
          © 2025 EnglishMaster
          <br />
          Version 1.0.0
        </FooterText>
        
      </SidebarFooter>
    </SidebarContainer>
  );
};

export default LeftSidebar;