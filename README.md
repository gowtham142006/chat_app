# 💬 Realtime Chat App

A modern realtime chat application built with **Next.js**, **Supabase**, **Firebase Cloud Messaging (FCM)**, and **Tailwind CSS**.

Supports:
- Realtime messaging
- Push notifications
- Avatar uploads
- Seen status
- Mobile responsive UI
- Persistent authentication

---

# 🌐 Live Demo

## 🚀 Deployment Link

https://chat-app-six-phi-32.vercel.app

---

# 🚀 Features

## 🔐 Authentication
- User Sign Up & Login
- Persistent Sessions
- Manual Logout
- Secure Supabase Authentication

---

## 💬 Realtime Chat
- Instant realtime messaging
- Seen message status
- Live database sync
- Responsive chat interface
- Message deletion functionality

---

## ✅ Seen Status System
- Single tick for sent messages
- Double tick for seen messages
- Realtime seen updates
- Automatic read tracking

---

## 👤 Profile System
- Avatar upload
- Dynamic profile images
- Realtime profile updates

---

## 🔔 Push Notifications
- Firebase Cloud Messaging (FCM)
- Browser notifications
- Background notifications
- Realtime message alerts

---

## 🔐 Security Feature

- AES encrypted messaging using CryptoJS
- Messages are encrypted before storing in the database
- Secure user authentication with Supabase Auth    
- Only authorized users can read decrypted messages

---

# 🛠️ Tech Stack

## Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

## Backend
- Supabase
- PostgreSQL
- Supabase Realtime

## Notifications
- Firebase Cloud Messaging

## Deployment
- Vercel

---

# 📂 Project Structure

```bash
CHAT-APP/
│
├── .next/
│   ├── dev/
│   ├── types/
│   ├── _events_16064.json
│   └── _events_17452.json
│
├── app/
│   │
│   ├── api/
│   │   └── send-notification/
│   │       └── route.ts
│   │
│   ├── auth/
│   │   └── page.tsx
│   │
│   ├── chat/
│   │   └── page.tsx
│   │
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── AvatarUploader.tsx
│   ├── ChatHeader.tsx
│   ├── MessageBubble.tsx
│   ├── MessageInput.tsx
│   ├── Sidebar.tsx
│   └── UserCard.tsx
│
├── hooks/
│   ├── index.ts
│   ├── useAuth.ts
│   ├── useAutoScroll.ts
│   ├── useMessages.ts
│   ├── useNotification.ts
│   ├── useProfileSync.ts
│   ├── useResponsive.ts
│   └── useUsers.ts
│
├── lib/
│   ├── crypto.ts
│   ├── firebase-admin.ts
│   ├── firebase.js
│   └── supabase.js
│
├── node_modules/
│
├── public/
│   ├── chat-icon-192.png
│   ├── chat-icon-512.png
│   ├── file.svg
│   ├── firebase-messaging-sw.js
│   ├── globe.svg
│   ├── manifest.json
│   ├── next.svg
│   ├── sw.js
│   ├── vercel.svg
│   ├── window.svg
│   └── workbox-e43f5367.js
│
├── .env.local
├── .gitignore
├── AGENTS.md
├── CLAUDE.md
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
└── tsconfig.json
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

---

## Install Dependencies

```bash
npm install
```

---

## Start Development Server

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

---

# 🔥 Supabase Setup

Create tables:

## profiles

| Column | Type |
|---|---|
| id | uuid |
| username | text |
| avatar_url | text |
| fcm_token | text |

---

## messages

| Column | Type |
|---|---|
| id | bigint |
| sender | uuid |
| receiver | uuid |
| content | text |
| seen | boolean |
| created_at | timestamp |

---

# 🔔 Firebase Setup

- Enable Firebase Cloud Messaging
- Generate Web Push Certificate
- Add VAPID Key
- Configure service worker

---

# 🚀 Deployment

Recommended deployment:

- Vercel

---

# 🔮 Future Improvements

- Group Chat
- Typing Indicator
- Voice Messages
- Image Messaging
- Online Status
- Message Reactions

---

# 👨‍💻 Author

## Gowtham A

Computer Science & Engineering Student

Passionate about:
- Full-stack development
- Realtime systems
- Scalable applications

---

# 📄 License

MIT License