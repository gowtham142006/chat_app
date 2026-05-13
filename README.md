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
chat-app/
│
├── app/
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
├── lib/
│   ├── firebase-admin.ts
│   ├── firebase.js
│   └── supabase.js
│
├── public/
│   ├── chat-icon-192.png
│   ├── chat-icon-512.png
│   ├── firebase-messaging-sw.js
│   ├── manifest.json
│   ├── sw.js
│   ├── workbox-e43f5367.js
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── .env.local
├── .gitignore
├── AGENTS.md
├── CLAUDE.md
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package.json
├── package-lock.json
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