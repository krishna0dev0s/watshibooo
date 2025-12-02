// ATS-Optimized Resume Templates
// Each template is designed for 100% ATS score with elegant styling

export const resumeTemplates = [
  {
    id: "modern-clean",
    name: "Modern Clean",
    description: "Minimalist design with clear hierarchy. Perfect for tech roles.",
    colors: {
      primary: "#2563eb",
      secondary: "#1e40af",
      accent: "#f3f4f6",
    },
    theme: "light",
    features: ["ATS-friendly", "Minimalist", "Tech-focused"],
  },
  {
    id: "professional-blue",
    name: "Professional Blue",
    description: "Traditional layout with professional blue accents. Great for corporate roles.",
    colors: {
      primary: "#1e3a8a",
      secondary: "#3b82f6",
      accent: "#f0f9ff",
    },
    theme: "light",
    features: ["ATS-friendly", "Corporate", "Classic"],
  },
  {
    id: "executive-dark",
    name: "Executive Dark",
    description: "Sophisticated dark theme with elegance. For executive positions.",
    colors: {
      primary: "#1f2937",
      secondary: "#6366f1",
      accent: "#f8fafc",
    },
    theme: "dark",
    features: ["ATS-friendly", "Executive", "Elegant"],
  },
  {
    id: "creative-vibrant",
    name: "Creative Vibrant",
    description: "Modern vibrant design with accent colors. For creative professionals.",
    colors: {
      primary: "#7c3aed",
      secondary: "#ec4899",
      accent: "#faf5ff",
    },
    theme: "light",
    features: ["ATS-friendly", "Creative", "Modern"],
  },
  {
    id: "minimal-elegant",
    name: "Minimal Elegant",
    description: "Ultra-clean design with subtle elegance. For all industries.",
    colors: {
      primary: "#000000",
      secondary: "#6b7280",
      accent: "#ffffff",
    },
    theme: "light",
    features: ["ATS-friendly", "Minimal", "Elegant"],
  },
];

export const getTemplateConfig = (templateId) => {
  return resumeTemplates.find((t) => t.id === templateId) || resumeTemplates[0];
};

