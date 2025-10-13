import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import TeacherLayout from '../layouts/TeacherLayout';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// ========== STYLED COMPONENTS ==========
// ✅ XÓA: PageWrapper, Header (đã có trong TeacherLayout)

const WelcomeCard = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(135deg, #1f2937 0%, #111827 100%)' 
    : 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)'
  };
  border-radius: 24px;
  padding: 2rem;
  margin-bottom: 2rem;
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
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
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
`;

const WelcomeSubtitle = styled.p`
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-bottom: 1rem;
`;

const WelcomeIllustration = styled.div`
  font-size: 6rem;
  z-index: 1;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;

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

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
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

const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;

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

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;

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

const ChartTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ClassesSection = styled.div`
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

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
  }
`;

const ClassesList = styled.div`
  display: grid;
  gap: 1rem;
`;

const ClassItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#f9fafb'};
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    background: ${props => props.theme === 'dark' ? '#374151' : '#f3f4f6'};
    transform: translateX(5px);
  }
`;

const ClassIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: ${props => props.color || '#58CC02'}22;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const ClassInfo = styled.div`
  flex: 1;
`;

const ClassName = styled.div`
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.25rem;
`;

const ClassMeta = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  display: flex;
  gap: 1rem;
`;

const ClassProgress = styled.div`
  width: 120px;
  text-align: right;
`;

const ProgressLabel = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-bottom: 0.25rem;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${props => props.progress}%;
  background: linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
`;

// ========== COMPONENT ==========

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');

  const stats = [
    {
      icon: '🎓',
      value: '4',
      label: 'Lớp học',
      trend: '+1 tháng này',
      positive: true,
      color: '#8b5cf6',
      link: '/teacher/classroom'
    },
    {
      icon: '👥',
      value: '127',
      label: 'Học viên',
      trend: '+12 tuần này',
      positive: true,
      color: '#1CB0F6',
      link: '/teacher/students'
    },
    {
      icon: '🗂️',
      value: '23',
      label: 'Deck đã giao',
      trend: '+5 tuần này',
      positive: true,
      color: '#58CC02',
      link: '/teacher/decks'
    },
    {
      icon: '📝',
      value: '15',
      label: 'Quiz đã tạo',
      trend: '+3 tuần này',
      positive: true,
      color: '#f59e0b',
      link: '/teacher/quiz-bank'
    },
  ];

  const quickActions = [
    {
      icon: '➕',
      label: 'Tạo lớp mới',
      color: '#8b5cf6',
      action: () => navigate('/teacher/classroom')
    },
    {
      icon: '🗂️',
      label: 'Giao deck',
      color: '#58CC02',
      action: () => navigate('/teacher/assign-deck')
    },
    {
      icon: '📝',
      label: 'Tạo quiz',
      color: '#f59e0b',
      action: () => navigate('/teacher/quiz-bank')
    },
    {
      icon: '🤖',
      label: 'AI tạo thẻ',
      color: '#1CB0F6',
      action: () => navigate('/teacher/ai-cards')
    },
  ];

  const engagementData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Số học viên hoạt động',
        data: [45, 52, 48, 65, 58, 42, 38],
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const completionData = {
    labels: ['Hoàn thành', 'Đang học', 'Chưa bắt đầu'],
    datasets: [
      {
        data: [68, 24, 8],
        backgroundColor: ['#10b981', '#f59e0b', '#6b7280'],
      },
    ],
  };

  const topicsData = {
    labels: ['Grammar', 'Vocabulary', 'Listening', 'Reading', 'Speaking'],
    datasets: [
      {
        label: 'Tỷ lệ sai (%)',
        data: [15, 22, 18, 12, 25],
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
      },
    ],
  };

  const recentClasses = [
    {
      id: 1,
      name: 'TOEIC Basic - Morning',
      students: 28,
      progress: 75,
      icon: '📚',
      color: '#58CC02'
    },
    {
      id: 2,
      name: 'Business English',
      students: 15,
      progress: 62,
      icon: '💼',
      color: '#1CB0F6'
    },
    {
      id: 3,
      name: 'IELTS Speaking',
      students: 20,
      progress: 45,
      icon: '🎤',
      color: '#8b5cf6'
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
  };

  return (
    <TeacherLayout pageTitle="📊 Tổng quan">
      <Toast toast={toast} onClose={hideToast} />

      {/* Welcome Card */}
      <WelcomeCard theme={theme}>
        <WelcomeContent>
          <WelcomeTitle theme={theme}>
            Xin chào, vinhsonvlog! 👋
          </WelcomeTitle>
          <WelcomeSubtitle theme={theme}>
            Chào mừng trở lại với Teacher Dashboard. Hôm nay bạn có 8 thông báo mới.
          </WelcomeSubtitle>
        </WelcomeContent>
        <WelcomeIllustration>👨‍🏫</WelcomeIllustration>
      </WelcomeCard>

      {/* Stats */}
      <StatsGrid>
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            theme={theme}
            color={stat.color}
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

      {/* Charts */}
      <ChartsGrid>
        <ChartCard theme={theme}>
          <ChartTitle theme={theme}>
            <span>📈</span>
            Học viên hoạt động theo ngày
          </ChartTitle>
          <Line data={engagementData} options={chartOptions} />
        </ChartCard>

        <ChartCard theme={theme}>
          <ChartTitle theme={theme}>
            <span>📊</span>
            Tỷ lệ hoàn thành
          </ChartTitle>
          <Doughnut data={completionData} options={chartOptions} />
        </ChartCard>
      </ChartsGrid>

      {/* Charts Row 2 */}
      <ChartCard theme={theme} style={{ marginBottom: '2rem' }}>
        <ChartTitle theme={theme}>
          <span>⚠️</span>
          Chủ đề hay sai nhất
        </ChartTitle>
        <Bar data={topicsData} options={chartOptions} />
      </ChartCard>

      {/* Recent Classes */}
      <ClassesSection theme={theme}>
        <SectionHeader>
          <SectionTitle theme={theme}>
            <span>🎓</span>
            Lớp học gần đây
          </SectionTitle>
          <ViewAllButton theme={theme} onClick={() => navigate('/teacher/classroom')}>
            Xem tất cả
          </ViewAllButton>
        </SectionHeader>
        <ClassesList>
          {recentClasses.map(classItem => (
            <ClassItem
              key={classItem.id}
              theme={theme}
              onClick={() => navigate(`/teacher/class/${classItem.id}`)}
            >
              <ClassIcon color={classItem.color}>
                {classItem.icon}
              </ClassIcon>
              <ClassInfo>
                <ClassName theme={theme}>{classItem.name}</ClassName>
                <ClassMeta theme={theme}>
                  <span>👥 {classItem.students} học viên</span>
                </ClassMeta>
              </ClassInfo>
              <ClassProgress>
                <ProgressLabel theme={theme}>
                  Tiến độ: {classItem.progress}%
                </ProgressLabel>
                <ProgressBar theme={theme}>
                  <ProgressFill progress={classItem.progress} />
                </ProgressBar>
              </ClassProgress>
            </ClassItem>
          ))}
        </ClassesList>
      </ClassesSection>
    </TeacherLayout>
  );
};

export default TeacherDashboard;