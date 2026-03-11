import React, { useState, useRef, useEffect } from 'react';
import { Send, Globe, MessageSquare, Loader2, ArrowRight, Bot, User, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { chatWithUrl, Message } from './services/gemini';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [url, setUrl] = useState('');
  const [isSetup, setIsSetup] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      setIsSetup(true);
      setMessages([
        {
          role: 'model',
          content: `Hello! I've indexed **${url}**. How can I help you today with questions about the company or its products?`
        }
      ]);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const response = await chatWithUrl(url, messages, input);
    
    setMessages(prev => [...prev, { role: 'model', content: response }]);
    setIsLoading(false);
  };

  const resetSetup = () => {
    setIsSetup(false);
    setMessages([]);
    setUrl('');
  };

  if (!isSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#f5f5f5]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-zinc-200 p-8"
          id="setup-card"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-zinc-900 rounded-2xl">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">SupportRAG</h1>
              <p className="text-sm text-zinc-500">AI-Powered Customer Support</p>
            </div>
          </div>

          <form onSubmit={handleSetup} className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-zinc-700 mb-1.5">
                Knowledge Base URL
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  id="url"
                  type="url"
                  required
                  placeholder="https://example.com"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all text-sm"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                The agent will use this URL as its primary source of information.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-zinc-900 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors group"
              id="start-btn"
            >
              Initialize Agent
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-900 rounded-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Support Agent</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium truncate max-w-[200px]">
                Active: {new URL(url).hostname}
              </span>
            </div>
          </div>
        </div>
        <button 
          onClick={resetSetup}
          className="p-2 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-500"
          title="Reset Agent"
        >
          <RefreshCcw className="w-4 h-4" />
        </button>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-4xl mx-auto w-full">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-4",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                msg.role === 'user' ? "bg-zinc-200" : "bg-zinc-900"
              )}>
                {msg.role === 'user' ? (
                  <User className="w-4 h-4 text-zinc-600" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <div className={cn(
                "max-w-[80%] p-4 rounded-2xl shadow-sm border",
                msg.role === 'user' 
                  ? "bg-white border-zinc-200 rounded-tr-none" 
                  : "bg-white border-zinc-200 rounded-tl-none"
              )}>
                <div className="markdown-body">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4"
          >
            <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-zinc-200 p-4 rounded-2xl rounded-tl-none shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="p-4 md:p-6 bg-white border-t border-zinc-200">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSend} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about the company..."
              className="w-full pl-4 pr-12 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all text-sm"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-zinc-900 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[10px] text-center text-zinc-400 mt-3 uppercase tracking-widest font-medium">
            Powered by Gemini 3 Flash & URL Context
          </p>
        </div>
      </footer>
    </div>
  );
}
