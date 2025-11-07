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

const FormWrapper = styled.div`
  flex: 1;
  margin-left: 280px;
  margin-right: 340px; // Increase RightSidebar margin
  padding: 0 20px;
  min-width: 0;
`;

const MainContent = styled.div`
  padding: 2.5rem;
  padding-bottom: 4rem; // Add more padding at bottom
  min-width: 0;
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
  grid-template-columns: repeat(2, 1fr); // 2 stats per row
  gap: 1rem;
  margin-top: auto; // Push to bottom
`;

const StatItem = styled.div`
  padding: 1rem;
  background: ${props => props.theme === 'dark' 
    ? 'rgba(45, 55, 72, 0.5)' 
    : 'rgba(247, 250, 252, 0.8)'
  };
  border-radius: 12px;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
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
  margin-top: 2rem; // Add margin top
  margin-bottom: 1rem; // Add margin bottom

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
  padding: 1rem; // Add padding for small screens
`;

const ModalContent = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(26, 32, 44, 0.95)' 
    : 'rgba(255, 255, 255, 0.98)'
  };
  backdrop-filter: blur(16px);
  padding: 2rem; // Reduce padding
  border-radius: 20px;
  width: 100%;
  max-width: 600px; // Reduce from 700px to 600px
  max-height: 90vh; // Add max height
  overflow-y: auto; // Add scroll if content is too long
  position: relative;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: modalFadeIn 0.3s ease;

  @media (max-width: 640px) {
    padding: 1.5rem;
    max-width: 95vw; // Responsive on small screens
    margin: 0 0.5rem;
  }

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
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  width: 100%;
  margin-bottom: 1rem; // Add margin bottom
`;

const GoalCard = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(26, 32, 44, 0.8)' 
    : 'rgba(255, 255, 255, 0.95)'
  };
  backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 1.25rem;
  border: 1px solid ${props => props.theme === 'dark'
    ? 'rgba(74, 85, 104, 0.2)'
    : 'rgba(226, 232, 240, 0.7)'
  };
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: fit-content;
  min-height: 180px;
  max-width: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }
`;
const HelpText = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-top: -1rem;
  margin-bottom: 1rem;
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

const StatValue = styled.p`
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
`;

