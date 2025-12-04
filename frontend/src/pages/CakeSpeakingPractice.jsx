import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import api from '../utils/api';
import {
  Mic,
  Stop,
  CheckCircle,
  Refresh,
  ArrowForward,
  EmojiEvents,
  Description,
  List,
  Star,
  ArrowBack
} from '@mui/icons-material';

// ========== ANIMATIONS ==========

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const recordPulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
  50% { box-shadow: 0 0 0 20px rgba(239, 68, 68, 0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// ========== STYLED COMPONENTS ==========

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  animation: ${fadeIn} 0.6s ease;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover { color: #374151; }
  
  svg {
    font-size: 1.2rem;
  }
`;

const ProgressBar = styled.div`
  flex: 1;
  margin: 0 2rem;
  height: 8px;
  background: #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #58CC02 0%, #45a302 100%);
  width: ${props => props.$progress}%;
  transition: width 0.5s ease;
`;

const ProgressText = styled.div`
  font-size: 0.9375rem;
  font-weight: 700;
  color: #58CC02;
  white-space: nowrap;
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

const VideoPlayer = styled.div`
  width: 100%;
  height: 400px;
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

const PracticeSection = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
`;

const SentenceCard = styled.div`
  background: ${props => props.$active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f9fafb'};
  padding: 2rem;
  border-radius: 16px;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
  animation: ${props => props.active ? fadeIn : 'none'} 0.5s ease;
`;

const SentenceNumber = styled.div`
  font-size: 0.875rem;
  font-weight: 700;
  color: ${props => props.$active ? 'rgba(255, 255, 255, 0.8)' : '#6b7280'};
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const EnglishText = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.$active ? '#ffffff' : '#1a1a1a'};
  margin-bottom: 1rem;
  line-height: 1.6;
`;

const VietnameseText = styled.div`
  font-size: 1.125rem;
  color: ${props => props.$active ? 'rgba(255, 255, 255, 0.9)' : '#6b7280'};
  line-height: 1.6;
  font-style: italic;
`;

const ControlsSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  margin-top: 2rem;
`;

const RecordButton = styled.button`
  width: 140px;
  height: 140px;
  border-radius: 50%;
  border: none;
  background: ${props => props.$isRecording 
    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
    : 'linear-gradient(135deg, #58CC02 0%, #45a302 100%)'
  };
  color: white;
  font-size: 3.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  animation: ${props => props.$isRecording ? recordPulse : 'none'} 1.5s infinite;
  
  &:hover:not(:disabled) {
    transform: scale(1.05);
  }
  
  &:active:not(:disabled) {
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
  color: #ef4444;
  font-family: 'Courier New', monospace;
`;

const RecordingStatus = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 1rem;
  
  .spinning {
    ${css`
      animation: ${spin} 1s linear infinite;
    `}
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => props.$variant === 'primary' && `
    background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(88, 204, 2, 0.3);
    &:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(88, 204, 2, 0.4); }
  `}
  
  ${props => props.$variant === 'secondary' && `
    background: #f3f4f6;
    color: #6b7280;
    &:hover { background: #e5e7eb; }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ResultCard = styled.div`
  background: ${props => props.$lowScore 
    ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'  // Red gradient for low score
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'  // Blue-purple gradient for pass
  };
  padding: 2rem;
  border-radius: 16px;
  margin-top: 2rem;
  text-align: center;
  animation: ${fadeIn} 0.5s ease, ${pulse} 0.5s ease;
`;

const ScoreNumber = styled.div`
  font-size: 5rem;
  font-weight: 800;
  color: white;
  margin-bottom: 0.5rem;
`;

const ScoreFeedback = styled.div`
  font-size: 1.5rem;
  color: white;
  font-weight: 700;
  margin-bottom: 1rem;
`;

const ScoreBreakdown = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 2rem;
`;

const ScoreItem = styled.div`
  background: rgba(255, 255, 255, 0.2);
  padding: 1rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);
`;

const ScoreValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: white;
`;

const ScoreLabel = styled.div`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 0.25rem;
`;

const TranscriptionCompare = styled.div`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 1.5rem;
  border-radius: 12px;
  margin-top: 1.5rem;
  text-align: left;
`;

const CompareTitle = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.75rem;
`;

const CompareText = styled.div`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.6;
`;

const WordHighlight = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  margin: 0 0.125rem;
  background: ${props => {
    if (props.$status === 'correct') return 'rgba(34, 197, 94, 0.3)';
    if (props.$status === 'partial') return 'rgba(251, 146, 60, 0.3)';
    if (props.$status === 'incorrect') return 'rgba(239, 68, 68, 0.3)';
    return 'transparent';
  }};
  border: 2px solid ${props => {
    if (props.$status === 'correct') return 'rgba(34, 197, 94, 0.5)';
    if (props.$status === 'partial') return 'rgba(251, 146, 60, 0.5)';
    if (props.$status === 'incorrect') return 'rgba(239, 68, 68, 0.5)';
    return 'transparent';
  }};
`;

const SentenceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
`;

const SentenceListItem = styled.div`
  background: ${props => props.$completed ? '#dcfce7' : '#f3f4f6'};
  padding: 1.25rem;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid ${props => props.$active ? '#58CC02' : 'transparent'};
  
  &:hover {
    transform: translateX(8px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const SentenceInfo = styled.div`
  flex: 1;
`;

const SentenceEnglish = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
`;

const SentenceVietnamese = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const SentenceScore = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Stars = styled.div`
  font-size: 1.25rem;
  color: #fbbf24;
`;

const ScoreText = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: ${props => props.$score >= 90 ? '#16a34a' : props.$score >= 75 ? '#ea580c' : '#6b7280'};
`;

// ========== COMPONENT ==========

const CakeSpeakingPractice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  
  const [video, setVideo] = useState(null);
  const [progress, setProgress] = useState(null);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recognizedText, setRecognizedText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedSentences, setCompletedSentences] = useState(new Set());
  const [playerReady, setPlayerReady] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const [autoPausedIndex, setAutoPausedIndex] = useState(null);
  const autoAdvanceTimeoutRef = useRef(null);
  
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const playerRef = useRef(null);
  const timeTrackerRef = useRef(null);
  // Track which sentences we've already auto-paused/shown (reactive)
  const [shownIndices, setShownIndices] = useState([]);
  const [endedIndices, setEndedIndices] = useState([]);

  useEffect(() => {
    fetchVideoAndProgress();
    
    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    
    window.onYouTubeIframeAPIReady = () => {
       ('✅ YouTube IFrame API ready');
      setPlayerReady(true);
    };
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (timeTrackerRef.current) clearInterval(timeTrackerRef.current);
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, [id]);

  const fetchVideoAndProgress = async () => {
    try {
      setLoading(true);
      
      // Fetch video details
      const videoResponse = await api.get(`/speaking/videos/${id}`);
      if (videoResponse.data.success) {
        const loadedVideo = videoResponse.data.data.video;
        setVideo(loadedVideo);
        
        // Log video sentence timing info to help debug
        if (loadedVideo && loadedVideo.sentences) {
          console.log('📹 Video loaded:', loadedVideo.title);
          console.log('📝 Total sentences:', loadedVideo.sentences.length);
          console.table(
            loadedVideo.sentences.map((s, idx) => ({
              'Index': idx,
              'English': s.english?.substring(0, 30) + '...',
              'Start (s)': s.startTime,
              'End (s)': s.endTime || 'N/A',
              'Duration': s.endTime ? (s.endTime - s.startTime).toFixed(2) + 's' : 'N/A'
            }))
          );
        }
      }
      
      // Fetch progress
      const progressResponse = await api.get(`/speaking/cake/progress/${id}`);
      if (progressResponse.data.success) {
        setProgress(progressResponse.data.data);
        // Do not set currentSentenceIndex here. We'll reveal sentences when
        // the video reaches their startTime (auto-pause) or when they are completed.
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('error', 'Lỗi', 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      showToast('error', 'Lỗi', 'Trình duyệt không hỗ trợ Speech Recognition. Vui lòng dùng Chrome.');
      return;
    }
    
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      
      recognitionRef.current = recognition;
      
        recognition.onstart = () => {
        setIsRecording(true);
        setRecordingTime(0);
        setRecognizedText('');
        
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
        
        console.log('🎤 Speech recognition started');
      };      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        
        console.log('📝 Transcript:', transcript);
        console.log('📊 Confidence:', confidence);
        
        setRecognizedText(transcript);
        
        // Tự động phân tích ngay
        analyzePronunciation(transcript, confidence);
      };
      
      recognition.onerror = (event) => {
        console.error('❌ Speech recognition error:', event.error);
        
        if (event.error === 'not-allowed') {
          showToast('error', 'Lỗi', 'Bạn chưa cho phép truy cập microphone');
        } else if (event.error === 'no-speech') {
          showToast('warning', 'Thông báo', 'Không nghe thấy giọng nói. Vui lòng thử lại.');
        } else {
          showToast('error', 'Lỗi', 'Không thể nhận dạng giọng nói');
        }
        
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };
      
      recognition.onend = () => {
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
        console.log('✅ Speech recognition ended');
      };
      
      recognition.start();
      
    } catch (error) {
      console.error('Error starting recording:', error);
      showToast('error', 'Lỗi', 'Không thể bắt đầu nhận dạng giọng nói');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const analyzePronunciation = async (transcript, confidence) => {
    if (!transcript) {
      showToast('error', 'Lỗi', 'Không nhận dạng được giọng nói');
      return;
    }
    
    try {
      setAnalyzing(true);
      
      const targetText = currentSentence.english.toLowerCase().trim();
      const transcribedText = transcript.toLowerCase().trim();
      
      // Tính điểm similarity
      const similarity = calculateSimilarity(transcribedText, targetText);
      const accuracyScore = Math.round(similarity * 100);
      
      // Tính điểm pronunciation (dựa trên confidence)
      const pronunciationScore = Math.min(100, Math.round(confidence * 100) + Math.floor(Math.random() * 10));
      
      // Tính điểm fluency
      const fluencyScore = Math.max(50, Math.min(100, accuracyScore + Math.floor(Math.random() * 15)));
      
      // Overall score
      const overallScore = Math.round(
        (accuracyScore * 0.5) +
        (pronunciationScore * 0.3) +
        (fluencyScore * 0.2)
      );
      
      // Word comparison
      const comparison = compareWords(targetText, transcribedText);
      
      // Feedback
      const feedback = generateFeedback(overallScore);
      
      // Lưu kết quả vào database
      await saveAttemptToDatabase({
        videoId: id,
        sentenceIndex: currentSentenceIndex,
        originalSentence: currentSentence.english,
        transcription: transcript,
        accuracyScore,
        pronunciationScore,
        fluencyScore,
        overallScore,
        comparison,
        feedback
      });
      
      // Hiển thị kết quả
      setResult({
        overallScore,
        accuracyScore,
        pronunciationScore,
        fluencyScore,
        feedback,
        comparison
      });
      
      setAnalyzing(false);
      
      // Show appropriate toast based on score
      if (overallScore >= 50) {
        showToast('success', 'Hoàn thành', `Điểm: ${overallScore}% - Chúc mừng!`);
        // Mark câu này là đã hoàn thành trong session hiện tại
        setCompletedSentences(prev => new Set([...prev, currentSentenceIndex]));
      } else {
        showToast('warning', 'Cần cải thiện', `Điểm: ${overallScore}% - Hãy thử lại!`);
      }
      
      // Update progress locally so we don't need to reload the page
      try {
        if (progress) {
          const newProgress = JSON.parse(JSON.stringify(progress));
          // Ensure sentenceProgress array exists
          if (!Array.isArray(newProgress.sentenceProgress)) newProgress.sentenceProgress = [];

          const prevEntry = newProgress.sentenceProgress[currentSentenceIndex] || {};
          const completedFlag = overallScore >= 50;
          // Compute simple stars based on score
          const stars = overallScore >= 90 ? 3 : overallScore >= 75 ? 2 : overallScore >= 50 ? 1 : 0;

          newProgress.sentenceProgress[currentSentenceIndex] = {
            ...prevEntry,
            completed: completedFlag,
            bestScore: Math.max(prevEntry?.bestScore || 0, overallScore),
            stars
          };

          // Update stats counts if we just completed this sentence
          if (completedFlag) {
            const wasCompletedBefore = prevEntry?.completed;
            if (!wasCompletedBefore) {
              newProgress.stats = newProgress.stats || { completedSentences: 0, totalSentences: newProgress.sentenceProgress.length };
              newProgress.stats.completedSentences = (newProgress.stats.completedSentences || 0) + 1;
            }
          }

          setProgress(newProgress);
        }
      } catch (err) {
        console.warn('Error updating local progress:', err);
      }

      // If passed, auto-advance: show results for 5s then continue to next sentence
      if (overallScore >= 50) {
        if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);
        autoAdvanceTimeoutRef.current = setTimeout(() => {
          // Clear result (hide score card)
          setResult(null);

          // Advance to next sentence and seek there
          setCurrentSentenceIndex(prev => {
            const cur = (typeof prev === 'number') ? prev : currentSentenceIndex;
            const next = (cur == null ? 0 : cur) + 1;
            if (video && video.sentences && next < video.sentences.length) {
              // Seek + play at next sentence
              resumeVideo({ sentenceIndex: next });
              return next;
            }
            // If no next, navigate back to speaking list
            navigate('/speaking');
            return prev;
          });

          autoAdvanceTimeoutRef.current = null;
        }, 3000);
      }
      
    } catch (error) {
      console.error('Error analyzing:', error);
      showToast('error', 'Lỗi', 'Không thể phân tích');
      setAnalyzing(false);
    }
  };

  const saveAttemptToDatabase = async (attemptData) => {
    try {
      const response = await api.post('/speaking/cake/save-local-attempt', attemptData);
      return response.data;
    } catch (error) {
      // Improved error logging to show server response body/status for debugging
      if (error.response) {
        console.error('Error saving attempt - response:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('Error saving attempt - no response received:', error.request);
      } else {
        console.error('Error saving attempt:', error.message);
      }
      // Không block UI nếu lưu DB thất bại
    }
  };
  
  const calculateSimilarity = (str1, str2) => {
    const distance = levenshteinDistance(str1, str2);
    const maxLen = Math.max(str1.length, str2.length);
    return maxLen === 0 ? 1 : 1 - distance / maxLen;
  };
  
  const levenshteinDistance = (str1, str2) => {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  };
  
  const compareWords = (original, transcribed) => {
    const originalWords = original.split(/\s+/).filter(w => w.length > 0);
    const transcribedWords = transcribed.split(/\s+/).filter(w => w.length > 0);
    
    const wordScores = originalWords.map((word, index) => {
      const transcribedWord = transcribedWords[index];
      
      if (!transcribedWord) {
        return { word, status: 'incorrect' };
      }
      
      const similarity = calculateSimilarity(word, transcribedWord);
      const score = Math.round(similarity * 100);
      
      return {
        word,
        status: score >= 80 ? 'correct' : score >= 50 ? 'partial' : 'incorrect'
      };
    });
    
    const correctWords = wordScores.filter(w => w.status === 'correct').length;
    const totalWords = originalWords.length;
    const similarityPercentage = Math.round((correctWords / totalWords) * 100);
    
    return {
      wordScores,
      correctWords,
      totalWords,
      similarityPercentage
    };
  };
  
  const generateFeedback = (score) => {
    if (score >= 95) return '🎉 Perfect! Phát âm xuất sắc!';
    if (score >= 85) return '👏 Excellent! Rất tốt!';
    if (score >= 70) return '👍 Good! Khá tốt, hãy tiếp tục!';
    if (score >= 50) return '💪 Keep trying! Cố gắng thêm nhé!';
    return '❌ Cần cải thiện! Hãy nghe kỹ và thử lại!';
  };

  const handleNextSentence = () => {
    if (currentSentenceIndex < video.sentences.length - 1) {
      setCurrentSentenceIndex(currentSentenceIndex + 1);
      setRecognizedText('');
      setResult(null);
      setRecordingTime(0);
      // If the player was auto-paused, resume playback so it can reach next sentences
      if (playerRef.current) {
        resumeVideo();
      }
    } else {
      showToast('success', '🎉 Hoàn thành', 'Bạn đã hoàn thành tất cả câu!');
      navigate('/speaking');
    }
  };

  const handleTryAgain = () => {
    setRecognizedText('');
    setResult(null);
    setRecordingTime(0);
  };

  const handleSentenceSelect = (index) => {
    setCurrentSentenceIndex(index);
    setRecognizedText('');
    setResult(null);
    setRecordingTime(0);
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
  }

  // Initialize YouTube player when component mounts
  useEffect(() => {
    if (window.YT && video?.videoUrl) {
      initializePlayer();
    }
  }, [video]);

  // Also initialize player when the IFrame API signals ready (playerReady)
  useEffect(() => {
    if (playerReady && video?.videoUrl && !playerRef.current) {
      console.log('➡️ Initializing YouTube player after API ready and video available');
      initializePlayer();
    }
  }, [playerReady, video]);
  const initializePlayer = () => {
    if (!video?.videoUrl) return;

    const videoId = video.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1];
    if (!videoId) return;

    playerRef.current = new window.YT.Player('youtube-player', {
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        controls: 1,
        rel: 0,
        showinfo: 0,
        modestbranding: 1
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange
      }
    });
  };


const onPlayerReady = (event) => {
  // Start time tracking when player is ready
  timeTrackerRef.current = setInterval(() => {
    if (playerRef.current && playerRef.current.getCurrentTime) {
      const t = playerRef.current.getCurrentTime();
      setCurrentVideoTime(t);
      // Check for auto-pause opportunities
      checkAndAutoPause(t);
    }
  }, 25); // Giảm từ 100ms xuống 50ms để check thường xuyên hơn
};



  const onPlayerStateChange = (event) => {
    // Handle play/pause events if needed
    if (event.data === window.YT.PlayerState.PLAYING) {
      setVideoPlaying(true);
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      setVideoPlaying(false);
    } else if (event.data === window.YT.PlayerState.ENDED) {
      setVideoPlaying(false);
    }
  };
const checkAndAutoPause = (currentTime) => {
  if (!video || !video.sentences) return;

  // Only run checks while the player is playing
  try {
    const state = playerRef.current && playerRef.current.getPlayerState ? playerRef.current.getPlayerState() : null;
    if (state !== window.YT.PlayerState.PLAYING) {
      console.debug('⏸️ Player not playing, skipping check');
      return;
    }
  } catch (err) {
    console.warn('Error checking player state:', err);
    return;
  }

  const showTolerance = 0.25; // seconds tolerance for marking sentence shown

  // Find the sentence that the current time falls into (start <= t < end)
  let activeIndex = -1;
  let activeStart = null;
  let activeEnd = null;

  for (let i = 0; i < video.sentences.length; i++) {
    const s = video.sentences[i];
    if (!s || typeof s.startTime !== 'number') continue;

    let endTime = null;
    if (typeof s.endTime === 'number') {
      endTime = s.endTime;
    } else if (video.sentences[i + 1] && typeof video.sentences[i + 1].startTime === 'number') {
      endTime = video.sentences[i + 1].startTime;
    } else {
      endTime = s.startTime + 2; // fallback
    }

    if (currentTime >= s.startTime && currentTime < endTime) {
      activeIndex = i;
      activeStart = s.startTime;
      activeEnd = endTime;
      break;
    }
  }

  // Debug logging - log every check when close to end
  const timeToEnd = activeEnd - currentTime;
  if (activeIndex !== -1 && timeToEnd <= 0.5 && timeToEnd >= -0.1) {
    console.log(`🎯 Close to end: currentTime=${currentTime.toFixed(3)}, activeEnd=${activeEnd.toFixed(3)}, timeToEnd=${timeToEnd.toFixed(3)}, activeIndex=${activeIndex}, endedIndices=${endedIndices}`);
  }

  if (activeIndex === -1) {
    console.debug('❌ No active sentence found');
    return;
  }

  // Mark shown when we pass start + showTolerance
  if (!shownIndices.includes(activeIndex) && currentTime >= (activeStart + showTolerance)) {
    console.log(`👁️ Showing sentence ${activeIndex} at ${currentTime.toFixed(3)}`);
    setShownIndices(prev => prev.includes(activeIndex) ? prev : [...prev, activeIndex]);
    setCurrentSentenceIndex(activeIndex);
  }

  // Pause when we reach the exact end of the active sentence (with small tolerance for YouTube delay)
  const pauseTolerance = 0.05; // Thêm tolerance 0.05s để dừng sớm hơn, tránh bỏ lỡ điểm dừng
  const shouldPause = !endedIndices.includes(activeIndex) && currentTime >= (activeEnd - pauseTolerance) && currentTime >= (activeStart + 0.03);

  if (shouldPause) {
    console.log(`⏹️ PAUSING at sentence ${activeIndex}: currentTime=${currentTime.toFixed(3)} >= activeEnd=${activeEnd.toFixed(3)} (with ${pauseTolerance}s tolerance)`);
    setEndedIndices(prev => prev.includes(activeIndex) ? prev : [...prev, activeIndex]);
    try {
      if (playerRef.current && playerRef.current.pauseVideo) {
        playerRef.current.pauseVideo();
        console.log('✅ Player paused successfully');
      } else {
        console.warn('❌ Player pause method not available');
      }
    } catch (err) {
      console.warn('Error pausing player at sentence end:', err);
    }

    setCurrentSentenceIndex(activeIndex);
    setAutoPausedIndex(activeIndex);
    setVideoPlaying(false);
    return;
  } else if (!endedIndices.includes(activeIndex) && currentTime >= activeEnd - 0.2) {
    console.log(`⚠️ Should pause soon: currentTime=${currentTime.toFixed(3)}, activeEnd=${activeEnd.toFixed(3)}, endedIndices=${endedIndices}`);
  }
};

  const resumeVideo = (opts = {}) => {
    // Resume playing from the sentence's start (if provided) or current position.
    if (!playerRef.current) return;
    try {
      // If there's a pending auto-advance (we're showing a pass result), cancel it
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
        autoAdvanceTimeoutRef.current = null;
      }
      if (typeof opts.sentenceIndex === 'number') {
        const si = opts.sentenceIndex;
        const s = video?.sentences?.[si];
        if (s && typeof s.startTime === 'number') {
          // Seek slightly into the sentence to avoid landing too close to the end
          playerRef.current.seekTo(s.startTime + 0.12, true);
        }
      } else if (typeof opts.seekTo === 'number') {
        playerRef.current.seekTo(opts.seekTo, true);
      }
      playerRef.current.playVideo();
      setAutoPausedIndex(null);
      setVideoPlaying(true);
    } catch (err) {
      console.warn('Error resuming player:', err);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
  return () => {
    if (timeTrackerRef.current) {
      clearInterval(timeTrackerRef.current);
    }
    if (playerRef.current) {
      playerRef.current.destroy();
    }
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
  };
}, []);

  const isSentenceCompleted = (index) => {
    // Check if completed in current session or in database
    return completedSentences.has(index) || (progress?.sentenceProgress[index]?.completed);
  };

  const getSentenceScore = (index) => {
    // Return score from current session if available, otherwise from database
    if (completedSentences.has(index)) {
      // For sentences completed in this session, we don't have stored score yet
      // Could be enhanced to store scores locally too
      return null;
    }
    return progress?.sentenceProgress[index];
  };

  if (loading) {
    return <PageContainer><h2>Đang tải...</h2></PageContainer>;
  }

  if (!video) {
    return <PageContainer><h2>Không tìm thấy video</h2></PageContainer>;
  }

  const currentSentence = (currentSentenceIndex !== null && video && video.sentences)
    ? video.sentences[currentSentenceIndex]
    : null;
  const overallProgress = progress 
    ? Math.round((progress.stats.completedSentences / progress.stats.totalSentences) * 100)
    : 0;

  return (
    <PageContainer>
      <Toast toast={toast} onClose={hideToast} />
      
      <Header>
        <BackButton onClick={() => navigate('/speaking')}>
          <ArrowBack />
          Quay lại
        </BackButton>
        <ProgressBar>
          <ProgressFill $progress={overallProgress} />
        </ProgressBar>
        <ProgressText>{overallProgress}% hoàn thành</ProgressText>
      </Header>

      <VideoSection>
        <VideoTitle>{video.title}</VideoTitle>
        <VideoPlayer>
          <div id="youtube-player" style={{ width: '100%', height: '100%' }}></div>
        </VideoPlayer>
      </VideoSection>

      <PracticeSection>
        {currentSentence ? (
          <>
            <SentenceCard $active={!result}>
              <SentenceNumber>
                Câu {currentSentenceIndex + 1} / {video.sentences.length}
              </SentenceNumber>
              <EnglishText $active={!result}>{currentSentence.english}</EnglishText>
              <VietnameseText $active={!result}>{currentSentence.vietnamese}</VietnameseText>
            </SentenceCard>

            {!result ? (
              <ControlsSection>
                <RecordButton
                  $isRecording={isRecording}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={analyzing || !currentSentence}
                >
                  {isRecording ? <Stop /> : <Mic />}
                </RecordButton>
          
                {/* Show resume control when video was auto-paused for a sentence */}
                {autoPausedIndex !== null && !isRecording && !analyzing && (
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <Button $variant="primary" onClick={() => resumeVideo()}>
                      Tiếp tục video
                    </Button>
                    <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Video đang tạm dừng cho câu {autoPausedIndex + 1}</div>
                  </div>
                )}
              </ControlsSection>
            ) : (
              <ResultCard $lowScore={result.overallScore < 50}>
                <ScoreNumber>{result.overallScore}%</ScoreNumber>
                <ScoreFeedback>{result.feedback}</ScoreFeedback>
                
                {result.overallScore < 50 && (
                  <div style={{ 
                    background: 'rgba(255, 255, 255, 0.2)', 
                    padding: '1rem', 
                    borderRadius: '12px', 
                    marginBottom: '1rem',
                    border: '2px solid rgba(255, 255, 255, 0.3)'
                  }}>
                    <div style={{ color: 'white', fontWeight: '700', fontSize: '1.1rem' }}>
                      Điểm chưa đạt yêu cầu (cần ≥ 50%)
                    </div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                      Hãy thử lại để cải thiện điểm số!
                    </div>
                  </div>
                )}

                <ScoreBreakdown>
                  <ScoreItem>
                    <ScoreValue>{result.accuracyScore}%</ScoreValue>
                    <ScoreLabel>Độ chính xác</ScoreLabel>
                  </ScoreItem>
                  <ScoreItem>
                    <ScoreValue>{result.pronunciationScore}%</ScoreValue>
                    <ScoreLabel>Phát âm</ScoreLabel>
                  </ScoreItem>
                  <ScoreItem>
                    <ScoreValue>{result.fluencyScore}%</ScoreValue>
                    <ScoreLabel>Lưu loát</ScoreLabel>
                  </ScoreItem>
                </ScoreBreakdown>

                {result.comparison?.wordScores && (
                  <TranscriptionCompare>
                    <CompareTitle>
                      <Description style={{ marginRight: '0.5rem' }} />
                      Đánh giá từng từ:
                    </CompareTitle>
                    <CompareText>
                      {result.comparison.wordScores.map((wordScore, idx) => (
                        <WordHighlight key={idx} $status={wordScore.status}>
                          {wordScore.word}
                        </WordHighlight>
                      ))}
                    </CompareText>
                    <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.9)' }}>
                      <CheckCircle style={{ marginRight: '0.5rem', fontSize: '1rem' }} />
                      Đúng: {result.comparison.correctWords}/{result.comparison.totalWords} từ
                      ({result.comparison.similarityPercentage}% tương đồng)
                    </div>
                  </TranscriptionCompare>
                )}

                <ButtonGroup style={{ justifyContent: 'center', marginTop: '2rem' }}>
                  {result.overallScore < 50 && (
                    <Button $variant="secondary" onClick={handleTryAgain}>
                      <Refresh style={{ marginRight: '0.5rem' }} />
                      Thử lại câu này
                    </Button>
                  )}
                  {/* When passed, we auto-advance after 5s so we don't show next/continue buttons here */}
                </ButtonGroup>
              </ResultCard>
            )}
          </>
        ) : (
          // No current sentence yet - show placeholder/help text
          <div style={{ padding: '2rem 1rem', color: '#6b7280', textAlign: 'center' }}>
          </div>
        )}

        {progress && (
          <SentenceList>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1a1a1a', marginBottom: '1rem' }}>
              <List style={{ marginRight: '0.5rem' }} />
              Danh sách câu
            </h3>
            {progress.sentenceProgress
              .map((sentence, index) => ({ sentence, index }))
              .filter(({ index }) => {
                // Show sentence if it's completed (DB or session) OR if it's been shown/auto-paused or it's the current active sentence
                const wasShown = shownIndices.includes(index);
                const isActive = index === currentSentenceIndex;
                return isSentenceCompleted(index) || wasShown || isActive;
              })
              .map(({ sentence, index }) => {
                const completed = isSentenceCompleted(index);
                const sentenceScore = getSentenceScore(index);
                
                return (
                  <SentenceListItem 
                    key={index}
                    $completed={completed}
                    $active={index === currentSentenceIndex}
                    onClick={() => handleSentenceSelect(index)}
                  >
                    <SentenceInfo>
                      <SentenceEnglish>{sentence.english}</SentenceEnglish>
                      <SentenceVietnamese>{sentence.vietnamese}</SentenceVietnamese>
                    </SentenceInfo>
                    {completed && (
                      <SentenceScore>
                        {sentenceScore ? (
                          <>
                            <Stars>{Array.from({ length: sentenceScore.stars }, (_, i) => <Star key={i} />)}</Stars>
                            <ScoreText $score={sentenceScore.bestScore}>{sentenceScore.bestScore}%</ScoreText>
                          </>
                        ) : (
                          // Show green checkmark for sentences completed in current session
                          <CheckCircle style={{ color: '#16a34a', fontSize: '1.5rem' }} />
                        )}
                      </SentenceScore>
                    )}
                  </SentenceListItem>
                );
              })}
          </SentenceList>
        )}
      </PracticeSection>
    </PageContainer>
  );
};

export default CakeSpeakingPractice;
