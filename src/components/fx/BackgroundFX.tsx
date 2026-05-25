import { useEffect, useRef } from "react";

/** Cinematic background: animated grid, mesh gradient orbs, mouse-follow glow. */
export function BackgroundFX() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      el.style.setProperty("--mx", `${e.clientX}px`);
      el.style.setProperty("--my", `${e.clientY}px`);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 mesh-bg opacity-90" />
      <div className="absolute inset-0 grid-bg opacity-60" />
      {/* Floating orbs — tuned for light surface */}
      <div className="absolute top-[-10%] left-[-5%] h-[40rem] w-[40rem] rounded-full blur-3xl animate-orb"
        style={{ background: "radial-gradient(closest-side, oklch(0.62 0.2 165 / 0.25), transparent 70%)" }} />
      <div className="absolute bottom-[-15%] right-[-10%] h-[44rem] w-[44rem] rounded-full blur-3xl animate-float-slow"
        style={{ background: "radial-gradient(closest-side, oklch(0.6 0.22 295 / 0.22), transparent 70%)" }} />
      <div className="absolute top-1/3 right-1/4 h-[24rem] w-[24rem] rounded-full blur-3xl animate-orb"
        style={{ background: "radial-gradient(closest-side, oklch(0.58 0.2 220 / 0.2), transparent 70%)" }} />
      {/* Mouse spotlight */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), oklch(0.62 0.2 165 / 0.10), transparent 60%)",
        }}
      />
      {/* Subtle grain */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-multiply"
        style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.7'/></svg>\")" }} />
    </div>
  );
}
