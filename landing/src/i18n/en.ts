export const en = {
  meta: { name: "English", short: "EN" },
  nav: {
    features: "Features",
    how: "How It Works",
    quick: "Quick Start",
    install: "Installation",
    faq: "FAQ",
    github: "View on GitHub",
    githubSoon: "GitHub repo coming soon — URL not configured yet",
    menu: "Menu",
    close: "Close",
  },
  hero: {
    badge: "Local-first MCP server · Built for OpenCode",
    headlineA: "Your past exams.",
    headlineB: "Your next advantage.",
    description:
      "Turn your lecture PDFs and previous exams into focused practice with Sentra, a local-first MCP server built for AI-powered studying.",
    primary: "Get Started",
    secondary: "See How It Works",
    note: "Free and open · Runs on your machine · No hosted backend",
  },
  what: {
    eyebrow: "What is Sentra?",
    title: "Your course files, readable by your AI agent.",
    body: "Sentra connects your local course materials to an AI agent through MCP. It helps the agent inspect lecture PDFs, analyze previous exams, and create practice exams based on the material you provide.",
    mcpTitle: "MCP in one line",
    mcpBody:
      "The Model Context Protocol (MCP) is an open standard that lets AI agents use external tools — like reading your PDFs. Sentra is one such tool.",
    notModelTitle: "Not a model",
    notModelBody:
      "Sentra is a tool your AI agent can use — it is not an AI model by itself. OpenCode plus your configured AI provider does the thinking.",
  },
  features: {
    eyebrow: "What can it do?",
    title: "Five tools. One study loop.",
    cards: [
      {
        title: "Analyze Lecture PDFs",
        points: ["Extract and inspect lecture content", "Work with local course files", "Surface relevant source material"],
      },
      {
        title: "Understand Previous Exams",
        points: [
          "Identify recurring topics and question types",
          "Examine structure and approximate difficulty",
          "Highlight patterns supported by your exams",
        ],
      },
      {
        title: "Generate Mock Exams",
        points: [
          "Generate original practice questions",
          "Configure length, types, and difficulty where supported",
          "Base questions on your course materials",
        ],
      },
      {
        title: "Create Answer Keys",
        points: ["Generate separate answers and explanations", "Include source references when available"],
      },
      {
        title: "Keep Files Local",
        points: [
          "Process documents on your machine where supported",
          "Save outputs locally",
          "External AI providers may receive submitted content and may charge for inference",
        ],
      },
    ],
    honest: { title: "No magic claims", body: "Every capability above is shipped and tested. Anything else is labeled upcoming — check the FAQ." },
  },
  how: {
    eyebrow: "How it works",
    title: "From scattered PDFs to a practice exam.",
    steps: [
      { title: "Install OpenCode", body: "Install OpenCode and configure a compatible AI provider." },
      { title: "Install Sentra", body: "Install Sentra and register the MCP server." },
      { title: "Add your files", body: "Put lecture PDFs and past exams into the course folder." },
      { title: "Analyze", body: "Ask the AI agent to analyze the materials." },
      { title: "Practice", body: "Request a mock exam and save the result." },
    ],
    folderTitle: "Your course folder looks like this",
  },
  demo: {
    eyebrow: "Example interaction",
    title: "Ask like a student. Get a study plan.",
    illustrative: "Illustrative demo — not connected to a live server",
    prompt:
      "Analyze these Operating Systems lectures and past exams, then generate a two-hour mock exam with an answer key.",
    steps: ["Inspecting files…", "Analyzing available exams…", "Generating questions…", "Producing the mock exam…"],
    done: "output/os_mock_exam.md + os_mock_answers.md saved locally",
    replay: "Replay",
  },
  quickstart: {
    eyebrow: "Zero setup",
    title: "Copy one prompt. OpenCode does the rest.",
    body1:
      "Skip the steps below. Copy the prompt, paste it into OpenCode, and the agent will download Sentra, install it, configure everything on your machine, and verify it works.",
    body2: "Nothing is uploaded anywhere — everything runs on your computer.",
    promptLabel: "Paste into OpenCode",
  },
  install: {
    eyebrow: "Installation guide",
    title: "Up and running in seven steps.",
    steps: [
      { title: "Prerequisites", body: "You need Miniconda (or Anaconda) and about 10 minutes. Python 3.11 is installed automatically inside the conda environment." },
      { title: "Download Sentra", body: "Clone or download the Sentra repository to your machine, then open a terminal in that folder." },
      { title: "Create the Python environment", body: "Run each command below. One environment named mcp, one workflow — nothing else to choose." },
      { title: "Configure OpenCode", body: "Copy this block into your OpenCode config file (opencode.json). Replace both absolute paths with your own. Never put API keys here." },
      { title: "Set up folders", body: "Create this structure anywhere you like and point SENTRA_COURSE_DIR at it. PDF only in this version." },
      { title: "Verify & first run", body: "Run the checks, open OpenCode in your course folder, and try the first-run prompt." },
      { title: "Troubleshooting", body: "If something fails, find your symptom below before reinstalling anything." },
    ],
    copy: "Copy command",
    copied: "Copied!",
    firstRunPrompt: "Analyze the previous exams and summarize the professor's question patterns.",
    checklistTitle: "Installation success checklist",
    checklist: [
      "uv run pytest -q prints 26 passed",
      "sentra appears in opencode mcp list",
      "list_course_pdfs shows your lectures and past exams",
      "First mock exam + answer key saved under output/",
    ],
    nav: { prev: "Previous", next: "Next", stepOf: "Step" },
    troubleshooting: [
      { s: "Course directory does not exist", f: "Create the folder or set SENTRA_COURSE_DIR to an existing absolute path." },
      { s: "Access denied … escapes the course directory", f: "Use lectures/x.pdf-style relative paths only." },
      { s: "Tools missing in OpenCode", f: "Run opencode mcp list; check the absolute --directory path; re-run uv sync; restart OpenCode." },
      { s: "insufficient_text: true", f: "That PDF is scanned images. OCR is out of scope — use a text-based export." },
    ],
    docsNote: "Reference docs:",
    opencodeDocs: "OpenCode MCP servers",
    mcpSdk: "MCP Python SDK",
  },
  faq: {
    eyebrow: "FAQ",
    title: "Honest answers, before you ask.",
    items: [
      { q: "What is MCP?", a: "The Model Context Protocol is an open standard that lets AI apps use external tools. Sentra is an MCP server: it exposes your course files and exam helpers as tools an agent (like OpenCode) can call." },
      { q: "Does Sentra replace OpenCode?", a: "No. OpenCode is the AI client where you chat; Sentra is the tool it calls to read PDFs, analyze exams, and save files. You need both." },
      { q: "Do I need to pay to use Sentra?", a: "Sentra itself is free and makes no model calls. But the AI provider you configure in OpenCode may charge for inference — OpenCode being free does not mean all inference is free." },
      { q: "Do I need an API key?", a: "Sentra needs no keys at all. Whether you need one depends on the AI provider you choose in OpenCode — many require an API key, some local models don't." },
      { q: "Are my files uploaded to a server?", a: "Sentra processes and saves everything on your machine and uploads nothing itself. But if your OpenCode model is cloud-hosted, the content you ask it about is sent to that provider. Local processing does not guarantee content stays local." },
      { q: "Does it work with Arabic course materials?", a: "Text extraction works for any language the PDF encodes as text, including Arabic. Analysis quality depends on the material and the model you use." },
      { q: "Can it predict my professor's actual exam?", a: "No. Sentra finds patterns in past exams and writes original practice questions. It cannot guarantee what will appear on a real exam — treat everything as practice." },
      { q: "What should I do if a PDF cannot be read?", a: "Check whether it's scanned images (you can't select text). OCR is out of scope for now — export or print the file to a text-based PDF and try again." },
      { q: "How do I report a bug or contribute?", a: "Open an issue or pull request on the GitHub repository with your OS, Python version, the command you ran, and the full error message. Never attach private course materials." },
    ],
  },
  cta: {
    title: "Ready to study smarter?",
    primary: "Get Started",
    secondary: "View on GitHub",
  },
  footer: {
    tagline: "A local-first MCP server for mock exams. Your files stay yours.",
    install: "Installation guide",
    github: "GitHub",
    contribute: "Contribute",
    providerNote: "Requires OpenCode with a compatible AI provider — provider inference may be billed separately.",
  },
};

export type Dict = typeof en;
