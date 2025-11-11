const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Analyze a word/phrase and suggest rich vocabulary data
 * @param {string} word - The word/phrase to analyze
 * @param {string} context - Optional context or sentence
 * @returns {Object} Suggested vocabulary data
 */
exports.analyzeWord = async (word, context = '') => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Analyze the English word: "${word}"
${context ? `Context: ${context}` : ''}

IMPORTANT: Follow these exact enum values:
- partOfSpeech: MUST be ONE of: noun, verb, adjective, adverb, preposition, conjunction, pronoun, interjection, phrase, idiom, other
- cefrLevel: MUST be ONE of: A1, A2, B1, B2, C1, C2 (DO NOT use ranges like "B2/C1" or "B2-C1")
- difficulty: MUST be ONE of: elementary, intermediate, advanced

Respond in JSON format:
{
  "word": "${word}",
  "pronunciation": "IPA pronunciation (e.g., /wɜːrd/)",
  "partOfSpeech": "ONE value only: noun, verb, adjective, adverb, etc.",
  "meanings": [
    {
      "definition": "English definition",
      "example": "Example sentence",
      "translation": "Vietnamese translation"
    }
  ],
  "synonyms": [
    { "word": "synonym1" },
    { "word": "synonym2" }
  ],
  "antonyms": [
    { "word": "antonym1" }
  ],
  "collocations": [
    {
      "phrase": "common phrase",
      "meaning": "meaning",
      "example": "example sentence"
    }
  ],
  "usageNotes": "Usage tips",
  "grammarNotes": "Grammar notes",
  "tags": ["tag1", "tag2"],
  "difficulty": "ONE value only: elementary, intermediate, or advanced",
  "cefrLevel": "ONE value only: A1, A2, B1, B2, C1, or C2",
  "isPolysemous": true/false
}

CRITICAL RULES:
1. partOfSpeech: Use ONLY ONE base form (e.g., "verb" not "verb/adjective")
2. cefrLevel: Use ONLY ONE level (e.g., "B2" not "B2/C1")
3. If a word has multiple uses, choose the MOST COMMON one
4. Keep all fields lowercase except proper nouns`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse JSON
    let jsonText = text.trim();
    if (jsonText.includes('```json')) {
      jsonText = jsonText.match(/```json\n([\s\S]*?)\n```/)?.[1] || jsonText;
    } else if (jsonText.includes('```')) {
      jsonText = jsonText.match(/```\n([\s\S]*?)\n```/)?.[1] || jsonText;
    }

    const parsedData = JSON.parse(jsonText);

    // ✅ Validate and clean data before returning
    return {
      ...parsedData,
      partOfSpeech: cleanPartOfSpeech(parsedData.partOfSpeech),
      cefrLevel: cleanCEFRLevel(parsedData.cefrLevel),
      difficulty: cleanDifficulty(parsedData.difficulty)
    };

  } catch (error) {
    console.error(`Gemini analyze error for "${word}":`, error.message);
    throw new Error(`Cannot analyze word "${word}": ${error.message}`);
  }
};

// ✅ Helper functions
function cleanPartOfSpeech(pos) {
  if (!pos) return 'other';
  const cleaned = pos.toLowerCase().split('/')[0].split(',')[0].trim();
  const validValues = ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'pronoun', 'interjection', 'phrase', 'idiom', 'other'];
  return validValues.includes(cleaned) ? cleaned : 'other';
}

function cleanCEFRLevel(level) {
  if (!level) return 'B1';
  const cleaned = level.toUpperCase().split('/')[0].split('-')[0].trim();
  const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  return validLevels.includes(cleaned) ? cleaned : 'B1';
}

function cleanDifficulty(difficulty) {
  if (!difficulty) return 'intermediate';
  const cleaned = difficulty.toLowerCase().trim();
  const validValues = ['elementary', 'intermediate', 'advanced'];
  return validValues.includes(cleaned) ? cleaned : 'intermediate';
}

/**
 * Detect if a word has multiple meanings (polysemy)
 * @param {string} word - The word to check
 * @returns {Object} Polysemy analysis
 */
