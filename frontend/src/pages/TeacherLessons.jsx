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
  background: ${props => props.color || 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'};
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
  background: ${props => props.color || '#8b5cf6'}22;
  color: ${props => props.color || '#8b5cf6'};
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
        background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        color: white;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
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
    title: 'Present Simple Tense',
    description: 'Học về thì hiện tại đơn và cách sử dụng trong giao tiếp',
    icon: '📖',
    color: 'linear-gradient(135deg, #58CC02 0%, #45a302 100%)',
    level: 'Beginner',
    duration: '45 min',
    students: 28,
    module: 'Grammar Basics',
    createdDate: '2025-10-01',
  },
  {
    id: 2,
    title: 'TOEIC Listening Part 1',
    description: 'Luyện tập kỹ năng nghe hiểu hình ảnh',
    icon: '🎧',
    color: 'linear-gradient(135deg, #1CB0F6 0%, #0891b2 100%)',
    level: 'Intermediate',
    duration: '60 min',
    students: 15,
    module: 'TOEIC Preparation',
    createdDate: '2025-10-05',
  },
  {
    id: 3,
    title: 'Business Email Writing',
    description: 'Cách viết email chuyên nghiệp trong môi trường công việc',
    icon: '📧',
    color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    level: 'Advanced',
    duration: '50 min',
    students: 20,
    module: 'Business English',
    createdDate: '2025-10-08',
  },
];

// ========== COMPONENT ==========

const TeacherLessons = () => {
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [lessons] = useState(mockLessons);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');

  const stats = {
    total: lessons.length,
    students: lessons.reduce((sum, l) => sum + l.students, 0),
    avgDuration: Math.round(
      lessons.reduce((sum, l) => sum + parseInt(l.duration), 0) / lessons.length
    ),
    modules: new Set(lessons.map(l => l.module)).size,
  };

  const filteredLessons = lessons.filter(lesson => {
    const matchSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       lesson.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchLevel = filterLevel === 'all' || lesson.level === filterLevel;
    return matchSearch && matchLevel;
  });

  const handleCreateLesson = () => {
    Swal.fire({
      title: '➕ Tạo bài học mới',
      html: `
        <div style="display:flex;flex-direction:column;gap:1rem;text-align:left;">
          <label style="display:flex;flex-direction:column;gap:0.5rem;">
            <span style="font-weight:600;color:#1e293b;">📖 Tên bài học *</span>
            <input id="lessonTitle" class="swal2-input" placeholder="VD: Present Continuous" style="margin:0;width:100%;">
          </label>
          
          <label style="display:flex;flex-direction:column;gap:0.5rem;">
            <span style="font-weight:600;color:#1e293b;">📝 Mô tả</span>
            <textarea id="lessonDescription" class="swal2-textarea" placeholder="Mô tả ngắn về bài học" style="margin:0;width:100%;"></textarea>
          </label>
          
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
            <label style="display:flex;flex-direction:column;gap:0.5rem;">
              <span style="font-weight:600;color:#1e293b;">🎯 Cấp độ</span>
              <select id="lessonLevel" class="swal2-select" style="margin:0;width:100%;">
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </label>
            
            <label style="display:flex;flex-direction:column;gap:0.5rem;">
              <span style="font-weight:600;color:#1e293b;">⏱️ Thời lượng (phút)</span>
              <input id="lessonDuration" type="number" class="swal2-input" placeholder="45" value="45" style="margin:0;width:100%;">
            </label>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '✨ Tạo bài học',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#8b5cf6',
      cancelButtonColor: '#94a3b8',
      width: 600,
      preConfirm: () => {
        const title = document.getElementById('lessonTitle').value.trim();
        const description = document.getElementById('lessonDescription').value.trim();
        const level = document.getElementById('lessonLevel').value;
        const duration = document.getElementById('lessonDuration').value;

        if (!title) {
          Swal.showValidationMessage('Vui lòng nhập tên bài học');
          return false;
        }

        return { title, description, level, duration };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        showToast('success', 'Thành công!', `Bài học "${result.value.title}" đã được tạo`);
      }
    });
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
        showToast('success', 'Đã xóa!', `Bài học "${lesson.title}" đã được xóa`);
      }
    });
  };

  return (
    <TeacherLayout pageTitle="📚 Bài học">
      <Toast toast={toast} onClose={hideToast} />
      
      <PageContainer>
        {/* Stats */}
        <StatsGrid>
          <StatCard theme={theme}>
            <StatIcon color="#8b5cf6">📚</StatIcon>
            <StatValue theme={theme}>{stats.total}</StatValue>
            <StatLabel theme={theme}>Tổng bài học</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#1CB0F6">👥</StatIcon>
            <StatValue theme={theme}>{stats.students}</StatValue>
            <StatLabel theme={theme}>Học viên</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#f59e0b">⏱️</StatIcon>
            <StatValue theme={theme}>{stats.avgDuration}m</StatValue>
            <StatLabel theme={theme}>TB thời lượng</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#10b981">📁</StatIcon>
            <StatValue theme={theme}>{stats.modules}</StatValue>
            <StatLabel theme={theme}>Module</StatLabel>
          </StatCard>
        </StatsGrid>

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
            
            <CreateButton onClick={handleCreateLesson}>
              <span>➕</span>
              Tạo bài học
            </CreateButton>
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
                  <MetaBadge color="#8b5cf6">{lesson.level}</MetaBadge>
                  <MetaBadge color="#1CB0F6">⏱️ {lesson.duration}</MetaBadge>
                  <MetaBadge color="#10b981">👥 {lesson.students}</MetaBadge>
                </LessonMeta>
                
                <div style={{ 
                  fontSize: '0.875rem', 
                  color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                  fontWeight: 600,
                  marginBottom: '0.5rem'
                }}>
                  📁 {lesson.module}
                </div>
                
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: theme === 'dark' ? '#6b7280' : '#9ca3af'
                }}>
                  📅 Tạo ngày {lesson.createdDate}
                </div>

                <LessonActions theme={theme}>
                  <ActionButton
                    theme={theme}
                    variant="primary"
                    onClick={() => handleEditLesson(lesson)}
                  >
                    ✏️ Sửa
                  </ActionButton>
                  <ActionButton
                    theme={theme}
                    onClick={() => handleDeleteLesson(lesson)}
                  >
                    👁️ Xem
                  </ActionButton>
                  <ActionButton
                    theme={theme}
                    variant="danger"
                    onClick={() => handleDeleteLesson(lesson)}
                  >
                    🗑️
                  </ActionButton>
                </LessonActions>
              </LessonContent>
            </LessonCard>
          ))}
        </LessonsGrid>
      </PageContainer>
    </TeacherLayout>
  );
};

export default TeacherLessons;