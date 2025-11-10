import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { authService } from '../services/authService';
import { streakService } from '../services/streakService';
import Swal from 'sweetalert2';

// Import icons
import { FiTarget, FiLock, FiLogOut } from 'react-icons/fi'; 
import { BsFire, BsInfoCircle, BsLightningChargeFill } from 'react-icons/bs';
import { BiStore } from 'react-icons/bi';
import { MdWorkOutline, MdTrendingUp } from 'react-icons/md';
import { HiOutlineDocumentText, HiOutlineShieldCheck } from 'react-icons/hi';
import { IoCheckmarkDone } from 'react-icons/io5';

// ========== ANIMATIONS ==========
const fadeIn = keyframes`
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const shine = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

// ========== STYLED COMPONENTS ==========
const SidebarContainer = styled.div`
  width: 380px;
  position: fixed;
  right: 0;
  top: 0;
  height: 100vh;
  padding: 2rem 1.5rem;
  background: white;
  border-left: 2px solid #e5e7eb;
  overflow-y: auto;
  z-index: 100;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f3f4f6;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }

  @media (max-width: 1400px) {
    width: 320px;
  }

  @media (max-width: 1200px) {
    display: none;
  }
`;

const StreakSection = styled.div`
  background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%);
  border: 2px solid #fb923c;
  border-radius: 16px;
  padding: 1.25rem;
  text-align: center;
  margin-bottom: 1.5rem;
  position: relative;
  overflow: hidden;
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.6s ease;

  &:hover {
    transform: ${props => props.clickable ? 'translateY(-2px)' : 'none'};
    box-shadow: ${props => props.clickable ? '0 4px 12px rgba(251, 146, 60, 0.3)' : 'none'};
  }

  ${props => props.isLoading && css`
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.5) 50%,
        transparent 100%
      );
      animation: ${shimmer} 2s infinite;
      background-size: 200% 100%;
    }
  `}
`;

const StreakHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`;

const StreakTitle = styled.div`
  font-size: 0.9375rem;
  font-weight: 700;
  color: #9a3412;
`;

const StreakCount = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  color: #7c2d12;
  line-height: 1;
  margin-bottom: 0.25rem;
  animation: ${pulse} 2s ease infinite;
`;

const StreakDescription = styled.div`
  font-size: 0.875rem;
  color: #9a3412;
  font-weight: 600;
`;

const RefreshHint = styled.div`
  font-size: 0.75rem;
  color: #78350f;
  margin-top: 0.5rem;
  opacity: 0.8;
  font-weight: 500;
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #fed7aa;
  border-top-color: #7c2d12;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
  margin: 0 auto;
`;

const GoalIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.completed 
    ? 'linear-gradient(135deg, #58CC02 0%, #45a302 100%)'
    : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
  };
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
  color: white;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const GoalContent = styled.div`
  flex: 1;
`;

const GoalSection = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.25rem;
  border: 2px solid rgba(229, 231, 235, 0.5);
  margin-bottom: 1.5rem;
  animation: ${fadeIn} 0.6s ease;
`;

const GoalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const GoalTitle = styled.h3`
  font-size: 0.9375rem;
  font-weight: 700;
  color: #374151;
  margin: 0;
`;

const GoalCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #f9fafb;
  padding: 1rem;
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    background: #f3f4f6;
    transform: translateY(-2px);
  }
`;

const UnlockDescription = styled.p`
  font-size: 0.875rem;
  color: #78350f;
  margin: 0;
  line-height: 1.5;
