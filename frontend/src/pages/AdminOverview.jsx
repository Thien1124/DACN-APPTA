import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import AdminLayout from '../layouts/AdminLayout';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// ========== STYLED COMPONENTS ==========

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
    background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
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
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
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

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const WelcomeIllustration = styled.div`
  font-size: 8rem;
  z-index: 1;

  @media (max-width: 768px) {
    font-size: 6rem;
  }
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
  position: relative;
  overflow: hidden;
  cursor: pointer;
  animation: slideUp 0.6s ease;
  animation-delay: ${props => props.delay || '0s'};
  animation-fill-mode: both;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    height: 100px;
    background: ${props => props.color || '#58CC02'};
    opacity: 0.05;
    border-radius: 50%;
    transform: translate(30%, -30%);
  }
`;

const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: ${props => props.color || '#58CC02'}22;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-weight: 600;
`;

const StatTrend = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.positive ? '#10b981' : '#ef4444'};
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  display: flex;
  align-items: center;
  gap: 0.5rem;

  span:first-child {
    font-size: 1.5rem;
  }
`;

const ViewAllButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background: ${props => props.theme === 'dark' ? '#374151' : '#f3f4f6'};
  color: ${props => props.theme === 'dark' ? '#e5e7eb' : '#374151'};
  border: none;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.theme === 'dark' ? '#4B5563' : '#e5e7eb'};
    transform: translateY(-2px);
  }
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${props => props.theme === 'dark' ? '#1f2937' : '#f3f4f6'};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #58CC02;
    border-radius: 3px;
  }
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#f9fafb'};
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.theme === 'dark' ? '#374151' : '#f3f4f6'};
  }
`;

const ActivityIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.color || '#58CC02'}22;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
`;

const ActivityDescription = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  line-height: 1.4;
`;

const ActivityTime = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#6b7280' : '#9ca3af'};
  white-space: nowrap;
`;

const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const QuickActionCard = styled.div`
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
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
    border-color: ${props => props.color || '#58CC02'};
  }
`;

const QuickActionIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: ${props => props.color || '#58CC02'}22;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin: 0 auto 1rem;
`;

const QuickActionLabel = styled.div`
  font-weight: 600;
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#e5e7eb' : '#374151'};
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  span:first-child {
    font-size: 1.75rem;
  }
