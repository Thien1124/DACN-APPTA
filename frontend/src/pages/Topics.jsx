import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import { Book, School, Business,MenuBook, Restaurant, LocalHospital,AutoAwesome, Add } from '@mui/icons-material';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import { flashcardServices } from '../services/flashcardServices';
import { useToast } from '../hooks/useToast';
import {deckService} from '../services/deckService'

import { geminiService } from '../services/geminiService';

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
  margin-left: 280px; // Match LeftSidebar width
  width: calc(100% - 280px); // Only account for LeftSidebar
  position: relative;
`;

// Update MainContent styling
const MainContent = styled.div`
  flex: 1;
  padding: 2.5rem;
  padding-right: 2rem; // Add padding to prevent overlap
  min-width: 0;
  max-width: calc(100% - 20px); // Account for RightSidebar width
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

const TopicsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const TopicCard = styled.div`
  background: ${props => props.theme === 'dark' ? 'rgba(31, 41, 55, 0.95)' : 'white'};
  border-radius: 20px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;

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
  padding-right: 2rem; // Add padding to prevent overlap
  max-width: calc(100% - 320px); // Account for RightSidebar width
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

const TopicActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  background: ${props => props.variant === 'ai' ? '#1CB0F6' : '#58CC02'};
  color: white;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  &:hover {
    opacity: 0.9;
  }
`;

const Topics = () => {
  const [theme] = useState('light');
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'GENERAL'
  });

  // Update fetchTopics function
  const fetchTopics = async () => {
    try {
      const response = await flashcardServices.getAll();
      if (response.success) {
        setTopics(response.data);
      } else {
        showToast('error', 'Lỗi', 'Không thể tải danh sách chủ đề');
      }
    } catch (error) {
      console.error('Fetch topics error:', error);
      showToast('error', 'Lỗi', 'Không thể tải danh sách chủ đề');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, [showToast]); // Add fetchTopics to dependencies if needed

  const handleTopicClick = (topicId) => {
    navigate(`/topics/${encodeURIComponent(topicId)}`);
  };

  const handleAddTopic = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      title: '',
      description: '',
      category: 'GENERAL'
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Update handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await flashcardServices.create(formData);
      if (response.success) {
        showToast('success', 'Thành công', '✅ Đã tạo bộ thẻ mới thành công');
        fetchTopics();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Create deck error:', error);
      showToast('error', 'Lỗi', error.response?.data?.message || 'Không thể tạo bộ thẻ mới');
    }
  };

  const handleGenerateAI = async (deck) => {
    try {
      showToast('info', 'Đang xử lý', 'Đang tạo từ vựng bằng AI...');

      // 1. Generate words using Gemini API
      const result = await geminiService.generateWords({
        topic: deck.title,
        category: deck.category,
        count: 10
      });

      if (result.success) {
        // 2. Save generated flashcards to deck
        const saveResponse = await deckService.addFlashcards(deck._id, result.data);
        
        if (saveResponse.success) {
          showToast('success', 'Thành công', `✅ Đã tạo ${result.data.length} từ vựng cho chủ đề "${deck.title}"`);
          fetchTopics(); // Refresh list
        }
      }
    } catch (error) {
      console.error('Generate AI error:', error);
      showToast('error', 'Lỗi', error.message || 'Không thể tạo từ vựng tự động');
    }
  };

  const handleStudy = (topicId) => {
    navigate(`/topics/${topicId}/study`);
  };

  return (
    <PageWrapper theme={theme}>
      <LeftSidebar />
      <PageLayout>
        <FormWrapper>
          <MainContent>
            <HeaderSection>
              <Title theme={theme}>Choose a Topic</Title>
              <AddButton onClick={handleAddTopic}>
                <Add /> Thêm chủ đề mới
              </AddButton>
            </HeaderSection>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <TopicsGrid>
                {topics.map(topic => (
                  <TopicCard key={topic._id} theme={theme}>
                    <TopicIcon>{getTopicIcon(topic.category)}</TopicIcon>
                    <TopicName theme={theme}>{topic.title}</TopicName>
                    <TopicDescription theme={theme}>
                      {topic.description}
                    </TopicDescription>
                    <TopicStats theme={theme}>
                      <span>{topic.flashcards?.length || 0} thẻ</span>
                      <span>•</span>
                      <span>{topic.category}</span>
                    </TopicStats>
                    <TopicActions>
                      <ActionButton onClick={(e) => {
                        e.stopPropagation();
                        handleStudy(topic._id);
                      }}>
                        <MenuBook sx={{fontSize: 18}} /> Học
                      </ActionButton>
                      <ActionButton 
                        variant="ai"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateAI(topic);
                        }}
                      >
                        <AutoAwesome sx={{fontSize: 18}} /> Tạo AI
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
            <Title theme={theme}>Thêm chủ đề mới</Title>
            <Form onSubmit={handleSubmit}>
              <Input
                theme={theme}
                name="title"  // Đổi từ name
                value={formData.title}
                onChange={handleChange} 
                placeholder="Tên chủ đề"
                required
              />
              
              <Input
                theme={theme}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Mô tả"
                required
              />

              <Select
                theme={theme}
                name="category" // Đổi từ type
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

              <Input
                theme={theme}
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                placeholder="Danh mục phụ (không bắt buộc)"
              />

              <ButtonGroup>
                <AddButton type="button" onClick={handleCloseModal}>Hủy</AddButton>
                <AddButton type="submit">Tạo mới</AddButton>
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