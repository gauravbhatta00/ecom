"use client";

import { useState } from "react";
import { Pause, Play } from "lucide-react";
import { announcements } from "@/data/navigation";

export function AnnouncementBar() {
  const [paused, setPaused] = useState(false);
  return <div className="announcement-bar relative overflow-hidden bg-primary text-primary-foreground"><div className="page-shell relative flex h-9 items-center justify-center pr-10"><p className="sr-only">{announcements.join(" ")}</p><div aria-hidden="true" className="w-full overflow-hidden"><div className="announcement-track flex w-max items-center gap-16 text-[10px] font-medium uppercase tracking-[.16em]" style={{ animationPlayState: paused ? "paused" : undefined }}>{[...announcements, ...announcements].map((message, i) => <span key={i} className="flex shrink-0 items-center gap-16">{message}<span className="text-secondary">✦</span></span>)}</div></div><button type="button" onClick={() => setPaused(value => !value)} className="absolute right-0 grid size-9 place-items-center hover:bg-white/10 motion-reduce:hidden" aria-label={paused ? "Play announcements" : "Pause announcements"}>{paused ? <Play size={12} /> : <Pause size={12} />}</button></div></div>;
}
