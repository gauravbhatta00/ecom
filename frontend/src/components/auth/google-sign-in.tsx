"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { googleClientId } from "@/lib/config";

interface CredentialResponse { credential: string }
declare global {
  interface Window {
    google?: { accounts: { id: { initialize: (options: { client_id: string; callback: (response: CredentialResponse) => void }) => void; renderButton: (element: HTMLElement, options: Record<string, string | number>) => void } } };
  }
}

export function GoogleSignIn({ onCredential }: { onCredential: (response: CredentialResponse) => void | Promise<void> }) {
  const target = useRef<HTMLDivElement>(null);
  const callback = useRef(onCredential);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => { callback.current = onCredential; }, [onCredential]);
  useEffect(() => {
    if (!ready || !target.current || !window.google || !googleClientId) return;
    window.google.accounts.id.initialize({ client_id: googleClientId, callback: response => { void callback.current(response); } });
    window.google.accounts.id.renderButton(target.current, { theme: "outline", size: "large", text: "continue_with", shape: "rectangular" });
  }, [ready]);
  if (!googleClientId) return null;
  return <div><Script src="https://accounts.google.com/gsi/client?hl=en" onReady={() => setReady(true)} onError={() => setFailed(true)} /><div ref={target} />{failed ? <p role="status" className="text-xs text-muted-foreground">Google sign-in is unavailable. Please use your username and password.</p> : !ready && <p role="status" className="text-xs text-muted-foreground">Loading Google sign-in…</p>}</div>;
}
