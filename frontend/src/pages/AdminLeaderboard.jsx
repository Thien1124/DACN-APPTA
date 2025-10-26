import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import AdminLayout from '../layouts/AdminLayout';
import { adminService } from '../services/adminService';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import Swal from 'sweetalert2';
import {
  EmojiEvents,
  Download,
  Refresh,
  Star,
  Diamond,
  LocalFireDepartment,
  Timer,
  MenuBook
} from '@mui/icons-material';

// ========== STYLED COMPONENTS ==========

const PageHeader = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-size: 0.875rem;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  background: transparent;
  color: ${props => props.active
    ? (props.theme === 'dark' ? '#58CC02' : '#58CC02')
    : (props.theme === 'dark' ? '#9ca3af' : '#6b7280')
  };
  font-weight: 600;
  cursor: pointer;
  border-bottom: 3px solid ${props => props.active ? '#58CC02' : 'transparent'};
  transition: all 0.3s ease;

  &:hover {
    color: #58CC02;
  }
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const ActionButton = styled.button`
  background: ${props => {
    if (props.variant === 'danger') return '#ef4444';
    if (props.variant === 'warning') return '#f59e0b';
    return '#58CC02';
  }};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    opacity: 0.9;
  }
`;

const TableContainer = styled.div`
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
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 1rem;
  border-bottom: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-weight: 600;
  font-size: 0.875rem;
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  color: ${props => props.theme === 'dark' ? '#d1d5db' : '#4b5563'};
`;

const RankBadge = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => {
    if (props.rank === 1) return 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)';
    if (props.rank === 2) return 'linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%)';
    if (props.rank === 3) return 'linear-gradient(135deg, #cd7f32 0%, #e09540 100%)';
    return '#e5e7eb';
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: ${props => props.rank <= 3 ? '#1a1a1a' : '#6b7280'};
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  font-size: 1.125rem;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.div`
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
`;

const UserEmail = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const StatBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  background: ${props => {
    if (props.type === 'xp') return '#10b981';
    if (props.type === 'streak') return '#f59e0b';
    if (props.type === 'level') return '#8b5cf6';
    return '#6b7280';
  }};
  color: white;
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

// Add mock data
const mockLeaderboard = [
  {
    _id: '1',
    user: {
      displayName: 'John Doe',
      email: 'john@example.com',
      level: 10,
      totalXP: 5000,
      streak: 15,
      completedLessons: 45,
      studyTime: 3600
    }
  },
  {
    _id: '2',
    user: {
      displayName: 'Jane Smith',
      email: 'jane@example.com',
      level: 8,
      totalXP: 4200,
      streak: 20,
      completedLessons: 38,
      studyTime: 2800
    }
  },
  {
    _id: '3',
    user: {
      displayName: 'Mike Johnson',
      email: 'mike@example.com',
      level: 12,
      totalXP: 6500,
      streak: 30,
      completedLessons: 60,
      studyTime: 4500
    }
  }
];

// ========== COMPONENT ==========

