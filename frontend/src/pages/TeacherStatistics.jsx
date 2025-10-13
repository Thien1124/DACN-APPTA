import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import TeacherLayout from '../layouts/TeacherLayout';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
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
  RadialLinearScale,
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
  animation: slideUp 0.6s ease;
  animation-delay: ${props => props.delay || '0s'};
  animation-fill-mode: both;
  position: relative;
  overflow: hidden;
  cursor: pointer;

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

const FilterBar = styled.div`
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
  gap: 1rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  border: 2px solid ${props => {
    if (props.active) return '#8b5cf6';
    return props.theme === 'dark' ? '#374151' : '#e5e7eb';
  }};
  background: ${props => {
    if (props.active) return 'rgba(139, 92, 246, 0.1)';
    return props.theme === 'dark' ? '#1f2937' : '#ffffff';
  }};
  color: ${props => {
    if (props.active) return '#8b5cf6';
    return props.theme === 'dark' ? '#e5e7eb' : '#374151';
  }};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #8b5cf6;
    transform: translateY(-2px);
  }
`;

const ExportButton = styled.button`
  margin-left: auto;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #1CB0F6 0%, #0891b2 100%);
  color: white;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(28, 176, 246, 0.3);
  }
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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
`;

const InsightsSection = styled.div`
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

const InsightsList = styled.div`
  display: grid;
  gap: 1rem;
`;

const InsightItem = styled.div`
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

const InsightIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.color || '#8b5cf6'}22;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
`;

const InsightContent = styled.div`
  flex: 1;
`;

const InsightTitle = styled.div`
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
`;

const InsightDescription = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  line-height: 1.4;
`;

// ========== COMPONENT ==========

