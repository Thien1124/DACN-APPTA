import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Swal from 'sweetalert2';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import AdminLayout from '../layouts/AdminLayout';


const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;

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
  animation: slideUp 0.6s ease;
  animation-delay: ${props => props.delay || '0s'};
  animation-fill-mode: both;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    height: 100px;
    background: ${props => props.color || '#58CC02'};
    opacity: 0.05;
    border-radius: 50%;
    transform: translate(30%, -30%);
  }
`;

const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: ${props => props.color || '#58CC02'}22;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-weight: 600;
`;

const TableSection = styled.section`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 2rem;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
  animation: slideUp 0.6s ease;
  animation-delay: 0.4s;
  animation-fill-mode: both;
`;

const TableControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const TableTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  display: flex;
  align-items: center;
  gap: 0.5rem;

  span:first-child {
    font-size: 1.75rem;
  }
`;

const TableActions = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  padding: 0.75rem 1rem 0.75rem 3rem;
  border-radius: 12px;
  border: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 1rem;
  transition: all 0.3s ease;
  width: 300px;

  &:focus {
    outline: none;
    border-color: #58CC02;
    box-shadow: 0 0 0 3px rgba(88, 204, 2, 0.1);
  }

  @media (max-width: 768px) {
    width: 100%;
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

const AddButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
  color: white;
  border: none;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(88, 204, 2, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(88, 204, 2, 0.4);
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
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #58CC02;
    box-shadow: 0 0 0 3px rgba(88, 204, 2, 0.1);
  }
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  border-radius: 12px;
  
  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${props => props.theme === 'dark' ? '#1f2937' : '#f3f4f6'};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #58CC02;
    border-radius: 4px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
`;

const TableHead = styled.thead`
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#f9fafb'};
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.theme === 'dark' ? 'rgba(88, 204, 2, 0.05)' : 'rgba(88, 204, 2, 0.03)'};
  }
`;

const TableHeader = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const TableCell = styled.td`
  padding: 1rem;
  color: ${props => props.theme === 'dark' ? '#d1d5db' : '#4b5563'};
  font-size: 0.875rem;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserAvatar2 = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.color || 'linear-gradient(135deg, #58CC02 0%, #45a302 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const UserName = styled.div`
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
`;

const UserEmail = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const RoleBadge = styled.span`
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: bold;
  background: ${props => {
    if (props.role === 'Admin') return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
    if (props.role === 'Teacher') return 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)';
    return 'linear-gradient(135deg, #1CB0F6 0%, #0891b2 100%)';
  }};
  color: white;
  text-align: center;
  display: inline-block;
`;

const StatusBadge = styled.span`
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: bold;
  background: ${props => props.active 
    ? 'rgba(16, 185, 129, 0.2)' 
    : 'rgba(239, 68, 68, 0.2)'
  };
  color: ${props => props.active ? '#10b981' : '#ef4444'};
  text-align: center;
  display: inline-block;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem;
  border-radius: 8px;
  border: none;
  background: ${props => {
    if (props.variant === 'view') return 'rgba(28, 176, 246, 0.1)';
    if (props.variant === 'edit') return 'rgba(88, 204, 2, 0.1)';
    if (props.variant === 'delete') return 'rgba(239, 68, 68, 0.1)';
    return 'rgba(156, 163, 175, 0.1)';
  }};
  color: ${props => {
    if (props.variant === 'view') return '#1CB0F6';
    if (props.variant === 'edit') return '#58CC02';
    if (props.variant === 'delete') return '#ef4444';
    return '#6b7280';
  }};
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: translateY(-2px);
    opacity: 0.8;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const PaginationInfo = styled.div`
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-size: 0.875rem;
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const PaginationButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  background: ${props => {
    if (props.active) return '#58CC02';
    return props.theme === 'dark' ? '#1f2937' : '#ffffff';
  }};
  color: ${props => {
    if (props.active) return 'white';
    return props.theme === 'dark' ? '#e5e7eb' : '#374151';
  }};
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;

  &:hover:not(:disabled) {
    border-color: #58CC02;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// ========== MODAL STYLED COMPONENTS ==========

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContent = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(135deg, #1f2937 0%, #111827 100%)' 
    : 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)'
  };
  border-radius: 24px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
  border: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${props => props.theme === 'dark' ? '#1f2937' : '#f3f4f6'};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #58CC02;
    border-radius: 4px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
`;

const ModalTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  display: flex;
  align-items: center;
  gap: 0.5rem;

  span:first-child {
    font-size: 2rem;
  }
`;

const CloseButton = styled.button`
  background: ${props => props.theme === 'dark' ? '#374151' : '#f3f4f6'};
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};

  &:hover {
    background: ${props => props.theme === 'dark' ? '#4b5563' : '#e5e7eb'};
    transform: rotate(90deg);
  }
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const UserDetailCard = styled.div`
  background: ${props => props.theme === 'dark' ? '#111827' : '#ffffff'};
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
`;

const UserDetailHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
`;

const UserDetailAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${props => props.color || 'linear-gradient(135deg, #58CC02 0%, #45a302 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const UserDetailInfo = styled.div`
  flex: 1;
`;

const UserDetailName = styled.h3`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.25rem;
`;

const UserDetailEmail = styled.p`
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};

  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-size: 0.875rem;

  span:first-child {
    font-size: 1.25rem;
  }
`;

const DetailValue = styled.div`
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FormLabel = styled.label`
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#e5e7eb' : '#374151'};
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  span:first-child {
    font-size: 1.25rem;
  }
`;

const FormInput = styled.input`
  padding: 0.875rem 1rem;
  border-radius: 12px;
  border: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  background: ${props => props.theme === 'dark' ? '#111827' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #58CC02;
    box-shadow: 0 0 0 3px rgba(88, 204, 2, 0.1);
  }
`;

const FormSelect = styled.select`
  padding: 0.875rem 1rem;
  border-radius: 12px;
  border: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  background: ${props => props.theme === 'dark' ? '#111827' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #58CC02;
    box-shadow: 0 0 0 3px rgba(88, 204, 2, 0.1);
  }
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
`;

