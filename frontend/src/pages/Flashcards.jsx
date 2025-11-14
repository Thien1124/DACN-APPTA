import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowBack, ArrowForward, Refresh, Edit, School, CardMembership } from '@mui/icons-material';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';


// ========== STYLED COMPONENTS ==========

const PageWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
`;

const MainContent = styled.div`
  /* reserve exact space for left and right sidebars so content never sits under them */
  margin-left: 280px;           /* left sidebar width */
  margin-right: 380px;         /* right sidebar width (must match RightSidebar) */
  width: calc(100% - 280px - 380px); /* force content area to the middle */
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;         /* center inner container */
  min-height: 100vh;
  box-sizing: border-box;

  @media (max-width: 1400px) {
    margin-right: 320px;
    width: calc(100% - 280px - 320px);
  }

  @media (max-width: 1200px) {
    /* hide right sidebar on smaller screens — main content can use full width */
    margin-right: 0;
    width: calc(100% - 280px);
  }

  @media (max-width: 1024px) {
    margin-left: 80px;         /* collapsed left space on smaller screens */
    margin-right: 24px;
    width: calc(100% - 80px - 24px);
    padding: 1rem;
  }
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const FlashcardsContainer = styled.div`
  max-width: 1100px;           /* center column width */
  width: 100%;
  margin: 0 auto;              /* center in MainContent */
  display: flex;
  flex-direction: column;
  align-items: center;
`;

/* tighten grid so cards appear centered and consistent */
const FlashcardsGrid = styled.div`
  display: grid;
  /* make each card at least 280px so grid doesn't stretch under sidebar area */
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  width: 100%;
  justify-items: center;
`;

/* ensure each card has a max width so grid stays centered and not under sidebar */
const FlashcardCard = styled.div`
  width: 100%;
  max-width: 360px;            /* card width */
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.95)' 
    : 'rgba(255, 255, 255, 0.95)'
  };
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  border: 2px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.4)' 
    : 'rgba(229, 231, 235, 0.6)'
  };
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(88, 204, 2, 0.06), transparent);
    transition: left 0.6s;
  }

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0,0,0,0.12);
    border-color: #58CC02;
    
    &::before {
      left: 100%;
    }
  }
`;

const CardFront = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  text-align: center;
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#f9fafb'};
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
`;

const CardBack = styled.div`
  font-size: 1.25rem;
  color: ${props => props.theme === 'dark' ? '#d1d5db' : '#374151'};
  text-align: center;
  padding: 1.5rem;
  background: ${props => props.theme === 'dark' ? '#111827' : '#ffffff'};
  border-radius: 12px;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  border: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CardInfo = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  text-align: center;
  padding: 0.75rem;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#f9fafb'};
  border-radius: 8px;
  border: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  font-style: italic;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  margin-top: 3rem;
  padding: 1rem;
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
`;

const PageButton = styled.button`
  padding: 0.75rem 1.25rem;
  border: 2px solid ${props => props.active ? '#58CC02' : 'transparent'};
  background: ${props => props.active 
    ? 'linear-gradient(135deg, #58CC02, #45a302)' 
    : 'transparent'
  };
  color: ${props => props.active ? 'white' : '#6b7280'};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 600;
  font-size: 0.875rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(88, 204, 2, 0.3);
    border-color: #58CC02;
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: #58CC02;
  color: white;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: #45a302;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

// ========== COMPONENT ==========

