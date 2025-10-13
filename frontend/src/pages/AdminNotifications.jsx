import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Swal from 'sweetalert2';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import AdminLayout from '../layouts/AdminLayout';

// ========== STYLED COMPONENTS ==========
// (Tương tự TeacherNotifications, chỉ đổi màu sang gold/orange cho Admin)

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const WelcomeCard = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(135deg, #1f2937 0%, #111827 100%)' 
    : 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)'
  };
  border-radius: 24px;
  padding: 2rem;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 300px;
    height: 300px;
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    opacity: 0.05;
    border-radius: 50%;
    transform: translate(30%, -30%);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
`;

const WelcomeContent = styled.div`
  flex: 1;
  z-index: 1;
`;

const WelcomeTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.5rem;
`;

const WelcomeSubtitle = styled.p`
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-bottom: 1rem;
`;

const DateTime = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  span:first-child {
    font-size: 1rem;
  }
`;

const WelcomeIllustration = styled.div`
  font-size: 5rem;
  z-index: 1;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  }
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: ${props => props.color || '#f59e0b'}22;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-weight: 600;
`;

const ControlBar = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const FilterButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 10px;
  border: 2px solid ${props => {
    if (props.active) return '#f59e0b';
    return props.theme === 'dark' ? '#374151' : '#e5e7eb';
  }};
  background: ${props => {
    if (props.active) return 'rgba(245, 158, 11, 0.1)';
    return 'transparent';
  }};
  color: ${props => {
    if (props.active) return '#f59e0b';
    return props.theme === 'dark' ? '#9ca3af' : '#6b7280';
  }};
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #f59e0b;
    transform: translateY(-2px);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 10px;
  background: ${props => {
    if (props.variant === 'primary') return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
    if (props.variant === 'danger') return 'rgba(239, 68, 68, 0.1)';
    return props.theme === 'dark' ? '#374151' : '#f3f4f6';
  }};
  color: ${props => {
    if (props.variant === 'primary') return 'white';
    if (props.variant === 'danger') return '#ef4444';
    return props.theme === 'dark' ? '#e5e7eb' : '#374151';
  }};
  border: none;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const NotificationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const NotificationCard = styled.div`
  background: ${props => {
    if (!props.read) {
      return props.theme === 'dark' 
        ? 'rgba(245, 158, 11, 0.05)' 
        : 'rgba(245, 158, 11, 0.03)';
    }
    return props.theme === 'dark' 
      ? 'rgba(31, 41, 55, 0.8)' 
      : 'rgba(255, 255, 255, 0.9)';
  }};
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem;
  border: 1px solid ${props => {
    if (!props.read) return 'rgba(245, 158, 11, 0.3)';
    return props.theme === 'dark' 
      ? 'rgba(75, 85, 99, 0.3)' 
      : 'rgba(229, 231, 235, 0.5)';
  }};
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  gap: 1rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;

const NotificationIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${props => props.color || '#f59e0b'}22;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const NotificationContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.5rem;
`;

const NotificationTitle = styled.h3`
  font-size: 1rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin: 0;
`;

const NotificationTime = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  white-space: nowrap;
`;

const NotificationMessage = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#d1d5db' : '#4b5563'};
  margin: 0;
  line-height: 1.5;
`;

const NotificationBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: bold;
  background: ${props => props.color || '#f59e0b'}22;
  color: ${props => props.color || '#f59e0b'};
  margin-top: 0.5rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
`;

const EmptyIcon = styled.div`
  font-size: 5rem;
  margin-bottom: 1rem;
  opacity: 0.5;
`;

const EmptyText = styled.div`
  font-size: 1.25rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-weight: 600;
`;

// ========== MOCK DATA ==========

const mockNotifications = [
  {
    id: 1,
    type: 'security',
    icon: '🔒',
    color: '#ef4444',
    title: 'Cảnh báo bảo mật',
    message: '5 lần đăng nhập thất bại từ IP: 192.168.1.200. Tài khoản đã bị khóa tạm thời',
    time: '5 phút trước',
    read: false,
  },
  {
    id: 2,
    type: 'user',
    icon: '👤',
    color: '#1CB0F6',
    title: 'Người dùng mới',
    message: '15 người dùng mới đã đăng ký trong 1 giờ qua',
    time: '15 phút trước',
    read: false,
  },
  {
    id: 3,
    type: 'system',
    icon: '⚙️',
    color: '#6b7280',
    title: 'Backup hoàn tất',
    message: 'Sao lưu dữ liệu tự động đã hoàn thành thành công lúc 12:00 UTC',
    time: '30 phút trước',
    read: false,
  },
  {
    id: 4,
    type: 'report',
    icon: '📊',
    color: '#f59e0b',
    title: 'Báo cáo vi phạm',
    message: 'Có 3 báo cáo vi phạm nội dung cần xem xét',
    time: '1 giờ trước',
    read: true,
  },
  {
    id: 5,
    type: 'payment',
    icon: '💳',
    color: '#10b981',
    title: 'Giao dịch thành công',
    message: '25 giao dịch nâng cấp Premium trong ngày hôm nay',
    time: '2 giờ trước',
    read: true,
  },
];

