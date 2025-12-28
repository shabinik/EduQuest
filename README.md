# EduQuest – School Management System (SaaS / Multi-Tenant)

EduQuest is a full-stack SaaS platform that allows schools to manage teachers, students, subscriptions, authentication and profiles with cloud storage.
---
# Features

#  Authentication & Roles
- SuperAdmin – Controls subscription plans
- School Admin – Manages school, teachers, students
- Teacher – Manages Class, Students and Valuate Assignments and Exams
- Student – Attend classes and Exams,Submit Assignments etc
- Email-based login + JWT + HttpOnly cookies

# Subscription System
- Superadmin creates subscription plans
- Schools purchase subscription
- Subscription status: active, inactive, expired

# User Management
- Create teachers / students from admin panel
- Auto-email credentials after creation
- Edit profile, upload profile image (Cloudinary)
- Delete teachers / students

---

# Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Django REST Framework, JWT, Cloudinary |
| Frontend | React + Vite + Axios |
| Auth | HttpOnly cookies, custom middleware |
| Database | PostgreSQL |

