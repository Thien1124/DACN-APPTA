import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import AdminLayout from '../layouts/AdminLayout';
import { adminService } from '../services/adminService';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';

// ========== STYLED COMPONENTS (giống AdminCourseForm) ==========
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
  min-height: 120px;
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

// ========== COMPONENT ==========

const AdminUnitForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: '',
    order: 1,
    imageUrl: '',
    isPublished: false
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCourses();
    if (id) {
      fetchUnit();
    }
  }, [id]);

  const fetchCourses = async () => {
    try {
      const response = await adminService.courses.getAll();
      setCourses(response.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchUnit = async () => {
    try {
      setLoading(true);
      const response = await adminService.units.getById(id);
      setFormData({
        ...response.data,
        course: response.data.course?._id || response.data.course
      });
    } catch (error) {
      console.error('Error fetching unit:', error);
      showToast('error', 'Lỗi', 'Không thể tải thông tin unit');
      navigate('/admin/units');
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Vui lòng nhập tên unit';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Vui lòng nhập mô tả';
    }

    if (!formData.course) {
      newErrors.course = 'Vui lòng chọn khóa học';
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
        await adminService.units.update(id, formData);
        showToast('success', 'Thành công', 'Đã cập nhật unit');
      } else {
        await adminService.units.create(formData);
        showToast('success', 'Thành công', 'Đã tạo unit mới');
      }
      navigate('/admin/units');
    } catch (error) {
      console.error('Error saving unit:', error);
      showToast('error', 'Lỗi', error.response?.data?.message || 'Không thể lưu unit');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/units');
  };

  return (
    <AdminLayout pageTitle={id ? 'Chỉnh sửa Unit' : 'Tạo Unit mới'}>
      <Toast toast={toast} onClose={hideToast} />

      <FormContainer>
        <PageTitle theme={theme}>
          {id ? '✏️ Chỉnh sửa Unit' : '➕ Tạo Unit mới'}
        </PageTitle>

        <Card theme={theme}>
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label theme={theme}>Khóa học *</Label>
              <Select
                theme={theme}
                name="course"
                value={formData.course}
                onChange={handleChange}
              >
                <option value="">-- Chọn khóa học --</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </Select>
              {errors.course && <ErrorText>{errors.course}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label theme={theme}>Tên unit *</Label>
              <Input
                theme={theme}
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="VD: Unit 1 - Greetings"
              />
              {errors.title && <ErrorText>{errors.title}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label theme={theme}>Mô tả *</Label>
              <Textarea
                theme={theme}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Mô tả chi tiết về unit..."
              />
              {errors.description && <ErrorText>{errors.description}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label theme={theme}>Thứ tự</Label>
              <Input
                theme={theme}
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                min="1"
              />
            </FormGroup>

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
              <CheckboxContainer>
                <Checkbox
                  type="checkbox"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleChange}
                />
                <Label theme={theme} style={{ marginBottom: 0 }}>
                  Công khai unit
                </Label>
              </CheckboxContainer>
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

export default AdminUnitForm;