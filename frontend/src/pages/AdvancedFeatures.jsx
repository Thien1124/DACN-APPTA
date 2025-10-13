import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../components/Header';

const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${props => props.theme === 'dark'
    ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
    : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
  };
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
`;

const WelcomeCard = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 300px;
    height: 300px;
    background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
    opacity: 0.05;
    border-radius: 50%;
    transform: translate(30%, -30%);
  }
`;

const WelcomeTitle = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const WelcomeSubtitle = styled.p`
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-bottom: 1rem;
`;

const DateTime = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-weight: 600;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-8px);
    border-color: ${props => props.color || '#58CC02'};
    box-shadow: 0 12px 24px ${props => props.color || '#58CC02'}40;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 120px;
    height: 120px;
    background: ${props => props.color || '#58CC02'};
    opacity: 0.1;
    border-radius: 50%;
    transform: translate(30%, -30%);
  }
`;

const FeatureIcon = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 18px;
  background: ${props => props.color || '#58CC02'}22;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
`;

const FeatureTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.75rem;
  position: relative;
  z-index: 1;
`;

const FeatureDescription = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  line-height: 1.6;
  position: relative;
  z-index: 1;
`;

const features = [
  {
    id: 1,
    icon: '🎯',
    title: 'Tạo bộ Quiz Phụ',
    description: 'Tạo quiz phụ từ các thẻ hay sai để tập trung củng cố kiến thức yếu và cải thiện điểm số.',
    path: '/create-sub-quiz',
    color: '#ef4444',
  },
  {
    id: 2,
    icon: '🗺️',
    title: 'Tạo lộ trình theo mục tiêu',
    description: 'Tạo lộ trình học theo mục tiêu cụ thể (ví dụ: 650 TOEIC từ cốt lõi) để hướng dẫn học tập có kế hoạch.',
    path: '/learning-path',
    color: '#f59e0b',
  },
  {
    id: 3,
    icon: '🔍',
    title: 'Tìm kiếm theo từ khóa, thẻ (tag)',
    description: 'Tìm kiếm bộ thẻ bằng từ khóa hoặc tag liên quan, hệ thống sẽ hiển thị kết quả khớp để hỗ trợ học tập nhanh chóng.',
    path: '/search-decks',
    color: '#1CB0F6',
  },
  {
    id: 4,
    icon: '🗂️',
    title: 'Tạo/sao chép/hợp nhất tách deck',
    description: 'Tạo bộ thẻ mới, sao chép từ bộ khác, hợp nhất hoặc tách bộ thẻ để quản lý và tùy chỉnh nội dung học tập cá nhân.',
    path: '/manage-decks',
    color: '#8b5cf6',
  },
  {
    id: 5,
    icon: '🎴',
    title: 'Tạo thẻ với kiểu note',
    description: 'Tạo thẻ theo kiểu: từ đơn, cụm từ, câu ví dụ, hoặc cloze (điền khuyết) để đa dạng hóa cách học từ vựng và ngữ pháp.',
    path: '/create-card',
    color: '#58CC02',
  },
];

const AdvancedFeatures = () => {
  const navigate = useNavigate();
  const [theme] = useState('light');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateTime = () => {
    const year = currentTime.getUTCFullYear();
    const month = String(currentTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(currentTime.getUTCDate()).padStart(2, '0');
    const hours = String(currentTime.getUTCHours()).padStart(2, '0');
    const minutes = String(currentTime.getUTCMinutes()).padStart(2, '0');
    const seconds = String(currentTime.getUTCSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <PageWrapper theme={theme}>
      <Header theme={theme} userName="vinhsonvlog" />
      
      <Container>
        <WelcomeCard theme={theme}>
          <WelcomeTitle theme={theme}>
            <span>✨</span>
            Tính năng nâng cao
          </WelcomeTitle>
          <WelcomeSubtitle theme={theme}>
            Khám phá các công cụ mạnh mẽ để tối ưu hóa trải nghiệm học tập của bạn
          </WelcomeSubtitle>
          <DateTime theme={theme}>
            🕐 {formatDateTime()} UTC | 👤 vinhsonvlog
          </DateTime>
        </WelcomeCard>

        <FeaturesGrid>
          {features.map(feature => (
            <FeatureCard
              key={feature.id}
              theme={theme}
              color={feature.color}
              onClick={() => navigate(feature.path)}
            >
              <FeatureIcon color={feature.color}>{feature.icon}</FeatureIcon>
              <FeatureTitle theme={theme}>{feature.title}</FeatureTitle>
              <FeatureDescription theme={theme}>
                {feature.description}
              </FeatureDescription>
            </FeatureCard>
          ))}
        </FeaturesGrid>
      </Container>
    </PageWrapper>
  );
};

export default AdvancedFeatures;