import { useState, type FormEvent } from "react";
import { supabase } from "../lib/supabase";
import { X } from "lucide-react";

type Props = { onClose: () => void; onSignedIn: () => void };
type Mode = "sign-in" | "sign-up";

const fieldClass =
  "mt-1.5 w-full rounded-2xl bg-page px-4 py-3 text-sm text-ink shadow-pressed outline-none focus:ring-2 focus:ring-brand/40";

export default function UserAuthModal({ onClose, onSignedIn }: Props) {
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setMessage("");
    setError("");

    const result =
      mode === "sign-up"
        ? await supabase.auth.signUp({ email: email.trim(), password })
        : await supabase.auth.signInWithPassword({ email: email.trim(), password });

    if (result.error) {
      setError(result.error.message);
    } else if (mode === "sign-up" && !result.data.session) {
      setMessage("Account created. Check your email to confirm your address, then sign in. Your access will remain pending until the owner approves it.");
    } else {
      onSignedIn();
    }
    setBusy(false);
  }

  async function signInWithGoogle() {
    if (!supabase) return;
    setBusy(true);
    setError("");
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + window.location.pathname },
    });
    if (oauthError) {
      setError(oauthError.message);
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/35 p-3 backdrop-blur-sm sm:p-6">
      <section role="dialog" aria-modal="true" aria-labelledby="user-auth-title" className="w-full max-w-md rounded-[30px] bg-surface p-6 shadow-raised sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">Boarding House Finder</p>
            <h2 id="user-auth-title" className="mt-2 text-2xl font-bold text-ink">{mode === "sign-in" ? "Welcome back" : "Create your account"}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">Browsing stays public. An account is needed to submit a room listing, and the owner must approve your access first.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="flex size-9 items-center justify-center rounded-full bg-page text-muted shadow-pressed"><X size={18} /></button>
        </div>

        <button type="button" onClick={() => void signInWithGoogle()} disabled={busy} className="mt-6 h-12 w-full rounded-2xl bg-surface text-sm font-semibold text-ink shadow-raised disabled:opacity-50">
          Continue with Google
        </button>
        <div className="my-4 flex items-center gap-3 text-xs text-muted"><span className="h-px flex-1 bg-line" />or use email<span className="h-px flex-1 bg-line" /></div>

        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
          <label className="block text-sm font-semibold text-ink">Email address
            <input className={fieldClass} type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
          </label>
          <label className="block text-sm font-semibold text-ink">Password
            <input className={fieldClass} type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} autoComplete={mode === "sign-in" ? "current-password" : "new-password"} />
          </label>
          {error && <p role="alert" className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {message && <p role="status" className="rounded-2xl bg-brand-tint p-3 text-sm text-brand-dark">{message}</p>}
          <button type="submit" disabled={busy} className="h-12 w-full rounded-2xl bg-brand text-sm font-semibold text-white shadow-brand disabled:opacity-50">
            {busy ? "Please wait…" : mode === "sign-in" ? "Log in" : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          {mode === "sign-in" ? "New here?" : "Already have an account?"}{" "}
          <button type="button" onClick={() => { setMode(mode === "sign-in" ? "sign-up" : "sign-in"); setError(""); setMessage(""); }} className="font-semibold text-brand-dark underline underline-offset-2">
            {mode === "sign-in" ? "Create an account" : "Log in"}
          </button>
        </p>
      </section>
    </div>
  );
}
