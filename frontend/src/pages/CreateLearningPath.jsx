import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Swal from 'sweetalert2';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import Header from '../components/Header';

// ========== STYLED COMPONENTS ==========

const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${props => props.theme === 'dark'
    ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
    : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
  };
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const WelcomeCard = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
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
`;

const WelcomeTitle = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
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
`;

const GoalsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const GoalCard = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  }
`;

const GoalHeader = styled.div`
  background: ${props => props.color || 'linear-gradient(135deg, #58CC02 0%, #45a302 100%)'};
  padding: 1.5rem;
  color: white;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 120px;
    height: 120px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transform: translate(30%, -30%);
  }
`;

const GoalIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
`;

const GoalTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
`;

const GoalMeta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  opacity: 0.9;
  position: relative;
  z-index: 1;
`;

const GoalBody = styled.div`
  padding: 1.5rem;
`;

const GoalDescription = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-bottom: 1rem;
  line-height: 1.6;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${props => props.progress || 0}%;
  background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  text-align: right;
`;

const GoalStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 0.75rem;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#f9fafb'};
  border-radius: 10px;
`;

const StatValue = styled.div`
  font-size: 1.125rem;
  font-weight: bold;
  color: ${props => props.color || '#58CC02'};
`;

const StatLabel = styled.div`
  font-size: 0.7rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  text-transform: uppercase;
  margin-top: 0.25rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const Button = styled.button`
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;

  ${props => {
    if (props.variant === 'primary') {
      return `
        background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
        color: white;
        &:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(88, 204, 2, 0.3); }
      `;
    }
    if (props.variant === 'secondary') {
      return `
        background: rgba(88, 204, 2, 0.1);
        color: #58CC02;
        &:hover { background: rgba(88, 204, 2, 0.2); }
      `;
    }
    return '';
  }}
`;

const CreateButton = styled.button`
  width: 100%;
  padding: 1.5rem;
  border-radius: 16px;
  border: 2px dashed ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  background: transparent;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;

  &:hover {
    border-color: #58CC02;
    color: #58CC02;
    background: rgba(88, 204, 2, 0.05);
  }
