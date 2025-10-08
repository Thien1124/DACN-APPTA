import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

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
  margin-bottom: 3rem;
`;

const ModesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ModeCard = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 2rem;
  border: 2px solid ${props => {
    if (props.selected) return props.color || '#58CC02';
    return props.theme === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)';
  }};
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  animation: slideUp 0.6s ease;
  animation-delay: ${props => props.delay || '0s'};
  animation-fill-mode: both;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.15);
    border-color: ${props => props.color || '#58CC02'};
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
    width: 150px;
    height: 150px;
    background: ${props => props.color || '#58CC02'};
    opacity: 0.05;
    border-radius: 50%;
    transform: translate(30%, -30%);
  }
`;

const ModeIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: ${props => props.color || '#58CC02'}22;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
`;

const ModeTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.75rem;
`;

const ModeDescription = styled.p`
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#d1d5db' : '#6b7280'};
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const ModeStats = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const StatValue = styled.span`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.color || '#58CC02'};
`;

const StatLabel = styled.span`
  font-size: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-weight: 600;
  text-transform: uppercase;
`;

const SelectedBadge = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: ${props => props.color || '#58CC02'};
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 4px 12px ${props => props.color || '#58CC02'}66;
  animation: popIn 0.3s ease;

  @keyframes popIn {
    0% {
      transform: scale(0);
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
    }
  }
`;

const SettingsSection = styled.section`
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
  margin-bottom: 2rem;
  animation: slideUp 0.6s ease;
  animation-delay: 0.4s;
  animation-fill-mode: both;
`;

const SectionTitle = styled.h2`
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

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const SettingItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const SettingLabel = styled.label`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#e5e7eb' : '#374151'};
  display: flex;
  align-items: center;
  gap: 0.5rem;

  span:first-child {
    font-size: 1.25rem;
  }
`;

const Select = styled.select`
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

const Slider = styled.input`
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  outline: none;
  -webkit-appearance: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #58CC02;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(88, 204, 2, 0.4);
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.2);
    }
  }

  &::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #58CC02;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 8px rgba(88, 204, 2, 0.4);
  }
`;

