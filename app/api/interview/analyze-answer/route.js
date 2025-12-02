// Using ElevenLabs for voice and Deepgram for transcription
// No Gemini API dependency

export async function POST(request) {
  try {
    const body = await request.json();
    const { roleId, question, userResponse, questionIndex, totalQuestions } = body;

    console.log('[Answer Analysis] Analyzing answer for question:', questionIndex);

    if (!userResponse || !question) {
      console.log('[Answer Analysis] Missing fields');
      return new Response(
        JSON.stringify({ 
          success: true,
          analysis: {
            score: 50,
            strengths: ["You provided a response"],
            weaknesses: ["Could be more detailed"],
            followUp: "Tell me more about your thinking on this."
          }
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generate analysis with default scoring
    // Using pattern-based analysis without external API calls
    const responseLength = userResponse.length;
    const hasDetails = responseLength > 100;
    const hasExamples = /example|like|such as/i.test(userResponse);
    const isConfident = /I'm confident|I'm sure|I know/i.test(userResponse);
    
    let score = 55;
    if (hasDetails) score += 15;
    if (hasExamples) score += 15;
    if (isConfident) score += 5;
    score = Math.min(score, 95);

    // Generate contextual feedback
    const strengths = [
      hasDetails ? "Good level of detail" : "Clear response",
      hasExamples ? "Provided relevant examples" : "Direct answer",
      isConfident ? "Showed confidence" : "Well thought out"
    ];
    
    const weaknesses = [
      !hasDetails ? "Could add more detail" : "Good coverage",
      !hasExamples ? "Try including an example" : "Examples added value",
      "Could explain your reasoning further"
    ].filter(w => w.startsWith("Could") || w.startsWith("Try"));
    
    const followUpOptions = [
      "Can you walk me through that in more detail?",
      "Have you handled something similar before?",
      "What would you do differently next time?",
      "How did you approach this challenge?",
      "What was the outcome of this?"
    ];
    const followUp = followUpOptions[questionIndex % followUpOptions.length];

    return new Response(
      JSON.stringify({
        success: true,
        analysis: {
          score,
          strengths,
          weaknesses,
          followUp
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[Answer Analysis] Error:", error.message);
    
    // Return a fallback analysis
    return new Response(
      JSON.stringify({
        success: true,
        analysis: {
          score: 55,
          strengths: ["You provided a clear response"],
          weaknesses: ["Could elaborate more on your reasoning"],
          followUp: "What would you do differently next time?"
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
