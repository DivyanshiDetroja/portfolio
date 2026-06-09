import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import { projects, Project } from "../data/projects";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Divyanshi — 作品" },
      { name: "description", content: "A quiet gallery of selected work." },
      { property: "og:title", content: "Divyanshi — 作品" },
      { property: "og:description", content: "A quiet gallery of selected work." },
    ],
  }),
  component: Gallery,
});

type Item = { kind: "single"; x: number; project: Project };

const FRAME_CONFIG = {
  pc: {
    big: { w: 420, h: 280, gap: 300 },
    small: { w: 260, h: 170, gap: 220 },
  },
  mobile: {
    big: { w: 280, h: 420, gap: 280 },
    small: { w: 170, h: 280, gap: 200 },
  },
} as const;

const END_PADDING = 760;

function getFrameDimensions(project: Project) {
  return FRAME_CONFIG[project.device][project.size];
}

const ITEMS: Item[] = (() => {
  const items: Item[] = [];
  let x = 1500;

  for (const project of projects) {
    items.push({ kind: "single", x, project });
    const dims = getFrameDimensions(project);
    x += dims.w + dims.gap;
  }

  return items;
})();

const SCENE_WIDTH = ITEMS.length
  ? ITEMS[ITEMS.length - 1].x + getFrameDimensions(ITEMS[ITEMS.length - 1].project).w + END_PADDING
  : 5900;

function isLoomUrl(url?: string) {
  return typeof url === "string" && url.includes("loom.com/embed");
}

function getEmbedUrl(project: Project) {
  if (!project.videoUrl) {
    return "";
  }

  if (isLoomUrl(project.videoUrl)) {
    return `${project.videoUrl}?autoplay=1&muted=1&hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true&loop=1`;
  }

  return project.videoUrl;
}

