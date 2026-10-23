import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  Database,
  AlertCircle,
  HelpCircle,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../api/client';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProjectId?: string;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  sources?: string[];
  groundingPoints?: number;
  timestamp: string;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  selectedProjectId
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-msg',
      sender: 'assistant',
      text: 'Hello! I am the PULSE AI Project Assistant. I query only verified database records (deliverables, deadlines, assigned engineers, and rule-based risks) to answer your delivery questions without hallucination.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [prompt, setPrompt] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isQuerying) return;

    const userMsg: Message = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: prompt.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setPrompt('');
    setIsQuerying(true);

    try {
      const result = await api.queryAI({
        prompt: userMsg.text,
        project_id: selectedProjectId || undefined
      });

      const assistantMsg: Message = {
        id: 'ai-' + Date.now(),
        sender: 'assistant',
        text: result.response,
        sources: result.sources_used,
        groundingPoints: result.grounding_data_points,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: 'err-' + Date.now(),
        sender: 'assistant',
        text: `Error contacting query service: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsQuerying(false);
    }
  };

  const handleQuickQuestion = (q: string) => {
    setPrompt(q);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col z-10">
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 leading-tight">
                  PULSE AI Assistant
                </h3>
                <p className="text-[10px] text-slate-500 font-mono">
                  Grounded strictly in verified project records
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close assistant"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono shrink-0">
              Suggestions:
            </span>
            <button
              type="button"
              onClick={() => handleQuickQuestion('Which tasks are currently overdue and who owns them?')}
              className="text-[11px] text-slate-700 hover:text-blue-700 bg-white border border-slate-200 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 shadow-2xs hover:bg-slate-50 transition-colors"
            >
              Overdue tasks?
            </button>
            <button
              type="button"
              onClick={() => handleQuickQuestion('Summarize the top risks across all active projects.')}
              className="text-[11px] text-slate-700 hover:text-blue-700 bg-white border border-slate-200 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 shadow-2xs hover:bg-slate-50 transition-colors"
            >
              Top project risks?
            </button>
            <button
              type="button"
              onClick={() => handleQuickQuestion('How is the workload balanced across engineers?')}
              className="text-[11px] text-slate-700 hover:text-blue-700 bg-white border border-slate-200 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 shadow-2xs hover:bg-slate-50 transition-colors"
            >
              Team capacity?
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/30">
            {messages.map(m => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3 rounded-xl max-w-[88%] text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-2xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>

                  {m.groundingPoints !== undefined && m.groundingPoints > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400 space-y-0.5">
                      <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Grounded in {m.groundingPoints} verified database records</span>
                      </div>
                      {m.sources && m.sources.length > 0 && (
                        <div className="text-slate-500">
                          Sources: {m.sources.join(' · ')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1 font-mono">
                  {m.timestamp}
                </span>
              </div>
            ))}

            {isQuerying && (
              <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-500 w-fit">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                <span>Auditing database records...</span>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Ask about deliverables, risks, workloads..."
              disabled={isQuerying}
              className="flex-1 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!prompt.trim() || isQuerying}
              className="p-2 text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 rounded-lg transition-colors shrink-0"
              aria-label="Send prompt"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
