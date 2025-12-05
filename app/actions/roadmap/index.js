'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

// Fallback roadmap generator when API fails
function generateFallbackRoadmap(domain, skills, level, months) {
  console.log('[Roadmap Generation] Using fallback roadmap generator');
  
  const numPhases = Math.max(3, Math.ceil(months / 3));
  const phases = [];
  
  const skillList = skills.split(',').map(s => s.trim()).filter(Boolean);
  const skillsPerPhase = Math.ceil(skillList.length / numPhases);
  
  for (let i = 0; i < numPhases; i++) {
    const startIndex = i * skillsPerPhase;
    const endIndex = Math.min(startIndex + skillsPerPhase, skillList.length);
    const phaseSkills = skillList.slice(startIndex, endIndex);
    
    const phaseMonths = Math.ceil(months / numPhases);
    const phaseNumber = i + 1;
    
    phases.push({
      phaseNumber,
      name: level === 'beginner' 
        ? ['Fundamentals', 'Basics', 'Core Concepts', 'Deep Dive'][i % 4]
        : level === 'intermediate'
        ? ['Advanced Topics', 'Practical Skills', 'Integration', 'Optimization'][i % 4]
        : ['Mastery', 'Architecture', 'Performance', 'Innovation'][i % 4],
      duration: `${phaseMonths} months`,
      topics: phaseSkills.length > 0 
        ? phaseSkills.map(skill => `${skill} - Complete learning path`)
        : [
            `${domain} fundamentals`,
            `Best practices and patterns`,
            `Real-world applications`,
            `Advanced techniques`
          ],
      resources: [
        `Comprehensive ${domain} course`,
        `Official documentation and guides`,
        `Community tutorials and blogs`,
        `Video learning resources`
      ],
      projects: [
        `Build a ${phaseSkills[0] || domain} project from scratch`,
        `Implement advanced features`,
        `Contribute to open source`,
        `Create a portfolio piece`
      ],
      milestone: `Complete ${domain} Phase ${phaseNumber} - Achieve proficiency in ${phaseSkills.join(', ') || domain}`
    });
  }
  
  return {
    overview: `A comprehensive ${months}-month learning roadmap for ${domain} tailored for ${level} level learners. This path covers essential skills and best practices.`,
    prerequisites: level === 'beginner' 
      ? ['Basic computer literacy', 'Understanding of programming fundamentals']
      : ['Programming experience', `Familiarity with ${domain}`],
    timeline: `${months} months`,
    phases,
    tools: [`${domain} development environment`, 'Code editor', 'Version control (Git)', 'Learning platform'],
    timeCommitment: months <= 3 
      ? '4-6 hours per week'
      : months <= 6
      ? '3-5 hours per week'
      : '2-4 hours per week',
    capstoneProjects: [
      `Complete end-to-end ${domain} application`,
      'Deploy to production',
      'Write technical documentation',
      'Create tutorial for others'
    ],
    tips: [
      'Practice consistently throughout the roadmap',
      'Build projects to reinforce learning',
      'Join communities and network',
      'Document your progress and learnings',
      `Review and refine your ${domain} skills regularly`
    ]
  };
}

export async function generateRoadmapContent({ domain, skills, level, months }) {
  try {
    console.log('[Roadmap Generation] Creating roadmap with:', { domain, skills, level, months });
    
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      console.error('[Roadmap Generation] Gemini API key not configured');
      return {
        success: false,
        error: "API key not configured. Using fallback roadmap."
      };
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Create a comprehensive learning roadmap for the following:

Domain: ${domain}
Target Skills: ${skills}
Current Level: ${level}
Timeline: ${months} months

Please provide a detailed, structured learning roadmap with:
1. A brief overview of what will be learned
2. Prerequisites (if any)
3. Learning phases (break it into weeks/months)
4. For each phase include:
   - Phase name and duration
   - Topics to cover
   - Recommended resources (specific courses, books, tutorials)
   - Practice projects or assignments
   - Key milestones/checkpoints
5. Tools and technologies needed
6. Estimated daily/weekly time commitment
7. Final capstone project ideas
8. Tips for success and common pitfalls to avoid

Format the response as ONLY a valid JSON object (no markdown, no extra text) with this schema:
{
  "overview": "string",
  "prerequisites": ["string"],
  "timeline": "${months} months",
  "phases": [
    {
      "phaseNumber": 1,
      "name": "string",
      "duration": "string",
      "topics": ["string"],
      "resources": ["string"],
      "projects": ["string"],
      "milestone": "string"
    }
  ],
  "tools": ["string"],
  "timeCommitment": "string",
  "capstoneProjects": ["string"],
  "tips": ["string"]
}`;

    console.log('[Roadmap Generation] Calling Gemini API...');
    const result = await model.generateContent(prompt);
    let responseText = result.response.text().trim();
    
    // Clean markdown if present
    responseText = responseText.replace(/^```json\n?/i, '').replace(/\n?```$/i, '');
    responseText = responseText.replace(/^```\n?/i, '').replace(/\n?```$/i, '');

    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[Roadmap Generation] No JSON found in response:', responseText.substring(0, 200));
      throw new Error("Failed to parse roadmap data from API response");
    }

    const roadmapData = JSON.parse(jsonMatch[0]);
    
    // Validate the structure
    if (!roadmapData.phases || !Array.isArray(roadmapData.phases) || roadmapData.phases.length === 0) {
      throw new Error("Invalid roadmap structure from API");
    }

    console.log('[Roadmap Generation] Successfully generated', roadmapData.phases.length, 'phases');
    
    return {
      success: true,
      data: roadmapData,
    };
  } catch (error) {
    console.error("[Roadmap Generation] Error:", error.message);
    console.log('[Roadmap Generation] Falling back to generated roadmap');
    
    // Use fallback roadmap when API fails
    const fallbackRoadmap = generateFallbackRoadmap(domain, skills, level, months);
    
    return {
      success: true,
      data: fallbackRoadmap,
      fallback: true,
    };
  }
}
