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

const NoteTypesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const NoteTypeCard = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  border: 2px solid ${props => props.active 
    ? '#58CC02' 
    : (props.theme === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)')
  };
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    border-color: #58CC02;
    box-shadow: 0 8px 20px rgba(88, 204, 2, 0.2);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    height: 100px;
    background: ${props => props.color || '#58CC02'};
    opacity: 0.1;
    border-radius: 50%;
    transform: translate(30%, -30%);
  }
`;

const NoteTypeIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: ${props => props.color || '#58CC02'}22;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
`;

const NoteTypeTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
`;

const NoteTypeDescription = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  line-height: 1.6;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
`;

const NoteTypeExample = styled.div`
  padding: 1rem;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#f9fafb'};
  border-radius: 12px;
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#d1d5db' : '#4b5563'};
  font-family: 'Courier New', monospace;
  position: relative;
  z-index: 1;
`;

const CreateSection = styled.div`
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

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #58CC02;
    box-shadow: 0 0 0 3px rgba(88, 204, 2, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 1rem;
  line-height: 1.6;
  resize: vertical;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #58CC02;
    box-shadow: 0 0 0 3px rgba(88, 204, 2, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Button = styled.button`
  flex: 1;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  border: none;
  font-weight: 600;
  font-size: 1rem;
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

const HelpBox = styled.div`
  padding: 1rem;
  background: rgba(88, 204, 2, 0.1);
  border-left: 4px solid #58CC02;
  border-radius: 8px;
  margin-top: 1rem;
`;

const HelpText = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#d1d5db' : '#4b5563'};
  line-height: 1.6;
  margin: 0;

  strong {
    color: #58CC02;
  }
