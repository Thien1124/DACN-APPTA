import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import {
  Star,
  StarBorder,
  StarHalf,
  ThumbUp,
  ThumbUpOutlined,
  ArrowBack,
  Send,
  FilterList,
  Sort,
  Person,
  Edit,
  Delete,
  MoreVert
} from '@mui/icons-material';
import { useToast } from '../hooks/useToast';
import { deckService } from '../services/deckService';

// ========== ANIMATIONS ==========
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// ========== STYLED COMPONENTS ==========
const PageWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #f0fbef 0%, #e6f8e3 40%, #dff4d6 100%);
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><g fill="%2358CC02" opacity="0.03"><circle cx="120" cy="80" r="120"/><circle cx="560" cy="160" r="100"/><circle cx="400" cy="420" r="140"/></g></svg>');
  background-repeat: no-repeat;
  background-position: right 10% top 10%;
  position: relative; /* Thêm dòng này */
`;

const MainContent = styled.main`
  flex: 1;
  padding: 7rem 2rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
  animation: ${fadeIn} 0.6s ease;
  
  /* Đảm bảo không bị che */
  position: relative;
  z-index: 1;

  /* Màn hình > 1400px */
  margin-left: 300px;  /* 280px + 20px spacing */
  margin-right: 400px; /* 380px + 20px spacing */

  @media (max-width: 1400px) {
    margin-left: 300px;
    margin-right: 340px;
  }

  @media (max-width: 1200px) {
    margin-left: 300px;
    margin-right: 2rem;
  }

  @media (max-width: 1024px) {
    padding: 6rem 1.5rem 1.5rem;
    margin-left: 260px;
    margin-right: 1.5rem;
  }

  @media (max-width: 768px) {
    padding: 5.5rem 1rem 1rem;
    margin-left: 1rem;
    margin-right: 1rem;
  }
`;
const ContentInner = styled.div`
  width: 100%;
  max-width: 980px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  animation: ${slideIn} 0.5s ease;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: white;
  border: 2px solid #e6f3e6;
  border-radius: 12px;
  color: #166a0b;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;

  &:hover {
    background: #f0fbef;
    border-color: #58cc02;
    transform: translateX(-4px);
  }
`;

const DeckInfo = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
`;

const DeckTitle = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: #166a0b;
  margin: 0 0 1rem;
`;

const RatingOverview = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 2rem;
  align-items: center;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const RatingScore = styled.div`
  text-align: center;
`;

const ScoreNumber = styled.div`
  font-size: 3.5rem;
  font-weight: 800;
  color: #58cc02;
  line-height: 1;
  margin-bottom: 0.5rem;
`;

const StarsDisplay = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
  color: #fbbf24;
`;

const TotalReviews = styled.div`
  font-size: 0.95rem;
  color: #6b7280;
  font-weight: 600;
`;

const RatingBars = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const RatingBar = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BarLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 600;
  min-width: 60px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const BarTrack = styled.div`
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
`;

const BarFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #58cc02, #45a302);
  border-radius: 4px;
  width: ${props => props.width}%;
  transition: width 0.5s ease;
`;

const BarCount = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  min-width: 40px;
  text-align: right;
`;

const ControlsBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: ${props => props.active ? '#58cc02' : 'white'};
  color: ${props => props.active ? 'white' : '#166a0b'};
  border: 2px solid ${props => props.active ? '#58cc02' : '#e6f3e6'};
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(88, 204, 2, 0.2);
  }
`;

const WriteReviewSection = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
  animation: ${fadeIn} 0.6s ease;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #166a0b;
  margin: 0 0 1.5rem;
`;

const RatingSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const RatingLabel = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
`;

const StarButton = styled.button`
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: ${props => props.filled ? '#fbbf24' : '#d1d5db'};
  transition: all 0.2s ease;
  font-size: 2rem;

  &:hover {
    transform: scale(1.2);
    color: #fbbf24;
  }
`;

const ReviewTextarea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 1rem;
  border: 2px solid #e6f3e6;
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #58cc02;
    box-shadow: 0 4px 12px rgba(88, 204, 2, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.75rem;
  background: linear-gradient(135deg, #58cc02 0%, #45a302 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(88, 204, 2, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ReviewsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ReviewCard = styled.div`
  background: white;
  padding: 1.75rem;
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  animation: ${fadeIn} 0.5s ease;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 24px rgba(88, 204, 2, 0.1);
  }
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
`;

const ReviewerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #58cc02, #45a302);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
`;

const ReviewerDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const ReviewerName = styled.div`
  font-weight: 700;
  color: #1f2937;
  font-size: 1rem;
`;

const ReviewDate = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const ReviewRating = styled.div`
  display: flex;
  gap: 0.25rem;
  color: #fbbf24;
`;

const ReviewActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s ease;
  border-radius: 8px;

  &:hover {
    background: #f3f4f6;
    color: #166a0b;
  }
`;

const ReviewText = styled.p`
  font-size: 1rem;
  color: #374151;
  line-height: 1.6;
  margin: 0 0 1rem;
