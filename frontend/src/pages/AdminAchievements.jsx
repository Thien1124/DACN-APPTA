import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import { adminService } from '../services/adminService';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import Swal from 'sweetalert2';
import {
  EmojiEvents,
  Add,
  Edit,
  Delete,
  Lock,
  LockOpen,
  School,
  Timer,
  Star,
  LocalFireDepartment,
  CheckCircle,
  Cancel
} from '@mui/icons-material';

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

const AchievementsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const AchievementCard = styled.div`
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
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.15);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.active ? '#10b981' : '#6b7280'};
  }
`;

const AchievementIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: ${props => props.theme === 'dark' ? '#374151' : '#f3f4f6'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: #f59e0b;

  .MuiSvgIcon-root {
    font-size: 32px;
  }
`;

const AchievementTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  text-align: center;
  margin-bottom: 0.5rem;
`;

const AchievementDescription = styled.p`
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-size: 0.875rem;
  text-align: center;
  margin-bottom: 1rem;
  line-height: 1.5;
`;

const AchievementStats = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#f9fafb'};
  border-radius: 8px;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-weight: bold;
  font-size: 1.125rem;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-top: 0.25rem;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => props.active ? '#10b981' : '#6b7280'};
  color: white;
  margin-bottom: 1rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
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
  background: ${props => {
    if (props.variant === 'edit') return '#1CB0F6';
    if (props.variant === 'delete') return '#ef4444';
    if (props.variant === 'toggle') return '#f59e0b';
    return '#6b7280';
  }};
  color: white;

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

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

// Add mock data
const mockAchievements = [
  {
    _id: '1',
    name: 'Học giỏi',
    description: 'Hoàn thành 10 bài học liên tiếp',
    icon: <School />,
    xpReward: 100,
    condition: { target: 10 },
    isActive: true
  },
  {
    _id: '2',
    name: 'Siêu sao',
    description: 'Đạt 1000 XP',
    icon: <Star />,
    xpReward: 200,
    condition: { target: 1000 },
    isActive: true
  },
  {
    _id: '3', 
    name: 'Chăm chỉ',
    description: 'Học tập 7 ngày liên tiếp',
    icon: <LocalFireDepartment />,
    xpReward: 150,
    condition: { target: 7 },
    isActive: false
  }
];

// ========== COMPONENT ==========

const AdminAchievements = () => {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    //fetchAchievements(); bỏ này ra nếu dùng api
    // Simulate API call
    setTimeout(() => {
      setAchievements(mockAchievements);
      setLoading(false);
    }, 1000);
  }, []);
  
  /*
  bỏ này ra nếu dùng api
  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const response = await adminService.achievements.getAll();
      setAchievements(response.data);
    } catch (error) {
      showToast('error', 'Lỗi', error.response?.data?.message || 'Không thể tải thành tích');
    } finally {
      setLoading(false);
    }
  };
  */

  const handleCreate = () => {
    navigate('/admin/achievements/create');
  };

  const handleEdit = (achievementId) => {
    navigate(`/admin/achievements/edit/${achievementId}`);
  };

  const handleDelete = async (achievement) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa?',
      text: `Bạn có chắc muốn xóa thành tích "${achievement.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        await adminService.achievements.delete(achievement._id);
        showToast('success', 'Thành công', 'Đã xóa thành tích');
        //fetchAchievements();
        mockAchievements = mockAchievements.filter(item => item._id !== achievement._id);
      } catch (error) {
        showToast('error', 'Lỗi', error.response?.data?.message || 'Không thể xóa thành tích');
      }
    }
  };

  const handleToggleActive = async (achievement) => {
    try {
      await adminService.achievements.toggleActive(achievement._id);
      showToast('success', 'Thành công', `Đã ${achievement.isActive ? 'vô hiệu hóa' : 'kích hoạt'} thành tích`);
      //fetchAchievements();
      mockAchievements = mockAchievements.filter(item => item._id !== achievement._id);
    } catch (error) {
      showToast('error', 'Lỗi', 'Không thể cập nhật trạng thái');
    }
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Quản lý Thành tích">
        <LoadingText theme={theme}>Đang tải dữ liệu...</LoadingText>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Quản lý Thành tích">
      <Toast toast={toast} onClose={hideToast} />

      <PageHeader>
        <Title theme={theme}>
          <EmojiEvents sx={{ mr: 1 }} /> Thành tích ({achievements.length})
        </Title>
        <CreateButton onClick={handleCreate}>
          <Add />
          Tạo thành tích mới
        </CreateButton>
      </PageHeader>

      {achievements.length === 0 ? (
        <EmptyState theme={theme}>
          <EmojiEvents sx={{ fontSize: 48, color: theme === 'dark' ? '#9ca3af' : '#6b7280' }} />
          <div>Chưa có thành tích nào</div>
          <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Nhấn nút "Tạo thành tích mới" để bắt đầu
          </div>
        </EmptyState>
      ) : (
        <AchievementsGrid>
          {achievements.map((achievement) => (
            <AchievementCard 
              key={achievement._id} 
              theme={theme}
              active={achievement.isActive}
            >
              <div style={{ textAlign: 'center' }}>
                <StatusBadge active={achievement.isActive}>
                  {achievement.isActive ? (
                    <><CheckCircle sx={{ fontSize: 16, mr: 0.5 }} /> Đang hoạt động</>
                  ) : (
                    <><Cancel sx={{ fontSize: 16, mr: 0.5 }} /> Đã tắt</>
                  )}
                </StatusBadge>
              </div>

              <AchievementIcon>
                {achievement.icon || '🏆'}
              </AchievementIcon>

              <AchievementTitle theme={theme}>
                {achievement.name}
              </AchievementTitle>

              <AchievementDescription theme={theme}>
                {achievement.description}
              </AchievementDescription>

              <AchievementStats theme={theme}>
                <StatItem>
                  <StatValue theme={theme}>{achievement.xpReward || 0}</StatValue>
                  <StatLabel theme={theme}>XP</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue theme={theme}>
                    {achievement.condition?.target || 0}
                  </StatValue>
                  <StatLabel theme={theme}>Mục tiêu</StatLabel>
                </StatItem>
              </AchievementStats>

              <ActionButtons>
                <ActionButton variant="edit" onClick={() => handleEdit(achievement._id)}>
                  <Edit sx={{ fontSize: 18 }} /> Sửa
                </ActionButton>
                <ActionButton 
                  variant="toggle" 
                  onClick={() => handleToggleActive(achievement)}
                >
                  {achievement.isActive ? (
                    <><Lock sx={{ fontSize: 18 }} /> Tắt</>
                  ) : (
                    <><LockOpen sx={{ fontSize: 18 }} /> Bật</>
                  )}
                </ActionButton>
                <ActionButton variant="delete" onClick={() => handleDelete(achievement)}>
                  <Delete sx={{ fontSize: 18 }} />
                </ActionButton>
              </ActionButtons>
            </AchievementCard>
          ))}
        </AchievementsGrid>
      )}
    </AdminLayout>
  );
};

export default AdminAchievements;