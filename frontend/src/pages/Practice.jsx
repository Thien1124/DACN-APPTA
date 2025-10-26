import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import LeftSidebar from '../components/LeftSidebar';
import {
  Quiz,
  School,
  Timer,
  Grading,
  Extension,
  Psychology
} from '@mui/icons-material';

const PageWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%)'
    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e0 100%)'
  };
`;

const MainContent = styled.div`
  flex: 1;
  margin-left: 280px;
  padding: 2rem;
  min-width: 0;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const PageSubtitle = styled.p`
  font-size: 1.125rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-bottom: 3rem;
`;

const TestTypesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const TestTypeCard = styled.div`
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
  animation: slideUp 0.6s ease;
  animation-fill-mode: both;
  animation-delay: ${props => props.delay || '0s'};

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px ${props => props.color}22;
  }
`;

const TypeIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: ${props => props.color}22;
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
`;

const TypeTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.75rem;
`;

const TypeDescription = styled.p`
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#d1d5db' : '#6b7280'};
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const TypeStats = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: auto;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const StatValue = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: ${props => props.color};
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
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
  opacity: ${props => props.disabled ? 0.6 : 1};
  pointer-events: ${props => props.disabled ? 'none' : 'auto'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(88, 204, 2, 0.4);
  }
`;

const Practice = () => {
  const navigate = useNavigate();
  const [theme] = useState('light');
  const [selectedType, setSelectedType] = useState(null);

  const testTypes = [
    {
      id: 'quick',
      title: 'Kiểm tra nhanh',
      icon: <Timer />,
      color: '#1CB0F6',
      description: 'Bài kiểm tra ngắn 10-15 phút để ôn tập kiến thức',
      stats: { time: '15 phút', questions: '20 câu' }
    },
    {
      id: 'topic',
      title: 'Kiểm tra chuyên đề',
      icon: <School />,
      color: '#58CC02',
      description: 'Tập trung vào một chủ đề cụ thể để nâng cao kỹ năng',
      stats: { time: '30 phút', questions: '30 câu' }
    },
    {
      id: 'mock',
      title: 'Thi thử',
      icon: <Quiz />,
      color: '#f59e0b',
      description: 'Mô phỏng bài thi thật với thời gian và độ khó tương đương',
      stats: { time: '45 phút', questions: '50 câu' }
    },
    {
      id: 'adaptive',
      title: 'Kiểm tra thích ứng',
      icon: <Psychology />,
      color: '#8b5cf6',
      description: 'Độ khó thay đổi theo khả năng của bạn',
      stats: { time: '30 phút', level: 'Tự động' }
    }
  ];

  const handleTypeSelect = (typeId) => {
    setSelectedType(typeId);
  };

  const handleStart = () => {
    navigate(`/practice/${selectedType}`);
  };

  return (
    <PageWrapper theme={theme}>
      <LeftSidebar />
      <MainContent>
        <PageTitle theme={theme}>
          <Grading /> Luyện tập kiểm tra
        </PageTitle>
        <PageSubtitle theme={theme}>
          Chọn loại bài kiểm tra phù hợp với mục tiêu học tập của bạn
        </PageSubtitle>

        <TestTypesGrid>
          {testTypes.map((type, index) => (
            <TestTypeCard
              key={type.id}
              theme={theme}
              color={type.color}
              selected={selectedType === type.id}
              onClick={() => handleTypeSelect(type.id)}
              delay={`${index * 0.1}s`}
            >
              <TypeIcon color={type.color}>{type.icon}</TypeIcon>
              <TypeTitle theme={theme}>{type.title}</TypeTitle>
              <TypeDescription theme={theme}>{type.description}</TypeDescription>
              <TypeStats>
                {Object.entries(type.stats).map(([key, value]) => (
                  <StatItem key={key}>
                    <StatValue color={type.color}>{value}</StatValue>
                    <StatLabel theme={theme}>
                      {key === 'time' ? 'Thời gian' : 
                       key === 'questions' ? 'Số câu' : 
                       'Độ khó'}
                    </StatLabel>
                  </StatItem>
                ))}
              </TypeStats>
            </TestTypeCard>
          ))}
        </TestTypesGrid>

        <StartButton 
          onClick={handleStart} 
          disabled={!selectedType}
        >
          <Extension /> Bắt đầu làm bài
        </StartButton>
      </MainContent>
    </PageWrapper>
  );
};

export default Practice;