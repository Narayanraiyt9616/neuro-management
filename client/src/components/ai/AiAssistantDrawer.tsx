import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import aiService from '../../services/aiService';
import { IAiQueryResponse } from '../../types';
import {
  Brain,
  Sparkles,
  Send,
  X,
  RefreshCw,
  TrendingUp,
  Lightbulb,
  CheckCircle2,
  Copy
} from 'lucide-react';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface IChatMessage {
  role: 'user' | 'assistant';
  content: string;
  responseObj?: IAiQueryResponse;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({ isOpen, onClose }) => {
  const { activeBusiness } = useBusiness();
  const businessId = activeBusiness?._id || '';

  const [prompt, setPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const [messages, setMessages] = useState<IChatMessage[]>([
    {
      role: 'assistant',
      content: `Hello! I am your AI Business Copilot. I analyze actual MongoDB business metrics for ${
        activeBusiness?.name || 'your enterprise'
      } to provide verified financial insights, inventory telemetry, and actionable recommendations.`
    }
  ]);

  const quickQuestions = [
    'What was my revenue this month?',
    'Which products are low in stock?',
    'What are my total expenses?',
    'Which products are selling the most?',
    'Which invoices are overdue?',
    'Give me 3 business improvement suggestions'
  ];

  const handleSend = async (questionToSend?: string) => {
    const q = (questionToSend || prompt).trim();
    if (!q || loading) return;

    // Add user message
    const userMsg: IChatMessage = { role: 'user', content: q };
    setMessages((prev) => [...prev, userMsg]);
    setPrompt('');
    setLoading(true);

    try {
      const res = await aiService.askAssistant(q, { businessId });
      if (res.success && res.data) {
        const assistantMsg: IChatMessage = {
          role: 'assistant',
          content: res.data.answer,
          responseObj: res.data
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Unable to analyze business records at this time. Please ensure data exists and try again.'
          }
        ]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error communicating with AI Assistant';
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Assistant Error: ${msg}. Please check your connection or query formulation.`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col border-l border-gray-200 dark:border-gray-800 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-sm">
              <Brain className="w-5 h-5 text-indigo-100" />
            </div>
            <div>
              <div className="font-bold text-sm flex items-center space-x-1.5">
                <span>AI Business Copilot</span>
                <span className="text-[10px] bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-1.5 py-0.5 rounded-full flex items-center">
                  <Sparkles className="w-2.5 h-2.5 mr-1" />
                  Live Grounded
                </span>
              </div>
              <div className="text-[11px] text-indigo-200/80">
                {activeBusiness?.name || 'Enterprise'} Real-Time Telemetry
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-indigo-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick query chips */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
          <div className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 mb-1.5 tracking-wider">
            Quick Prompts:
          </div>
          <div className="flex space-x-2 pb-1">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={loading}
                className="px-2.5 py-1 text-[11px] font-medium bg-white dark:bg-gray-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-950/40 whitespace-nowrap shadow-2xs transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-xs shadow-xs'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-xs border border-gray-200 dark:border-gray-700 shadow-2xs'
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed">{msg.content}</div>

                {/* Structured Data Insights if present */}
                {msg.responseObj && (
                  <div className="mt-3 pt-2.5 border-t border-gray-200 dark:border-gray-700/60 space-y-2">
                    {msg.responseObj.dataPoints && Object.keys(msg.responseObj.dataPoints).length > 0 && (
                      <div className="p-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 text-[11px]">
                        <span className="font-bold text-gray-500 uppercase text-[9px] block mb-1">
                          Database Data Points
                        </span>
                        <div className="grid grid-cols-2 gap-1 font-mono">
                          {Object.entries(msg.responseObj.dataPoints)
                            .slice(0, 6)
                            .map(([k, v]) => (
                              <div key={k} className="truncate">
                                <span className="text-gray-400">{k}:</span>{' '}
                                <span className="font-semibold text-gray-800 dark:text-gray-200">
                                  {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {msg.responseObj.suggestions && msg.responseObj.suggestions.length > 0 && (
                      <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg border border-indigo-200 dark:border-indigo-800 text-[11px] text-indigo-900 dark:text-indigo-200 space-y-1">
                        <div className="font-semibold flex items-center">
                          <Lightbulb className="w-3 h-3 mr-1 text-indigo-600 dark:text-indigo-400" />
                          Recommended Next Steps
                        </div>
                        <ul className="list-disc list-inside space-y-0.5 text-[10px]">
                          {msg.responseObj.suggestions.map((rec: string, rIdx: number) => (
                            <li key={rIdx}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
                      <span className="flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
                        Confidence: {Math.round((msg.responseObj.confidence || 0.95) * 100)}% Grounded
                      </span>
                      <button
                        onClick={() => handleCopy(msg.content, index)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex items-center cursor-pointer"
                      >
                        {copiedIndex === index ? (
                          <span className="text-emerald-500 font-semibold">Copied</span>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-2xl p-3.5 text-xs flex items-center space-x-2 border border-gray-200 dark:border-gray-700">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                <span>Aggregating MongoDB records & calculating metrics...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask anything about your business..."
              disabled={loading}
              className="flex-1 px-3.5 py-2.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!prompt.trim() || loading}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-2 text-[10px] text-gray-400 text-center flex items-center justify-center space-x-1">
            <TrendingUp className="w-2.5 h-2.5" />
            <span>Strict tenant data isolation. Never shares financial data across businesses.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiAssistantDrawer;
