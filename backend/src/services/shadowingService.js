const { ShadowingExercise, ShadowingAttempt } = require('../models/ShadowingExercise');
const speech = require('@google-cloud/speech');
const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs').promises;
const path = require('path');

// Initialize Google Cloud Speech client
const speechClient = new speech.SpeechClient();
const ttsClient = new textToSpeech.TextToSpeechClient();

/**
 * Calculate Levenshtein distance for text similarity
 */
function calculateLevenshteinDistance(str1, str2) {
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
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Calculate similarity percentage
 */
function calculateSimilarity(expected, actual) {
  const distance = calculateLevenshteinDistance(
    expected.toLowerCase().trim(),
    actual.toLowerCase().trim()
  );
  const maxLength = Math.max(expected.length, actual.length);
  
  if (maxLength === 0) return 100;
  
  return Math.round(((maxLength - distance) / maxLength) * 100);
}

/**
 * Analyze pronunciation using Google Speech API
 */
async function analyzePronunciation(audioBuffer, expectedText) {
  try {
    const audio = {
      content: audioBuffer.toString('base64')
    };
    
    const config = {
      encoding: 'WEBM_OPUS',
      sampleRateHertz: 48000,
      languageCode: 'en-US',
      enableAutomaticPunctuation: true,
      model: 'latest_long'
    };
    
    const request = {
      audio,
      config
    };
    
    const [response] = await speechClient.recognize(request);
    
    if (!response.results || response.results.length === 0) {
      return {
        transcription: '',
        confidence: 0,
        pronunciationScore: 0,
        accuracyScore: 0,
        fluencyScore: 0,
        completenessScore: 0
      };
    }
    
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join(' ');
    
    const confidence = response.results[0]?.alternatives[0]?.confidence || 0;
    
    // Calculate scores
    const similarity = calculateSimilarity(expectedText, transcription);
    const pronunciationScore = Math.round(confidence * 100);
    const accuracyScore = similarity;
    
    // Fluency score based on confidence and word count
    const expectedWords = expectedText.split(/\s+/).length;
    const spokenWords = transcription.split(/\s+/).length;
    const wordRatio = Math.min(spokenWords / expectedWords, 1);
    const fluencyScore = Math.round((confidence * 0.7 + wordRatio * 0.3) * 100);
    
    // Completeness score
    const completenessScore = Math.round(wordRatio * 100);
    
    return {
      transcription,
      confidence,
      pronunciationScore,
      accuracyScore,
      fluencyScore,
      completenessScore
    };
    
  } catch (error) {
    console.error('Error analyzing pronunciation:', error);
    throw error;
  }
}

/**
 * Detect errors in pronunciation
 */
function detectErrors(expectedText, spokenText) {
  const expectedWords = expectedText.toLowerCase().split(/\s+/);
  const spokenWords = spokenText.toLowerCase().split(/\s+/);
  const errors = [];
  
  // Simple word-by-word comparison
  const maxLength = Math.max(expectedWords.length, spokenWords.length);
  
  for (let i = 0; i < maxLength; i++) {
    const expected = expectedWords[i];
    const spoken = spokenWords[i];
    
    if (!expected && spoken) {
      errors.push({
        word: spoken,
        type: 'insertion',
        suggestion: `Remove "${spoken}"`
      });
    } else if (expected && !spoken) {
      errors.push({
        word: expected,
        type: 'omission',
        suggestion: `Add "${expected}"`
      });
    } else if (expected !== spoken) {
      const similarity = calculateSimilarity(expected, spoken);
      if (similarity < 80) {
        errors.push({
          word: spoken,
          type: 'substitution',
          suggestion: `Say "${expected}" instead of "${spoken}"`
        });
      } else if (similarity < 95) {
        errors.push({
          word: spoken,
          type: 'pronunciation',
          suggestion: `Improve pronunciation of "${expected}"`
        });
      }
    }
  }
  
  return errors;
}

/**
 * ===============================================
 * EXERCISE MANAGEMENT
 * ===============================================
 */

/**
 * Create shadowing exercise
 */
exports.createExercise = async (userId, exerciseData) => {
  const exercise = new ShadowingExercise({
    ...exerciseData,
    createdBy: userId
  });
  
  await exercise.save();
  return exercise;
};

/**
 * Get exercise by ID
 */
exports.getExerciseById = async (exerciseId) => {
  const exercise = await ShadowingExercise.findById(exerciseId)
    .populate('createdBy', 'name email')
    .populate('deck', 'name description');
  
  if (!exercise) {
    throw new Error('Bài tập shadowing không tồn tại');
  }
  
  return exercise;
};

/**
 * Get exercises by deck
 */
exports.getExercisesByDeck = async (deckId, userId) => {
  const query = {
    deck: deckId,
    $or: [
      { createdBy: userId },
      { isPublic: true }
    ]
  };
  
  const exercises = await ShadowingExercise.find(query)
    .sort({ createdAt: -1 })
    .populate('createdBy', 'name');
  
  return exercises;
};

/**
 * Get user's exercises
 */
exports.getUserExercises = async (userId, options = {}) => {
  const query = { createdBy: userId };
  
  if (options.difficulty) {
    query.difficulty = options.difficulty;
  }
  
  const limit = options.limit || 20;
  const skip = ((options.page || 1) - 1) * limit;
  
  const exercises = await ShadowingExercise.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('deck', 'name');
  
  const total = await ShadowingExercise.countDocuments(query);
  
  return {
    exercises,
    pagination: {
      total,
      page: options.page || 1,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Update exercise
 */
exports.updateExercise = async (exerciseId, userId, updates) => {
  const exercise = await ShadowingExercise.findOne({
    _id: exerciseId,
    createdBy: userId
  });
  
  if (!exercise) {
    throw new Error('Bài tập không tồn tại hoặc không có quyền chỉnh sửa');
  }
  
  Object.assign(exercise, updates);
  await exercise.save();
  
  return exercise;
};

/**
 * Delete exercise
 */
exports.deleteExercise = async (exerciseId, userId) => {
  const exercise = await ShadowingExercise.findOne({
    _id: exerciseId,
    createdBy: userId
  });
  
  if (!exercise) {
    throw new Error('Bài tập không tồn tại hoặc không có quyền xóa');
  }
  
  // Delete all attempts for this exercise
  await ShadowingAttempt.deleteMany({ exercise: exerciseId });
  
  await exercise.deleteOne();
  
  return { message: 'Đã xóa bài tập thành công' };
};

/**
 * ===============================================
 * ATTEMPT MANAGEMENT
 * ===============================================
 */

/**
 * Start new attempt
 */
exports.startAttempt = async (userId, exerciseId, options = {}) => {
  const exercise = await ShadowingExercise.findById(exerciseId);
  
  if (!exercise) {
    throw new Error('Bài tập không tồn tại');
  }
  
  const attempt = new ShadowingAttempt({
    user: userId,
    exercise: exerciseId,
    playbackSpeed: options.playbackSpeed || exercise.defaultSpeed,
    status: 'in-progress'
  });
  
  await attempt.save();
  
  return {
    attemptId: attempt._id,
    exercise: {
      _id: exercise._id,
      title: exercise.title,
      audioUrl: exercise.audioUrl,
      audioDuration: exercise.audioDuration,
      transcript: exercise.transcript,
      segments: exercise.segments,
      difficulty: exercise.difficulty
    },
    playbackSpeed: attempt.playbackSpeed
  };
};

/**
 * Update playback speed
 */
exports.updatePlaybackSpeed = async (attemptId, userId, speed) => {
  if (speed < 0.5 || speed > 2.0) {
    throw new Error('Tốc độ phải từ 0.5x đến 2.0x');
  }
  
  const attempt = await ShadowingAttempt.findOne({
    _id: attemptId,
    user: userId
  });
  
  if (!attempt) {
    throw new Error('Không tìm thấy lượt luyện tập');
  }
  
  attempt.playbackSpeed = speed;
  await attempt.save();
  
  return {
    attemptId: attempt._id,
    playbackSpeed: speed
  };
};

/**
 * Set A-B repeat markers
 */
exports.setABRepeat = async (attemptId, userId, startTime, endTime) => {
  const attempt = await ShadowingAttempt.findOne({
    _id: attemptId,
    user: userId
  });
  
  if (!attempt) {
    throw new Error('Không tìm thấy lượt luyện tập');
  }
  
  if (startTime >= endTime) {
    throw new Error('Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc');
  }
  
  attempt.abRepeat = {
    enabled: true,
    startTime,
    endTime,
    loopCount: (attempt.abRepeat.loopCount || 0) + 1
  };
  
  attempt.replayCount += 1;
  
  await attempt.save();
  
  return {
    attemptId: attempt._id,
    abRepeat: attempt.abRepeat
  };
};

/**
 * Clear A-B repeat
 */
exports.clearABRepeat = async (attemptId, userId) => {
  const attempt = await ShadowingAttempt.findOne({
    _id: attemptId,
    user: userId
  });
  
  if (!attempt) {
    throw new Error('Không tìm thấy lượt luyện tập');
  }
  
  attempt.abRepeat.enabled = false;
  await attempt.save();
  
  return {
    attemptId: attempt._id,
    abRepeat: attempt.abRepeat
  };
};

/**
 * Submit recording and analyze
 */
exports.submitRecording = async (attemptId, userId, audioBuffer, segmentIndex = null) => {
  const attempt = await ShadowingAttempt.findOne({
    _id: attemptId,
    user: userId
  }).populate('exercise');
  
  if (!attempt) {
    throw new Error('Không tìm thấy lượt luyện tập');
  }
  
  const exercise = attempt.exercise;
  
  // Determine expected text
  let expectedText;
  if (segmentIndex !== null && exercise.segments[segmentIndex]) {
    expectedText = exercise.segments[segmentIndex].text;
  } else {
    expectedText = exercise.transcript;
  }
  
  // Analyze pronunciation
  const analysis = await analyzePronunciation(audioBuffer, expectedText);
  
  // Detect errors
  const errors = detectErrors(expectedText, analysis.transcription);
  
  // Update attempt with analysis
  if (segmentIndex !== null) {
    // Update specific segment
    if (!attempt.segmentScores) {
      attempt.segmentScores = [];
    }
    
    attempt.segmentScores.push({
      segmentIndex,
      expectedText,
      spokenText: analysis.transcription,
      score: analysis.pronunciationScore,
      errors
    });
  } else {
    // Update overall attempt
    attempt.transcription = analysis.transcription;
    attempt.pronunciationScore = analysis.pronunciationScore;
    attempt.accuracyScore = analysis.accuracyScore;
    attempt.fluencyScore = analysis.fluencyScore;
    attempt.completenessScore = analysis.completenessScore;
  }
  
  await attempt.save();
  
  return {
    attemptId: attempt._id,
    transcription: analysis.transcription,
    scores: {
      pronunciation: analysis.pronunciationScore,
      accuracy: analysis.accuracyScore,
      fluency: analysis.fluencyScore,
      completeness: analysis.completenessScore,
      overall: attempt.score
    },
    errors,
    feedback: generateFeedback(analysis)
  };
};

/**
 * Generate feedback based on scores
 */
function generateFeedback(analysis) {
  const { pronunciationScore, accuracyScore, fluencyScore } = analysis;
  const feedback = [];
  
  if (pronunciationScore >= 90) {
    feedback.push('Phát âm xuất sắc! 🎉');
  } else if (pronunciationScore >= 75) {
    feedback.push('Phát âm tốt, hãy tiếp tục luyện tập!');
  } else if (pronunciationScore >= 60) {
    feedback.push('Phát âm cần cải thiện, hãy nghe và lặp lại nhiều lần hơn.');
  } else {
    feedback.push('Phát âm cần rèn luyện nhiều hơn. Thử giảm tốc độ audio.');
  }
  
  if (accuracyScore >= 90) {
    feedback.push('Độ chính xác cao!');
  } else if (accuracyScore < 70) {
    feedback.push('Hãy chú ý phát âm từng từ rõ ràng hơn.');
  }
  
  if (fluencyScore >= 85) {
    feedback.push('Độ trôi chảy rất tốt!');
  } else if (fluencyScore < 65) {
    feedback.push('Hãy thử luyện với tốc độ chậm hơn để tăng độ trôi chảy.');
  }
  
  return feedback.join(' ');
}

/**
 * Complete attempt
 */
exports.completeAttempt = async (attemptId, userId, timeSpent) => {
  const attempt = await ShadowingAttempt.findOne({
    _id: attemptId,
    user: userId
  });
  
  if (!attempt) {
    throw new Error('Không tìm thấy lượt luyện tập');
  }
  
  attempt.status = 'completed';
  attempt.completedAt = new Date();
  attempt.timeSpent = timeSpent || attempt.timeSpent;
  
  await attempt.save();
  
  // Update exercise statistics
  await ShadowingAttempt.updateExerciseStats(attempt.exercise);
  
  return {
    attemptId: attempt._id,
    score: attempt.score,
    pronunciationScore: attempt.pronunciationScore,
    accuracyScore: attempt.accuracyScore,
    fluencyScore: attempt.fluencyScore,
    completenessScore: attempt.completenessScore,
    timeSpent: attempt.timeSpent
  };
};

/**
 * Get attempt by ID
 */
exports.getAttemptById = async (attemptId, userId) => {
  const attempt = await ShadowingAttempt.findOne({
    _id: attemptId,
    user: userId
  })
    .populate('exercise', 'title description audioUrl segments')
    .populate('user', 'name email');
  
  if (!attempt) {
    throw new Error('Không tìm thấy lượt luyện tập');
  }
  
  return attempt;
};

/**
 * Get user's attempts
 */
exports.getUserAttempts = async (userId, options = {}) => {
  const query = { user: userId };
  
  if (options.exerciseId) {
    query.exercise = options.exerciseId;
  }
  
  if (options.status) {
    query.status = options.status;
  }
  
  const limit = options.limit || 20;
  const skip = ((options.page || 1) - 1) * limit;
  
  const attempts = await ShadowingAttempt.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('exercise', 'title difficulty');
  
  const total = await ShadowingAttempt.countDocuments(query);
  
  return {
    attempts,
    pagination: {
      total,
      page: options.page || 1,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get user statistics
 */
exports.getUserStats = async (userId, options = {}) => {
  return await ShadowingAttempt.getUserStats(userId, options);
};

/**
 * Get progress over time
 */
exports.getProgressOverTime = async (userId, exerciseId = null) => {
  const query = { 
    user: userId, 
    status: 'completed' 
  };
  
  if (exerciseId) {
    query.exercise = exerciseId;
  }
  
  const attempts = await ShadowingAttempt.find(query)
    .sort({ completedAt: 1 })
    .select('completedAt score pronunciationScore accuracyScore fluencyScore')
    .limit(100);
  
  return attempts.map(attempt => ({
    date: attempt.completedAt,
    score: attempt.score,
    pronunciation: attempt.pronunciationScore,
    accuracy: attempt.accuracyScore,
    fluency: attempt.fluencyScore
  }));
};