function Gallery() {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const catRef = useRef<HTMLDivElement | null>(null);
  const [openProject, setOpenProject] = useState<Project | null>(null);
  const [viewportW, setViewportW] = useState(0);
  const lastScrollRef = useRef(0);
  const lastMoveTime = useRef(performance.now());
  const idleRef = useRef(false);
  const [, setTick] = useState(0); // force re-render for cat frame

  // Map vertical scroll -> horizontal translate
  useEffect(() => {
    const vw = window.innerWidth;
    setViewportW(vw);

    const update = () => {
      const scrollY = window.scrollY;
      lastScrollRef.current = scrollY;
      lastMoveTime.current = performance.now();
      idleRef.current = false;
      const scene = sceneRef.current;
      const cat = catRef.current;
      if (scene) {
        scene.style.transform = `translate3d(${-scrollY}px,0,0)`;
      }
      if (cat) {
        // Cat sits at ~22% of viewport from left, advances slightly within view as scroll progresses
        const progress = Math.min(1, scrollY / (SCENE_WIDTH - window.innerWidth));
        const catX = window.innerWidth * 0.18 + progress * window.innerWidth * 0.08;
        cat.style.transform = `translate3d(${catX}px,0,0)`;
      }
    };

    const onResize = () => {
      setViewportW(window.innerWidth);
      update();
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", onResize);
    update();
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Cat animation tick (walking frames + idle detection)
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const now = performance.now();
      if (now - lastMoveTime.current > 180) idleRef.current = true;
      setTick((t) => (t + 1) % 100000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Keyboard nav for modal
  const projectList = ITEMS.flatMap((it) =>
    it.kind === "single" ? [it.project] : [it.top, it.bottom]
  );
  const openByIndex = useCallback(
    (delta: number) => {
      if (!openProject) return;
      const idx = projectList.findIndex((p) => p.id === openProject.id);
      const next = projectList[(idx + delta + projectList.length) % projectList.length];
      setOpenProject(next);
    },
    [openProject, projectList]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!openProject) return;
      if (e.key === "Escape") setOpenProject(null);
      if (e.key === "ArrowRight") openByIndex(1);
      if (e.key === "ArrowLeft") openByIndex(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openProject, openByIndex]);

  // Page height so vertical scroll = scene width offset
  const pageHeight = SCENE_WIDTH - (viewportW || 1200) + (typeof window !== "undefined" ? window.innerHeight : 800);

  // Determine cat walking frame based on scroll position
  const walkFrame = Math.floor((lastScrollRef.current / 60)) % 8;
  const isIdle = idleRef.current;

  return (
    <>
      {/* Spacer that gives us scrollable height */}
      <div style={{ height: pageHeight }} aria-hidden="true" />

      {/* Fixed viewport overlay containing the scene */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          overflow: "hidden",
          backgroundColor: "#fafaf8",
        }}
      >
        {/* Floor strip */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: "26vh",
            backgroundColor: "#f0ead8",
          }}
        />

        {/* Top bar with kanji */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 20,
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              fontFamily: "'Cormorant Garamond', 'EB Garamond', Georgia, serif",
              fontSize: 12,
              letterSpacing: "6px",
              color: "#9a8878",
            }}
          >
            作品
          </span>
        </div>


        {/* The horizontally moving scene */}
        <div
          ref={sceneRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: SCENE_WIDTH,
            willChange: "transform",
          }}
        >
          {/* Entry / hero block */}
          <div
            style={{
              position: "absolute",
              left: 240,
              top: "38%",
              transform: "translateY(-50%)",
              width: 760,
            }}
          >
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', 'EB Garamond', Georgia, serif",
                fontWeight: 300,
                fontSize: 40,
                color: "#1a1410",
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              Divyanshi
            </h1>
            <div
              style={{
                marginTop: 18,
                height: 1,
                width: 120,
                backgroundColor: "#1a1410",
                opacity: 0.6,
              }}
            />
            <p
              style={{
                marginTop: 22,
                fontSize: 10,
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "#9a8878",
              }}
            >
              scroll to explore →
            </p>
          </div>

          {/* Spotlight pools + paintings */}
          {ITEMS.map((item, i) => (
            <SceneItem
              key={i}
              item={item}
              onOpen={(p) => setOpenProject(p)}
            />
          ))}

          {/* End-of-gallery breath */}
          <div
            style={{
              position: "absolute",
              left: SCENE_WIDTH - 600,
              top: "42%",
              transform: "translateY(-50%)",
              fontFamily: "'Cormorant Garamond', 'EB Garamond', Georgia, serif",
              fontSize: 14,
              color: "#9a8878",
              letterSpacing: "3px",
            }}
          >
            — end —
          </div>
        </div>

        {/* The cat — fixed in viewport, only translateX based on scroll progress */}
        <div
          ref={catRef}
          style={{
            position: "absolute",
            bottom: "calc(26vh - 6px)",
            left: 0,
            width: 90,
            height: 70,
            zIndex: 10,
            pointerEvents: "none",
            willChange: "transform",
          }}
        >
          <Cat frame={walkFrame} idle={isIdle} />
        </div>
      </div>

      {openProject && (
        <Modal
          project={openProject}
          onClose={() => setOpenProject(null)}
          onPrev={() => openByIndex(-1)}
          onNext={() => openByIndex(1)}
        />
      )}

      {/* Fonts */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=Inter:wght@400;500&display=swap"
      />
    </>
  );
}

function SceneItem({
  item,
  onOpen,
}: {
  item: Item;
  onOpen: (p: Project) => void;
}) {
  // wall is the area above the floor; center vertically on wall (~37% of viewport height)
  const wallCenterTop = "37vh";

  if (item.kind === "single") {
    const p = item.project;
    const { w, h } = getFrameDimensions(p);
    return (
      <>
        {/* Spotlight pool descending from ceiling onto painting */}
        <div
          style={{
            position: "absolute",
            left: item.x + w / 2 - 220,
            top: 0,
            width: 440,
            height: `calc(37vh - ${h / 2}px + 60px)`,
            background:
              "radial-gradient(ellipse 55% 90% at 50% 0%, #fff3b0 0%, rgba(255,243,176,0.5) 35%, rgba(255,243,176,0.18) 60%, rgba(255,243,176,0) 85%)",
            pointerEvents: "none",
          }}
        />
        <Painting
          x={item.x}
          y={wallCenterTop}
          w={w}
          h={h}
          project={p}
          onOpen={onOpen}
        />
      </>
    );
  }

  // pair: stacked medium frames
  const w = 220;
  const h = 290;
  const gap = 24;
  const pairTotal = h * 2 + gap;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: item.x + w / 2 - 220,
          bottom: "18vh",
          width: 440,
          height: 140,
          background:
            "radial-gradient(ellipse at center, #fff3b0 0%, rgba(255,243,176,0.35) 35%, rgba(255,243,176,0) 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: item.x,
          top: wallCenterTop,
          transform: `translateY(-${pairTotal / 2}px)`,
          width: w,
        }}
      >
        <Painting x={0} y={0} w={w} h={h} project={item.top} onOpen={onOpen} relative />
        <div style={{ height: gap }} />
        <Painting x={0} y={0} w={w} h={h} project={item.bottom} onOpen={onOpen} relative />
      </div>
    </>
  );
}

