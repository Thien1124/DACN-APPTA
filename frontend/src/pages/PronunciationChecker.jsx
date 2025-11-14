import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Mic, Stop, VolumeUp, CheckCircle, Cancel, TrendingUp, History } from '@mui/icons-material';
import { speechService } from '../services/speechService';

// ========== STYLED COMPONENTS ==========

const CheckerContainer = styled.div`
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme === 'dark' ? '#ffffff' : '#1f2937'};
  margin-bottom: 1rem;
`;

const FlashcardDisplay = styled.div`
  text-align: center;
  padding: 2rem;
  background: ${props => props.theme === 'dark' ? '#374151' : '#f3f4f6'};
  border-radius: 12px;
  margin-bottom: 2rem;
`;

const Word = styled.h3`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme === 'dark' ? '#60a5fa' : '#2563eb'};
  margin-bottom: 0.5rem;
`;

const IPA = styled.p`
  font-size: 1.25rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-style: italic;
  margin-bottom: 1rem;
`;

const PlayButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background: #2563eb;
    transform: translateY(-2px);
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    transform: none;
  }
`;

const RecordingControls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin: 2rem 0;
`;

const RecordButton = styled.button`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: none;
  background: ${props => props.recording ? '#ef4444' : '#10b981'};
  color: white;
  font-size: 2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: scale(0.95);
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    transform: none;
  }
`;

const RecordingStatus = styled.div`
  font-size: 1rem;
  color: ${props => props.recording ? '#ef4444' : '#6b7280'};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RecordingDot = styled.span`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ef4444;
  animation: pulse 1.5s infinite;

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
`;

const LoadingContainer = styled.div`
  text-align: center;
  margin: 2rem 0;
`;

const Spinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
`;

const LoadingText = styled.div`
  color: #6b7280;
  font-weight: 600;
`;

const AnalysisResult = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: ${props => props.theme === 'dark' ? '#374151' : '#f9fafb'};
  border-radius: 12px;
  border-left: 4px solid ${props => props.passed ? '#10b981' : '#f59e0b'};
`;

const ResultHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;

  h3 {
    margin: 0;
    font-size: 1.25rem;
    color: ${props => props.theme === 'dark' ? '#ffffff' : '#1f2937'};
  }

  svg {
    font-size: 2rem;
  }
`;

const ScoreDisplay = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin: 1.5rem 0;
`;

const ScoreCard = styled.div`
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
`;

const ScoreLabel = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-bottom: 0.5rem;
`;

const ScoreValue = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${props => {
    if (props.score >= 90) return '#10b981';
    if (props.score >= 70) return '#f59e0b';
    return '#ef4444';
  }};
`;

const ConfidenceDisplay = styled.div`
  margin: 1rem 0;
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;

  strong {
    color: ${props => props.confidence >= 0.9 ? '#10b981' : '#f59e0b'};
    font-size: 1rem;
  }
`;

const TranscriptionBox = styled.div`
  margin: 1rem 0;
  padding: 1rem;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  border-radius: 8px;
`;

const TranscriptionLabel = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const TranscriptionText = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${props => props.correct ? '#10b981' : '#ef4444'};
`;

// ✅ NEW: Word-level analysis
const WordAnalysisContainer = styled.div`
  margin-top: 1.5rem;

  h4 {
    margin-bottom: 1rem;
    color: ${props => props.theme === 'dark' ? '#ffffff' : '#1f2937'};
  }
`;

const WordBadge = styled.div`
  display: inline-block;
  padding: 0.5rem 1rem;
  margin: 0.25rem;
  border-radius: 8px;
  font-weight: 600;
  text-align: center;
  background: ${props => {
    if (props.score >= 90) return 'rgba(16, 185, 129, 0.15)';
    if (props.score >= 70) return 'rgba(245, 158, 11, 0.15)';
    return 'rgba(239, 68, 68, 0.15)';
  }};
  border: 2px solid ${props => {
    if (props.score >= 90) return '#10b981';
    if (props.score >= 70) return '#f59e0b';
    return '#ef4444';
  }};
  color: ${props => props.theme === 'dark' ? '#ffffff' : '#1f2937'};

  div:first-child {
    font-size: 1rem;
  }

  div:nth-child(2) {
    font-size: 0.75rem;
    margin-top: 0.25rem;
    opacity: 0.8;
  }

  div:last-child {
    font-size: 0.7rem;
    margin-top: 0.25rem;
    color: #ef4444;
  }
`;

