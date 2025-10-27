import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import { Book, School, Business, MenuBook, Restaurant, LocalHospital, AutoAwesome, Add, Edit, Delete } from '@mui/icons-material';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import { useToast } from '../hooks/useToast';
import { deckService } from '../services/deckService';
import { geminiService } from '../services/geminiService';

// ...existing styled components...
// Update PageWrapper and add FormWrapper
const PageWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${props => props.theme === 'dark'
    ? 'linear-gradient(135deg, #1a1f2c 0%, #2d3748 50%, #4a5568 100%)'
    : 'linear-gradient(135deg, #EBF4FF 0%, #E6FFFA 50%, #F0FFF4 100%)'
  };
`;

const PageLayout = styled.div`
  display: flex;
  width: 100%;
  position: relative;
`;

const FormWrapper = styled.div`
  flex: 1;
  margin-left: 280px; // LeftSidebar width
  margin-right: 340px; // Increase RightSidebar margin
  padding: 0 20px; // Add padding
  min-width: 0; // Prevent content from overflowing
`;

// Update MainContent styling
const MainContent = styled.div`
  padding: 2.5rem;
  min-width: 0;
  animation: fadeIn 0.5s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1; 
      transform: translateY(0);
    }
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 2rem;
`;

// Update TopicsGrid for better responsiveness
const TopicsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); // More responsive grid
  gap: 1.5rem;
  width: 100%;
`;

// Make TopicCard more compact
const TopicCard = styled.div`
  background: ${props => props.theme === 'dark' ? 'rgba(31, 41, 55, 0.95)' : 'white'};
  border-radius: 20px;
  padding: 1.25rem; // Reduce padding
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  display: flex;
  flex-direction: column;
  height: fit-content;
  min-height: 180px; // Reduce minimum height
  max-width: 100%; // Ensure card doesn't overflow

  &:hover {
    transform: translateY(-4px);
    border-color: #58CC02;
    box-shadow: 0 8px 24px rgba(88, 204, 2, 0.15);
  }
`;

const TopicIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #58CC02;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  color: white;
`;

const TopicName = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.5rem;
`;

const TopicDescription = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-bottom: 1rem;
`;

const TopicStats = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  width: 100%; // Take full width
  padding-right: 2rem; // Add padding to prevent overlap
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(88, 204, 2, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;
// Add this with other styled components in Topics.jsx
const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.primary ? '#58CC02' : '#e5e7eb'};
  color: ${props => props.primary ? 'white' : '#374151'};

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: ${props => props.theme === 'dark' ? '#1f2937' : 'white'};
  padding: 2rem;
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4b5563' : '#e5e7eb'};
  border-radius: 8px;
  background: ${props => props.theme === 'dark' ? '#374151' : 'white'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1f2937'};
`;

