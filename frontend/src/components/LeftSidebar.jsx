import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import logo from '../assets/logo.png';
// Thêm imports cho icons
import { FiSettings } from 'react-icons/fi';
import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';
import {
  BiHomeAlt2,
  BiMicrophone,
  BiTrophy,
  BiTask,
  BiStore,
  BiUser,
  BiBrain,
  BiCard,
  BiFlag,
  BiBookContent,
  BiBook,
  BiQuestionMark,
  BiMap
} from 'react-icons/bi';
import { BiBell } from 'react-icons/bi';

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
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  color: ${props => props.active ? '#1CB0F6' : '#4b5563'};
  transition: all 0.3s ease;

  svg {
    transition: all 0.3s ease;
  }

  ${props => props.active && `
    svg {
      transform: scale(1.1);
    }
  `}
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

// New styled components for "Xem thêm" dropdown
const MoreDropdown = styled.div`
  position: fixed;
  z-index: 110;
  width: 300px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  padding: 0.5rem;
  /* allow scroll and ensure it fits in viewport */
  max-height: calc(100vh - 32px);
  overflow: auto;
  animation: ${fadeIn} 0.18s ease;
`;

const MoreItem = styled.button`
  width: 100%;
  background: transparent;
  border: none;
  text-align: left;
  padding: 0.75rem 0.75rem;
  display: flex;
  gap: 0.75rem;
  align-items: center;
  font-weight: 700;
  color: #374151;
  cursor: pointer;
  border-radius: 8px;

  &:hover {
    background: #f8fafc;
  }
`;

const MoreItemSub = styled.div`
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 600;
`;

