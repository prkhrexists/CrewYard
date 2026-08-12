// ─────────────────────────────────────────────────────────────
//  mockUsers
// ─────────────────────────────────────────────────────────────
export const mockUsers = [
  {
    id: "u1",
    username: "prkhr_exists",
    name: "Prakhar Jaiswal",
    college: "NMIMS MPSTME Shirpur",
    year: 2,
    major: "Computer Science",
    githubVerified: true,
    reputation: 1420,
    commitsThisWeek: 34,
    commitsChangePercent: 12,
    topLanguage: "Python",
    topLanguagePercent: 64,
    joinedDate: "2024-08-15",
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=prkhr_exists",
  },
  {
    id: "u2",
    username: "priya_builds",
    name: "Priya Nair",
    college: "BITS Pilani",
    year: 4,
    major: "Computer Science",
    githubVerified: true,
    reputation: 2105,
    commitsThisWeek: 51,
    commitsChangePercent: 28,
    topLanguage: "Python",
    topLanguagePercent: 72,
    joinedDate: "2024-06-01",
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=priya_builds",
  },
  {
    id: "u3",
    username: "rohan_ml",
    name: "Rohan Gupta",
    college: "IIT Bombay",
    year: 2,
    major: "Electrical Engineering",
    githubVerified: false,
    reputation: 340,
    commitsThisWeek: 8,
    commitsChangePercent: -5,
    topLanguage: "Python",
    topLanguagePercent: 89,
    joinedDate: "2025-01-10",
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=rohan_ml",
  },
  {
    id: "u4",
    username: "divya_fs",
    name: "Divya Krishnan",
    college: "VIT Vellore",
    year: 3,
    major: "Information Technology",
    githubVerified: true,
    reputation: 870,
    commitsThisWeek: 22,
    commitsChangePercent: 9,
    topLanguage: "JavaScript",
    topLanguagePercent: 58,
    joinedDate: "2024-09-20",
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=divya_fs",
  },
  {
    id: "u5",
    username: "karan_hacks",
    name: "Karan Mehta",
    college: "IIIT Hyderabad",
    year: 4,
    major: "Computer Science",
    githubVerified: true,
    reputation: 1750,
    commitsThisWeek: 63,
    commitsChangePercent: 41,
    topLanguage: "Go",
    topLanguagePercent: 47,
    joinedDate: "2024-03-05",
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=karan_hacks",
  },
  {
    id: "u6",
    username: "sneha_404",
    name: "Sneha Reddy",
    college: "PESIT Bangalore",
    year: 2,
    major: "Computer Science",
    githubVerified: false,
    reputation: 210,
    commitsThisWeek: 5,
    commitsChangePercent: 2,
    topLanguage: "Java",
    topLanguagePercent: 70,
    joinedDate: "2025-03-18",
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=sneha_404",
  },
  {
    id: "u7",
    username: "arjun_dev",
    name: "Arjun Sharma",
    college: "NIT Trichy",
    year: 3,
    major: "Computer Science",
    githubVerified: true,
    reputation: 1420,
    commitsThisWeek: 34,
    commitsChangePercent: 12,
    topLanguage: "TypeScript",
    topLanguagePercent: 64,
    joinedDate: "2024-08-15",
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=arjun_dev",
  },
];

