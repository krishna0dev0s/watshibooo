'use server';

export async function generateLearningPathFromRoadmap(roadmapData) {
  try {
    console.log('[Generate Learning Path] Processing roadmap:', {
      domain: roadmapData.domain,
      phases: roadmapData.data.phases.length,
      skills: roadmapData.skills
    });

    if (!roadmapData.data.phases || roadmapData.data.phases.length === 0) {
      return {
        success: false,
        error: "Invalid roadmap structure"
      };
    }

    // Build learning path with phases and topics
    const learningPath = {
      title: `${roadmapData.domain} Learning Path`,
      description: roadmapData.data.overview || `Complete learning path for ${roadmapData.domain}`,
      domain: roadmapData.domain,
      skills: roadmapData.skills,
      level: roadmapData.level,
      months: roadmapData.months,
      phases: roadmapData.data.phases.map((phase, index) => ({
        id: `phase-${index}`,
        phaseNumber: phase.phaseNumber || index + 1,
        name: phase.name,
        duration: phase.duration,
        topics: (phase.topics || []).map((topic, topicIndex) => ({
          id: `topic-${index}-${topicIndex}`,
          title: topic,
          phaseId: `phase-${index}`,
          type: 'topic',
          searchKeywords: generateSearchKeywords(topic, roadmapData.domain)
        })),
        completed: false
      })),
      roadmapId: `roadmap-${Date.now()}`,
      createdAt: new Date().toISOString(),
      totalTopics: roadmapData.data.phases.reduce((sum, phase) => sum + (phase.topics?.length || 0), 0)
    };

    console.log('[Generate Learning Path] Generated learning path with', learningPath.phases.length, 'phases');

    return {
      success: true,
      data: learningPath
    };
  } catch (error) {
    console.error('[Generate Learning Path] Error:', error.message);
    return {
      success: false,
      error: error.message || "Failed to generate learning path from roadmap"
    };
  }
}

function generateSearchKeywords(topic, domain) {
  const keywords = [topic.toLowerCase()];
  
  // Add domain-specific keywords
  if (domain.toLowerCase() !== topic.toLowerCase()) {
    keywords.push(`${domain.toLowerCase()} ${topic.toLowerCase()}`);
  }
  
  // Add common variations
  keywords.push(`learn ${topic.toLowerCase()}`);
  keywords.push(`${topic.toLowerCase()} tutorial`);
  
  return keywords;
}