const TeacherStatistics = () => {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [timeFilter, setTimeFilter] = useState('7days');
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
      hour12: false,
      timeZone: 'UTC'
    };
    return new Intl.DateTimeFormat('vi-VN', options).format(date) + ' UTC';
  };

  const stats = [
    {
      icon: '👥',
      value: '127',
      label: 'Tổng học viên',
      trend: '+12 tuần này',
      positive: true,
      color: '#8b5cf6',
      delay: '0.1s',
    },
    {
      icon: '✅',
      value: '85%',
      label: 'Tỷ lệ hoàn thành',
      trend: '+5%',
      positive: true,
      color: '#10b981',
      delay: '0.2s',
    },
    {
      icon: '📊',
      value: '78',
      label: 'Điểm TB',
      trend: '+3 điểm',
      positive: true,
      color: '#1CB0F6',
      delay: '0.3s',
    },
    {
      icon: '⏱️',
      value: '42h',
      label: 'Thời gian học TB',
      trend: '+8h',
      positive: true,
      color: '#f59e0b',
      delay: '0.4s',
    },
  ];

  // Student Engagement Data
  const engagementData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Học viên hoạt động',
        data: [85, 92, 88, 105, 98, 75, 68],
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Class Performance Data
  const performanceData = {
    labels: ['TOEIC Basic', 'Business English', 'IELTS Speaking', 'Grammar'],
    datasets: [
      {
        label: 'Điểm trung bình',
        data: [82, 76, 88, 79],
        backgroundColor: [
          'rgba(88, 204, 2, 0.6)',
          'rgba(28, 176, 246, 0.6)',
          'rgba(139, 92, 246, 0.6)',
          'rgba(245, 158, 11, 0.6)',
        ],
      },
    ],
  };

  // Assignment Completion Data
  const completionData = {
    labels: ['Hoàn thành', 'Đang làm', 'Chưa làm', 'Quá hạn'],
    datasets: [
      {
        data: [65, 20, 10, 5],
        backgroundColor: ['#10b981', '#1CB0F6', '#f59e0b', '#ef4444'],
      },
    ],
  };

  // Skills Assessment Data
  const skillsData = {
    labels: ['Grammar', 'Vocabulary', 'Listening', 'Reading', 'Speaking', 'Writing'],
    datasets: [
      {
        label: 'Điểm TB hiện tại',
        data: [78, 82, 75, 85, 72, 80],
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
      },
      {
        label: 'Mục tiêu',
        data: [85, 90, 85, 90, 85, 85],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
      },
    ],
  };

  const insights = [
    {
      icon: '🎯',
      color: '#10b981',
      title: 'Hiệu suất cao',
      description: 'Lớp IELTS Speaking có điểm TB cao nhất (88 điểm), tăng 12% so với tháng trước',
    },
    {
      icon: '⚠️',
      color: '#f59e0b',
      title: 'Cần chú ý',
      description: '15% học viên chưa nộp bài tập. Gửi thông báo nhắc nhở tự động',
    },
    {
      icon: '📈',
      color: '#1CB0F6',
      title: 'Xu hướng tích cực',
      description: 'Tỷ lệ hoàn thành bài học tăng 18% trong 2 tuần qua',
    },
    {
      icon: '💡',
      color: '#8b5cf6',
      title: 'Gợi ý',
      description: 'Kỹ năng Speaking cần cải thiện. Nên tăng số bài tập thực hành',
    },
  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
    },
  };

  const handleExport = () => {
    showToast('info', 'Đang xuất', 'Đang tạo báo cáo thống kê...');
    setTimeout(() => {
      showToast('success', 'Thành công!', 'Báo cáo đã được xuất');
    }, 1500);
  };

  return (
    <TeacherLayout pageTitle="📈 Thống kê">
      <Toast toast={toast} onClose={hideToast} />
      
      <PageContainer>
        {/* Welcome Card */}
        <WelcomeCard theme={theme}>
          <WelcomeContent>
            <WelcomeTitle theme={theme}>
              Xin chào, vinhsonvlog! 👋
            </WelcomeTitle>
            <WelcomeSubtitle theme={theme}>
              Đây là tổng quan thống kê về các lớp học của bạn
            </WelcomeSubtitle>
            <DateTime theme={theme}>
              <span>🕐</span>
              {formatDateTime(currentTime)}
            </DateTime>
          </WelcomeContent>
          <WelcomeIllustration>📊</WelcomeIllustration>
        </WelcomeCard>

        {/* Filter Bar */}
        <FilterBar theme={theme}>
          <FilterButton
            theme={theme}
            active={timeFilter === '7days'}
            onClick={() => setTimeFilter('7days')}
          >
            7 ngày
          </FilterButton>
          <FilterButton
            theme={theme}
            active={timeFilter === '30days'}
            onClick={() => setTimeFilter('30days')}
          >
            30 ngày
          </FilterButton>
          <FilterButton
            theme={theme}
            active={timeFilter === '90days'}
            onClick={() => setTimeFilter('90days')}
          >
            90 ngày
          </FilterButton>
          <FilterButton
            theme={theme}
            active={timeFilter === 'year'}
            onClick={() => setTimeFilter('year')}
          >
            1 năm
          </FilterButton>
          <ExportButton onClick={handleExport}>
            <span>📥</span>
            Xuất báo cáo
          </ExportButton>
        </FilterBar>

        {/* Stats Cards */}
        <StatsGrid>
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              theme={theme}
              color={stat.color}
              delay={stat.delay}
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

        {/* Charts Grid */}
        <ChartsGrid>
          <ChartCard theme={theme}>
            <CardHeader>
              <CardTitle theme={theme}>
                <span>📈</span>
                Học viên hoạt động theo ngày
              </CardTitle>
            </CardHeader>
            <Line data={engagementData} options={chartOptions} />
          </ChartCard>

          <ChartCard theme={theme}>
            <CardHeader>
              <CardTitle theme={theme}>
                <span>📊</span>
                Điểm TB theo lớp
              </CardTitle>
            </CardHeader>
            <Bar data={performanceData} options={chartOptions} />
          </ChartCard>

          <ChartCard theme={theme}>
            <CardHeader>
              <CardTitle theme={theme}>
                <span>✅</span>
                Tỷ lệ hoàn thành bài tập
              </CardTitle>
            </CardHeader>
            <Doughnut data={completionData} options={chartOptions} />
          </ChartCard>

          <ChartCard theme={theme}>
            <CardHeader>
              <CardTitle theme={theme}>
                <span>🎯</span>
                Đánh giá kỹ năng
              </CardTitle>
            </CardHeader>
            <Radar data={skillsData} options={chartOptions} />
          </ChartCard>
        </ChartsGrid>

        {/* Insights Section */}
        <InsightsSection theme={theme}>
          <CardTitle theme={theme} style={{ marginBottom: '1.5rem' }}>
            <span>💡</span>
            Insights & Recommendations
          </CardTitle>
          <InsightsList>
            {insights.map((insight, index) => (
              <InsightItem key={index} theme={theme}>
                <InsightIcon color={insight.color}>
                  {insight.icon}
                </InsightIcon>
                <InsightContent>
                  <InsightTitle theme={theme}>{insight.title}</InsightTitle>
                  <InsightDescription theme={theme}>
                    {insight.description}
                  </InsightDescription>
                </InsightContent>
              </InsightItem>
            ))}
          </InsightsList>
        </InsightsSection>
      </PageContainer>
    </TeacherLayout>
  );
};

export default TeacherStatistics;