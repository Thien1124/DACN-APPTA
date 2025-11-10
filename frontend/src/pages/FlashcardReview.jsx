import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components'; // ✅ Thêm css
import { useNavigate, useParams } from 'react-router-dom';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import Swal from 'sweetalert2';
import {
  Replay,
  NavigateNext,
  NavigateBefore,
  VolumeUp,
  Shuffle,
  Star,
  StarBorder,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Cancel,
  Help,
  Speed,
  Settings,
  Lightbulb,
  ArrowBack,
  FullscreenExit,
  Fullscreen,
  BookmarkBorder,
  Bookmark
} from '@mui/icons-material';
import { useToast } from '../hooks/useToast';
import { flashcardService } from '../services/flashcardServices';
import { vocabularyBankService } from '../services/vocabularyBankService';

// ========== ANIMATIONS ==========
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const flipCard = keyframes`
  from { transform: rotateY(0deg); }
  to { transform: rotateY(180deg); }
`;

const slideInLeft = keyframes`
  from { opacity: 0; transform: translateX(-100px); }
  to { opacity: 1; transform: translateX(0); }
`;

const slideInRight = keyframes`
  from { opacity: 0; transform: translateX(100px); }
  to { opacity: 1; transform: translateX(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
`;

const celebrate = keyframes`
  0% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.2) rotate(-10deg); }
  50% { transform: scale(1.3) rotate(10deg); }
  75% { transform: scale(1.2) rotate(-5deg); }
  100% { transform: scale(1) rotate(0deg); }
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
  max-width: ${props => props.fullscreen ? '100%' : '900px'};
  margin: 0 auto;
  transition: max-width 0.3s ease;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: white;
  border: 2px solid #e6f3e6;
  border-radius: 12px;
  color: #166a0b;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #f0fbef;
    border-color: #58cc02;
    transform: translateX(-4px);
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: white;
  border: 2px solid #e6f3e6;
  border-radius: 12px;
  color: ${props => props.active ? '#58cc02' : '#6b7280'};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #e6f7e8;
    border-color: #58cc02;
    transform: scale(1.05);
  }
`;

const ProgressSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ProgressText = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #6b7280;
`;

const ProgressStats = styled.div`
  display: flex;
  gap: 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.color || '#6b7280'};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 12px;
  background: #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #58cc02, #45a302);
  border-radius: 6px;
  width: ${props => props.width}%;
  transition: width 0.5s ease;
`;

const CardContainer = styled.div`
  perspective: 1000px;
  margin-bottom: 2rem;
`;

const FlashcardWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  transform: ${props => props.flipped ? 'rotateY(180deg)' : 'rotateY(0)'};
  cursor: pointer;

  @media (max-width: 768px) {
    height: 350px;
  }
`;

const CardFace = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 20px;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
  
  /* ✅ Sửa animation conditional */
  ${props => props.shake && css`
    animation: ${shake} 0.5s ease;
  `}

  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

const CardFront = styled(CardFace)`
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
  border: 3px solid #e6f3e6;
`;

const CardImage = styled.img`
  width: 200px;
  height: 150px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid #e6f3e6;

  @media (max-width: 768px) {
    width: 150px;
    height: 120px;
  }
`;

const CardImagePlaceholder = styled.div`
  width: 200px;
  height: 150px;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border-radius: 12px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 1rem;
  border: 2px dashed #d1d5db;

  @media (max-width: 768px) {
    width: 150px;
    height: 120px;
  }
`;

const CardBack = styled(CardFace)`
  background: linear-gradient(135deg, #e6f7e8 0%, #d1f0d4 100%);
  border: 3px solid #58cc02;
  transform: rotateY(180deg);
`;

const CardBadge = styled.div`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  padding: 0.5rem 1rem;
  background: ${props => props.starred ? '#fbbf24' : '#f3f4f6'};
  color: ${props => props.starred ? 'white' : '#6b7280'};
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CardLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
`;

const CardContent = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  color: #166a0b;
  text-align: center;
  line-height: 1.3;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const CardPhonetic = styled.div`
  font-size: 1.25rem;
  color: #6b7280;
  font-style: italic;
  margin-bottom: 1rem;
`;

const CardExample = styled.div`
  font-size: 1rem;
  color: #4b5563;
  font-style: italic;
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  margin-top: 1rem;
  line-height: 1.6;
`;

const SpeakButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #58cc02, #45a302);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(88, 204, 2, 0.3);

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 8px 20px rgba(88, 204, 2, 0.4);
  }

  &:active {
    animation: ${pulse} 0.3s ease;
  }
