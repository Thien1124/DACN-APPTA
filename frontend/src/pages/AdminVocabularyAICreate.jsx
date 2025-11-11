import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import { adminService } from '../services/adminService';
import { geminiService } from '../services/geminiService';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import Swal from 'sweetalert2';

import {
  AutoAwesome,
  ArrowBack,
  Save,
  Refresh,
  Add,
  Delete,
  Edit,
  Topic,
  Category,
  School,
  Numbers,
  Book,
  Lightbulb,
  Psychology,
} from '@mui/icons-material';

// ========== STYLED COMPONENTS ==========

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
  background: linear-gradient(135deg, #1CB0F6 0%, #667eea 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin: 0.5rem 0 0 0;
  font-weight: 500;
`;

const BackButton = styled.button`
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    background: #4b5563;
    transform: translateY(-2px);
  }
`;

const Card = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(135deg, rgba(31, 41, 55, 0.9) 0%, rgba(17, 24, 39, 0.9) 100%)' 
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 250, 251, 0.95) 100%)'
  };
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2.5rem;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.4)' 
    : 'rgba(229, 231, 235, 0.6)'
  };
  margin-bottom: 2rem;
  box-shadow: ${props => props.theme === 'dark' 
    ? '0 20px 40px rgba(0, 0, 0, 0.3)' 
    : '0 20px 40px rgba(0, 0, 0, 0.1)'
  };
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme === 'dark' 
      ? '0 25px 50px rgba(0, 0, 0, 0.4)' 
      : '0 25px 50px rgba(0, 0, 0, 0.15)'
    };
  }
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
`;

const Label = styled.label`
  font-weight: 700;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::after {
    content: ${props => props.required ? '"*"' : '""'};
    color: #ef4444;
    font-weight: bold;
  }
`;

const InputGroup = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 1rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  z-index: 1;
  pointer-events: none;
  transition: color 0.3s ease;
`;

const Input = styled.input`
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  border-radius: 14px;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #1CB0F6;
    box-shadow: 0 0 0 3px rgba(28, 176, 246, 0.1);
    transform: translateY(-1px);
  }

  &:hover {
    border-color: ${props => props.theme === 'dark' ? '#4b5563' : '#d1d5db'};
  }

  &::placeholder {
    color: ${props => props.theme === 'dark' ? '#6b7280' : '#9ca3af'};
    font-weight: 400;
  }
`;

const Select = styled.select`
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  border-radius: 14px;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1rem;

  &:focus {
    outline: none;
    border-color: #1CB0F6;
    box-shadow: 0 0 0 3px rgba(28, 176, 246, 0.1);
    transform: translateY(-1px);
  }

  &:hover {
    border-color: ${props => props.theme === 'dark' ? '#4b5563' : '#d1d5db'};
  }