exports.detectPolysemy = async (word) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Analyze if the English word "${word}" is polysemous (has multiple distinct meanings).

Respond in JSON format:
{
  "word": "${word}",
  "isPolysemous": true/false,
  "meaningCount": number,
  "mainMeanings": [
    {
      "definition": "definition",
      "example": "example",
      "frequency": "common/less common/rare"
    }
  ],
  "note": "brief explanation"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let jsonText = text;
    if (text.includes('```json')) {
      jsonText = text.match(/```json\n([\s\S]*?)\n```/)?.[1] || text;
    } else if (text.includes('```')) {
      jsonText = text.match(/```\n([\s\S]*?)\n```/)?.[1] || text;
    }

    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    throw new Error('Không thể phát hiện đa nghĩa: ' + error.message);
  }
};

/**
 * Suggest natural example sentences for a word
 * @param {string} word - The word
 * @param {string} meaning - Specific meaning to illustrate
 * @param {number} count - Number of examples (default: 3)
 * @returns {Array} Array of example sentences
 */
exports.generateExamples = async (word, meaning = '', count = 3) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Generate ${count} natural, conversational example sentences using the English word "${word}"${meaning ? ` with the meaning: "${meaning}"` : ''}.

Requirements:
- Use realistic, everyday contexts
- Vary sentence structures
- Show different usage patterns
- Keep sentences simple and clear
- Include common collocations

Respond in JSON format:
{
  "word": "${word}",
  "examples": [
    {
      "sentence": "example sentence",
      "context": "brief context description",
      "level": "A1/A2/B1/B2/C1/C2"
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let jsonText = text;
    if (text.includes('```json')) {
      jsonText = text.match(/```json\n([\s\S]*?)\n```/)?.[1] || text;
    } else if (text.includes('```')) {
      jsonText = text.match(/```\n([\s\S]*?)\n```/)?.[1] || text;
    }

    const data = JSON.parse(jsonText);
    return data.examples || [];
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    throw new Error('Không thể tạo ví dụ: ' + error.message);
  }
};

/**
 * Suggest image search keywords for visual illustration
 * @param {string} word - The word to illustrate
 * @param {string} meaning - Specific meaning
 * @returns {Object} Image suggestions
 */
exports.suggestImageKeywords = async (word, meaning = '') => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Suggest image search keywords to visually illustrate the English word "${word}"${meaning ? ` with meaning: "${meaning}"` : ''}.

Respond in JSON format:
{
  "word": "${word}",
  "imageKeywords": [
    "keyword phrase 1",
    "keyword phrase 2",
    "keyword phrase 3"
  ],
  "visualDescription": "brief description of what type of image would best illustrate this word",
  "searchTips": "tips for finding the best images"
}

Focus on:
- Concrete, visual concepts
- Stock photo search terms
- Common visual representations
- Cultural context if relevant`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let jsonText = text;
    if (text.includes('```json')) {
      jsonText = text.match(/```json\n([\s\S]*?)\n```/)?.[1] || text;
    } else if (text.includes('```')) {
      jsonText = text.match(/```\n([\s\S]*?)\n```/)?.[1] || text;
    }

    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    throw new Error('Không thể gợi ý từ khóa hình ảnh: ' + error.message);
  }
};

/**
 * Batch analyze multiple words
 * @param {Array<string>} words - Array of words to analyze
 * @returns {Array} Array of analysis results
 */