`;

const FlipHint = styled.div`
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.875rem;
  color: #9ca3af;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: ${pulse} 2s infinite;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: ${props => {
    if (props.variant === 'easy') return 'linear-gradient(135deg, #58cc02, #45a302)';
    if (props.variant === 'hard') return 'linear-gradient(135deg, #ef4444, #dc2626)';
    if (props.variant === 'again') return 'linear-gradient(135deg, #f59e0b, #d97706)';
    return 'white';
  }};
  color: ${props => props.variant ? 'white' : '#166a0b'};
  border: 2px solid ${props => props.variant ? 'transparent' : '#e6f3e6'};
  border-radius: 14px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props => props.variant ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none'};

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: white;
  color: #166a0b;
  border: 2px solid #e6f3e6;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;

  &:hover:not(:disabled) {
    background: #e6f7e8;
    border-color: #58cc02;
    transform: translateX(${props => props.direction === 'prev' ? '-4px' : '4px'});
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const CompletionCard = styled.div`
  background: white;
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
  text-align: center;
  animation: ${fadeIn} 0.6s ease;
`;

const CompletionIcon = styled.div`
  font-size: 5rem;
  margin-bottom: 1.5rem;
  animation: ${celebrate} 1s ease;
`;

const CompletionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 800;
  color: #166a0b;
  margin: 0 0 1rem;
`;

const CompletionStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
`;

const CompletionStatCard = styled.div`
  background: ${props => props.bgColor || '#f3f4f6'};
  padding: 1.5rem;
  border-radius: 12px;
`;

const CompletionStatNumber = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: ${props => props.color || '#166a0b'};
  margin-bottom: 0.5rem;
`;

const CompletionStatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 600;
`;

const CompletionActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
  flex-wrap: wrap;
`;

const SettingsPanel = styled.div`
  position: fixed;
  top: 56px;
  right: ${props => props.show ? '0' : '-400px'};
  width: 380px;
  height: calc(100vh - 56px);
  background: white;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  overflow-y: auto;
  transition: right 0.3s ease;
  z-index: 1000;

  @media (max-width: 768px) {
    width: 100%;
    right: ${props => props.show ? '0' : '-100%'};
  }
`;

const SettingsTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #166a0b;
  margin: 0 0 1.5rem;
`;

const SettingItem = styled.div`
  margin-bottom: 1.5rem;
`;

const SettingLabel = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
`;

const ToggleSwitch = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
`;
const LoadingIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  animation: ${pulse} 1.5s infinite;
`;
const Switch = styled.input.attrs({ type: 'checkbox' })`
  appearance: none;
  width: 52px;
  height: 28px;
  background: ${props => props.checked ? '#58cc02' : '#d1d5db'};
  border-radius: 14px;
  position: relative;
  cursor: pointer;
  transition: background 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    width: 24px;
    height: 24px;
    background: white;
    border-radius: 50%;
    top: 2px;
    left: ${props => props.checked ? '26px' : '2px'};
    transition: left 0.3s ease;
  }
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 4rem;
  color: #6b7280;
  font-size: 1.125rem;
