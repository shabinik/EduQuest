# EduQuest – School Management System (SaaS / Multi-Tenant)

EduQuest is a full-stack SaaS platform designed to help educational institutions manage students, teachers, subscriptions, finance, and communication within a multi-tenant architecture.

Each school operates independently under a single platform.

---

## Features

### Authentication & Roles

* SuperAdmin – Manages platform, tenants, and subscriptions

* School Admin – Manages school operations

* Teacher – Handles classes, assignments, and exams

* Student – Access learning resources and activities

* Email-based authentication

* JWT authentication

* HttpOnly cookie-based security

* Role-based access control

---

### Subscription & Billing

* Subscription plan creation by SuperAdmin
* School subscription purchase (Razorpay integration)
* Subscription status tracking (active, inactive, expired)
* Payment tracking and billing

---

### User Management

* Create and manage teachers and students
* Auto email credentials on account creation
* Profile management with Cloudinary
* Update and delete users

---

### SuperAdmin Module

* Dashboard overview
* Tenant (school) management
* Subscription plan management
* Billing and payment tracking
* Profile management

---

### Admin / School Management

* Admin dashboard
* Teacher management (add, edit, view)
* Student management (add, edit, view)
* Leave request management
* Finance management (expenses and reports)
* Subscription handling
* Institute and admin profile management
* Global announcements
* Timetable creation (class and division based)
* Meeting scheduling (staff, class meetings)

---

### Teacher Module

* Dashboard
* Class-based student management
* Assignment management (create, edit, view submissions)
* Exam management (create, edit, publish results)
* Daily schedule tracking
* Student list and individual profiles
* Profile management

---

### Student Module

* Dashboard
* Attendance tracking
* Exam results
* Assignment submission
* Raise concerns (exam-related)
* Fee management and receipt viewing
* Timetable access
* Meeting participation
* Leave request submission
* Email notifications

---

### AI Assistant

* AI-powered student assistance
* Helps with learning and question answering

---

### Real-Time Notifications

* Notifications for:

  * Assignments
  * Exams
  * Announcements
  * Fees
  * Meetings

* WebSocket-based real-time updates

* Notification bell with unread tracking

---

### Video Meetings

* Create and schedule meetings
* Class, staff, and general meetings
* Jitsi integration (no external setup required)

---

## Tech Stack

| Layer          | Technology                             |
| -------------- | -------------------------------------- |
| Backend        | Django REST Framework, Django Channels |
| Frontend       | React (Vite), Axios                    |
| Authentication | JWT + HttpOnly Cookies                 |
| Database       | PostgreSQL                             |
| Storage        | Cloudinary                             |
| Payments       | Razorpay                               |
| Realtime       | WebSockets (Channels)                  |

---

## Project Setup

### 1. Clone Repository

git clone https://github.com/shabinik/EduQuest.git
cd EduQuest

---

### 2. Create Virtual Environment

python -m venv venv

Activate:

Windows:
venv\Scripts\activate

Mac/Linux:
source venv/bin/activate

---

### 3. Install Dependencies

pip install -r requirements.txt

---

### 4. Environment Variables

Create a `.env` file in the root directory.

Example:

SECRET_KEY=your_secret_key
DEBUG=True

DATABASE_URL=your_database_url

CLOUDINARY_URL=your_cloudinary_url

RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret

EMAIL_HOST_USER=your_email
EMAIL_HOST_PASSWORD=your_password

GROQ_API_KEY=your_api_key

Note:

* Do NOT use real credentials in public repositories
* Add `.env` to `.gitignore`

---

### 5. Apply Migrations

python manage.py makemigrations
python manage.py migrate

---

### 6. Create Superuser

python manage.py createsuperuser

---

### 7. Run Backend Server

python manage.py runserver

---

### 8. Run Frontend

cd frontend
npm install
npm run dev

---

## Realtime Setup (Development)

CHANNEL_LAYERS = {
"default": {
"BACKEND": "channels.layers.InMemoryChannelLayer",
},
}

---

## Production Notes

* Use Redis for WebSocket communication
* Use Daphne or another ASGI server
* Configure Nginx for deployment

---

## Security Notes

* Never expose API keys or secrets
* Always use environment variables
* Keep `.env` file out of version control

---

## Future Enhancements

* Mobile application
* Push notifications
* Advanced analytics
* AI-based performance tracking

---

## Author

Your Name
