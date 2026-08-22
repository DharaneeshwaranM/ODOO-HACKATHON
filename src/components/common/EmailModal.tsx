import React, { useState, useEffect } from 'react';
import { Mail, X, Send, Inbox, CheckCircle2, Clock, Eye, Sparkles } from 'lucide-react';
import { EmailMessage } from '../../types';
import { api } from '../../api';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailModal: React.FC<EmailModalProps> = ({ isOpen, onClose }) => {
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchEmails();
    }
  }, [isOpen]);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const data = await api.getEmails();
      setEmails(data);
      if (data.length > 0 && !selectedEmail) {
        setSelectedEmail(data[0]);
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="flex h-[85vh] w-full max-w-5xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                Dayflow AI Email Dispatcher & Outbox
                <span className="rounded bg-blue-500/30 px-2 py-0.5 text-xs text-blue-200">Live Preview</span>
              </h2>
              <p className="text-xs text-slate-400">
                Automated HR & Employee transactional emails with dynamic placeholders and HTML formatting
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body: Left List, Right Render */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Email List */}
          <div className="w-80 sm:w-96 border-r border-slate-200 bg-slate-50 flex flex-col">
            <div className="border-b border-slate-200 p-3 bg-white flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Outbox & Deliveries ({emails.length})
              </span>
              <button
                onClick={fetchEmails}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Refresh
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-200">
              {emails.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  <Inbox className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                  No emails logged yet
                </div>
              ) : (
                emails.map((msg) => {
                  const isSelected = selectedEmail?.id === msg.id;
                  return (
                    <div
                      key={msg.id}
                      onClick={() => setSelectedEmail(msg)}
                      className={`p-3.5 cursor-pointer transition text-xs ${
                        isSelected ? 'bg-blue-50 border-l-4 border-blue-600' : 'hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 truncate max-w-[180px]">
                          {msg.toName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="font-medium text-slate-800 mt-1 truncate">{msg.subject}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="rounded bg-slate-200/80 px-1.5 py-0.5 text-[10px] font-medium text-slate-700">
                          {msg.templateName}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                          <CheckCircle2 className="h-3 w-3" /> {msg.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Rendered Email Preview */}
          <div className="flex-1 bg-white flex flex-col overflow-y-auto">
            {selectedEmail ? (
              <div className="p-6">
                {/* Meta details */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 mb-6 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">{selectedEmail.subject}</h3>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                      {selectedEmail.status}
                    </span>
                  </div>
                  <p className="text-slate-600">
                    <strong>From:</strong> {selectedEmail.fromName}
                  </p>
                  <p className="text-slate-600">
                    <strong>To:</strong> {selectedEmail.toName} &lt;{selectedEmail.toEmail}&gt;
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    <strong>Sent:</strong> {new Date(selectedEmail.sentAt).toLocaleString()} • Template:{' '}
                    <span className="text-slate-700 font-semibold">{selectedEmail.templateName}</span>
                  </p>
                </div>

                {/* HTML Render Container */}
                <div className="rounded-xl border border-slate-200 p-4 bg-white shadow-xs">
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedEmail.htmlContent }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center text-slate-400 text-xs">
                Select an email from the left pane to view formatted preview.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
