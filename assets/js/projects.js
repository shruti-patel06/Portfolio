/* Case-study content for each project, shown in the project dialog. */
window.PROJECTS = {
  ayuguard: {
    meta: "Hackathon · Top 10 in APAC",
    title: "AyuGuard",
    tldr: "An AI caregiving assistant for families looking after elderly relatives. Caregivers describe symptoms the way they'd tell a relative, and AyuGuard keeps two weeks of history to tell them when a pattern is worth a doctor visit.",
    rows: [
      ["Problem", "Caregivers notice small symptoms every day but can't easily tell when they add up to something serious. A chat assistant that judges each message on its own misses the pattern."],
      ["How it works", "A Google ADK orchestrator on Gemini 2.5 Flash-Lite turns each message into structured symptoms and stores them. It weighs the last 14 days of logs, with older entries counting less, and matches them against 41 conditions from a 4,920-record clinical dataset using severity-weighted similarity."],
      ["Key decision", "The model never decides urgency; a fixed formula does. It weighs pattern match at 50%, how long symptoms have lasted at 30% and severity at 20%. A score of 0.65 or more suggests a doctor visit, 0.42 or more means keep watching, and each alert has a 48-hour cooldown so families aren't flooded."],
      ["Also built", "Care-plan updates that reconcile a chronic-condition diet with advice for a new illness. Medical-record upload, where Gemini reads PDFs and photos and labels the result as an AI-extracted summary. A daily care message in the patient's preferred language, and an MCP server for the patient profile."],
      ["Deployment", "Two Cloud Run services in asia-south1: the ADK agent, and a FastAPI server for the web app that streams chat replies. Data is kept in Firestore with a local JSON fallback, uploads in Cloud Storage and keys in Secret Manager."],
      ["Result", "Top 10 in APAC at the Gen AI Academy Hackathon (Hack2Skill × Google Cloud), in the track AI for Better Living and Smarter Communities. A solo entry."]
    ],
    code: "https://github.com/shruti-patel06/AyuGuard"
  },
  interview: {
    title: "Hire Ready",
    tldr: "Interview prep for a specific job. Give it the job description and your résumé, and it writes a prep report and a résumé PDF tailored to that role.",
    rows: [
      ["What you get", "A match score; technical and behavioural questions, each with what the interviewer is checking and a model answer; skill gaps rated low, medium or high; and a day-by-day preparation plan."],
      ["How it works", "An Express API reads the résumé PDF with pdf-parse and sends it to Gemini with the job description and a short self-description. The reply has to follow a JSON schema and pass Zod validation before the report is saved to MongoDB. Each user's past reports are listed newest first."],
      ["Tailored résumé", "A second Gemini call rewrites the résumé as HTML for the target job, and Puppeteer renders it to PDF."],
      ["Accounts", "JWT sign-in kept in a cookie. Logging out adds the token to a blacklist, so a copied token stops working."],
      ["Front end", "React with Vite and React Router, state in context and custom hooks, Axios for the API, styled with SCSS."],
      ["My role", "Solo: the API, prompts and schemas, and the React front end."]
    ],
    code: "https://github.com/shruti-patel06/Hire Ready"
  },
  clarify: {
    title: "ClarifyDB",
    tldr: "Text-to-SQL that asks before it guesses. When a question has more than one reasonable meaning, it asks which one you mean, then writes a read-only query.",
    rows: [
      ["Problem", "“Who is our best customer?” could mean most revenue or most orders. Plain text-to-SQL picks one silently and returns a confident answer that may be wrong."],
      ["How it works", "A checker looks for words like best, top and recent that are ambiguous for this schema and offers the possible meanings. The chosen meaning becomes a hint for the LLM, a Qwen model on Groq at temperature 0, which returns the SQL and an explanation as a validated Pydantic object."],
      ["Safety", "Only SELECT queries get through. The validator blocks INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE and GRANT."],
      ["Evaluation", "A script runs 10 questions, five clear and five ambiguous, with and without the clarification step, and checks that the SQL uses the aggregate each question needs."],
      ["Stack", "Python, PostgreSQL in Docker Compose with a customers, orders and payments schema, and two interfaces: a terminal app and a Streamlit web app."],
      ["My role", "Solo project, written with Claude Code (an AI coding assistant)."]
    ],
    code: "https://github.com/shruti-patel06/ClarifyDB"
  },
  ledger: {
    title: "Backend Ledger",
    tldr: "A banking-style back end for accounts and transfers, built so money can't be paid twice or quietly changed.",
    rows: [
      ["Design", "Balances are never stored. Each transfer writes a DEBIT and a CREDIT entry to a ledger whose entries can't be edited or deleted, and a balance is computed from those entries with a MongoDB aggregation."],
      ["Safe transfers", "Each transfer carries an idempotency key from the client, so a retried request can't pay twice. Transfers move through PENDING, COMPLETED, FAILED and REVERSED, and the ledger writes run in a MongoDB transaction that commits or rolls back as a whole."],
      ["Accounts", "JWT sign-in with a token blacklist on logout, bcrypt-hashed passwords, and a check that both accounts are active. A system user seeds starting funds, and Nodemailer sends email notifications."],
      ["Front end", "A small HTML, CSS and JavaScript dashboard to sign up, sign in, open accounts, send transfers and seed funds."],
      ["My role", "I built the API: the models, transfers, idempotency, balances, emails and logout. Claude Code later fixed a transfer authorization bug, added the dashboard and moved the API deploy to Render."]
    ],
    code: "https://github.com/shruti-patel06/Backend-Ledger"
  },
  algozenith: {
    meta: "Community · Core Team Member (UI/UX & Web)",
    title: "AlgoZenith VIEW’25",
    tldr: "The website for the first AlgoZenith chapter at Vignan's Institute of Engineering for Women, a campus club for DSA, competitive programming and hackathons.",
    rows: [
      ["What it is", "A multi-page site that introduces the club and its community of women in tech, shows its events and team, and gives students a way to get in touch."],
      ["Pages", "Home, Events, Team, Community and Contact, plus a 404 page. Events include the club's inaugural, a DSA and competitive programming session, a coding contest and a guest lecture."],
      ["Build", "React and TypeScript with Vite, React Router for pages, Tailwind CSS, and shadcn/ui components built on Radix."],
      ["My role", "Core Team Member (UI/UX & Web) on the founding team of the college's first AlgoZenith chapter: I designed and built the site, and helped run events like a coding contest and an ideathon."]
    ],
    code: "https://github.com/shruti-patel06/algozenith-view"
  },
  spotify: {
    title: "Spotify Backend",
    tldr: "The back end for a music-streaming app, with separate permissions for artists and listeners.",
    rows: [
      ["What it does", "Artists upload tracks and group them into albums. Listeners browse all songs, all albums and each album's tracks. Everyone can register, sign in and sign out."],
      ["How it works", "Express with MongoDB and Mongoose. The JWT carries the user's role, user or artist, and middleware checks it before protected routes. Uploads go through multer to an ImageKit folder."],
      ["My role", "Solo."]
    ],
    code: "https://github.com/shruti-patel06/Spotify-Backend"
  },
  social: {
    title: "Social Feed",
    tldr: "A small image-sharing app: post a photo with a caption and see everyone's posts in one feed.",
    rows: [
      ["How it works", "The React front end sends the image and caption to an Express endpoint. Multer holds the file in memory, the server uploads it to ImageKit, and MongoDB stores the image URL and caption. The feed page loads every post."],
      ["Front end", "React with Vite, React Router for the create-post and feed pages, and Axios for requests."],
      ["My role", "Solo."]
    ],
    code: "https://github.com/shruti-patel06/Social-Feed"
  },
  focus: {
    title: "Focus Shield",
    tldr: "A Chrome extension that notices when you drift to social media and reminds you what you're working toward.",
    rows: [
      ["What it does", "It tracks your time on YouTube, Instagram, Facebook, Twitter and TikTok and resets at midnight. You set a goal, such as an exam, interview, project deadline, new skill or fitness target, and a deadline."],
      ["The nudge", "On a distracting site, at most once every five minutes, it shows a message built from your goal, the days left and today's minutes on distracting sites. Ignore it for 30 seconds and the tab moves to a focus page that offers a 10-minute break, going back, or focus mode."],
      ["How it works", "A Manifest V3 service worker times tabs, keeps daily usage in chrome.storage and schedules the midnight reset with chrome.alarms. Messages come from templates, not an AI model."],
      ["My role", "Solo."]
    ],
    code: "https://github.com/shruti-patel06/Focus-Shield"
  }
};
