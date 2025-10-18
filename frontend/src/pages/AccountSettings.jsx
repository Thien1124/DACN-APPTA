import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import LeftSidebar from '../components/LeftSidebar';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';

const AccountSettings = () => {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  
  const [settings, setSettings] = useState({
    soundEffects: true,
    animations: true,
    motivationReminders: true,
    listeningExercises: true,
    darkMode: 'system'
  });

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    showToast('success', 'Đã lưu!', 'Cài đặt của bạn đã được cập nhật');
  };

  const handleSelectChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
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
              <Title>Cài đặt riêng</Title>
              <Subtitle>Tùy chỉnh trải nghiệm học tập của bạn</Subtitle>
            </HeaderSection>

            <Section>
              <SectionTitle>Kinh nghiệm học tập</SectionTitle>
              
              <SettingItem>
                <SettingLabel>Hiệu ứng âm thanh</SettingLabel>
                <Toggle>
                  <ToggleInput
                    type="checkbox"
                    checked={settings.soundEffects}
                    onChange={() => handleToggle('soundEffects')}
                  />
                  <ToggleSlider checked={settings.soundEffects} />
                </Toggle>
              </SettingItem>

              <SettingItem>
                <SettingLabel>Hiệu ứng hoạt hình</SettingLabel>
                <Toggle>
                  <ToggleInput
                    type="checkbox"
                    checked={settings.animations}
                    onChange={() => handleToggle('animations')}
                  />
                  <ToggleSlider checked={settings.animations} />
                </Toggle>
              </SettingItem>

              <SettingItem>
                <SettingLabel>Thông báo khích lệ</SettingLabel>
                <Toggle>
                  <ToggleInput
                    type="checkbox"
                    checked={settings.motivationReminders}
                    onChange={() => handleToggle('motivationReminders')}
                  />
                  <ToggleSlider checked={settings.motivationReminders} />
                </Toggle>
              </SettingItem>

              <SettingItem>
                <SettingLabel>Bài tập nghe</SettingLabel>
                <Toggle>
                  <ToggleInput
                    type="checkbox"
                    checked={settings.listeningExercises}
                    onChange={() => handleToggle('listeningExercises')}
                  />
                  <ToggleSlider checked={settings.listeningExercises} />
                </Toggle>
              </SettingItem>
            </Section>

            <Section>
              <SectionTitle>Giao diện</SectionTitle>
              
              <SettingItem>
                <SettingLabel>Chế độ tối</SettingLabel>
                <Select
                  value={settings.darkMode}
                  onChange={(e) => handleSelectChange('darkMode', e.target.value)}
                >
                  <option value="system">Mặc định theo hệ thống</option>
                  <option value="light">Chế độ sáng</option>
                  <option value="dark">Chế độ tối</option>
                </Select>
              </SettingItem>
            </Section>
          </Container>
        </RightArea>
      </ContentWrapper>
    </PageWrapper>
  );
};

export default AccountSettings;

// Styled components (giữ nguyên nhưng bỏ theme prop)
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
  align-items: center;
  padding: 1.25rem 0;
  border-bottom: 1px solid rgba(229, 231, 235, 0.5);

  &:last-child {
    border-bottom: none;
  }
`;

const SettingLabel = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
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
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.checked ? '#58CC02' : '#ccc'};
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

const Select = styled.select`
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  background: #ffffff;
  color: #374151;
  font-size: 1rem;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;

  &:focus {
    border-color: #58CC02;
  }
`;