"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import RoadmapGenerator from "./_components/roadmap-generator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const EnhancedRoadmapTracker = dynamic(
  () => import("@/components/enhanced-roadmap-tracker"),
  { ssr: false }
);

const RoadmapCoursePlayer = dynamic(
  () => import("./_components/roadmap-course-player"),
  { ssr: false }
);

export default function RoadmapPage() {
  const [roadmapData, setRoadmapData] = useState(null);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [videoQueue, setVideoQueue] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleRoadmapGenerated = (data) => {
    setRoadmapData(data);
    toast.success("Roadmap generated successfully!");
  };

  const handleStartCourse = async () => {
    if (selectedTopics.length === 0) {
      toast.error("Please select at least one topic");
      return;
    }

    setLoading(true);
    try {
      const allVideos = [];
      const seenTopics = new Set(); // Track topics to avoid duplicates
      let queueIndex = 0;
      
      // Process topics in roadmap order to maintain learning sequence
      for (const phase of roadmapData.phases || []) {
        for (const phaseTopicStr of phase.topics || []) {
          // Extract topic title (handle both string and object formats)
          const topicTitle = typeof phaseTopicStr === 'string' ? phaseTopicStr : (phaseTopicStr?.title || '');
          
          // Skip if topic not selected or already processed
          const isSelected = selectedTopics.some(t => t.title === topicTitle);
          if (!isSelected || seenTopics.has(topicTitle)) {
            continue;
          }
          
          seenTopics.add(topicTitle);
          console.log(`[Course Builder] Loading videos for: ${topicTitle}`);
          
          try {
            const response = await fetch("/api/youtube-videos", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ topic: topicTitle }),
            });

            if (response.ok) {
              const data = await response.json();
              const videos = data.videos?.slice(0, 4).map((v) => ({
                ...v,
                topicTitle,
                topicId: topicTitle,
                queueIndex: queueIndex++,
              })) || [];
              
              if (videos.length > 0) {
                allVideos.push(...videos);
                console.log(`[Course Builder] Added ${videos.length} videos for ${topicTitle}`);
              }
            }
          } catch (error) {
            console.error(`[Course Builder] Error fetching videos for ${topicTitle}:`, error);
            // Continue with other topics even if one fails
          }
        }
      }

      if (allVideos.length === 0) {
        toast.error("No videos found for selected topics");
        return;
      }

      setVideoQueue(allVideos);
      setPlayerOpen(true);
      console.log(`[Course Builder] Course created with ${allVideos.length} videos from ${seenTopics.size} unique topics`);
      toast.success(`Course ready! ${allVideos.length} videos from ${seenTopics.size} topics`);
    } catch (error) {
      console.error('Error building course:', error);
      toast.error("Failed to build course");
    } finally {
      setLoading(false);
    }
  };

  const toggleTopicSelection = (topic) => {
    const isSelected = selectedTopics.some(t => t.id === topic.id);
    if (isSelected) {
      setSelectedTopics(selectedTopics.filter(t => t.id !== topic.id));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  if (playerOpen && videoQueue.length > 0) {
    return (
      <RoadmapCoursePlayer 
        videoQueue={videoQueue}
        roadmapData={roadmapData}
        onClose={() => setPlayerOpen(false)}
      />
    );
  }

  return (
    <div className="w-full min-h-screen pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        {!roadmapData ? (
          <RoadmapGenerator onRoadmapGenerated={handleRoadmapGenerated} />
        ) : (
          <div className="space-y-8">
            {/* Roadmap Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">{roadmapData.domain}</h1>
                <p className="text-gray-400">
                  {roadmapData.level} Level • {roadmapData.months} months • {selectedTopics.length} topics selected
                </p>
              </div>
              <Button 
                onClick={() => setRoadmapData(null)}
                variant="outline"
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Generate New
              </Button>
            </div>

            {/* Start Course Button */}
            {selectedTopics.length > 0 && (
              <Card className="border-blue-500/50 bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
                <CardContent className="pt-6 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{selectedTopics.length} topics selected</p>
                    <p className="text-sm text-gray-400">Ready to start your personalized course</p>
                  </div>
                  <Button 
                    onClick={handleStartCourse}
                    disabled={loading}
                    className="gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Start Course
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Progress Overview */}
            <EnhancedRoadmapTracker roadmap={roadmapData} />

            {/* Roadmap with Video Preview */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Learning Phases & Topics</h2>
              
              {roadmapData.phases?.map((phase, phaseIdx) => (
                <Card key={phaseIdx} className="border-white/10 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-white/5 to-white/0">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          Phase {phase.phaseNumber || phaseIdx + 1}: {phase.name}
                        </CardTitle>
                        <CardDescription>{phase.duration}</CardDescription>
                      </div>
                      <Badge variant="outline">{phase.topics?.length || 0} topics</Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {phase.topics?.map((topic, topicIdx) => {
                        const topicObj = {
                          id: `${phaseIdx}-${topicIdx}`,
                          title: topic,
                          phase: phase.name,
                        };
                        const isSelected = selectedTopics.some(t => t.id === topicObj.id);

                        return (
                          <TopicCard
                            key={topicIdx}
                            topic={topicObj}
                            isSelected={isSelected}
                            onToggle={toggleTopicSelection}
                          />
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TopicCard({ topic, isSelected, onToggle }) {
  const [videoPreview, setVideoPreview] = useState(null);
  const [loadingVideo, setLoadingVideo] = useState(false);

  const loadVideoPreview = async () => {
    if (videoPreview) return;
    
    setLoadingVideo(true);
    try {
      const response = await fetch("/api/youtube-videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.title, limit: 1 }),
      });

      if (response.ok) {
        const data = await response.json();
        const video = data.videos?.[0];
        if (video) {
          setVideoPreview(video);
        }
      }
    } catch (error) {
      console.error('Error loading video preview:', error);
    } finally {
      setLoadingVideo(false);
    }
  };

  useEffect(() => {
    if (isSelected && !videoPreview) {
      loadVideoPreview();
    }
  }, [isSelected]);

  return (
    <Card
      onClick={() => onToggle(topic)}
      className={`cursor-pointer transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/50"
          : "border-white/10 hover:border-white/20 hover:bg-white/5"
      }`}
    >
      {videoPreview && (
        <div className="relative pb-[56.25%] overflow-hidden">
          <img
            src={videoPreview.thumbnail}
            alt={topic.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Play className="h-8 w-8 text-white" />
          </div>
          {isSelected && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-blue-500">Selected</Badge>
            </div>
          )}
        </div>
      )}
      
      <CardContent className="pt-4">
        <h3 className="font-semibold text-sm mb-2 line-clamp-2">{topic.title}</h3>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">{topic.phase}</Badge>
          <Button
            size="sm"
            variant={isSelected ? "default" : "outline"}
            onClick={(e) => {
              e.stopPropagation();
              onToggle(topic);
            }}
            className="gap-1"
          >
            {isSelected ? "✓" : "+"}
          </Button>
        </div>
        {videoPreview && (
          <p className="text-xs text-gray-400 mt-2">
            {videoPreview.duration} available
          </p>
        )}
      </CardContent>
    </Card>
  );
}