exports.batchAnalyze = async (words) => {
  try {
    if (!words || !Array.isArray(words) || words.length === 0) {
      throw new Error('Invalid words array');
    }

    console.log(`🤖 Batch analyzing ${words.length} words...`);
    
    const results = [];
    
    // ✅ Process in batches of 3 with 2s delay (giảm từ 5 xuống 3)
    for (let i = 0; i < words.length; i += 3) {
      const batch = words.slice(i, i + 3);
      console.log(`📦 Processing batch ${Math.floor(i / 3) + 1}/${Math.ceil(words.length / 3)}: ${batch.join(', ')}`);
      
      try {
        const batchPromises = batch.map(word => 
          exports.analyzeWord(word).catch(err => {
            console.error(`❌ Error analyzing word "${word}":`, err.message);
            return {
              word,
              error: err.message,
              pronunciation: '',
              partOfSpeech: '',
              meanings: [{
                definition: word,
                translation: word,
                example: ''
              }],
              synonyms: [],
              antonyms: []
            };
          })
        );
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // ✅ Delay 2s between batches (giảm từ 1s xuống 2s)
        if (i + 3 < words.length) {
          console.log('⏳ Waiting 2s before next batch...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (batchError) {
        console.error(`❌ Batch ${Math.floor(i / 3) + 1} error:`, batchError.message);
      }
    }
    
    console.log(`✅ Batch analysis completed: ${results.length}/${words.length} words`);
    return results;
    
  } catch (error) {
    console.error('❌ Batch Analysis Error:', error.message);
    throw new Error('Không thể phân tích từ hàng loạt: ' + error.message);
  }
};

/**
 * Get collocation suggestions
 * @param {string} word - The word
 * @param {string} partOfSpeech - Part of speech
 * @returns {Array} Collocation suggestions
 */
exports.suggestCollocations = async (word, partOfSpeech = '') => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Suggest common collocations for the English word "${word}"${partOfSpeech ? ` (${partOfSpeech})` : ''}.

Respond in JSON format:
{
  "word": "${word}",
  "collocations": [
    {
      "phrase": "collocation phrase",
      "meaning": "Vietnamese meaning",
      "example": "example sentence",
      "frequency": "very common/common/less common"
    }
  ]
}

Focus on:
- Natural, frequently used combinations
- Authentic usage patterns
- Common in both speech and writing
- Provide at least 5-8 collocations`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let jsonText = text;
    if (text.includes('```json')) {
      jsonText = text.match(/```json\n([\s\S]*?)\n```/)?.[1] || text;
    } else if (text.includes('```')) {
      jsonText = text.match(/```\n([\s\S]*?)\n```/)?.[1] || text;
    }

    const data = JSON.parse(jsonText);
    return data.collocations || [];
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    throw new Error('Không thể gợi ý collocations: ' + error.message);
  }
};

/**
 * Generate vocabulary list based on topic
 * @param {string} topic - Topic or category
 * @param {string} level - CEFR level (A1-C2)
 * @param {number} count - Number of words
 * @returns {Array} List of vocabulary words
 */
exports.generateVocabularyList = async (topic, level = 'INTERMEDIATE', count = 10) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // ✅ Map level sang CEFR chuẩn
    const levelMapping = {
      'BEGINNER': 'A1-A2 (Basic)',
      'ELEMENTARY': 'A2-B1 (Elementary)',
      'INTERMEDIATE': 'B1-B2 (Intermediate)',
      'ADVANCED': 'C1 (Advanced)',
      'UPPER_ADVANCED': 'C2 (Proficiency)',
      // Support CEFR levels directly
      'A1': 'A1 (Beginner)',
      'A2': 'A2 (Elementary)',
      'B1': 'B1 (Intermediate)',
      'B2': 'B2 (Upper Intermediate)',
      'C1': 'C1 (Advanced)',
      'C2': 'C2 (Proficiency)'
    };

    const cefrLevel = levelMapping[level] || 'B1-B2 (Intermediate)';

    const prompt = `Generate EXACTLY ${count} English vocabulary words for the topic: "${topic}"
Level: ${cefrLevel}

IMPORTANT REQUIREMENTS:
- Return EXACTLY ${count} words (no more, no less)
- Words MUST match the specified level: ${cefrLevel}
  * ${level === 'BEGINNER' ? 'Use simple, common, everyday words' : ''}
  * ${level === 'INTERMEDIATE' ? 'Use practical, moderately complex words' : ''}
  * ${level === 'ADVANCED' ? 'Use sophisticated, academic, or specialized words' : ''}
- Words should be VARIED and COMPREHENSIVE
- Focus on practical, useful vocabulary for this topic
- No repetition
- Return as JSON array of strings ONLY

Example output:
["word1", "word2", "word3", ...]

DO NOT include any explanations, definitions, or other text. ONLY the JSON array.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse JSON
    let jsonText = text.trim();
    if (jsonText.includes('```')) {
      jsonText = jsonText.match(/\[[\s\S]*?\]/)?.[0] || text;
    }

    const words = JSON.parse(jsonText);

    if (!Array.isArray(words) || words.length === 0) {
      throw new Error('Invalid vocabulary list from AI');
    }

    const finalWords = words.slice(0, count);
    
    console.log(`✅ Generated ${finalWords.length} ${cefrLevel} words for "${topic}"`);
    
    return finalWords;

  } catch (error) {
    console.error('Generate vocabulary list error:', error);
    throw new Error(`Cannot generate vocabulary: ${error.message}`);
  }
};

