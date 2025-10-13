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
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 300px;
    height: 300px;
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    opacity: 0.05;
    border-radius: 50%;
    transform: translate(30%, -30%);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
`;

const WelcomeContent = styled.div`
  flex: 1;
  z-index: 1;
`;

const WelcomeTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.5rem;
`;

const WelcomeSubtitle = styled.p`
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-bottom: 0.75rem;
`;

const DateTime = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  span:first-child {
    font-size: 1rem;
  }
`;

const WelcomeIllustration = styled.div`
  font-size: 5rem;
  z-index: 1;

  @media (max-width: 768px) {
    font-size: 4rem;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1.5rem;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 768px) {
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
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
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
    border-color: #f59e0b;
    box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
  }

  &::placeholder {
    color: ${props => props.theme === 'dark' ? '#6b7280' : '#9ca3af'};
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
  transition: all 0.3s ease;

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
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  white-space: nowrap;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
  }
`;

const ExamsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ExamCard = styled.div`
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

const ExamHeader = styled.div`
  background: ${props => props.color || 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'};
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

const ExamTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
`;

const ExamType = styled.div`
  font-size: 0.875rem;
  opacity: 0.9;
  position: relative;
  z-index: 1;
`;

const ExamBody = styled.div`
  padding: 1.5rem;
`;

const ExamDescription = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-bottom: 1rem;
  line-height: 1.6;
`;

const ExamInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const InfoBadge = styled.span`
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: bold;
  background: ${props => props.color || '#f59e0b'}22;
  color: ${props => props.color || '#f59e0b'};
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
`;

const StatusBadge = styled.span`
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: bold;
  background: ${props => {
    if (props.status === 'active') return 'rgba(16, 185, 129, 0.2)';
    if (props.status === 'draft') return 'rgba(156, 163, 175, 0.2)';
    if (props.status === 'archived') return 'rgba(107, 114, 128, 0.2)';
    return 'rgba(245, 158, 11, 0.2)';
  }};
  color: ${props => {
    if (props.status === 'active') return '#10b981';
    if (props.status === 'draft') return '#6b7280';
    if (props.status === 'archived') return '#4b5563';
    return '#f59e0b';
  }};
  text-transform: uppercase;
`;

const ExamActions = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
`;

