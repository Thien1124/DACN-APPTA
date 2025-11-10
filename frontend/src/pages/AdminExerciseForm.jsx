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
  ArrowBack,
  Assignment,
  List,
  VolumeUp // ✅ Thêm icon loa
} from '@mui/icons-material';

// ========== STYLED COMPONENTS (tương tự AdminVocabularyForm) ==========
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
  margin-bottom: 1.5rem;
`;

const PageTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
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

const OptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const OptionItem = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const OptionInput = styled(Input)`
  flex: 1;
`;


const AddButton = styled.button`
  padding: 0.5rem 1rem;
  background: #1CB0F6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    font-size: 20px;
  }

  &:hover {
    opacity: 0.9;
  }
`;

const RemoveButton = styled.button`
  padding: 0.5rem 1rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.9;
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

const HelpText = styled.span`
  color: ${props => props.theme === 'dark' ? '#a1a1aa' : '#575757'};
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: block;
`;

// ========== COMPONENT ==========
const AdminExerciseForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [loading, setLoading] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [formData, setFormData] = useState({
    lesson: '',
    type: 'multiple-choice',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
    points: 10,
    difficulty: 'medium'
  });
  const [errors, setErrors] = useState({});
  // ✅ Thêm state cho audio
  const [audioPlaying, setAudioPlaying] = useState(false);

  useEffect(() => {
    fetchLessons();
    if (id) {
      fetchExercise();
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

  const fetchExercise = async () => {
  try {
    setLoading(true);
    const response = await adminService.exercises.getById(id);
    
    // Transform từ backend format về frontend format
    const exerciseData = response.data;
    const transformedData = {
      ...exerciseData,
      lesson: exerciseData.lesson?._id || exerciseData.lesson
    };

    // Transform options cho multiple-choice
    if (exerciseData.type === 'multiple-choice' && exerciseData.options) {
      transformedData.options = exerciseData.options.map(opt => opt.text);
      // Tìm correctOption từ options
      const correctOption = exerciseData.options.find(opt => opt.isCorrect);
      transformedData.correctAnswer = correctOption ? correctOption.text : '';
    }

    setFormData(transformedData);
  } catch (error) {
    console.error('Error fetching exercise:', error);
    showToast('error', 'Lỗi', 'Không thể tải thông tin bài tập');
    navigate('/admin/exercises');
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

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const handleAddOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const handleRemoveOption = (index) => {
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  // ✅ Thêm function phát âm thanh
  const speakText = (text) => {
    if (!text.trim()) {
      showToast('warning', 'Cảnh báo', 'Không có text để phát âm');
      return;
    }

    // Stop any current speech
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language to English (có thể thêm option để chọn ngôn ngữ)
    utterance.lang = 'en-US'; // Có thể thêm select để chọn ngôn ngữ
    
    // Set voice (optional)
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(voice => voice.lang.startsWith('en'));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.rate = 0.8; // Slower for listening exercises
    utterance.pitch = 1;

    utterance.onstart = () => setAudioPlaying(true);
    utterance.onend = () => setAudioPlaying(false);
    utterance.onerror = () => {
      setAudioPlaying(false);
      showToast('error', 'Lỗi', 'Không thể phát âm thanh');
    };

    window.speechSynthesis.speak(utterance);
  };

  const validateForm = () => {
  const newErrors = {};

  if (!formData.lesson) {
    newErrors.lesson = 'Vui lòng chọn bài học';
  }

  if (!formData.question.trim()) {
    newErrors.question = 'Vui lòng nhập câu hỏi';
  }

  if (formData.type === 'multiple-choice') {
    if (formData.options.some(opt => !opt.trim())) {
      newErrors.options = 'Vui lòng điền đầy đủ các lựa chọn';
    }
    if (!formData.correctAnswer.trim()) {
      newErrors.correctAnswer = 'Vui lòng nhập đáp án đúng';
    } else if (!formData.options.includes(formData.correctAnswer)) {
      newErrors.correctAnswer = 'Đáp án đúng phải trùng với một trong các lựa chọn';
    }
  }

  // ✅ Thêm validation cho fill-in-blank và translation
  if (formData.type === 'fill-in-blank' || formData.type === 'translation') {
    if (!formData.correctAnswer.trim()) {
      newErrors.correctAnswer = 'Vui lòng nhập đáp án đúng';
    }
  }

  // ✅ Thêm validation cho listening
  if (formData.type === 'listening') {
    if (!formData.correctAnswer.trim()) {
      newErrors.correctAnswer = 'Vui lòng nhập đáp án đúng';
    }
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
      // Transform data cho backend
      const submitData = { ...formData };

      // ✅ XỬ LÝ TỪNG LOẠI BÀI TẬP
      if (formData.type === 'multiple-choice') {
        // Multiple choice: Transform options thành array of objects
        submitData.options = formData.options.map(option => ({
          text: option,
          isCorrect: option === formData.correctAnswer
        }));
        // Xóa correctAnswer vì backend lưu trong options
        delete submitData.correctAnswer;
      } 
      else if (formData.type === 'fill-in-blank' || formData.type === 'translation') {
        // Fill-in-blank và Translation: Chỉ cần correctAnswer
        submitData.options = []; // Xóa options
        submitData.correctAnswer = formData.correctAnswer.trim();
      }
      else if (formData.type === 'listening' || formData.type === 'speaking' || formData.type === 'matching') {
        // Các loại khác: Giữ nguyên correctAnswer và xóa options nếu không dùng
        submitData.options = [];
        submitData.correctAnswer = formData.correctAnswer.trim();
        
        // ✅ Thêm audioUrl nếu có (cho listening)
        if (formData.type === 'listening') {
          submitData.audioUrl = formData.audioUrl || null; // Có thể thêm field audioUrl sau
        }
      }

      console.log('📤 Submit data:', submitData);

      if (id) {
        await adminService.exercises.update(id, submitData);
        showToast('success', 'Thành công', 'Đã cập nhật bài tập');
      } else {
        await adminService.exercises.create(submitData);
        showToast('success', 'Thành công', 'Đã tạo bài tập mới');
      }
      navigate('/admin/exercises');
    } catch (error) {
      console.error('❌ Error saving exercise:', error);
      console.error('Error response:', error.response?.data);
      showToast('error', 'Lỗi', error.response?.data?.message || 'Không thể lưu bài tập');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/exercises');
  };

  return (
    <AdminLayout pageTitle={id ? 'Chỉnh sửa Bài tập' : 'Tạo Bài tập mới'}>
      <Toast toast={toast} onClose={hideToast} />

      <FormContainer>
        <PageTitle theme={theme}>
          {id ? (
            <><Edit sx={{ mr: 1 }} /> Chỉnh sửa Bài tập</>
          ) : (
            <><Add sx={{ mr: 1 }} /> Tạo Bài tập mới</>
          )}
        </PageTitle>

        <Card theme={theme}>
          <form onSubmit={handleSubmit}>
            <SectionTitle theme={theme}>
              <Assignment sx={{ fontSize: 20 }} /> Thông tin cơ bản
            </SectionTitle>

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

            <FormRow columns="1fr 1fr 1fr">
              <FormGroup>
                <Label theme={theme}>Loại bài tập</Label>
                <Select
                  theme={theme}
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="multiple-choice">Trắc nghiệm</option>
                  <option value="fill-in-blank">Điền vào chỗ trống</option>
                  <option value="listening">Nghe</option>
                  <option value="speaking">Nói</option>
                  <option value="matching">Ghép đôi</option>
                  <option value="translation">Dịch</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label theme={theme}>Điểm</Label>
                <Input
                  theme={theme}
                  type="number"
                  name="points"
                  value={formData.points}
                  onChange={handleChange}
                  min="0"
                />
              </FormGroup>

              <FormGroup>
                <Label theme={theme}>Độ khó</Label>
                <Select
                  theme={theme}
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                >
                  <option value="easy">Dễ</option>
                  <option value="medium">Trung bình</option>
                  <option value="hard">Khó</option>
                </Select>
              </FormGroup>
            </FormRow>

            <FormGroup>
              <Label theme={theme}>Câu hỏi *</Label>
              <Textarea
                theme={theme}
                name="question"
                value={formData.question}
                onChange={handleChange}
                placeholder="Nhập câu hỏi..."
              />
              {errors.question && <ErrorText>{errors.question}</ErrorText>}
            </FormGroup>

            {formData.type === 'multiple-choice' && (
              <>
                <SectionTitle theme={theme}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <List /> Lựa chọn
                  </div>
                  <AddButton type="button" onClick={handleAddOption}>
                    <Add /> Thêm lựa chọn
                  </AddButton>
                </SectionTitle>

                <OptionsList>
                  {formData.options.map((option, index) => (
                    <OptionItem key={index}>
                      <span style={{ minWidth: '30px' }}>{index + 1}.</span>
                      <OptionInput
                        theme={theme}
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Lựa chọn ${index + 1}`}
                      />
                      {formData.options.length > 2 && (
                        <RemoveButton type="button" onClick={() => handleRemoveOption(index)}>
                          ✕
                        </RemoveButton>
                      )}
                    </OptionItem>
                  ))}
                </OptionsList>
                {errors.options && <ErrorText>{errors.options}</ErrorText>}

                <FormGroup style={{ marginTop: '1.5rem' }}>
                  <Label theme={theme}>Đáp án đúng *</Label>
                  <Input
                    theme={theme}
                    type="text"
                    name="correctAnswer"
                    value={formData.correctAnswer}
                    onChange={handleChange}
                    placeholder="Nhập đáp án đúng (giống với một trong các lựa chọn)"
                  />
                  {errors.correctAnswer && <ErrorText>{errors.correctAnswer}</ErrorText>}
                </FormGroup>
              </>
            )}

            {/* ✅ Thêm form cho fill-in-blank và translation */}
            {(formData.type === 'fill-in-blank' || formData.type === 'translation') && (
              <FormGroup>
                <Label theme={theme}>Đáp án đúng *</Label>
                <Input
                  theme={theme}
                  type="text"
                  name="correctAnswer"
                  value={formData.correctAnswer}
                  onChange={handleChange}
                  placeholder={
                    formData.type === 'fill-in-blank' 
                      ? 'VD: am' 
                      : 'VD: I like learning English'
                  }
                />
                {errors.correctAnswer && <ErrorText>{errors.correctAnswer}</ErrorText>}
              </FormGroup>
            )}

            {/* ✅ Thêm form cho listening với icon loa */}
            {formData.type === 'listening' && (
              <FormGroup>
                <Label theme={theme}>Đáp án đúng *</Label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Input
                    theme={theme}
                    type="text"
                    name="correctAnswer"
                    value={formData.correctAnswer}
                    onChange={handleChange}
                    placeholder="VD: thank you"
                    style={{ flex: 1 }}
                  />
                  <PlayButton
                    type="button"
                    onClick={() => speakText(formData.correctAnswer)}
                    disabled={audioPlaying || !formData.correctAnswer.trim()}
                    theme={theme}
                    title="Phát âm thanh"
                  >
                    <VolumeUp sx={{ fontSize: 20 }} />
                  </PlayButton>
                </div>
                {errors.correctAnswer && <ErrorText>{errors.correctAnswer}</ErrorText>}
                <HelpText theme={theme}>
                  Đáp án người dùng cần nghe và viết lại. Ấn vào loa để nghe phát âm.
                </HelpText>
              </FormGroup>
            )}

            {/* ✅ Thêm form cho speaking */}
            {formData.type === 'speaking' && (
              <FormGroup>
                <Label theme={theme}>Câu mẫu cần đọc *</Label>
                <Input
                  theme={theme}
                  type="text"
                  name="correctAnswer"
                  value={formData.correctAnswer}
                  onChange={handleChange}
                  placeholder="VD: Hello, how are you?"
                />
                {errors.correctAnswer && <ErrorText>{errors.correctAnswer}</ErrorText>}
                <HelpText theme={theme}>
                  Câu mẫu để hệ thống so sánh với audio của người dùng
                </HelpText>
              </FormGroup>
            )}

            {/* ✅ Thêm form cho matching */}
            {formData.type === 'matching' && (
              <FormGroup>
                <Label theme={theme}>Đáp án (JSON format) *</Label>
                <Textarea
                  theme={theme}
                  name="correctAnswer"
                  value={formData.correctAnswer}
                  onChange={handleChange}
                  placeholder='VD: {"hello": "xin chào", "goodbye": "tạm biệt"}'
                  rows={5}
                />
                {errors.correctAnswer && <ErrorText>{errors.correctAnswer}</ErrorText>}
                <HelpText theme={theme}>
                  Nhập JSON với cặp key-value để ghép đôi
                </HelpText>
              </FormGroup>
            )}

            <FormGroup>
              <Label theme={theme}>Giải thích</Label>
              <Textarea
                theme={theme}
                name="explanation"
                value={formData.explanation}
                onChange={handleChange}
                placeholder="Giải thích đáp án (tùy chọn)..."
              />
            </FormGroup>

            <ButtonGroup>
              <Button
                type="button"
                variant="cancel"
                theme={theme}
                onClick={handleCancel}
                disabled={loading}
              >
                <ArrowBack sx={{ fontSize: 18 }} /> Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Đang lưu...' : (
                  id ? (
                    <><Edit sx={{ fontSize: 18 }} /> Cập nhật</>
                  ) : (
                    <><Add sx={{ fontSize: 18 }} /> Tạo mới</>
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

// ✅ Thêm styled component cho PlayButton
const PlayButton = styled.button`
  padding: 0.75rem;
  background: ${props => props.disabled 
    ? (props.theme === 'dark' ? '#374151' : '#e5e7eb')
    : '#58CC02'
  };
  color: ${props => props.disabled 
    ? (props.theme === 'dark' ? '#6b7280' : '#9ca3af')
    : 'white'
  };
  border: none;
  border-radius: 8px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 50px;

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: scale(1.05);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }
`;
export default AdminExerciseForm;