/**
 * Generate exercises for a specific skill, level, and difficulty
 * @param {string} skill - Skill type (vocabulary, grammar, etc.)
 * @param {string} level - CEFR level (A1-C2)
 * @param {string} topic - Topic
 * @param {number} count - Number of exercises
 * @param {string} difficulty - Difficulty level (easy, medium, hard)
 * @returns {Array} List of exercises
 */
exports.generateExercises = async (skill, level, topic, count = 5, difficulty = 'medium') => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const skillPrompts = {
      vocabulary: `Generate ${count} ${difficulty} vocabulary exercises for ${level} level, topic: ${topic}. Each exercise should be a multiple-choice question testing word meaning. Make them ${difficulty === 'easy' ? 'simple and basic' : difficulty === 'medium' ? 'moderately challenging' : 'complex and advanced'}.`,
      grammar: `Generate ${count} ${difficulty} grammar exercises for ${level} level, topic: ${topic}. Each exercise should test grammar rules with ${difficulty === 'easy' ? 'simple fill-in-the-blank' : difficulty === 'medium' ? 'multiple-choice or fill-in' : 'complex sentence correction'}. Make them ${difficulty === 'easy' ? 'basic' : difficulty === 'medium' ? 'intermediate' : 'advanced'}.`,
      listening: `Generate ${count} ${difficulty} listening exercises for ${level} level, topic: ${topic}. Include audio descriptions and ${difficulty === 'easy' ? 'simple' : difficulty === 'medium' ? 'moderate' : 'advanced'} comprehension questions.`,
      reading: `Generate ${count} ${difficulty} reading comprehension exercises for ${level} level, topic: ${topic}. Include passages and ${difficulty === 'easy' ? 'basic' : difficulty === 'medium' ? 'intermediate' : 'advanced'} questions.`,
      speaking: `Generate ${count} ${difficulty} speaking exercises for ${level} level, topic: ${topic}. Include prompts for ${difficulty === 'easy' ? 'simple' : difficulty === 'medium' ? 'moderate' : 'advanced'} oral practice.`,
      writing: `Generate ${count} ${difficulty} writing exercises for ${level} level, topic: ${topic}. Include prompts for ${difficulty === 'easy' ? 'short' : difficulty === 'medium' ? 'medium-length' : 'long'} written responses.`,
      mixed: `Generate ${count} ${difficulty} mixed skill exercises for ${level} level, topic: ${topic}. Combine multiple skills. Make them ${difficulty === 'easy' ? 'simple' : difficulty === 'medium' ? 'balanced' : 'challenging'}.`
    };

    const prompt = skillPrompts[skill] || skillPrompts.mixed;
    prompt += `\n\nReturn as JSON array of exercises. Each exercise: { "question": "string", "type": "multiple_choice/fill_blank/etc", "options": ["array"], "correctAnswer": "string", "explanation": "string", "audioUrl": "optional", "imageUrl": "optional" }`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    console.log(`  🤖 Gemini raw response for ${skill} (${difficulty}):\n`, text); // Log phản hồi thô từ Gemini
    
    let jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    let exercises = [];
    try {
      exercises = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('  ❌ JSON parsing error in generateExercises:', parseError);
      console.error('  ❌ Malformed JSON from Gemini:', jsonText); // Log JSON bị lỗi
    }
    
    return Array.isArray(exercises) ? exercises.slice(0, count) : []; // Đảm bảo trả về mảng
  } catch (error) {
    console.error('Error generating exercises:', error);
    return [];
  }
};