import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import Swal from 'sweetalert2';

import {
  Diamond,
  Timer,
  Favorite,
  Bolt,
  Person
} from '@mui/icons-material';
import WhatshotIcon from '@mui/icons-material/Whatshot';

// Import shopService
import { shopService } from '../services/shopService';

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

// ========== COMPONENT ==========

const Shop = () => {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [activeTab, setActiveTab] = useState('powerups');
  const [userGems, setUserGems] = useState(0);
  const [shopItems, setShopItems] = useState({
    powerups: [],
    outfits: [],
    gems: []
  });
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Load initial data
  useEffect(() => {
    loadShopData();
  }, []);

  const loadShopData = async () => {
    try {
      setIsLoading(true);

      // Load gems balance
      const gemsData = await shopService.getGems();
      if (gemsData.success) {
        setUserGems(gemsData.gems);
      }

      // Load shop items
      const itemsData = await shopService.getItems();
      if (itemsData.success && itemsData.items.length > 0) {
        // Group items by type
        const groupedItems = {
          powerups: itemsData.items.filter(item => item.type === 'powerup'),
          outfits: itemsData.items.filter(item => item.type === 'outfit'),
          gems: itemsData.items.filter(item => item.type === 'gems')
        };
        setShopItems(groupedItems);
      } else {
        // Fallback to mock data if backend not ready
        setShopItems(mockShopProducts);
      }

      // Load inventory
      const inventoryData = await shopService.getInventory();
      if (inventoryData.success) {
        setInventory(inventoryData.inventory);
      }

    } catch (error) {
      console.error('Error loading shop data:', error);
      showToast('warning', 'Thông báo', 'Đang sử dụng dữ liệu mẫu');
      setShopItems(mockShopProducts);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (product) => {
    if (isPurchasing) return;

    // Real money purchase (gems packages)
    if (product.type === 'gems' || typeof product.price === 'string') {
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
          showToast('info', 'Coming Soon', 'Tính năng thanh toán đang được phát triển');
        }
      });
      return;
    }

    // Fix: Ensure price is a number
    const productPrice = typeof product.price === 'number' ? product.price : 0;

    // Gems purchase (powerups, outfits)
    if (userGems < productPrice) {
      showToast('error', 'Không đủ gems', 'Bạn cần thêm gems để mua vật phẩm này!');
      return;
    }

    try {
      const result = await Swal.fire({
        title: `Mua ${product.name}?`,
        html: `
          <div style="text-align: center;">
            <p style="font-size: 1.125rem; margin-bottom: 1rem;">${product.description}</p>
            <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-size: 1.5rem; font-weight: 700; color: #1CB0F6;">
              <span>💎</span>
              <span>${productPrice}</span>
            </div>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#1CB0F6',
        cancelButtonColor: '#6b7280',
        confirmButtonText: '✓ Xác nhận',
        cancelButtonText: 'Hủy'
      });

      if (result.isConfirmed) {
        setIsPurchasing(true);

        // Call API to purchase
        const purchaseData = await shopService.purchase(product.id || product._id);

        if (purchaseData.success) {
          // Update gems balance - Fix here too
          const newGems = typeof purchaseData.userStats?.gems === 'object' 
            ? purchaseData.userStats.gems.amount 
            : purchaseData.userStats?.gems || userGems - productPrice;
          
          setUserGems(newGems);

          // Refresh inventory
          const inventoryData = await shopService.getInventory();
          if (inventoryData.success) {
            setInventory(inventoryData.inventory);
          }

          // Show success message
          await Swal.fire({
            title: 'Thành công!',
            html: `
              <div style="text-align: center;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">✨</div>
                <p style="font-size: 1.125rem; margin-bottom: 0.5rem;">Đã mua ${product.name}</p>
                <p style="font-size: 0.9375rem; color: #6b7280;">
                  Số dư còn lại: <span style="color: #1CB0F6; font-weight: 700;">${newGems} 💎</span>
                </p>
              </div>
            `,
            icon: 'success',
            confirmButtonColor: '#58CC02',
            confirmButtonText: 'Tuyệt vời!'
          });

          showToast('success', 'Mua thành công!', `${product.name} đã được thêm vào kho`);
        }
      }
    } catch (error) {
      console.error('Purchase error:', error);
      
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi mua vật phẩm';
      
      await Swal.fire({
        title: 'Lỗi!',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Đóng'
      });
      
      showToast('error', 'Lỗi', errorMessage);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleUseItem = async (inventoryItem) => {
    try {
      const result = await Swal.fire({
        title: `Sử dụng ${inventoryItem.item?.name}?`,
        text: inventoryItem.item?.description,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#1CB0F6',
        cancelButtonColor: '#6b7280',
        confirmButtonText: '✓ Sử dụng',
        cancelButtonText: 'Hủy'
      });

      if (result.isConfirmed) {
        const useData = await shopService.useItem(inventoryItem._id);

        if (useData.success) {
          // Refresh inventory
          const inventoryData = await shopService.getInventory();
          if (inventoryData.success) {
            setInventory(inventoryData.inventory);
          }

          showToast('success', 'Thành công!', useData.message);
        }
      }
    } catch (error) {
      console.error('Use item error:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi sử dụng vật phẩm';
      showToast('error', 'Lỗi', errorMessage);
    }
  };

  const handleEarnGems = () => {
    navigate('/learn');
    showToast('info', 'Kiếm gems', 'Hoàn thành bài học để nhận gems!');
  };

  const currentProducts = shopItems[activeTab] || [];

  // Map backend data to frontend format
  const formatProduct = (item) => {
    // ✅ Kiểm tra item có tồn tại không
    if (!item) {
      return {
        id: 'unknown',
        icon: <Diamond sx={{ fontSize: 32, color: 'white' }} />,
        name: 'Vật phẩm không xác định',
        description: 'Không có thông tin',
        price: 0,
        gradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
        special: null,
        type: 'other'
      };
    }

    const iconMap = {
      'streak_freeze': <WhatshotIcon sx={{ fontSize: 40, color: 'white' }} />,
      'refill_hearts': <Favorite sx={{ fontSize: 40, color: 'white' }} />,
      'unlimited_hearts': <Timer sx={{ fontSize: 40, color: 'white' }} />,
      'powerup': <Bolt sx={{ fontSize: 40, color: 'white' }} />,
      'outfit': <Person sx={{ fontSize: 40, color: 'white' }} />,
      'gems': <Diamond sx={{ fontSize: 32, color: 'white' }} />
    };

    const gradientMap = {
      'streak_freeze': 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      'refill_hearts': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      'unlimited_hearts': 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      'powerup': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      'outfit': 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
      'gems': 'linear-gradient(135deg, #1CB0F6 0%, #0d9ed8 100%)'
    };

    // ✅ Fix: Extract gems value from price object with null check
    let priceValue = 0;
    if (item.price) {
      if (typeof item.price === 'object' && item.price.gems !== undefined) {
        priceValue = item.price.gems;
      } else if (typeof item.price === 'number') {
        priceValue = item.price;
      }
    }

    return {
      id: item._id || item.id,
      icon: iconMap[item.itemId] || iconMap[item.type] || item.icon,
      name: item.name || 'Vật phẩm',
      description: item.description || 'Không có mô tả',
      price: priceValue,
      gradient: gradientMap[item.itemId] || gradientMap[item.type] || item.gradient || 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
      special: item.isLimited ? 'LIMITED' : item.special,
      type: item.type || 'other'
    };
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <LeftSidebar />
        <MainContent>
          <LoadingOverlay>
            <LoadingSpinner />
            <LoadingText>Đang tải cửa hàng...</LoadingText>
          </LoadingOverlay>
        </MainContent>
        <RightSidebar
          lessonsToUnlock={8}
          dailyGoal={{ current: 10, target: 10, label: 'Kiếm 10 KN' }}
          streak={1}
          showProfile={true}
        />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Toast toast={toast} onClose={hideToast} />
      <LeftSidebar />
      
      <MainContent>
        <Container>
          <Header>
            <Title>Cửa hàng</Title>
            <Subtitle>Mua vật phẩm để nâng cao trải nghiệm học tập!</Subtitle>
          </Header>

          {/* Balance Card */}
          <BalanceCard>
            <BalanceInfo>
              <BalanceIcon>
                <Diamond sx={{ fontSize: 32, color: 'white' }} />
              </BalanceIcon>
              <BalanceText>
                <BalanceLabel>Số dư hiện tại</BalanceLabel>
                <BalanceAmount>{userGems.toLocaleString()} Gems</BalanceAmount>
              </BalanceText>
            </BalanceInfo>
            <EarnGemsButton onClick={handleEarnGems}>
              <Bolt sx={{ fontSize: 20 }} /> Kiếm thêm gems
            </EarnGemsButton>
          </BalanceCard>

          {/* Tabs */}
          <TabsContainer>
            <Tab 
              active={activeTab === 'powerups'} 
              onClick={() => setActiveTab('powerups')}
            >
              <Bolt sx={{ fontSize: 20 }} /> Power-ups
            </Tab>
            <Tab 
              active={activeTab === 'outfits'} 
              onClick={() => setActiveTab('outfits')}
            >
              <Person sx={{ fontSize: 20 }} /> Trang phục
            </Tab>
            <Tab 
              active={activeTab === 'gems'} 
              onClick={() => setActiveTab('gems')}
            >
              <Diamond sx={{ fontSize: 20 }} /> Mua Gems
            </Tab>
            <Tab 
              active={activeTab === 'inventory'} 
              onClick={() => setActiveTab('inventory')}
            >
              Kho đồ ({inventory.length})
            </Tab>
          </TabsContainer>

          {/* Products Grid */}
          {activeTab !== 'inventory' ? (
            <ProductsGrid>
              {currentProducts.map(product => {
                const formattedProduct = formatProduct(product);
                return (
                  <ProductCard 
                    key={formattedProduct.id}
                    onClick={() => handlePurchase(formattedProduct)}
                    style={{ opacity: isPurchasing ? 0.6 : 1, cursor: isPurchasing ? 'not-allowed' : 'pointer' }}
                  >
                    {formattedProduct.special && <SpecialBadge>{formattedProduct.special}</SpecialBadge>}
                    <ProductIcon gradient={formattedProduct.gradient}>
                      {formattedProduct.icon}
                    </ProductIcon>
                    <ProductName>{formattedProduct.name}</ProductName>
                    <ProductDescription>{formattedProduct.description}</ProductDescription>
                    <ProductPrice>
                      {typeof formattedProduct.price === 'number' ? (
                        <>
                          <Diamond sx={{ fontSize: 20 }} />
                          <span>{formattedProduct.price}</span>
                        </>
                      ) : (
                        <span>{formattedProduct.price}</span>
                      )}
                    </ProductPrice>
                  </ProductCard>
                );
              })}
            </ProductsGrid>
          ) : (
            // Inventory View
            <ProductsGrid>
              {inventory.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📦</div>
                  <h3>Kho đồ trống</h3>
                  <p>Hãy mua vật phẩm từ cửa hàng!</p>
                </div>
              ) : (
                inventory.map(invItem => {
                  // ✅ Kiểm tra invItem.item có tồn tại không trước khi format
                  if (!invItem || !invItem.item) {
                    console.warn('Invalid inventory item:', invItem);
                    return null;
                  }

                  const product = formatProduct(invItem.item);
                  return (
                    <ProductCard 
                      key={invItem._id || Math.random()}
                      onClick={() => handleUseItem(invItem)}
                    >
                      <ProductIcon gradient={product.gradient}>
                        {product.icon}
                      </ProductIcon>
                      <ProductName>{product.name}</ProductName>
                      <ProductDescription>
                        Số lượng: {invItem.quantity || 1}
                        {invItem.expiresAt && (
                          <div>Hết hạn: {new Date(invItem.expiresAt).toLocaleDateString()}</div>
                        )}
                      </ProductDescription>
                      <ProductPrice style={{ background: 'linear-gradient(135deg, #58CC02 0%, #46A302 100%)' }}>
                        ✓ Sử dụng
                      </ProductPrice>
                    </ProductCard>
                  );
                }).filter(Boolean) // ✅ Loại bỏ các item null
              )}
            </ProductsGrid>
          )}
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

// Mock data fallback
const mockShopProducts = {
  powerups: [
    {
      id: 'mock1',
      name: 'Streak Freeze',
      description: 'Bảo vệ streak của bạn 1 ngày khi không học',
      price: 200,
      type: 'powerup',
      itemId: 'streak_freeze'
    },
    {
      id: 'mock2',
      name: 'Refill Hearts',
      description: 'Khôi phục toàn bộ trái tim ngay lập tức',
      price: 350,
      type: 'powerup',
      itemId: 'refill_hearts'
    }
  ],
  outfits: [],
  gems: []
};

// Add Loading components
const LoadingOverlay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
`;

const LoadingSpinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid #e5e7eb;
  border-top-color: #1CB0F6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  margin-top: 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: #6b7280;
`;

export default Shop;