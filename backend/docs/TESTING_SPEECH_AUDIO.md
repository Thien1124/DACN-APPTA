# Testing Speech Recognition with Sample Audio

## Cách 1: Sử dụng Google Text-to-Speech (Recommended)

### Bước 1: Cài đặt dependencies
```bash
npm install @google-cloud/text-to-speech
```

### Bước 2: Tạo audio samples
```bash
node scripts/generateSampleAudio.js
```

Kết quả:
- `uploads/samples/beautiful_90pct.webm` - Audio file
- `uploads/samples/beautiful_90pct.json` - Metadata

---

## Cách 2: Sử dụng Online TTS Tools

### Google Translate TTS
1. Truy cập: https://translate.google.com/?sl=en&tl=vi&text=beautiful&op=translate
2. Click icon speaker 🔊
3. Mở Developer Tools (F12)
4. Tab Network → tìm request có `translate_tts`
5. Copy URL của audio file
6. Download: 
   ```bash
   curl "URL" -o beautiful_sample.mp3
   ```

### ResponsiveVoice
1. Truy cập: https://responsivevoice.org/text-to-speech-demo/
2. Nhập text: "beautiful"
3. Chọn voice: "US English Female"
4. Click "Play" → Recording bằng phần mềm

### Natural Readers
1. Truy cập: https://www.naturalreaders.com/online/
2. Paste text: "beautiful"
3. Click "Play" và record

---

## Cách 3: Record Yourself (Best for testing)

### Windows
```powershell
# Sử dụng Windows Voice Recorder
# 1. Mở Voice Recorder app
# 2. Click Record
# 3. Nói: "beautiful"
# 4. Stop và Save as beautiful_sample.mp3
```

### Web Browser (Online Recorder)
1. Truy cập: https://online-voice-recorder.com/
2. Click "Record"
3. Nói: "beautiful"
4. Click "Stop" → "Download"
5. Save as: `beautiful_sample.webm`

---

## Cách 4: Sử dụng Web Speech API (Browser)

Tạo file HTML để record:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Speech Recorder</title>
</head>
<body>
  <h1>Record: "beautiful"</h1>
  <button id="record">🎤 Start Recording</button>
  <button id="stop">⏹ Stop</button>
  <audio id="audio" controls></audio>
  <a id="download" download="beautiful_sample.webm">📥 Download</a>

  <script>
    let mediaRecorder;
    let chunks = [];

    document.getElementById('record').onclick = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        document.getElementById('audio').src = url;
        document.getElementById('download').href = url;
        chunks = [];
      };

      mediaRecorder.start();
      console.log('Recording started...');
    };

    document.getElementById('stop').onclick = () => {
      mediaRecorder.stop();
      console.log('Recording stopped');
    };
  </script>
</body>
</html>
```

---

## Test với Postman

### Bước 1: Prepare Audio File
Sau khi có file audio (`beautiful_sample.webm` hoặc `.mp3`), đặt vào folder:
```
backend/uploads/samples/beautiful_sample.webm
```

### Bước 2: Setup Postman Request

**Method**: POST  
**URL**: `http://localhost:1124/api/speech/analyze/:flashcardId`

**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Body** (form-data):
| Key | Type | Value |
|-----|------|-------|
| audio | File | beautiful_sample.webm |
| language | Text | en-US |

### Bước 3: Send Request

**Expected Response (90% accuracy)**:
```json
{
  "success": true,
  "data": {
    "attempt": {
      "_id": "...",
      "pronunciationScore": 90,
      "fluencyScore": 88,
      "accuracyScore": 92,
      "completenessScore": 95,
      "passed": true,
      "transcription": "beautiful",
      "confidence": 0.94,
      "overallFeedback": "Great job! Your pronunciation is very good.",
      "detailedFeedback": [
        "✅ Excellent stress on first syllable",
        "✅ Clear vowel sounds",
        "💡 Final 'l' could be stronger"
      ],
      "wordAnalysis": [...],
      "intonation": {...},
      "userAudioUrl": "/uploads/speech/speech_USER_ID_TIMESTAMP.webm"
    }
  }
}
```

---

## Test với cURL (Windows PowerShell)

```powershell
$token = "YOUR_JWT_TOKEN"
$flashcardId = "FLASHCARD_ID"
$audioFile = "C:\path\to\beautiful_sample.webm"

$uri = "http://localhost:1124/api/speech/analyze/$flashcardId"
$headers = @{ Authorization = "Bearer $token" }

# Upload file
Invoke-WebRequest -Uri $uri -Method POST -Headers $headers `
  -Form @{
    audio = Get-Item $audioFile
    language = "en-US"
  }
```

---

## Mock Testing (Không cần audio thật)

Nếu chưa có audio, sử dụng mock data trong `beautiful_90pct.json`:

```javascript
// In your test file
const mockResult = require('./uploads/samples/beautiful_90pct.json');

// Simulate speech analysis
const result = {
  success: true,
  data: {
    attempt: mockResult.mockAnalysisResult
  }
};

console.log('Mock Result:', result);
```

---

## Troubleshooting

### Lỗi: "Invalid audio format"
- **Solution**: Convert sang WebM/MP3
- Tool: https://cloudconvert.com/webm-converter

### Lỗi: "Audio file too large"
- **Solution**: Compress audio
- Max size: 10MB
- Recommended: < 1MB for quick upload

### Lỗi: "Speech API error"
- **Solution**: Check Google Cloud quota
- Alternative: Use mock testing

### Lỗi: "Microphone permission denied"
- **Solution**: Allow microphone access in browser
- Chrome: chrome://settings/content/microphone

---

## Best Practices

1. **Audio Quality**:
   - Sample rate: 16kHz minimum
   - Format: WebM (Opus codec) or MP3
   - Duration: 1-5 seconds per word
   - No background noise

2. **Testing Variations**:
   - Perfect pronunciation (100%)
   - Good pronunciation (90%)
   - Moderate pronunciation (70%)
   - Poor pronunciation (50%)

3. **Multiple Accents**:
   - US English
   - UK English
   - Australian English
   - Non-native speakers

4. **Edge Cases**:
   - Very fast speech
   - Very slow speech
   - Whispered speech
   - Shouted speech

---

## Sample Test Suite

```javascript
const testCases = [
  {
    word: 'beautiful',
    audioFile: 'beautiful_90pct.webm',
    expectedScore: { min: 85, max: 95 },
    expectedTranscription: 'beautiful'
  },
  {
    word: 'beautiful',
    audioFile: 'beautiful_70pct.webm',
    expectedScore: { min: 65, max: 75 },
    expectedTranscription: 'byootiful'
  },
  {
    word: 'beautiful',
    audioFile: 'beautiful_100pct.webm',
    expectedScore: { min: 95, max: 100 },
    expectedTranscription: 'beautiful'
  }
];

// Run tests
for (const test of testCases) {
  const result = await testSpeechRecognition(test);
  console.log(`${test.word}: ${result.score}% (expected ${test.expectedScore.min}-${test.expectedScore.max}%)`);
}
```

---

## Quick Start Checklist

- [ ] Cài đặt @google-cloud/text-to-speech (nếu dùng TTS)
- [ ] Chạy `node scripts/generateSampleAudio.js`
- [ ] Hoặc download audio từ online tools
- [ ] Hoặc record yourself
- [ ] Đặt file vào `uploads/samples/`
- [ ] Test với Postman/cURL
- [ ] Verify response matches expected format
- [ ] Check pronunciation score accuracy

---

**Ready to test!** 🎤✨
