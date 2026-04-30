# Team Task Manager

A production-ready, full-stack Role-Based Task Manager built with Node.js, Express, MongoDB, and EJS.

## Features
- **Strict RBAC:** Roles (Admin/Member) assigned on a per-project level. 
- **Task Engine:** Assign tasks securely to scoped team members. Members only view/modify their assigned tasks.
- **Dynamic Dashboard:** Real-time fetch-based tracking for overdue and upcoming tasks.
- **Airtight Security:** Bcrypt hashing (12 rounds), robust JWT issuance with HTTP-only cookies, and continuous refresh-token logic.

## Deployment
Configured out-of-the-box for Railway. Use the included `Procfile` and inject `.env` parameters to seamlessly deploy.
