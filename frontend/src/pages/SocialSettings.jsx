import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import LeftSidebar from '../components/LeftSidebar';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import api from '../utils/api';

import {
  ArrowBack,
  Facebook,
  Google,
  Info,
  Security,
  Shield,
  Lock,
  CheckCircle
} from '@mui/icons-material';

const SocialSettings = () => {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [socialAccounts, setSocialAccounts] = useState({
    facebook: false,
    google: false
  });

  // Fetch social connections from backend
  useEffect(() => {
    const fetchSocialConnections = async () => {
      try {
        const response = await api.get('/users/social-connections');
        if (response.data.success) {
          setSocialAccounts(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching social connections:', error);
      }
    };

    fetchSocialConnections();
  }, []);

  const handleToggle = async (platform) => {
    const newStatus = !socialAccounts[platform];
    
    if (newStatus) {
      // Redirect to OAuth flow
      const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:1124/api';
      window.location.href = `${backendUrl}/auth/${platform}`;
    } else {
      // Disconnect - call backend API
      try {
        setLoading(true);
        await api.delete(`/users/social-connections/${platform}`);
        
        setSocialAccounts(prev => ({
          ...prev,
          [platform]: false
        }));
        
        showToast('success', 'Đã ngắt kết nối', `Tài khoản ${platform.charAt(0).toUpperCase() + platform.slice(1)} đã được ngắt kết nối`);
      } catch (error) {
        showToast('error', 'Lỗi!', error.response?.data?.message || 'Ngắt kết nối thất bại');
      } finally {
        setLoading(false);
      }
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
  <ArrowBack sx={{ fontSize: 20 }} /> Quay lại
</BackButton>
              <Title>Tài khoản mạng xã hội</Title>
              <Subtitle>Kết nối hoặc ngắt kết nối tài khoản mạng xã hội của bạn</Subtitle>
            </HeaderSection>

            <Section>
              <SocialItem>
                <SocialInfo>
    <SocialIcon connected={socialAccounts.facebook}>
      <Facebook sx={{ fontSize: 28, color: socialAccounts.facebook ? 'white' : '#6b7280' }} />
    </SocialIcon>
    <SocialDetails>
      <SocialName>Facebook</SocialName>
      <SocialStatus connected={socialAccounts.facebook}>
        {socialAccounts.facebook ? <><CheckCircle sx={{ fontSize: 16, marginRight: '4px' }} /> Đã kết nối</> : 'Chưa kết nối'}
      </SocialStatus>
    </SocialDetails>
  </SocialInfo>
                <Toggle>
                  <ToggleInput
                    type="checkbox"
                    checked={socialAccounts.facebook}
                    onChange={() => handleToggle('facebook')}
                    disabled={loading}
                  />
                  <ToggleSlider checked={socialAccounts.facebook} />
                </Toggle>
              </SocialItem>

              <SocialItem>
                <SocialInfo>
    <SocialIcon connected={socialAccounts.google}>
      <Google sx={{ fontSize: 28, color: socialAccounts.google ? 'white' : '#6b7280' }} />
    </SocialIcon>
    <SocialDetails>
      <SocialName>Google</SocialName>
      <SocialStatus connected={socialAccounts.google}>
        {socialAccounts.google ? <><CheckCircle sx={{ fontSize: 16, marginRight: '4px' }} /> Đã kết nối</> : 'Chưa kết nối'}
      </SocialStatus>
    </SocialDetails>
  </SocialInfo>
                <Toggle>
                  <ToggleInput
                    type="checkbox"
                    checked={socialAccounts.google}
                    onChange={() => handleToggle('google')}
                    disabled={loading}
                  />
                  <ToggleSlider checked={socialAccounts.google} />
                </Toggle>
              </SocialItem>

              <InfoBox>
  <InfoIcon>
    <Info sx={{ fontSize: 24, color: '#3b82f6' }} />
  </InfoIcon>
  <InfoText>
    Kết nối tài khoản mạng xã hội giúp bạn đăng nhập nhanh chóng và chia sẻ thành tích học tập của mình với bạn bè.
  </InfoText>
</InfoBox>
            </Section>

            <Section>
              <SectionTitle>Lưu ý bảo mật</SectionTitle>
              <SecurityList>
  <SecurityItem>
    <SecurityIcon>
      <Security sx={{ fontSize: 24, color: '#4b5563' }} />
    </SecurityIcon>
    <SecurityText>Chúng tôi không lưu trữ mật khẩu tài khoản mạng xã hội của bạn</SecurityText>
  </SecurityItem>
  <SecurityItem>
    <SecurityIcon>
      <Shield sx={{ fontSize: 24, color: '#4b5563' }} />
    </SecurityIcon>
    <SecurityText>Bạn có thể ngắt kết nối bất kỳ lúc nào</SecurityText>
  </SecurityItem>
  <SecurityItem>
    <SecurityIcon>
      <Lock sx={{ fontSize: 24, color: '#4b5563' }} />
    </SecurityIcon>
    <SecurityText>Thông tin của bạn được mã hóa và bảo mật</SecurityText>
  </SecurityItem>
</SecurityList>
            </Section>
          </Container>
        </RightArea>
      </ContentWrapper>
    </PageWrapper>
  );
};

export default SocialSettings;

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

const SocialItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 0;
  border-bottom: 1px solid rgba(229, 231, 235, 0.5);

  &:last-child {
    border-bottom: none;
  }
`;

const SocialInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SocialIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  background: ${props => props.connected 
    ? 'linear-gradient(135deg, #1CB0F6 0%, #0d9ed8 100%)'
    : '#e5e7eb'
  };
  transition: all 0.3s ease;
  box-shadow: ${props => props.connected 
    ? '0 4px 12px rgba(28, 176, 246, 0.3)'
    : 'none'
  };
`;

const SocialDetails = styled.div``;

const SocialName = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const SocialStatus = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.connected ? '#10b981' : '#6b7280'};
  display: flex;
  align-items: center;
`;

const Toggle = styled.div`
  position: relative;
  width: 50px;
  height: 28px;
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
  background-color: ${props => props.checked ? '#10b981' : '#ccc'};
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
  gap: 0.75rem;
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 12px;
  padding: 1rem;
  margin-top: 1.5rem;
`;

const InfoIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const InfoText = styled.div`
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.6;
`;

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
`;

const SecurityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const SecurityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const SecurityIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SecurityText = styled.div`
  font-size: 0.9375rem;
  color: #4b5563;
`;