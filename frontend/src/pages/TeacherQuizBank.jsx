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

const QuizGrid = styled.div`
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

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  }
`;

const QuizHeader = styled.div`
  background: ${props => props.color || 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'};
  padding: 1.5rem;
  color: white;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    height: 100px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transform: translate(30%, -30%);
  }
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
  background: ${props => props.color || '#8b5cf6'}22;
  color: ${props => props.color || '#8b5cf6'};
`;

const QuizActions = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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
    if (props.variant === 'success') {
      return `
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
        
        &:hover {
          background: rgba(16, 185, 129, 0.2);
        }
      `;
    }
    if (props.variant === 'danger') {
      return `
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
        
        &:hover {
          background: rgba(239, 68, 68, 0.2);
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

const mockQuizzes = [
  {
    id: 1,
    title: 'TOEIC Reading Part 5 - Grammar',
    description: 'Bài kiểm tra ngữ pháp cơ bản cho TOEIC Reading Part 5',
    questions: 20,
    duration: 15,
    difficulty: 'Medium',
    topic: 'Grammar',
    usageCount: 45,
    avgScore: 78,
    color: 'linear-gradient(135deg, #58CC02 0%, #45a302 100%)',
  },
  {
    id: 2,
    title: 'Business Vocabulary Quiz',
    description: 'Kiểm tra từ vựng tiếng Anh thương mại',
    questions: 15,
    duration: 10,
    difficulty: 'Hard',
    topic: 'Vocabulary',
    usageCount: 32,
    avgScore: 65,
    color: 'linear-gradient(135deg, #1CB0F6 0%, #0891b2 100%)',
  },
  {
    id: 3,
    title: 'Daily Conversation - Level 1',
    description: 'Hội thoại tiếng Anh hàng ngày cho người mới bắt đầu',
    questions: 10,
    duration: 8,
    difficulty: 'Easy',
    topic: 'Speaking',
    usageCount: 67,
    avgScore: 85,
    color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  },
  {
    id: 4,
    title: 'IELTS Listening Practice',
    description: 'Luyện nghe IELTS với câu hỏi thực tế',
    questions: 25,
    duration: 20,
    difficulty: 'Hard',
    topic: 'Listening',
    usageCount: 28,
    avgScore: 72,
    color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  },
  {
    id: 5,
    title: 'Phrasal Verbs Challenge',
    description: 'Kiểm tra kiến thức về phrasal verbs thông dụng',
    questions: 30,
    duration: 15,
    difficulty: 'Medium',
    topic: 'Grammar',
    usageCount: 51,
    avgScore: 70,
    color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  },
];

// ========== COMPONENT ==========

const TeacherQuizBank = () => {
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [quizzes] = useState(mockQuizzes);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  const stats = {
    total: quizzes.length,
    assigned: 12,
    avgScore: 74,
    totalAttempts: 223,
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDifficulty = filterDifficulty === 'all' || quiz.difficulty === filterDifficulty;
    return matchSearch && matchDifficulty;
  });

  const handleCreateQuiz = () => {
    showToast('info', 'Thông báo', 'Chức năng tạo quiz đang phát triển');
  };

  const handleAssignQuiz = (quiz) => {
    showToast('success', 'Đã giao!', `Quiz "${quiz.title}" đã được giao cho lớp học`);
  };

  const handleEditQuiz = (quiz) => {
    showToast('info', 'Thông báo', `Chỉnh sửa quiz "${quiz.title}"`);
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

  const handleViewStats = (quiz) => {
    Swal.fire({
      title: `📊 ${quiz.title}`,
      html: `
        <div style="text-align: left; padding: 1rem;">
          <p><strong>📝 Số câu hỏi:</strong> ${quiz.questions}</p>
          <p><strong>⏱️ Thời gian:</strong> ${quiz.duration} phút</p>
          <p><strong>📊 Độ khó:</strong> ${quiz.difficulty}</p>
          <p><strong>🎯 Chủ đề:</strong> ${quiz.topic}</p>
          <p><strong>👥 Lượt làm:</strong> ${quiz.usageCount}</p>
          <p><strong>📈 Điểm TB:</strong> ${quiz.avgScore}%</p>
        </div>
      `,
      icon: 'info',
      confirmButtonColor: '#8b5cf6',
    });
  };

  return (
    <TeacherLayout pageTitle="📝 Kho đề Mini-Quiz">
      <Toast toast={toast} onClose={hideToast} />
      
      <PageContainer>
        {/* Stats */}
        <StatsGrid>
          <StatCard theme={theme}>
            <StatIcon color="#8b5cf6">📝</StatIcon>
            <StatValue theme={theme}>{stats.total}</StatValue>
            <StatLabel theme={theme}>Tổng quiz</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#10b981">✅</StatIcon>
            <StatValue theme={theme}>{stats.assigned}</StatValue>
            <StatLabel theme={theme}>Đã giao</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#f59e0b">📊</StatIcon>
            <StatValue theme={theme}>{stats.avgScore}%</StatValue>
            <StatLabel theme={theme}>Điểm TB</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#1CB0F6">👥</StatIcon>
            <StatValue theme={theme}>{stats.totalAttempts}</StatValue>
            <StatLabel theme={theme}>Lượt làm</StatLabel>
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
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
            >
              <option value="all">Tất cả độ khó</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </FilterSelect>
            
            <CreateButton onClick={handleCreateQuiz}>
              <span>➕</span>
              Tạo quiz mới
            </CreateButton>
          </ActionButtons>
        </ControlBar>

        {/* Quiz Grid */}
        <QuizGrid>
          {filteredQuizzes.map(quiz => (
            <QuizCard key={quiz.id} theme={theme}>
              <QuizHeader color={quiz.color}>
                <QuizTitle>{quiz.title}</QuizTitle>
                <QuizMeta>
                  <span>📝 {quiz.questions} câu</span>
                  <span>⏱️ {quiz.duration} phút</span>
                </QuizMeta>
              </QuizHeader>
              
              <QuizBody>
                <QuizDescription theme={theme}>
                  {quiz.description}
                </QuizDescription>
                
                <QuizInfo>
                  <InfoBadge color="#8b5cf6">
                    {quiz.difficulty}
                  </InfoBadge>
                  <InfoBadge color="#1CB0F6">
                    🎯 {quiz.topic}
                  </InfoBadge>
                  <InfoBadge color="#10b981">
                    👥 {quiz.usageCount} lượt
                  </InfoBadge>
                  <InfoBadge color="#f59e0b">
                    📊 {quiz.avgScore}%
                  </InfoBadge>
                </QuizInfo>

                <QuizActions theme={theme}>
                  <ActionButton
                    theme={theme}
                    variant="primary"
                    onClick={() => handleViewStats(quiz)}
                  >
                    📊
                  </ActionButton>
                  <ActionButton
                    theme={theme}
                    variant="success"
                    onClick={() => handleAssignQuiz(quiz)}
                  >
                    ✅ Giao
                  </ActionButton>
                  <ActionButton
                    theme={theme}
                    onClick={() => handleEditQuiz(quiz)}
                  >
                    ✏️
                  </ActionButton>
                </QuizActions>
              </QuizBody>
            </QuizCard>
          ))}
        </QuizGrid>
      </PageContainer>
    </TeacherLayout>
  );
};

export default TeacherQuizBank;