`;

const GenerateButton = styled.button`
  background: linear-gradient(135deg, #1CB0F6 0%, #0ea5e9 100%);
  color: white;
  border: none;
  border-radius: 16px;
  padding: 1.25rem 2.5rem;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
  grid-column: 1 / -1;
  box-shadow: 0 4px 20px rgba(28, 176, 246, 0.3);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover {
    background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(28, 176, 246, 0.4);

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 10px rgba(28, 176, 246, 0.3);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 2px 10px rgba(28, 176, 246, 0.2);

    &::before {
      display: none;
    }
  }
`;

const ResultsSection = styled.div`
  margin-top: 2rem;
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ResultsTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SaveButton = styled.button`
  background: #58CC02;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    background: #45a302;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const VocabList = styled.div`
  display: grid;
  gap: 1rem;
`;

const VocabItem = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(135deg, rgba(55, 65, 81, 0.8) 0%, rgba(31, 41, 55, 0.8) 100%)' 
    : 'linear-gradient(135deg, rgba(243, 244, 246, 0.9) 0%, rgba(249, 250, 251, 0.9) 100%)'
  };
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.4)' 
    : 'rgba(229, 231, 235, 0.6)'
  };
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(180deg, #1CB0F6 0%, #667eea 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme === 'dark' 
      ? '0 8px 25px rgba(0, 0, 0, 0.3)' 
      : '0 8px 25px rgba(0, 0, 0, 0.1)'
    };

    &::before {
      opacity: 1;
    }
  }
`;

const VocabHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const VocabWord = styled.div`
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
`;

const VocabInput = styled.input`
  padding: 0.5rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  border-radius: 8px;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 0.875rem;
  margin-bottom: 0.5rem;

  &:focus {
    outline: none;
    border-color: #1CB0F6;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => {
    if (props.variant === 'edit') return '#1CB0F6';
    if (props.variant === 'delete') return '#ef4444';
    return '#6b7280';
  }};
  color: white;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

// ========== COMPONENT ==========

const AdminVocabularyAICreate = () => {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [generatedVocabularies, setGeneratedVocabularies] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  const [formData, setFormData] = useState({
    topic: '',
    category: 'GENERAL',
    level: 'INTERMEDIATE_B1',
    count: 10,
    lessonId: ''
  });

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const response = await adminService.lessons.getAll();
      setLessons(response.data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();

    if (!formData.topic.trim()) {
      showToast('warning', 'Cảnh báo', 'Vui lòng nhập chủ đề');
      return;
    }

    try {
      setLoading(true);
      showToast('info', 'Đang xử lý', '🤖 AI đang tạo từ vựng...');

      const response = await geminiService.generateVocabulary(
        formData.topic,
        formData.category,
        formData.level,
        formData.count
      );

      if (response.success && response.data) {
        // Transform AI data to frontend format (API already returns correct structure)
        const vocabularies = response.data.map(vocab => ({
          word: vocab.word || '',
          translation: vocab.meaning || '',  // ✅ API returns 'meaning'
          phonetic: vocab.pronunciation || '',
          example: vocab.example || '',
          exampleTranslation: vocab.exampleVietnamese || '',  // ✅ API returns 'exampleVietnamese'
          difficulty: vocab.difficulty || 'medium',
          partOfSpeech: vocab.partOfSpeech || '',
          imageUrl: vocab.imageUrl || '',
          audioUrl: vocab.audioUrl || ''
        }));

        setGeneratedVocabularies(vocabularies);
        showToast('success', 'Thành công', `✅ Đã tạo ${vocabularies.length} từ vựng`);
      } else {
        throw new Error(response.message || 'Không thể tạo từ vựng');
      }
    } catch (error) {
      console.error('Generate error:', error);
      showToast('error', 'Lỗi', error.message || 'Không thể tạo từ vựng với AI');
    } finally {
      setLoading(false);
    }
  };

  const handleEditVocab = (index) => {
    setEditingIndex(index);
  };

  const handleSaveVocab = (index) => {
    setEditingIndex(null);
  };

  const handleDeleteVocab = (index) => {
    setGeneratedVocabularies(prev => prev.filter((_, i) => i !== index));
  };

  const handleVocabChange = (index, field, value) => {
    setGeneratedVocabularies(prev => 
      prev.map((vocab, i) => 
        i === index ? { ...vocab, [field]: value } : vocab
      )
    );
  };

  const handleSaveAll = async () => {
    if (generatedVocabularies.length === 0) {
      showToast('warning', 'Cảnh báo', 'Không có từ vựng nào để lưu');
      return;
    }

    try {
      setSaving(true);
      showToast('info', 'Đang lưu', 'Đang lưu từ vựng vào database...');

      // Prepare data for bulk create
      const vocabData = generatedVocabularies.map(vocab => ({
        word: vocab.word,
        translation: vocab.translation,
        phonetic: vocab.phonetic,
        example: vocab.example,
        exampleTranslation: vocab.exampleTranslation,
        difficulty: vocab.difficulty,
        partOfSpeech: vocab.partOfSpeech,
        imageUrl: vocab.imageUrl,
        audioUrl: vocab.audioUrl,
        lesson: formData.lessonId || null
      }));

      await adminService.vocabularies.bulkCreate(vocabData);

      showToast('success', 'Thành công', `✅ Đã lưu ${vocabData.length} từ vựng`);
      navigate('/admin/vocabularies');
    } catch (error) {
      console.error('Save error:', error);
      showToast('error', 'Lỗi', error.response?.data?.message || 'Không thể lưu từ vựng');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout pageTitle="Tạo Từ vựng bằng AI">
      <Toast toast={toast} onClose={hideToast} />

      <PageHeader>
        <div>
          <Title theme={theme}>
            <Psychology sx={{ fontSize: 32 }} />
            Tạo Từ vựng bằng AI
          </Title>
          <Subtitle theme={theme}>
            Sử dụng trí tuệ nhân tạo để tạo từ vựng chất lượng cao với phiên âm, nghĩa và ví dụ tự nhiên
          </Subtitle>
        </div>
        <BackButton onClick={() => navigate('/admin/vocabularies')}>
          <ArrowBack />
          Quay lại
        </BackButton>
      </PageHeader>

      <Card theme={theme}>
        <Form onSubmit={handleGenerate}>
          <FormGroup>
            <Label theme={theme} required>Chủ đề</Label>
            <InputGroup>
              <InputIcon theme={theme}>
                <Topic sx={{ fontSize: 20 }} />
              </InputIcon>
              <Input
                theme={theme}
                type="text"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                placeholder="VD: Business English, Travel Vocabulary, Technology Terms..."
                required
                disabled={loading}
              />
            </InputGroup>
          </FormGroup>

          <FormGroup>
            <Label theme={theme}>Danh mục</Label>
            <InputGroup>
              <InputIcon theme={theme}>
                <Category sx={{ fontSize: 20 }} />
              </InputIcon>
              <Select
                theme={theme}
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="GENERAL">Tổng hợp</option>
                <option value="BUSINESS">Kinh doanh</option>
                <option value="ACADEMIC">Học thuật</option>
                <option value="TRAVEL">Du lịch</option>
                <option value="TECHNOLOGY">Công nghệ</option>
                <option value="DAILY">Hàng ngày</option>
              </Select>
            </InputGroup>
          </FormGroup>

          <FormGroup>
            <Label theme={theme}>Trình độ</Label>
            <InputGroup>
              <InputIcon theme={theme}>
                <School sx={{ fontSize: 20 }} />
              </InputIcon>
              <Select
                theme={theme}
                name="level"
                value={formData.level}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="BEGINNER_A1">Sơ Cấp A1</option>
                <option value="BEGINNER_A2">Sơ Cấp A2</option>
                <option value="INTERMEDIATE_B1">Trung Cấp B1</option>
                <option value="INTERMEDIATE_B2">Trung Cấp B2</option>
                <option value="ADVANCED_C1">Cao Cấp C1</option>
                <option value="ADVANCED_C2">Cao Cấp C2</option>
              </Select>
            </InputGroup>
          </FormGroup>

          <FormGroup>
            <Label theme={theme}>Số lượng từ</Label>
            <InputGroup>
              <InputIcon theme={theme}>
                <Numbers sx={{ fontSize: 20 }} />
              </InputIcon>
              <Input
                theme={theme}
                type="number"
                name="count"
                value={formData.count}
                onChange={handleChange}
                min="5"
                max="50"
                placeholder="5-50 từ"
                disabled={loading}
              />
            </InputGroup>
          </FormGroup>

          <FormGroup>
            <Label theme={theme}>Bài học (tùy chọn)</Label>
            <InputGroup>
              <InputIcon theme={theme}>
                <Book sx={{ fontSize: 20 }} />
              </InputIcon>
              <Select
                theme={theme}
                name="lessonId"
                value={formData.lessonId}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Không gán bài học</option>
                {lessons.map(lesson => (
                  <option key={lesson._id} value={lesson._id}>
                    {lesson.title}
                  </option>
                ))}
              </Select>
            </InputGroup>
          </FormGroup>

          <GenerateButton type="submit" disabled={loading}>
            {loading ? (
              <>
                <Refresh sx={{ fontSize: 22 }} />
                Đang tạo từ vựng...
              </>
            ) : (
              <>
                <Lightbulb sx={{ fontSize: 22 }} />
                Tạo Từ vựng với AI
              </>
            )}
          </GenerateButton>
        </Form>
      </Card>

      {generatedVocabularies.length > 0 && (
        <ResultsSection>
          <Card theme={theme}>
            <ResultsHeader>
              <ResultsTitle theme={theme}>
                <AutoAwesome />
                Từ vựng đã tạo ({generatedVocabularies.length})
              </ResultsTitle>
              <SaveButton onClick={handleSaveAll} disabled={saving}>
                {saving ? (
                  <>
                    <Refresh sx={{ fontSize: 18 }} />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save sx={{ fontSize: 18 }} />
                    Lưu tất cả
                  </>
                )}
              </SaveButton>
            </ResultsHeader>

            <VocabList>
              {generatedVocabularies.map((vocab, index) => (
                <VocabItem key={index} theme={theme}>
                  <VocabHeader>
                    <VocabWord theme={theme}>
                      {editingIndex === index ? (
                        <VocabInput
                          theme={theme}
                          value={vocab.word}
                          onChange={(e) => handleVocabChange(index, 'word', e.target.value)}
                          placeholder="Từ vựng"
                        />
                      ) : (
                        vocab.word
                      )}
                    </VocabWord>
                    <ActionButtons>
                      {editingIndex === index ? (
                        <ActionButton variant="edit" onClick={() => handleSaveVocab(index)}>
                          <Save sx={{ fontSize: 16 }} />
                        </ActionButton>
                      ) : (
                        <ActionButton variant="edit" onClick={() => handleEditVocab(index)}>
                          <Edit sx={{ fontSize: 16 }} />
                        </ActionButton>
                      )}
                      <ActionButton variant="delete" onClick={() => handleDeleteVocab(index)}>
                        <Delete sx={{ fontSize: 16 }} />
                      </ActionButton>
                    </ActionButtons>
                  </VocabHeader>

                  {editingIndex === index ? (
                    <>
                      <VocabInput
                        theme={theme}
                        value={vocab.phonetic || ''}
                        onChange={(e) => handleVocabChange(index, 'phonetic', e.target.value)}
                        placeholder="Phiên âm (IPA)"
                      />
                      <VocabInput
                        theme={theme}
                        value={vocab.translation || ''}
                        onChange={(e) => handleVocabChange(index, 'translation', e.target.value)}
                        placeholder="Nghĩa tiếng Việt"
                      />
                      <VocabInput
                        theme={theme}
                        value={vocab.example || ''}
                        onChange={(e) => handleVocabChange(index, 'example', e.target.value)}
                        placeholder="Ví dụ tiếng Anh"
                      />
                      <VocabInput
                        theme={theme}
                        value={vocab.exampleTranslation || ''}
                        onChange={(e) => handleVocabChange(index, 'exampleTranslation', e.target.value)}
                        placeholder="Dịch ví dụ"
                      />
                    </>
                  ) : (
                    <>
                      {vocab.phonetic && (
                        <div style={{ fontSize: '0.875rem', color: '#1CB0F6', marginBottom: '0.5rem' }}>
                          <strong>Phiên âm:</strong> {vocab.phonetic}
                        </div>
                      )}
                      {vocab.translation && (
                        <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                          <strong>Nghĩa:</strong> {vocab.translation}
                        </div>
                      )}
                      {vocab.example && (
                        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                          <strong>Ví dụ:</strong> {vocab.example}
                        </div>
                      )}
                      {vocab.exampleTranslation && (
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          <strong>Dịch:</strong> {vocab.exampleTranslation}
                        </div>
                      )}
                    </>
                  )}
                </VocabItem>
              ))}
            </VocabList>
          </Card>
        </ResultsSection>
      )}
    </AdminLayout>
  );
};

export default AdminVocabularyAICreate;