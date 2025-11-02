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

    const prompt = `Analyze the English word/phrase: "${word}"${context ? ` in context: "${context}"` : ''}

Please provide a comprehensive analysis in JSON format with the following structure:

{
  "word": "${word}",
  "pronunciation": "IPA phonetic transcription",
  "partOfSpeech": "noun/verb/adjective/adverb/etc",
  "isPolysemous": true/false,
  "meanings": [
    {
      "definition": "clear definition in English",
      "example": "natural example sentence using the word",
      "translation": "Vietnamese translation"
    }
  ],
  "synonyms": [
    { "word": "synonym", "note": "usage note if applicable" }
  ],
  "antonyms": [
    { "word": "antonym", "note": "usage note if applicable" }
  ],
  "collocations": [
    {
      "phrase": "common phrase with the word",
      "meaning": "Vietnamese meaning",
      "example": "example sentence"
    }
  ],
  "usageNotes": "important usage notes, common mistakes, or context information",
  "grammarNotes": "grammatical information (irregular forms, countable/uncountable, etc)",
  "tags": ["relevant", "topic", "tags"],
  "difficulty": "beginner/elementary/intermediate/upper-intermediate/advanced",
  "cefrLevel": "A1/A2/B1/B2/C1/C2"
}

Important:
- Provide at least 2-3 meanings if the word is polysemous
- Include natural, conversational example sentences
- Focus on common, practical usage
- Use authentic collocations
- Provide accurate IPA pronunciation
- Be concise but comprehensive`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response (handle code blocks)
    let jsonText = text;
    if (text.includes('```json')) {
      jsonText = text.match(/```json\n([\s\S]*?)\n```/)?.[1] || text;
    } else if (text.includes('```')) {
      jsonText = text.match(/```\n([\s\S]*?)\n```/)?.[1] || text;
    }

    const data = JSON.parse(jsonText);
    return data;
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    throw new Error('Không thể phân tích từ với AI: ' + error.message);
  }
};

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
    const results = [];
    
    // Process in batches of 5 to avoid rate limits
    for (let i = 0; i < words.length; i += 5) {
      const batch = words.slice(i, i + 5);
      const batchPromises = batch.map(word => exports.analyzeWord(word));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Small delay between batches
      if (i + 5 < words.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  } catch (error) {
    console.error('Batch Analysis Error:', error.message);
    throw new Error('Không thể phân tích hàng loạt: ' + error.message);
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
