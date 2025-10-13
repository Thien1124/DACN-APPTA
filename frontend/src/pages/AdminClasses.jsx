import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Swal from 'sweetalert2';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import AdminLayout from '../layouts/AdminLayout';

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
`;

const WelcomeContent = styled.div`
  flex: 1;
`;

const WelcomeTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.5rem;
`;

const DateTime = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-weight: 600;
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

  &:hover {
    transform: translateY(-5px);
  }
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: ${props => props.color || '#f59e0b'}22;
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
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-weight: 600;
`;

const ControlBar = styled.div`
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
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 250px;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};

  &:focus {
    outline: none;
    border-color: #f59e0b;
  }
`;

const CreateButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  }
`;

const ClassesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;

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
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const ClassHeader = styled.div`
  background: ${props => props.color || 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'};
  padding: 1.5rem;
  color: white;
`;

const ClassTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const ClassBody = styled.div`
  padding: 1.5rem;
`;

const ClassInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const InfoItem = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#d1d5db' : '#4b5563'};
`;

const ClassActions = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem;
  border-radius: 8px;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => {
    if (props.variant === 'edit') return 'rgba(28, 176, 246, 0.1)';
    if (props.variant === 'delete') return 'rgba(239, 68, 68, 0.1)';
    return 'rgba(245, 158, 11, 0.1)';
  }};

  &:hover {
    transform: translateY(-2px);
  }
`;

// ========== MOCK DATA ==========

const mockClasses = [
  {
    id: 1,
    name: 'TOEIC Basic - Morning',
    teacher: 'Tran Thi B',
    students: 28,
    maxStudents: 30,
    status: 'active',
    color: 'linear-gradient(135deg, #58CC02 0%, #45a302 100%)',
  },
  {
    id: 2,
    name: 'Business English Advanced',
    teacher: 'Nguyen Van A',
    students: 15,
    maxStudents: 20,
    status: 'active',
    color: 'linear-gradient(135deg, #1CB0F6 0%, #0891b2 100%)',
  },
  {
    id: 3,
    name: 'IELTS Speaking Practice',
    teacher: 'Le Van C',
    students: 20,
    maxStudents: 25,
    status: 'active',
    color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  },
];

// ========== COMPONENT ==========

const AdminClasses = () => {
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [classes] = useState(mockClasses);
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

  const stats = {
    total: classes.length,
    active: classes.filter(c => c.status === 'active').length,
    students: classes.reduce((sum, c) => sum + c.students, 0),
    capacity: classes.reduce((sum, c) => sum + c.maxStudents, 0),
  };

  const handleEdit = (classItem) => {
    showToast('info', 'Thông báo', `Chỉnh sửa lớp "${classItem.name}"`);
  };

  const handleDelete = (classItem) => {
    Swal.fire({
      title: 'Xác nhận xóa?',
      text: `Bạn có chắc muốn xóa lớp "${classItem.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        showToast('success', 'Đã xóa!', `Lớp "${classItem.name}" đã được xóa`);
      }
    });
  };

  return (
    <AdminLayout pageTitle="🎓 Lớp học">
      <Toast toast={toast} onClose={hideToast} />
      
      <PageContainer>
        <WelcomeCard theme={theme}>
          <WelcomeContent>
            <WelcomeTitle theme={theme}>Quản lý lớp học</WelcomeTitle>
            <DateTime theme={theme}>🕐 {formatDateTime()} UTC | 👤 vinhsonvlog</DateTime>
          </WelcomeContent>
        </WelcomeCard>

        <StatsGrid>
          <StatCard theme={theme}>
            <StatIcon color="#f59e0b">🎓</StatIcon>
            <StatValue theme={theme}>{stats.total}</StatValue>
            <StatLabel theme={theme}>Tổng lớp học</StatLabel>
          </StatCard>
          <StatCard theme={theme}>
            <StatIcon color="#10b981">✅</StatIcon>
            <StatValue theme={theme}>{stats.active}</StatValue>
            <StatLabel theme={theme}>Đang hoạt động</StatLabel>
          </StatCard>
          <StatCard theme={theme}>
            <StatIcon color="#1CB0F6">👥</StatIcon>
            <StatValue theme={theme}>{stats.students}</StatValue>
            <StatLabel theme={theme}>Học viên</StatLabel>
          </StatCard>
          <StatCard theme={theme}>
            <StatIcon color="#8b5cf6">📊</StatIcon>
            <StatValue theme={theme}>{stats.capacity}</StatValue>
            <StatLabel theme={theme}>Sức chứa</StatLabel>
          </StatCard>
        </StatsGrid>

        <ControlBar theme={theme}>
          <SearchInput theme={theme} placeholder="🔍 Tìm kiếm lớp học..." />
          <CreateButton onClick={() => showToast('info', 'Thông báo', 'Tính năng đang phát triển')}>
            ➕ Tạo lớp mới
          </CreateButton>
        </ControlBar>

        <ClassesGrid>
          {classes.map(classItem => (
            <ClassCard key={classItem.id} theme={theme}>
              <ClassHeader color={classItem.color}>
                <ClassTitle>{classItem.name}</ClassTitle>
                <div>👨‍🏫 {classItem.teacher}</div>
              </ClassHeader>
              <ClassBody>
                <ClassInfo>
                  <InfoItem theme={theme}>👥 {classItem.students}/{classItem.maxStudents} học viên</InfoItem>
                  <InfoItem theme={theme}>✅ Trạng thái: {classItem.status}</InfoItem>
                </ClassInfo>
                <ClassActions>
                  <ActionButton variant="view" onClick={() => showToast('info', 'Xem', classItem.name)}>👁️</ActionButton>
                  <ActionButton variant="edit" onClick={() => handleEdit(classItem)}>✏️</ActionButton>
                  <ActionButton variant="delete" onClick={() => handleDelete(classItem)}>🗑️</ActionButton>
                </ClassActions>
              </ClassBody>
            </ClassCard>
          ))}
        </ClassesGrid>
      </PageContainer>
    </AdminLayout>
  );
};

export default AdminClasses;