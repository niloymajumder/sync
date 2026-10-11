import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  Check,
  ChevronDown,
  Github,
  Menu,
  Music2,
  Plus,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
const logo = "/sync-logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sync — Move music at the speed of listening" },
      {
        name: "description",
        content:
          "Sync saves songs from YouTube and SoundCloud to your Spotify playlists in seconds.",
      },
      { property: "og:title", content: "Sync — Move music at the speed of listening" },
      {
        property: "og:description",
        content: "Hear it anywhere. Keep it forever. Sync your music in seconds.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const download = () => {
  fetch("/spotube-extension.zip")
    .then((response) => {
      if (!response.ok) throw new Error(`Download failed: ${response.status}`);
      return response.blob();
    })
    .then((blob) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "sync-extension.zip";
      link.click();
      URL.revokeObjectURL(link.href);
    })
    .catch((error) => alert(error.message));
};

const features = [
  {
    number: "01",
    icon: Zap,
    title: "One-click capture",
    description: "Sync reads what is playing in your active tab. No copy-pasting, no second search.",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Smart matching",
    description: "Titles get cleaned and matched to the right Spotify version, even when YouTube gets messy.",
  },
  {
    number: "03",
    icon: Plus,
    title: "Your playlists, faster",
    description: "Add to an existing playlist or create a new one without leaving the page you are listening on.",
  },
];

const steps = [
  ["Listen", "Find something worth keeping on YouTube or SoundCloud."],
  ["Sync", "Open Sync and let it identify the track instantly."],
  ["Keep", "Choose a playlist. It is yours on Spotify forever."],
];

