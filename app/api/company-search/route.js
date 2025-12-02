import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  try {
    const { companyName } = await req.json();

    if (!companyName) {
      return Response.json({ error: "Company name is required" }, { status: 400 });
    }

    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return Response.json({ error: "GEMINI_API_KEY not set" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are a recruitment expert. Generate relevant job postings for ${companyName}. 
    Return ONLY valid JSON (no additional text). The JSON must be an array with this schema:
    [
      {
        "title": "Job Title",
        "description": "Brief job description",
        "requirements": ["Requirement 1", "Requirement 2"],
        "skills": ["Skill 1", "Skill 2"],
        "level": "Junior|Mid|Senior",
        "type": "Full-time|Part-time|Contract"
      }
    ]
    
    Generate 3-5 realistic job postings for ${companyName} based on what you know about the company.
    Example output: [{"title": "Senior Software Engineer", "description": "...", "requirements": [...], "skills": [...], "level": "Senior", "type": "Full-time"}]`;

    const result = await model.generateContent(prompt, { temperature: 0.7, maxOutputTokens: 1500 });
    const text = result?.response?.text ? result.response.text() : "";

    let jobPosts = [];
    if (text) {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          jobPosts = JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error("Failed to parse JSON", e);
        }
      }
    }

    return Response.json({
      company: {
        name: companyName,
        jobPosts: jobPosts || [],
      },
    });
  } catch (error) {
    console.error("Company search error:", error);
    return Response.json({ error: "Failed to search company" }, { status: 500 });
  }
}
