import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function extractTextFromPDF(buffer) {
  try {
    // Dynamic import for pdf-parse
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error("PDF parsing error:", error);
    // Fallback: try to extract text as UTF-8
    try {
      return buffer.toString("utf-8");
    } catch {
      throw new Error("Failed to parse PDF or extract text");
    }
  }
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    let resumeText;

    try {
      resumeText = await extractTextFromPDF(Buffer.from(buffer));
    } catch {
      // If PDF parsing fails, try to read as text
      resumeText = new TextDecoder().decode(buffer);
    }

    if (!resumeText || resumeText.trim().length === 0) {
      return Response.json(
        { error: "Could not extract text from resume" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are an expert resume reviewer and career coach. Analyze the following resume comprehensively and provide detailed feedback in JSON format.

Resume Text:
${resumeText}

Provide analysis in this exact JSON format (no other text):
{
  "overallScore": <number 0-100>,
  "sectionScores": {
    "formatting": <number>,
    "content_quality": <number>,
    "experience_description": <number>,
    "skills_presentation": <number>,
    "education": <number>,
    "achievements": <number>
  },
  "strengths": [
    "<strength 1>",
    "<strength 2>",
    "<strength 3>"
  ],
  "improvements": [
    {
      "area": "area name",
      "suggestion": "detailed suggestion"
    }
  ],
  "metrics": {
    "word_count": <number>,
    "page_count_estimate": <number>,
    "keyword_density": "<good|average|poor>",
    "action_verbs_count": <number>
  },
  "overall_feedback": "2-3 sentences of overall feedback"
}

Be objective and constructive. Focus on:
- Clarity and formatting
- Impact and achievement focus
- Keyword optimization
- Quantifiable results
- Consistency and professionalism`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json(
        { error: "Failed to parse analysis response" },
        { status: 500 }
      );
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return Response.json({ analysis, resumeText }, { status: 200 });
  } catch (error) {
    console.error("Resume analysis error:", error);
    return Response.json(
      { error: error.message || "Failed to analyze resume" },
      { status: 500 }
    );
  }
}
