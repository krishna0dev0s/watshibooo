import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, PlayCircle, BookOpen, Clock } from 'lucide-react';

export function InterviewLearningRoadmap({ role = 'Software Engineer', company, level = 'intermediate' }) {
  const [roadmap, setRoadmap] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [videos, setVideos] = useState(null);
  const [loadingRoadmap, setLoadingRoadmap] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [completedTopics, setCompletedTopics] = useState({});

  // Fetch learning topics
  useEffect(() => {
    fetchRoadmap();
  }, [role, level]);

  const fetchRoadmap = async () => {
    try {
      setLoadingRoadmap(true);
      const response = await fetch('/api/interview/learning-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, company, level })
      });

      const data = await response.json();
      if (data.success) {
        setRoadmap(data.data);
      }
    } catch (error) {
      console.error('Error fetching roadmap:', error);
    } finally {
      setLoadingRoadmap(false);
    }
  };

  const fetchVideos = async (topic) => {
    try {
      setLoadingVideos(true);
      setSelectedTopic(topic);

      const response = await fetch('/api/interview/learning-videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicTitle: topic.title,
          keywords: topic.videoKeywords || [topic.title.toLowerCase()],
          limit: 6
        })
      });

      const data = await response.json();
      if (data.success) {
        setVideos(data.videos);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoadingVideos(false);
    }
  };

  const toggleComplete = (topicId) => {
    setCompletedTopics(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

  if (loadingRoadmap) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin">Loading roadmap...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Interview Learning Roadmap
        </h1>
        <p className="text-gray-600">
          {role} at {company || 'Your Company'} • {level} level
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roadmap Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Learning Topics</CardTitle>
              <CardDescription>
                {Object.keys(completedTopics).filter(t => completedTopics[t]).length} / {roadmap?.topics?.length || 0} completed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {roadmap?.topics?.map((topic, index) => (
                <button
                  key={topic.id}
                  onClick={() => fetchVideos(topic)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedTopic?.id === topic.id
                      ? 'bg-blue-100 border-l-4 border-blue-500'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 mt-1">
                      {completedTopics[topic.id] ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{index + 1}. {topic.title}</p>
                      <p className="text-xs text-gray-600 line-clamp-1">
                        {topic.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTopic ? (
            <>
              {/* Topic Details */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle>{selectedTopic.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {selectedTopic.description}
                      </CardDescription>
                    </div>
                    <Button
                      variant={completedTopics[selectedTopic.id] ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleComplete(selectedTopic.id)}
                    >
                      {completedTopics[selectedTopic.id] ? '✓ Completed' : 'Mark Complete'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                        <Clock className="w-4 h-4" />
                        Estimated Time
                      </div>
                      <p className="text-gray-600">{selectedTopic.estimatedTime}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                        <BookOpen className="w-4 h-4" />
                        Skills Covered
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {selectedTopic.skills?.slice(0, 3).map(skill => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Key Points</h4>
                    <ul className="space-y-1">
                      {selectedTopic.keyPoints?.map((point, i) => (
                        <li key={i} className="text-sm text-gray-700 flex gap-2">
                          <span className="text-blue-500">•</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Videos Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <PlayCircle className="w-5 h-5" />
                  Learning Videos
                </h3>

                {loadingVideos ? (
                  <div className="text-center py-8">Loading videos...</div>
                ) : videos && videos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {videos.map(video => (
                      <a
                        key={video.id}
                        href={`https://www.youtube.com/watch?v=${video.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group cursor-pointer"
                      >
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="relative overflow-hidden bg-black">
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className="w-full h-40 object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                              <PlayCircle className="w-12 h-12 text-white" />
                            </div>
                          </div>
                          <CardContent className="pt-3">
                            <p className="text-sm font-semibold line-clamp-2 group-hover:text-blue-600">
                              {video.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {video.channelTitle}
                            </p>
                            {video.views && (
                              <p className="text-xs text-gray-500 mt-1">
                                {(video.views / 1000).toFixed(0)}K views
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      </a>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center">
                    <p className="text-gray-600">No videos found. Click on a topic to fetch videos.</p>
                  </Card>
                )}
              </div>
            </>
          ) : (
            <Card className="p-8 text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Select a topic to view learning resources</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
