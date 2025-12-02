// Deepgram Speech-to-Text Client
export async function transcribeAudio(audioBlob) {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob);

    const response = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&language=en', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY || process.env.DEEPGRAM_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Deepgram API error: ${response.status}`);
    }

    const result = await response.json();
    const transcript = result.results?.channels[0]?.alternatives[0]?.transcript || '';
    const confidence = result.results?.channels[0]?.alternatives[0]?.confidence || 0;

    return {
      transcript,
      confidence,
      success: true,
    };
  } catch (error) {
    console.error('Deepgram transcription error:', error);
    return {
      transcript: '',
      confidence: 0,
      success: false,
      error: error.message,
    };
  }
}

// Live transcription with Deepgram (for real-time)
export async function createLiveTranscription() {
  try {
    const response = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&encoding=linear16&sample_rate=16000', {
      method: 'GET',
      headers: {
        'Authorization': `Token ${process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY || process.env.DEEPGRAM_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Deepgram WebSocket error: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error('Deepgram live transcription error:', error);
    return null;
  }
}

// Get Deepgram account info (for monitoring usage)
export async function getDeepgramUsage() {
  try {
    const response = await fetch('https://api.deepgram.com/v1/usage', {
      headers: {
        'Authorization': `Token ${process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY || process.env.DEEPGRAM_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch usage: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to get Deepgram usage:', error);
    return null;
  }
}
