import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import { adminService } from '../services/adminService';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import Swal from 'sweetalert2';
import {
  ArrowBack,
  Edit,
  Delete,
  Add,
  Visibility,
  Public,
  VisibilityOff,
  Style,
  Class,
  School
} from '@mui/icons-material';

// ========== STYLED COMPONENTS ==========

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;
`;

const BackButton = styled.button`
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: #4b5563;
    transform: translateY(-2px);
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  background: ${props => {
    if (props.variant === 'edit') return '#1CB0F6';
    if (props.variant === 'delete') return '#ef4444';
    if (props.variant === 'add') return '#58CC02';
    if (props.variant === 'toggle') return props.published ? '#f59e0b' : '#10b981';
    return '#6b7280';
  }};
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
`;

const DeckInfoCard = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
  margin-bottom: 2rem;
`;

const DeckTitle = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 1rem;
`;

const DeckDescription = styled.p`
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const DeckMeta = styled.div`
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  padding: 1rem;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#f3f4f6'};
  border-radius: 12px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  
  span {
    font-weight: 600;
    color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  background: ${props => props.published ? '#10b981' : '#f59e0b'};
  color: white;
`;

const FlashcardsSection = styled.div`
  margin-top: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FlashcardsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const FlashcardCard = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.15);
  }
`;

const CardFront = styled.div`
  font-size: 1.25rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.75rem;
`;

