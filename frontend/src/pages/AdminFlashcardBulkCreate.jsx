import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import { adminService } from '../services/adminService';
import { useToast } from '../hooks/useToast';
import { FileCopy, CloudUpload, Delete, Add } from '@mui/icons-material';

const FormContainer = styled.div`
  max-width: 900px;
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  border-radius: 8px;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
`;

const FlashcardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FlashcardItem = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 1rem;
  padding: 1rem;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#f9fafb'};
  border-radius: 8px;
  align-items: start;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  border-radius: 8px;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  border-radius: 8px;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  min-height: 100px;
  resize: vertical;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  ${props => props.variant === 'primary' && `
    background: #58CC02;
    color: white;
    &:hover {
      background: #45a302;
    }
  `}

  ${props => props.variant === 'secondary' && `
    background: #6b7280;
    color: white;
    &:hover {
      background: #4b5563;
    }
  `}

  ${props => props.variant === 'danger' && `
    background: #ef4444;
    color: white;
    &:hover {
      background: #dc2626;
    }
  `}
`;

const AdminFlashcardBulkCreate = () => {
  const [theme] = useState('light');
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [decks, setDecks] = useState([]);
  const [selectedDeck, setSelectedDeck] = useState('');
  const [flashcards, setFlashcards] = useState([
    { front: '', back: '', example: '' }
  ]);

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    try {
      setLoading(true);
      const response = await adminService.decks.getAll();
      
      // Check if response exists and has data
      if (response && response.data) {
        console.log('Fetched decks:', response.data); // For debugging
        setDecks(response.data);
      } else {
        throw new Error('No decks data received');
      }
    } catch (error) {
      console.error('Error fetching decks:', error);
      showToast('error', 'Lỗi', 'Không thể tải danh sách decks');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFlashcard = () => {
    setFlashcards([...flashcards, { front: '', back: '', example: '' }]);
  };

  const handleRemoveFlashcard = (index) => {
    setFlashcards(flashcards.filter((_, i) => i !== index));
  };

  const handleFlashcardChange = (index, field, value) => {
    const newFlashcards = [...flashcards];
    newFlashcards[index][field] = value;
    setFlashcards(newFlashcards);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDeck) {
      showToast('error', 'Lỗi', 'Vui lòng chọn deck');
      return;
    }

    const validFlashcards = flashcards.filter(f => f.front && f.back);
    if (validFlashcards.length === 0) {
      showToast('error', 'Lỗi', 'Vui lòng nhập ít nhất một flashcard');
      return;
    }

    setLoading(true);
    try {
      // Format flashcards data
      const formattedFlashcards = validFlashcards.map(card => ({
        front: card.front.trim(),
        back: card.back.trim(),
        example: card.example?.trim() || ''
        // Remove deck from individual flashcard since we're sending it separately
      }));

      const response = await adminService.flashcards.bulkCreate(selectedDeck, formattedFlashcards);
      
      if (response.success) {
        showToast('success', 'Thành công', `Đã tạo ${validFlashcards.length} flashcard`);
        navigate('/admin/flashcards');
      } else {
        throw new Error(response.message || 'Không thể tạo flashcards');
      }
    } catch (error) {
      console.error('Error creating flashcards:', error);
      showToast('error', 'Lỗi', error.response?.data?.message || 'Không thể tạo flashcards');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout pageTitle="Tạo Flashcards hàng loạt">
      <FormContainer>
        <PageTitle theme={theme}>
          <FileCopy /> Tạo Flashcards hàng loạt
        </PageTitle>

        <Card theme={theme}>
          <Form onSubmit={handleSubmit}>
            <Select
              theme={theme}
              value={selectedDeck}
              onChange={(e) => setSelectedDeck(e.target.value)}
              required
              disabled={loading}
            >
              <option value="">-- Chọn Deck --</option>
              {decks && decks.length > 0 ? (
                decks.map(deck => (
                  <option key={deck._id} value={deck._id}>
                    {deck.title || deck.name} - {deck.category}
                  </option>
                ))
              ) : (
                <option value="" disabled>Không có deck nào</option>
              )}
            </Select>

            <FlashcardList>
              {flashcards.map((flashcard, index) => (
                <FlashcardItem key={index} theme={theme}>
                  <div>
                    <Input
                      theme={theme}
                      placeholder="Mặt trước"
                      value={flashcard.front}
                      onChange={(e) => handleFlashcardChange(index, 'front', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      theme={theme}
                      placeholder="Mặt sau"
                      value={flashcard.back}
                      onChange={(e) => handleFlashcardChange(index, 'back', e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => handleRemoveFlashcard(index)}
                    disabled={flashcards.length === 1}
                  >
                    <Delete />
                  </Button>
                </FlashcardItem>
              ))}
            </FlashcardList>

            <Button type="button" variant="secondary" onClick={handleAddFlashcard}>
              <Add /> Thêm flashcard
            </Button>

            <ButtonGroup>
              <Button type="button" variant="secondary" onClick={() => navigate('/admin/flashcards')}>
                Hủy
              </Button>
              <Button type="submit" variant="primary" disabled={loading}>
                <CloudUpload /> {loading ? 'Đang tạo...' : 'Tạo hàng loạt'}
              </Button>
            </ButtonGroup>
          </Form>
        </Card>
      </FormContainer>
    </AdminLayout>
  );
};

export default AdminFlashcardBulkCreate;