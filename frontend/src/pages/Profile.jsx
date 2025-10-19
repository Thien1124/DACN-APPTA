import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import { authService } from '../services/authService';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';

// ========== STYLED COMPONENTS ==========

const PageWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f7f7f7;
`;

const MainContent = styled.div`
  flex: 1;
  margin-left: 280px;
  margin-right: 380px;
  padding: 2rem;
  min-width: 0;

  @media (max-width: 1400px) {
    margin-right: 320px;
  }

  @media (max-width: 1200px) {
    margin-right: 0;
  }

  @media (max-width: 1024px) {
    margin-left: 240px;
  }

  @media (max-width: 768px) {
    margin-left: 0;
    padding: 1rem;
  }
`;

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

const ProfileHeader = styled.div`
  background: white;
  border-radius: 24px;
  padding: 2.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const UserAvatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1CB0F6 0%, #0d9ed8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(28, 176, 246, 0.3);

  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
    font-size: 2.5rem;
  }
`;

const UserDetails = styled.div`
  flex: 1;
`;

const UserName = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Username = styled.div`
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
`;

const JoinDate = styled.div`
  font-size: 0.9375rem;
  color: #6b7280;
`;

const FollowSection = styled.div`
  display: flex;
  gap: 2rem;
  padding-top: 1.5rem;
  border-top: 2px solid #e5e7eb;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const FollowItem = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;

  &:hover {
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    text-align: center;
  }
`;

const FollowCount = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1CB0F6;
  margin-bottom: 0.25rem;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const FollowLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const LanguageFlags = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const Flag = styled.div`
  font-size: 2rem;
`;

const Section = styled.div`
  background: white;
  border-radius: 24px;
  padding: 2.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const ViewAllButton = styled.button`
  background: none;
  border: none;
  color: #1CB0F6;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  text-transform: uppercase;
  transition: all 0.3s ease;

  &:hover {
    color: #0d9ed8;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: ${props => props.background || '#f9fafb'};
  border-radius: 16px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  @media (max-width: 768px) {
    padding: 1.25rem;
  }
`;

const StatIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: ${props => props.color || '#fbbf24'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 48px;
    height: 48px;
    font-size: 1.5rem;
  }
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const StatBadge = styled.div`
  padding: 0.25rem 0.75rem;
  background: ${props => props.background || '#ef4444'};
  color: white;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  flex-shrink: 0;
`;

const AchievementsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const AchievementItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 16px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  @media (max-width: 768px) {
    padding: 1.25rem;
  }
`;

const AchievementIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: ${props => props.color || 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  @media (max-width: 768px) {
    width: 56px;
    height: 56px;
    font-size: 1.75rem;
  }
`;

const AchievementInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const AchievementTitle = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const AchievementProgress = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
`;

const ProgressBar = styled.div`
  background: #e5e7eb;
  height: 8px;
  border-radius: 100px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  background: ${props => props.color || '#fbbf24'};
  height: 100%;
  width: ${props => props.progress}%;
  border-radius: 100px;
  transition: width 0.5s ease;
`;

const AchievementLevel = styled.div`
  padding: 0.5rem 1rem;
  background: ${props => props.background || '#fef3c7'};
  color: ${props => props.color || '#d97706'};
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  flex-shrink: 0;
  white-space: nowrap;

  @media (max-width: 768px) {
    padding: 0.375rem 0.75rem;
    font-size: 0.8125rem;
  }
