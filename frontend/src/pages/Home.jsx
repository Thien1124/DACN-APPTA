import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import logo from '../assets/logo.png';
import home from '../assets/home.png';
// ========== ANIMATIONS ==========
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
`;

const slideInLeft = keyframes`
  from { opacity: 0; transform: translateX(-50px); }
  to { opacity: 1; transform: translateX(0); }
`;

const slideInRight = keyframes`
  from { opacity: 0; transform: translateX(50px); }
  to { opacity: 1; transform: translateX(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// ========== STYLED COMPONENTS ==========
const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(180deg, #0c0c0c 0%, #1a1a1a 100%)'
    : 'linear-gradient(180deg, #ffffff 0%, #f0f9ff 100%)'
  };
`;

const CharacterIcon = styled.img`
  width:  70px;
  height: 70px;
  object-fit: contain;

  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
  }
`;
const Navbar = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: ${props => props.theme === 'dark' 
    ? 'rgba(12, 12, 12, 0.98)' 
    : 'rgba(255, 255, 255, 0.98)'
  };
  backdrop-filter: blur(10px);
  box-shadow: ${props => props.scrolled 
    ? '0 4px 20px rgba(0,0,0,0.1)' 
    : 'none'
  };
  z-index: 1000;
  transition: all 0.3s ease;
  padding: 1rem 0;
`;

const NavContent = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }

  img, span {
    height: 40px;
    font-size: 2rem;
  }

  h1 {
    font-size: 1.75rem;
    font-weight: 800;
    background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
  }
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
  color: ${props => props.theme === 'dark' ? '#e5e7eb' : '#4B5563'};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.3s ease;
  padding: 0.5rem 1rem;

  &:hover {
    color: #58CC02;
  }
`;

const BtnSignIn = styled.button`
  background: none;
  border: 2px solid #58CC02;
  color: #58CC02;
  padding: 0.75rem 1.5rem;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(88, 204, 2, 0.1);
    transform: translateY(-2px);
  }
`;

const BtnGetStarted = styled.button`
  background: #58CC02;
  border: none;
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(88, 204, 2, 0.3);

  &:hover {
    background: #45a302;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(88, 204, 2, 0.4);
  }
`;

const HeroSection = styled.section`
  max-width: 1280px;
  margin: 0 auto;
  padding: 120px 2rem 4rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  min-height: calc(100vh - 80px);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    padding: 100px 2rem 2rem;
    gap: 2rem;
  }
`;

const HeroContent = styled.div`
  animation: ${slideInLeft} 0.8s ease;
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  line-height: 1.1;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.5rem;
  color: ${props => props.theme === 'dark' ? '#d1d5db' : '#4B5563'};
  line-height: 1.6;
  margin-bottom: 2.5rem;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const HeroButtons = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const BtnPrimary = styled.button`
  background: #58CC02;
  border: none;
  color: white;
  padding: 1.25rem 3rem;
  border-radius: 20px;
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(88, 204, 2, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &:hover {
    background: #45a302;
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(88, 204, 2, 0.4);
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 1rem 2rem;
  }
`;

const BtnSecondary = styled.button`
  background: ${props => props.theme === 'dark' ? 'transparent' : 'white'};
  border: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  color: #58CC02;
  padding: 1.25rem 3rem;
  border-radius: 20px;
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &:hover {
    background: ${props => props.theme === 'dark' ? '#1f2937' : '#f9fafb'};
    border-color: #58CC02;
    transform: translateY(-3px);
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 1rem 2rem;
  }
`;

const HeroIllustration = styled.div`
  position: relative;
  height: 600px;
  animation: ${slideInRight} 0.8s ease;

  @media (max-width: 1024px) {
    height: 400px;
  }

  @media (max-width: 768px) {
    height: 300px;
  }
`;

const IllustrationWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 500px;
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 1024px) {
    width: 400px;
    height: 400px;
  }

  @media (max-width: 768px) {
    width: 280px;
    height: 280px;
  }
`;

const GlowCircle = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, 
    rgba(88, 204, 2, 0.2) 0%, 
    rgba(28, 176, 246, 0.2) 50%, 
    rgba(139, 92, 246, 0.2) 100%
  );
  border-radius: 50%;
  filter: blur(40px);
  animation: ${pulse} 3s ease-in-out infinite;
`;

const CharacterGroup = styled.div`
  position: relative;
  z-index: 2;
  font-size: 12rem;
  animation: ${float} 4s ease-in-out infinite;

  @media (max-width: 1024px) {
    font-size: 10rem;
  }

  @media (max-width: 768px) {
    font-size: 7rem;
  }
`;

