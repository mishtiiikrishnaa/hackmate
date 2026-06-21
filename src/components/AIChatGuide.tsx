import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, User, MessageSquare, Loader2, HelpCircle, ArrowRight } from 'lucide-react';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
}

export default function AIChatGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: "Hey there, Skipper! 👋 I'm **HackMate AI**, your expert guide. Ask me anything about finding campus teammates, checking event compatibility, or managing your Workspace!"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    { label: "🔑 How do I access Admin Control?", text: "How do I get admin access to manage colleges and catalog hackathons?" },
    { label: "🤝 How do I find SKCET teammates?", text: "Can you guide me on how to discover and filter other student programmers on campus?" },
    { label: "🎯 What is the skill gap analysis?", text: "How does the AI Skill Gap Analysis work on the Hackathons page?" },
    { label: "🛠️ What can we do in the Workspace?", text: "Explain the team Workspace tools like documentation notes and the live Kanban Kanban task boards." }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg: Message = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: textToSend })
      });

      if (!response.ok) {
        throw new Error('Chat API returned an error status.');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { sender: 'assistant', text: data.text }]);
    } catch (err) {
      console.error('Error talking to AI Guide:', err);
      // Friendly fallback guides
      let fallbackText = "I'm having trouble connecting to the core server right now, but here's a quick tip! You can head over to the **Teammates** section to see pre-registered students, bookmark them, or send Direct Messages.";
      if (textToSend.toLowerCase().includes('admin')) {
        fallbackText = "Accessing the **Admin Control Unit** requires logging in with **haribala512c@gmail.com**. You can do this easily by clicking **Console > Login** and choosing the pre-seeded **Hari Balakrishnan [Gmail] (Main Admin)** Sandra credentials card!";
      }
      setMessages(prev => [...prev, { sender: 'assistant', text: fallbackText }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to render markdown paragraphs
  const renderMessageContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      let content = line;
      // Bold syntax helper: replaces **text** with <strong>text</strong>
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
          parts.push(content.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="font-extrabold text-[#4f46e5] dark:text-[#818cf8]">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      if (lastIndex < content.length) {
        parts.push(content.substring(lastIndex));
      }

      return (
        <p key={i} className="mb-2 leading-relaxed text-xs sm:text-sm">
          {parts.length > 0 ? parts : content}
        </p>
      );
    });
  };

  // Typewriter simulated stream text display
  const TypewriterText = ({ text }: { text: string }) => {
    const [words, setWords] = useState<string[]>([]);
    const allWords = React.useMemo(() => text.split(' '), [text]);

    useEffect(() => {
      setWords([]);
      let currentIdx = 0;
      const timer = setInterval(() => {
        if (currentIdx < allWords.length) {
          setWords((prev) => [...prev, allWords[currentIdx]]);
          currentIdx++;
        } else {
          clearInterval(timer);
        }
      }, 30); // smooth responsive typing speed selection
      return () => clearInterval(timer);
    }, [allWords]);

    return <>{renderMessageContent(words.join(' '))}</>;
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          id="btn-ai-chat-bubble"
          onClick={() => setIsOpen(true)}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-650 to-purple-600 text-white shadow-xl shadow-indigo-600/20 hover:scale-105 transition-all duration-300 focus:outline-none"
          title="Ask HackMate AI Guide"
        >
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-purple-500 flex items-center justify-center text-[8px] font-black leading-none">AI</span>
          </span>
          <Bot className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
        </button>
      )}

      {/* Chat Container View Drawer */}
      {isOpen && (
        <div 
          id="ai-guide-panel" 
          className="flex h-[520px] w-[360px] sm:w-[400px] flex-col rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden animate-in slide-in-from-bottom-5 duration-300"
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-4 text-white">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md">
                <Bot className="h-5 w-5 text-indigo-200 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-black tracking-tight">HackMate AI Guide</h4>
                <div className="flex items-center space-x-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-wide">Campus Mentor Active</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-indigo-200 hover:bg-white/10 hover:text-white transition"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-zinc-900/30">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start space-x-2.5 max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-purple-650 text-white' 
                    : 'bg-indigo-600 text-white'
                }`}>
                  {msg.sender === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                </div>

                {/* Bubble */}
                <div className={`rounded-2xl px-3.5 py-2.5 shadow-sm border ${
                  msg.sender === 'user'
                    ? 'bg-[#4f46e5] text-white border-indigo-600 rounded-tr-none'
                    : 'bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 border-gray-150 dark:border-zinc-800 rounded-tl-none'
                }`}>
                  {msg.sender === 'user' ? (
                    <p className="text-xs sm:text-sm leading-relaxed">{msg.text}</p>
                  ) : index === messages.length - 1 ? (
                    <TypewriterText text={msg.text} />
                  ) : (
                    renderMessageContent(msg.text)
                  )}
                </div>
              </div>
            ))}

            {/* AI is thinking loader */}
            {isLoading && (
              <div className="flex items-start space-x-2.5 max-w-[85%]">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm animate-pulse">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="rounded-2xl rounded-tl-none border border-gray-150 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 flex flex-col space-y-2">
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />
                    <span>HackMate AI is typing...</span>
                  </div>
                  <div className="flex space-x-1 pl-5 py-1">
                    <span className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce cursor-default"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Preset Suggested Questions list */}
          {messages.length < 3 && !isLoading && (
            <div className="border-t border-gray-100 bg-white px-4 py-2.5 dark:border-zinc-850 dark:bg-zinc-950">
              <span className="block text-[9px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center">
                <HelpCircle className="h-3 w-3 mr-1 text-indigo-505" />
                Need a quick jump?
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto">
                {suggestedPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(p.text)}
                    className="flex items-center rounded-lg border border-gray-200 bg-slate-50 px-2.5 py-1 text-[11px] text-gray-600 hover:border-indigo-600 hover:text-indigo-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-indigo-400 dark:hover:text-indigo-400 transition cursor-pointer"
                  >
                    <span>{p.label}</span>
                    <ArrowRight className="h-2.5 w-2.5 ml-1 text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form input field */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="flex items-center gap-2 border-t border-gray-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me how to form a team..."
              disabled={isLoading}
              className="flex-1 rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 dark:focus:bg-zinc-850 focus:ring-1 focus:ring-indigo-600 transition"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 transition shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
