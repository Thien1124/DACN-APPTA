import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { authService } from '../services/authService';
import Swal from 'sweetalert2';

// ========== STYLED COMPONENTS ==========

const LayoutWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%)'
    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e0 100%)'
  };
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: ${props => props.sidebarCollapsed ? '80px' : '280px'};
  transition: margin-left 0.3s ease;
  min-height: 100vh;

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const TopBar = styled.header`
  position: sticky;
  top: 0;
  background: ${props => props.theme === 'dark' 
    ? 'rgba(26, 26, 26, 0.95)' 
    : 'rgba(255, 255, 255, 0.95)'
  };
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  z-index: 100;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    padding: 1rem;
    padding-left: 4rem;
  }
`;

const TopBarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const PageTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const TopBarRight = styled.div`
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

const NotificationButton = styled.button`
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
    background: ${props => props.theme === 'dark' ? '#4B5563' : '#e5e7eb'};
    transform: scale(1.1);
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
`;

// ✅ Styled component cho nút đăng xuất
const LogoutButton = styled.button`
  background: ${props => props.theme === 'dark' ? '#374151' : '#f3f4f6'};
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1f2937'};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #ef4444;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 0.625rem 1rem;
    font-size: 0.875rem;
    
    span:last-child {
      display: none; /* Ẩn text trên mobile, chỉ hiện icon */
    }
  }
`;

const ContentArea = styled.div`
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

// ========== COMPONENT ==========

const AdminLayout = ({ children, pageTitle = 'Admin Dashboard' }) => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');
  const [sidebarCollapsed] = useState(false);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // ✅ Hàm xử lý đăng xuất
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Xác nhận đăng xuất',
      text: 'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản admin?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Đăng xuất',
      cancelButtonText: 'Hủy',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        // Gọi API logout
        await authService.logout();

        // Hiển thị thông báo thành công
        await Swal.fire({
          icon: 'success',
          title: 'Đã đăng xuất',
          text: 'Bạn đã đăng xuất thành công!',
          timer: 1500,
          showConfirmButton: false
        });

        // Chuyển về trang login
        navigate('/login');
      } catch (error) {
        console.error('Logout error:', error);
        
        // Vẫn chuyển về login nếu có lỗi
        await Swal.fire({
          icon: 'info',
          title: 'Đã đăng xuất',
          text: 'Phiên làm việc của bạn đã kết thúc.',
          timer: 1500,
          showConfirmButton: false
        });
        
        navigate('/login');
      }
    }
  };

  return (
    <LayoutWrapper theme={theme}>
      <AdminSidebar theme={theme} onThemeToggle={toggleTheme} />
      
      <MainContent sidebarCollapsed={sidebarCollapsed} theme={theme}>
        <TopBar theme={theme}>
          <TopBarLeft>
            <PageTitle theme={theme}>{pageTitle}</PageTitle>
          </TopBarLeft>
          
          <TopBarRight>
            <ThemeToggle theme={theme} onClick={toggleTheme}>
              {theme === 'light' ? '🌙' : '☀️'}
            </ThemeToggle>
            
            <NotificationButton theme={theme}>
              🔔
              <NotificationBadge>5</NotificationBadge>
            </NotificationButton>

            {/*  Nút đăng xuất */}
            <LogoutButton theme={theme} onClick={handleLogout}>
              
              <span>Đăng xuất</span>
            </LogoutButton>
          </TopBarRight>
        </TopBar>

        <ContentArea>
          {children}
        </ContentArea>
      </MainContent>
    </LayoutWrapper>
  );
};

export default AdminLayout;