'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, PlayCircle, BookOpen, Clock, ChevronDown, AlertCircle } from 'lucide-react';

export function InterviewLearningRoadmap({ role = 'Software Engineer', company, level = 'intermediate' }) {
  const [roadmap, setRoadmap] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loadingRoadmap, setLoadingRoadmap] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [completedTopics, setCompletedTopics] = useState({});
  const [error, setError] = useState(null);
  const [expandedPhases, setExpandedPhases] = useState({
    foundation: true,
    intermediate: true,
    advanced: false,
    expert: false
  });

  // Fetch learning topics
  useEffect(() => {
    fetchRoadmap();
  }, [role, level]);

  const fetchRoadmap = async () => {
    try {
      setLoadingRoadmap(true);
      setError(null);
      console.log('[Component] Fetching roadmap for:', { role, company, level });
      
      const response = await fetch('/api/interview/learning-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, company, level })
      });

      console.log('[Component] Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[Component] Received data:', data);

      if (data.success && data.data) {
        setRoadmap(data.data);
        
        // Auto-select first topic if available
        if (data.data.topics && data.data.topics.length > 0) {
          setSelectedTopic(data.data.topics[0]);
          fetchVideos(data.data.topics[0]);
        }
      } else {
        throw new Error('Invalid response format: missing success or data');
      }
    } catch (error) {
      console.error('[Component] Error fetching roadmap:', error);
      setError(error.message);
    } finally {
      setLoadingRoadmap(false);
    }
  };

  const fetchVideos = async (topic) => {
    try {
      setLoadingVideos(true);
      console.log('[Component] Fetching videos for:', topic.title);

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
      console.log('[Component] Video response:', data);

      if (data.success) {
        setVideos(data.data?.videos || []);
      } else {
        setVideos([]);
      }
    } catch (error) {
      console.error('[Component] Error fetching videos:', error);
      setVideos([]);
    } finally {
      setLoadingVideos(false);
    }
  };

  const handleTopicClick = (topic) => {
    setSelectedTopic(topic);
    fetchVideos(topic);
  };

  const togglePhase = (phase) => {
    setExpandedPhases(prev => ({
      ...prev,
      [phase]: !prev[phase]
    }));
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p>Loading your learning roadmap...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            Error Loading Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-700 mb-4">{error}</p>
          <Button onClick={fetchRoadmap} variant="outline">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Group topics by phase (assuming 7-8 topics total)
  const phaseTopics = {
    foundation: roadmap?.topics?.slice(0, 2) || [],
    intermediate: roadmap?.topics?.slice(2, 4) || [],
    advanced: roadmap?.topics?.slice(4, 6) || [],
    expert: roadmap?.topics?.slice(6) || []
  };

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

      {/* Phase Progress Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { key: 'foundation', label: 'Foundation', color: 'blue' },
          { key: 'intermediate', label: 'Intermediate', color: 'purple' },
          { key: 'advanced', label: 'Advanced', color: 'orange' },
          { key: 'expert', label: 'Expert', color: 'green' }
        ].map(phase => (
          <Card key={phase.key} className={`border-${phase.color}-200`}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{phaseTopics[phase.key]?.length || 0}</p>
                <p className="text-xs text-gray-600">{phase.label} Topics</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roadmap Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Learning Path</CardTitle>
              <CardDescription>
                {Object.keys(completedTopics).filter(t => completedTopics[t]).length} / {roadmap?.topics?.length || 0} completed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
              {['foundation', 'intermediate', 'advanced', 'expert'].map(phaseKey => (
                <div key={phaseKey}>
                  <button
                    onClick={() => togglePhase(phaseKey)}
                    className="w-full flex items-center justify-between p-2 rounded hover:bg-gray-100 transition"
                  >
                    <span className="font-semibold text-sm capitalize">{phaseKey}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${expandedPhases[phaseKey] ? 'rotate-180' : ''}`}
                    />
                  </button>
                  
                  {expandedPhases[phaseKey] && (
                    <div className="pl-4 space-y-1 mb-2">
                      {phaseTopics[phaseKey]?.map(topic => (
                        <button
                          key={topic.id}
                          onClick={() => handleTopicClick(topic)}
                          className={`w-full text-left p-2 rounded text-sm transition-colors ${
                            selectedTopic?.id === topic.id
                              ? 'bg-blue-100 border-l-2 border-blue-500'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-shrink-0 mt-0.5">
                              {completedTopics[topic.id] ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-gray-300" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-xs">{topic.title}</p>
                              <p className="text-xs text-gray-500">{topic.estimatedTime}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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
                      onClick={() => setCompletedTopics(prev => ({
                        ...prev,
                        [selectedTopic.id]: !prev[selectedTopic.id]
                      }))}
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

                  {selectedTopic.keyPoints && selectedTopic.keyPoints.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Key Points</h4>
                      <ul className="space-y-1">
                        {selectedTopic.keyPoints.map((point, i) => (
                          <li key={i} className="text-sm text-gray-700 flex gap-2">
                            <span className="text-blue-500 flex-shrink-0">•</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Videos Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <PlayCircle className="w-5 h-5" />
                  Learning Videos
                </h3>

                {loadingVideos ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">Loading videos...</p>
                  </div>
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
                    <p className="text-gray-600">No videos found for this topic.</p>
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
