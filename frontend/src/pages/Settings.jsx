import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import LeftSidebar from '../components/LeftSidebar';

const Settings = () => {
  const navigate = useNavigate();

  const settingsCards = [
    {
      title: 'Hồ sơ',
      description: 'Thay đổi tên, email, ảnh đại diện và mật khẩu.',
      icon: '👤',
      path: '/settings/profile',
      color: '#1CB0F6'
    },
    {
      title: 'Tài khoản mạng xã hội',
      description: 'Kết nối / ngắt kết nối Google, Facebook.',
      icon: '🔗',
      path: '/settings/social',
      color: '#58CC02'
    },
    {
      title: 'Quyền riêng tư',
      description: 'Tùy chọn hiển thị hồ sơ và thông báo.',
      icon: '🔒',
      path: '/settings/privacy',
      color: '#CE82FF'
    },
    {
      title: 'Thông báo',
      description: 'Quản lý email và thông báo nhắc nhở.',
      icon: '🔔',
      path: '/settings/notifications',
      color: '#FF9600'
    },
    {
      title: 'Cài đặt tài khoản',
      description: 'Các tuỳ chọn giao diện và trải nghiệm học tập.',
      icon: '⚙️',
      path: '/settings/account',
      color: '#FF4B4B'
    }
  ];

  return (
    <Wrapper>
      <ContentWrapper>
        <LeftArea>
          <LeftSidebar active="settings" />
        </LeftArea>

        <RightArea>
          <Container>
            <HeaderSection>
              <Title>Cài đặt</Title>
              <Subtitle>Quản lý tài khoản và quyền riêng tư của bạn</Subtitle>
            </HeaderSection>

            <CardGrid>
              {settingsCards.map((card, index) => (
                <Card
                  key={index}
                  color={card.color}
                  onClick={() => navigate(card.path)}
                >
                  <CardIcon>{card.icon}</CardIcon>
                  <CardTitle>{card.title}</CardTitle>
                  <CardText>{card.description}</CardText>
                  <CardArrow>→</CardArrow>
                </Card>
              ))}
            </CardGrid>
          </Container>
        </RightArea>
      </ContentWrapper>
    </Wrapper>
  );
};

export default Settings;

/* Styled Components */
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
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
  max-width: 1200px;
`;

const HeaderSection = styled.div`
  margin-bottom: 2.5rem;
  animation: fadeInDown 0.6s ease;

  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #111827;
  margin: 0 0 0.5rem 0;
  font-weight: 800;
  background: linear-gradient(135deg, #1CB0F6 0%, #58CC02 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  margin: 0;
  color: #6b7280;
  font-size: 1.125rem;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.6s ease;

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.color};
    transform: scaleX(0);
    transition: transform 0.4s ease;
  }

  &:hover {
    transform: translateY(-8px);
    border-color: ${props => props.color};
    box-shadow: 0 12px 32px ${props => props.color}20, 0 0 0 1px ${props => props.color}40;

    &::before {
      transform: scaleX(1);
    }
  }

  &:active {
    transform: translateY(-4px);
  }
`;

const CardIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15));
  animation: bounce 2s ease infinite;

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    }
  }
`;

const CardTitle = styled.h3`
  margin: 0 0 0.75rem 0;
  font-size: 1.25rem;
  color: #111827;
  font-weight: 700;
`;

const CardText = styled.p`
  margin: 0;
  color: #6b7280;
  font-size: 0.9375rem;
  line-height: 1.6;
`;

const CardArrow = styled.div`
  position: absolute;
  bottom: 1.5rem;
  right: 1.5rem;
  font-size: 1.5rem;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
  
  ${Card}:hover & {
    opacity: 1;
    transform: translateX(0);
  }
`;