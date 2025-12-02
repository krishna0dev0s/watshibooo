import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { analysis, resumeText } = await req.json();

    if (!analysis || !resumeText) {
      return Response.json(
        { error: "No analysis data or resume text provided" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const improvements = analysis.improvements || [];
    const improvementSummary = improvements
      .map((imp) => `- ${imp.area}: ${imp.suggestion}`)
      .join("\n");

    const prompt = `You are an expert resume writer and career coach. Based on the original resume and the following analysis feedback, provide an improved version of the resume that keeps all the user's actual information but enhances it based on the feedback.

Original Resume:
${resumeText}

Analysis Summary:
- Overall Score: ${analysis.overallScore}/100
- Strengths: ${analysis.strengths?.join(", ")}
- Areas to improve: ${improvementSummary}
- Metrics: ${JSON.stringify(analysis.metrics)}

CRITICAL: You MUST:
1. Keep ALL the user's personal information (name, email, phone, address, etc.) from the original resume
2. Keep ALL of their actual work experience with company names and roles
3. Keep ALL of their education details
4. Keep ALL of their skills and certifications
5. Enhance the descriptions using action verbs and strong language based on the feedback
6. Quantify achievements with numbers and percentages where missing
7. Improve formatting and readability
8. Fix any grammar or punctuation issues
9. Ensure ATS-friendly formatting
10. Make achievements more impactful
11. Highlight relevant skills better

DO NOT:
- Remove or change any of the user's real information
- Replace experience with generic templates
- Lose any contact details or personal info
- Create fictional achievements
- Change dates or company names
- Remove education or certifications

Return a complete, improved resume in professional format that addresses all improvement areas while preserving the user's actual career details. Make it compelling and achievement-focused. Use proper formatting with clear sections.`;

    const result = await model.generateContent(prompt);
    const improvedResume = result.response.text();

    return Response.json({ improvedResume }, { status: 200 });
  } catch (error) {
    console.error("Resume improvement error:", error);
    return Response.json(
      { error: error.message || "Failed to improve resume" },
      { status: 500 }
    );
  }
}
