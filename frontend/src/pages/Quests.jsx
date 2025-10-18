import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';

// ========== STYLED COMPONENTS ==========

const PageWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
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

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #6b7280;

  @media (max-width: 768px) {
    font-size: 0.9375rem;
  }
`;

const MonthlyQuestCard = styled.div`
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  border-radius: 24px;
  padding: 2rem;
  color: white;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 200px;
    height: 200px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transform: translate(50%, -50%);
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const QuestBadge = styled.div`
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-transform: uppercase;
`;

const QuestTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const QuestTimer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  margin-bottom: 1.5rem;
  opacity: 0.9;
`;

const ProgressWrapper = styled.div`
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9375rem;
`;

const ProgressBar = styled.div`
  background: rgba(255, 255, 255, 0.3);
  height: 12px;
  border-radius: 100px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  background: white;
  height: 100%;
  width: ${props => props.progress}%;
  border-radius: 100px;
  transition: width 0.5s ease;
`;

const RewardSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const RewardIcon = styled.div`
  width: 64px;
  height: 64px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  flex-shrink: 0;
`;

const RewardText = styled.div`
  flex: 1;
`;

const RewardTitle = styled.div`
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
`;

const RewardDescription = styled.div`
  font-size: 0.875rem;
  opacity: 0.9;
`;

const QuestsSection = styled.div`
  background: white;
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`;

const QuestsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const QuestItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: ${props => props.completed ? '#f0fdf4' : '#f9fafb'};
  border: 2px solid ${props => props.completed ? '#10b981' : '#e5e7eb'};
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

const QuestIconWrapper = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: ${props => props.color || '#8b5cf6'};
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

const QuestInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const QuestName = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const QuestProgress = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
`;

const QuestProgressBar = styled.div`
  background: #e5e7eb;
  height: 8px;
  border-radius: 100px;
  overflow: hidden;
`;

const QuestProgressFill = styled.div`
  background: ${props => props.completed ? '#10b981' : '#8b5cf6'};
  height: 100%;
  width: ${props => props.progress}%;
  border-radius: 100px;
  transition: width 0.5s ease;
`;

const QuestReward = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: ${props => props.completed ? '#10b981' : '#fbbf24'};
  color: white;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;

  @media (max-width: 768px) {
    padding: 0.625rem 0.875rem;
    font-size: 0.9375rem;
  }
`;

// ========== DATA ==========

const monthlyQuestData = {
  title: 'Ngôi nhà ma ám của Lily',
  timeLeft: '14 NGÀY',
  current: 12,
  target: 35,
  reward: {
    icon: '👻',
    title: 'Huy hiệu bí mật của Lucy',
    description: 'Hoàn thành 35 nhiệm vụ để nhận'
  }
};

const dailyQuests = [
  {
    id: 1,
    icon: '⚡',
    name: 'Kiếm 10 KN',
    current: 0,
    target: 10,
    reward: 50,
    completed: false,
    color: '#fbbf24'
  },
  {
    id: 2,
    icon: '💎',
    name: 'Đạt 10 Điểm thưởng KN',
    current: 0,
    target: 10,
    reward: 50,
    completed: false,
    color: '#1CB0F6'
  },
  {
    id: 3,
    icon: '⏰',
    name: 'Học trong 10 phút',
    current: 0,
    target: 10,
    reward: 50,
    completed: false,
    color: '#8b5cf6'
  }
];

// ========== COMPONENT ==========

const Quests = () => {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [quests, setQuests] = useState(dailyQuests);
  const [monthlyProgress, setMonthlyProgress] = useState(monthlyQuestData);

  const handleQuestClick = (quest) => {
    if (quest.completed) {
      showToast('info', 'Đã hoàn thành', 'Nhiệm vụ này đã hoàn thành!');
    } else {
      showToast('info', 'Nhiệm vụ', `Hãy hoàn thành: ${quest.name}`);
      navigate('/learn');
    }
  };

  const progress = (monthlyProgress.current / monthlyProgress.target) * 100;

  return (
    <PageWrapper>
      <Toast toast={toast} onClose={hideToast} />
      <LeftSidebar />
      
      <MainContent>
        <Container>
          <Header>
            <Title>Nhiệm vụ hàng ngày</Title>
            <Subtitle>Hoàn thành nhiệm vụ để nhận phần thưởng!</Subtitle>
          </Header>

          {/* Monthly Quest */}
          <MonthlyQuestCard>
            <QuestBadge>THÁNG MƯỜI</QuestBadge>
            <QuestTitle>{monthlyProgress.title}</QuestTitle>
            <QuestTimer>
              <span>⏰</span>
              <span>{monthlyProgress.timeLeft}</span>
            </QuestTimer>
            
            <ProgressWrapper>
              <ProgressLabel>
                <span>Hoàn thành {monthlyProgress.current}/{monthlyProgress.target} nhiệm vụ</span>
                <span>{Math.round(progress)}%</span>
              </ProgressLabel>
              <ProgressBar>
                <ProgressFill progress={progress} />
              </ProgressBar>
            </ProgressWrapper>

            <RewardSection>
              <RewardIcon>{monthlyProgress.reward.icon}</RewardIcon>
              <RewardText>
                <RewardTitle>{monthlyProgress.reward.title}</RewardTitle>
                <RewardDescription>{monthlyProgress.reward.description}</RewardDescription>
              </RewardText>
            </RewardSection>
          </MonthlyQuestCard>

          {/* Daily Quests */}
          <QuestsSection>
            <SectionTitle>
              <span>🎯</span>
              Nhiệm vụ hàng ngày
            </SectionTitle>
            
            <QuestsList>
              {quests.map(quest => {
                const questProgress = (quest.current / quest.target) * 100;
                return (
                  <QuestItem 
                    key={quest.id} 
                    completed={quest.completed}
                    onClick={() => handleQuestClick(quest)}
                  >
                    <QuestIconWrapper color={quest.color}>
                      {quest.icon}
                    </QuestIconWrapper>
                    <QuestInfo>
                      <QuestName>{quest.name}</QuestName>
                      <QuestProgress>
                        {quest.current} / {quest.target}
                      </QuestProgress>
                      <QuestProgressBar>
                        <QuestProgressFill 
                          progress={questProgress} 
                          completed={quest.completed}
                        />
                      </QuestProgressBar>
                    </QuestInfo>
                    <QuestReward completed={quest.completed}>
                      {quest.completed ? '✓' : `+${quest.reward}`}
                      {!quest.completed && ' 💎'}
                    </QuestReward>
                  </QuestItem>
                );
              })}
            </QuestsList>
          </QuestsSection>
        </Container>
      </MainContent>

      <RightSidebar
        lessonsToUnlock={8}
        dailyGoal={{ current: 0, target: 10, label: 'Kiếm 10 KN' }}
        streak={1}
        showProfile={true}
      />
    </PageWrapper>
  );
};

export default Quests;