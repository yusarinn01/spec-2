# AgriJuan Tasks

React + Firebase (Auth and Realtime Database) task calendar for AgriJuan.

## Setup
1. Create a Firebase project and add a **Web app**.
2. Enable **Authentication > Sign-in method > Email/Password**.
3. Create a **Realtime Database**, then paste `database.rules.json` into the Rules tab and publish.
4. `cp .env.example .env` and fill in your Firebase config values. `VITE_FIREBASE_DATABASE_URL` is shown at the top of the Realtime Database page (needed if your database is not in us-central1).
5. `npm install`
6. `npm run dev`

## Scripts
- `npm run dev` start the dev server
- `npm run build` production build
- `npm test` run the unit and component tests (Vitest)

## Folder structure
```
src/
  assets/       logo.svg
  firebase/     config.js (reads the VITE_FIREBASE_* values from .env)
  styles/       main.css
  utils/        dates.js, tasks.js (status rules), authErrors.js
  hooks/        useTasks.js (Realtime Database CRUD), useToday.js
  components/   TaskList, TaskModal, Sidebar, BottomNav
  pages/        AuthScreen, CalendarPage, TasksPage, ProfilePage
  App.jsx       auth state, layout, routing between pages
  main.jsx
```

## Data model
```
profiles/{uid}              fullName, location, farmSize, mainCrop, email, createdAt
tasks/{uid}/{taskId}        title, type, dueDate (YYYY-MM-DD), notes, done, completedAt, createdAt
```
Task status is calculated, not stored:
- done: `done === true`
- overdue: not done and `dueDate` is before today
- pending: not done and `dueDate` is today or later

## Deploy to Firebase Hosting
```
npm install -g firebase-tools
firebase login
npm run deploy
```
