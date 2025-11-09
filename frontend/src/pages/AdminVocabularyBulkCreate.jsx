import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import { adminService } from '../services/adminService';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';
import { FileCopy, Delete, Add, Save, ArrowBack } from '@mui/icons-material';

// ========== STYLED COMPONENTS ==========
const FormContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const PageTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
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
  margin-bottom: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#e5e7eb' : '#374151'};
  font-size: 0.875rem;
`;

const Select = styled.select`
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
  min-height: 60px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #58CC02;
  }
`;

const VocabularyList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const VocabularyItem = styled.div`
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#f9fafb'};
  border: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  border-radius: 12px;
  padding: 1.5rem;
  position: relative;
`;

const VocabularyHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
`;

const VocabularyNumber = styled.div`
  font-weight: 700;
  color: #58CC02;
  font-size: 1rem;
`;

const DeleteButton = styled.button`
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;

  &:hover {
    background: #dc2626;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const GridRow = styled.div`
  display: grid;
  grid-template-columns: ${props => props.columns || '1fr'};
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-top: 2rem;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  background: ${props => {
    if (props.variant === 'secondary') return '#8b5cf6';
    if (props.variant === 'cancel') return '#6b7280';
    return '#58CC02';
  }};
  
  color: white;

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

const InfoBox = styled.div`
  background: ${props => props.theme === 'dark' ? '#1e3a8a' : '#dbeafe'};
  color: ${props => props.theme === 'dark' ? '#93c5fd' : '#1e40af'};
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  line-height: 1.6;
`;