// Template HTML structures (ATS-optimized)
export const templateHTML = {
  "modern-clean": `
    <div style="font-family: Arial, sans-serif; max-width: 8.5in; margin: 0 auto; padding: 0.5in; color: #1f2937; line-height: 1.6;">
      <!-- Header -->
      <div style="border-bottom: 3px solid #2563eb; padding-bottom: 0.3in; margin-bottom: 0.4in;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #1f2937;">{{FULL_NAME}}</h1>
        <p style="margin: 0.1in 0 0 0; font-size: 11px; color: #6b7280;">{{EMAIL}} • {{PHONE}} • {{LOCATION}}</p>
        <p style="margin: 0.05in 0 0 0; font-size: 11px; color: #6b7280;">{{LINKEDIN}} • {{WEBSITE}}</p>
      </div>

      <!-- Professional Summary -->
      <div style="margin-bottom: 0.35in;">
        <h2 style="margin: 0 0 0.15in 0; font-size: 12px; font-weight: bold; color: #2563eb; text-transform: uppercase; letter-spacing: 1px;">Professional Summary</h2>
        <p style="margin: 0; font-size: 11px; color: #1f2937; line-height: 1.5;">{{SUMMARY}}</p>
      </div>

      <!-- Core Competencies -->
      <div style="margin-bottom: 0.35in;">
        <h2 style="margin: 0 0 0.15in 0; font-size: 12px; font-weight: bold; color: #2563eb; text-transform: uppercase; letter-spacing: 1px;">Core Competencies</h2>
        <p style="margin: 0; font-size: 11px; color: #1f2937; line-height: 1.5;">{{SKILLS}}</p>
      </div>

      <!-- Professional Experience -->
      <div style="margin-bottom: 0.35in;">
        <h2 style="margin: 0 0 0.15in 0; font-size: 12px; font-weight: bold; color: #2563eb; text-transform: uppercase; letter-spacing: 1px;">Professional Experience</h2>
        {{EXPERIENCE}}
      </div>

      <!-- Education -->
      <div style="margin-bottom: 0.35in;">
        <h2 style="margin: 0 0 0.15in 0; font-size: 12px; font-weight: bold; color: #2563eb; text-transform: uppercase; letter-spacing: 1px;">Education</h2>
        {{EDUCATION}}
      </div>

      <!-- Certifications -->
      <div>
        <h2 style="margin: 0 0 0.15in 0; font-size: 12px; font-weight: bold; color: #2563eb; text-transform: uppercase; letter-spacing: 1px;">Certifications</h2>
        <p style="margin: 0; font-size: 11px; color: #1f2937; line-height: 1.5;">{{CERTIFICATIONS}}</p>
      </div>
    </div>
  `,

  "professional-blue": `
    <div style="font-family: 'Calibri', Arial, sans-serif; max-width: 8.5in; margin: 0 auto; padding: 0.5in; color: #1f2937;">
      <!-- Header with Blue Accent -->
      <div style="background-color: #f0f9ff; padding: 0.3in; margin-bottom: 0.4in; border-left: 5px solid #1e3a8a;">
        <h1 style="margin: 0; font-size: 26px; font-weight: bold; color: #1e3a8a;">{{FULL_NAME}}</h1>
        <p style="margin: 0.05in 0 0 0; font-size: 11px; color: #3b82f6;">{{JOB_TITLE}}</p>
        <p style="margin: 0.05in 0 0 0; font-size: 10px; color: #6b7280;">{{EMAIL}} | {{PHONE}} | {{LOCATION}}</p>
      </div>

      <!-- Professional Summary -->
      <div style="margin-bottom: 0.3in;">
        <h2 style="margin: 0 0 0.1in 0; font-size: 11px; font-weight: bold; color: #1e3a8a; border-bottom: 2px solid #3b82f6; padding-bottom: 0.05in;">PROFESSIONAL SUMMARY</h2>
        <p style="margin: 0; font-size: 10px; color: #374151; line-height: 1.4;">{{SUMMARY}}</p>
      </div>

      <!-- Core Competencies -->
      <div style="margin-bottom: 0.3in;">
        <h2 style="margin: 0 0 0.1in 0; font-size: 11px; font-weight: bold; color: #1e3a8a; border-bottom: 2px solid #3b82f6; padding-bottom: 0.05in;">CORE COMPETENCIES</h2>
        <p style="margin: 0; font-size: 10px; color: #374151; line-height: 1.4;">{{SKILLS}}</p>
      </div>

      <!-- Professional Experience -->
      <div style="margin-bottom: 0.3in;">
        <h2 style="margin: 0 0 0.1in 0; font-size: 11px; font-weight: bold; color: #1e3a8a; border-bottom: 2px solid #3b82f6; padding-bottom: 0.05in;">PROFESSIONAL EXPERIENCE</h2>
        {{EXPERIENCE}}
      </div>

      <!-- Education -->
      <div style="margin-bottom: 0.3in;">
        <h2 style="margin: 0 0 0.1in 0; font-size: 11px; font-weight: bold; color: #1e3a8a; border-bottom: 2px solid #3b82f6; padding-bottom: 0.05in;">EDUCATION</h2>
        {{EDUCATION}}
      </div>

      <!-- Certifications -->
      <div>
        <h2 style="margin: 0 0 0.1in 0; font-size: 11px; font-weight: bold; color: #1e3a8a; border-bottom: 2px solid #3b82f6; padding-bottom: 0.05in;">CERTIFICATIONS & LICENSES</h2>
        <p style="margin: 0; font-size: 10px; color: #374151; line-height: 1.4;">{{CERTIFICATIONS}}</p>
      </div>
    </div>
  `,

  "executive-dark": `
    <div style="font-family: Georgia, serif; max-width: 8.5in; margin: 0 auto; padding: 0.5in; background-color: #f8fafc; color: #1f2937;">
      <!-- Elegant Header -->
      <div style="background-color: #1f2937; color: #f8fafc; padding: 0.4in; margin-bottom: 0.4in; text-align: center;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 2px;">{{FULL_NAME}}</h1>
        <p style="margin: 0.1in 0 0 0; font-size: 12px; color: #c7d2e0; letter-spacing: 1px;">{{JOB_TITLE}}</p>
      </div>

      <!-- Contact Info -->
      <div style="text-align: center; font-size: 10px; color: #6b7280; margin-bottom: 0.3in; padding-bottom: 0.2in; border-bottom: 1px solid #d1d5db;">
        <span>{{EMAIL}}</span> | <span>{{PHONE}}</span> | <span>{{LOCATION}}</span>
      </div>

      <!-- Professional Summary -->
      <div style="margin-bottom: 0.35in;">
        <h2 style="margin: 0 0 0.1in 0; font-size: 11px; font-weight: bold; color: #1f2937; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #6366f1; padding-bottom: 0.05in;">Executive Summary</h2>
        <p style="margin: 0; font-size: 10px; color: #374151; line-height: 1.5; font-style: italic;">{{SUMMARY}}</p>
      </div>

      <!-- Core Competencies -->
      <div style="margin-bottom: 0.35in;">
        <h2 style="margin: 0 0 0.1in 0; font-size: 11px; font-weight: bold; color: #1f2937; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #6366f1; padding-bottom: 0.05in;">Core Competencies</h2>
        <p style="margin: 0; font-size: 10px; color: #374151; line-height: 1.5;">{{SKILLS}}</p>
      </div>

      <!-- Professional Experience -->
      <div style="margin-bottom: 0.35in;">
        <h2 style="margin: 0 0 0.1in 0; font-size: 11px; font-weight: bold; color: #1f2937; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #6366f1; padding-bottom: 0.05in;">Professional Experience</h2>
        {{EXPERIENCE}}
      </div>

      <!-- Education -->
      <div style="margin-bottom: 0.35in;">
        <h2 style="margin: 0 0 0.1in 0; font-size: 11px; font-weight: bold; color: #1f2937; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #6366f1; padding-bottom: 0.05in;">Education</h2>
        {{EDUCATION}}
      </div>

      <!-- Certifications -->
      <div>
        <h2 style="margin: 0 0 0.1in 0; font-size: 11px; font-weight: bold; color: #1f2937; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #6366f1; padding-bottom: 0.05in;">Certifications</h2>
        <p style="margin: 0; font-size: 10px; color: #374151; line-height: 1.5;">{{CERTIFICATIONS}}</p>
      </div>
    </div>
  `,

  "creative-vibrant": `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 8.5in; margin: 0 auto; padding: 0.5in; color: #1f2937;">
      <!-- Vibrant Header -->
      <div style="background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%); color: #ffffff; padding: 0.3in; margin-bottom: 0.4in; border-radius: 4px;">
        <h1 style="margin: 0; font-size: 26px; font-weight: bold;">{{FULL_NAME}}</h1>
        <p style="margin: 0.05in 0 0 0; font-size: 11px; color: #faf5ff;">{{JOB_TITLE}}</p>
        <p style="margin: 0.05in 0 0 0; font-size: 10px; color: #f3e8ff;">{{EMAIL}} • {{PHONE}} • {{LOCATION}}</p>
      </div>

      <!-- Professional Summary -->
      <div style="margin-bottom: 0.3in;">
        <h2 style="margin: 0 0 0.1in 0; font-size: 11px; font-weight: bold; color: #7c3aed; text-transform: uppercase; letter-spacing: 1px; border-left: 4px solid #ec4899; padding-left: 0.1in;">Summary</h2>
        <p style="margin: 0; font-size: 10px; color: #374151; line-height: 1.5;">{{SUMMARY}}</p>
      </div>

      <!-- Core Competencies -->
      <div style="margin-bottom: 0.3in;">
        <h2 style="margin: 0 0 0.1in 0; font-size: 11px; font-weight: bold; color: #7c3aed; text-transform: uppercase; letter-spacing: 1px; border-left: 4px solid #ec4899; padding-left: 0.1in;">Core Competencies</h2>
        <p style="margin: 0; font-size: 10px; color: #374151; line-height: 1.5;">{{SKILLS}}</p>
      </div>

      <!-- Professional Experience -->
      <div style="margin-bottom: 0.3in;">
        <h2 style="margin: 0 0 0.1in 0; font-size: 11px; font-weight: bold; color: #7c3aed; text-transform: uppercase; letter-spacing: 1px; border-left: 4px solid #ec4899; padding-left: 0.1in;">Professional Experience</h2>
        {{EXPERIENCE}}
      </div>

      <!-- Education -->
      <div style="margin-bottom: 0.3in;">
        <h2 style="margin: 0 0 0.1in 0; font-size: 11px; font-weight: bold; color: #7c3aed; text-transform: uppercase; letter-spacing: 1px; border-left: 4px solid #ec4899; padding-left: 0.1in;">Education</h2>
        {{EDUCATION}}
      </div>

      <!-- Certifications -->
      <div>
        <h2 style="margin: 0 0 0.1in 0; font-size: 11px; font-weight: bold; color: #7c3aed; text-transform: uppercase; letter-spacing: 1px; border-left: 4px solid #ec4899; padding-left: 0.1in;">Certifications</h2>
        <p style="margin: 0; font-size: 10px; color: #374151; line-height: 1.5;">{{CERTIFICATIONS}}</p>
      </div>
    </div>
  `,

  "minimal-elegant": `
    <div style="font-family: 'Trebuchet MS', Arial, sans-serif; max-width: 8.5in; margin: 0 auto; padding: 0.5in; color: #1f2937; background-color: #ffffff;">
      <!-- Clean Header -->
      <div style="padding-bottom: 0.25in; margin-bottom: 0.3in;">
        <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #000000; letter-spacing: 1px;">{{FULL_NAME}}</h1>
        <div style="font-size: 10px; color: #6b7280; margin-top: 0.08in;">
          <span>{{EMAIL}}</span> • <span>{{PHONE}}</span> • <span>{{LOCATION}}</span>
        </div>
      </div>

      <!-- Thin Separator -->
      <div style="height: 1px; background-color: #d1d5db; margin-bottom: 0.25in;"></div>

      <!-- Professional Summary -->
      <div style="margin-bottom: 0.25in;">
        <h2 style="margin: 0 0 0.08in 0; font-size: 10px; font-weight: bold; color: #000000; text-transform: uppercase; letter-spacing: 1.5px;">Professional Summary</h2>
        <p style="margin: 0; font-size: 10px; color: #374151; line-height: 1.5;">{{SUMMARY}}</p>
      </div>

      <!-- Core Competencies -->
      <div style="margin-bottom: 0.25in;">
        <h2 style="margin: 0 0 0.08in 0; font-size: 10px; font-weight: bold; color: #000000; text-transform: uppercase; letter-spacing: 1.5px;">Core Competencies</h2>
        <p style="margin: 0; font-size: 10px; color: #374151; line-height: 1.5;">{{SKILLS}}</p>
      </div>

      <!-- Professional Experience -->
      <div style="margin-bottom: 0.25in;">
        <h2 style="margin: 0 0 0.08in 0; font-size: 10px; font-weight: bold; color: #000000; text-transform: uppercase; letter-spacing: 1.5px;">Professional Experience</h2>
        {{EXPERIENCE}}
      </div>

      <!-- Education -->
      <div style="margin-bottom: 0.25in;">
        <h2 style="margin: 0 0 0.08in 0; font-size: 10px; font-weight: bold; color: #000000; text-transform: uppercase; letter-spacing: 1.5px;">Education</h2>
        {{EDUCATION}}
      </div>

      <!-- Certifications -->
      <div>
        <h2 style="margin: 0 0 0.08in 0; font-size: 10px; font-weight: bold; color: #000000; text-transform: uppercase; letter-spacing: 1.5px;">Certifications</h2>
        <p style="margin: 0; font-size: 10px; color: #374151; line-height: 1.5;">{{CERTIFICATIONS}}</p>
      </div>
    </div>
  `,
};
