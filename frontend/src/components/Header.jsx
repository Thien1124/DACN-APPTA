import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Swal from 'sweetalert2';

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

const AvatarWrapper = styled.div`
  position: relative;
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

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 250px;
  background: ${props => props.theme === 'dark'
    ? 'rgba(31, 41, 55, 0.98)'
    : 'rgba(255, 255, 255, 0.98)'
  };
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: ${props => props.theme === 'dark'
    ? '0 10px 40px rgba(0, 0, 0, 0.5)'
    : '0 10px 40px rgba(0, 0, 0, 0.15)'
  };
  border: 1px solid ${props => props.theme === 'dark'
    ? 'rgba(75, 85, 99, 0.3)'
    : 'rgba(229, 231, 235, 0.5)'
  };
  padding: 0.5rem;
  opacity: ${props => props.show ? '1' : '0'};
  visibility: ${props => props.show ? 'visible' : 'hidden'};
  transform: ${props => props.show ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all 0.3s ease;
  z-index: 1000;
`;

const DropdownHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  margin-bottom: 0.5rem;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const UserAvatarSmall = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
`;

const UserDetails = styled.div`
  flex: 1;
  overflow: hidden;
`;

const UserName = styled.div`
  font-weight: bold;
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserEmail = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: ${props => {
    if (props.danger) return '#ef4444';
    return props.theme === 'dark' ? '#e5e7eb' : '#374151';
  }};
  font-size: 0.875rem;
  font-weight: 600;

  &:hover {
    background: ${props => {
    if (props.danger) return 'rgba(239, 68, 68, 0.1)';
    return props.theme === 'dark' ? 'rgba(88, 204, 2, 0.1)' : 'rgba(88, 204, 2, 0.05)';
  }};
    transform: translateX(5px);
  }

  span:first-child {
    font-size: 1.25rem;
  }
`;

const MenuDivider = styled.div`
  height: 1px;
  background: ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  margin: 0.5rem 0;
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
  userName = 'Vinh Son',
  userEmail = 'vinhsonvlog@example.com',
  notificationCount = 3,
  showNotification = true,
  showAvatar = true,
  showBackButton = false,
  onBackClick,
  scrolled = false,
}) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const avatarRef = useRef(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        avatarRef.current &&
        !avatarRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAvatarClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleProfileClick = () => {
    setShowDropdown(false);
    navigate('/profile');
  };

  const handleAuditLogClick = () => {
    setShowDropdown(false);
    navigate('/audit-log');
  };
  const handleWordbankClick = () => {
    setShowDropdown(false);
    setShowMobileMenu(false);
    navigate('/wordbank');
  };

  const handleMyClassesClick = () => {
    setShowDropdown(false);
    setShowMobileMenu(false);
    navigate('/classes');
  };

  const handleLogout = () => {
    setShowDropdown(false);

    Swal.fire({
      title: 'Xác nhận đăng xuất',
      text: 'Bạn có chắc muốn đăng xuất khỏi hệ thống?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Đăng xuất',
      cancelButtonText: 'Hủy',
      backdrop: true,
      allowOutsideClick: true,
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title: 'Đã đăng xuất!',
          text: 'Hẹn gặp lại bạn!',
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          // Clear session/token here
          localStorage.removeItem('token');
          sessionStorage.clear();
          navigate('/login');
        });
      }
    });
  };

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
            <AvatarWrapper>
              <UserAvatar ref={avatarRef} onClick={handleAvatarClick}>
                👤
              </UserAvatar>

              <DropdownMenu
                ref={dropdownRef}
                theme={theme}
                show={showDropdown}
              >
                <DropdownHeader theme={theme}>
                  <UserInfo>
                    <UserAvatarSmall>👤</UserAvatarSmall>
                    <UserDetails>
                      <UserName theme={theme}>{userName}</UserName>
                      <UserEmail theme={theme}>{userEmail}</UserEmail>
                    </UserDetails>
                  </UserInfo>
                </DropdownHeader>

                <MenuItem theme={theme} onClick={handleProfileClick}>
                  <span>👤</span>
                  <span>Hồ sơ cá nhân</span>
                </MenuItem>

                <MenuItem theme={theme} onClick={handleAuditLogClick}>
                  <span>📋</span>
                  <span>Lịch sử hoạt động</span>
                </MenuItem>
                <MenuItem theme={theme} onClick={handleWordbankClick}>
                  <span>📚</span>
                  <span>Từ vựng của tôi</span>
                </MenuItem>

                <MenuItem theme={theme} onClick={handleMyClassesClick}>
                  <span>🏫</span>
                  <span>Lớp học của tôi</span>
                </MenuItem>

                <MenuItem theme={theme} onClick={() => navigate('/advanced-features')}>
                  <span>✨</span>
                  <span>Tính năng nâng cao</span>
                </MenuItem>
                <MenuDivider theme={theme} />

                <MenuItem theme={theme} danger onClick={handleLogout}>
                  <span>🚪</span>
                  <span>Đăng xuất</span>
                </MenuItem>
              </DropdownMenu>
            </AvatarWrapper>
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