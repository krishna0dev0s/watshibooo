import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { query } = await req.json();

    if (!query || query.trim().length === 0) {
      return Response.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are a company suggestion AI. Given a user's search query, suggest 8-12 real tech/software/popular companies whose names match or are related to the query. Be flexible and suggest various companies that could match.

User query: "${query}"

Return ONLY a JSON object with a "suggestions" array containing company names as strings. Do not include any other text.

Example format:
{"suggestions": ["Google", "Meta", "Microsoft"]}

Important: 
- Only include real, well-known companies
- Suggest any company that matches the query (not just tech companies if the query suggests otherwise)
- If query is very short (1-2 chars), suggest popular companies starting with that letter
- Sort by relevance to the query`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json(
        { suggestions: [] },
        { status: 200 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const suggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions : [];

    return Response.json({ suggestions }, { status: 200 });
  } catch (error) {
    console.error("Company suggestions error:", error);
    return Response.json(
      { error: "Failed to generate suggestions", suggestions: [] },
      { status: 500 }
    );
  }
}
