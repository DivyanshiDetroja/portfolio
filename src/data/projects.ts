export type Project = {
  id: string;
  title: string;
  catchphrase: string;
  videoUrl?: string;
  size: "big" | "small";
  device: "pc" | "mobile";
  bullets: string[];
  github?: string;
  tech: string[];
};

// This file powers the project gallery. Add, edit, or remove entries here.
// Use `size: "big"` or `size: "small"` to control scale, and `device: "pc"` or `device: "mobile"` to control frame shape.
export const projects: Project[] = [
  {
    id: "diligence bot",
    title: "Diligence Bot",
    catchphrase: "Air-gapped investor dataroom Q&A.",
    videoUrl: "https://github.com/user-attachments/assets/861562f9-986e-486a-865c-1bc7646cb6e0",
    size: "big",
    device: "pc",
    bullets: [
      "Ask questions about confidential documents in plain English",
      "Get cited answers",
      "Verify sources at the exact line in GIDE",
      "Runs entirely offline",
    ],
    github: "https://github.com/DivyanshiDetroja/Git-Happens",
    tech: ["Python", "FastAPI", "rank-bm25", "llama-cpp-python (Qwen 2.5 1.5B Q4)", "Next.js"],
  },
  {
    id: "auditbee",
    title: "Audit Bee",
    catchphrase: "AI-native document intake for audit engagements.",
    videoUrl: "https://github.com/user-attachments/assets/e4512151-2261-417d-9ade-ff92a4d970ef",
    size: "big",
    device: "pc",
    bullets: [
      "AI-validates document type, fiscal year, and entity on upload",
  "Flags missing or mismatched files instantly",
  "One-click personalized follow-up email generation",
  "Zero data retention — client financials never stored",
    ],
    github: "https://github.com/DivyanshiDetroja/cpa-doc-tracker",
    tech: ["React", "TypeScript", "Anthropic API"],
  },
  
  {
    id: "geospatial",
    title: "Geospatial Telemetry Engine",
    catchphrase: "Real-time location tracking under pressure.",
    videoUrl: "https://github.com/user-attachments/assets/e27a8ed6-8fe3-413b-a4a4-460b1f5fdf31",
    size: "big",
    device: "pc",
    bullets: [
      "100+ simulated clients streaming live coordinates via WebSockets",
  "Redis GEOADD/GEOSEARCH for proximity detection and geofencing",
  "Local buffering on network drops — zero data loss on reconnect",
  "Configurable drop probability, fleet size, and bulk sync batch size",
    ],
    github: "https://github.com/DivyanshiDetroja/Real-time-Geospatial-Telemetry-Engine",
    tech: ["Python", "Fast API", "Redis Geohashing", "Streamlit UI"],
  },
  {
    id: "squeal",
    title: "Squeal",
    catchphrase: "The rats know everything about you.",
    videoUrl: "https://github.com/user-attachments/assets/8cfb3ceb-875b-4b45-998c-e2f96f7499c5",
    size: "big",
    device: "pc",
    bullets: [
      "Feed it a LinkedIn — get back a classified intelligence dossier",
  "The rats scraped it. The AI wrote it. You didn't ask questions.",
  "Built in 24hrs at Rat Pack Hack",
  "Apify for scraping, Claude for the briefing",
    ],
    github: "https://squeal.lovable.app/",
    tech: ["Lovable", "Apify"],
  },
//   {
//     id: "rage",
//     title: "Rage Typer",
//     catchphrase: "Type faster, or else.",
//     videoUrl: "https://www.loom.com/embed/e883f3ad9c9c4b9eaa20cfd71f235e95",
//     size: "small",
//     device: "pc",
//     bullets: [
//       "Typing tutor with escalating pressure mechanics",
//       "Heat-map of mistakes per finger",
//       "Built in a weekend, played for months",
//     ],
//     github: "https://github.com/",
//     tech: ["Vanilla JS", "Canvas"],
//   },
];
