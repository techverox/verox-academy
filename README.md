# Verox Academy - Premium SaaS LMS Platform

Verox Academy is a production-ready, high-performance Learning Management System (LMS) built with the modern web stack. It features a cinematic learning experience, real-time progress tracking, and a scalable architecture designed for growth.

## 🚀 Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Database & Auth**: [Firebase 12 (Modular SDK)](https://firebase.google.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Deployment**: Optimized for Vercel/Firebase Hosting

## ✨ Key Features

- **Cinematic Learning Area**: Netflix-inspired video player with immersive dark mode.
- **Real-time Progress Tracking**: Automatically track and display lesson completion.
- **Premium Course Catalog**: Responsive grid with premium SaaS-style course cards.
- **Secure Authentication**: Google Auth integrated with Firestore profile syncing.
- **Scalable Architecture**: Route groups, modular hooks, and centralized Firestore helpers.

## 📁 Project Structure

```text
/app
  /(auth)      - Login and authentication pages
  /(student)   - Protected dashboard and learning area
  /(public)    - Landing page, courses listing, and details
/components    - Reusable UI components (Navbar, CourseCard, Skeletons)
/lib           - Firebase configuration and Firestore helpers
/hooks         - Custom React hooks (useAuth)
/types         - Centralized TypeScript interfaces
/scripts       - Database seeding and utility scripts
```

## 🛠️ Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/verox-academy.git
cd verox-academy
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory and add your Firebase credentials:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Seed the Database
Populate your Firestore with dummy courses and lessons:
```bash
npm run seed
npm run seed:lessons
```

### 5. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the result.

## 📜 Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Creates an optimized production build.
- `npm run lint`: Runs ESLint to check for code quality issues.
- `npm run seed`: Seeds the initial courses.
- `npm run seed:lessons`: Seeds lessons for all courses.

## 🛡️ Security
Firestore rules are included in `firestore.rules`. Ensure you update them before moving to production.

---
Built with ❤️ by **Verox Academy Team**