`;

// ========== COMPONENT ==========

const AdminOverview = () => {
  const navigate = useNavigate();
  const [theme] = useState('light');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };
    return new Intl.DateTimeFormat('vi-VN', options).format(date);
  };

  const stats = [
    {
      icon: '👥',
      value: '1,567',
      label: 'Tổng người dùng',
      trend: '+12.5%',
      positive: true,
      color: '#58CC02',
      delay: '0.1s',
      link: '/admin/users'
    },
    {
      icon: '🎓',
      value: '982',
      label: 'Học viên hoạt động',
      trend: '+8.3%',
      positive: true,
      color: '#1CB0F6',
      delay: '0.2s',
      link: '/admin/users'
    },
    {
      icon: '👨‍🏫',
      value: '45',
      label: 'Giảng viên',
      trend: '+3',
      positive: true,
      color: '#8b5cf6',
      delay: '0.3s',
      link: '/admin/teachers'
    },
    {
      icon: '📚',
      value: '234',
      label: 'Bài học',
      trend: '+15',
      positive: true,
      color: '#f59e0b',
      delay: '0.4s',
      link: '/admin/lessons'
    },
  ];

  const userGrowthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Người dùng mới',
        data: [120, 195, 230, 280, 350, 420, 520],
        borderColor: '#58CC02',
        backgroundColor: 'rgba(88, 204, 2, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const deckDistributionData = {
    labels: ['TOEIC', 'IELTS', 'Business', 'Daily', 'Others'],
    datasets: [
      {
        data: [850, 620, 480, 730, 543],
        backgroundColor: [
          '#58CC02',
          '#1CB0F6',
          '#8b5cf6',
          '#f59e0b',
          '#6b7280',
        ],
      },
    ],
  };

  const recentActivities = [
    {
      icon: '👤',
      color: '#58CC02',
      title: 'Người dùng mới đăng ký',
      description: 'Nguyen Van A đã tạo tài khoản mới',
      time: '5 phút trước'
    },
    {
      icon: '📝',
      color: '#1CB0F6',
      title: 'Bài test mới được tạo',
      description: 'TOEIC Full Test #15 đã được thêm vào hệ thống',
      time: '15 phút trước'
    },
    {
      icon: '🗂️',
      color: '#8b5cf6',
      title: 'Deck mới được duyệt',
      description: 'Business Vocabulary Advanced đã được phê duyệt',
      time: '30 phút trước'
    },
    {
      icon: '⚠️',
      color: '#ef4444',
      title: 'Cảnh báo bảo mật',
      description: '3 lần đăng nhập thất bại từ IP: 192.168.1.100',
      time: '1 giờ trước'
    },
    {
      icon: '✅',
      color: '#10b981',
      title: 'Backup hoàn tất',
      description: 'Sao lưu dữ liệu tự động đã hoàn thành',
      time: '2 giờ trước'
    },
  ];

  const quickActions = [
    {
      icon: '➕',
      label: 'Thêm người dùng',
      color: '#58CC02',
      action: () => navigate('/admin/users')
    },
    {
      icon: '📚',
      label: 'Tạo bài học',
      color: '#1CB0F6',
      action: () => navigate('/admin/lessons')
    },
    {
      icon: '📝',
      label: 'Tạo bài test',
      color: '#8b5cf6',
      action: () => navigate('/admin/exams')
    },
    {
      icon: '🔐',
      label: 'Xem Audit Log',
      color: '#f59e0b',
      action: () => navigate('/admin/audit-log')
    },
  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: theme === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  return (
    <AdminLayout pageTitle="📊 Tổng quan">
      <PageContainer>
        {/* Welcome Card */}
        <WelcomeCard theme={theme}>
          <WelcomeContent>
            <WelcomeTitle theme={theme}>
              Xin chào, vinhsonvlog! 👋
            </WelcomeTitle>
            <WelcomeSubtitle theme={theme}>
              Chào mừng trở lại với Admin Dashboard. Đây là tổng quan hệ thống của bạn.
            </WelcomeSubtitle>
            <DateTime theme={theme}>
              <span>🕐</span>
              {formatDateTime(currentTime)}
            </DateTime>
          </WelcomeContent>
          <WelcomeIllustration>🎯</WelcomeIllustration>
        </WelcomeCard>

        {/* Stats Grid */}
        <StatsGrid>
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              theme={theme}
              color={stat.color}
              delay={stat.delay}
              onClick={() => navigate(stat.link)}
            >
              <StatIcon color={stat.color}>{stat.icon}</StatIcon>
              <StatValue theme={theme}>{stat.value}</StatValue>
              <StatLabel theme={theme}>{stat.label}</StatLabel>
              <StatTrend positive={stat.positive}>
                <span>{stat.positive ? '↗' : '↘'}</span>
                {stat.trend}
              </StatTrend>
            </StatCard>
          ))}
        </StatsGrid>

        {/* Quick Actions */}
        <div>
          <SectionTitle theme={theme}>
            <span>⚡</span>
            Thao tác nhanh
          </SectionTitle>
          <QuickActionsGrid>
            {quickActions.map((action, index) => (
              <QuickActionCard
                key={index}
                theme={theme}
                color={action.color}
                onClick={action.action}
              >
                <QuickActionIcon color={action.color}>
                  {action.icon}
                </QuickActionIcon>
                <QuickActionLabel theme={theme}>
                  {action.label}
                </QuickActionLabel>
              </QuickActionCard>
            ))}
          </QuickActionsGrid>
        </div>

        {/* Charts and Activities */}
        <ContentGrid>
          <ChartCard theme={theme}>
            <CardHeader>
              <CardTitle theme={theme}>
                <span>📈</span>
                Tăng trưởng người dùng
              </CardTitle>
              <ViewAllButton theme={theme} onClick={() => navigate('/admin/statistics')}>
                Xem tất cả
              </ViewAllButton>
            </CardHeader>
            <Line data={userGrowthData} options={chartOptions} />
          </ChartCard>

          <ChartCard theme={theme}>
            <CardHeader>
              <CardTitle theme={theme}>
                <span>🗂️</span>
                Phân loại Deck
              </CardTitle>
            </CardHeader>
            <Doughnut data={deckDistributionData} options={doughnutOptions} />
          </ChartCard>
        </ContentGrid>

        {/* Recent Activities */}
        <ChartCard theme={theme}>
          <CardHeader>
            <CardTitle theme={theme}>
              <span>📋</span>
              Hoạt động gần đây
            </CardTitle>
            <ViewAllButton theme={theme} onClick={() => navigate('/admin/audit-log')}>
              Xem tất cả
            </ViewAllButton>
          </CardHeader>
          <ActivityList theme={theme}>
            {recentActivities.map((activity, index) => (
              <ActivityItem key={index} theme={theme}>
                <ActivityIcon color={activity.color}>
                  {activity.icon}
                </ActivityIcon>
                <ActivityContent>
                  <ActivityTitle theme={theme}>{activity.title}</ActivityTitle>
                  <ActivityDescription theme={theme}>
                    {activity.description}
                  </ActivityDescription>
                </ActivityContent>
                <ActivityTime theme={theme}>{activity.time}</ActivityTime>
              </ActivityItem>
            ))}
          </ActivityList>
        </ChartCard>
      </PageContainer>
    </AdminLayout>
  );
};

export default AdminOverview;