const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Mnemonic, VisualizationSuggestion, MemoryTechnique } = require('../models/Mnemonic');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Transform and validate AI response for Mnemonic
 */
const transformMnemonicResponse = (aiData) => {
  try {
    // Validate mnemonic types
    if (aiData.mnemonicTypes && Array.isArray(aiData.mnemonicTypes)) {
      aiData.mnemonicTypes = aiData.mnemonicTypes.map(mt => ({
        ...mt,
        effectiveness: ['very high', 'high', 'moderate', 'low'].includes(mt.effectiveness) 
          ? mt.effectiveness : 'moderate',
        difficulty: ['easy', 'moderate', 'hard'].includes(mt.difficulty)
          ? mt.difficulty : 'moderate'
      }));
    }

    // Validate visualizations
    if (aiData.visualizations && Array.isArray(aiData.visualizations)) {
      aiData.visualizations = aiData.visualizations.map(vis => ({
        ...vis,
        memorabilityScore: Math.max(1, Math.min(10, vis.memorabilityScore || 7))
      }));
    }

    // Validate associations
    if (aiData.associations && Array.isArray(aiData.associations)) {
      aiData.associations = aiData.associations.map(assoc => ({
        ...assoc,
        strength: ['very strong', 'strong', 'moderate', 'weak'].includes(assoc.strength)
          ? assoc.strength : 'moderate'
      }));
    }

    // Validate stories
    if (aiData.stories && Array.isArray(aiData.stories)) {
      aiData.stories = aiData.stories.map(story => ({
        ...story,
        difficulty: ['simple', 'moderate', 'complex'].includes(story.difficulty)
          ? story.difficulty : 'moderate'
      }));
    }

    // Validate memory tips
    if (aiData.memoryTips && Array.isArray(aiData.memoryTips)) {
      aiData.memoryTips = aiData.memoryTips.filter(tip => 
        ['repetition', 'emotion', 'personalization', 'multisensory', 'timing', 'practice'].includes(tip.category)
      );
    }

    return aiData;
  } catch (error) {
    console.error('Transform mnemonic error:', error);
    return aiData;
  }
};

/**
 * Transform and validate AI response for Visualization Suggestion
 */
const transformVisualizationResponse = (aiData) => {
  try {
    // Validate practice exercises
    if (aiData.practiceExercises && Array.isArray(aiData.practiceExercises)) {
      aiData.practiceExercises = aiData.practiceExercises.map(ex => ({
        ...ex,
        difficulty: ['beginner', 'intermediate', 'advanced'].includes(ex.difficulty)
          ? ex.difficulty : 'beginner'
      }));
    }

    // Ensure visualization steps are numbered
    if (aiData.visualizationSteps && Array.isArray(aiData.visualizationSteps)) {
      aiData.visualizationSteps = aiData.visualizationSteps.map((step, idx) => ({
        ...step,
        step: step.step || (idx + 1)
      }));
    }

    return aiData;
  } catch (error) {
    console.error('Transform visualization error:', error);
    return aiData;
  }
};

/**
 * Generate comprehensive mnemonic for a word
 * Tạo mnemonic toàn diện cho một từ
 */
