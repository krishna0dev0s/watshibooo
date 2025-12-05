"use client";

import { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  X,
  ChevronDown,
  Check,
  Clock,
  BookOpen,
  Award,
  Share2,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export default function RoadmapCoursePlayer({ videoQueue, roadmapData, onClose }) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [completedVideos, setCompletedVideos] = useState([]);
  const [showQueue, setShowQueue] = useState(true);
  const [speed, setSpeed] = useState(1);
  const iframeRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("courseQueue", JSON.stringify(videoQueue));
    localStorage.setItem("completedVideos", JSON.stringify(completedVideos));
  }, [videoQueue, completedVideos]);

  const currentVideo = videoQueue[currentVideoIndex];
  const videoProgress = videoQueue.length > 0 ? (completedVideos.length / videoQueue.length) * 100 : 0;

  const handleMarkComplete = () => {
    if (!completedVideos.includes(currentVideoIndex)) {
      setCompletedVideos([...completedVideos, currentVideoIndex]);
      toast.success("Video marked as complete! ✅");
      
      // Auto-advance to next video
      if (currentVideoIndex < videoQueue.length - 1) {
        setTimeout(() => {
          setCurrentVideoIndex(currentVideoIndex + 1);
          setIsPlaying(true);
        }, 1000);
      } else {
        toast.success("Course completed! 🎉");
      }
    }
  };

  const handleNextVideo = () => {
    if (currentVideoIndex < videoQueue.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
      setIsPlaying(true);
    }
  };

  const handlePrevVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
      setIsPlaying(true);
    }
  };

  const getYouTubeEmbedUrl = (videoId) => {
    if (videoId.includes('youtube.com') || videoId.includes('youtu.be')) {
      // Extract video ID if it's a full URL
      const match = videoId.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
      return `https://www.youtube.com/embed/${match ? match[1] : videoId}`;
    }
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const exportProgress = () => {
    const progress = {
      course: roadmapData?.domain,
      totalVideos: videoQueue.length,
      completedVideos: completedVideos.length,
      percentage: Math.round(videoProgress),
      timestamp: new Date().toISOString(),
      videos: videoQueue.map((v, idx) => ({
        title: v.title,
        completed: completedVideos.includes(idx),
      })),
    };

    const dataStr = JSON.stringify(progress, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `course-progress-${Date.now()}.json`;
    link.click();
    toast.success("Progress exported!");
  };

  return (
    <div className="w-full min-h-screen bg-black flex">
      {/* Main Player Area */}
      <div className={`flex-1 flex flex-col ${showQueue ? "md:w-2/3" : "w-full"}`}>
        {/* Header */}
        <div className="bg-black/80 border-b border-white/10 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white mb-1">{roadmapData?.domain} Course</h1>
              <p className="text-sm text-gray-400">
                Video {currentVideoIndex + 1} of {videoQueue.length}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={exportProgress}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Video Player */}
        <div className="flex-1 flex items-center justify-center bg-black p-4">
          <div className="w-full max-w-4xl">
            <div className="relative pb-[56.25%] rounded-lg overflow-hidden bg-black">
              {currentVideo ? (
                <iframe
                  ref={iframeRef}
                  className="absolute inset-0 w-full h-full"
                  src={`${getYouTubeEmbedUrl(currentVideo.videoId)}?autoplay=${isPlaying ? 1 : 0}`}
                  title={currentVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-gray-400">No video selected</p>
                </div>
              )}
            </div>

            {/* Video Info */}
            <div className="mt-4 space-y-3">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">{currentVideo?.title}</h2>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {currentVideo?.duration}
                  </Badge>
                  <Badge variant="outline">{currentVideo?.topicTitle}</Badge>
                  {completedVideos.includes(currentVideoIndex) && (
                    <Badge className="bg-green-500 gap-1">
                      <Check className="h-3 w-3" />
                      Completed
                    </Badge>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Course Progress</span>
                  <span className="text-sm text-gray-400">{Math.round(videoProgress)}%</span>
                </div>
                <Progress value={videoProgress} className="h-2" />
              </div>

              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handlePrevVideo}
                  disabled={currentVideoIndex === 0}
                  variant="outline"
                  className="gap-2 flex-1"
                >
                  <SkipBack className="h-4 w-4" />
                  Previous
                </Button>

                <Button
                  onClick={handleMarkComplete}
                  disabled={completedVideos.includes(currentVideoIndex)}
                  className="gap-2 flex-1 bg-gradient-to-r from-blue-500 to-cyan-500"
                >
                  <Check className="h-4 w-4" />
                  {completedVideos.includes(currentVideoIndex) ? "Completed" : "Mark Complete"}
                </Button>

                <Button
                  onClick={handleNextVideo}
                  disabled={currentVideoIndex === videoQueue.length - 1}
                  variant="outline"
                  className="gap-2 flex-1"
                >
                  Next
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>

              {/* Speed Controls */}
              <div className="flex gap-2">
                {[0.75, 1, 1.25, 1.5].map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={speed === s ? "default" : "outline"}
                    onClick={() => setSpeed(s)}
                    className="text-xs"
                  >
                    {s}x
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Queue Sidebar */}
      {showQueue && (
        <div className="hidden md:flex md:w-1/3 border-l border-white/10 bg-black/50 flex-col">
          {/* Queue Header */}
          <div className="border-b border-white/10 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white">Queue</h3>
              <Badge variant="outline">{completedVideos.length}/{videoQueue.length}</Badge>
            </div>
            <p className="text-xs text-gray-400">
              {videoQueue.length} videos • {roadmapData?.months} months
            </p>
          </div>

          {/* Queue List */}
          <div className="flex-1 overflow-y-auto">
            {videoQueue.map((video, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentVideoIndex(idx);
                  setIsPlaying(true);
                }}
                className={`w-full text-left p-3 border-b border-white/5 hover:bg-white/10 transition-colors ${
                  idx === currentVideoIndex ? "bg-blue-500/20 border-l-2 border-l-blue-500" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {completedVideos.includes(idx) ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white line-clamp-2">
                      {video.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{video.topicTitle}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="border-t border-white/10 p-4 space-y-3">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex justify-between mb-2">
                <span className="text-xs text-gray-400">Completion</span>
                <span className="text-xs font-semibold text-white">{Math.round(videoProgress)}%</span>
              </div>
              <Progress value={videoProgress} className="h-1" />
            </div>
            <Button size="sm" variant="outline" className="w-full" onClick={exportProgress}>
              <Download className="h-3 w-3 mr-2" />
              Export Progress
            </Button>
          </div>
        </div>
      )}

      {/* Toggle Queue Button */}
      <button
        onClick={() => setShowQueue(!showQueue)}
        className="md:hidden fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg"
      >
        <ChevronDown className={`h-5 w-5 transition-transform ${showQueue ? "rotate-180" : ""}`} />
      </button>
    </div>
  );
}
