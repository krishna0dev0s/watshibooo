"use client";

import { useState, useCallback, useMemo } from "react";
import ReactFlow, { 
  Node, 
  Edge, 
  Controls, 
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";

const CustomNode = ({ data, isConnectable }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const bgColor = data.isPhase ? "from-blue-500 to-blue-600" : "from-slate-600 to-slate-700";
  const hoverBg = data.isPhase ? "hover:from-blue-600 hover:to-blue-700" : "hover:from-slate-700 hover:to-slate-800";
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          relative px-6 py-3 rounded-lg font-semibold text-white text-center
          bg-gradient-to-br ${bgColor} ${hoverBg}
          transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/50
          border border-white/20 cursor-pointer
          w-52 group whitespace-normal
        `}
      >
        <div className="font-bold text-sm leading-tight">{data.title}</div>
        {data.subtitle && (
          <div className="text-xs text-white/80 mt-1 leading-tight">{data.subtitle}</div>
        )}
        {data.isPhase && (
          <div className="text-xs text-blue-200 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Click to expand
          </div>
        )}
      </button>

      {/* Expanded Details Popup */}
      {isExpanded && data.details && (
        <div className="absolute top-1/2 left-full transform -translate-y-1/2 ml-4 z-50 w-96 bg-gradient-to-br from-slate-800 to-slate-900 border border-blue-400/50 rounded-xl p-4 shadow-2xl pointer-events-auto max-h-96 overflow-y-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(false);
            }}
            className="absolute top-2 right-2 text-white/50 hover:text-white text-lg"
          >
            ✕
          </button>
          
          <h3 className="font-bold text-blue-300 mb-3 pr-6">{data.title}</h3>
          
          {data.details.topics && data.details.topics.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-2">Topics</div>
              <ul className="space-y-1">
                {data.details.topics.map((topic, idx) => (
                  <li key={idx} className="text-sm text-white/80 flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">→</span>
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.details.resources && data.details.resources.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-2">Resources</div>
              <ul className="space-y-1">
                {data.details.resources.map((resource, idx) => (
                  <li key={idx} className="text-sm text-white/80 flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>{resource}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.details.projects && data.details.projects.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-2">Projects</div>
              <ul className="space-y-1">
                {data.details.projects.map((project, idx) => (
                  <li key={idx} className="text-sm text-orange-300 flex items-start gap-2">
                    <span className="mt-0.5">🔧</span>
                    <span>{project}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function RoadmapFlowchart({ roadmap }) {
  const { data, domain, skills, level, months } = roadmap;

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes = [];
    const edges = [];
    const verticalGap = 420; // Much larger spacing to accommodate popup overlays

    // Start node
    nodes.push({
      id: "start",
      data: {
        title: `${level.charAt(0).toUpperCase() + level.slice(1)} Level`,
        subtitle: "Start Your Journey",
        isPhase: true,
        details: {},
      },
      position: { x: 0, y: 0 },
      type: "custom",
    });

    // Add phases in a vertical line with much larger spacing
    data.phases?.forEach((phase, idx) => {
      const yPos = (idx + 1) * verticalGap;
      const phaseId = `phase-${idx}`;

      nodes.push({
        id: phaseId,
        data: {
          title: `Phase ${phase.phaseNumber}`,
          subtitle: phase.name,
          isPhase: true,
          details: {
            topics: phase.topics?.slice(0, 5),
            resources: phase.resources?.slice(0, 3),
            projects: phase.projects?.slice(0, 3),
          },
        },
        position: { x: 0, y: yPos },
        type: "custom",
      });

      // Connect from previous phase or start
      const sourceId = idx === 0 ? "start" : `phase-${idx - 1}`;
      edges.push({
        id: `edge-${sourceId}-${phaseId}`,
        source: sourceId,
        target: phaseId,
        animated: true,
        style: {
          stroke: "#3b82f6",
          strokeWidth: 2.5,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#3b82f6",
        },
      });
    });

    // End node
    const endYPos = (data.phases?.length || 0) * verticalGap + verticalGap;
    nodes.push({
      id: "end",
      data: {
        title: `${domain} Expert`,
        subtitle: "Congratulations!",
        isPhase: true,
        details: {},
      },
      position: { x: 0, y: endYPos },
      type: "custom",
    });

    if (data.phases?.length > 0) {
      edges.push({
        id: `edge-phase-${data.phases.length - 1}-end`,
        source: `phase-${data.phases.length - 1}`,
        target: "end",
        animated: true,
        style: {
          stroke: "#10b981",
          strokeWidth: 2.5,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#10b981",
        },
      });
    }

    return { nodes, edges };
  }, [data, domain, level]);

  const [nodes] = useNodesState(initialNodes);
  const [edges] = useEdgesState(initialEdges);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-slate-600 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Flowchart */}
      <ReactFlow
        nodes={nodes.map(node => ({
          ...node,
          type: "custom",
          data: node.data,
        }))}
        edges={edges}
        nodeTypes={{
          custom: CustomNode,
        }}
        fitView
      >
        <Background 
          color="#475569" 
          gap={30}
          style={{ opacity: 0.15 }}
        />
        <Controls 
          style={{
            background: "rgba(15, 23, 42, 0.9)",
            border: "1px solid rgba(148, 163, 184, 0.2)",
            borderRadius: "8px",
          }}
        />
      </ReactFlow>

      {/* Info Panel */}
      <div className="absolute top-4 right-4 bg-gradient-to-br from-slate-900 to-slate-800 backdrop-blur-md p-5 rounded-xl border border-blue-400/30 shadow-2xl max-w-sm z-40">
        <h2 className="text-xl font-bold text-blue-400 mb-3">{domain}</h2>
        <div className="space-y-2 text-sm">
          <p className="text-white/80">
            <span className="text-slate-400">Level:</span>
            <span className="text-blue-300 ml-2 font-semibold capitalize">{level}</span>
          </p>
          <p className="text-white/80">
            <span className="text-slate-400">Duration:</span>
            <span className="text-green-300 ml-2 font-semibold">{months} months</span>
          </p>
          <p className="text-white/80">
            <span className="text-slate-400">Phases:</span>
            <span className="text-orange-300 ml-2 font-semibold">{data.phases?.length}</span>
          </p>
          {skills && (
            <p className="text-white/80 pt-2 border-t border-white/10">
              <span className="text-slate-400">Skills:</span>
              <div className="flex flex-wrap gap-1 mt-2">
                {skills.split(",").slice(0, 4).map((skill, idx) => (
                  <span key={idx} className="bg-blue-500/30 text-blue-200 text-xs px-2 py-1 rounded">
                    {skill.trim()}
                  </span>
                ))}
                {skills.split(",").length > 4 && (
                  <span className="text-slate-400 text-xs px-2 py-1">
                    +{skills.split(",").length - 4} more
                  </span>
                )}
              </div>
            </p>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-gradient-to-br from-slate-900 to-slate-800 backdrop-blur-md p-4 rounded-xl border border-slate-700/50 text-sm text-white/80 max-w-xs z-40">
        <p className="mb-2 font-semibold text-blue-300">💡 How to use:</p>
        <ul className="space-y-1 text-xs">
          <li>• <span className="text-blue-300">Click nodes</span> to expand details</li>
          <li>• <span className="text-blue-300">Scroll</span> to navigate the roadmap</li>
          <li>• <span className="text-blue-300">Use controls</span> to zoom & pan</li>
        </ul>
      </div>
    </div>
  );
}
