import React, { useState } from 'react';
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

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
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

const CreateButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
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
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  }
`;

const AssignmentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const AssignmentCard = styled.div`
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

const AssignmentHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const AssignmentIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: ${props => props.color || '#8b5cf6'}22;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const AssignmentInfo = styled.div`
  flex: 1;
`;

const AssignmentTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.25rem;
`;

const AssignmentClass = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const AssignmentDescription = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-bottom: 1rem;
  line-height: 1.6;
`;

const AssignmentMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const MetaBadge = styled.span`
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: bold;
  background: ${props => props.color || '#8b5cf6'}22;
  color: ${props => props.color || '#8b5cf6'};
`;

const ProgressSection = styled.div`
  margin-bottom: 1rem;
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-bottom: 0.5rem;
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

const AssignmentActions = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
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
        background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        color: white;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
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

// ========== MOCK DATA ==========

const mockAssignments = [
  {
    id: 1,
    title: 'TOEIC Reading Practice',
    description: 'Hoàn thành 50 câu hỏi TOEIC Reading Part 5 & 6',
    class: 'TOEIC Basic',
    deadline: '2025-10-15',
    submitted: 18,
    total: 28,
    icon: '📝',
    color: '#58CC02',
  },
  {
    id: 2,
    title: 'Business Email Assignment',
    description: 'Viết 3 email chuyên nghiệp theo tình huống đã cho',
    class: 'Business English',
    deadline: '2025-10-12',
    submitted: 12,
    total: 15,
    icon: '📧',
    color: '#1CB0F6',
  },
  {
    id: 3,
    title: 'IELTS Speaking Topic',
    description: 'Ghi âm câu trả lời cho 3 chủ đề IELTS Speaking Part 2',
    class: 'IELTS Speaking',
    deadline: '2025-10-20',
    submitted: 8,
    total: 20,
    icon: '🎤',
    color: '#f59e0b',
  },
];

// ========== COMPONENT ==========

const TeacherAssignments = () => {
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [assignments] = useState(mockAssignments);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const stats = {
    total: assignments.length,
    pending: assignments.filter(a => a.submitted < a.total).length,
    completed: assignments.filter(a => a.submitted === a.total).length,
    submissions: assignments.reduce((sum, a) => sum + a.submitted, 0),
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       assignment.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'pending') return matchSearch && assignment.submitted < assignment.total;
    if (filterStatus === 'completed') return matchSearch && assignment.submitted === assignment.total;
    return matchSearch;
  });

  const handleCreateAssignment = () => {
    showToast('info', 'Thông báo', 'Chức năng tạo bài tập đang phát triển');
  };

  const handleViewSubmissions = (assignment) => {
    showToast('info', 'Thông báo', `Xem bài nộp của "${assignment.title}"`);
  };

  const handleGrade = (assignment) => {
    showToast('info', 'Thông báo', `Chấm điểm bài tập "${assignment.title}"`);
  };

  const handleEdit = (assignment) => {
    showToast('info', 'Thông báo', `Chỉnh sửa bài tập "${assignment.title}"`);
  };

  return (
    <TeacherLayout pageTitle="✍️ Bài tập">
      <Toast toast={toast} onClose={hideToast} />
      
      <PageContainer>
        {/* Stats */}
        <StatsGrid>
          <StatCard theme={theme}>
            <StatIcon color="#8b5cf6">✍️</StatIcon>
            <StatValue theme={theme}>{stats.total}</StatValue>
            <StatLabel theme={theme}>Tổng bài tập</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#f59e0b">⏳</StatIcon>
            <StatValue theme={theme}>{stats.pending}</StatValue>
            <StatLabel theme={theme}>Đang diễn ra</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#10b981">✅</StatIcon>
            <StatValue theme={theme}>{stats.completed}</StatValue>
            <StatLabel theme={theme}>Hoàn thành</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#1CB0F6">📊</StatIcon>
            <StatValue theme={theme}>{stats.submissions}</StatValue>
            <StatLabel theme={theme}>Bài nộp</StatLabel>
          </StatCard>
        </StatsGrid>

        {/* Control Bar */}
        <ControlBar theme={theme}>
          <SearchWrapper>
            <SearchInput
              theme={theme}
              placeholder="Tìm kiếm bài tập..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchWrapper>
          
          <ActionButtons>
            <FilterSelect
              theme={theme}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="pending">Đang diễn ra</option>
              <option value="completed">Hoàn thành</option>
            </FilterSelect>
            
            <CreateButton onClick={handleCreateAssignment}>
              <span>➕</span>
              Tạo bài tập
            </CreateButton>
          </ActionButtons>
        </ControlBar>

        {/* Assignments Grid */}
        <AssignmentsGrid>
          {filteredAssignments.map(assignment => {
            const progress = Math.round((assignment.submitted / assignment.total) * 100);
            
            return (
              <AssignmentCard key={assignment.id} theme={theme}>
                <AssignmentHeader>
                  <AssignmentIcon color={assignment.color}>
                    {assignment.icon}
                  </AssignmentIcon>
                  <AssignmentInfo>
                    <AssignmentTitle theme={theme}>
                      {assignment.title}
                    </AssignmentTitle>
                    <AssignmentClass theme={theme}>
                      {assignment.class}
                    </AssignmentClass>
                  </AssignmentInfo>
                </AssignmentHeader>
                
                <AssignmentDescription theme={theme}>
                  {assignment.description}
                </AssignmentDescription>
                
                <AssignmentMeta>
                  <MetaBadge color="#ef4444">
                    ⏰ Hạn: {assignment.deadline}
                  </MetaBadge>
                  <MetaBadge color="#1CB0F6">
                    📊 {assignment.submitted}/{assignment.total} bài
                  </MetaBadge>
                </AssignmentMeta>
                
                <ProgressSection>
                  <ProgressLabel theme={theme}>
                    <span>Tiến độ nộp bài</span>
                    <span>{progress}%</span>
                  </ProgressLabel>
                  <ProgressBar theme={theme}>
                    <ProgressFill progress={progress} />
                  </ProgressBar>
                </ProgressSection>

                <AssignmentActions theme={theme}>
                  <ActionButton
                    theme={theme}
                    variant="primary"
                    onClick={() => handleViewSubmissions(assignment)}
                  >
                    👁️
                  </ActionButton>
                  <ActionButton
                    theme={theme}
                    onClick={() => handleGrade(assignment)}
                  >
                    ✅ Chấm
                  </ActionButton>
                  <ActionButton
                    theme={theme}
                    onClick={() => handleEdit(assignment)}
                  >
                    ✏️ Sửa
                  </ActionButton>
                </AssignmentActions>
              </AssignmentCard>
            );
          })}
        </AssignmentsGrid>
      </PageContainer>
    </TeacherLayout>
  );
};

export default TeacherAssignments;