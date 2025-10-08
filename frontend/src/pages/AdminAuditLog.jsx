import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Swal from 'sweetalert2';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';

// ========== STYLED COMPONENTS ==========

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%)'
    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e0 100%)'
  };
  position: relative;
  overflow-x: hidden;

  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.theme === 'dark'
      ? 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 70%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 70%), radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 70%)'
      : 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 70%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.05) 0%, transparent 70%), radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.05) 0%, transparent 70%)'
    };
    z-index: -1;
  }
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  background: ${props => props.theme === 'dark' 
    ? 'rgba(26, 26, 26, 0.95)' 
    : 'rgba(255, 255, 255, 0.95)'
  };
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
`;

const HeaderContent = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: bold;
  color: #58CC02;
  cursor: pointer;

  span:first-child {
    font-size: 2rem;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ThemeToggle = styled.button`
  background: ${props => props.theme === 'dark' ? '#374151' : '#f3f4f6'};
  border: none;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: rotate(20deg) scale(1.1);
    background: ${props => props.theme === 'dark' ? '#4B5563' : '#e5e7eb'};
  }
`;

const AdminBadge = styled.div`
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const BackButton = styled.button`
  background: ${props => props.theme === 'dark' ? '#374151' : '#f3f4f6'};
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#e5e7eb' : '#374151'};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${props => props.theme === 'dark' ? '#4B5563' : '#e5e7eb'};
    transform: translateY(-2px);
  }
`;

const DashboardContainer = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  span:first-child {
    font-size: 3rem;
  }

  @media (max-width: 768px) {
    font-size: 2rem;
    
    span:first-child {
      font-size: 2.5rem;
    }
  }
`;

const PageSubtitle = styled.p`
  font-size: 1.125rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-bottom: 2rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 768px) {
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

const FilterSection = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  gap: 1rem;
  align-items: end;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr 1fr;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FilterLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#e5e7eb' : '#374151'};
`;

const SearchWrapper = styled.div`
  position: relative;
`;

const SearchIcon = styled.span`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.25rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border-radius: 12px;
  border: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #58CC02;
    box-shadow: 0 0 0 3px rgba(88, 204, 2, 0.1);
  }

  &::placeholder {
    color: ${props => props.theme === 'dark' ? '#6b7280' : '#9ca3af'};
  }
`;

const FilterSelect = styled.select`
  padding: 1rem;
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

const DateInput = styled.input`
  padding: 1rem;
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

const ExportButton = styled.button`
  padding: 1rem 1.5rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #1CB0F6 0%, #0891b2 100%);
  color: white;
  border: none;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(28, 176, 246, 0.3);
  white-space: nowrap;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(28, 176, 246, 0.4);
  }
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
  min-width: 1200px;
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

const UserCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const UserAvatar = styled.div`
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: ${props => props.color || 'linear-gradient(135deg, #58CC02 0%, #45a302 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const UserName = styled.div`
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
`;

const UserRole = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const ActionBadge = styled.span`
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: bold;
  background: ${props => props.color || '#58CC02'}22;
  color: ${props => props.color || '#58CC02'};
  text-align: center;
  display: inline-block;
  white-space: nowrap;
`;

const CategoryBadge = styled.span`
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: bold;
  background: ${props => {
    const colors = {
      authentication: '#58CC02',
      profile: '#1CB0F6',
      learning: '#8b5cf6',
      admin: '#f59e0b',
      security: '#ef4444',
      system: '#6b7280',
    };
    return colors[props.category] || '#58CC02';
  }}22;
  color: ${props => {
    const colors = {
      authentication: '#58CC02',
      profile: '#1CB0F6',
      learning: '#8b5cf6',
      admin: '#f59e0b',
      security: '#ef4444',
      system: '#6b7280',
    };
    return colors[props.category] || '#58CC02';
  }};
  text-align: center;
  display: inline-block;
  white-space: nowrap;
`;

const SeverityBadge = styled.span`
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: bold;
  background: ${props => {
    if (props.severity === 'critical') return 'rgba(239, 68, 68, 0.2)';
    if (props.severity === 'high') return 'rgba(245, 158, 11, 0.2)';
    if (props.severity === 'medium') return 'rgba(28, 176, 246, 0.2)';
    return 'rgba(107, 114, 128, 0.2)';
  }};
  color: ${props => {
    if (props.severity === 'critical') return '#ef4444';
    if (props.severity === 'high') return '#f59e0b';
    if (props.severity === 'medium') return '#1CB0F6';
    return '#6b7280';
  }};
  text-align: center;
  display: inline-block;
  text-transform: uppercase;
