"use client";

import dynamic from "next/dynamic";

// BrowserRouter and existing localStorage consumers stay client-only until migrated.
const App = dynamic(() => import("../App"), { ssr: false, loading: () => <div role="status" className="grid min-h-screen place-items-center bg-background text-foreground"><p className="font-display text-2xl">Opening LeloVaiLelo<span className="sr-only">. Loading store.</span></p></div> });

export function LegacyApp() { return <App />; }
