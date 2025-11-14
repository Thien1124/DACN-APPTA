import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Mic, Stop, VolumeUp, CheckCircle, Cancel, Close, Replay } from '@mui/icons-material';

// ========== STYLED COMPONENTS ==========

const ModalOverlay = styled.div`
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

const ModalContent = styled.div`
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  border-radius: 16px;
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme === 'dark' ? '#374151' : '#f3f4f6'};
  }
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme === 'dark' ? '#ffffff' : '#1f2937'};
  margin-bottom: 1.5rem;
  padding-right: 2rem;
`;

const ExerciseInfo = styled.div`
  background: ${props => props.theme === 'dark' ? '#374151' : '#f3f4f6'};
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const Question = styled.div`
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-bottom: 1rem;
`;

const TargetText = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme === 'dark' ? '#60a5fa' : '#2563eb'};
  margin-bottom: 1rem;
  text-align: center;
`;

const PlayButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin: 0 auto;

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

const RecordingSection = styled.div`
  text-align: center;
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
  margin: 0 auto;
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
  margin-top: 1rem;
  font-size: 1rem;
  color: ${props => props.recording ? '#ef4444' : '#6b7280'};
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
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

const LoadingSpinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 2rem auto;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  text-align: center;
  color: #6b7280;
  font-weight: 600;
  margin-top: 1rem;
`;

const ResultSection = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: ${props => props.theme === 'dark' ? '#374151' : '#f9fafb'};
  border-radius: 12px;
  border-left: 4px solid ${props => props.passed ? '#10b981' : '#ef4444'};
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
  text-align: center;
  margin: 1.5rem 0;
`;

const ScoreValue = styled.div`
  font-size: 3rem;
  font-weight: 700;
  color: ${props => props.score >= 50 ? '#10b981' : '#ef4444'};
`;

const ScoreLabel = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-top: 0.5rem;
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

const FeedbackText = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 8px;
  color: ${props => props.theme === 'dark' ? '#e5e7eb' : '#374151'};
  font-size: 0.9375rem;
  line-height: 1.6;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  background: ${props => props.variant === 'primary' ? '#58CC02' : '#6b7280'};
  color: white;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 2px solid #ef4444;
  border-radius: 8px;
  color: #ef4444;
  text-align: center;
  margin: 1rem 0;
`;

// ========== COMPONENT ==========

const SpeakingExerciseModal = ({ exercise, theme = 'light', onClose, onComplete }) => {
  const [recording, setRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Play reference audio or TTS
  const playReferenceAudio = () => {
    if (exercise.audioUrl) {
      const audio = new Audio(exercise.audioUrl);
      audio.play();
    } else {
      // Use Web Speech API as fallback
      const utterance = new SpeechSynthesisUtterance(exercise.correctAnswer);
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

  // Analyze pronunciation
  const analyzePronunciation = async () => {
    if (!audioBlob) return;

    setAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('targetText', exercise.correctAnswer);
      
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/speech/analyze-speaking`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        setAnalysis(result.analysis);
        
        // Check if passed (>= 50%)
        const passed = result.analysis.pronunciationScore >= 50;
        
        if (onComplete) {
          onComplete({
            passed,
            score: result.analysis.pronunciationScore,
            analysis: result.analysis
          });
        }
      } else {
        setError(result.message || 'Không thể phân tích phát âm. Vui lòng thử lại.');
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

  // Determine pass/fail
  const passed = analysis && analysis.pronunciationScore >= 50;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent theme={theme} onClick={(e) => e.stopPropagation()}>
        <CloseButton theme={theme} onClick={onClose}>
          <Close />
        </CloseButton>

        <Title theme={theme}>Bài tập Phát âm</Title>

        {/* Exercise Info */}
        <ExerciseInfo theme={theme}>
          <Question theme={theme}>{exercise.question}</Question>
          <TargetText theme={theme}>{exercise.correctAnswer}</TargetText>
          
          <PlayButton onClick={playReferenceAudio}>
            <VolumeUp />
            Nghe phát âm chuẩn
          </PlayButton>
        </ExerciseInfo>

        {/* Recording Section */}
        {!analysis && !analyzing && (
          <RecordingSection>
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
              <div style={{ marginTop: '1rem' }}>
                <audio controls src={URL.createObjectURL(audioBlob)} style={{ width: '100%' }} />
                <ActionButtons>
                  <ActionButton variant="secondary" onClick={handleRetry}>
                    <Replay />
                    Ghi lại
                  </ActionButton>
                  <ActionButton variant="primary" onClick={analyzePronunciation}>
                    Phân tích phát âm
                  </ActionButton>
                </ActionButtons>
              </div>
            )}
          </RecordingSection>
        )}

        {/* Loading State */}
        {analyzing && (
          <div>
            <LoadingSpinner />
            <LoadingText>Đang phân tích phát âm của bạn...</LoadingText>
          </div>
        )}

        {/* Error Message */}
        {error && <ErrorMessage>{error}</ErrorMessage>}

        {/* Analysis Result */}
        {analysis && (
          <ResultSection theme={theme} passed={passed}>
            <ResultHeader theme={theme}>
              {passed ? (
                <CheckCircle style={{ color: '#10b981' }} />
              ) : (
                <Cancel style={{ color: '#ef4444' }} />
              )}
              <h3>{passed ? 'Xuất sắc! Bạn đã qua!' : 'Chưa đạt, hãy thử lại!'}</h3>
            </ResultHeader>

            {/* Score */}
            <ScoreDisplay>
              <ScoreValue score={analysis.pronunciationScore}>
                {analysis.pronunciationScore}%
              </ScoreValue>
              <ScoreLabel theme={theme}>
                Điểm phát âm (Cần ≥ 50% để qua)
              </ScoreLabel>
            </ScoreDisplay>

            {/* Transcription */}
            <TranscriptionBox theme={theme}>
              <TranscriptionLabel theme={theme}>Bạn đã nói:</TranscriptionLabel>
              <TranscriptionText correct={analysis.match}>
                {analysis.transcription || '(Không nhận diện được)'}
              </TranscriptionText>
            </TranscriptionBox>

            <TranscriptionBox theme={theme}>
              <TranscriptionLabel theme={theme}>Câu cần phát âm:</TranscriptionLabel>
              <TranscriptionText correct={true}>
                {exercise.correctAnswer}
              </TranscriptionText>
            </TranscriptionBox>

            {/* Feedback */}
            {analysis.overallFeedback && (
              <FeedbackText theme={theme}>
                <strong>Phản hồi:</strong> {analysis.overallFeedback}
              </FeedbackText>
            )}

            {/* Action Buttons */}
            <ActionButtons>
              <ActionButton variant="secondary" onClick={handleRetry}>
                <Replay />
                Thử lại
              </ActionButton>
              <ActionButton 
                variant="primary" 
                onClick={onClose}
                disabled={!passed}
              >
                {passed ? 'Hoàn thành' : 'Đóng'}
              </ActionButton>
            </ActionButtons>
          </ResultSection>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default SpeakingExerciseModal;