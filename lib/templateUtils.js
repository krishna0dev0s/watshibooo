// Template rendering and ATS optimization utilities
import { templateHTML } from "@/data/resumeTemplates";

/**
 * Renders a resume using the specified template with ATS optimization
 * @param {Object} data - Resume data to render
 * @param {string} templateId - Template ID to use
 * @returns {string} HTML string of rendered resume
 */
export function renderResumeTemplate(data, templateId) {
  let html = templateHTML[templateId] || templateHTML["modern-clean"];

  // Replace all placeholders with data
  const replacements = {
    "{{FULL_NAME}}": data.fullName || "Your Name",
    "{{JOB_TITLE}}": data.jobTitle || "Professional",
    "{{EMAIL}}": data.email || "email@example.com",
    "{{PHONE}}": data.phone || "",
    "{{LOCATION}}": data.location || "City, State",
    "{{LINKEDIN}}": data.linkedin || "",
    "{{WEBSITE}}": data.website || "",
    "{{SUMMARY}}": sanitizeText(data.summary || ""),
    "{{SKILLS}}": sanitizeText(data.skills || ""),
  };

  Object.entries(replacements).forEach(([key, value]) => {
    html = html.split(key).join(value);
  });

  // Render experience section
  const experienceHtml = renderExperience(data.experience || []);
  html = html.split("{{EXPERIENCE}}").join(experienceHtml);

  // Render education section
  const educationHtml = renderEducation(data.education || []);
  html = html.split("{{EDUCATION}}").join(educationHtml);

  // Render certifications
  html = html.split("{{CERTIFICATIONS}}").join(sanitizeText(data.certifications || ""));

  return html;
}

/**
 * Renders experience entries with ATS-friendly formatting
 * @param {Array} experience - Experience array
 * @returns {string} HTML formatted experience section
 */
function renderExperience(experience) {
  if (experience.length === 0) return "";

  return experience
    .map((exp) => {
      const bullets = (exp.description || "")
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => `<li style="margin-bottom: 0.05in; line-height: 1.4;">${sanitizeText(line.trim())}</li>`)
        .join("");

      return `<div style="margin-bottom: 0.15in;">
        <p style="margin: 0; font-weight: bold; font-size: 11px; color: #1f2937;">${sanitizeText(
          exp.jobTitle
        )}</p>
        <p style="margin: 0.03in 0 0 0; font-size: 10px; color: #6b7280;">${sanitizeText(
          exp.company
        )} | ${sanitizeText(exp.duration)}</p>
        <ul style="margin: 0.05in 0 0 0.2in; padding: 0; list-style-position: inside;">
          ${bullets}
        </ul>
      </div>`;
    })
    .join("");
}

/**
 * Renders education entries with ATS-friendly formatting
 * @param {Array} education - Education array
 * @returns {string} HTML formatted education section
 */
function renderEducation(education) {
  if (education.length === 0) return "";

  return education
    .map(
      (edu) =>
        `<p style="margin: 0.05in 0; font-size: 10px; color: #374151; line-height: 1.4;">
          <strong>${sanitizeText(edu.degree)}</strong> from ${sanitizeText(edu.school)}${
          edu.graduationDate ? ` (${sanitizeText(edu.graduationDate)})` : ""
        }
        </p>`
    )
    .join("");
}

/**
 * Sanitizes text to prevent XSS and ensure ATS compatibility
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
function sanitizeText(text) {
  if (!text) return "";

  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\n/g, "<br>");
}

/**
 * Extracts plain text from HTML for ATS systems that strip formatting
 * @param {string} html - HTML string to extract from
 * @returns {string} Plain text version
 */
export function extractPlainText(html) {
  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, "");
  // Decode HTML entities
  text = text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&");
  // Clean up whitespace
  text = text.replace(/\s+/g, " ").trim();
  return text;
}

/**
 * Validates resume data for completeness and ATS compatibility
 * @param {Object} data - Resume data to validate
 * @returns {Object} Validation result with isValid and errors
 */
export function validateResumeData(data) {
  const errors = [];

  if (!data.fullName?.trim()) {
    errors.push("Full name is required");
  }

  if (!data.email?.trim()) {
    errors.push("Email is required");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push("Valid email format is required");
  }

  if (!data.phone?.trim()) {
    errors.push("Phone number is required");
  }

  if (!data.location?.trim()) {
    errors.push("Location is required");
  }

  if (!data.summary?.trim() && data.experience?.length === 0) {
    errors.push("Either a summary or work experience is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Calculates ATS compatibility score (0-100)
 * @param {Object} data - Resume data to score
 * @returns {number} ATS score from 0-100
 */
export function calculateATSScore(data) {
  let score = 0;

  // Full name (10 points)
  if (data.fullName?.trim()) score += 10;

  // Contact info (20 points)
  if (data.email?.trim()) score += 7;
  if (data.phone?.trim()) score += 7;
  if (data.location?.trim()) score += 6;

  // Professional summary (15 points)
  if (data.summary?.trim() && data.summary.length > 20) score += 15;

  // Skills (15 points)
  if (data.skills?.trim()) {
    const skillCount = data.skills.split(/[,;]/).length;
    score += Math.min(15, skillCount * 2);
  }

  // Experience (20 points)
  if (data.experience && data.experience.length > 0) {
    score += Math.min(20, data.experience.length * 5);
  }

  // Education (10 points)
  if (data.education && data.education.length > 0) {
    score += 10;
  }

  // Keywords and length (10 points)
  const totalLength = JSON.stringify(data).length;
  if (totalLength > 1000) score += 10;

  return Math.min(100, score);
}

/**
 * Generates ATS optimization recommendations
 * @param {Object} data - Resume data to analyze
 * @returns {Array} Array of recommendation strings
 */
export function getATSRecommendations(data) {
  const recommendations = [];

  if (!data.summary?.trim()) {
    recommendations.push("Add a professional summary to highlight key achievements");
  } else if (data.summary.length < 50) {
    recommendations.push("Expand your professional summary with more details");
  }

  if (!data.skills?.trim()) {
    recommendations.push("Add skills section with relevant industry keywords");
  }

  if (!data.experience || data.experience.length === 0) {
    recommendations.push("Add your work experience with quantified achievements");
  } else {
    data.experience.forEach((exp) => {
      if (!exp.description || exp.description.length < 30) {
        recommendations.push(
          `Expand description for "${exp.jobTitle}" position with bullet points`
        );
      }
    });
  }

  if (!data.education || data.education.length === 0) {
    recommendations.push("Add your education details");
  }

  if (data.linkedin?.trim()) {
    recommendations.push("✓ LinkedIn profile included - great for credibility");
  }

  return recommendations;
}
