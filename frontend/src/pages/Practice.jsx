import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import {
  Quiz,
  School,
  Timer,
  Grading,
  Extension,
  Psychology,
  TrendingUp,
  EmojiEvents,
  Speed
} from '@mui/icons-material';

// ========== ANIMATIONS ==========
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// ========== STYLED COMPONENTS ==========
const PageWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #f0fbef 0%, #e6f8e3 40%, #dff4d6 100%);
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><g fill="%2358CC02" opacity="0.03"><circle cx="120" cy="80" r="120"/><circle cx="560" cy="160" r="100"/><circle cx="400" cy="420" r="140"/></g></svg>');
  background-repeat: no-repeat;
  background-position: right 10% top 10%;
  position: relative; /* Thêm dòng này */
`;

const MainContent = styled.main`
  flex: 1;
  padding: 7rem 2rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
  animation: ${fadeIn} 0.6s ease;
  
  /* Đảm bảo không bị che */
  position: relative;
  z-index: 1;

  /* Màn hình > 1400px */
  margin-left: 300px;  /* 280px + 20px spacing */
  margin-right: 400px; /* 380px + 20px spacing */

  @media (max-width: 1400px) {
    margin-left: 300px;
    margin-right: 340px;
  }

  @media (max-width: 1200px) {
    margin-left: 300px;
    margin-right: 2rem;
  }

  @media (max-width: 1024px) {
    padding: 6rem 1.5rem 1.5rem;
    margin-left: 260px;
    margin-right: 1.5rem;
  }

  @media (max-width: 768px) {
    padding: 5.5rem 1rem 1rem;
    margin-left: 1rem;
    margin-right: 1rem;
  }
`;

const ContentInner = styled.div`
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  animation: ${slideIn} 0.5s ease;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: #166a0b;
  margin: 0 0 0.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #5b6b5b;
  margin: 0;
`;

const StatsBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  text-align: center;
  animation: ${fadeIn} 0.6s ease;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(88, 204, 2, 0.15);
  }
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: #58cc02;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.95rem;
  color: #5b6b5b;
  font-weight: 600;
`;

const TestTypesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const TestTypeCard = styled.div`
  background: white;
  border-radius: 14px;
  padding: 1.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.6s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  border: 2px solid ${props => props.selected ? props.color : 'transparent'};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.color};
    transform: scaleX(${props => props.selected ? '1' : '0'});
    transition: transform 0.3s ease;
  }

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 32px ${props => props.color}33;

    &::before {
      transform: scaleX(1);
    }
  }
`;

const TypeIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: ${props => props.color}15;
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const TypeTitle = styled.h3`
  font-size: 1.35rem;
  font-weight: 800;
  color: #166a0b;
  margin: 0 0 0.5rem;
`;

const TypeDescription = styled.p`
  font-size: 0.95rem;
  color: #6b7280;
  line-height: 1.6;
  margin: 0 0 1.25rem;
`;

const TypeStats = styled.div`
  display: flex;
  gap: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
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

const StatItemLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 600;
`;

const StartButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  max-width: 520px;
  margin: 2rem auto 0;
  padding: 1.25rem 2rem;
  background: ${props => props.disabled 
    ? 'linear-gradient(135deg, #9dd67a, #6fbf3a)' 
    : 'linear-gradient(135deg, #58cc02, #45a302)'
  };
  color: white;
  border: none;
  border-radius: 14px;
  font-weight: 800;
  font-size: 1.125rem;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  box-shadow: ${props => props.disabled 
    ? 'none' 
    : '0 8px 24px rgba(88, 204, 2, 0.3)'
  };
  opacity: ${props => props.disabled ? 0.6 : 1};

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(88, 204, 2, 0.4);
  }

  svg {
    font-size: 1.4rem;
  }
`;

const FeaturesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #4b5563;
  font-weight: 600;

  svg {
    color: ${props => props.color};
    font-size: 1.1rem;
  }
`;

