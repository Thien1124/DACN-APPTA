import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import api from '../utils/api';

// ========== STYLED COMPONENTS ==========

const PageContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    color: #374151;
  }
`;

const VideoSection = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
`;

const VideoTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 800;
  color: #1a1a1a;
  margin-bottom: 1rem;
`;

const VideoMeta = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
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
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 8px;
  text-transform: capitalize;
`;

const VideoPlayer = styled.div`
  width: 100%;
  height: 450px;
  background: #000;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  overflow: hidden;
  
  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
`;

const TranscriptSection = styled.div`
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
`;

const TranscriptTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.75rem;
`;

const TranscriptText = styled.p`
  font-size: 1rem;
  line-height: 1.8;
  color: #374151;
  white-space: pre-wrap;
`;

const RecordingSection = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 800;
  color: #1a1a1a;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RecordingControls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  margin-bottom: 1.5rem;
`;

const RecordButton = styled.button`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid white;
  background: ${props => props.isRecording ? '#ef4444' : '#ffffff'};
  color: ${props => props.isRecording ? '#ffffff' : '#667eea'};
  font-size: 2.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  
  &:hover {
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const RecordingTimer = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: white;
  font-family: 'Courier New', monospace;
`;

const RecordingStatus = styled.div`
  font-size: 1.125rem;
  color: white;
  font-weight: 600;
  text-align: center;
`;

const AudioPreview = styled.audio`
  width: 100%;
  margin-bottom: 1rem;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(88, 204, 2, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ResultSection = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
`;

const ScoreDisplay = styled.div`
  text-align: center;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  margin-bottom: 2rem;
`;

const ScoreNumber = styled.div`
  font-size: 4rem;
  font-weight: 800;
  color: white;
  margin-bottom: 0.5rem;
`;

const ScoreLabel = styled.div`
  font-size: 1.25rem;
  color: white;
  font-weight: 600;
`;

const ScoreBreakdown = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const ScoreCard = styled.div`
  background: #f9fafb;
  padding: 1.25rem;
  border-radius: 12px;
  text-align: center;
`;

const ScoreValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
`;

const ScoreTitle = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 600;
`;

const FeedbackBox = styled.div`
  background: #f0f9ff;
  border-left: 4px solid #1CB0F6;
  padding: 1.25rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  font-size: 1rem;
  color: #0369a1;
  line-height: 1.6;
`;

const TranscriptionCompare = styled.div`
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 12px;
`;

const CompareTitle = styled.h4`
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.75rem;
`;

const CompareText = styled.p`
  font-size: 0.9375rem;
  line-height: 1.8;
  color: #374151;
  margin-bottom: 1rem;
  white-space: pre-wrap;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
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

const HistorySection = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  margin-top: 2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
`;

const HistoryItem = styled.div`
  padding: 1rem;
  background: #f9fafb;
  border-radius: 10px;
  margin-bottom: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HistoryDate = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const HistoryScore = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${props => props.score >= 80 ? '#16a34a' : props.score >= 60 ? '#ea580c' : '#dc2626'};
`;

// ========== COMPONENT ==========