const generateMnemonic = async (word, wordVietnamese = '', userContext = '') => {
  try {
    // Check cache first
    const cached = await Mnemonic.findOne({ word: word.toLowerCase() });
    if (cached) {
      await cached.incrementRequestCount();
      return cached;
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `You are an expert in memory techniques and learning psychology. Generate comprehensive mnemonic strategies for learning and remembering the English word: "${word}" (Vietnamese: ${wordVietnamese || 'không rõ'}).

User context: ${userContext || 'No specific context provided'}

Provide the response in JSON format with ALL fields in BOTH English AND Vietnamese:

{
  "word": "${word}",
  "wordVietnamese": "${wordVietnamese}",
  "mnemonicTypes": [
    {
      "type": "MUST BE one of: acronym, rhyme, story, association, visual, phonetic, chunking",
      "technique": "Name of the specific technique",
      "techniqueVietnamese": "Tên kỹ thuật bằng tiếng Việt",
      "description": "Detailed description of how to use this technique",
      "descriptionVietnamese": "Mô tả chi tiết cách sử dụng kỹ thuật này",
      "example": "Concrete example for this word",
      "exampleVietnamese": "Ví dụ cụ thể cho từ này",
      "effectiveness": "MUST BE one of: very high, high, moderate, low",
      "difficulty": "MUST BE one of: easy, moderate, hard"
    }
  ],
  "visualizations": [
    {
      "type": "MUST BE one of: mental image, scene, action, symbol, color association, spatial",
      "description": "What to visualize",
      "descriptionVietnamese": "Cần hình dung gì",
      "imageDescription": "Detailed visual description",
      "imageDescriptionVietnamese": "Mô tả hình ảnh chi tiết",
      "keyElements": ["element1", "element2"],
      "keyElementsVietnamese": ["yếu tố 1", "yếu tố 2"],
      "emotionalConnection": {
        "emotion": "The emotion to connect",
        "emotionVietnamese": "Cảm xúc để kết nối",
        "reason": "Why this emotion helps",
        "reasonVietnamese": "Tại sao cảm xúc này giúp ích"
      },
      "memorabilityScore": 7
    }
  ],
  "spatialTechniques": [
    {
      "location": "A familiar place",
      "locationVietnamese": "Một địa điểm quen thuộc",
      "placement": "Where to place the word mentally",
      "placementVietnamese": "Vị trí đặt từ trong tâm trí",
      "interaction": "How to interact with it",
      "interactionVietnamese": "Cách tương tác với nó",
      "visualization": "The mental image",
      "visualizationVietnamese": "Hình ảnh tâm trí"
    }
  ],
  "associations": [
    {
      "associationType": "MUST BE one of: sound, meaning, personal experience, cultural reference, similar word, opposite",
      "connection": "What to connect with",
      "connectionVietnamese": "Kết nối với cái gì",
      "explanation": "Why this connection works",
      "explanationVietnamese": "Tại sao kết nối này hiệu quả",
      "strength": "MUST BE one of: very strong, strong, moderate, weak"
    }
  ],
  "stories": [
    {
      "title": "Story title",
      "titleVietnamese": "Tiêu đề câu chuyện",
      "story": "The complete story incorporating the word",
      "storyVietnamese": "Câu chuyện hoàn chỉnh bao gồm từ vựng",
      "keyWords": ["word1", "word2"],
      "keyWordsVietnamese": ["từ 1", "từ 2"],
      "moralOrLesson": "The takeaway",
      "moralOrLessonVietnamese": "Bài học rút ra",
      "difficulty": "MUST BE one of: simple, moderate, complex"
    }
  ],
  "phoneticTechniques": [
    {
      "soundPattern": "The sound pattern",
      "similarSoundingWord": "A similar sounding word",
      "similarSoundingWordVietnamese": "Từ phát âm tương tự",
      "rhyme": "A rhyme to remember",
      "rhymeVietnamese": "Vần điệu để nhớ",
      "explanation": "How the sound helps",
      "explanationVietnamese": "Cách âm thanh giúp ghi nhớ"
    }
  ],
  "chunkingMethods": [
    {
      "method": "Chunking method name",
      "methodVietnamese": "Tên phương pháp chia nhỏ",
      "breakdown": "How to break down the word",
      "breakdownVietnamese": "Cách chia nhỏ từ",
      "explanation": "Why this helps",
      "explanationVietnamese": "Tại sao điều này giúp ích",
      "example": "Example application",
      "exampleVietnamese": "Ví dụ áp dụng"
    }
  ],
  "memoryTips": [
    {
      "tip": "Practical memory tip",
      "tipVietnamese": "Mẹo ghi nhớ thực tế",
      "category": "MUST BE one of: repetition, emotion, personalization, multisensory, timing, practice",
      "effectiveness": "Why this tip works",
      "effectivenessVietnamese": "Tại sao mẹo này hiệu quả"
    }
  ],
  "recallStrategies": [
    {
      "strategy": "Strategy name",
      "strategyVietnamese": "Tên chiến lược",
      "whenToUse": "When to apply this",
      "whenToUseVietnamese": "Khi nào áp dụng",
      "steps": ["step1", "step2"],
      "stepsVietnamese": ["bước 1", "bước 2"]
    }
  ],
  "reviewSchedule": {
    "immediate": "Review immediately after learning",
    "immediateVietnamese": "Ôn ngay sau khi học",
    "after1Hour": "Review after 1 hour",
    "after1HourVietnamese": "Ôn sau 1 giờ",
    "after1Day": "Review after 1 day",
    "after1DayVietnamese": "Ôn sau 1 ngày",
    "after1Week": "Review after 1 week",
    "after1WeekVietnamese": "Ôn sau 1 tuần",
    "after1Month": "Review after 1 month",
    "after1MonthVietnamese": "Ôn sau 1 tháng",
    "reasoning": "Why this schedule works",
    "reasoningVietnamese": "Tại sao lịch này hiệu quả"
  }
}

IMPORTANT REQUIREMENTS:
1. Provide at least 3-5 different mnemonic types
2. Include at least 2-3 visualization suggestions
3. ALL text fields MUST have both English and Vietnamese versions
4. Make mnemonics creative, memorable, and culturally appropriate
5. Consider Vietnamese learners' perspective
6. Use vivid, sensory-rich descriptions
7. Provide practical, actionable techniques
8. Include personal connection opportunities

Return ONLY the JSON object, no additional text.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }
    
    let aiData = JSON.parse(jsonMatch[0]);
    aiData = transformMnemonicResponse(aiData);
    
    // Save to database
    const mnemonic = new Mnemonic({
      ...aiData,
      aiModel: 'gemini-2.5-flash'
    });
    
    await mnemonic.save();
    return mnemonic;
    
  } catch (error) {
    console.error('Generate mnemonic error:', error);
    throw error;
  }
};

/**
 * Generate detailed visualization suggestion
 * Tạo gợi ý hình ảnh hóa chi tiết
 */
const generateVisualization = async (word, wordVietnamese = '', visualizationType = 'scene') => {
  try {
    // Check cache
    const cached = await VisualizationSuggestion.findOne({ word: word.toLowerCase() });
    if (cached) {
      cached.requestCount += 1;
      await cached.save();
      return cached;
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `You are an expert in visualization techniques and memory psychology. Generate a comprehensive, detailed visualization strategy for learning the English word: "${word}" (Vietnamese: ${wordVietnamese || 'không rõ'}).

Focus on creating a vivid, multi-sensory mental image that engages all senses and emotions.

Provide the response in JSON format with ALL fields in BOTH English AND Vietnamese:

{
  "word": "${word}",
  "wordVietnamese": "${wordVietnamese}",
  "mainVisualization": {
    "scene": "A vivid, memorable scene",
    "sceneVietnamese": "Một cảnh tượng sống động, đáng nhớ",
    "detailedDescription": "Rich, sensory description of the scene (200+ words)",
    "detailedDescriptionVietnamese": "Mô tả chi tiết, giàu cảm giác về cảnh tượng (200+ từ)",
    "keyElements": [
      {
        "element": "Key visual element",
        "elementVietnamese": "Yếu tố hình ảnh chính",
        "role": "Its role in the scene",
        "roleVietnamese": "Vai trò của nó trong cảnh",
        "visualDetails": "Specific visual characteristics",
        "visualDetailsVietnamese": "Đặc điểm hình ảnh cụ thể"
      }
    ],
    "colors": [
      {
        "color": "Color name",
        "meaning": "What this color represents",
        "meaningVietnamese": "Màu này đại diện cho gì"
      }
    ],
    "movements": [
      {
        "action": "Movement or action",
        "actionVietnamese": "Chuyển động hoặc hành động",
        "purpose": "Why this movement matters",
        "purposeVietnamese": "Tại sao chuyển động này quan trọng"
      }
    ],
    "emotions": [
      {
        "emotion": "Emotion involved",
        "emotionVietnamese": "Cảm xúc liên quan",
        "intensity": "How strong",
        "trigger": "What triggers this emotion",
        "triggerVietnamese": "Điều gì gây ra cảm xúc này"
      }
    ]
  },
  "sensoryDetails": {
    "visual": {
      "description": "What you see",
      "descriptionVietnamese": "Những gì bạn thấy",
      "focus": ["focus1", "focus2"],
      "focusVietnamese": ["điểm tập trung 1", "điểm tập trung 2"]
    },
    "auditory": {
      "sounds": ["sound1", "sound2"],
      "soundsVietnamese": ["âm thanh 1", "âm thanh 2"],
      "description": "What you hear",
      "descriptionVietnamese": "Những gì bạn nghe"
    },
    "tactile": {
      "textures": ["texture1", "texture2"],
      "texturesVietnamese": ["kết cấu 1", "kết cấu 2"],
      "description": "What you feel/touch",
      "descriptionVietnamese": "Những gì bạn cảm nhận/chạm vào"
    },
    "olfactory": {
      "smells": ["smell1", "smell2"],
      "smellsVietnamese": ["mùi 1", "mùi 2"],
      "description": "What you smell",
      "descriptionVietnamese": "Những gì bạn ngửi"
    },
    "kinesthetic": {
      "movements": ["movement1", "movement2"],
      "movementsVietnamese": ["chuyển động 1", "chuyển động 2"],
      "description": "Body sensations and movements",
      "descriptionVietnamese": "Cảm giác và chuyển động cơ thể"
    }
  },
  "visualizationSteps": [
    {
      "step": 1,
      "instruction": "Step-by-step instruction",
      "instructionVietnamese": "Hướng dẫn từng bước",
      "duration": "How long to spend",
      "focus": "What to focus on",
      "focusVietnamese": "Tập trung vào gì"
    }
  ],
  "personalizationTips": [
    {
      "tip": "How to make it personal",
      "tipVietnamese": "Cách cá nhân hóa",
      "example": "Personalization example",
      "exampleVietnamese": "Ví dụ cá nhân hóa"
    }
  ],
  "practiceExercises": [
    {
      "exercise": "Practice exercise",
      "exerciseVietnamese": "Bài tập thực hành",
      "difficulty": "MUST BE one of: beginner, intermediate, advanced",
      "duration": "Time needed",
      "expectedOutcome": "What you'll achieve",
      "expectedOutcomeVietnamese": "Những gì bạn sẽ đạt được"
    }
  ]
}

IMPORTANT REQUIREMENTS:
1. Create VIVID, SENSORY-RICH descriptions
2. Engage ALL five senses
3. Include emotional connections
4. Make it personally relatable
5. Provide step-by-step guidance
6. ALL text MUST be in BOTH English AND Vietnamese
7. Use culturally appropriate imagery for Vietnamese learners
8. Make visualizations unusual, exaggerated, or humorous for better retention

Return ONLY the JSON object, no additional text.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }
    
    let aiData = JSON.parse(jsonMatch[0]);
    aiData = transformVisualizationResponse(aiData);
    
    const visualization = new VisualizationSuggestion({
      ...aiData,
      aiModel: 'gemini-2.5-flash'
    });
    
    await visualization.save();
    return visualization;
    
  } catch (error) {
    console.error('Generate visualization error:', error);
    throw error;
  }
};

