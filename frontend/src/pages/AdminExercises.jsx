import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import { adminService } from '../services/adminService';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import Swal from 'sweetalert2';
import {
  FitnessCenter,
  Add,
  FileCopy,
  Visibility,
  Edit,
  Delete,
  MenuBook,
  Star,
  School,
  CloudUpload,
  Download,
  Mic
} from '@mui/icons-material';
import SpeakingExerciseModal from '../components/SpeakingExerciseModal';

// ========== STYLED COMPONENTS ==========

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const CreateButton = styled.button`
  background: ${props => props.variant === 'bulk' ? '#8b5cf6' : '#58CC02'};
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(88, 204, 2, 0.3);
  }
`;

const UploadButton = styled.button`
  background: #f59e0b;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(245, 158, 11, 0.3);
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  border-radius: 12px;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 0.875rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #58CC02;
  }
`;

const ExercisesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
`;

const ExerciseCard = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.15);
  }
`;

const ExerciseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
`;

const TypeBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    const colors = {
      'multiple-choice': '#1CB0F6',
      'fill-blank': '#8b5cf6',
      'listening': '#10b981',
      'speaking': '#ef4444',
      'matching': '#f59e0b',
      'ordering': '#ec4899',
      'translation': '#6366f1'
    };
    return colors[props.type] || '#6b7280';
  }};
  color: white;
`;

const DifficultyBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    const colors = {
      easy: '#10b981',
      medium: '#f59e0b',
      hard: '#ef4444'
    };
    return colors[props.level] || '#6b7280';
  }};
  color: white;
`;

const ExerciseQuestion = styled.div`
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.75rem;
  font-size: 0.9375rem;
  line-height: 1.5;
`;

const ExerciseInfo = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => {
    if (props.variant === 'edit') return '#1CB0F6';
    if (props.variant === 'delete') return '#ef4444';
    if (props.variant === 'view') return '#8b5cf6';
    return '#6b7280';
  }};
  color: white;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const HiddenFileInput = styled.input`
  display: none;
`;

// ========== COMPONENT ==========

const AdminExercises = () => {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [lessonFilter, setLessonFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Thêm state
  const [showSpeakingModal, setShowSpeakingModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);

  useEffect(() => {
    fetchLessons();
    fetchExercises();
  }, []);

  useEffect(() => {
    fetchExercises();
  }, [typeFilter, lessonFilter, difficultyFilter]);

  const fetchLessons = async () => {
    try {
      const response = await adminService.lessons.getAll();
      setLessons(response.data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  const fetchExercises = async () => {
    try {
      setLoading(true);
      
      let response;
      if (lessonFilter !== 'all') {
        response = await adminService.exercises.getByLesson(lessonFilter);
      } else {
        response = await adminService.exercises.getAll();
      }

      let exs = response.data || [];

      // Filter by type
      if (typeFilter !== 'all') {
        exs = exs.filter(e => e.type === typeFilter);
      }

      // Filter by difficulty
      if (difficultyFilter !== 'all') {
        exs = exs.filter(e => e.difficulty === difficultyFilter);
      }

      setExercises(exs);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      showToast('error', 'Lỗi', 'Không thể tải danh sách bài tập');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    navigate('/admin/exercises/create');
  };

  const handleBulkCreate = () => {
    navigate('/admin/exercises/bulk-create');
  };

  const handleEdit = (exerciseId) => {
    navigate(`/admin/exercises/edit/${exerciseId}`);
  };

  const handleView = (exerciseId) => {
    navigate(`/admin/exercises/${exerciseId}`);
  };

  const handleDelete = async (exercise) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa?',
      text: `Bạn có chắc muốn xóa bài tập này?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        await adminService.exercises.delete(exercise._id);
        showToast('success', 'Thành công', 'Đã xóa bài tập');
        fetchExercises();
      } catch (error) {
        showToast('error', 'Lỗi', error.response?.data?.message || 'Không thể xóa bài tập');
      }
    }
  };


