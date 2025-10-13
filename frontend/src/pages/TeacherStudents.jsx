import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Swal from 'sweetalert2';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import TeacherLayout from '../layouts/TeacherLayout';

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

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
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
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const SearchWrapper = styled.div`
  position: relative;
  flex: 1;
  min-width: 250px;
  
  &::before {
    content: '🔍';
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1.25rem;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border-radius: 12px;
  border: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }
`;

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #8b5cf6;
  }
`;

const TableSection = styled.div`
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

const TableWrapper = styled.div`
  overflow-x: auto;
  border-radius: 12px;
  
  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${props => props.theme === 'dark' ? '#1f2937' : '#f3f4f6'};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #8b5cf6;
    border-radius: 4px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
`;

const TableHead = styled.thead`
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#f9fafb'};
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.theme === 'dark' ? 'rgba(139, 92, 246, 0.05)' : 'rgba(139, 92, 246, 0.03)'};
  }
`;

const TableHeader = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const TableCell = styled.td`
  padding: 1rem;
  color: ${props => props.theme === 'dark' ? '#d1d5db' : '#4b5563'};
  font-size: 0.875rem;
`;

const StudentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StudentAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.color || 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
`;

const StudentDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const StudentName = styled.div`
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
`;

const StudentEmail = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const ClassBadge = styled.span`
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: bold;
  background: ${props => props.color || '#8b5cf6'}22;
  color: ${props => props.color || '#8b5cf6'};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${props => props.progress}%;
  background: linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
`;

const ActionButton = styled.button`
  padding: 0.5rem;
  border-radius: 8px;
  border: none;
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.25rem;

  &:hover {
    transform: translateY(-2px);
    background: rgba(139, 92, 246, 0.2);
  }
`;

// ========== MOCK DATA ==========

const mockStudents = [
  {
    id: 1,
    name: 'Nguyen Van A',
    email: 'nguyenvana@example.com',
    class: 'TOEIC Basic',
    progress: 75,
    level: 8,
    avatar: '👨',
    color: 'linear-gradient(135deg, #58CC02 0%, #45a302 100%)',
  },
  {
    id: 2,
    name: 'Tran Thi B',
    email: 'tranthib@example.com',
    class: 'Business English',
    progress: 62,
    level: 5,
    avatar: '👩',
    color: 'linear-gradient(135deg, #1CB0F6 0%, #0891b2 100%)',
  },
  {
    id: 3,
    name: 'Le Van C',
    email: 'levanc@example.com',
    class: 'IELTS Speaking',
    progress: 45,
    level: 3,
    avatar: '🧑',
    color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  },
];

// ========== COMPONENT ==========

const TeacherStudents = () => {
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [students] = useState(mockStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');

  const stats = {
    total: students.length,
    active: students.filter(s => s.progress > 50).length,
    avgProgress: Math.round(students.reduce((sum, s) => sum + s.progress, 0) / students.length),
    avgLevel: Math.round(students.reduce((sum, s) => sum + s.level, 0) / students.length),
  };

  const filteredStudents = students.filter(student => {
    const matchSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchClass = filterClass === 'all' || student.class === filterClass;
    return matchSearch && matchClass;
  });

  const handleViewDetails = (student) => {
    showToast('info', 'Thông báo', `Xem chi tiết học viên "${student.name}"`);
  };

  return (
    <TeacherLayout pageTitle="👥 Học viên">
      <Toast toast={toast} onClose={hideToast} />
      
      <PageContainer>
        {/* Stats */}
        <StatsGrid>
          <StatCard theme={theme}>
            <StatIcon color="#8b5cf6">👥</StatIcon>
            <StatValue theme={theme}>{stats.total}</StatValue>
            <StatLabel theme={theme}>Tổng học viên</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#10b981">✅</StatIcon>
            <StatValue theme={theme}>{stats.active}</StatValue>
            <StatLabel theme={theme}>Đang hoạt động</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#1CB0F6">📊</StatIcon>
            <StatValue theme={theme}>{stats.avgProgress}%</StatValue>
            <StatLabel theme={theme}>Tiến độ TB</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#f59e0b">🎯</StatIcon>
            <StatValue theme={theme}>{stats.avgLevel}</StatValue>
            <StatLabel theme={theme}>Level TB</StatLabel>
          </StatCard>
        </StatsGrid>

        {/* Control Bar */}
        <ControlBar theme={theme}>
          <SearchWrapper>
            <SearchInput
              theme={theme}
              placeholder="Tìm kiếm học viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchWrapper>
          
          <FilterSelect
            theme={theme}
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
          >
            <option value="all">Tất cả lớp</option>
            <option value="TOEIC Basic">TOEIC Basic</option>
            <option value="Business English">Business English</option>
            <option value="IELTS Speaking">IELTS Speaking</option>
          </FilterSelect>
        </ControlBar>

        {/* Table */}
        <TableSection theme={theme}>
          <TableWrapper theme={theme}>
            <Table>
              <TableHead theme={theme}>
                <TableRow>
                  <TableHeader theme={theme}>Học viên</TableHeader>
                  <TableHeader theme={theme}>Lớp học</TableHeader>
                  <TableHeader theme={theme}>Level</TableHeader>
                  <TableHeader theme={theme}>Tiến độ</TableHeader>
                  <TableHeader theme={theme}>Hành động</TableHeader>
                </TableRow>
              </TableHead>
              <tbody>
                {filteredStudents.map(student => (
                  <TableRow key={student.id} theme={theme}>
                    <TableCell>
                      <StudentInfo>
                        <StudentAvatar color={student.color}>
                          {student.avatar}
                        </StudentAvatar>
                        <StudentDetails>
                          <StudentName theme={theme}>{student.name}</StudentName>
                          <StudentEmail theme={theme}>{student.email}</StudentEmail>
                        </StudentDetails>
                      </StudentInfo>
                    </TableCell>
                    <TableCell>
                      <ClassBadge color="#8b5cf6">{student.class}</ClassBadge>
                    </TableCell>
                    <TableCell>Level {student.level}</TableCell>
                    <TableCell>
                      <div style={{ marginBottom: '0.5rem' }}>{student.progress}%</div>
                      <ProgressBar theme={theme}>
                        <ProgressFill progress={student.progress} />
                      </ProgressBar>
                    </TableCell>
                    <TableCell>
                      <ActionButton onClick={() => handleViewDetails(student)}>
                        👁️
                      </ActionButton>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </TableWrapper>
        </TableSection>
      </PageContainer>
    </TeacherLayout>
  );
};

export default TeacherStudents;