/**
 * Get memory techniques for specific word types
 * Lấy kỹ thuật ghi nhớ cho các loại từ cụ thể
 */
const getMemoryTechniques = async (wordType, difficulty = 'moderate') => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `You are an expert in memory techniques. Provide 3-5 specific memory techniques best suited for learning ${wordType} words with ${difficulty} difficulty level.

Provide response in JSON format with BOTH English AND Vietnamese:

{
  "techniques": [
    {
      "techniqueName": "Technique name",
      "techniqueNameVietnamese": "Tên kỹ thuật",
      "category": "MUST BE one of: mnemonic, visualization, spatial, association, story, phonetic, chunking, multisensory",
      "description": "Detailed description",
      "descriptionVietnamese": "Mô tả chi tiết",
      "bestFor": [
        {
          "wordType": "Type of words",
          "wordTypeVietnamese": "Loại từ",
          "reason": "Why it works",
          "reasonVietnamese": "Tại sao hiệu quả"
        }
      ],
      "steps": [
        {
          "step": 1,
          "instruction": "Step instruction",
          "instructionVietnamese": "Hướng dẫn bước",
          "example": "Example",
          "exampleVietnamese": "Ví dụ"
        }
      ],
      "advantages": [
        {
          "advantage": "Advantage",
          "advantageVietnamese": "Ưu điểm"
        }
      ],
      "disadvantages": [
        {
          "disadvantage": "Disadvantage",
          "disadvantageVietnamese": "Nhược điểm"
        }
      ],
      "examples": [
        {
          "word": "Example word",
          "wordVietnamese": "Từ ví dụ",
          "application": "How to apply",
          "applicationVietnamese": "Cách áp dụng",
          "result": "Expected result",
          "resultVietnamese": "Kết quả mong đợi"
        }
      ],
      "difficulty": "MUST BE one of: easy, moderate, hard",
      "effectiveness": "MUST BE one of: very high, high, moderate, low"
    }
  ]
}

Return ONLY the JSON object.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }
    
    const aiData = JSON.parse(jsonMatch[0]);
    return aiData.techniques;
    
  } catch (error) {
    console.error('Get memory techniques error:', error);
    throw error;
  }
};

/**
 * Generate story-based mnemonic
 * Tạo mnemonic dựa trên câu chuyện
 */
const generateStoryMnemonic = async (words, theme = '') => {
  try {
    if (!Array.isArray(words) || words.length === 0) {
      throw new Error('Words array is required');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const wordsString = words.map(w => `"${w.word}" (${w.wordVietnamese || 'no translation'})`).join(', ');
    
    const prompt = `You are a creative storyteller and memory expert. Create an engaging, memorable story that naturally incorporates these English words: ${wordsString}