const SpeakingPractice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [attempts, setAttempts] = useState([]);
  
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchVideo();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id]);

  const fetchVideo = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/speaking/videos/${id}`);
      
      if (response.data.success) {
        setVideo(response.data.data.video);
        setAttempts(response.data.data.userAttempts || []);
      }
    } catch (error) {
      console.error('Error fetching video:', error);
      showToast('error', 'Lỗi', 'Không thể tải video');
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      showToast('error', 'Lỗi', 'Không thể bắt đầu ghi âm. Vui lòng cho phép quyền microphone.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleSubmit = async () => {
    if (!audioBlob) {
      showToast('error', 'Lỗi', 'Vui lòng thu âm trước khi gửi');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const formData = new FormData();
      formData.append('videoId', id);
      formData.append('audio', audioBlob, 'recording.webm');
      
      const response = await api.post('/speaking/attempts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        const attemptId = response.data.data.attemptId;
        showToast('success', 'Thành công', 'Đang xử lý audio của bạn...');
        
        // Poll for result
        pollForResult(attemptId);
      }
    } catch (error) {
      console.error('Error submitting audio:', error);
      showToast('error', 'Lỗi', 'Không thể gửi bài speaking');
      setSubmitting(false);
    }
  };

  const pollForResult = async (attemptId, maxAttempts = 30) => {
    let attempts = 0;
    
    const checkResult = setInterval(async () => {
      try {
        attempts++;
        
        const response = await api.get(`/speaking/attempts/${attemptId}`);
        
        if (response.data.success) {
          const attempt = response.data.data.attempt;
          
          if (attempt.status === 'completed') {
            clearInterval(checkResult);
            setResult(attempt);
            setSubmitting(false);
            showToast('success', 'Hoàn thành', `Điểm của bạn: ${attempt.overallScore}%`);
            fetchVideo(); // Refresh attempts history
          } else if (attempt.status === 'failed') {
            clearInterval(checkResult);
            setSubmitting(false);
            showToast('error', 'Lỗi', 'Xử lý audio thất bại. Vui lòng thử lại.');
          }
        }
        
        if (attempts >= maxAttempts) {
          clearInterval(checkResult);
          setSubmitting(false);
          showToast('error', 'Timeout', 'Xử lý audio mất quá nhiều thời gian');
        }
      } catch (error) {
        console.error('Error polling result:', error);
      }
    }, 2000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const handleTryAgain = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setResult(null);
    setRecordingTime(0);
  };

  if (loading) {
    return <PageContainer><h2>⏳ Đang tải...</h2></PageContainer>;
  }

  if (!video) {
    return <PageContainer><h2>❌ Không tìm thấy video</h2></PageContainer>;
  }

  return (
    <PageContainer>
      <Toast toast={toast} onClose={hideToast} />
      
      <BackButton onClick={() => navigate('/speaking')}>
        ← Quay lại danh sách
      </BackButton>

      <VideoSection>
        <VideoTitle>{video.title}</VideoTitle>
        
        <VideoMeta>
          <Badge type="level" value={video.level}>{video.level}</Badge>
          <Badge>{video.category}</Badge>
          {video.duration > 0 && <Badge>⏱️ {video.duration}s</Badge>}
        </VideoMeta>

        {video.description && (
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>{video.description}</p>
        )}

        <VideoPlayer>
          <iframe 
            src={getYouTubeEmbedUrl(video.videoUrl)}
            allowFullScreen
            title={video.title}
          />
        </VideoPlayer>

        <TranscriptSection>
          <TranscriptTitle>📝 Script (Đọc theo đây)</TranscriptTitle>
          <TranscriptText>{video.transcript}</TranscriptText>
        </TranscriptSection>
      </VideoSection>

      {!result ? (
        <RecordingSection>
          <SectionTitle>🎤 Thu âm giọng của bạn</SectionTitle>
          
          <RecordingControls>
            <RecordButton
              isRecording={isRecording}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={submitting}
            >
              {isRecording ? '⏹' : '🎤'}
            </RecordButton>
            
            {isRecording && (
              <>
                <RecordingTimer>{formatTime(recordingTime)}</RecordingTimer>
                <RecordingStatus>🔴 Đang ghi âm...</RecordingStatus>
              </>
            )}
            
            {!isRecording && recordingTime === 0 && (
              <RecordingStatus>Nhấn để bắt đầu thu âm</RecordingStatus>
            )}
          </RecordingControls>

          {audioUrl && !isRecording && (
            <>
              <AudioPreview controls src={audioUrl} />
              <SubmitButton onClick={handleSubmit} disabled={submitting}>
                {submitting ? '⏳ Đang xử lý...' : '✅ Gửi và Chấm điểm'}
              </SubmitButton>
            </>
          )}
        </RecordingSection>
      ) : (
        <ResultSection>
          <SectionTitle>📊 Kết quả của bạn</SectionTitle>
          
          <ScoreDisplay>
            <ScoreNumber>{result.overallScore}%</ScoreNumber>
            <ScoreLabel>Điểm tổng thể</ScoreLabel>
          </ScoreDisplay>

          <ScoreBreakdown>
            <ScoreCard>
              <ScoreValue>{result.accuracyScore}%</ScoreValue>
              <ScoreTitle>Độ chính xác</ScoreTitle>
            </ScoreCard>
            <ScoreCard>
              <ScoreValue>{result.pronunciationScore}%</ScoreValue>
              <ScoreTitle>Phát âm</ScoreTitle>
            </ScoreCard>
            <ScoreCard>
              <ScoreValue>{result.fluencyScore}%</ScoreValue>
              <ScoreTitle>Lưu loát</ScoreTitle>
            </ScoreCard>
          </ScoreBreakdown>

          <FeedbackBox>
            <strong>💬 Nhận xét:</strong><br />
            {result.feedback}
          </FeedbackBox>

          {result.comparison && (
            <TranscriptionCompare>
              <CompareTitle>📝 Văn bản gốc:</CompareTitle>
              <CompareText>{video.transcript}</CompareText>
              
              <CompareTitle>🎙️ Bạn đã nói:</CompareTitle>
              <CompareText>{result.transcription || '(Không nhận diện được)'}</CompareText>
              
              <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                ✅ Đúng: {result.comparison.correctWords}/{result.comparison.totalWords} từ
                {result.comparison.missedWords?.length > 0 && (
                  <div>❌ Thiếu: {result.comparison.missedWords.join(', ')}</div>
                )}
              </div>
            </TranscriptionCompare>
          )}

          <ButtonGroup>
            <Button variant="secondary" onClick={() => navigate('/speaking')}>
              ← Quay lại
            </Button>
            <Button variant="primary" onClick={handleTryAgain}>
              🔄 Thử lại
            </Button>
          </ButtonGroup>
        </ResultSection>
      )}

      {attempts.length > 0 && (
        <HistorySection>
          <SectionTitle>📜 Lịch sử luyện tập</SectionTitle>
          {attempts.map((attempt, index) => (
            <HistoryItem key={attempt._id}>
              <HistoryDate>
                Lần {attempts.length - index}: {new Date(attempt.createdAt).toLocaleString('vi-VN')}
              </HistoryDate>
              <HistoryScore score={attempt.overallScore}>
                {attempt.overallScore}%
              </HistoryScore>
            </HistoryItem>
          ))}
        </HistorySection>
      )}
    </PageContainer>
  );
};

export default SpeakingPractice;