`;

const ReviewFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
`;

const HelpfulButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${props => props.active ? '#e6f7e8' : 'transparent'};
  color: ${props => props.active ? '#166a0b' : '#6b7280'};
  border: 1px solid ${props => props.active ? '#58cc02' : '#d1d5db'};
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e6f7e8;
    border-color: #58cc02;
    color: #166a0b;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  animation: ${fadeIn} 0.6s ease;
`;

const EmptyIcon = styled(Star)`
  font-size: 5rem;
  color: #d1d5db;
  margin-bottom: 1rem;
`;

const EmptyText = styled.p`
  font-size: 1.25rem;
  color: #6b7280;
  font-weight: 600;
`;

// ========== COMPONENT ==========
const DeckReviews = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [deck, setDeck] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, high, low
  const [sortBy, setSortBy] = useState('recent'); // recent, helpful

  // Write review form
  const [newRating, setNewRating] = useState(0);
  const [newReview, setNewReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Mock statistics
  const [stats, setStats] = useState({
    average: 0,
    total: 0,
    distribution: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    }
  });

  useEffect(() => {
    fetchDeckAndReviews();
  }, [deckId]);

  const fetchDeckAndReviews = async () => {
    try {
      setLoading(true);
      
      // Fetch deck details
      const deckResponse = await deckService.getById(deckId);
      setDeck(deckResponse.data);

      // TODO: Replace with real API call
      // const reviewsResponse = await deckService.getReviews(deckId);
      // setReviews(reviewsResponse.data);

      // Mock reviews data
      const mockReviews = [
        {
          id: 1,
          userId: 'user1',
          userName: 'Nguyễn Văn A',
          rating: 5,
          comment: 'Bộ thẻ rất hữu ích, từ vựng phong phú và dễ học!',
          createdAt: new Date('2024-01-15'),
          helpful: 12,
          isHelpful: false
        },
        {
          id: 2,
          userId: 'user2',
          userName: 'Trần Thị B',
          rating: 4,
          comment: 'Nội dung tốt nhưng nên thêm nhiều ví dụ hơn.',
          createdAt: new Date('2024-01-10'),
          helpful: 8,
          isHelpful: true
        },
        {
          id: 3,
          userId: 'user3',
          userName: 'Lê Văn C',
          rating: 5,
          comment: 'Xuất sắc! Đã giúp tôi cải thiện vốn từ rất nhiều.',
          createdAt: new Date('2024-01-05'),
          helpful: 15,
          isHelpful: false
        }
      ];

      setReviews(mockReviews);
      calculateStats(mockReviews);
    } catch (error) {
      console.error('Fetch error:', error);
      showToast('error', 'Lỗi', 'Không thể tải đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reviewsList) => {
    const total = reviewsList.length;
    if (total === 0) {
      setStats({ average: 0, total: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
      return;
    }

    const sum = reviewsList.reduce((acc, r) => acc + r.rating, 0);
    const average = (sum / total).toFixed(1);

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewsList.forEach(r => {
      distribution[r.rating]++;
    });

    setStats({ average: parseFloat(average), total, distribution });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (newRating === 0) {
      showToast('warning', 'Cảnh báo', 'Vui lòng chọn số sao đánh giá');
      return;
    }

    if (!newReview.trim()) {
      showToast('warning', 'Cảnh báo', 'Vui lòng nhập nội dung đánh giá');
      return;
    }

    try {
      setSubmitting(true);
      
      // TODO: Replace with real API call
      // await deckService.createReview(deckId, { rating: newRating, comment: newReview });

      showToast('success', 'Thành công', '✅ Đã gửi đánh giá của bạn');
      
      // Reset form
      setNewRating(0);
      setNewReview('');
      
      // Refresh reviews
      fetchDeckAndReviews();
    } catch (error) {
      console.error('Submit review error:', error);
      showToast('error', 'Lỗi', 'Không thể gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = (reviewId) => {
  const currentReview = reviews.find(r => r.id === reviewId);
  const wasHelpful = currentReview?.isHelpful;
  
  setReviews(prev => prev.map(r => 
    r.id === reviewId 
      ? { 
          ...r, 
          isHelpful: !r.isHelpful, 
          helpful: r.isHelpful ? r.helpful - 1 : r.helpful + 1 
        }
      : r
  ));
  
  showToast(
    'success', 
    'Thành công', 
    wasHelpful ? 'Đã bỏ đánh dấu hữu ích' : 'Đã đánh dấu hữu ích'
  );
};

  const renderStars = (rating, size = 24) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<Star key={i} sx={{ fontSize: size }} />);
      } else if (i - 0.5 === rating) {
        stars.push(<StarHalf key={i} sx={{ fontSize: size }} />);
      } else {
        stars.push(<StarBorder key={i} sx={{ fontSize: size }} />);
      }
    }
    return stars;
  };

  const filteredReviews = reviews
    .filter(r => {
      if (filter === 'high') return r.rating >= 4;
      if (filter === 'low') return r.rating <= 2;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'helpful') return b.helpful - a.helpful;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  if (loading) {
    return (
      <PageWrapper>
        <LeftSidebar />
        <MainContent>
          <ContentInner>
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              Đang tải...
            </div>
          </ContentInner>
        </MainContent>
        <RightSidebar />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <LeftSidebar />
      <MainContent>
        <ContentInner>
          <Header>
            <BackButton onClick={() => navigate('/decks')}>
              <ArrowBack />
              Quay lại danh sách
            </BackButton>
          </Header>

          <DeckInfo>
            <DeckTitle>{deck?.title || 'Tên bộ thẻ'}</DeckTitle>
            <RatingOverview>
              <RatingScore>
                <ScoreNumber>{stats.average || 0}</ScoreNumber>
                <StarsDisplay>{renderStars(stats.average, 28)}</StarsDisplay>
                <TotalReviews>{stats.total} đánh giá</TotalReviews>
              </RatingScore>

              <RatingBars>
                {[5, 4, 3, 2, 1].map(star => (
                  <RatingBar key={star}>
                    <BarLabel>
                      {star} <Star sx={{ fontSize: 16, color: '#fbbf24' }} />
                    </BarLabel>
                    <BarTrack>
                      <BarFill 
                        width={stats.total ? (stats.distribution[star] / stats.total) * 100 : 0} 
                      />
                    </BarTrack>
                    <BarCount>{stats.distribution[star]}</BarCount>
                  </RatingBar>
                ))}
              </RatingBars>
            </RatingOverview>
          </DeckInfo>

          <WriteReviewSection>
            <SectionTitle>Viết đánh giá của bạn</SectionTitle>
            <form onSubmit={handleSubmitReview}>
              <RatingSelector>
                <RatingLabel>Đánh giá:</RatingLabel>
                {[1, 2, 3, 4, 5].map(star => (
                  <StarButton
                    key={star}
                    type="button"
                    filled={star <= newRating}
                    onClick={() => setNewRating(star)}
                  >
                    {star <= newRating ? <Star /> : <StarBorder />}
                  </StarButton>
                ))}
              </RatingSelector>

              <ReviewTextarea
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn về bộ thẻ này..."
                maxLength={500}
              />

              <SubmitButton type="submit" disabled={submitting}>
                <Send />
                {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
              </SubmitButton>
            </form>
          </WriteReviewSection>

          <ControlsBar>
            <FilterGroup>
              <FilterButton 
                active={filter === 'all'}
                onClick={() => setFilter('all')}
              >
                <FilterList />
                Tất cả
              </FilterButton>
              <FilterButton 
                active={filter === 'high'}
                onClick={() => setFilter('high')}
              >
                <Star />
                Cao (4-5★)
              </FilterButton>
              <FilterButton 
                active={filter === 'low'}
                onClick={() => setFilter('low')}
              >
                <StarBorder />
                Thấp (1-2★)
              </FilterButton>
            </FilterGroup>

            <FilterGroup>
              <FilterButton
                active={sortBy === 'recent'}
                onClick={() => setSortBy('recent')}
              >
                <Sort />
                Mới nhất
              </FilterButton>
              <FilterButton
                active={sortBy === 'helpful'}
                onClick={() => setSortBy('helpful')}
              >
                <ThumbUp />
                Hữu ích nhất
              </FilterButton>
            </FilterGroup>
          </ControlsBar>

          {filteredReviews.length > 0 ? (
            <ReviewsList>
              {filteredReviews.map(review => (
                <ReviewCard key={review.id}>
                  <ReviewHeader>
                    <ReviewerInfo>
                      <Avatar>
                        {review.userName.charAt(0).toUpperCase()}
                      </Avatar>
                      <ReviewerDetails>
                        <ReviewerName>{review.userName}</ReviewerName>
                        <ReviewDate>
                          {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                        </ReviewDate>
                      </ReviewerDetails>
                    </ReviewerInfo>
                    <ReviewRating>
                      {renderStars(review.rating, 20)}
                    </ReviewRating>
                  </ReviewHeader>

                  <ReviewText>{review.comment}</ReviewText>

                  <ReviewFooter>
                    <HelpfulButton 
                      active={review.isHelpful}
                      onClick={() => handleHelpful(review.id)}
                    >
                      {review.isHelpful ? <ThumbUp sx={{ fontSize: 18 }} /> : <ThumbUpOutlined sx={{ fontSize: 18 }} />}
                      Hữu ích ({review.helpful})
                    </HelpfulButton>
                  </ReviewFooter>
                </ReviewCard>
              ))}
            </ReviewsList>
          ) : (
            <EmptyState>
              <EmptyIcon />
              <EmptyText>Chưa có đánh giá nào</EmptyText>
            </EmptyState>
          )}
        </ContentInner>
      </MainContent>
      <RightSidebar />
    </PageWrapper>
  );
};

export default DeckReviews;