`;

// ========== MOCK DATA ==========

const mockGoals = [
  {
    id: 1,
    icon: '🎯',
    title: 'TOEIC 650 Core',
    description: 'Học 650 từ vựng cốt lõi TOEIC trong 30 ngày',
    totalWords: 650,
    learned: 234,
    remaining: 416,
    progress: 36,
    duration: '30 ngày',
    color: 'linear-gradient(135deg, #58CC02 0%, #45a302 100%)',
  },
  {
    id: 2,
    icon: '📚',
    title: 'IELTS Band 7.0',
    description: 'Chuẩn bị từ vựng IELTS Academic band 7.0+',
    totalWords: 500,
    learned: 120,
    remaining: 380,
    progress: 24,
    duration: '45 ngày',
    color: 'linear-gradient(135deg, #1CB0F6 0%, #0891b2 100%)',
  },
  {
    id: 3,
    icon: '💼',
    title: 'Business English',
    description: 'Tiếng Anh thương mại cho môi trường công sở',
    totalWords: 300,
    learned: 89,
    remaining: 211,
    progress: 30,
    duration: '20 ngày',
    color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  },
];

// ========== COMPONENT ==========

const CreateLearningPath = () => {
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateTime = () => {
    const year = currentTime.getUTCFullYear();
    const month = String(currentTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(currentTime.getUTCDate()).padStart(2, '0');
    const hours = String(currentTime.getUTCHours()).padStart(2, '0');
    const minutes = String(currentTime.getUTCMinutes()).padStart(2, '0');
    const seconds = String(currentTime.getUTCSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const handleCreatePath = () => {
    Swal.fire({
      title: '✨ Tạo Lộ Trình Mới',
      html: `
        <div style="display:flex;flex-direction:column;gap:1rem;text-align:left;">
          <label>
            <span style="font-weight:600;color:#1e293b;display:block;margin-bottom:0.5rem;">🎯 Mục tiêu</span>
            <input id="goalName" class="swal2-input" placeholder="VD: TOEIC 750" style="margin:0;width:100%;">
          </label>
          <label>
            <span style="font-weight:600;color:#1e293b;display:block;margin-bottom:0.5rem;">📝 Mô tả</span>
            <textarea id="goalDesc" class="swal2-textarea" placeholder="Mô tả mục tiêu..." style="margin:0;width:100%;min-height:80px;"></textarea>
          </label>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
            <label>
              <span style="font-weight:600;color:#1e293b;display:block;margin-bottom:0.5rem;">🔢 Số từ vựng</span>
              <input id="goalWords" type="number" class="swal2-input" placeholder="500" value="500" style="margin:0;width:100%;">
            </label>
            <label>
              <span style="font-weight:600;color:#1e293b;display:block;margin-bottom:0.5rem;">📅 Thời gian (ngày)</span>
              <input id="goalDays" type="number" class="swal2-input" placeholder="30" value="30" style="margin:0;width:100%;">
            </label>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '🚀 Tạo lộ trình',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#58CC02',
      cancelButtonColor: '#6b7280',
      width: 600,
    }).then((result) => {
      if (result.isConfirmed) {
        showToast('success', 'Thành công!', 'Lộ trình học đã được tạo');
      }
    });
  };

  const handleStartPath = (goal) => {
    showToast('info', 'Bắt đầu học', `Bắt đầu lộ trình "${goal.title}"`);
  };

  const handleViewDetails = (goal) => {
    showToast('info', 'Chi tiết', `Xem chi tiết lộ trình "${goal.title}"`);
  };

  return (
    <PageWrapper theme={theme}>
      <Header theme={theme} userName="vinhsonvlog" />
      <Toast toast={toast} onClose={hideToast} />
      
      <Container>
        <WelcomeCard theme={theme}>
          <WelcomeTitle theme={theme}>
            <span>🗺️</span>
            Tạo lộ trình theo mục tiêu
          </WelcomeTitle>
          <WelcomeSubtitle theme={theme}>
            Tạo lộ trình học theo mục tiêu cụ thể để hướng dẫn học tập có kế hoạch
          </WelcomeSubtitle>
          <DateTime theme={theme}>
            🕐 {formatDateTime()} UTC | 👤 vinhsonvlog
          </DateTime>
        </WelcomeCard>

        <GoalsGrid>
          {mockGoals.map(goal => (
            <GoalCard key={goal.id} theme={theme}>
              <GoalHeader color={goal.color}>
                <GoalIcon>{goal.icon}</GoalIcon>
                <GoalTitle>{goal.title}</GoalTitle>
                <GoalMeta>
                  <span>📚 {goal.totalWords} từ</span>
                  <span>📅 {goal.duration}</span>
                </GoalMeta>
              </GoalHeader>

              <GoalBody>
                <GoalDescription theme={theme}>
                  {goal.description}
                </GoalDescription>

                <ProgressBar theme={theme}>
                  <ProgressFill progress={goal.progress} />
                </ProgressBar>
                <ProgressText theme={theme}>
                  {goal.learned}/{goal.totalWords} từ ({goal.progress}%)
                </ProgressText>

                <GoalStats>
                  <StatItem theme={theme}>
                    <StatValue color="#58CC02">{goal.learned}</StatValue>
                    <StatLabel theme={theme}>Đã học</StatLabel>
                  </StatItem>
                  <StatItem theme={theme}>
                    <StatValue color="#f59e0b">{goal.remaining}</StatValue>
                    <StatLabel theme={theme}>Còn lại</StatLabel>
                  </StatItem>
                  <StatItem theme={theme}>
                    <StatValue color="#1CB0F6">{goal.progress}%</StatValue>
                    <StatLabel theme={theme}>Tiến độ</StatLabel>
                  </StatItem>
                </GoalStats>

                <ActionButtons>
                  <Button variant="primary" onClick={() => handleStartPath(goal)}>
                    🚀 Bắt đầu
                  </Button>
                  <Button variant="secondary" onClick={() => handleViewDetails(goal)}>
                    👁️ Chi tiết
                  </Button>
                </ActionButtons>
              </GoalBody>
            </GoalCard>
          ))}

          <GoalCard theme={theme}>
            <CreateButton theme={theme} onClick={handleCreatePath}>
              <span style={{ fontSize: '2rem' }}>➕</span>
              <span>Tạo lộ trình mới</span>
            </CreateButton>
          </GoalCard>
        </GoalsGrid>
      </Container>
    </PageWrapper>
  );
};

export default CreateLearningPath;