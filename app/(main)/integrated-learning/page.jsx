"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  MapPin,
  Target,
  Award,
  Download,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function IntegratedLearningPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("roadmap");
  
  // Roadmap state
  const [roadmapData, setRoadmapData] = useState(null);
  const [completedPhases, setCompletedPhases] = useState([]);
  
  // Learning path state
  const [topic, setTopic] = useState("");
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [learningPath, setLearningPath] = useState(null);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [completedVideos, setCompletedVideos] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [courseStarted, setCourseStarted] = useState(false);

  // Load integrated data from sessionStorage on mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        // Check for roadmap data
        const pathData = window.sessionStorage?.getItem('learningPathData');
        if (pathData) {
          try {
            const roadmapPath = JSON.parse(pathData);
            setRoadmapData(roadmapPath);
            console.log('[Integrated Learning] Loaded roadmap:', roadmapPath.title);
            
            // Auto-load first topic
            if (roadmapPath.phases && roadmapPath.phases[0] && roadmapPath.phases[0].topics && roadmapPath.phases[0].topics[0]) {
              const firstTopic = roadmapPath.phases[0].topics[0];
              setTopic(firstTopic.title);
              setCurrentPhaseIndex(0);
              setCurrentTopicIndex(0);
            }
            
            window.sessionStorage?.removeItem('learningPathData');
          } catch (e) {
            console.error('[Integrated Learning] Failed to load roadmap data:', e);
          }
        }

        // Load progress from localStorage
        const savedProgress = localStorage.getItem("courseProgress");
        const savedTopic = localStorage.getItem("courseTopic");
        const savedVideos = localStorage.getItem("courseVideos");
        const savedCompleted = localStorage.getItem("courseCompleted");
        const savedCurrentIndex = localStorage.getItem("courseCurrentIndex");
        const savedStarted = localStorage.getItem("courseStarted");

        if (savedVideos) setVideos(JSON.parse(savedVideos));
        if (savedCompleted) setCompletedVideos(JSON.parse(savedCompleted));
        if (savedCurrentIndex) setCurrentVideoIndex(parseInt(savedCurrentIndex));
        if (savedTopic && !topic) setTopic(savedTopic);
        if (savedProgress) setHasSearched(true);
        if (savedStarted) setCourseStarted(JSON.parse(savedStarted));
      }
    } catch (error) {
      console.error('[Integrated Learning] Error loading data:', error);
    }
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    if (videos.length > 0 && typeof window !== 'undefined') {
      localStorage.setItem("courseVideos", JSON.stringify(videos));
      localStorage.setItem("courseCompleted", JSON.stringify(completedVideos));
      localStorage.setItem("courseCurrentIndex", currentVideoIndex.toString());
      localStorage.setItem("courseTopic", topic);
      localStorage.setItem("courseProgress", "true");
      localStorage.setItem("courseStarted", JSON.stringify(courseStarted));
    }
  }, [videos, completedVideos, currentVideoIndex, topic, courseStarted]);

  // Handle video search
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

  // Handle mark video complete
  const markVideoComplete = (index) => {
    if (!completedVideos.includes(index)) {
      setCompletedVideos([...completedVideos, index]);
      toast.success("Video marked as complete! ✅");
    }
  };

  // Handle phase complete
  const markPhaseComplete = (phaseIndex) => {
    if (!completedPhases.includes(phaseIndex)) {
      setCompletedPhases([...completedPhases, phaseIndex]);
      toast.success(`Phase ${phaseIndex + 1} marked as complete! 🎉`);
    }
  };

  // Handle topic selection from roadmap
  const selectTopicFromRoadmap = (topicTitle, phaseIdx, topicIdx) => {
    setTopic(topicTitle);
    setCurrentPhaseIndex(phaseIdx);
    setCurrentTopicIndex(topicIdx);
    setActiveTab("learning");
    
    // Auto-search for videos
    setTimeout(() => {
      setLoading(true);
      setError("");
      setHasSearched(true);
      setCourseStarted(false);

      fetch("/api/youtube-videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicTitle }),
      })
        .then(r => r.json())
        .then(data => {
          const bestVideos = data.videos?.slice(0, 12) || [];
          setVideos(bestVideos);
          setCurrentVideoIndex(0);
          setCompletedVideos([]);
        })
        .catch(err => {
          console.error('Error fetching videos:', err);
          setError("Failed to fetch videos");
        })
        .finally(() => setLoading(false));
    }, 100);
  };

  // Export progress
  const exportProgress = () => {
    const reportData = {
      roadmap: roadmapData?.domain || "Learning Path",
      generatedAt: new Date().toISOString(),
      completedPhases: completedPhases.length,
      totalPhases: roadmapData?.phases?.length || 0,
      completedVideos: completedVideos.length,
      totalVideos: videos.length,
      currentTopic: topic,
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `learning-progress-${Date.now()}.json`;
    link.click();
    toast.success("Progress exported!");
  };

  // Calculate progress
  const totalPhases = roadmapData?.phases?.length || 0;
  const phaseProgress = totalPhases > 0 ? (completedPhases.length / totalPhases) * 100 : 0;
  const videoProgress = videos.length > 0 ? (completedVideos.length / videos.length) * 100 : 0;

  return (
    <div className="w-full min-h-screen bg-black/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Integrated Learning Hub</h1>
            <p className="text-gray-400">Roadmap + Structured Learning Combined</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportProgress} className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Overall Progress */}
        {roadmapData && (
          <Card className="mb-8 border-white/10 bg-gradient-to-br from-white/5 to-white/0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {roadmapData.domain} Learning Path
              </CardTitle>
              <CardDescription>
                {roadmapData.level} Level • {roadmapData.months} months • {roadmapData.skills}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Phases Completed</span>
                    <span className="text-sm text-gray-400">{completedPhases.length}/{totalPhases}</span>
                  </div>
                  <Progress value={phaseProgress} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Videos Completed</span>
                    <span className="text-sm text-gray-400">{completedVideos.length}/{videos.length}</span>
                  </div>
                  <Progress value={videoProgress} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="roadmap" className="gap-2">
              <MapPin className="h-4 w-4" />
              Roadmap
            </TabsTrigger>
            <TabsTrigger value="learning" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Structured Learning
            </TabsTrigger>
          </TabsList>

          {/* Roadmap Tab */}
          <TabsContent value="roadmap" className="space-y-6">
            {roadmapData ? (
              <div className="space-y-4">
                {roadmapData.phases?.map((phase, phaseIdx) => (
                  <Card key={phaseIdx} className="border-white/10 bg-gradient-to-br from-white/5 to-white/0">
                    <CardHeader 
                      className="cursor-pointer hover:bg-white/5"
                      onClick={() => markPhaseComplete(phaseIdx)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {completedPhases.includes(phaseIdx) ? (
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                          ) : (
                            <Circle className="h-6 w-6 text-gray-500" />
                          )}
                          <div>
                            <CardTitle className="text-lg">
                              Phase {phase.phaseNumber || phaseIdx + 1}: {phase.name}
                            </CardTitle>
                            <CardDescription>{phase.duration}</CardDescription>
                          </div>
                        </div>
                        <Badge variant={completedPhases.includes(phaseIdx) ? "default" : "outline"}>
                          {completedPhases.includes(phaseIdx) ? "Completed" : "Pending"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {phase.topics?.map((topic, topicIdx) => (
                        <Button
                          key={topicIdx}
                          variant="outline"
                          className="w-full justify-start text-left h-auto py-3 px-4"
                          onClick={() => selectTopicFromRoadmap(topic, phaseIdx, topicIdx)}
                        >
                          <BookOpen className="h-4 w-4 mr-3 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="font-medium">{topic}</div>
                            <div className="text-xs text-gray-400">Click to load videos</div>
                          </div>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No roadmap loaded. Generate one first!</p>
                <Button 
                  onClick={() => router.push('/roadmap')}
                  className="mt-4"
                >
                  Go to Roadmap Generator
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* Learning Tab */}
          <TabsContent value="learning" className="space-y-6">
            {/* Search Section */}
            <Card className="border-white/10 bg-gradient-to-br from-white/5 to-white/0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Topic Search
                </CardTitle>
                <CardDescription>Search for educational videos on any topic</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="flex gap-2">
                  <Input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter topic, skill, or course name..."
                    className="bg-white/5 border-white/10"
                  />
                  <Button type="submit" disabled={loading} className="gap-2">
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Search
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
              <Card className="border-red-500/50 bg-red-500/10">
                <CardContent className="pt-6 flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Videos Display */}
            {hasSearched && videos.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Videos for: {topic}</h3>
                  <Badge variant="outline">{videos.length} videos found</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {videos.map((video, idx) => (
                    <Card 
                      key={idx}
                      className="border-white/10 hover:border-white/20 cursor-pointer transition-all overflow-hidden"
                      onClick={() => {
                        setCurrentVideoIndex(idx);
                        setCourseStarted(true);
                      }}
                    >
                      <div className="relative pb-[56.25%]">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Play className="h-12 w-12 text-white" />
                        </div>
                        {completedVideos.includes(idx) && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                          </div>
                        )}
                      </div>
                      <CardContent className="pt-4">
                        <p className="text-sm font-medium line-clamp-2 mb-2">{video.title}</p>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {video.duration}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              markVideoComplete(idx);
                            }}
                          >
                            {completedVideos.includes(idx) ? "✓" : "Mark Done"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {!hasSearched && (
              <Card className="border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-12 text-center">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">Start by searching for a topic or select one from your roadmap</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
