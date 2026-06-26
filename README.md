# 🚀 Sparksy: Universal AI Project Incubator & Agile Workspace

Sparksy is a premium, AI-driven project-scoping and agile development workspace designed to help developers, creators, and freelancers turn abstract ideas into ready-to-build technical specifications, required toolkits, and interactive Scrum boards. 

Unlike traditional passive learning apps, Sparksy is built around **Project-Based Learning & Prototyping**. It acts as a Lead System Architect and Product Manager, instantly generating customized database schemas, action roadmaps, and custom task-specific boilerplates tailored to any project concept.

---

## 🎨 Visual Identity & Dual Themes
Sparksy features a warm, eye-friendly, glowing **Amber & Golden-Orange "Sparks" aesthetic** built natively with the latest **Tailwind CSS v4** specification. 
* **Light Theme:** Warm, responsive cream-stone (`bg-stone-50`).
* **Dark Theme:** High-contrast, sleek charcoal-stone (`bg-stone-950`).
* Fully responsive navigation and card elements built using custom-designed atomic UI primitives.

---

## 🧠 Core Features & Architecture

### 📋 Pillar 1: The Project Blueprint (LEARN)
* **AI Strategic Scoping:** Analyzes any loose concept (technical, creative, or entrepreneurial) and generates a dedicated success plan, recommended prerequisites, and estimated completion times.
* **Prerequisite Toolkit Badges:** Parses required tools into separate, hoverable badges. Click any tool badge to open a contextualized Google search in a new tab; click the checkbox to save it to your local **`localStorage`** inventory list.
* **Progressive Timeline Roadmap:** Displays a clean, vertical, non-intimidating checklist timeline before developers jump into task management.

### 🗂️ Pillar 2: The Interactive Task Board (CREATE)
* **Native HTML5 Drag-and-Drop:** Built using lightweight, native browser Drag-and-Drop APIs rather than bloated external packages. 
* **Tactile Animations:** Implements custom CSS keyframes for spring-like "bouncing landing pops" on drop, and soft breathing amber boundary glows on active columns.
* **Optimistic UI Synchronization:** Drag-and-drop state changes render instantly on-screen, syncing with the MongoDB database quietly in the background for a latency-free experience.
* **Bi-Directional State Validation:** Locks task progress via a rigid state-machine (e.g., users cannot skip steps forward, and cannot retract completed tasks backward unless subsequent tasks are cleared).
* **AI Sub-Task Checklists:** Every task contains 3 custom, AI-generated subtasks that can be individually completed inside the modal.
* **Task AI Co-Pilot:** Open any task card, click a button, and Gemini dynamically generates a detailed starter document, file configuration, or code boilerplate tailored specifically to that task.

### 🛒 Pillar 3: The Public Template Marketplace (MONETIZE) - *In Progress*
* An upcoming community hub allowing creators to publish completed, verified project boards to a public marketplace for other users to download, clone, or buy.

---

## 🛠️ The Tech Stack

### Frontend
* **Next.js 15 (App Router)** & **React 19**
* **TypeScript** (Strict, centralized model typings)
* **Tailwind CSS v4** (Modern CSS-first configuration and `@variant` selector dark mode)
* **next-themes** & **js-cookie** (Secure, server-side route-protection middleware)
* **Lucide React** (Crisp vector icons)

### Backend
* **Node.js** & **Express** (TypeScript environment)
* **MongoDB** & **Mongoose** (Relational user referencing and embedded subdocument arrays)
* **Google Generative AI SDK** (Gemini 1.5 Flash structured JSON generations)
* **Zod** (Strict schema validations on request payloads)
* **JSON Web Tokens (JWT)** & **bcryptjs** (Stateless authorization with secure HTTP cookies)

---

## 🗂️ Project Directory Structure

```text
Sparksy/
├── frontend/                  # Next.js 15 Client-Side Application
│   ├── src/
│   │   ├── app/               # App Router Pages (Home, Login, Register, Dashboard, Boards)
│   │   ├── components/        # Isolated organisms (Navbar, ScoperInput, BoardColumn, TaskCard)
│   │   │   └── ui/            # Reusable Design-System Primitives (Button, Input, Card, Dialog, Toast)
│   │   ├── lib/               # Global Axios Interceptor config
│   │   └── middleware.ts      # Server-side Route Protection Middleware
│   ├── .env.local             # Frontend Local Environment Keys
│   └── package.json
│
└── backend/                   # Express TypeScript REST API
    ├── src/
    │   ├── config/            # MongoDB Atlas configurations
    │   ├── controllers/       # Decoupled Controller Handlers (Auth, Projects, AI Co-Pilot)
    │   ├── middleware/        # JWT Protections, Global Error handlers, Zod Validators
    │   ├── models/            # Mongoose Schemas (User, ProjectWorkspace)
    │   ├── validations/       # Zod Schema Validator Models
    │   └── server.ts          # Express Main Server Entry Point
    ├── .env                   # Secure Database and AI secrets
    └── package.json
```

---

## 🔒 Security & Performance Highlights
* **HTTP-Only & Client-accessible Cookies:** JWT tokens are stored securely in browser cookies. Next.js middleware intercepts route requests on the server edge before pages begin to render, eliminating client-side flash-protection visual jumps.
* **Zod Validation Guardians:** All entry payloads (Email structures, password strengths, idea scoping lengths) are validated before ever hitting database controllers.
* **Global Express Error Boundaries:** Custom `AppError` utilities and `asyncHandler` wrappers completely decouple raw `try-catch` blocks from controller files, ensuring clean error propagation.
* **Asynchronous Database connection pools** and strict model validation.

---

## 🔌 API Route Specifications

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/register` | Public | Register a new User (hashes password, generates JWT) |
| **POST** | `/login` | Public | Authenticate credentials (returns details & JWT cookie) |

### Project Workspace Routes (`/api/projects`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/generate` | Private | Calls Gemini, scopes idea, and saves workspace to DB |
| **GET** | `/` | Private | Fetches all active project cards for the logged-in user |
| **GET** | `/:id` | Private | Retrieves a specific project blueprint and task list |
| **PATCH** | `/:id/tasks/:taskId` | Private | Updates task status (To Do, In Progress, Done) |
| **PATCH** | `/:id/tasks/:taskId/subtasks/:subtaskId` | Private | Toggles completion of a nested card subtask |
| **POST** | `/:id/tasks/:taskId/copilot` | Private | Calls Gemini to generate a task starter template |
| **DELETE** | `/:id` | Private | Permanently deletes a project workspace and all its tasks |

---

## ⚙️ Local Installation & Setup

### Prerequisites
* [Node.js](https://nodejs.org/) (v18.0 or higher)
* [MongoDB Atlas Account](https://www.mongodb.com/) (Cloud Cluster)
* [Google AI Studio Account](https://aistudio.google.com/) (Gemini API Key)

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/Sparksy.git
cd Sparksy
```

### 2. Configure Backend
1. Move to the backend directory:
   ```bash
   cd backend
   ```
2. Install all node packages:
   ```bash
   npm install
   ```
3. Create a `.env` file inside the `backend/` root folder:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string/sparksy
   JWT_SECRET=your_jwt_secret_key_string
   GEMINI_API_KEY=your_gemini_api_key_from_ai_studio
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### 3. Configure Frontend
1. Open a new terminal tab, navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file inside the `frontend/` root folder:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
5. Open your browser to `http://localhost:3000` and start scoping!
```