const AdminLeaderboard = () => {
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overall');
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    //fetchLeaderboard(); bỏ này ra nếu dùng api
    // Simulate API call
    setTimeout(() => {
      setLeaderboardData(mockLeaderboard);
      setLoading(false);
    }, 1000);
  }, [activeTab]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      let response;

      switch (activeTab) {
        case 'weekly':
          response = await adminService.leaderboard.getWeekly();
          break;
        case 'monthly':
          response = await adminService.leaderboard.getMonthly();
          break;
        default:
          response = await adminService.leaderboard.getOverall();
      }

      setLeaderboardData(response.data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      showToast('error', 'Lỗi', 'Không thể tải bảng xếp hạng');
    } finally {
      setLoading(false);
    }
  };

  const handleResetWeekly = async () => {
    const result = await Swal.fire({
      title: 'Xác nhận reset?',
      text: 'Bạn có chắc muốn reset bảng xếp hạng tuần?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Reset',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        await adminService.leaderboard.resetWeekly();
        showToast('success', 'Thành công', 'Đã reset bảng xếp hạng tuần');
        fetchLeaderboard();
      } catch (error) {
        showToast('error', 'Lỗi', 'Không thể reset bảng xếp hạng');
      }
    }
  };

  const handleResetMonthly = async () => {
    const result = await Swal.fire({
      title: 'Xác nhận reset?',
      text: 'Bạn có chắc muốn reset bảng xếp hạng tháng?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Reset',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        await adminService.leaderboard.resetMonthly();
        showToast('success', 'Thành công', 'Đã reset bảng xếp hạng tháng');
        fetchLeaderboard();
      } catch (error) {
        showToast('error', 'Lỗi', 'Không thể reset bảng xếp hạng');
      }
    }
  };

  const handleExportData = async () => {
    try {
      const response = await adminService.leaderboard.export(activeTab);
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leaderboard-${activeTab}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('success', 'Thành công', 'Đã xuất dữ liệu');
    } catch (error) {
      showToast('error', 'Lỗi', 'Không thể xuất dữ liệu');
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'weekly':
        return 'Bảng xếp hạng tuần';
      case 'monthly':
        return 'Bảng xếp hạng tháng';
      default:
        return 'Bảng xếp hạng tổng thể';
    }
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Bảng xếp hạng">
        <LoadingText theme={theme}>Đang tải dữ liệu...</LoadingText>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Bảng xếp hạng">
      <Toast toast={toast} onClose={hideToast} />

      <PageHeader>
        <Title theme={theme}>
          <EmojiEvents sx={{ mr: 1 }} /> {getTabTitle()}
        </Title>
        <Subtitle theme={theme}>
          Quản lý và theo dõi thành tích học tập của người dùng
        </Subtitle>
      </PageHeader>

      <TabContainer>
        <Tab
          theme={theme}
          active={activeTab === 'overall'}
          onClick={() => setActiveTab('overall')}
        >
          Tổng thể
        </Tab>
        <Tab
          theme={theme}
          active={activeTab === 'weekly'}
          onClick={() => setActiveTab('weekly')}
        >
          Tuần này
        </Tab>
        <Tab
          theme={theme}
          active={activeTab === 'monthly'}
          onClick={() => setActiveTab('monthly')}
        >
          Tháng này
        </Tab>
      </TabContainer>

      <ActionBar>
        <ActionButton onClick={handleExportData}>
          <Download />
          Xuất dữ liệu
        </ActionButton>
        {activeTab === 'weekly' && (
          <ActionButton variant="warning" onClick={handleResetWeekly}>
            <Refresh />
            Reset tuần
          </ActionButton>
        )}
        {activeTab === 'monthly' && (
          <ActionButton variant="warning" onClick={handleResetMonthly}>
            <Refresh />
            Reset tháng
          </ActionButton>
        )}
      </ActionBar>

      {leaderboardData.length === 0 ? (
        <EmptyState theme={theme}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
          <div>Chưa có dữ liệu xếp hạng</div>
          <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Người dùng sẽ xuất hiện ở đây khi bắt đầu học tập
          </div>
        </EmptyState>
      ) : (
        <TableContainer theme={theme}>
          <Table>
            <thead>
              <tr>
                <Th theme={theme}>Hạng</Th>
                <Th theme={theme}>Người dùng</Th>
                <Th theme={theme}>Level</Th>
                <Th theme={theme}>Tổng XP</Th>
                <Th theme={theme}>Streak</Th>
                <Th theme={theme}>Bài hoàn thành</Th>
                <Th theme={theme}>Thời gian học</Th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((entry, index) => (
                <tr key={entry._id || index}>
                  <Td theme={theme}>
                    <RankBadge rank={index + 1}>
                      {index + 1 <= 3 ? '🏆' : index + 1}
                    </RankBadge>
                  </Td>
                  <Td theme={theme}>
                    <UserInfo>
                      <UserAvatar>
                        {entry.user?.displayName?.charAt(0).toUpperCase() ||
                          entry.user?.username?.charAt(0).toUpperCase() ||
                          '?'}
                      </UserAvatar>
                      <UserDetails>
                        <UserName theme={theme}>
                          {entry.user?.displayName || entry.user?.username || 'N/A'}
                        </UserName>
                        <UserEmail theme={theme}>
                          {entry.user?.email || 'N/A'}
                        </UserEmail>
                      </UserDetails>
                    </UserInfo>
                  </Td>
                  <Td theme={theme}>
                    <StatBadge type="level">
                      <Star sx={{ fontSize: 18 }} /> Level {entry.user?.level || 1}
                    </StatBadge>
                  </Td>
                  <Td theme={theme}>
                    <StatBadge type="xp">
                      <Diamond sx={{ fontSize: 18 }} /> {entry.totalXP || entry.user?.totalXP || 0} XP
                    </StatBadge>
                  </Td>
                  <Td theme={theme}>
                    <StatBadge type="streak">
                      <LocalFireDepartment sx={{ fontSize: 18 }} /> {entry.streak || entry.user?.streak || 0} ngày
                    </StatBadge>
                  </Td>
                  <Td theme={theme}>
                    <StatBadge>
                      <MenuBook sx={{ fontSize: 18 }} />
                      {entry.user?.completedLessons || 0} bài
                    </StatBadge>
                  </Td>
                  <Td theme={theme}>
                    <StatBadge>
                      <Timer sx={{ fontSize: 18 }} />
                      {Math.floor((entry.studyTime || entry.user?.studyTime || 0) / 60)} giờ
                    </StatBadge>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      )}
    </AdminLayout>
  );
};

export default AdminLeaderboard;