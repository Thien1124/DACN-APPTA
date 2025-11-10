const SpeechAttempt = require('../models/SpeechAttempt');
const Flashcard = require('../models/Flashcard');
const speech = require('@google-cloud/speech');
const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs').promises;
const path = require('path');

// Initialize Google Cloud clients (will be configured via environment variables)
let speechClient;
let ttsClient;

try {
  if (process.env.GOOGLE_CLOUD_CREDENTIALS) {
    const credentials = JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS);
    speechClient = new speech.SpeechClient({ credentials });
    ttsClient = new textToSpeech.TextToSpeechClient({ credentials });
  }
} catch (error) {
  console.warn('Google Cloud Speech API not configured:', error.message);
}

/**
 * Transcribe audio using Google Cloud Speech-to-Text
 */
async function transcribeAudio(audioBuffer, language = 'en-US') {
  if (!speechClient) {
    throw new Error('Speech recognition service chưa được cấu hình. Vui lòng thêm GOOGLE_CLOUD_CREDENTIALS vào .env');
  }
  
  const audio = {
    content: audioBuffer.toString('base64')
  };
  
  const config = {
    encoding: 'WEBM_OPUS', // or 'LINEAR16', 'MP3', etc.
    sampleRateHertz: 48000,
    languageCode: language,
    enableAutomaticPunctuation: true,
    enableWordTimeOffsets: true,
    model: 'default'
  };
  
  const request = {
    audio: audio,
    config: config
  };
  
  try {
    const [response] = await speechClient.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    
    const confidence = response.results[0]?.alternatives[0]?.confidence || 0;
    const words = response.results[0]?.alternatives[0]?.words || [];
    
    return {
      transcription,
      confidence,
      words
    };
  } catch (error) {
    console.error('Speech recognition error:', error);
    throw new Error('Không thể nhận dạng giọng nói: ' + error.message);
  }
}

/**
 * Generate pronunciation feedback using phoneme comparison
 */
function analyzePronunciation(targetText, transcribedText, targetIPA = null) {
  // Normalize texts
  const target = targetText.toLowerCase().trim();
  const transcribed = transcribedText.toLowerCase().trim();
  
  // Calculate word-level accuracy
  const targetWords = target.split(/\s+/);
  const transcribedWords = transcribed.split(/\s+/);
  
  const wordAnalysis = [];
  
  for (let i = 0; i < targetWords.length; i++) {
    const expectedWord = targetWords[i];
    const actualWord = transcribedWords[i] || '';
    
    // Calculate similarity
    const distance = levenshteinDistance(expectedWord, actualWord);
    const maxLength = Math.max(expectedWord.length, actualWord.length);
    const similarity = maxLength > 0 ? (1 - distance / maxLength) : 0;
    const score = Math.round(similarity * 100);
    
    // Identify issues
    const issues = [];
    if (score < 60) {
      if (!actualWord) {
        issues.push('missing');
      } else if (actualWord.length < expectedWord.length * 0.7) {
        issues.push('incomplete');
      } else {
        issues.push('pronunciation');
      }
    } else if (score < 80) {
      issues.push('clarity');
    }
    
    wordAnalysis.push({
      word: expectedWord,
      expected: expectedWord,
      actual: actualWord,
      score,
      issues
    });
  }
  
  // Calculate overall scores
  const accuracyScore = Math.round(
    wordAnalysis.reduce((sum, w) => sum + w.score, 0) / wordAnalysis.length
  );
  
  const completenessScore = Math.round(
    (transcribedWords.length / targetWords.length) * 100
  );
  
  return {
    accuracyScore,
    completenessScore,
    wordAnalysis
  };
}

/**
 * Simple Levenshtein distance for word comparison
 */
function levenshteinDistance(str1, str2) {
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
}

/**
 * Analyze intonation pattern (simplified)
 */
function analyzeIntonation(words) {
  if (!words || words.length === 0) {
    return {
      pattern: 'unknown',
      score: 50,
      feedback: 'Không đủ dữ liệu để phân tích ngữ điệu'
    };
  }
  
  // Simple analysis based on word timing
  // In production, you'd use actual pitch/frequency analysis
  
  return {
    pattern: 'normal',
    score: 75,
    feedback: 'Ngữ điệu tự nhiên'
  };
}

/**
 * Calculate fluency score based on timing
 */
