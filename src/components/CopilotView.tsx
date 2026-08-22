import React, { useState, useRef, useEffect } from 'react';
import { Employee, Department, LeaveRequest, WorkforceAlert, CopilotMessage } from '../types';
import { DayflowEngine } from '../services/dayflowEngine';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  HelpCircle, 
  Zap, 
  RotateCcw, 
  ArrowRight,
  ShieldAlert,
  Building2,
  CalendarClock,
  Clock
} from 'lucide-react';

interface CopilotViewProps {
  employees: Employee[];
  departments: Department[];
  leaves: LeaveRequest[];
  alerts: WorkforceAlert[];
  onNavigateTab: (tab: string) => void;
}

export const CopilotView: React.FC<CopilotViewProps> = ({
  employees,
  departments,
  leaves,
  alerts,
  onNavigateTab,
}) => {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: `👋 **Welcome to Dayflow AI HR Copilot!**\n\nI am your intelligent workforce copilot connected directly to live **Odoo 17 HR records**. I can answer attendance, risk analysis, department availability, and leave simulation questions instantly.\n\nTry clicking any suggested question below or type your own question!`,
      timestamp: 'Just now',
      suggestedQuestions: [
        'How many employees are absent today?',
        'Which employees are high risk?',
        'Why is Sales workforce health low?',
        'What will happen if I approve this leave request?',
        'Show departments with availability below 75%.',
        "Give me today's HR summary.",
      ],
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isLoading) return;

    // Add user message
    const userMsg: CopilotMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    // Simulate AI processing against live Dayflow Engine
    setTimeout(() => {
      const response = DayflowEngine.processCopilotQuery(query, employees, departments, leaves, alerts);

      const botMsg: CopilotMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: response.intent,
        data: response.data,
        suggestedQuestions: response.suggestedQuestions,
      };

      setMessages(prev => [...prev, botMsg]);
      setIsLoading(false);
    }, 450);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white text-slate-900 p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 uppercase">
              Natural Language HR Intelligence
            </span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Connected to Odoo 17 Engine
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <span>AI HR Copilot Assistant</span>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Query workforce risks, simulate leave impacts, and inspect department capacity in plain English.
          </p>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer border border-slate-200"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear Chat History</span>
        </button>
      </div>

      {/* Main Chatbox Card */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col h-[650px] overflow-hidden">
        {/* Quick Suggested Prompts Bar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-orange-500" />
            <span>Suggested:</span>
          </span>
          <div className="flex items-center gap-2">
            {[
              'How many employees are absent today?',
              'Which employees are high risk?',
              'Why is Sales workforce health low?',
              'What will happen if I approve this leave request?',
              'Show departments with availability below 75%.',
              "Give me today's HR summary.",
            ].map(prompt => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                className="px-3 py-1 bg-white hover:bg-blue-50 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-xs font-medium rounded-full border border-slate-200 shrink-0 transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
          {messages.map(msg => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}

                <div
                  className={`p-4 rounded-lg text-sm leading-relaxed ${
                    isUser
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${isUser ? 'text-blue-200' : 'text-blue-600'}`}>
                      {isUser ? 'You (HR Admin)' : 'Dayflow Copilot'}
                    </span>
                    <span className={`text-[10px] ${isUser ? 'text-blue-200' : 'text-slate-400'}`}>
                      {msg.timestamp}
                    </span>
                  </div>

                  <div className="whitespace-pre-line space-y-2">
                    {msg.text}
                  </div>

                  {/* Follow-up question chips */}
                  {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Follow-up inquiries:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestedQuestions.map((sug, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(sug)}
                            className="px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium border border-blue-200 transition-colors cursor-pointer"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-md bg-slate-900 flex items-center justify-center shrink-0 text-white text-xs font-bold">
                    HR
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-xl mr-auto">
              <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center shrink-0 animate-pulse">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="p-4 rounded-lg bg-white border border-slate-200 text-xs text-slate-500 flex items-center gap-2 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                <span>Querying live Odoo HR ORM data and calculating workforce metrics...</span>
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-3">
          <input
            type="text"
            placeholder="Ask Dayflow Copilot about today's attendance, department capacity, employee risk, or leave impact..."
            value={inputPrompt}
            onChange={e => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !inputPrompt.trim()}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md font-medium text-sm transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <span>Ask</span>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
