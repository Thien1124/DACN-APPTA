import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import {
  Quiz,
  Add,
  Search,
  FilterList,
  PlayArrow,
  Edit,
  Delete,
  Star,
  StarBorder,
  AccessTime,
  QuestionAnswer,
  TrendingUp,
  Public,
  Lock,
  PersonOutline,
  Category,
  MoreVert
} from '@mui/icons-material';
import { useToast } from '../hooks/useToast';

// ========== ANIMATIONS ==========
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

// ========== STYLED COMPONENTS ==========
const PageWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #f0fbef 0%, #e6f8e3 40%, #dff4d6 100%);
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><g fill="%2358CC02" opacity="0.03"><circle cx="120" cy="80" r="120"/><circle cx="560" cy="160" r="100"/><circle cx="400" cy="420" r="140"/></g></svg>');
  background-repeat: no-repeat;
  background-position: right 10% top 10%;
  position: relative; /* Thêm dòng này */
`;

const MainContent = styled.main`
  flex: 1;
  padding: 7rem 2rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
  animation: ${fadeIn} 0.6s ease;
  
  /* Đảm bảo không bị che */
  position: relative;
  z-index: 1;

  /* Màn hình > 1400px */
  margin-left: 300px;  /* 280px + 20px spacing */
  margin-right: 400px; /* 380px + 20px spacing */

  @media (max-width: 1400px) {
    margin-left: 300px;
    margin-right: 340px;
  }

  @media (max-width: 1200px) {
    margin-left: 300px;
    margin-right: 2rem;
  }

  @media (max-width: 1024px) {
    padding: 6rem 1.5rem 1.5rem;
    margin-left: 260px;
    margin-right: 1.5rem;
  }

  @media (max-width: 768px) {
    padding: 5.5rem 1rem 1rem;
    margin-left: 1rem;
    margin-right: 1rem;
  }
`;

const ContentInner = styled.div`
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  animation: ${slideIn} 0.5s ease;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: #166a0b;
  margin: 0 0 0.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #5b6b5b;
  margin: 0;
`;

const StatsBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  text-align: center;
  animation: ${fadeIn} 0.6s ease;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(88, 204, 2, 0.15);
  }
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: #58cc02;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.95rem;
  color: #5b6b5b;
  font-weight: 600;
`;

const ControlsBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchBox = styled.div`
  flex: 1;
  position: relative;
  min-width: 300px;

  @media (max-width: 768px) {
    min-width: 100%;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.9rem 1rem 0.9rem 3rem;
  border: 2px solid #e6f3e6;
  border-radius: 12px;
  font-size: 1rem;
  background: white;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #58cc02;
    box-shadow: 0 4px 12px rgba(88, 204, 2, 0.1);
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #5b6b5b;
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.9rem 1.5rem;
  background: ${props => props.active ? '#58cc02' : 'white'};
  color: ${props => props.active ? 'white' : '#166a0b'};
  border: 2px solid ${props => props.active ? '#58cc02' : '#e6f3e6'};
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(88, 204, 2, 0.2);
  }
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 1.75rem;
  background: linear-gradient(135deg, #58cc02 0%, #45a302 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(88, 204, 2, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(88, 204, 2, 0.3);
  }
`;

const QuizGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const QuizCard = styled.div`
  background: white;
  border-radius: 14px;
  padding: 1.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.6s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #58cc02, #45a302);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 32px rgba(88, 204, 2, 0.15);

    &::before {
      transform: scaleX(1);
    }
  }
`;

const QuizHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
`;

const QuizBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${props => {
    if (props.difficulty === 'easy') return '#e6f7e8';
    if (props.difficulty === 'medium') return '#fff7e6';
    if (props.difficulty === 'hard') return '#ffe6e6';
    return '#f3f4f6';
  }};
  color: ${props => {
    if (props.difficulty === 'easy') return '#166a0b';
    if (props.difficulty === 'medium') return '#c77700';
    if (props.difficulty === 'hard') return '#c70000';
    return '#6b7280';
  }};
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 700;
`;

const QuizActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IconButton = styled.button`
  background: #f3f4f6;
  color: #5b6b5b;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
    background: #e6f3e6;
    color: #166a0b;
  }
`;

const QuizTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 800;
  color: #166a0b;
  margin: 0 0 0.75rem;
  line-height: 1.3;
`;

const QuizDescription = styled.p`
  font-size: 0.95rem;
  color: #6b7280;
  line-height: 1.6;
  margin: 0 0 1.25rem;
`;

const QuizMeta = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.25rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 600;

  svg {
    color: #58cc02;
  }
`;

const QuizFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
`;

const QuizRating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #fbbf24;
  font-size: 0.875rem;
  font-weight: 600;
`;

const PlayButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #58cc02, #45a302);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(88, 204, 2, 0.3);
  }