Theme: ${theme || 'Any appropriate theme'}

Create a story that is:
1. Memorable and engaging
2. Incorporates each word naturally
3. Has a clear narrative arc
4. Uses vivid imagery
5. Includes emotions and sensory details
6. Is culturally appropriate for Vietnamese learners

Provide response in JSON format with BOTH English AND Vietnamese:

{
  "story": {
    "title": "Story title",
    "titleVietnamese": "Tiêu đề câu chuyện",
    "theme": "Story theme",
    "themeVietnamese": "Chủ đề",
    "fullStory": "Complete story (300+ words)",
    "fullStoryVietnamese": "Câu chuyện đầy đủ (300+ từ)",
    "moralOrLesson": "Story moral/lesson",
    "moralOrLessonVietnamese": "Bài học",
    "difficulty": "MUST BE one of: simple, moderate, complex",
    "wordIntegrations": [
      {
        "word": "The word",
        "wordVietnamese": "Từ",
        "howUsed": "How it's integrated in the story",
        "howUsedVietnamese": "Cách tích hợp trong câu chuyện",
        "context": "Context in the story",
        "contextVietnamese": "Ngữ cảnh trong câu chuyện"
      }
    ],
    "keyScenes": [
      {
        "scene": "Scene description",
        "sceneVietnamese": "Mô tả cảnh",
        "wordsInScene": ["word1", "word2"],
        "significance": "Why this scene is important",
        "significanceVietnamese": "Tại sao cảnh này quan trọng"
      }
    ],
    "recallTriggers": [
      {
        "trigger": "Memory trigger",
        "triggerVietnamese": "Kích hoạt ghi nhớ",
        "associatedWords": ["word1", "word2"]
      }
    ]
  }
}