// ✅ NEW: IPA Comparison
const IPAComparison = styled.div`
  margin-top: 1rem;
  
  .ipa-phonemes {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
`;

const PhonemeBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 600;
  background: ${props => props.correct ? '#10b981' : '#ef4444'};
  color: white;
  cursor: ${props => props.error ? 'help' : 'default'};
  position: relative;

  &:hover::after {
    content: '${props => props.tooltip || ''}';
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: #1f2937;
    color: white;
    padding: 0.5rem;
    border-radius: 4px;
    white-space: nowrap;
    font-size: 0.75rem;
    margin-bottom: 0.25rem;
    display: ${props => props.tooltip ? 'block' : 'none'};
  }
`;

// ✅ NEW: Audio Comparison
const AudioComparison = styled.div`
  margin-top: 1.5rem;

  h4 {
    margin-bottom: 1rem;
    color: ${props => props.theme === 'dark' ? '#ffffff' : '#1f2937'};
  }

  .audio-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .audio-item audio {
    width: 100%;
    margin-top: 0.5rem;
  }
`;

// ✅ NEW: Improvement Hints
const HintsBox = styled.div`
  margin-top: 1.5rem;
  padding: 1rem;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 8px;
  border-left: 4px solid #3b82f6;

  h4 {
    margin-bottom: 0.5rem;
    color: ${props => props.theme === 'dark' ? '#60a5fa' : '#2563eb'};
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  ul {
    margin: 0;
    padding-left: 1.5rem;
    
    li {
      margin: 0.5rem 0;
      color: ${props => props.theme === 'dark' ? '#e5e7eb' : '#374151'};
    }
  }
`;

const FeedbackList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1rem 0 0 0;
`;

const FeedbackItem = styled.li`
  padding: 0.5rem;
  margin: 0.5rem 0;
  border-radius: 6px;
  background: ${props => {
    if (props.severity === 'error') return 'rgba(239, 68, 68, 0.1)';
    if (props.severity === 'warning') return 'rgba(245, 158, 11, 0.1)';
    return 'rgba(16, 185, 129, 0.1)';
  }};
  color: ${props => props.theme === 'dark' ? '#ffffff' : '#1f2937'};
  display: flex;
  align-items: start;
  gap: 0.5rem;

  &::before {
    content: '${props => {
      if (props.severity === 'error') return '❌';
      if (props.severity === 'warning') return '⚠️';
      return '✅';
    }}';
    font-size: 1.25rem;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  justify-content: center;
`;

const RetryButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: #2563eb;
  }
`;

const HistoryButton = styled.button`
  background: #6b7280;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: #4b5563;
  }
`;

// ✅ NEW: History Modal
const HistoryModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const HistoryContent = styled.div`
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  border-radius: 16px;
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;

  h3 {
    margin-top: 0;
    color: ${props => props.theme === 'dark' ? '#ffffff' : '#1f2937'};
  }
`;

const HistoryItem = styled.div`
  padding: 1rem;
  margin: 0.5rem 0;
  border-radius: 8px;
  background: ${props => props.theme === 'dark' ? '#374151' : '#f3f4f6'};
  border-left: 4px solid ${props => {
    if (props.score >= 90) return '#10b981';
    if (props.score >= 70) return '#f59e0b';
    return '#ef4444';
  }};

  .history-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }

  .history-score {
    color: ${props => {
      if (props.score >= 90) return '#10b981';
      if (props.score >= 70) return '#f59e0b';
      return '#ef4444';
    }};
  }

  .history-time {
    font-size: 0.75rem;
    color: #6b7280;
    margin-top: 0.25rem;
  }
`;

const CloseButton = styled.button`
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 1rem;

  &:hover {
    background: #dc2626;
  }
