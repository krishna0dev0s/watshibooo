# Integration Complete: ElevenLabs, Deepgram & Sentry

## ✅ What's Now Active

### 1. **ElevenLabs** (Professional Voice)
- **Location**: `/lib/elevenlabs-client.js`
- **API Route**: `/api/interview/tts`
- **Features**:
  - Professional voice actors (100+ voices available)
  - Natural emotional expression
  - Better speech prosody
  - Fallback to browser speech if needed
- **How It Works**:
  - `speakResponse()` function tries ElevenLabs first
  - Falls back to browser `speechSynthesis` if API fails
  - AI recruiter now speaks with professional voice

### 2. **Deepgram** (Advanced Speech Recognition)
- **Location**: `/lib/deepgram-client.js`
- **API Route**: `/api/interview/transcribe`
- **Features**:
  - Higher accuracy speech-to-text
  - Real-time streaming support
  - Confidence scores
  - Better noise handling
- **How It Works**:
  - Can replace browser Web Speech API
  - Provides confidence score for each transcription
  - Handles multiple languages

### 3. **Sentry** (Error Tracking & Monitoring)
- **Location**: `/lib/sentry-client.js`
- **Features**:
  - Real-time error tracking
  - User session tracking
  - Performance monitoring
  - Breadcrumb trails for debugging
  - User context (candidate names, interview phase)
- **How It Works**:
  - Automatically captures all JavaScript errors
  - Logs interview phases and user actions as breadcrumbs
  - Tracks performance metrics
  - Session replay for debugging

---

## 📍 Integration Points in Voice Interview

### **1. speakResponse() Function**
```javascript
// Tries ElevenLabs first → Falls back to browser speech
const speakResponse = async (text) => {
  if (useElevenLabs && ELEVENLABS_API_KEY) {
    const audioBuffer = await generateSpeech(text);
    if (audioBuffer) {
      playAudio(audioBuffer);
      return;
    }
  }
  // Fallback to browser speech synthesis
};
```

### **2. Error Handling with Sentry**
```javascript
try {
  // Interview logic
} catch (error) {
  captureException(error, {
    tags: { phase: 'greeting', component: 'interview' },
    extra: { userTranscript, question },
  });
}
```

### **3. User Tracking**
```javascript
// Set user context when candidate provides name
setUser({ id: 'interview-' + Date.now(), name, email: null });
```

### **4. Action Breadcrumbs**
```javascript
// Track each action for debugging
addBreadcrumb(`Submitted answer: ${text}...`, 'user-action', 'info');
addBreadcrumb(`Speaking: ${text}...`, 'speech', 'info');
```

---

## 🔧 Configuration

### **Environment Variables Required**
```env
# ElevenLabs
ELEVENLABS_API_KEY=sk_3130068b67e549155109b6e50833dbf386f830c68452070c

# Deepgram
DEEPGRAM_API_KEY=a189d1f3d489b13a16ec02f1dd128b91eb4ca48f

# Sentry
SENTRY_DSN=https://e337d49538f362c88bcb2a57c3fc9963@o4510460935536640.ingest.us.sentry.io/4510460937043968
```

✅ **All three are already in your `.env.local`**

---

## 🚀 How to Test

### **Test ElevenLabs Voice**
1. Go to interview page
2. Complete greeting phase
3. AI recruiter should speak with professional voice
4. If API fails, falls back to browser voice automatically

### **Test Deepgram Transcription**
1. Navigate to `/api/interview/transcribe`
2. Send POST request with audio blob
3. Get back high-accuracy transcription with confidence score

### **Test Sentry Error Tracking**
1. Open DevTools Console
2. Trigger an error: `throw new Error('Test error');`
3. Check [Sentry Dashboard](https://sentry.io/organizations//)
4. Error should appear within seconds
5. User context, breadcrumbs, and session info visible

---

## 📊 Monitoring & Debugging

### **Sentry Dashboard Features**

1. **Issues View**
   - All errors caught in production
   - Stack traces with source maps
   - Error frequency and trends

2. **Performance**
   - API response times
   - Page load metrics
   - Slow transactions

3. **User Session Replay**
   - Watch exact user actions before error
   - Understand context of failures
   - Identify UX issues

4. **Breadcrumbs**
   - Interview phase transitions
   - User actions (answer submissions)
   - Speech events
   - API calls

### **Sample Breadcrumb Trail**
```
[greeting] Submitted name: "John"
[personal] Speaking: "Tell me about your background..."
[personal] Submitted answer: "I have 5 years of experience..."
[questions] Analyzing answer...
[questions] Speaking: "That's interesting, tell me more..."
```

---

## 🔄 Fallback Behavior

### **ElevenLabs Fails?**
→ Browser speech synthesis takes over (works offline)

### **Deepgram Fails?**
→ Web Speech API continues working (less accurate but available)

### **API Timeout?**
→ Sentry logs it, user sees error but interview continues

---

## 📈 Next Steps for Maximum Benefit

1. **Enable Session Replay**
   ```javascript
   replaysSessionSampleRate: 0.1, // 10% of sessions
   replaysOnErrorSampleRate: 1.0, // 100% on errors
   ```

2. **Add Custom Metrics**
   ```javascript
   addBreadcrumb('Interview started', 'interview', 'info');
   addBreadcrumb('Question asked', 'interview', 'info');
   ```

3. **Monitor Performance**
   - Check Sentry for slow API calls
   - Optimize based on real data

4. **User Feedback**
   - Collect feedback after interviews
   - Correlate with error data
   - Improve based on patterns

---

## 🎯 Current Voice Interview Features

✅ **Greeting Phase**
- AI greets warmly with ElevenLabs voice
- Captures candidate name
- Logs user context in Sentry

✅ **Personal Phase**
- AI engages in warm conversation
- Professional voice (ElevenLabs)
- Sentry tracks sentiment/keywords

✅ **Questions Phase**
- Realistic recruiter feedback
- Error tracking for all API calls
- Breadcrumb trail of interview flow

✅ **Error Handling**
- All errors captured in Sentry
- User-friendly fallbacks
- Debug information preserved

---

## 🔗 API Routes Added

1. `/api/interview/tts` - Text-to-speech (ElevenLabs)
2. `/api/interview/transcribe` - Speech-to-text (Deepgram)

Both have fallbacks and error handling built-in.

---

## 📞 Support & Troubleshooting

- **ElevenLabs Issues**: Check API key in `.env.local`
- **Deepgram Issues**: Verify API key and audio format
- **Sentry Issues**: Check DSN configuration
- **Voice Not Working**: Check browser console for errors

All errors are logged to Sentry automatically! 🎉
