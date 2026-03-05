# Smart Attendance Management System – Backend

## Project Overview

This repository contains the backend implementation of the **Smart Attendance Management System**.

The backend handles authentication, user management, and communication with the MongoDB database. It exposes APIs that allow the frontend to interact with the system securely.

---

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt
- dotenv

---

## Features

- User Authentication (Login / Signup)
- Role-based access control (Admin / Employee)
- Secure password hashing using bcrypt
- JWT-based authentication
- Environment variable configuration
- REST API architecture

---

## Project Structure

```

config/ # Database configuration
controllers/ # Business logic
middleware/ # Authentication middleware
models/ # Mongoose schemas
routes/ # API routes
docs/ # Development documentation
server.js # Main server entry point

```


---

## Installation

Clone the repository:


```git clone https://github.com/paulsimran654-glitch/smart-attendance-backend.git```


Install dependencies:


```npm install```


Start the server:


```node server.js```


or


```npm run dev```


Server will run on:


```http://localhost:5000```


---

## API Endpoints (Basic)


POST /api/auth/login
POST /api/auth/register


More endpoints will be added as the project progresses.

---

## Frontend Repository

The frontend application is available here:

https://github.com/paulsimran654-glitch/Smart-Attendance-System

---

## Author

Simran Paul  
MCA Final Year Project  
Smart Attendance Management System