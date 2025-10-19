import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import { adminService } from '../services/adminService';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';

// ========== STYLED COMPONENTS ==========

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
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
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.15);
    border-color: ${props => props.color || '#58CC02'};
  }
`;

const StatIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: ${props => props.color || '#58CC02'}20;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  margin-bottom: 1rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-weight: 500;
`;

const StatChange = styled.div`
  font-size: 0.75rem;
  color: ${props => props.positive ? '#10b981' : '#ef4444'};
  margin-top: 0.5rem;
  font-weight: 600;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
`;

const QuickActionBtn = styled.button`
  background: ${props => props.color || '#58CC02'};
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    opacity: 0.9;
  }
`;

const RecentActivityTable = styled.div`
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
  margin-top: 2rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 0.75rem;
  border-bottom: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-weight: 600;
  font-size: 0.875rem;
`;

const Td = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  color: ${props => props.theme === 'dark' ? '#d1d5db' : '#4b5563'};
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

// ========== COMPONENT ==========

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalLessons: 0,
    totalVocabularies: 0,
    totalExercises: 0,
    totalUsers: 0,
    totalAchievements: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [courses, lessons, vocabularies, exercises, achievements] = await Promise.all([
        adminService.courses.getAll(),
        adminService.lessons.getAll(),
        adminService.vocabularies.getAll(),
        adminService.exercises.getAll(),
        adminService.achievements.getAll()
      ]);

      setStats({
        totalCourses: courses.count || 0,
        totalLessons: lessons.count || 0,
        totalVocabularies: vocabularies.count || 0,
        totalExercises: exercises.count || 0,
        totalAchievements: achievements.count || 0,
        totalUsers: 1247 // Mock data - cần API từ backend
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showToast('error', 'Lỗi', 'Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      icon: '📚',
      label: 'Khóa học',
      value: stats.totalCourses,
      color: '#58CC02',
      change: '+12%',
      positive: true,
      path: '/admin/courses'
    },
    {
      icon: '📖',
      label: 'Bài học',
      value: stats.totalLessons,
      color: '#1CB0F6',
      change: '+8%',
      positive: true,
      path: '/admin/lessons'
    },
    {
      icon: '👥',
      label: 'Người dùng',
      value: stats.totalUsers,
      color: '#8b5cf6',
      change: '+15%',
      positive: true,
      path: '/admin/users'
    },
    {
      icon: '📝',
      label: 'Từ vựng',
      value: stats.totalVocabularies,
      color: '#f59e0b',
      change: '+24%',
      positive: true,
      path: '/admin/vocabularies'
    },
    {
      icon: '🎯',
      label: 'Bài tập',
      value: stats.totalExercises,
      color: '#ef4444',
      change: '+18%',
      positive: true,
      path: '/admin/exercises'
    },
    {
      icon: '🏆',
      label: 'Thành tích',
      value: stats.totalAchievements,
      color: '#10b981',
      change: '+6%',
      positive: true,
      path: '/admin/achievements'
    }
  ];

  if (loading) {
    return (
      <AdminLayout pageTitle="Dashboard">
        <LoadingText theme={theme}>Đang tải dữ liệu...</LoadingText>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Dashboard">
      <Toast toast={toast} onClose={hideToast} />

      {/* Stats Grid */}
      <DashboardGrid>
        {statCards.map((stat, index) => (
          <StatCard
            key={index}
            theme={theme}
            color={stat.color}
            onClick={() => navigate(stat.path)}
          >
            <StatIcon color={stat.color}>{stat.icon}</StatIcon>
            <StatValue theme={theme}>{stat.value}</StatValue>
            <StatLabel theme={theme}>{stat.label}</StatLabel>
            <StatChange positive={stat.positive}>{stat.change} từ tháng trước</StatChange>
          </StatCard>
        ))}
      </DashboardGrid>

      {/* Quick Actions */}
      <SectionTitle theme={theme}>
        <span>⚡</span>
        Hành động nhanh
      </SectionTitle>
      <QuickActionsGrid>
        <QuickActionBtn color="#58CC02" onClick={() => navigate('/admin/courses/create')}>
          <span>➕</span>
          Tạo khóa học
        </QuickActionBtn>
        <QuickActionBtn color="#1CB0F6" onClick={() => navigate('/admin/lessons/create')}>
          <span>➕</span>
          Tạo bài học
        </QuickActionBtn>
        <QuickActionBtn color="#f59e0b" onClick={() => navigate('/admin/vocabularies/create')}>
          <span>➕</span>
          Thêm từ vựng
        </QuickActionBtn>
        <QuickActionBtn color="#ef4444" onClick={() => navigate('/admin/exercises/create')}>
          <span>➕</span>
          Tạo bài tập
        </QuickActionBtn>
      </QuickActionsGrid>

      {/* Recent Activity */}
      <SectionTitle theme={theme}>
        <span>📊</span>
        Hoạt động gần đây
      </SectionTitle>
      <RecentActivityTable theme={theme}>
        <Table>
          <thead>
            <tr>
              <Th theme={theme}>Hành động</Th>
              <Th theme={theme}>Người thực hiện</Th>
              <Th theme={theme}>Thời gian</Th>
              <Th theme={theme}>Trạng thái</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <Td theme={theme}>Tạo khóa học "TOEIC 550+"</Td>
              <Td theme={theme}>Admin</Td>
              <Td theme={theme}>5 phút trước</Td>
              <Td theme={theme}>✅ Thành công</Td>
            </tr>
            <tr>
              <Td theme={theme}>Cập nhật bài học Unit 3</Td>
              <Td theme={theme}>Admin</Td>
              <Td theme={theme}>15 phút trước</Td>
              <Td theme={theme}>✅ Thành công</Td>
            </tr>
            <tr>
              <Td theme={theme}>Thêm 50 từ vựng mới</Td>
              <Td theme={theme}>Admin</Td>
              <Td theme={theme}>1 giờ trước</Td>
              <Td theme={theme}>✅ Thành công</Td>
            </tr>
          </tbody>
        </Table>
      </RecentActivityTable>
    </AdminLayout>
  );
};

export default AdminDashboard;