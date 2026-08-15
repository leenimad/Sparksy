# 🚀 Sparksy: Universal AI Project Incubator & Agile Workspace

**Sparksy** is an enterprise-grade, AI-powered project incubation and agile development workspace designed to transform abstract ideas into structured technical architectures, prerequisite toolkits, and interactive Scrum boards.

Unlike traditional passive video courses, Sparksy is built on **Project-Based Learning & Prototyping**. It acts as an AI Lead System Architect and Product Strategist, breaking down any technical, creative, or entrepreneurial concept into actionable roadmaps, sub-task checklists, and on-demand starter code boilerplates.

---

## 🌟 The Three Core Pillars

### 📋 Pillar 1: The Project Blueprint (LEARN)
* **AI Strategic Scoping:** Powered by Google Gemini 1.5 Flash to generate executive project overviews, success strategies, and estimated timeframes.
* **Prerequisite Toolkit Badges:** Parses required tools into interactive badges. Click a tool's text to trigger a contextualized Google search; click the checkbox to toggle and persist your ownership in your database-backed **Toolbox**.
* **Linear Roadmap Checklist:** A clean, sequential timeline displaying progressive steps before jumping into task management.
* **Branded PDF Client Exporter:** Compiles the entire strategic overview, toolkit, and roadmap into a multi-page, branded PDF scoping report using **`jsPDF`** with automatic page-break calculations.

### 🗂️ Pillar 2: The Interactive Workspace Board (CREATE)
* **Native HTML5 Drag-and-Drop:** Built using lightweight, native browser Drag-and-Drop APIs with zero bloated external dependencies.
* **Tactile Physics & Animations:** Custom CSS keyframes for spring-like "bouncing landing pops" on card drops and breathing boundary glows on active drop columns.
* **Bi-Directional State Machine:** Enforces strict sequential roadmap progression (users cannot skip steps forward, and cannot retract completed steps backward unless subsequent tasks are cleared).
* **AI Sub-Task Checklists:** Every task contains 3 granular, checkable micro-action items synced directly to MongoDB.
* **Task AI Co-Pilot & Document Studio:** Generates on-demand starter code, file configurations (e.g. `.prisma`, `.js`, `.md`), or templates with a split-screen wide modal and direct browser **Blob file downloads**.

### 🛒 Pillar 3: Finished Product Marketplace (MONETIZE)
* **Digital Asset & Deliverable Store:** Creators don't just share checklists—they list finished products with **Live Demo Previews**, **Source Code/Download Links**, and **"What's Included"** tags.
* **Flexible Pricing Options:** Creators can publish items as **Free Community Assets ($0)** or **Paid Premium Products** with custom pricing.
* **In-App Checkout & Stripe Integration:** Features an in-app order summary breakdown and payment interface that unlocks direct asset access and clones the development roadmap upon purchase.
* **Ownership & Anti-Duplicate Guards:** Detects already-owned items and displays a green **`✓ Owned`** badge with a direct **`Open Workspace`** button instead of duplicate purchase prompts.

---

## 🛡️ Enterprise Security & Role-Based Access Control (RBAC)

* **Role-Based Access Control:** Strict authorization layer distinguishing between **`builder`** and **`admin`** roles across both the API middleware and frontend navigation.
* **Admin Control Panel (`/dashboard/admin`):** Dedicated administration view featuring global platform metrics (Total Users, Active Workspaces, Public Blueprints) and user role management tables.
* **Admin Marketplace Moderation:** Administrators possess special moderation permissions to unpublish or delete flagged community blueprints directly from the public feed.
* **JWT Cookie Authentication:** Cryptographically signed JSON Web Tokens stored securely in browser cookies with Next.js server-edge middleware protection (`middleware.ts`).
* **Zod Payload Validation:** All request payloads are strictly validated on entry before reaching database controllers.
* **Cryptographic Password Resets:** Secure forgot/reset password workflow using SHA-256 tokens, 10-minute expiration timestamps, and **Resend API** transactional email integration.
* **Defensive AI Engineering:** Robust JSON sanitization algorithms to strip markdown backticks and handle LLM output aberrations gracefully.

---

## 📊 Analytics & Organization Systems

* **Agile Analytics Dashboard (`/dashboard/analytics`):** Real-time data visualization powered by **`recharts`**:
  * *Status Distribution Donut Chart:* Breakdown of `"To Do"`, `"In Progress"`, and `"Done"` tasks.
  * *Project Velocity Bar Chart:* Side-by-side comparison of completed vs remaining tasks.
  * *Role-Aware Metrics:* Displays personal productivity metrics for Builders and system-wide platform metrics for Administrators.
* **Global Tool Locker (`/dashboard/locker`):** Rule-based classification engine grouping tools into *Frontend & Design*, *Backend & Database*, and *Equipment & Materials* using collapsible animated accordions.
* **Left Sidebar Workspace Navigation:** Collapsible sidebar layout with Next.js 15 Route Groups `(workspace)`, icon-only minimized mode, and a sliding mobile drawer.
* **Dual Light/Dark Theme Engine:** Warm, eye-friendly Amber and Charcoal "Sparks" palette built natively with **Tailwind CSS v4** and **`next-themes`**.

---

## 🛠️ Tech Stack

### Frontend
* **Framework:** Next.js 15 (App Router) & React 19
* **Language:** TypeScript
* **Styling:** Tailwind CSS v4 (Class-selector dark mode overrides)
* **State & Networking:** Axios with global token interceptors, js-cookie
* **Data Visualization:** Recharts
* **Document Exporting:** jsPDF
* **Icons:** Lucide React

