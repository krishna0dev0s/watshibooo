import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: "GEMINI_API_KEY not configured" },
        { status: 500 }
      );
    }

    const { resumeData } = await req.json();

    if (!resumeData) {
      return Response.json(
        { error: "No resume data provided" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Build detailed context from extracted data
    const personalInfoText = resumeData.personalInfo 
      ? `${resumeData.personalInfo.fullName || ''}
${resumeData.personalInfo.email ? '📧 ' + resumeData.personalInfo.email : ''}${resumeData.personalInfo.phone ? ' | 📱 ' + resumeData.personalInfo.phone : ''}
${resumeData.personalInfo.location || ''}${resumeData.personalInfo.linkedIn ? ' | LinkedIn: ' + resumeData.personalInfo.linkedIn : ''}`
      : '';

    const skillsText = resumeData.skills && resumeData.skills.length > 0 
      ? resumeData.skills.join(', ')
      : '';

    const experienceText = resumeData.experience && resumeData.experience.length > 0
      ? resumeData.experience.map(exp => 
          `${exp.jobTitle} at ${exp.company} (${exp.duration || 'Dates not specified'})
${exp.description || 'Responsibilities and achievements'}`
        ).join('\n\n')
      : '';

    const educationText = resumeData.education && resumeData.education.length > 0
      ? resumeData.education.map(edu => 
          `${edu.degree} from ${edu.school} (${edu.graduationDate || 'Date not specified'})`
        ).join('\n')
      : '';

    const certificationsText = resumeData.certifications && resumeData.certifications.length > 0
      ? resumeData.certifications.join(', ')
      : '';

    const prompt = `You are an elite professional resume writer with 20+ years of experience in creating ATS-optimized, powerful resumes. Your task is to create ONE polished, ATS-optimized, and highly detailed resume using EXACTLY the information provided below. This should be the BEST version possible - select the most compelling format and language without offering alternatives.

=== EXTRACTED RESUME DATA ===

PERSONAL INFORMATION:
${personalInfoText}

PROFESSIONAL SUMMARY:
${resumeData.summary || 'Not provided'}

SKILLS:
${skillsText || 'Not provided'}

WORK EXPERIENCE:
${experienceText || 'Not provided'}

EDUCATION:
${educationText || 'Not provided'}

CERTIFICATIONS & LICENSES:
${certificationsText || 'Not provided'}

=== RESUME FORMATTING REQUIREMENTS ===

Create a SINGLE, FINAL comprehensive resume that:

1. **HEADER SECTION:**
   - Full name (large, prominent)
   - Email address
   - Phone number
   - Location (City, State)
   - LinkedIn profile (if provided)
   - Professional title/headline (derived from most recent position)

2. **PROFESSIONAL SUMMARY (if provided):**
   - 2-4 sentences highlighting key strengths and unique value proposition
   - Make it compelling, specific, and tailored to the person's background
   - Include 1-2 key achievements or specialties

3. **CORE COMPETENCIES/SKILLS (if provided):**
   - Organize skills into 3-5 strategic categories (e.g., Technical, Leadership, Domain Expertise, Tools & Platforms)
   - Use bullet points for clarity
   - List skills from most to least relevant
   - Prioritize skills that match current industry demand

4. **PROFESSIONAL EXPERIENCE (if provided):**
   - For each position (latest first), include:
     * Job Title (bold)
     * Company Name | Location (if available)
     * Dates (Month Year - Month Year or Current)
     * 4-6 powerful bullet points with strong action verbs
     * Quantify achievements with numbers, percentages, $ amounts, or business impact metrics
     * Show impact and results, not just responsibilities
   - Start each bullet with powerful action verbs: Achieved, Increased, Reduced, Led, Developed, Managed, Implemented, Optimized, Streamlined, Generated, etc.
   - Make accomplishments specific, measurable, and compelling
   - Include relevant technologies and methodologies used

5. **EDUCATION (if provided):**
   - Degree name
   - School/University name
   - Graduation date (Month Year)
   - GPA (if 3.5 or higher)
   - Relevant honors or distinctions (if any)

6. **CERTIFICATIONS & LICENSES (if provided):**
   - List each certification with:
     * Certification name
     * Issuing organization
     * Date obtained
     * License ID (if applicable and adds credibility)

=== ATS OPTIMIZATION REQUIREMENTS ===
- Use simple, clear formatting with standard fonts (no graphics, tables, or unusual formatting)
- Clean section headers with consistent capitalization
- Proper spacing and line breaks for readability
- No special characters or symbols except standard punctuation
- Strong keyword density for industry-relevant terms
- Chronological order for experience and education
- Readable in all ATS systems without loss of formatting

=== STYLE GUIDELINES ===
- Use clean, professional formatting throughout
- ATS-optimized (simple fonts, no graphics, clear section headers)
- Proper grammar, spelling, and punctuation
- Consistent formatting and styling
- Professional, confident tone
- Concise yet comprehensive
- Ready for immediate submission to employers
- Optimized for both human readers and ATS parsing

=== CRITICAL INSTRUCTIONS ===
- Generate ONLY ONE resume - the best possible version
- Use ONLY the data provided. Do NOT make up achievements, skills, or experience
- If a section is marked "Not provided", exclude it entirely
- Focus on selecting the BEST language, format, and presentation for each element
- Do not provide multiple options or variations
- Do not include explanations or meta text
- Start directly with the name and end with the final section

Return the complete, professional, ATS-optimized resume text ready for submission.`;

    const result = await model.generateContent(prompt);
    const resume = result.response.text();

    return Response.json({ resume }, { status: 200 });
  } catch (error) {
    console.error("Resume generation error:", error);
    return Response.json(
      { error: error.message || "Failed to generate resume" },
      { status: 500 }
    );
  }
}