const FloatingElement = styled.div`
  position: absolute;
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.9)' 
    : 'rgba(255, 255, 255, 0.95)'
  };
  backdrop-filter: blur(10px);
  padding: 1rem 1.5rem;
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 700;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  animation: ${float} 5s ease-in-out infinite;
  animation-delay: ${props => props.delay || '0s'};

  span:first-child {
    font-size: 2rem;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const StatsSection = styled.section`
  max-width: 1280px;
  margin: 4rem auto;
  padding: 0 2rem;
  animation: ${fadeIn} 1s ease;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  text-align: center;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.5)' 
    : 'rgba(255, 255, 255, 0.8)'
  };
  backdrop-filter: blur(10px);
  padding: 2.5rem 2rem;
  border-radius: 24px;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
    border-color: #58CC02;
  }
`;

const StatNumber = styled.h3`
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #58CC02 0%, #1CB0F6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const StatLabel = styled.p`
  font-size: 1.125rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-weight: 600;
`;

const FeaturesSection = styled.section`
  max-width: 1280px;
  margin: 6rem auto;
  padding: 0 2rem;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 4rem;
`;

const SectionTitle = styled.h2`
  font-size: 3rem;
  font-weight: 800;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const SectionSubtitle = styled.p`
  font-size: 1.25rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  max-width: 600px;
  margin: 0 auto;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.5)' 
    : 'rgba(255, 255, 255, 0.8)'
  };
  backdrop-filter: blur(10px);
  padding: 2.5rem;
  border-radius: 24px;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
  transition: all 0.3s ease;
  text-align: center;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
    border-color: ${props => props.color || '#58CC02'};
  }
`;

const FeatureIcon = styled.div`
  width: 100px;
  height: 100px;
  margin: 0 auto 1.5rem;
  background: ${props => {
    const colors = {
      green: 'linear-gradient(135deg, rgba(88, 204, 2, 0.2) 0%, rgba(69, 163, 2, 0.3) 100%)',
      blue: 'linear-gradient(135deg, rgba(28, 176, 246, 0.2) 0%, rgba(8, 145, 178, 0.3) 100%)',
      purple: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(124, 58, 237, 0.3) 100%)',
      orange: 'linear-gradient(135deg, rgba(255, 150, 0, 0.2) 0%, rgba(255, 107, 0, 0.3) 100%)',
      pink: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(219, 39, 119, 0.3) 100%)',
      yellow: 'linear-gradient(135deg, rgba(250, 204, 21, 0.2) 0%, rgba(234, 179, 8, 0.3) 100%)',
    };
    return colors[props.color] || colors.green;
  }};
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  transition: all 0.3s ease;

  ${FeatureCard}:hover & {
    transform: scale(1.1) rotate(5deg);
  }
`;

const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 1rem;
`;

const FeatureDescription = styled.p`
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#d1d5db' : '#6b7280'};
  line-height: 1.6;
`;

const CTASection = styled.section`
  max-width: 1280px;
  margin: 6rem auto;
  padding: 0 2rem;
`;

const CTACard = styled.div`
  background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
  border-radius: 30px;
  padding: 4rem 3rem;
  text-align: center;
  box-shadow: 0 20px 60px rgba(88, 204, 2, 0.3);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    animation: ${pulse} 4s ease-in-out infinite;
  }
`;

const CTATitle = styled.h2`
  font-size: 3rem;
  font-weight: 800;
  color: white;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const CTADescription = styled.p`
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 2.5rem;
  position: relative;
  z-index: 1;
`;

const CTAButton = styled.button`
  background: white;
  border: none;
  color: #58CC02;
  padding: 1.25rem 3.5rem;
  border-radius: 20px;
  font-size: 1.25rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  z-index: 1;

  &:hover {
    transform: translateY(-5px) scale(1.05);
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.3);
  }
`;

const Footer = styled.footer`
  background: ${props => props.theme === 'dark' ? '#0c0c0c' : '#f9fafb'};
  padding: 3rem 2rem 1.5rem;
  margin-top: 4rem;
  border-top: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
`;

const FooterContent = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 3rem;
  margin-bottom: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FooterSection = styled.div``;

const FooterTitle = styled.h4`
  font-size: 1.125rem;
  font-weight: 700;
  color: #58CC02;
  margin-bottom: 1rem;
`;

