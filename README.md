# 🎓 Universal Scholarship System (USS)

A centralized digital platform for scholarship discovery, eligibility checking, application management, document verification, and approval workflows.

The Universal Scholarship System helps students discover suitable scholarships, check their eligibility, submit applications, upload documents, and track application progress. Administrators can manage scholarship schemes, verify documents, and approve or reject applications.

## 🌐 Live Demo

🔗 **[Universal Scholarship System](https://unischolar.vercel.app/)**

---

## 📌 Project Overview

The Universal Scholarship System is designed to simplify and digitize the scholarship application process by bringing students, administrators, and partner organizations onto a single platform.

The system provides a complete scholarship lifecycle:

```text
Scholarship Discovery
        ↓
Student Profile Creation
        ↓
Eligibility Checking
        ↓
Scholarship Recommendation
        ↓
Application Submission
        ↓
Document Upload
        ↓
Document Verification
        ↓
Application Approval
        ↓
Notification and Tracking
🚀 Main Features
👨‍🎓 Student Features
Student registration and login
Secure authentication
Student profile management
Academic and financial information management
Scholarship discovery and search
Scholarship filtering
Eligibility checking
Profile-based scholarship recommendations
Scholarship details and benefits
Scholarship bookmarking
Online scholarship application
Document upload
Application status tracking
Application history
Notifications
AI-assisted scholarship assistance
🛡️ Admin Features
Admin authentication
Scholarship scheme creation
Scholarship scheme management
Update and delete scholarship schemes
View student applications
View uploaded documents
Verify uploaded documents
Approve or reject documents
Review applications
Multi-stage application approval
Application rejection with reason
Student information management
Application monitoring
Notification management
Audit activity tracking
🤝 Partner Features
Partner authentication
View assigned applications
Review applicant information
Check application progress
Participate in the verification workflow
View relevant scholarship and application details
🧠 Recommendation System

The recommendation system compares student profile information with scholarship eligibility criteria and recommends suitable scholarships.

Recommendation Workflow
Student Opens AI Hub
        ↓
Fetch Student Profile
        ↓
Fetch Active Scholarship Schemes
        ↓
Compare Profile with Eligibility Criteria
        ↓
Calculate Match Score
        ↓
Identify Satisfied and Missing Criteria
        ↓
Create Eligibility Result
        ↓
Display Recommended Scholarships
        ↓
View Details, Bookmark, or Apply
Matching Criteria

The recommendation system can compare the following information:

Age
Gender
State
District
Education
Stream
CGPA or percentage
Profession
Annual family income
Category
Minority status
Disability status
BPL status
Scheme-specific requirements
Recommendation Output

The system can display:

Scholarship name
Match percentage
Eligibility status
Satisfied criteria
Missing criteria
Reason for recommendation
Required documents
Application deadline
Next action

The recommendation module is described as profile-based or AI-assisted matching unless a separately trained machine-learning model is deployed.

🔄 Application Workflow
Student Registration
        ↓
Student Login
        ↓
Profile Creation or Update
        ↓
Scholarship Search
        ↓
Eligibility Checking
        ↓
Scholarship Recommendation
        ↓
Application Submission
        ↓
Document Upload
        ↓
Admin Document Verification
        ↓
Application Review
        ↓
Partner Review, if applicable
        ↓
Final Approval or Rejection
        ↓
Notification to Student
        ↓
Application Tracking
🗂️ System Modules
1. Authentication Module
Student registration
Student login
Admin login
Partner login
JWT-based authentication
Role-based authorization
Protected routes
2. Student Profile Module
Personal information
Academic information
Financial information
Category details
Location details
Disability and BPL information
Profile update functionality
3. Scholarship Scheme Module
Scholarship creation
Scholarship editing
Scholarship deletion
Scholarship search
Scholarship filtering
Eligibility criteria management
Benefits and financial support
Application deadline management
Scholarship status management
4. Eligibility Module
Profile-based eligibility checking
Criteria comparison
Match score calculation
Missing criteria identification
Eligibility result storage
Eligibility explanation
5. Application Module
Application submission
Application status management
Multi-stage approval workflow
Application tracking
Application history
Rejection reason management
6. Document Module
Document upload
Document storage
Document classification
Document verification
Document approval or rejection
Verification remarks
Document status tracking
7. Notification Module
Application status notifications
Document verification notifications
Approval notifications
Rejection notifications
New scholarship notifications
Read and unread notification status
8. Audit Module
User activity tracking
Admin action tracking
Application history
Document verification history
Approval and rejection records
System activity logs
🏗️ System Architecture
                    ┌──────────────────────┐
                    │      Frontend        │
                    │      React.js        │
                    └──────────┬───────────┘
                               │
                               │ HTTP Requests
                               ▼
                    ┌──────────────────────┐
                    │      Backend API     │
                    │   Node.js / Express  │
                    └──────────┬───────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
 ┌────────────────┐   ┌────────────────┐   ┌────────────────┐
 │ Authentication │   │ Scholarship and│   │ Application and│
 │ and User APIs  │   │ Eligibility API│   │ Document APIs  │
 └────────────────┘   └────────────────┘   └────────────────┘
          │                    │                    │
          └────────────────────┼────────────────────┘
                               ▼
                    ┌──────────────────────┐
                    │       MongoDB        │
                    │     Database         │
                    └──────────────────────┘

                    ┌──────────────────────┐
                    │    File Storage      │
                    │ Uploaded Documents   │
                    └──────────────────────┘

                    ┌──────────────────────┐
                    │   Redis / Services   │
                    │ Cache and Queues     │
                    └──────────────────────┘
🧰 Technologies Used
Frontend
React.js
JavaScript
HTML5
CSS3
Axios
React Router
Backend
Node.js
Express.js
JavaScript
REST APIs
JWT Authentication
Database
MongoDB
MongoDB Atlas
Mongoose
Supporting Services
Redis
Docker
Docker Compose
File Storage
Notification Services
Development Tools
Visual Studio Code
Git
GitHub
Postman
MongoDB Compass
Docker Desktop
📁 Project Structure
UniScholar-main/
│
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       │   ├── AIHub.jsx
│       │   ├── SchemeDetailPage.jsx
│       │   ├── EligibilityPage.jsx
│       │   └── ApplicationTrackerPage.jsx
│       ├── services/
│       ├── assets/
│       └── App.jsx
│
├── server/
│   ├── controllers/
│   ├── models/
│   │   ├── User.model.js
│   │   ├── Profile.model.js
│   │   ├── Scheme.model.js
│   │   ├── Application.model.js
│   │   ├── Document.model.js
│   │   ├── EligibilityResult.model.js
│   │   ├── Notification.model.js
│   │   └── AuditLog.model.js
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   ├── config/
│   └── server.js
│
├── docker-compose.yml
├── package.json
└── README.md
🗃️ Database Entities

The main entities in the system are:

User
Profile
Scheme
Application
Document
EligibilityResult
Notification
AuditLog
Bookmark
Entity Relationships
User 1 ───────── 1 Profile

User 1 ───────── M Application

Scheme 1 ─────── M Application

User 1 ───────── M Document

Application 1 ── M Document

User 1 ───────── M EligibilityResult

Profile 1 ────── M EligibilityResult

Scheme 1 ─────── M EligibilityResult

User 1 ───────── M Notification

User/Admin 1 ─── M AuditLog

User M ────────── N Scheme
       through Bookmark
⚙️ Installation and Setup
1. Clone the Repository
git clone https://github.com/Indalkumar7562/Multi-Agent-AI-Platform.git
2. Open the Project Directory
cd Multi-Agent-AI-Platform
3. Install Backend Dependencies
cd server
npm install
4. Install Frontend Dependencies

Open another terminal:

cd client
npm install
5. Configure Environment Variables

Create a .env file inside the backend directory.

Example:

PORT=8000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

REDIS_URL=redis://localhost:6379

CLIENT_URL=http://localhost:5173

Do not upload the actual .env file or secret keys to GitHub.

6. Start the Backend
cd server
npm run dev
7. Start the Frontend

Open another terminal:

cd client
npm run dev

The application will normally be available at:

Frontend: http://localhost:5173
Backend:  http://localhost:8000
🐳 Running with Docker

If Docker Compose is configured in the project, run:

docker compose up --build

To stop the containers:

docker compose down

To view running containers:

docker ps

To view container logs:

docker logs <container-name>
🔐 Environment Variables
Variable	Description
PORT	Backend server port
MONGODB_URI	MongoDB Atlas connection string
JWT_SECRET	Secret key used for authentication
REDIS_URL	Redis connection URL
CLIENT_URL	Frontend application URL
🧪 Testing

The project can be tested using:

Postman for API testing
Browser testing for frontend functionality
MongoDB Atlas for database verification
MongoDB Compass for local database inspection
Docker logs for service monitoring
OWASP ZAP for security testing
Manual role-based workflow testing
Important Test Cases
Student registration
Student login
Invalid login credentials
Profile creation
Profile update
Scholarship search
Scholarship filtering
Eligibility calculation
Recommendation result generation
Application submission
Document upload
Document approval
Document rejection
Application approval
Application rejection
Application status updates
Unauthorized access prevention
Notification generation
Role-based access control
🔒 Security Features
JWT-based authentication
Role-based authorization
Protected API routes
Password encryption
Input validation
Secure document access
Admin-only verification actions
Environment-based secret management
Audit logging
Access control for student, admin, and partner roles
📊 Project Documentation

The project documentation includes:

Entity Relationship Diagram
Data Flow Diagram
Recommendation System Workflow
Scheme Details Interface
System Architecture
Application Workflow
Database Relationships
🎯 Future Enhancements
OTP-based authentication
Email notifications
SMS notifications
Real-time notification system
Advanced machine-learning recommendation model
OCR-based document verification
Automatic fraud detection
Scholarship deadline reminders
Multilingual support
Mobile application
Advanced analytics dashboard
Integration with government scholarship portals
Payment and financial-aid tracking
Automated document validation
AI chatbot for scholarship assistance
🌟 Benefits of the System
Reduces manual scholarship searching
Saves student time
Centralizes scholarship information
Simplifies application submission
Improves document verification
Provides transparent application tracking
Reduces administrative workload
Helps students identify suitable scholarships
Improves communication through notifications
Maintains application and verification history
👨‍💻 Contributors
Indal Kumar
Project Team Members
📄 License

This project is developed for educational and academic purposes.

⭐ Support

If you find this project useful, please consider giving the repository a star on GitHub.

🔗 GitHub Repository:
https://github.com/Indalkumar7562/Multi-Agent-AI-Platform.git

🔗 Live Application:
https://unischolar.vercel.app/
