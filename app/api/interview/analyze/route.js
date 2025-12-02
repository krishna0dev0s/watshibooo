import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { roleId, questions, responses, currentQuestion } = await request.json();

    if (!responses || !questions) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const analysisPrompt = `
You are an expert interview coach analyzing a candidate's interview performance for a ${roleId.replace(/-/g, " ")} position.

Question asked: "${currentQuestion}"
Candidate's response: "${responses}"

Please provide a detailed analysis in the following JSON format:
{
  "overallScore": <number 0-100>,
  "overallFeedback": "<brief overall assessment>",
  "metrics": {
    "communication_clarity": <number 0-100>,
    "technical_accuracy": <number 0-100>,
    "confidence_level": <number 0-100>,
    "completeness": <number 0-100>,
    "articulation": <number 0-100>
  },
  "strengths": [<list of 3-4 key strengths>],
  "improvements": [<list of 3-4 areas to improve>],
  "actionItems": [<list of 3-4 specific next steps to improve>],
  "closingLine": "<A professional and encouraging closing line for the interview>"
}

Be constructive and specific in your feedback. Focus on actionable insights.`;

    const result = await model.generateContent(analysisPrompt);
    const responseText = result.response.text();

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const analysisData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (!analysisData) {
      throw new Error("Failed to parse analysis response");
    }

    return new Response(
      JSON.stringify({
        success: true,
        ...analysisData,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Interview analysis error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to analyze interview", details: error.message }),
      { status: 500 }
    );
  }
}
