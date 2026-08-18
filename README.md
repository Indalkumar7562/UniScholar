# 🎓 Universal Scholarship System (USS)

A full-stack **MERN** application that helps students discover and check eligibility for government scholarships based on their profile.

---

## 🛠️ Tech Stack

| Layer     |   Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS v3, React Router v6 |
| Backend   | Node.js, Express.js                     |
| Database  | MongoDB + Mongoose ODM                  |
| Auth      | JWT (jsonwebtoken) + bcryptjs           |
| HTTP      | Axios                                   |
| UI        | Lucide React icons, react-hot-toast     |

---

## 📁 Project Structure

```
uss/
├── package.json                  ← Root scripts (concurrently)
│
├── server/                       ← Express API
│   ├── server.js                 ← Entry point
│   ├── seeder.js                 ← DB seeder script
│   ├── .env                      ← Environment variables
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── User.model.js
│   │   ├── Profile.model.js
│   │   ├── Scheme.model.js
│   │   └── EligibilityResult.model.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── scheme.controller.js
│   │   └── eligibility.controller.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── scheme.routes.js
│   │   └── eligibility.routes.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── error.middleware.js
│   └── utils/
│       ├── jwt.utils.js
│       └── eligibility.utils.js
│
└── client/                       ← React + Tailwind Frontend
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── services/
        │   └── api.js             ← Axios API service
        ├── context/
        │   └── AuthContext.jsx    ← Global auth state
        ├── components/
        │   ├── ui/
        │   │   └── index.jsx      ← Reusable UI components
        │   ├── layout/
        │   │   └── DashboardLayout.jsx
        │   └── dashboard/
        │       └── SchemeCard.jsx
        └── pages/
            ├── LandingPage.jsx
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── DashboardHome.jsx
            ├── ProfilePage.jsx
            ├── EligibilityPage.jsx
            ├── ResultsPage.jsx
            ├── SchemesPage.jsx
            └── SchemeDetailPage.jsx
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Clone & Install

```bash
# Install root dependencies
npm install

# Install all (server + client)
npm run install:all
```

### 2. Configure Environment

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```
MONGO_URI=mongodb://localhost:27017/scholarship_db
JWT_SECRET=your_super_secret_key_here
PORT=5000
CLIENT_URL=http://localhost:5173
```

### 3. Seed the Database

```bash
cd server
node seeder.js
```

This creates:
- **10 scholarship schemes**
- **Admin user**: `admin@uss.gov.in` / `admin@123`
- **Demo student**: `student@demo.com` / `demo@123`

### 4. Run Development Servers

```bash
# From project root — runs both client + server
npm run dev
```

| Service  | URL                        |
|----------|----------------------------|
| Frontend | http://localhost:5173       |
| Backend  | http://localhost:5000       |
| API Health | http://localhost:5000/api/health |

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| POST   | `/api/auth/register`  | Register new user    |
| POST   | `/api/auth/login`     | Login & get JWT      |
| GET    | `/api/auth/me`        | Get current user     |
| POST   | `/api/auth/logout`    | Logout               |

### Users / Profile
| Method | Endpoint                      | Description            |
|--------|-------------------------------|------------------------|
| GET    | `/api/users/profile`          | Get user profile       |
| PUT    | `/api/users/profile`          | Create / update profile|
| GET    | `/api/users/bookmarks`        | Get bookmarked schemes |
| POST   | `/api/users/bookmarks/:id`    | Toggle bookmark        |

### Schemes
| Method | Endpoint           | Description            |
|--------|--------------------|------------------------|
| GET    | `/api/schemes`     | Get all (search/filter)|
| GET    | `/api/schemes/:id` | Get single scheme      |
| POST   | `/api/schemes`     | Create (Admin only)    |
| PUT    | `/api/schemes/:id` | Update (Admin only)    |
| DELETE | `/api/schemes/:id` | Delete (Admin only)    |

### Eligibility
| Method | Endpoint                   | Description               |
|--------|----------------------------|---------------------------|
| POST   | `/api/eligibility/check`   | Run eligibility check     |
| GET    | `/api/eligibility/results` | Get last check results    |

---

## 🎨 Pages & Features

| Page              | Route          | Description                              |
|-------------------|----------------|------------------------------------------|
| Landing           | `/`            | Hero, features, stats, how-it-works      |
| Login             | `/login`       | JWT auth with demo credentials           |
| Register          | `/register`    | Account creation with validation         |
| Dashboard         | `/dashboard`   | Stats, CTA cards, featured schemes       |
| Profile           | `/profile`     | 8-field form with progress tracker       |
| Eligibility Check | `/eligibility` | Animated check with step-by-step progress|
| Results           | `/results`     | Filter/search eligible vs not eligible   |
| Browse Schemes    | `/schemes`     | Paginated, searchable, filterable grid   |
| Scheme Detail     | `/schemes/:id` | Full info, criteria, docs, apply button  |

### ✨ Extra Features
- 🌙 **Dark mode** toggle
- 🔖 **Bookmark** schemes
- 🔍 **Search + filter** schemes by category
- 💀 **Skeleton loaders** for async data
- 🔔 **Toast notifications** (react-hot-toast)
- 📱 **Fully responsive** — mobile hamburger sidebar
- 🔐 **Protected routes** with JWT
- ⚡ **Eligibility engine** checks income, age, category, education, state, gender, disability

---

## 🌱 Seeded Scholarship Schemes

1. PM National Scholarship Scheme
2. SC/ST Post Matric Scholarship
3. OBC Pre-Matric Scholarship
4. Central Sector Scholarship for College Students
5. Minority Pre-Matric Scholarship
6. Rajiv Gandhi National Fellowship
7. INSPIRE Scholarship for Higher Education
8. Pragati Scholarship for Girl Students
9. National Means-cum-Merit Scholarship
10. Ishan Uday Special Scholarship – North East

---

## 🏗️ Build for Production

```bash
# Build React client
npm run build

# Serve with a process manager (e.g. PM2)
cd server && npm start
```

---

## 📄 License

MIT — free to use for educational and personal projects.
