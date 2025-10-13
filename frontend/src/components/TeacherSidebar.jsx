import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';

// ========== STYLED COMPONENTS ==========

const SidebarContainer = styled.aside`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: ${props => props.collapsed ? '80px' : '280px'};
  background: ${props => props.theme === 'dark' 
    ? 'rgba(26, 26, 26, 0.95)' 
    : 'rgba(255, 255, 255, 0.95)'
  };
  backdrop-filter: blur(20px);
  border-right: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  transition: all 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 768px) {
    transform: ${props => props.mobileOpen ? 'translateX(0)' : 'translateX(-100%)'};
    width: 280px;
  }
`;

const SidebarHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  white-space: nowrap;

  &:hover {
    transform: scale(1.05);
  }
`;

const LogoIcon = styled.span`
  font-size: 2rem;
  flex-shrink: 0;
`;

const LogoText = styled.div`
  display: flex;
  flex-direction: column;
  opacity: ${props => props.collapsed ? '0' : '1'};
  transition: opacity 0.3s ease;
`;

const LogoTitle = styled.div`
  font-size: 1.25rem;
  font-weight: bold;
  color: #8b5cf6;
  line-height: 1.2;
`;

const LogoSubtitle = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-weight: 600;
`;

const CollapseButton = styled.button`
  background: ${props => props.theme === 'dark' ? '#374151' : '#f3f4f6'};
  border: none;
  width: 35px;
  height: 35px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: ${props => props.theme === 'dark' ? '#e5e7eb' : '#374151'};
  font-size: 1.25rem;
  flex-shrink: 0;

  &:hover {
    background: ${props => props.theme === 'dark' ? '#4B5563' : '#e5e7eb'};
    transform: scale(1.1);
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const SidebarNav = styled.nav`
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #8b5cf6;
  }
`;

const MenuSection = styled.div`
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.div`
  padding: 0.5rem 1.5rem;
  font-size: 0.75rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#6b7280' : '#9ca3af'};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: ${props => props.collapsed ? '0' : '1'};
  transition: opacity 0.3s ease;
  white-space: nowrap;
`;

const MenuItem = styled.div`
  margin: 0.25rem 1rem;
  padding: 0.875rem 1rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  background: ${props => {
    if (props.active) {
      return props.theme === 'dark' 
        ? 'rgba(139, 92, 246, 0.15)' 
        : 'rgba(139, 92, 246, 0.1)';
    }
    return 'transparent';
  }};
  color: ${props => {
    if (props.active) return '#8b5cf6';
    return props.theme === 'dark' ? '#d1d5db' : '#4b5563';
  }};

  &:hover {
    background: ${props => props.theme === 'dark' 
      ? 'rgba(139, 92, 246, 0.1)' 
      : 'rgba(139, 92, 246, 0.05)'
    };
    color: #8b5cf6;
    transform: translateX(5px);
  }

  ${props => props.active && `
    &::before {
      content: '';
      position: absolute;
      left: -1rem;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 70%;
      background: #8b5cf6;
      border-radius: 0 2px 2px 0;
    }
  `}
`;

const MenuIcon = styled.span`
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const MenuText = styled.span`
  font-weight: 600;
  font-size: 0.875rem;
  opacity: ${props => props.collapsed ? '0' : '1'};
  transition: opacity 0.3s ease;
  white-space: nowrap;
`;

const Badge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: bold;
  background: ${props => {
    if (props.variant === 'success') return '#10b981';
    if (props.variant === 'warning') return '#f59e0b';
    if (props.variant === 'danger') return '#ef4444';
    return '#8b5cf6';
  }};
  color: white;
  margin-left: auto;
  opacity: ${props => props.collapsed ? '0' : '1'};
  transition: opacity 0.3s ease;
`;

const SidebarFooter = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
`;

const UserCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 12px;
  background: ${props => props.theme === 'dark' ? '#374151' : '#f3f4f6'};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.theme === 'dark' ? '#4B5563' : '#e5e7eb'};
    transform: translateY(-2px);
  }
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
`;

const UserInfo = styled.div`
  flex: 1;
  overflow: hidden;
  opacity: ${props => props.collapsed ? '0' : '1'};
  transition: opacity 0.3s ease;
`;

const UserName = styled.div`
  font-weight: bold;
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserRole = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const MobileOverlay = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: ${props => props.show ? 'block' : 'none'};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    animation: fadeIn 0.3s ease;

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  }
`;

const MobileToggle = styled.button`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    position: fixed;
    top: 1rem;
    left: 1rem;
    z-index: 1001;
    background: ${props => props.theme === 'dark' ? '#374151' : '#ffffff'};
    border: none;
    width: 45px;
    height: 45px;
    border-radius: 12px;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);

    &:hover {
      background: ${props => props.theme === 'dark' ? '#4B5563' : '#f3f4f6'};
      transform: scale(1.1);
    }
  }
`;

// ========== COMPONENT ==========

