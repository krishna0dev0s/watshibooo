"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Target, BookOpen, Zap, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function RoadmapPreview({ roadmap, onBack }) {
  const { data, domain, skills, level, months, generatedAt } = roadmap;
  const [expandedPhase, setExpandedPhase] = useState(0);

  const phaseColors = [
    { bg: "from-blue-500 to-blue-600", light: "bg-blue-50", border: "border-blue-300", text: "text-blue-700" },
    { bg: "from-purple-500 to-purple-600", light: "bg-purple-50", border: "border-purple-300", text: "text-purple-700" },
    { bg: "from-pink-500 to-pink-600", light: "bg-pink-50", border: "border-pink-300", text: "text-pink-700" },
    { bg: "from-orange-500 to-orange-600", light: "bg-orange-50", border: "border-orange-300", text: "text-orange-700" },
    { bg: "from-green-500 to-green-600", light: "bg-green-50", border: "border-green-300", text: "text-green-700" },
    { bg: "from-cyan-500 to-cyan-600", light: "bg-cyan-50", border: "border-cyan-300", text: "text-cyan-700" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          onClick={onBack}
          variant="outline"
          className="border-white/10 hover:bg-white/5"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-white">{domain} Roadmap</h2>
          <p className="text-sm text-gray-400">{level} • {months} months</p>
        </div>
      </div>

      {/* Main Visual Roadmap */}
      <div id="roadmap-pdf" className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 border border-white/10">
        
        {/* Decorative Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-2">
            {domain}
          </h1>
          <p className="text-gray-300 text-lg">Your Complete Learning Journey</p>
          <div className="flex justify-center gap-8 mt-6 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{data.phases?.length}</div>
              <div className="text-gray-400">Phases</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{months}</div>
              <div className="text-gray-400">Months</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-400">{data.phases?.reduce((acc, p) => acc + (p.projects?.length || 0), 0)}</div>
              <div className="text-gray-400">Projects</div>
            </div>
          </div>
        </div>

        {/* Overview */}
        {data.overview && (
          <div className="mb-10 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <p className="text-gray-200 leading-relaxed">{data.overview}</p>
          </div>
        )}

        {/* Visual Flow - Learning Phases as Connected Cards */}
        <div className="relative">
          {/* Connection Lines */}
          <div className="absolute inset-0 pointer-events-none">
            {data.phases?.map((_, idx) => (
              <div key={idx} className="absolute w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent top-20 opacity-30" 
                style={{ top: `${(idx + 1) * 100}%` }} />
            ))}
          </div>

          {/* Phases Container */}
          <div className="space-y-6">
            {data.phases?.map((phase, idx) => {
              const color = phaseColors[idx % phaseColors.length];
              const isExpanded = expandedPhase === idx;

              return (
                <div key={idx} className="relative">
                  {/* Connection Arrow */}
                  {idx < data.phases.length - 1 && (
                    <div className="absolute left-1/2 -translate-x-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 -bottom-10" />
                  )}

                  {/* Phase Card */}
                  <div
                    onClick={() => setExpandedPhase(isExpanded ? -1 : idx)}
                    className="relative cursor-pointer group"
                  >
                    <div className={`bg-gradient-to-r ${color.bg} rounded-xl p-1 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}>
                      <div className="bg-slate-900 rounded-lg p-6 relative overflow-hidden">
                        {/* Phase Number Badge */}
                        <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-r ${color.bg} opacity-20`} />
                        
                        <div className="relative z-10 flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${color.bg} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                                {phase.phaseNumber}
                              </div>
                              <h3 className="text-xl font-bold text-white">{phase.name}</h3>
                            </div>
                            <p className="text-sm text-gray-400">{phase.duration}</p>
                          </div>
                          <div className={`text-2xl transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} text-gray-400`}>
                            ▼
                          </div>
                        </div>

                        {/* Expanded Content */}
                        <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96 mt-6 pt-6 border-t border-white/10' : 'max-h-0'}`}>
                          {/* Topics */}
                          <div className="mb-4">
                            <h4 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-blue-400" />
                              Topics to Master
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {phase.topics?.map((topic, tidx) => (
                                <span key={tidx} className={`px-3 py-1 rounded-full text-xs font-medium ${color.light} ${color.text} border ${color.border}`}>
                                  {topic}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Resources */}
                          <div className="mb-4">
                            <h4 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                              <Target className="w-4 h-4 text-purple-400" />
                              Resources
                            </h4>
                            <ul className="space-y-2">
                              {phase.resources?.slice(0, 3).map((resource, ridx) => (
                                <li key={ridx} className="text-sm text-gray-300 flex items-start gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                  <span>{resource}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Projects */}
                          {phase.projects && phase.projects.length > 0 && (
                            <div>
                              <h4 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-orange-400" />
                                Practice Projects
                              </h4>
                              <ul className="space-y-2">
                                {phase.projects?.slice(0, 2).map((project, pidx) => (
                                  <li key={pidx} className="text-sm text-gray-300 flex items-start gap-2">
                                    <span className="text-orange-400 font-bold">→</span>
                                    <span>{project}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Milestone */}
                          <div className={`mt-4 p-3 rounded-lg ${color.light} border-l-4 ${color.border}`}>
                            <p className="text-xs font-bold text-gray-600">🎯 Milestone: {phase.milestone}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Skills Section */}
        <div className="mt-12 p-8 bg-gradient-to-r from-white/5 to-white/5 backdrop-blur-sm rounded-xl border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-400" />
            Target Skills
          </h2>
          <div className="flex flex-wrap gap-3">
            {skills.split(",").map((skill, idx) => (
              <div key={idx} className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-full text-sm font-medium text-blue-300 hover:border-blue-400/60 transition-colors">
                ✨ {skill.trim()}
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        {(data.tools || data.tips || data.capstoneProjects) && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tools */}
            {data.tools && data.tools.length > 0 && (
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                  <span className="text-xl">⚙️</span>
                  Tools
                </h3>
                <div className="space-y-2">
                  {data.tools?.slice(0, 4).map((tool, idx) => (
                    <div key={idx} className="text-sm text-gray-300">• {tool}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            {data.tips && data.tips.length > 0 && (
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                  <span className="text-xl">💡</span>
                  Tips
                </h3>
                <div className="space-y-2">
                  {data.tips?.slice(0, 4).map((tip, idx) => (
                    <div key={idx} className="text-sm text-gray-300">• {tip}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Capstone */}
            {data.capstoneProjects && data.capstoneProjects.length > 0 && (
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                  <span className="text-xl">🏆</span>
                  Capstone
                </h3>
                <div className="space-y-2">
                  {data.capstoneProjects?.slice(0, 3).map((project, idx) => (
                    <div key={idx} className="text-sm text-gray-300">• {project}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-white/10 text-center text-gray-500 text-xs">
          <p>Generated on {generatedAt}</p>
        </div>
      </div>
    </div>
  );
}