// ========== COMPONENT ==========
const LeftSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreAnchorRef = useRef(null);
  const moreMenuRef = useRef(null);
  const [moreStyle, setMoreStyle] = useState({ top: 120, left: 300 });

  const navItems = [
    {
      id: 'learn',
      icon: <BiHomeAlt2 size={24} />,
      text: 'Học',
      path: '/learn'
    },
    {
      id: 'pronunciation',
      icon: <BiMicrophone size={24} />,
      text: 'Phát âm',
      path: '/characters'
    },
    {
      id: 'leaderboard',
      icon: <BiTrophy size={24} />,
      text: 'Bảng xếp hạng',
      path: '/leaderboard'
    },
    {
      id: 'quests',
      icon: <BiTask size={24} />,
      text: 'Nhiệm vụ',
      path: '/quests',
      badge: '3',
      variant: 'danger'
    },
    {
      id: 'practice',
      icon: <BiBrain size={24} />,
      text: 'Luyện tập',
      path: '/practice'
    },
    {
      id: 'flashcards',
      icon: <BiBookContent size={24} />,
      text: 'Flashcards',
      path: '/flashcards'
    },
    {
      id: 'decks',
      icon: <BiCard size={24} />,
      text: 'Bộ thẻ Decks',
      path: '/decks'
    },
    {
      id: 'worldbank',
      icon: <BiBook size={24} />,
      text: 'Sổ tay từ vựng',
      path: '/worldbank'
    },
    {
      id: 'quiz-bank',
      icon: <BiQuestionMark size={24} />,
      text: 'Bộ Quiz Phụ',
      path: '/quiz-bank'
    },
    {
      id: 'roadmap',
      icon: <BiMap size={24} />,
      text: 'Lộ trình Cá nhân hóa',
      path: '/roadmap'
    },
    {
      id: 'goals',
      icon: <BiFlag size={24} />,
      text: 'Mục tiêu học tập',
      path: '/goals'
    },
    {
      id: 'shop',
      icon: <BiStore size={24} />,
      text: 'Cửa hàng',
      path: '/shop'
    },
    {
      id: 'profile',
      icon: <BiUser size={24} />,
      text: 'Hồ sơ',
      path: '/profile'
    },
    {
      id: 'settings',
      icon: <FiSettings size={24} />,
      text: 'Xem thêm',
      path: '/settings' // keep for fallback / accessibility
    },
  ];

  const handleNavClick = (item) => {
    if (item.id === 'settings') {
      // toggle local dropdown instead of navigating to Settings page
      setMoreOpen(open => {
        const newOpen = !open;
        if (!newOpen) return false;
        // compute position for dropdown anchored to sidebar + item
        const rect = moreAnchorRef.current?.getBoundingClientRect();
        if (rect) {
          // align dropdown top with the nav item top (not below it)
          setMoreStyle({ top: rect.top, left: rect.right + 12 });
        } else {
          setMoreStyle({ top: 120, left: 300 });
        }
        return true;
      });
      return;
    }
    navigate(item.path);
  };

  // close dropdown on outside click or ESC
  useEffect(() => {
    const onClick = (e) => {
      if (!moreOpen) return;
      if (moreMenuRef.current && moreMenuRef.current.contains(e.target)) return;
      if (moreAnchorRef.current && moreAnchorRef.current.contains(e.target)) return;
      setMoreOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setMoreOpen(false);
    };
    window.addEventListener('mousedown', onClick);
    window.addEventListener('touchstart', onClick);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onClick);
      window.removeEventListener('touchstart', onClick);
      window.removeEventListener('keydown', onKey);
    };
  }, [moreOpen]);

  // Adjust dropdown so it never gets cut off at bottom (measure after render)
  useEffect(() => {
    if (!moreOpen) return;
    let mounted = true;

    const adjustPosition = () => {
      const anchorRect = moreAnchorRef.current?.getBoundingClientRect();
      const menu = moreMenuRef.current;
      if (!menu) return;
      const menuRect = menu.getBoundingClientRect();
      // default top anchored to item top
      let topCalc = anchorRect ? Math.round(anchorRect.top) : moreStyle.top;
      const margin = 12;
      const maxTop = window.innerHeight - menuRect.height - margin;
      if (topCalc > maxTop) topCalc = Math.max(margin, maxTop);
      if (topCalc < margin) topCalc = margin;
      if (mounted) setMoreStyle(s => ({ ...s, top: topCalc }));
    };

    // run after paint so menu has measured height
    const t = setTimeout(adjustPosition, 0);
    window.addEventListener('resize', adjustPosition);

    return () => {
      mounted = false;
      clearTimeout(t);
      window.removeEventListener('resize', adjustPosition);
    };
  }, [moreOpen]);

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <SidebarContainer>
      <Logo onClick={() => navigate('/learn')}>
        <LogoImage src={logo} alt="EnglishMaster" />
        <LogoText>EnglishMaster</LogoText>
      </Logo>

      <NavMenu>
        {navItems.map((item, index) => (
          <React.Fragment key={item.id}>
            <NavItem
              active={isActive(item.path)}
              onClick={() => handleNavClick(item)}
              ref={item.id === 'settings' ? moreAnchorRef : null}
            >
              <NavIcon active={isActive(item.path)}>
                {item.icon}
              </NavIcon>
              <NavText active={isActive(item.path)}>{item.text}</NavText>
              {item.badge && (
                <NavBadge variant={item.variant}>
                  {item.badge}
                </NavBadge>
              )}
            </NavItem>
            {item.id === 'settings' && moreOpen && (
              <MoreDropdown
                ref={moreMenuRef}
                style={{ top: moreStyle.top, left: moreStyle.left }}
              >
                <MoreItem onClick={() => { navigate('/settings/profile'); setMoreOpen(false); }}>
                  <div>👤</div>
                  <div>
                    Hồ sơ
                    <MoreItemSub>Thay đổi tên, email, ảnh đại diện và mật khẩu.</MoreItemSub>
                  </div>
                </MoreItem>

                <MoreItem onClick={() => { navigate('/notifications'); setMoreOpen(false); }}>
                  <div><BiBell /></div>
                  <div>
                    Thông báo 
                    <MoreItemSub>Quản lý thông báo hệ thống.</MoreItemSub>
                  </div>
                </MoreItem>

                <MoreItem onClick={() => { navigate('/settings/social'); setMoreOpen(false); }}>
                  <div>🔗</div>
                  <div>
                    Tài khoản mạng xã hội
                    <MoreItemSub>Kết nối / ngắt kết nối Google, Facebook.</MoreItemSub>
                  </div>
                </MoreItem>

                <MoreItem onClick={() => { navigate('/settings/privacy'); setMoreOpen(false); }}>
                  <div>🔒</div>
                  <div>
                    Quyền riêng tư
                    <MoreItemSub>Tùy chọn hiển thị hồ sơ và thông báo.</MoreItemSub>
                  </div>
                </MoreItem>

                <MoreItem onClick={() => { navigate('/settings/audit-log'); setMoreOpen(false); }}>
                  <div>🕘</div>
                  <div>
                    Lịch sử hoạt động
                    <MoreItemSub>Xem và quản lý hoạt động tài khoản của bạn.</MoreItemSub>
                  </div>
                </MoreItem>

                <MoreItem onClick={() => { navigate('/settings/notifications'); setMoreOpen(false); }}>
                  <div>🔔</div>
                  <div>
                    Cài đặt Thông báo
                    <MoreItemSub>Quản lý email và thông báo nhắc nhở.</MoreItemSub>
                  </div>
                </MoreItem>

                <MoreItem onClick={() => { navigate('/settings/account'); setMoreOpen(false); }}>
                  <div>⚙️</div>
                  <div>
                    Cài đặt tài khoản
                    <MoreItemSub>Các tuỳ chọn giao diện và trải nghiệm học tập.</MoreItemSub>
                  </div>
                </MoreItem>
              </MoreDropdown>
            )}
             {index === 9 && <Divider />}
           </React.Fragment>
         ))}
       </NavMenu>

      <SidebarFooter>
        <FooterText>
          © 2025 EnglishMaster
          <br />
          Version 1.0.0
        </FooterText>
        <SocialLinks>
          <SocialIcon href="https://facebook.com" target="_blank">
            <FaFacebookF />
          </SocialIcon>
          <SocialIcon href="https://twitter.com" target="_blank">
            <FaTwitter />
          </SocialIcon>
          <SocialIcon href="https://instagram.com" target="_blank">
            <FaInstagram />
          </SocialIcon>
        </SocialLinks>
      </SidebarFooter>
    </SidebarContainer>
  );
};

export default LeftSidebar;