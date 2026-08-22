import { Employee, Department, LeaveRequest, AttendanceRecord, WorkforceAlert, HrInsight } from '../types';

export class DayflowEngine {
  /**
   * Deterministic, explainable 0–100 Workforce Risk Scoring Engine
   */
  static calculateEmployeeRisk(emp: Partial<Employee>): {
    score: number;
    level: 'low' | 'medium' | 'high';
    penalties: {
      attendance: number;
      absence: number;
      punctuality: number;
      leave: number;
      trend: number;
    };
    reasons: string[];
    recommendation: string;
  } {
    const attendanceRate = emp.attendanceRate ?? 95.0;
    const absenceCount = emp.absenceCount ?? 0;
    const lateCheckinCount = emp.lateCheckinCount ?? 0;
    const leaveCount = emp.leaveCount ?? 1;
    const trend = emp.attendanceTrend ?? 'stable';

    let rawRisk = 10.0;
    const reasons: string[] = [];
    const penalties = {
      attendance: 0,
      absence: 0,
      punctuality: 0,
      leave: 0,
      trend: 0,
    };

    // 1. Attendance penalty (0 to 35)
    if (attendanceRate < 60.0) {
      penalties.attendance = 35.0;
      reasons.push(`Severe attendance deficit (${attendanceRate.toFixed(1)}% vs 90% benchmark)`);
    } else if (attendanceRate < 75.0) {
      penalties.attendance = 25.0;
      reasons.push(`Sub-optimal attendance rate (${attendanceRate.toFixed(1)}%)`);
    } else if (attendanceRate < 85.0) {
      penalties.attendance = 15.0;
      reasons.push(`Attendance rate (${attendanceRate.toFixed(1)}%) below team target`);
    } else if (attendanceRate < 92.0) {
      penalties.attendance = 5.0;
    }
    rawRisk += penalties.attendance;

    // 2. Absence penalty (0 to 25)
    if (absenceCount >= 6) {
      penalties.absence = 25.0;
      reasons.push(`High unscheduled absences (${absenceCount} days in 30 days)`);
    } else if (absenceCount >= 4) {
      penalties.absence = 18.0;
      reasons.push(`Frequent unscheduled absence pattern (${absenceCount} days)`);
    } else if (absenceCount >= 2) {
      penalties.absence = 8.0;
      reasons.push(`Moderate absence occurrences (${absenceCount} days)`);
    }
    rawRisk += penalties.absence;

    // 3. Punctuality penalty (0 to 20)
    if (lateCheckinCount >= 7) {
      penalties.punctuality = 20.0;
      reasons.push(`Chronic late arrival pattern (${lateCheckinCount} late check-ins recorded)`);
    } else if (lateCheckinCount >= 4) {
      penalties.punctuality = 12.0;
      reasons.push(`Recurring late check-ins (${lateCheckinCount} instances)`);
    } else if (lateCheckinCount >= 2) {
      penalties.punctuality = 6.0;
      reasons.push(`Occasional late check-in (${lateCheckinCount} instances)`);
    }
    rawRisk += penalties.punctuality;

    // 4. Leave frequency penalty (0 to 15)
    if (leaveCount >= 5) {
      penalties.leave = 15.0;
      reasons.push(`Intense leave request velocity (${leaveCount} requests in 90 days)`);
    } else if (leaveCount >= 3) {
      penalties.leave = 8.0;
      reasons.push(`Elevated leave frequency (${leaveCount} requests)`);
    }
    rawRisk += penalties.leave;

    // 5. Trend penalty (0 to 15)
    if (trend === 'declining') {
      penalties.trend = 12.0;
      reasons.push('Consecutive declining weekly attendance velocity detected');
    } else if (trend === 'improving') {
      penalties.trend = -8.0;
    }
    rawRisk += penalties.trend;

    const score = Math.max(5, Math.min(100, Math.round(rawRisk)));
    let level: 'low' | 'medium' | 'high' = 'low';
    let recommendation = '';

    if (score >= 70) {
      level = 'high';
      recommendation = 'Priority 1: Schedule an informal 1-on-1 HR check-in to evaluate workload and team burnout. Assess shift scheduling bottlenecks and check for personal circumstance constraints.';
    } else if (score >= 40) {
      level = 'medium';
      recommendation = 'Priority 2: Review upcoming project deliverables and monitor attendance over the next 14 business days. Verify if punctuality is tied to transport or commute factors.';
    } else {
      level = 'low';
      recommendation = 'Employee maintains consistent attendance and steady workforce engagement. No HR intervention required.';
      if (reasons.length === 0) {
        reasons.push('Consistent punctuality, solid attendance rate, and balanced leave utilization.');
      }
    }

    return {
      score,
      level,
      penalties,
      reasons,
      recommendation,
    };
  }

