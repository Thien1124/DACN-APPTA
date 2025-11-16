import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import api from '../utils/api';
import LeftSidebar from '../components/LeftSidebar';

// ========== STYLED COMPONENTS ==========

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const MainContent = styled.div`
  flex: 1;
  margin-left: 280px;
  padding: 0;

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #1a1a1a;
  font-weight: 800;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1.125rem;
  color: #6b7280;
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
  background: white;
  
  &:focus {
    outline: none;
    border-color: #58CC02;
  }
`;

const VideoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
`;

const VideoCard = styled.div`
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
  }
`;

const VideoThumbnail = styled.div`
  width: 100%;
  height: 200px;
  background: ${props => props.$url ? `url(${props.$url})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  background-size: cover;
  background-position: center;
  position: relative;
  
  &::after {
    content: '▶';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 4rem;
    color: white;
    opacity: 0.9;
    text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
`;

const VideoInfo = styled.div`
  padding: 1.5rem;
`;

const VideoTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.5rem;
`;

const VideoMeta = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
`;

const Badge = styled.span`
  padding: 0.375rem 0.75rem;
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
  font-size: 0.8125rem;
  font-weight: 600;
  border-radius: 8px;
  text-transform: capitalize;
`;

const VideoDescription = styled.p`
  font-size: 0.9375rem;
  color: #6b7280;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 1rem;
`;

const StartButton = styled.button`
  width: 100%;
  padding: 0.875rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
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

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-radius: 50%;
  border-top-color: #58CC02;
  animation: spin 0.8s linear infinite;
  margin: 4rem auto;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// ========== COMPONENT ==========

const SpeakingVideos = () => {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    level: '',
    category: ''
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
      
      const response = await api.get(`/speaking/videos?${params.toString()}`);
      
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

  const handleVideoClick = (videoId) => {
    navigate(`/speaking/${videoId}`);
  };

  if (loading) {
    return (
      <LayoutContainer>
        <LeftSidebar />
        <MainContent>
          <PageContainer>
            <LoadingSpinner />
          </PageContainer>
        </MainContent>
      </LayoutContainer>
    );
  }

  return (
    <LayoutContainer>
      <LeftSidebar />
      <MainContent>
        <PageContainer>
          <Toast toast={toast} onClose={hideToast} />
          
          <Header>
            <Title>Speaking Practice</Title>
            <Subtitle>Luyện phát âm từng câu với phụ đề song ngữ và nhận điểm ngay lập tức</Subtitle>
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
          </FilterSection>

          {videos.length === 0 ? (
            <EmptyState>
              <h3>Chưa có video nào</h3>
              <p>Video speaking sẽ sớm được cập nhật</p>
            </EmptyState>
          ) : (
            <VideoGrid>
              {videos.map(video => (
                <VideoCard key={video._id}>
                  <VideoThumbnail $url={video.thumbnailUrl} />
                  <VideoInfo>
                    <VideoTitle>{video.title}</VideoTitle>
                    
                    <VideoMeta>
                      <Badge type="level" value={video.level}>{video.level}</Badge>
                      <Badge>{video.category}</Badge>
                      {video.duration > 0 && <Badge>⏱️ {video.duration}s</Badge>}
                      {video.sentences && video.sentences.length > 0 && (
                        <Badge>🎯 {video.sentences.length} câu</Badge>
                      )}
                    </VideoMeta>
                    
                    {video.description && (
                      <VideoDescription>{video.description}</VideoDescription>
                    )}
                    
                    <StartButton onClick={() => navigate(`/speaking/${video._id}`)}>
                      Bắt đầu luyện tập
                    </StartButton>
                  </VideoInfo>
                </VideoCard>
              ))}
            </VideoGrid>
          )}
        </PageContainer>
      </MainContent>
    </LayoutContainer>
  );
};

export default SpeakingVideos;