// ========== COMPONENT ==========
const Practice = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(null);

  const testTypes = [
  {
    id: 'quick',
    title: 'Kiểm tra nhanh',
    icon: <Timer />,
    color: '#2ea044',
    description: 'Bài kiểm tra ngắn 10-15 phút để ôn tập kiến thức cơ bản',
    stats: { time: '15 phút', questions: '20 câu' },
    timeLimit: 900, // ← 15 phút = 900 giây
    features: ['Đa dạng dạng bài', 'Kết quả ngay lập tức', 'Phù hợp mọi trình độ']
  },
  {
    id: 'topic',
    title: 'Kiểm tra chuyên đề',
    icon: <School />,
    color: '#58CC02',
    description: 'Tập trung vào một chủ đề cụ thể để nâng cao kỹ năng chuyên sâu',
    stats: { time: '30 phút', questions: '30 câu' },
    timeLimit: 1800, // ← 30 phút = 1800 giây
    features: ['Chọn chủ đề', 'Câu hỏi chuyên sâu', 'Thống kê chi tiết']
  },
  {
    id: 'mock',
    title: 'Thi thử',
    icon: <Quiz />,
    color: '#3aa33a',
    description: 'Mô phỏng bài thi thật với thời gian và độ khó tương đương',
    stats: { time: '45 phút', questions: '50 câu' },
    timeLimit: 2700, // ← 45 phút = 2700 giây
    features: ['Đề thi chuẩn', 'Chấm điểm tự động', 'Phân tích kết quả']
  },
  {
    id: 'adaptive',
    title: 'Kiểm tra thích ứng',
    icon: <Psychology />,
    color: '#7bc35a',
    description: 'AI điều chỉnh độ khó theo năng lực thực tế của bạn',
    stats: { time: '30 phút', level: 'Tự động' },
    timeLimit: 1800, // ← 30 phút = 1800 giây
    features: ['AI thích ứng', 'Đề riêng biệt', 'Tối ưu học tập']
  }
];
  // Mock questions embedded for quick testing
  const mockQuestions = {
    quick: [
      { id: 'q1', type: 'multiple_choice', prompt: 'What is the plural of "mouse"?', choices: ['mouses','mice','mices'], correctAnswer: 'mice' },
      { id: 'q2', type: 'fill_blank', prompt: 'She ___ (be) a teacher.', choices: ['is','are','am'], correctAnswer: 'is' },
      { id: 'q3', type: 'translate', prompt: 'Translate to English: "Tôi thích trà"', correctAnswer: 'I like tea' },
      { id: 'q4', type: 'multiple_choice', prompt: 'Choose the correct sentence:', choices: ['He go to school','He goes to school','He going to school'], correctAnswer: 'He goes to school' },
      { id: 'q5', type: 'listen_write', prompt: 'Listen and write what you hear', audio: 'thank you', correctAnswer: 'thank you' }
    ],
    topic: [
      { id: 't1', type: 'match_pairs', prompt: 'Match food to Vietnamese', left: ['Apple','Bread','Water'], right: ['Bánh mì','Nước','Táo'], correctAnswer: {'Apple':'Táo','Bread':'Bánh mì','Water':'Nước'} },
      { id: 't2', type: 'multiple_choice', prompt: 'What is "phở"?', choices: ['bread','noodle soup','stew'], correctAnswer: 'noodle soup' },
      { id: 't3', type: 'translate', prompt: 'Translate: "Bạn muốn uống gì?"', correctAnswer: 'What would you like to drink?' },
      { id: 't4', type: 'multiple_choice', prompt: 'Which is a breakfast item?', choices: ['noodles','cereal','steak'], correctAnswer: 'cereal' },
      { id: 't5', type: 'listen_choice', prompt: 'Listen to the audio', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/hello-us.mp3', choices: ['Hello','Yellow','Below'], correctAnswer: 'Hello' }
    ],
    mock: [
      { id: 'm1', type: 'reading', prompt: 'Anna went to the market. Where did she go?', choices: ['school','market','park'], correctAnswer: 'market' },
      { id: 'm2', type: 'grammar', prompt: 'If I ___ (have) time, I will come.', choices: ['have','had','will have'], correctAnswer: 'have' },
      { id: 'm3', type: 'vocabulary', prompt: 'Synonym of "happy"', choices: ['sad','joyful','angry'], correctAnswer: 'joyful' },
      { id: 'm4', type: 'listening', prompt: 'Listen to the audio', audioText: 'Yes, I would like to book a ticket.', choices: ['Yes','No','Maybe'], correctAnswer: 'Yes' },
      { id: 'm5', type: 'write', prompt: 'Write a short sentence about your last holiday.' }
    ],
    adaptive: [
      { id: 'a1', type: 'multiple_choice', prompt: 'She ____ a doctor.', choices: ['is','are','am'], correctAnswer: 'is', difficulty: 1 },
      { id: 'a2', type: 'multiple_choice', prompt: 'I live ___ Hanoi.', choices: ['in','on','at'], correctAnswer: 'in', difficulty: 1 },
      { id: 'a3', type: 'vocabulary', prompt: 'Meaning of "ambiguous"', choices: ['clear','uncertain','certain'], correctAnswer: 'uncertain', difficulty: 3 },
      { id: 'a4', type: 'grammar', prompt: 'Identify the tense: "They had finished."', choices: ['Past perfect','Past simple','Present perfect'], correctAnswer: 'Past perfect', difficulty: 3 },
      { id: 'a5', type: 'multiple_choice', prompt: 'Choose the best word: "He has ___ money."', choices: ['much','many','a lot of'], correctAnswer: 'a lot of', difficulty: 2 }
    ]
  };

  const handleTypeSelect = (typeId) => {
    setSelectedType(typeId);
  };

  const handleStart = () => {
  if (!selectedType) return;
  
  const questions = mockQuestions[selectedType] || [];
  const selectedTestType = testTypes.find(t => t.id === selectedType);
  const timeLimit = selectedTestType?.timeLimit || 600; // Default 10 phút
  
  navigate(`/practice/${selectedType}`, { 
    state: { 
      questions,
      timeLimit,           // ← Truyền thời gian
      testTitle: selectedTestType?.title || 'Practice Test'
    } 
  });
};

  return (
    <PageWrapper>
      <LeftSidebar />
      <MainContent>
        <ContentInner>
          <Header>
            <Title>
              <Grading />
              Luyện tập kiểm tra
            </Title>
            <Subtitle>
              Chọn loại bài kiểm tra phù hợp với mục tiêu học tập của bạn
            </Subtitle>
          </Header>

          <StatsBar>
            <StatCard>
              <StatNumber>156</StatNumber>
              <StatLabel>Bài đã làm</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>85%</StatNumber>
              <StatLabel>Độ chính xác</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>42</StatNumber>
              <StatLabel>Điểm cao nhất</StatLabel>
            </StatCard>
            
          </StatsBar>

          <TestTypesGrid>
            {testTypes.map((type, index) => (
              <TestTypeCard
                key={type.id}
                color={type.color}
                selected={selectedType === type.id}
                onClick={() => handleTypeSelect(type.id)}
              >
                <TypeIcon color={type.color}>
                  {React.cloneElement(type.icon, { style: { fontSize: 32 } })}
                </TypeIcon>
                <TypeTitle>{type.title}</TypeTitle>
                <TypeDescription>{type.description}</TypeDescription>
                
                <FeaturesList>
                  {type.features.map((feature, idx) => (
                    <FeatureItem key={idx} color={type.color}>
                      <EmojiEvents />
                      {feature}
                    </FeatureItem>
                  ))}
                </FeaturesList>

                <TypeStats>
                  {Object.entries(type.stats).map(([key, value]) => (
                    <StatItem key={key}>
                      <StatValue color={type.color}>{value}</StatValue>
                      <StatItemLabel>
                        {key === 'time' ? 'Thời gian' : 
                         key === 'questions' ? 'Số câu' : 
                         'Độ khó'}
                      </StatItemLabel>
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
            <Extension />
            Bắt đầu làm bài
          </StartButton>
        </ContentInner>
      </MainContent>
      <RightSidebar />
    </PageWrapper>
  );
};

export default Practice;