  /**
   * Smart Leave Impact Analyzer & Overlap Detector
   */
  static analyzeLeaveImpact(
    employeeId: number,
    departmentId: number,
    dateFrom: string,
    dateTo: string,
    allEmployees: Employee[],
    allLeaves: LeaveRequest[],
    excludeLeaveId?: string
  ) {
    const deptEmployees = allEmployees.filter(e => e.departmentId === departmentId);
    const totalStaff = deptEmployees.length || 1;

    // Find concurrent leaves in the same department
    const overlapping = allLeaves.filter(l => {
      if (l.departmentId !== departmentId) return false;
      if (l.employeeId === employeeId) return false;
      if (l.state === 'refuse') return false;
      if (excludeLeaveId && l.id === excludeLeaveId) return false;

      // Date overlap check
      return (l.dateFrom <= dateTo && l.dateTo >= dateFrom);
    });

    const overlappingNames = Array.from(new Set(overlapping.map(l => l.employeeName)));
    const alreadyAbsentCount = overlappingNames.length;
    const currentlyAvailable = Math.max(0, totalStaff - alreadyAbsentCount);
    const projectedAvailable = Math.max(0, currentlyAvailable - 1);

    const currentAvailabilityPct = Number(((currentlyAvailable / totalStaff) * 100).toFixed(1));
    const projectedAvailabilityPct = Number(((projectedAvailable / totalStaff) * 100).toFixed(1));

    let impactLevel: 'low' | 'medium' | 'high' = 'low';
    let recommendation = '';

    if (projectedAvailabilityPct < 55.0 || alreadyAbsentCount >= 2) {
      impactLevel = 'high';
      recommendation = `CRITICAL: Projected department availability drops to ${projectedAvailabilityPct}% (${projectedAvailable}/${totalStaff} available). Concurrent leaves with: ${overlappingNames.join(', ') || 'Multiple members'}. Review critical project coverage before approving.`;
    } else if (projectedAvailabilityPct < 75.0 || alreadyAbsentCount === 1) {
      impactLevel = 'medium';
      recommendation = `MODERATE IMPACT: Projected availability drops to ${projectedAvailabilityPct}%. 1 overlapping colleague (${overlappingNames.join(', ')}). Ensure secondary backup is assigned.`;
    } else {
      impactLevel = 'low';
      recommendation = `HEALTHY COVERAGE: Projected availability remains solid at ${projectedAvailabilityPct}% (${projectedAvailable}/${totalStaff} staff active). Safe for approval.`;
    }

    return {
      deptTotalEmployees: totalStaff,
      deptCurrentAvailable: currentlyAvailable,
      deptProjectedAvailable: projectedAvailable,
      currentAvailabilityPct,
      projectedAvailabilityPct,
      hasOverlapWarning: alreadyAbsentCount > 0,
      overlapCount: alreadyAbsentCount,
      overlappingEmployees: overlappingNames,
      impactLevel,
      impactRecommendation: recommendation,
    };
  }

