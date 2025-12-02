"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import {
  BriefcaseIcon,
  TrendingUp,
  TrendingDown,
  Brain,
  Code2,
  Target,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Users,
  Zap,
  Award,
  Calendar,
  GitBranch,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DashboardView = ({ insights, userData }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [demandTrend, setDemandTrend] = useState([]);

  if (!insights) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-300">Loading industry insights...</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    // Generate mock demand trend data
    const trendData = Array.from({ length: 12 }, (_, i) => ({
      month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
      demand: Math.floor(50 + Math.random() * 50),
      average: 75,
    }));
    setDemandTrend(trendData);
  }, []);

  // Transform salary data for charts
  const salaryData = insights.salaryRanges.map((range) => ({
    name: range.role,
    min: range.min / 100000,
    max: range.max / 100000,
    median: range.median / 100000,
    location: range.location,
  }));

  // Demand level distribution
  const demandDistribution = [
    { name: "High Demand", value: 45, color: "#10b981" },
    { name: "Medium Demand", value: 35, color: "#f59e0b" },
    { name: "Low Demand", value: 20, color: "#ef4444" },
  ];

  const getDemandLevelColor = (level) => {
    const colors = {
      high: "bg-green-500/20 border-green-500/50 text-green-400",
      medium: "bg-amber-500/20 border-amber-500/50 text-amber-400",
      low: "bg-red-500/20 border-red-500/50 text-red-400",
    };
    return colors[level.toLowerCase()] || colors.medium;
  };

  const getMarketOutlookInfo = (outlook) => {
    const config = {
      positive: { icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/10" },
      neutral: { icon: BarChart3, color: "text-yellow-400", bg: "bg-yellow-500/10" },
      negative: { icon: TrendingDown, color: "text-red-400", bg: "bg-red-500/10" },
    };
    return config[outlook.toLowerCase()] || config.neutral;
  };

  const outlookConfig = getMarketOutlookInfo(insights.marketOutlook);
  const OutlookIcon = outlookConfig.icon;

  const lastUpdatedDate = format(new Date(insights.lastUpdated), "MMM dd, yyyy");
  const nextUpdateDistance = formatDistanceToNow(new Date(insights.nextUpdate), {
    addSuffix: true,
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const topRole = selectedRole
    ? insights.salaryRanges.find((r) => r.role === selectedRole)
    : insights.salaryRanges[0];

  return (
    <div className="w-full min-h-screen bg-black py-8 md:py-16">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto px-4 space-y-8"
      >
        {/* Hero Section */}
        <motion.div variants={item} className="text-center space-y-4 mb-12">
          <div className="inline-block">
            <Badge className="bg-purple-600/30 border border-purple-500/50 text-purple-200 px-4 py-1.5">
              Real-Time Market Analysis
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
            Industry Insights & Trends
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              {insights.industry || "Industry"}
            </span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            AI-powered market analysis with real-time demand forecasts and salary benchmarking
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <Badge variant="outline" className="bg-gray-900/50 border-gray-700">
              📅 Updated: {lastUpdatedDate}
            </Badge>
            <Badge variant="outline" className="bg-gray-900/50 border-gray-700">
              🔄 Next update {nextUpdateDistance}
            </Badge>
          </div>
        </motion.div>

        {/* Key Metrics Grid */}
        <motion.div
          variants={item}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {/* Market Outlook */}
          <motion.div whileHover={{ scale: 1.02 }} className="group">
            <Card className={`border border-gray-800 bg-gray-900/50 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all ${outlookConfig.bg}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-white">Market Outlook</CardTitle>
                  <OutlookIcon className={`h-5 w-5 ${outlookConfig.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-white">{insights.marketOutlook}</p>
                <p className="text-xs text-gray-400 mt-2">Overall market sentiment</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Growth Rate */}
          <motion.div whileHover={{ scale: 1.02 }} className="group">
            <Card className="border border-gray-800 bg-gray-900/50 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10 transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-white">Growth Rate</CardTitle>
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-400">{insights.growthRate.toFixed(1)}%</p>
                <Progress value={Math.min(insights.growthRate, 100)} className="mt-3 bg-gray-800" />
                <p className="text-xs text-gray-400 mt-2">Year-over-year expansion</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Demand Level */}
          <motion.div whileHover={{ scale: 1.02 }} className="group">
            <Card className={`border border-gray-800 ${getDemandLevelColor(insights.demandLevel).split(' ').slice(0, 3).join(' ')} hover:shadow-lg transition-all`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-white">Demand Level</CardTitle>
                  <BriefcaseIcon className="h-5 w-5 text-yellow-400" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-white">{insights.demandLevel}</p>
                <div className={`h-2 w-full rounded-full mt-3 ${getDemandLevelColor(insights.demandLevel).split(' ')[0]}`} />
                <p className="text-xs text-gray-400 mt-2">Job availability indicator</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Skills Count */}
          <motion.div whileHover={{ scale: 1.02 }} className="group">
            <Card className="border border-gray-800 bg-gray-900/50 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-white">In-Demand Skills</CardTitle>
                  <Brain className="h-5 w-5 text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-400">{insights.topSkills.length}</p>
                <p className="text-xs text-gray-400 mt-2">Core competencies needed</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Tabs Section */}
        <motion.div variants={item}>
          <Tabs defaultValue="salaries" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 bg-gray-900/50 border border-gray-800">
              <TabsTrigger value="salaries" className="data-[state=active]:bg-purple-600">
                💰 Salaries
              </TabsTrigger>
              <TabsTrigger value="skills" className="data-[state=active]:bg-purple-600">
                🧠 Skills
              </TabsTrigger>
              <TabsTrigger value="trends" className="data-[state=active]:bg-purple-600">
                📈 Trends
              </TabsTrigger>
              <TabsTrigger value="demand" className="data-[state=active]:bg-purple-600">
                📊 Demand
              </TabsTrigger>
              <TabsTrigger value="roles" className="data-[state=active]:bg-purple-600">
                👔 Top Roles
              </TabsTrigger>
            </TabsList>

            {/* Salary Analysis Tab */}
            <TabsContent value="salaries" className="space-y-4">
              <Card className="border border-gray-800 bg-gray-900/50">
                <CardHeader>
                  <CardTitle className="text-2xl text-white">Salary Benchmarking by Role</CardTitle>
                  <CardDescription>Annual compensation in Indian Rupees (₹ Lakhs)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[450px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salaryData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                          dataKey="name"
                          stroke="#9ca3af"
                          angle={-45}
                          textAnchor="end"
                          height={100}
                        />
                        <YAxis stroke="#9ca3af" label={{ value: "Salary (₹ Lakhs)", angle: -90, position: "insideLeft" }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151" }}
                          cursor={{ fill: "rgba(139, 92, 246, 0.1)" }}
                          formatter={(value) => `₹${value.toFixed(1)}L`}
                        />
                        <Legend />
                        <Bar dataKey="min" fill="#6b7280" name="Min" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="median" fill="#8b5cf6" name="Median" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="max" fill="#ec4899" name="Max" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Salary Details */}
              <div className="grid md:grid-cols-2 gap-4">
                {insights.salaryRanges.map((role, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="border border-gray-800 bg-gray-900/50 hover:border-purple-500/50 transition-all">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg text-white">{role.role}</CardTitle>
                            <div className="flex items-center gap-1 mt-1 text-sm text-gray-400">
                              <MapPin className="h-4 w-4" />
                              {role.location}
                            </div>
                          </div>
                          <Badge className="bg-purple-600/30 text-purple-200">Salary Range</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <p className="text-xs text-gray-400">Min</p>
                            <p className="text-lg font-bold text-green-400">₹{(role.min / 100000).toFixed(1)}L</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Median</p>
                            <p className="text-lg font-bold text-purple-400">₹{(role.median / 100000).toFixed(1)}L</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Max</p>
                            <p className="text-lg font-bold text-pink-400">₹{(role.max / 100000).toFixed(1)}L</p>
                          </div>
                        </div>
                        <Progress
                          value={(((role.median - role.min) / (role.max - role.min)) * 100) || 50}
                          className="bg-gray-800"
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Skills Tab */}
            <TabsContent value="skills" className="grid md:grid-cols-2 gap-4">
              {/* Top Skills */}
              <Card className="border border-gray-800 bg-gray-900/50">
                <CardHeader>
                  <CardTitle className="text-xl text-white flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    Top In-Demand Skills
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {insights.topSkills.map((skill, idx) => (
                    <motion.div
                      key={skill}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-purple-600/20 transition-all"
                    >
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                        {idx + 1}
                      </div>
                      <span className="text-gray-200 font-medium">{skill}</span>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>

              {/* Recommended Skills */}
              <Card className="border border-gray-800 bg-gray-900/50">
                <CardHeader>
                  <CardTitle className="text-xl text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-400" />
                    Skills to Develop
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {insights.recommendedSkills.map((skill, idx) => (
                    <motion.div
                      key={skill}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-green-900/20 border border-green-500/30 rounded-lg hover:bg-green-900/40 transition-all"
                    >
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                      <span className="text-gray-200 font-medium">{skill}</span>
                      <Badge className="ml-auto bg-green-600/30 text-green-200 text-xs">
                        Recommended
                      </Badge>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Trends Tab */}
            <TabsContent value="trends">
              <Card className="border border-gray-800 bg-gray-900/50">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Market Trends & Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insights.keyTrends.map((trend, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex gap-4 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/80 transition-all group"
                      >
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-200 font-medium">{trend}</p>
                          <p className="text-sm text-gray-400 mt-1">
                            This trend is shaping the current {insights.industry} landscape
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Demand Tab */}
            <TabsContent value="demand" className="grid md:grid-cols-2 gap-4">
              {/* Demand Trend Chart */}
              <Card className="border border-gray-800 bg-gray-900/50 md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Demand Forecast (12 Months)</CardTitle>
                  <CardDescription>Projected job market demand trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={demandTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="month" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151" }}
                          cursor={{ fill: "rgba(139, 92, 246, 0.1)" }}
                        />
                        <Area
                          type="monotone"
                          dataKey="demand"
                          fill="url(#colorDemand)"
                          stroke="#8b5cf6"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="average"
                          stroke="#ec4899"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          name="Average"
                        />
                        <defs>
                          <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Demand Distribution */}
              <Card className="border border-gray-800 bg-gray-900/50">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Demand Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={demandDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {demandDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Demand Stats */}
              <Card className="border border-gray-800 bg-gray-900/50">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Market Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-900/20 rounded-lg">
                      <span className="text-gray-300">High Demand Roles</span>
                      <span className="text-green-400 font-bold">45%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-amber-900/20 rounded-lg">
                      <span className="text-gray-300">Medium Demand Roles</span>
                      <span className="text-amber-400 font-bold">35%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-900/20 rounded-lg">
                      <span className="text-gray-300">Low Demand Roles</span>
                      <span className="text-red-400 font-bold">20%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Top Roles Tab */}
            <TabsContent value="roles">
              <Card className="border border-gray-800 bg-gray-900/50">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Top Job Roles Overview</CardTitle>
                  <CardDescription>Select a role to see detailed insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Role Selector */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {insights.salaryRanges.map((role) => (
                        <motion.button
                          key={role.role}
                          onClick={() => setSelectedRole(role.role)}
                          whileHover={{ scale: 1.05 }}
                          className={`p-3 rounded-lg transition-all ${
                            selectedRole === role.role
                              ? "bg-purple-600 border border-purple-400"
                              : "bg-gray-800 border border-gray-700 hover:border-purple-500/50"
                          }`}
                        >
                          <p className="text-sm font-medium text-white">{role.role}</p>
                        </motion.button>
                      ))}
                    </div>

                    {/* Selected Role Details */}
                    {topRole && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-lg border border-purple-500/30 space-y-4"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-2xl font-bold text-white">{topRole.role}</h3>
                            <div className="flex items-center gap-2 text-gray-400 mt-1">
                              <MapPin className="h-4 w-4" />
                              {topRole.location}
                            </div>
                          </div>
                          <Badge className="bg-purple-600 text-white">Detailed View</Badge>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="bg-gray-900/50 p-4 rounded-lg">
                            <p className="text-sm text-gray-400 mb-1">Minimum Salary</p>
                            <p className="text-2xl font-bold text-green-400">
                              ₹{(topRole.min / 100000).toFixed(1)}L
                            </p>
                          </div>
                          <div className="bg-gray-900/50 p-4 rounded-lg">
                            <p className="text-sm text-gray-400 mb-1">Average Salary</p>
                            <p className="text-2xl font-bold text-purple-400">
                              ₹{(topRole.median / 100000).toFixed(1)}L
                            </p>
                          </div>
                          <div className="bg-gray-900/50 p-4 rounded-lg">
                            <p className="text-sm text-gray-400 mb-1">Maximum Salary</p>
                            <p className="text-2xl font-bold text-pink-400">
                              ₹{(topRole.max / 100000).toFixed(1)}L
                            </p>
                          </div>
                        </div>

                        <div className="bg-gray-900/50 p-4 rounded-lg">
                          <p className="text-sm text-gray-400 mb-3">Salary Range Distribution</p>
                          <Progress
                            value={(((topRole.median - topRole.min) / (topRole.max - topRole.min)) * 100) || 50}
                            className="bg-gray-800 h-3"
                          />
                          <p className="text-xs text-gray-400 mt-2">
                            {Math.round(((topRole.median - topRole.min) / (topRole.max - topRole.min)) * 100) || 50}% above minimum
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Quick Stats Footer */}
        <motion.div variants={item} className="grid md:grid-cols-3 gap-4 pt-8 border-t border-gray-800">
          <Card className="border border-gray-800 bg-gray-900/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 mx-auto text-yellow-400 mb-2" />
                <p className="text-sm text-gray-400">Key Insight</p>
                <p className="text-lg font-bold text-white mt-1">
                  {insights.demandLevel} demand & {insights.growthRate > 0 ? "Growing" : "Declining"} market
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-800 bg-gray-900/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <Award className="h-8 w-8 mx-auto text-purple-400 mb-2" />
                <p className="text-sm text-gray-400">Top Role</p>
                <p className="text-lg font-bold text-white mt-1">
                  {insights.salaryRanges[0]?.role || "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-800 bg-gray-900/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto text-pink-400 mb-2" />
                <p className="text-sm text-gray-400">Skills Required</p>
                <p className="text-lg font-bold text-white mt-1">
                  {insights.topSkills.length} core competencies
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DashboardView;