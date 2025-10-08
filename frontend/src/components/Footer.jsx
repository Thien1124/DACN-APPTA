import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// ========== STYLED COMPONENTS ==========

const FooterContainer = styled.footer`
  background: ${props => props.theme === 'dark' ? '#0c0c0c' : '#1a1a1a'};
  color: white;
  padding: 3rem 2rem 1.5rem;
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
    gap: 1.5rem;
  }
`;

const FooterSection = styled.div``;

const FooterLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: bold;
  color: #58CC02;
  margin-bottom: 1rem;

  span:first-child {
    font-size: 2rem;
  }
`;

const FooterDescription = styled.p`
  font-size: 0.875rem;
  color: #9ca3af;
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const FooterTitle = styled.h4`
  font-size: 1.125rem;
  margin-bottom: 1rem;
  color: #58CC02;
  font-weight: bold;
`;

const FooterLinks = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FooterLinkItem = styled.li`
  margin-bottom: 0.75rem;
`;

const FooterLink = styled.a`
  color: #9ca3af;
  text-decoration: none;
  transition: color 0.3s ease;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    color: #58CC02;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const SocialLink = styled.a`
  width: 45px;
  height: 45px;
  background: #374151;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-size: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    background: #58CC02;
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(88, 204, 2, 0.4);
  }
`;

const FooterBottom = styled.div`
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid #374151;
  color: #9ca3af;
  font-size: 0.875rem;
`;

const FooterBottomLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1rem;
  flex-wrap: wrap;

  a {
    color: #9ca3af;
    text-decoration: none;
    transition: color 0.3s ease;

    &:hover {
      color: #58CC02;
    }
  }
`;

const Copyright = styled.p`
  margin-top: 1rem;
`;

// ========== COMPONENT ==========

const Footer = ({ theme = 'light' }) => {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <FooterContainer theme={theme}>
      <FooterContent>
        {/* Company Info */}
        <FooterSection>
          <FooterLogo>
            <span>🦉</span>
            <span>EnglishMaster</span>
          </FooterLogo>
          <FooterDescription>
            Nền tảng học tiếng Anh trực tuyến hàng đầu Việt Nam. 
            Học mọi lúc, mọi nơi với phương pháp hiện đại và hiệu quả.
          </FooterDescription>
          <SocialLinks>
            <SocialLink href="https://facebook.com" target="_blank" title="Facebook">
              📘
            </SocialLink>
            <SocialLink href="https://twitter.com" target="_blank" title="Twitter">
              🐦
            </SocialLink>
            <SocialLink href="https://instagram.com" target="_blank" title="Instagram">
              📷
            </SocialLink>
            <SocialLink href="https://youtube.com" target="_blank" title="YouTube">
              📺
            </SocialLink>
            <SocialLink href="https://tiktok.com" target="_blank" title="TikTok">
              🎵
            </SocialLink>
          </SocialLinks>
        </FooterSection>

        {/* Product */}
        <FooterSection>
          <FooterTitle>Sản phẩm</FooterTitle>
          <FooterLinks>
            <FooterLinkItem>
              <FooterLink onClick={() => handleNavigate('/dashboard')}>
                🏠 Dashboard
              </FooterLink>
            </FooterLinkItem>
            <FooterLinkItem>
              <FooterLink onClick={() => handleNavigate('/practice')}>
                💪 Luyện tập
              </FooterLink>
            </FooterLinkItem>
            <FooterLinkItem>
              <FooterLink onClick={() => handleNavigate('/progress')}>
                📈 Tiến độ
              </FooterLink>
            </FooterLinkItem>
            <FooterLinkItem>
              <FooterLink href="#premium">
                ⭐ Premium
              </FooterLink>
            </FooterLinkItem>
            <FooterLinkItem>
              <FooterLink href="#mobile">
                📱 Ứng dụng Mobile
              </FooterLink>
            </FooterLinkItem>
          </FooterLinks>
        </FooterSection>

        {/* Resources */}
        <FooterSection>
          <FooterTitle>Tài nguyên</FooterTitle>
          <FooterLinks>
            <FooterLinkItem>
              <FooterLink href="#blog">
                📝 Blog
              </FooterLink>
            </FooterLinkItem>
            <FooterLinkItem>
              <FooterLink href="#tips">
                💡 Mẹo học tập
              </FooterLink>
            </FooterLinkItem>
            <FooterLinkItem>
              <FooterLink href="#community">
                👥 Cộng đồng
              </FooterLink>
            </FooterLinkItem>
            <FooterLinkItem>
              <FooterLink href="#faq">
                ❓ FAQ
              </FooterLink>
            </FooterLinkItem>
            <FooterLinkItem>
              <FooterLink href="#support">
                🆘 Hỗ trợ
              </FooterLink>
            </FooterLinkItem>
          </FooterLinks>
        </FooterSection>

        {/* Company */}
        <FooterSection>
          <FooterTitle>Công ty</FooterTitle>
          <FooterLinks>
            <FooterLinkItem>
              <FooterLink href="#about">
                ℹ️ Về chúng tôi
              </FooterLink>
            </FooterLinkItem>
            <FooterLinkItem>
              <FooterLink href="#team">
                👨‍💼 Đội ngũ
              </FooterLink>
            </FooterLinkItem>
            <FooterLinkItem>
              <FooterLink href="#careers">
                💼 Tuyển dụng
              </FooterLink>
            </FooterLinkItem>
            <FooterLinkItem>
              <FooterLink href="#press">
                📰 Báo chí
              </FooterLink>
            </FooterLinkItem>
            <FooterLinkItem>
              <FooterLink href="#contact">
                📞 Liên hệ
              </FooterLink>
            </FooterLinkItem>
          </FooterLinks>
        </FooterSection>
      </FooterContent>

      <FooterBottom>
        <FooterBottomLinks>
          <a href="#terms">Điều khoản sử dụng</a>
          <a href="#privacy">Chính sách bảo mật</a>
          <a href="#cookies">Cookie Policy</a>
          <a href="#sitemap">Sitemap</a>
        </FooterBottomLinks>
        <Copyright>
          © {new Date().getFullYear()} EnglishMaster. Made with ❤️ by @vinhsonvlog. All rights reserved.
        </Copyright>
      </FooterBottom>
    </FooterContainer>
  );
};

export default Footer;