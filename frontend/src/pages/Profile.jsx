import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Swal from 'sweetalert2';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import Avatar from '../components/Avatar';

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
  max-width: 1400px;
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
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const ProfileHeader = styled.div`
  background: ${props => props.theme === 'dark'
    ? 'rgba(31, 41, 55, 0.8)'
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 3rem;
  border: 1px solid ${props => props.theme === 'dark'
    ? 'rgba(75, 85, 99, 0.3)'
    : 'rgba(229, 231, 235, 0.5)'
  };
  margin-bottom: 2rem;
  animation: slideUp 0.6s ease;

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

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }
`;

const ProfileTop = styled.div`
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;


const ProfileInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const UserLevel = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-weight: bold;
  font-size: 1.125rem;
  margin-bottom: 1rem;
  box-shadow: 0 4px 12px rgba(88, 204, 2, 0.3);

  span:first-child {
    font-size: 1.5rem;
  }
`;

const UserBio = styled.p`
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#d1d5db' : '#6b7280'};
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const UserStats = styled.div`
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.color || (props.theme === 'dark' ? '#f9fafb' : '#1a1a1a')};
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-weight: 600;
`;

const EditProfileButton = styled.button`
  padding: 0.875rem 2rem;
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

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(28, 176, 246, 0.4);
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  overflow-x: auto;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #58CC02;
    border-radius: 2px;
  }
`;

const Tab = styled.button`
  padding: 1rem 1.5rem;
  border: none;
  background: none;
  color: ${props => {
    if (props.active) return '#58CC02';
    return props.theme === 'dark' ? '#9ca3af' : '#6b7280';
  }};
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 3px solid ${props => props.active ? '#58CC02' : 'transparent'};
  white-space: nowrap;

  &:hover {
    color: #58CC02;
  }
`;

const TabContent = styled.div`
  animation: fadeIn 0.5s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: ${props => props.theme === 'dark'
    ? 'rgba(31, 41, 55, 0.8)'
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid ${props => props.theme === 'dark'
    ? 'rgba(75, 85, 99, 0.3)'
    : 'rgba(229, 231, 235, 0.5)'
  };
`;

const CardTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  span:first-child {
    font-size: 1.75rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#e5e7eb' : '#374151'};
  margin-bottom: 0.5rem;
`;
const Input = styled.input`
  width: 100%;
  padding: 0.875rem;  /* ⬅️ Giảm padding từ 1rem xuống 0.875rem */
  border-radius: 12px;
  border: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 0.9375rem;  /* ⬅️ Giảm font size từ 1rem xuống 0.9375rem */
  transition: all 0.3s ease;
  box-sizing: border-box;  /* ⬅️ THÊM dòng này */

  &:focus {
    outline: none;
    border-color: #58CC02;
    box-shadow: 0 0 0 3px rgba(88, 204, 2, 0.1);
  }

  &::placeholder {
    color: ${props => props.theme === 'dark' ? '#6b7280' : '#9ca3af'};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.875rem;  /* ⬅️ Giảm padding */
  border-radius: 12px;
  border: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 0.9375rem;  /* ⬅️ Giảm font size */
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  transition: all 0.3s ease;
  box-sizing: border-box;  /* ⬅️ THÊM dòng này */

  &:focus {
    outline: none;
    border-color: #58CC02;
    box-shadow: 0 0 0 3px rgba(88, 204, 2, 0.1);
  }

  &::placeholder {
    color: ${props => props.theme === 'dark' ? '#6b7280' : '#9ca3af'};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.875rem;  /* ⬅️ Giảm padding */
  border-radius: 12px;
  border: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 0.9375rem;  /* ⬅️ Giảm font size */
  cursor: pointer;
  transition: all 0.3s ease;
  box-sizing: border-box;  /* ⬅️ THÊM dòng này */

  &:focus {
    outline: none;
    border-color: #58CC02;
    box-shadow: 0 0 0 3px rgba(88, 204, 2, 0.1);
  }
`;
const SaveButton = styled.button`
  width: 100%;
  padding: 1rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
  color: white;
  border: none;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(88, 204, 2, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(88, 204, 2, 0.4);
  }
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-radius: 12px;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#f9fafb'};
  margin-bottom: 1rem;
`;

const SettingInfo = styled.div`
  flex: 1;
`;

const SettingTitle = styled.div`
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  span:first-child {
    font-size: 1.25rem;
  }
`;

const SettingDescription = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
  cursor: pointer;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background: #58CC02;
  }

  &:checked + span:before {
    transform: translateX(26px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.theme === 'dark' ? '#374151' : '#cbd5e0'};
  border-radius: 34px;
  transition: 0.3s;

  &:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background: white;
    border-radius: 50%;
    transition: 0.3s;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
`;

const BadgesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
`;

const BadgeCard = styled.div`
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#f9fafb'};
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid ${props => {
    if (props.unlocked) return props.color || '#58CC02';
    return props.theme === 'dark' ? '#374151' : '#e5e7eb';
  }};
  opacity: ${props => props.unlocked ? '1' : '0.5'};

  &:hover {
    transform: ${props => props.unlocked ? 'translateY(-5px)' : 'none'};
  }
`;

const BadgeIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 0.5rem;
  filter: ${props => props.unlocked ? 'none' : 'grayscale(100%)'};
`;

const BadgeName = styled.div`
  font-weight: bold;
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ActivityItem = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#f9fafb'};
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(5px);
  }
