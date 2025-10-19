import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import { authService } from '../services/authService';
import LeftSidebar from '../components/LeftSidebar';
import Avatar from '../components/Avatar'; // ✅ Import Avatar

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    avatar: null, // ✅ Thêm avatar vào state
    currentPassword: '',
    newPassword: ''
  });

  // Fetch user profile from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authService.getProfile();
        if (response.success && response.data?.user) {
          const user = response.data.user;
          setFormData({
            name: user.name || '',
            username: user.username || user.email.split('@')[0],
            email: user.email || '',
            avatar: user.avatar || null, // ✅ Lấy avatar từ API
            currentPassword: '',
            newPassword: ''
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        showToast('error', 'Lỗi', 'Không thể tải thông tin profile');
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ✅ Xử lý khi avatar thay đổi
  const handleAvatarChange = (newAvatarPath) => {
    console.log('Avatar changed:', newAvatarPath); // Debug
    
    setFormData(prev => ({
      ...prev,
      avatar: newAvatarPath // Lưu path thay vì URL
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast('error', 'Lỗi', 'Tên không được để trống');
      return;
    }

    if (formData.newPassword && !formData.currentPassword) {
      showToast('error', 'Lỗi', 'Vui lòng nhập mật khẩu hiện tại');
      return;
    }

    // ✅ Validate password length
    if (formData.newPassword && formData.newPassword.length < 6) {
      showToast('error', 'Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);

    try {
      const updateData = {
        name: formData.name,
      };

      // ✅ Chỉ gửi password nếu có thay đổi
      if (formData.currentPassword && formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      console.log('Updating profile with:', updateData); // Debug

      const response = await authService.updateProfile(updateData);

      if (response.success) {
        showToast('success', 'Thành công', 'Cập nhật profile thành công');
        
        // ✅ Cập nhật localStorage
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        currentUser.name = formData.name;
        localStorage.setItem('user', JSON.stringify(currentUser));

        // Reset password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: ''
        }));
      }
    } catch (error) {
      console.error('Update profile error:', error); // Debug
      
      const errorMessage = error.response?.data?.message || 'Không thể cập nhật profile';
      showToast('error', 'Lỗi', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <PageWrapper>
        <Toast toast={toast} onClose={hideToast} />
        
        <ContentWrapper>
          <LeftArea>
            <LeftSidebar active="settings" />
          </LeftArea>
          <RightArea>
            <LoadingText>Đang tải...</LoadingText>
          </RightArea>
        </ContentWrapper>
      </PageWrapper>
    );
  }

  // ✅ Tạo avatarUrl đầy đủ
  const avatarUrl = formData.avatar 
    ? (formData.avatar.startsWith('http') 
        ? formData.avatar 
        : `${process.env.REACT_APP_API_URL.replace('/api', '')}${formData.avatar}`)
    : null;

  return (
    <PageWrapper>
      <Toast toast={toast} onClose={hideToast} />
      
      <ContentWrapper>
        <LeftArea>
          <LeftSidebar active="settings" />
        </LeftArea>

        <RightArea>
          <Container>
            <HeaderSection>
              <BackButton onClick={() => navigate('/settings')}>
                ← Quay lại
              </BackButton>
              <Title>Hồ sơ</Title>
              <Subtitle>Quản lý thông tin cá nhân của bạn</Subtitle>
            </HeaderSection>

            <Section>
              {/* ✅ Sử dụng Avatar component với upload */}
              <AvatarSection>
                <Avatar
                  size={100}
                  image={avatarUrl}
                  name={formData.name}
                  borderWidth={4}
                  shadow={true}
                  editable={true} // ✅ Cho phép upload
                  allowDelete={!!formData.avatar} // ✅ Cho phép xóa nếu có avatar
                  onAvatarChange={handleAvatarChange} // ✅ Callback khi thay đổi
                />
                <AvatarInfo>
                  <AvatarTitle>{formData.name || 'Người dùng'}</AvatarTitle>
                  <AvatarSubtitle>Nhấp vào ảnh để thay đổi</AvatarSubtitle>
                </AvatarInfo>
              </AvatarSection>

              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label>Tên hiển thị</Label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nhập tên của bạn"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Tên người dùng</Label>
                  <Input
                    type="text"
                    name="username"
                    value={formData.username}
                    disabled
                    style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
                  />
                  <HelpText>Tên người dùng không thể thay đổi</HelpText>
                </FormGroup>

                <FormGroup>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
                  />
                  <HelpText>Email không thể thay đổi</HelpText>
                </FormGroup>

                <Divider>
                  <DividerText>Thay đổi mật khẩu</DividerText>
                </Divider>

                <FormGroup>
                  <Label>Mật khẩu hiện tại</Label>
                  <PasswordWrapper>
                    <Input
                      type={showCurrentPassword ? 'text' : 'password'}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      placeholder="Nhập mật khẩu hiện tại"
                    />
                    
                    <ToggleButton 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowCurrentPassword(!showCurrentPassword);
                      }}
                    >
                      {showCurrentPassword ? '👁️' : '👁️‍🗨️'}
                    </ToggleButton>
                  </PasswordWrapper>
                </FormGroup>

                <FormGroup>
                  <Label>Mật khẩu mới</Label>
                  <PasswordWrapper>
                    <Input
                      type={showNewPassword ? 'text' : 'password'}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Nhập mật khẩu mới"
                    />
                    
                    <ToggleButton 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowNewPassword(!showNewPassword);
                      }}
                    >
                      {showNewPassword ? '👁️' : '👁️‍🗨️'}
                    </ToggleButton>
                  </PasswordWrapper>
                  <HelpText>Mật khẩu phải có ít nhất 6 ký tự</HelpText>
                </FormGroup>

                <ButtonGroup>
                  <CancelButton type="button" onClick={() => navigate('/settings')}>
                    Hủy
                  </CancelButton>
                  <SaveButton type="submit" disabled={loading}>
                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </SaveButton>
                </ButtonGroup>
              </Form>
            </Section>
          </Container>
        </RightArea>
      </ContentWrapper>
    </PageWrapper>
  );
};

// ========== STYLED COMPONENTS ==========
const PageWrapper = styled.div`
  min-height: 100vh;
  background: #f8fafc;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex: 1;
`;

const LeftArea = styled.aside`
  width: 280px;
  border-right: 1px solid #eef2f6;
  background: #fff;
  
  @media (max-width: 968px) {
    display: none;
  }
`;

const RightArea = styled.main`
  flex: 1;
  padding: 2.5rem;
  display: flex;
  justify-content: center;
  overflow-y: auto;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const LoadingText = styled.div`
  font-size: 1.25rem;
  color: #6b7280;
  text-align: center;
  margin-top: 3rem;
`;

const Container = styled.div`
  width: 100%;
  max-width: 900px;
`;

const HeaderSection = styled.div`
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #1CB0F6;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.5rem 0;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    color: #0d9ed8;
    transform: translateX(-4px);
  }
`;
const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #6b7280;
`;

const Section = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(229, 231, 235, 0.5);
`;

const AvatarSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 16px;
  margin-bottom: 2rem;
`;

const AvatarInfo = styled.div`
  flex: 1;
`;

const AvatarTitle = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const AvatarSubtitle = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  background: #ffffff;
  color: #374151;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;

  &:focus {
    border-color: #58CC02;
    box-shadow: 0 0 0 3px rgba(88, 204, 2, 0.1);
  }

  &:disabled {
    background: #f9fafb;
    cursor: not-allowed;
    color: #9ca3af;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const HelpText = styled.p`
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
`;

const PasswordWrapper = styled.div`
  position: relative;
`;

const ToggleButton = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-50%) scale(1.1);
  }

  /* ✅ Thêm để ngăn submit form */
  &:focus {
    outline: none;
  }
`;

const Divider = styled.div`
  height: 2px;
  background: #f3f4f6;
  margin: 2rem 0;
`;

const DividerText = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: #9ca3af;
  background: #fff;
  padding: 0 0.5rem;
  position: relative;
  top: -10px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const CancelButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #e5e7eb;
  }
`;

const SaveButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(88, 204, 2, 0.35);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

export default ProfileSettings;