const ActionButton = styled.button`
  padding: 0.75rem;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  ${props => {
    if (props.variant === 'view') {
      return `
        background: rgba(28, 176, 246, 0.1);
        color: #1CB0F6;
        
        &:hover {
          background: rgba(28, 176, 246, 0.2);
          transform: translateY(-2px);
        }
      `;
    }
    if (props.variant === 'edit') {
      return `
        background: rgba(245, 158, 11, 0.1);
        color: #f59e0b;
        
        &:hover {
          background: rgba(245, 158, 11, 0.2);
          transform: translateY(-2px);
        }
      `;
    }
    if (props.variant === 'duplicate') {
      return `
        background: rgba(139, 92, 246, 0.1);
        color: #8b5cf6;
        
        &:hover {
          background: rgba(139, 92, 246, 0.2);
          transform: translateY(-2px);
        }
      `;
    }
    if (props.variant === 'delete') {
      return `
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
        
        &:hover {
          background: rgba(239, 68, 68, 0.2);
          transform: translateY(-2px);
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

const mockExams = [
  {
    id: 1,
    title: 'TOEIC Full Test #1',
    type: 'TOEIC L&R',
    description: 'Đề thi TOEIC đầy đủ 200 câu gồm Listening và Reading',
    questions: 200,
    duration: 120,
    difficulty: 'Intermediate',
    status: 'active',
    attempts: 156,
    avgScore: 78,
    color: 'linear-gradient(135deg, #58CC02 0%, #45a302 100%)',
  },
  {
    id: 2,
    title: 'IELTS Academic Writing',
    type: 'IELTS Writing',
    description: 'Đề thi IELTS Writing Task 1 & Task 2',
    questions: 2,
    duration: 60,
    difficulty: 'Advanced',
    status: 'active',
    attempts: 89,
    avgScore: 6.5,
    color: 'linear-gradient(135deg, #1CB0F6 0%, #0891b2 100%)',
  },
  {
    id: 3,
    title: 'Business English Proficiency',
    type: 'Business Test',
    description: 'Kiểm tra năng lực tiếng Anh thương mại',
    questions: 50,
    duration: 45,
    difficulty: 'Advanced',
    status: 'active',
    attempts: 67,
    avgScore: 82,
    color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  },
  {
    id: 4,
    title: 'Grammar Foundation Test',
    type: 'Grammar',
    description: 'Đề thi ngữ pháp cơ bản cho người mới bắt đầu',
    questions: 40,
    duration: 30,
    difficulty: 'Beginner',
    status: 'draft',
    attempts: 0,
    avgScore: 0,
    color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  },
  {
    id: 5,
    title: 'Vocabulary Advanced Test',
    type: 'Vocabulary',
    description: 'Kiểm tra từ vựng nâng cao 500+ từ',
    questions: 100,
    duration: 40,
    difficulty: 'Advanced',
    status: 'archived',
    attempts: 234,
    avgScore: 75,
    color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  },
];

// ========== COMPONENT ==========

const AdminExams = () => {
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [exams] = useState(mockExams);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date) => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const stats = {
    total: exams.length,
    active: exams.filter(e => e.status === 'active').length,
    draft: exams.filter(e => e.status === 'draft').length,
    totalAttempts: exams.reduce((sum, e) => sum + e.attempts, 0),
    avgScore: Math.round(exams.filter(e => e.avgScore > 0).reduce((sum, e) => sum + e.avgScore, 0) / exams.filter(e => e.avgScore > 0).length),
  };

  const filteredExams = exams.filter(exam => {
    const matchSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       exam.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || exam.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleCreateExam = () => {
    Swal.fire({
      title: '➕ Tạo đề thi mới',
      html: `
        <div style="display:flex;flex-direction:column;gap:1rem;text-align:left;">
          <label style="display:flex;flex-direction:column;gap:0.5rem;">
            <span style="font-weight:600;color:#1e293b;">📝 Tên đề thi *</span>
            <input id="examTitle" class="swal2-input" placeholder="VD: TOEIC Full Test #2" style="margin:0;width:100%;">
          </label>
          
          <label style="display:flex;flex-direction:column;gap:0.5rem;">
            <span style="font-weight:600;color:#1e293b;">📋 Loại đề thi *</span>
            <select id="examType" class="swal2-select" style="margin:0;width:100%;">
              <option value="TOEIC">TOEIC</option>
              <option value="IELTS">IELTS</option>
              <option value="Grammar">Grammar</option>
              <option value="Vocabulary">Vocabulary</option>
              <option value="Business">Business</option>
            </select>
          </label>
          
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
            <label style="display:flex;flex-direction:column;gap:0.5rem;">
              <span style="font-weight:600;color:#1e293b;">❓ Số câu hỏi</span>
              <input id="examQuestions" type="number" class="swal2-input" placeholder="200" style="margin:0;width:100%;">
            </label>
            
            <label style="display:flex;flex-direction:column;gap:0.5rem;">
              <span style="font-weight:600;color:#1e293b;">⏱️ Thời gian (phút)</span>
              <input id="examDuration" type="number" class="swal2-input" placeholder="120" style="margin:0;width:100%;">
            </label>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '✨ Tạo đề thi',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#6b7280',
      width: 600,
      preConfirm: () => {
        const title = document.getElementById('examTitle').value.trim();
        const type = document.getElementById('examType').value;
        
        if (!title) {
          Swal.showValidationMessage('Vui lòng nhập tên đề thi');
          return false;
        }
        
        return { title, type };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        showToast('success', 'Thành công!', `Đề thi "${result.value.title}" đã được tạo`);
      }
    });
  };

  const handleViewExam = (exam) => {
    showToast('info', 'Xem đề thi', `Đang xem chi tiết đề thi "${exam.title}"`);
  };

  const handleEditExam = (exam) => {
    showToast('info', 'Chỉnh sửa', `Chỉnh sửa đề thi "${exam.title}"`);
  };

  const handleDuplicateExam = (exam) => {
    Swal.fire({
      title: 'Nhân bản đề thi?',
      text: `Tạo bản sao của đề thi "${exam.title}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#8b5cf6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '📋 Nhân bản',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        showToast('success', 'Đã nhân bản!', `Bản sao của "${exam.title}" đã được tạo`);
      }
    });
  };

  const handleDeleteExam = (exam) => {
    Swal.fire({
      title: 'Xác nhận xóa?',
      text: `Bạn có chắc muốn xóa đề thi "${exam.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        showToast('success', 'Đã xóa!', `Đề thi "${exam.title}" đã được xóa`);
      }
    });
  };

  return (
    <AdminLayout pageTitle="📝 Đề thi">
      <Toast toast={toast} onClose={hideToast} />
      
      <PageContainer>
        {/* Welcome Card */}
        <WelcomeCard theme={theme}>
          <WelcomeContent>
            <WelcomeTitle theme={theme}>
              Quản lý đề thi 📝
            </WelcomeTitle>
            <WelcomeSubtitle theme={theme}>
              Tạo và quản lý các đề thi, bài kiểm tra
            </WelcomeSubtitle>
            <DateTime theme={theme}>
              <span>🕐</span>
              {formatDateTime(currentTime)} UTC | 👤 vinhsonvlog
            </DateTime>
          </WelcomeContent>
          <WelcomeIllustration>📝</WelcomeIllustration>
        </WelcomeCard>

        {/* Stats */}
        <StatsGrid>
          <StatCard theme={theme}>
            <StatIcon color="#f59e0b">📝</StatIcon>
            <StatValue theme={theme}>{stats.total}</StatValue>
            <StatLabel theme={theme}>Tổng đề thi</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#10b981">✅</StatIcon>
            <StatValue theme={theme}>{stats.active}</StatValue>
            <StatLabel theme={theme}>Đang hoạt động</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#6b7280">📋</StatIcon>
            <StatValue theme={theme}>{stats.draft}</StatValue>
            <StatLabel theme={theme}>Bản nháp</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#1CB0F6">👥</StatIcon>
            <StatValue theme={theme}>{stats.totalAttempts}</StatValue>
            <StatLabel theme={theme}>Lượt làm bài</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#8b5cf6">📊</StatIcon>
            <StatValue theme={theme}>{stats.avgScore}</StatValue>
            <StatLabel theme={theme}>Điểm TB</StatLabel>
          </StatCard>
        </StatsGrid>

        {/* Control Bar */}
        <ControlBar theme={theme}>
          <SearchWrapper>
            <SearchInput
              theme={theme}
              placeholder="Tìm kiếm đề thi..."
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
              <option value="all">Tất cả trạng thái</option>
              <option value="active">✅ Đang hoạt động</option>
              <option value="draft">📋 Bản nháp</option>
              <option value="archived">🗄️ Đã lưu trữ</option>
            </FilterSelect>
            
            <CreateButton onClick={handleCreateExam}>
              <span>➕</span>
              Tạo đề thi
            </CreateButton>
          </ActionButtons>
        </ControlBar>

        {/* Exams Grid */}
        <ExamsGrid>
          {filteredExams.map(exam => (
            <ExamCard key={exam.id} theme={theme}>
              <ExamHeader color={exam.color}>
                <ExamTitle>{exam.title}</ExamTitle>
                <ExamType>{exam.type}</ExamType>
              </ExamHeader>
              
              <ExamBody>
                <ExamDescription theme={theme}>
                  {exam.description}
                </ExamDescription>
                
                <ExamInfo>
                  <InfoBadge color="#1CB0F6">
                    ❓ {exam.questions} câu
                  </InfoBadge>
                  <InfoBadge color="#f59e0b">
                    ⏱️ {exam.duration} phút
                  </InfoBadge>
                  <InfoBadge color="#8b5cf6">
                    🎯 {exam.difficulty}
                  </InfoBadge>
                </ExamInfo>
                
                <ExamInfo>
                  <StatusBadge status={exam.status}>
                    {exam.status}
                  </StatusBadge>
                  {exam.attempts > 0 && (
                    <>
                      <InfoBadge color="#10b981">
                        👥 {exam.attempts} lượt
                      </InfoBadge>
                      <InfoBadge color="#58CC02">
                        📊 {exam.avgScore}
                      </InfoBadge>
                    </>
                  )}
                </ExamInfo>

                <ExamActions theme={theme}>
                  <ActionButton
                    theme={theme}
                    variant="view"
                    onClick={() => handleViewExam(exam)}
                    title="Xem chi tiết"
                  >
                    👁️
                  </ActionButton>
                  <ActionButton
                    theme={theme}
                    variant="edit"
                    onClick={() => handleEditExam(exam)}
                    title="Chỉnh sửa"
                  >
                    ✏️
                  </ActionButton>
                  <ActionButton
                    theme={theme}
                    variant="duplicate"
                    onClick={() => handleDuplicateExam(exam)}
                    title="Nhân bản"
                  >
                    📋
                  </ActionButton>
                  <ActionButton
                    theme={theme}
                    variant="delete"
                    onClick={() => handleDeleteExam(exam)}
                    title="Xóa"
                  >
                    🗑️
                  </ActionButton>
                </ExamActions>
              </ExamBody>
            </ExamCard>
          ))}
        </ExamsGrid>
      </PageContainer>
    </AdminLayout>
  );
};

export default AdminExams;