`;

const ActivityIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: ${props => props.color || '#58CC02'}22;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.25rem;
`;

const ActivityTime = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const DangerZone = styled.div`
  margin-top: 2rem;
  padding: 2rem;
  border: 2px solid #ef4444;
  border-radius: 16px;
  background: rgba(239, 68, 68, 0.05);
`;

const DangerTitle = styled.h4`
  font-size: 1.25rem;
  font-weight: bold;
  color: #ef4444;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  span:first-child {
    font-size: 1.5rem;
  }
`;

const DangerButton = styled.button`
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  background: #ef4444;
  color: white;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 1rem;

  &:hover {
    background: #dc2626;
    transform: translateY(-2px);
  }
`;

const LogoutButton = styled.button`
  width: 100%;
  padding: 1rem;
  border-radius: 12px;
  background: ${props => props.theme === 'dark' ? '#374151' : '#f3f4f6'};
  color: ${props => props.theme === 'dark' ? '#e5e7eb' : '#374151'};
  border: 2px solid ${props => props.theme === 'dark' ? '#4B5563' : '#e5e7eb'};
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: #ef4444;
    color: white;
    border-color: #ef4444;
  }
`;

// ========== COMPONENT ==========

const Profile = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');
  const [activeTab, setActiveTab] = useState('overview');
  const { toast, showToast, hideToast } = useToast();
  const [profileData, setProfileData] = useState({
    name: 'Vinh Son',
    username: 'vinhsonvlog',
    email: 'vinhson@example.com',
    bio: 'Passionate about learning English and exploring new cultures. Currently at B2 level and aiming for C1!',
    location: 'Vietnam',
    joinDate: 'January 2025',
    level: 12,
    xp: 2850,
    streak: 7,
    lessonsCompleted: 28,
  });

  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    soundEffects: true,
    darkMode: false,
    publicProfile: true,
  });

  const badges = [
    { icon: '🏆', name: 'First Steps', color: '#FFD700', unlocked: true },
    { icon: '🔥', name: '7 Day Streak', color: '#FF6B00', unlocked: true },
    { icon: '⭐', name: 'Star Student', color: '#58CC02', unlocked: true },
    { icon: '🎯', name: 'Perfect Score', color: '#1CB0F6', unlocked: true },
    { icon: '📚', name: 'Bookworm', color: '#8b5cf6', unlocked: true },
    { icon: '💎', name: 'Diamond', color: '#3b82f6', unlocked: false },
    { icon: '👑', name: 'Master', color: '#f59e0b', unlocked: false },
    { icon: '🚀', name: 'Speed Demon', color: '#ef4444', unlocked: false },
  ];

  const recentActivities = [
    { icon: '📖', title: 'Completed Unit 3: Numbers', time: '2 hours ago', color: '#58CC02' },
    { icon: '🎯', title: 'Earned 50 XP', time: '5 hours ago', color: '#1CB0F6' },
    { icon: '🔥', title: 'Maintained 7-day streak', time: 'Today', color: '#FF9600' },
    { icon: '🏆', title: 'Unlocked "Star Student" badge', time: 'Yesterday', color: '#FFD700' },
    { icon: '💪', title: 'Practiced 30 minutes', time: '2 days ago', color: '#8b5cf6' },
  ];

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleSettingToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveProfile = () => {
    showToast('success', 'Thành công!', 'Profile đã được cập nhật ✅');
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Đăng xuất?',
      text: 'Bạn có chắc muốn đăng xuất khỏi tài khoản?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#58CC02',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '✓ Đăng xuất',
      cancelButtonText: '✕ Hủy',
      background: theme === 'dark' ? '#1f2937' : '#ffffff',
      color: theme === 'dark' ? '#f9fafb' : '#1a1a1a',
      iconColor: '#58CC02',
      customClass: {
        popup: 'swal-custom-popup',
        title: 'swal-custom-title',
        htmlContainer: 'swal-custom-text',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        // Hiển thị loading
        Swal.fire({
          title: 'Đang đăng xuất...',
          text: 'Vui lòng đợi',
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          background: theme === 'dark' ? '#1f2937' : '#ffffff',
          color: theme === 'dark' ? '#f9fafb' : '#1a1a1a',
          didOpen: () => {
            Swal.showLoading();
          }
        });

        // Simulate logout
        setTimeout(() => {
          Swal.close();
          showToast('success', 'Đã đăng xuất!', 'Hẹn gặp lại bạn soon!');
          setTimeout(() => {
            navigate('/');
          }, 1000);
        }, 1000);
      }
    });
  };

  // ⬇️ Cập nhật handleDeleteAccount với SweetAlert2
  const handleDeleteAccount = () => {
    Swal.fire({
      title: '⚠️ Cảnh báo!',
      html: `
        <p style="font-size: 1.1rem; margin-bottom: 1rem;">
          Bạn có chắc muốn <strong style="color: #ef4444;">xóa vĩnh viễn</strong> tài khoản?
        </p>
        <p style="font-size: 0.9rem; color: #6b7280;">
          Hành động này <strong>KHÔNG THỂ hoàn tác</strong>!<br/>
          Tất cả dữ liệu của bạn sẽ bị xóa.
        </p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '🗑️ Xóa tài khoản',
      cancelButtonText: '✕ Hủy',
      background: theme === 'dark' ? '#1f2937' : '#ffffff',
      color: theme === 'dark' ? '#f9fafb' : '#1a1a1a',
      iconColor: '#ef4444',
      input: 'text',
      inputLabel: 'Nhập "DELETE" để xác nhận',
      inputPlaceholder: 'DELETE',
      inputAttributes: {
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      inputValidator: (value) => {
        if (value !== 'DELETE') {
          return 'Vui lòng nhập chính xác "DELETE"!';
        }
      },
      customClass: {
        popup: 'swal-custom-popup',
        title: 'swal-custom-title',
        htmlContainer: 'swal-custom-text',
        input: 'swal-custom-input',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        // Hiển thị loading
        Swal.fire({
          title: 'Đang xóa tài khoản...',
          text: 'Vui lòng đợi',
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          background: theme === 'dark' ? '#1f2937' : '#ffffff',
          color: theme === 'dark' ? '#f9fafb' : '#1a1a1a',
          didOpen: () => {
            Swal.showLoading();
          }
        });

        // Simulate deletion
        setTimeout(() => {
          Swal.close();
          showToast('success', 'Đã xóa tài khoản', 'Email xác nhận đã được gửi');
          setTimeout(() => {
            navigate('/');
          }, 2000);
        }, 2000);
      }
    });
  };

  return (
    <PageWrapper theme={theme}>
      <Toast toast={toast} onClose={hideToast} />

      {/* Header */}
      <Header theme={theme}>
        <HeaderContent>
          <Logo onClick={() => navigate('/dashboard')}>
            <span>🦉</span>
            <span>EnglishMaster</span>
          </Logo>
          <HeaderActions>
            <ThemeToggle theme={theme} onClick={toggleTheme}>
              {theme === 'light' ? '🌙' : '☀️'}
            </ThemeToggle>
            <BackButton theme={theme} onClick={() => navigate('/dashboard')}>
              <span>←</span>
              Quay lại
            </BackButton>
          </HeaderActions>
        </HeaderContent>
      </Header>

      <DashboardContainer>
        {/* Profile Header */}
        <ProfileHeader theme={theme}>
          <ProfileTop>
            <Avatar
              size={150}
              name={profileData.name}
              username={profileData.username}

              badgePosition="top-right"

              statusRing={true}
              statusColor="#58CC02"
              theme={theme}
              clickable={true}
              onClick={() => showToast('info', 'Thông báo', 'Tính năng đổi avatar đang phát triển!')}
            />
            <ProfileInfo>
              <UserName theme={theme}>{profileData.name}</UserName>
              <UserLevel>
                <span>🎓</span>
                Level {profileData.level}
              </UserLevel>
              <UserBio theme={theme}>{profileData.bio}</UserBio>
              <UserStats>
                <StatItem>
                  <StatValue theme={theme} color="#58CC02">{profileData.xp}</StatValue>
                  <StatLabel theme={theme}>Total XP</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue theme={theme} color="#FF9600">{profileData.streak}</StatValue>
                  <StatLabel theme={theme}>Day Streak</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue theme={theme} color="#1CB0F6">{profileData.lessonsCompleted}</StatValue>
                  <StatLabel theme={theme}>Lessons</StatLabel>
                </StatItem>
              </UserStats>
            </ProfileInfo>
            <EditProfileButton>
              <span>✏️</span>
              Edit Profile
            </EditProfileButton>
          </ProfileTop>
        </ProfileHeader>

        {/* Tabs */}
        <TabsContainer theme={theme}>
          <Tab
            theme={theme}
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </Tab>
          <Tab
            theme={theme}
            active={activeTab === 'edit'}
            onClick={() => setActiveTab('edit')}
          >
            ✏️ Edit Profile
          </Tab>
          <Tab
            theme={theme}
            active={activeTab === 'badges'}
            onClick={() => setActiveTab('badges')}
          >
            🏆 Badges
          </Tab>
          <Tab
            theme={theme}
            active={activeTab === 'activity'}
            onClick={() => setActiveTab('activity')}
          >
            📈 Activity
          </Tab>
          <Tab
            theme={theme}
            active={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Settings
          </Tab>
        </TabsContainer>

        {/* Tab Content */}
        <TabContent>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <ContentGrid>

              <Card theme={theme}>
                <CardTitle theme={theme}>
                  <span>📋</span>
                  Personal Information
                </CardTitle>
                <FormGroup>
                  <Label theme={theme}>Username</Label>
                  <Input theme={theme} value={profileData.username} disabled />
                </FormGroup>
                <FormGroup>
                  <Label theme={theme}>Email</Label>
                  <Input theme={theme} value={profileData.email} disabled />
                </FormGroup>
                <FormGroup>
                  <Label theme={theme}>Location</Label>
                  <Input theme={theme} value={profileData.location} disabled />
                </FormGroup>
                <FormGroup>
                  <Label theme={theme}>Member Since</Label>
                  <Input theme={theme} value={profileData.joinDate} disabled />
                </FormGroup>
              </Card>

              <Card theme={theme}>
                <CardTitle theme={theme}>
                  <span>🎯</span>
                  Learning Stats
                </CardTitle>
                <FormGroup>
                  <Label theme={theme}>Current Level</Label>
                  <Input theme={theme} value={`Level ${profileData.level}`} disabled />
                </FormGroup>
                <FormGroup>
                  <Label theme={theme}>Total Experience</Label>
                  <Input theme={theme} value={`${profileData.xp} XP`} disabled />
                </FormGroup>
                <FormGroup>
                  <Label theme={theme}>Lessons Completed</Label>
                  <Input theme={theme} value={profileData.lessonsCompleted} disabled />
                </FormGroup>
                <FormGroup>
                  <Label theme={theme}>Current Streak</Label>
                  <Input theme={theme} value={`${profileData.streak} days 🔥`} disabled />
                </FormGroup>
              </Card>
            </ContentGrid>
          )}

          {/* Edit Profile Tab */}
          {activeTab === 'edit' && (
            <ContentGrid>
              <Card theme={theme}>
                <CardTitle theme={theme}>
                  <span>✏️</span>
                  Edit Information
                </CardTitle>
                <FormGroup>
                  <Label theme={theme}>Full Name</Label>
                  <Input
                    theme={theme}
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    placeholder="Enter your name"
                  />
                </FormGroup>
                <FormGroup>
                  <Label theme={theme}>Email</Label>
                  <Input
                    theme={theme}
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    placeholder="Enter your email"
                  />
                </FormGroup>
                <FormGroup>
                  <Label theme={theme}>Location</Label>
                  <Select
                    theme={theme}
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                  >
                    <option value="Vietnam">Vietnam</option>
                    <option value="USA">USA</option>
                    <option value="UK">UK</option>
                    <option value="Japan">Japan</option>
                    <option value="Korea">Korea</option>
                  </Select>
                </FormGroup>
                <FormGroup>
                  <Label theme={theme}>Bio</Label>
                  <TextArea
                    theme={theme}
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                  />
                </FormGroup>
                <SaveButton onClick={handleSaveProfile}>
                  💾 Save Changes
                </SaveButton>
              </Card>

              <Card theme={theme}>
                <CardTitle theme={theme}>
                  <span>🔒</span>
                  Security
                </CardTitle>
                <FormGroup>
                  <Label theme={theme}>Current Password</Label>
                  <Input
                    theme={theme}
                    type="password"
                    placeholder="Enter current password"
                  />
                </FormGroup>
                <FormGroup>
                  <Label theme={theme}>New Password</Label>
                  <Input
                    theme={theme}
                    type="password"
                    placeholder="Enter new password"
                  />
                </FormGroup>
                <FormGroup>
                  <Label theme={theme}>Confirm New Password</Label>
                  <Input
                    theme={theme}
                    type="password"
                    placeholder="Confirm new password"
                  />
                </FormGroup>
                <SaveButton onClick={() => showToast('success', 'Thành công!', 'Mật khẩu đã được cập nhật ✅')}>
                  🔐 Update Password
                </SaveButton>
              </Card>
            </ContentGrid>
          )}

          {/* Badges Tab */}
          {activeTab === 'badges' && (
            <Card theme={theme}>
              <CardTitle theme={theme}>
                <span>🏆</span>
                Your Badges ({badges.filter(b => b.unlocked).length}/{badges.length})
              </CardTitle>
              <BadgesGrid>
                {badges.map((badge, index) => (
                  <BadgeCard
                    key={index}
                    theme={theme}
                    unlocked={badge.unlocked}
                    color={badge.color}
                  >
                    <BadgeIcon unlocked={badge.unlocked}>
                      {badge.icon}
                    </BadgeIcon>
                    <BadgeName theme={theme}>
                      {badge.name}
                    </BadgeName>
                  </BadgeCard>
                ))}
              </BadgesGrid>
            </Card>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <Card theme={theme}>
              <CardTitle theme={theme}>
                <span>📈</span>
                Recent Activity
              </CardTitle>
              <ActivityList>
                {recentActivities.map((activity, index) => (
                  <ActivityItem key={index} theme={theme}>
                    <ActivityIcon color={activity.color}>
                      {activity.icon}
                    </ActivityIcon>
                    <ActivityContent>
                      <ActivityTitle theme={theme}>
                        {activity.title}
                      </ActivityTitle>
                      <ActivityTime theme={theme}>
                        {activity.time}
                      </ActivityTime>
                    </ActivityContent>
                  </ActivityItem>
                ))}
              </ActivityList>
            </Card>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <>
              <Card theme={theme}>
                <CardTitle theme={theme}>
                  <span>⚙️</span>
                  Preferences
                </CardTitle>
                <SettingItem theme={theme}>
                  <SettingInfo>
                    <SettingTitle theme={theme}>
                      <span>🔔</span>
                      Push Notifications
                    </SettingTitle>
                    <SettingDescription theme={theme}>
                      Receive daily reminders and updates
                    </SettingDescription>
                  </SettingInfo>
                  <ToggleSwitch>
                    <ToggleInput
                      type="checkbox"
                      checked={settings.notifications}
                      onChange={() => handleSettingToggle('notifications')}
                    />
                    <ToggleSlider theme={theme} />
                  </ToggleSwitch>
                </SettingItem>

                <SettingItem theme={theme}>
                  <SettingInfo>
                    <SettingTitle theme={theme}>
                      <span>📧</span>
                      Email Updates
                    </SettingTitle>
                    <SettingDescription theme={theme}>
                      Get weekly progress reports via email
                    </SettingDescription>
                  </SettingInfo>
                  <ToggleSwitch>
                    <ToggleInput
                      type="checkbox"
                      checked={settings.emailUpdates}
                      onChange={() => handleSettingToggle('emailUpdates')}
                    />
                    <ToggleSlider theme={theme} />
                  </ToggleSwitch>
                </SettingItem>

                <SettingItem theme={theme}>
                  <SettingInfo>
                    <SettingTitle theme={theme}>
                      <span>🔊</span>
                      Sound Effects
                    </SettingTitle>
                    <SettingDescription theme={theme}>
                      Enable sounds for correct/incorrect answers
                    </SettingDescription>
                  </SettingInfo>
                  <ToggleSwitch>
                    <ToggleInput
                      type="checkbox"
                      checked={settings.soundEffects}
                      onChange={() => handleSettingToggle('soundEffects')}
                    />
                    <ToggleSlider theme={theme} />
                  </ToggleSwitch>
                </SettingItem>

                <SettingItem theme={theme}>
                  <SettingInfo>
                    <SettingTitle theme={theme}>
                      <span>👥</span>
                      Public Profile
                    </SettingTitle>
                    <SettingDescription theme={theme}>
                      Allow others to view your profile
                    </SettingDescription>
                  </SettingInfo>
                  <ToggleSwitch>
                    <ToggleInput
                      type="checkbox"
                      checked={settings.publicProfile}
                      onChange={() => handleSettingToggle('publicProfile')}
                    />
                    <ToggleSlider theme={theme} />
                  </ToggleSwitch>
                </SettingItem>

                <LogoutButton theme={theme} onClick={handleLogout}>
                  <span>🚪</span>
                  Logout
                </LogoutButton>
              </Card>

              <DangerZone>
                <DangerTitle>
                  <span>⚠️</span>
                  Danger Zone
                </DangerTitle>
                <SettingDescription theme={theme} style={{ marginBottom: '1rem' }}>
                  Once you delete your account, there is no going back. Please be certain.
                </SettingDescription>
                <DangerButton onClick={handleDeleteAccount}>
                  🗑️ Delete Account
                </DangerButton>
              </DangerZone>
            </>
          )}
        </TabContent>
      </DashboardContainer>
    </PageWrapper>
  );
};

export default Profile;