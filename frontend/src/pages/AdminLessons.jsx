import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import { adminService } from '../services/adminService';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import Swal from 'sweetalert2';
import {
  MenuBook,
  Add,
  Visibility,
  Edit,
  Delete,
  Public,
  VisibilityOff,
  Star,
  Inventory,
  Class
} from '@mui/icons-material';

// ========== STYLED COMPONENTS (tương tự AdminCourses) ==========
const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
`;

const CreateButton = styled.button`
  background: #58CC02;
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

const LessonsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
`;

const LessonCard = styled.div`
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

const LessonTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.5rem;
`;

const LessonDescription = styled.p`
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-size: 0.875rem;
  margin-bottom: 1rem;
  line-height: 1.6;
`;

const LessonStats = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const Stat = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => props.published ? '#10b981' : '#f59e0b'};
  color: white;
  margin-right: 0.5rem;
`;

const TypeBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    const colors = {
      vocabulary: '#8b5cf6',
      grammar: '#1CB0F6',
      reading: '#f59e0b',
      listening: '#10b981',
      speaking: '#ef4444',
      writing: '#ec4899',
      mixed: '#6b7280'
    };
    return colors[props.type] || '#6b7280';
  }};
  color: white;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

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

// ========== COMPONENT ==========

const AdminLessons = () => {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const response = await adminService.lessons.getAll();
      setLessons(response.data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      showToast('error', 'Lỗi', 'Không thể tải danh sách bài học');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    navigate('/admin/lessons/create');
  };

  const handleEdit = (lessonId) => {
    navigate(`/admin/lessons/edit/${lessonId}`);
  };

  const handleView = (lessonId) => {
    navigate(`/admin/lessons/${lessonId}`);
  };

  const handleDelete = async (lesson) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa?',
      text: `Bạn có chắc muốn xóa bài học "${lesson.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        await adminService.lessons.delete(lesson._id);
        showToast('success', 'Thành công', 'Đã xóa bài học');
        fetchLessons();
      } catch (error) {
        showToast('error', 'Lỗi', error.response?.data?.message || 'Không thể xóa bài học');
      }
    }
  };

  const handleTogglePublish = async (lesson) => {
    try {
      await adminService.lessons.togglePublish(lesson._id);
      showToast('success', 'Thành công', `Đã ${lesson.isPublished ? 'ẩn' : 'công khai'} bài học`);
      fetchLessons();
    } catch (error) {
      showToast('error', 'Lỗi', 'Không thể cập nhật trạng thái');
    }
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Quản lý Bài học">
        <LoadingText theme={theme}>Đang tải dữ liệu...</LoadingText>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Quản lý Bài học">
      <Toast toast={toast} onClose={hideToast} />

      <PageHeader>
        <Title theme={theme}>
          <MenuBook sx={{ mr: 1 }} /> Bài học ({lessons.length})
        </Title>
        <CreateButton onClick={handleCreate}>
          <Add />
          Tạo bài học mới
        </CreateButton>
      </PageHeader>

      {lessons.length === 0 ? (
        <EmptyState theme={theme}>
          <MenuBook sx={{ fontSize: 48, mb: 2, color: theme === 'dark' ? '#9ca3af' : '#6b7280' }} />
          <div>Chưa có bài học nào</div>
          <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Nhấn nút "Tạo bài học mới" để bắt đầu
          </div>
        </EmptyState>
      ) : (
        <LessonsGrid>
          {lessons.map((lesson) => (
            <LessonCard key={lesson._id} theme={theme}>
              <div style={{ marginBottom: '0.5rem' }}>
                <StatusBadge published={lesson.isPublished}>
                  {lesson.isPublished ? 'Công khai' : 'Nháp'}
                </StatusBadge>
                <TypeBadge type={lesson.type}>
                  {lesson.type}
                </TypeBadge>
              </div>

              <LessonTitle theme={theme}>{lesson.title}</LessonTitle>
              <LessonDescription theme={theme}>
                {lesson.description || 'Không có mô tả'}
              </LessonDescription>

              <LessonStats theme={theme}>
                <Stat theme={theme}>
                  <Class sx={{ fontSize: 18 }} />
                  Unit: {lesson.unit?.title || 'N/A'}
                </Stat>
                <Stat theme={theme}>
                  <Star sx={{ fontSize: 18 }} />
                  {lesson.xpReward || 0} XP
                </Stat>
              </LessonStats>

              <ActionButtons>
                <ActionButton variant="view" onClick={() => handleView(lesson._id)}>
                  <Visibility sx={{ fontSize: 18 }} /> Xem
                </ActionButton>
                <ActionButton variant="edit" onClick={() => handleEdit(lesson._id)}>
                  <Edit sx={{ fontSize: 18 }} /> Sửa
                </ActionButton>
                <ActionButton
                  variant="toggle"
                  onClick={() => handleTogglePublish(lesson)}
                  style={{ background: lesson.isPublished ? '#f59e0b' : '#10b981' }}
                >
                  {lesson.isPublished ? (
                    <><VisibilityOff sx={{ fontSize: 18 }} /> Ẩn</>
                  ) : (
                    <><Public sx={{ fontSize: 18 }} /> Công khai</>
                  )}
                </ActionButton>
                <ActionButton variant="delete" onClick={() => handleDelete(lesson)}>
                  <Delete sx={{ fontSize: 18 }} />
                </ActionButton>
              </ActionButtons>
            </LessonCard>
          ))}
        </LessonsGrid>
      )}
    </AdminLayout>
  );
};

export default AdminLessons;