// ─────────────────────────────────────────────────────────────
//  mockAsks
// ─────────────────────────────────────────────────────────────
export const mockAsks = [
  {
    id: "a1",
    type: "help",
    title:
      "Razorpay webhook signature verification failing in Next.js App Router — 400 every time",
    details: `I'm integrating Razorpay payments in my Next.js 14 App Router project.
The checkout works fine, but the webhook keeps returning 400 with "Invalid signature".

My route handler in /app/api/webhooks/razorpay/route.ts reads the raw body using
\`request.text()\`, then does:
\`\`\`ts
const body = await req.text();
const signature = req.headers.get('x-razorpay-signature');
const isValid = validateWebhookSignature(body, signature, process.env.RAZORPAY_WEBHOOK_SECRET);
\`\`\`

The secret is correct (copy-pasted from dashboard). Tried with both \`req.text()\`
and \`req.json()\` — same result. Any idea what's going wrong?`,
    tags: ["next.js", "razorpay", "payments", "webhook", "app-router"],
    authorId: "u7",
    createdAt: "2025-08-10T09:14:00Z",
    commitsThisMonth: 47,
    commentCount: 6,
    likeCount: 23,
    saved: false,
  },
  {
    id: "a2",
    type: "teammate",
    title:
      "Looking for 1 ML + 1 Frontend dev for SIH 2025 — Smart Agriculture (PS AA1437)",
    details: `Our team of 4 (2 backend, 1 DevOps, 1 designer) is working on SIH 2025
problem statement AA1437 — "AI-based crop disease detection from drone imagery".

We need:
• 1 ML engineer (PyTorch/YOLO experience preferred, even basic CNN fine-tuning works)
• 1 React/Next.js dev for the dashboard UI (real-time alerts, map integration)

Timeline: internal submission Sep 5. We have the dataset, cloud credits (AWS Educate),
and a mentor from ICAR lined up. Active team, daily standups on Discord.

Ping if interested. NIT/IIT/BITS/IIIT preferred but open to anyone with solid GitHub.`,
    tags: ["SIH2025", "machine-learning", "react", "agriculture", "hackathon"],
    authorId: "u5",
    createdAt: "2025-08-09T14:30:00Z",
    commitsThisMonth: 31,
    commentCount: 14,
    likeCount: 55,
    saved: true,
  },
  {
    id: "a3",
    type: "build_log",
    title:
      "Shipped: Campus Lost & Found — built in a weekend, 200+ active users at VIT",
    details: `Idea came after I lost my laptop charger in the library and spent 3 hours
searching. Built a full-stack Lost & Found board for campus.

**Stack:** Next.js 14 + Supabase + shadcn/ui + Cloudinary (image uploads)
**Auth:** Supabase Auth with college email whitelisting (@vit.ac.in only)
**Deploy:** Vercel (free tier, holds up fine for campus scale)

Weekend breakdown:
- Fri night: DB schema, Supabase setup, auth
- Sat: UI (post item, browse feed, search/filter by category + location)
- Sun: Image upload, mobile responsiveness, deployed by 11pm

Hardest part: real-time "claimed" status without websockets. Solved with Supabase
Realtime — 3 lines of code, worked first try.

Link: campuslost.vercel.app (VIT login required) | GitHub: github.com/divya_fs/campus-lost`,
    tags: ["next.js", "supabase", "shipped", "build-log", "campus-tool"],
    authorId: "u4",
    createdAt: "2025-08-07T18:00:00Z",
    commitsThisMonth: 58,
    commentCount: 28,
    likeCount: 112,
    saved: false,
  },
  {
    id: "a4",
    type: "help",
    title: "Prisma + PlanetScale — 'P1001: Can't reach database server' only in Vercel prod",
    details: `Works perfectly on localhost. The env vars are set correctly in Vercel (triple-checked).
Prisma schema has \`provider = "mysql"\` and I'm using \`@planetscale/database\` as the driver.

Error in Vercel logs:
\`PrismaClientInitializationError: Can't reach database server at 'aws.connect.psdb.cloud:3306'\`

Things I tried:
1. Toggled connection pooling on/off in PlanetScale
2. Used the \`?sslaccept=strict\` flag in DATABASE_URL
3. Switched from Edge runtime to Node.js runtime for the API routes

Still broken. Is this a Vercel region thing? My PlanetScale DB is in AWS ap-south-1.`,
    tags: ["prisma", "planetscale", "vercel", "mysql", "deployment"],
    authorId: "u7",
    createdAt: "2025-08-08T11:00:00Z",
    commitsThisMonth: 29,
    commentCount: 9,
    likeCount: 18,
    saved: false,
  },
  {
    id: "a5",
    type: "teammate",
    title: "GSoC 2026 contributor buddy wanted — planning to apply to MLflow / Hugging Face",
    details: `I'm a 2nd-year CS student who wants to seriously prepare for GSoC 2026.
Planning to target MLflow or Hugging Face (open to suggestions).

Looking for a study/accountability buddy or a small group (2-3 people) who:
- Also planning GSoC 2026
- Can do weekly sync-ups (1hr, weekends work best IST)
- Comfortable reading open-source code and filing issues

I have basic ML knowledge (Andrew Ng's course done, working through fast.ai now).
No prior OSS contribution — that's the gap I want to close before December.`,
    tags: ["GSoC2026", "open-source", "machine-learning", "accountability", "study-group"],
    authorId: "u3",
    createdAt: "2025-08-06T16:45:00Z",
    commitsThisMonth: 12,
    commentCount: 21,
    likeCount: 67,
    saved: false,
  },
  {
    id: "a6",
    type: "build_log",
    title: "Built an AI mock interview CLI for placement prep — 3 weeks, now OSS",
    details: `Placement season stress-built this over 3 weeks. It's a CLI tool that simulates
DSA + HR rounds using the OpenAI API.

**How it works:**
1. You pick difficulty + topic (arrays, DP, graphs, etc.)
2. GPT-4o acts as interviewer — asks the question, waits for your approach
3. You type/paste your code, it evaluates time complexity, gives hints, scores you

**Tech:** Python + Typer CLI + OpenAI SDK + Rich (for pretty terminal output)
**Cost:** ~$0.03 per mock session with GPT-4o-mini

Just open-sourced it. 80 stars in 48 hours on GitHub 🎉
Would love feedback + contributors — especially for adding voice input support.

GitHub: github.com/karan_hacks/mockmate`,
    tags: ["python", "openai", "cli", "placement-prep", "open-source", "build-log"],
    authorId: "u5",
    createdAt: "2025-08-05T20:00:00Z",
    commitsThisMonth: 74,
    commentCount: 44,
    likeCount: 198,
    saved: true,
  },
  {
    id: "a7",
    type: "help",
    title:
      "React useEffect firing twice in dev mode — is my API getting double-called intentionally?",
    details: `I know React 18 strict mode calls useEffect twice in dev, but my POST request
is being sent twice and creating duplicate DB records. I'm using \`useEffect\` to
trigger a "mark notification as read" API call on component mount.

How do I handle cleanup properly here? The cleanup function doesn't make sense
for a POST that already fired. Is the recommended pattern to use a ref flag?

\`\`\`js
useEffect(() => {
  markAsRead(notificationId); // POST — fires twice in dev
}, [notificationId]);
\`\`\``,
    tags: ["react", "useEffect", "strict-mode", "hooks", "beginner"],
    authorId: "u6",
    createdAt: "2025-08-04T08:30:00Z",
    commitsThisMonth: 7,
    commentCount: 11,
    likeCount: 34,
    saved: false,
  },
  {
    id: "a8",
    type: "teammate",
    title:
      "Team forming for HackWithInfy 2025 — need a backend dev (Node/Express/SQL)",
    details: `Forming a team for HackWithInfy 2025 (Infosys national hackathon, theme: Sustainable Tech).

Current team: 2 frontend devs (React), 1 designer
Missing: 1 backend dev comfortable with Node.js + Express + PostgreSQL or MySQL

Project idea: A "carbon footprint tracker" for college students — tracks food choices,
commute, and e-waste habits. Backend needs REST API + auth + a simple recommendations engine.

Eligibility: Pre-final year or final year UG students only (as per Infosys rules).
Reach out with your GitHub — we'd love to see any prior backend projects.`,
    tags: ["HackWithInfy", "node.js", "express", "postgresql", "hackathon", "teammate"],
    authorId: "u2",
    createdAt: "2025-08-03T13:15:00Z",
    commitsThisMonth: 19,
    commentCount: 8,
    likeCount: 41,
    saved: false,
  },
  {
    id: "a9",
    type: "build_log",
    title:
      "Shipped: Real-time collaborative whiteboard for online tuitions — solo project",
    details: `My younger sister takes online tuitions and the teacher shares their screen
to write on a digital whiteboard. The lag was unbearable. Built a fix.

**Stack:** Next.js + Socket.io + Canvas API + Tailwind
**Features:** Multi-user drawing, room codes, eraser, color picker, undo (client-side)
**Hosting:** Render.com free tier (spins down — added a keep-alive ping via cron)

Toughest challenge: syncing canvas state for late-joiners. Solved by replaying
a compressed event log on join (not ideal for long sessions, but works for 1hr classes).

Not monetizing — sharing freely with teacher communities. DM if you want the link.`,
    tags: ["next.js", "socket.io", "canvas", "real-time", "edtech", "build-log", "shipped"],
    authorId: "u2",
    createdAt: "2025-08-01T21:00:00Z",
    commitsThisMonth: 66,
    commentCount: 35,
    likeCount: 143,
    saved: false,
  },
  {
    id: "a10",
    type: "build_log",
    title: "Built FORGE — Autonomous Career Intelligence Platform (Multi-Agent AI)",
    details: `I developed FORGE, a multi-agent AI system for resume analysis and career recommendations.

**Key Features:**
- Automated ATS optimization using GitHub verification and job-description matching.
- Built using Python, LLMs, GitHub REST API, and Streamlit.
- Uses a RAG architecture with LangChain for deep insights.

The system significantly reduces the time taken to optimize resumes for specific job descriptions while verifying skills directly from GitHub commits. Open to feedback on the multi-agent orchestration!`,
    tags: ["python", "llms", "streamlit", "multi-agent", "build-log"],
    authorId: "u1",
    createdAt: "2025-08-10T09:14:00Z",
    commitsThisMonth: 47,
    commentCount: 6,
    likeCount: 23,
    saved: false,
  },
  {
    id: "a11",
    type: "teammate",
    title: "Looking for 1 Embedded Systems dev for Autonomous Drone Infrastructure Inspection System",
    details: `Our team is finalizing an autonomous drone pipeline for real-time infrastructure defect detection, and we need someone with strong embedded systems experience.

**Stack:**
- ROS 2 & Docker for the drone software stack
- YOLOv8s for real-time defect detection
- FastAPI for the backend services
- Next.js for the live mission dashboard

**Your Role:**
Help us optimize the hardware-software integration on the drone side. Experience with Pixhawk, ArduPilot, or similar flight controllers is highly preferred. 

DM if you have experience with ROS 2 and hardware!`,
    tags: ["ros2", "yolov8", "fastapi", "next.js", "docker", "teammate"],
    authorId: "u1",
    createdAt: "2025-08-08T11:00:00Z",
    commitsThisMonth: 29,
    commentCount: 9,
    likeCount: 18,
    saved: false,
  },
  {
    id: "a12",
    type: "help",
    title: "YOLOv8 latency spikes on edge device — RESQ LIVE OPS (Real-Time AI Perception System)",
    details: `I'm integrating Gemini AI and YOLOv8 for real-time incident summaries and operational decision support on an edge device (Jetson Nano).

**Tech Stack:**
- YOLOv8 for object detection
- Python & OpenCV for video stream processing
- Streamlit for the operational interface
- Gemini AI for real-time context and incident summaries

I've managed to optimize the YOLOv8 inference, reducing latency by 40%, but I'm still seeing occasional latency spikes that disrupt the real-time feed. Has anyone successfully deployed YOLOv8 on a Jetson Nano without these hiccups? Would love some advice on TensorRT optimization.`,
    tags: ["yolov8", "python", "opencv", "gemini-ai", "streamlit", "help"],
    authorId: "u1",
    createdAt: "2025-08-04T08:30:00Z",
    commitsThisMonth: 7,
    commentCount: 11,
    likeCount: 34,
    saved: false,
  }
];

// ─────────────────────────────────────────────────────────────
//  mockStats
// ─────────────────────────────────────────────────────────────
export const mockStats = {
  activeBuilders: 8420,
  questionsAnswered: 14307,
  teamsFormed: 632,
  collegesCount: 219,
};
