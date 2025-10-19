import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import Swal from 'sweetalert2';

// ========== STYLED COMPONENTS ==========

const PageWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
`;

const MainContent = styled.div`
  flex: 1;
  margin-left: 280px;
  margin-right: 380px;
  padding: 2rem;
  min-width: 0;

  @media (max-width: 1400px) {
    margin-right: 320px;
  }

  @media (max-width: 1200px) {
    margin-right: 0;
  }

  @media (max-width: 1024px) {
    margin-left: 240px;
  }

  @media (max-width: 768px) {
    margin-left: 0;
    padding: 1rem;
  }
`;

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.125rem;
  color: #6b7280;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const BalanceCard = styled.div`
  background: linear-gradient(135deg, #1CB0F6 0%, #0d9ed8 100%);
  border-radius: 24px;
  padding: 2rem;
  color: white;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 8px 24px rgba(28, 176, 246, 0.3);

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 1.5rem;
    gap: 1rem;
  }
`;

const BalanceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BalanceIcon = styled.div`
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;

  @media (max-width: 768px) {
    width: 56px;
    height: 56px;
    font-size: 1.75rem;
  }
`;

const BalanceText = styled.div``;

const BalanceLabel = styled.div`
  font-size: 0.875rem;
  opacity: 0.9;
  margin-bottom: 0.25rem;
`;

const BalanceAmount = styled.div`
  font-size: 2rem;
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const EarnGemsButton = styled.button`
  background: white;
  color: #1CB0F6;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e5e7eb;
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
`;

const Tab = styled.button`
  background: none;
  border: none;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-weight: 700;
  color: ${props => props.active ? '#1CB0F6' : '#6b7280'};
  border-bottom: 3px solid ${props => props.active ? '#1CB0F6' : 'transparent'};
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover {
    color: #1CB0F6;
  }

  @media (max-width: 768px) {
    padding: 0.875rem 1.25rem;
    font-size: 0.9375rem;
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const ProductIcon = styled.div`
  width: 120px;
  height: 120px;
  margin: 0 auto 1.5rem;
  background: ${props => props.gradient || 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'};
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);

  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
    font-size: 3rem;
  }
`;

const ProductName = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`;

const ProductDescription = styled.p`
  font-size: 0.9375rem;
  color: #6b7280;
  margin-bottom: 1.5rem;
  line-height: 1.5;

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const ProductPrice = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #1CB0F6 0%, #0d9ed8 100%);
  color: white;
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 0.75rem 1.25rem;
  }
`;