// ========== COMPONENT ==========
const AdminVocabularyBulkCreate = () => {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [loading, setLoading] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState('');
  const [vocabularies, setVocabularies] = useState([
    {
      word: '',
      translation: '',
      phonetic: '',
      example: '',
      exampleTranslation: '',
      difficulty: 'medium',
      imageUrl: '',
      audioUrl: ''
    }
  ]);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const response = await adminService.lessons.getAll();
      setLessons(response.data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      showToast('error', 'Lỗi', 'Không thể tải danh sách bài học');
    }
  };

  const handleAddVocabulary = () => {
    setVocabularies([
      ...vocabularies,
      {
        word: '',
        translation: '',
        phonetic: '',
        example: '',
        exampleTranslation: '',
        difficulty: 'medium',
        imageUrl: '',
        audioUrl: ''
      }
    ]);
  };

  const handleRemoveVocabulary = (index) => {
    if (vocabularies.length > 1) {
      setVocabularies(vocabularies.filter((_, i) => i !== index));
    }
  };

  const handleVocabularyChange = (index, field, value) => {
    const newVocabularies = [...vocabularies];
    newVocabularies[index][field] = value;
    setVocabularies(newVocabularies);
  };

  const validateForm = () => {
    if (!selectedLesson) {
      showToast('error', 'Lỗi', 'Vui lòng chọn bài học');
      return false;
    }

    const validVocabs = vocabularies.filter(v => v.word && v.translation);
    if (validVocabs.length === 0) {
      showToast('error', 'Lỗi', 'Vui lòng nhập ít nhất một từ vựng hợp lệ (Từ vựng và Nghĩa là bắt buộc)');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Filter valid vocabularies (có word và translation)
      const validVocabularies = vocabularies
        .filter(v => v.word.trim() && v.translation.trim())
        .map(v => ({
          ...v,
          lesson: selectedLesson
        }));

      const response = await adminService.vocabularies.createBulk(validVocabularies);

      if (response.success) {
        showToast('success', 'Thành công', `✅ Đã tạo ${validVocabularies.length} từ vựng`);
        setTimeout(() => {
          navigate('/admin/vocabularies');
        }, 1500);
      } else {
        throw new Error(response.message || 'Không thể tạo từ vựng hàng loạt');
      }
    } catch (error) {
      console.error('Error creating vocabularies:', error);
      showToast('error', 'Lỗi', error.response?.data?.message || 'Không thể tạo từ vựng hàng loạt');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/vocabularies');
  };

  return (
    <AdminLayout pageTitle="Tạo Từ vựng hàng loạt">
      <Toast toast={toast} onClose={hideToast} />
      
      <FormContainer>
        <PageTitle theme={theme}>
          <FileCopy /> Tạo Từ vựng hàng loạt
        </PageTitle>

        <Card theme={theme}>
          <InfoBox theme={theme}>
            💡 <strong>Hướng dẫn:</strong> Chọn bài học trước, sau đó nhập danh sách từ vựng. 
            Các trường <strong>Từ vựng</strong> và <strong>Nghĩa</strong> là bắt buộc. 
            Bạn có thể thêm nhiều từ bằng nút "Thêm từ vựng" bên dưới.
          </InfoBox>

          <Form onSubmit={handleSubmit}>
            {/* Lesson Selection */}
            <FormGroup>
              <Label theme={theme}>Bài học * (Chung cho tất cả từ vựng)</Label>
              <Select
                theme={theme}
                value={selectedLesson}
                onChange={(e) => setSelectedLesson(e.target.value)}
                required
              >
                <option value="">-- Chọn bài học --</option>
                {lessons.map(lesson => (
                  <option key={lesson._id} value={lesson._id}>
                    {lesson.title}
                  </option>
                ))}
              </Select>
            </FormGroup>

            {/* Vocabulary List */}
            <VocabularyList>
              {vocabularies.map((vocab, index) => (
                <VocabularyItem key={index} theme={theme}>
                  <VocabularyHeader theme={theme}>
                    <VocabularyNumber>Từ vựng #{index + 1}</VocabularyNumber>
                    <DeleteButton
                      type="button"
                      onClick={() => handleRemoveVocabulary(index)}
                      disabled={vocabularies.length === 1}
                    >
                      <Delete sx={{ fontSize: 18 }} /> Xóa
                    </DeleteButton>
                  </VocabularyHeader>

                  {/* Row 1: Word + Translation */}
                  <GridRow columns="1fr 1fr">
                    <FormGroup>
                      <Label theme={theme}>Từ vựng *</Label>
                      <Input
                        theme={theme}
                        type="text"
                        placeholder="VD: accomplish"
                        value={vocab.word}
                        onChange={(e) => handleVocabularyChange(index, 'word', e.target.value)}
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label theme={theme}>Nghĩa *</Label>
                      <Input
                        theme={theme}
                        type="text"
                        placeholder="Hoàn thành, đạt được"
                        value={vocab.translation}
                        onChange={(e) => handleVocabularyChange(index, 'translation', e.target.value)}
                        required
                      />
                    </FormGroup>
                  </GridRow>

                  {/* Row 2: Phonetic + Difficulty */}
                  <GridRow columns="2fr 1fr">
                    <FormGroup>
                      <Label theme={theme}>Phát âm (IPA)</Label>
                      <Input
                        theme={theme}
                        type="text"
                        placeholder="/əˈkʌmplɪʃ/"
                        value={vocab.phonetic}
                        onChange={(e) => handleVocabularyChange(index, 'phonetic', e.target.value)}
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label theme={theme}>Độ khó</Label>
                      <Select
                        theme={theme}
                        value={vocab.difficulty}
                        onChange={(e) => handleVocabularyChange(index, 'difficulty', e.target.value)}
                      >
                        <option value="easy">Dễ</option>
                        <option value="medium">Trung bình</option>
                        <option value="hard">Khó</option>
                      </Select>
                    </FormGroup>
                  </GridRow>

                  {/* Row 3: Example + Translation */}
                  <GridRow columns="1fr 1fr">
                    <FormGroup>
                      <Label theme={theme}>Câu ví dụ</Label>
                      <Textarea
                        theme={theme}
                        placeholder="She accomplished all her goals this year."
                        value={vocab.example}
                        onChange={(e) => handleVocabularyChange(index, 'example', e.target.value)}
                        rows={2}
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label theme={theme}>Dịch câu ví dụ</Label>
                      <Textarea
                        theme={theme}
                        placeholder="Cô ấy đã hoàn thành tất cả mục tiêu trong năm nay."
                        value={vocab.exampleTranslation}
                        onChange={(e) => handleVocabularyChange(index, 'exampleTranslation', e.target.value)}
                        rows={2}
                      />
                    </FormGroup>
                  </GridRow>

                  {/* Row 4: Media URLs */}
                  <GridRow columns="1fr 1fr">
                    <FormGroup>
                      <Label theme={theme}>URL hình ảnh</Label>
                      <Input
                        theme={theme}
                        type="text"
                        placeholder="https://example.com/image.jpg"
                        value={vocab.imageUrl}
                        onChange={(e) => handleVocabularyChange(index, 'imageUrl', e.target.value)}
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label theme={theme}>URL audio</Label>
                      <Input
                        theme={theme}
                        type="text"
                        placeholder="https://example.com/audio.mp3"
                        value={vocab.audioUrl}
                        onChange={(e) => handleVocabularyChange(index, 'audioUrl', e.target.value)}
                      />
                    </FormGroup>
                  </GridRow>
                </VocabularyItem>
              ))}
            </VocabularyList>

            {/* Add More Button */}
            <Button type="button" variant="secondary" onClick={handleAddVocabulary}>
              <Add /> Thêm từ vựng
            </Button>

            {/* Action Buttons */}
            <ButtonGroup>
              <Button type="button" variant="cancel" onClick={handleCancel}>
                <ArrowBack /> Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>Đang tạo...</>
                ) : (
                  <><Save /> Tạo {vocabularies.filter(v => v.word && v.translation).length} từ vựng</>
                )}
              </Button>
            </ButtonGroup>
          </Form>
        </Card>
      </FormContainer>
    </AdminLayout>
  );
};

export default AdminVocabularyBulkCreate;