const Flashcards = () => {
  const [theme] = useState('light');
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0); // total flashcards from API
  const itemsPerPage = 12;

  const fetchFlashcards = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.');

      const response = await fetch(`${process.env.REACT_APP_API_URL}/flashcards`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        if (response.status === 403) throw new Error('Bạn không có quyền truy cập flashcards này.');
        if (response.status === 404) throw new Error('Không tìm thấy flashcards. Vui lòng liên hệ admin.');
        throw new Error(`Lỗi server: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.flashcards) {
        const allFlashcards = data.flashcards;
        const total = data.count ?? allFlashcards.length;
        setTotalItems(total);
        const pages = Math.max(1, Math.ceil(total / itemsPerPage));
        setTotalPages(pages);

        // slice for current page
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        setFlashcards(allFlashcards.slice(start, end));
      } else {
        throw new Error(data.message || 'Không thể tải flashcards');
      }
    } catch (err) {
      console.error('❌ Error fetching flashcards:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashcards();
  }, [currentPage]);

  // ✅ THÊM: Loading state
  if (loading) {
    return (
      <PageWrapper>
        <LeftSidebar />
        <MainContent>
          <LoadingText theme={theme}>Đang tải flashcards...</LoadingText>
        </MainContent>
        <RightSidebar
          lessonsToUnlock={8}
          dailyGoal={{
            current: 10,
            target: 10,
            label: 'Kiếm 10 KN'
          }}
          streak={1}
          showProfile={true}
        />
      </PageWrapper>
    );
  }

  // ✅ THÊM: Error state
  if (error) {
    return (
      <PageWrapper>
        <LeftSidebar />
        <MainContent>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '50vh',
            flexDirection: 'column',
            gap: '1rem',
            textAlign: 'center',
            padding: '2rem'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Không thể tải flashcards</h2>
            <p style={{ color: '#6b7280', marginBottom: '2rem', lineHeight: '1.6' }}>
              {error}
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Button onClick={() => window.location.reload()}>
                <Refresh /> Thử lại
              </Button>
              <Button onClick={() => window.location.href = '/login'}>
                Đăng nhập lại
              </Button>
            </div>
          </div>
        </MainContent>
        <RightSidebar
          lessonsToUnlock={8}
          dailyGoal={{
            current: 10,
            target: 10,
            label: 'Kiếm 10 KN'
          }}
          streak={1}
          showProfile={true}
        />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <LeftSidebar />
      
      <MainContent>
        <Header>
          <Title theme={theme}>
            <School /> Flashcards 
          </Title>
        </Header>

        {flashcards.length === 0 ? (
          <EmptyState theme={theme}>
            <CardMembership sx={{ fontSize: 48, mb: 2, color: theme === 'dark' ? '#9ca3af' : '#6b7280' }} />
            <div>Chưa có flashcard nào</div>
            <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Vui lòng liên hệ admin để thêm flashcards
            </div>
          </EmptyState>
        ) : (
          <>
            <FlashcardsContainer>
              <FlashcardsGrid>
                {flashcards.map((flashcard) => (
                  <FlashcardCard key={flashcard._id} theme={theme}>
                    <CardFront theme={theme}>
                      {flashcard.front}
                    </CardFront>
                    <CardBack theme={theme}>
                      {flashcard.back}
                    </CardBack>
                    <CardInfo theme={theme}>
                      {flashcard.example && `Ví dụ: ${flashcard.example}`}
                      {flashcard.pronunciation && ` | Phát âm: ${flashcard.pronunciation}`}
                      {flashcard.ipa && ` | IPA: /${flashcard.ipa}/`}
                    </CardInfo>
                  </FlashcardCard>
                ))}
              </FlashcardsGrid>

              {totalPages > 1 && (
                <Pagination>
                  <PageButton
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ArrowBack /> Trước
                  </PageButton>

                  {/* show windowed page buttons when many pages */}
                  {(() => {
                    const maxButtons = 7;
                    const pages = [];
                    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
                    let end = start + maxButtons - 1;
                    if (end > totalPages) {
                      end = totalPages;
                      start = Math.max(1, end - maxButtons + 1);
                    }
                    for (let p = start; p <= end; p++) pages.push(p);
                    return (
                      <>
                        {start > 1 && (
                          <>
                            <PageButton onClick={() => setCurrentPage(1)}>1</PageButton>
                            {start > 2 && <PageButton disabled>…</PageButton>}
                          </>
                        )}
                        {pages.map(p => (
                          <PageButton key={p} active={currentPage === p} onClick={() => setCurrentPage(p)}>
                            {p}
                          </PageButton>
                        ))}
                        {end < totalPages && (
                          <>
                            {end < totalPages - 1 && <PageButton disabled>…</PageButton>}
                            <PageButton onClick={() => setCurrentPage(totalPages)}>{totalPages}</PageButton>
                          </>
                        )}
                      </>
                    );
                  })()}

                  <PageButton
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Sau <ArrowForward />
                  </PageButton>
                </Pagination>
              )}
            </FlashcardsContainer>
          </>
        )}
      </MainContent>

      <RightSidebar
        lessonsToUnlock={8}
        dailyGoal={{
          current: 10,
          target: 10,
          label: 'Kiếm 10 KN'
        }}
        streak={1}
        showProfile={true}
      />
    </PageWrapper>
  );
};

export default Flashcards;