Return ONLY the JSON object.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }
    
    const aiData = JSON.parse(jsonMatch[0]);
    return aiData.story;
    
  } catch (error) {
    console.error('Generate story mnemonic error:', error);
    throw error;
  }
};

/**
 * Generate association chain for a word
 * Tạo chuỗi liên tưởng cho một từ
 */
const generateAssociationChain = async (word, wordVietnamese = '', depth = 5) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `You are an expert in memory associations and cognitive psychology. Create a chain of ${depth} powerful associations to help remember the English word: "${word}" (Vietnamese: ${wordVietnamese || 'không rõ'}).

Each association should link to the next, creating a memorable chain from the word to something highly personal and memorable.

Provide response in JSON format with BOTH English AND Vietnamese:

{
  "word": "${word}",
  "wordVietnamese": "${wordVietnamese}",
  "associationChain": [
    {
      "level": 1,
      "association": "First association",
      "associationVietnamese": "Liên tưởng đầu tiên",
      "associationType": "MUST BE one of: sound, meaning, personal experience, cultural reference, similar word, opposite",
      "connection": "Why this association",
      "connectionVietnamese": "Tại sao liên tưởng này",
      "visualCue": "Visual representation",
      "visualCueVietnamese": "Tín hiệu hình ảnh",
      "emotionalImpact": "Emotional connection",
      "emotionalImpactVietnamese": "Tác động cảm xúc",
      "strength": "MUST BE one of: very strong, strong, moderate, weak"
    }
  ],
  "chainSummary": {
    "description": "How the chain works",
    "descriptionVietnamese": "Chuỗi hoạt động như thế nào",
    "keyStrength": "Main strength of this chain",
    "keyStrengthVietnamese": "Điểm mạnh chính",
    "recallTips": [
      {
        "tip": "Tip for recall",
        "tipVietnamese": "Mẹo để nhớ lại"
      }
    ]
  }
}

REQUIREMENTS:
1. Each association should be STRONG and MEMORABLE
2. Progress from the word to increasingly personal/emotional connections
3. Use culturally relevant references for Vietnamese learners
4. Include sensory and emotional elements
5. Make it vivid and specific

Return ONLY the JSON object.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }
    
    const aiData = JSON.parse(jsonMatch[0]);
    return aiData;
    
  } catch (error) {
    console.error('Generate association chain error:', error);
    throw error;
  }
};

/**
 * Generate phonetic mnemonic
 * Tạo mnemonic dựa trên phát âm
 */
const generatePhoneticMnemonic = async (word, wordVietnamese = '') => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `You are an expert in phonetics and language learning. Create phonetic-based mnemonics for the English word: "${word}" (Vietnamese: ${wordVietnamese || 'không rõ'}).

