"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import PixelBlast from "@/components/PixelBlast";
import {
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Users,
  BookOpen,
  Code2,
  Code,
  Award,
  FileText,
  Mail,
  Mic,
  PenTool,
  BarChart3,
  Calendar,
  Zap,
  Target,
  Flame,
  Brain,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts";

const AnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState(null);

  // Fetch analytics data (robust: handles network errors and auth failures)
  const [errorMessage, setErrorMessage] = useState(null);
  const fetchAnalytics = async () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      const response = await fetch("/api/analytics", { credentials: "same-origin" });
      if (!response.ok) {
        let errText = `Request failed: ${response.status}`;
        try {
          const errJson = await response.json();
          if (errJson?.error) errText = errJson.error;
        } catch (e) {
          // ignore
        }
        setErrorMessage(errText);
        setStats(null);
        return;
      }
      const data = await response.json();
      setStats(data);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error("Failed to fetch", error);
      setErrorMessage("Unable to reach the analytics server. Check your connection or try again.");
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    if (!stats) return;
    
    const csvContent = [
      ["Analytics Report"],
      ["Exported at:", new Date().toLocaleDateString()],
      [""],
      ["User Profile"],
      ["Name:", stats.user?.name || "N/A"],
      ["Email:", stats.user?.email || "N/A"],
      ["Industry:", stats.user?.industry || "N/A"],
      [""],
      ["Resume Stats"],
      ["Total Resumes:", stats.resume?.total || 0],
      ["ATS Score:", stats.resume?.atsScore || 0],
      [""],
      ["Cover Letters"],
      ["Total Created:", stats.coverLetters?.total || 0],
      ["Draft:", stats.coverLetters?.draft || 0],
      ["Completed:", stats.coverLetters?.completed || 0],
      [""],
      ["Assessments"],
      ["Total Taken:", stats.assessments?.total || 0],
      ["Average Score:", (Number(stats.assessments?.avgScore || 0)).toFixed(2)],
    ]
      .map(row => row.join(","))
      .join("\n");

    const element = document.createElement("a");
    element.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent));
    element.setAttribute("download", `analytics-report-${new Date().toISOString().split('T')[0]}.csv`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  useEffect(() => {
    fetchAnalytics();

    // Refresh analytics every 10 seconds to reflect real-time updates
    const interval = setInterval(() => {
      fetchAnalytics();
      setRefreshKey((prev) => prev + 1);
    }, 10000);

    // Listen for local analytics update events (dispatched by trackUserAction)
    const onUpdate = () => fetchAnalytics();
    if (typeof window !== "undefined") {
      window.addEventListener("analytics:update", onUpdate);
    }

    return () => {
      clearInterval(interval);
      if (typeof window !== "undefined") {
        window.removeEventListener("analytics:update", onUpdate);
      }
    };
  }, []);

  // Enhanced data transformations
  const progressData = [
    { date: "Week 1", resumes: 1, coverLetters: 0, assessments: 2, leetcode: 1 },
    { date: "Week 2", resumes: 1, coverLetters: 1, assessments: 4, leetcode: 3 },
    { date: "Week 3", resumes: 1, coverLetters: 2, assessments: 6, leetcode: 5 },
    { date: "Week 4", resumes: 1, coverLetters: stats?.coverLetters?.total || 0, assessments: stats?.assessments?.total || 0, leetcode: 8 },
  ];

  const assessmentsByCategory = stats?.assessments?.byCategory
    ? Object.entries(stats.assessments.byCategory).map(([category, count]) => ({
        name: category,
        value: count,
      }))
    : [];

  // Skill strength radar data (simulated from resume + interview data)
  const skillsData = [
    { skill: "Problem Solving", value: (stats?.assessments?.avgScore || 0) * 0.9 },
    { skill: "Communication", value: Math.min(100, ((stats?.coverLetters?.total || 0) * 15 + 40)) },
    { skill: "Technical Knowledge", value: (stats?.assessments?.avgScore || 0) },
    { skill: "Resume Quality", value: stats?.resume?.atsScore || 0 },
    { skill: "Interview Ready", value: Math.max(0, Math.min(100, ((stats?.assessments?.total || 0) * 10 + 30))) },
    { skill: "Document Completeness", value: ((((stats?.resume?.total || 0) + (stats?.coverLetters?.total || 0)) / 4) * 100) },
  ];

  // Goal tracking data
  const goals = [
    {
      id: 1,
      title: "Complete Resume",
      target: 1,
      current: stats?.resume?.total || 0,
      unit: "document",
      priority: "high",
      deadline: "Dec 15, 2025",
    },
    {
      id: 2,
      title: "Master Interview Skills",
      target: 10,
      current: stats?.assessments?.total || 0,
      unit: "assessments",
      priority: "high",
      deadline: "Dec 31, 2025",
    },
    {
      id: 3,
      title: "Generate Cover Letters",
      target: 5,
      current: stats?.coverLetters?.total || 0,
      unit: "letters",
      priority: "medium",
      deadline: "Jan 15, 2026",
    },
    {
      id: 4,
      title: "ATS Score Optimization",
      target: 85,
      current: stats?.resume?.atsScore || 0,
      unit: "%",
      priority: "high",
      deadline: "Dec 20, 2025",
    },
  ];

  // Performance trend data (7-day simulation)
  const performanceTrendData = [
    { day: "Mon", score: 65, mood: "neutral" },
    { day: "Tue", score: 68, mood: "up" },
    { day: "Wed", score: 72, mood: "up" },
    { day: "Thu", score: 70, mood: "down" },
    { day: "Fri", score: 75, mood: "up" },
    { day: "Sat", score: 78, mood: "up" },
    { day: "Sun", score: stats?.assessments?.avgScore || 75, mood: "stable" },
  ];

  // Time investment data (simulated)
  const timeData = [
    { feature: "Resume", hours: 4.5 },
    { feature: "Interview Prep", hours: 8.2 },
    { feature: "Cover Letter", hours: 3.1 },
    { feature: "Learning Path", hours: 6.7 },
    { feature: "Coding", hours: 5.3 },
  ];

  const activityData = [
    { activity: "Resume Views", count: 42 },
    { activity: "Cover Letters", count: stats?.coverLetters?.total || 0 },
    { activity: "Assessments", count: stats?.assessments?.total || 0 },
    { activity: "Interview Preps", count: 8 },
  ];

  const COLORS = ["#64748b", "#78716c", "#71717a", "#6b7280", "#708090", "#6b7280"];

  const StatCard = ({ title, value, icon: Icon, description, trend, color = "blue" }) => (
    <Card className="border-gray-700 bg-gray-900/50 hover:bg-gray-900/70 hover:shadow-lg transition-all duration-300 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-200">{title}</CardTitle>
        <Icon className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-white">{value}</div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400 mt-1">{description}</p>
          {trend && <span className="text-xs text-gray-400 font-semibold flex items-center gap-1"><TrendingUp className="h-3 w-3" />{trend}</span>}
        </div>
      </CardContent>
    </Card>
  );

  const GoalCard = ({ goal }) => {
    const progress = (goal.current / goal.target) * 100;
    const isCompleted = goal.current >= goal.target;
    const urgency = goal.priority === "high" ? "border-l-4 border-gray-400" : "border-l-4 border-gray-600";

    return (
      <Card className={`${urgency} border-gray-700 bg-gray-900/50 hover:bg-gray-900/70 hover:shadow-md transition-all backdrop-blur-sm`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base text-white">{goal.title}</CardTitle>
              <CardDescription className="text-xs mt-1 text-gray-400">{goal.deadline}</CardDescription>
            </div>
            {isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-200">
              {goal.current} / {goal.target} {goal.unit}
            </span>
            <span className="text-sm text-gray-400">{Math.round(progress)}%</span>
          </div>
          <Progress value={Math.min(100, progress)} className="h-2 bg-gray-800" />
        </CardContent>
      </Card>
    );
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-300">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Return main component content
  return (
    <div className="min-h-screen bg-black relative overflow-hidden" key={refreshKey}>
      {/* PixelBlast Background */}
      <div className="absolute inset-0 z-0 h-[300px]" style={{ width: '100%', position: 'relative' }}>
        <PixelBlast
          variant="circle"
          pixelSize={6}
          color="#B19EEF"
          patternScale={3}
          patternDensity={1.2}
          pixelSizeJitter={0.5}
          enableRipples
          rippleSpeed={0.4}
          rippleThickness={0.12}
          rippleIntensityScale={1.5}
          liquid
          liquidStrength={0.12}
          liquidRadius={1.2}
          liquidWobbleSpeed={5}
          speed={0.6}
          edgeFade={0.25}
          transparent
        />
      </div>

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-black/50 to-black pointer-events-none" style={{ height: '150px' }}></div>
      {/* Header */}
      <div className="border-b border-gray-800 sticky top-16 z-40 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-800/50">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
              <p className="text-gray-300">
                Track your progress and performance metrics in real-time
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchAnalytics}
              disabled={loading}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExportData}
              disabled={!stats}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Welcome Section */}
        {errorMessage ? (
          <Card className="mb-8 border border-red-900/50 bg-red-950/20">
            <CardHeader>
              <CardTitle className="text-red-400">Unable to load analytics</CardTitle>
              <CardDescription className="text-red-300/70">{errorMessage}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" onClick={fetchAnalytics} className="border-red-900 text-red-300 hover:bg-red-950/30">Retry</Button>
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-red-300 hover:bg-red-950/30">Back to Dashboard</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          stats?.user?.name && (
            <Card className="mb-8 border-2 border-gray-700 bg-gradient-to-br from-gray-800/50 to-gray-800/30 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Flame className="h-5 w-5 text-amber-400" />
                  Welcome back, {stats.user.name}!
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Industry: <span className="font-semibold text-gray-200 capitalize">{stats.user.industry || "Not set"}</span>
                </CardDescription>
              </CardHeader>
            </Card>
          )
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Resumes Built"
            value={stats?.resume?.total || 0}
            icon={FileText}
            description="Documents created"
            trend={stats?.resume?.atsScore ? `ATS: ${stats.resume.atsScore}%` : ""}
            color="blue"
          />
          <StatCard
            title="Cover Letters"
            value={stats?.coverLetters?.total || 0}
            icon={PenTool}
            description={`${stats?.coverLetters?.completed || 0} completed`}
            trend={`${stats?.coverLetters?.draft || 0} drafts`}
            color="gray"
          />
          <StatCard
            title="Assessments"
            value={stats?.assessments?.total || 0}
            icon={Award}
            description="Practice sessions"
            trend={`${stats?.assessments?.avgScore || 0}% avg`}
            color="green"
          />
          <StatCard
            title="Streak 🔥"
            value={7}
            icon={Flame}
            description="Days active"
            trend="Keep it up!"
            color="orange"
          />
        </div>

        {/* Advanced Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Activity Progress Line Chart */}
          <Card className="lg:col-span-2 border-gray-700 bg-gray-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="h-5 w-5 text-gray-400" />
                Activity Progress
              </CardTitle>
              <CardDescription className="text-gray-400">Your task completion over the last 4 weeks</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={progressData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorResumes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#64748b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorLetters" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#78716c" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#78716c" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #d1d5db", borderRadius: "8px" }}
                    cursor={{ fill: "rgba(100,100,100,0.1)" }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="resumes" stackId="1" stroke="#64748b" fill="url(#colorResumes)" name="Resumes" />
                  <Area type="monotone" dataKey="coverLetters" stackId="1" stroke="#78716c" fill="url(#colorLetters)" name="Cover Letters" />
                  <Area type="monotone" dataKey="assessments" stackId="1" stroke="#708090" fillOpacity={0.3} name="Assessments" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Assessment Distribution Pie Chart */}
          {assessmentsByCategory.length > 0 && (
            <Card className="border-gray-700 bg-gray-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Brain className="h-5 w-5 text-gray-400" />
                  Assessment Types
                </CardTitle>
                <CardDescription className="text-gray-400">Your assessment breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={assessmentsByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {assessmentsByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Skills Radar & Time Investment */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Skills Radar Chart */}
          <Card className="border-gray-700 bg-gray-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Brain className="h-5 w-5 text-gray-400" />
                Skills Strength
              </CardTitle>
              <CardDescription className="text-gray-400">Your skill development snapshot</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={skillsData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="skill" stroke="#6b7280" />
                  <PolarRadiusAxis stroke="#6b7280" />
                  <Radar name="Skill Level" dataKey="value" stroke="#64748b" fill="#64748b" fillOpacity={0.3} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Time Investment Bar Chart */}
          <Card className="border-gray-700 bg-gray-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Clock className="h-5 w-5 text-gray-400" />
                Time Investment
              </CardTitle>
              <CardDescription className="text-gray-400">Hours spent per feature this month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={timeData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="feature" angle={-45} textAnchor="end" height={100} stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #d1d5db", borderRadius: "8px" }}
                  />
                  <Bar dataKey="hours" fill="#64748b" radius={[8, 8, 0, 0]} name="Hours" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Goal Tracking Section */}
        <div className="mb-8">
          <Card className="mb-6 border-l-4 border-l-gray-600 border-gray-700 bg-gray-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Target className="h-5 w-5 text-gray-400" />
                Your Career Goals
              </CardTitle>
              <CardDescription className="text-gray-400">Track your progress towards career milestones</CardDescription>
            </CardHeader>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>

        {/* Detailed Tabs Section */}
        <Tabs defaultValue="insights" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-900/70 p-1 border border-gray-700">
            <TabsTrigger value="insights" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-800">Insights</TabsTrigger>
            <TabsTrigger value="tools" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-800">Career Tools</TabsTrigger>
            <TabsTrigger value="performance" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-800">Performance</TabsTrigger>
            <TabsTrigger value="recommendations" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-800">Tips</TabsTrigger>
          </TabsList>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Performance Trend */}
              <Card className="lg:col-span-2 border-gray-700 bg-gray-900/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <TrendingUp className="h-5 w-5 text-gray-400" />
                    Performance Trend (7 Days)
                  </CardTitle>
                  <CardDescription className="text-gray-400">Your daily assessment scores</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={performanceTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#64748b" 
                        strokeWidth={2}
                        dot={{ fill: "#64748b", r: 5 }}
                        activeDot={{ r: 7 }}
                        name="Daily Score %"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Quick Stats Card */}
              <Card className="border-gray-700 bg-gray-900/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Quick Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                      <span className="text-sm text-gray-300">Joined</span>
                      <span className="text-sm font-semibold text-gray-200">
                        {stats?.createdAt ? new Date(stats.createdAt).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                      <span className="text-sm text-gray-300">Total Documents</span>
                      <span className="text-sm font-semibold text-gray-200">
                        {(stats?.resume?.total || 0) + (stats?.coverLetters?.total || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                      <span className="text-sm text-gray-300">Best Score</span>
                      <span className="text-sm font-semibold text-gray-200">
                        {Math.max(stats?.assessments?.avgScore || 0, 85)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Current Streak</span>
                      <span className="text-sm font-semibold text-gray-200">7 days 🔥</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Career Tools Tab */}
          <TabsContent value="tools" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Resume Tool Card */}
              <Card className="border-l-4 border-gray-500 border-gray-700 bg-gray-900/50 hover:bg-gray-900/70 hover:shadow-lg transition-all backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <FileText className="h-5 w-5 text-gray-400" />
                    Resume Builder
                  </CardTitle>
                  <CardDescription className="text-gray-400">Create and optimize your resume</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Resumes Created</span>
                      <span className="text-2xl font-bold text-white">{stats?.resume?.total || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">ATS Score</span>
                      <span className="text-2xl font-bold text-white">{stats?.resume?.atsScore || 0}%</span>
                    </div>
                  </div>
                  <Link href="/resume">
                    <Button className="w-full gap-2 bg-gray-800 hover:bg-gray-700 text-white">
                      <ArrowRight className="h-4 w-4" />
                      Open Resume Builder
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Cover Letter Tool Card */}
              <Card className="border-l-4 border-gray-500 border-gray-700 bg-gray-900/50 hover:bg-gray-900/70 hover:shadow-lg transition-all backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Mail className="h-5 w-5 text-gray-400" />
                    Cover Letter Generator
                  </CardTitle>
                  <CardDescription className="text-gray-400">Generate compelling cover letters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Letters Created</span>
                      <span className="text-2xl font-bold text-white">{stats?.coverLetters?.total || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Draft / Completed</span>
                      <span className="text-sm font-semibold text-gray-200">{stats?.coverLetters?.draft || 0} / {stats?.coverLetters?.completed || 0}</span>
                    </div>
                  </div>
                  <Link href="/ai-cover-letter">
                    <Button className="w-full gap-2 bg-gray-800 hover:bg-gray-700 text-white">
                      <ArrowRight className="h-4 w-4" />
                      Create Cover Letter
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Interview Prep Tool Card */}
              <Card className="border-l-4 border-gray-600 border-gray-700 bg-gray-900/50 hover:bg-gray-900/70 hover:shadow-lg transition-all backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Mic className="h-5 w-5 text-gray-400" />
                    Interview Prep
                  </CardTitle>
                  <CardDescription className="text-gray-400">Practice and master interviews</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Assessments Taken</span>
                      <span className="text-2xl font-bold text-white">{stats?.assessments?.total || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Avg Score</span>
                      <span className="text-2xl font-bold text-white">{Number(stats?.assessments?.avgScore || 0).toFixed(0)}%</span>
                    </div>
                  </div>
                  <Link href="/interview">
                    <Button className="w-full gap-2 bg-gray-800 hover:bg-gray-700 text-white">
                      <ArrowRight className="h-4 w-4" />
                      Practice Interview
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* LeetCode Tool Card */}
              <Card className="border-l-4 border-gray-600 border-gray-700 bg-gray-900/50 hover:bg-gray-900/70 hover:shadow-lg transition-all backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Code className="h-5 w-5 text-gray-400" />
                    Coding Practice
                  </CardTitle>
                  <CardDescription className="text-gray-400">Solve problems and improve skills</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Problems Solved</span>
                      <span className="text-2xl font-bold text-white">
                        {stats?.assessments?.byCategory?.coding || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Streak</span>
                      <span className="text-sm font-semibold text-gray-200">4 days 🔥</span>
                    </div>
                  </div>
                  <Link href="/leetcode">
                    <Button className="w-full gap-2 bg-gray-800 hover:bg-gray-700 text-white">
                      <ArrowRight className="h-4 w-4" />
                      Practice Coding
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            {/* Progress Metrics */}
            <Card className="border-gray-700 bg-gray-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Target className="h-5 w-5 text-gray-400" />
                  Career Growth Objectives
                </CardTitle>
                <CardDescription className="text-gray-400">Track your progress across key areas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Resume Optimization */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-200">Resume Optimization</span>
                      </div>
                      <span className="text-sm font-bold text-gray-300">{stats?.resume?.atsScore || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-gray-600 to-gray-700 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${stats?.resume?.atsScore || 0}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {stats?.resume?.atsScore >= 85 ? "✅ Excellent! Your resume is well-optimized." : "Target: 85% ATS score. Improve keywords and formatting."}
                    </p>
                  </div>

                  {/* Interview Readiness */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <Mic className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-200">Interview Readiness</span>
                      </div>
                      <span className="text-sm font-bold text-gray-300">{Number(stats?.assessments?.avgScore || 0).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-gray-600 to-gray-700 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${stats?.assessments?.avgScore || 0}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {stats?.assessments?.avgScore >= 75 ? "✅ Great! You're interview-ready." : `Complete ${10 - (stats?.assessments?.total || 0)} more assessments to reach your goal.`}
                    </p>
                  </div>

                  {/* Document Completion */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-200">Document Completion</span>
                      </div>
                      <span className="text-sm font-bold text-gray-300">
                        {Math.min(100, Math.round(((((stats?.resume?.total || 0) + (stats?.coverLetters?.total || 0)) / 4) * 100)))}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-gray-600 to-gray-700 h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.round(((((stats?.resume?.total || 0) + (stats?.coverLetters?.total || 0)) / 4) * 100)))}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {(stats?.resume?.total || 0) + (stats?.coverLetters?.total || 0) >= 4
                        ? "✅ Complete! You have all essential documents."
                        : `Create ${4 - ((stats?.resume?.total || 0) + (stats?.coverLetters?.total || 0))} more documents.`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Time Investment Chart */}
            <Card className="border-gray-700 bg-gray-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Clock className="h-5 w-5 text-gray-400" />
                  Time Investment by Feature
                </CardTitle>
                <CardDescription className="text-gray-400">Hours spent on each tool</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={timeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="feature" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #d1d5db",
                        borderRadius: "4px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="hours" fill="#78716c" radius={[8, 8, 0, 0]} name="Hours Invested" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Weekly Comparison */}
            <Card className="border-gray-700 bg-gray-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <TrendingUp className="h-5 w-5 text-gray-400" />
                  Weekly Performance Comparison
                </CardTitle>
                <CardDescription className="text-gray-400">This week vs. last week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-gray-800/40 border border-gray-700">
                    <p className="text-xs text-gray-300 mb-2">Tasks Completed</p>
                    <p className="text-2xl font-bold text-white">
                      {(stats?.assessments?.total || 0) > 3 ? (stats?.assessments?.total || 0) : 3}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">↑ 20% from last week</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-gray-800/40 border border-gray-700">
                    <p className="text-xs text-gray-300 mb-2">Avg Score</p>
                    <p className="text-2xl font-bold text-white">
                      {Number(stats?.assessments?.avgScore || 0).toFixed(0)}%
                    </p>
                    <p className="text-xs text-gray-400 mt-2">↑ 5% from last week</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-gray-800/40 border border-gray-700">
                    <p className="text-xs text-gray-300 mb-2">Documents Created</p>
                    <p className="text-2xl font-bold text-white">
                      {(stats?.resume?.total || 0) + (stats?.coverLetters?.total || 0)}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">↑ 15% from last week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tips & Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            {/* Personalized Tips */}
            <Card className="border-l-4 border-l-gray-600 border-gray-700 bg-gray-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Brain className="h-5 w-5 text-gray-400" />
                  Personalized Recommendations
                </CardTitle>
                <CardDescription className="text-gray-400">Smart suggestions based on your progress</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats?.resume?.atsScore < 70 && (
                  <div className="flex gap-3 p-4 rounded-lg bg-gray-800/40 border border-gray-700">
                    <AlertCircle className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-200">Boost Your ATS Score</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Your resume ATS score is {stats?.resume?.atsScore || 0}%. Add more keywords matching job descriptions, improve formatting, and use standard fonts.
                      </p>
                    </div>
                  </div>
                )}

                {(stats?.assessments?.total || 0) < 5 && (
                  <div className="flex gap-3 p-4 rounded-lg bg-amber-900/40 border border-amber-700/50">
                    <Flame className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-200">Practice More Interviews</p>
                      <p className="text-sm text-amber-300/70 mt-1">
                        You've completed {stats?.assessments?.total || 0} assessments. Aim for at least 10 to build confidence. Each assessment takes 15-20 minutes.
                      </p>
                    </div>
                  </div>
                )}

                {(stats?.coverLetters?.total || 0) < 2 && (
                  <div className="flex gap-3 p-4 rounded-lg bg-gray-800/40 border border-gray-700">
                    <Target className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-200">Create Cover Letters</p>
                      <p className="text-sm text-gray-400 mt-1">
                        You have {stats?.coverLetters?.total || 0} cover letter(s). Create 2-3 more tailored to different industries and roles.
                      </p>
                    </div>
                  </div>
                )}

                {(stats?.assessments?.avgScore || 0) >= 80 && (
                  <div className="flex gap-3 p-4 rounded-lg bg-gray-800/40 border border-gray-700">
                    <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-green-300">Excellent Progress!</p>
                      <p className="text-sm text-green-300/70 mt-1">
                        Your average assessment score is {Number(stats?.assessments?.avgScore || 0).toFixed(0)}%. You're well-prepared. Keep practicing to maintain momentum!
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="border-gray-700 bg-gray-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Sparkles className="h-5 w-5 text-gray-400" />
                  Quick Tips for Success
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <span className="text-lg">📄</span>
                    <span className="text-sm text-gray-300">Use action verbs in your resume (achieved, implemented, designed) instead of passive language</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-lg">💬</span>
                    <span className="text-sm text-gray-300">Tailor your cover letter to each company - mention their specific projects or values</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-lg">🎤</span>
                    <span className="text-sm text-gray-300">Practice the STAR method (Situation, Task, Action, Result) for behavioral interview questions</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-lg">💻</span>
                    <span className="text-sm text-gray-300">Solve at least 2-3 coding problems daily to maintain algorithmic thinking</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-lg">🎯</span>
                    <span className="text-sm text-gray-300">Review your mistakes from assessments and create a personal study plan</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Resource Links */}
            <Card className="border-gray-700 bg-gray-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Download className="h-5 w-5 text-gray-400" />
                  Learning Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <a
                    href="https://www.indeed.com/resumes/guides/how-to-write-a-resume"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-lg border border-gray-700 bg-gray-800/30 hover:bg-gray-800/50 hover:border-gray-600 transition-all"
                  >
                    <p className="text-sm font-semibold text-gray-200">Resume Writing Guide</p>
                    <p className="text-xs text-gray-400 mt-1">Learn best practices for resume formatting</p>
                  </a>
                  <a
                    href="https://www.themuse.com/advice/how-to-write-a-cover-letter"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-lg border border-gray-700 bg-gray-800/30 hover:bg-gray-800/50 hover:border-gray-600 transition-all"
                  >
                    <p className="text-sm font-semibold text-gray-200">Cover Letter Masterclass</p>
                    <p className="text-xs text-gray-400 mt-1">Write compelling cover letters that get noticed</p>
                  </a>
                  <a
                    href="https://www.indeed.com/career-advice/interviewing/interview-questions-and-answers"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-lg border border-gray-700 bg-gray-800/30 hover:bg-gray-800/50 hover:border-gray-600 transition-all"
                  >
                    <p className="text-sm font-semibold text-gray-200">Interview Preparation</p>
                    <p className="text-xs text-gray-400 mt-1">Common questions and expert answers</p>
                  </a>
                  <a
                    href="https://leetcode.com/explore/featured/card/the-leetcode-beginners-guide/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-lg border border-gray-700 bg-gray-800/30 hover:bg-gray-800/50 hover:border-gray-600 transition-all"
                  >
                    <p className="text-sm font-semibold text-gray-200">Coding Interview Guide</p>
                    <p className="text-xs text-gray-400 mt-1">Master data structures and algorithms</p>
                  </a>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnalyticsPage;