const TeacherSidebar = ({ theme = 'light', onThemeToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentUser = {
    name: 'vinhsonvlog',
    role: 'Teacher',
    avatar: '👨‍🏫',
  };

  const menuItems = [
    {
      section: 'Dashboard',
      items: [
        {
          icon: '📊',
          text: 'Tổng quan',
          path: '/teacher',
          badge: null,
        },
        {
          icon: '📈',
          text: 'Thống kê',
          path: '/teacher/statistics',
          badge: null,
        },
      ],
    },
    {
      section: 'Quản lý lớp',
      items: [
        {
          icon: '🎓',
          text: 'Lớp học',
          path: '/teacher/classroom',
          badge: { text: '4', variant: 'info' },
        },
        {
          icon: '👥',
          text: 'Học viên',
          path: '/teacher/students',
          badge: { text: '127', variant: 'info' },
        },
        {
          icon: '📋',
          text: 'Điểm danh',
          path: '/teacher/attendance',
          badge: null,
        },
      ],
    },
    {
      section: 'Nội dung giảng dạy',
      items: [
        {
          icon: '🗂️',
          text: 'Deck & Flashcard',
          path: '/teacher/decks',
          badge: { text: '23', variant: 'success' },
        },
        {
          icon: '📝',
          text: 'Kho Mini-Quiz',
          path: '/teacher/quiz-bank',
          badge: { text: '15', variant: 'warning' },
        },
        {
          icon: '📚',
          text: 'Bài học',
          path: '/teacher/lessons',
          badge: null,
        },
        {
          icon: '✍️',
          text: 'Bài tập',
          path: '/teacher/assignments',
          badge: { text: '8', variant: 'warning' },
        },
      ],
    },
    {
      section: 'Công cụ',
      items: [
        {
          icon: '🤖',
          text: 'AI Tạo thẻ',
          path: '/teacher/ai-cards',
          badge: { text: 'New', variant: 'success' },
        },
        {
          icon: '✅',
          text: 'Kiểm tra chất lượng',
          path: '/teacher/quality-check',
          badge: null,
        },
        {
          icon: '💬',
          text: 'Nhận xét',
          path: '/teacher/comments',
          badge: { text: '12', variant: 'danger' },
        },
      ],
    },
    {
      section: 'Cài đặt',
      items: [
        {
          icon: '⚙️',
          text: 'Cài đặt',
          path: '/teacher/settings',
          badge: null,
        },
        {
          icon: '📧',
          text: 'Thông báo',
          path: '/teacher/notifications',
          badge: { text: '8', variant: 'danger' },
        },
      ],
    },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleCollapseToggle = () => {
    setCollapsed(!collapsed);
  };

  const handleMobileToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <MobileToggle theme={theme} onClick={handleMobileToggle}>
        ☰
      </MobileToggle>

      <MobileOverlay show={mobileOpen} onClick={handleMobileToggle} />

      <SidebarContainer theme={theme} collapsed={collapsed} mobileOpen={mobileOpen}>
        {/* Header */}
        <SidebarHeader theme={theme}>
          <Logo onClick={() => handleNavigate('/teacher')}>
            <LogoIcon>🦉</LogoIcon>
            <LogoText collapsed={collapsed}>
              <LogoTitle>EnglishMaster</LogoTitle>
              <LogoSubtitle theme={theme}>Teacher Panel</LogoSubtitle>
            </LogoText>
          </Logo>
          <CollapseButton theme={theme} onClick={handleCollapseToggle}>
            {collapsed ? '→' : '←'}
          </CollapseButton>
        </SidebarHeader>

        {/* Navigation */}
        <SidebarNav theme={theme}>
          {menuItems.map((section, sectionIndex) => (
            <MenuSection key={sectionIndex}>
              <SectionTitle theme={theme} collapsed={collapsed}>
                {section.section}
              </SectionTitle>
              {section.items.map((item, itemIndex) => (
                <MenuItem
                  key={itemIndex}
                  theme={theme}
                  active={isActive(item.path)}
                  onClick={() => handleNavigate(item.path)}
                >
                  <MenuIcon>{item.icon}</MenuIcon>
                  <MenuText collapsed={collapsed}>{item.text}</MenuText>
                  {item.badge && (
                    <Badge variant={item.badge.variant} collapsed={collapsed}>
                      {item.badge.text}
                    </Badge>
                  )}
                </MenuItem>
              ))}
            </MenuSection>
          ))}
        </SidebarNav>

        {/* Footer */}
        <SidebarFooter theme={theme}>
          <UserCard theme={theme} onClick={() => handleNavigate('/profile')}>
            <UserAvatar>{currentUser.avatar}</UserAvatar>
            <UserInfo collapsed={collapsed}>
              <UserName theme={theme}>{currentUser.name}</UserName>
              <UserRole theme={theme}>{currentUser.role}</UserRole>
            </UserInfo>
          </UserCard>
        </SidebarFooter>
      </SidebarContainer>
    </>
  );
};

export default TeacherSidebar;