`;

const VisibilityBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
  padding: 0.25rem 0.75rem;
  background: #f3f4f6;
  border-radius: 12px;
`;

const CategoryTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  background: #e6f7e8;
  color: #166a0b;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  animation: ${fadeIn} 0.6s ease;
`;

const EmptyIcon = styled(Quiz)`
  font-size: 5rem;
  color: #d1d5db;
  margin-bottom: 1rem;
`;

const EmptyText = styled.p`
  font-size: 1.25rem;
  color: #6b7280;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const EmptyHint = styled.p`
  font-size: 1rem;
  color: #9ca3af;
`;

// ========== COMPONENT ==========
const QuizBank = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, my, public, starred
  const [difficulty, setDifficulty] = useState('all'); // all, easy, medium, hard
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    starred: 0,
    avgScore: 0
  });

  // Mock data - replace with API call
  useEffect(() => {
    const mockQuizzes = [
      {
        id: 1,
        title: 'Grammar Basics',
        description: 'Test your understanding of basic English grammar rules',
        category: 'Grammar',
        difficulty: 'easy',
        questionCount: 15,
        estimatedTime: 10,
        rating: 4.5,
        ratingCount: 128,
        plays: 1520,
        isPublic: true,
        isStarred: true,
        isMine: false,
        author: 'John Doe',
        completionRate: 85
      },
      {
        id: 2,
        title: 'Advanced Vocabulary',
        description: 'Challenge yourself with advanced English vocabulary',
        category: 'Vocabulary',
        difficulty: 'hard',
        questionCount: 25,
        estimatedTime: 20,
        rating: 4.8,
        ratingCount: 89,
        plays: 890,
        isPublic: true,
        isStarred: false,
        isMine: false,
        author: 'Jane Smith',
        completionRate: 62
      },
      {
        id: 3,
        title: 'Present Tense Practice',
        description: 'Master the present tense with practical exercises',
        category: 'Grammar',
        difficulty: 'medium',
        questionCount: 20,
        estimatedTime: 15,
        rating: 4.3,
        ratingCount: 156,
        plays: 2100,
        isPublic: false,
        isStarred: true,
        isMine: true,
        author: 'You',
        completionRate: 78
      },
      {
        id: 4,
        title: 'Idioms & Phrases',
        description: 'Learn common English idioms and phrases',
        category: 'Vocabulary',
        difficulty: 'medium',
        questionCount: 18,
        estimatedTime: 12,
        rating: 4.6,
        ratingCount: 201,
        plays: 3200,
        isPublic: true,
        isStarred: false,
        isMine: false,
        author: 'Mike Johnson',
        completionRate: 71
      }
    ];

    setQuizzes(mockQuizzes);
    
    setStats({
      total: mockQuizzes.length,
      completed: mockQuizzes.filter(q => q.completionRate > 0).length,
      starred: mockQuizzes.filter(q => q.isStarred).length,
      avgScore: 78
    });
  }, []);

  useEffect(() => {
    filterQuizzes();
  }, [searchTerm, filter, difficulty, quizzes]);

  const filterQuizzes = () => {
    let filtered = quizzes;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(q =>
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Visibility filter
    if (filter === 'my') {
      filtered = filtered.filter(q => q.isMine);
    } else if (filter === 'public') {
      filtered = filtered.filter(q => q.isPublic && !q.isMine);
    } else if (filter === 'starred') {
      filtered = filtered.filter(q => q.isStarred);
    }

    // Difficulty filter
    if (difficulty !== 'all') {
      filtered = filtered.filter(q => q.difficulty === difficulty);
    }

    setFilteredQuizzes(filtered);
  };

  const toggleStar = (id) => {
    setQuizzes(prev => prev.map(q =>
      q.id === id ? { ...q, isStarred: !q.isStarred } : q
    ));
    showToast('success', 'Thành công', 'Đã cập nhật đánh dấu');
  };

  const handlePlay = (quizId) => {
    navigate(`/quiz/${quizId}`);
  };

  const handleEdit = (quizId) => {
    navigate(`/quiz/${quizId}/edit`);
  };

  const handleDelete = (quizId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa quiz này?')) {
      setQuizzes(prev => prev.filter(q => q.id !== quizId));
      showToast('success', 'Đã xóa', 'Quiz đã được xóa thành công');
    }
  };

  const getDifficultyLabel = (diff) => {
    if (diff === 'easy') return 'Dễ';
    if (diff === 'medium') return 'Trung bình';
    if (diff === 'hard') return 'Khó';
    return diff;
  };

  return (
    <PageWrapper>
      <LeftSidebar />
      <MainContent>
        <ContentInner>
          <Header>
            <Title>
              <Quiz />
              Bộ Quiz Phụ
            </Title>
            <Subtitle>Luyện tập và kiểm tra kiến thức của bạn</Subtitle>
          </Header>

          <StatsBar>
            <StatCard>
              <StatNumber>{stats.total}</StatNumber>
              <StatLabel>Tổng Quiz</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>{stats.completed}</StatNumber>
              <StatLabel>Đã hoàn thành</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>{stats.starred}</StatNumber>
              <StatLabel>Đánh dấu</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>{stats.avgScore}%</StatNumber>
              <StatLabel>Điểm trung bình</StatLabel>
            </StatCard>
          </StatsBar>

          <ControlsBar>
            <SearchBox>
              <SearchIcon />
              <SearchInput
                type="text"
                placeholder="Tìm kiếm quiz..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchBox>

            <FilterGroup>
              <FilterButton
                active={filter === 'all'}
                onClick={() => setFilter('all')}
              >
                <FilterList />
                Tất cả
              </FilterButton>
              <FilterButton
                active={filter === 'my'}
                onClick={() => setFilter('my')}
              >
                <PersonOutline />
                Của tôi
              </FilterButton>
              <FilterButton
                active={filter === 'public'}
                onClick={() => setFilter('public')}
              >
                <Public />
                Công khai
              </FilterButton>
              <FilterButton
                active={filter === 'starred'}
                onClick={() => setFilter('starred')}
              >
                <Star />
                Đánh dấu
              </FilterButton>
            </FilterGroup>

            <CreateButton onClick={() => navigate('/quiz/create')}>
              <Add />
              Tạo Quiz
            </CreateButton>
          </ControlsBar>

          <FilterGroup style={{ marginBottom: '2rem' }}>
            <FilterButton
              active={difficulty === 'all'}
              onClick={() => setDifficulty('all')}
            >
              Tất cả độ khó
            </FilterButton>
            <FilterButton
              active={difficulty === 'easy'}
              onClick={() => setDifficulty('easy')}
            >
              Dễ
            </FilterButton>
            <FilterButton
              active={difficulty === 'medium'}
              onClick={() => setDifficulty('medium')}
            >
              Trung bình
            </FilterButton>
            <FilterButton
              active={difficulty === 'hard'}
              onClick={() => setDifficulty('hard')}
            >
              Khó
            </FilterButton>
          </FilterGroup>

          {filteredQuizzes.length > 0 ? (
            <QuizGrid>
              {filteredQuizzes.map((quiz) => (
                <QuizCard key={quiz.id}>
                  <QuizHeader>
                    <QuizBadge difficulty={quiz.difficulty}>
                      <TrendingUp style={{ fontSize: '1rem' }} />
                      {getDifficultyLabel(quiz.difficulty)}
                    </QuizBadge>
                    <QuizActions>
                      <IconButton onClick={() => toggleStar(quiz.id)}>
                        {quiz.isStarred ? <Star style={{ color: '#fbbf24' }} /> : <StarBorder />}
                      </IconButton>
                      {quiz.isMine && (
                        <>
                          <IconButton onClick={() => handleEdit(quiz.id)}>
                            <Edit />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(quiz.id)}>
                            <Delete />
                          </IconButton>
                        </>
                      )}
                    </QuizActions>
                  </QuizHeader>

                  <CategoryTag>
                    <Category style={{ fontSize: '0.875rem' }} />
                    {quiz.category}
                  </CategoryTag>

                  <QuizTitle>{quiz.title}</QuizTitle>
                  <QuizDescription>{quiz.description}</QuizDescription>

                  <QuizMeta>
                    <MetaItem>
                      <QuestionAnswer />
                      {quiz.questionCount} câu hỏi
                    </MetaItem>
                    <MetaItem>
                      <AccessTime />
                      ~{quiz.estimatedTime} phút
                    </MetaItem>
                    <MetaItem>
                      <PersonOutline />
                      {quiz.author}
                    </MetaItem>
                    <MetaItem>
                      {quiz.isPublic ? <Public /> : <Lock />}
                      {quiz.isPublic ? 'Công khai' : 'Riêng tư'}
                    </MetaItem>
                  </QuizMeta>

                  <QuizFooter>
                    <QuizRating>
                      <Star />
                      {quiz.rating} ({quiz.ratingCount})
                    </QuizRating>
                    <PlayButton onClick={() => handlePlay(quiz.id)}>
                      <PlayArrow />
                      Bắt đầu
                    </PlayButton>
                  </QuizFooter>
                </QuizCard>
              ))}
            </QuizGrid>
          ) : (
            <EmptyState>
              <EmptyIcon />
              <EmptyText>Không tìm thấy quiz nào</EmptyText>
              <EmptyHint>Thử thay đổi bộ lọc hoặc tạo quiz mới</EmptyHint>
            </EmptyState>
          )}
        </ContentInner>
      </MainContent>
      <RightSidebar />
    </PageWrapper>
  );
};

export default QuizBank;