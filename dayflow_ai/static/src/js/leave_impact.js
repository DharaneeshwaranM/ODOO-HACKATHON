/** @odoo-module **/
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { Component, useState, onWillStart } from "@odoo/owl";

export class DayflowLeaveImpactWidget extends Component {
    static template = "dayflow_ai.LeaveImpactWidget";

    setup() {
        this.orm = useService("orm");
        this.rpc = useService("rpc");
        this.state = useState({
            impact_level: this.props.record?.data?.impact_level || 'low',
            projected_pct: this.props.record?.data?.projected_availability_pct || 100.0,
            has_overlap: this.props.record?.data?.has_overlap_warning || false,
            recommendation: this.props.record?.data?.impact_recommendation || '',
        });
    }
}
