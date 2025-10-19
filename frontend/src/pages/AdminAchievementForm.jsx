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

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const IconPreview = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  margin-top: 0.5rem;
`;

const IconGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 1rem;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#f9fafb'};
  border-radius: 8px;
`;

const IconButton = styled.button`
  width: 50px;
  height: 50px;
  border: 2px solid ${props => props.selected ? '#58CC02' : 'transparent'};
  background: ${props => props.theme === 'dark' ? '#374151' : '#ffffff'};
  border-radius: 8px;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
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
const AdminAchievementForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '🏆',
    type: 'xp',
    targetValue: 100,
    xpReward: 50,
    isActive: true
  });
  const [errors, setErrors] = useState({});

  // Common achievement icons
  const commonIcons = [
    '🏆', '🥇', '🥈', '🥉', '⭐', '🌟', '✨', '💎',
    '👑', '🎖️', '🏅', '🎯', '🚀', '💪', '🔥', '⚡',
    '📚', '📖', '✍️', '🎓', '🧠', '💡', '🎨', '🎭'
  ];

  useEffect(() => {
    if (id) {
      fetchAchievement();
    }
  }, [id]);

  const fetchAchievement = async () => {
    try {
      setLoading(true);
      const response = await adminService.achievements.getById(id);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching achievement:', error);
      showToast('error', 'Lỗi', 'Không thể tải thông tin thành tích');
      navigate('/admin/achievements');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleIconSelect = (icon) => {
    setFormData(prev => ({ ...prev, icon }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên thành tích';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Vui lòng nhập mô tả';
    }

    if (!formData.targetValue || formData.targetValue <= 0) {
      newErrors.targetValue = 'Giá trị mục tiêu phải lớn hơn 0';
    }

    if (!formData.xpReward || formData.xpReward < 0) {
      newErrors.xpReward = 'XP thưởng phải lớn hơn hoặc bằng 0';
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
        await adminService.achievements.update(id, formData);
        showToast('success', 'Thành công', 'Đã cập nhật thành tích');
      } else {
        await adminService.achievements.create(formData);
        showToast('success', 'Thành công', 'Đã tạo thành tích mới');
      }
      navigate('/admin/achievements');
    } catch (error) {
      console.error('Error saving achievement:', error);
      showToast('error', 'Lỗi', error.response?.data?.message || 'Không thể lưu thành tích');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/achievements');
  };

  return (
    <AdminLayout pageTitle={id ? 'Chỉnh sửa Thành tích' : 'Tạo Thành tích mới'}>
      <Toast toast={toast} onClose={hideToast} />

      <FormContainer>
        <PageTitle theme={theme}>
          {id ? '✏️ Chỉnh sửa Thành tích' : '➕ Tạo Thành tích mới'}
        </PageTitle>

        <Card theme={theme}>
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label theme={theme}>Tên thành tích *</Label>
              <Input
                theme={theme}
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="VD: First Steps"
              />
              {errors.name && <ErrorText>{errors.name}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label theme={theme}>Mô tả *</Label>
              <Textarea
                theme={theme}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Mô tả chi tiết về cách đạt được thành tích này..."
              />
              {errors.description && <ErrorText>{errors.description}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label theme={theme}>Icon</Label>
              <IconPreview>{formData.icon}</IconPreview>
              <IconGrid theme={theme}>
                {commonIcons.map(icon => (
                  <IconButton
                    key={icon}
                    type="button"
                    theme={theme}
                    selected={formData.icon === icon}
                    onClick={() => handleIconSelect(icon)}
                  >
                    {icon}
                  </IconButton>
                ))}
              </IconGrid>
              <HelpText theme={theme}>
                Hoặc nhập emoji tùy chỉnh:
              </HelpText>
              <Input
                theme={theme}
                type="text"
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                placeholder="🏆"
                maxLength="2"
                style={{ marginTop: '0.5rem' }}
              />
            </FormGroup>

            <FormRow columns="1fr 1fr">
              <FormGroup>
                <Label theme={theme}>Loại thành tích</Label>
                <Select
                  theme={theme}
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="xp">XP - Điểm kinh nghiệm</option>
                  <option value="streak">Streak - Chuỗi ngày học</option>
                  <option value="lessons">Lessons - Số bài học</option>
                  <option value="exercises">Exercises - Số bài tập</option>
                  <option value="vocabulary">Vocabulary - Số từ vựng</option>
                  <option value="perfect-score">Perfect Score - Điểm tuyệt đối</option>
                  <option value="time">Time - Thời gian học</option>
                  <option value="level">Level - Cấp độ</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label theme={theme}>Giá trị mục tiêu *</Label>
                <Input
                  theme={theme}
                  type="number"
                  name="targetValue"
                  value={formData.targetValue}
                  onChange={handleChange}
                  min="1"
                  placeholder="100"
                />
                {errors.targetValue && <ErrorText>{errors.targetValue}</ErrorText>}
                <HelpText theme={theme}>
                  {formData.type === 'xp' && 'Số XP cần đạt'}
                  {formData.type === 'streak' && 'Số ngày liên tiếp'}
                  {formData.type === 'lessons' && 'Số bài học cần hoàn thành'}
                  {formData.type === 'exercises' && 'Số bài tập cần làm'}
                  {formData.type === 'vocabulary' && 'Số từ vựng cần học'}
                  {formData.type === 'time' && 'Số phút học tập'}
                  {formData.type === 'level' && 'Cấp độ cần đạt'}
                </HelpText>
              </FormGroup>
            </FormRow>

            <FormGroup>
              <Label theme={theme}>XP thưởng</Label>
              <Input
                theme={theme}
                type="number"
                name="xpReward"
                value={formData.xpReward}
                onChange={handleChange}
                min="0"
                placeholder="50"
              />
              {errors.xpReward && <ErrorText>{errors.xpReward}</ErrorText>}
              <HelpText theme={theme}>
                Số XP người dùng nhận được khi đạt thành tích này
              </HelpText>
            </FormGroup>

            <FormGroup>
              <CheckboxContainer>
                <Checkbox
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
                <Label theme={theme} style={{ marginBottom: 0 }}>
                  Kích hoạt thành tích
                </Label>
              </CheckboxContainer>
              <HelpText theme={theme}>
                Chỉ các thành tích được kích hoạt mới hiển thị cho người dùng
              </HelpText>
            </FormGroup>

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

export default AdminAchievementForm;