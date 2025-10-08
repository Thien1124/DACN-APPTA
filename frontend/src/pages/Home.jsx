import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// ========== STYLED COMPONENTS ==========

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%)'
    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e0 100%)'
  };
  position: relative;
  overflow-x: hidden;

  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.theme === 'dark'
      ? 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 70%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 70%), radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 70%)'
      : 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 70%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.05) 0%, transparent 70%), radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.05) 0%, transparent 70%)'
    };
    z-index: -1;
  }
`;

const Navbar = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: ${props => props.theme === 'dark' 
    ? 'rgba(26, 26, 26, 0.95)' 
    : 'rgba(255, 255, 255, 0.95)'
  };
  backdrop-filter: blur(10px);
  box-shadow: ${props => props.scrolled 
    ? '0 4px 12px rgba(0,0,0,0.15)' 
    : '0 2px 4px rgba(0,0,0,0.1)'
  };
  z-index: 1000;
  transition: all 0.3s ease;
`;

const NavbarContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#58CC02' : '#45a302'};
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const LogoIcon = styled.span`
  font-size: 2rem;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme === 'dark' ? '#e5e7eb' : '#4B4B4B'};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.3s ease;

  &:hover {
    color: ${props => props.theme === 'dark' ? '#58CC02' : '#45a302'};
  }
`;

const ThemeToggle = styled.button`
  background: ${props => props.theme === 'dark' ? '#374151' : '#f3f4f6'};
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: rotate(20deg) scale(1.1);
    background: ${props => props.theme === 'dark' ? '#4B5563' : '#e5e7eb'};
  }
`;

const BtnLogin = styled.button`
  background: none;
  border: 2px solid #58CC02;
  color: ${props => props.theme === 'dark' ? '#58CC02' : '#45a302'};
  padding: 0.5rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #58CC02;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(88, 204, 2, 0.3);
  }
`;

const BtnSignup = styled.button`
  background: #58CC02;
  border: 2px solid #58CC02;
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #45a302;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(88, 204, 2, 0.4);
  }
`;

const MobileMenuBtn = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${props => props.theme === 'dark' ? '#e5e7eb' : '#1a1a1a'};
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const HomeContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem 2rem;
  width: 100%;
  position: relative;
  z-index: 1;
  margin-top: 80px;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const HeroSection = styled.section`
  padding: 4rem 0;
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
`;

const HeroContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const HeroText = styled.div`
  animation: fadeInLeft 0.8s ease;

  @keyframes fadeInLeft {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  line-height: 1.2;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Highlight = styled.span`
  color: #58CC02;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 100%;
    height: 3px;
    background: #58CC02;
    opacity: 0.3;
  }
`;

const HeroDescription = styled.p`
  font-size: 1.25rem;
  color: ${props => props.theme === 'dark' ? '#d1d5db' : '#4B4B4B'};
  line-height: 1.6;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const HeroButtons = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const BtnPrimaryLarge = styled.button`
  background: #58CC02;
  color: white;
  border: none;
  padding: 1rem 2.5rem;
  border-radius: 16px;
  font-size: 1.125rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(88, 204, 2, 0.3);

  &:hover {
    background: #45a302;
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(88, 204, 2, 0.4);
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const BtnSecondaryLarge = styled.button`
  background: ${props => props.theme === 'dark' ? '#374151' : 'white'};
  color: #58CC02;
  border: 2px solid #58CC02;
  padding: 1rem 2.5rem;
  border-radius: 16px;
  font-size: 1.125rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.theme === 'dark' ? '#4B5563' : '#f0f9ff'};
    transform: translateY(-3px);
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const HeroImage = styled.div`
  position: relative;
  height: 500px;
  animation: fadeInRight 0.8s ease;

  @keyframes fadeInRight {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @media (max-width: 1024px) {
    height: 400px;
  }
  
  @media (max-width: 768px) {
    height: 300px;
  }
`;

const HeroIllustration = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 768px) {
    width: 200px;
    height: 200px;
  }
`;

const IllustrationCircle = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
  border-radius: 50%;
  animation: pulse 3s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 0.8;
    }
    50% {
      transform: scale(1.05);
      opacity: 1;
    }
  }
`;

const IllustrationEmoji = styled.span`
  font-size: 8rem;
  position: relative;
  z-index: 2;
  animation: float 3s ease-in-out infinite;

  @keyframes float {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-20px);
    }
  }
  
  @media (max-width: 768px) {
    font-size: 5rem;
  }
`;

