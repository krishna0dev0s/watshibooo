"use client";

import { useMemo, useState } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const PhaseNode = ({ data }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} />
      
      <div
        onClick={() => setExpanded(!expanded)}
        className={`
          relative px-6 py-5 rounded-2xl cursor-pointer
          transition-all duration-300 group
          ${data.isStart
            ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/50"
            : data.isEnd
            ? "bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-pink-500/50"
            : "bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/50"
          }
          hover:shadow-2xl transform hover:scale-105
          border-2 border-white/40 backdrop-blur-sm
          min-w-max
        `}
      >
        <div className="text-white font-bold text-center">
          <div className="text-sm uppercase tracking-wider opacity-90">{data.label}</div>
          {data.metric && (
            <div className="text-2xl font-black mt-1">{data.metric}</div>
          )}
        </div>
      </div>

      {/* Expandable Details Popup */}
      {expanded && data.details && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 z-50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-cyan-400/50 rounded-2xl p-6 shadow-2xl w-80 backdrop-blur-lg">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(false);
            }}
            className="absolute top-2 right-3 text-white/50 hover:text-white text-2xl font-bold"
          >
            ×
          </button>

          <h3 className="font-bold text-cyan-300 text-lg mb-4 pr-6">{data.label}</h3>

          {data.details.topics?.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2">📚 Topics</p>
              <ul className="space-y-1">
                {data.details.topics.map((topic, i) => (
                  <li key={i} className="text-xs text-white/80 flex gap-2">
                    <span className="text-cyan-400">▸</span>
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.details.resources?.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">🔗 Resources</p>
              <ul className="space-y-1">
                {data.details.resources.map((r, i) => (
                  <li key={i} className="text-xs text-white/80 flex gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.details.projects?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-2">🚀 Projects</p>
              <ul className="space-y-1">
                {data.details.projects.map((p, i) => (
                  <li key={i} className="text-xs text-white/80 flex gap-2">
                    <span className="text-orange-400">→</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default function RoadmapXyflow({ roadmap }) {
  const { data, domain, skills, level, months } = roadmap;

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes = [];
    const edges = [];
    const horizontalSpacing = 420; // Increased horizontal spacing
    const verticalSpacing = 140; // Added vertical spacing between nodes
    let xPos = 50;

    // Start node
    nodes.push({
      id: "start",
      data: {
        label: "START",
        metric: "🚀",
        isStart: true,
        details: {
          topics: [`${level.charAt(0).toUpperCase() + level.slice(1)} Level`, `${months} Month Journey`],
        },
      },
      position: { x: xPos, y: 0 },
      type: "phase",
    });

    xPos += horizontalSpacing;

    // Phase nodes - positioned with vertical offset to prevent overlap
    data.phases?.forEach((phase, idx) => {
      const phaseMetric = phase.duration ? `${phase.duration}w` : `P${idx + 1}`;
      
      // Alternate vertical positions to stagger nodes
      const yOffset = idx % 2 === 0 ? 0 : verticalSpacing;
      
      nodes.push({
        id: `phase-${idx}`,
        data: {
          label: phase.name || `Phase ${phase.phaseNumber}`,
          metric: phaseMetric,
          details: {
            topics: phase.topics?.slice(0, 4),
            resources: phase.resources?.slice(0, 3),
            projects: phase.projects?.slice(0, 2),
          },
        },
        position: { x: xPos, y: yOffset },
        type: "phase",
      });

      // Connect from previous
      const sourceId = idx === 0 ? "start" : `phase-${idx - 1}`;
      edges.push({
        id: `edge-${sourceId}-phase-${idx}`,
        source: sourceId,
        target: `phase-${idx}`,
        animated: true,
        style: {
          stroke: "#06b6d4",
          strokeWidth: 3,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#06b6d4",
          width: 30,
          height: 30,
        },
      });

      xPos += horizontalSpacing;
    });

    // End node
    const endYOffset = data.phases?.length % 2 === 0 ? 0 : verticalSpacing;
    nodes.push({
      id: "end",
      data: {
        label: "EXPERT",
        metric: "🏆",
        isEnd: true,
        details: {
          topics: [`${domain} Mastery`, "Ready for Real Projects"],
        },
      },
      position: { x: xPos, y: endYOffset },
      type: "phase",
    });

    if (data.phases?.length > 0) {
      edges.push({
        id: `edge-phase-${data.phases.length - 1}-end`,
        source: `phase-${data.phases.length - 1}`,
        target: "end",
        animated: true,
        style: {
          stroke: "#a855f7",
          strokeWidth: 3,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#a855f7",
          width: 30,
          height: 30,
        },
      });
    }

    return { nodes, edges };
  }, [data, domain, level, months]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-4000"></div>
      </div>

      {/* ReactFlow */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={{ phase: PhaseNode }}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        defaultViewport={{ x: 100, y: 100, zoom: 1 }}
      >
        <Background 
          color="#1e293b" 
          gap={30}
          style={{ opacity: 0.3 }}
        />
        <Controls
          style={{
            background: "rgba(15, 23, 42, 0.9)",
            border: "2px solid rgba(6, 182, 212, 0.3)",
            borderRadius: "12px",
          }}
          position="top-right"
        />
      </ReactFlow>

      {/* Info Card - Left Side */}
      <div className="absolute top-6 left-6 max-w-xs z-40">
        <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-lg border-2 border-cyan-400/30 rounded-2xl p-6 shadow-2xl">
          <div className="mb-4 pb-4 border-b border-cyan-400/20">
            <h2 className="text-2xl font-black text-cyan-300 mb-1">{domain}</h2>
            <p className="text-xs text-white/60 uppercase tracking-widest">Learning Roadmap</p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/70">📊 Level</span>
              <span className="text-sm font-bold text-cyan-300 capitalize">{level}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/70">⏱️ Duration</span>
              <span className="text-sm font-bold text-emerald-300">{months} months</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/70">🎯 Phases</span>
              <span className="text-sm font-bold text-orange-300">{data.phases?.length}</span>
            </div>
          </div>

          {skills && (
            <div className="mt-4 pt-4 border-t border-cyan-400/20">
              <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2">Skills</p>
              <div className="flex flex-wrap gap-2">
                {skills.split(",").slice(0, 4).map((skill, i) => (
                  <span
                    key={i}
                    className="inline-block bg-cyan-500/20 text-cyan-300 text-xs px-2.5 py-1 rounded-lg font-semibold border border-cyan-400/30"
                  >
                    {skill.trim()}
                  </span>
                ))}
                {skills.split(",").length > 4 && (
                  <span className="text-xs text-white/50 px-2.5 py-1">
                    +{skills.split(",").length - 4}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Metrics/Tips - Bottom Left */}
      <div className="absolute bottom-6 left-6 max-w-sm z-40">
        <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-lg border-2 border-purple-400/30 rounded-2xl p-5 shadow-2xl">
          <p className="text-sm font-bold text-purple-300 uppercase tracking-widest mb-3">💡 How to Use</p>
          <ul className="space-y-2 text-xs text-white/70">
            <li className="flex gap-2">
              <span className="text-cyan-400 font-bold">•</span>
              <span><span className="text-cyan-300 font-semibold">Click nodes</span> for details</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-400 font-bold">•</span>
              <span><span className="text-cyan-300 font-semibold">Scroll</span> to zoom</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-400 font-bold">•</span>
              <span><span className="text-cyan-300 font-semibold">Drag canvas</span> to pan</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-400 font-bold">•</span>
              <span><span className="text-cyan-300 font-semibold">Use controls</span> top-right</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
