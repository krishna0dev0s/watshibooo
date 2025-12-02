"use client";

import { useState, useEffect } from "react";
import { Search, Play, Clock, ThumbsUp, User, Loader2, AlertCircle, BookOpen, ChevronRight, CheckCircle2, Circle, Trash2, RotateCcw, Volume2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

export default function LearningPage() {
  const [searchTopic, setSearchTopic] = useState("");
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [queue, setQueue] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(null);
  const [completedVideos, setCompletedVideos] = useState([]);
  const [watching, setWatching] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTopic.trim()) return;

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const response = await fetch("/api/youtube-videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: searchTopic }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch videos");
      }

      const data = await response.json();
      setVideos(data.videos || []);

      if (data.videos?.length === 0) {
        setError("No videos found for this topic. Try another search.");
      }
    } catch (err) {
      setError(err.message || "Failed to fetch videos. Please try again.");
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  // Load queue and progress from localStorage
  useEffect(() => {
    const savedQueue = localStorage.getItem("learningQueue");
    const savedCompleted = localStorage.getItem("completedVideos");
    const savedCurrentIndex = localStorage.getItem("currentVideoIndex");

    if (savedQueue) setQueue(JSON.parse(savedQueue));
    if (savedCompleted) setCompletedVideos(JSON.parse(savedCompleted));
    if (savedCurrentIndex !== null) setCurrentVideoIndex(parseInt(savedCurrentIndex));
  }, []);

  // Save queue and progress to localStorage
  useEffect(() => {
    localStorage.setItem("learningQueue", JSON.stringify(queue));
    localStorage.setItem("completedVideos", JSON.stringify(completedVideos));
    if (currentVideoIndex !== null) {
      localStorage.setItem("currentVideoIndex", currentVideoIndex.toString());
    }
  }, [queue, completedVideos, currentVideoIndex]);

  const addToQueue = (video) => {
    if (!queue.some((v) => v.videoId === video.videoId)) {
      setQueue([...queue, video]);
    }
  };

  const removeFromQueue = (videoId) => {
    const newQueue = queue.filter((v) => v.videoId !== videoId);
    setQueue(newQueue);
    
    // Adjust current video index if needed
    if (currentVideoIndex !== null) {
      const removedIndex = queue.findIndex((v) => v.videoId === videoId);
      if (removedIndex === currentVideoIndex) {
        setCurrentVideoIndex(newQueue.length > 0 ? 0 : null);
      } else if (removedIndex < currentVideoIndex) {
        setCurrentVideoIndex(currentVideoIndex - 1);
      }
    }
  };

  const markAsCompleted = (videoId) => {
    if (!completedVideos.includes(videoId)) {
      setCompletedVideos([...completedVideos, videoId]);
    }
    moveToNext();
  };

  const moveToNext = () => {
    if (currentVideoIndex !== null && currentVideoIndex < queue.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
      setWatching(queue[currentVideoIndex + 1].videoId);
    }
  };

  const startWatching = (index) => {
    setCurrentVideoIndex(index);
    setWatching(queue[index].videoId);
  };

  const clearQueue = () => {
    setQueue([]);
    setCurrentVideoIndex(null);
    setWatching(null);
  };

  const clearProgress = () => {
    setCompletedVideos([]);
  };

  return (
    <div className="w-full min-h-screen pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Video Player Section - Only show if watching */}
        {watching && (
          <div className="mb-8 sticky top-24 z-40">
            <Card className="bg-black border-border overflow-hidden shadow-2xl">
              <div className="aspect-video bg-black relative">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${watching}?autoplay=1`}
                  title="Video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-3 space-y-8">
            {/* Header Section */}
            {/* Back Button */}
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="mb-4 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-lg">
                  <BookOpen className="h-6 w-6 text-red-400" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                  Learning Hub
                </h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Search for topics, add videos to your queue, and track your learning progress step by step.
              </p>
            </div>

            {/* Search Section */}
            <Card className="bg-card/50 backdrop-blur-md border-border shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Find Your Learning Material</CardTitle>
                <CardDescription>Enter a topic to discover educational videos</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="e.g., 'React Hooks', 'Python Data Science', 'Web Design'..."
                        value={searchTopic}
                        onChange={(e) => setSearchTopic(e.target.value)}
                        className="pl-10 h-12 bg-background/50 border-border focus:border-primary"
                      />
                    </div>
                    <Button
                      onClick={handleSearch}
                      disabled={loading || !searchTopic.trim()}
                      className="h-12 px-8 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4" />
                          Search
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Error Message */}
            {error && (
              <Card className="bg-red-500/10 border-red-500/30">
                <CardContent className="pt-6 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-400 font-medium">No results found</p>
                    <p className="text-red-300/70 text-sm mt-1">{error}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {!searched && videos.length === 0 && queue.length === 0 && (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 mb-4">
                  <Play className="h-8 w-8 text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Start Learning Today</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Search for any topic, add videos to your queue, and start your learning journey with progress tracking.
                </p>
              </div>
            )}

            {/* Videos Grid */}
            {videos.length > 0 && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold">
                    Found {videos.length} video{videos.length !== 1 ? "s" : ""} for "{searchTopic}"
                  </h2>
                  <p className="text-muted-foreground mt-1">Click "Add to Queue" to start learning</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {videos.map((video, index) => {
                    const isInQueue = queue.some((v) => v.videoId === video.videoId);
                    const isCompleted = completedVideos.includes(video.videoId);
                    const isRecommended = index < 3; // Top 3 are highly recommended

                    return (
                      <Card
                        key={index}
                        className="bg-card/40 hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300 overflow-hidden"
                      >
                        {/* Thumbnail */}
                        <div className="relative overflow-hidden bg-background aspect-video group">
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                            <div className="bg-red-600 rounded-full p-3 group-hover:bg-red-500 group-hover:scale-110 transition-all duration-300">
                              <Play className="h-5 w-5 text-white fill-white" />
                            </div>
                          </div>
                          {isCompleted && (
                            <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                              <CheckCircle2 className="h-5 w-5 text-white" />
                            </div>
                          )}
                          {isRecommended && !isCompleted && (
                            <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-400 to-orange-500 text-black text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                              ⭐ Recommended
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <CardHeader className="pb-3">
                          <CardTitle className="line-clamp-2 text-base">{video.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2 text-xs">
                            <User className="h-3 w-3" />
                            {video.channelTitle}
                          </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-3 pb-3">
                          {/* Description */}
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {video.description || "No description available"}
                          </p>

                          {/* Metadata */}
                          {video.publishedAt && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {new Date(video.publishedAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                          )}

                          {/* Quality Indicators */}
                          <div className="flex gap-2 flex-wrap">
                            {/* View Count Badge */}
                            {video.viewCount && (
                              <Badge variant="secondary" className="text-xs">
                                {video.viewCount > 1000000
                                  ? `${(video.viewCount / 1000000).toFixed(1)}M views`
                                  : video.viewCount > 1000
                                  ? `${(video.viewCount / 1000).toFixed(1)}K views`
                                  : `${video.viewCount} views`}
                              </Badge>
                            )}
                            
                            {/* Engagement Badge */}
                            {video.likeCount && (
                              <Badge 
                                variant="outline" 
                                className="text-xs bg-green-500/10 text-green-400 border-green-500/30"
                              >
                                👍 {video.likeCount > 1000 ? `${(video.likeCount / 1000).toFixed(1)}K` : video.likeCount}
                              </Badge>
                            )}
                            
                            {/* Learning Quality Badge */}
                            {isRecommended && (
                              <Badge 
                                className="text-xs bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30"
                              >
                                ✓ Best for Learning
                              </Badge>
                            )}
                          </div>
                        </CardContent>

                        {/* Footer CTA */}
                        <div className="px-6 py-3 border-t border-border bg-background/30 flex gap-2">
                          <Button
                            onClick={() => addToQueue(video)}
                            disabled={isInQueue}
                            className={`flex-1 h-8 text-sm gap-2 ${
                              isInQueue
                                ? "bg-green-600/20 text-green-400 hover:bg-green-600/30"
                                : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                            }`}
                            variant="ghost"
                          >
                            <Play className="h-3 w-3" />
                            {isInQueue ? "In Queue" : "Add to Queue"}
                          </Button>
                          <a
                            href={`https://www.youtube.com/watch?v=${video.videoId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="ghost" className="h-8 px-3 text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 text-sm gap-2">
                              <Volume2 className="h-3 w-3" />
                            </Button>
                          </a>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Queue & Progress */}
          <div className="lg:col-span-1 space-y-6">
            {/* Queue Section */}
            <Card className="bg-card/50 border-border sticky top-24">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Your Queue</CardTitle>
                  {queue.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {queue.length}
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  {queue.length === 0 ? "Add videos to get started" : `${queue.length} video${queue.length !== 1 ? "s" : ""} queued`}
                </CardDescription>
              </CardHeader>

              {queue.length > 0 && (
                <CardContent className="space-y-3">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>
                        {completedVideos.length}/{queue.length}
                      </span>
                    </div>
                    <Progress
                      value={(completedVideos.length / queue.length) * 100}
                      className="h-2"
                    />
                  </div>

                  {/* Queue Items */}
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {queue.map((video, index) => {
                      const isCurrentVideo = currentVideoIndex === index;
                      const isCompleted = completedVideos.includes(video.videoId);

                      return (
                        <div
                          key={video.videoId}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            isCurrentVideo
                              ? "bg-red-500/20 border-red-500/50"
                              : isCompleted
                              ? "bg-green-500/10 border-green-500/30"
                              : "bg-background/50 border-border hover:border-primary/50"
                          }`}
                          onClick={() => startWatching(index)}
                        >
                          <div className="flex gap-2">
                            <div className="flex-shrink-0 mt-1">
                              {isCompleted ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : isCurrentVideo ? (
                                <Play className="h-4 w-4 text-red-500 animate-pulse" />
                              ) : (
                                <Circle className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium line-clamp-2 leading-snug">
                                {index + 1}. {video.title}
                              </p>
                              <p className="text-xs text-muted-foreground">{video.channelTitle}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFromQueue(video.videoId);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Queue Actions */}
                  <div className="pt-3 border-t border-border space-y-2">
                    {currentVideoIndex !== null && (
                      <Button
                        onClick={() => markAsCompleted(queue[currentVideoIndex].videoId)}
                        className="w-full h-9 bg-green-600 hover:bg-green-700 text-white text-sm gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Mark as Completed
                      </Button>
                    )}
                    {currentVideoIndex !== null && currentVideoIndex < queue.length - 1 && (
                      <Button
                        onClick={moveToNext}
                        variant="outline"
                        className="w-full h-9 text-sm gap-2"
                      >
                        Next Video
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Clear Actions */}
                  <div className="pt-2 border-t border-border space-y-2 flex gap-2">
                    <Button
                      onClick={clearProgress}
                      variant="ghost"
                      size="sm"
                      className="flex-1 h-8 text-xs"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Reset Progress
                    </Button>
                    <Button
                      onClick={clearQueue}
                      variant="ghost"
                      size="sm"
                      className="flex-1 h-8 text-xs text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Clear Queue
                    </Button>
                  </div>
                </CardContent>
              )}

              {queue.length === 0 && (
                <CardContent className="text-center py-6">
                  <p className="text-sm text-muted-foreground mb-3">No videos in queue yet</p>
                  <p className="text-xs text-muted-foreground/70">Search and add videos to start your learning journey</p>
                </CardContent>
              )}
            </Card>

            {/* Stats Section */}
            {completedVideos.length > 0 && (
              <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-base">Learning Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Videos Completed</span>
                    <span className="text-2xl font-bold text-green-400">{completedVideos.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Progress</span>
                    <span className="text-lg font-semibold text-green-400">
                      {queue.length > 0 ? Math.round((completedVideos.length / queue.length) * 100) : 0}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
