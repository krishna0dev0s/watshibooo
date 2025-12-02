// Interview Learning Videos API - Fetch best videos for a specific topic

export async function POST(request) {
  try {
    const body = await request.json();
    const { topicTitle, keywords, limit = 5 } = body;

    console.log('[Learning Videos] Fetching videos for:', topicTitle);

    if (!keywords || keywords.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Keywords required"
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // YouTube API key from env
    const youtubeApiKey = process.env.YOUTUBE_API_KEY;
    if (!youtubeApiKey) {
      console.warn('[Learning Videos] YouTube API key not configured');
      // Return mock videos for demo
      return new Response(
        JSON.stringify({
          success: true,
          videos: generateMockVideos(topicTitle, keywords, limit)
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const videos = [];
    
    // Try each keyword to find best videos
    for (const keyword of keywords) {
      if (videos.length >= limit) break;

      try {
        const searchUrl = `https://www.googleapis.com/youtube/v3/search`;
        const queryParams = new URLSearchParams({
          q: keyword,
          part: 'snippet',
          type: 'video',
          maxResults: '3',
          order: 'relevance',
          videoDuration: 'medium',
          key: youtubeApiKey
        });

        const response = await fetch(`${searchUrl}?${queryParams}`);
        const data = await response.json();

        if (data.items) {
          data.items.forEach(item => {
            if (videos.length < limit) {
              videos.push({
                id: item.id.videoId,
                title: item.snippet.title,
                description: item.snippet.description,
                thumbnail: item.snippet.thumbnails.medium.url,
                channelTitle: item.snippet.channelTitle,
                publishedAt: item.snippet.publishedAt,
                keyword: keyword
              });
            }
          });
        }
      } catch (error) {
        console.error(`[Learning Videos] Error fetching for keyword "${keyword}":`, error.message);
      }
    }

    console.log('[Learning Videos] Found', videos.length, 'videos');

    return new Response(
      JSON.stringify({
        success: true,
        topic: topicTitle,
        videosFound: videos.length,
        videos
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Learning Videos] Error:", error.message);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Mock videos for demo when API key not available
function generateMockVideos(topicTitle, keywords, limit) {
  const mockVideos = {
    'arrays': [
      { id: 'dQw4w9WgXcQ', title: 'Arrays Data Structure Tutorial', channelTitle: 'Code Academy', keyword: 'arrays tutorial' },
      { id: 'kgSM9GlCUEI', title: 'Array Algorithms Explained', channelTitle: 'Tech Interview Pro', keyword: 'array algorithms' }
    ],
    'strings': [
      { id: 'i8phT2x0RIE', title: 'String Manipulation Techniques', channelTitle: 'Programming Hub', keyword: 'string tutorial' },
      { id: 'gSvqqw4R0Iw', title: 'String Pattern Matching', channelTitle: 'Algorithm Explained', keyword: 'string patterns' }
    ],
    'trees': [
      { id: 'oSWlakuaoe4', title: 'Binary Trees Complete Guide', channelTitle: 'Code with Harry', keyword: 'binary trees tutorial' },
      { id: '1QSocgJHG7Q', title: 'Tree Traversal Methods', channelTitle: 'Tech Interview Pro', keyword: 'tree traversal' }
    ],
    'graphs': [
      { id: 'rQ0gkZM_7KM', title: 'Graph Algorithms Explained', channelTitle: 'Abdul Bari', keyword: 'graph algorithms' },
      { id: 'CrYvJUeTDQU', title: 'BFS and DFS Tutorial', channelTitle: 'Code Academy', keyword: 'BFS DFS tutorial' }
    ],
    'dynamic': [
      { id: 'gu8-KnB14pE', title: 'Dynamic Programming Tutorial', channelTitle: 'Tech Interview Pro', keyword: 'dynamic programming' },
      { id: '8Tq4c9-iO9Q', title: 'DP Problems Explained', channelTitle: 'Aditya Verma', keyword: 'dp problems' }
    ]
  };

  const keyword = keywords[0].toLowerCase();
  const category = Object.keys(mockVideos).find(key => keyword.includes(key)) || 'coding';
  
  return (mockVideos[category] || mockVideos['coding']).slice(0, limit).map(v => ({
    ...v,
    thumbnail: `https://img.youtube.com/vi/${v.id}/mqdefault.jpg`,
    url: `https://www.youtube.com/watch?v=${v.id}`,
    duration: '12:45',
    views: Math.floor(Math.random() * 500000) + 10000
  }));
}