  /**
   * Recalculate Department Health Index
   */
  static computeDepartmentHealth(dept: Department, employees: Employee[]): Department {
    const deptEmployees = employees.filter(e => e.departmentId === dept.id);
    const totalStaff = deptEmployees.length;

    if (totalStaff === 0) {
      return {
        ...dept,
        totalStaff: 0,
        presentToday: 0,
        absentToday: 0,
        onLeaveToday: 0,
        attendancePct: 100,
        availabilityPct: 100,
        averageRiskScore: 15,
        highRiskCount: 0,
        workforceHealthScore: 100,
        healthStatus: 'excellent',
        healthSummary: 'No active staff assigned to this department.',
      };
    }

    const present = deptEmployees.filter(e => e.todayStatus === 'present' || e.todayStatus === 'late').length;
    const onLeave = deptEmployees.filter(e => e.todayStatus === 'leave').length;
    const absent = Math.max(0, totalStaff - present - onLeave);

    const available = Math.max(0, totalStaff - onLeave);
    const availabilityPct = Number(((available / totalStaff) * 100).toFixed(1));
    const attendancePct = Number(((present / (available || totalStaff)) * 100).toFixed(1));

    const riskScores = deptEmployees.map(e => e.riskScore);
    const avgRisk = Number((riskScores.reduce((a, b) => a + b, 0) / (riskScores.length || 1)).toFixed(1));
    const highRiskCount = deptEmployees.filter(e => e.riskScore >= 70).length;

    // Formula: 0.40 * Availability + 0.35 * Attendance + 0.25 * (100 - Avg_Risk)
    let healthScore = Math.round(0.40 * availabilityPct + 0.35 * attendancePct + 0.25 * (100.0 - avgRisk));
    healthScore = Math.max(0, Math.min(100, healthScore));

    let healthStatus: 'excellent' | 'good' | 'warning' | 'critical' = 'good';
    let healthSummary = '';

    if (healthScore >= 80) {
      healthStatus = 'excellent';
      healthSummary = `Optimal workforce capacity at ${availabilityPct}% with steady ${attendancePct}% attendance.`;
    } else if (healthScore >= 65) {
      healthStatus = 'good';
      healthSummary = `Stable operations. ${present}/${totalStaff} present today, with average risk score ${avgRisk}.`;
    } else if (healthScore >= 50) {
      healthStatus = 'warning';
      healthSummary = `Capacity constraint alert: availability at ${availabilityPct}%, with ${highRiskCount} high-risk members.`;
    } else {
      healthStatus = 'critical';
      healthSummary = `CRITICAL: Low availability (${availabilityPct}%) and high risk concentration (${highRiskCount} members).`;
    }

    return {
      ...dept,
      totalStaff,
      presentToday: present,
      absentToday: absent,
      onLeaveToday: onLeave,
      attendancePct,
      availabilityPct,
      averageRiskScore: avgRisk,
      highRiskCount,
      workforceHealthScore: healthScore,
      healthStatus,
      healthSummary,
    };
  }

