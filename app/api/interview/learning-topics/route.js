// Interview Learning Topics API - Returns structured learning roadmap with videos
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { role, company, level } = body;

    console.log('[Learning Topics] Generating topics for:', { role, company, level });

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "API key not configured"
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Generate learning topics based on role
    const topicsPrompt = `Generate a structured learning roadmap for a ${level || 'junior'} ${role || 'Software Engineer'} interview preparation.

Format as JSON with this structure:
{
  "role": "Role Name",
  "level": "Experience Level",
  "totalTopics": number,
  "topics": [
    {
      "id": "unique-id",
      "title": "Topic Title",
      "description": "Brief description",
      "estimatedTime": "2-3 hours",
      "order": 1,
      "skills": ["skill1", "skill2", "skill3"],
      "keyPoints": ["point1", "point2", "point3"],
      "videoKeywords": ["keyword1 tutorial", "keyword2 explained"]
    }
  ]
}

Create 5-8 progressive topics covering:
- Fundamentals
- Core Concepts
- Advanced Topics
- Practical Problems
- Interview Patterns
- System Design (if applicable)

Make sure each topic has specific YouTube search keywords for finding the best learning videos.
Return ONLY valid JSON, no markdown.`;

    console.log('[Learning Topics] Calling Gemini API...');
    const topicsResult = await model.generateContent(topicsPrompt);
    const topicsText = topicsResult.response.text().trim();
    
    // Parse JSON response
    let learningRoadmap;
    try {
      learningRoadmap = JSON.parse(topicsText);
    } catch (e) {
      // Extract JSON from response if wrapped in markdown
      const jsonMatch = topicsText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        learningRoadmap = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Invalid JSON response from Gemini");
      }
    }

    console.log('[Learning Topics] Generated', learningRoadmap.topics?.length, 'topics');

    return new Response(
      JSON.stringify({
        success: true,
        data: learningRoadmap
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Learning Topics] Error:", error.message);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
