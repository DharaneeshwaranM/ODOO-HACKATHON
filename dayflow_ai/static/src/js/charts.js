/** @odoo-module **/

export class DayflowChartUtils {
    static renderAttendanceSparkline(svgElement, dataPoints) {
        if (!svgElement || !dataPoints || dataPoints.length === 0) return;
        const width = svgElement.clientWidth || 300;
        const height = svgElement.clientHeight || 100;
        const values = dataPoints.map(p => p.attendance_pct || 0);
        const min = Math.min(...values, 50);
        const max = Math.max(...values, 100);

        const points = values.map((val, idx) => {
            const x = (idx / (values.length - 1)) * (width - 20) + 10;
            const y = height - 15 - ((val - min) / (max - min || 1)) * (height - 30);
            return `${x},${y}`;
        }).join(" ");

        svgElement.innerHTML = `
            <polyline fill="none" stroke="#4f46e5" stroke-width="2.5" points="${points}" />
            <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#4f46e5" stop-opacity="0.3"/>
                <stop offset="100%" stop-color="#4f46e5" stop-opacity="0.0"/>
            </linearGradient>
        `;
    }
}