const handleDownloadTemplate = async () => {
  try {
    const response = await adminService.exercises.downloadTemplate();
    
    // ✅ Xử lý blob response
    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'exercise_template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    showToast('success', 'Thành công', 'Đã tải template Excel');
  } catch (error) {
    console.error('Error downloading template:', error);
    showToast('error', 'Lỗi', error.response?.data?.message || 'Không thể tải template');
  }
};

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleImportExcel(file);
    }
  };

  const handleImportExcel = async (file) => {
    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (!validTypes.includes(file.type)) {
      showToast('error', 'Lỗi', 'Vui lòng chọn file Excel (.xlsx hoặc .xls)');
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await adminService.exercises.importFromExcel(formData);
      
      if (response.data.errors && response.data.errors.length > 0) {
        // Show detailed errors
        const errorList = response.data.errors.slice(0, 5).join('<br>');
        const moreErrors = response.data.errors.length > 5 
          ? `<br>... và ${response.data.errors.length - 5} lỗi khác`
          : '';
        
        Swal.fire({
          icon: 'warning',
          title: 'Import hoàn tất với lỗi',
          html: `
            <p><strong>Thành công:</strong> ${response.data.created} bài tập</p>
            <p><strong>Thất bại:</strong> ${response.data.failed} bài tập</p>
            <hr>
            <div style="text-align: left; font-size: 0.875rem; max-height: 200px; overflow-y: auto;">
              ${errorList}${moreErrors}
            </div>
          `,
          confirmButtonColor: '#58CC02'
        });
      } else {
        showToast('success', 'Thành công', `Đã import ${response.data.created} bài tập`);
      }
      
      fetchExercises();
    } catch (error) {
      console.error('Error importing Excel:', error);
      showToast('error', 'Lỗi', error.response?.data?.message || 'Không thể import file Excel');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      'multiple-choice': 'Trắc nghiệm',
      'fill-blank': 'Điền vào chỗ trống',
      'listening': 'Nghe',
      'speaking': 'Nói',
      'matching': 'Ghép đôi',
      'ordering': 'Sắp xếp',
      'translation': 'Dịch'
    };
    return labels[type] || type;
  };

  // Thêm handler
  const handleTestSpeaking = (exercise) => {
    setSelectedExercise(exercise);
    setShowSpeakingModal(true);
  };

  const handleSpeakingComplete = (result) => {
    console.log('Speaking result:', result);
    showToast(
      result.passed ? 'success' : 'warning',
      result.passed ? 'Xuất sắc!' : 'Chưa đạt',
      `Điểm phát âm: ${result.score}% ${result.passed ? '✓' : '✗'}`
    );
    setShowSpeakingModal(false);
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Quản lý Bài tập">
        <LoadingText theme={theme}>Đang tải dữ liệu...</LoadingText>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Quản lý Bài tập">
      <Toast toast={toast} onClose={hideToast} />

      <PageHeader>
        <Title theme={theme}>
          <FitnessCenter sx={{ mr: 1 }} /> Bài tập ({exercises.length})
        </Title>
        <ButtonGroup>
          <CreateButton onClick={handleCreate}>
            <Add />
            Tạo bài tập
          </CreateButton>
          <CreateButton variant="bulk" onClick={handleBulkCreate}>
            <FileCopy />
            Tạo hàng loạt
          </CreateButton>
          
          {/* ✅ NEW: Import/Export buttons */}
          <UploadButton onClick={handleDownloadTemplate}>
            <Download />
            Tải Template
          </UploadButton>
          
          <UploadButton 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <CloudUpload />
            {uploading ? 'Đang import...' : 'Import Excel'}
          </UploadButton>
          
          <HiddenFileInput
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
          />
        </ButtonGroup>
      </PageHeader>

      <FilterBar>
        <FilterSelect
          theme={theme}
          value={lessonFilter}
          onChange={(e) => setLessonFilter(e.target.value)}
        >
          <option value="all">Tất cả bài học</option>
          {lessons.map(lesson => (
            <option key={lesson._id} value={lesson._id}>
              {lesson.title}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          theme={theme}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">Tất cả loại</option>
          <option value="multiple-choice">Trắc nghiệm</option>
          <option value="fill-blank">Điền vào chỗ trống</option>
          <option value="listening">Nghe</option>
          <option value="speaking">Nói</option>
          <option value="matching">Ghép đôi</option>
          <option value="ordering">Sắp xếp</option>
          <option value="translation">Dịch</option>
        </FilterSelect>

        <FilterSelect
          theme={theme}
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
        >
          <option value="all">Tất cả độ khó</option>
          <option value="easy">Dễ</option>
          <option value="medium">Trung bình</option>
          <option value="hard">Khó</option>
        </FilterSelect>
      </FilterBar>

      {exercises.length === 0 ? (
        <EmptyState theme={theme}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
          <div>Chưa có bài tập nào</div>
          <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Nhấn nút "Tạo bài tập" để bắt đầu
          </div>
        </EmptyState>
      ) : (
        <ExercisesGrid>
          {exercises.map((exercise) => (
            <ExerciseCard key={exercise._id} theme={theme}>
              <ExerciseHeader>
                <div>
                  <TypeBadge type={exercise.type}>
                    {getTypeLabel(exercise.type)}
                  </TypeBadge>
                </div>
                <DifficultyBadge level={exercise.difficulty}>
                  {exercise.difficulty === 'easy' ? '⭐ Dễ' : 
                   exercise.difficulty === 'medium' ? '⭐⭐ TB' : '⭐⭐⭐ Khó'}
                </DifficultyBadge>
              </ExerciseHeader>

              <ExerciseQuestion theme={theme}>
                {exercise.question || 'Không có câu hỏi'}
              </ExerciseQuestion>

              <ExerciseInfo theme={theme}>
                <InfoItem>
                  <MenuBook sx={{ fontSize: 18 }} />
                  {exercise.lesson?.title || 'N/A'}
                </InfoItem>
                <InfoItem>
                  <Star sx={{ fontSize: 18 }} />
                  {exercise.points || 0} điểm
                </InfoItem>
              </ExerciseInfo>

              <ActionButtons>
                <ActionButton variant="view" onClick={() => handleView(exercise._id)}>
                  <Visibility sx={{ fontSize: 18 }} /> Xem
                </ActionButton>
                
                {/* ✅ Thêm nút Test cho speaking */}
                {exercise.type === 'speaking' && (
                  <ActionButton 
                    variant="test" 
                    onClick={() => handleTestSpeaking(exercise)}
                    style={{ background: '#8b5cf6' }}
                  >
                    <Mic sx={{ fontSize: 18 }} /> Test
                  </ActionButton>
                )}
                
                <ActionButton variant="edit" onClick={() => handleEdit(exercise._id)}>
                  <Edit sx={{ fontSize: 18 }} /> Sửa
                </ActionButton>
                <ActionButton variant="delete" onClick={() => handleDelete(exercise)}>
                  <Delete sx={{ fontSize: 18 }} />
                </ActionButton>
              </ActionButtons>
            </ExerciseCard>
          ))}
        </ExercisesGrid>
      )}

      {/* Thêm modal ở cuối return */}
      {showSpeakingModal && selectedExercise && (
        <SpeakingExerciseModal
          exercise={selectedExercise}
          theme={theme}
          onClose={() => setShowSpeakingModal(false)}
          onComplete={handleSpeakingComplete}
        />
      )}
    </AdminLayout>
  );
};

export default AdminExercises;