// ========== COMPONENT ==========

const AdminNotifications = () => {
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState('all');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date) => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`;
  };

  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    security: notifications.filter(n => n.type === 'security').length,
    system: notifications.filter(n => n.type === 'system').length,
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    showToast('success', 'Thành công!', 'Đã đánh dấu tất cả là đã đọc');
  };

  const handleClearAll = () => {
    Swal.fire({
      title: 'Xóa tất cả thông báo?',
      text: 'Bạn có chắc muốn xóa tất cả thông báo?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Xóa tất cả',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        setNotifications([]);
        showToast('success', 'Đã xóa!', 'Tất cả thông báo đã được xóa');
      }
    });
  };

  const handleNotificationClick = (notification) => {
    handleMarkAsRead(notification.id);
    Swal.fire({
      icon: 'info',
      title: notification.title,
      text: notification.message,
      confirmButtonColor: '#f59e0b',
    });
  };

  return (
    <AdminLayout pageTitle="🔔 Thông báo">
      <Toast toast={toast} onClose={hideToast} />
      
      <PageContainer>
        {/* Welcome Card */}
        <WelcomeCard theme={theme}>
          <WelcomeContent>
            <WelcomeTitle theme={theme}>
              Xin chào, vinhsonvlog! 👋
            </WelcomeTitle>
            <WelcomeSubtitle theme={theme}>
              Bạn có {stats.unread} thông báo hệ thống chưa đọc
            </WelcomeSubtitle>
            <DateTime theme={theme}>
              <span>🕐</span>
              {formatDateTime(currentTime)}
            </DateTime>
          </WelcomeContent>
          <WelcomeIllustration>🔔</WelcomeIllustration>
        </WelcomeCard>

        {/* Stats */}
        <StatsGrid>
          <StatCard theme={theme}>
            <StatIcon color="#f59e0b">📬</StatIcon>
            <StatValue theme={theme}>{stats.total}</StatValue>
            <StatLabel theme={theme}>Tổng thông báo</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#ef4444">🔴</StatIcon>
            <StatValue theme={theme}>{stats.unread}</StatValue>
            <StatLabel theme={theme}>Chưa đọc</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#ef4444">🔒</StatIcon>
            <StatValue theme={theme}>{stats.security}</StatValue>
            <StatLabel theme={theme}>Bảo mật</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#6b7280">⚙️</StatIcon>
            <StatValue theme={theme}>{stats.system}</StatValue>
            <StatLabel theme={theme}>Hệ thống</StatLabel>
          </StatCard>
        </StatsGrid>

        {/* Control Bar */}
        <ControlBar theme={theme}>
          <FilterButtons>
            <FilterButton
              theme={theme}
              active={filter === 'all'}
              onClick={() => setFilter('all')}
            >
              Tất cả
            </FilterButton>
            <FilterButton
              theme={theme}
              active={filter === 'unread'}
              onClick={() => setFilter('unread')}
            >
              Chưa đọc
            </FilterButton>
            <FilterButton
              theme={theme}
              active={filter === 'security'}
              onClick={() => setFilter('security')}
            >
              🔒 Bảo mật
            </FilterButton>
            <FilterButton
              theme={theme}
              active={filter === 'system'}
              onClick={() => setFilter('system')}
            >
              ⚙️ Hệ thống
            </FilterButton>
            <FilterButton
              theme={theme}
              active={filter === 'report'}
              onClick={() => setFilter('report')}
            >
              📊 Báo cáo
            </FilterButton>
          </FilterButtons>
          
          <ActionButtons>
            <ActionButton
              theme={theme}
              variant="primary"
              onClick={handleMarkAllAsRead}
            >
              ✅ Đánh dấu tất cả đã đọc
            </ActionButton>
            <ActionButton
              theme={theme}
              variant="danger"
              onClick={handleClearAll}
            >
              🗑️ Xóa tất cả
            </ActionButton>
          </ActionButtons>
        </ControlBar>

        {/* Notifications List */}
        {filteredNotifications.length > 0 ? (
          <NotificationsList>
            {filteredNotifications.map(notification => (
              <NotificationCard
                key={notification.id}
                theme={theme}
                read={notification.read}
                onClick={() => handleNotificationClick(notification)}
              >
                <NotificationIcon color={notification.color}>
                  {notification.icon}
                </NotificationIcon>
                <NotificationContent>
                  <NotificationHeader>
                    <NotificationTitle theme={theme}>
                      {notification.title}
                    </NotificationTitle>
                    <NotificationTime theme={theme}>
                      {notification.time}
                    </NotificationTime>
                  </NotificationHeader>
                  <NotificationMessage theme={theme}>
                    {notification.message}
                  </NotificationMessage>
                  <NotificationBadge color={notification.color}>
                    {notification.type}
                  </NotificationBadge>
                </NotificationContent>
              </NotificationCard>
            ))}
          </NotificationsList>
        ) : (
          <EmptyState>
            <EmptyIcon>🔔</EmptyIcon>
            <EmptyText theme={theme}>
              Không có thông báo nào
            </EmptyText>
          </EmptyState>
        )}
      </PageContainer>
    </AdminLayout>
  );
};

export default AdminNotifications;