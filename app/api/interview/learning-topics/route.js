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

You MUST return ONLY valid JSON, no markdown, no code blocks.
The JSON structure must be:
{
  "role": "${role || 'Software Engineer'}",
  "level": "${level || 'intermediate'}",
  "totalTopics": 7,
  "topics": [
    {
      "id": "topic-1",
      "title": "Fundamentals",
      "description": "Master the basics",
      "estimatedTime": "2-3 hours",
      "order": 1,
      "skills": ["basics", "fundamentals"],
      "keyPoints": ["Key point 1", "Key point 2"],
      "videoKeywords": ["basics tutorial", "fundamentals explained"]
    },
    {
      "id": "topic-2", 
      "title": "Data Structures",
      "description": "Learn core data structures",
      "estimatedTime": "3-4 hours",
      "order": 2,
      "skills": ["arrays", "lists", "trees"],
      "keyPoints": ["Array operations", "Linked lists", "Tree traversal"],
      "videoKeywords": ["data structures tutorial", "arrays and lists"]
    },
    {
      "id": "topic-3",
      "title": "Algorithms",
      "description": "Master algorithm concepts",
      "estimatedTime": "3-4 hours",
      "order": 3,
      "skills": ["sorting", "searching", "recursion"],
      "keyPoints": ["Sorting algorithms", "Binary search", "Recursion patterns"],
      "videoKeywords": ["algorithms tutorial", "sorting algorithms explained"]
    },
    {
      "id": "topic-4",
      "title": "Problem Solving",
      "description": "Practice coding problems",
      "estimatedTime": "4-5 hours",
      "order": 4,
      "skills": ["problem solving", "coding"],
      "keyPoints": ["Two-pointer technique", "Sliding window", "Dynamic programming basics"],
      "videoKeywords": ["coding interview problems", "leetcode solutions"]
    },
    {
      "id": "topic-5",
      "title": "System Design",
      "description": "Understand large-scale systems",
      "estimatedTime": "3-4 hours",
      "order": 5,
      "skills": ["architecture", "scalability"],
      "keyPoints": ["Scalability", "Load balancing", "Database design"],
      "videoKeywords": ["system design interview", "distributed systems"]
    },
    {
      "id": "topic-6",
      "title": "Design Patterns",
      "description": "Learn common design patterns",
      "estimatedTime": "2-3 hours",
      "order": 6,
      "skills": ["design patterns", "OOP"],
      "keyPoints": ["Singleton pattern", "Factory pattern", "Observer pattern"],
      "videoKeywords": ["design patterns tutorial", "OOP principles"]
    },
    {
      "id": "topic-7",
      "title": "Interview Tips",
      "description": "Master interview techniques",
      "estimatedTime": "1-2 hours",
      "order": 7,
      "skills": ["communication", "problem approach"],
      "keyPoints": ["Think out loud", "Ask clarifying questions", "Handle pressure"],
      "videoKeywords": ["interview tips", "coding interview preparation"]
    }
  ]
}

Return ONLY the JSON object, nothing else.`;

    console.log('[Learning Topics] Calling Gemini API...');
    const topicsResult = await model.generateContent(topicsPrompt);
    let topicsText = topicsResult.response.text().trim();
    
    // Remove markdown code blocks if present
    topicsText = topicsText.replace(/^```json\n?/i, '').replace(/\n?```$/i, '');
    topicsText = topicsText.replace(/^```\n?/i, '').replace(/\n?```$/i, '');
    
    // Parse JSON response
    let learningRoadmap;
    try {
      learningRoadmap = JSON.parse(topicsText);
    } catch (e) {
      console.error('[Learning Topics] JSON parse error:', e.message, 'Text:', topicsText.substring(0, 200));
      // Extract JSON from response if wrapped in markdown
      const jsonMatch = topicsText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          learningRoadmap = JSON.parse(jsonMatch[0]);
        } catch (e2) {
          throw new Error("Could not parse JSON response from Gemini");
        }
      } else {
        throw new Error("No JSON found in Gemini response");
      }
    }

    // Ensure topics array exists
    if (!learningRoadmap.topics || !Array.isArray(learningRoadmap.topics)) {
      console.error('[Learning Topics] Invalid topics format:', learningRoadmap);
      throw new Error("Invalid topics format from API");
    }

    console.log('[Learning Topics] Generated', learningRoadmap.topics.length, 'topics');

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
