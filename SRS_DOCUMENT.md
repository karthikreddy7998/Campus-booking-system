# Software Requirement Specification (SRS)
**Project Name:** IIT ISM Campus Booking System

---

## 1. Introduction

### 1.1 Purpose of the System
The purpose of the IIT ISM Campus Booking System is to provide a centralized, digital platform for managing the reservation of campus facilities such as classrooms, lecture halls, and the library reading hall. It aims to eliminate manual booking processes, prevent double-bookings, and provide a transparent, easy-to-use interface for both students/faculty and administrative staff.

### 1.2 Scope of the System
The system is designed to be used internally by the students, faculty, and administrators of IIT ISM. 
* **For standard users (Students/Faculty):** The system allows them to browse available facilities, view real-time availability, submit booking requests for specific time slots, and track the approval status of their requests.
* **For Administrators:** The system provides a comprehensive dashboard to review all pending requests, approve or reject them, and manage the master list of campus rooms (including setting global availability).

### 1.3 Overview
This document provides a comprehensive breakdown of the functional and non-functional requirements of the IIT ISM Campus Booking System. It serves as a guideline for our development team and a verification checklist to ensure the final product meets the expected standards and features.

---

## 2. Functional Requirements

Functional requirements define the specific behaviors, features, and functions of the system.

### 2.1 User Authentication & Authorization
* **FR 1.1:** The system shall allow users to register an account using their name, email, and password.
* **FR 1.2:** The system shall allow users to securely log in using their credentials.
* **FR 1.3:** The system shall support Role-Based Access Control (RBAC), distinguishing between "User" and "Admin" roles.
* **FR 1.4:** The system shall protect secure routes and APIs using JSON Web Tokens (JWT).

### 2.2 Room Browsing & Booking (Standard Users)
* **FR 2.1:** The system shall display a list of all campus facilities, including their name, building, capacity, and current global availability.
* **FR 2.2:** The system shall dynamically generate allowed booking time slots based on the specific room (e.g., 24/7 for the Library Reading Hall, and 5:00 AM to 10:00 PM for standard classrooms).
* **FR 2.3:** The system shall enforce chronological time selection, ensuring the selected End Time is strictly after the Start Time.
* **FR 2.4:** The system shall allow users to submit a booking request along with the intended purpose.
* **FR 2.5:** The system must check the database for overlapping time slots and reject the request immediately if a time conflict exists with an already approved or pending booking.

### 2.3 Booking Management (Standard Users)
* **FR 3.1:** Users shall have a dedicated dashboard ("My Bookings") to view all their personal requests and their statuses (Pending, Approved, Rejected).
* **FR 3.2:** Users shall be able to modify the date, time, and purpose of a request as long as its status is still "Pending".
* **FR 3.3:** Users shall be able to cancel a pending booking request via a secure confirmation modal.

### 2.4 Administration & Dashboard (Admins)
* **FR 4.1:** Admins shall have access to a statistical overview displaying the total counts of pending, approved, and rejected requests.
* **FR 4.2:** Admins shall be able to filter the global list of requests by clicking on the respective statistical status cards.
* **FR 4.3:** Admins shall be able to approve or reject any pending booking request.
* **FR 4.4:** Admins shall be able to add new rooms to the system via a secure form.
* **FR 4.5:** Admins shall be able to toggle the global availability of any room (e.g., marking a room unavailable for maintenance), immediately locking it from further user bookings.

---

## 3. Non-Functional Requirements

Non-functional requirements define system attributes such as performance, usability, and security.

### 3.1 Usability
* **NFR 1.1:** The system shall feature a modern "Glassmorphism" UI design language to provide a premium and visually engaging user experience.
* **NFR 1.2:** The system shall be fully responsive, ensuring seamless operation across desktop, tablet, and mobile devices.
* **NFR 1.3:** Destructive actions (like cancelling a booking) shall utilize custom-styled confirmation modals rather than native browser alerts to maintain visual immersion.
* **NFR 1.4:** The system shall provide immediate visual feedback to the user via non-intrusive Toast Notifications for successes and errors.

### 3.2 Performance
* **NFR 2.1:** The system shall operate as a Single Page Application (SPA), ensuring UI transitions occur without full page reloads.
* **NFR 2.2:** The frontend shall utilize strict cache-busting strategies to guarantee that real-time status updates (like an admin approving a booking) reflect instantly on the user's screen without requiring a hard refresh.

### 3.3 Security
* **NFR 3.1:** All user passwords shall be cryptographically hashed using bcrypt before being stored in the database.
* **NFR 3.2:** The API shall validate all incoming requests to ensure malicious or malformed data cannot compromise the database.
* **NFR 3.3:** Time-conflict validation must occur on the backend server, regardless of frontend constraints, to prevent double-booking via API tampering.

### 3.4 Reliability & Availability
* **NFR 4.1:** The database (MongoDB) shall maintain data integrity using strict Mongoose schemas.
* **NFR 4.2:** The system should gracefully handle and report server-side errors to the user without crashing the frontend application.

---

## 4. Assumptions & Dependencies
* **Dependency:** The system requires an active connection to the MongoDB database.
* **Assumption:** Users have access to modern web browsers that support modern CSS features (like `backdrop-filter` for the Glassmorphism UI) and JavaScript execution.
* **Dependency:** Node Package Manager (NPM) and its associated ecosystem packages are required to run and build the application.
