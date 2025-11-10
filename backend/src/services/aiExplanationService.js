const { GoogleGenerativeAI } = require('@google/generative-ai');
const { WordExplanation, SynonymComparison, ContextExample } = require('../models/WordExplanation');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Cache duration (30 days)
const CACHE_DURATION_DAYS = 30;

/**
 * Helper: Get or create Gemini model
 * Using Gemini 2.5 Flash - faster, more cost-effective, and supports latest features
 */
const getGeminiModel = () => {
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
};

/**
 * Helper: Check if cached explanation is still valid
 */
const isCacheValid = (explanation) => {
  if (!explanation || !explanation.expiresAt) return false;
  return new Date(explanation.expiresAt) > new Date();
};

/**
 * Helper: Set cache expiration date
 */
const setCacheExpiration = () => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + CACHE_DURATION_DAYS);
  return expiresAt;
};

/**
 * Helper: Validate and transform AI response to match schema
 */
const transformAIResponse = (aiData) => {
  // Helper: Normalize frequency values
  const normalizeFrequency = (freq) => {
    if (!freq) return 'common';
    const f = freq.toLowerCase();
    if (f.includes('very common') || f.includes('very high')) return 'very common';
    if (f.includes('high') || f.includes('frequent')) return 'common';
    if (f.includes('medium') || f.includes('moderate')) return 'common';
    if (f.includes('low') || f.includes('occasional')) return 'occasional';
    if (f.includes('rare') || f.includes('seldom')) return 'rare';
    return 'common'; // default
  };
  
  // Helper: Normalize formality level
  const normalizeFormality = (level) => {
    if (!level) return 'neutral';
    const l = level.toLowerCase();
    if (l.includes('very formal')) return 'very formal';
    if (l.includes('formal')) return 'formal';
    if (l.includes('very informal') || l.includes('slang')) return 'very informal';
    if (l.includes('informal') || l.includes('casual')) return 'informal';
    return 'neutral';
  };
  
  // Ensure all array fields exist and are arrays
  const arrayFields = [
    'nuances', 
    'usageContexts', 
    'commonCollocations', 
    'commonMistakes', 
    'usageTips', 
    'relatedWords', 
    'culturalNotes'
  ];
  
  arrayFields.forEach(field => {
    if (!Array.isArray(aiData[field])) {
      aiData[field] = [];
    }
  });
  
  // Normalize commonCollocations frequency
  if (Array.isArray(aiData.commonCollocations)) {
    aiData.commonCollocations = aiData.commonCollocations.map(col => {
      return {
        ...col,
        frequency: normalizeFrequency(col.frequency)
      };
    });
  }
  
  // Normalize usageTips category
  if (Array.isArray(aiData.usageTips)) {
    aiData.usageTips = aiData.usageTips.map(tip => {
      const validCategories = ['grammar', 'pronunciation', 'usage', 'cultural', 'formality'];
      let category = 'usage'; // default
      if (tip.category) {
        const c = tip.category.toLowerCase();
        if (validCategories.includes(c)) {
          category = c;
        } else if (c.includes('grammar')) {
          category = 'grammar';
        } else if (c.includes('pronunc')) {
          category = 'pronunciation';
        } else if (c.includes('cultural') || c.includes('culture')) {
          category = 'cultural';
        } else if (c.includes('formal')) {
          category = 'formality';
        }
      }
      return {
        ...tip,
        category
      };
    });
  }
  
  // Ensure formalityAnalysis exists
  if (!aiData.formalityAnalysis) {
    aiData.formalityAnalysis = {
      level: 'neutral',
      explanation: '',
      alternatives: []
    };
  }
  
  // Normalize formalityAnalysis.level
  if (aiData.formalityAnalysis.level) {
    aiData.formalityAnalysis.level = normalizeFormality(aiData.formalityAnalysis.level);
  }
  
  // Ensure formalityAnalysis.alternatives is array of objects
  if (aiData.formalityAnalysis.alternatives) {
    aiData.formalityAnalysis.alternatives = aiData.formalityAnalysis.alternatives.map(alt => {
      // If it's a string, convert to object
      if (typeof alt === 'string') {
        // Parse strings like "talk (informal)" or just "talk"
        const match = alt.match(/^(.+?)\s*\(([^)]+)\)$/);
        if (match) {
          return {
            word: match[1].trim(),
            level: normalizeFormality(match[2].trim()),
            context: ''
          };
        }
        return {
          word: alt.trim(),
          level: 'neutral',
          context: ''
        };
      }
      // Already an object, ensure all required fields and normalize level
      return {
        word: alt.word || '',
        level: normalizeFormality(alt.level || 'neutral'),
        context: alt.context || ''
      };
    });
  }
  
  // Ensure emotionalConnotation exists and validate type
  if (!aiData.emotionalConnotation) {
    aiData.emotionalConnotation = {
      type: 'neutral',
      intensity: 'mild',
      explanation: ''
    };
  } else {
    // Validate and normalize type
    const validTypes = ['positive', 'negative', 'neutral'];
    if (!validTypes.includes(aiData.emotionalConnotation.type)) {
      const t = (aiData.emotionalConnotation.type || '').toLowerCase();
      if (t.includes('positive') || t.includes('good')) {
        aiData.emotionalConnotation.type = 'positive';
      } else if (t.includes('negative') || t.includes('bad')) {
        aiData.emotionalConnotation.type = 'negative';
      } else {
        aiData.emotionalConnotation.type = 'neutral';
      }
    }
  }
  
  return aiData;
};

