# 🏫 Campus Room & Facility Booking System

A centralized **Campus Room and Facility Booking System** designed to simplify the reservation of classrooms, seminar halls, and meeting spaces across campus. This project eliminates manual booking conflicts by providing a **secure, real-time, role-based web application** built using the **MERN Stack (MongoDB, Express.js, React.js, Node.js)**.

The system enables students, faculty, and administrators to efficiently manage facility reservations through an intuitive interface and powerful backend scheduling logic.

---

## 📌 Project Overview

Campus facilities are often reserved manually, which leads to scheduling conflicts and inefficient utilization. This application provides:

* A centralized online booking platform
* Real-time room availability tracking
* Conflict-free scheduling system
* Role-based administrative control

This platform improves transparency, accessibility, and effective campus resource management.

---

## 🎯 Objectives

* Provide a centralized booking system for campus facilities
* Prevent overlapping reservations automatically
* Enable easy booking modification and cancellation
* Allow administrators to manage rooms and booking requests efficiently
* Monitor facility usage activity

---

## 👤 User Features

Users can:

* View available classrooms, seminar halls, and meeting rooms
* Book rooms for specific dates and time slots
* Modify existing reservations
* Cancel bookings when required
* Receive booking confirmations
* View booking history in **My Bookings** section

---

## 🛠️ Admin Features

Administrators can:

* Add new rooms and update facility details
* Manage room availability
* Approver or reject booking requests
* Monitor facility usage
* Manage all bookings through Admin Dashboard

---

## ⚙️ Smart Scheduling Logic

The backend scheduling engine ensures:

* No overlapping bookings are allowed
* End time must always be greater than start time
* Invalid booking slots are automatically rejected
* Conflicts are detected before confirmation

This guarantees reliable allocation of campus facilities.

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

## 🖥️ Admin Dashboard

The Admin Dashboard allows administrators to:

* View all booking requests
* Approve or reject reservations
* Add or update room details
* Monitor booking activity

This provides complete control over campus facility management.

---

## 🎨 User Interface

The application uses a modern **Glassmorphism UI design** featuring:

* Clean layout
* Responsive components
* Smooth navigation experience
* Simple booking workflow

Designed for both students and faculty usability.

---

## 🧰 Tech Stack

### Frontend

* React.js
* Vanilla CSS (Glassmorphism UI)

### Backend

* Node.js
* Express.js

### Database

* MongoDB Atlas

### Deployment

* Frontend: Vercel
* Backend: Render

---

## 📅 Suggested Technologies from Problem Statement

* Calendar APIs for schedule handling
* Backend scheduling algorithms for conflict detection

---

## 🚀 Application Features Summary

* Secure login & registration system
* Role-based access control
* Real-time room availability
* Conflict-free booking engine
* Booking modification & cancellation
* Admin approval workflow
* Facility usage monitoring
* Cloud deployment ready architecture

---

## ▶️ Commands for Running the Application

### Run Frontend (Development Mode)

```bash
cd client
npm start
```

### Run Backend Server

```bash
nodemon server.js
```

### Production Server Start

```bash
node server.js
```

### Build Optimized React App

```bash
npm run build
```

---

## 📦 Project Deliverables

This project includes:

* Room booking web application
* Admin dashboard
* Backend scheduling system
* Secure authentication module
* Cloud deployment configuration

---

## 👥 Contributors

Contribution order:

1. Saidam Venkatesh — 23JE0848
2. Sachin Rajguru — 23JE0837
3. Samala Sai Karthik Reddy — 23JE0854
4. Sachin Kumar — 23JE0835

---

## 📈 Future Enhancements

Possible improvements:

* Email notification integration
* Google Calendar synchronization
* Progressive Web App (PWA) support
* QR-based room access validation
* Advanced analytics dashboard

---

## 📄 License

This project is developed as part of the **Software Engineering Lab Course Project**.
