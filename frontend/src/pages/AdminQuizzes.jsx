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
  flex-wrap: wrap;
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

const QuizzesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const QuizCard = styled.div`
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

const QuizHeader = styled.div`
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

const QuizIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
`;

const QuizTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
`;

const QuizMeta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  opacity: 0.9;
  position: relative;
  z-index: 1;
`;

const QuizBody = styled.div`
  padding: 1.5rem;
`;

const QuizDescription = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-bottom: 1rem;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const QuizInfo = styled.div`
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

const QuizStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#f9fafb'};
  border-radius: 12px;
`;

const QuizStatItem = styled.div`
  text-align: center;
`;

const QuizStatValue = styled.div`
  font-size: 1.25rem;
  font-weight: bold;
  color: ${props => props.color || '#f59e0b'};
  margin-bottom: 0.25rem;
`;

const QuizStatLabel = styled.div`
  font-size: 0.7rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-weight: 600;
  text-transform: uppercase;
`;

const QuizActions = styled.div`
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
    return '';
  }}
`;

// ========== MOCK DATA ==========

const mockQuizzes = [
  {
    id: 1,
    icon: '📝',
    title: 'TOEIC Reading Part 5',
    description: 'Bài kiểm tra ngữ pháp và từ vựng TOEIC Part 5',
    questions: 30,
    duration: 15,
    difficulty: 'Intermediate',
    category: 'TOEIC',
    attempts: 456,
    avgScore: 78,
    passRate: 72,
    color: 'linear-gradient(135deg, #58CC02 0%, #45a302 100%)',
  },
  {
    id: 2,
    icon: '🎯',
    title: 'IELTS Vocabulary Test',
    description: 'Kiểm tra từ vựng IELTS Academic band 7.0+',
    questions: 50,
    duration: 20,
    difficulty: 'Advanced',
    category: 'IELTS',
    attempts: 234,
    avgScore: 82,
    passRate: 68,
    color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  },
  {
    id: 3,
    icon: '💼',
    title: 'Business English Quiz',
    description: 'Bài kiểm tra tiếng Anh thương mại cơ bản',
    questions: 25,
    duration: 12,
    difficulty: 'Intermediate',
    category: 'Business',
    attempts: 678,
    avgScore: 75,
    passRate: 80,
    color: 'linear-gradient(135deg, #1CB0F6 0%, #0891b2 100%)',
  },
  {
    id: 4,
    icon: '🔤',
    title: 'Grammar Foundation',
    description: 'Ngữ pháp tiếng Anh cơ bản cho người mới bắt đầu',
    questions: 40,
    duration: 20,
    difficulty: 'Beginner',
    category: 'Grammar',
    attempts: 892,
    avgScore: 85,
    passRate: 88,
    color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  },
  {
    id: 5,
    icon: '🗣️',
    title: 'Pronunciation Quiz',
    description: 'Kiểm tra phát âm và trọng âm tiếng Anh',
    questions: 20,
    duration: 10,
    difficulty: 'All Levels',
    category: 'Pronunciation',
    attempts: 345,
    avgScore: 70,
    passRate: 65,
    color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  },
  {
    id: 6,
    icon: '📚',
    title: 'Idioms & Phrases',
    description: 'Thành ngữ và cụm từ tiếng Anh thông dụng',
    questions: 35,
    duration: 18,
    difficulty: 'Advanced',
    category: 'Vocabulary',
    attempts: 567,
    avgScore: 68,
    passRate: 62,
    color: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
  },
];

// ========== COMPONENT ==========

const AdminQuizzes = () => {
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [quizzes] = useState(mockQuizzes);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
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
    total: quizzes.length,
    totalQuestions: quizzes.reduce((sum, q) => sum + q.questions, 0),
    totalAttempts: quizzes.reduce((sum, q) => sum + q.attempts, 0),
    avgScore: Math.round(quizzes.reduce((sum, q) => sum + q.avgScore, 0) / quizzes.length),
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = filterCategory === 'all' || quiz.category === filterCategory;
    const matchDifficulty = filterDifficulty === 'all' || quiz.difficulty === filterDifficulty;
    return matchSearch && matchCategory && matchDifficulty;
  });

  const handleCreateQuiz = () => {
    Swal.fire({
      title: '➕ Tạo Quiz mới',
      html: `
        <div style="display:flex;flex-direction:column;gap:1rem;text-align:left;">
          <label style="display:flex;flex-direction:column;gap:0.5rem;">
            <span style="font-weight:600;color:#1e293b;">📝 Tên Quiz *</span>
            <input id="quizTitle" class="swal2-input" placeholder="VD: TOEIC Reading Part 5" style="margin:0;width:100%;">
          </label>
          
          <label style="display:flex;flex-direction:column;gap:0.5rem;">
            <span style="font-weight:600;color:#1e293b;">📖 Mô tả</span>
            <textarea id="quizDescription" class="swal2-textarea" placeholder="Mô tả ngắn về quiz..." style="margin:0;width:100%;min-height:70px;"></textarea>
          </label>
          
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
            <label style="display:flex;flex-direction:column;gap:0.5rem;">
              <span style="font-weight:600;color:#1e293b;">📁 Danh mục *</span>
              <select id="quizCategory" class="swal2-select" style="margin:0;width:100%;">
                <option value="TOEIC">TOEIC</option>
                <option value="IELTS">IELTS</option>
                <option value="Grammar">Grammar</option>
                <option value="Vocabulary">Vocabulary</option>
                <option value="Business">Business</option>
              </select>
            </label>
            
            <label style="display:flex;flex-direction:column;gap:0.5rem;">
              <span style="font-weight:600;color:#1e293b;">🎯 Độ khó *</span>
              <select id="quizDifficulty" class="swal2-select" style="margin:0;width:100%;">
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="All Levels">All Levels</option>
              </select>
            </label>
          </div>
          
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
            <label style="display:flex;flex-direction:column;gap:0.5rem;">
              <span style="font-weight:600;color:#1e293b;">❓ Số câu hỏi</span>
              <input id="quizQuestions" type="number" class="swal2-input" placeholder="30" value="30" style="margin:0;width:100%;">
            </label>
            
            <label style="display:flex;flex-direction:column;gap:0.5rem;">
              <span style="font-weight:600;color:#1e293b;">⏱️ Thời gian (phút)</span>
              <input id="quizDuration" type="number" class="swal2-input" placeholder="15" value="15" style="margin:0;width:100%;">
            </label>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '✨ Tạo Quiz',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#6b7280',
      width: 700,
      preConfirm: () => {
        const title = document.getElementById('quizTitle').value.trim();
        
        if (!title) {
          Swal.showValidationMessage('Vui lòng nhập tên Quiz');
          return false;
        }
        
        return { title };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        showToast('success', 'Thành công!', `Quiz "${result.value.title}" đã được tạo`);
      }
    });
  };

  const handleViewQuiz = (quiz) => {
    showToast('info', 'Xem Quiz', `Đang xem chi tiết quiz "${quiz.title}"`);
  };

  const handleEditQuiz = (quiz) => {
    showToast('info', 'Chỉnh sửa', `Chỉnh sửa quiz "${quiz.title}"`);
  };

  const handleDeleteQuiz = (quiz) => {
    Swal.fire({
      title: 'Xác nhận xóa?',
      text: `Bạn có chắc muốn xóa quiz "${quiz.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        showToast('success', 'Đã xóa!', `Quiz "${quiz.title}" đã được xóa`);
      }
    });
  };

  return (
    <AdminLayout pageTitle="🎯 Quiz">
      <Toast toast={toast} onClose={hideToast} />
      
      <PageContainer>
        {/* Welcome Card */}
        <WelcomeCard theme={theme}>
          <WelcomeContent>
            <WelcomeTitle theme={theme}>
              Quản lý Quiz 🎯
            </WelcomeTitle>
            <WelcomeSubtitle theme={theme}>
              Tạo và quản lý các bài kiểm tra trắc nghiệm
            </WelcomeSubtitle>
            <DateTime theme={theme}>
              <span>🕐</span>
              {formatDateTime(currentTime)} UTC | 👤 vinhsonvlog
            </DateTime>
          </WelcomeContent>
          <WelcomeIllustration>🎯</WelcomeIllustration>
        </WelcomeCard>

        {/* Stats */}
        <StatsGrid>
          <StatCard theme={theme}>
            <StatIcon color="#f59e0b">🎯</StatIcon>
            <StatValue theme={theme}>{stats.total}</StatValue>
            <StatLabel theme={theme}>Tổng Quiz</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#58CC02">❓</StatIcon>
            <StatValue theme={theme}>{stats.totalQuestions}</StatValue>
            <StatLabel theme={theme}>Tổng câu hỏi</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#1CB0F6">👥</StatIcon>
            <StatValue theme={theme}>{stats.totalAttempts.toLocaleString()}</StatValue>
            <StatLabel theme={theme}>Lượt làm</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#8b5cf6">📊</StatIcon>
            <StatValue theme={theme}>{stats.avgScore}%</StatValue>
            <StatLabel theme={theme}>Điểm TB</StatLabel>
          </StatCard>
        </StatsGrid>

        {/* Control Bar */}
        <ControlBar theme={theme}>
          <SearchWrapper>
            <SearchInput
              theme={theme}
              placeholder="Tìm kiếm quiz..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchWrapper>
          
          <ActionButtons>
            <FilterSelect
              theme={theme}
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">Tất cả danh mục</option>
              <option value="TOEIC">📝 TOEIC</option>
              <option value="IELTS">🎯 IELTS</option>
              <option value="Grammar">🔤 Grammar</option>
              <option value="Vocabulary">📚 Vocabulary</option>
              <option value="Business">💼 Business</option>
            </FilterSelect>

            <FilterSelect
              theme={theme}
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
            >
              <option value="all">Tất cả độ khó</option>
              <option value="Beginner">🟢 Beginner</option>
              <option value="Intermediate">🟡 Intermediate</option>
              <option value="Advanced">🔴 Advanced</option>
              <option value="All Levels">⚪ All Levels</option>
            </FilterSelect>
            
            <CreateButton onClick={handleCreateQuiz}>
              <span>➕</span>
              Tạo Quiz
            </CreateButton>
          </ActionButtons>
        </ControlBar>

        {/* Quizzes Grid */}
        <QuizzesGrid>
          {filteredQuizzes.map(quiz => (
            <QuizCard key={quiz.id} theme={theme}>
              <QuizHeader color={quiz.color}>
                <QuizIcon>{quiz.icon}</QuizIcon>
                <QuizTitle>{quiz.title}</QuizTitle>
                <QuizMeta>
                  <span>❓ {quiz.questions} câu</span>
                  <span>⏱️ {quiz.duration} phút</span>
                </QuizMeta>
              </QuizHeader>
              
              <QuizBody>
                <QuizDescription theme={theme}>
                  {quiz.description}
                </QuizDescription>
                
                <QuizInfo>
                  <InfoBadge color="#f59e0b">
                    📁 {quiz.category}
                  </InfoBadge>
                  <InfoBadge color="#8b5cf6">
                    🎯 {quiz.difficulty}
                  </InfoBadge>
                </QuizInfo>

                <QuizStats theme={theme}>
                  <QuizStatItem>
                    <QuizStatValue color="#1CB0F6">{quiz.attempts}</QuizStatValue>
                    <QuizStatLabel theme={theme}>Lượt làm</QuizStatLabel>
                  </QuizStatItem>
                  <QuizStatItem>
                    <QuizStatValue color="#58CC02">{quiz.avgScore}%</QuizStatValue>
                    <QuizStatLabel theme={theme}>Điểm TB</QuizStatLabel>
                  </QuizStatItem>
                  <QuizStatItem>
                    <QuizStatValue color="#10b981">{quiz.passRate}%</QuizStatValue>
                    <QuizStatLabel theme={theme}>Đỗ</QuizStatLabel>
                  </QuizStatItem>
                </QuizStats>

                <QuizActions theme={theme}>
                  <ActionButton
                    theme={theme}
                    variant="view"
                    onClick={() => handleViewQuiz(quiz)}
                    title="Xem chi tiết"
                  >
                    👁️
                  </ActionButton>
                  <ActionButton
                    theme={theme}
                    variant="edit"
                    onClick={() => handleEditQuiz(quiz)}
                    title="Chỉnh sửa"
                  >
                    ✏️
                  </ActionButton>
                  <ActionButton
                    theme={theme}
                    variant="delete"
                    onClick={() => handleDeleteQuiz(quiz)}
                    title="Xóa"
                  >
                    🗑️
                  </ActionButton>
                </QuizActions>
              </QuizBody>
            </QuizCard>
          ))}
        </QuizzesGrid>
      </PageContainer>
    </AdminLayout>
  );
};

export default AdminQuizzes;