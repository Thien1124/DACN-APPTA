import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { goalService } from '../services/goalService';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import {
  Flag,
  AccessTime,
  Alarm,
  Timeline,
  NotificationsActive,
  Add,
  Delete,
  Edit
} from '@mui/icons-material';
import api from '../utils/api';

const PageWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(135deg, #1a1f2c 0%, #2d3748 50%, #4a5568 100%)'
    : 'linear-gradient(135deg, #EBF4FF 0%, #E6FFFA 50%, #F0FFF4 100%)'
  };
`;

const PageLayout = styled.div`
  display: flex;
  width: 100%;
  position: relative; // Add this
`;

const MainContent = styled.div`
  flex: 1;
  padding: 2.5rem;
  min-width: 0; // Prevent content overflow
  max-width: 100%;
  animation: fadeIn 0.5s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const FormWrapper = styled.div`
  flex: 1;
  padding-right: 320px; // Match RightSidebar width
  margin-left: 280px; // Match LeftSidebar width
  width: calc(100% - 600px); // Account for both sidebars
`;

const PageTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
`;

const PageSubtitle = styled.p`
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-bottom: 2rem;
`;


const GoalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const GoalTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const GoalActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem;
  border-radius: 8px;
  border: none;
  background: ${props => props.variant === 'delete' ? '#fee2e2' : '#e0f2fe'};
  color: ${props => props.variant === 'delete' ? '#ef4444' : '#0284c7'};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
  }
`;

const ProgressBar = styled.div`
  height: 10px;
  background: ${props => props.theme === 'dark' ? '#2D3748' : '#E2E8F0'};
  border-radius: 999px;
  overflow: hidden;
  margin: 1.25rem 0;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${props => props.progress}%;
  background: ${props => {
    if (props.progress >= 100) return 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
    if (props.progress >= 75) return 'linear-gradient(135deg, #58CC02 0%, #45A302 100%)';
    if (props.progress >= 50) return 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)';
    return 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)';
  }};
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
`;

const GoalStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const StatItem = styled.div`
  padding: 1.25rem;
  background: ${props => props.theme === 'dark' 
    ? 'rgba(45, 55, 72, 0.5)' 
    : 'rgba(247, 250, 252, 0.8)'
  };
  border-radius: 16px;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid ${props => props.theme === 'dark'
    ? 'rgba(74, 85, 104, 0.2)'
    : 'rgba(226, 232, 240, 0.7)'
  };

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
`;


const StatValue = styled.div`
  font-size: 1.75rem;
  font-weight: bold;
  background: linear-gradient(135deg, #58CC02 0%, #45A302 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-top: 0.25rem;
`;


const AlertBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  background: ${props => props.status === 'danger' 
    ? 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)'
    : 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)'
  };
  color: ${props => props.status === 'danger' ? '#DC2626' : '#059669'};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;
const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 2rem;
  background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(88, 204, 2, 0.2);

  &:hover {
    background: linear-gradient(135deg, #45a302 0%, #378202 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 12px -1px rgba(88, 204, 2, 0.25);
  }

  &:active {
    transform: translateY(0);
  }
`;


const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(26, 32, 44, 0.95)' 
    : 'rgba(255, 255, 255, 0.98)'
  };
  backdrop-filter: blur(16px);
  padding: 2.5rem;
  border-radius: 24px;
  width: 100%;
  max-width: 550px;
  position: relative;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: modalFadeIn 0.3s ease;

  @keyframes modalFadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

const ConfirmModal = styled(Modal)`
  background: rgba(0, 0, 0, 0.6);
`;

const ConfirmContent = styled(ModalContent)`
  max-width: 400px;
  text-align: center;
`;

const ConfirmText = styled.p`
  margin: 1rem 0 2rem;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#4b5563'};
  font-size: 1.1rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => props.variant === 'primary' ? `
    background: #58CC02;
    color: white;
    &:hover {
      background: #45a302;
    }
  ` : `
    background: ${props.theme === 'dark' ? '#374151' : '#e5e7eb'};
    color: ${props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
    &:hover {
      background: ${props.theme === 'dark' ? '#4B5563' : '#d1d5db'};
    }
  `}
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  min-height: 200px;
  padding: 2rem;
  text-align: center;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const GoalsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(295px, 1fr)); 
  gap: 1.5rem;
  margin-bottom: 2rem;
  width: 100%;
`;

const GoalCard = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(26, 32, 44, 0.8)' 
    : 'rgba(255, 255, 255, 0.95)'
  };
  backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 1.75rem;
  margin-bottom: 1.5rem;
  width: 100%; // Take full width of container
  max-width: calc(100% - 40px); // Add some padding
  box-sizing: border-box;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  };
  backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 1.75rem; // Reduced padding
  border: 1px solid ${props => props.theme === 'dark'
    ? 'rgba(74, 85, 104, 0.2)'
    : 'rgba(226, 232, 240, 0.7)'
  };
  margin-bottom: 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
              0 2px 4px -1px rgba(0, 0, 0, 0.06);
  width: 100%; // Ensure card takes full width of grid cell

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
                0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
`;

