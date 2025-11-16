import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import api from '../utils/api';

// ========== STYLED COMPONENTS ==========

const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #1a1a1a;
  font-weight: 800;
`;

const CreateButton = styled.button`
  padding: 0.875rem 1.75rem;
  background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(88, 204, 2, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(88, 204, 2, 0.4);
  }
`;

const FilterSection = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const Select = styled.select`
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.9375rem;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #58CC02;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 300px;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.9375rem;
  
  &:focus {
    outline: none;
    border-color: #58CC02;
  }
`;

const VideoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
`;

const VideoCard = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
`;

const VideoThumbnail = styled.div`
  width: 100%;
  height: 180px;
  background: ${props => props.url ? `url(${props.url})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  background-size: cover;
  background-position: center;
  position: relative;
  
  &::after {
    content: '▶';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 3rem;
    color: white;
    opacity: 0.9;
  }
`;

const VideoInfo = styled.div`
  padding: 1.25rem;
`;

const VideoTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const VideoMeta = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
`;

const Badge = styled.span`
  padding: 0.25rem 0.625rem;
  background: ${props => {
    if (props.type === 'level') {
      return props.value === 'beginner' ? '#dbeafe' : 
             props.value === 'intermediate' ? '#fef3c7' : '#fecaca';
    }
    return '#f3f4f6';
  }};
  color: ${props => {
    if (props.type === 'level') {
      return props.value === 'beginner' ? '#1e40af' : 
             props.value === 'intermediate' ? '#92400e' : '#991b1b';
    }
    return '#374151';
  }};
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 6px;
  text-transform: capitalize;
`;

const Stats = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  color: #6b7280;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 0.625rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => props.variant === 'edit' && `
    background: #dbeafe;
    color: #1e40af;
    &:hover { background: #bfdbfe; }
  `}
  
  ${props => props.variant === 'delete' && `
    background: #fee2e2;
    color: #991b1b;
    &:hover { background: #fecaca; }
  `}
  
  ${props => props.variant === 'toggle' && `
    background: ${props.active ? '#dcfce7' : '#f3f4f6'};
    color: ${props.active ? '#166534' : '#6b7280'};
    &:hover { opacity: 0.8; }
  `}
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  color: #1a1a1a;
`;

const FormGroup = styled.div`
  margin-bottom: 1.25rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #374151;
  font-size: 0.9375rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.9375rem;
  
  &:focus {
    outline: none;
    border-color: #58CC02;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.9375rem;
  min-height: 120px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #58CC02;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const Button = styled.button`
  flex: 1;
  padding: 0.875rem;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => props.variant === 'primary' && `
    background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
    color: white;
    &:hover { transform: translateY(-2px); }
  `}
  
  ${props => props.variant === 'secondary' && `
    background: #f3f4f6;
    color: #6b7280;
    &:hover { background: #e5e7eb; }
  `}
`;

const SentenceItem = styled.div`
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  position: relative;
`;

const SentenceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const SentenceNumber = styled.span`
  font-weight: 700;
  color: #374151;
  background: #e5e7eb;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.875rem;
`;

const RemoveButton = styled.button`
  background: #fee2e2;
  color: #991b1b;
  border: none;
  border-radius: 6px;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  
  &:hover {
    background: #fecaca;
  }
`;

const SentenceInputs = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
`;

const TimeInputs = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
`;

const AddSentenceButton = styled.button`
  background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  cursor: pointer;
  font-weight: 600;
  width: 100%;
  margin-top: 1rem;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(88, 204, 2, 0.3);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #9ca3af;
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: #6b7280;
  }
`;

// ========== COMPONENT ==========

const AdminSpeakingVideos = () => {
  const { toast, showToast, hideToast } = useToast();
  
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  
  const [filters, setFilters] = useState({
    level: '',
    category: '',
    search: ''
  });
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    sentences: [{ english: '', vietnamese: '', startTime: 0, endTime: 0 }],
    duration: '',
    level: 'beginner',
    category: 'general',
    thumbnailUrl: '',
    order: 0
  });

  useEffect(() => {
    fetchVideos();
  }, [filters]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.level) params.append('level', filters.level);
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      
      const response = await api.get(`/speaking/videos/admin?${params.toString()}`);
      
      if (response.data.success) {
        setVideos(response.data.data.videos);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      showToast('error', 'Lỗi', 'Không thể tải danh sách video');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingVideo(null);
    setFormData({
      title: '',
      description: '',
      videoUrl: '',
      sentences: [{ english: '', vietnamese: '', startTime: 0, endTime: 0 }],
      duration: '',
      level: 'beginner',
      category: 'general',
      thumbnailUrl: '',
      order: 0
    });
    setShowModal(true);
  };

  const handleAddSentence = () => {
    setFormData({
      ...formData,
      sentences: [...formData.sentences, { english: '', vietnamese: '', startTime: 0, endTime: 0 }]
    });
  };

  const handleRemoveSentence = (index) => {
    if (formData.sentences.length > 1) {
      setFormData({
        ...formData,
        sentences: formData.sentences.filter((_, i) => i !== index)
      });
    }
  };

  const handleUpdateSentence = (index, field, value) => {
    const updatedSentences = formData.sentences.map((sentence, i) => 
      i === index ? { ...sentence, [field]: value } : sentence
    );
    setFormData({
      ...formData,
      sentences: updatedSentences
    });
  };

  const handleEdit = (video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description || '',
      videoUrl: video.videoUrl,
      sentences: video.sentences || [{ english: '', vietnamese: '', startTime: 0, endTime: 0 }],
      duration: video.duration || '',
      level: video.level,
      category: video.category,
      thumbnailUrl: video.thumbnailUrl || '',
      order: video.order || 0
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate sentences
    const validSentences = formData.sentences.filter(s => s.english.trim() && s.vietnamese.trim());
    if (validSentences.length === 0) {
      showToast('error', 'Lỗi', 'Phải có ít nhất 1 câu với cả tiếng Anh và tiếng Việt');
      return;
    }
    
    // Validate sentences timing
    for (let i = 0; i < validSentences.length; i++) {
      const sentence = validSentences[i];
      const startTime = parseFloat(sentence.startTime) || 0;
      const endTime = parseFloat(sentence.endTime) || 0;
      
      if (startTime >= endTime) {
        showToast('error', 'Lỗi', `Câu ${i + 1}: Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc`);
        return;
      }
    }
    
    // Add order to sentences
    const sentencesWithOrder = validSentences.map((sentence, index) => ({
      order: index,
      english: sentence.english.trim(),
      vietnamese: sentence.vietnamese.trim(),
      startTime: parseFloat(sentence.startTime) || 0,
      endTime: parseFloat(sentence.endTime) || 0
    }));
    
    const submitData = {
      ...formData,
      sentences: sentencesWithOrder,
      duration: Math.max(...sentencesWithOrder.map(s => s.endTime))
    };
    
    try {
      if (editingVideo) {
        // Update - for now use regular endpoint, might need separate update endpoint
        const response = await api.put(`/speaking/videos/${editingVideo._id}`, submitData);
        if (response.data.success) {
          showToast('success', 'Thành công', 'Cập nhật video thành công');
          fetchVideos();
          setShowModal(false);
        }
      } else {
        // Create - use cake endpoint
        const response = await api.post('/speaking/cake/create-with-sentences', submitData);
        if (response.data.success) {
          showToast('success', 'Thành công', 'Tạo video thành công');
          fetchVideos();
          setShowModal(false);
        }
      }
    } catch (error) {
      console.error('Error saving video:', error);
      showToast('error', 'Lỗi', error.response?.data?.message || 'Không thể lưu video');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Bạn có chắc muốn xóa video "${title}"?`)) return;
    
    try {
      const response = await api.delete(`/speaking/videos/${id}`);
      if (response.data.success) {
        showToast('success', 'Đã xóa', 'Xóa video thành công');
        fetchVideos();
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      showToast('error', 'Lỗi', 'Không thể xóa video');
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const response = await api.put(`/speaking/videos/${id}`, { isActive: !currentStatus });
      if (response.data.success) {
        showToast('success', 'Thành công', `Video đã ${!currentStatus ? 'kích hoạt' : 'vô hiệu hóa'}`);
        fetchVideos();
      }
    } catch (error) {
      console.error('Error toggling video:', error);
      showToast('error', 'Lỗi', 'Không thể cập nhật trạng thái');
    }
  };

  return (
    <PageContainer>
      <Toast toast={toast} onClose={hideToast} />
      
      <Header>
        <Title>📹 Quản lý Speaking Videos</Title>
        <CreateButton onClick={handleCreate}>+ Tạo Video Mới</CreateButton>
      </Header>

      <FilterSection>
        <Select 
          value={filters.level} 
          onChange={(e) => setFilters({...filters, level: e.target.value})}
        >
          <option value="">Tất cả Level</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </Select>
        
        <Select 
          value={filters.category} 
          onChange={(e) => setFilters({...filters, category: e.target.value})}
        >
          <option value="">Tất cả Category</option>
          <option value="conversation">Conversation</option>
          <option value="pronunciation">Pronunciation</option>
          <option value="vocabulary">Vocabulary</option>
          <option value="grammar">Grammar</option>
          <option value="general">General</option>
        </Select>
        
        <SearchInput
          placeholder="Tìm kiếm video..."
          value={filters.search}
          onChange={(e) => setFilters({...filters, search: e.target.value})}
        />
      </FilterSection>

      {loading ? (
        <EmptyState><h3>⏳ Đang tải...</h3></EmptyState>
      ) : videos.length === 0 ? (
        <EmptyState>
          <h3>📹 Chưa có video nào</h3>
          <p>Hãy tạo video đầu tiên!</p>
        </EmptyState>
      ) : (
        <VideoGrid>
          {videos.map(video => (
            <VideoCard key={video._id}>
              <VideoThumbnail url={video.thumbnailUrl} />
              <VideoInfo>
                <VideoTitle>{video.title}</VideoTitle>
                
                <VideoMeta>
                  <Badge type="level" value={video.level}>{video.level}</Badge>
                  <Badge>{video.category}</Badge>
                </VideoMeta>
                
                <Stats>
                  <span>👥 {video.totalAttempts} attempts</span>
                  <span>⭐ {video.averageScore}%</span>
                </Stats>
                
                <Actions>
                  <ActionButton variant="edit" onClick={() => handleEdit(video)}>
                    ✏️ Sửa
                  </ActionButton>
                  <ActionButton 
                    variant="toggle" 
                    active={video.isActive}
                    onClick={() => handleToggleActive(video._id, video.isActive)}
                  >
                    {video.isActive ? '✓ Active' : '✕ Inactive'}
                  </ActionButton>
                  <ActionButton 
                    variant="delete" 
                    onClick={() => handleDelete(video._id, video.title)}
                  >
                    🗑️
                  </ActionButton>
                </Actions>
              </VideoInfo>
            </VideoCard>
          ))}
        </VideoGrid>
      )}

      {showModal && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>{editingVideo ? '✏️ Sửa Video' : '➕ Tạo Video Mới'}</ModalTitle>
            
            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Tiêu đề *</Label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="English Conversation Practice"
                />
              </FormGroup>

              <FormGroup>
                <Label>Mô tả</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Practice everyday English conversation..."
                />
              </FormGroup>

              <FormGroup>
                <Label>Video URL *</Label>
                <Input
                  required
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </FormGroup>

              <FormGroup>
                <Label>Câu nói (Sentence-by-sentence) *</Label>
                <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                  Mỗi câu sẽ có thời gian bắt đầu và kết thúc để video tự động phát từng đoạn
                </div>
                
                {formData.sentences.map((sentence, index) => (
                  <SentenceItem key={index}>
                    <SentenceHeader>
                      <SentenceNumber>Câu {index + 1}</SentenceNumber>
                      {formData.sentences.length > 1 && (
                        <RemoveButton type="button" onClick={() => handleRemoveSentence(index)}>
                          ✕ Xóa
                        </RemoveButton>
                      )}
                    </SentenceHeader>
                    
                    <SentenceInputs>
                      <div>
                        <Label style={{ fontSize: '0.8125rem', marginBottom: '0.25rem' }}>Tiếng Anh *</Label>
                        <Input
                          required
                          value={sentence.english}
                          onChange={(e) => handleUpdateSentence(index, 'english', e.target.value)}
                          placeholder="Hello, how are you?"
                        />
                      </div>
                      <div>
                        <Label style={{ fontSize: '0.8125rem', marginBottom: '0.25rem' }}>Tiếng Việt *</Label>
                        <Input
                          required
                          value={sentence.vietnamese}
                          onChange={(e) => handleUpdateSentence(index, 'vietnamese', e.target.value)}
                          placeholder="Xin chào, bạn thế nào?"
                        />
                      </div>
                    </SentenceInputs>
                    
                    <TimeInputs>
                      <div>
                        <Label style={{ fontSize: '0.8125rem', marginBottom: '0.25rem' }}>Bắt đầu (giây)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          value={sentence.startTime}
                          onChange={(e) => handleUpdateSentence(index, 'startTime', e.target.value)}
                          placeholder="0.0"
                        />
                      </div>
                      <div>
                        <Label style={{ fontSize: '0.8125rem', marginBottom: '0.25rem' }}>Kết thúc (giây)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          value={sentence.endTime}
                          onChange={(e) => handleUpdateSentence(index, 'endTime', e.target.value)}
                          placeholder="3.0"
                        />
                      </div>
                    </TimeInputs>
                  </SentenceItem>
                ))}
                
                <AddSentenceButton type="button" onClick={handleAddSentence}>
                  ➕ Thêm câu mới
                </AddSentenceButton>
              </FormGroup>

              <FormGroup>
                <Label>Thumbnail URL</Label>
                <Input
                  value={formData.thumbnailUrl}
                  onChange={(e) => setFormData({...formData, thumbnailUrl: e.target.value})}
                  placeholder="https://..."
                />
              </FormGroup>

              <FormGroup>
                <Label>Duration (giây) - Tự động tính từ sentences</Label>
                <Input
                  type="number"
                  value={formData.duration || (formData.sentences.length > 0 ? Math.max(...formData.sentences.map(s => parseFloat(s.endTime) || 0)) : 0)}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  placeholder="Tự động tính"
                  readOnly
                  style={{ background: '#f9fafb', cursor: 'not-allowed' }}
                />
                <div style={{ fontSize: '0.8125rem', color: '#6b7280', marginTop: '0.25rem' }}>
                  Duration sẽ được tính tự động từ thời gian kết thúc của câu cuối cùng
                </div>
              </FormGroup>

              <FormGroup>
                <Label>Level</Label>
                <Select
                  value={formData.level}
                  onChange={(e) => setFormData({...formData, level: e.target.value})}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="conversation">Conversation</option>
                  <option value="pronunciation">Pronunciation</option>
                  <option value="vocabulary">Vocabulary</option>
                  <option value="grammar">Grammar</option>
                  <option value="general">General</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Order (Thứ tự hiển thị)</Label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({...formData, order: e.target.value})}
                  placeholder="0"
                />
              </FormGroup>

              <ButtonGroup>
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                  Hủy
                </Button>
                <Button type="submit" variant="primary">
                  {editingVideo ? 'Cập nhật' : 'Tạo mới'}
                </Button>
              </ButtonGroup>
            </form>
          </ModalContent>
        </Modal>
      )}
    </PageContainer>
  );
};

export default AdminSpeakingVideos;