const FloatingCard = styled.div`
  position: absolute;
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.9)' 
    : 'rgba(255, 255, 255, 0.95)'
  };
  backdrop-filter: blur(10px);
  padding: 1rem 1.5rem;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  animation: float 4s ease-in-out infinite;
  animation-delay: ${props => props.delay || '0s'};
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const CardIcon = styled.span`
  font-size: 1.5rem;
`;

const StatsSection = styled.section`
  padding: 3rem 0;
  margin: 2rem 0;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  text-align: center;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const StatItem = styled.div`
  padding: 2rem;
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.5)' 
    : 'rgba(255, 255, 255, 0.7)'
  };
  backdrop-filter: blur(10px);
  border-radius: 20px;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const StatNumber = styled.h3`
  font-size: 3rem;
  font-weight: bold;
  color: #58CC02;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const StatLabel = styled.p`
  font-size: 1.125rem;
  color: ${props => props.theme === 'dark' ? '#d1d5db' : '#4B4B4B'};
`;

const FeaturesSection = styled.section`
  padding: 5rem 0;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 4rem;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const SectionSubtitle = styled.p`
  font-size: 1.25rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.5)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.15);
    border-color: #58CC02;
  }
`;

const FeatureIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  background: ${props => {
    const colors = {
      green: props.theme === 'dark' ? 'rgba(88, 204, 2, 0.2)' : '#e6f9e6',
      blue: props.theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : '#e0f2fe',
      orange: props.theme === 'dark' ? 'rgba(255, 150, 0, 0.2)' : '#ffedd5',
      red: props.theme === 'dark' ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2',
      purple: props.theme === 'dark' ? 'rgba(139, 92, 246, 0.2)' : '#f3e8ff',
      yellow: props.theme === 'dark' ? 'rgba(250, 204, 21, 0.2)' : '#fef9c3',
    };
    return colors[props.color] || colors.green;
  }};
`;

const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 1rem;
`;

const FeatureDescription = styled.p`
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#d1d5db' : '#6b7280'};
  line-height: 1.6;
`;

const TestimonialsSection = styled.section`
  padding: 5rem 0;
`;

const TestimonialsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const TestimonialCard = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.5)' 
    : 'rgba(249, 250, 251, 0.9)'
  };
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 20px;
  transition: all 0.3s ease;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'transparent'
  };

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  }
`;

const TestimonialRating = styled.div`
  font-size: 1.25rem;
  margin-bottom: 1rem;
`;

const TestimonialText = styled.p`
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#d1d5db' : '#4B4B4B'};
  line-height: 1.6;
  margin-bottom: 1.5rem;
  font-style: italic;
`;

const TestimonialAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const AuthorAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${props => props.theme === 'dark' 
    ? 'rgba(59, 130, 246, 0.2)' 
    : '#e0f2fe'
  };
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const AuthorInfo = styled.div``;

const AuthorName = styled.h4`
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.25rem;
`;

const AuthorTitle = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const CTASection = styled.section`
  padding: 5rem 0;
  background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
  border-radius: 30px;
  text-align: center;
  margin: 3rem 0;
  box-shadow: 0 12px 30px rgba(88, 204, 2, 0.3);
`;

const CTAContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const CTATitle = styled.h2`
  font-size: 3rem;
  color: white;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const CTADescription = styled.p`
  font-size: 1.25rem;
  color: rgba(255,255,255,0.9);
  margin-bottom: 2rem;
`;

const BtnCTA = styled.button`
  background: white;
  color: #58CC02;
  border: none;
  padding: 1rem 3rem;
  border-radius: 16px;
  font-size: 1.25rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.3);
  }
`;

const Footer = styled.footer`
  background: ${props => props.theme === 'dark' ? '#0c0c0c' : '#1a1a1a'};
  color: white;
  padding: 3rem 2rem 1rem;
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FooterSection = styled.div``;

const FooterTitle = styled.h4`
  font-size: 1.125rem;
  margin-bottom: 1rem;
  color: #58CC02;
`;

const FooterLinks = styled.ul`
  list-style: none;
`;

const FooterLinkItem = styled.li`
  margin-bottom: 0.75rem;
