const SpeechAttempt = require('../models/SpeechAttempt');
const Flashcard = require('../models/Flashcard');
const speech = require('@google-cloud/speech');
const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');                // ✅ Cho createReadStream
const fsPromises = require('fs').promises; // ✅ Cho async/await
const path = require('path');

// ✅ SỬA: Dùng OpenAI SDK mới
const OpenAI = require('openai');

// Initialize Google Cloud clients
let speechClient;
let ttsClient;

// Initialize OpenAI Whisper
let openai;
let isWhisperConfigured = false;

try {
  if (process.env.GOOGLE_CLOUD_CREDENTIALS) {
    const credentials = JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS);
    speechClient = new speech.SpeechClient({ credentials });
    ttsClient = new textToSpeech.TextToSpeechClient({ credentials });
  }
  
  // ✅ SỬA: Khởi tạo OpenAI đúng cách
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    isWhisperConfigured = true;
    console.log('🎤 OpenAI Whisper API configured');
    console.log('📝 API Key:', process.env.OPENAI_API_KEY.substring(0, 10) + '...');
  } else {
    console.warn('⚠️ OPENAI_API_KEY not found in .env');
  }
} catch (error) {
  console.error('❌ Configuration error:', error.message);
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
 * Transcribe audio using OpenAI Whisper
 */
async function transcribeAudioWhisper(audioBuffer, language = 'en') {
  if (!isWhisperConfigured) {
    console.warn('⚠️ Whisper not configured, using mock');
    return {
      transcription: 'Mock transcription',
      confidence: 0.5,
      words: []
    };
  }
  
  try {
    console.log('🔍 Starting Whisper transcription...');
    console.log('📊 Audio buffer size:', audioBuffer.length, 'bytes');
    
    // Tạo temp file
    const tempFilePath = path.join(__dirname, `temp_audio_${Date.now()}.webm`);
    await fsPromises.writeFile(tempFilePath, audioBuffer);
    console.log('💾 Saved temp file:', tempFilePath);
    
    // ✅ SỬA: Gọi API đúng cách
    console.log('📤 Sending to Whisper API...');
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: 'whisper-1',
      language: language,
      response_format: 'json'
    });
    
    console.log('✅ Whisper response:', transcription);
    
    // Cleanup
    await fsPromises.unlink(tempFilePath).catch(err => 
      console.warn('⚠️ Could not delete temp file:', err.message)
    );
    
    // ✅ SỬA: Truy cập kết quả đúng
    return {
      transcription: transcription.text,
      confidence: 0.95,
      words: []
    };
    
  } catch (error) {
    console.error('❌ Whisper API error:', error.response?.data || error.message);
    
    // Fallback mock
    return {
      transcription: 'Mock transcription - API error',
      confidence: 0.5,
      words: []
    };
  }
}

/**
 * Analyze pronunciation
 */
function analyzePronunciation(targetText, transcribedText, targetIPA = null) {
  console.log('📝 Analyzing pronunciation...');
  console.log('Target:', targetText);
  console.log('Transcribed:', transcribedText);
  
  const normalizedTarget = targetText.toLowerCase().trim();
  const normalizedTranscribed = transcribedText.toLowerCase().trim();
  
  // Exact match
  if (normalizedTranscribed === normalizedTarget) {
    console.log('✅ Exact match!');
    return {
      pronunciationScore: 100,
      accuracyScore: 100,
      fluencyScore: 100,
      completenessScore: 100,
      match: true
    };
  }
  
  // Calculate similarity
  const similarity = calculateSimilarity(normalizedTranscribed, normalizedTarget);
  const score = Math.round(similarity * 100);
  
  console.log('📊 Similarity:', similarity);
  console.log('📊 Score:', score);
  
  return {
    pronunciationScore: score,
    accuracyScore: score,
    fluencyScore: Math.max(60, score - 10),
    completenessScore: Math.max(70, score - 5),
    match: score >= 80 // 80% trở lên = pass
  };
}

/**
 * Helper: Calculate similarity
 */
function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

/**
 * Helper: Levenshtein distance
 */
function levenshteinDistance(str1, str2) {
  const matrix = [];
  for (let i = 0; i <= str2.length; i++) matrix[i] = [i];
  for (let j = 0; j <= str1.length; j++) matrix[0][j] = j;
  
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
 * Analyze speech and generate comprehensive feedback
 */
async function analyzeSpeech(audioBuffer, targetText, options = {}) {
  try {
    // Transcribe with Whisper
    const { transcription, confidence } = await transcribeAudioWhisper(audioBuffer, options.language || 'en');
    
    const analysis = analyzePronunciation(targetText, transcription);
    
    return {
      ...analysis,
      transcription,
      expectedText: targetText,
      confidence,
      wordAnalysis: [],
      ipaComparison: null,
      intonation: { pattern: 'natural', score: 80, feedback: 'Good intonation' },
      detailedFeedback: [
        analysis.match ? '🎉 Phát âm tốt!' : '😕 Cần luyện tập thêm',
        `Điểm: ${analysis.pronunciationScore}%`,
        `Độ chính xác: ${analysis.accuracyScore}%`
      ]
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

/**
 * Mock Service for Testing
 */
class SpeechService {
  constructor() {
    this.useWhisper = isWhisperConfigured;
    this.useMock = !this.useWhisper;
    
    if (this.useWhisper) {
      console.log('🎤 Using OpenAI Whisper API');
    } else {
      console.log('🧪 Using MOCK MODE');
    }
  }

  /**
   * Mock transcribe audio
   */
  async transcribeAudio(audioBuffer, language = 'en-US') {
    console.log('🧪 Mock transcribe');
    
    // Giả lập delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      transcription: 'Mock transcription text',
      confidence: 0.85,
      words: []
    };
  }

  /**
   * Mock analyze speaking
   */
  async analyzeSpeaking(audioBuffer, targetText, options = {}) {
    console.log('=' .repeat(50));
    console.log('🎯 analyzeSpeaking called');
    console.log('Target text:', targetText);
    console.log('Buffer size:', audioBuffer.length);
    console.log('Use Whisper:', this.useWhisper);
    console.log('=' .repeat(50));
    
    if (this.useWhisper) {
      // Use real Whisper API
      return await analyzeSpeech(audioBuffer, targetText, options);
    } else {
      // Mock fallback
      console.log('🧪 Mock analysis for:', targetText);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        pronunciationScore: 100, // Luôn pass trong mock
        accuracyScore: 100,
        fluencyScore: 95,
        completenessScore: 100,
        transcription: targetText, // Trả đúng
        confidence: 0.95,
        match: true,
        detailedFeedback: [
          '🎉 Phát âm xuất sắc!',
          '✅ Mock mode - test UI'
        ]
      };
    }
  }
}

module.exports = new SpeechService();
