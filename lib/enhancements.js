/**
 * Professional Enhancement Functions
 * Market-standard features for production apps
 */

// Export tracking and analytics
export const trackUserAction = async (action, metadata = {}) => {
  try {
    // Future: Send to analytics service
    console.log(`[Analytics] ${action}`, metadata);
    // Broadcast an in-browser event so client analytics pages can refresh in real-time
    try {
      if (typeof window !== "undefined" && typeof CustomEvent !== "undefined") {
        window.dispatchEvent(new CustomEvent("analytics:update", { detail: { action, metadata } }));
      }
    } catch (e) {
      // non-fatal - continue
    }
  } catch (error) {
    console.error("Analytics error:", error);
  }
};

// Resume quality scoring (professional ATS analysis)
export const calculateAtsScore = (resume) => {
  let score = 0;
  const feedback = [];

  // Check for key sections (25 points)
  const sections = ["experience", "education", "skills"];
  const presentSections = sections.filter(s => resume[s]?.length > 0).length;
  score += (presentSections / sections.length) * 25;
  if (presentSections < sections.length) {
    feedback.push(`Add missing sections: ${sections.filter(s => !resume[s]).join(", ")}`);
  }

  // Check keyword density (20 points)
  const keywords = resume.skills || [];
  if (keywords.length >= 10) score += 20;
  else if (keywords.length >= 5) score += 10;
  else feedback.push("Add more relevant keywords and skills");

  // Check experience depth (20 points)
  const experienceLength = resume.experience?.reduce((acc, exp) => acc + (exp.description?.length || 0), 0) || 0;
  if (experienceLength > 300) score += 20;
  else if (experienceLength > 100) score += 10;
  else feedback.push("Expand experience descriptions with achievements");

  // Check formatting (15 points)
  const hasEmail = resume.email?.includes("@");
  const hasPhone = resume.phone?.length >= 10;
  const hasLinks = resume.portfolio || resume.linkedin;
  if (hasEmail && hasPhone && hasLinks) score += 15;
  else {
    if (!hasEmail) feedback.push("Add professional email");
    if (!hasPhone) feedback.push("Add phone number");
    if (!hasLinks) feedback.push("Add portfolio or LinkedIn link");
  }

  // Check for action verbs (10 points)
  const actionVerbs = ["managed", "led", "achieved", "improved", "created", "designed", "developed"];
  const experienceText = resume.experience?.map(e => e.description?.toLowerCase()).join(" ") || "";
  const verbCount = actionVerbs.filter(verb => experienceText.includes(verb)).length;
  if (verbCount >= 5) score += 10;
  else feedback.push("Use more action verbs in experience descriptions");

  // Check length (10 points)
  const totalLength = JSON.stringify(resume).length;
  if (totalLength > 1000 && totalLength < 5000) score += 10;
  else if (totalLength < 1000) feedback.push("Resume content is too brief");

  return {
    score: Math.min(100, Math.max(0, score)),
    feedback,
    strengths: ["Professional structure", "Clear formatting", "Complete information"],
    improvements: feedback,
  };
};

// Interview performance analysis
export const analyzeInterviewPerformance = (assessments) => {
  if (!assessments || assessments.length === 0) {
    return { averageScore: 0, trend: "neutral", insights: [] };
  }

  const scores = assessments.map(a => a.score || 0);
  const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  
  const recent = assessments.slice(-3);
  const recentAvg = recent.reduce((a, b) => a + (b.score || 0), 0) / recent.length;
  const trend = recentAvg > averageScore ? "improving" : recentAvg < averageScore ? "declining" : "stable";

  const insights = [];
  if (averageScore >= 80) insights.push("Excellent performance - you're interview ready!");
  else if (averageScore >= 60) insights.push("Good foundation - focus on weaker areas");
  else insights.push("Keep practicing - consistency is key");

  if (trend === "improving") insights.push("Great progress - maintain this momentum!");
  else if (trend === "declining") insights.push("Review recent attempts to identify gaps");

  return { averageScore, trend, insights };
};

// Cover letter optimization
export const suggestCoverLetterImprovements = (letterContent) => {
  const suggestions = [];
  const content = letterContent.toLowerCase();

  // Check for personalization
  if (!content.includes("company name") && !content.includes("hiring manager")) {
    suggestions.push("Personalize the letter with company and hiring manager names");
  }

  // Check for specific examples
  if (!content.match(/\b(achieved|created|led|improved|delivered)\b/g) || 
      !content.match(/\b(achieved|created|led|improved|delivered)\b/g).length < 3) {
    suggestions.push("Include 3+ specific achievements with quantifiable results");
  }

  // Check for research evidence
  if (!content.includes("your company") && !content.includes("your mission")) {
    suggestions.push("Show you've researched the company and understand their mission");
  }

  // Check length
  const wordCount = letterContent.split(/\s+/).length;
  if (wordCount < 150) suggestions.push("Expand your letter - aim for 200-300 words");
  else if (wordCount > 400) suggestions.push("Condense your letter - keep it concise");

  // Check for enthusiasm
  if (!content.match(/\b(excited|passionate|enthusiastic|thrilled)\b/g)) {
    suggestions.push("Express genuine enthusiasm for the role and company");
  }

  return suggestions;
};