const FooterLinks = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FooterLink = styled.li`
  margin-bottom: 0.75rem;

  a {
    color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
    text-decoration: none;
    transition: color 0.3s ease;
    font-size: 0.95rem;

    &:hover {
      color: #58CC02;
    }
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const SocialLink = styled.a`
  width: 45px;
  height: 45px;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#e5e7eb'};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-size: 1.5rem;
  transition: all 0.3s ease;

  &:hover {
    background: #58CC02;
    transform: translateY(-5px) scale(1.1);
  }
`;

const FooterBottom = styled.div`
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
  color: ${props => props.theme === 'dark' ? '#6b7280' : '#9ca3af'};
  font-size: 0.95rem;
`;

// ========== COMPONENT ==========
const Home = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <PageWrapper theme={theme}>
      {/* Navbar */}
      <Navbar theme={theme} scrolled={isScrolled}>
        <NavContent>
          <Logo onClick={() => navigate('/')}>
            <CharacterIcon src={logo} alt="logo" />
            <h1>EnglishMaster</h1>
          </Logo>
          <NavLinks>
            
            <BtnSignIn onClick={() => navigate('/login')}>
              TÔI ĐÃ CÓ TÀI KHOẢN
            </BtnSignIn>
            <BtnGetStarted onClick={() => navigate('/welcome')}>
              BẮT ĐẦU
            </BtnGetStarted>
          </NavLinks>
        </NavContent>
      </Navbar>

      {/* Hero Section */}
      <HeroSection>
        <HeroContent>
          <HeroTitle theme={theme}>
            Học ngoại ngữ miễn phí, vui nhộn và hiệu quả!
          </HeroTitle>
          <HeroSubtitle theme={theme}>
            Phương pháp học khoa học, bài học ngắn gọn và hiệu quả. 
            Tham gia cùng hàng triệu người học mỗi ngày!
          </HeroSubtitle>
          <HeroButtons>
            <BtnPrimary onClick={() => navigate('/register')}>
              Bắt đầu ngay
            </BtnPrimary>
            <BtnSecondary theme={theme} onClick={() => navigate('/login')}>
              Tôi đã có tài khoản
            </BtnSecondary>
          </HeroButtons>
        </HeroContent>

        <HeroIllustration>
          <IllustrationWrapper>
            <GlowCircle />
            <CharacterGroup>
              <CharacterIcon src={home} alt="home" />
            </CharacterGroup>
          </IllustrationWrapper>
          
          <FloatingElement theme={theme} delay="0s" style={{top: '10%', left: '5%'}}>
            <span>📚</span>
            <span>Học mọi lúc</span>
          </FloatingElement>
          
          <FloatingElement theme={theme} delay="1s" style={{top: '50%', right: '0'}}>
            <span>🎯</span>
            <span>Hiệu quả cao</span>
          </FloatingElement>
          
          <FloatingElement theme={theme} delay="2s" style={{bottom: '15%', left: '10%'}}>
            <span>🏆</span>
            <span>Miễn phí 100%</span>
          </FloatingElement>
        </HeroIllustration>
      </HeroSection>

      {/* Stats Section */}
      <StatsSection>
        <StatsGrid>
          <StatCard theme={theme}>
            <StatNumber>500M+</StatNumber>
            <StatLabel theme={theme}>Học viên trên toàn cầu</StatLabel>
          </StatCard>
          <StatCard theme={theme}>
            <StatNumber>40+</StatNumber>
            <StatLabel theme={theme}>Ngôn ngữ khác nhau</StatLabel>
          </StatCard>
          <StatCard theme={theme}>
            <StatNumber>5 phút</StatNumber>
            <StatLabel theme={theme}>Mỗi bài học</StatLabel>
          </StatCard>
          <StatCard theme={theme}>
            <StatNumber>100%</StatNumber>
            <StatLabel theme={theme}>Hoàn toàn miễn phí</StatLabel>
          </StatCard>
        </StatsGrid>
      </StatsSection>

      {/* Features Section */}
      <FeaturesSection>
        <SectionHeader>
          <SectionTitle theme={theme}>Tại sao chọn EnglishMaster?</SectionTitle>
          <SectionSubtitle theme={theme}>
            Phương pháp học hiện đại, khoa học và hiệu quả nhất
          </SectionSubtitle>
        </SectionHeader>
        
        <FeaturesGrid>
          <FeatureCard theme={theme} color="#58CC02">
            <FeatureIcon color="green">🎮</FeatureIcon>
            <FeatureTitle theme={theme}>Học như chơi game</FeatureTitle>
            <FeatureDescription theme={theme}>
              Bài học thú vị như trò chơi. Tích điểm, nâng cấp và mở khóa thành tựu mới mỗi ngày.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard theme={theme} color="#1CB0F6">
            <FeatureIcon color="blue">🎯</FeatureIcon>
            <FeatureTitle theme={theme}>Được cá nhân hóa</FeatureTitle>
            <FeatureDescription theme={theme}>
              AI thông minh điều chỉnh bài học phù hợp với trình độ và tốc độ học của bạn.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard theme={theme} color="#8b5cf6">
            <FeatureIcon color="purple">🔥</FeatureIcon>
            <FeatureTitle theme={theme}>Duy trì động lực</FeatureTitle>
            <FeatureDescription theme={theme}>
              Streak counter, nhắc nhở thông minh giúp bạn kiên trì học mỗi ngày.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard theme={theme} color="#FF9600">
            <FeatureIcon color="orange">🎤</FeatureIcon>
            <FeatureTitle theme={theme}>Luyện phát âm</FeatureTitle>
            <FeatureDescription theme={theme}>
              Công nghệ nhận diện giọng nói giúp bạn cải thiện phát âm chuẩn.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard theme={theme} color="#ec4899">
            <FeatureIcon color="pink">📊</FeatureIcon>
            <FeatureTitle theme={theme}>Theo dõi tiến độ</FeatureTitle>
            <FeatureDescription theme={theme}>
              Biểu đồ chi tiết giúp bạn thấy rõ sự tiến bộ và điểm cần cải thiện.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard theme={theme} color="#facc15">
            <FeatureIcon color="yellow">🌍</FeatureIcon>
            <FeatureTitle theme={theme}>Học mọi lúc mọi nơi</FeatureTitle>
            <FeatureDescription theme={theme}>
              Đồng bộ trên mọi thiết bị. Học trên điện thoại, máy tính bảng hoặc máy tính.
            </FeatureDescription>
          </FeatureCard>
        </FeaturesGrid>
      </FeaturesSection>

      {/* CTA Section */}
      <CTASection>
        <CTACard>
          <CTATitle>Sẵn sàng bắt đầu học?</CTATitle>
          <CTADescription>
            Tham gia cùng hàng triệu người đang học tiếng Anh mỗi ngày
          </CTADescription>
          <CTAButton onClick={() => navigate('/register')}>
            Bắt đầu miễn phí
          </CTAButton>
        </CTACard>
      </CTASection>

      {/* Footer */}
      <Footer theme={theme}>
        <FooterContent>
          <FooterSection>
            <FooterTitle>Về chúng tôi</FooterTitle>
            <FooterLinks theme={theme}>
              <FooterLink><a href="#about">Giới thiệu</a></FooterLink>
              <FooterLink><a href="#team">Đội ngũ</a></FooterLink>
              <FooterLink><a href="#careers">Tuyển dụng</a></FooterLink>
              <FooterLink><a href="#press">Báo chí</a></FooterLink>
            </FooterLinks>
          </FooterSection>

          <FooterSection>
            <FooterTitle>Sản phẩm</FooterTitle>
            <FooterLinks theme={theme}>
              <FooterLink><a href="#app">Ứng dụng di động</a></FooterLink>
              <FooterLink><a href="#premium">Premium</a></FooterLink>
              <FooterLink><a href="#schools">Dành cho trường học</a></FooterLink>
              <FooterLink><a href="#business">Dành cho doanh nghiệp</a></FooterLink>
            </FooterLinks>
          </FooterSection>

          <FooterSection>
            <FooterTitle>Hỗ trợ</FooterTitle>
            <FooterLinks theme={theme}>
              <FooterLink><a href="#help">Trung tâm hỗ trợ</a></FooterLink>
              <FooterLink><a href="#faq">Câu hỏi thường gặp</a></FooterLink>
              <FooterLink><a href="#contact">Liên hệ</a></FooterLink>
              <FooterLink><a href="#privacy">Chính sách bảo mật</a></FooterLink>
            </FooterLinks>
          </FooterSection>

          <FooterSection>
            <FooterTitle>Kết nối với chúng tôi</FooterTitle>
            <SocialLinks>
              <SocialLink href="#facebook" theme={theme}>📘</SocialLink>
              <SocialLink href="#twitter" theme={theme}>🐦</SocialLink>
              <SocialLink href="#instagram" theme={theme}>📷</SocialLink>
              <SocialLink href="#youtube" theme={theme}>📺</SocialLink>
            </SocialLinks>
          </FooterSection>
        </FooterContent>

        <FooterBottom theme={theme}>
          <p>&copy; 2025 EnglishMaster. All rights reserved. Made with ❤️ in Vietnam</p>
        </FooterBottom>
      </Footer>
    </PageWrapper>
  );
};

export default Home;