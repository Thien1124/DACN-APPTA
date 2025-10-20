import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import Swal from 'sweetalert2';
import api from '../utils/api';
import {adminService} from '../services/adminService';

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

const FilterBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 300px;
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  border-radius: 12px;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: #58CC02;
  }
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

const TableContainer = styled.div`
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
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 1rem;
  border-bottom: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-weight: 600;
  font-size: 0.875rem;
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  color: ${props => props.theme === 'dark' ? '#d1d5db' : '#4b5563'};
  font-size: 0.875rem;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  font-size: 1rem;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.div`
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
`;

const UserEmail = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const Badge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    if (props.variant === 'admin') return '#8b5cf6';
    if (props.variant === 'active') return '#10b981';
    if (props.variant === 'inactive') return '#ef4444';
    return '#6b7280';
  }};
  color: white;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => {
    if (props.variant === 'edit') return '#1CB0F6';
    if (props.variant === 'delete') return '#ef4444';
    if (props.variant === 'toggle') return '#f59e0b';
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

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
`;

const PageButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid ${props => props.active ? '#58CC02' : '#e5e7eb'};
  background: ${props => props.active ? '#58CC02' : 'transparent'};
  color: ${props => props.active ? 'white' : '#6b7280'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.active ? '#45a302' : '#f3f4f6'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// ========== COMPONENT ==========

const AdminUsers = () => {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter, statusFilter, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const response = await adminService.users.getAll({
        page: currentPage,
        limit: 10,
        role: roleFilter,
        isActive: statusFilter,
        search: searchTerm
      });

      if (response.success) {
        setUsers(response.data.users);
        setTotalPages(response.data.totalPages);
      } else {
        throw new Error(response.message);
      }

    } catch (error) {
      console.error('Error fetching users:', error);
      showToast('error', 'Lỗi', 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  // Role options for dropdown
  const roleOptions = [
    { value: 'user', label: 'Học viên' },
    { value: 'teacher', label: 'Giảng viên' },
    { value: 'admin', label: 'Quản trị viên' }
  ];

  const handleChangeRole = async (user) => {
    const { value: newRole } = await Swal.fire({
      title: 'Thay đổi vai trò',
      text: `Chọn vai trò mới cho "${user.name}"`,
      input: 'select',
      inputOptions: {
        user: 'Học viên',
        teacher: 'Giảng viên', 
        admin: 'Quản trị viên'
      },
      inputValue: user.role,
      showCancelButton: true,
      confirmButtonText: 'Lưu thay đổi',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280'
    });

    if (newRole) {
      try {
        await adminService.users.changeRole(user._id, newRole);
        showToast('success', 'Thành công', 'Đã thay đổi vai trò');
        fetchUsers();
      } catch (error) {
        showToast('error', 'Lỗi', error.response?.data?.message || 'Không thể thay đổi vai trò');
      }
    }
  };

  const handleToggleActive = async (user) => {
    const result = await Swal.fire({
      title: `${user.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'} tài khoản`,
      text: `Bạn có chắc muốn ${user.isActive ? 'vô hiệu hóa' : 'kích hoạt'} tài khoản của "${user.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: user.isActive ? 'Vô hiệu hóa' : 'Kích hoạt',
      cancelButtonText: 'Hủy',
      confirmButtonColor: user.isActive ? '#ef4444' : '#10b981'
    });

    if (result.isConfirmed) {
      try {
        await adminService.users.toggleActive(user._id);
        showToast('success', 'Thành công', `Đã ${user.isActive ? 'vô hiệu hóa' : 'kích hoạt'} tài khoản`);
        fetchUsers();
      } catch (error) {
        showToast('error', 'Lỗi', error.response?.data?.message || 'Không thể thay đổi trạng thái');
      }
    }
  };

  const handleDelete = async (user) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa?',
      text: `Bạn có chắc muốn xóa tài khoản "${user.name}"? Hành động này không thể hoàn tác!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '🗑️ Xóa',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        await adminService.users.delete(user._id);
        showToast('success', 'Đã xóa', 'Đã xóa tài khoản');
        fetchUsers();
      } catch (error) {
        showToast('error', 'Lỗi', error.response?.data?.message || 'Không thể xóa tài khoản');
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Quản lý Người dùng">
        <LoadingText theme={theme}>Đang tải dữ liệu...</LoadingText>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Quản lý Người dùng">
      <Toast toast={toast} onClose={hideToast} />

      <PageHeader>
        <Title theme={theme}>👥 Người dùng ({users.length})</Title>
      </PageHeader>

      <FilterBar>
        <SearchInput
          theme={theme}
          type="text"
          placeholder="🔍 Tìm kiếm theo tên hoặc email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FilterSelect
          theme={theme}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">Tất cả vai trò</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </FilterSelect>
        <FilterSelect
          theme={theme}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đã kích hoạt</option>
          <option value="inactive">Chưa kích hoạt</option>
        </FilterSelect>
      </FilterBar>

      <TableContainer theme={theme}>
        <Table>
          <thead>
            <tr>
              <Th theme={theme}>Tên</Th>
              <Th theme={theme}>Email</Th>
              <Th theme={theme}>Vai trò</Th>
              <Th theme={theme}>Trạng thái</Th>
              <Th theme={theme}>Thao tác</Th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <Td theme={theme}>{user.name}</Td>
                <Td theme={theme}>{user.email}</Td>
                <Td theme={theme}>
                  <Badge variant={user.role === 'admin' ? 'admin' : 'user'}>
                    {user.role === 'admin' ? 'Admin' : 'User'}
                  </Badge>
                </Td>
                <Td theme={theme}>
                  <Badge variant={user.isActive ? 'active' : 'inactive'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </Td>
                <Td theme={theme}>
                  <ActionButtons>
                    <ActionButton 
                      variant="toggle" 
                      onClick={() => handleChangeRole(user)}
                      title="Thay đổi vai trò"
                    >
                      Role
                    </ActionButton>
                    <ActionButton 
                      variant="edit" 
                      onClick={() => handleToggleActive(user)}
                      title={user.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                    >
                      {user.isActive ? '🔒' : '🔓'}
                    </ActionButton>
                    <ActionButton 
                      variant="delete" 
                      onClick={() => handleDelete(user)}
                      title="Xóa"
                    >
                      X
                    </ActionButton>
                  </ActionButtons>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Pagination>
          <PageButton
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            ← Trước
          </PageButton>
          {[...Array(totalPages)].map((_, index) => (
            <PageButton
              key={index + 1}
              active={currentPage === index + 1}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </PageButton>
          ))}
          <PageButton
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Sau →
          </PageButton>
        </Pagination>
      </TableContainer>
    </AdminLayout>
  );
};

export default AdminUsers;