const Select = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4b5563' : '#e5e7eb'};
  border-radius: 8px;
  background: ${props => props.theme === 'dark' ? '#374151' : 'white'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1f2937'};
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

// Make TopicActions more compact
const TopicActions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin-top: 1rem;
`;

// Update ActionButton to be more compact
const ActionButton = styled.button.withConfig({
  shouldComponentUpdate: true,
  shouldForwardProp: prop => !['variant'].includes(prop)
})`
  padding: 0.4rem 0.75rem; // Reduce padding
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.8rem; // Smaller font
  cursor: pointer;
  background: ${props => {
    switch(props.variant) {
      case 'ai': return '#1CB0F6';
      case 'edit': return '#FFA116';
      case 'delete': return '#dc2626';
      default: return '#58CC02';
    }
  }};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  
  &:hover {
    opacity: 0.9;
  }

  svg {
    font-size: 16px; // Smaller icons
  }
`;

const Topics = () => {
  const [theme] = useState('light');
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingDeck, setEditingDeck] = useState(null); // Add this line
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'GENERAL',
    level: 'A1',
    difficulty: 'BEGINNER',
    tags: [],
    isPublic: true,
    imageUrl: '/images/default-deck.png'
  });

  // Update fetchTopics to use getMyDecks
  const fetchTopics = async () => {
    try {
      setLoading(true);
      const response = await deckService.getMyDecks();
      setTopics(response.data || []);
    } catch (error) {
      console.error('Fetch decks error:', error);
      showToast('error', 'Lỗi', error.message || 'Không thể tải danh sách bộ thẻ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []); // Remove showToast from dependencies

  const handleTopicClick = (topicId) => {
    navigate(`/topics/${encodeURIComponent(topicId)}`);
  };

  const handleAddTopic = () => {
    setShowModal(true);
  };

  const handleEdit = (deck) => {
    setEditingDeck(deck);
    setFormData({
      title: deck.title,
      description: deck.description,
      category: deck.category,
      level: deck.level,
      difficulty: deck.difficulty,
      isPublic: deck.isPublic,
      imageUrl: deck.imageUrl
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDeck(null);
    setFormData({
      title: '',
      description: '',
      category: 'GENERAL',
      level: 'A1',
      difficulty: 'BEGINNER',
      tags: [],
      isPublic: true,
      imageUrl: '/images/default-deck.png'
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Update handleSubmit to handle both create and edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (editingDeck) {
        response = await deckService.update(editingDeck._id, formData);
        showToast('success', 'Thành công', '✅ Đã cập nhật bộ thẻ thành công');
      } else {
        response = await deckService.create(formData);
        showToast('success', 'Thành công', '✅ Đã tạo bộ thẻ mới thành công');
      }

      if (response.success) {
        fetchTopics();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Save deck error:', error);
      showToast('error', 'Lỗi', error.message || 'Không thể lưu bộ thẻ');
    }
  };

  const handleGenerateAI = async (deck) => {
    try {
      showToast('info', 'Đang xử lý', 'Đang tạo từ vựng bằng AI...');

      const result = await deckService.generateAIFlashcards(deck._id, deck.title);
      
      if (result.success) {
        showToast('success', 'Thành công', `✅ Đã tạo ${result.data.length} từ vựng cho bộ "${deck.title}"`);
        fetchTopics();
      }
    } catch (error) {
      console.error('Generate AI error:', error);
      showToast('error', 'Lỗi', error.message || 'Không thể tạo từ vựng tự động');
    }
  };

  const handleStudy = (deckId) => {
    navigate(`/decks/${deckId}/study`);
    // Optionally increment study count
    deckService.incrementStudy(deckId).catch(console.error);
  };

  // Add delete functionality
  const handleDelete = async (deckId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bộ thẻ này?')) {
      try {
        await deckService.delete(deckId);
        showToast('success', 'Thành công', '✅ Đã xóa bộ thẻ thành công');
        fetchTopics();
      } catch (error) {
        console.error('Delete deck error:', error);
        showToast('error', 'Lỗi', error.message || 'Không thể xóa bộ thẻ');
      }
    }
  };

  return (
    <PageWrapper theme={theme}>
      <LeftSidebar />
      <PageLayout>
        <FormWrapper>
          <MainContent>
            <HeaderSection>
              <Title theme={theme}>Chủ Đề</Title>
              <AddButton onClick={handleAddTopic}>
                <Add /> Thêm chủ đề mới
              </AddButton>
            </HeaderSection>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div>Đang tải dữ liệu...</div>
              </div>
            ) : topics.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div>Chưa có chủ đề nào</div>
                <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Nhấn nút "Thêm chủ đề mới" để bắt đầu
                </div>
              </div>
            ) : (
              <TopicsGrid>
                {topics.map(deck => (
                  <TopicCard key={deck._id} theme={theme}>
                    <TopicIcon>{getTopicIcon(deck.category)}</TopicIcon>
                    <TopicName theme={theme}>{deck.title}</TopicName>
                    <TopicDescription theme={theme}>
                      {deck.description || 'Không có mô tả'}
                    </TopicDescription>
                    <TopicStats theme={theme}>
                      <span>{deck.flashcards?.length || 0} thẻ</span>
                      <span>•</span>
                      <span>{deck.category}</span>
                    </TopicStats>
                    <TopicActions>
                      <ActionButton onClick={(e) => {
                        e.stopPropagation();
                        handleStudy(deck._id);
                      }}>
                        <MenuBook sx={{fontSize: 18}} /> Học
                      </ActionButton>
                      <ActionButton 
                        variant="ai"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateAI(deck);
                        }}
                      >
                        <AutoAwesome sx={{fontSize: 18}} /> Tạo AI
                      </ActionButton>
                      <ActionButton 
                        variant="edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(deck);
                        }}
                      >
                        <Edit sx={{fontSize: 18}} /> Sửa
                      </ActionButton>
                      <ActionButton 
                        variant="delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(deck._id);
                        }}
                      >
                        <Delete sx={{fontSize: 18}} /> Xóa
                      </ActionButton>
                    </TopicActions>
                  </TopicCard>
                ))}
              </TopicsGrid>
            )}
          </MainContent>
        </FormWrapper>
        <RightSidebar />
      </PageLayout>

      {showModal && (
        <Modal onClick={handleCloseModal}>
          <ModalContent theme={theme} onClick={e => e.stopPropagation()}>
            <Title theme={theme}>
              {editingDeck ? 'Chỉnh sửa bộ thẻ' : 'Thêm bộ thẻ mới'}
            </Title>
            <Form onSubmit={handleSubmit}>
              <Input
                theme={theme}
                name="title"  // Changed from name to title
                value={formData.title}
                onChange={handleChange} 
                placeholder="Tên bộ thẻ"
                required
              />
              
              <Input
                theme={theme}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Mô tả chi tiết về bộ thẻ"
                required
              />

              <Select
                theme={theme}
                name="category" 
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="GENERAL">General - Tổng hợp</option>
                <option value="ACADEMIC">Academic - Học thuật</option>
                <option value="BUSINESS">Business - Kinh doanh</option>
                <option value="TRAVEL">Travel - Du lịch</option>
                <option value="FOOD">Food - Ẩm thực</option>
                <option value="HEALTH">Health - Y tế</option>
              </Select>

              <Select
                theme={theme}
                name="level"
                value={formData.level}
                onChange={handleChange}
                required
              >
                <option value="A1">A1 - Beginner</option>
                <option value="A2">A2 - Elementary</option>
                <option value="B1">B1 - Intermediate</option>
                <option value="B2">B2 - Upper Intermediate</option>
                <option value="C1">C1 - Advanced</option>
                <option value="C2">C2 - Mastery</option>
              </Select>

              <Select
                theme={theme}
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                required
              >
                <option value="BEGINNER">Beginner - Người mới</option>
                <option value="INTERMEDIATE">Intermediate - Trung cấp</option>
                <option value="ADVANCED">Advanced - Nâng cao</option>
              </Select>

              <ButtonGroup>
                <AddButton type="button" onClick={handleCloseModal}>Hủy</AddButton>
                <AddButton type="submit">
                  {editingDeck ? 'Cập nhật' : 'Tạo mới'}
                </AddButton>
              </ButtonGroup>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </PageWrapper>
  );
};

// Helper function to get icon based on topic type
const getTopicIcon = (type) => {
  switch (type) {
    case 'basic':
      return <Book />;
    case 'academic':
      return <School />;
    case 'business':
      return <Business />;
    case 'travel':
      return <BeachAccessIcon />;
    case 'food':
      return <Restaurant />;
    case 'medical':
      return <LocalHospital />;
    default:
      return <Book />;
  }
};

export default Topics;