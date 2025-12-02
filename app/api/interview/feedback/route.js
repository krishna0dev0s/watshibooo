// Using ElevenLabs for voice synthesis and Deepgram for transcription
// No Gemini API dependency - using curated responses

// More realistic recruiter responses - includes challenges and critiques with EMOTIONS
const fallbackResponses = [
  "You know, that's honestly interesting, but I'm genuinely curious - what would you do if that approach totally fell apart? Have you thought about other angles?",
  "Okay, I hear you. Yeah, that's definitely a common approach. But here's the thing - if you had like, half the time and half the resources, how would you tackle it?",
  "That makes sense, but hey, let me push back a little here - what about the edge cases? I'm wondering how you'd handle those because that's where things usually get tricky.",
  "Alright, I appreciate that. Real talk though - have you actually done something like this before, or is this more of a theoretical approach?",
  "Okay, okay, I get it. But here's what I'm thinking - most people say something similar. What makes YOUR approach different? What's the secret sauce?",
  "Sure, sure, I can see that. Let me play devil's advocate though - what are the actual downsides of your solution? I'm genuinely asking.",
  "That's cool, I like that you're thinking about it that way. But I'm curious - how does that compare to how most companies handle this? Are you ahead of the curve?",
];

export async function POST(request) {
  try {
    const body = await request.json();
    const { roleId, question, userResponse, questionIndex, totalQuestions, conversationHistory, answerScore, strengths, weaknesses } = body;

    console.log('[Interview Feedback] Received request:', { questionIndex, totalQuestions, answerScore });

    if (!userResponse || !question) {
      console.log('[Interview Feedback] Missing fields');
      return new Response(
        JSON.stringify({ 
          success: true, 
          response: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generate contextual feedback based on score
    let responseText;
    
    if (answerScore >= 70) {
      // High score - show enthusiasm and dig deeper
      const deeperQuestions = [
        "You know what, I really like that approach! So here's my question though - how would you handle it if the constraints were twice as tight?",
        "That's actually a solid answer! Yeah, okay. But I'm genuinely curious - have you actually built something like this in production? What did you learn?",
        "Honestly, that's impressive thinking. Real talk though - what's the one thing you'd do differently if you were doing this again today?",
        "I love that perspective! So here's the thing - most people approach it your way, but what if the requirements changed mid-project? How flexible is your solution?"
      ];
      responseText = deeperQuestions[questionIndex % deeperQuestions.length];
    } else if (answerScore >= 40) {
      // Medium score - be thoughtful
      const mediumQuestions = [
        "Okay, I hear where you're coming from. That's a common approach, but I'm curious - what are the potential pitfalls? Have you thought about those?",
        "That makes sense, but here's what I'm wondering - did you consider any alternative approaches? What would be different?",
        "Right, I follow your thinking. But let me push back a little - what about scalability? How would this perform under load?",
        "Sure, I understand that. Real talk though - what's one thing you'd improve if you had to refactor this?"
      ];
      responseText = mediumQuestions[questionIndex % mediumQuestions.length];
    } else {
      // Lower score - be encouraging but challenging
      responseText = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }

    // Return the response directly - no need to parse JSON
    return new Response(
      JSON.stringify({
        success: true,
        response: responseText,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[Interview Feedback] Error:", error.message, error);
    
    // Always return a fallback response on error
    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    
    return new Response(
      JSON.stringify({
        success: true,
        response: randomResponse,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

