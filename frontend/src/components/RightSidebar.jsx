import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import streak from '../assets/streak.png';
import lock from '../assets/lock.png';
import missiontoday from '../assets/missiontoday.png';
import Swal from 'sweetalert2';
import { authService } from '../services/authService';

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

const StreakCount = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  color: #7c2d12;
  line-height: 1;
  margin-bottom: 0.25rem;
`;

const StreakDescription = styled.div`
  font-size: 0.875rem;
  color: #9a3412;
  font-weight: 600;
`;

const StreakHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`;
const StreakSection = styled.div`
  background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%);
  border: 2px solid #fb923c;
  border-radius: 16px;
  padding: 1.25rem;
  text-align: center;
`;
const StreakTitle = styled.div`
  font-size: 0.9375rem;
  font-weight: 700;
  color: #9a3412;
`;


const GoalIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
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

const EditButton = styled.button`
  background: none;
  border: none;
  color: #1CB0F6;
  font-size: 0.8125rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: #0d9ed8;
    transform: scale(1.05);
  }
`;

const GoalCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #f9fafb;
  padding: 1rem;
  border-radius: 12px;
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

const UnlockTitleIcon = styled.img`
  width: 24px;
  height: 24px;
  object-fit: contain;
`;

const UnlockItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: white;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
`;

const UnlockIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #1CB0F6 0%, #0891b2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(28, 176, 246, 0.3);
`;

const UnlockIconImage = styled.img`
  width: 28px;
  height: 28px;
  object-fit: contain;
  filter: brightness(0) invert(1);
`;

const UnlockText = styled.div`
  flex: 1;
  font-size: 0.9375rem;
  color: #4b5563;
  line-height: 1.5;
  font-weight: 600;
`;

const DailyGoalSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  border: 2px solid #e5e7eb;
  margin-bottom: 1.5rem;
  animation: ${fadeIn} 0.6s ease;
  animation-delay: 0.2s;
  animation-fill-mode: both;
`;

const DailyGoalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const DailyGoalTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DailyGoalIcon = styled.img`
  width: 24px;
  height: 24px;
  object-fit: contain;
`;

const ViewAllLink = styled.a`
  font-size: 0.8125rem;
  color: #1CB0F6;
  text-decoration: none;
  font-weight: 700;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;

  &:hover {
    text-decoration: underline;
    color: #0891b2;
  }
`;

const GoalProgress = styled.div`
  margin: 1rem 0;
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



const StreakCard = styled.div`
  background: linear-gradient(135deg, #FF9600 0%, #FF6B00 100%);
  border-radius: 16px;
  padding: 1.5rem;
  color: white;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 0 #CC5500;
  text-align: center;
  animation: ${fadeIn} 0.6s ease;
  animation-delay: 0.3s;
  animation-fill-mode: both;
`;

const StreakIconWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 0.5rem;
  animation: ${bounce} 2s ease infinite;
`;

const StreakIcon = styled.img`
  width: 64px;
  height: 64px;
  object-fit: contain;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2));
`;

const StreakNumber = styled.div`
  font-size: 3rem;
  font-weight: 800;
  margin: 0.5rem 0;
  animation: ${pulse} 2s ease infinite;
`;

const StreakText = styled.div`
  font-size: 1rem;
  font-weight: 700;
  opacity: 0.95;
  text-transform: uppercase;
  letter-spacing: 1px;
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

  ${props => props.primary ? `
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
  ` : `
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
  streak: streakCount = 1,
  showProfile = true
}) => {
  const navigate = useNavigate();

  // Kiểm tra xem người dùng đã đăng nhập chưa
  const isLoggedIn = authService.isAuthenticated();

  const progress = (dailyGoal.current / dailyGoal.target) * 100;
  const isCompleted = progress >= 100;

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

  const handleSettings = () => {
    navigate('/settings');
  };

  return (
    <SidebarContainer>
      {/* Unlock Leaderboard */}
      <UnlockSection>
        <UnlockTitle>
          <UnlockTitleIcon src={lock} alt="Lock" />
          Mở khóa Bảng xếp hạng!
        </UnlockTitle>
        <UnlockDescription>
          Hoàn thành {lessonsToUnlock} bài học nữa để thi đấu
        </UnlockDescription>
      </UnlockSection>

      {/* Daily Goal */}
      <GoalSection>
        <GoalHeader>
          <GoalTitle>Mục tiêu hàng ngày</GoalTitle>
          <EditButton onClick={handleSettings}>CHỈNH SỬA</EditButton>
        </GoalHeader>
        
        <GoalCard>
          <GoalIcon>
            {isCompleted ? '✓' : '🎯'}
          </GoalIcon>
          <GoalContent>
            <GoalLabel>{dailyGoal.label}</GoalLabel>
            <ProgressBar>
              <ProgressFill progress={progress} completed={isCompleted} />
            </ProgressBar>
            <ProgressText completed={isCompleted}>
              {dailyGoal.current}/{dailyGoal.target} KN
            </ProgressText>
          </GoalContent>
        </GoalCard>
      </GoalSection>

      {/* Streak Section */}
      <StreakSection>
        <StreakHeader>
          <StreakTitle>Chuỗi ngày streak</StreakTitle>
          <StreakIcon src={streak} alt="Streak" />
        </StreakHeader>
        <StreakCount>{streakCount}</StreakCount>
        <StreakDescription>ngày liên tiếp</StreakDescription>
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
            Đăng xuất
          </LogoutButton>
        </LogoutSection>
      )}

      {/* Footer Links */}
      <FooterLinks>
        <FooterLink onClick={() => navigate('/about')}>Giới thiệu</FooterLink>
        <FooterLink onClick={() => navigate('/shop')}>Cửa hàng</FooterLink>
        <FooterLink onClick={() => navigate('/effectiveness')}>Tính hiệu quả</FooterLink>
        <FooterLink onClick={() => navigate('/careers')}>Công việc</FooterLink>
        <FooterLink onClick={() => navigate('/investors')}>Nhà đầu tư</FooterLink>
        <FooterLink onClick={() => navigate('/terms')}>Điều khoản</FooterLink>
        <FooterLink onClick={() => navigate('/privacy')}>Bảo mật</FooterLink>
      </FooterLinks>
    </SidebarContainer>
  );
};

export default RightSidebar;