/**
 * Helper: Validate and transform synonym comparison response
 */
const transformSynonymComparisonResponse = (aiData) => {
  // Ensure required arrays exist
  if (!Array.isArray(aiData.wordDetails)) {
    aiData.wordDetails = [];
  }
  if (!Array.isArray(aiData.usageGuidelines)) {
    aiData.usageGuidelines = [];
  }
  if (!Array.isArray(aiData.commonConfusions)) {
    aiData.commonConfusions = [];
  }
  if (!Array.isArray(aiData.comparisonMatrix)) {
    aiData.comparisonMatrix = [];
  }
  
  // Validate wordDetails structure
  aiData.wordDetails = aiData.wordDetails.map(detail => {
    return {
      word: detail.word || '',
      mainMeaning: detail.mainMeaning || '',
      mainMeaningVietnamese: detail.mainMeaningVietnamese || '',
      distinctiveFeatures: Array.isArray(detail.distinctiveFeatures) ? detail.distinctiveFeatures : [],
      formality: detail.formality || 'neutral',
      frequency: detail.frequency || 'medium',
      bestContexts: Array.isArray(detail.bestContexts) ? detail.bestContexts : [],
      examples: Array.isArray(detail.examples) ? detail.examples : []
    };
  });
  
  return aiData;
};

/**
 * Helper: Validate and transform context example response
 */
const transformContextExampleResponse = (aiData) => {
  // Helper: Extract string from keyPoints (may be string array or object array)
  const extractKeyPoints = (points) => {
    if (!Array.isArray(points)) return [];
    return points.map(point => {
      if (typeof point === 'string') return point;
      // If it's an object, try to get 'point' or 'text' field
      if (typeof point === 'object' && point !== null) {
        return point.point || point.text || point.description || JSON.stringify(point);
      }
      return String(point);
    });
  };
  
  // Ensure required arrays exist
  if (!Array.isArray(aiData.examples)) {
    aiData.examples = [];
  }
  if (!Array.isArray(aiData.dos)) {
    aiData.dos = [];
  }
  if (!Array.isArray(aiData.donts)) {
    aiData.donts = [];
  }
  
  // Validate examples structure and normalize keyPoints
  aiData.examples = aiData.examples.map(example => {
    return {
      situation: example.situation || '',
      situationVietnamese: example.situationVietnamese || '',
      dialogue: Array.isArray(example.dialogue) ? example.dialogue : [],
      keyPoints: extractKeyPoints(example.keyPoints),
      keyPointsVietnamese: extractKeyPoints(example.keyPointsVietnamese)
    };
  });
  
  return aiData;
};