`;

// ========== COMPONENT ==========

const Profile = () => {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [loading, setLoading] = useState(true);
  
  const [userData, setUserData] = useState({
    name: '',
    username: '',
    email: '',
    joinDate: '',
    following: 0,
    followers: 0,
    languages: ['🇺🇸']
  });

  // Fetch user profile from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authService.getProfile();
        if (response.success && response.data?.user) {
          const user = response.data.user;
          setUserData({
            name: user.name || 'User',
            username: user.username || user.name || 'user123',
            email: user.email || '',
            joinDate: user.createdAt 
              ? `Đã tham gia ${new Date(user.createdAt).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}`
              : 'Đã tham gia gần đây',
            following: user.following || 0,
            followers: user.followers || 0,
            languages: user.languages || ['🇺🇸']
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        showToast('error', 'Lỗi!', error.message || 'Không thể tải thông tin hồ sơ');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Mock stats (có thể thay bằng API call riêng sau này)
  const stats = [
    {
      icon: '🔥',
      value: '207',
      label: 'Ngày streak',
      color: '#fbbf24',
      background: '#fef3c7'
    },
    {
      icon: '⚡',
      value: '10883',
      label: 'Tổng điểm KN',
      color: '#1CB0F6',
      background: '#dbeafe'
    },
    {
      icon: '💎',
      value: 'Hồng Ngọc',
      label: 'Giải đấu hiện tại',
      badge: 'TUẦN 1',
      color: '#ef4444',
      background: '#fee2e2'
    },
    {
      icon: '🏆',
      value: '3',
      label: 'Số lần đạt top 3',
      color: '#8b5cf6',
      background: '#ede9fe'
    }
  ];

  const achievements = [
    {
      icon: '🔥',
      title: 'Lửa rừng',
      current: 207,
      target: 250,
      description: 'Đạt chuỗi 250 ngày streak',
      color: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
      progressColor: '#ff6b6b',
      level: 'CẤP 9',
      levelBg: '#fee2e2',
      levelColor: '#dc2626'
    },
    {
      icon: '🏆',
      title: 'Cao nhân',
      current: 10883,
      target: 12500,
      description: 'Đạt được 12500 KN',
      color: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
      progressColor: '#fbbf24',
      level: 'CẤP 9',
      levelBg: '#fef3c7',
      levelColor: '#d97706'
    },
    {
      icon: '🎯',
      title: 'Siêu trí tuệ',
      current: 367,
      target: 500,
      description: 'Hoàn thành 500 quiz trí tuệ',
      color: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
      progressColor: '#10b981',
      level: 'CẤP 8',
      levelBg: '#d1fae5',
      levelColor: '#059669'
    },
    {
      icon: '📚',
      title: 'Học già',
      current: 224,
      target: 250,
      description: 'Hoàn thành 250 bài học',
      color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      progressColor: '#f59e0b',
      level: 'CẤP 7',
      levelBg: '#fef3c7',
      levelColor: '#d97706'
    }
  ];

  const handleViewAll = (section) => {
    console.log(`View all ${section}`);
  };

  if (loading) {
    return (
      <PageWrapper>
        <LeftSidebar />
        <MainContent>
          <Container>
            <LoadingText>Đang tải hồ sơ...</LoadingText>
          </Container>
        </MainContent>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Toast toast={toast} onClose={hideToast} />
      <LeftSidebar />
      
      <MainContent>
        <Container>
          {/* Profile Header */}
          <ProfileHeader>
            <UserInfo>
              <UserAvatar>
                {userData.name.charAt(0).toUpperCase()}
              </UserAvatar>
              <UserDetails>
                <UserName>{userData.name}</UserName>
                <Username>{userData.username}</Username>
                <JoinDate>{userData.joinDate}</JoinDate>
                <LanguageFlags>
                  {userData.languages.map((flag, index) => (
                    <Flag key={index}>{flag}</Flag>
                  ))}
                </LanguageFlags>
              </UserDetails>
            </UserInfo>
            
            <FollowSection>
              <FollowItem onClick={() => handleViewAll('following')}>
                <FollowCount>{userData.following}</FollowCount>
                <FollowLabel>Đang theo dõi</FollowLabel>
              </FollowItem>
              <FollowItem onClick={() => handleViewAll('followers')}>
                <FollowCount>{userData.followers}</FollowCount>
                <FollowLabel>Người theo dõi</FollowLabel>
              </FollowItem>
            </FollowSection>
          </ProfileHeader>

          {/* Statistics */}
          <Section>
            <SectionTitle>Thống kê</SectionTitle>
            <StatsGrid>
              {stats.map((stat, index) => (
                <StatCard key={index} background={stat.background}>
                  <StatIcon color={stat.color}>{stat.icon}</StatIcon>
                  <StatInfo>
                    <StatValue>{stat.value}</StatValue>
                    <StatLabel>{stat.label}</StatLabel>
                  </StatInfo>
                  {stat.badge && (
                    <StatBadge background={stat.color}>
                      {stat.badge}
                    </StatBadge>
                  )}
                </StatCard>
              ))}
            </StatsGrid>
          </Section>

          {/* Achievements */}
          <Section>
            <SectionHeader>
              <SectionTitle>Thành tích</SectionTitle>
              <ViewAllButton onClick={() => handleViewAll('achievements')}>
                Xem tất cả
              </ViewAllButton>
            </SectionHeader>
            
            <AchievementsList>
              {achievements.map((achievement, index) => {
                const progress = (achievement.current / achievement.target) * 100;
                return (
                  <AchievementItem key={index}>
                    <AchievementIcon color={achievement.color}>
                      {achievement.icon}
                    </AchievementIcon>
                    <AchievementInfo>
                      <AchievementTitle>{achievement.title}</AchievementTitle>
                      <AchievementProgress>
                        {achievement.current}/{achievement.target}
                      </AchievementProgress>
                      <ProgressBar>
                        <ProgressFill 
                          progress={progress} 
                          color={achievement.progressColor}
                        />
                      </ProgressBar>
                    </AchievementInfo>
                    <AchievementLevel 
                      background={achievement.levelBg}
                      color={achievement.levelColor}
                    >
                      {achievement.level}
                    </AchievementLevel>
                  </AchievementItem>
                );
              })}
            </AchievementsList>
          </Section>
        </Container>
      </MainContent>

      <RightSidebar
        lessonsToUnlock={8}
        dailyGoal={{ current: 10, target: 10, label: 'Kiếm 10 KN' }}
        streak={207}
        showProfile={false}
      />
    </PageWrapper>
  );
};

export default Profile;

// Thêm styled component cho loading
const LoadingText = styled.div`
  font-size: 1.25rem;
  color: #6b7280;
  text-align: center;
  margin-top: 3rem;
`;