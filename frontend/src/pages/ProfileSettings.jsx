import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import { authService } from '../services/authService';
import LeftSidebar from '../components/LeftSidebar';

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
          setFormData(prev => ({
            ...prev,
            name: user.name || '',
            username: user.username || user.name || '', // fallback to name if no username
            email: user.email || ''
          }));
        }
      } catch (error) {
        showToast('error', 'Lỗi!', error.message || 'Không thể tải thông tin hồ sơ');
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

  const handleSave = async () => {
    setLoading(true);
    try {
      const updateData = {
        name: formData.name
      };

      // Nếu có đổi mật khẩu
      if (formData.currentPassword && formData.newPassword) {
        if (formData.newPassword.length < 6) {
          showToast('error', 'Lỗi!', 'Mật khẩu mới phải có ít nhất 6 ký tự');
          setLoading(false);
          return;
        }
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      // Call API to update profile
      const response = await authService.updateProfile(updateData);
      
      if (response.success) {
        showToast('success', 'Thành công!', 'Hồ sơ của bạn đã được cập nhật');
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: ''
        }));
      }
    } catch (error) {
      showToast('error', 'Lỗi!', error.message || 'Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <PageWrapper>
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
              <AvatarSection>
                <Avatar>
                  {formData.name.charAt(0).toUpperCase() || '?'}
                </Avatar>
                <AvatarInfo>
                  <AvatarTitle>Ảnh đại diện</AvatarTitle>
                  <ChangeAvatarButton>Thay đổi</ChangeAvatarButton>
                </AvatarInfo>
              </AvatarSection>

              <FormGroup>
                <Label>Tên</Label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nhập tên của bạn"
                />
              </FormGroup>

              <FormGroup>
                <Label>Tên đăng nhập</Label>
                <Input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Nhập tên đăng nhập"
                />
              </FormGroup>

              <FormGroup>
                <Label>Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                />
                <HintText>Email không thể thay đổi</HintText>
              </FormGroup>

              <Divider />

              <SectionTitle>Đổi mật khẩu</SectionTitle>

              <FormGroup>
                <Label>Mật khẩu hiện tại</Label>
                <InputWrapper>
                  <Input
                    type={showCurrentPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                  <PasswordToggleButton
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? '👁️' : '👁️‍🗨️'}
                  </PasswordToggleButton>
                </InputWrapper>
              </FormGroup>

              <FormGroup>
                <Label>Mật khẩu mới</Label>
                <InputWrapper>
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  />
                  <PasswordToggleButton
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? '👁️' : '👁️‍🗨️'}
                  </PasswordToggleButton>
                </InputWrapper>
              </FormGroup>

              <SaveButton onClick={handleSave} disabled={loading}>
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </SaveButton>
            </Section>
          </Container>
        </RightArea>
      </ContentWrapper>
    </PageWrapper>
  );
};

export default ProfileSettings;

/* Styled Components */
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
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #f3f4f6;
`;

const Avatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1CB0F6 0%, #0d9ed8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: white;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 24px rgba(28, 176, 246, 0.3);
  }

  &:hover::after {
    content: '📷';
    position: absolute;
    font-size: 2rem;
    background: rgba(0, 0, 0, 0.5);
    width: 100%;
    height: 100%;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const AvatarInfo = styled.div`
  flex: 1;
`;

const AvatarTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const ChangeAvatarButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #1CB0F6;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #0d9ed8;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(28, 176, 246, 0.3);
  }
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

const HintText = styled.p`
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const PasswordToggleButton = styled.button`
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
`;

const Divider = styled.div`
  height: 2px;
  background: #f3f4f6;
  margin: 2rem 0;
`;

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1.5rem;
`;

const SaveButton = styled.button`
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;

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