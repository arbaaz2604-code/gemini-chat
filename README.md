# Gemini Chat – Conversational AI Chat App

A modern, fully responsive Gemini-style conversational AI chat application built with Next.js 15, Zustand, React Hook Form, Zod, and Tailwind CSS.

## 🚀 Live Demo

> (https://gemini-chat-6xbw-arbaz-naddafs-projects.vercel.app/)

---

## ✨ Features

- **OTP-based Login/Signup** with country code selection and validation
- **Chatroom management** (create, delete, search, confirmation toasts)
- **Modern chat UI** with:
  - User and simulated AI messages
  - Timestamps, typing indicator, and throttled AI replies
  - Image upload (base64 preview)
  - Copy-to-clipboard on message hover
  - Reverse infinite scroll and client-side pagination
- **Global UX:**
  - Mobile responsive, dark mode toggle
  - Debounced chatroom search
  - LocalStorage persistence for auth & chat data
  - Loading skeletons, toast notifications
  - Keyboard accessibility throughout

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **State Management:** Zustand (with localStorage persistence)
- **Form Validation:** React Hook Form + Zod
- **Styling:** Tailwind CSS
- **Image Upload:** Local preview (base64)
- **Deployment:** Vercel/Netlify

---

## 📦 Folder Structure

```
src/
  app/           # Next.js app router files (layout, page, global styles)
  components/    # All UI and logic components
    - AuthForm.tsx      # OTP login/signup UI & logic
    - Dashboard.tsx     # Chatroom list, create/delete, search
    - Chatroom.tsx      # Chat UI, messages, image upload, infinite scroll
    - DarkModeToggle.tsx# Dark mode toggle button
    - useAuthStore.ts   # Zustand store for auth, chatrooms, messages
```

---

## 🧑‍💻 Setup & Run

1. **Install dependencies:**
   ```bash
   npm install
   # or yarn or pnpm
   ```
2. **Run the dev server:**
   ```bash
   npm run dev
   ```
3. **Open:** [http://localhost:3000](http://localhost:3000)

---

## 🧩 Implementation Details

### Throttling & Typing
- AI replies are simulated with `setTimeout` and random delay for realistic typing/thinking.
- "Gemini is typing..." indicator shown during delay.

### Pagination & Infinite Scroll
- Messages are paginated (20 per page).
- Reverse infinite scroll: scrolling to top loads older messages (simulated with dummy data).

### Form Validation
- All forms use React Hook Form + Zod for robust validation (phone, OTP, chatroom name).

### State Persistence
- Zustand store is persisted to localStorage for auth, chatrooms, and messages.

### Accessibility
- All main interactions are keyboard accessible.
- ARIA attributes and live regions for screen readers.

### Toasts & Skeletons
- Toast notifications for OTP sent, chatroom actions, message copy, etc.
- Loading skeletons for chat messages during fetch/throttle.

---

## 📱 Screenshots

> Add screenshots of login, dashboard, chatroom (desktop & mobile)

---

## 📄 License

MIT
