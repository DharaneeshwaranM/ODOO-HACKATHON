import React, { useState } from 'react';
import {
  Users,
  ChevronDown,
  ChevronRight,
  Building,
  Mail,
  Search,
  Sparkles,
  Phone,
  Shield,
} from 'lucide-react';
import { OrgNode } from '../../types';

interface OrgChartProps {
  nodes: OrgNode[];
}

const OrgTreeNode: React.FC<{
  node: OrgNode;
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
  level: number;
}> = ({ node, expandedIds, toggleExpand, level }) => {
  const isExpanded = expandedIds.has(node.id);
  const hasReports = node.directReports && node.directReports.length > 0;

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <div
        className={`relative flex w-64 flex-col rounded-2xl border bg-white p-3.5 shadow-sm transition hover:shadow-md ${
          node.role === 'hr_admin'
            ? 'border-indigo-200 ring-1 ring-indigo-500/20'
            : hasReports
            ? 'border-blue-200'
            : 'border-slate-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <img
            src={node.profilePhoto}
            alt={node.fullName}
            className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100"
          />
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-xs font-bold text-slate-900">{node.fullName}</h4>
            <p className="truncate text-[11px] text-slate-500">{node.roleTitle}</p>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[9px] font-semibold text-slate-700">
                {node.department}
              </span>
              <span className="font-mono text-[9px] text-blue-600 font-semibold">{node.employeeId}</span>
            </div>
          </div>
        </div>

        {/* Expand / Collapse Button if has reports */}
        {hasReports && (
          <button
            onClick={() => toggleExpand(node.id)}
            className="mt-2.5 flex w-full items-center justify-center gap-1 rounded-lg bg-slate-50 py-1 text-[10px] font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition"
          >
            {isExpanded ? (
              <>
                <ChevronDown className="h-3 w-3" />
                <span>Hide Direct Reports ({node.directReports.length})</span>
              </>
            ) : (
              <>
                <ChevronRight className="h-3 w-3" />
                <span>Show Direct Reports ({node.directReports.length})</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Children Tree Branch */}
      {hasReports && isExpanded && (
        <div className="relative mt-4 flex flex-col items-center">
          {/* Vertical Connecting Line */}
          <div className="h-6 w-0.5 bg-slate-300" />

          {/* Children Container */}
          <div className="relative flex flex-wrap justify-center gap-6 pt-4 border-t border-slate-300">
            {node.directReports.map((child) => (
              <OrgTreeNode
                key={child.id}
                node={child}
                expandedIds={expandedIds}
                toggleExpand={toggleExpand}
                level={level + 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const OrgChart: React.FC<OrgChartProps> = ({ nodes }) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(nodes.map((n) => n.id)) // Expand roots by default
  );
  const [searchTerm, setSearchTerm] = useState('');

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allIds = new Set<string>();
    const collect = (list: OrgNode[]) => {
      list.forEach((n) => {
        allIds.add(n.id);
        if (n.directReports) collect(n.directReports);
      });
    };
    collect(nodes);
    setExpandedIds(allIds);
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">Tree View Controls:</span>
          <button
            onClick={expandAll}
            className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 transition"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 transition"
          >
            Collapse All
          </button>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-blue-500" />
          <span>Interactive Hierarchy & Reporting Structure</span>
        </div>
      </div>

      {/* Org Tree Canvas */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50/50 to-slate-100/30 p-8 shadow-inner min-h-[400px]">
        {nodes.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400">
            No organizational hierarchy loaded.
          </div>
        ) : (
          <div className="flex justify-center gap-12 min-w-max">
            {nodes.map((rootNode) => (
              <OrgTreeNode
                key={rootNode.id}
                node={rootNode}
                expandedIds={expandedIds}
                toggleExpand={toggleExpand}
                level={0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
