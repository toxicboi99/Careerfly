# 🎯 Careerly — Shape Your Future Career


## 🌍 Overview

**Careerly** is an **AI-powered career guidance platform** designed to help students and professionals discover personalized career paths based on their skills, interests, and aspirations.
It uses intelligent algorithms and real-time job market insights to provide **data-driven recommendations**, ensuring every user finds the career best suited to their profile.

The platform transforms career exploration into an interactive, personalized experience — bridging the gap between education, skills, and industry demand.

---

## ⚙️ Key Features

- 🧠 **AI Career Mapping** – Advanced algorithms analyze skills and preferences to suggest optimal career paths.
- 🧩 **Personalized Roadmaps** – Step-by-step career journeys tailored to user goals and strengths.
- 📊 **Market Intelligence** – Real-time insights into trending job roles, salaries, and industry growth.
- 🎓 **College Integration** – Aligns recommendations with placement data and academic profiles.
- 🌏 **Global Reach** – Discover opportunities both in India and international job markets.
- 🧭 **Progress Tracking** – Monitor learning milestones and receive continuous AI-guided updates.

---

## 🚀 How It Works

1. **Complete Smart Assessment** – AI evaluates your skills, interests, and personality traits.
2. **AI Analysis & Processing** – Your profile is matched with thousands of career paths.
3. **Personalized Recommendations** – Receive detailed reports, salary insights, and role roadmaps.
4. **Track & Grow** – Improve skills and stay updated as you progress toward your career goals.

---

## 💡 Purpose

Careerly empowers students and young professionals to make **informed, future-ready career choices**.
By merging **AI intelligence**, **career analytics**, and **learning guidance**, it simplifies complex career decisions into clear, actionable insights.

---

## 🔖 Keywords

AI Career Guidance · Skill Mapping · Career Insights · Personalized Learning ·
Job Market Analysis · AI Recommendation System · Student Career Platform

---

## 🗄️ Database (MongoDB) setup

Careerly loads data from **MongoDB** (no in-code demo arrays at runtime).

### Environment variables

Create `.env.local` in the project root:

```bash
MONGODB_URI="your_mongodb_connection_string"
MONGODB_DB="careerly"
JWT_SECRET="your_long_random_secret"
```

You can use `.env.example` as a template.

### Seed demo data into MongoDB

After setting `MONGODB_URI`, run:

```bash
npm run seed
```

This inserts:
- `colleges` and `college_outcomes`
- `training_data` and `model_metrics`
- `users` + `dashboard_profiles`

Seeded accounts:
- **Admin**: `admin@careerly.com` / `admin123`
- **Student**: `student@example.com` / `password`

### Run locally

```bash
npm run dev
```

Then open:
- `http://localhost:3000/login`
- `http://localhost:3000/colleges`

### Deploy (Vercel)

- **MongoDB Atlas**: Create a cluster and copy your connection string into `MONGODB_URI`.
- **Vercel**: Set `MONGODB_URI`, `MONGODB_DB`, and `JWT_SECRET` in Project → Settings → Environment Variables, then redeploy.

After deploy, verify:
- `GET /api/colleges` returns seeded data
- Login works and routes to `/dashboard` (student) or `/admin` (admin)

