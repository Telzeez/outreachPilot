# OutreachPilot 🚀

OutreachPilot is a lightweight, AI-powered cold outreach automation tool built for independent founders and small teams. It streamlines lead management, generates highly personalized outreach drafts using LLMs, and manages your pipeline through an intuitive Kanban interface.

## ✨ Features

- **Automated AI Drafting**: Automatically drafts personalized outreach messages for new leads using your configured LLM provider.
- **Kanban Pipeline Board**: Drag-and-drop board to track leads from New → Contacted → Replied → Call Booked → Won/Lost.
- **Review & Approve Gate**: Strict approval system ensuring no AI-generated draft is ever sent without explicit human review.
- **SMTP Email Sending**: Connects directly to your own SMTP server (Gmail, Outlook, etc.) to send emails securely.
- **Weekly Digest**: Automated background workers send you a weekly summary of your pipeline's performance.
- **Mobile Responsive**: Fully optimized dashboard and list views for tracking leads on the go.

## 🛠️ Technology Stack

**Frontend:**
- Next.js (App Router)
- React Server Components
- Tailwind CSS

**Backend:**
- NestJS
- Postgres (Database)
- Redis & BullMQ (Background Workers & Queues)
- Drizzle ORM

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Postgres Database
- Redis Server

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Telzeez/outreachPilot.git
   cd outreachPilot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   - Create a `.env` file in the `apps/backend` folder with your `DATABASE_URL` and `REDIS_URL`.
   - Create a `.env.local` file in the `apps/frontend` folder and set `NEXT_PUBLIC_API_URL` to your backend URL (e.g., `http://localhost:3001`).

4. **Run Database Migrations:**
   ```bash
   npm run db:push --workspace=apps/backend
   ```

5. **Start the Development Servers:**
   ```bash
   npm run dev
   ```
   *This concurrently starts both the Next.js frontend (port 3000) and NestJS backend (port 3001).*

## 🌍 Deployment

OutreachPilot is structured as a monorepo and is pre-configured for modern hosting platforms:
- **Frontend**: Deploy to Vercel simply by linking the GitHub repository (the root `vercel.json` automatically handles routing to the frontend app).
- **Backend API**: Deploy to Railway. A `railway.toml` is included to automatically run builds and push database schema updates on startup.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).