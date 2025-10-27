import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Notifications, 
  Add,
  Send,
  Delete,
  Person,
  AccessTime
} from '@mui/icons-material';
import AdminLayout from '../layouts/AdminLayout';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';

// ========== STYLED COMPONENTS ==========

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
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

const CreateButton = styled.button`
  background: #58CC02;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(88, 204, 2, 0.3);
  }
`;

const NotificationList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
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
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-4px);
  }
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const NotificationTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
`;

const NotificationMeta = styled.div`
  display: flex;
  gap: 1rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-size: 0.875rem;
  margin-bottom: 0.5rem;

  span {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
`;

const NotificationContent = styled.p`
  color: ${props => props.theme === 'dark' ? '#d1d5db' : '#4b5563'};
  font-size: 0.875rem;
  line-height: 1.6;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.variant === 'delete' ? '#ef4444' : '#1CB0F6'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

// ========== COMPONENT ==========

const mockNotifications = [
  {
    id: 1,
    title: 'Cập nhật hệ thống',
    content: 'Hệ thống sẽ bảo trì vào ngày 30/10/2023',
    sender: 'Admin',
    timestamp: '2023-10-25 10:00:00'
  },
  {
    id: 2,
    title: 'Khóa học mới',
    content: 'Khóa học TOEIC đã được thêm vào hệ thống',
    sender: 'Admin',
    timestamp: '2023-10-25 11:30:00'
  }
];

const AdminNotifications = () => {
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [loading] = useState(false);
  
  if (loading) {
    return (
      <AdminLayout pageTitle="Thông báo">
        <LoadingText theme={theme}>Đang tải dữ liệu...</LoadingText>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Thông báo">
      <Toast toast={toast} onClose={hideToast} />
      
      <PageHeader>
        <Title theme={theme}>
          <Notifications /> Quản lý thông báo
        </Title>
        <CreateButton>
          <Add /> Tạo thông báo
        </CreateButton>
      </PageHeader>

      <NotificationList>
        {mockNotifications.map(notification => (
          <NotificationCard key={notification.id} theme={theme}>
            <NotificationHeader>
              <NotificationTitle theme={theme}>
                {notification.title}
              </NotificationTitle>
            </NotificationHeader>
            <NotificationMeta theme={theme}>
              <span>
                <Person sx={{ fontSize: 18 }} />
                {notification.sender}
              </span>
              <span>
                <AccessTime sx={{ fontSize: 18 }} />
                {notification.timestamp}
              </span>
            </NotificationMeta>
            <NotificationContent theme={theme}>
              {notification.content}
            </NotificationContent>
            <ActionButtons>
              <ActionButton>
                <Send sx={{ fontSize: 18 }} /> Gửi lại
              </ActionButton>
              <ActionButton variant="delete">
                <Delete sx={{ fontSize: 18 }} /> Xóa
              </ActionButton>
            </ActionButtons>
          </NotificationCard>
        ))}
      </NotificationList>
    </AdminLayout>
  );
};

export default AdminNotifications;