`;

const FooterLink = styled.a`
  color: #9ca3af;
  text-decoration: none;
  transition: color 0.3s ease;

  &:hover {
    color: #58CC02;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
`;

const SocialLink = styled.a`
  width: 40px;
  height: 40px;
  background: #374151;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-size: 1.25rem;
  transition: all 0.3s ease;

  &:hover {
    background: #58CC02;
    transform: translateY(-3px);
  }
`;

const FooterBottom = styled.div`
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid #374151;
  color: #9ca3af;
`;

// ========== COMPONENT ==========

const Home = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');
  const [isScrolled, setIsScrolled] = useState(false);

  // Xử lý scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <PageWrapper theme={theme}>
      {/* Navbar */}
      <Navbar theme={theme} scrolled={isScrolled}>
        <NavbarContent>
          <Logo theme={theme}>
            <LogoIcon>🦉</LogoIcon>
            <span>EnglishMaster</span>
          </Logo>
          <NavLinks>
            <NavLink theme={theme}>Về chúng tôi</NavLink>
            <NavLink theme={theme}>Tính năng</NavLink>
            <NavLink theme={theme}>Giá cả</NavLink>
            <ThemeToggle theme={theme} onClick={toggleTheme}>
              {theme === 'light' ? '🌙' : '☀️'}
            </ThemeToggle>
            <BtnLogin theme={theme} onClick={() => navigate('/login')}>
              Đăng nhập
            </BtnLogin>
            <BtnSignup onClick={() => navigate('/register')}>
              Đăng ký
            </BtnSignup>
          </NavLinks>
          <MobileMenuBtn theme={theme}>☰</MobileMenuBtn>
        </NavbarContent>
      </Navbar>

      <HomeContainer>
        {/* Hero Section */}
        <HeroSection>
          <HeroContent>
            <HeroText>
              <HeroTitle theme={theme}>
                Học tiếng Anh miễn phí,
                <Highlight> vui vẻ</Highlight> và
                <Highlight> hiệu quả</Highlight>
              </HeroTitle>
              <HeroDescription theme={theme}>
                Học tiếng Anh chỉ 5 phút mỗi ngày với các bài học thú vị và khoa học. 
                Phương pháp được chứng minh hiệu quả bởi hàng triệu người dùng.
              </HeroDescription>
              <HeroButtons>
                <BtnPrimaryLarge onClick={() => navigate('/register')}>
                  Bắt đầu ngay
                </BtnPrimaryLarge>
                <BtnSecondaryLarge theme={theme} onClick={() => navigate('/login')}>
                  Tôi đã có tài khoản
                </BtnSecondaryLarge>
              </HeroButtons>
            </HeroText>
            <HeroImage>
              <FloatingCard theme={theme} delay="0s" style={{top: '10%', left: '0'}}>
                <CardIcon>✨</CardIcon>
                <span>Học mọi lúc, mọi nơi</span>
              </FloatingCard>
              <FloatingCard theme={theme} delay="1s" style={{top: '50%', right: '0'}}>
                <CardIcon>🎯</CardIcon>
                <span>Đạt mục tiêu nhanh chóng</span>
              </FloatingCard>
              <FloatingCard theme={theme} delay="2s" style={{bottom: '10%', left: '10%'}}>
                <CardIcon>🏆</CardIcon>
                <span>Nhận huy chương</span>
              </FloatingCard>
              <HeroIllustration>
                <IllustrationCircle />
                <IllustrationEmoji>📚</IllustrationEmoji>
              </HeroIllustration>
            </HeroImage>
          </HeroContent>
        </HeroSection>

        {/* Statistics Section */}
        <StatsSection>
          <StatsContainer>
            <StatItem theme={theme}>
              <StatNumber>500M+</StatNumber>
              <StatLabel theme={theme}>Người học</StatLabel>
            </StatItem>
            <StatItem theme={theme}>
              <StatNumber>40+</StatNumber>
              <StatLabel theme={theme}>Ngôn ngữ</StatLabel>
            </StatItem>
            <StatItem theme={theme}>
              <StatNumber>5 phút</StatNumber>
              <StatLabel theme={theme}>Mỗi ngày</StatLabel>
            </StatItem>
            <StatItem theme={theme}>
              <StatNumber>100%</StatNumber>
              <StatLabel theme={theme}>Miễn phí</StatLabel>
            </StatItem>
          </StatsContainer>
        </StatsSection>

        {/* Features Section */}
        <FeaturesSection>
          <SectionHeader>
            <SectionTitle theme={theme}>Tại sao chọn chúng tôi?</SectionTitle>
            <SectionSubtitle theme={theme}>
              Phương pháp học hiện đại, hiệu quả và thú vị
            </SectionSubtitle>
          </SectionHeader>
          <FeaturesGrid>
            <FeatureCard theme={theme}>
              <FeatureIcon color="green" theme={theme}>🎮</FeatureIcon>
              <FeatureTitle theme={theme}>Học như chơi game</FeatureTitle>
              <FeatureDescription theme={theme}>
                Các bài học ngắn gọn, thú vị như trò chơi. 
                Tích điểm, mở khóa cấp độ mới mỗi ngày.
              </FeatureDescription>
            </FeatureCard>
            <FeatureCard theme={theme}>
              <FeatureIcon color="blue" theme={theme}>🎯</FeatureIcon>
              <FeatureTitle theme={theme}>Cá nhân hóa</FeatureTitle>
              <FeatureDescription theme={theme}>
                AI thông minh điều chỉnh bài học phù hợp với trình độ 
                và tốc độ học của bạn.
              </FeatureDescription>
            </FeatureCard>
            <FeatureCard theme={theme}>
              <FeatureIcon color="orange" theme={theme}>🔥</FeatureIcon>
              <FeatureTitle theme={theme}>Duy trì động lực</FeatureTitle>
              <FeatureDescription theme={theme}>
                Streak counter, nhắc nhở thông minh và cộng đồng 
                giúp bạn kiên trì mỗi ngày.
              </FeatureDescription>
            </FeatureCard>
            <FeatureCard theme={theme}>
              <FeatureIcon color="red" theme={theme}>🎤</FeatureIcon>
              <FeatureTitle theme={theme}>Luyện phát âm</FeatureTitle>
              <FeatureDescription theme={theme}>
                Công nghệ nhận diện giọng nói giúp bạn cải thiện 
                phát âm như người bản xứ.
              </FeatureDescription>
            </FeatureCard>
            <FeatureCard theme={theme}>
              <FeatureIcon color="purple" theme={theme}>📊</FeatureIcon>
              <FeatureTitle theme={theme}>Theo dõi tiến độ</FeatureTitle>
              <FeatureDescription theme={theme}>
                Biểu đồ chi tiết giúp bạn thấy rõ sự tiến bộ 
                và những điểm cần cải thiện.
              </FeatureDescription>
            </FeatureCard>
            <FeatureCard theme={theme}>
              <FeatureIcon color="yellow" theme={theme}>🌍</FeatureIcon>
              <FeatureTitle theme={theme}>Học mọi lúc mọi nơi</FeatureTitle>
              <FeatureDescription theme={theme}>
                Đồng bộ trên mọi thiết bị. Học trên điện thoại, 
                máy tính bảng hay máy tính.
              </FeatureDescription>
            </FeatureCard>
          </FeaturesGrid>
        </FeaturesSection>

        {/* Testimonials Section */}
        <TestimonialsSection>
          <SectionHeader>
            <SectionTitle theme={theme}>Người học nói gì về chúng tôi</SectionTitle>
          </SectionHeader>
          <TestimonialsGrid>
            <TestimonialCard theme={theme}>
              <TestimonialRating>⭐⭐⭐⭐⭐</TestimonialRating>
              <TestimonialText theme={theme}>
                "Ứng dụng tuyệt vời! Tôi đã học được rất nhiều từ vựng mới 
                chỉ sau 2 tuần. Các bài học rất thú vị và dễ hiểu."
              </TestimonialText>
              <TestimonialAuthor>
                <AuthorAvatar theme={theme}>👨</AuthorAvatar>
                <AuthorInfo>
                  <AuthorName theme={theme}>Nguyễn Văn A</AuthorName>
                  <AuthorTitle theme={theme}>Học sinh lớp 10</AuthorTitle>
                </AuthorInfo>
              </TestimonialAuthor>
            </TestimonialCard>
            <TestimonialCard theme={theme}>
              <TestimonialRating>⭐⭐⭐⭐⭐</TestimonialRating>
              <TestimonialText theme={theme}>
                "Mình đã thử nhiều ứng dụng học tiếng Anh nhưng đây là 
                ứng dụng tốt nhất. Giao diện đẹp, bài học hay và hoàn toàn miễn phí!"
              </TestimonialText>
              <TestimonialAuthor>
                <AuthorAvatar theme={theme}>👩</AuthorAvatar>
                <AuthorInfo>
                  <AuthorName theme={theme}>Trần Thị B</AuthorName>
                  <AuthorTitle theme={theme}>Sinh viên đại học</AuthorTitle>
                </AuthorInfo>
              </TestimonialAuthor>
            </TestimonialCard>
            <TestimonialCard theme={theme}>
              <TestimonialRating>⭐⭐⭐⭐⭐</TestimonialRating>
              <TestimonialText theme={theme}>
                "Tôi học mỗi ngày 10 phút trước khi ngủ. Sau 3 tháng, 
                khả năng nghe và nói tiếng Anh của tôi đã cải thiện rõ rệt."
              </TestimonialText>
              <TestimonialAuthor>
                <AuthorAvatar theme={theme}>🧑</AuthorAvatar>
                <AuthorInfo>
                  <AuthorName theme={theme}>Lê Văn C</AuthorName>
                  <AuthorTitle theme={theme}>Nhân viên văn phòng</AuthorTitle>
                </AuthorInfo>
              </TestimonialAuthor>
            </TestimonialCard>
          </TestimonialsGrid>
        </TestimonialsSection>

        {/* CTA Section */}
        <CTASection>
          <CTAContent>
            <CTATitle>Sẵn sàng bắt đầu học?</CTATitle>
            <CTADescription>
              Tham gia cùng hàng triệu người đang học tiếng Anh mỗi ngày
            </CTADescription>
            <BtnCTA onClick={() => navigate('/register')}>
              Bắt đầu miễn phí ngay
            </BtnCTA>
          </CTAContent>
        </CTASection>
      </HomeContainer>

      {/* Footer */}
      <Footer theme={theme}>
        <FooterContent>
          <FooterSection>
            <FooterTitle>Về chúng tôi</FooterTitle>
            <FooterLinks>
              <FooterLinkItem><FooterLink href="#about">Giới thiệu</FooterLink></FooterLinkItem>
              <FooterLinkItem><FooterLink href="#team">Đội ngũ</FooterLink></FooterLinkItem>
              <FooterLinkItem><FooterLink href="#careers">Tuyển dụng</FooterLink></FooterLinkItem>
              <FooterLinkItem><FooterLink href="#press">Báo chí</FooterLink></FooterLinkItem>
            </FooterLinks>
          </FooterSection>
          <FooterSection>
            <FooterTitle>Sản phẩm</FooterTitle>
            <FooterLinks>
              <FooterLinkItem><FooterLink href="#app">Ứng dụng di động</FooterLink></FooterLinkItem>
              <FooterLinkItem><FooterLink href="#premium">Premium</FooterLink></FooterLinkItem>
              <FooterLinkItem><FooterLink href="#schools">Dành cho trường học</FooterLink></FooterLinkItem>
              <FooterLinkItem><FooterLink href="#business">Dành cho doanh nghiệp</FooterLink></FooterLinkItem>
            </FooterLinks>
          </FooterSection>
          <FooterSection>
            <FooterTitle>Hỗ trợ</FooterTitle>
            <FooterLinks>
              <FooterLinkItem><FooterLink href="#help">Trung tâm hỗ trợ</FooterLink></FooterLinkItem>
              <FooterLinkItem><FooterLink href="#faq">Câu hỏi thường gặp</FooterLink></FooterLinkItem>
              <FooterLinkItem><FooterLink href="#contact">Liên hệ</FooterLink></FooterLinkItem>
              <FooterLinkItem><FooterLink href="#privacy">Chính sách bảo mật</FooterLink></FooterLinkItem>
            </FooterLinks>
          </FooterSection>
          <FooterSection>
            <FooterTitle>Kết nối với chúng tôi</FooterTitle>
            <SocialLinks>
              <SocialLink href="#facebook">📘</SocialLink>
              <SocialLink href="#twitter">🐦</SocialLink>
              <SocialLink href="#instagram">📷</SocialLink>
              <SocialLink href="#youtube">📺</SocialLink>
            </SocialLinks>
          </FooterSection>
        </FooterContent>
        <FooterBottom>
          <p>&copy; 2025 EnglishMaster. All rights reserved.</p>
        </FooterBottom>
      </Footer>
    </PageWrapper>
  );
};

export default Home;