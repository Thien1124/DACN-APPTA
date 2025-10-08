import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Swal from 'sweetalert2';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import Header from '../components/Header';

// ========== STYLED COMPONENTS ==========

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%)'
    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e0 100%)'
  };
  position: relative;
  overflow-x: hidden;

  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.theme === 'dark'
      ? 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 70%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 70%), radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 70%)'
      : 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 70%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.05) 0%, transparent 70%), radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.05) 0%, transparent 70%)'
    };
    z-index: -1;
  }
`;

const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;
`;

const PageTitleSection = styled.div``;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  span:first-child {
    font-size: 3rem;
  }

  @media (max-width: 768px) {
    font-size: 2rem;
    
    span:first-child {
      font-size: 2.5rem;
    }
  }
`;

const PageSubtitle = styled.p`
  font-size: 1.125rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const JoinButton = styled.button`
  padding: 1rem 2rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
  color: white;
  border: none;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(88, 204, 2, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(88, 204, 2, 0.4);
  }

  span:first-child {
    font-size: 1.5rem;
  }
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
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: ${props => props.color || '#58CC02'}22;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-weight: 600;
`;

const ClassesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ClassCard = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 0;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  }
`;

const ClassHeader = styled.div`
  background: ${props => props.color || 'linear-gradient(135deg, #58CC02 0%, #45a302 100%)'};
  padding: 2rem;
  color: white;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 150px;
    height: 150px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transform: translate(30%, -30%);
  }
`;

const ClassTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
`;

const ClassSubject = styled.div`
  font-size: 0.875rem;
  opacity: 0.9;
  position: relative;
  z-index: 1;
  margin-bottom: 0.5rem;
`;

const TeacherName = styled.div`
  font-size: 0.875rem;
  opacity: 0.9;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ClassBody = styled.div`
  padding: 1.5rem;
`;

const ClassInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#d1d5db' : '#4b5563'};
  font-size: 0.875rem;

  span:first-child {
    font-size: 1.25rem;
  }
`;

const ProgressSection = styled.div`
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#f9fafb'};
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#e5e7eb' : '#374151'};
`;

const ProgressBar = styled.div`
  height: 8px;
  background: ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${props => props.progress}%;
  background: linear-gradient(90deg, #58CC02 0%, #45a302 100%);
  border-radius: 4px;
  transition: width 1s ease;
`;

const ClassActions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
`;

const ActionButton = styled.button`
  padding: 0.75rem;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  ${props => {
    if (props.variant === 'primary') {
      return `
        background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
        color: white;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(88, 204, 2, 0.3);
        }
      `;
    }
    if (props.variant === 'secondary') {
      return `
        background: linear-gradient(135deg, #1CB0F6 0%, #0891b2 100%);
        color: white;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(28, 176, 246, 0.3);
        }
      `;
    }
    return `
      background: ${props.theme === 'dark' ? '#374151' : '#f3f4f6'};
      color: ${props.theme === 'dark' ? '#e5e7eb' : '#374151'};
      
      &:hover {
        background: ${props.theme === 'dark' ? '#4B5563' : '#e5e7eb'};
      }
    `;
  }}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
`;

const EmptyIcon = styled.div`
  font-size: 5rem;
  margin-bottom: 1rem;
  opacity: 0.5;
`;

const EmptyText = styled.div`
  font-size: 1.25rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-weight: 600;
  margin-bottom: 1rem;
`;

const EmptySubtext = styled.div`
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#6b7280' : '#9ca3af'};
  margin-bottom: 2rem;
`;

const EmptyButton = styled.button`
  padding: 1rem 2rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
  color: white;
  border: none;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(88, 204, 2, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(88, 204, 2, 0.4);
  }