`;

const ActionButton = styled.button`
  padding: 0.5rem;
  border-radius: 8px;
  border: none;
  background: ${props => {
    if (props.variant === 'view') return 'rgba(28, 176, 246, 0.1)';
    if (props.variant === 'flag') return 'rgba(239, 68, 68, 0.1)';
    return 'rgba(156, 163, 175, 0.1)';
  }};
  color: ${props => {
    if (props.variant === 'view') return '#1CB0F6';
    if (props.variant === 'flag') return '#ef4444';
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

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
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

// ========== MOCK DATA ==========

const mockAuditLogs = [
  {
    id: 1,
    user: 'Vinh Son',
    userId: 'vinhsonvlog',
    role: 'Admin',
    action: 'Đăng nhập',
    category: 'authentication',
    description: 'Đăng nhập thành công từ Chrome on Windows',
    ip: '192.168.1.100',
    device: 'Chrome/Windows',
    timestamp: '2025-10-08 14:30:22',
    severity: 'low',
    avatar: '👨‍💼',
    color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  },
  {
    id: 2,
    user: 'Nguyen Van A',
    userId: 'nguyenvana',
    role: 'Student',
    action: 'Cập nhật hồ sơ',
    category: 'profile',
    description: 'Thay đổi ảnh đại diện và thông tin cá nhân',
    ip: '192.168.1.105',
    device: 'Safari/MacOS',
    timestamp: '2025-10-08 14:15:10',
    severity: 'low',
    avatar: '👨',
    color: 'linear-gradient(135deg, #1CB0F6 0%, #0891b2 100%)',
  },
  {
    id: 3,
    user: 'Tran Thi B',
    userId: 'tranthib',
    role: 'Teacher',
    action: 'Tạo bài kiểm tra',
    category: 'learning',
    description: 'Tạo đề thi TOEIC L&R Full Test #10',
    ip: '192.168.1.110',
    device: 'Firefox/Windows',
    timestamp: '2025-10-08 14:00:45',
    severity: 'medium',
    avatar: '👩‍🏫',
    color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  },
  {
    id: 4,
    user: 'System',
    userId: 'system',
    role: 'System',
    action: 'Backup database',
    category: 'system',
    description: 'Tự động backup dữ liệu định kỳ',
    ip: '127.0.0.1',
    device: 'System/Linux',
    timestamp: '2025-10-08 13:00:00',
    severity: 'low',
    avatar: '🤖',
    color: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
  },
  {
    id: 5,
    user: 'Le Van C',
    userId: 'levanc',
    role: 'Student',
    action: 'Đăng nhập thất bại',
    category: 'security',
    description: 'Nhập sai mật khẩu 3 lần liên tiếp',
    ip: '192.168.1.200',
    device: 'Chrome/Android',
    timestamp: '2025-10-08 12:45:30',
    severity: 'high',
    avatar: '🧑',
    color: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  },
  {
    id: 6,
    user: 'Vinh Son',
    userId: 'vinhsonvlog',
    role: 'Admin',
    action: 'Xóa người dùng',
    category: 'admin',
    description: 'Xóa tài khoản người dùng "testuser123"',
    ip: '192.168.1.100',
    device: 'Chrome/Windows',
    timestamp: '2025-10-08 12:30:15',
    severity: 'critical',
    avatar: '👨‍💼',
    color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  },
  {
    id: 7,
    user: 'Pham Thi D',
    userId: 'phamthid',
    role: 'Student',
    action: 'Hoàn thành bài học',
    category: 'learning',
    description: 'Hoàn thành Unit 5: Daily Routines với điểm 95/100',
    ip: '192.168.1.115',
    device: 'Edge/Windows',
    timestamp: '2025-10-08 12:00:00',
    severity: 'low',
    avatar: '👩',
    color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  },
  {
    id: 8,
    user: 'System',
    userId: 'system',
    role: 'System',
    action: 'Email notification',
    category: 'system',
    description: 'Gửi email thông báo điểm thi cho 156 học viên',
    ip: '127.0.0.1',
    device: 'System/Linux',
    timestamp: '2025-10-08 11:00:00',
    severity: 'low',
    avatar: '🤖',
    color: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
  },
];

// ========== COMPONENT ==========

const AdminAuditLog = () => {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [theme, setTheme] = useState('light');
  const [logs, setLogs] = useState(mockAuditLogs);
  const [displayedLogs, setDisplayedLogs] = useState(mockAuditLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const stats = {
    total: logs.length,
    today: logs.filter(l => l.timestamp.startsWith('2025-10-08')).length,
    critical: logs.filter(l => l.severity === 'critical').length,
    security: logs.filter(l => l.category === 'security').length,
    failed: logs.filter(l => l.action.includes('thất bại')).length,
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Filter logs
  useEffect(() => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ip.includes(searchTerm)
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(log => log.category === categoryFilter);
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter(log => log.severity === severityFilter);
    }

    if (dateFilter) {
      filtered = filtered.filter(log => log.timestamp.startsWith(dateFilter));
    }

    setDisplayedLogs(filtered);
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, severityFilter, dateFilter, logs]);

  // Pagination
  const totalPages = Math.ceil(displayedLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = displayedLogs.slice(startIndex, startIndex + itemsPerPage);

  const handleViewDetail = (log) => {
    const severityPalette = {
      critical: { label: 'Critical', color: '#ef4444', bg: 'rgba(239,68,68,0.15)', icon: '🚨' },
      high: { label: 'High', color: '#f59e0b', bg: 'rgba(245,158,11,0.18)', icon: '⚠️' },
      medium: { label: 'Medium', color: '#1CB0F6', bg: 'rgba(28,176,246,0.18)', icon: 'ℹ️' },
      low: { label: 'Low', color: '#10b981', bg: 'rgba(16,185,129,0.18)', icon: '✅' },
    };
    const severity = severityPalette[log.severity] || severityPalette.low;

    const infoCards = [
      { icon: '👤', label: 'Người dùng', value: `${log.user} (${log.userId})` },
      { icon: '🎭', label: 'Vai trò', value: log.role },
      { icon: '🏷️', label: 'Danh mục', value: log.category },
      { icon: '📝', label: 'Mô tả', value: log.description },
      { icon: '🌐', label: 'Địa chỉ IP', value: log.ip },
      { icon: '💻', label: 'Thiết bị', value: log.device },
      { icon: '🕐', label: 'Thời gian', value: log.timestamp },
    ]
      .map(
        card => `
        <div style="
          border-radius: 16px;
          padding: 1rem 1.25rem;
          background: rgba(148, 163, 184, 0.08);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(148, 163, 184, 0.15);
        ">
          <div style="font-size:0.8rem;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.04em;display:flex;align-items:center;gap:0.5rem;">
            <span>${card.icon}</span>${card.label}
          </div>
          <div style="margin-top:0.45rem;font-size:0.95rem;color:#0f172a;font-weight:600;line-height:1.45;">
            ${card.value}
          </div>
        </div>`
      )
      .join('');

    Swal.fire({
      html: `
        <div style="display:flex;flex-direction:column;gap:1.5rem;">
          <div style="
            border-radius: 20px;
            padding: 1.5rem;
            background: linear-gradient(135deg, rgba(88,204,2,0.12) 0%, rgba(28,176,246,0.12) 100%);
            border: 1px solid rgba(88,204,2,0.25);
            display:flex;
            justify-content:space-between;
            align-items:flex-start;
            gap:1rem;
          ">
            <div style="display:flex;flex-direction:column;gap:0.4rem;">
              <span style="font-size:1.6rem;">🔐</span>
              <h2 style="margin:0;font-size:1.3rem;font-weight:700;color:#0f172a;">${log.action}</h2>
              <p style="margin:0;font-size:0.95rem;color:#475569;line-height:1.5;">${log.description}</p>
            </div>
            <span style="
              padding:0.45rem 0.9rem;
              border-radius:999px;
              font-size:0.75rem;
              font-weight:700;
              background:${severity.bg};
              color:${severity.color};
              text-transform:uppercase;
              letter-spacing:0.06em;
              display:inline-flex;
              align-items:center;
              gap:0.4rem;
              white-space:nowrap;
            ">
              ${severity.icon} ${severity.label}
            </span>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;">
            ${infoCards}
          </div>
        </div>
      `,
      showCloseButton: true,
      focusConfirm: false,
      confirmButtonText: 'Đóng',
      confirmButtonColor: severity.color,
      width: 720,
      background: '#f8fafc',
      color: '#0f172a',
      backdrop: `
        rgba(15,23,42,0.45)
        left top
        no-repeat
      `,
      customClass: {
        popup: 'swal2-rounded',
        confirmButton: 'swal2-confirm-pill',
      },
    });
  };

  const handleFlagLog = (log) => {
    Swal.fire({
      title: 'Đánh dấu cảnh báo?',
      text: `Bạn muốn đánh dấu log này là đáng ngờ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Đánh dấu',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        showToast('success', 'Đã đánh dấu!', `Log #${log.id} đã được đánh dấu để xem xét`);
      }
    });
  };

  const handleExport = () => {
    Swal.fire({
      title: 'Xuất báo cáo Audit Log',
      html: `
        <div style="text-align: left; padding: 1rem;">
          <p><strong>📊 Tổng số log:</strong> ${displayedLogs.length}</p>
          <p><strong>📅 Khoảng thời gian:</strong> ${dateFilter || 'Tất cả'}</p>
          <p><strong>🏷️ Danh mục:</strong> ${categoryFilter === 'all' ? 'Tất cả' : categoryFilter}</p>
          <p style="margin-top: 1rem;">Chọn định dạng xuất:</p>
        </div>
      `,
      icon: 'question',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: '📄 CSV',
      denyButtonText: '📊 Excel',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#58CC02',
      denyButtonColor: '#1CB0F6',
      cancelButtonColor: '#6b7280',
    }).then((result) => {
      if (result.isConfirmed) {
        showToast('success', 'Đang xuất!', 'Đang tạo file CSV...');
      } else if (result.isDenied) {
        showToast('success', 'Đang xuất!', 'Đang tạo file Excel...');
      }
    });
  };

  return (
    <PageWrapper theme={theme}>
      <Toast toast={toast} onClose={hideToast} />

      {/* Header */}
      <Header theme={theme}>
        <HeaderContent>
          <Logo onClick={() => navigate('/admin')}>
            <span>🦉</span>
            <span>EnglishMaster Admin</span>
          </Logo>
          <HeaderActions>
            <AdminBadge>
              <span>👑</span>
              Admin Panel
            </AdminBadge>
            <ThemeToggle theme={theme} onClick={toggleTheme}>
              {theme === 'light' ? '🌙' : '☀️'}
            </ThemeToggle>
            <BackButton theme={theme} onClick={() => navigate('/admin')}>
              <span>←</span>
              Quay lại
            </BackButton>
          </HeaderActions>
        </HeaderContent>
      </Header>

      <DashboardContainer>
        {/* Page Header */}
        <PageTitle theme={theme}>
          <span>🔐</span>
          Audit Log - Lịch sử hệ thống
        </PageTitle>
        <PageSubtitle theme={theme}>
          Theo dõi và quản lý toàn bộ hoạt động của hệ thống
        </PageSubtitle>

        {/* Stats */}
        <StatsGrid>
          <StatCard theme={theme} color="#58CC02" delay="0.1s">
            <StatIcon color="#58CC02">📊</StatIcon>
            <StatValue theme={theme}>{stats.total}</StatValue>
            <StatLabel theme={theme}>Tổng logs</StatLabel>
          </StatCard>

          <StatCard theme={theme} color="#1CB0F6" delay="0.2s">
            <StatIcon color="#1CB0F6">📅</StatIcon>
            <StatValue theme={theme}>{stats.today}</StatValue>
            <StatLabel theme={theme}>Hôm nay</StatLabel>
          </StatCard>

          <StatCard theme={theme} color="#ef4444" delay="0.3s">
            <StatIcon color="#ef4444">🚨</StatIcon>
            <StatValue theme={theme}>{stats.critical}</StatValue>
            <StatLabel theme={theme}>Critical</StatLabel>
          </StatCard>

          <StatCard theme={theme} color="#f59e0b" delay="0.4s">
            <StatIcon color="#f59e0b">🔒</StatIcon>
            <StatValue theme={theme}>{stats.security}</StatValue>
            <StatLabel theme={theme}>Security</StatLabel>
          </StatCard>

          <StatCard theme={theme} color="#6b7280" delay="0.5s">
            <StatIcon color="#6b7280">❌</StatIcon>
            <StatValue theme={theme}>{stats.failed}</StatValue>
            <StatLabel theme={theme}>Thất bại</StatLabel>
          </StatCard>
        </StatsGrid>

        {/* Filters */}
        <FilterSection theme={theme}>
          <FilterGrid>
            <FilterGroup>
              <FilterLabel theme={theme}>Tìm kiếm</FilterLabel>
              <SearchWrapper>
                <SearchIcon theme={theme}>🔍</SearchIcon>
                <SearchInput
                  theme={theme}
                  placeholder="Tìm theo user, action, IP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </SearchWrapper>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel theme={theme}>Danh mục</FilterLabel>
              <FilterSelect
                theme={theme}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="authentication">🔐 Authentication</option>
                <option value="profile">👤 Profile</option>
                <option value="learning">📚 Learning</option>
                <option value="admin">⚙️ Admin</option>
                <option value="security">🔒 Security</option>
                <option value="system">🤖 System</option>
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel theme={theme}>Mức độ</FilterLabel>
              <FilterSelect
                theme={theme}
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="critical">🚨 Critical</option>
                <option value="high">⚠️ High</option>
                <option value="medium">ℹ️ Medium</option>
                <option value="low">✅ Low</option>
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel theme={theme}>Ngày</FilterLabel>
              <DateInput
                theme={theme}
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel theme={theme}>&nbsp;</FilterLabel>
              <ExportButton onClick={handleExport}>
                <span>📥</span>
                Xuất báo cáo
              </ExportButton>
            </FilterGroup>
          </FilterGrid>
        </FilterSection>

        {/* Table */}
        <TableSection theme={theme}>
          <TableWrapper theme={theme}>
            <Table>
              <TableHead theme={theme}>
                <TableRow>
                  <TableHeader theme={theme}>Người dùng</TableHeader>
                  <TableHeader theme={theme}>Hành động</TableHeader>
                  <TableHeader theme={theme}>Danh mục</TableHeader>
                  <TableHeader theme={theme}>Mô tả</TableHeader>
                  <TableHeader theme={theme}>IP / Thiết bị</TableHeader>
                  <TableHeader theme={theme}>Thời gian</TableHeader>
                  <TableHeader theme={theme}>Mức độ</TableHeader>
                  <TableHeader theme={theme}>Hành động</TableHeader>
                </TableRow>
              </TableHead>
              <tbody>
                {paginatedLogs.map(log => (
                  <TableRow key={log.id} theme={theme}>
                    <TableCell>
                      <UserCell>
                        <UserAvatar color={log.color}>
                          {log.avatar}
                        </UserAvatar>
                        <UserInfo>
                          <UserName theme={theme}>{log.user}</UserName>
                          <UserRole theme={theme}>{log.role}</UserRole>
                        </UserInfo>
                      </UserCell>
                    </TableCell>
                    <TableCell>
                      <ActionBadge color="#58CC02">{log.action}</ActionBadge>
                    </TableCell>
                    <TableCell>
                      <CategoryBadge category={log.category}>
                        {log.category}
                      </CategoryBadge>
                    </TableCell>
                    <TableCell>{log.description}</TableCell>
                    <TableCell>
                      <div>{log.ip}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                        {log.device}
                      </div>
                    </TableCell>
                    <TableCell>{log.timestamp}</TableCell>
                    <TableCell>
                      <SeverityBadge severity={log.severity}>
                        {log.severity}
                      </SeverityBadge>
                    </TableCell>
                    <TableCell>
                      <ActionButtons>
                        <ActionButton
                          variant="view"
                          onClick={() => handleViewDetail(log)}
                          title="Xem chi tiết"
                        >
                          👁️
                        </ActionButton>
                        <ActionButton
                          variant="flag"
                          onClick={() => handleFlagLog(log)}
                          title="Đánh dấu cảnh báo"
                        >
                          🚩
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
              Hiển thị {startIndex + 1} - {Math.min(startIndex + itemsPerPage, displayedLogs.length)} trong tổng số {displayedLogs.length} logs
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
      </DashboardContainer>
    </PageWrapper>
  );
};

export default AdminAuditLog;