### Backend
* **Runtime:** Node.js & Express
* **Language:** TypeScript
* **Database:** MongoDB Atlas with Mongoose ORM
* **AI Engine:** Google Generative AI SDK (Gemini 1.5 Flash)
* **Validation:** Zod
* **Authentication:** JWT (JSON Web Tokens) & bcryptjs
* **Transactional Email:** Resend API

---

## 🗂️ Project Structure

```text
Sparksy/
├── frontend/                          # Next.js 15 App Router Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx               # Public Landing Page
│   │   │   ├── login/page.tsx         # Login & Forgot Password Modal
│   │   │   ├── register/page.tsx      # User Registration Page
│   │   │   ├── reset-password/        # Cryptographic Reset Password Route
│   │   │   └── dashboard/
│   │   │       ├── (workspace)/       # Nested Sidebar Layout Route Group
│   │   │       │   ├── layout.tsx     # Collapsible Left Sidebar & Mobile Drawer
│   │   │       │   ├── page.tsx       # Active Workspaces & AI Scoper Input
│   │   │       │   ├── locker/        # Categorized Collapsible Tool Locker
│   │   │       │   ├── marketplace/   # Public Template Store & In-App Checkout
│   │   │       │   ├── analytics/     # Recharts Velocity & Donut Charts
│   │   │       │   ├── admin/         # Admin Analytics & User Management
│   │   │       │   └── profile/       # Profile & Password Management
│   │   │       └── project/[id]/      # Full-Screen Interactive Kanban Board
│   │   ├── components/                # Reusable Organisms & Modals
│   │   │   └── ui/                    # Atomic Design Primitives (Button, Input, Card, Dialog, Toast)
│   │   ├── lib/api.ts                 # Axios Client with Auto-Auth Interceptors
│   │   └── middleware.ts              # Server-Side Next.js Route Protection
│   ├── .env.local
│   └── package.json
│
└── backend/                           # Express TypeScript REST API
    ├── src/
    │   ├── config/db.ts               # MongoDB Atlas Connection Helper
    │   ├── controllers/               # Auth, Projects, Payments, Admin Controllers
    │   ├── middleware/                # JWT Auth, Admin Guards, Global Error Handler, Zod Validator
    │   ├── models/                    # User & ProjectWorkspace Mongoose Schemas
    │   ├── routes/                    # API Route Definitions
    │   ├── utils/                     # AppError & Resend Transactional Email Utility
    │   ├── validations/               # Zod Schema Definitions
    │   └── server.ts                  # Express Server Entry Point
    ├── .env
    └── package.json
```

---

## 🔌 API Route Specifications

### Authentication & Profile (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/register` | Public | Register new user account |
| **POST** | `/login` | Public | Authenticate credentials and return JWT |
| **GET** | `/me` | Private | Get authenticated user profile & role |
| **GET** | `/toolbox` | Private | Retrieve user's global acquired tools |
| **PATCH** | `/toolbox` | Private | Toggle tool ownership in database |
| **PATCH** | `/profile` | Private | Update user name and email |
| **PATCH** | `/password` | Private | Verify current password and update new password |
| **POST** | `/forgot-password` | Public | Generate SHA-256 reset token & send email |
| **PUT** | `/reset-password/:token`| Public | Reset password using valid cryptographic token |

### Workspaces & AI Scoper (`/api/projects`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/generate` | Private | Call Gemini, scope project, and save to DB |
| **GET** | `/` | Private | Get active workspaces for logged-in user |
| **GET** | `/public` | Private | Get all public marketplace template products |
| **GET** | `/:id` | Private | Get single workspace (accessible if owner, public, or admin) |
| **PATCH** | `/:id/tasks/:taskId` | Private | Update task status (To Do, In Progress, Done) |
| **PATCH** | `/:id/tasks/:taskId/subtasks/:subtaskId` | Private | Toggle nested subtask completion status |
| **POST** | `/:id/tasks/:taskId/copilot` | Private | Generate AI boilerplate template for specific task |
| **PATCH** | `/:id/share` | Private | Toggle public marketplace listing & set pricing |
| **POST** | `/:id/clone` | Private | Clone public product directly to user's dashboard |
| **DELETE** | `/:id` | Private | Delete project workspace |

### Payments & Checkout (`/api/payments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/process-inapp-payment` | Private | Process in-app checkout transaction and unlock project |
| **POST** | `/create-checkout-session` | Private | Create official Stripe Hosted Checkout session |
| **POST** | `/verify-session` | Private | Verify Stripe payment session and unlock deliverables |

### Administrator Suite (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/stats` | Admin | Aggregate global user, project, and template counts |
| **GET** | `/users` | Admin | Get list of all registered platform users |
| **PATCH** | `/users/:userId/role` | Admin | Promote or demote user roles (`builder` $\leftrightarrow$ `admin`) |
| **GET** | `/analytics` | Admin | Get all platform workspaces for global velocity charts |

---

## ⚙️ Installation & Local Setup

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/Sparksy.git
cd Sparksy
```

### 2. Configure Backend
```bash
cd backend
npm install
```
Create a `.env` file inside `backend/`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string/sparksy
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:3000
RESEND_API_KEY=your_resend_api_key_optional
STRIPE_SECRET_KEY=your_stripe_test_secret_key_optional
```
Start backend:
```bash
npm run dev
```

### 3. Configure Frontend
```bash
cd ../frontend
npm install
```
Create a `.env.local` file inside `frontend/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```
Start frontend:
```bash
npm run dev
```
Open `http://localhost:3000` in your browser!

---

## 📄 License
This project is licensed under the MIT License.