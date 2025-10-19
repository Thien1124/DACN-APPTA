import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import AdminLayout from '../layouts/AdminLayout';
import { adminService } from '../services/adminService';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';

// ========== STYLED COMPONENTS ==========
const FormContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Card = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
`;

const PageTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 2rem;
`;

const PreviewCard = styled.div`
  perspective: 1000px;
  margin-bottom: 2rem;
`;

const CardInner = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  cursor: pointer;
  transform: ${props => props.flipped ? 'rotateY(180deg)' : 'rotateY(0)'};
`;

const CardFace = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  padding: 2rem;
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

const CardFront = styled(CardFace)`
  background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
  color: white;
`;

const CardBack = styled(CardFace)`
  background: linear-gradient(135deg, #1CB0F6 0%, #0891b2 100%);
  color: white;
  transform: rotateY(180deg);
`;

const FlipHint = styled.div`
  text-align: center;
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-bottom: 2rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: ${props => props.columns || '1fr'};
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#e5e7eb' : '#374151'};
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  border-radius: 8px;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: #58CC02;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  border-radius: 8px;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 0.875rem;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #58CC02;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  border-radius: 8px;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 0.875rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #58CC02;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => {
    if (props.variant === 'cancel') return props.theme === 'dark' ? '#374151' : '#e5e7eb';
    return '#58CC02';
  }};
  color: ${props => {
    if (props.variant === 'cancel') return props.theme === 'dark' ? '#e5e7eb' : '#374151';
    return 'white';
  }};

  &:hover {
    transform: translateY(-2px);
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorText = styled.span`
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: block;
`;

const HelpText = styled.p`
  font-size: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-top: 0.25rem;
`;

// ========== COMPONENT ==========
const AdminFlashcardForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [loading, setLoading] = useState(false);
  const [decks, setDecks] = useState([]);
  const [flipped, setFlipped] = useState(false);
  const [formData, setFormData] = useState({
    front: '',
    back: '',
    example: '',
    imageUrl: '',
    audioUrl: '',
    deck: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchDecks();
    if (id) {
      fetchFlashcard();
    }
  }, [id]);

  const fetchDecks = async () => {
    try {
      const response = await adminService.decks.getAll();
      setDecks(response.data || []);
    } catch (error) {
      console.error('Error fetching decks:', error);
    }
  };

  const fetchFlashcard = async () => {
    try {
      setLoading(true);
      const response = await adminService.flashcards.getById(id);
      setFormData({
        ...response.data,
        deck: response.data.deck?._id || response.data.deck
      });
    } catch (error) {
      console.error('Error fetching flashcard:', error);
      showToast('error', 'Lỗi', 'Không thể tải thông tin flashcard');
      navigate('/admin/flashcards');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.front.trim()) {
      newErrors.front = 'Vui lòng nhập nội dung mặt trước';
    }

    if (!formData.back.trim()) {
      newErrors.back = 'Vui lòng nhập nội dung mặt sau';
    }

    if (!formData.deck) {
      newErrors.deck = 'Vui lòng chọn deck';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('error', 'Lỗi', 'Vui lòng kiểm tra lại thông tin');
      return;
    }

    setLoading(true);

    try {
      if (id) {
        await adminService.flashcards.update(id, formData);
        showToast('success', 'Thành công', 'Đã cập nhật flashcard');
      } else {
        await adminService.flashcards.create(formData);
        showToast('success', 'Thành công', 'Đã tạo flashcard mới');
      }
      navigate('/admin/flashcards');
    } catch (error) {
      console.error('Error saving flashcard:', error);
      showToast('error', 'Lỗi', error.response?.data?.message || 'Không thể lưu flashcard');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/flashcards');
  };

  return (
    <AdminLayout pageTitle={id ? 'Chỉnh sửa Flashcard' : 'Tạo Flashcard mới'}>
      <Toast toast={toast} onClose={hideToast} />

      <FormContainer>
        <PageTitle theme={theme}>
          {id ? '✏️ Chỉnh sửa Flashcard' : '➕ Tạo Flashcard mới'}
        </PageTitle>

        <PreviewCard>
          <CardInner flipped={flipped} onClick={() => setFlipped(!flipped)}>
            <CardFront>
              {formData.front || 'Mặt trước'}
            </CardFront>
            <CardBack>
              {formData.back || 'Mặt sau'}
            </CardBack>
          </CardInner>
        </PreviewCard>
        <FlipHint theme={theme}>
          👆 Nhấp vào thẻ để xem trước hiệu ứng lật
        </FlipHint>

        <Card theme={theme}>
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label theme={theme}>Deck *</Label>
              <Select
                theme={theme}
                name="deck"
                value={formData.deck}
                onChange={handleChange}
              >
                <option value="">-- Chọn deck --</option>
                {decks.map(deck => (
                  <option key={deck._id} value={deck._id}>
                    {deck.title}
                  </option>
                ))}
              </Select>
              {errors.deck && <ErrorText>{errors.deck}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label theme={theme}>Mặt trước *</Label>
              <Textarea
                theme={theme}
                name="front"
                value={formData.front}
                onChange={handleChange}
                placeholder="VD: accomplish"
              />
              {errors.front && <ErrorText>{errors.front}</ErrorText>}
              <HelpText theme={theme}>
                Thường là từ tiếng Anh hoặc câu hỏi
              </HelpText>
            </FormGroup>

            <FormGroup>
              <Label theme={theme}>Mặt sau *</Label>
              <Textarea
                theme={theme}
                name="back"
                value={formData.back}
                onChange={handleChange}
                placeholder="VD: hoàn thành, đạt được"
              />
              {errors.back && <ErrorText>{errors.back}</ErrorText>}
              <HelpText theme={theme}>
                Thường là nghĩa tiếng Việt hoặc câu trả lời
              </HelpText>
            </FormGroup>

            <FormGroup>
              <Label theme={theme}>Ví dụ (tùy chọn)</Label>
              <Textarea
                theme={theme}
                name="example"
                value={formData.example}
                onChange={handleChange}
                placeholder="VD: She accomplished all her goals this year."
              />
              <HelpText theme={theme}>
                Câu ví dụ sử dụng từ vựng
              </HelpText>
            </FormGroup>

            <FormRow columns="1fr 1fr">
              <FormGroup>
                <Label theme={theme}>URL hình ảnh</Label>
                <Input
                  theme={theme}
                  type="text"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                />
              </FormGroup>

              <FormGroup>
                <Label theme={theme}>URL audio</Label>
                <Input
                  theme={theme}
                  type="text"
                  name="audioUrl"
                  value={formData.audioUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/audio.mp3"
                />
              </FormGroup>
            </FormRow>

            <ButtonGroup>
              <Button
                type="button"
                variant="cancel"
                theme={theme}
                onClick={handleCancel}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Đang lưu...' : (id ? 'Cập nhật' : 'Tạo mới')}
              </Button>
            </ButtonGroup>
          </form>
        </Card>
      </FormContainer>
    </AdminLayout>
  );
};

export default AdminFlashcardForm;