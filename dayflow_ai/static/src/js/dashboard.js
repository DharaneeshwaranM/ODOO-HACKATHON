/** @odoo-module **/
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { Component, useState, onWillStart } from "@odoo/owl";

export class DayflowDashboardClientAction extends Component {
    static template = "dayflow_ai.DashboardTemplate";

    setup() {
        this.rpc = useService("rpc");
        this.action = useService("action");

        this.state = useState({
            isLoading: true,
            role: "hr",
            kpi: {
                workforce_health: 82,
                total_employees: 42,
                present_today: 31,
                on_leave_today: 6,
                absent_today: 5,
                high_risk_count: 8,
                attendance_pct: 86.1,
                availability_pct: 85.7,
            },
            departments: [],
            alerts: [],
            insights: [],
            attention_employees: [],
            selectedFilterDept: "all",
        });

        onWillStart(async () => {
            await this.loadDashboardData();
        });
    }

    async loadDashboardData() {
        this.state.isLoading = true;
        try {
            const data = await this.rpc("/dayflow/dashboard/data", {});
            if (data) {
                this.state.role = data.role || "hr";
                if (data.kpi) this.state.kpi = data.kpi;
                if (data.departments) this.state.departments = data.departments;
                if (data.alerts) this.state.alerts = data.alerts;
                if (data.insights) this.state.insights = data.insights;
                if (data.attention_employees) this.state.attention_employees = data.attention_employees;
            }
        } catch (e) {
            console.error("Dayflow Dashboard Load Error:", e);
        } finally {
            this.state.isLoading = false;
        }
    }

    openEmployeeRisk(employeeId) {
        this.action.doAction({
            type: "ir.actions.act_window",
            res_model: "hr.employee",
            res_id: employeeId,
            views: [[false, "form"]],
            target: "current",
        });
    }

    openCopilot() {
        this.action.doAction("dayflow_ai.action_dayflow_copilot");
    }

    openAlerts() {
        this.action.doAction("dayflow_ai.action_dayflow_alerts");
    }
}

registry.category("actions").add("dayflow_dashboard_tag", DayflowDashboardClientAction);