const StatLabel = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
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
    type: 'POMODORO', // Default to POMODORO
    skill: 'READING',
    target: 4, // Default to 4 Pomodoro sessions
    deadline: '', // ✅ Không set deadline mặc định
    // New Pomodoro fields
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakInterval: 4,
    longBreakDuration: 15
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
      type: 'POMODORO', // Default to POMODORO
      skill: 'READING',
      target: 4, // Default to 4 Pomodoro sessions
      deadline: '', // ✅ Không set deadline mặc định
      // New Pomodoro fields
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakInterval: 4,
      longBreakDuration: 15
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
      setEditingGoal(goal);
    
      // ✅ Chỉ set deadline nếu không phải POMODORO
      let deadlineValue = '';
      if (goal.type !== 'POMODORO' && goal.deadline) {
        const deadlineDate = new Date(goal.deadline);
        deadlineValue = deadlineDate.toISOString().split('T')[0];
      }
      
      setFormData({
        title: goal.title || '',
        description: goal.description || '',
        type: goal.type || 'POMODORO',
        skill: goal.skill || 'READING',
        target: goal.target || 4,
        deadline: deadlineValue, // ✅ Chỉ set nếu không phải POMODORO
        current: goal.current || 0,
        // Add Pomodoro fields with defaults if not present
        workDuration: goal.workDuration || 25,
        shortBreakDuration: goal.shortBreakDuration || 5,
        longBreakInterval: goal.longBreakInterval || 4,
        longBreakDuration: goal.longBreakDuration || 15
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
                    const daysLeft = goal.type === 'POMODORO' ? 0 : calculateDaysLeft(goal.deadline);
                    const status = goal.type === 'POMODORO' ? 'success' : (daysLeft <= 15 ? 'danger' : 'success');

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

                        {/* ✅ Cải thiện hiển thị deadline/status */}
                        <AlertBadge status={status}>
                          <AccessTime fontSize="small" />
                          {goal.type === 'POMODORO' 
                            ? 'Hoàn thành trong ngày' 
                            : `${daysLeft} ngày còn lại`
                          }
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
                          
                          {/* ✅ Thêm thông tin Pomodoro nếu là POMODORO goal */}
                          {goal.type === 'POMODORO' && (
                            <StatItem theme={theme}>
                              <StatValue theme={theme}>
                                {goal.workDuration}min/{goal.shortBreakDuration}min
                              </StatValue>
                              <StatLabel theme={theme}>Làm việc/Nghỉ</StatLabel>
                            </StatItem>
                          )}
                          
                          {/* ✅ Thêm deadline cho non-POMODORO goals */}
                          {goal.type !== 'POMODORO' && goal.deadline && (
                            <StatItem theme={theme}>
                              <StatValue theme={theme}>
                                {new Date(goal.deadline).toLocaleDateString('vi-VN')}
                              </StatValue>
                              <StatLabel theme={theme}>Hạn hoàn thành</StatLabel>
                            </StatItem>
                          )}
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
            <PageTitle theme={theme} style={{ marginBottom: '1.5rem' }}>
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
                  placeholder="VD: Hoàn thành 4 phiên học Reading"
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
                  placeholder="VD: Tập trung học Reading với phương pháp Pomodoro"
                />
              </FormGroup>

              {/* ✅ Thêm field chọn Type */}
              <FormGroup>
                <Label theme={theme}>Loại mục tiêu</Label>
                <Select
                  theme={theme}
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="POMODORO">Pomodoro</option>
                  <option value="SCORE">Điểm số</option>
                  <option value="CHAPTER">Chương học</option>
                  <option value="TEST">Bài kiểm tra</option>
                  <option value="LESSON">Bài học</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label theme={theme}>Kỹ năng cần tập trung</Label>
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
                  <option value="VOCABULARY">Vocabulary</option>
                  <option value="GRAMMAR">Grammar</option>
                  <option value="MIXED">Mixed</option>
                </Select>
              </FormGroup>

              {/* ✅ Chỉ hiển thị target cho POMODORO */}
              {formData.type === 'POMODORO' && (
                <FormGroup>
                  <Label theme={theme}>
                    Số phiên mục tiêu
                    <span style={{ 
                      display: 'block', 
                      fontSize: '0.8rem', 
                      fontWeight: 'normal',
                      color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                      marginTop: '0.25rem'
                    }}>
                      Mỗi phiên = {formData.workDuration} phút làm việc + {formData.shortBreakDuration} phút nghỉ
                    </span>
                  </Label>
                  <Input
                    theme={theme}
                    type="number"
                    name="target"
                    value={formData.target}
                    onChange={handleChange}
                    min="1"
                    max="20"
                    placeholder="VD: 4"
                    required
                  />
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                    marginTop: '0.25rem'
                  }}>
                    Với cài đặt hiện tại, bạn cần {formData.target} phiên × {formData.workDuration} phút = {formData.target * formData.workDuration} phút học tập
                  </div>
                </FormGroup>
              )}

              {/* ✅ Chỉ hiển thị target cho các type khác */}
              {formData.type !== 'POMODORO' && (
                <FormGroup>
                  <Label theme={theme}>
                    {formData.type === 'SCORE' && 'Điểm số mục tiêu'}
                    {formData.type === 'CHAPTER' && 'Số chương mục tiêu'}
                    {formData.type === 'TEST' && 'Số bài kiểm tra mục tiêu'}
                    {formData.type === 'LESSON' && 'Số bài học mục tiêu'}
                  </Label>
                  <Input
                    theme={theme}
                    type="number"
                    name="target"
                    value={formData.target}
                    onChange={handleChange}
                    min="1"
                    placeholder={
                      formData.type === 'SCORE' ? 'VD: 80' :
                      formData.type === 'CHAPTER' ? 'VD: 5' :
                      formData.type === 'TEST' ? 'VD: 3' : 'VD: 10'
                    }
                    required
                  />
                </FormGroup>
              )}

              {/* ✅ Chỉ hiển thị Pomodoro Settings khi type = POMODORO */}
              {formData.type === 'POMODORO' && (
                <div style={{ 
                  border: `2px solid ${theme === 'dark' ? '#667eea' : '#58CC02'}`, 
                  borderRadius: '12px', 
                  padding: '1.25rem',
                  marginBottom: '1.5rem',
                  background: theme === 'dark' 
                    ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
                    : 'linear-gradient(135deg, rgba(88, 204, 2, 0.05) 0%, rgba(69, 163, 2, 0.05) 100%)'
                }}>
                  <Label theme={theme} style={{ 
                    marginBottom: '0.75rem', 
                    display: 'block', 
                    fontWeight: 'bold',
                    fontSize: '1rem'
                  }}>
                    Cài đặt Pomodoro
                  </Label>
                  <p style={{ 
                    fontSize: '0.85rem',
                    color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                    marginBottom: '1rem',
                    lineHeight: '1.4'
                  }}>
                    <strong>{formData.workDuration} phút</strong> làm việc → 
                    <strong>{formData.shortBreakDuration} phút</strong> nghỉ → 
                    Sau <strong>{formData.longBreakInterval} phiên</strong> → 
                    <strong>{formData.longBreakDuration} phút</strong> nghỉ dài
                  </p>

                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: '0.75rem'
                  }}>
                    <FormGroup style={{ marginBottom: '0' }}>
                      <Label theme={theme} style={{ fontSize: '0.8rem', fontWeight: '600' }}>Làm việc</Label>
                      <Input
                        theme={theme}
                        type="number"
                        name="workDuration"
                        value={formData.workDuration}
                        onChange={handleChange}
                        min="15"
                        max="60"
                        placeholder="25"
                        required
                        style={{ padding: '0.5rem' }}
                      />
                      <span style={{ fontSize: '0.7rem', color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>phút</span>
                    </FormGroup>

                    <FormGroup style={{ marginBottom: '0' }}>
                      <Label theme={theme} style={{ fontSize: '0.8rem', fontWeight: '600' }}>Nghỉ ngắn</Label>
                      <Input
                        theme={theme}
                        type="number"
                        name="shortBreakDuration"
                        value={formData.shortBreakDuration}
                        onChange={handleChange}
                        min="3"
                        max="15"
                        placeholder="5"
                        required
                        style={{ padding: '0.5rem' }}
                      />
                      <span style={{ fontSize: '0.7rem', color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>phút</span>
                    </FormGroup>

                    <FormGroup style={{ marginBottom: '0' }}>
                      <Label theme={theme} style={{ fontSize: '0.8rem', fontWeight: '600' }}>Sau mỗi</Label>
                      <Input
                        theme={theme}
                        type="number"
                        name="longBreakInterval"
                        value={formData.longBreakInterval}
                        onChange={handleChange}
                        min="2"
                        max="8"
                        placeholder="4"
                        required
                        style={{ padding: '0.5rem' }}
                      />
                      <span style={{ fontSize: '0.7rem', color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>phiên</span>
                    </FormGroup>

                    <FormGroup style={{ marginBottom: '0' }}>
                      <Label theme={theme} style={{ fontSize: '0.8rem', fontWeight: '600' }}>Nghỉ dài</Label>
                      <Input
                        theme={theme}
                        type="number"
                        name="longBreakDuration"
                        value={formData.longBreakDuration}
                        onChange={handleChange}
                        min="10"
                        max="30"
                        placeholder="15"
                        required
                        style={{ padding: '0.5rem' }}
                      />
                      <span style={{ fontSize: '0.7rem', color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>phút</span>
                    </FormGroup>
                  </div>
                </div>
              )}

              {/* ✅ Chỉ hiển thị deadline khi không phải POMODORO */}
              {formData.type !== 'POMODORO' && (
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
              )}

              {/* ✅ Hiển thị help text cho POMODORO */}
              {formData.type === 'POMODORO' && (
                <HelpText theme={theme}>
                  Mục tiêu Pomodoro hoàn thành trong ngày hôm nay
                </HelpText>
              )}

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
                  {loading ? 'Đang xử lý...' : (editingGoal ? 'Cập nhật' : 'Tạo mục tiêu')}
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