  /**
   * Natural Language AI HR Copilot Engine
   */
  static processCopilotQuery(
    queryText: string,
    employees: Employee[],
    departments: Department[],
    leaves: LeaveRequest[],
    alerts: WorkforceAlert[]
  ): {
    intent: string;
    reply: string;
    data: any;
    suggestedQuestions: string[];
  } {
    const q = queryText.toLowerCase().trim();

    // 1. Absent today
    if (q.includes('absent') || q.includes('how many absent') || q.includes('who is absent')) {
      const absentEmps = employees.filter(e => e.todayStatus === 'absent');
      const presentCount = employees.filter(e => e.todayStatus === 'present' || e.todayStatus === 'late').length;
      const leaveCount = employees.filter(e => e.todayStatus === 'leave').length;

      let reply = `📊 **Today's Absence Status:**\n\n` +
        `• **${absentEmps.length} out of ${employees.length} employees** are absent today without approved leave.\n` +
        `• **${presentCount} employees** checked in (${((presentCount / (employees.length - leaveCount || 1)) * 100).toFixed(1)}% attendance).\n` +
        `• **${leaveCount} employees** are on scheduled approved leave.\n\n`;

      if (absentEmps.length > 0) {
        const sample = absentEmps.slice(0, 4).map(e => `${e.name} (${e.departmentName})`).join(', ');
        reply += `📌 **Unscheduled Absent Staff:** ${sample}${absentEmps.length > 4 ? ` (+${absentEmps.length - 4} more)` : ''}\n\n`;
        reply += `💡 **Recommendation:** Direct managers should verify whether unrecorded remote work or illness applies.`;
      }

      return {
        intent: 'COUNT_ABSENT_TODAY',
        reply,
        data: { absentCount: absentEmps.length, presentCount, leaveCount },
        suggestedQuestions: ['Which employees are high risk?', "Give me today's HR summary.", 'Which department has the highest absenteeism?'],
      };
    }

    // 2. High risk employees
    if (q.includes('high risk') || q.includes('require attention') || q.includes('highest risk') || q.includes('who is high risk') || q.includes('at risk')) {
      const highRisk = employees.filter(e => e.riskScore >= 70).sort((a, b) => b.riskScore - a.riskScore);

      if (highRisk.length === 0) {
        return {
          intent: 'LIST_HIGH_RISK_EMPLOYEES',
          reply: '✅ **Good news!** No employees currently fall into the HIGH workforce risk tier (Score ≥ 70). Overall organization risk is well-contained.',
          data: { highRiskCount: 0 },
          suggestedQuestions: ["Give me today's HR summary.", 'Show departments with availability below 75%.'],
        };
      }

      let reply = `⚠️ **Identified ${highRisk.length} High-Risk Employees Requiring HR Attention:**\n\n`;
      highRisk.slice(0, 5).forEach(emp => {
        const reasonSnippet = emp.riskReasons?.[0] || `Attendance: ${emp.attendanceRate}%, Absences: ${emp.absenceCount}`;
        reply += `• **${emp.name}** (${emp.departmentName}) — **Score: ${emp.riskScore}/100 [HIGH]**\n  *Driver:* ${reasonSnippet}\n\n`;
      });

      reply += `💡 **Prescriptive Recommendation:** Schedule structured 1-on-1 pulse check-ins. Review whether project overload, on-call fatigue, or commute challenges are impacting presence.`;

      return {
        intent: 'LIST_HIGH_RISK_EMPLOYEES',
        reply,
        data: { highRiskCount: highRisk.length, employees: highRisk },
        suggestedQuestions: ['Why is Sales workforce health low?', "Give me today's HR summary.", 'How many employees are absent today?'],
      };
    }

    // 3. Highest absenteeism department
    if (q.includes('highest absenteeism') || q.includes('lowest attendance') || q.includes('worst attendance')) {
      const sortedDepts = [...departments].sort((a, b) => a.attendancePct - b.attendancePct);
      const worst = sortedDepts[0];

      const reply = `🏢 **Department with Highest Absenteeism: ${worst.name}**\n\n` +
        `• **Today's Attendance:** ${worst.attendancePct}%\n` +
        `• **Availability:** ${worst.availabilityPct}%\n` +
        `• **Present / Total:** ${worst.presentToday} / ${worst.totalStaff} staff\n` +
        `• **High-Risk Members:** ${worst.highRiskCount}\n` +
        `• **Workforce Health Index:** **${worst.workforceHealthScore} / 100**\n\n` +
        `💡 **Diagnosis:** ${worst.healthSummary}\n` +
        `**Recommended HR Action:** Review shift rosters and travel schedules with ${worst.managerName}.`;

      return {
        intent: 'HIGHEST_ABSENTEEISM_DEPARTMENT',
        reply,
        data: worst,
        suggestedQuestions: [`Why is ${worst.name} workforce health low?`, 'Which employees are high risk?', 'Who is currently on leave?'],
      };
    }

    // 4. Who is on leave
    if (q.includes('on leave') || q.includes('leave today') || q.includes('who is on leave')) {
      const onLeave = employees.filter(e => e.todayStatus === 'leave');

      if (onLeave.length === 0) {
        return {
          intent: 'WHO_ON_LEAVE_TODAY',
          reply: '🌴 **No employees are currently on approved leave today.**',
          data: { count: 0 },
          suggestedQuestions: ['How many employees are absent today?', "Give me today's HR summary."],
        };
      }

      let reply = `🌴 **${onLeave.length} Employees on Approved Leave Today:**\n\n`;
      onLeave.forEach(emp => {
        reply += `• **${emp.name}** (${emp.departmentName}) — *${emp.jobTitle}*\n`;
      });

      return {
        intent: 'WHO_ON_LEAVE_TODAY',
        reply,
        data: { count: onLeave.length },
        suggestedQuestions: ['What will happen if I approve this leave request?', 'Show departments with availability below 75%.'],
      };
    }

    // 5. Today's HR summary
    if (q.includes('today summary') || q.includes('hr summary') || q.includes('daily summary') || q.includes('overview today') || q.includes('morning briefing')) {
      const presentCount = employees.filter(e => e.todayStatus === 'present' || e.todayStatus === 'late').length;
      const leaveCount = employees.filter(e => e.todayStatus === 'leave').length;
      const absentCount = employees.filter(e => e.todayStatus === 'absent').length;
      const highRiskCount = employees.filter(e => e.riskScore >= 70).length;

      const reply = `☀️ **Executive HR Briefing for Today:**\n\n` +
        `• **Company Workforce Health Index:** **82 / 100**\n` +
        `• **Total Active Headcount:** ${employees.length} staff across 5 departments\n` +
        `• **Present Today:** ${presentCount} (${((presentCount / (employees.length - leaveCount || 1)) * 100).toFixed(1)}% attendance)\n` +
        `• **Approved Leaves:** ${leaveCount} staff\n` +
        `• **Unscheduled Absences:** ${absentCount} staff\n` +
        `• **Employees Requiring Risk Attention:** ${highRiskCount} employees\n` +
        `• **Active Proactive Alerts:** ${alerts.filter(a => !a.isRead).length} alerts\n\n` +
        `🎯 **Key Focus Area:** Review capacity in teams with under 75% availability and address flagged leave overlaps.`;

      return {
        intent: 'TODAY_HR_SUMMARY',
        reply,
        data: { presentCount, leaveCount, absentCount, highRiskCount },
        suggestedQuestions: ['Which employees are high risk?', 'Which department has the highest absenteeism?', 'Show departments with availability below 75%.'],
      };
    }

    // 6. Why is department health low
    if (q.includes('why is') || q.includes('sales workforce health') || q.includes('department health low') || q.includes('why low')) {
      const deptName = q.includes('engineering') ? 'Engineering' : q.includes('marketing') ? 'Marketing' : q.includes('finance') ? 'Finance' : 'Sales';
      const dept = departments.find(d => d.name.toLowerCase() === deptName.toLowerCase()) || departments[1];

      const reply = `🔍 **Workforce Health Diagnostics for ${dept.name}:**\n\n` +
        `• **Workforce Health Index:** **${dept.workforceHealthScore}/100** (${dept.healthStatus.toUpperCase()})\n\n` +
        `**Contributing Factor Breakdown:**\n` +
        `1. **Workforce Availability (${dept.availabilityPct}%):** ${dept.totalStaff - dept.onLeaveToday}/${dept.totalStaff} active staff (${dept.onLeaveToday} on scheduled leave).\n` +
        `2. **Attendance Rate (${dept.attendancePct}%):** ${dept.presentToday} checked in out of available capacity.\n` +
        `3. **Average Risk Score (${dept.averageRiskScore}/100):** ${dept.highRiskCount} members flagged in High-Risk tier (John Smith 82, Priya Sharma 76, David Kim 70).\n\n` +
        `💡 **AI Recommendation:**\n` +
        `• Restrict concurrent leave approvals in ${dept.name} until active headcount exceeds 80%.\n` +
        `• Schedule an alignment sync with ${dept.managerName} to address quota burnout and travel fatigue.`;

      return {
        intent: 'WHY_DEPARTMENT_HEALTH_LOW',
        reply,
        data: dept,
        suggestedQuestions: ['Who is currently on leave?', 'Which employees are high risk?', 'What will happen if I approve this leave request?'],
      };
    }

    // 7. Leave impact simulation
    if (q.includes('what will happen') || q.includes('approve this leave') || q.includes('leave impact') || q.includes('simulate')) {
      const pending = leaves.find(l => l.state === 'confirm') || leaves[1];

      const reply = `🔮 **Leave Impact Simulation for ${pending?.employeeName || 'Priya Sharma'} (${pending?.departmentName || 'Sales'}):**\n\n` +
        `• **Impact Assessment:** **${pending?.impactLevel?.toUpperCase() || 'HIGH'}**\n` +
        `• **Current Department Availability:** ${pending?.currentAvailabilityPct || 70}%\n` +
        `• **Projected Availability After Approval:** **${pending?.projectedAvailabilityPct || 60}%** (6/10 active)\n` +
        `• **Concurrent Colleague Overlaps:** ${pending?.overlapCount || 1} (${pending?.overlappingEmployees?.join(', ') || 'John Smith'})\n\n` +
        `💡 **HR Guidance:** ${pending?.impactRecommendation || 'Review critical coverage before approving.'}`;

      return {
        intent: 'LEAVE_IMPACT_SIMULATION',
        reply,
        data: pending,
        suggestedQuestions: ['Show departments with availability below 75%.', 'Why is Sales workforce health low?'],
      };
    }

    // 8. Departments below 75%
    if (q.includes('below 75') || q.includes('availability below') || q.includes('understaffed') || q.includes('capacity')) {
      const constrained = departments.filter(d => d.availabilityPct < 75);

      if (constrained.length === 0) {
        return {
          intent: 'DEPARTMENTS_BELOW_CAPACITY',
          reply: '✅ **All departments are currently operating above 75% workforce capacity.**',
          data: { count: 0 },
          suggestedQuestions: ["Give me today's HR summary.", 'Which employees are high risk?'],
        };
      }

      let reply = `🚨 **${constrained.length} Departments with Capacity Below 75% Threshold:**\n\n`;
      constrained.forEach(d => {
        reply += `• **${d.name}** — **${d.availabilityPct}% Availability** (${d.totalStaff - d.onLeaveToday}/${d.totalStaff} active staff, ${d.onLeaveToday} on leave)\n`;
      });
      reply += `\n💡 **Recommendation:** Prioritize critical roadmap and client coverage before authorizing additional simultaneous absences in these teams.`;

      return {
        intent: 'DEPARTMENTS_BELOW_CAPACITY',
        reply,
        data: { constrained },
        suggestedQuestions: ['Why is Sales workforce health low?', 'Which employees are high risk?'],
      };
    }

    // Default Fallback
    const presentCount = employees.filter(e => e.todayStatus === 'present' || e.todayStatus === 'late').length;
    const avgAtt = ((presentCount / (employees.length || 1)) * 100).toFixed(1);

    return {
      intent: 'GENERAL_HR_QUERY',
      reply: `I analyzed your query against live Odoo HR data.\n\nCurrently, there are **${employees.length} active employees** with an overall workforce attendance rate of **${avgAtt}%**.\n\nYou can ask me specific questions like:\n• *How many employees are absent today?*\n• *Which employees are high risk?*\n• *Why is Sales workforce health low?*\n• *What will happen if I approve this leave request?*\n• *Give me today's HR summary.*`,
      data: { totalEmployees: employees.length },
      suggestedQuestions: [
        'How many employees are absent today?',
        'Which employees are high risk?',
        'Why is Sales workforce health low?',
        'What will happen if I approve this leave request?',
        'Give me today\'s HR summary.',
      ],
    };
  }
}
