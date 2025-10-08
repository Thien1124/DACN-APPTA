import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';

// ========== STYLED COMPONENTS ==========

const NavbarContainer = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: ${props => props.theme === 'dark' 
    ? 'rgba(26, 26, 26, 0.95)' 
    : 'rgba(255, 255, 255, 0.95)'
  };
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
`;

const NavbarContent = styled.div`
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

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled.button`
  background: none;
  border: none;
  color: ${props => props.active 
    ? '#58CC02' 
    : props.theme === 'dark' ? '#e5e7eb' : '#4B4B4B'
  };
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.3s ease;
  position: relative;
  padding: 0.5rem 0;

  &:hover {
    color: #58CC02;
  }

  ${props => props.active && `
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: #58CC02;
    }
  `}
`;

const NavActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    display: none;
  }
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

const BtnLogin = styled.button`
  background: none;
  border: 2px solid #58CC02;
  color: ${props => props.theme === 'dark' ? '#58CC02' : '#45a302'};
  padding: 0.5rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #58CC02;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(88, 204, 2, 0.3);
  }
`;

const BtnSignup = styled.button`
  background: #58CC02;
  border: 2px solid #58CC02;
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(88, 204, 2, 0.3);

  &:hover {
    background: #45a302;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(88, 204, 2, 0.4);
  }
`;

const MobileMenuBtn = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${props => props.theme === 'dark' ? '#e5e7eb' : '#1a1a1a'};
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileMenu = styled.div`
  display: none;
  position: fixed;
  top: 73px;
  left: 0;
  right: 0;
  background: ${props => props.theme === 'dark' 
    ? 'rgba(26, 26, 26, 0.98)' 
    : 'rgba(255, 255, 255, 0.98)'
  };
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  animation: slideDown 0.3s ease;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  ${props => props.isOpen && `
    @media (max-width: 768px) {
      display: block;
    }
  `}
`;

const MobileNavLink = styled.button`
  background: none;
  border: none;
  width: 100%;
  padding: 1rem;
  text-align: left;
  color: ${props => props.active 
    ? '#58CC02' 
    : props.theme === 'dark' ? '#e5e7eb' : '#4B4B4B'
  };
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.3s ease;
  margin-bottom: 0.5rem;

  &:hover {
    background: ${props => props.theme === 'dark' ? '#374151' : '#f3f4f6'};
    color: #58CC02;
  }
`;

const MobileActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
`;

// ========== COMPONENT ==========

const Navbar = ({ 
  theme = 'light',
  onThemeToggle,
  isAuthenticated = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = isAuthenticated ? [
    { label: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { label: 'Luyện tập', path: '/practice', icon: '💪' },
    { label: 'Tiến độ', path: '/progress', icon: '📈' },
    { label: 'Hồ sơ', path: '/profile', icon: '👤' },
  ] : [
    { label: 'Trang chủ', path: '/', icon: '🏠' },
    { label: 'Về chúng tôi', path: '/about', icon: 'ℹ️' },
    { label: 'Tính năng', path: '/features', icon: '✨' },
    { label: 'Liên hệ', path: '/contact', icon: '📞' },
  ];

  const handleNavClick = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <NavbarContainer theme={theme}>
        <NavbarContent>
          <Logo onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}>
            <span>🦉</span>
            <span>EnglishMaster</span>
          </Logo>

          <NavLinks>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                theme={theme}
                active={location.pathname === item.path}
                onClick={() => handleNavClick(item.path)}
              >
                {item.label}
              </NavLink>
            ))}
          </NavLinks>

          <NavActions>
            {onThemeToggle && (
              <ThemeToggle theme={theme} onClick={onThemeToggle}>
                {theme === 'light' ? '🌙' : '☀️'}
              </ThemeToggle>
            )}
            
            {!isAuthenticated && (
              <>
                <BtnLogin theme={theme} onClick={() => navigate('/login')}>
                  Đăng nhập
                </BtnLogin>
                <BtnSignup onClick={() => navigate('/register')}>
                  Đăng ký
                </BtnSignup>
              </>
            )}
          </NavActions>

          <MobileMenuBtn 
            theme={theme} 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </MobileMenuBtn>
        </NavbarContent>
      </NavbarContainer>

      <MobileMenu theme={theme} isOpen={mobileMenuOpen}>
        {navItems.map((item) => (
          <MobileNavLink
            key={item.path}
            theme={theme}
            active={location.pathname === item.path}
            onClick={() => handleNavClick(item.path)}
          >
            {item.icon} {item.label}
          </MobileNavLink>
        ))}
        
        {!isAuthenticated && (
          <MobileActions>
            <BtnLogin theme={theme} onClick={() => handleNavClick('/login')}>
              Đăng nhập
            </BtnLogin>
            <BtnSignup onClick={() => handleNavClick('/register')}>
              Đăng ký
            </BtnSignup>
          </MobileActions>
        )}
        
        {onThemeToggle && (
          <MobileActions>
            <ThemeToggle 
              theme={theme} 
              onClick={onThemeToggle}
              style={{ width: '100%', borderRadius: '12px' }}
            >
              {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </ThemeToggle>
          </MobileActions>
        )}
      </MobileMenu>
    </>
  );
};

export default Navbar;