/**
 * Explain word meaning, nuances, and usage
 */
const explainWord = async (word, userId = null, options = {}) => {
  const { includeVietnamese = true, forceRefresh = false } = options;
  
  // Check cache first
  if (!forceRefresh) {
    const cached = await WordExplanation.findOne({ 
      word: word.toLowerCase() 
    });
    
    if (cached && isCacheValid(cached)) {
      // Update request count and last requested
      cached.requestCount += 1;
      cached.lastRequested = new Date();
      await cached.save();
      
      return cached;
    }
  }
  
  // Generate new explanation with AI
  const model = getGeminiModel();
  
  const prompt = `You are an expert English language teacher. Provide a comprehensive explanation of the word "${word}" in JSON format.

Include the following:
1. basicMeaning: A simple, clear definition (1-2 sentences)
2. detailedExplanation: A detailed explanation of the word's meaning, usage, and significance (3-4 sentences)
3. nuances: Array of different nuances/contexts where the word is used differently (at least 3)
   - Each with: context, description, example
4. usageContexts: Array of situations where the word is used (at least 3)
   - Each with: situation, appropriateness, explanation, example
5. commonCollocations: Array of common phrases using this word (at least 5)
   - Each with: phrase, meaning, example, frequency
   - frequency MUST BE one of: "very common", "common", "occasional", "rare"
6. commonMistakes: Array of common mistakes learners make (at least 2)
   - Each with: mistake, correction, explanation
7. usageTips: Array of practical tips for using the word (at least 3)
   - Each with: tip, category
   - category MUST BE one of: "grammar", "pronunciation", "usage", "cultural", "formality"
8. relatedWords: Array of related words (synonyms, antonyms) with detailed comparison (at least 4)
   - Each with: word, relationship, difference, whenToUse
9. formalityAnalysis: Object with level, explanation, and alternatives
   - level MUST BE one of: "very formal", "formal", "neutral", "informal", "very informal"
   - explanation: Why it has this formality level
   - alternatives: Array of objects with word, level, and context
     Example: [{ "word": "talk", "level": "informal", "context": "casual conversation" }]
10. emotionalConnotation: Object with type, intensity, explanation
   - type MUST BE one of: "positive", "negative", "neutral"
   - intensity: "mild", "moderate", or "strong"
   - explanation: Why it has this connotation
11. culturalNotes: Array of cultural notes about the word (if any)
   - Each with: note, region

${includeVietnamese ? `
Also provide Vietnamese translations for:
- basicMeaningVietnamese
- detailedExplanationVietnamese
- All descriptions, explanations, and examples with "Vietnamese" suffix
` : ''}

Return ONLY valid JSON without markdown code blocks.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let aiData = JSON.parse(text);
    
    // Transform AI response to match schema
    aiData = transformAIResponse(aiData);
    
    // Create or update explanation
    let explanation = await WordExplanation.findOne({ word: word.toLowerCase() });
    
    if (explanation) {
      // Update existing
      Object.assign(explanation, {
        ...aiData,
        requestCount: explanation.requestCount + 1,
        lastRequested: new Date(),
        expiresAt: setCacheExpiration(),
        aiModel: 'gemini-2.5-flash',
        generatedBy: userId
      });
    } else {
      // Create new
      explanation = new WordExplanation({
        word: word.toLowerCase(),
        ...aiData,
        requestCount: 1,
        lastRequested: new Date(),
        expiresAt: setCacheExpiration(),
        aiModel: 'gemini-2.5-flash',
        generatedBy: userId
      });
    }
    
    await explanation.save();
    return explanation;
    
  } catch (error) {
    console.error('Error generating word explanation:', error);
    throw new Error('Failed to generate explanation: ' + error.message);
  }
};

/**
 * Compare synonyms with detailed analysis
 */
const compareSynonyms = async (words, userId = null, options = {}) => {
  const { includeVietnamese = true, forceRefresh = false } = options;
  
  if (!Array.isArray(words) || words.length < 2) {
    throw new Error('Please provide at least 2 words to compare');
  }
  
  // Normalize and sort words for consistent cache key
  const normalizedWords = words.map(w => w.toLowerCase()).sort();
  
  // Check cache first
  if (!forceRefresh) {
    const cached = await SynonymComparison.findOne({
      words: { $all: normalizedWords, $size: normalizedWords.length }
    });
    
    if (cached && isCacheValid(cached)) {
      cached.requestCount += 1;
      cached.lastRequested = new Date();
      await cached.save();
      return cached;
    }
  }
  
  // Generate comparison with AI
  const model = getGeminiModel();
  
  const wordsString = normalizedWords.join(', ');
  const prompt = `You are an expert English language teacher. Compare these synonym words: ${wordsString}

Provide a comprehensive comparison in JSON format:

1. summary: Overall summary of similarities and differences (2-3 sentences)
2. wordDetails: Array with details for each word
   - For each word include:
     * word: the word itself
     * mainMeaning: primary meaning
     * distinctiveFeatures: array of features that distinguish it from others
       - Each with: feature, explanation
     * formality: formality level
     * frequency: how often it's used
     * bestContexts: array of best contexts to use this word
     * examples: array of example sentences with context
3. usageGuidelines: Array of scenarios with recommendations
   - Each with: scenario, recommendedWord, reason, example
4. commonConfusions: Array of common confusions between these words
   - Each with: confusion, clarification
5. comparisonMatrix: Array of comparison criteria
   - Each with: criterion (e.g., "Formality", "Intensity", "Frequency")
   - values: object with word: value pairs for each criterion

${includeVietnamese ? `
Also provide Vietnamese translations for all text fields with "Vietnamese" suffix.
` : ''}

Return ONLY valid JSON without markdown code blocks.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    let aiData = JSON.parse(text);
    
    // Transform AI response to match schema
    aiData = transformSynonymComparisonResponse(aiData);
    
    // Create or update comparison
    let comparison = await SynonymComparison.findOne({
      words: { $all: normalizedWords, $size: normalizedWords.length }
    });
    
    if (comparison) {
      Object.assign(comparison, {
        ...aiData,
        requestCount: comparison.requestCount + 1,
        lastRequested: new Date(),
        expiresAt: setCacheExpiration(),
        aiModel: 'gemini-2.5-flash',
        generatedBy: userId
      });
    } else {
      comparison = new SynonymComparison({
        words: normalizedWords,
        ...aiData,
        requestCount: 1,
        lastRequested: new Date(),
        expiresAt: setCacheExpiration(),
        aiModel: 'gemini-2.5-flash',
        generatedBy: userId
      });
    }
    
    await comparison.save();
    return comparison;
    
  } catch (error) {
    console.error('Error comparing synonyms:', error);
    throw new Error('Failed to compare synonyms: ' + error.message);
  }
};

