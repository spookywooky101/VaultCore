# 🔐 ValutCore — Personal Asset Management System

A full-stack secure file management platform with cloud storage, role-based access control, and file sharing.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + Vite + Vanilla CSS |
| **Backend** | Spring Boot 4 + Java 21 |
| **Security** | JWT Authentication + Spring Security |
| **Database** | H2 (local) / PostgreSQL (production) |
| **Cloud Storage** | Cloudinary |

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure login & registration
- ☁️ **Cloud File Storage** — Upload any file type to Cloudinary
- 📁 **Asset Management** — Upload, download, delete files
- 🗜️ **Compress & Extract** — ZIP compression and extraction, all in the cloud
- 🤝 **File Sharing** — Share files with other users as Reader or Editor
- 👤 **Profile Avatars** — Custom photo upload or 6 cartoon animal presets
- 🌙 **Premium Dark UI** — Glassmorphism design with smooth animations
- 📱 **Collapsible Sidebar** — Responsive layout with hamburger menu

---

## 🏃 Running Locally

### Prerequisites
- Java 21+
- Node.js 18+
- Maven (or use included `mvnw`)

### Backend
```bash
cd personal-asset-cms
./mvnw spring-boot:run
# Runs on http://localhost:8080
```

### Frontend
```bash
cd personal-asset-cms/frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## 🌐 Deployment (Free)

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| [Vercel](https://vercel.com) | Frontend hosting | Free forever |
| [Render.com](https://render.com) | Backend hosting | Free (sleeps after 15min) |
| [Neon.tech](https://neon.tech) | PostgreSQL database | 0.5GB free forever |
| [Cloudinary](https://cloudinary.com) | File storage | 25GB free |

### Environment Variables (set in Render dashboard)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `JWT_SECRET` | Random secure string for JWT signing |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |
| `CORS_ALLOWED_ORIGINS` | Your Vercel frontend URL |
| `SPRING_PROFILES_ACTIVE` | Set to `prod` |

### Frontend Environment Variables (set in Vercel dashboard)

| Variable | Value |
|----------|-------|
| `VITE_API_BASE` | Your Render backend URL (e.g. `https://valutcore-backend.onrender.com`) |

---

## 🔒 Security Model

- Files are **owned** by the uploader
- Owner can **share** files with other users as `READER` or `EDITOR`
- `READER` — can view and download
- `EDITOR` — can edit metadata and compress/extract
- Only the **owner** can delete or share a file
- All endpoints protected with `@PreAuthorize` using a custom `AssetSecurityEvaluator`

---

## 📁 Project Structure

```
personal-asset-cms/
├── src/main/java/com/personal/cms/
│   ├── controller/       # REST API controllers
│   ├── model/            # JPA entities
│   ├── repository/       # Spring Data repositories
│   ├── security/         # JWT filter, asset security evaluator
│   ├── service/          # Business logic, Cloudinary service
│   └── config/           # Security, Cloudinary, CORS config
├── src/main/resources/
│   ├── application.properties       # Local dev config
│   └── application-prod.properties  # Production config (env vars)
└── frontend/
    ├── src/
    │   ├── App.jsx       # Main React app
    │   └── index.css     # Premium dark UI styles
    └── .env.local        # Local frontend env (not committed)
```
