// Interview Learning Topics API - Returns structured learning roadmap
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { role, company, level } = body;

    console.log('[Learning Topics] Generating topics for:', { role, company, level });

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      console.warn('[Learning Topics] API key not configured, using fallback');
      const fallbackRoadmap = generateFallbackRoadmap(role, level);
      return new Response(
        JSON.stringify({
          success: true,
          data: fallbackRoadmap
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const topicsPrompt = `Generate a structured learning roadmap for a ${level || 'intermediate'} ${role || 'Software Engineer'} interview preparation.

Return ONLY valid JSON (no markdown, no code blocks):
{
  "role": "${role || 'Software Engineer'}",
  "level": "${level || 'intermediate'}",
  "topics": [
    {
      "id": "topic-1",
      "title": "Topic Title",
      "description": "Description",
      "estimatedTime": "3-4 hours",
      "skills": ["skill1", "skill2"],
      "keyPoints": ["point1", "point2"],
      "videoKeywords": ["keyword1", "keyword2"]
    }
  ]
}

Generate 7 progressive topics.`;

    console.log('[Learning Topics] Calling Gemini API...');
    const topicsResult = await model.generateContent(topicsPrompt);
    let topicsText = topicsResult.response.text().trim();
    
    // Clean markdown if present
    topicsText = topicsText.replace(/^```json\n?/i, '').replace(/\n?```$/i, '');
    topicsText = topicsText.replace(/^```\n?/i, '').replace(/\n?```$/i, '');
    
    let learningRoadmap = null;
    try {
      learningRoadmap = JSON.parse(topicsText);
    } catch (e) {
      console.warn('[Learning Topics] JSON parse failed:', e.message);
      const jsonMatch = topicsText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          learningRoadmap = JSON.parse(jsonMatch[0]);
        } catch (e2) {
          learningRoadmap = null;
        }
      }
    }

    // Validate structure
    if (!learningRoadmap?.topics || !Array.isArray(learningRoadmap.topics) || learningRoadmap.topics.length === 0) {
      console.warn('[Learning Topics] Invalid Gemini response, using fallback');
      learningRoadmap = generateFallbackRoadmap(role, level);
    } else {
      console.log('[Learning Topics] Generated', learningRoadmap.topics.length, 'topics from Gemini');
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: learningRoadmap
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('[Learning Topics] Error:', error.message);
    // Always return fallback roadmap on error
    const fallbackRoadmap = generateFallbackRoadmap('Software Engineer', 'intermediate');
    return new Response(
      JSON.stringify({
        success: true,
        data: fallbackRoadmap
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Fallback roadmap generator - always provides valid structure
function generateFallbackRoadmap(role = 'Software Engineer', level = 'intermediate') {
  const intermediateTopics = [
    {
      id: 'topic-1',
      title: 'Advanced Data Structures',
      description: 'Hash tables, graphs, heaps, and balanced trees',
      estimatedTime: '4-5 hours',
      skills: ['hash tables', 'graphs', 'heaps'],
      keyPoints: ['Hash functions', 'Graph representation', 'Heap operations'],
      videoKeywords: ['data structures', 'graphs tutorial']
    },
    {
      id: 'topic-2',
      title: 'Dynamic Programming',
      description: 'Solve optimization problems with memoization and tabulation',
      estimatedTime: '5-6 hours',
      skills: ['memoization', 'tabulation', 'DP patterns'],
      keyPoints: ['Overlapping subproblems', 'Optimal substructure', 'Memoization'],
      videoKeywords: ['dynamic programming', 'DP tutorial']
    },
    {
      id: 'topic-3',
      title: 'Graph Algorithms',
      description: 'BFS, DFS, Dijkstra, and minimum spanning tree algorithms',
      estimatedTime: '4-5 hours',
      skills: ['BFS', 'DFS', 'shortest path'],
      keyPoints: ['BFS and DFS', 'Dijkstra algorithm', 'Kruskal and Prim'],
      videoKeywords: ['graph algorithms', 'BFS DFS']
    },
    {
      id: 'topic-4',
      title: 'System Design',
      description: 'Design scalable systems and distributed architectures',
      estimatedTime: '5-6 hours',
      skills: ['scalability', 'load balancing', 'databases'],
      keyPoints: ['Horizontal scaling', 'Load balancing', 'Database design'],
      videoKeywords: ['system design', 'distributed systems']
    },
    {
      id: 'topic-5',
      title: 'Database Design',
      description: 'SQL, NoSQL, indexing, and normalization',
      estimatedTime: '4-5 hours',
      skills: ['SQL', 'NoSQL', 'indexing'],
      keyPoints: ['ACID properties', 'Normalization', 'Query optimization'],
      videoKeywords: ['database design', 'SQL tutorial']
    },
    {
      id: 'topic-6',
      title: 'API Design & REST',
      description: 'RESTful API design and microservices architecture',
      estimatedTime: '3-4 hours',
      skills: ['REST', 'API design', 'HTTP'],
      keyPoints: ['REST principles', 'HTTP methods', 'Status codes'],
      videoKeywords: ['API design', 'REST tutorial']
    },
    {
      id: 'topic-7',
      title: 'System Design Deep Dive',
      description: 'Advanced architectural patterns and optimization strategies',
      estimatedTime: '4-5 hours',
      skills: ['architecture', 'design patterns', 'optimization'],
      keyPoints: ['Design patterns', 'Trade-offs analysis', 'Real-world scenarios'],
      videoKeywords: ['system design patterns', 'architecture']
    }
  ];

  const juniorTopics = [
    {
      id: 'topic-1',
      title: 'Programming Fundamentals',
      description: 'Variables, data types, loops, conditionals, and functions',
      estimatedTime: '3-4 hours',
      skills: ['variables', 'loops', 'conditionals'],
      keyPoints: ['Data types', 'Variables and scope', 'Control flow'],
      videoKeywords: ['programming basics', 'coding tutorial']
    },
    {
      id: 'topic-2',
      title: 'Data Structures',
      description: 'Arrays, linked lists, stacks, queues, and trees',
      estimatedTime: '4-5 hours',
      skills: ['arrays', 'lists', 'trees'],
      keyPoints: ['Array operations', 'Linked lists', 'Stack and queue'],
      videoKeywords: ['data structures', 'arrays tutorial']
    },
    {
      id: 'topic-3',
      title: 'Basic Algorithms',
      description: 'Sorting, searching, and recursion fundamentals',
      estimatedTime: '3-4 hours',
      skills: ['sorting', 'searching', 'recursion'],
      keyPoints: ['Bubble sort', 'Binary search', 'Recursion basics'],
      videoKeywords: ['algorithms', 'sorting tutorial']
    },
    {
      id: 'topic-4',
      title: 'Problem Solving',
      description: 'Practice coding problems and logic building',
      estimatedTime: '5-6 hours',
      skills: ['problem solving', 'logic', 'debugging'],
      keyPoints: ['Problem breakdown', 'Algorithm design', 'Testing'],
      videoKeywords: ['coding problems', 'leetcode']
    },
    {
      id: 'topic-5',
      title: 'Object Oriented Programming',
      description: 'Classes, inheritance, polymorphism, and SOLID principles',
      estimatedTime: '3-4 hours',
      skills: ['classes', 'inheritance', 'polymorphism'],
      keyPoints: ['Classes and objects', 'Inheritance', 'Encapsulation'],
      videoKeywords: ['OOP tutorial', 'object oriented']
    },
    {
      id: 'topic-6',
      title: 'Web Development Basics',
      description: 'HTML, CSS, and JavaScript fundamentals',
      estimatedTime: '4-5 hours',
      skills: ['HTML', 'CSS', 'JavaScript'],
      keyPoints: ['HTML structure', 'CSS styling', 'DOM manipulation'],
      videoKeywords: ['web development', 'JavaScript tutorial']
    },
    {
      id: 'topic-7',
      title: 'Interview Preparation',
      description: 'Interview techniques, behavioral questions, and best practices',
      estimatedTime: '2-3 hours',
      skills: ['communication', 'problem approach'],
      keyPoints: ['Think aloud', 'Ask clarifying questions', 'Time management'],
      videoKeywords: ['interview tips', 'interview preparation']
    }
  ];

  const topics = level === 'junior' ? juniorTopics : intermediateTopics;

  return {
    role: role || 'Software Engineer',
    level: level || 'intermediate',
    totalTopics: topics.length,
    topics
  };
}