/**
 * Get context-specific examples and usage
 */
const getContextExamples = async (word, context, userId = null, options = {}) => {
  const { includeVietnamese = true, forceRefresh = false } = options;
  
  // Check cache first
  if (!forceRefresh) {
    const cached = await ContextExample.findOne({
      word: word.toLowerCase(),
      context: context.toLowerCase()
    });
    
    if (cached && isCacheValid(cached)) {
      cached.requestCount += 1;
      cached.lastRequested = new Date();
      await cached.save();
      return cached;
    }
  }
  
  // Generate examples with AI
  const model = getGeminiModel();
  
  const prompt = `You are an expert English language teacher. Provide context-specific examples for the word "${word}" in the context of "${context}".

Provide in JSON format:

1. examples: Array of realistic examples (at least 3)
   - Each with:
     * situation: description of the situation
     * dialogue: array of dialogue exchanges
       - Each with: speaker, text, explanation
     * keyPoints: array of important points about usage in this example
1. examples: Array of realistic examples (at least 3)
   - Each with:
     * situation: description of the situation
     * dialogue: array of dialogue exchanges
       - Each with: speaker, text, explanation
     * keyPoints: MUST BE array of strings (simple text points)
     * keyPointsVietnamese: MUST BE array of strings (simple text points)
2. dos: Array of do's for using this word in this context (at least 3)
   - Each with: point, example
3. donts: Array of don'ts - common mistakes (at least 3)
   - Each with: point, wrongExample, correctExample, explanation

IMPORTANT: keyPoints and keyPointsVietnamese MUST be simple string arrays, not object arrays.
Example: ["Point 1", "Point 2", "Point 3"]
NOT: [{"point": "Point 1"}, {"point": "Point 2"}]

${includeVietnamese ? `
Also provide Vietnamese translations for all text fields with "Vietnamese" suffix.
` : ''}

Return ONLY valid JSON without markdown code blocks.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    let aiData = JSON.parse(text);
    
    // Transform AI response to match schema
    aiData = transformContextExampleResponse(aiData);
    
    // Create or update context example
    let contextExample = await ContextExample.findOne({
      word: word.toLowerCase(),
      context: context.toLowerCase()
    });
    
    if (contextExample) {
      Object.assign(contextExample, {
        ...aiData,
        requestCount: contextExample.requestCount + 1,
        lastRequested: new Date(),
        expiresAt: setCacheExpiration(),
        aiModel: 'gemini-2.5-flash'
      });
    } else {
      contextExample = new ContextExample({
        word: word.toLowerCase(),
        context: context.toLowerCase(),
        ...aiData,
        requestCount: 1,
        lastRequested: new Date(),
        expiresAt: setCacheExpiration(),
        aiModel: 'gemini-2.5-flash'
      });
    }
    
    await contextExample.save();
    return contextExample;
    
  } catch (error) {
    console.error('Error generating context examples:', error);
    throw new Error('Failed to generate context examples: ' + error.message);
  }
};

/**
 * Analyze nuances of a word
 */
const analyzeNuances = async (word, userId = null, options = {}) => {
  // Get full explanation which includes nuances
  const explanation = await explainWord(word, userId, options);
  
  return {
    word: explanation.word,
    nuances: explanation.nuances,
    formalityAnalysis: explanation.formalityAnalysis,
    emotionalConnotation: explanation.emotionalConnotation,
    usageContexts: explanation.usageContexts,
    culturalNotes: explanation.culturalNotes
  };
};

/**
 * Get usage tips for a word
 */
const getUsageTips = async (word, userId = null, options = {}) => {
  // Get full explanation which includes usage tips
  const explanation = await explainWord(word, userId, options);
  
  return {
    word: explanation.word,
    usageTips: explanation.usageTips,
    commonMistakes: explanation.commonMistakes,
    commonCollocations: explanation.commonCollocations
  };
};

/**
 * Generate example sentences for specific situations
 */
const generateSituationExamples = async (word, situation, count = 5, userId = null) => {
  const model = getGeminiModel();
  
  const prompt = `Generate ${count} example sentences using the word "${word}" in the situation: "${situation}".

For each example, provide:
- sentence: the example sentence
- sentenceVietnamese: Vietnamese translation
- explanation: brief explanation of how the word is used
- difficulty: "beginner", "intermediate", or "advanced"

Return as JSON array without markdown code blocks.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const examples = JSON.parse(text);
    
    return examples;
    
  } catch (error) {
    console.error('Error generating situation examples:', error);
    throw new Error('Failed to generate examples: ' + error.message);
  }
};