// LeetCode problem categorization and recommendations
export const categorizeLeetCodeProblem = (problem) => {
  const categories = [];
  const tags = problem.tags || [];

  // Determine difficulty level
  const difficulty = problem.difficulty || "Unknown";
  
  // Suggest learning resources
  const resources = [];
  if (tags.includes("array")) resources.push("Array manipulation fundamentals");
  if (tags.includes("dynamic-programming")) resources.push("DP problem-solving patterns");
  if (tags.includes("graph")) resources.push("Graph traversal algorithms");
  if (tags.includes("string")) resources.push("String processing techniques");
  if (tags.includes("tree")) resources.push("Tree data structure concepts");

  return {
    category: tags[0] || "General",
    difficulty,
    resources,
    relatedProblems: generateRelatedProblems(tags),
  };
};

// Related problems generator
const generateRelatedProblems = (tags) => {
  // Placeholder - would fetch from database in production
  return {
    recommended: 5,
    reason: `Based on ${tags[0] || "general"} problems you've solved`,
  };
};

// Roadmap progress calculator
export const calculateRoadmapProgress = (roadmap, completedPhases) => {
  const totalPhases = roadmap.phases?.length || 0;
  const completedCount = completedPhases?.length || 0;
  const progress = totalPhases > 0 ? (completedCount / totalPhases) * 100 : 0;

  const timeRemaining = calculateTimeRemaining(roadmap, completedCount);

  return {
    completionPercentage: Math.round(progress),
    phasesCompleted: completedCount,
    totalPhases,
    timeRemaining,
    estimatedCompletion: calculateEstimatedDate(timeRemaining),
  };
};

const calculateTimeRemaining = (roadmap, completedCount) => {
  const monthsPerPhase = (roadmap.months || 12) / (roadmap.phases?.length || 1);
  return Math.ceil((roadmap.phases?.length - completedCount) * monthsPerPhase);
};

const calculateEstimatedDate = (monthsRemaining) => {
  const date = new Date();
  date.setMonth(date.getMonth() + monthsRemaining);
  return date.toLocaleDateString();
};

// Export recommendation engine
export const generateCareerRecommendations = (userProfile) => {
  const recommendations = [];

  // Based on resume quality
  if (userProfile.atsScore < 60) {
    recommendations.push({
      priority: "high",
      action: "Improve Resume",
      reason: "Your ATS score is below optimal",
    });
  }

  // Based on interview performance
  if (userProfile.averageInterviewScore < 70) {
    recommendations.push({
      priority: "high",
      action: "Practice Interview Skills",
      reason: "Focus on behavioral and technical questions",
    });
  }

  // Based on learning progress
  if (userProfile.roadmapProgress < 30) {
    recommendations.push({
      priority: "medium",
      action: "Accelerate Learning",
      reason: "You're behind on your learning roadmap",
    });
  }

  // Based on skill gaps
  if (userProfile.missingSkills?.length > 0) {
    recommendations.push({
      priority: "medium",
      action: "Fill Skill Gaps",
      reason: `Focus on: ${userProfile.missingSkills.join(", ")}`,
    });
  }

  return recommendations;
};

// Email verification and notifications
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Data export functionality
export const exportToJSON = (data, filename = "data") => {
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}-${Date.now()}.json`;
  link.click();
};

// Performance optimization helpers
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Cache management
export const cacheData = (key, data, ttl = 3600000) => {
  const cached = {
    data,
    timestamp: Date.now(),
    ttl,
  };
  localStorage.setItem(`cache_${key}`, JSON.stringify(cached));
};

export const getCachedData = (key) => {
  const cached = localStorage.getItem(`cache_${key}`);
  if (!cached) return null;

  const parsed = JSON.parse(cached);
  if (Date.now() - parsed.timestamp > parsed.ttl) {
    localStorage.removeItem(`cache_${key}`);
    return null;
  }

  return parsed.data;
};

// Error handling
export const handleError = (error, context = "") => {
  console.error(`Error in ${context}:`, error);
  return {
    success: false,
    error: error.message || "An error occurred",
    context,
  };
};

// Notification system
export const showNotification = (type, message, duration = 3000) => {
  // Would integrate with toast system
  return {
    type,
    message,
    duration,
    id: Date.now(),
  };
};
