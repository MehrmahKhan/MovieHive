# MovieHive - Deliverable 2: Login & Signup Pages
**Complete Frontend + Backend + Database**

---

## 📋 Project Overview
This deliverable presents a **fully functional login/signup system** for the MovieHive application with:
- React.js frontend with form validation
- Node.js/Express backend API
- SQL Server database with complete schema
- Secure password hashing (bcrypt)
- Professional UI with Tailwind CSS

---

## ✅ Deliverable Checklist

### Frontend (React Components)
- ✅ **Login Component** (`client/src/components/Login.js`)
  - Email & password input fields
  - Front-end validation (required fields, email format)
  - Error messaging
  - Loading state
  - Split-screen professional design

- ✅ **Signup Component** (`client/src/components/Signup.js`)
  - Username, email, password fields
  - Form validation (required, email format)
  - Duplicate email prevention feedback
  - Success/error messaging
  - Loading indicator

- ✅ **Dashboard Component** (`client/src/components/Dashboard.js`)
  - Displays after successful login
  - Shows user profile information
  - Movie catalogue display (frontend placeholder)

### Backend (Node.js + Express)
- ✅ **Database Connection** (`backend/config/db.js`)
  - SQL Server configuration
  - Connection pooling with mssql package
  - Error handling

- ✅ **Authentication Controller** (`backend/controllers/authController.js`)
  - `POST /api/auth/login` - User login endpoint
    - Email & password validation
    - Database query for user
    - Password comparison using bcrypt
    - Returns user object on success
  - `POST /api/auth/signup` - User registration endpoint
    - Input validation (username, email, password)
    - Duplicate email check
    - Password hashing (bcrypt, 10 rounds)
    - Database insertion
    - Error handling

- ✅ **Express Server** (`backend/server.js`)
  - CORS enabled
  - JSON body parser
  - Routes setup
  - Database connection initialization
  - Health check endpoint

### Database (SQL Server / T-SQL)
- ✅ **Schema File** (`database/database.sql`) - Contains:
  - ✅ All 8 tables with proper structure:
    - Users (with email UNIQUE constraint, role check)
    - Movies
    - Genres
    - Movie_Genres (bridging table)
    - Persons
    - Movie_Cast (bridging table)
    - Reviews (with user-movie uniqueness)
    - Watchlist
    - Collections
    - Collection_Movies

  - ✅ Constraints:
    - Primary keys on all tables
    - Foreign keys with CASCADE delete
    - UNIQUE constraints (email, genre_name, user-movie combo)
    - CHECK constraints (role values, release_year, duration, rating)

  - ✅ Relationships:
    - One-to-Many: Users → Reviews, Watchlist, Collections
    - Many-to-Many: Movies ↔ Genres, Movies ↔ Persons
    - Referential integrity on all joins

  - ✅ Indexes for optimization:
    - Email lookup (login/signup performance)
    - Movie title search
    - Genre name search

  - ✅ Sample data (5 movies, 7 cast members, test users)

### Security & Validation
- ✅ Backend validation (required fields, email format)
- ✅ Duplicate email prevention at DB & backend level
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ Email UNIQUE constraint in database
- ✅ Role-based field validation (user/admin)

### User Flow
- ✅ Login → Validate credentials → Display Dashboard
- ✅ Signup → Register user → Redirect to Dashboard
- ✅ Error messages: "Invalid credentials", "Email already exists", "All fields required"
- ✅ Loading states on button during API calls

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v14+)
- SQL Server (Express or higher)
- npm or yarn

### 1. Database Setup

**Step 1:** Run SQL Server Management Studio (SSMS) or SQL Server Command Line Tools

**Step 2:** Execute the schema file:
```sql
-- Open database/database.sql and run the entire script
-- This will create MovieDB database with all tables, constraints, and sample data
```

**Step 3:** Verify the database was created:
```sql
USE MovieDB;
SELECT * FROM Users;  -- Should show sample users
SELECT * FROM Movies;  -- Should show sample movies
```

### 2. Backend Setup

**Step 1:** Navigate to backend folder:
```bash
cd MovieHive/backend
```

**Step 2:** Install dependencies:
```bash
npm install
```

**Step 3:** Configure `.env` file (update if needed):
```
DB_SERVER=DESKTOP-47U1Q2E\SQLEXPRESS
DB_NAME=MovieDB
DB_USER=sa
DB_PASSWORD=your_password
PORT=3001
```

**Step 4:** Start the backend server:
```bash
npm start
```

Expected output:
```
✅ Connected to MovieDB
MovieHive backend is running. Use /api/health for status.
Server running on port 3001
```

