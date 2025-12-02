export async function POST(request) {
  try {
    const { topic } = await request.json();

    if (!topic || typeof topic !== "string") {
      return Response.json(
        { error: "Invalid topic provided" },
        { status: 400 }
      );
    }

    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

    if (!YOUTUBE_API_KEY) {
      console.error("YouTube API key is not configured");
      return Response.json(
        { error: "YouTube API is not configured. Please set YOUTUBE_API_KEY in environment variables." },
        { status: 500 }
      );
    }

    // Add educational keywords to search query
    const educationalKeywords = [
      "tutorial",
      "course",
      "lesson",
      "guide",
      "learn",
      "education",
      "how to",
      "step by step",
      "advanced",
      "beginner",
      "intermediate",
      "series",
      "complete",
      "full"
    ];
    
    // Create a search query that emphasizes structured educational content
    const searchQuery = `${topic} complete course tutorial series step by step`;

    // Search YouTube for videos
    const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    searchUrl.searchParams.append("q", searchQuery);
    searchUrl.searchParams.append("part", "snippet");
    searchUrl.searchParams.append("type", "video");
    searchUrl.searchParams.append("maxResults", "50");
    searchUrl.searchParams.append("order", "relevance");
    searchUrl.searchParams.append("videoCaption", "closedCaption");
    searchUrl.searchParams.append("safeSearch", "strict");
    searchUrl.searchParams.append("key", YOUTUBE_API_KEY);

    const searchResponse = await fetch(searchUrl.toString());

    if (!searchResponse.ok) {
      throw new Error(`YouTube API error: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      return Response.json({ videos: [] });
    }

    // Get video IDs
    const videoIds = searchData.items.map((item) => item.id.videoId).join(",");

    // Get video statistics and details
    const statsUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
    statsUrl.searchParams.append("id", videoIds);
    statsUrl.searchParams.append("part", "statistics,contentDetails,topicDetails,snippet");
    statsUrl.searchParams.append("key", YOUTUBE_API_KEY);

    const statsResponse = await fetch(statsUrl.toString());

    if (!statsResponse.ok) {
      throw new Error(`YouTube API stats error: ${statsResponse.status}`);
    }

    const statsData = await statsResponse.json();

    // Create a map of video statistics
    const statsMap = {};
    statsData.items?.forEach((item) => {
      statsMap[item.id] = {
        viewCount: parseInt(item.statistics?.viewCount || 0),
        likeCount: parseInt(item.statistics?.likeCount || 0),
        commentCount: parseInt(item.statistics?.commentCount || 0),
        duration: item.contentDetails?.duration || "PT0S",
        topics: item.topicDetails?.topicCategories || [],
      };
    });

    // Transform and filter the response
    let videos = searchData.items
      .map((item) => {
        const stats = statsMap[item.id.videoId] || {};
        const description = item.snippet.description?.toLowerCase() || "";
        const title = item.snippet.title?.toLowerCase() || "";
        
        // Calculate educational score - prioritize structured content
        let educationalScore = 0;
        
        // Check for structured course keywords (higher weight)
        const structuredKeywords = ["complete", "course", "series", "tutorial", "full", "step by step"];
        structuredKeywords.forEach((keyword) => {
          if (title.includes(keyword)) educationalScore += 5;
          if (description.includes(keyword)) educationalScore += 2;
        });
        
        // Check for other educational keywords
        educationalKeywords.forEach((keyword) => {
          if (title.includes(keyword)) educationalScore += 3;
          if (description.includes(keyword)) educationalScore += 1;
        });
        
        // Penalize videos with "intro" only if they don't have other structured keywords
        if (title.includes("intro") && educationalScore < 5) {
          educationalScore -= 3;
        }

        // Calculate engagement score (likes + comments per view)
        const viewCount = stats.viewCount || 1;
        const engagementRate = ((stats.likeCount || 0) + (stats.commentCount || 0)) / viewCount;
        
        // Prefer videos with good engagement and reasonable view count
        let qualityScore = 0;
        if (viewCount > 100000) qualityScore += 2;
        if (viewCount > 1000000) qualityScore += 2;
        if (viewCount > 10000000) qualityScore += 1; // Avoid extremely viral videos
        if (engagementRate > 0.01) qualityScore += 2;
        if (engagementRate > 0.05) qualityScore += 1;

        // Avoid shorts and very short videos
        const durationInSeconds = parseDuration(stats.duration);
        if (durationInSeconds < 120) qualityScore -= 5; // Penalize videos shorter than 2 minutes
        if (durationInSeconds > 300 && durationInSeconds < 3600) qualityScore += 2; // Prefer 5-60 min videos
        if (durationInSeconds >= 3600) qualityScore += 1; // Long videos (structured courses)

        const totalScore = educationalScore + qualityScore;

        return {
          videoId: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.medium?.url,
          channelTitle: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
          ...stats,
          qualityScore,
          educationalScore,
          totalScore,
        };
      })
      // Filter to keep only videos with decent educational score
      .filter((video) => video.educationalScore > 0)
      // Sort by total score (educational + quality)
      .sort((a, b) => b.totalScore - a.totalScore)
      // Take top 12
      .slice(0, 12)
      // Remove scoring fields before sending
      .map(({ qualityScore, educationalScore, totalScore, ...video }) => video);

    return Response.json({ videos });
  } catch (error) {
    console.error("YouTube API error:", error);
    return Response.json(
      { error: "Failed to fetch videos from YouTube" },
      { status: 500 }
    );
  }
}

// Helper function to parse ISO 8601 duration
function parseDuration(duration) {
  if (!duration) return 0;
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0;
  const hours = (match[1]?.replace("H", "") || 0) * 3600;
  const minutes = (match[2]?.replace("M", "") || 0) * 60;
  const seconds = parseInt(match[3]?.replace("S", "") || 0);
  return hours + minutes + seconds;
}