Focus on:
1. Similar sounds in Vietnamese or English
2. Rhymes and alliteration
3. Sound patterns
4. Memorable phrases using similar sounds

Provide response in JSON format with BOTH English AND Vietnamese:

{
  "word": "${word}",
  "wordVietnamese": "${wordVietnamese}",
  "phoneticBreakdown": {
    "pronunciation": "IPA or simplified pronunciation",
    "syllables": ["syl", "la", "bles"],
    "stressPattern": "Stress pattern",
    "stressPatternVietnamese": "Mẫu nhấn"
  },
  "soundAssociations": [
    {
      "soundPattern": "The sound pattern",
      "similarSoundingWord": "Similar word in English",
      "similarSoundingWordVietnamese": "Từ tiếng Việt phát âm tương tự",
      "rhyme": "A rhyme using the word",
      "rhymeVietnamese": "Vần điệu sử dụng từ",
      "explanation": "How the sound helps",
      "explanationVietnamese": "Cách âm thanh giúp ghi nhớ",
      "example": "Example usage",
      "exampleVietnamese": "Ví dụ sử dụng"
    }
  ],
  "mnemonicPhrases": [
    {
      "phrase": "Memorable phrase",
      "phraseVietnamese": "Cụm từ dễ nhớ",
      "howItHelps": "Why it works",
      "howItHelpsVietnamese": "Tại sao hiệu quả"
    }
  ]
}