const ModalButton = styled.button`
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  border: none;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  ${props => props.variant === 'primary' && `
    background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(88, 204, 2, 0.3);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(88, 204, 2, 0.4);
    }
  `}

  ${props => props.variant === 'secondary' && `
    background: ${props.theme === 'dark' ? '#374151' : '#e5e7eb'};
    color: ${props.theme === 'dark' ? '#e5e7eb' : '#374151'};

    &:hover {
      background: ${props.theme === 'dark' ? '#4b5563' : '#d1d5db'};
    }
  `}
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  border-radius: 4px;
  overflow: hidden;
  margin-top: 0.5rem;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #58CC02 0%, #45a302 100%);
  border-radius: 4px;
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

// ========== COMPONENT ==========

const AdminDashboard = () => {
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    role: '',
    status: ''
  });
  const [addFormData, setAddFormData] = useState({
    name: '',
    email: '',
    role: 'Student',
    password: ''
  });

  // Mock data
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Vinh Son',
      email: 'vinhson@example.com',
      role: 'Admin',
      status: 'Active',
      joinDate: '2025-01-15',
      level: 12,
      xp: 2850,
      avatar: '👨‍💼',
      color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    },
    {
      id: 2,
      name: 'Nguyen Van A',
      email: 'nguyenvana@example.com',
      role: 'Student',
      status: 'Active',
      joinDate: '2025-02-10',
      level: 8,
      xp: 1420,
      avatar: '👨',
      color: 'linear-gradient(135deg, #1CB0F6 0%, #0891b2 100%)',
    },
    {
      id: 3,
      name: 'Tran Thi B',
      email: 'tranthib@example.com',
      role: 'Teacher',
      status: 'Active',
      joinDate: '2025-01-20',
      level: 15,
      xp: 4200,
      avatar: '👩‍🏫',
      color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    },
    {
      id: 4,
      name: 'Le Van C',
      email: 'levanc@example.com',
      role: 'Student',
      status: 'Inactive',
      joinDate: '2025-03-05',
      level: 3,
      xp: 450,
      avatar: '🧑',
      color: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    },
    {
      id: 5,
      name: 'Pham Thi D',
      email: 'phamthid@example.com',
      role: 'Student',
      status: 'Active',
      joinDate: '2025-02-28',
      level: 10,
      xp: 2100,
      avatar: '👩',
      color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    },
  ]);

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'Active').length,
    students: users.filter(u => u.role === 'Student').length,
    teachers: users.filter(u => u.role === 'Teacher').length,
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = filterRole === 'all' || user.role === filterRole;
    return matchSearch && matchRole;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setViewModalOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    setUsers(users.map(u => 
      u.id === selectedUser.id 
        ? { ...u, ...editFormData }
        : u
    ));
    setEditModalOpen(false);
    showToast('success', 'Thành công!', 'Thông tin người dùng đã được cập nhật');
  };

  const handleAddUser = () => {
    setAddFormData({
      name: '',
      email: '',
      role: 'Student',
      password: ''
    });
    setAddModalOpen(true);
  };

  const handleSaveAdd = () => {
    if (!addFormData.name || !addFormData.email || !addFormData.role || !addFormData.password) {
      showToast('error', 'Lỗi!', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(addFormData.email)) {
      showToast('error', 'Lỗi!', 'Email không hợp lệ');
      return;
    }

    if (addFormData.password.length < 6) {
      showToast('error', 'Lỗi!', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (users.some(u => u.email === addFormData.email)) {
      showToast('error', 'Lỗi!', 'Email đã tồn tại trong hệ thống');
      return;
    }

    const avatarEmojis = {
      'Admin': '👨‍💼',
      'Teacher': '👩‍🏫',
      'Student': '👨‍🎓'
    };

    const colorGradients = {
      'Admin': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      'Teacher': 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      'Student': 'linear-gradient(135deg, #1CB0F6 0%, #0891b2 100%)'
    };

    const newUser = {
      id: users.length + 1,
      name: addFormData.name,
      email: addFormData.email,
      role: addFormData.role,
      status: 'Active',
      joinDate: new Date().toISOString().split('T')[0],
      level: 1,
      xp: 0,
      avatar: avatarEmojis[addFormData.role] || '👤',
      color: colorGradients[addFormData.role] || 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
    };

    setUsers([...users, newUser]);
    setAddModalOpen(false);
    showToast('success', 'Thành công!', `Đã thêm người dùng "${newUser.name}"`);
  };

  const calculateProgress = (xp, level) => {
    const xpPerLevel = 500;
    const currentLevelXp = (level - 1) * xpPerLevel;
    const nextLevelXp = level * xpPerLevel;
    const progress = ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const handleDeleteUser = (user) => {
    Swal.fire({
      title: 'Xác nhận xóa?',
      text: `Bạn có chắc muốn xóa người dùng "${user.name}"? Hành động này không thể hoàn tác!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        setUsers(users.filter(u => u.id !== user.id));
        showToast('success', 'Đã xóa!', `Người dùng "${user.name}" đã được xóa`);
      }
    });
  };

  return (
    <AdminLayout pageTitle="👥 Quản lý người dùng">
      <Toast toast={toast} onClose={hideToast} />

      {/* Stats */}
      <StatsGrid>
        <StatCard theme={theme} color="#58CC02" delay="0.1s">
          <StatIcon color="#58CC02">👥</StatIcon>
          <StatValue theme={theme}>{stats.totalUsers}</StatValue>
          <StatLabel theme={theme}>Tổng người dùng</StatLabel>
        </StatCard>

        <StatCard theme={theme} color="#10b981" delay="0.2s">
          <StatIcon color="#10b981">✅</StatIcon>
          <StatValue theme={theme}>{stats.activeUsers}</StatValue>
          <StatLabel theme={theme}>Đang hoạt động</StatLabel>
        </StatCard>

        <StatCard theme={theme} color="#1CB0F6" delay="0.3s">
          <StatIcon color="#1CB0F6">🎓</StatIcon>
          <StatValue theme={theme}>{stats.students}</StatValue>
          <StatLabel theme={theme}>Học sinh</StatLabel>
        </StatCard>

        <StatCard theme={theme} color="#8b5cf6" delay="0.4s">
          <StatIcon color="#8b5cf6">👨‍🏫</StatIcon>
          <StatValue theme={theme}>{stats.teachers}</StatValue>
          <StatLabel theme={theme}>Giáo viên</StatLabel>
        </StatCard>
      </StatsGrid>

      {/* Table */}
      <TableSection theme={theme}>
        <TableControls>
          <TableTitle theme={theme}>
            <span>📋</span>
            Danh sách người dùng
          </TableTitle>
          <TableActions>
            <SearchWrapper>
              <SearchInput
                theme={theme}
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchWrapper>
            <FilterSelect
              theme={theme}
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">Tất cả vai trò</option>
              <option value="Admin">Admin</option>
              <option value="Teacher">Teacher</option>
              <option value="Student">Student</option>
            </FilterSelect>
            <AddButton onClick={handleAddUser}>
              <span>➕</span>
              Thêm mới
            </AddButton>
          </TableActions>
        </TableControls>

        <TableWrapper theme={theme}>
          <Table>
            <TableHead theme={theme}>
              <TableRow>
                <TableHeader theme={theme}>Người dùng</TableHeader>
                <TableHeader theme={theme}>Vai trò</TableHeader>
                <TableHeader theme={theme}>Trạng thái</TableHeader>
                <TableHeader theme={theme}>Ngày tham gia</TableHeader>
                <TableHeader theme={theme}>Level</TableHeader>
                <TableHeader theme={theme}>XP</TableHeader>
                <TableHeader theme={theme}>Hành động</TableHeader>
              </TableRow>
            </TableHead>
            <tbody>
              {paginatedUsers.map(user => (
                <TableRow key={user.id} theme={theme}>
                  <TableCell>
                    <UserInfo>
                      <UserAvatar2 color={user.color}>
                        {user.avatar}
                      </UserAvatar2>
                      <UserDetails>
                        <UserName theme={theme}>{user.name}</UserName>
                        <UserEmail theme={theme}>{user.email}</UserEmail>
                      </UserDetails>
                    </UserInfo>
                  </TableCell>
                  <TableCell>
                    <RoleBadge role={user.role}>{user.role}</RoleBadge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge active={user.status === 'Active'}>
                      {user.status}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>{user.joinDate}</TableCell>
                  <TableCell>{user.level}</TableCell>
                  <TableCell>{user.xp}</TableCell>
                  <TableCell>
                    <ActionButtons>
                      <ActionButton 
                        variant="view"
                        onClick={() => handleViewUser(user)}
                        title="Xem chi tiết"
                      >
                        👁️
                      </ActionButton>
                      <ActionButton 
                        variant="edit"
                        onClick={() => handleEditUser(user)}
                        title="Chỉnh sửa"
                      >
                        ✏️
                      </ActionButton>
                      <ActionButton 
                        variant="delete"
                        onClick={() => handleDeleteUser(user)}
                        title="Xóa"
                      >
                        🗑️
                      </ActionButton>
                    </ActionButtons>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </TableWrapper>

        {/* Pagination */}
        <Pagination>
          <PaginationInfo theme={theme}>
            Hiển thị {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredUsers.length)} trong tổng số {filteredUsers.length} người dùng
          </PaginationInfo>
          <PaginationButtons>
            <PaginationButton
              theme={theme}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              ← Trước
            </PaginationButton>
            {[...Array(totalPages)].map((_, index) => (
              <PaginationButton
                key={index}
                theme={theme}
                active={currentPage === index + 1}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </PaginationButton>
            ))}
            <PaginationButton
              theme={theme}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Sau →
            </PaginationButton>
          </PaginationButtons>
        </Pagination>
      </TableSection>

      {/* Add User Modal */}
      {addModalOpen && (
        <ModalOverlay onClick={() => setAddModalOpen(false)}>
          <ModalContent theme={theme} onClick={(e) => e.stopPropagation()}>
            <ModalHeader theme={theme}>
              <ModalTitle theme={theme}>
                <span>➕</span>
                Thêm người dùng mới
              </ModalTitle>
              <CloseButton theme={theme} onClick={() => setAddModalOpen(false)}>
                ✕
              </CloseButton>
            </ModalHeader>

            <ModalBody>
              <FormGroup>
                <FormLabel theme={theme}>
                  <span>👤</span>
                  Họ và tên <span style={{ color: '#ef4444' }}>*</span>
                </FormLabel>
                <FormInput
                  theme={theme}
                  type="text"
                  value={addFormData.name}
                  onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                  placeholder="Nhập họ và tên"
                />
              </FormGroup>

              <FormGroup>
                <FormLabel theme={theme}>
                  <span>📧</span>
                  Email <span style={{ color: '#ef4444' }}>*</span>
                </FormLabel>
                <FormInput
                  theme={theme}
                  type="email"
                  value={addFormData.email}
                  onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                  placeholder="example@email.com"
                />
              </FormGroup>

              <FormGroup>
                <FormLabel theme={theme}>
                  <span>🎭</span>
                  Vai trò <span style={{ color: '#ef4444' }}>*</span>
                </FormLabel>
                <FormSelect
                  theme={theme}
                  value={addFormData.role}
                  onChange={(e) => setAddFormData({ ...addFormData, role: e.target.value })}
                >
                  <option value="Student">Student - Học sinh</option>
                  <option value="Teacher">Teacher - Giáo viên</option>
                  <option value="Admin">Admin - Quản trị viên</option>
                </FormSelect>
              </FormGroup>

              <FormGroup>
                <FormLabel theme={theme}>
                  <span>🔒</span>
                  Mật khẩu <span style={{ color: '#ef4444' }}>*</span>
                </FormLabel>
                <FormInput
                  theme={theme}
                  type="password"
                  value={addFormData.password}
                  onChange={(e) => setAddFormData({ ...addFormData, password: e.target.value })}
                  placeholder="Ít nhất 6 ký tự"
                />
              </FormGroup>

              <div style={{ 
                padding: '1rem', 
                background: theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                borderRadius: '12px',
                border: `1px solid ${theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'}`,
                fontSize: '0.875rem',
                color: theme === 'dark' ? '#9ca3af' : '#6b7280'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span>ℹ️</span>
                  <strong>Lưu ý:</strong>
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                  <li>Email phải là duy nhất trong hệ thống</li>
                  <li>Mật khẩu tối thiểu 6 ký tự</li>
                  <li>Người dùng mới sẽ bắt đầu ở Level 1</li>
                </ul>
              </div>
            </ModalBody>

            <ModalFooter theme={theme}>
              <ModalButton variant="primary" onClick={handleSaveAdd}>
                <span>➕</span>
                Thêm người dùng
              </ModalButton>
              <ModalButton 
                variant="secondary" 
                theme={theme}
                onClick={() => setAddModalOpen(false)}
              >
                Hủy
              </ModalButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* View User Modal */}
      {viewModalOpen && selectedUser && (
        <ModalOverlay onClick={() => setViewModalOpen(false)}>
          <ModalContent theme={theme} onClick={(e) => e.stopPropagation()}>
            <ModalHeader theme={theme}>
              <ModalTitle theme={theme}>
                <span>👤</span>
                Chi tiết người dùng
              </ModalTitle>
              <CloseButton theme={theme} onClick={() => setViewModalOpen(false)}>
                ✕
              </CloseButton>
            </ModalHeader>

            <ModalBody>
              <UserDetailCard theme={theme}>
                <UserDetailHeader theme={theme}>
                  <UserDetailAvatar color={selectedUser.color}>
                    {selectedUser.avatar}
                  </UserDetailAvatar>
                  <UserDetailInfo>
                    <UserDetailName theme={theme}>{selectedUser.name}</UserDetailName>
                    <UserDetailEmail theme={theme}>{selectedUser.email}</UserDetailEmail>
                    <div style={{ marginTop: '0.5rem' }}>
                      <RoleBadge role={selectedUser.role}>{selectedUser.role}</RoleBadge>
                    </div>
                  </UserDetailInfo>
                </UserDetailHeader>

                <DetailRow theme={theme}>
                  <DetailLabel theme={theme}>
                    <span>📊</span>
                    Trạng thái
                  </DetailLabel>
                  <DetailValue theme={theme}>
                    <StatusBadge active={selectedUser.status === 'Active'}>
                      {selectedUser.status}
                    </StatusBadge>
                  </DetailValue>
                </DetailRow>

                <DetailRow theme={theme}>
                  <DetailLabel theme={theme}>
                    <span>📅</span>
                    Ngày tham gia
                  </DetailLabel>
                  <DetailValue theme={theme}>{selectedUser.joinDate}</DetailValue>
                </DetailRow>

                <DetailRow theme={theme}>
                  <DetailLabel theme={theme}>
                    <span>🎯</span>
                    Level
                  </DetailLabel>
                  <DetailValue theme={theme}>
                    Level {selectedUser.level}
                    <ProgressBar theme={theme}>
                      <ProgressFill progress={calculateProgress(selectedUser.xp, selectedUser.level)} />
                    </ProgressBar>
                  </DetailValue>
                </DetailRow>

                <DetailRow theme={theme}>
                  <DetailLabel theme={theme}>
                    <span>⭐</span>
                    Kinh nghiệm
                  </DetailLabel>
                  <DetailValue theme={theme}>{selectedUser.xp} XP</DetailValue>
                </DetailRow>
              </UserDetailCard>
            </ModalBody>

            <ModalFooter theme={theme}>
              <ModalButton 
                variant="primary" 
                onClick={() => {
                  setViewModalOpen(false);
                  handleEditUser(selectedUser);
                }}
              >
                <span>✏️</span>
                Chỉnh sửa
              </ModalButton>
              <ModalButton 
                variant="secondary" 
                theme={theme}
                onClick={() => setViewModalOpen(false)}
              >
                Đóng
              </ModalButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Edit User Modal */}
      {editModalOpen && selectedUser && (
        <ModalOverlay onClick={() => setEditModalOpen(false)}>
          <ModalContent theme={theme} onClick={(e) => e.stopPropagation()}>
            <ModalHeader theme={theme}>
              <ModalTitle theme={theme}>
                <span>✏️</span>
                Chỉnh sửa người dùng
              </ModalTitle>
              <CloseButton theme={theme} onClick={() => setEditModalOpen(false)}>
                ✕
              </CloseButton>
            </ModalHeader>

            <ModalBody>
              <FormGroup>
                <FormLabel theme={theme}>
                  <span>👤</span>
                  Họ và tên
                </FormLabel>
                <FormInput
                  theme={theme}
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="Nhập họ và tên"
                />
              </FormGroup>

              <FormGroup>
                <FormLabel theme={theme}>
                  <span>📧</span>
                  Email
                </FormLabel>
                <FormInput
                  theme={theme}
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  placeholder="Nhập email"
                />
              </FormGroup>

              <FormGroup>
                <FormLabel theme={theme}>
                  <span>🎭</span>
                  Vai trò
                </FormLabel>
                <FormSelect
                  theme={theme}
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                >
                  <option value="Admin">Admin</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Student">Student</option>
                </FormSelect>
              </FormGroup>

              <FormGroup>
                <FormLabel theme={theme}>
                  <span>📊</span>
                  Trạng thái
                </FormLabel>
                <FormSelect
                  theme={theme}
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </FormSelect>
              </FormGroup>
            </ModalBody>

            <ModalFooter theme={theme}>
              <ModalButton variant="primary" onClick={handleSaveEdit}>
                <span>💾</span>
                Lưu thay đổi
              </ModalButton>
              <ModalButton 
                variant="secondary" 
                theme={theme}
                onClick={() => setEditModalOpen(false)}
              >
                Hủy
              </ModalButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;