const ToastWrapper = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  padding: 16px 24px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  animation: slideIn 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  
  ${props => props.type === 'success' && `
    background: linear-gradient(135deg, #DCF7E3 0%, #A7F3D0 100%);
    color: #059669;
    border: 1px solid #A7F3D0;
  `}

  ${props => props.type === 'error' && `
    background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%);
    color: #DC2626;
    border: 1px solid #FECACA;
  `}

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const LearningGoals = () => {
  const [theme] = useState('light');
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, goalId: null });
  const { toast, showToast, hideToast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'TEST',
    skill: 'READING',
    target: 10,
    deadline: ''
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await goalService.getAll();
      console.log('Goals response:', response);

      if (response.success && response.goals) {
        setGoals(response.goals);
      } else {
        console.error('Invalid goals data:', response);
        setGoals([]);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
      showToast('error', 'Lỗi', 'Không thể tải mục tiêu học tập');
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'TEST',
      skill: 'READING',
      target: 10,
      deadline: ''
    });
    setEditingGoal(null);
  };

  const handleModalClose = () => {
    setShowModal(false);
    resetForm();
  };

  const handleAddGoal = () => {
    setShowModal(true);
  };

  const handleEditGoal = (goal) => {
    try {
      setEditingGoal(goal); // Store the entire goal object
    
      // Format the deadline date properly
      const deadlineDate = goal.deadline ? new Date(goal.deadline) : new Date();
      const formattedDate = deadlineDate.toISOString().split('T')[0];

      setFormData({
        title: goal.title || '',
        description: goal.description || '',
        type: goal.type || 'TEST',
        skill: goal.skill || 'READING',
        target: goal.target || 10,
        deadline: formattedDate,
        current: goal.current || 0 // Add current progress if needed
      });
      setShowModal(true);
    } catch (error) {
      console.error('Error formatting goal data:', error);
      showToast('error', 'Lỗi', 'Không thể chỉnh sửa mục tiêu');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Update handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showToast('error', 'Lỗi', 'Vui lòng nhập tiêu đề');
      return;
    }

    setLoading(true);
    try {
      if (editingGoal) {
        const result = await goalService.update(editingGoal._id, formData);
        if (result.success) {
          showToast('success', 'Thành công', 'Đã cập nhật mục tiêu!');
          handleModalClose();
          fetchGoals();
        }
      } else {
        const result = await goalService.create(formData);
        if (result.success) {
          showToast('success', 'Thành công', 'Đã thêm mục tiêu mới!');
          handleModalClose();
          fetchGoals();
        }
      }
    } catch (error) {
      console.error('Goal operation error:', error);
      showToast('error', 'Lỗi', error.response?.data?.message || 'Không thể thực hiện thao tác');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (goalId) => {
    setDeleteConfirm({ show: true, goalId });
  };

  const handleDeleteConfirm = async () => {
    setLoading(true);
    try {
      const result = await goalService.delete(deleteConfirm.goalId);
      if (result.success) {
        showToast('success', 'Thành công', 'Đã xóa mục tiêu!');
        fetchGoals();
      }
    } catch (error) {
      console.error('Delete goal error:', error);
      showToast('error', 'Lỗi', error.response?.data?.message || 'Không thể xóa mục tiêu');
    } finally {
      setLoading(false);
      setDeleteConfirm({ show: false, goalId: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ show: false, goalId: null });
  };

  const calculateDaysLeft = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <PageWrapper theme={theme}>
      <Toast toast={toast} onClose={hideToast} />
    
      <LeftSidebar />
      <PageLayout>
        <FormWrapper>
          <MainContent>
            <PageTitle theme={theme}>
              <Flag /> Mục tiêu học tập
            </PageTitle>
            <PageSubtitle theme={theme}>
              Thiết lập và theo dõi các mục tiêu học tập của bạn
            </PageSubtitle>

            {loading ? (
              <LoadingState>Đang tải...</LoadingState>
            ) : goals.length === 0 ? (
              <EmptyState theme={theme}>
                <div>Chưa có mục tiêu nào</div>
                <AddButton onClick={handleAddGoal}>
                  + Thêm mục tiêu mới
                </AddButton>
              </EmptyState>
            ) : (
              <>
                <GoalsList>
                  {goals.map(goal => {
                    const progress = (goal.current / goal.target) * 100;
                    const daysLeft = calculateDaysLeft(goal.deadline);
                    const status = daysLeft <= 15 ? 'danger' : 'success';

                    return (
                      <GoalCard key={goal._id} theme={theme}>
                        <GoalHeader>
                          <GoalTitle theme={theme}>
                            <Timeline /> {goal.title}
                          </GoalTitle>
                          <GoalActions>
                            <ActionButton onClick={() => handleEditGoal(goal)}>
                              <Edit fontSize="small" />
                            </ActionButton>
                            <ActionButton 
                              variant="delete" 
                              onClick={() => handleDeleteClick(goal._id)}
                            >
                              <Delete fontSize="small" />
                            </ActionButton>
                          </GoalActions>
                        </GoalHeader>

                        <AlertBadge status={status}>
                          <AccessTime fontSize="small" />
                          {daysLeft} ngày còn lại
                        </AlertBadge>

                        <ProgressBar theme={theme}>
                          <ProgressFill progress={progress} />
                        </ProgressBar>

                        <div style={{ textAlign: 'right', fontSize: '0.875rem' }}>
                          {goal.current}/{goal.target} ({Math.round(progress)}%)
                        </div>

                        <GoalStats>
                          <StatItem theme={theme}>
                            <StatValue theme={theme}>{goal.type}</StatValue>
                            <StatLabel theme={theme}>Loại mục tiêu</StatLabel>
                          </StatItem>
                          {goal.skill && (
                            <StatItem theme={theme}>
                              <StatValue theme={theme}>{goal.skill}</StatValue>
                              <StatLabel theme={theme}>Kỹ năng</StatLabel>
                            </StatItem>
                          )}
                          <StatItem theme={theme}>
                            <StatValue theme={theme}>
                              {goal.status}
                            </StatValue>
                            <StatLabel theme={theme}>Trạng thái</StatLabel>
                          </StatItem>
                        </GoalStats>
                      </GoalCard>
                    );
                  })}
                </GoalsList>
                <AddButton onClick={handleAddGoal}>
                  <Add /> Thêm mục tiêu mới
                </AddButton>
              </>
            )}
          </MainContent>
        </FormWrapper>
        
        <RightSidebar>
          {/* Add your RightSidebar content here */}
        </RightSidebar>
      </PageLayout>

      {showModal && (
        <Modal onClick={handleModalClose}>
          <ModalContent theme={theme} onClick={e => e.stopPropagation()}>
            <PageTitle theme={theme}>
              {editingGoal ? 'Chỉnh sửa mục tiêu' : 'Thêm mục tiêu mới'}
            </PageTitle>

            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Label theme={theme}>Tiêu đề</Label>
                <Input
                  theme={theme}
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="VD: Hoàn thành 10 bài test IELTS"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label theme={theme}>Mô tả</Label>
                <Input
                  theme={theme}
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="VD: Luyện tập 10 bài test Reading trong tháng này"
                />
              </FormGroup>

              <FormGroup>
                <Label theme={theme}>Loại mục tiêu</Label>
                <Select
                  theme={theme}
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="TEST">Bài kiểm tra</option>
                  <option value="LESSON">Bài học</option>
                  <option value="CHAPTER">Chương học</option>
                  <option value="SCORE">Điểm số</option>
                  <option value="VOCAB">Từ vựng</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label theme={theme}>Kỹ năng</Label>
                <Select
                  theme={theme}
                  name="skill"
                  value={formData.skill}
                  onChange={handleChange}
                  required
                >
                  <option value="READING">Reading</option>
                  <option value="LISTENING">Listening</option>
                  <option value="WRITING">Writing</option>
                  <option value="SPEAKING">Speaking</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label theme={theme}>Mục tiêu</Label>
                <Input
                  theme={theme}
                  type="number"
                  name="target"
                  value={formData.target}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label theme={theme}>Hạn hoàn thành</Label>
                <Input
                  theme={theme}
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  required
                />
              </FormGroup>

              <ButtonGroup>
                <Button 
                  type="button" 
                  theme={theme}
                  onClick={handleModalClose}
                  disabled={loading}
                >
                  Hủy
                </Button>
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={loading}
                >
                  {loading ? 'Đang xử lý...' : (editingGoal ? 'Cập nhật' : 'Tạo mới')}
                </Button>
              </ButtonGroup>
            </form>
          </ModalContent>
        </Modal>
      )}

      {deleteConfirm.show && (
        <ConfirmModal onClick={handleDeleteCancel}>
          <ConfirmContent theme={theme} onClick={e => e.stopPropagation()}>
            <PageTitle theme={theme}>Xác nhận xóa</PageTitle>
            <ConfirmText theme={theme}>
              Bạn có chắc chắn muốn xóa mục tiêu này không?
            </ConfirmText>
            <ButtonGroup>
              <Button 
                theme={theme} 
                onClick={handleDeleteCancel}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button 
                variant="primary" 
                onClick={handleDeleteConfirm}
                style={{ background: '#DC2626' }}
                disabled={loading}
              >
                {loading ? 'Đang xóa...' : 'Xóa'}
              </Button>
            </ButtonGroup>
          </ConfirmContent>
        </ConfirmModal>
      )}
    </PageWrapper>
  );
};

export default LearningGoals;