`;

const UnlockSection = styled.div`
  background: linear-gradient(135deg, #DDF4FF 0%, #e0f2fe 100%);
  border-radius: 16px;
  padding: 1.5rem;
  border: 2px solid #84D8FF;
  margin-bottom: 1.5rem;
  animation: ${fadeIn} 0.6s ease;
`;

const UnlockTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const GoalLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;

  span {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 14px;
  background: #e5e7eb;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  margin-bottom: 0.5rem;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #FFD700 0%, #FFA500 100%);
  width: ${props => props.progress}%;
  transition: width 0.6s ease;
  border-radius: 20px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    background-size: 200% 100%;
    animation: ${shine} 2s infinite;
  }
`;

const ProgressText = styled.div`
  font-size: 0.75rem;
  color: ${props => props.completed ? '#58CC02' : '#9ca3af'};
  font-weight: 700;
  text-align: center;
`;

const ProfileSection = styled.div`
  background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
  border-radius: 16px;
  padding: 1.5rem;
  color: white;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 0 #46A302;
  animation: ${fadeIn} 0.6s ease;
  animation-delay: 0.4s;
  animation-fill-mode: both;
`;

const ProfileTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
`;

const ProfileText = styled.p`
  font-size: 0.9375rem;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
  opacity: 0.95;
`;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 1rem;
  border-radius: 12px;
  border: none;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  ${props => props.primary ? css`
    background: white;
    color: #58CC02;
    box-shadow: 0 4px 0 #e5e7eb;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 0 #e5e7eb;
    }

    &:active {
      transform: translateY(2px);
      box-shadow: 0 2px 0 #e5e7eb;
    }
  ` : css`
    background: transparent;
    color: white;
    border: 2px solid white;

    &:hover {
      background: rgba(255, 255, 255, 0.15);
    }
  `}
`;

const FooterLinks = styled.div`
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 2px solid #e5e7eb;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: #9ca3af;
`;

const FooterLink = styled.a`
  color: #9ca3af;
  text-decoration: none;
  cursor: pointer;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;

  &:hover {
    color: #1CB0F6;
    text-decoration: underline;
  }
`;

const LogoutSection = styled.div`
  margin-top: auto;
  padding: 1rem 0;
`;

