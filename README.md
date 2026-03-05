# Smart Attendance Management System – Backend

## Project Overview
This repository contains the backend implementation of the **Smart Attendance Management System**.  
The backend is responsible for handling authentication, user management, and attendance-related APIs.

The system is designed to allow administrators and employees to interact with the attendance platform securely.

---

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt (password hashing)

---

## Project Structure

config/ – Database configuration and environment setup  
controllers/ – Business logic for application routes  
middleware/ – Authentication and request validation middleware  
models/ – Mongoose schemas for database collections  
routes/ – API routes for the application  
docs/ – Project documentation and development logs  
server.js – Main entry point of the backend server  

---

## Features Implemented

- User Authentication (Login / Signup)
- Role-based access (Admin / Employee)
- Secure password hashing using bcrypt
- JWT based authentication
- Environment variable configuration using dotenv

---

## Environment Variables

Create a `.env` file in the root directory with the following variables:

MONGO_URI=your_mongodb_connection_string  
JWT_SECRET=your_secret_key  
ADMIN_EMAIL=admin_email  
ADMIN_PASSWORD=admin_password  

---

## Installation

Clone the repository: `git clone https://github.com/paulsimran654-glitch/smart-attendance-backend.git`
Install dependencies: `npm install`
Start the server: `node server.js` or `npm run dev`


---


## API Endpoints (Basic)

POST /api/auth/login  
POST /api/auth/register  

More endpoints will be added as the project progresses.

---

## Author

Simran Paul  
MCA Final Year Project
Smart Attendance Management System