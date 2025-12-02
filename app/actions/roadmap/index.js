'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateRoadmapContent({ domain, skills, level, months }) {
  try {
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

Format the response as a structured JSON object with the following schema:
{
  "overview": "string",
  "prerequisites": ["string"],
  "timeline": "string",
  "phases": [
    {
      "phaseNumber": number,
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

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse roadmap data");
    }

    const roadmapData = JSON.parse(jsonMatch[0]);
    return {
      success: true,
      data: roadmapData,
    };
  } catch (error) {
    console.error("Error generating roadmap:", error);
    return {
      success: false,
      error: error.message || "Failed to generate roadmap",
    };
  }
}
