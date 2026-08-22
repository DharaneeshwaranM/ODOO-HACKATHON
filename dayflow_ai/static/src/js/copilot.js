/** @odoo-module **/
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { Component, useState, onWillStart, useRef } from "@odoo/owl";

export class DayflowCopilotClientAction extends Component {
    static template = "dayflow_ai.CopilotTemplate";

    setup() {
        this.rpc = useService("rpc");
        this.action = useService("action");
        this.chatContainerRef = useRef("chatContainer");

        this.state = useState({
            inputPrompt: "",
            isLoading: false,
            messages: [
                {
                    id: 1,
                    sender: "bot",
                    text: "👋 Hello! I am **Dayflow AI HR Copilot**.\n\nI can analyze attendance patterns, detect leave capacity constraints, evaluate employee risk drivers, and summarize department health in real-time.\n\nHow can I support your HR operations today?",
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }
            ],
            suggestions: [
                "How many employees are absent today?",
                "Which employees are high risk?",
                "Why is Sales workforce health low?",
                "Who is currently on leave?",
                "Give me today's HR summary.",
                "Show departments with availability below 75%."
            ]
        });

        onWillStart(async () => {
            try {
                const res = await this.rpc("/dayflow/copilot/suggestions", {});
                if (res && res.suggestions) {
                    this.state.suggestions = res.suggestions;
                }
            } catch (e) {
                // Fallback graceful
            }
        });
    }

    async sendPrompt(textToSend = null) {
        const text = (textToSend || this.state.inputPrompt || "").trim();
        if (!text || this.state.isLoading) return;

        this.state.messages.push({
            id: Date.now(),
            sender: "user",
            text: text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });

        this.state.inputPrompt = "";
        this.state.isLoading = true;

        try {
            const response = await this.rpc("/dayflow/copilot/query", {
                prompt: text,
            });

            this.state.messages.push({
                id: Date.now() + 1,
                sender: "bot",
                text: response.reply || "Processed request successfully.",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            });

            if (response.suggested_questions && response.suggested_questions.length > 0) {
                this.state.suggestions = response.suggested_questions;
            }
        } catch (err) {
            this.state.messages.push({
                id: Date.now() + 1,
                sender: "bot",
                text: "⚠️ An error occurred while retrieving real-time HR data. Please try asking another question.",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            });
        } finally {
            this.state.isLoading = false;
        }
    }

    onKeyDown(event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            this.sendPrompt();
        }
    }
}

registry.category("actions").add("dayflow_copilot_tag", DayflowCopilotClientAction);