/**
 * Explain the difference between similar words
 */
const explainDifference = async (word1, word2, userId = null, options = {}) => {
  const { includeVietnamese = true } = options;
  
  const model = getGeminiModel();
  
  const prompt = `You are an expert English language teacher. Explain the difference between "${word1}" and "${word2}".

Provide in JSON format:

1. summary: Brief summary of the key difference (2 sentences)
2. word1Analysis: Detailed analysis of ${word1}
   - meaning: core meaning
   - usage: when to use it
   - examples: array of 2-3 examples
3. word2Analysis: Detailed analysis of ${word2}
   - meaning: core meaning
   - usage: when to use it
   - examples: array of 2-3 examples
4. keyDifferences: Array of key differences (at least 3)
   - Each with: aspect, word1Characteristic, word2Characteristic, explanation
5. exampleComparisons: Array of side-by-side examples (at least 3)
   - Each with: situation, word1Example, word2Example, explanation

${includeVietnamese ? `
Provide Vietnamese translations for all text fields with "Vietnamese" suffix.
` : ''}

Return ONLY valid JSON without markdown code blocks.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const difference = JSON.parse(text);
    
    return difference;
    
  } catch (error) {
    console.error('Error explaining difference:', error);
    throw new Error('Failed to explain difference: ' + error.message);
  }
};

/**
 * Rate an explanation
 */
const rateExplanation = async (explanationId, userId, rating, feedback = '') => {
  const explanation = await WordExplanation.findById(explanationId);
  
  if (!explanation) {
    throw new Error('Explanation not found');
  }
  
  // Check if user already rated
  const existingRating = explanation.userRatings.find(
    r => r.user.toString() === userId.toString()
  );
  
  if (existingRating) {
    // Update existing rating
    existingRating.rating = rating;
    existingRating.feedback = feedback;
  } else {
    // Add new rating
    explanation.userRatings.push({
      user: userId,
      rating,
      feedback
    });
  }
  
  // Update average rating
  explanation.updateAverageRating();
  
  await explanation.save();
  return explanation;
};

/**
 * Mark comparison as helpful/not helpful
 */
const rateComparison = async (comparisonId, isHelpful) => {
  const comparison = await SynonymComparison.findById(comparisonId);
  
  if (!comparison) {
    throw new Error('Comparison not found');
  }
  
  if (isHelpful) {
    comparison.helpfulCount += 1;
  } else {
    comparison.notHelpfulCount += 1;
  }
  
  await comparison.save();
  return comparison;
};

/**
 * Get cached explanation by word
 */
const getCachedExplanation = async (word) => {
  const explanation = await WordExplanation.findOne({ 
    word: word.toLowerCase() 
  });
  
  if (explanation && isCacheValid(explanation)) {
    return explanation;
  }
  
  return null;
};

/**
 * Get cached comparison
 */
const getCachedComparison = async (words) => {
  const normalizedWords = words.map(w => w.toLowerCase()).sort();
  
  const comparison = await SynonymComparison.findOne({
    words: { $all: normalizedWords, $size: normalizedWords.length }
  });
  
  if (comparison && isCacheValid(comparison)) {
    return comparison;
  }
  
  return null;
};

/**
 * Get cached context examples
 */
const getCachedContextExamples = async (word, context) => {
  const examples = await ContextExample.findOne({
    word: word.toLowerCase(),
    context: context.toLowerCase()
  });
  
  if (examples && isCacheValid(examples)) {
    return examples;
  }
  
  return null;
};

/**
 * Clear expired cache entries
 */
const clearExpiredCache = async () => {
  const now = new Date();
  
  const results = await Promise.all([
    WordExplanation.deleteMany({ expiresAt: { $lt: now } }),
    SynonymComparison.deleteMany({ expiresAt: { $lt: now } }),
    ContextExample.deleteMany({ expiresAt: { $lt: now } })
  ]);
  
  return {
    explanations: results[0].deletedCount,
    comparisons: results[1].deletedCount,
    contextExamples: results[2].deletedCount
  };
};

module.exports = {
  explainWord,
  compareSynonyms,
  getContextExamples,
  analyzeNuances,
  getUsageTips,
  generateSituationExamples,
  explainDifference,
  rateExplanation,
  rateComparison,
  getCachedExplanation,
  getCachedComparison,
  getCachedContextExamples,
  clearExpiredCache
};
