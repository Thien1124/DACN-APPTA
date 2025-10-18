import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import LeftSidebar from '../components/LeftSidebar';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import api from '../utils/api';

const PrivacySettings = () => {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [privacy, setPrivacy] = useState({
    publicProfile: false,
    personalization: true,
    friendStreak: true
  });

  // Fetch privacy settings from backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/users/privacy-settings');
        if (response.data.success) {
          setPrivacy(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching privacy settings:', error);
      }
    };

    fetchSettings();
  }, []);

  const handleToggle = async (key) => {
    const newValue = !privacy[key];
    
    setPrivacy(prev => ({
      ...prev,
      [key]: newValue
    }));

    try {
      setLoading(true);
      await api.put('/users/privacy-settings', {
        [key]: newValue
      });
      showToast('success', 'Đã lưu!', 'Cài đặt quyền riêng tư đã được cập nhật');
    } catch (error) {
      // Rollback on error
      setPrivacy(prev => ({
        ...prev,
        [key]: !newValue
      }));
      showToast('error', 'Lỗi!', error.message || 'Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

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
              <Title>Quyền riêng tư</Title>
              <Subtitle>Quản lý quyền riêng tư và cách chia sẻ dữ liệu của bạn</Subtitle>
            </HeaderSection>

            <Section>
              <SectionTitle>Cài đặt quyền riêng tư</SectionTitle>
              
              <SettingItem>
                <SettingContent>
                  <SettingLabel>Công khai hồ sơ của tôi</SettingLabel>
                  <SettingDescription>
                    Cho phép người khác tìm hồ sơ và theo dõi bạn. Cho phép bạn theo dõi người khác. 
                    Bạn sẽ được gia nhập bảng xếp hạng chung.
                  </SettingDescription>
                </SettingContent>
                <Toggle>
                  <ToggleInput
                    type="checkbox"
                    checked={privacy.publicProfile}
                    onChange={() => handleToggle('publicProfile')}
                    disabled={loading}
                  />
                  <ToggleSlider checked={privacy.publicProfile} />
                </Toggle>
              </SettingItem>

              <SettingItem>
                <SettingContent>
                  <SettingLabel>Cá nhân hóa quảng cáo</SettingLabel>
                  <SettingDescription>
                    Theo dõi và cá nhân hóa quảng cáo
                  </SettingDescription>
                </SettingContent>
                <Toggle>
                  <ToggleInput
                    type="checkbox"
                    checked={privacy.personalization}
                    onChange={() => handleToggle('personalization')}
                    disabled={loading}
                  />
                  <ToggleSlider checked={privacy.personalization} />
                </Toggle>
              </SettingItem>

              <SettingItem>
                <SettingContent>
                  <SettingLabel>Streak bạn bè</SettingLabel>
                  <SettingDescription>
                    Bạn bè có thể thấy streak của bạn
                  </SettingDescription>
                </SettingContent>
                <Toggle>
                  <ToggleInput
                    type="checkbox"
                    checked={privacy.friendStreak}
                    onChange={() => handleToggle('friendStreak')}
                    disabled={loading}
                  />
                  <ToggleSlider checked={privacy.friendStreak} />
                </Toggle>
              </SettingItem>
            </Section>

            <InfoBox>
              <InfoIcon>🔒</InfoIcon>
              <InfoContent>
                <InfoTitle>Bảo vệ thông tin cá nhân</InfoTitle>
                <InfoText>
                  Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn. 
                  Xem <InfoLink href="/privacy-policy">Chính sách bảo mật</InfoLink> để biết thêm chi tiết.
                </InfoText>
              </InfoContent>
            </InfoBox>
          </Container>
        </RightArea>
      </ContentWrapper>
    </PageWrapper>
  );
};

export default PrivacySettings;

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

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1.5rem;
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.25rem 0;
  border-bottom: 1px solid rgba(229, 231, 235, 0.5);
  gap: 1rem;

  &:last-child {
    border-bottom: none;
  }
`;

const SettingContent = styled.div`
  flex: 1;
`;

const SettingLabel = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
`;

const SettingDescription = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
`;

const Toggle = styled.div`
  position: relative;
  width: 50px;
  height: 28px;
  flex-shrink: 0;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:disabled + span {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.checked ? '#1CB0F6' : '#ccc'};
  transition: 0.4s;
  border-radius: 34px;

  &:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
    transform: ${props => props.checked ? 'translateX(22px)' : 'translateX(0)'};
  }
`;

const InfoBox = styled.div`
  display: flex;
  gap: 1rem;
  background: rgba(28, 176, 246, 0.1);
  border: 2px solid #1CB0F6;
  border-radius: 16px;
  padding: 1.5rem;
`;

const InfoIcon = styled.div`
  font-size: 2rem;
  flex-shrink: 0;
`;

const InfoContent = styled.div`
  flex: 1;
`;

const InfoTitle = styled.div`
  font-weight: 700;
  color: #1CB0F6;
  margin-bottom: 0.5rem;
  font-size: 1rem;
`;

const InfoText = styled.div`
  color: #4b5563;
  font-size: 0.875rem;
  line-height: 1.6;
`;

const InfoLink = styled.a`
  color: #1CB0F6;
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    color: #0d9ed8;
  }
`;