`;

// ========== COMPONENT ==========

const PronunciationChecker = ({ flashcard, theme = 'light', onComplete }) => {
  const [recording, setRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const audioRef = useRef(null);

  // ✅ Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('pronunciationHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Play reference audio
  const playReferenceAudio = () => {
    if (flashcard.audioUrl) {
      const audio = new Audio(flashcard.audioUrl);
      audio.play();
    } else {
      // Use Web Speech API as fallback
      const utterance = new SpeechSynthesisUtterance(flashcard.front);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      chunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setRecording(true);
      setError(null);
      setAnalysis(null);
    } catch (err) {
      console.error('Microphone access error:', err);
      setError('Không thể truy cập microphone. Vui lòng cho phép quyền truy cập.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  // ✅ Save attempt to history
  const saveAttemptToHistory = (attempt) => {
    const newHistory = [attempt, ...history].slice(0, 50); // Keep last 50
    setHistory(newHistory);
    localStorage.setItem('pronunciationHistory', JSON.stringify(newHistory));
  };

  // Analyze pronunciation
  const analyzePronunciation = async () => {
    if (!audioBlob) return;

    setAnalyzing(true);
    setError(null);

    try {
      const result = await speechService.analyzePronunciation(audioBlob, flashcard._id);
      
      if (result.success) {
        setAnalysis(result.analysis);
        
        // ✅ Save to history
        saveAttemptToHistory({
          flashcardId: flashcard._id,
          word: flashcard.front,
          score: result.analysis.pronunciationScore,
          timestamp: new Date().toISOString()
        });
        
        if (onComplete) {
          onComplete(result.analysis);
        }
      } else {
        setError('Không thể phân tích phát âm. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Đã xảy ra lỗi khi phân tích. Vui lòng thử lại.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Retry
  const handleRetry = () => {
    setAudioBlob(null);
    setAnalysis(null);
    setError(null);
  };

  // Format time ago
  const formatTimeAgo = (timestamp) => {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (seconds < 60) return `${seconds} giây trước`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    return `${Math.floor(hours / 24)} ngày trước`;
  };

  return (
    <CheckerContainer theme={theme}>
      <Title theme={theme}>Kiểm Tra Phát Âm</Title>

      {/* Flashcard Display */}
      <FlashcardDisplay theme={theme}>
        <Word theme={theme}>{flashcard.front}</Word>
        {flashcard.pronunciation && (
          <IPA theme={theme}>{flashcard.pronunciation}</IPA>
        )}
        <PlayButton onClick={playReferenceAudio}>
          <VolumeUp />
          Nghe phát âm chuẩn
        </PlayButton>
      </FlashcardDisplay>

      {/* Recording Controls */}
      {!analysis && !analyzing && (
        <RecordingControls>
          <RecordButton
            recording={recording}
            onClick={recording ? stopRecording : startRecording}
            disabled={analyzing}
          >
            {recording ? <Stop /> : <Mic />}
          </RecordButton>
          
          {recording && (
            <RecordingStatus recording={recording}>
              <RecordingDot />
              Đang ghi âm...
            </RecordingStatus>
          )}
          
          {!recording && !audioBlob && (
            <RecordingStatus>
              Nhấn để bắt đầu ghi âm
            </RecordingStatus>
          )}
          
          {audioBlob && !recording && (
            <>
              <audio ref={audioRef} controls src={URL.createObjectURL(audioBlob)} />
              <PlayButton onClick={analyzePronunciation} disabled={analyzing}>
                Phân tích phát âm
              </PlayButton>
            </>
          )}
        </RecordingControls>
      )}

      {/* ✅ Loading State */}
      {analyzing && (
        <LoadingContainer>
          <Spinner />
          <LoadingText>Đang phân tích phát âm của bạn...</LoadingText>
        </LoadingContainer>
      )}

      {/* Error Message */}
      {error && (
        <div style={{ color: '#ef4444', textAlign: 'center', margin: '1rem 0' }}>
          {error}
        </div>
      )}

      {/* Analysis Result */}
      {analysis && (
        <AnalysisResult theme={theme} passed={analysis.passed}>
          <ResultHeader theme={theme}>
            {analysis.passed ? (
              <CheckCircle style={{ color: '#10b981' }} />
            ) : (
              <Cancel style={{ color: '#f59e0b' }} />
            )}
            <h3>{analysis.passed ? 'Tuyệt vời!' : 'Cần cải thiện'}</h3>
          </ResultHeader>

          {/* Scores */}
          <ScoreDisplay>
            <ScoreCard theme={theme}>
              <ScoreLabel theme={theme}>Phát âm</ScoreLabel>
              <ScoreValue score={analysis.pronunciationScore}>
                {analysis.pronunciationScore}
              </ScoreValue>
            </ScoreCard>
            <ScoreCard theme={theme}>
              <ScoreLabel theme={theme}>Độ chính xác</ScoreLabel>
              <ScoreValue score={analysis.accuracyScore}>
                {analysis.accuracyScore}
              </ScoreValue>
            </ScoreCard>
            <ScoreCard theme={theme}>
              <ScoreLabel theme={theme}>Độ trôi chảy</ScoreLabel>
              <ScoreValue score={analysis.fluencyScore}>
                {analysis.fluencyScore}
              </ScoreValue>
            </ScoreCard>
            <ScoreCard theme={theme}>
              <ScoreLabel theme={theme}>Độ đầy đủ</ScoreLabel>
              <ScoreValue score={analysis.completenessScore}>
                {analysis.completenessScore}
              </ScoreValue>
            </ScoreCard>
          </ScoreDisplay>

          {/* ✅ Confidence Score */}
          {analysis.confidence && (
            <ConfidenceDisplay confidence={analysis.confidence}>
              Độ tự tin: <strong>{Math.round(analysis.confidence * 100)}%</strong>
            </ConfidenceDisplay>
          )}

          {/* Transcription */}
          <TranscriptionBox theme={theme}>
            <TranscriptionLabel theme={theme}>Bạn đã nói:</TranscriptionLabel>
            <TranscriptionText correct={analysis.match}>
              {analysis.transcription || '(Không nhận diện được)'}
            </TranscriptionText>
            {analysis.expectedText && (
              <>
                <TranscriptionLabel theme={theme} style={{ marginTop: '1rem' }}>
                  Từ cần phát âm:
                </TranscriptionLabel>
                <TranscriptionText correct={true}>
                  {analysis.expectedText}
                </TranscriptionText>
              </>
            )}
          </TranscriptionBox>

          {/* ✅ Word-Level Analysis */}
          {analysis.wordAnalysis && analysis.wordAnalysis.length > 0 && (
            <WordAnalysisContainer theme={theme}>
              <h4>Phân tích chi tiết từng từ:</h4>
              {analysis.wordAnalysis.map((word, index) => (
                <WordBadge key={index} score={word.score} theme={theme}>
                  <div>{word.word}</div>
                  <div>{word.score}%</div>
                  {word.issues && word.issues.length > 0 && (
                    <div>{word.issues.join(', ')}</div>
                  )}
                </WordBadge>
              ))}
            </WordAnalysisContainer>
          )}

          {/* ✅ IPA Comparison */}
          {analysis.ipaComparison && (
            <TranscriptionBox theme={theme} style={{ marginTop: '1rem' }}>
              <TranscriptionLabel theme={theme}>Phân tích IPA:</TranscriptionLabel>
              <IPAComparison>
                <div className="ipa-phonemes">
                  {analysis.ipaComparison.matched?.map((phoneme, idx) => (
                    <PhonemeBadge key={idx} correct={true}>
                      {phoneme}
                    </PhonemeBadge>
                  ))}
                  {analysis.ipaComparison.errors?.map((error, idx) => (
                    <PhonemeBadge 
                      key={idx} 
                      correct={false} 
                      error={true}
                      tooltip={`Expected: ${error.expected}`}
                    >
                      {error.phoneme} ❌
                    </PhonemeBadge>
                  ))}
                </div>
              </IPAComparison>
            </TranscriptionBox>
          )}

          {/* ✅ Intonation Analysis */}
          {analysis.intonation && (
            <TranscriptionBox theme={theme} style={{ marginTop: '1rem' }}>
              <TranscriptionLabel theme={theme}>Phân tích ngữ điệu:</TranscriptionLabel>
              <div style={{ marginTop: '0.5rem' }}>
                <div>Pattern: <strong>{analysis.intonation.pattern}</strong></div>
                <div style={{ marginTop: '0.25rem' }}>
                  Score: <strong style={{ 
                    color: analysis.intonation.score >= 70 ? '#10b981' : '#f59e0b' 
                  }}>
                    {analysis.intonation.score}%
                  </strong>
                </div>
                <div style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#6b7280' }}>
                  {analysis.intonation.feedback}
                </div>
              </div>
            </TranscriptionBox>
          )}

          {/* ✅ Audio Comparison */}
          {audioBlob && flashcard.audioUrl && (
            <AudioComparison theme={theme}>
              <h4>So sánh với phát âm chuẩn:</h4>
              <div className="audio-grid">
                <div className="audio-item">
                  <TranscriptionLabel theme={theme}>Phát âm chuẩn:</TranscriptionLabel>
                  <audio controls src={flashcard.audioUrl} />
                </div>
                <div className="audio-item">
                  <TranscriptionLabel theme={theme}>Phát âm của bạn:</TranscriptionLabel>
                  <audio controls src={URL.createObjectURL(audioBlob)} />
                </div>
              </div>
            </AudioComparison>
          )}

          {/* Detailed Feedback */}
          {analysis.detailedFeedback && analysis.detailedFeedback.length > 0 && (
            <div>
              <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                Phản hồi chi tiết:
              </h4>
              <FeedbackList>
                {analysis.detailedFeedback.map((feedback, index) => (
                  <FeedbackItem
                    key={index}
                    severity={feedback.severity}
                    theme={theme}
                  >
                    <div>
                      <strong>{feedback.category}:</strong> {feedback.message}
                    </div>
                  </FeedbackItem>
                ))}
              </FeedbackList>
            </div>
          )}

          {/* ✅ Improvement Hints */}
          {analysis.pronunciationScore < 90 && (
            <HintsBox theme={theme}>
              <h4>
                <TrendingUp />
                Gợi ý cải thiện:
              </h4>
              <ul>
                {analysis.pronunciationScore < 70 && (
                  <li>Nghe và lặp lại nhiều lần để làm quen với âm thanh</li>
                )}
                {analysis.fluencyScore < 70 && (
                  <li>Nói chậm hơn và rõ ràng hơn từng từ</li>
                )}
                {analysis.accuracyScore < 70 && analysis.wordAnalysis && (
                  <li>
                    Tập trung vào các âm khó: {
                      analysis.wordAnalysis
                        .filter(w => w.score < 70)
                        .map(w => w.word)
                        .join(', ')
                    }
                  </li>
                )}
                <li>Thực hành thường xuyên để cải thiện phát âm</li>
                <li>Chú ý đến ngữ điệu và nhấn giọng tự nhiên</li>
              </ul>
            </HintsBox>
          )}

          {/* Action Buttons */}
          <ActionButtons>
            <RetryButton onClick={handleRetry}>
              Thử lại
            </RetryButton>
            <HistoryButton onClick={() => setShowHistory(true)}>
              <History />
              Lịch sử ({history.filter(h => h.flashcardId === flashcard._id).length})
            </HistoryButton>
          </ActionButtons>
        </AnalysisResult>
      )}

      {/* ✅ History Modal */}
      {showHistory && (
        <HistoryModal onClick={() => setShowHistory(false)}>
          <HistoryContent theme={theme} onClick={(e) => e.stopPropagation()}>
            <h3>Lịch sử phát âm - {flashcard.front}</h3>
            {history
              .filter(h => h.flashcardId === flashcard._id)
              .slice(0, 10)
              .map((item, index) => (
                <HistoryItem key={index} score={item.score} theme={theme}>
                  <div className="history-header">
                    <span>{item.word}</span>
                    <span className="history-score">{item.score}%</span>
                  </div>
                  <div className="history-time">{formatTimeAgo(item.timestamp)}</div>
                </HistoryItem>
              ))
            }
            {history.filter(h => h.flashcardId === flashcard._id).length === 0 && (
              <p style={{ textAlign: 'center', color: '#6b7280' }}>
                Chưa có lịch sử phát âm cho từ này
              </p>
            )}
            <CloseButton onClick={() => setShowHistory(false)}>
              Đóng
            </CloseButton>
          </HistoryContent>
        </HistoryModal>
      )}
    </CheckerContainer>
  );
};

export default PronunciationChecker;