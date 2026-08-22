import React, { useState, useMemo } from 'react';
import { Department, Employee, RiskLevel } from '../types';
import { 
  Users, 
  User, 
  ChevronDown, 
  ChevronRight, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  UserX, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Sparkles, 
  Mail, 
  Phone, 
  Building2, 
  ExternalLink,
  Layers,
  Activity,
  ArrowRight,
  TrendingDown,
  ChevronUp,
  X,
  Flame,
  Award
} from 'lucide-react';

interface DepartmentOrgChartProps {
  department: Department;
  employees: Employee[];
  allEmployees: Employee[];
  onSelectEmployee: (emp: Employee) => void;
  onNavigateTab: (tab: string) => void;
  onGeneratePayslip?: (emp: Employee) => void;
}

interface OrgNode {
  employee: Employee;
  reports: OrgNode[];
  level: number;
}

export const DepartmentOrgChart: React.FC<DepartmentOrgChartProps> = ({
  department,
  employees,
  allEmployees,
  onSelectEmployee,
  onNavigateTab,
  onGeneratePayslip,
}) => {
  const [viewMode, setViewMode] = useState<'tree' | 'squads'>('tree');
  const [colorMode, setColorMode] = useState<'risk' | 'attendance' | 'performance'>('risk');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'high_risk' | 'present' | 'leave' | 'absent'>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [collapsedNodes, setCollapsedNodes] = useState<Record<number, boolean>>({});
  const [selectedNode, setSelectedNode] = useState<Employee | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Department employees
  const deptEmployees = useMemo(() => {
    return employees.filter(e => e.departmentName === department.name);
  }, [employees, department.name]);

  // Build the hierarchical tree structure for this department
  const orgTree = useMemo<OrgNode[]>(() => {
    if (deptEmployees.length === 0) return [];

    // Find the department manager or lead
    let manager = deptEmployees.find(e => 
      e.name.toLowerCase() === department.managerName.toLowerCase() ||
      e.jobTitle.toLowerCase().includes('manager') ||
      e.jobTitle.toLowerCase().includes('lead') ||
      e.jobTitle.toLowerCase().includes('architect') ||
      e.jobTitle.toLowerCase().includes('director') ||
      e.jobTitle.toLowerCase().includes('controller')
    );

    if (!manager) {
      manager = deptEmployees[0];
    }

    // Categorize remaining employees into Level 2 (Senior/Specialists) and Level 3 (Team Members)
    const remaining = deptEmployees.filter(e => e.id !== manager!.id);
    
    // Level 2 candidates: Senior, Lead, Specialist, Account Executive
    const seniorCandidates = remaining.filter(e => 
      e.jobTitle.toLowerCase().includes('senior') ||
      e.jobTitle.toLowerCase().includes('lead') ||
      e.jobTitle.toLowerCase().includes('executive') ||
      e.jobTitle.toLowerCase().includes('strategist') ||
      e.jobTitle.toLowerCase().includes('specialist') ||
      e.jobTitle.toLowerCase().includes('devops')
    );

    // Remaining level 3 members
    const juniorCandidates = remaining.filter(e => !seniorCandidates.includes(e));

    // If no clear seniors, split remaining evenly
    const midLevelList = seniorCandidates.length > 0 ? seniorCandidates : remaining.slice(0, Math.ceil(remaining.length / 2));
    const juniorList = seniorCandidates.length > 0 ? juniorCandidates : remaining.slice(Math.ceil(remaining.length / 2));

    // Distribute junior members among mid-level members as reports
    const midLevelNodes: OrgNode[] = midLevelList.map((senior, idx) => {
      // Assign juniors round-robin or by title relevance
      const reports = juniorList.filter((_, jIdx) => jIdx % Math.max(1, midLevelList.length) === idx);
      return {
        employee: senior,
        level: 2,
        reports: reports.map(j => ({ employee: j, reports: [], level: 3 })),
      };
    });

    // If there are no mid levels, connect all remaining directly to root
    if (midLevelNodes.length === 0) {
      return [{
        employee: manager,
        level: 1,
        reports: remaining.map(e => ({ employee: e, reports: [], level: 2 })),
      }];
    }

    return [{
      employee: manager,
      level: 1,
      reports: midLevelNodes,
    }];
  }, [deptEmployees, department.managerName]);

  // Group by Functional Squads for Matrix view
  const squads = useMemo<Record<string, Employee[]>>(() => {
    const map: Record<string, Employee[]> = {};

    deptEmployees.forEach(emp => {
      let squadName = 'Core Team';
      const title = emp.jobTitle.toLowerCase();
      if (title.includes('sales') || title.includes('account')) {
        squadName = title.includes('enterprise') ? 'Enterprise Accounts' : 'Inbound & Outbound Sales';
      } else if (title.includes('frontend') || title.includes('ui') || title.includes('react')) {
        squadName = 'Frontend & UX Squad';
      } else if (title.includes('backend') || title.includes('architect') || title.includes('api')) {
        squadName = 'Core Architecture & Platform';
      } else if (title.includes('devops') || title.includes('cloud') || title.includes('infra')) {
        squadName = 'Cloud & Infrastructure';
      } else if (title.includes('content') || title.includes('marketing') || title.includes('brand')) {
        squadName = 'Brand & Growth Marketing';
      } else if (title.includes('finance') || title.includes('tax') || title.includes('analyst')) {
        squadName = 'Financial Planning & Audit';
      } else if (title.includes('recruiting') || title.includes('people') || title.includes('hr')) {
        squadName = 'Talent & Culture Operations';
      }
      
      if (!map[squadName]) map[squadName] = [];
      map[squadName].push(emp);
    });

    return map;
  }, [deptEmployees]);

  const toggleCollapse = (empId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedNodes(prev => ({ ...prev, [empId]: !prev[empId] }));
  };

  const handleZoom = (delta: number) => {
    setZoomLevel(prev => Math.min(140, Math.max(60, prev + delta)));
  };

  const resetZoom = () => setZoomLevel(100);

  // Check if an employee matches search and status filter
  const isMatch = (emp: Employee) => {
    const matchesSearch = 
      searchTerm === '' ||
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.badgeId.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === 'high_risk') matchesStatus = emp.riskScore >= 70;
    else if (statusFilter === 'present') matchesStatus = emp.todayStatus === 'present';
    else if (statusFilter === 'leave') matchesStatus = emp.todayStatus === 'leave';
    else if (statusFilter === 'absent') matchesStatus = emp.todayStatus === 'absent';

    return matchesSearch && matchesStatus;
  };

  // Node background & styling based on colorMode
  const getNodeColorStyles = (emp: Employee) => {
    const matches = isMatch(emp);
    const isSelected = selectedNode?.id === emp.id;

    let baseRing = isSelected ? 'ring-2 ring-blue-600 shadow-lg scale-102' : 'hover:shadow-md';
    let opacity = matches ? 'opacity-100' : 'opacity-35 grayscale-60';

    if (colorMode === 'risk') {
      if (emp.riskScore >= 70) {
        return `${baseRing} ${opacity} border-red-300 bg-linear-to-b from-white to-red-50/70`;
      } else if (emp.riskScore >= 40) {
        return `${baseRing} ${opacity} border-orange-200 bg-linear-to-b from-white to-orange-50/50`;
      }
      return `${baseRing} ${opacity} border-emerald-200 bg-linear-to-b from-white to-emerald-50/40`;
    }

    if (colorMode === 'attendance') {
      if (emp.todayStatus === 'present') {
        return `${baseRing} ${opacity} border-emerald-300 bg-linear-to-b from-white to-emerald-50/60`;
      } else if (emp.todayStatus === 'late') {
        return `${baseRing} ${opacity} border-orange-300 bg-linear-to-b from-white to-orange-50/60`;
      } else if (emp.todayStatus === 'leave') {
        return `${baseRing} ${opacity} border-blue-300 bg-linear-to-b from-white to-blue-50/60`;
      }
      return `${baseRing} ${opacity} border-red-300 bg-linear-to-b from-white to-red-50/60`;
    }

    // Performance / Attendance Rate mode
    if (emp.attendanceRate >= 90) {
      return `${baseRing} ${opacity} border-blue-300 bg-linear-to-b from-white to-blue-50/60`;
    } else if (emp.attendanceRate >= 75) {
      return `${baseRing} ${opacity} border-amber-300 bg-linear-to-b from-white to-amber-50/60`;
    }
    return `${baseRing} ${opacity} border-red-300 bg-linear-to-b from-white to-red-50/60`;
  };

  // Render a Single Org Card Node
  const renderEmployeeNode = (node: OrgNode) => {
    const { employee: emp, reports, level } = node;
    const isCollapsed = collapsedNodes[emp.id];
    const hasReports = reports && reports.length > 0;
    const isSelected = selectedNode?.id === emp.id;

    return (
      <div key={emp.id} className="flex flex-col items-center relative">
        {/* Node Card */}
        <div
          onClick={() => setSelectedNode(emp)}
          className={`w-64 rounded-xl border p-3 transition-all duration-200 cursor-pointer text-left relative bg-white ${getNodeColorStyles(
            emp
          )}`}
        >
          {/* Level & Role Tag */}
          <div className="flex items-center justify-between gap-1 mb-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono ${
              level === 1 
                ? 'bg-blue-600 text-white' 
                : level === 2 
                ? 'bg-slate-800 text-slate-100' 
                : 'bg-slate-100 text-slate-600'
            }`}>
              {level === 1 ? 'Dept Head' : level === 2 ? 'Lead / Senior' : 'Specialist'}
            </span>

            {/* Attendance Status Beacon */}
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
              emp.todayStatus === 'present'
                ? 'bg-emerald-100 text-emerald-700'
                : emp.todayStatus === 'late'
                ? 'bg-orange-100 text-orange-700'
                : emp.todayStatus === 'leave'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-red-100 text-red-700'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                emp.todayStatus === 'present' ? 'bg-emerald-500 animate-pulse' :
                emp.todayStatus === 'late' ? 'bg-orange-500' :
                emp.todayStatus === 'leave' ? 'bg-blue-500' : 'bg-red-500'
              }`}></span>
              <span>{emp.todayStatus}</span>
            </span>
          </div>

          {/* Profile Header */}
          <div className="flex items-center gap-2.5">
            <div className="relative shrink-0">
              <img
                src={emp.avatar}
                alt={emp.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs"
              />
              {emp.riskScore >= 70 && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[9px] font-bold shadow-xs">
                  !
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="font-bold text-slate-900 text-xs truncate flex items-center gap-1">
                <span>{emp.name}</span>
                {level === 1 && <Award className="w-3 h-3 text-amber-500 shrink-0" />}
              </div>
              <div className="text-[11px] text-slate-500 truncate leading-tight font-medium">
                {emp.jobTitle}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                {emp.badgeId}
              </div>
            </div>
          </div>

          {/* Metric Badges */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Retention Risk</span>
              <span className={`font-bold inline-flex items-center gap-1 ${
                emp.riskScore >= 70 ? 'text-red-600' : emp.riskScore >= 40 ? 'text-orange-600' : 'text-emerald-600'
              }`}>
                {emp.riskScore >= 70 && <Flame className="w-3 h-3 text-red-500" />}
                <span>{emp.riskScore}/100</span>
                <span className="text-[9px] font-normal uppercase">({emp.riskLevel})</span>
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Attendance</span>
              <span className="font-bold text-slate-700">{emp.attendanceRate}%</span>
            </div>
          </div>

          {/* Quick Action Hint */}
          <div className="mt-2 text-[10px] text-blue-600 font-semibold flex items-center justify-between">
            <span>{isSelected ? '● Selected' : 'Click to inspect'}</span>
            {hasReports && (
              <span className="text-slate-500 font-normal">
                {reports.length} Direct {reports.length === 1 ? 'Report' : 'Reports'}
              </span>
            )}
          </div>

          {/* Expand/Collapse Button */}
          {hasReports && (
            <button
              onClick={(e) => toggleCollapse(emp.id, e)}
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10 w-6 h-6 rounded-full bg-white border border-slate-300 shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:border-blue-400 hover:text-blue-600 transition cursor-pointer"
              title={isCollapsed ? 'Expand Reports' : 'Collapse Reports'}
            >
              {isCollapsed ? (
                <span className="text-[10px] font-bold font-mono">+{reports.length}</span>
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>

        {/* Child Subtree with SVG Connectors */}
        {hasReports && !isCollapsed && (
          <div className="flex flex-col items-center w-full">
            {/* Vertical connector line from parent */}
            <div className="w-0.5 h-8 bg-slate-300"></div>

            {/* Horizontal branch bar for multiple reports */}
            <div className="relative flex justify-center gap-6 pt-0">
              {reports.length > 1 && (
                <div
                  className="absolute top-0 h-0.5 bg-slate-300"
                  style={{
                    left: `calc(${100 / (reports.length * 2)}%)`,
                    right: `calc(${100 / (reports.length * 2)}%)`,
                  }}
                ></div>
              )}

              {reports.map((childNode) => (
                <div key={childNode.employee.id} className="flex flex-col items-center relative">
                  {/* Vertical connector down to child */}
                  <div className="w-0.5 h-6 bg-slate-300"></div>
                  {renderEmployeeNode(childNode)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm p-6 overflow-y-auto flex flex-col' : ''}`}>
      
      {/* Interactive Control Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: Title & Department Metadata */}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>{department.name} Org Hierarchy</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">
              {deptEmployees.length} Staff Nodes
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
              Lead: {department.managerName}
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">
            Interactive Organizational Reporting Structure
          </h2>
        </div>

        {/* Controls & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* View Mode Toggle: Tree vs Squads */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setViewMode('tree')}
              className={`px-3 py-1 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'tree' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Reporting Tree</span>
            </button>
            <button
              onClick={() => setViewMode('squads')}
              className={`px-3 py-1 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'squads' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Functional Squads</span>
            </button>
          </div>

          {/* Color Heatmap Mode */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs">
            <span className="text-[11px] text-slate-500 font-medium px-2">Heatmap:</span>
            <button
              onClick={() => setColorMode('risk')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                colorMode === 'risk' ? 'bg-red-500 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Risk Tier
            </button>
            <button
              onClick={() => setColorMode('attendance')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                colorMode === 'attendance' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Live Status
            </button>
            <button
              onClick={() => setColorMode('performance')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                colorMode === 'performance' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Attendance %
            </button>
          </div>

          {/* Zoom Controls */}
          {viewMode === 'tree' && (
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => handleZoom(-10)}
                className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono text-[11px] text-slate-700 font-semibold">{zoomLevel}%</span>
              <button
                onClick={() => handleZoom(10)}
                className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={resetZoom}
                className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition cursor-pointer ml-1"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Org Chart Fullscreen'}
          >
            {isFullscreen ? <X className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Filter & Live Search Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={`Search ${department.name} personnel by name, role, ID...`}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 text-[11px] font-medium">Filter:</span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition ${
              statusFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({deptEmployees.length})
          </button>
          <button
            onClick={() => setStatusFilter('high_risk')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition flex items-center gap-1 ${
              statusFilter === 'high_risk' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            <ShieldAlert className="w-3 h-3" />
            <span>High Risk ({deptEmployees.filter(e => e.riskScore >= 70).length})</span>
          </button>
          <button
            onClick={() => setStatusFilter('present')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition flex items-center gap-1 ${
              statusFilter === 'present' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Present ({deptEmployees.filter(e => e.todayStatus === 'present').length})</span>
          </button>
          <button
            onClick={() => setStatusFilter('leave')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition flex items-center gap-1 ${
              statusFilter === 'leave' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>On Leave ({deptEmployees.filter(e => e.todayStatus === 'leave').length})</span>
          </button>
          <button
            onClick={() => setStatusFilter('absent')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition flex items-center gap-1 ${
              statusFilter === 'absent' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            <UserX className="w-3 h-3" />
            <span>Absent ({deptEmployees.filter(e => e.todayStatus === 'absent').length})</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* Org Canvas Container */}
        <div className={`rounded-xl border border-slate-200 bg-slate-50/70 p-6 overflow-auto min-h-[440px] flex items-start justify-center relative ${
          selectedNode ? 'lg:col-span-3' : 'lg:col-span-4'
        }`}>
          
          {/* Watermark/Grid Texture */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px] opacity-40 pointer-events-none"></div>

          {viewMode === 'tree' ? (
            // ================== HIERARCHICAL TREE VIEW ==================
            <div
              className="transition-transform duration-200 origin-top py-4 z-10"
              style={{ transform: `scale(${zoomLevel / 100})` }}
            >
              {orgTree.length === 0 ? (
                <div className="text-center text-slate-400 py-12">
                  No staff members currently assigned to {department.name}.
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  {orgTree.map(rootNode => renderEmployeeNode(rootNode))}
                </div>
              )}
            </div>
          ) : (
            // ================== SQUAD MATRIX VIEW ==================
            <div className="w-full space-y-6 z-10">
              {Object.keys(squads).map(squadName => {
                const squadMembers = squads[squadName] || [];
                const avgRisk = squadMembers.length > 0 
                  ? Math.round(squadMembers.reduce((acc, m) => acc + m.riskScore, 0) / squadMembers.length) 
                  : 0;

                return (
                  <div key={squadName} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        <h4 className="font-bold text-slate-900 text-sm">{squadName}</h4>
                        <span className="text-xs text-slate-400 font-mono">({squadMembers.length} Staff)</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        Avg Risk: {avgRisk}/100
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {squadMembers.map(emp => (
                        <div
                          key={emp.id}
                          onClick={() => setSelectedNode(emp)}
                          className={`p-3 rounded-xl border transition cursor-pointer bg-white ${getNodeColorStyles(emp)}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <img src={emp.avatar} alt={emp.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-slate-900 text-xs truncate">{emp.name}</div>
                              <div className="text-[11px] text-slate-500 truncate">{emp.jobTitle}</div>
                            </div>
                          </div>

                          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                            <span className={`font-bold ${emp.riskScore >= 70 ? 'text-red-600' : 'text-emerald-600'}`}>
                              Risk {emp.riskScore}/100
                            </span>
                            <span className="text-slate-500 font-medium">
                              {emp.attendanceRate}% Attendance
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Employee Deep-Dive Inspector Panel */}
        {selectedNode && (
          <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 animate-in slide-in-from-right-4 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Node Inspector</span>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Profile Avatar & Info */}
            <div className="text-center space-y-2">
              <img
                src={selectedNode.avatar}
                alt={selectedNode.name}
                className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-blue-500 shadow-sm"
              />
              <div>
                <h3 className="font-bold text-slate-900 text-base">{selectedNode.name}</h3>
                <p className="text-xs text-blue-600 font-medium">{selectedNode.jobTitle}</p>
                <p className="text-[11px] font-mono text-slate-400">{selectedNode.badgeId} • {selectedNode.departmentName}</p>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Risk Score</span>
                <span className={`text-base font-bold ${
                  selectedNode.riskScore >= 70 ? 'text-red-600' : selectedNode.riskScore >= 40 ? 'text-orange-600' : 'text-emerald-600'
                }`}>
                  {selectedNode.riskScore} / 100
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">30-Day Attendance</span>
                <span className="text-base font-bold text-slate-800">{selectedNode.attendanceRate}%</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Today's Status</span>
                <span className="font-bold capitalize text-slate-700">{selectedNode.todayStatus}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Absences (30D)</span>
                <span className="font-bold text-slate-700">{selectedNode.absenceCount} Days</span>
              </div>
            </div>

            {/* Contact & Hierarchy Info */}
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{selectedNode.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{selectedNode.phone || '+1 (555) 000-0000'}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Reports To: <strong>{selectedNode.managerName || department.managerName}</strong></span>
              </div>
            </div>

            {/* Risk Reasoning */}
            {selectedNode.riskReasons && selectedNode.riskReasons.length > 0 && (
              <div className="p-3 bg-red-50/60 rounded-lg border border-red-100 text-xs space-y-1">
                <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block">
                  Identified Risk Drivers:
                </span>
                <ul className="space-y-1 text-[11px] text-red-800">
                  {selectedNode.riskReasons.map((reason, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span>•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quick Actions */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <button
                onClick={() => {
                  onSelectEmployee(selectedNode);
                  onNavigateTab('risk');
                }}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Inspect Retention Analysis</span>
              </button>

              {onGeneratePayslip && (
                <button
                  onClick={() => onGeneratePayslip(selectedNode)}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  <span>View QWeb Payslip</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend / Info Footer */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-bold text-slate-700 text-[11px] uppercase">Node Legend:</span>
          
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span>Low Risk (&lt;40)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
            <span>Medium Risk (40-69)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span>High Retention Risk (70+)</span>
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-400">
          Showing hierarchical structure for {department.name} Department ({deptEmployees.length} Nodes)
        </div>
      </div>
    </div>
  );
};
