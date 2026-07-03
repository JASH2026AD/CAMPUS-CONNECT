# CampusConnect 🎓

CampusConnect is a premium, unified digital ecosystem for university campuses combining:
1. **Skill Exchange Platform** (Match tutoring, languages, software skills)
2. **Campus Marketplace** (Sell/buy textbooks, calculators, dorm supplies)
3. **Lost & Found Portal** (Report objects, claim with verification questions)
4. **AI Review Reviewer** (Audit reviews, summarize pros/cons, score trust via Google Gemini API)

The project features verified college email gates, dynamic dark mode, real-time message history, notification centers, student reputation rating systems, and admin moderation panels.

---

## Technical Stack
- **Frontend**: React (Vite), Tailwind CSS, React Router, Axios, Lucide Icons
- **Backend**: Node.js, Express, Multer
- **Database / ORM**: MySQL, Prisma ORM
- **AI Engine**: Google Gemini API via `@google/genai`

---

## Getting Started

### 1. Database Configuration
1. Ensure your **MySQL** server is running locally or remotely.
2. In the `backend` folder, create a `.env` file (copied from `.env.example` or template) and set your connection URL:
   ```env
   DATABASE_URL="mysql://root:password@localhost:3306/campusconnect"
   JWT_SECRET="supersecretkeyforcampusconnect123!"
   GEMINI_API_KEY="your-gemini-key-here" # (Optional fallback rules active if empty)
   ```

### 2. Setup Backend Server
Open your terminal and navigate to the `backend` folder:
```bash
# Install dependencies
npm install

# Run database migrations to scaffold MySQL schemas
npx prisma migrate dev --name init

# Generate Prisma Client classes
npx prisma generate

# Seed the database with sample students (Alice, Bob, and Admin)
npx prisma db seed

# Launch the server in hot-reload development mode
npm run dev
```

The backend server will list on **`http://localhost:5000`**.

### 3. Setup Frontend Application
In a separate terminal shell, navigate to the `frontend` folder:
```bash
# Install dependencies
npm install

# Start the Vite development hot-reload server
npm run dev
```

The frontend application will open on **`http://localhost:5173`** (or next available slot).

---

## Seed Student Accounts
To test the application instantly after seeding, log in using these preset credentials:
1. **Alice Johnson** (Student user):
   - **Email**: `alice@college.edu`
   - **Password**: `password123`
2. **Bob Smith** (Student user):
   - **Email**: `bob@college.edu`
   - **Password**: `password123`
3. **CampusConnect Admin** (Administrator):
   - **Email**: `admin@college.edu`
   - **Password**: `password123`

---

## Notable Architecture Details
- **Verification Key Log**: During registration, verification codes are logged directly to the backend node console. In the browser, a convenience sandbox alert displays it immediately so you don't have to look up server outputs.
- **AI Analysis Fallback**: If `GEMINI_API_KEY` is not provided in backend `.env`, review submissions automatically fallback to a highly realistic local rule-based spam/sentiment parser so the app works flawlessly out of the box.
- **Reputation Sync**: Selling items, returning found objects (+30 trust points), and completing teaching sessions (+15 skill points) recalculates overall student trust status dynamically.