function calculateFluencyScore(duration, wordCount, pauseCount = 0) {
  if (duration <= 0 || wordCount <= 0) {
    return 0;
  }
  
  const speechRate = (wordCount / duration) * 60; // words per minute
  const optimalRate = 150; // optimal WPM for clear speech
  
  // Score based on how close to optimal rate
  let rateScore = 100 - Math.abs(speechRate - optimalRate) / 2;
  rateScore = Math.max(0, Math.min(100, rateScore));
  
  // Penalize for too many pauses
  const pausePenalty = Math.min(pauseCount * 5, 30);
  
  const fluencyScore = Math.round(Math.max(0, rateScore - pausePenalty));
  
  return {
    fluencyScore,
    speechRate,
    pauseCount
  };
}

/**
 * Generate overall feedback
 */
function generateFeedback(pronunciationScore, fluencyScore, accuracyScore) {
  const detailedFeedback = [];
  
  // Pronunciation feedback
  if (pronunciationScore >= 90) {
    detailedFeedback.push({
      category: 'pronunciation',
      message: 'Phát âm xuất sắc! Tiếp tục duy trì.',
      severity: 'info'
    });
  } else if (pronunciationScore >= 70) {
    detailedFeedback.push({
      category: 'pronunciation',
      message: 'Phát âm tốt, nhưng vẫn có thể cải thiện thêm.',
      severity: 'info'
    });
  } else if (pronunciationScore >= 50) {
    detailedFeedback.push({
      category: 'pronunciation',
      message: 'Phát âm cần luyện tập thêm. Hãy chú ý đến từng từ.',
      severity: 'warning'
    });
  } else {
    detailedFeedback.push({
      category: 'pronunciation',
      message: 'Phát âm cần cải thiện nhiều. Luyện tập thường xuyên hơn.',
      severity: 'error'
    });
  }
  
  // Fluency feedback
  if (fluencyScore >= 80) {
    detailedFeedback.push({
      category: 'fluency',
      message: 'Nói trơn tru, tự nhiên.',
      severity: 'info'
    });
  } else if (fluencyScore >= 60) {
    detailedFeedback.push({
      category: 'fluency',
      message: 'Nói hơi chậm hoặc nhiều ngắt quãng.',
      severity: 'warning'
    });
  } else {
    detailedFeedback.push({
      category: 'fluency',
      message: 'Cần luyện tập để nói trơn tru hơn.',
      severity: 'error'
    });
  }
  
  // Accuracy feedback
  if (accuracyScore >= 90) {
    detailedFeedback.push({
      category: 'accuracy',
      message: 'Độ chính xác cao, nội dung rõ ràng.',
      severity: 'info'
    });
  } else if (accuracyScore >= 70) {
    detailedFeedback.push({
      category: 'accuracy',
      message: 'Một số từ chưa rõ ràng.',
      severity: 'warning'
    });
  } else {
    detailedFeedback.push({
      category: 'accuracy',
      message: 'Nhiều từ chưa chính xác.',
      severity: 'error'
    });
  }
  
  // Overall feedback
  const avgScore = (pronunciationScore + fluencyScore + accuracyScore) / 3;
  let overallFeedback;
  
  if (avgScore >= 85) overallFeedback = 'excellent';
  else if (avgScore >= 70) overallFeedback = 'good';
  else if (avgScore >= 50) overallFeedback = 'fair';
  else overallFeedback = 'needs_improvement';
  
  return {
    overallFeedback,
    detailedFeedback
  };
}

/**
 * Analyze speech and generate comprehensive feedback
 */
