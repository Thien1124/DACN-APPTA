import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Swal from 'sweetalert2';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import TeacherLayout from '../layouts/TeacherLayout';

// ========== STYLED COMPONENTS ==========

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const WelcomeCard = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(135deg, #1f2937 0%, #111827 100%)' 
    : 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)'
  };
  border-radius: 24px;
  padding: 2rem;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 300px;
    height: 300px;
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    opacity: 0.05;
    border-radius: 50%;
    transform: translate(30%, -30%);
  }
`;

const WelcomeContent = styled.div`
  flex: 1;
  z-index: 1;
`;

const WelcomeTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.5rem;
`;

const WelcomeSubtitle = styled.p`
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-bottom: 0.75rem;
`;

const DateTime = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-weight: 600;
`;

const WelcomeIllustration = styled.div`
  font-size: 5rem;
  z-index: 1;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const GeneratorSection = styled.div`
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

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 150px;
  padding: 1rem;
  border-radius: 12px;
  border: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 0.875rem;
  line-height: 1.6;
  resize: vertical;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #8b5cf6;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: #8b5cf6;
  }
`;

const GenerateButton = styled.button`
  width: 100%;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border: none;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ResultsSection = styled.div`
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

const CardsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 600px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #8b5cf6;
    border-radius: 3px;
  }
`;

const CardItem = styled.div`
  padding: 1.5rem;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#f9fafb'};
  border-radius: 16px;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.theme === 'dark' ? '#374151' : '#f3f4f6'};
  }
`;

const CardFront = styled.div`
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 1rem;
  margin-bottom: 0.75rem;
`;

const CardBack = styled.div`
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-size: 0.875rem;
  line-height: 1.6;
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: none;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  ${props => {
    if (props.variant === 'primary') {
      return `
        background: rgba(139, 92, 246, 0.1);
        color: #8b5cf6;
        &:hover { background: rgba(139, 92, 246, 0.2); }
      `;
    }
    if (props.variant === 'danger') {
      return `
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
        &:hover { background: rgba(239, 68, 68, 0.2); }
      `;
    }
    return '';
  }}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  opacity: 0.5;
  margin-bottom: 1rem;
`;

const EmptyText = styled.div`
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-size: 1rem;
`;

// ========== COMPONENT ==========

const TeacherAICards = () => {
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [inputText, setInputText] = useState('');
  const [cardType, setCardType] = useState('vocabulary');
  const [numberOfCards, setNumberOfCards] = useState(10);
  const [generatedCards, setGeneratedCards] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date) => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const handleGenerate = () => {
    if (!inputText.trim()) {
      showToast('warning', 'Cảnh báo', 'Vui lòng nhập nội dung');
      return;
    }

    setIsGenerating(true);
    showToast('info', 'Đang xử lý', 'AI đang tạo flashcards...');

    // Simulate AI generation
    setTimeout(() => {
      const mockCards = Array.from({ length: numberOfCards }, (_, i) => ({
        id: Date.now() + i,
        front: `Word ${i + 1}: Example`,
        back: `Definition ${i + 1}: This is an AI-generated explanation based on your input.`,
      }));

      setGeneratedCards(mockCards);
      setIsGenerating(false);
      showToast('success', 'Hoàn thành!', `Đã tạo ${numberOfCards} flashcards`);
    }, 2000);
  };

  const handleSaveAll = () => {
    if (generatedCards.length === 0) return;
    
    Swal.fire({
      icon: 'success',
      title: 'Đã lưu!',
      text: `${generatedCards.length} flashcards đã được thêm vào deck`,
      confirmButtonColor: '#8b5cf6',
    });
    showToast('success', 'Thành công!', 'Đã lưu tất cả flashcards');
  };

  const handleDeleteCard = (id) => {
    setGeneratedCards(generatedCards.filter(card => card.id !== id));
    showToast('success', 'Đã xóa!', 'Flashcard đã được xóa');
  };

  return (
    <TeacherLayout pageTitle="🤖 AI Tạo thẻ">
      <Toast toast={toast} onClose={hideToast} />
      
      <PageContainer>
        <WelcomeCard theme={theme}>
          <WelcomeContent>
            <WelcomeTitle theme={theme}>AI Tạo Flashcards 🤖</WelcomeTitle>
            <WelcomeSubtitle theme={theme}>
              Tạo flashcards tự động bằng công nghệ AI
            </WelcomeSubtitle>
            <DateTime theme={theme}>
              🕐 {formatDateTime(currentTime)} UTC | 👤 vinhsonvlog
            </DateTime>
          </WelcomeContent>
          <WelcomeIllustration>🤖</WelcomeIllustration>
        </WelcomeCard>

        <ContentGrid>
          <GeneratorSection theme={theme}>
            <SectionTitle theme={theme}>
              <span>✨</span>
              Tạo Flashcards
            </SectionTitle>

            <FormGroup>
              <Label theme={theme}>📝 Nội dung nguồn</Label>
              <TextArea
                theme={theme}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Nhập văn bản, từ vựng, hoặc chủ đề bạn muốn tạo flashcards..."
              />
            </FormGroup>

            <FormGroup>
              <Label theme={theme}>📁 Loại thẻ</Label>
              <Select
                theme={theme}
                value={cardType}
                onChange={(e) => setCardType(e.target.value)}
              >
                <option value="vocabulary">Từ vựng</option>
                <option value="grammar">Ngữ pháp</option>
                <option value="sentence">Câu mẫu</option>
                <option value="idiom">Thành ngữ</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label theme={theme}>🔢 Số lượng thẻ</Label>
              <Input
                theme={theme}
                type="number"
                value={numberOfCards}
                onChange={(e) => setNumberOfCards(Math.max(1, Math.min(50, parseInt(e.target.value) || 10)))}
                min="1"
                max="50"
              />
            </FormGroup>

            <GenerateButton
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              <span>✨</span>
              {isGenerating ? 'Đang tạo...' : 'Tạo Flashcards'}
            </GenerateButton>
          </GeneratorSection>

          <ResultsSection theme={theme}>
            <SectionTitle theme={theme}>
              <span>📇</span>
              Kết quả ({generatedCards.length})
            </SectionTitle>

            {generatedCards.length > 0 ? (
              <>
                <CardsList>
                  {generatedCards.map(card => (
                    <CardItem key={card.id} theme={theme}>
                      <CardFront theme={theme}>{card.front}</CardFront>
                      <CardBack theme={theme}>{card.back}</CardBack>
                      <CardActions>
                        <ActionButton variant="primary" onClick={() => showToast('info', 'Edit', 'Chỉnh sửa thẻ')}>
                          ✏️ Sửa
                        </ActionButton>
                        <ActionButton variant="danger" onClick={() => handleDeleteCard(card.id)}>
                          🗑️ Xóa
                        </ActionButton>
                      </CardActions>
                    </CardItem>
                  ))}
                </CardsList>
                <GenerateButton onClick={handleSaveAll} style={{ marginTop: '1rem' }}>
                  💾 Lưu tất cả
                </GenerateButton>
              </>
            ) : (
              <EmptyState>
                <EmptyIcon>🤖</EmptyIcon>
                <EmptyText theme={theme}>
                  Chưa có flashcards nào được tạo
                </EmptyText>
              </EmptyState>
            )}
          </ResultsSection>
        </ContentGrid>
      </PageContainer>
    </TeacherLayout>
  );
};

export default TeacherAICards;