import React, { useState } from 'react';
import styled from 'styled-components';
import AdminLayout from '../layouts/AdminLayout';
import Swal from 'sweetalert2';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';

// ========== STYLED COMPONENTS ==========

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
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

const SearchInput = styled.input`
  padding: 0.75rem 1rem 0.75rem 3rem;
  border-radius: 12px;
  border: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 1rem;
  width: 300px;
  position: relative;

  &:focus {
    outline: none;
    border-color: #58CC02;
    box-shadow: 0 0 0 3px rgba(88, 204, 2, 0.1);
  }
`;

const SearchWrapper = styled.div`
  position: relative;
  
  &::before {
    content: '🔍';
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1.25rem;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
`;

const AddButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
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
    box-shadow: 0 4px 12px rgba(88, 204, 2, 0.3);
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
    border-color: #58CC02;
  }
`;

const LessonsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const LessonCard = styled.div`
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

const LessonImage = styled.div`
  width: 100%;
  height: 180px;
  background: ${props => props.color || 'linear-gradient(135deg, #58CC02 0%, #45a302 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  position: relative;

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

const LessonContent = styled.div`
  padding: 1.5rem;
`;

const LessonTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.5rem;
`;

const LessonDescription = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-bottom: 1rem;
  line-height: 1.6;
`;

const LessonMeta = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const MetaBadge = styled.span`
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: bold;
  background: ${props => props.color || '#58CC02'}22;
  color: ${props => props.color || '#58CC02'};
`;

const LessonActions = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
`;

const ActionButton = styled.button`
  flex: 1;
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

const mockLessons = [
  {
    id: 1,
    title: 'Basic Grammar - Present Tense',
    description: 'Học về thì hiện tại đơn và hiện tại tiếp diễn trong tiếng Anh',
    icon: '📖',
    color: 'linear-gradient(135deg, #58CC02 0%, #45a302 100%)',
    level: 'Beginner',
    duration: '45 min',
    students: 245,
    module: 'Grammar Basics',
  },
  {
    id: 2,
    title: 'TOEIC Listening Part 1',
    description: 'Luyện tập kỹ năng nghe hiểu hình ảnh cho TOEIC',
    icon: '🎧',
    color: 'linear-gradient(135deg, #1CB0F6 0%, #0891b2 100%)',
    level: 'Intermediate',
    duration: '60 min',
    students: 389,
    module: 'TOEIC Preparation',
  },
  {
    id: 3,
    title: 'Business English Vocabulary',
    description: 'Từ vựng tiếng Anh thương mại cơ bản và nâng cao',
    icon: '💼',
    color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    level: 'Advanced',
    duration: '50 min',
    students: 167,
    module: 'Business English',
  },
  {
    id: 4,
    title: 'Daily Conversation',
    description: 'Hội thoại tiếng Anh hàng ngày thông dụng',
    icon: '💬',
    color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    level: 'Beginner',
    duration: '30 min',
    students: 512,
    module: 'Daily English',
  },
];

// ========== COMPONENT ==========

const AdminLessons = () => {
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [lessons, setLessons] = useState(mockLessons);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');

  const filteredLessons = lessons.filter(lesson => {
    const matchSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       lesson.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchLevel = filterLevel === 'all' || lesson.level === filterLevel;
    return matchSearch && matchLevel;
  });

  const handleAddLesson = () => {
    showToast('info', 'Thông báo', 'Chức năng thêm bài học đang phát triển');
  };

  const handleEditLesson = (lesson) => {
    showToast('info', 'Thông báo', `Chỉnh sửa bài học "${lesson.title}"`);
  };

  const handleDeleteLesson = (lesson) => {
    Swal.fire({
      title: 'Xác nhận xóa?',
      text: `Bạn có chắc muốn xóa bài học "${lesson.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        setLessons(lessons.filter(l => l.id !== lesson.id));
        showToast('success', 'Đã xóa!', `Bài học "${lesson.title}" đã được xóa`);
      }
    });
  };

  return (
    <AdminLayout pageTitle="📚 Quản lý bài học">
      <Toast toast={toast} onClose={hideToast} />
      
      <PageContainer>
        {/* Control Bar */}
        <ControlBar theme={theme}>
          <SearchWrapper>
            <SearchInput
              theme={theme}
              placeholder="Tìm kiếm bài học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchWrapper>
          
          <ActionButtons>
            <FilterSelect
              theme={theme}
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
            >
              <option value="all">Tất cả cấp độ</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </FilterSelect>
            
            <AddButton onClick={handleAddLesson}>
              <span>➕</span>
              Thêm bài học
            </AddButton>
          </ActionButtons>
        </ControlBar>

        {/* Lessons Grid */}
        <LessonsGrid>
          {filteredLessons.map(lesson => (
            <LessonCard key={lesson.id} theme={theme}>
              <LessonImage color={lesson.color}>
                <span style={{ position: 'relative', zIndex: 1 }}>{lesson.icon}</span>
              </LessonImage>
              
              <LessonContent>
                <LessonTitle theme={theme}>{lesson.title}</LessonTitle>
                <LessonDescription theme={theme}>
                  {lesson.description}
                </LessonDescription>
                
                <LessonMeta>
                  <MetaBadge color="#58CC02">{lesson.level}</MetaBadge>
                  <MetaBadge color="#1CB0F6">⏱️ {lesson.duration}</MetaBadge>
                  <MetaBadge color="#8b5cf6">👥 {lesson.students}</MetaBadge>
                </LessonMeta>
                
                <div style={{ 
                  fontSize: '0.875rem', 
                  color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                  fontWeight: 600 
                }}>
                  📁 {lesson.module}
                </div>

                <LessonActions theme={theme}>
                  <ActionButton
                    theme={theme}
                    variant="primary"
                    onClick={() => handleEditLesson(lesson)}
                  >
                    <span>✏️</span>
                    Chỉnh sửa
                  </ActionButton>
                  <ActionButton
                    theme={theme}
                    variant="danger"
                    onClick={() => handleDeleteLesson(lesson)}
                  >
                    <span>🗑️</span>
                    Xóa
                  </ActionButton>
                </LessonActions>
              </LessonContent>
            </LessonCard>
          ))}
        </LessonsGrid>
      </PageContainer>
    </AdminLayout>
  );
};

export default AdminLessons;