/**
 * Script to generate sample audio files for testing
 * Uses Google Text-to-Speech API or Web Speech API
 */

const fs = require('fs');
const path = require('path');

// Sample words for testing
const sampleWords = [
  { word: 'beautiful', ipa: '/ˈbjuːtɪfl/', difficulty: 'medium' },
  { word: 'hello', ipa: '/həˈloʊ/', difficulty: 'easy' },
  { word: 'pronunciation', ipa: '/prəˌnʌnsiˈeɪʃən/', difficulty: 'hard' },
  { word: 'example', ipa: '/ɪɡˈzæmpəl/', difficulty: 'easy' },
  { word: 'necessary', ipa: '/ˈnesəseri/', difficulty: 'medium' }
];

/**
 * Generate sample audio using Google TTS (requires API key)
 */
async function generateAudioWithGoogleTTS(text, outputPath) {
  try {
    // Note: This requires @google-cloud/text-to-speech package
    // npm install @google-cloud/text-to-speech
    
    const textToSpeech = require('@google-cloud/text-to-speech');
    const client = new textToSpeech.TextToSpeechClient();

    const request = {
      input: { text },
      voice: {
        languageCode: 'en-US',
        ssmlGender: 'FEMALE',
        name: 'en-US-Neural2-F' // High quality voice
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 0.9, // Slightly slower for clarity
        pitch: 0.0
      }
    };

    const [response] = await client.synthesizeSpeech(request);
    
    await fs.promises.writeFile(outputPath, response.audioContent, 'binary');
    console.log(`✅ Audio saved to: ${outputPath}`);
    
    return outputPath;
  } catch (error) {
    console.error('❌ Error generating audio:', error.message);
    return null;
  }
}

/**
 * Create mock audio file for testing (silent audio)
 */
async function createMockAudioFile(word, outputPath) {
  // Create a minimal valid WebM audio file (silent, ~1 second)
  // This is for testing purposes only
  const mockWebMData = Buffer.from([
    0x1a, 0x45, 0xdf, 0xa3, 0x01, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x1f, 0x42, 0x86, 0x81, 0x01,
    0x42, 0xf7, 0x81, 0x01, 0x42, 0xf2, 0x81, 0x04,
    0x42, 0xf3, 0x81, 0x08, 0x42, 0x82, 0x88, 0x77,
    0x65, 0x62, 0x6d, 0x42, 0x87, 0x81, 0x04, 0x42,
    0x85, 0x81, 0x02
  ]);

  await fs.promises.writeFile(outputPath, mockWebMData);
  console.log(`✅ Mock audio created: ${outputPath}`);
  
  return outputPath;
}

/**
 * Generate sample recording with expected accuracy
 */
async function generateSampleRecording(word, targetAccuracy = 90) {
  const outputDir = path.join(__dirname, '../uploads/samples');
  await fs.promises.mkdir(outputDir, { recursive: true });
  
  const filename = `${word}_${targetAccuracy}pct.webm`;
  const outputPath = path.join(outputDir, filename);

  // Try Google TTS first, fallback to mock
  let audioPath = await generateAudioWithGoogleTTS(word, outputPath);
  
  if (!audioPath) {
    console.log('⚠️  Google TTS not available, creating mock audio...');
    audioPath = await createMockAudioFile(word, outputPath);
  }

  // Create metadata file
  const metadata = {
    word,
    targetAccuracy,
    expectedTranscription: word,
    audioFile: filename,
    createdAt: new Date().toISOString(),
    notes: `Sample audio for testing ${targetAccuracy}% accuracy pronunciation`
  };

  const metadataPath = path.join(outputDir, `${word}_${targetAccuracy}pct.json`);
  await fs.promises.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  console.log(`✅ Metadata saved: ${metadataPath}`);

  return { audioPath, metadata };
}

/**
 * Main function
 */
async function main() {
  console.log('🎤 Generating sample audio files...\n');

  // Generate "beautiful" with 90% accuracy
  console.log('--- Generating: beautiful (90% accuracy) ---');
  const beautiful90 = await generateSampleRecording('beautiful', 90);
  
  // Generate more samples with different accuracies
  console.log('\n--- Generating: beautiful (70% accuracy) ---');
  const beautiful70 = await generateSampleRecording('beautiful', 70);
  
  console.log('\n--- Generating: beautiful (100% accuracy) ---');
  const beautiful100 = await generateSampleRecording('beautiful', 100);

  console.log('\n✅ All sample files generated!');
  console.log('\n📁 Location: backend/uploads/samples/');
  console.log('\n📋 Usage:');
  console.log('   - Use these files to test speech recognition endpoints');
  console.log('   - Upload via Postman: POST /api/speech/analyze/:flashcardId');
  console.log('   - Form-data: audio = @beautiful_90pct.webm');
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  generateAudioWithGoogleTTS,
  createMockAudioFile,
  generateSampleRecording
};
