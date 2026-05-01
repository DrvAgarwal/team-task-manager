# Team Task Manager 🚀

A production-ready, full-stack Role-Based Task Manager built with **Node.js, Express, MongoDB, and EJS**. This application provides a robust platform for teams to manage projects, assign tasks, and track progress securely.

## 🌟 Key Features

- **Strict Role-Based Access Control (RBAC):** Roles (Admin/Member) are assigned on a per-project level, ensuring users only have access to what they need.
- **Advanced Task Engine:** Assign tasks securely to scoped team members. Members can only view and modify their assigned tasks, while Admins have full oversight.
- **Dynamic Dashboard:** Real-time, fetch-based tracking for overdue, upcoming, and completed tasks.
- **Airtight Security:** 
  - Passwords hashed using Bcrypt (12 rounds).
  - Robust JWT (JSON Web Token) issuance with HTTP-only cookies.
  - Continuous refresh-token logic for secure and seamless user sessions.
- **Server-Side Rendering:** Utilizing EJS for fast, dynamic, and SEO-friendly views.

## 🛠️ Technology Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose ODM
- **Frontend:** EJS (Embedded JavaScript templates), CSS, Vanilla JavaScript
- **Authentication:** JSON Web Tokens (JWT), Bcrypt, Cookie-Parser
- **Validation:** Joi

## 📂 Project Structure

```text
team-task-manager/
├── config/         # Database and environment configurations
├── controllers/    # Route controllers (logic for handling requests)
├── middleware/     # Custom middleware (auth, error handling, etc.)
├── models/         # Mongoose schema definitions
├── public/         # Static assets (CSS, JS, Images)
├── routes/         # Express route definitions
├── utils/          # Utility functions and helpers
├── views/          # EJS templates and partials
├── .env.example    # Example environment variables
├── server.js       # Application entry point
└── package.json    # Project metadata and dependencies
```

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Ensure you have the following installed on your local machine:
- [Node.js](https://nodejs.org/en/download/) (v14 or higher recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) (Local instance or MongoDB Atlas URI)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd team-task-manager
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   - Copy the `.env.example` file to create a new `.env` file.
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and configure your local settings:
     ```env
     PORT=3000
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret_key
     JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
     SESSION_SECRET=your_session_secret_key
     NODE_ENV=development
     ```

4. **Start the development server:**
   ```bash
   npm start
   ```

5. **Access the application:**
   Open your browser and navigate to `http://localhost:3000`

## ☁️ Deployment

The application is configured out-of-the-box for deployment on platforms like [Railway](https://railway.app/). 

1. Push your code to a GitHub repository.
2. Connect your repository to Railway.
3. Railway will automatically detect the `Procfile` and Node.js environment.
4. Ensure you inject the required environment variables (from `.env.example`) into your Railway project settings.

## 🛡️ Security Measures

- **HTTP-Only Cookies:** Prevents XSS attacks by restricting client-side scripts from accessing auth tokens.
- **Input Validation:** All incoming data is rigorously validated using Joi before processing.
- **Error Handling:** Centralized error handling to prevent sensitive stack traces from leaking to the client.

## 📄 License

This project is licensed under the ISC License.