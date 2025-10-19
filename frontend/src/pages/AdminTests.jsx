import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import { adminService } from '../services/adminService';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import Swal from 'sweetalert2';

// ========== STYLED COMPONENTS ==========

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
  min-width: 200px;

  &:focus {
    outline: none;
    border-color: #58CC02;
  }
`;

const TestsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
`;

const TestCard = styled.div`
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

const TestTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.5rem;
`;

const TestDescription = styled.p`
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-size: 0.875rem;
  margin-bottom: 1rem;
  line-height: 1.6;
`;

const TestStats = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
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
      placement: '#8b5cf6',
      unit: '#1CB0F6',
      final: '#ef4444',
      practice: '#10b981'
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

const AdminTests = () => {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState([]);
  const [courses, setCourses] = useState([]);
  const [courseFilter, setCourseFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterTests();
  }, [courseFilter, typeFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [testsResponse, coursesResponse] = await Promise.all([
        adminService.tests.getAll(),
        adminService.courses.getAll()
      ]);
      
      setTests(testsResponse.data || []);
      setCourses(coursesResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('error', 'Lỗi', 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const filterTests = () => {
    // Implement filtering logic here if needed
  };

  const handleCreate = () => {
    navigate('/admin/tests/create');
  };

  const handleEdit = (testId) => {
    navigate(`/admin/tests/edit/${testId}`);
  };

  const handleView = (testId) => {
    navigate(`/admin/tests/${testId}`);
  };

  const handleDelete = async (test) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa?',
      text: `Bạn có chắc muốn xóa bài test "${test.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        await adminService.tests.delete(test._id);
        showToast('success', 'Thành công', 'Đã xóa bài test');
        fetchData();
      } catch (error) {
        showToast('error', 'Lỗi', error.response?.data?.message || 'Không thể xóa bài test');
      }
    }
  };

  const handleTogglePublish = async (test) => {
    try {
      await adminService.tests.togglePublish(test._id);
      showToast('success', 'Thành công', `Đã ${test.isPublished ? 'ẩn' : 'công khai'} bài test`);
      fetchData();
    } catch (error) {
      showToast('error', 'Lỗi', 'Không thể cập nhật trạng thái');
    }
  };

  const filteredTests = tests.filter(test => {
    if (courseFilter !== 'all' && test.course?._id !== courseFilter) return false;
    if (typeFilter !== 'all' && test.type !== typeFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <AdminLayout pageTitle="Quản lý Bài Test">
        <LoadingText theme={theme}>Đang tải dữ liệu...</LoadingText>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Quản lý Bài Test">
      <Toast toast={toast} onClose={hideToast} />

      <PageHeader>
        <Title theme={theme}>📋 Bài Test ({filteredTests.length})</Title>
        <CreateButton onClick={handleCreate}>
          <span>➕</span>
          Tạo bài test mới
        </CreateButton>
      </PageHeader>

      <FilterBar>
        <FilterSelect
          theme={theme}
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
        >
          <option value="all">Tất cả khóa học</option>
          {courses.map(course => (
            <option key={course._id} value={course._id}>
              {course.title}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          theme={theme}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">Tất cả loại test</option>
          <option value="placement">Placement Test</option>
          <option value="unit">Unit Test</option>
          <option value="final">Final Test</option>
          <option value="practice">Practice Test</option>
        </FilterSelect>
      </FilterBar>

      {filteredTests.length === 0 ? (
        <EmptyState theme={theme}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
          <div>Chưa có bài test nào</div>
          <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Nhấn nút "Tạo bài test mới" để bắt đầu
          </div>
        </EmptyState>
      ) : (
        <TestsGrid>
          {filteredTests.map((test) => (
            <TestCard key={test._id} theme={theme}>
              <div style={{ marginBottom: '0.5rem' }}>
                <StatusBadge published={test.isPublished}>
                  {test.isPublished ? 'Công khai' : 'Nháp'}
                </StatusBadge>
                <TypeBadge type={test.type}>
                  {test.type || 'N/A'}
                </TypeBadge>
              </div>
              
              <TestTitle theme={theme}>{test.title}</TestTitle>
              <TestDescription theme={theme}>
                {test.description || 'Không có mô tả'}
              </TestDescription>
              
              <TestStats theme={theme}>
                <Stat theme={theme}>
                  <span>📚</span>
                  {test.course?.title || 'N/A'}
                </Stat>
                <Stat theme={theme}>
                  <span>🎯</span>
                  {test.exercises?.length || 0} câu hỏi
                </Stat>
                <Stat theme={theme}>
                  <span>⏱️</span>
                  {test.timeLimit || 0} phút
                </Stat>
              </TestStats>

              <ActionButtons>
                <ActionButton variant="view" onClick={() => handleView(test._id)}>
                  👁️ Xem
                </ActionButton>
                <ActionButton variant="edit" onClick={() => handleEdit(test._id)}>
                  ✏️ Sửa
                </ActionButton>
                <ActionButton 
                  variant="toggle" 
                  onClick={() => handleTogglePublish(test)}
                  style={{ background: test.isPublished ? '#f59e0b' : '#10b981' }}
                >
                  {test.isPublished ? '👁️‍🗨️ Ẩn' : '🌐 Công khai'}
                </ActionButton>
                <ActionButton variant="delete" onClick={() => handleDelete(test)}>
                  🗑️
                </ActionButton>
              </ActionButtons>
            </TestCard>
          ))}
        </TestsGrid>
      )}
    </AdminLayout>
  );
};

export default AdminTests;