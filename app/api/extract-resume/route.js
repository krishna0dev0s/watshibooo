import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function extractTextFromPDF(buffer) {
  try {
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error("PDF parsing error:", error);
    try {
      return buffer.toString("utf-8");
    } catch {
      throw new Error("Failed to parse PDF or extract text");
    }
  }
}

export async function POST(req) {
  try {
    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: "GEMINI_API_KEY not configured" },
        { status: 500 }
      );
    }

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
      resumeText = new TextDecoder().decode(buffer);
    }

    if (!resumeText || resumeText.trim().length === 0) {
      return Response.json(
        { error: "Could not extract text from resume" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Extract all resume information from the following text and return a structured JSON format. Be thorough and extract everything.

Resume Text:
${resumeText}

Return ONLY valid JSON in this exact format (no other text):
{
  "personalInfo": {
    "fullName": "Full name",
    "email": "Email address",
    "phone": "Phone number",
    "location": "City, State",
    "linkedIn": "LinkedIn URL or profile"
  },
  "summary": "Professional summary or objective (2-3 sentences)",
  "skills": ["Skill 1", "Skill 2", "Skill 3"],
  "experience": [
    {
      "jobTitle": "Job title",
      "company": "Company name",
      "duration": "Jan 2020 - Dec 2021",
      "description": "Description of responsibilities and achievements"
    }
  ],
  "education": [
    {
      "degree": "Degree name (e.g., Bachelor of Science in Computer Science)",
      "school": "University/School name",
      "graduationDate": "May 2019"
    }
  ],
  "certifications": ["Certification 1", "Certification 2"]
}

Extract all information accurately. If information is not present, use empty strings or empty arrays.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json(
        { error: "Failed to parse resume data" },
        { status: 500 }
      );
    }

    const resumeData = JSON.parse(jsonMatch[0]);

    return Response.json({ resumeData }, { status: 200 });
  } catch (error) {
    console.error("Resume extraction error:", error);
    return Response.json(
      { error: error.message || "Failed to extract resume" },
      { status: 500 }
    );
  }
}
