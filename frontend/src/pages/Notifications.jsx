import React, { useState } from 'react';
import styled from 'styled-components';
import Swal from 'sweetalert2';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import Header from '../components/Header';

// ========== STYLED COMPONENTS ==========

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%)'
    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e0 100%)'
  };
`;

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const PageSubtitle = styled.p`
  font-size: 1.125rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const StatsBar = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.color || '#58CC02'};
  margin-bottom: 0.5rem;
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
  margin-bottom: 2rem;
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
    if (props.active) return '#58CC02';
    return props.theme === 'dark' ? '#374151' : '#e5e7eb';
  }};
  background: ${props => {
    if (props.active) return 'rgba(88, 204, 2, 0.1)';
    return 'transparent';
  }};
  color: ${props => {
    if (props.active) return '#58CC02';
    return props.theme === 'dark' ? '#9ca3af' : '#6b7280';
  }};
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #58CC02;
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
    if (props.variant === 'primary') return 'linear-gradient(135deg, #58CC02 0%, #45a302 100%)';
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
        ? 'rgba(88, 204, 2, 0.05)' 
        : 'rgba(88, 204, 2, 0.03)';
    }
    return props.theme === 'dark' 
      ? 'rgba(31, 41, 55, 0.8)' 
      : 'rgba(255, 255, 255, 0.9)';
  }};
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem;
  border: 1px solid ${props => {
    if (!props.read) return 'rgba(88, 204, 2, 0.3)';
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
  background: ${props => props.color || '#58CC02'}22;
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
  background: ${props => props.color || '#58CC02'}22;
  color: ${props => props.color || '#58CC02'};
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
    type: 'assignment',
    icon: '📝',
    color: '#f59e0b',
    title: 'Bài tập mới',
    message: 'Bài tập "TOEIC Reading Practice" đã được giao. Hạn nộp: 15/10/2025',
    time: '5 phút trước',
    read: false,
  },
  {
    id: 2,
    type: 'grade',
    icon: '⭐',
    color: '#58CC02',
    title: 'Kết quả bài kiểm tra',
    message: 'Bạn đã đạt 95/100 điểm trong bài kiểm tra "Grammar Test #5". Xuất sắc!',
    time: '1 giờ trước',
    read: false,
  },
  {
    id: 3,
    type: 'streak',
    icon: '🔥',
    color: '#ef4444',
    title: 'Chuỗi học tập 7 ngày!',
    message: 'Chúc mừng! Bạn đã duy trì chuỗi học tập 7 ngày liên tiếp. Tiếp tục phát huy!',
    time: '3 giờ trước',
    read: true,
  },
  {
    id: 4,
    type: 'lesson',
    icon: '📚',
    color: '#1CB0F6',
    title: 'Bài học mới',
    message: 'Bài học "Present Perfect Tense" đã được mở khóa. Bắt đầu học ngay!',
    time: '1 ngày trước',
    read: true,
  },
  {
    id: 5,
    type: 'achievement',
    icon: '🏆',
    color: '#8b5cf6',
    title: 'Thành tựu mới',
    message: 'Bạn đã mở khóa thành tựu "Vocabulary Master" - Học 500 từ vựng mới',
    time: '2 ngày trước',
    read: true,
  },
];

// ========== COMPONENT ==========

const Notifications = () => {
  const { toast, showToast, hideToast } = useToast();
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState('all');

  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    today: notifications.filter(n => n.time.includes('phút') || n.time.includes('giờ')).length,
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

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
      confirmButtonColor: '#58CC02',
    });
  };

  return (
    <PageWrapper theme={theme}>
      <Toast toast={toast} onClose={hideToast} />

      <Header
        theme={theme}
        onThemeToggle={toggleTheme}
        userName="vinhsonvlog"
        userEmail="student@example.com"
        notificationCount={stats.unread}
        showNotification={true}
        showAvatar={true}
      />

      <DashboardContainer>
        <PageHeader>
          <PageTitle theme={theme}>
            <span>🔔</span>
            Thông báo
          </PageTitle>
          <PageSubtitle theme={theme}>
            Quản lý tất cả thông báo của bạn
          </PageSubtitle>
        </PageHeader>

        {/* Stats Bar */}
        <StatsBar theme={theme}>
          <StatItem>
            <StatValue color="#58CC02">{stats.total}</StatValue>
            <StatLabel theme={theme}>Tổng thông báo</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue color="#ef4444">{stats.unread}</StatValue>
            <StatLabel theme={theme}>Chưa đọc</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue color="#1CB0F6">{stats.today}</StatValue>
            <StatLabel theme={theme}>Hôm nay</StatLabel>
          </StatItem>
        </StatsBar>

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
              active={filter === 'assignment'}
              onClick={() => setFilter('assignment')}
            >
              📝 Bài tập
            </FilterButton>
            <FilterButton
              theme={theme}
              active={filter === 'grade'}
              onClick={() => setFilter('grade')}
            >
              ⭐ Điểm số
            </FilterButton>
            <FilterButton
              theme={theme}
              active={filter === 'achievement'}
              onClick={() => setFilter('achievement')}
            >
              🏆 Thành tựu
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
      </DashboardContainer>
    </PageWrapper>
  );
};

export default Notifications;