import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

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

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      console.error('[Interview Feedback] API key not configured');
      return new Response(
        JSON.stringify({ 
          success: true, 
          response: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Build conversation context
    const conversationContext = conversationHistory && conversationHistory.length > 0
      ? conversationHistory.map(msg => `${msg.role === 'user' ? 'Candidate' : 'Recruiter'}: ${msg.content}`).join('\n')
      : '';

    // Use the analysis data to inform the feedback
    const analysisContext = answerScore 
      ? `\nAnswer Score: ${answerScore}/100\nStrengths: ${strengths ? strengths.join(', ') : 'N/A'}\nWeaknesses: ${weaknesses ? weaknesses.join(', ') : 'N/A'}`
      : '';

    const feedbackPrompt = `You are a warm, genuine recruiter/interviewer conducting a real technical interview for a ${roleId ? roleId.replace(/-/g, " ") : "software engineering"} role.
You push back on candidates, but you do it with genuine interest and warmth - not meanness. You use natural language with contractions, casual phrases like "you know," "honestly," "real talk," "I'm curious," etc.
You show emotions - enthusiasm, skepticism, genuine interest, thoughtfulness. You're a real human, not a robot.

Current Question: "${question}"
Candidate's Answer: "${userResponse}"
Progress: Question ${questionIndex || 1} of ${totalQuestions || 5}
${analysisContext}

${conversationContext ? `Conversation so far:\n${conversationContext}\n` : ''}

Respond to the candidate in 1-2 sentences. Based on the analysis:
- If score is high (70+): Show genuine enthusiasm but dig deeper with curiosity
- If score is medium (40-70): Be thoughtful about what's missing
- If score is low (<40): Be honest but encouraging, challenge them to think harder

Use emotional language and natural speech patterns:
- "You know what..." 
- "That's interesting..."
- "Real talk though..."
- "I'm genuinely curious..."
- "Here's the thing..."
- "Honestly..."
- Use occasional "yeah," "okay," "alright"

BE WARM. BE GENUINE. BE A REAL HUMAN. Challenge ideas, not the person.`;

    console.log('[Interview Feedback] Calling Gemini API with gemini-2.0-flash...');
    const result = await model.generateContent(feedbackPrompt);
    
    if (!result || !result.response) {
      throw new Error("No response from Gemini API");
    }

    let responseText = result.response.text().trim();
    
    console.log('[Interview Feedback] Got response:', responseText.substring(0, 100));

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

