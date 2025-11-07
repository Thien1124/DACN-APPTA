import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import AdminLayout from '../layouts/AdminLayout';
import { adminService } from '../services/adminService';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import {
  Add,
  Edit,
  Save
} from '@mui/icons-material';
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
  min-height: 80px;
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
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.875rem;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

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

// ========== COMPONENT ==========
const AdminVocabularyForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [loading, setLoading] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [formData, setFormData] = useState({
    word: '',
    translation: '',  
    phonetic: '',
    partOfSpeech: 'noun',
    example: '',  
    exampleTranslation: '',
    imageUrl: '',
    audioUrl: '',
    lesson: '',
    difficulty: 'medium'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchLessons();
    if (id) {
      fetchVocabulary();
    }
  }, [id]);

  const fetchLessons = async () => {
    try {
      const response = await adminService.lessons.getAll();
      setLessons(response.data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  const fetchVocabulary = async () => {
    try {
      setLoading(true);
      const response = await adminService.vocabularies.getById(id);
      setFormData({
        word: response.data.word || '',
        translation: response.data.translation || '',  // Map từ backend
        phonetic: response.data.phonetic || '',
        partOfSpeech: response.data.partOfSpeech || 'noun',
        example: response.data.example || '',  // Map từ backend
        exampleTranslation: response.data.exampleTranslation || '',
        imageUrl: response.data.imageUrl || '',
        audioUrl: response.data.audioUrl || '',
        lesson: response.data.lesson?._id || response.data.lesson,
        difficulty: response.data.difficulty || 'medium'
      });
    } catch (error) {
      console.error('Error fetching vocabulary:', error);
      showToast('error', 'Lỗi', 'Không thể tải thông tin từ vựng');
      navigate('/admin/vocabularies');
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

    if (!formData.word.trim()) {
      newErrors.word = 'Vui lòng nhập từ vựng';
    }

    if (!formData.translation.trim()) {  
      newErrors.translation = 'Vui lòng nhập nghĩa';
    }

    if (!formData.lesson) {
      newErrors.lesson = 'Vui lòng chọn bài học';
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
        await adminService.vocabularies.update(id, formData);
        showToast('success', 'Thành công', 'Đã cập nhật từ vựng');
      } else {
        await adminService.vocabularies.create(formData);
        showToast('success', 'Thành công', 'Đã tạo từ vựng mới');
      }
      navigate('/admin/vocabularies');
    } catch (error) {
      console.error('Error saving vocabulary:', error);
      showToast('error', 'Lỗi', error.response?.data?.message || 'Không thể lưu từ vựng');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/vocabularies');
  };

  return (
    <AdminLayout pageTitle={id ? 'Chỉnh sửa Từ vựng' : 'Tạo Từ vựng mới'}>
      <Toast toast={toast} onClose={hideToast} />

      <FormContainer>
        <PageTitle theme={theme}>
          {id ? (
            <><Edit sx={{ mr: 1 }} /> Chỉnh sửa Từ vựng</>
          ) : (
            <><Add sx={{ mr: 1 }} /> Tạo Từ vựng mới</>
          )}
        </PageTitle>

        <Card theme={theme}>
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label theme={theme}>Bài học *</Label>
              <Select
                theme={theme}
                name="lesson"
                value={formData.lesson}
                onChange={handleChange}
              >
                <option value="">-- Chọn bài học --</option>
                {lessons.map(lesson => (
                  <option key={lesson._id} value={lesson._id}>
                    {lesson.title}
                  </option>
                ))}
              </Select>
              {errors.lesson && <ErrorText>{errors.lesson}</ErrorText>}
            </FormGroup>

            <FormRow columns="2fr 1fr">
              <FormGroup>
                <Label theme={theme}>Từ vựng *</Label>
                <Input
                  theme={theme}
                  type="text"
                  name="word"
                  value={formData.word}
                  onChange={handleChange}
                  placeholder="VD: accomplish"
                />
                {errors.word && <ErrorText>{errors.word}</ErrorText>}
              </FormGroup>

              <FormGroup>
                <Label theme={theme}>Phát âm</Label>
                <Input
                  theme={theme}
                  type="text"
                  name="phonetic"
                  value={formData.phonetic}
                  onChange={handleChange}
                  placeholder="/əˈkʌmplɪʃ/"
                />
              </FormGroup>
            </FormRow>

            <FormRow columns="1fr">
              
              <FormGroup>
                <Label theme={theme}>Độ khó</Label>
                <Select
                  theme={theme}
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                >
                  <option value="easy">Easy - Dễ</option>
                  <option value="medium">Medium - Trung bình</option>
                  <option value="hard">Hard - Khó</option>
                </Select>
              </FormGroup>
            </FormRow>

            <FormGroup>
              <Label theme={theme}>Nghĩa *</Label>
              <Textarea
                theme={theme}
                name="translation"  // Thay 'meaning'
                value={formData.translation}  // Thay 'meaning'
                onChange={handleChange}
                placeholder="Hoàn thành, đạt được (mục tiêu, nhiệm vụ)"
              />
              {errors.translation && <ErrorText>{errors.translation}</ErrorText>}  
            </FormGroup>

            <FormGroup>
              <Label theme={theme}>Câu ví dụ</Label>
              <Textarea
                theme={theme}
                name="example"  // Thay 'exampleSentence'
                value={formData.example}  // Thay 'exampleSentence'
                onChange={handleChange}
                placeholder="She accomplished all her goals this year."
              />
            </FormGroup>

            <FormGroup>
              <Label theme={theme}>Dịch câu ví dụ</Label>
              <Textarea
                theme={theme}
                name="exampleTranslation"
                value={formData.exampleTranslation}
                onChange={handleChange}
                placeholder="Cô ấy đã hoàn thành tất cả mục tiêu của mình trong năm nay."
              />
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
                {loading ? 'Đang lưu...' : (
                  id ? (
                    <><Save sx={{ mr: 1 }} /> Cập nhật</>
                  ) : (
                    <><Add sx={{ mr: 1 }} /> Tạo mới</>
                  )
                )}
              </Button>
            </ButtonGroup>
          </form>
        </Card>
      </FormContainer>
    </AdminLayout>
  );
};

export default AdminVocabularyForm;