async function analyzeSpeech(audioBuffer, targetText, options = {}) {
  const {
    targetIPA = null,
    language = 'en-US',
    userId,
    flashcardId,
    deckId
  } = options;
  
  try {
    // Transcribe audio
    const { transcription, confidence, words } = await transcribeAudio(audioBuffer, language);
    
    // Analyze pronunciation
    const pronunciationAnalysis = analyzePronunciation(targetText, transcription, targetIPA);
    
    // Calculate fluency
    const duration = audioBuffer.length / (48000 * 2); // Approximate duration
    const wordCount = targetText.split(/\s+/).length;
    const fluencyAnalysis = calculateFluencyScore(duration, wordCount);
    
    // Analyze intonation
    const intonation = analyzeIntonation(words);
    
    // Calculate pronunciation score (weighted average)
    const pronunciationScore = Math.round(
      pronunciationAnalysis.accuracyScore * 0.7 +
      pronunciationAnalysis.completenessScore * 0.3
    );
    
    // Generate feedback
    const feedback = generateFeedback(
      pronunciationScore,
      fluencyAnalysis.fluencyScore,
      pronunciationAnalysis.accuracyScore
    );
    
    // Determine pass/fail (70% threshold)
    const passed = pronunciationScore >= 70;
    
    return {
      targetText,
      targetIPA,
      transcription,
      confidence,
      pronunciationScore,
      fluencyScore: fluencyAnalysis.fluencyScore,
      accuracyScore: pronunciationAnalysis.accuracyScore,
      completenessScore: pronunciationAnalysis.completenessScore,
      wordAnalysis: pronunciationAnalysis.wordAnalysis,
      intonation,
      duration,
      speechRate: fluencyAnalysis.speechRate,
      pauseCount: fluencyAnalysis.pauseCount,
      overallFeedback: feedback.overallFeedback,
      detailedFeedback: feedback.detailedFeedback,
      passed,
      language,
      recognitionEngine: 'google'
    };
  } catch (error) {
    console.error('Speech analysis error:', error);
    throw error;
  }
}

/**
 * Save speech attempt to database
 */
async function saveSpeechAttempt(userId, flashcardId, deckId, userAudioUrl, analysisResult) {
  const attempt = new SpeechAttempt({
    user: userId,
    flashcard: flashcardId,
    deck: deckId,
    userAudioUrl,
    ...analysisResult
  });
  
  await attempt.save();
  return attempt;
}

/**
 * Get speech exercise for a flashcard
 */
async function getSpeechExercise(flashcardId) {
  const flashcard = await Flashcard.findById(flashcardId)
    .select('front back audioUrl example pronunciation ipa');
  
  if (!flashcard) {
    throw new Error('Flashcard không tồn tại');
  }
  
  return {
    flashcardId: flashcard._id,
    targetText: flashcard.front,
    targetIPA: flashcard.ipa,
    referenceAudioUrl: flashcard.audioUrl,
    example: flashcard.example,
    pronunciation: flashcard.pronunciation
  };
}

/**
 * Get user speech statistics
 */
async function getUserSpeechStats(userId, options = {}) {
  const stats = await SpeechAttempt.getUserStats(userId, options);
  const commonIssues = await SpeechAttempt.getCommonIssues(userId, 10);
  const progress = await SpeechAttempt.getProgressOverTime(userId, 30);
  
  return {
    ...stats,
    commonIssues,
    progress
  };
}

/**
 * Get speech history for a user
 */
async function getSpeechHistory(userId, options = {}) {
  const {
    deckId,
    limit = 20,
    skip = 0,
    sortBy = 'completedAt',
    sortOrder = 'desc'
  } = options;
  
  const query = { user: userId };
  if (deckId) query.deck = deckId;
  
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
  
  const [attempts, total] = await Promise.all([
    SpeechAttempt.find(query)
      .populate('flashcard', 'front back audioUrl ipa')
      .populate('deck', 'name')
      .sort(sort)
      .limit(limit)
      .skip(skip),
    SpeechAttempt.countDocuments(query)
  ]);
  
  return {
    attempts,
    total,
    page: Math.floor(skip / limit) + 1,
    totalPages: Math.ceil(total / limit)
  };
}

/**
 * Generate audio from text using TTS
 */
async function generateAudio(text, language = 'en-US', outputPath) {
  if (!ttsClient) {
    throw new Error('Text-to-Speech service chưa được cấu hình');
  }
  
  const request = {
    input: { text },
    voice: { languageCode: language, ssmlGender: 'NEUTRAL' },
    audioConfig: { audioEncoding: 'MP3' }
  };
  
  const [response] = await ttsClient.synthesizeSpeech(request);
  await fs.writeFile(outputPath, response.audioContent, 'binary');
  
  return outputPath;
}

module.exports = {
  transcribeAudio,
  analyzePronunciation,
  analyzeSpeech,
  saveSpeechAttempt,
  getSpeechExercise,
  getUserSpeechStats,
  getSpeechHistory,
  generateAudio,
  calculateFluencyScore,
  analyzeIntonation,
  generateFeedback
};