`;

// ========== MOCK DATA ==========

const noteTypes = [
  {
    id: 'single-word',
    icon: '📝',
    title: 'Từ đơn',
    description: 'Học từ vựng đơn lẻ với nghĩa và phiên âm',
    example: 'Front: achievement\nBack: /əˈtʃiːvmənt/ - thành tựu',
    color: '#58CC02',
  },
  {
    id: 'phrase',
    icon: '💬',
    title: 'Cụm từ',
    description: 'Học cụm từ và idioms thông dụng',
    example: 'Front: get the hang of\nBack: trở nên quen với cái gì',
    color: '#1CB0F6',
  },
  {
    id: 'sentence',
    icon: '📖',
    title: 'Câu ví dụ',
    description: 'Học từ vựng trong ngữ cảnh câu hoàn chỉnh',
    example: 'Front: She achieved great success.\nBack: Cô ấy đã đạt được thành công lớn.',
    color: '#8b5cf6',
  },
  {
    id: 'cloze',
    icon: '🎯',
    title: 'Cloze (Điền khuyết)',
    description: 'Luyện tập điền từ vào chỗ trống trong câu',
    example: 'She {{c1::achieved}} great success in her career.',
    color: '#f59e0b',
  },
];

// ========== COMPONENT ==========

const CreateCardWithNoteType = () => {
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedType, setSelectedType] = useState(noteTypes[0]);
  const [formData, setFormData] = useState({
    front: '',
    back: '',
    deck: 'My Deck',
  });

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

  const handleTypeSelect = (type) => {
    setSelectedType(type);
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleCreateCard = () => {
    if (!formData.front || !formData.back) {
      showToast('warning', 'Cảnh báo', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    Swal.fire({
      icon: 'success',
      title: 'Đã tạo thẻ!',
      text: `Thẻ kiểu "${selectedType.title}" đã được thêm vào deck`,
      confirmButtonColor: '#58CC02',
    });

    // Reset form
    setFormData({ front: '', back: '', deck: 'My Deck' });
    showToast('success', 'Thành công!', 'Thẻ mới đã được tạo');
  };

  const handlePreview = () => {
    Swal.fire({
      title: '👁️ Xem trước thẻ',
      html: `
        <div style="text-align:left;">
          <div style="padding:1rem;background:#f0f9ff;border-radius:12px;margin-bottom:1rem;">
            <strong style="color:#58CC02;">Front:</strong>
            <p style="margin-top:0.5rem;color:#1a1a1a;">${formData.front || '(Trống)'}</p>
          </div>
          <div style="padding:1rem;background:#f9fafb;border-radius:12px;">
            <strong style="color:#1CB0F6;">Back:</strong>
            <p style="margin-top:0.5rem;color:#1a1a1a;">${formData.back || '(Trống)'}</p>
          </div>
        </div>
      `,
      confirmButtonColor: '#58CC02',
      confirmButtonText: '✅ OK',
      width: 600,
    });
  };

  return (
    <PageWrapper theme={theme}>
      <Header theme={theme} userName="vinhsonvlog" />
      <Toast toast={toast} onClose={hideToast} />
      
      <Container>
        <WelcomeCard theme={theme}>
          <WelcomeTitle theme={theme}>
            <span>🎴</span>
            Tạo thẻ với kiểu note
          </WelcomeTitle>
          <WelcomeSubtitle theme={theme}>
            Tạo thẻ theo kiểu: từ đơn, cụm từ, câu ví dụ, hoặc cloze (điền khuyết)
          </WelcomeSubtitle>
          <DateTime theme={theme}>
            🕐 {formatDateTime()} UTC | 👤 vinhsonvlog
          </DateTime>
        </WelcomeCard>

        <SectionTitle theme={theme}>
          <span>📚</span>
          Chọn kiểu thẻ
        </SectionTitle>

        <NoteTypesGrid>
          {noteTypes.map(type => (
            <NoteTypeCard
              key={type.id}
              theme={theme}
              color={type.color}
              active={selectedType.id === type.id}
              onClick={() => handleTypeSelect(type)}
            >
              <NoteTypeIcon color={type.color}>{type.icon}</NoteTypeIcon>
              <NoteTypeTitle theme={theme}>{type.title}</NoteTypeTitle>
              <NoteTypeDescription theme={theme}>
                {type.description}
              </NoteTypeDescription>
              <NoteTypeExample theme={theme}>
                {type.example}
              </NoteTypeExample>
            </NoteTypeCard>
          ))}
        </NoteTypesGrid>

        <CreateSection theme={theme}>
          <SectionTitle theme={theme}>
            <span>✨</span>
            Tạo thẻ mới - {selectedType.title}
          </SectionTitle>

          <FormGroup>
            <Label theme={theme}>📝 Deck</Label>
            <Input
              theme={theme}
              value={formData.deck}
              onChange={(e) => handleInputChange('deck', e.target.value)}
              placeholder="Chọn hoặc tạo deck..."
            />
          </FormGroup>

          <FormGroup>
            <Label theme={theme}>
              {selectedType.id === 'cloze' ? '🎯 Câu (dùng {{c1::text}} để đánh dấu)' : '📄 Mặt trước (Front)'}
            </Label>
            <TextArea
              theme={theme}
              value={formData.front}
              onChange={(e) => handleInputChange('front', e.target.value)}
              placeholder={
                selectedType.id === 'single-word' ? 'VD: achievement' :
                selectedType.id === 'phrase' ? 'VD: get the hang of' :
                selectedType.id === 'sentence' ? 'VD: She achieved great success.' :
                'VD: She {{c1::achieved}} great success in her career.'
              }
            />
          </FormGroup>

          <FormGroup>
            <Label theme={theme}>📝 Mặt sau (Back)</Label>
            <TextArea
              theme={theme}
              value={formData.back}
              onChange={(e) => handleInputChange('back', e.target.value)}
              placeholder={
                selectedType.id === 'single-word' ? 'VD: /əˈtʃiːvmənt/ - thành tựu, thành tích' :
                selectedType.id === 'phrase' ? 'VD: trở nên quen với cái gì' :
                selectedType.id === 'sentence' ? 'VD: Cô ấy đã đạt được thành công lớn.' :
                'VD: đạt được, hoàn thành'
              }
            />
          </FormGroup>

          {selectedType.id === 'cloze' && (
            <HelpBox>
              <HelpText theme={theme}>
                💡 <strong>Hướng dẫn Cloze:</strong> Sử dụng cú pháp <strong>{'{{c1::text}}'}</strong> để đánh dấu từ cần điền. 
                Ví dụ: "She {'{{c1::achieved}}'} great success" sẽ hiển thị "She [...] great success" khi học.
              </HelpText>
            </HelpBox>
          )}

          <ButtonGroup>
            <Button variant="secondary" onClick={handlePreview}>
              👁️ Xem trước
            </Button>
            <Button variant="primary" onClick={handleCreateCard}>
              ✨ Tạo thẻ
            </Button>
          </ButtonGroup>
        </CreateSection>
      </Container>
    </PageWrapper>
  );
};

export default CreateCardWithNoteType;