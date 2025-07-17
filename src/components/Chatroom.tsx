'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useAuthStore } from './useAuthStore';
import { toast } from 'react-toastify';

const PAGE_SIZE = 20;

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function Chatroom({ chatroomId, chatroomName, onBack }: { chatroomId: string; chatroomName: string; onBack: () => void }) {
  const allMessages = useAuthStore(s => s.messages);
  const messages = allMessages.filter(m => m.chatroomId === chatroomId);
  const sendMessage = useAuthStore(s => s.sendMessage);
  const simulateAIReply = useAuthStore(s => s.simulateAIReply);
  const loadOlderMessages = useAuthStore(s => s.loadOlderMessages);
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | undefined>();
  const [isTyping, setIsTyping] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const chatRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const prevMsgCount = useRef(messages.length);
  const lastMsgId = useRef<string | null>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  // Pagination: show only the latest PAGE_SIZE * page messages
  const pagedMessages = messages.slice(-PAGE_SIZE * page);

  // Maintain scroll position when loading older messages
  useEffect(() => {
    if (!loadingMessages && chatRef.current && page > 1) {
      // After loading, scroll to the first new message
      const firstNewMsg = chatRef.current.children[loadingMessages ? 0 : PAGE_SIZE];
      if (firstNewMsg && firstNewMsg instanceof HTMLElement) {
        firstNewMsg.scrollIntoView({ block: 'start' });
      }
    }
  }, [loadingMessages]);

  // Auto-scroll to bottom on new message (only if not loading older)
  useEffect(() => {
    if (
      chatRef.current &&
      !loadingMessages &&
      messages.length > prevMsgCount.current // Only scroll if new message added
    ) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
    prevMsgCount.current = messages.length;
  }, [messages.length, loadingMessages]);

  // Simulate AI typing and reply (only on new user message)
  useEffect(() => {
    if (
      messages.length &&
      messages[messages.length - 1].sender === 'user' &&
      messages[messages.length - 1].id !== lastMsgId.current
    ) {
      setIsTyping(true);
      simulateAIReply(chatroomId);
      lastMsgId.current = messages[messages.length - 1].id;
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => setIsTyping(false), 1800);
      return () => {
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
      };
    }
    // Hide typing indicator as soon as AI message is received
    if (
      messages.length &&
      messages[messages.length - 1].sender === 'ai' &&
      isTyping
    ) {
      setIsTyping(false);
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    }
  }, [messages, chatroomId, simulateAIReply]);

  // Load older messages (reverse infinite scroll)
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop === 0 && hasMore && !loadingMessages) {
      setLoadingMessages(true);
      setTimeout(() => setLoadingMessages(false), 800); // Simulate loading time
      loadOlderMessages(chatroomId, page + 1, PAGE_SIZE);
      setPage(p => p + 1);
      // Simulate end after 5 pages
      if (page + 1 >= 5) setHasMore(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !image) return;
    sendMessage(chatroomId, input.trim(), image);
    setInput('');
    setImage(undefined);
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    toast.info('Copied to clipboard!');
    setTimeout(() => setCopiedMsgId(null), 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-300 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <div className="w-full max-w-2xl mx-auto p-0 sm:p-0 bg-transparent flex flex-col items-center">
        <div className="w-full flex flex-col items-center mb-6">
          <img src="/globe.svg" alt="Gemini Logo" className="h-12 w-12 mb-2 drop-shadow-lg" />
          <h2 className="text-2xl font-extrabold text-center mb-1 text-blue-700 dark:text-blue-200 tracking-tight drop-shadow-lg">{chatroomName}</h2>
        </div>
        <div className="w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-2xl shadow-2xl border border-blue-100 dark:border-gray-800 px-4 sm:px-8 py-6 flex flex-col min-h-[70vh] max-h-[80vh]">
          <div className="flex items-center justify-between mb-4 border-b pb-4">
            <button onClick={onBack} className="text-blue-600 dark:text-blue-300 font-semibold hover:underline">← Back</button>
            <div />
          </div>
          <div
            ref={chatRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-2 sm:px-6 py-4 space-y-2 flex flex-col-reverse bg-transparent"
            style={{ direction: 'rtl' }}
          >
            {/* Loading skeletons at the top when loading older messages */}
            {loadingMessages && (
              <div aria-live="polite" className="flex flex-col gap-2 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex justify-start items-end" style={{ direction: 'ltr' }}>
                    <div className="max-w-xs p-3 rounded-2xl shadow bg-gray-200 dark:bg-gray-700 animate-pulse h-12 w-40 mb-2" />
                  </div>
                ))}
              </div>
            )}
            {isTyping && (
              <div className="flex items-center gap-2 text-gray-500 text-sm" style={{ direction: 'ltr' }} aria-live="polite">
                <span className="animate-pulse">Gemini is typing...</span>
              </div>
            )}
            {pagedMessages.slice().reverse().map(msg => (
              <div
                key={msg.id}
                className={`group flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} items-end`}
                style={{ direction: 'ltr' }}
              >
                <div className={`max-w-xs p-4 rounded-2xl shadow-lg ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-none'} relative transition-all`}>
                  {msg.image && (
                    <img src={msg.image} alt="uploaded" className="mb-2 rounded-xl max-h-40 object-contain border border-gray-200 dark:border-gray-700" />
                  )}
                  {msg.text && (
                    <span>{msg.text}</span>
                  )}
                  <span className="block text-xs text-gray-300 mt-1 text-right">{formatTime(msg.timestamp)}</span>
                  {msg.text && (
                    <>
                      <button
                        className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition text-xs text-white bg-black/30 px-2 py-1 rounded"
                        onClick={() => handleCopy(msg.text!, msg.id)}
                        title="Copy"
                        tabIndex={0}
                        aria-label="Copy message text"
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleCopy(msg.text!, msg.id); }}
                      >
                        {copiedMsgId === msg.id ? 'Copied' : 'Copy'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSend} className="flex items-center gap-2 px-2 sm:px-6 py-4 border-t bg-gray-50 dark:bg-gray-800 rounded-b-2xl mt-4">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition" aria-label="Upload image">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600 dark:text-blue-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5v-9m4.5 4.5h-9" />
              </svg>
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleImage}
            />
            {image && (
              <img src={image} alt="preview" className="h-10 w-10 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
            )}
            <input
              className="flex-1 p-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-200 focus:outline-none bg-white dark:bg-gray-900 text-base"
              placeholder="Type your message..."
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 transition text-white font-bold px-6 py-3 rounded-xl shadow-lg disabled:opacity-60 text-base tracking-wide" disabled={!input.trim() && !image}>
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 