`;

// ========== COMPONENT ==========
const FlashcardReview = () => {
  const navigate = useNavigate();
  const { deckId } = useParams();
  const { showToast } = useToast();

  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ NEW: Session tracking
  const [sessionId, setSessionId] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [deckInfo, setDeckInfo] = useState(null);

  // Stats
  const [stats, setStats] = useState({
    reviewed: 0,
    correct: 0,
    difficult: 0,
    toReview: 0
  });

  // Settings
  const [settings, setSettings] = useState({
    autoPlay: true,
    shuffle: false,
    showPhonetic: true,
    showExample: true,
    autoFlip: false
  });

  // Animation states
  const [shakeCard, setShakeCard] = useState(false);

  // ✅ Thêm state
  const [savedCards, setSavedCards] = useState(new Set()); // Track saved cards
  const [savingCard, setSavingCard] = useState(false);

  useEffect(() => {
    if (deckId) {
      initializeReview();
    }
  }, [deckId]);

  // ✅ Initialize review session with fallback to deck flashcards
  const initializeReview = async () => {
    try {
      setLoading(true);

      // ✅ Get deck info FIRST
      const deckResponse = await flashcardService.getByDeck(deckId);
      if (deckResponse.success) {
        setDeckInfo(deckResponse.data);
        console.log('✅ Deck info:', deckResponse.data);
      } else {
        throw new Error(deckResponse.message || 'Không thể lấy thông tin deck');
      }

      // 1. Start study session (TIẾP TỤC TỪ ĐÂY)
      const sessionResponse = await flashcardService.startSession(
        deckId, 
        'FLIP',
        'REVIEW',
        50
      );
      console.log('✅ Session response:', sessionResponse);

      if (!sessionResponse.success) {
        throw new Error(sessionResponse.message || 'Không thể bắt đầu session');
      }

      setSessionId(sessionResponse.data.sessionId);
      setStartTime(Date.now());

      // 2. Get flashcards from session OR fallback to deck
      let flashcardsData = sessionResponse.data.flashcards || [];
      console.log('✅ Flashcards from session:', flashcardsData.length);

      // ✅ Fallback: If session returns no flashcards, get from deck directly
      if (flashcardsData.length === 0 && deckResponse.data?.totalCards > 0) {
        console.warn('⚠️ Session returned no flashcards, trying fallback...');
        try {
          const fallbackResponse = await flashcardService.getAllByDeck(deckId);
          if (fallbackResponse.success) {
            flashcardsData = Array.isArray(fallbackResponse.data) 
              ? fallbackResponse.data 
              : (fallbackResponse.data?.data || fallbackResponse.data?.flashcards || []);
            console.log('✅ Fallback flashcards:', flashcardsData.length);
          }
        } catch (fallbackError) {
          console.error('❌ Fallback failed:', fallbackError);
        }
      }

      // ✅ If still no flashcards, show error
      if (flashcardsData.length === 0) {
        throw new Error('Deck này chưa có flashcard nào để ôn tập');
      }

      // ✅ Map backend data to frontend format
      const formattedCards = flashcardsData.map(card => ({
        id: card._id,
        word: card.front || card.word || '',
        phonetic: card.pronunciation ? `/${card.pronunciation}/` : '',
        meaning: card.back || '',
        example: card.meanings?.[0]?.example || '',
        partOfSpeech: card.partOfSpeech || '',
        synonyms: card.synonyms || [],
        antonyms: card.antonyms || [],
        imageUrl: card.imageUrl || '',
        audioUrl: card.audioUrl || '',
        starred: card.isStarred || false,
        reviewed: false,
        difficulty: null
      }));

      // 3. Shuffle if enabled
      const finalCards = settings.shuffle 
        ? formattedCards.sort(() => Math.random() - 0.5)
        : formattedCards;

      setFlashcards(finalCards);
      setStats({
        reviewed: 0,
        correct: 0,
        difficult: 0,
        toReview: finalCards.length
      });

      // 4. Update deck info with actual card count
      if (deckInfo) {
        setDeckInfo(prev => ({
          ...prev,
          totalCards: finalCards.length
        }));
      }

    } catch (error) {
      console.error('❌ Initialize review error:', error);
      
      // ✅ Handle permission error specifically
      if (error.response?.status === 403) {
        await Swal.fire({
          icon: 'warning',
          title: 'Không có quyền truy cập',
          text: 'Bạn không có quyền học bộ thẻ này. Vui lòng liên hệ với chủ sở hữu.',
          confirmButtonText: 'Về trang chủ',
          confirmButtonColor: '#58cc02'
        });
        navigate('/decks');
        return;
      }

      // ✅ Handle existing session error
      if (error.response?.status === 400 && error.response?.data?.data) {
        const existingSession = error.response.data.data;
        
        // ✅ Get deck info if not available
        let currentDeckInfo = deckInfo;
        if (!currentDeckInfo) {
          try {
            const deckResponse = await flashcardService.getByDeck(deckId);
            if (deckResponse.success) {
              currentDeckInfo = deckResponse.data;
              setDeckInfo(currentDeckInfo);
            }
          } catch (err) {
            console.error('Failed to get deck info:', err);
          }
        }
        
        // Show confirmation dialog
        const result = await Swal.fire({
          icon: 'warning',
          title: 'Phiên học chưa hoàn thành',
          html: `
            <div style="text-align: left;">
              <p style="margin-bottom: 1rem; font-size: 1rem; color: #374151;">
                Bạn có một phiên học chưa hoàn thành.
              </p>
              <div style="padding: 1.25rem; background: #f3f4f6; border-radius: 10px; margin-bottom: 1.5rem; border-left: 4px solid #667eea;">
                <p style="margin: 0.5rem 0; font-size: 0.95rem;"><strong>📚 Deck:</strong> ${currentDeckInfo?.title || 'Unknown'}</p>
                <p style="margin: 0.5rem 0; font-size: 0.95rem;"><strong>📊 Tiến độ:</strong> ${existingSession.completedCards || 0}/${existingSession.totalCards || 0} thẻ</p>
                <p style="margin: 0.5rem 0; font-size: 0.95rem;"><strong>🕐 Bắt đầu:</strong> ${new Date(existingSession.startTime).toLocaleString('vi-VN')}</p>
              </div>
              <p style="font-weight: 600; font-size: 1rem; margin-bottom: 0.5rem; color: #1f2937;">Bạn muốn:</p>
            </div>
          `,
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonText: '📖 Tiếp tục phiên cũ',
          denyButtonText: '🔄 Bắt đầu phiên mới',
          cancelButtonText: '❌ Hủy',
          confirmButtonColor: '#58cc02',
          denyButtonColor: '#f59e0b',
          cancelButtonColor: '#6b7280',
          customClass: {
            popup: 'custom-swal-popup',
            confirmButton: 'custom-swal-button',
            denyButton: 'custom-swal-button',
            cancelButton: 'custom-swal-button'
          }
        });

        if (result.isConfirmed) {
          // Continue existing session
          await continueExistingSession(existingSession);
        } else if (result.isDenied) {
          // Abandon old session and start new one
          await abandonAndStartNew(existingSession._id);
        } else {
          // User cancelled - go back
          navigate('/decks');
        }
        
        return;
      }

      showToast('error', 'Lỗi', error.message || 'Không thể khởi tạo phiên ôn tập');
      navigate('/decks');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Helper: Continue existing session
  const continueExistingSession = async (existingSession) => {
    try {
      setLoading(true);

      setSessionId(existingSession._id);
      setStartTime(Date.now());

      // Get remaining flashcards from existing session
      const sessionDetails = await flashcardService.getSessionDetails(existingSession._id);
      
      if (!sessionDetails.success) {
        throw new Error('Không thể lấy thông tin phiên học');
      }

      // Map flashcards that haven't been reviewed yet
      const allCards = sessionDetails.data.flashcards || [];
      const reviewedCardIds = (sessionDetails.data.cardReviews || []).map(r => r.flashcard);
      
      const remainingCards = allCards
        .filter(card => !reviewedCardIds.includes(card._id))
        .map(card => ({
          id: card._id,
          word: card.front,
          phonetic: card.pronunciation ? `/${card.pronunciation}/` : '',
          meaning: card.back,
          example: card.meanings?.[0]?.example || '',
          partOfSpeech: card.partOfSpeech || '',
          synonyms: card.synonyms || [],
          antonyms: card.antonyms || [],
          imageUrl: card.imageUrl || '',
          audioUrl: card.audioUrl || '',
          starred: card.isStarred || false,
          reviewed: false,
          difficulty: null
        }));

      setFlashcards(remainingCards);
      setStats({
        reviewed: sessionDetails.data.completedCards || 0,
        correct: sessionDetails.data.correctAnswers || 0,
        difficult: 0,
        toReview: remainingCards.length
      });

      showToast('success', 'Đã tiếp tục', `Còn ${remainingCards.length} thẻ chưa ôn`);

    } catch (error) {
      console.error('❌ Continue session error:', error);
      showToast('error', 'Lỗi', 'Không thể tiếp tục phiên học');
      navigate('/decks');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Helper: Abandon old session and start new
  const abandonAndStartNew = async (oldSessionId) => {
    try {
      setLoading(true);

      // Abandon old session
      await flashcardService.abandonSession(oldSessionId);
      console.log('✅ Abandoned old session:', oldSessionId);

      // Start new session
      await initializeReview();

    } catch (error) {
      console.error('❌ Abandon and restart error:', error);
      showToast('error', 'Lỗi', 'Không thể bắt đầu phiên mới');
      navigate('/decks');
    } finally {
      setLoading(false);
    }
  };

  const currentCard = flashcards[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    setShowAnswer(!showAnswer);
    if (settings.autoPlay && !isFlipped && currentCard) {
      speakWord(currentCard.word);
    }
  };

  // ✅ Map difficulty to SM-2 quality (0-5)
  const difficultyToQuality = {
    'again': 0,  // Completely forgot
    'hard': 2,   // Difficult to recall
    'good': 4,   // Correct with some hesitation
    'easy': 5    // Perfect recall
  };

  const handleEasy = async () => {
    await submitReview('easy', 5);
    nextCard();
  };

  const handleHard = async () => {
    await submitReview('hard', 2);
    setShakeCard(true);
    setTimeout(() => setShakeCard(false), 500);
    nextCard();
  };

  const handleAgain = async () => {
    await submitReview('again', 0);
    setIsFlipped(false);
    setShowAnswer(false);
    showToast('info', 'Ôn lại', 'Thẻ này sẽ xuất hiện lại sau');
  };

  // ✅ Submit review to backend
  const submitReview = async (difficulty, quality) => {
    try {
      if (!sessionId || !currentCard) return;

      const responseTime = Date.now() - startTime;

      // Submit answer to backend
      const response = await flashcardService.submitAnswer(
        sessionId,
        currentCard.id,
        quality,
        responseTime
      );

      console.log('✅ Answer submitted:', response);

      // Update local state
      markCard(difficulty);

    } catch (error) {
      console.error('❌ Submit review error:', error);
      // Still update local state even if API fails
      markCard(difficulty);
    }
  };

  const markCard = (difficulty) => {
    const updatedCards = [...flashcards];
    updatedCards[currentIndex].reviewed = true;
    updatedCards[currentIndex].difficulty = difficulty;
    setFlashcards(updatedCards);

    setStats(prev => ({
      ...prev,
      reviewed: prev.reviewed + 1,
      correct: difficulty === 'easy' ? prev.correct + 1 : prev.correct,
      difficult: difficulty === 'hard' ? prev.difficult + 1 : prev.difficult,
      toReview: prev.toReview - 1
    }));
  };

  const nextCard = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      setShowAnswer(false);
      setStartTime(Date.now()); // Reset timer for next card
    } else {
      completeReview();
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
      setShowAnswer(false);
      setStartTime(Date.now());
    }
  };

  // ✅ Complete review session
  const completeReview = async () => {
    try {
      if (!sessionId) {
        setIsCompleted(true);
        return;
      }

      const response = await flashcardService.completeSession(sessionId);
      console.log('✅ Session completed:', response);

      if (response.success) {
        // Update stats from backend
        const result = response.data;
        setStats(prev => ({
          ...prev,
          xpEarned: result.xpEarned || 0,
          accuracy: result.accuracy || prev.accuracy
        }));

        showToast('success', 'Hoàn thành', `Bạn đã nhận ${result.xpEarned || 0} XP!`);
      }

      setIsCompleted(true);

    } catch (error) {
      console.error('❌ Complete session error:', error);
      setIsCompleted(true);
    }
  };

  const handleRestart = async () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowAnswer(false);
    setIsCompleted(false);
    setSessionId(null);
    await initializeReview();
  };

  // ✅ Toggle star with backend sync
  const toggleStar = async () => {
    try {
      if (!currentCard) return;

      const updatedCards = [...flashcards];
      updatedCards[currentIndex].starred = !updatedCards[currentIndex].starred;
      setFlashcards(updatedCards);

      // Sync with backend
      await flashcardService.toggleStar(currentCard.id);
      
      showToast('success', 'Đã cập nhật', 
        updatedCards[currentIndex].starred ? 'Đã đánh dấu quan trọng' : 'Đã bỏ đánh dấu'
      );

    } catch (error) {
      console.error('❌ Toggle star error:', error);
      // Revert on error
      const updatedCards = [...flashcards];
      updatedCards[currentIndex].starred = !updatedCards[currentIndex].starred;
      setFlashcards(updatedCards);
      showToast('error', 'Lỗi', 'Không thể cập nhật');
    }
  };

  // ✅ Check saved status khi load flashcards
  useEffect(() => {
    if (flashcards.length > 0) {
      checkSavedStatus();
    }
  }, [flashcards]);

  const checkSavedStatus = async () => {
    try {
      const checks = await Promise.all(
        flashcards.map(card => 
          vocabularyBankService.checkSaved(card.id)
            .then(res => ({ id: card.id, saved: res.isSaved }))
            .catch(() => ({ id: card.id, saved: false }))
        )
      );
      
      const saved = new Set(
        checks.filter(c => c.saved).map(c => c.id)
      );
      setSavedCards(saved);
    } catch (error) {
      console.error('Check saved status error:', error);
    }
  };

  // ✅ Handle save to vocabulary bank
  const handleSaveToBank = async () => {
    if (!currentCard) return;

    try {
      setSavingCard(true);

      const response = await vocabularyBankService.saveFlashcard(currentCard.id);
      
      if (response.success) {
        setSavedCards(prev => new Set([...prev, currentCard.id]));
        
        await Swal.fire({
          icon: 'success',
          title: 'Đã lưu!',
          html: `
            <div style="text-align: left;">
              <p style="font-size: 1rem; margin-bottom: 1rem;">
                Từ vựng "<strong>${currentCard.word}</strong>" đã được lưu vào sổ tay của bạn
              </p>
              <div style="padding: 1rem; background: #e6f7e8; border-radius: 8px; margin-top: 1rem;">
                <p style="margin: 0.5rem 0; font-size: 0.9rem;"><strong>📚 Từ:</strong> ${currentCard.word}</p>
                <p style="margin: 0.5rem 0; font-size: 0.9rem;"><strong>💡 Nghĩa:</strong> ${currentCard.meaning}</p>
                ${currentCard.phonetic ? `<p style="margin: 0.5rem 0; font-size: 0.9rem;"><strong>🔊 Phát âm:</strong> ${currentCard.phonetic}</p>` : ''}
              </div>
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: '📖 Xem sổ tay',
          cancelButtonText: 'Tiếp tục ôn',
          confirmButtonColor: '#58cc02',
          cancelButtonColor: '#6b7280'
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/worldbank');
          }
        });
      }
    } catch (error) {
      console.error('Save to bank error:', error);
      
      if (error.response?.status === 400) {
        showToast('info', 'Thông báo', 'Từ này đã có trong sổ tay của bạn');
      } else {
        showToast('error', 'Lỗi', 'Không thể lưu từ vựng vào sổ tay');
      }
    } finally {
      setSavingCard(false);
    }
  };

  const speakWord = (text) => {
    if (!text || !text.toString().trim()) {
      console.warn('⚠️ Không có text để phát âm');
      return;
    }

    // ✅ Cancel bất kỳ speech nào đang chạy
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    // ✅ Hàm chọn giọng ENGLISH tốt nhất
    const getEnglishVoice = (voices) => {
      console.log('📋 Available voices:', voices.map(v => `${v.name} (${v.lang})`));

      // ✅ 1. Ưu tiên Google US English
      let voice = voices.find(v => 
        v.lang === 'en-US' && 
        v.name.toLowerCase().includes('google')
      );
      if (voice) {
        console.log('✅ Chọn Google US:', voice.name);
        return voice;
      }

      // ✅ 2. Microsoft David/Zira (Windows)
      voice = voices.find(v => 
        v.lang === 'en-US' && 
        (v.name.includes('David') || v.name.includes('Zira'))
      );
      if (voice) {
        console.log('✅ Chọn Microsoft:', voice.name);
        return voice;
      }

      // ✅ 3. Samantha (macOS)
      voice = voices.find(v => 
        v.lang === 'en-US' && 
        v.name.includes('Samantha')
      );
      if (voice) {
        console.log('✅ Chọn Samantha:', voice.name);
        return voice;
      }

      // ✅ 4. BẤT KỲ giọng en-US nào (KHÔNG phải en-GB)
      voice = voices.find(v => v.lang === 'en-US');
      if (voice) {
        console.log('✅ Chọn en-US:', voice.name);
        return voice;
      }

      // ✅ 5. Bất kỳ giọng English nào (en-GB, en-AU...)
      voice = voices.find(v => v.lang && v.lang.startsWith('en-'));
      if (voice) {
        console.log('✅ Chọn English:', voice.name);
        return voice;
      }

      // ✅ 6. LOẠI BỎ tất cả giọng Vietnamese
      voice = voices.find(v => 
        v.lang && 
        !v.lang.startsWith('vi') && 
        !v.name.toLowerCase().includes('vietnam')
      );
      if (voice) {
        console.log('⚠️ Fallback voice:', voice.name);
        return voice;
      }

      console.error('❌ Không tìm thấy giọng English!');
      return null;
    };

    // ✅ Hàm thực hiện speak
    const doSpeak = (selectedVoice) => {
      const utterance = new SpeechSynthesisUtterance(text.toString());
      
      // ✅ QUAN TRỌNG: Set voice TRƯỚC khi set lang
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      // ✅ Luôn set lang = en-US
      utterance.lang = 'en-US';
      
      // ✅ Điều chỉnh giọng nói
      utterance.rate = 0.9;   // Tốc độ (0.1 - 10)
      utterance.pitch = 1.0;  // Cao độ (0 - 2)
      utterance.volume = 1.0; // Âm lượng (0 - 1)

      utterance.onstart = () => {
        console.log(`🔊 Đang đọc: "${text}"`);
        console.log(`   Voice: ${utterance.voice?.name || 'default'}`);
        console.log(`   Lang: ${utterance.lang}`);
      };

      utterance.onend = () => {
        console.log('✅ Hoàn thành');
      };

      utterance.onerror = (err) => {
        if (err.error !== 'canceled') {
          console.error('❌ Lỗi:', err.error);
        }
      };

      window.speechSynthesis.speak(utterance);
    };

    // ✅ Lấy danh sách voices
    let voices = window.speechSynthesis.getVoices();

    if (voices.length > 0) {
      // ✅ Đã có voices, chọn ngay
      const englishVoice = getEnglishVoice(voices);
      doSpeak(englishVoice);
    } else {
      
      // ✅ Chỉ set event 1 lần
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
        console.log(`✅ Loaded ${voices.length} voices`);
        
        const englishVoice = getEnglishVoice(voices);
        doSpeak(englishVoice);
        
        // ✅ Clear event sau khi dùng xong
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  };

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    if (key === 'shuffle' && value) {
      // Re-shuffle cards
      const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
      setFlashcards(shuffled);
      setCurrentIndex(0);
      setIsFlipped(false);
      setShowAnswer(false);
    }
  };

  // ✅ Loading state
  if (loading) {
    return (
      <PageWrapper>
        <LeftSidebar />
        <MainContent>
          <ContentInner>
            <LoadingText>
            <LoadingIcon>📚</LoadingIcon>
            Đang tải flashcards...
          </LoadingText>
          </ContentInner>
        </MainContent>
        <RightSidebar />
      </PageWrapper>
    );
  }

  // ✅ Completion screen with backend stats
  if (isCompleted) {
    const accuracy = stats.reviewed > 0 
      ? Math.round((stats.correct / stats.reviewed) * 100) 
      : 0;

    return (
      <PageWrapper fullscreen={fullscreen}>
        {!fullscreen && <LeftSidebar />}
        <MainContent>
          <ContentInner fullscreen={fullscreen}>
            <CompletionCard>
              <CompletionIcon>🎉</CompletionIcon>
              <CompletionTitle>Xuất sắc! Bạn đã hoàn thành!</CompletionTitle>
              
              <CompletionStats>
                <CompletionStatCard bgColor="#e6f7e8">
                  <CompletionStatNumber color="#58cc02">{stats.reviewed}</CompletionStatNumber>
                  <CompletionStatLabel>Đã ôn tập</CompletionStatLabel>
                </CompletionStatCard>
                <CompletionStatCard bgColor="#e6f7e8">
                  <CompletionStatNumber color="#58cc02">{stats.correct}</CompletionStatNumber>
                  <CompletionStatLabel>Đúng</CompletionStatLabel>
                </CompletionStatCard>
                <CompletionStatCard bgColor="#fff7e6">
                  <CompletionStatNumber color="#f59e0b">{stats.difficult}</CompletionStatNumber>
                  <CompletionStatLabel>Khó</CompletionStatLabel>
                </CompletionStatCard>
                <CompletionStatCard bgColor="#e6f7e8">
                  <CompletionStatNumber color="#166a0b">{accuracy}%</CompletionStatNumber>
                  <CompletionStatLabel>Độ chính xác</CompletionStatLabel>
                </CompletionStatCard>
                {stats.xpEarned && (
                  <CompletionStatCard bgColor="#fef3c7">
                    <CompletionStatNumber color="#f59e0b">+{stats.xpEarned}</CompletionStatNumber>
                    <CompletionStatLabel>XP nhận được</CompletionStatLabel>
                  </CompletionStatCard>
                )}
              </CompletionStats>

              <CompletionActions>
                <ActionButton variant="easy" onClick={handleRestart}>
                  <Replay />
                  Ôn lại
                </ActionButton>
                <ActionButton onClick={() => navigate('/decks')}>
                  <ArrowBack />
                  Về danh sách
                </ActionButton>
              </CompletionActions>
            </CompletionCard>
          </ContentInner>
        </MainContent>
        {!fullscreen && <RightSidebar />}
      </PageWrapper>
    );
  }

  // ✅ No flashcards found
  if (!currentCard) {
    return (
      <PageWrapper>
        <LeftSidebar />
        <MainContent>
          <ContentInner>
            <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <h3>Không có flashcard nào</h3>
              <p>Deck này chưa có flashcard để ôn tập</p>
              <ActionButton onClick={() => navigate('/decks')} style={{ marginTop: '2rem' }}>
                <ArrowBack />
                Về danh sách
              </ActionButton>
            </div>
          </ContentInner>
        </MainContent>
        <RightSidebar />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper fullscreen={fullscreen}>
      {!fullscreen && <LeftSidebar />}
      <MainContent>
        <ContentInner fullscreen={fullscreen}>
          <Header>
            <BackButton onClick={() => navigate('/decks')}>
              <ArrowBack />
              Quay lại
            </BackButton>

            <HeaderActions>
              {/* ✅ NÚT LƯU VÀO SỔ TAY */}
              <IconButton 
                onClick={handleSaveToBank} 
                active={savedCards.has(currentCard?.id)}
                disabled={savingCard || savedCards.has(currentCard?.id)}
                title={savedCards.has(currentCard?.id) ? "Đã lưu vào sổ tay" : "Lưu vào sổ tay"}
              >
                {savedCards.has(currentCard?.id) ? <Bookmark /> : <BookmarkBorder />}
              </IconButton>

              <IconButton onClick={toggleStar} active={currentCard?.starred}>
                {currentCard?.starred ? <Star /> : <StarBorder />}
              </IconButton>
              <IconButton onClick={() => updateSetting('shuffle', !settings.shuffle)} active={settings.shuffle}>
                <Shuffle />
              </IconButton>
              <IconButton onClick={() => setShowSettings(!showSettings)}>
                <Settings />
              </IconButton>
              <IconButton onClick={toggleFullscreen}>
                {fullscreen ? <FullscreenExit /> : <Fullscreen />}
              </IconButton>
            </HeaderActions>
          </Header>

          <ProgressSection>
            <ProgressHeader>
              <ProgressText>
                Thẻ {currentIndex + 1} / {flashcards.length}
                {deckInfo && (
                  <span style={{ fontSize: '0.875rem', color: '#6b7280', marginLeft: '1rem' }}>
                    (Tổng: {deckInfo.totalCards || flashcards.length} thẻ trong deck)
                  </span>
                )}
              </ProgressText>
              <ProgressStats>
                <StatItem color="#58cc02">
                  <CheckCircle /> {stats.correct}
                </StatItem>
                <StatItem color="#f59e0b">
                  <Help /> {stats.difficult}
                </StatItem>
                <StatItem color="#6b7280">
                  Còn lại: {stats.toReview}
                </StatItem>
              </ProgressStats>
            </ProgressHeader>
            <ProgressBar>
              <ProgressFill width={(stats.reviewed / flashcards.length) * 100} />
            </ProgressBar>
          </ProgressSection>

          <CardContainer>
            <FlashcardWrapper flipped={isFlipped} onClick={handleFlip}>
              <CardFront shake={shakeCard}>
                <CardBadge starred={currentCard.starred}>
                  {currentCard.starred ? <Star /> : <StarBorder />}
                  {currentCard.starred ? 'Quan trọng' : 'Bình thường'}
                </CardBadge>

                {/* ✅ THÊM: Hiển thị hình ảnh nếu có */}
                {currentCard.imageUrl ? (
                  <CardImage 
                    src={currentCard.imageUrl} 
                    alt={currentCard.word}
                    onError={(e) => {
                      console.warn('Image failed to load:', currentCard.imageUrl);
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <CardImagePlaceholder>
                    Không có hình ảnh
                  </CardImagePlaceholder>
                )}

                <CardLabel>Từ vựng</CardLabel>
                <CardContent>{currentCard.word}</CardContent>
                
                {settings.showPhonetic && currentCard.phonetic && (
                  <CardPhonetic>{currentCard.phonetic}</CardPhonetic>
                )}

                <SpeakButton onClick={(e) => {
                  e.stopPropagation();
                  speakWord(currentCard.word);
                }}>
                  <VolumeUp />
                </SpeakButton>

                <FlipHint>
                  <Visibility />
                  Nhấn để xem nghĩa
                </FlipHint>
              </CardFront>

              <CardBack>
                <CardBadge starred={currentCard.starred}>
                  {currentCard.starred ? <Star /> : <StarBorder />}
                  Nghĩa tiếng Việt
                </CardBadge>

                <CardLabel>Nghĩa</CardLabel>
                <CardContent>{currentCard.meaning}</CardContent>

                {settings.showExample && currentCard.example && (
                  <CardExample>
                    <Lightbulb style={{ fontSize: '1rem', marginRight: '0.5rem', color: '#fbbf24' }} />
                    {currentCard.example}
                  </CardExample>
                )}

                <FlipHint>
                  <VisibilityOff />
                  Nhấn để quay lại
                </FlipHint>
              </CardBack>
            </FlashcardWrapper>
          </CardContainer>

          {showAnswer && (
            <ActionButtons>
              <ActionButton variant="again" onClick={handleAgain}>
                <Replay />
                Ôn lại
              </ActionButton>
              <ActionButton variant="hard" onClick={handleHard}>
                <Cancel />
                Khó
              </ActionButton>
              <ActionButton variant="easy" onClick={handleEasy}>
                <CheckCircle />
                Dễ
              </ActionButton>
            </ActionButtons>
          )}

          <NavigationButtons>
            <NavButton 
              direction="prev"
              onClick={prevCard} 
              disabled={currentIndex === 0}
            >
              <NavigateBefore />
              Trước
            </NavButton>
            <NavButton 
              direction="next"
              onClick={nextCard} 
              disabled={currentIndex === flashcards.length - 1}
            >
              Sau
              <NavigateNext />
            </NavButton>
          </NavigationButtons>
        </ContentInner>
      </MainContent>
      {!fullscreen && <RightSidebar />}

      <SettingsPanel show={showSettings}>
        <SettingsTitle>Cài đặt ôn tập</SettingsTitle>
        
        <SettingItem>
          <ToggleSwitch>
            <SettingLabel>Tự động phát âm</SettingLabel>
            <Switch
              checked={settings.autoPlay}
              onChange={(e) => updateSetting('autoPlay', e.target.checked)}
            />
          </ToggleSwitch>
        </SettingItem>

        <SettingItem>
          <ToggleSwitch>
            <SettingLabel>Trộn thẻ ngẫu nhiên</SettingLabel>
            <Switch
              checked={settings.shuffle}
              onChange={(e) => updateSetting('shuffle', e.target.checked)}
            />
          </ToggleSwitch>
        </SettingItem>

        <SettingItem>
          <ToggleSwitch>
            <SettingLabel>Hiển thị phiên âm</SettingLabel>
            <Switch
              checked={settings.showPhonetic}
              onChange={(e) => updateSetting('showPhonetic', e.target.checked)}
            />
          </ToggleSwitch>
        </SettingItem>

        <SettingItem>
          <ToggleSwitch>
            <SettingLabel>Hiển thị ví dụ</SettingLabel>
            <Switch
              checked={settings.showExample}
              onChange={(e) => updateSetting('showExample', e.target.checked)}
            />
          </ToggleSwitch>
        </SettingItem>

        <SettingItem>
          <ToggleSwitch>
            <SettingLabel>Tự động lật thẻ</SettingLabel>
            <Switch
              checked={settings.autoFlip}
              onChange={(e) => updateSetting('autoFlip', e.target.checked)}
            />
          </ToggleSwitch>
        </SettingItem>
      </SettingsPanel>
    </PageWrapper>
  );
};

export default FlashcardReview;