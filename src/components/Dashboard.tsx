'use client';
import React, { useState, useEffect } from 'react';
import { useAuthStore } from './useAuthStore';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Chatroom from './Chatroom';

export default function Dashboard() {
  const chatrooms = useAuthStore((s) => s.chatrooms);
  const addChatroom = useAuthStore((s) => s.addChatroom);
  const deleteChatroom = useAuthStore((s) => s.deleteChatroom);
  const [newRoom, setNewRoom] = useState('');
  const [activeRoom, setActiveRoom] = useState<{ id: string; name: string } | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  const filteredChatrooms = debouncedSearch
    ? chatrooms.filter(room => room.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
    : chatrooms;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoom.trim()) return;
    addChatroom(newRoom.trim());
    toast.success('Chatroom created!');
    setNewRoom('');
  };

  const handleDelete = (id: string) => {
    deleteChatroom(id);
    toast.info('Chatroom deleted!');
    if (activeRoom && activeRoom.id === id) setActiveRoom(null);
  };

  if (activeRoom) {
    return <Chatroom chatroomId={activeRoom.id} chatroomName={activeRoom.name} onBack={() => setActiveRoom(null)} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-300 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <div className="w-full max-w-xl mx-auto p-0 sm:p-0 bg-transparent flex flex-col items-center">
        <div className="w-full flex flex-col items-center mb-6 relative">
          <img src="/globe.svg" alt="Gemini Logo" className="h-14 w-14 mb-2 drop-shadow-lg animate-bounce" />
          <h2 className="text-3xl font-extrabold text-center mb-1 text-blue-700 dark:text-blue-200 tracking-tight drop-shadow-lg">Gemini Chat</h2>
          <p className="text-gray-500 dark:text-gray-400 text-center text-base font-medium mb-2">Your chatrooms</p>
          {chatrooms.length > 0 && (
            <div className="w-full bg-gradient-to-r from-blue-400/20 via-blue-200/30 to-blue-400/20 dark:from-blue-900/30 dark:via-blue-800/40 dark:to-blue-900/30 rounded-xl py-3 px-6 mb-4 flex items-center gap-2 shadow animate-fade-in">
              <svg className="w-6 h-6 text-blue-500 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4V7a4 4 0 00-8 0v3m12 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2v-1" /></svg>
              <span className="text-blue-700 dark:text-blue-200 font-semibold">Welcome back! Last chatroom: <span className="font-bold">{chatrooms[chatrooms.length-1].name}</span></span>
            </div>
          )}
          {/* User avatar in top right */}
          <button className="absolute top-0 right-0 mt-2 mr-2 rounded-full bg-gradient-to-br from-blue-400 via-blue-600 to-blue-700 dark:from-blue-800 dark:via-blue-900 dark:to-blue-700 p-1 shadow-lg hover:scale-105 transition" title="Profile (coming soon)">
            <span className="block w-12 h-12 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center text-2xl font-bold text-blue-600 dark:text-blue-200 border-2 border-white dark:border-gray-900">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </span>
          </button>
        </div>
        <div className="w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-2xl shadow-2xl border-4 border-transparent bg-clip-padding border-gradient-to-br from-blue-200 via-blue-100 to-blue-300 dark:from-blue-900 dark:via-blue-800 dark:to-blue-900 px-8 py-10">
          <input
            type="text"
            className="w-full mb-6 p-3 border border-blue-200 dark:border-blue-800 rounded-xl focus:ring-2 focus:ring-blue-300 focus:outline-none bg-gray-50 dark:bg-gray-800 dark:text-white text-base shadow-sm"
            placeholder="Search chatrooms..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search chatrooms"
          />
          <form onSubmit={handleAdd} className="flex gap-2 mb-8">
            <input
              className="flex-1 p-3 border border-blue-200 dark:border-blue-800 rounded-xl focus:ring-2 focus:ring-blue-300 focus:outline-none bg-gray-50 dark:bg-gray-800 dark:text-white text-base shadow-sm"
              placeholder="New chatroom name"
              value={newRoom}
              onChange={e => setNewRoom(e.target.value)}
            />
            <button type="submit" className="flex items-center gap-2 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800 transition text-white font-bold px-6 py-3 rounded-xl shadow-lg disabled:opacity-60 text-base tracking-wide">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Create
            </button>
          </form>
          <ul className="divide-y divide-blue-50 dark:divide-gray-800 mb-4">
            {filteredChatrooms.length === 0 && <li className="text-gray-400 text-center py-6">No chatrooms found.</li>}
            {filteredChatrooms.map(room => (
              <li key={room.id} className="flex justify-between items-center py-4 px-3 bg-gradient-to-r from-blue-50/60 via-white/80 to-blue-100/60 dark:from-blue-900/40 dark:via-gray-900/80 dark:to-blue-900/40 rounded-xl transition cursor-pointer group focus-within:ring-2 focus-within:ring-blue-200 shadow-sm hover:scale-[1.025] hover:shadow-lg duration-200">
                <span className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-200 flex-1 text-lg" onClick={() => setActiveRoom({ id: room.id, name: room.name })} tabIndex={0} role="button" aria-label={`Open chatroom ${room.name}`}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setActiveRoom({ id: room.id, name: room.name }); }}>
                  <svg className="w-5 h-5 text-blue-400 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6m-6 0h6" /></svg>
                  {room.name}
                </span>
                <button
                  className="text-red-500 hover:text-red-700 hover:underline text-sm font-semibold px-3 py-1 rounded transition"
                  onClick={() => handleDelete(room.id)}
                  aria-label={`Delete chatroom ${room.name}`}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
          <ToastContainer position="top-right" autoClose={2000} aria-live="polite" />
        </div>
      </div>
    </div>
  );
} 