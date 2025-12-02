import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  try {
    const { companyName, jobTitle, jobDescription, skills, level } = await req.json();

    if (!companyName || !jobTitle) {
      return Response.json({ error: "Company name and job title are required" }, { status: 400 });
    }

    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return Response.json({ error: "GEMINI_API_KEY not set" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are an expert interview coach. Generate interview questions for a ${level || 'Mid'}-level ${jobTitle} position at ${companyName}.
    ${jobDescription ? `Job Description: ${jobDescription}` : ''}
    ${skills?.length > 0 ? `Required Skills: ${skills.join(', ')}` : ''}
    
    Return ONLY valid JSON array (no additional text). Generate 10 interview questions with this schema:
    [
      {
        "question": "The actual question",
        "type": "behavioral|technical|coding",
        "difficulty": "easy|medium|hard",
        "category": "system-design|data-structures|problem-solving|company-knowledge|etc",
        "hints": ["Hint 1", "Hint 2"],
        "sampleAnswer": "A sample/good answer to the question",
        "codeTemplate": "For coding questions only - starter code template",
        "expectedOutput": "For coding questions only - expected output"
      }
    ]
    
    Include a mix of:
    - 3 behavioral questions about ${companyName}'s culture and values
    - 3 technical questions relevant to ${jobTitle} and required skills
    - 3 coding questions (if applicable to the role)
    - 1 situational/problem-solving question
    
    Make questions specific to ${companyName} when possible.`;

    const result = await model.generateContent(prompt, { temperature: 0.7, maxOutputTokens: 2500 });
    const text = result?.response?.text ? result.response.text() : "";

    let questions = [];
    if (text) {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          questions = JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error("Failed to parse JSON", e);
        }
      }
    }

    return Response.json({
      company: companyName,
      jobTitle,
      questions: questions || [],
    });
  } catch (error) {
    console.error("Interview questions generation error:", error);
    return Response.json({ error: "Failed to generate interview questions" }, { status: 500 });
  }
}
