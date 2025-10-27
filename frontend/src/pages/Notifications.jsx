import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import LeftSidebar from '../components/LeftSidebar';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import { notificationService } from '../services/notificationService';
import {
  Notifications as NotificationsIcon,
  AccessTime,
  Star,
  EmojiEvents, 
  School,
  CheckCircle
} from '@mui/icons-material';

const PageWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%)'
    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e0 100%)'
  };
`;

const MainContent = styled.div`
  flex: 1;
  margin-left: 280px;
  padding: 2rem;
  min-width: 0;
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const NotificationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const NotificationCard = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid ${props => props.theme === 'dark'
    ? 'rgba(75, 85, 99, 0.3)'
    : 'rgba(229, 231, 235, 0.5)'
  };
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  }
`;

const NotificationHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const NotificationIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.color};
  color: white;
`;

const NotificationInfo = styled.div`
  flex: 1;
`;

const NotificationTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.25rem;
`;

const NotificationMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

// Add mock data
const mockNotifications = [
  {
    _id: '1',
    type: 'achievement',
    title: 'Chúc mừng! Bạn đã đạt được thành tích mới',
    message: 'Bạn đã hoàn thành 7 ngày học liên tiếp. Tiếp tục phát huy nhé!',
    createdAt: '2023-10-25T08:30:00.000Z'
  },
  {
    _id: '2',
    type: 'lesson',
    title: 'Bài học mới đã được mở khóa',
    message: 'Bài học "Giao tiếp cơ bản" đã sẵn sàng cho bạn.',
    createdAt: '2023-10-24T15:45:00.000Z'
  },
  {
    _id: '3',
    type: 'streak',
    title: 'Chuỗi học tập ấn tượng!',
    message: 'Bạn đã duy trì chuỗi học tập 5 ngày liên tiếp.',
    createdAt: '2023-10-24T10:00:00.000Z'
  }
];

const Notifications = () => {
  const [theme] = useState('light');
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    // Simulate API call with mock data
    const fetchMockNotifications = async () => {
      try {
        setLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setNotifications(mockNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        showToast('error', 'Lỗi', 'Không thể tải thông báo');
      } finally {
        setLoading(false);
      }
    };

    fetchMockNotifications();
  }, []);
  
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications();
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      showToast('error', 'Lỗi', 'Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'achievement': return <EmojiEvents />;
      case 'lesson': return <School />;
      case 'streak': return <Star />;
      default: return <CheckCircle />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'achievement': return '#f59e0b';
      case 'lesson': return '#1CB0F6';
      case 'streak': return '#58CC02';
      default: return '#6b7280';
    }
  };

  return (
    <PageWrapper theme={theme}>
      <Toast toast={toast} onClose={hideToast} />
      <LeftSidebar />
      <MainContent>
        <PageHeader>
          <Title theme={theme}>
            <NotificationsIcon /> Thông báo
          </Title>
        </PageHeader>

        <NotificationList>
          {loading ? (
            <LoadingState theme={theme}>Đang tải thông báo...</LoadingState>
          ) : notifications.length === 0 ? (
            <LoadingState theme={theme}>Không có thông báo nào</LoadingState>
          ) : (
            notifications.map(notification => (
              <NotificationCard key={notification._id} theme={theme}>
                <NotificationHeader>
                  <NotificationIcon color={getNotificationColor(notification.type)}>
                    {getNotificationIcon(notification.type)}
                  </NotificationIcon>
                  <NotificationInfo>
                    <NotificationTitle theme={theme}>
                      {notification.title}
                    </NotificationTitle>
                    <NotificationMeta theme={theme}>
                      <span>
                        <AccessTime sx={{ fontSize: 16, marginRight: '4px' }} />
                        {new Date(notification.createdAt).toLocaleString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </span>
                    </NotificationMeta>
                  </NotificationInfo>
                </NotificationHeader>
                <div>{notification.message}</div>
              </NotificationCard>
            ))
          )}
        </NotificationList>
      </MainContent>
    </PageWrapper>
  );
};

export default Notifications;