const LogoutButton = styled.button`
  width: 100%;
  padding: 0.875rem;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(239, 68, 68, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

// ========== COMPONENT ==========
const RightSidebar = ({ 
  lessonsToUnlock = 8,
  dailyGoal = { current: 10, target: 10, label: 'Kiếm 10 KN' },
  streak: initialStreakCount = 0,
  showProfile = true
}) => {
  const navigate = useNavigate();
  
  // State for streak
  const [streakData, setStreakData] = useState({
    currentStreak: initialStreakCount,
    longestStreak: initialStreakCount,
    lastActivityDate: null
  });
  const [isLoadingStreak, setIsLoadingStreak] = useState(false);
  const [streakError, setStreakError] = useState(null);

  // Check authentication
  const isLoggedIn = authService.isAuthenticated();

  const progress = (dailyGoal.current / dailyGoal.target) * 100;
  const isCompleted = progress >= 100;

  // Load streak from API on component mount
  useEffect(() => {
    const loadStreak = async () => {
      if (!isLoggedIn) {
        setStreakData({
          currentStreak: initialStreakCount,
          longestStreak: initialStreakCount,
          lastActivityDate: null
        });
        return;
      }

      try {
        setIsLoadingStreak(true);
        setStreakError(null);
        const data = await streakService.getStreak();
        setStreakData({
          currentStreak: data.currentStreak || 0,
          longestStreak: data.longestStreak || 0,
          lastActivityDate: data.lastActivityDate
        });
      } catch (error) {
        console.error('Error loading streak:', error);
        setStreakError('Không thể tải streak');
        setStreakData({
          currentStreak: initialStreakCount,
          longestStreak: initialStreakCount,
          lastActivityDate: null
        });
      } finally {
        setIsLoadingStreak(false);
      }
    };

    loadStreak();
  }, [isLoggedIn, initialStreakCount]);

  // Refresh streak manually
  const handleRefreshStreak = async () => {
    if (!isLoggedIn || isLoadingStreak) return;

    try {
      setIsLoadingStreak(true);
      setStreakError(null);
      const data = await streakService.getStreak();
      setStreakData({
        currentStreak: data.currentStreak || 0,
        longestStreak: data.longestStreak || 0,
        lastActivityDate: data.lastActivityDate
      });
    } catch (error) {
      console.error('Error refreshing streak:', error);
      setStreakError('Không thể làm mới');
    } finally {
      setIsLoadingStreak(false);
    }
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Đăng xuất?',
      text: 'Bạn có chắc muốn đăng xuất?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Đăng xuất',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        await authService.logout();
        navigate('/login');
      } catch (error) {
        console.error('Logout failed:', error);
        navigate('/login');
      }
    }
  };

  return (
    <SidebarContainer>
      {/* Unlock Leaderboard */}
      <UnlockSection>
        <UnlockTitle>
          <FiLock size={24} />
          Mở khóa Bảng xếp hạng!
        </UnlockTitle>
        <UnlockDescription>
          Hoàn thành {lessonsToUnlock} bài học nữa để thi đấu
        </UnlockDescription>
      </UnlockSection>

      {/* Daily Goal - Icon tia sét đứng yên */}
      <GoalSection>
        <GoalHeader>
          <GoalTitle>Mục tiêu hàng ngày</GoalTitle>
        </GoalHeader>
        
        <GoalCard>
          <GoalIcon completed={isCompleted}>
            {isCompleted ? (
              <IoCheckmarkDone size={28} />
            ) : (
              <BsLightningChargeFill size={26} />
            )}
          </GoalIcon>
          <GoalContent>
            <GoalLabel>{dailyGoal.label}</GoalLabel>
            <ProgressBar>
              <ProgressFill progress={progress} />
            </ProgressBar>
            <ProgressText completed={isCompleted}>
              {dailyGoal.current}/{dailyGoal.target} KN
            </ProgressText>
          </GoalContent>
        </GoalCard>
      </GoalSection>

      {/* Streak Section - Using API */}
      <StreakSection 
        isLoading={isLoadingStreak}
        clickable={isLoggedIn}
        onClick={handleRefreshStreak}
        title={isLoggedIn ? "Click để làm mới" : ""}
      >
        <StreakHeader>
          <StreakTitle>Chuỗi ngày streak</StreakTitle>
          <BsFire size={24} color="#FF6B00" />
        </StreakHeader>
        
        {isLoadingStreak ? (
          <LoadingSpinner />
        ) : (
          <>
            <StreakCount>{streakData.currentStreak}</StreakCount>
            <StreakDescription>ngày liên tiếp</StreakDescription>
            {streakError && (
              <RefreshHint style={{ color: '#dc2626' }}>{streakError}</RefreshHint>
            )}
            {isLoggedIn && !streakError && (
              <RefreshHint>Click để làm mới</RefreshHint>
            )}
            {!isLoggedIn && (
              <RefreshHint>Đăng nhập để lưu streak</RefreshHint>
            )}
          </>
        )}
      </StreakSection>

      {/* Profile Section - Only show if not logged in */}
      {!isLoggedIn && showProfile && (
        <ProfileSection>
          <ProfileTitle>Tạo hồ sơ để lưu tiến độ!</ProfileTitle>
          <ProfileText>
            Đồng bộ tiến độ trên mọi thiết bị và không bao giờ mất dữ liệu học tập
          </ProfileText>
          <ActionButtons>
            <ActionButton primary onClick={() => navigate('/register')}>
              Tạo hồ sơ
            </ActionButton>
            <ActionButton onClick={() => navigate('/login')}>
              Đăng nhập
            </ActionButton>
          </ActionButtons>
        </ProfileSection>
      )}

      {/* Logout Button - Only show if logged in */}
      {isLoggedIn && (
        <LogoutSection>
          <LogoutButton onClick={handleLogout}>
            <FiLogOut size={20} />
            Đăng xuất
          </LogoutButton>
        </LogoutSection>
      )}

      {/* Footer Links */}
      <FooterLinks>
        <FooterLink onClick={() => navigate('/about')}>
          <BsInfoCircle size={14} style={{ marginRight: '4px' }} />
          Giới thiệu
        </FooterLink>
        <FooterLink onClick={() => navigate('/shop')}>
          <BiStore size={14} style={{ marginRight: '4px' }} />
          Cửa hàng
        </FooterLink>
        <FooterLink onClick={() => navigate('/effectiveness')}>
          <MdTrendingUp size={14} style={{ marginRight: '4px' }} />
          Tính hiệu quả
        </FooterLink>
        <FooterLink onClick={() => navigate('/careers')}>
          <MdWorkOutline size={14} style={{ marginRight: '4px' }} />
          Công việc
        </FooterLink>
        <FooterLink onClick={() => navigate('/investors')}>
          <MdWorkOutline size={14} style={{ marginRight: '4px' }} />
          Nhà đầu tư
        </FooterLink>
        <FooterLink onClick={() => navigate('/terms')}>
          <HiOutlineDocumentText size={14} style={{ marginRight: '4px' }} />
          Điều khoản
        </FooterLink>
        <FooterLink onClick={() => navigate('/privacy')}>
          <HiOutlineShieldCheck size={14} style={{ marginRight: '4px' }} />
          Bảo mật
        </FooterLink>
      </FooterLinks>
    </SidebarContainer>
  );
};

export default RightSidebar;