`;

// ========== MOCK DATA ==========

const mockMyClasses = [
  {
    id: 1,
    name: 'TOEIC Basic - Morning Class',
    subject: 'TOEIC Preparation',
    teacher: 'Tran Thi B',
    code: 'ABC123',
    students: 28,
    maxStudents: 30,
    lessons: 12,
    completedLessons: 8,
    assignments: 8,
    completedAssignments: 6,
    progress: 67,
    joinedDate: '2025-01-15',
    color: 'linear-gradient(135deg, #58CC02 0%, #45a302 100%)',
  },
  {
    id: 2,
    name: 'Business English Advanced',
    subject: 'Business Communication',
    teacher: 'Nguyen Van C',
    code: 'XYZ789',
    students: 15,
    maxStudents: 20,
    lessons: 8,
    completedLessons: 5,
    assignments: 5,
    completedAssignments: 4,
    progress: 63,
    joinedDate: '2025-02-01',
    color: 'linear-gradient(135deg, #1CB0F6 0%, #0891b2 100%)',
  },
  {
    id: 3,
    name: 'IELTS Speaking Practice',
    subject: 'IELTS Preparation',
    teacher: 'Le Thi D',
    code: 'DEF456',
    students: 20,
    maxStudents: 25,
    lessons: 10,
    completedLessons: 3,
    assignments: 6,
    completedAssignments: 2,
    progress: 30,
    joinedDate: '2025-01-20',
    color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  },
];

// ========== COMPONENT ==========

const StudentClasses = () => {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [theme, setTheme] = useState('light');
  const [classes, setClasses] = useState(mockMyClasses);

  const stats = {
    totalClasses: classes.length,
    totalLessons: classes.reduce((sum, c) => sum + c.completedLessons, 0),
    totalAssignments: classes.reduce((sum, c) => sum + c.completedAssignments, 0),
    avgProgress: Math.round(classes.reduce((sum, c) => sum + c.progress, 0) / classes.length),
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleJoinClass = () => {
    navigate('/join-class');
  };

  const handleEnterClass = (classItem) => {
    navigate(`/student/class/${classItem.id}`);
  };

  const handleViewAssignments = (classItem) => {
    showToast('info', 'Thông báo', `Xem bài tập lớp "${classItem.name}"`);
  };

  const handleViewGrades = (classItem) => {
    showToast('info', 'Thông báo', `Xem điểm lớp "${classItem.name}"`);
  };

  const handleLeaveClass = (classItem) => {
    Swal.fire({
      title: 'Xác nhận rời lớp?',
      text: `Bạn có chắc muốn rời lớp "${classItem.name}"? Tiến độ học tập sẽ được lưu lại.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Rời lớp',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        setClasses(classes.filter(c => c.id !== classItem.id));
        showToast('success', 'Đã rời lớp!', `Bạn đã rời khỏi lớp "${classItem.name}"`);
      }
    });
  };

  return (
    <PageWrapper theme={theme}>
      <Toast toast={toast} onClose={hideToast} />

      <Header
        theme={theme}
        onThemeToggle={toggleTheme}
        userName="Vinh Son"
        userEmail="vinhsonvlog@example.com"
        notificationCount={3}
        showNotification={true}
        showAvatar={true}
      />

      <DashboardContainer>
        {/* Page Header */}
        <PageHeader>
          <PageTitleSection>
            <PageTitle theme={theme}>
              <span>📚</span>
              Lớp học của tôi
            </PageTitle>
            <PageSubtitle theme={theme}>
              Quản lý và theo dõi tiến độ các lớp học
            </PageSubtitle>
          </PageTitleSection>
          <JoinButton onClick={handleJoinClass}>
            <span>➕</span>
            Tham gia lớp học
          </JoinButton>
        </PageHeader>

        {classes.length > 0 ? (
          <>
            {/* Stats */}
            <StatsGrid>
              <StatCard theme={theme} delay="0.1s">
                <StatIcon color="#58CC02">🎓</StatIcon>
                <StatValue theme={theme}>{stats.totalClasses}</StatValue>
                <StatLabel theme={theme}>Lớp học</StatLabel>
              </StatCard>

              <StatCard theme={theme} delay="0.2s">
                <StatIcon color="#1CB0F6">📚</StatIcon>
                <StatValue theme={theme}>{stats.totalLessons}</StatValue>
                <StatLabel theme={theme}>Bài học hoàn thành</StatLabel>
              </StatCard>

              <StatCard theme={theme} delay="0.3s">
                <StatIcon color="#8b5cf6">📝</StatIcon>
                <StatValue theme={theme}>{stats.totalAssignments}</StatValue>
                <StatLabel theme={theme}>Bài tập hoàn thành</StatLabel>
              </StatCard>

              <StatCard theme={theme} delay="0.4s">
                <StatIcon color="#f59e0b">📊</StatIcon>
                <StatValue theme={theme}>{stats.avgProgress}%</StatValue>
                <StatLabel theme={theme}>Tiến độ trung bình</StatLabel>
              </StatCard>
            </StatsGrid>

            {/* Classes Grid */}
            <ClassesGrid>
              {classes.map(classItem => (
                <ClassCard key={classItem.id} theme={theme}>
                  <ClassHeader color={classItem.color}>
                    <ClassTitle>{classItem.name}</ClassTitle>
                    <ClassSubject>{classItem.subject}</ClassSubject>
                    <TeacherName>
                      <span>👨‍🏫</span>
                      {classItem.teacher}
                    </TeacherName>
                  </ClassHeader>

                  <ClassBody>
                    <ClassInfo>
                      <InfoItem theme={theme}>
                        <span>📚</span>
                        <span>{classItem.completedLessons}/{classItem.lessons} bài học</span>
                      </InfoItem>
                      <InfoItem theme={theme}>
                        <span>📝</span>
                        <span>{classItem.completedAssignments}/{classItem.assignments} bài tập</span>
                      </InfoItem>
                      <InfoItem theme={theme}>
                        <span>👥</span>
                        <span>{classItem.students} học viên</span>
                      </InfoItem>
                      <InfoItem theme={theme}>
                        <span>📅</span>
                        <span>Tham gia: {classItem.joinedDate}</span>
                      </InfoItem>
                    </ClassInfo>

                    <ProgressSection theme={theme}>
                      <ProgressLabel theme={theme}>
                        <span>Tiến độ học tập</span>
                        <span>{classItem.progress}%</span>
                      </ProgressLabel>
                      <ProgressBar theme={theme}>
                        <ProgressFill progress={classItem.progress} />
                      </ProgressBar>
                    </ProgressSection>

                    <ClassActions>
                      <ActionButton
                        theme={theme}
                        variant="primary"
                        onClick={() => handleEnterClass(classItem)}
                      >
                        <span>📖</span>
                        Vào lớp
                      </ActionButton>
                      <ActionButton
                        theme={theme}
                        variant="secondary"
                        onClick={() => handleViewAssignments(classItem)}
                      >
                        <span>📝</span>
                        Bài tập
                      </ActionButton>
                      <ActionButton
                        theme={theme}
                        onClick={() => handleViewGrades(classItem)}
                      >
                        <span>📊</span>
                        Điểm số
                      </ActionButton>
                      <ActionButton
                        theme={theme}
                        onClick={() => handleLeaveClass(classItem)}
                      >
                        <span>🚪</span>
                        Rời lớp
                      </ActionButton>
                    </ClassActions>
                  </ClassBody>
                </ClassCard>
              ))}
            </ClassesGrid>
          </>
        ) : (
          <EmptyState>
            <EmptyIcon>📚</EmptyIcon>
            <EmptyText theme={theme}>
              Chưa tham gia lớp học nào
            </EmptyText>
            <EmptySubtext theme={theme}>
              Nhập mã lớp học để tham gia lớp đầu tiên của bạn
            </EmptySubtext>
            <EmptyButton onClick={handleJoinClass}>
              <span>➕</span>
              Tham gia lớp học ngay
            </EmptyButton>
          </EmptyState>
        )}
      </DashboardContainer>
    </PageWrapper>
  );
};

export default StudentClasses;