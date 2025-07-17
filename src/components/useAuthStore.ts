import { create } from "zustand";
import { persist } from "zustand/middleware";

type Chatroom = {
  id: string;
  name: string;
};

type Message = {
  id: string;
  chatroomId: string;
  sender: "user" | "ai";
  text?: string;
  image?: string; // base64 or preview URL
  timestamp: number;
};

type AuthState = {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  chatrooms: Chatroom[];
  addChatroom: (name: string) => void;
  deleteChatroom: (id: string) => void;
  messages: Message[];
  sendMessage: (chatroomId: string, text: string, image?: string) => void;
  simulateAIReply: (chatroomId: string) => void;
  loadOlderMessages: (chatroomId: string, page: number, pageSize: number) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      login: () => set({ isAuthenticated: true }),
      logout: () => set({ isAuthenticated: false }),
      chatrooms: [],
      addChatroom: (name) =>
        set((state) => ({
          chatrooms: [
            ...state.chatrooms,
            { id: Date.now().toString(), name },
          ],
        })),
      deleteChatroom: (id) =>
        set((state) => ({
          chatrooms: state.chatrooms.filter((c) => c.id !== id),
          messages: get().messages.filter((m) => m.chatroomId !== id),
        })),
      messages: [],
      sendMessage: (chatroomId, text, image) => {
        const newMsg = {
          id: Date.now().toString() + Math.random(),
          chatroomId,
          sender: "user" as const,
          text,
          image,
          timestamp: Date.now(),
        };
        set((state) => ({ messages: [...state.messages, newMsg] }));
      },
      simulateAIReply: (chatroomId) => {
        setTimeout(() => {
          const aiMsg = {
            id: Date.now().toString() + Math.random(),
            chatroomId,
            sender: "ai" as const,
            text: "This is a simulated Gemini AI reply.",
            image: undefined,
            timestamp: Date.now(),
          };
          set((state) => ({ messages: [...state.messages, aiMsg] }));
        }, 1500 + Math.random() * 1500); // Simulate delay/throttling
      },
      loadOlderMessages: (chatroomId, page, pageSize) => {
        // Simulate loading older messages with dummy data
        const dummyMsgs = Array(pageSize)
          .fill(0)
          .map((_, i) => ({
            id: `dummy-${page}-${i}-${Math.random()}`,
            chatroomId,
            sender: (i % 2 === 0 ? "user" : "ai") as "user" | "ai",
            text: i % 2 === 0 ? `Old user message ${i + 1 + (page - 1) * pageSize}` : `Old AI message ${i + 1 + (page - 1) * pageSize}`,
            image: undefined,
            timestamp: Date.now() - (page * pageSize + i) * 60000,
          }));
        set((state) => ({ messages: [...dummyMsgs, ...state.messages] }));
      },
    }),
    {
      name: 'auth-store',
      skipHydration: true,
      storage: typeof window !== 'undefined' ? undefined : undefined,
    }
  )
); 