function Painting({
  x,
  y,
  w,
  h,
  project,
  onOpen,
  relative,
}: {
  x: number;
  y: number | string;
  w: number;
  h: number;
  project: Project;
  onOpen: (p: Project) => void;
  relative?: boolean;
}) {
  const [hover, setHover] = useState(false);

  const positionStyle: React.CSSProperties = relative
    ? { position: "relative", width: w, height: h }
    : {
        position: "absolute",
        left: x,
        top: y,
        transform: "translateY(-50%)",
        width: w,
        height: h,
      };

  return (
    <div
      style={{
        ...positionStyle,
        border: hover ? "3px solid #1a1410" : "3px solid #2a2218",
        backgroundColor: "#000",
        cursor: "pointer",
        transition: "border-color 200ms ease",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onOpen(project)}
    >
      {/* Video preview */}
      {isLoomUrl(project.videoUrl) ? (
        <iframe
          title={project.title}
          src={getEmbedUrl(project)}
          style={{
            width: "100%",
            height: "100%",
            border: 0,
            display: "block",
            pointerEvents: "none",
            filter: hover ? "blur(0.5px)" : "none",
          }}
          allow="autoplay"
        />
      ) : (
        <video
          title={project.title}
          src={project.videoUrl}
          style={{
            width: "100%",
            height: "100%",
            border: 0,
            display: "block",
            pointerEvents: "none",
            objectFit: "cover",
            filter: hover ? "blur(0.5px)" : "none",
          }}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      )}

      {/* Hover overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(255,252,240,0.88)",
          opacity: hover ? 1 : 0,
          transition: "opacity 220ms ease",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 400,
            fontSize: 16,
            color: "#1a1410",
          }}
        >
          {project.title}
        </div>
        <div
          style={{
            marginTop: 8,
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: 12,
            color: "#6b5e4e",
            maxWidth: 240,
            lineHeight: 1.4,
          }}
        >
          {project.catchphrase}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 14,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: 11,
            letterSpacing: "1px",
            color: "#1a1410",
          }}
        >
          open →
        </div>
      </div>
    </div>
  );
}

function Modal({
  project,
  onClose,
  onPrev,
  onNext,
}: {
  project: Project;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(20,16,14,0.45)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(1000px, 100%)",
          maxHeight: "86vh",
          backgroundColor: "#fafaf8",
          border: "1px solid #2a2218",
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          position: "relative",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 12,
            right: 14,
            background: "transparent",
            border: 0,
            fontSize: 18,
            color: "#1a1410",
            cursor: "pointer",
            lineHeight: 1,
          }}
        >
          ×
        </button>

        <div style={{ backgroundColor: "#000", aspectRatio: "16/10" }}>
          {isLoomUrl(project.videoUrl) ? (
            <iframe
              title={project.title}
              src={getEmbedUrl(project)}
              style={{ width: "100%", height: "100%", border: 0, display: "block" }}
              allow="autoplay; fullscreen"
            />
          ) : (
            <video
              title={project.title}
              src={project.videoUrl}
              style={{ width: "100%", height: "100%", border: 0, display: "block", objectFit: "cover" }}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            />
          )}
        </div>

        {/* Details */}
        <div
          style={{
            padding: "36px 36px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            overflow: "auto",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontWeight: 300,
              fontSize: 20,
              color: "#1a1410",
            }}
          >
            {project.title}
          </h2>
          <div style={{ height: 1, backgroundColor: "#1a1410", opacity: 0.5 }} />

          <ul
            style={{
              margin: 0,
              paddingLeft: 18,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: 13,
              color: "#1a1410",
              lineHeight: 1.55,
            }}
          >
            {project.bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>

          <div
            style={{
              display: "flex",
              gap: 18,
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: 12,
              color: "#1a1410",
            }}
          >
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#1a1410", textDecoration: "underline" }}
              >
                github
              </a>
            )}
          </div>

          <div style={{ flex: 1 }} />

          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {project.tech.map((t) => (
              <span
                key={t}
                style={{
                  fontFamily: "Inter, system-ui, sans-serif",
                  fontSize: 10,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  color: "#6b5e4e",
                  backgroundColor: "#f0ead8",
                  padding: "4px 8px",
                }}
              >
                {t}
              </span>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 6,
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: 11,
              color: "#9a8878",
              letterSpacing: "1px",
            }}
          >
            <button
              onClick={onPrev}
              style={{ background: "transparent", border: 0, color: "#9a8878", cursor: "pointer", padding: 0 }}
            >
              ← prev
            </button>
            <button
              onClick={onNext}
              style={{ background: "transparent", border: 0, color: "#9a8878", cursor: "pointer", padding: 0 }}
            >
              next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Minimal flat illustration of a black cat, walking cycle in SVG.
 * 8 frames driven by `frame` prop. When `idle`, legs settle and tail curls.
 */
function Cat({ frame, idle }: { frame: number; idle: boolean }) {
  // Walking cycle leg offsets (front-left, front-right, back-left, back-right)
  const cycle = [
    { fl: 0, fr: 4, bl: 4, br: 0 },
    { fl: 2, fr: 2, bl: 2, br: 2 },
    { fl: 4, fr: 0, bl: 0, br: 4 },
    { fl: 2, fr: 2, bl: 2, br: 2 },
    { fl: 0, fr: 4, bl: 4, br: 0 },
    { fl: -2, fr: 2, bl: 2, br: -2 },
    { fl: 4, fr: 0, bl: 0, br: 4 },
    { fl: 2, fr: 2, bl: 2, br: 2 },
  ];
  const f = idle ? { fl: 0, fr: 0, bl: 0, br: 0 } : cycle[frame % 8];

  // Idle tail curl (subtle)
  const tailCurl = idle ? Math.sin(performance.now() / 700) * 6 : Math.sin(performance.now() / 250) * 3;

  // Blink occasionally when idle
  const blink = idle && Math.floor(performance.now() / 200) % 18 === 0;

  const color = "#0c0a08";

  return (
    <svg viewBox="0 0 120 90" width="100%" height="100%" style={{ overflow: "visible" }}>
      {/* Tail */}
      <path
        d={`M 18 50 Q 4 ${42 + tailCurl} 8 ${28 + tailCurl}`}
        stroke={color}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      {/* Body */}
      <ellipse cx="56" cy="52" rx="32" ry="14" fill={color} />
      {/* Back haunch */}
      <circle cx="34" cy="52" r="14" fill={color} />
      {/* Head */}
      <circle cx="86" cy="42" r="14" fill={color} />
      {/* Ears */}
      <polygon points="76,32 78,22 84,30" fill={color} />
      <polygon points="94,30 92,20 88,30" fill={color} />
      {/* Eye */}
      {blink ? (
        <line x1="90" y1="42" x2="96" y2="42" stroke="#f0ead8" strokeWidth="1.2" />
      ) : (
        <circle cx="93" cy="41" r="1.4" fill="#f0ead8" />
      )}
      {/* Nose hint */}
      <circle cx="99" cy="44" r="0.9" fill="#f0ead8" opacity="0.6" />

      {/* Legs — back pair */}
      <rect x="26" y={60 + f.bl} width="5" height="14" rx="2" fill={color} />
      <rect x="40" y={60 + f.br} width="5" height="14" rx="2" fill={color} />
      {/* Legs — front pair */}
      <rect x="70" y={60 + f.fl} width="5" height="14" rx="2" fill={color} />
      <rect x="82" y={60 + f.fr} width="5" height="14" rx="2" fill={color} />
    </svg>
  );
}
