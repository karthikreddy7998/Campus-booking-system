**Project Name:** IIT ISM Campus Booking System

## 1. Introduction
This document outlines the high-level architecture and design decisions for the IIT ISM Campus Booking System. The main goal of this project was to build a reliable, user-friendly web application that allows students and faculty to book campus facilities, while giving administrators the tools to easily manage and review these requests.

## 2. System Architecture
We chose to build this using the **MERN Stack** (MongoDB, Express, React, Node.js) because it allows for a seamless, JavaScript-based flow from the frontend all the way to the database. The system follows a standard **3-Tier Architecture**:

1. **Presentation Layer (Client):** Built with React.js. It operates as a Single Page Application (SPA), which provides a smooth, fast experience without annoying page reloads. We designed a custom "Glassmorphism" UI using pure CSS to make the application look modern and premium.
2. **Application Layer (Server):** Built with Node.js and Express.js. This acts as the brain of the operation. It handles all the business logic, complex time validation, and security (like verifying who is an admin and who isn't).
3. **Data Layer (Database):** Hosted on MongoDB. It's a NoSQL database, which we chose because our data structures (like bookings linking to specific rooms and users) map perfectly and naturally to JSON-like documents.

## 3. Data Models
The database is structured around three core collections:
* **Users:** Stores account information including Name, Email, securely hashed Passwords, and a `Role`. The `Role` field is crucial as it acts as the gateway separating standard users from administrators.
* **Rooms:** Contains the master list of physical campus spaces (Room Name, Building, Capacity, Type, and a global Availability toggle).
* **Bookings:** The central entity that brings everything together. It links a specific User to a specific Room. It tracks the requested Date, Start Time, End Time, Purpose, and the live Status of the request (`pending`, `approved`, `rejected`, or `cancelled`).

## 4. Core Modules
To keep the codebase clean and maintainable, the backend is split into specific modules:
* **Authentication Module:** Handles registration and login. Upon successful login, the server generates a JSON Web Token (JWT). The React frontend holds onto this token and attaches it to every subsequent request to prove the user's identity to the server.
* **Room Management:** Handles fetching available rooms for users to see, and provides secure endpoints for admins to add new rooms or mark existing rooms as unavailable for maintenance.
* **Booking Engine:** The most logic-heavy part of the system. When a user tries to book a room, this module intercepts the request and queries the database for any overlapping `approved` or `pending` bookings. This ensures that double-booking a room is strictly impossible at the database level.

## 5. Key Design Decisions & Challenges Solved
* **Stateless Authentication:** Instead of using traditional session cookies which can be hard to scale, we opted for JWTs. This keeps the server stateless and lightweight, making the API much faster.
* **Dynamic Time Constraints:** Different facilities have different operating hours (e.g., the Library Reading Hall is open 24/7, while standard classrooms close at 10 PM). We designed a dynamic frontend utility that reads the room type and generates allowed time dropdowns on the fly, ensuring users can't even attempt to book a room when it's closed.
* **Real-time UI Updates vs. Caching:** A common issue in React apps is the browser aggressively caching data, leading to "stale" screens. We implemented strict cache-busting on the client's fetch requests. This ensures that the moment an admin approves a request, the user sees the green "Approved" badge immediately without having to force-refresh their browser.
* **Non-Blocking UI Elements:** We replaced native browser alerts (like `window.confirm`) with custom-built modal overlays. This keeps the user immersed in the application's design language even when performing destructive actions like cancelling a booking.





<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/48a1f2bc-54cc-42c5-befb-43312e56e1a0" />