const SliderValue = styled.span`
  display: inline-block;
  background: ${props => props.theme === 'dark' ? '#374151' : '#f3f4f6'};
  color: ${props => props.theme === 'dark' ? '#e5e7eb' : '#374151'};
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: bold;
  font-size: 0.875rem;
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

const StartButton = styled.button`
  width: 100%;
  max-width: 500px;
  margin: 2rem auto 0;
  padding: 1.5rem;
  border-radius: 16px;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 24px rgba(88, 204, 2, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  animation: slideUp 0.6s ease;
  animation-delay: 0.6s;
  animation-fill-mode: both;

  &:hover:not(:disabled) {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(88, 204, 2, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  span:first-child {
    font-size: 2rem;
  }
`;

const HistorySection = styled.section`
  margin-top: 3rem;
`;

const HistoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const HistoryCard = styled.div`
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

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  }
`;

const HistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const HistoryMode = styled.span`
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 1.125rem;
`;

const HistoryDate = styled.span`
  font-size: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const HistoryStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
`;

const HistoryStat = styled.div`
  text-align: center;
`;

const HistoryStatValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.color || '#58CC02'};
`;

const HistoryStatLabel = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-top: 0.25rem;
`;

// ========== COMPONENT ==========

const Practice = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');
  const [selectedMode, setSelectedMode] = useState('weak-words');
  const [settings, setSettings] = useState({
    difficulty: 'medium',
    questionCount: 10,
    timeLimit: 5,
    soundEnabled: true,
  });

  const practiceHistory = [
    {
      mode: 'Từ vựng yếu',
      date: '2 giờ trước',
      score: 85,
      questions: 20,
      time: '8:32',
    },
    {
      mode: 'Luyện tập có giờ',
      date: 'Hôm qua',
      score: 92,
      questions: 15,
      time: '6:15',
    },
    {
      mode: 'Ngữ pháp',
      date: '2 ngày trước',
      score: 78,
      questions: 25,
      time: '12:45',
    },
  ];

  const modes = [
    {
      id: 'weak-words',
      title: 'Từ vựng yếu',
      icon: '📖',
      color: '#ef4444',
      description: 'Luyện tập lại những từ bạn thường xuyên sai',
      stats: { words: 24, accuracy: '65%' },
    },
    {
      id: 'timed-practice',
      title: 'Luyện tập có giờ',
      icon: '⏱️',
      color: '#f59e0b',
      description: 'Thử thách với thời gian giới hạn',
      stats: { best: '15/15', time: '3:24' },
    },
    {
      id: 'grammar',
      title: 'Ngữ pháp',
      icon: '📝',
      color: '#8b5cf6',
      description: 'Ôn tập và củng cố ngữ pháp',
      stats: { lessons: 12, completed: '8/12' },
    },
    {
      id: 'speaking',
      title: 'Luyện nói',
      icon: '🎤',
      color: '#06b6d4',
      description: 'Cải thiện phát âm và khả năng nói',
      stats: { sessions: 45, avg: '4.2/5' },
    },
    {
      id: 'listening',
      title: 'Luyện nghe',
      icon: '🎧',
      color: '#10b981',
      description: 'Rèn luyện kỹ năng nghe hiểu',
      stats: { hours: 12, level: 'B2' },
    },
    {
      id: 'mixed',
      title: 'Tổng hợp',
      icon: '🎯',
      color: '#58CC02',
      description: 'Kết hợp tất cả các kỹ năng',
      stats: { total: 156, streak: '7 days' },
    },
  ];

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleModeSelect = (modeId) => {
    setSelectedMode(modeId);
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleStartPractice = () => {
    // Redirect to lesson with practice mode
    navigate(`/lesson/practice?mode=${selectedMode}`);
  };

  return (
    <PageWrapper theme={theme}>
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
        {/* Page Header */}
        <PageTitle theme={theme}>
          <span>💪</span>
          Luyện tập
        </PageTitle>
        <PageSubtitle theme={theme}>
          Chọn chế độ luyện tập phù hợp với mục tiêu của bạn
        </PageSubtitle>

        {/* Practice Modes */}
        <ModesGrid>
          {modes.map((mode, index) => (
            <ModeCard
              key={mode.id}
              theme={theme}
              color={mode.color}
              selected={selectedMode === mode.id}
              onClick={() => handleModeSelect(mode.id)}
              delay={`${index * 0.1}s`}
            >
              {selectedMode === mode.id && (
                <SelectedBadge color={mode.color}>✓</SelectedBadge>
              )}
              <ModeIcon color={mode.color}>{mode.icon}</ModeIcon>
              <ModeTitle theme={theme}>{mode.title}</ModeTitle>
              <ModeDescription theme={theme}>{mode.description}</ModeDescription>
              <ModeStats theme={theme}>
                {Object.entries(mode.stats).map(([key, value]) => (
                  <StatItem key={key}>
                    <StatValue color={mode.color}>{value}</StatValue>
                    <StatLabel theme={theme}>{key}</StatLabel>
                  </StatItem>
                ))}
              </ModeStats>
            </ModeCard>
          ))}
        </ModesGrid>

        {/* Settings */}
        <SettingsSection theme={theme}>
          <SectionTitle theme={theme}>
            <span>⚙️</span>
            Cài đặt
          </SectionTitle>
          <SettingsGrid>
            <SettingItem>
              <SettingLabel theme={theme}>
                <span>📊</span>
                Độ khó
              </SettingLabel>
              <Select
                theme={theme}
                value={settings.difficulty}
                onChange={(e) => handleSettingChange('difficulty', e.target.value)}
              >
                <option value="easy">Dễ</option>
                <option value="medium">Trung bình</option>
                <option value="hard">Khó</option>
                <option value="expert">Chuyên gia</option>
              </Select>
            </SettingItem>

            <SettingItem>
              <SettingLabel theme={theme}>
                <span>🔢</span>
                Số câu hỏi: <SliderValue theme={theme}>{settings.questionCount}</SliderValue>
              </SettingLabel>
              <Slider
                theme={theme}
                type="range"
                min="5"
                max="50"
                step="5"
                value={settings.questionCount}
                onChange={(e) => handleSettingChange('questionCount', parseInt(e.target.value))}
              />
            </SettingItem>

            <SettingItem>
              <SettingLabel theme={theme}>
                <span>⏱️</span>
                Giới hạn thời gian: <SliderValue theme={theme}>{settings.timeLimit} phút</SliderValue>
              </SettingLabel>
              <Slider
                theme={theme}
                type="range"
                min="1"
                max="30"
                value={settings.timeLimit}
                onChange={(e) => handleSettingChange('timeLimit', parseInt(e.target.value))}
              />
            </SettingItem>

            <SettingItem>
              <SettingLabel theme={theme}>
                <span>🔊</span>
                Âm thanh
              </SettingLabel>
              <ToggleSwitch>
                <ToggleInput
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                />
                <ToggleSlider theme={theme} />
              </ToggleSwitch>
            </SettingItem>
          </SettingsGrid>
        </SettingsSection>

        {/* Start Button */}
        <StartButton onClick={handleStartPractice} disabled={!selectedMode}>
          <span>🚀</span>
          Bắt đầu luyện tập
        </StartButton>

        {/* Practice History */}
        <HistorySection>
          <SectionTitle theme={theme}>
            <span>📈</span>
            Lịch sử luyện tập
          </SectionTitle>
          <HistoryGrid>
            {practiceHistory.map((session, index) => (
              <HistoryCard key={index} theme={theme}>
                <HistoryHeader>
                  <HistoryMode theme={theme}>{session.mode}</HistoryMode>
                  <HistoryDate theme={theme}>{session.date}</HistoryDate>
                </HistoryHeader>
                <HistoryStats theme={theme}>
                  <HistoryStat>
                    <HistoryStatValue color="#58CC02">{session.score}%</HistoryStatValue>
                    <HistoryStatLabel theme={theme}>Điểm</HistoryStatLabel>
                  </HistoryStat>
                  <HistoryStat>
                    <HistoryStatValue color="#1CB0F6">{session.questions}</HistoryStatValue>
                    <HistoryStatLabel theme={theme}>Câu hỏi</HistoryStatLabel>
                  </HistoryStat>
                  <HistoryStat>
                    <HistoryStatValue color="#f59e0b">{session.time}</HistoryStatValue>
                    <HistoryStatLabel theme={theme}>Thời gian</HistoryStatLabel>
                  </HistoryStat>
                </HistoryStats>
              </HistoryCard>
            ))}
          </HistoryGrid>
        </HistorySection>
      </DashboardContainer>
    </PageWrapper>
  );
};

export default Practice;