const CardBack = styled.div`
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-size: 0.875rem;
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const SmallButton = styled.button`
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  background: ${props => {
    if (props.variant === 'edit') return '#1CB0F6';
    if (props.variant === 'delete') return '#ef4444';
    if (props.variant === 'view') return '#8b5cf6';
    return '#6b7280';
  }};
  color: white;

  &:hover {
    opacity: 0.9;
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

// ========== COMPONENT ==========

const AdminDeckDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [loading, setLoading] = useState(true);
  const [deck, setDeck] = useState(null);
  const [flashcards, setFlashcards] = useState([]);

  useEffect(() => {
    fetchDeckDetails();
  }, [id]);

  const fetchDeckDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch deck info
      const deckResponse = await adminService.decks.getById(id);
      console.log('Deck response:', deckResponse);
      
      if (deckResponse.success && deckResponse.data) {
        setDeck(deckResponse.data);
      }

      // Fetch flashcards in this deck
      const flashcardsResponse = await adminService.flashcards.getByDeck(id);
      console.log('Flashcards response:', flashcardsResponse);
      
      if (flashcardsResponse.success && flashcardsResponse.data) {
        setFlashcards(flashcardsResponse.data.flashcards || flashcardsResponse.data || []);
      }
    } catch (error) {
      console.error('Error fetching deck details:', error);
      showToast('error', 'Lỗi', 'Không thể tải thông tin deck');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/admin/decks');
  };

  const handleEdit = () => {
    navigate(`/admin/decks/edit/${id}`);
  };

  const handleAddFlashcard = () => {
    navigate(`/admin/flashcards/create?deckId=${id}`);
  };

  const handleTogglePublish = async () => {
    try {
      await adminService.decks.togglePublish(id);
      showToast('success', 'Thành công', `Đã ${deck.isPublic ? 'ẩn' : 'công khai'} deck`);
      fetchDeckDetails();
    } catch (error) {
      showToast('error', 'Lỗi', 'Không thể cập nhật trạng thái');
    }
  };

  const handleDeleteDeck = async () => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa?',
      text: `Bạn có chắc muốn xóa deck "${deck.title}"? Tất cả flashcards sẽ bị xóa!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        await adminService.decks.delete(id);
        showToast('success', 'Thành công', 'Đã xóa deck');
        setTimeout(() => navigate('/admin/decks'), 1000);
      } catch (error) {
        showToast('error', 'Lỗi', error.response?.data?.message || 'Không thể xóa deck');
      }
    }
  };

  const handleViewFlashcard = (flashcardId) => {
    navigate(`/admin/flashcards/${flashcardId}`);
  };

  const handleEditFlashcard = (flashcardId) => {
    navigate(`/admin/flashcards/edit/${flashcardId}`);
  };

  const handleDeleteFlashcard = async (flashcard) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa?',
      text: `Bạn có chắc muốn xóa flashcard "${flashcard.front}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        await adminService.flashcards.delete(flashcard._id);
        showToast('success', 'Thành công', 'Đã xóa flashcard');
        fetchDeckDetails();
      } catch (error) {
        showToast('error', 'Lỗi', 'Không thể xóa flashcard');
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Chi tiết Deck">
        <LoadingText theme={theme}>Đang tải dữ liệu...</LoadingText>
      </AdminLayout>
    );
  }

  if (!deck) {
    return (
      <AdminLayout pageTitle="Chi tiết Deck">
        <EmptyState theme={theme}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
          <div>Không tìm thấy deck</div>
        </EmptyState>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle={`Deck: ${deck.title}`}>
      <Toast toast={toast} onClose={hideToast} />

      <PageHeader>
        <BackButton onClick={handleBack}>
          <ArrowBack /> Quay lại
        </BackButton>
        
        <HeaderActions>
          <ActionButton variant="add" onClick={handleAddFlashcard}>
            <Add /> Thêm flashcard
          </ActionButton>
          <ActionButton variant="edit" onClick={handleEdit}>
            <Edit /> Sửa deck
          </ActionButton>
          <ActionButton 
            variant="toggle" 
            published={deck.isPublic}
            onClick={handleTogglePublish}
          >
            {deck.isPublic ? (
              <><VisibilityOff /> Ẩn</>
            ) : (
              <><Public /> Công khai</>
            )}
          </ActionButton>
          <ActionButton variant="delete" onClick={handleDeleteDeck}>
            <Delete /> Xóa deck
          </ActionButton>
        </HeaderActions>
      </PageHeader>

      <DeckInfoCard theme={theme}>
        <DeckTitle theme={theme}>{deck.title}</DeckTitle>
        <DeckDescription theme={theme}>
          {deck.description || 'Không có mô tả'}
        </DeckDescription>
        
        <DeckMeta theme={theme}>
          <MetaItem theme={theme}>
            <Class /> Category: <span>{deck.category || 'N/A'}</span>
          </MetaItem>
          <MetaItem theme={theme}>
            <School /> Level: <span>{deck.level || 'N/A'}</span>
          </MetaItem>
          <MetaItem theme={theme}>
            <Style /> Flashcards: <span>{flashcards.length}</span>
          </MetaItem>
          <MetaItem theme={theme}>
            Status: <StatusBadge published={deck.isPublic}>
              {deck.isPublic ? 'Công khai' : 'Nháp'}
            </StatusBadge>
          </MetaItem>
        </DeckMeta>
      </DeckInfoCard>

      <FlashcardsSection>
        <SectionTitle theme={theme}>
          <Style /> Flashcards ({flashcards.length})
        </SectionTitle>

        {flashcards.length === 0 ? (
          <EmptyState theme={theme}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
            <div>Chưa có flashcard nào</div>
            <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Nhấn nút "Thêm flashcard" để bắt đầu
            </div>
          </EmptyState>
        ) : (
          <FlashcardsList>
            {flashcards.map((card) => (
              <FlashcardCard key={card._id} theme={theme}>
                <CardFront theme={theme}>{card.front}</CardFront>
                <CardBack theme={theme}>{card.back}</CardBack>
                
                <CardActions>
                  <SmallButton 
                    variant="view" 
                    onClick={() => handleViewFlashcard(card._id)}
                  >
                    <Visibility sx={{ fontSize: 16 }} /> Xem
                  </SmallButton>
                  <SmallButton 
                    variant="edit" 
                    onClick={() => handleEditFlashcard(card._id)}
                  >
                    <Edit sx={{ fontSize: 16 }} /> Sửa
                  </SmallButton>
                  <SmallButton 
                    variant="delete" 
                    onClick={() => handleDeleteFlashcard(card)}
                  >
                    <Delete sx={{ fontSize: 16 }} /> Xóa
                  </SmallButton>
                </CardActions>
              </FlashcardCard>
            ))}
          </FlashcardsList>
        )}
      </FlashcardsSection>
    </AdminLayout>
  );
};

export default AdminDeckDetail;