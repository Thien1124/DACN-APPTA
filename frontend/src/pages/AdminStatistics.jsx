import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import AdminLayout from '../layouts/AdminLayout';
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

const ChartTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
    if (props.active) return '#58CC02';
    return props.theme === 'dark' ? '#374151' : '#e5e7eb';
  }};
  background: ${props => {
    if (props.active) return 'rgba(88, 204, 2, 0.1)';
    return props.theme === 'dark' ? '#1f2937' : '#ffffff';
  }};
  color: ${props => {
    if (props.active) return '#58CC02';
    return props.theme === 'dark' ? '#e5e7eb' : '#374151';
  }};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #58CC02;
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

// ========== COMPONENT ==========

const AdminStatistics = () => {
  const [theme] = useState('light');
  const [timeFilter, setTimeFilter] = useState('7days');

  const stats = {
    totalUsers: { value: 1567, trend: '+12.5%', positive: true },
    activeUsers: { value: 982, trend: '+8.3%', positive: true },
    totalDecks: { value: 4523, trend: '+15.2%', positive: true },
    completionRate: { value: '78%', trend: '-2.1%', positive: false },
  };

  // User Growth Chart Data
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
      {
        label: 'Người dùng hoạt động',
        data: [80, 140, 180, 220, 280, 340, 420],
        borderColor: '#1CB0F6',
        backgroundColor: 'rgba(28, 176, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Deck Usage Chart Data
  const deckUsageData = {
    labels: ['TOEIC', 'IELTS', 'Business', 'Daily', 'Academic', 'Others'],
    datasets: [
      {
        label: 'Số lượng deck',
        data: [850, 620, 480, 730, 540, 303],
        backgroundColor: [
          '#58CC02',
          '#1CB0F6',
          '#8b5cf6',
          '#f59e0b',
          '#10b981',
          '#6b7280',
        ],
      },
    ],
  };

  // Completion Rate Chart Data
  const completionRateData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Tỷ lệ hoàn thành (%)',
        data: [65, 72, 78, 75],
        backgroundColor: 'rgba(88, 204, 2, 0.6)',
      },
    ],
  };

  // AI Performance Data
  const aiPerformanceData = {
    labels: ['Độ chính xác', 'Tốc độ', 'Đa dạng', 'Phù hợp', 'Sáng tạo'],
    datasets: [
      {
        label: 'AI Hiện tại',
        data: [85, 90, 75, 88, 82],
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
      },
      {
        label: 'Mục tiêu',
        data: [90, 95, 85, 90, 85],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
      },
    ],
  };

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
    alert('Xuất báo cáo thống kê...');
  };

  return (
    <AdminLayout pageTitle="📊 Thống kê hệ thống">
      <PageContainer>
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
          <StatCard theme={theme} color="#58CC02">
            <StatIcon color="#58CC02">👥</StatIcon>
            <StatValue theme={theme}>{stats.totalUsers.value}</StatValue>
            <StatLabel theme={theme}>Tổng người dùng</StatLabel>
            <StatTrend positive={stats.totalUsers.positive}>
              <span>{stats.totalUsers.positive ? '↗' : '↘'}</span>
              {stats.totalUsers.trend}
            </StatTrend>
          </StatCard>

          <StatCard theme={theme} color="#1CB0F6">
            <StatIcon color="#1CB0F6">✅</StatIcon>
            <StatValue theme={theme}>{stats.activeUsers.value}</StatValue>
            <StatLabel theme={theme}>Người dùng hoạt động</StatLabel>
            <StatTrend positive={stats.activeUsers.positive}>
              <span>{stats.activeUsers.positive ? '↗' : '↘'}</span>
              {stats.activeUsers.trend}
            </StatTrend>
          </StatCard>

          <StatCard theme={theme} color="#8b5cf6">
            <StatIcon color="#8b5cf6">🗂️</StatIcon>
            <StatValue theme={theme}>{stats.totalDecks.value}</StatValue>
            <StatLabel theme={theme}>Tổng số deck</StatLabel>
            <StatTrend positive={stats.totalDecks.positive}>
              <span>{stats.totalDecks.positive ? '↗' : '↘'}</span>
              {stats.totalDecks.trend}
            </StatTrend>
          </StatCard>

          <StatCard theme={theme} color="#f59e0b">
            <StatIcon color="#f59e0b">📈</StatIcon>
            <StatValue theme={theme}>{stats.completionRate.value}</StatValue>
            <StatLabel theme={theme}>Tỷ lệ hoàn thành</StatLabel>
            <StatTrend positive={stats.completionRate.positive}>
              <span>{stats.completionRate.positive ? '↗' : '↘'}</span>
              {stats.completionRate.trend}
            </StatTrend>
          </StatCard>
        </StatsGrid>

        {/* Charts Grid */}
        <ChartsGrid>
          <ChartCard theme={theme}>
            <ChartTitle theme={theme}>
              <span>📈</span>
              Tăng trưởng người dùng
            </ChartTitle>
            <Line data={userGrowthData} options={chartOptions} />
          </ChartCard>

          <ChartCard theme={theme}>
            <ChartTitle theme={theme}>
              <span>🗂️</span>
              Phân loại Deck
            </ChartTitle>
            <Doughnut data={deckUsageData} options={chartOptions} />
          </ChartCard>

          <ChartCard theme={theme}>
            <ChartTitle theme={theme}>
              <span>✅</span>
              Tỷ lệ hoàn thành theo tuần
            </ChartTitle>
            <Bar data={completionRateData} options={chartOptions} />
          </ChartCard>

          <ChartCard theme={theme}>
            <ChartTitle theme={theme}>
              <span>🤖</span>
              Hiệu suất AI
            </ChartTitle>
            <Radar data={aiPerformanceData} options={chartOptions} />
          </ChartCard>
        </ChartsGrid>
      </PageContainer>
    </AdminLayout>
  );
};

export default AdminStatistics;