function Index() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="sync-site min-h-screen overflow-hidden bg-[#08090a] text-white">
      <div className="pointer-events-none fixed inset-0 -z-0 opacity-60 [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:80px_80px]" />
      <div className="pointer-events-none fixed left-1/2 top-[-18rem] -z-0 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-[#a5ff12]/10 blur-[130px]" />

      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <a href="#" className="flex items-center gap-3" aria-label="Sync home">
          <img src={logo} alt="Sync" className="h-9 w-9 rounded-xl object-contain" />
          <span className="text-lg font-semibold tracking-[-0.04em]">Sync<span className="text-[#a5ff12]">.</span></span>
        </a>
        <div className="hidden items-center gap-8 text-sm text-white/55 md:flex">
          <a className="transition hover:text-white" href="#how-it-works">How it works</a>
          <a className="transition hover:text-white" href="#features">Features</a>
          <a className="transition hover:text-white" href="#install">Install</a>
        </div>
        <div className="hidden items-center gap-4 md:flex">
          <a className="text-sm text-white/55 transition hover:text-white" href="https://github.com" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <button onClick={download} className="rounded-full bg-[#a5ff12] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[#c2ff62]">
            Get Sync <ArrowDown className="ml-1 inline h-3.5 w-3.5" />
          </button>
        </div>
        <button className="rounded-lg p-2 md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? <X /> : <Menu />}
        </button>
        {menuOpen && (
          <div className="absolute left-5 right-5 top-20 rounded-2xl border border-white/10 bg-[#161817]/95 p-4 shadow-2xl backdrop-blur md:hidden">
            {["How it works", "Features", "Install"].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replaceAll(" ", "-")}`} onClick={() => setMenuOpen(false)} className="block border-b border-white/10 px-2 py-3 text-sm text-white/70 last:border-0">
                {item}
              </a>
            ))}
            <button onClick={download} className="mt-3 w-full rounded-full bg-[#a5ff12] py-3 text-sm font-semibold text-black">Get Sync</button>
          </div>
        )}
      </nav>

      <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 px-6 pb-28 pt-16 lg:grid-cols-[1.1fr_.9fr] lg:px-10 lg:pb-40 lg:pt-28">
        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#a5ff12]/25 bg-[#a5ff12]/10 px-3 py-1.5 text-xs text-[#c2ff62]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#a5ff12] shadow-[0_0_12px_#a5ff12]" />
            A better way to save what you hear
          </div>
          <h1 className="max-w-3xl text-[clamp(3.5rem,9vw,7.6rem)] font-medium leading-[.88] tracking-[-.085em]">
            Move music at the <span className="text-[#a5ff12]">speed</span> of listening.
          </h1>
          <p className="mt-8 max-w-lg text-base leading-7 text-white/55 sm:text-lg">
            Hear it on YouTube. Keep it on Spotify. Sync turns the songs you discover into playlists you actually come back to.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <button onClick={download} className="rounded-full bg-[#a5ff12] px-6 py-3.5 text-sm font-semibold text-black transition hover:bg-[#c2ff62]">
              Install for Chrome <ArrowRight className="ml-2 inline h-4 w-4" />
            </button>
            <a href="#how-it-works" className="rounded-full border border-white/15 px-6 py-3.5 text-sm text-white/70 transition hover:border-white/35 hover:text-white">
              See how it works
            </a>
          </div>
          <div className="mt-12 flex items-center gap-5 text-xs text-white/35">
            <span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#a5ff12]" /> Free forever</span>
            <span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#a5ff12]" /> Open source</span>
            <span className="hidden items-center gap-2 sm:flex"><Check className="h-3.5 w-3.5 text-[#a5ff12]" /> No tracking</span>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-[31rem]">
          <div className="absolute -inset-8 rounded-full bg-[#a5ff12]/15 blur-3xl" />
          <div className="relative rotate-2 rounded-[2rem] border border-white/10 bg-[#171a18] p-3 shadow-2xl shadow-black/50">
            <div className="rounded-[1.4rem] border border-white/10 bg-[#f5f5f7] p-4 text-[#1d1d1f]">
              <div className="flex items-center justify-between border-b border-black/10 pb-4">
                <div className="flex items-center gap-2"><img src={logo} alt="Sync" className="h-7 w-7 rounded-lg object-contain" /><strong>Sync</strong></div>
                <span className="text-xs text-black/40">•••</span>
              </div>
              <p className="mt-5 text-[10px] font-bold uppercase tracking-[.12em] text-black/40">Listening now</p>
              <div className="mt-2 rounded-2xl bg-white p-3 shadow-sm">
                <div className="flex gap-3">
                  <div className="flex h-14 w-14 items-end justify-center gap-0.5 overflow-hidden rounded-xl bg-[#111] pb-2">
                    {[18, 28, 13, 34, 23, 40, 25].map((height, i) => <span key={i} className="w-1.5 rounded-full bg-[#a5ff12]" style={{ height }} />)}
                  </div>
                  <div className="min-w-0 pt-1"><p className="truncate text-sm font-semibold">Midnight City</p><p className="mt-1 truncate text-xs text-black/45">M83 · Hurry Up, We&apos;re Dreaming</p></div>
                  <span className="ml-auto text-lg text-[#1db954]">↗</span>
                </div>
              </div>
              <div className="mt-5 flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.12em] text-black/40">Destination</p><p className="mt-1 text-lg font-semibold">Save to playlist</p></div><span className="rounded-lg bg-[#e8f8ed] px-2 py-1 text-[10px] font-bold text-[#1db954]">＋ New playlist</span></div>
              <div className="mt-3 space-y-1.5">{["Late night drives", "Favorites", "Discover weekly"].map((item, i) => <div key={item} className="flex items-center gap-2 rounded-xl border border-black/5 bg-white px-2.5 py-2"><span className="h-7 w-7 rounded-lg bg-black/5" /><span className="flex-1 text-xs">{item}</span><span className="text-sm text-[#1db954]">{i === 0 ? "✓" : "＋"}</span></div>)}</div>
            </div>
          </div>
          <div className="absolute -bottom-5 -left-7 flex items-center gap-2 rounded-full border border-white/10 bg-[#1b201b] px-4 py-2.5 text-xs shadow-xl"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#a5ff12] text-black"><Check className="h-3.5 w-3.5" /></span> Added in one click</div>
        </div>
      </section>

      <section id="features" className="relative z-10 border-y border-white/10 bg-white/[.025]">
        <div className="mx-auto grid max-w-7xl gap-0 px-6 lg:grid-cols-3 lg:px-10">
          {features.map(({ number, icon: FeatureIcon, title, description }) => (
            <div key={number} className="border-white/10 py-10 lg:border-r lg:px-10 lg:first:border-l">
              <div className="flex items-center justify-between"><FeatureIcon className="h-5 w-5 text-[#a5ff12]" /><span className="font-mono text-xs text-white/25">{number}</span></div>
              <h2 className="mt-12 text-xl tracking-[-.03em]">{title}</h2>
              <p className="mt-3 max-w-xs text-sm leading-6 text-white/45">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="relative z-10 mx-auto max-w-7xl px-6 py-28 lg:px-10 lg:py-40">
        <div className="grid gap-16 lg:grid-cols-[.8fr_1.2fr]">
          <div><span className="text-xs font-semibold uppercase tracking-[.18em] text-[#a5ff12]">The simple part</span><h2 className="mt-5 max-w-md text-4xl font-medium tracking-[-.065em] sm:text-5xl">From “what is this song?” to saved.</h2><p className="mt-6 max-w-sm text-sm leading-6 text-white/45">Sync stays out of the way until you need it. One tiny extension, one less interruption to your listening.</p></div>
          <div className="divide-y divide-white/10 border-y border-white/10">{steps.map(([title, text], index) => <div key={title} className="flex gap-7 py-7"><span className="font-mono text-xs text-[#a5ff12]">0{index + 1}</span><div><h3 className="text-lg">{title}</h3><p className="mt-2 text-sm text-white/45">{text}</p></div></div>)}</div>
        </div>
      </section>

      <section id="install" className="relative z-10 mx-6 mb-20 overflow-hidden rounded-[2rem] border border-white/10 bg-[#a5ff12] px-7 py-16 text-center text-black sm:px-12 lg:mx-auto lg:max-w-7xl">
        <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/30 blur-3xl" />
        <Music2 className="relative mx-auto h-8 w-8" />
        <h2 className="relative mx-auto mt-5 max-w-2xl text-4xl font-medium tracking-[-.065em] sm:text-6xl">Your next favorite song is one click away.</h2>
        <p className="relative mx-auto mt-5 max-w-md text-sm text-black/60">Install Sync for Chrome and never lose a discovery again.</p>
        <button onClick={download} className="relative mt-8 rounded-full bg-black px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-black/80">Download Sync <ArrowDown className="ml-1 inline h-4 w-4" /></button>
      </section>

      <footer className="relative z-10 mx-auto flex max-w-7xl flex-col gap-5 border-t border-white/10 px-6 py-8 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between lg:px-10">
        <div className="flex items-center gap-2"><img src={logo} alt="Sync" className="h-6 w-6 rounded-md object-contain" /><span>Sync. Music, in motion.</span></div>
        <div className="flex items-center gap-5"><a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 transition hover:text-white"><Github className="h-3.5 w-3.5" /> GitHub</a><span>Built for the curious.</span></div>
      </footer>
    </main>
  );
}
