import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Swal from 'sweetalert2';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import Header from '../components/Header';

// ========== STYLED COMPONENTS ==========

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

  @media (max-width: 768px) {
    padding: 1rem;
  }
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
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

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
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
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-weight: 600;
`;

const Section = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const CardGrid = styled.div`
  display: grid;
  gap: 1rem;
`;

const Card = styled.div`
  padding: 1.5rem;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#f9fafb'};
  border-radius: 16px;
  border-left: 4px solid ${props => props.color || '#58CC02'};
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.theme === 'dark' ? '#374151' : '#f3f4f6'};
    transform: translateX(5px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const CardTitle = styled.div`
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 1rem;
`;

const CardMeta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;

  ${props => {
    if (props.variant === 'primary') {
      return `
        background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
        color: white;
        &:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(88, 204, 2, 0.3); }
      `;
    }
    if (props.variant === 'secondary') {
      return `
        background: rgba(88, 204, 2, 0.1);
        color: #58CC02;
        &:hover { background: rgba(88, 204, 2, 0.2); }
      `;
    }
    return '';
  }}
`;

// ========== MOCK DATA ==========

const mockWeakCards = [
  { id: 1, word: 'accomplish', wrongCount: 8, lastFailed: '2025-10-12', color: '#ef4444' },
  { id: 2, word: 'persuade', wrongCount: 6, lastFailed: '2025-10-11', color: '#f59e0b' },
  { id: 3, word: 'maintain', wrongCount: 5, lastFailed: '2025-10-10', color: '#3b82f6' },
];

// ========== COMPONENT ==========

const CreateSubQuiz = () => {
  const { toast, showToast, hideToast } = useToast();
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

  const handleCreateQuiz = () => {
    Swal.fire({
      title: '✨ Tạo Quiz Phụ',
      html: `
        <div style="text-align:left;">
          <p style="margin-bottom:1rem;">Chọn số lượng thẻ từ các thẻ yếu:</p>
          <input id="quizCount" type="number" class="swal2-input" placeholder="10" value="10" min="5" max="50" style="width:100%;">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '🎯 Tạo Quiz',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#58CC02',
      cancelButtonColor: '#6b7280',
    }).then((result) => {
      if (result.isConfirmed) {
        showToast('success', 'Thành công!', 'Quiz phụ đã được tạo');
      }
    });
  };

  return (
    <PageWrapper theme={theme}>
      <Header theme={theme} userName="vinhsonvlog" />
      <Toast toast={toast} onClose={hideToast} />
      
      <Container>
        <WelcomeCard theme={theme}>
          <WelcomeTitle theme={theme}>
            <span>🎯</span>
            Tạo bộ Quiz Phụ
          </WelcomeTitle>
          <WelcomeSubtitle theme={theme}>
            Tạo quiz từ các thẻ hay sai để củng cố kiến thức yếu
          </WelcomeSubtitle>
          <DateTime theme={theme}>
            🕐 {formatDateTime()} UTC | 👤 vinhsonvlog
          </DateTime>
        </WelcomeCard>

        <StatsGrid>
          <StatCard theme={theme}>
            <StatIcon color="#ef4444">❌</StatIcon>
            <StatValue theme={theme}>23</StatValue>
            <StatLabel theme={theme}>Thẻ yếu</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#f59e0b">📊</StatIcon>
            <StatValue theme={theme}>5</StatValue>
            <StatLabel theme={theme}>Quiz đã tạo</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#58CC02">✅</StatIcon>
            <StatValue theme={theme}>78%</StatValue>
            <StatLabel theme={theme}>Cải thiện</StatLabel>
          </StatCard>
        </StatsGrid>

        <Section theme={theme}>
          <SectionTitle theme={theme}>
            <span>📝</span>
            Thẻ hay sai nhất
          </SectionTitle>

          <CardGrid>
            {mockWeakCards.map(card => (
              <Card key={card.id} theme={theme} color={card.color}>
                <CardHeader>
                  <CardTitle theme={theme}>{card.word}</CardTitle>
                  <CardMeta theme={theme}>
                    <span>❌ {card.wrongCount} lần</span>
                    <span>📅 {card.lastFailed}</span>
                  </CardMeta>
                </CardHeader>
                <ActionButtons>
                  <Button variant="primary" onClick={handleCreateQuiz}>
                    🎯 Tạo Quiz từ thẻ này
                  </Button>
                  <Button variant="secondary">
                    👁️ Xem chi tiết
                  </Button>
                </ActionButtons>
              </Card>
            ))}
          </CardGrid>
        </Section>
      </Container>
    </PageWrapper>
  );
};

export default CreateSubQuiz;