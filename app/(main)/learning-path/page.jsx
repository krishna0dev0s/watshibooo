"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Play,
  Clock,
  Loader2,
  AlertCircle,
  BookOpen,
  ChevronRight,
  CheckCircle2,
  Circle,
  Lock,
  Zap,
  Users,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function LearningPathPage() {
  const [topic, setTopic] = useState("");
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [completedVideos, setCompletedVideos] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [courseStarted, setCourseStarted] = useState(false);

  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem("courseProgress");
    const savedTopic = localStorage.getItem("courseTopic");
    const savedVideos = localStorage.getItem("courseVideos");
    const savedCompleted = localStorage.getItem("courseCompleted");
    const savedCurrentIndex = localStorage.getItem("courseCurrentIndex");
    const savedStarted = localStorage.getItem("courseStarted");

    if (savedVideos) setVideos(JSON.parse(savedVideos));
    if (savedCompleted) setCompletedVideos(JSON.parse(savedCompleted));
    if (savedCurrentIndex) setCurrentVideoIndex(parseInt(savedCurrentIndex));
    if (savedTopic) setTopic(savedTopic);
    if (savedProgress) setHasSearched(true);
    if (savedStarted) setCourseStarted(JSON.parse(savedStarted));
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    if (videos.length > 0) {
      localStorage.setItem("courseVideos", JSON.stringify(videos));
      localStorage.setItem("courseCompleted", JSON.stringify(completedVideos));
      localStorage.setItem("courseCurrentIndex", currentVideoIndex.toString());
      localStorage.setItem("courseTopic", topic);
      localStorage.setItem("courseProgress", "true");
      localStorage.setItem("courseStarted", JSON.stringify(courseStarted));
    }
  }, [videos, completedVideos, currentVideoIndex, topic, courseStarted]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError("");
    setHasSearched(true);
    setCourseStarted(false);

    try {
      const response = await fetch("/api/youtube-videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch videos");
      }

      const data = await response.json();
      // Take only the best 12 videos (already sorted by quality in API)
      const bestVideos = data.videos?.slice(0, 12) || [];
      setVideos(bestVideos);
      setCurrentVideoIndex(0);
      setCompletedVideos([]);

      if (bestVideos.length === 0) {
        setError("No educational videos found for this topic. Try another search.");
      }
    } catch (err) {
      setError(err.message || "Failed to fetch videos. Please try again.");
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const startCourse = () => {
    if (videos.length > 0) {
      setCourseStarted(true);
      setCurrentVideoIndex(0);
      setCompletedVideos([]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const completeCurrentVideo = () => {
    if (currentVideoIndex < videos.length && !completedVideos.includes(currentVideoIndex)) {
      const newCompleted = [...completedVideos, currentVideoIndex];
      setCompletedVideos(newCompleted);

      // Auto-play next video if available
      if (currentVideoIndex < videos.length - 1) {
        setCurrentVideoIndex(currentVideoIndex + 1);
        setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
      }
    }
  };

  const resetCourse = () => {
    setCompletedVideos([]);
    setCurrentVideoIndex(0);
    setCourseStarted(true);
    localStorage.removeItem("courseCompleted");
    localStorage.removeItem("courseCurrentIndex");
  };

  const restartCourse = () => {
    setTopic("");
    setVideos([]);
    setCompletedVideos([]);
    setCurrentVideoIndex(0);
    setCourseStarted(false);
    setHasSearched(false);
    localStorage.removeItem("courseTopic");
    localStorage.removeItem("courseVideos");
    localStorage.removeItem("courseCompleted");
    localStorage.removeItem("courseCurrentIndex");
    localStorage.removeItem("courseProgress");
    localStorage.removeItem("courseStarted");
  };

  const progressPercentage =
    videos.length > 0 ? (completedVideos.length / videos.length) * 100 : 0;
  const isCurrentVideoDone = completedVideos.includes(currentVideoIndex);
  const currentVideo = videos[currentVideoIndex];

  return (
    <div className="w-full min-h-screen bg-black">
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 text-white hover:text-white hover:bg-white/10"
            onClick={restartCourse}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Learning
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Course Not Started - Search & Browse */}
        {!courseStarted && videos.length === 0 && (
          <>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2 text-white">Structured Learning Path</h1>
              <p className="text-lg text-gray-200 max-w-3xl">
                Master any skill with a complete, step-by-step learning path. We'll curate the best educational videos for progressive learning.
              </p>
            </div>

            {/* Search Section */}
            <div className="mb-8">
              <form onSubmit={handleSearch} className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="e.g., React, Python, Web Design, Machine Learning..."
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="pl-12 h-12 bg-gray-900 border-gray-700 text-white placeholder-gray-500 rounded-xl shadow-sm focus:ring-2 focus:ring-white/50 focus:border-white/50"
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    disabled={loading || !topic.trim()}
                    className="h-12 px-8 bg-white hover:bg-gray-100 text-black rounded-xl gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 font-semibold"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        Create Course
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* Error State */}
            {error && (
              <div className="mb-8 p-4 bg-gray-900/50 border border-gray-700 rounded-xl flex gap-3 animate-in fade-in">
                <AlertCircle className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-200 font-semibold text-sm">Couldn't find structured courses</p>
                  <p className="text-gray-400 text-xs mt-1">Try searching for more specific topics or use different keywords</p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!hasSearched && videos.length === 0 && !error && (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-900 border border-gray-700 mb-4">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-white">Start Your Learning Journey</h3>
                <p className="text-gray-300 text-lg max-w-md mx-auto">
                  Enter any skill you want to master and we'll create a structured path with carefully selected videos.
                </p>
              </div>
            )}
          </>
        )}

        {/* Course Found - Preview Before Starting */}
        {!courseStarted && videos.length > 0 && (
          <div className="space-y-8">
            {/* Course Overview */}
            <div className="mb-8 p-8 bg-gray-950 rounded-2xl border border-gray-800 shadow-xl">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2 text-white">Master {topic}</h2>
                  <p className="text-gray-300 text-lg">
                    {videos.length} carefully curated lessons for progressive learning
                  </p>
                </div>
                <div className="px-4 py-2 bg-white text-black text-sm font-semibold rounded-full whitespace-nowrap shadow-lg">
                  {videos.length} Lessons
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                    <p className="text-gray-400 text-xs font-semibold mb-1">Total Duration</p>
                    <p className="text-2xl font-bold text-white">{Math.ceil(videos.length * 15)} min</p>
                  </div>
                  <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                    <p className="text-gray-400 text-xs font-semibold mb-1">Format</p>
                    <p className="text-2xl font-bold text-white">Progressive</p>
                  </div>
                </div>
                <Button
                  onClick={startCourse}
                  className="w-full h-12 bg-white hover:bg-gray-100 text-black font-semibold gap-2 rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  <Play className="h-5 w-5" />
                  Start Learning Now
                </Button>
              </div>
            </div>

            {/* Video Preview List */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-white">Course Curriculum</h3>
              <div className="space-y-2">
                {videos.map((video, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border border-gray-800 bg-gray-900 hover:border-white hover:bg-gray-800 transition-all shadow-sm hover:shadow-md"
                  >
                      <p className="text-white font-semibold line-clamp-1">
                        <span className="text-gray-400 mr-2">{index + 1}.</span>{video.title}
                    </p>
                      <p className="text-xs text-gray-400 mt-2">{video.channelTitle}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Course In Progress */}
        {courseStarted && videos.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Video Section - Left Side (col-span-3) */}
            <div className="lg:col-span-3 space-y-6">
              {/* Video Player */}
              <div className="bg-black border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="aspect-video bg-black relative">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${currentVideo?.videoId}?autoplay=1`}
                    title="Course video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                {/* Video Info & Controls */}
                <div className="bg-gray-950 p-6 border-t border-gray-800 space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-gray-400">
                      <span>PROGRESS</span>
                      <span className="text-blue-400">
                        {completedVideos.length} / {videos.length}
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-2.5 rounded-full" />
                  </div>

                  {/* Title and Info */}
                  <div className="border-t border-gray-800 pt-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      Lesson {currentVideoIndex + 1} of {videos.length}
                    </p>
                    <h3 className="text-base font-bold line-clamp-2 text-white mb-2">
                      {currentVideo?.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {currentVideo?.channelTitle}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2 flex-wrap">
                    {!isCurrentVideoDone ? (
                      <Button
                        onClick={completeCurrentVideo}
                        className="flex-1 min-w-fit h-10 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm gap-2 rounded-lg transition-all"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Mark Complete
                      </Button>
                    ) : (
                      <Button
                        className="flex-1 min-w-fit h-10 bg-green-600/20 text-green-400 font-semibold text-sm cursor-default rounded-lg"
                        disabled
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Completed
                      </Button>
                    )}

                    {currentVideoIndex < videos.length - 1 && isCurrentVideoDone && (
                      <Button
                        onClick={() => {
                          setCurrentVideoIndex(currentVideoIndex + 1);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="flex-1 min-w-fit h-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm gap-2 rounded-lg transition-all"
                      >
                        Next Lesson
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}

                    <Button
                      onClick={restartCourse}
                      variant="outline"
                      className="h-10 px-4 text-sm font-semibold gap-2 rounded-lg border-gray-700 hover:bg-gray-900"
                    >
                      <RotateCcw className="h-4 w-4" />
                      New Course
                    </Button>
                  </div>
                </div>
              </div>

              {/* Current Lesson Details */}
              {currentVideo && (
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-sm">
                  <h4 className="font-bold text-lg mb-4 text-white">About This Lesson</h4>
                  <div className="space-y-4 text-sm">
                    <p className="text-slate-300 leading-relaxed line-clamp-4">
                      {currentVideo.description || "No description available."}
                    </p>
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-700">
                      <div>
                        <p className="text-slate-400 text-xs font-semibold uppercase mb-1">Views</p>
                        <p className="font-bold text-white text-lg">
                          {currentVideo.viewCount > 1000000
                            ? `${(currentVideo.viewCount / 1000000).toFixed(1)}M`
                            : currentVideo.viewCount > 1000
                            ? `${(currentVideo.viewCount / 1000).toFixed(1)}K`
                            : currentVideo.viewCount}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs font-semibold uppercase mb-1">Published</p>
                        <p className="font-bold text-white">
                          {new Date(currentVideo.publishedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Remaining Steps (col-span-1) */}
            <div className="space-y-6">
              {/* Remaining Lessons Card - Sticky */}
              <div className="bg-gray-950 border border-gray-800 rounded-2xl sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto shadow-sm">
                <div className="p-5 border-b border-gray-800 bg-gray-950 rounded-t-2xl">
                  <h3 className="font-bold text-lg text-white mb-1">Learning Path</h3>
                  <p className="text-xs text-gray-400">
                    {videos.length - completedVideos.length} steps remaining
                  </p>
                </div>
                <div className="p-5 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-400 uppercase">Progress</span>
                      <span className="text-sm font-bold text-white">
                        {Math.round(progressPercentage)}%
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-3 rounded-full bg-gray-800" />
                  </div>

                  {/* Remaining Steps List */}
                  <div className="space-y-1.5 max-h-80 overflow-y-auto">
                    {videos.map((video, index) => {
                      const isCompleted = completedVideos.includes(index);
                      const isCurrent = currentVideoIndex === index;
                      const isLocked = index > 0 && !completedVideos.includes(index - 1);

                      return (
                        <button
                          key={index}
                          onClick={() => {
                            if (!isLocked) {
                              setCurrentVideoIndex(index);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }
                          }}
                          disabled={isLocked}
                          className={`w-full p-3 rounded-lg border transition-all text-left text-xs ${
                            isCurrent
                              ? "bg-gray-800 border-white shadow-sm"
                              : isCompleted
                              ? "bg-gray-900 border-gray-700 opacity-75"
                              : isLocked
                              ? "bg-gray-900/50 border-gray-800 opacity-40 cursor-not-allowed"
                              : "bg-gray-900 border-gray-800 hover:border-white hover:bg-gray-800 cursor-pointer"
                          }`}
                        >
                          <div className="flex gap-2.5 items-start">
                            {/* Status Icon */}
                            <div className="flex-shrink-0 mt-0.5">
                              {isCompleted ? (
                                <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0" />
                              ) : isCurrent ? (
                                <Play className="h-5 w-5 text-white animate-pulse flex-shrink-0" />
                              ) : isLocked ? (
                                <Lock className="h-5 w-5 text-gray-600 flex-shrink-0" />
                              ) : (
                                <Circle className="h-5 w-5 text-gray-600 flex-shrink-0" />
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <p
                                className={`font-semibold line-clamp-1 ${
                                  isCurrent ? "text-white" : isCompleted ? "text-white" : "text-white"
                                }`}
                              >
                                Step {index + 1}
                              </p>
                              <p className="line-clamp-1 text-xs text-gray-400 mt-0.5">
                                {video.title}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Progress Summary */}
                  <div className="mt-3 pt-4 border-t border-gray-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400 font-semibold">COMPLETED</span>
                      <span className="font-bold text-white">
                        {completedVideos.length}/{videos.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400 font-semibold">REMAINING</span>
                      <span className="font-bold text-white">
                        {videos.length - completedVideos.length}
                      </span>
                    </div>

                    {completedVideos.length === videos.length && (
                      <div className="mt-4 p-3 bg-gray-900 border border-gray-800 rounded-lg text-center">
                        <p className="font-bold text-white text-sm">
                          🎉 Course Complete!
                        </p>
                        <p className="text-xs text-gray-400 mt-1">You've mastered {topic}!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Stats Card */}
              <div className="bg-gray-950 border border-gray-800 rounded-2xl p-5 shadow-sm">
                <h4 className="font-bold text-sm text-white mb-4">Course Details</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Topic</p>
                    <p className="font-bold text-white line-clamp-2">
                      {topic}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-gray-800">
                    <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Total Lessons</p>
                    <p className="font-bold text-2xl text-white">{videos.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