### 3. Frontend Setup

**Step 1:** Navigate to client folder:
```bash
cd MovieHive/client
```

**Step 2:** Install dependencies:
```bash
npm install
```

**Step 3:** Start the frontend:
```bash
npm start
```

The app will open at `http://localhost:3000`

### 4. Run Both Simultaneously (Optional)

From root `MovieHive` folder:
```bash
npm run dev
```

This uses `concurrently` to run both backend and frontend.

---

## 🧪 Testing the Application

### Test Login
**Credentials (from sample data):**
- Email: `john@moviehive.com`
- Password: `password123` (note: sample data uses hashed passwords for real security)

**OR** Signup with new account:
- Username: `TestUser`
- Email: `test@example.com`
- Password: `TestPassword123`

### API Endpoints

**Login:**
```bash
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "john@moviehive.com",
  "password": "password123"
}
```

**Signup:**
```bash
POST http://localhost:3001/api/auth/signup
Content-Type: application/json

{
  "username": "NewUser",
  "email": "newuser@example.com",
  "password": "SecurePassword123"
}
```

**Health Check:**
```bash
GET http://localhost:3001/api/health
```

---

## 📁 Project Structure

```
MovieHive/
├── backend/
│   ├── config/
│   │   └── db.js                 # SQL Server connection
│   ├── controllers/
│   │   └── authController.js     # Login/Signup business logic
│   ├── server.js                 # Express server setup
│   ├── .env                       # Database credentials
│   └── package.json
│
├── client/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js          # Login form component
│   │   │   ├── Signup.js         # Signup form component
│   │   │   ├── Dashboard.js      # Post-login dashboard
│   │   │   ├── Login.css
│   │   │   ├── Signup.css
│   │   │   └── Dashboard.css
│   │   ├── App.js                # Main app component
│   │   ├── index.js              # React entry point
│   │   └── index.css
│   └── package.json
│
├── database/
│   └── database.sql              # Complete schema (T-SQL)
│
├── package.json                  # Root package.json
└── DELIVERABLE2_README.md        # This file
```

---

## 🔐 Security Features Implemented

1. **Password Hashing**
   - bcrypt with 10 salt rounds
   - Never store plain-text passwords

2. **Email Validation**
   - UNIQUE constraint in database
   - Duplicate email prevention at backend
   - Proper HTTP status codes (409 Conflict)

3. **Input Validation**
   - Required field checks
   - Email format validation
   - Password strength recommendations

4. **Database Security**
   - Parameterized queries (SQL injection prevention)
   - Foreign key constraints
   - Role-based access (user/admin)

5. **Error Handling**
   - Generic error messages to users (no SQL exposure)
   - Proper logging on backend

---

## ⚠️ Important Notes

1. **Sample Data in Database**
   - Sample users have placeholder password hashes
   - In production, sign up new users instead

2. **Environment Variables**
   - Never commit `.env` with real credentials
   - Update DB_SERVER, DB_USER, DB_PASSWORD before running

3. **SQL Server Instance**
   - Ensure SQL Server is running before starting backend
   - Default local instance: `DESKTOP-HOSTNAME\SQLEXPRESS`

4. **Port Configuration**
   - Backend runs on port **3001**
   - Frontend runs on port **3000**
   - Ensure ports are not in use

---

## 📝 Database Validation Checks

The database implements backend validation:
- ✅ **Duplicate Email Prevention**: UNIQUE constraint on Users.email
- ✅ **Password Rules**: Enforced at application level (bcrypt hashing)
- ✅ **Required Fields**: NOT NULL constraints on all essential columns
- ✅ **Secure Auth**: Bcrypt comparison (never stores plain passwords)
- ✅ **Role Validation**: CHECK constraint limits role to 'user' or 'admin'

---

## 🎯 What's Next (For Future Deliverables)

1. **Stored Procedures**: Create SP for Login, Signup, User Retrieval
2. **Views**: User-friendly views for movies, reviews, recommendations
3. **Advanced Functions**: Search, filtering, trending calculations
4. **API Enhancements**: CRUD operations for movies, reviews, watchlist
5. **Frontend**: Complete movie catalogue integration

---

## 📞 Support

For issues or questions:
1. Check backend console for database errors
2. Check browser console (F12) for frontend errors
3. Verify SQL Server is running
4. Verify `.env` credentials are correct

---

**Submitted by:** TeamMovieHive  
**Database:** SQL Server (T-SQL)  
**Frontend:** React.js with Tailwind CSS  
**Backend:** Node.js + Express  
**Date:** March 27, 2026
