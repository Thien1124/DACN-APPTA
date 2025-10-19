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

const UnitsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
`;

const UnitCard = styled.div`
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

const UnitTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.5rem;
`;

const UnitDescription = styled.p`
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-size: 0.875rem;
  margin-bottom: 1rem;
  line-height: 1.6;
`;

const UnitStats = styled.div`
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

const AdminUnits = () => {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [loading, setLoading] = useState(true);
  const [units, setUnits] = useState([]);

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const response = await adminService.units.getAll();
      setUnits(response.data || []);
    } catch (error) {
      console.error('Error fetching units:', error);
      showToast('error', 'Lỗi', 'Không thể tải danh sách units');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    navigate('/admin/units/create');
  };

  const handleEdit = (unitId) => {
    navigate(`/admin/units/edit/${unitId}`);
  };

  const handleView = (unitId) => {
    navigate(`/admin/units/${unitId}`);
  };

  const handleDelete = async (unit) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa?',
      text: `Bạn có chắc muốn xóa unit "${unit.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        await adminService.units.delete(unit._id);
        showToast('success', 'Thành công', 'Đã xóa unit');
        fetchUnits();
      } catch (error) {
        showToast('error', 'Lỗi', error.response?.data?.message || 'Không thể xóa unit');
      }
    }
  };

  const handleTogglePublish = async (unit) => {
    try {
      await adminService.units.togglePublish(unit._id);
      showToast('success', 'Thành công', `Đã ${unit.isPublished ? 'ẩn' : 'công khai'} unit`);
      fetchUnits();
    } catch (error) {
      showToast('error', 'Lỗi', 'Không thể cập nhật trạng thái');
    }
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Quản lý Units">
        <LoadingText theme={theme}>Đang tải dữ liệu...</LoadingText>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Quản lý Units">
      <Toast toast={toast} onClose={hideToast} />

      <PageHeader>
        <Title theme={theme}>📦 Units ({units.length})</Title>
        <CreateButton onClick={handleCreate}>
          <span>➕</span>
          Tạo unit mới
        </CreateButton>
      </PageHeader>

      {units.length === 0 ? (
        <EmptyState theme={theme}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
          <div>Chưa có unit nào</div>
          <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Nhấn nút "Tạo unit mới" để bắt đầu
          </div>
        </EmptyState>
      ) : (
        <UnitsGrid>
          {units.map((unit) => (
            <UnitCard key={unit._id} theme={theme}>
              <UnitTitle theme={theme}>{unit.title}</UnitTitle>
              <UnitDescription theme={theme}>
                {unit.description || 'Không có mô tả'}
              </UnitDescription>
              
              <UnitStats theme={theme}>
                <Stat theme={theme}>
                  <span>📚</span>
                  Khóa học: {unit.course?.title || 'N/A'}
                </Stat>
                <Stat theme={theme}>
                  <span>📖</span>
                  {unit.lessons?.length || 0} bài học
                </Stat>
              </UnitStats>

              <StatusBadge published={unit.isPublished}>
                {unit.isPublished ? 'Công khai' : 'Nháp'}
              </StatusBadge>

              <ActionButtons>
                <ActionButton variant="view" onClick={() => handleView(unit._id)}>
                  👁️ Xem
                </ActionButton>
                <ActionButton variant="edit" onClick={() => handleEdit(unit._id)}>
                  ✏️ Sửa
                </ActionButton>
                <ActionButton 
                  variant="toggle" 
                  onClick={() => handleTogglePublish(unit)}
                  style={{ background: unit.isPublished ? '#f59e0b' : '#10b981' }}
                >
                  {unit.isPublished ? '👁️‍🗨️ Ẩn' : '🌐 Công khai'}
                </ActionButton>
                <ActionButton variant="delete" onClick={() => handleDelete(unit)}>
                  🗑️
                </ActionButton>
              </ActionButtons>
            </UnitCard>
          ))}
        </UnitsGrid>
      )}
    </AdminLayout>
  );
};

export default AdminUnits;