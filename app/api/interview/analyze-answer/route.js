import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

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

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      console.error('[Answer Analysis] API key not configured');
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

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const analysisPrompt = `You are an expert interview evaluator analyzing a candidate's answer for a ${roleId ? roleId.replace(/-/g, " ") : "software engineering"} role.

Question: "${question}"
Candidate's Answer: "${userResponse}"
Question ${questionIndex} of ${totalQuestions}

Analyze this answer critically and provide:
1. A score (0-100) for this answer
2. Key strengths in their answer (2-3 points)
3. Key weaknesses or missing points (2-3 points)
4. A specific follow-up question/challenge based on their answer

Be realistic and critical - like a real recruiter would be.

Format your response as:
SCORE: [number]
STRENGTHS: [point 1], [point 2], [point 3]
WEAKNESSES: [point 1], [point 2], [point 3]
FOLLOWUP: [specific follow-up question/challenge]`;

    console.log('[Answer Analysis] Calling Gemini API...');
    const result = await model.generateContent(analysisPrompt);
    
    if (!result || !result.response) {
      throw new Error("No response from Gemini API");
    }

    let responseText = result.response.text().trim();
    console.log('[Answer Analysis] Got response:', responseText.substring(0, 150));

    // Parse the response
    const scoreMatch = responseText.match(/SCORE:\s*(\d+)/i);
    const strengthsMatch = responseText.match(/STRENGTHS:\s*([^\n]+)/i);
    const weaknessesMatch = responseText.match(/WEAKNESSES:\s*([^\n]+)/i);
    const followupMatch = responseText.match(/FOLLOWUP:\s*([^\n]+)/i);

    const score = scoreMatch ? parseInt(scoreMatch[1]) : 60;
    const strengths = strengthsMatch 
      ? strengthsMatch[1].split(',').map(s => s.trim()).filter(s => s)
      : ["Good response"];
    const weaknesses = weaknessesMatch 
      ? weaknessesMatch[1].split(',').map(w => w.trim()).filter(w => w)
      : ["Could be more detailed"];
    const followUp = followupMatch ? followupMatch[1].trim() : "Tell me more about that.";

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
