# 🏫 Campus Room & Facility Booking System

A centralized **Campus Room and Facility Booking System** designed to simplify the reservation of classrooms, seminar halls, and meeting spaces across campus. This project eliminates manual booking conflicts by providing a **secure, real-time, role-based web application** built using the **MERN Stack** integrated with **RAG (Retrieval-Augmented Generation)** AI capabilities.

The system enables students, faculty, and administrators to efficiently manage facility reservations through an intuitive interface and powerful backend scheduling logic.

---

## 📌 Project Overview

Campus facilities are often reserved manually, which leads to scheduling conflicts and inefficient utilization. This application provides:

* A centralized online booking platform
* Real-time room availability tracking
* Conflict-free scheduling system
* Role-based administrative control
* AI-powered room search and analytics insights

This platform improves transparency, accessibility, and effective campus resource management.

---

## 🚀 Key Features Built

### User Features
* **Smart AI Room Search (RAG):** Users can search for rooms using natural language (e.g., "Find me a quiet room for 50 people with a projector"). This is powered by a **Retrieval-Augmented Generation (RAG)** architecture that feeds real-time MongoDB room data into the Google Gemini API to return highly accurate, contextual matches.
* **Smart Search & Filtering:** Debounced searching by room name, building, capacity, and type.
* **Booking Calendar View:** A visual monthly calendar showing all approved, pending, and rejected bookings.
* **QR Code & OTP Check-In:** Users receive a secure QR code and a 6-digit OTP upon booking approval to check into their rooms digitally.
* **In-App & Email Notifications:** Real-time bell notifications and automated email alerts (via Nodemailer) for booking approvals, rejections, and check-in OTPs.
* **Booking Management:** Book rooms for specific time slots, modify existing requests, and cancel bookings.

### Admin Features
* **AI Executive Summary:** The admin Analytics dashboard automatically generates intelligent, actionable insights from raw booking data using the Gemini API.
* **Advanced Analytics Dashboard:** Visual charts (Recharts) displaying total bookings, peak hours, most booked rooms, and bookings by status.
* **Export Data:** One-click export of booking data to CSV and PDF formats for reporting.
* **Room Management:** Add new rooms, update facility details, and toggle room availability.
* **Booking Moderation:** Review all pending requests to approve or reject them.

---

## ⚙️ Smart Scheduling Logic

The backend scheduling engine ensures:
* No overlapping bookings are allowed for the same room.
* End time must always be greater than start time.
* Invalid booking slots are automatically rejected.
* Conflicts are detected before confirmation.

---

## 🔐 Authentication & Authorization

The system implements secure authentication using:
* JSON Web Tokens (JWT)
* bcrypt password hashing
* Role-based access control (Admin / User)

### Special Admin Access Rule

If any user logs in using the administrator credentials:
```
Email: admin@admin.com
Password: admin@123
```
then the system automatically grants **Administrator Access** and enables the **Admin Dashboard** with full management privileges.

---

## 🎨 User Interface

The application uses a modern **Glassmorphism UI design** featuring:
* Clean layout and frosted glass panels
* Responsive components (Lucide React Icons)
* Smooth navigation experience
* Simple booking workflow

---

## 🧰 Tech Stack (MERN + RAG)

### 💻 Frontend
* ⚛️ **React.js** (Core Framework)
* 🎨 **Vanilla CSS** (Responsive Glassmorphism UI)
* 📊 **Recharts** (Data Visualization)
* 📅 **React-Calendar** (Interactive Booking UI)

### ⚙️ Backend
* 🟢 **Node.js** (Runtime Environment)
* 🚂 **Express.js** (REST API Framework)
* 🧠 **Google Gemini API** (RAG Architecture for AI Search & Analytics)
* 📧 **Nodemailer** (Automated Email Alerts)

### 🗄️ Database
* 🍃 **MongoDB Atlas** (Cloud NoSQL Database)

---

## ▶️ Commands for Running the Application

### Setup Environment Variables
Create a `.env` file in the root directory:
```env
MONGO_URI=your_mongodb_connection_string
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_google_gemini_api_key
```

### Run Frontend (Development Mode)
```bash
cd client
npm install
npm start
```

### Run Backend Server
```bash
npm install
node server.js
```

---


