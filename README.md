# Student Complaint & Grievance Management System (SCGMS)

**Student Name:** LOKESHWARAN N  
**Department:** Information Technology (Final Year)  
**Project Category:** Web Development / Academic Project  

---

## 📌 Project Overview
The **Student Complaint & Grievance Management System (SCGMS)** is a comprehensive, responsive web application designed to streamline the submission, tracking, management, and resolution of student grievances across campus departments (Academics, Infrastructure, Hostel, Transportation, Canteen, etc.).

---

## 🚀 Key Features

### 🎓 1. Student Portal
- **Dashboard Overview:** Real-time statistics on total, pending, in-progress, and resolved complaints.
- **Lodge Complaints:** Submit detailed grievances with categories, priority levels, location, incident dates, and descriptions.
- **Track Status:** Live progress tracking stepper (`Submitted` ➔ `Under Review` ➔ `In Progress` ➔ `Resolved`).
- **My Complaints:** Filter, search, and view detailed ticket histories and administration remarks.
- **Student Profile:** Manage personal info, view activity stats, and update academic details.

### 🏛️ 2. Administration Portal
- **Executive Dashboard:** High-level metrics, resolution rates, department-wise ticket breakdown, and recent activity feed.
- **Complaint Management:** Assign tickets to specific departments, update statuses, set priorities, and write official replies/resolutions.
- **Student Directory:** Search and view registered students and their grievance metrics.
- **Analytics & Reports:** Visual summary reports, filtering by date/category/status, and printable export summaries.

---

## 🔑 Demo Credentials

| Role | Identifier / Email | Password | Access URL |
| :--- | :--- | :--- | :--- |
| **Student** | `STU1001` or `student@college.com` | `student123` | [login.html](login.html) |
| **Administrator** | `admin` or `admin@college.com` | `admin123` | [admin/login.html](admin/login.html) |

---

## 🛠️ Technology Stack
- **Frontend Structure:** Semantic HTML5
- **Styling & UI:** Pure Vanilla CSS3 (Modern Glassmorphism, CSS Custom Properties / Design Tokens, Flexbox, CSS Grid)
- **Logic & Functionality:** Vanilla JavaScript (ES6+ Modules & Controllers)
- **Data Persistence:** Browser `localStorage` API for client-side persistence and demo portability without complex server setup.

---

## 📂 Project Structure
```text
NM/
├── index.html                  # Landing Page / Home
├── login.html                  # Student Login
├── register.html               # Student Registration
├── dashboard.html              # Student Dashboard
├── submit-complaint.html       # Complaint Submission Form
├── track-complaint.html        # Live Grievance Tracking
├── my-complaints.html          # Student Complaints History
├── complaint-details.html      # Detailed Complaint View
├── profile.html                # Student Profile Management
├── css/
│   └── style.css               # Global Theme & Component Stylesheet
├── js/
│   ├── auth.js                 # Authentication & Session Handlers
│   ├── storage.js              # LocalStorage Management & Seed Data
│   ├── complaints.js           # Complaints Data Logic
│   ├── student.js              # Student Portal UI Controllers
│   ├── admin.js                # Admin Portal UI Controllers
│   └── main.js                 # Shared UI Utilities & Mobile Navigation
├── admin/
│   ├── login.html              # Admin Login
│   ├── dashboard.html          # Admin Dashboard
│   ├── complaints.html         # Grievance Processing & Management
│   ├── complaint-details.html  # Admin Grievance Review & Response View
│   ├── students.html           # Student Directory
│   └── reports.html            # Analytics & Reporting
└── README.md                   # Project Documentation
```

---

## 💻 How to Run Locally
1. Clone or extract the project folder.
2. Double-click `index.html` (or open it in any modern browser like Chrome, Edge, Firefox, or Safari).
3. Alternatively, open with a local web server (e.g. VS Code *Live Server* or `npx serve`).

---

## 📝 Submission Guidelines
1. **GitHub Repository:** Upload this project to a public/private GitHub repository and submit the repository link.
2. **ZIP Archive:** Compress the root folder (`NM.zip`) containing all HTML, CSS, JS, and documentation files.
3. **Project Documentation:** Use this README along with your college/internship project report template.