Return ONLY the JSON object.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }
    
    const aiData = JSON.parse(jsonMatch[0]);
    return aiData;
    
  } catch (error) {
    console.error('Generate phonetic mnemonic error:', error);
    throw error;
  }
};

/**
 * Rate a mnemonic
 * Đánh giá mnemonic
 */
const rateMnemonic = async (mnemonicId, userId, rating, mnemonicType = '', feedback = '') => {
  try {
    const mnemonic = await Mnemonic.findById(mnemonicId);
    if (!mnemonic) {
      throw new Error('Mnemonic not found');
    }

    await mnemonic.addRating(userId, rating, mnemonicType, feedback);
    return mnemonic;
    
  } catch (error) {
    console.error('Rate mnemonic error:', error);
    throw error;
  }
};

/**
 * Provide feedback on visualization
 * Cung cấp phản hồi về hình ảnh hóa
 */
const feedbackVisualization = async (visualizationId, userId, isHelpful, comment = '') => {
  try {
    const visualization = await VisualizationSuggestion.findById(visualizationId);
    if (!visualization) {
      throw new Error('Visualization not found');
    }

    if (isHelpful) {
      visualization.helpfulCount += 1;
    } else {
      visualization.notHelpfulCount += 1;
    }

    visualization.feedback.push({
      user: userId,
      isHelpful,
      comment
    });

    await visualization.save();
    return visualization;
    
  } catch (error) {
    console.error('Feedback visualization error:', error);
    throw error;
  }
};

/**
 * Get cached mnemonic
 * Lấy mnemonic đã lưu
 */
const getCachedMnemonic = async (word) => {
  try {
    const mnemonic = await Mnemonic.findOne({ word: word.toLowerCase() });
    if (mnemonic) {
      await mnemonic.incrementRequestCount();
    }
    return mnemonic;
  } catch (error) {
    console.error('Get cached mnemonic error:', error);
    throw error;
  }
};

/**
 * Get cached visualization
 * Lấy hình ảnh hóa đã lưu
 */
const getCachedVisualization = async (word) => {
  try {
    const visualization = await VisualizationSuggestion.findOne({ word: word.toLowerCase() });
    if (visualization) {
      visualization.requestCount += 1;
      await visualization.save();
    }
    return visualization;
  } catch (error) {
    console.error('Get cached visualization error:', error);
    throw error;
  }
};

/**
 * Clear expired cache
 * Xóa cache hết hạn
 */
const clearExpiredCache = async () => {
  try {
    const now = new Date();
    
    const mnemonicResult = await Mnemonic.deleteMany({ expiresAt: { $lt: now } });
    const visualizationResult = await VisualizationSuggestion.deleteMany({ expiresAt: { $lt: now } });
    
    return {
      mnemonicsDeleted: mnemonicResult.deletedCount,
      visualizationsDeleted: visualizationResult.deletedCount
    };
  } catch (error) {
    console.error('Clear expired cache error:', error);
    throw error;
  }
};

module.exports = {
  generateMnemonic,
  generateVisualization,
  getMemoryTechniques,
  generateStoryMnemonic,
  generateAssociationChain,
  generatePhoneticMnemonic,
  rateMnemonic,
  feedbackVisualization,
  getCachedMnemonic,
  getCachedVisualization,
  clearExpiredCache
};