const SpecialBadge = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #ef4444;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
`;

// ========== DATA ==========

const shopProducts = {
  powerups: [
    {
      id: 1,
      icon: '❄️',
      name: 'Streak Freeze',
      description: 'Bảo vệ streak của bạn 1 ngày khi không học',
      price: 200,
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
    },
    {
      id: 2,
      icon: '💪',
      name: 'Refill Hearts',
      description: 'Khôi phục toàn bộ trái tim ngay lập tức',
      price: 350,
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
    },
    {
      id: 3,
      icon: '⏰',
      name: 'Unlimited Hearts',
      description: 'Trái tim không giới hạn trong 2 giờ',
      price: 450,
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
    }
  ],
  outfits: [
    {
      id: 4,
      icon: '👔',
      name: 'Business Duo',
      description: 'Bộ vest lịch lãm cho Duo',
      price: 500,
      gradient: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)'
    },
    {
      id: 5,
      icon: '🎃',
      name: 'Halloween Costume',
      description: 'Trang phục Halloween độc đáo',
      price: 600,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      special: 'LIMITED'
    },
    {
      id: 6,
      icon: '👑',
      name: 'Royal Outfit',
      description: 'Trang phục hoàng gia sang trọng',
      price: 800,
      gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
    }
  ],
  gems: [
    {
      id: 7,
      icon: '💎',
      name: '100 Gems',
      description: 'Gói gems nhỏ',
      price: '$0.99',
      gradient: 'linear-gradient(135deg, #1CB0F6 0%, #0d9ed8 100%)'
    },
    {
      id: 8,
      icon: '💎💎',
      name: '500 Gems',
      description: 'Gói gems trung bình',
      price: '$4.99',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
    },
    {
      id: 9,
      icon: '💎💎💎',
      name: '1000 Gems',
      description: 'Gói gems lớn',
      price: '$9.99',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      special: 'BEST VALUE'
    }
  ]
};

// ========== COMPONENT ==========

const Shop = () => {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [activeTab, setActiveTab] = useState('powerups');
  const [userGems, setUserGems] = useState(532);

  const handlePurchase = (product) => {
    if (typeof product.price === 'string') {
      // Real money purchase
      Swal.fire({
        title: `Mua ${product.name}?`,
        text: `Giá: ${product.price}`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#1CB0F6',
        cancelButtonColor: '#6b7280',
        confirmButtonText: '💳 Mua ngay',
        cancelButtonText: 'Hủy'
      }).then((result) => {
        if (result.isConfirmed) {
          showToast('success', 'Thành công!', `Đã mua ${product.name}`);
        }
      });
    } else {
      // Gems purchase
      if (userGems >= product.price) {
        Swal.fire({
          title: `Mua ${product.name}?`,
          html: `
            <div style="text-align: center;">
              <p style="font-size: 1.125rem; margin-bottom: 1rem;">${product.description}</p>
              <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-size: 1.5rem; font-weight: 700; color: #1CB0F6;">
                <span>💎</span>
                <span>${product.price}</span>
              </div>
            </div>
          `,
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#1CB0F6',
          cancelButtonColor: '#6b7280',
          confirmButtonText: '✓ Xác nhận',
          cancelButtonText: 'Hủy'
        }).then((result) => {
          if (result.isConfirmed) {
            setUserGems(prev => prev - product.price);
            showToast('success', 'Thành công!', `Đã mua ${product.name}`);
          }
        });
      } else {
        showToast('error', 'Không đủ gems', 'Bạn cần thêm gems để mua vật phẩm này!');
      }
    }
  };

  const handleEarnGems = () => {
    navigate('/learn');
    showToast('info', 'Kiếm gems', 'Hoàn thành bài học để nhận gems!');
  };

  const currentProducts = shopProducts[activeTab];

  return (
    <PageWrapper>
      <Toast toast={toast} onClose={hideToast} />
      <LeftSidebar />
      
      <MainContent>
        <Container>
          <Header>
            <Title>🛍️ Cửa hàng</Title>
            <Subtitle>Mua vật phẩm để nâng cao trải nghiệm học tập!</Subtitle>
          </Header>

          {/* Balance Card */}
          <BalanceCard>
            <BalanceInfo>
              <BalanceIcon>💎</BalanceIcon>
              <BalanceText>
                <BalanceLabel>Số dư hiện tại</BalanceLabel>
                <BalanceAmount>{userGems.toLocaleString()} Gems</BalanceAmount>
              </BalanceText>
            </BalanceInfo>
            <EarnGemsButton onClick={handleEarnGems}>
              ⚡ Kiếm thêm gems
            </EarnGemsButton>
          </BalanceCard>

          {/* Tabs */}
          <TabsContainer>
            <Tab 
              active={activeTab === 'powerups'} 
              onClick={() => setActiveTab('powerups')}
            >
              ⚡ Power-ups
            </Tab>
            <Tab 
              active={activeTab === 'outfits'} 
              onClick={() => setActiveTab('outfits')}
            >
              👔 Trang phục
            </Tab>
            <Tab 
              active={activeTab === 'gems'} 
              onClick={() => setActiveTab('gems')}
            >
              💎 Mua Gems
            </Tab>
          </TabsContainer>

          {/* Products Grid */}
          <ProductsGrid>
            {currentProducts.map(product => (
              <ProductCard 
                key={product.id}
                onClick={() => handlePurchase(product)}
              >
                {product.special && <SpecialBadge>{product.special}</SpecialBadge>}
                <ProductIcon gradient={product.gradient}>
                  {product.icon}
                </ProductIcon>
                <ProductName>{product.name}</ProductName>
                <ProductDescription>{product.description}</ProductDescription>
                <ProductPrice>
                  {typeof product.price === 'number' ? (
                    <>
                      <span>💎</span>
                      <span>{product.price}</span>
                    </>
                  ) : (
                    <span>{product.price}</span>
                  )}
                </ProductPrice>
              </ProductCard>
            ))}
          </ProductsGrid>
        </Container>
      </MainContent>

      <RightSidebar
        lessonsToUnlock={8}
        dailyGoal={{ current: 10, target: 10, label: 'Kiếm 10 KN' }}
        streak={1}
        showProfile={true}
      />
    </PageWrapper>
  );
};

export default Shop;