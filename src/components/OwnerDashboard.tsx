import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  ArrowLeft,
  Check,
  Clock3,
  ExternalLink,
  LogOut,
  KeyRound,
  RefreshCw,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import UserAccessReview from "./UserAccessReview";

const OWNER_EMAIL = "tneilandre20@gmail.com";

type ListingStatus = "pending" | "approved" | "rejected";

type AdminListing = {
  id: number;
  title: string;
  location: string;
  price: number | string;
  type: string;
  amenities: string[] | null;
  image: string | null;
  description: string | null;
  landlord_name: string | null;
  contact_phone: string | null;
  wifi: string | null;
  rules: string[] | null;
  status: ListingStatus;
  created_at: string;
};

const buttonBase =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

function formatPrice(value: number | string) {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? `₱${amount.toLocaleString("en-PH")}`
    : `₱${value}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function OwnerDashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [activeFilter, setActiveFilter] = useState<"all" | ListingStatus>("pending");
  const [loadingListings, setLoadingListings] = useState(false);
  const [workingId, setWorkingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) {
      setCheckingSession(false);
      return;
    }

    let mounted = true;

    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!mounted) return;
      if (sessionError) setError(sessionError.message);
      setSession(data.session);
      setCheckingSession(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setCheckingSession(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function loadListings() {
    if (!supabase) return;

    setLoadingListings(true);
    setError("");

    const { data, error: queryError } = await supabase
      .from("listings")
      .select(
        "id, title, location, price, type, amenities, image, description, landlord_name, contact_phone, wifi, rules, status, created_at",
      )
      .order("created_at", { ascending: false });

    if (queryError) {
      setError(queryError.message);
      setListings([]);
    } else {
      setListings((data ?? []) as AdminListing[]);
    }

    setLoadingListings(false);
  }

  useEffect(() => {
    if (!session) {
      setListings([]);
      return;
    }

    const signedInEmail = (session.user.email ?? "").toLowerCase();
    if (signedInEmail !== OWNER_EMAIL) {
      // Non-owner accounts use the public homepage. Their approval status
      // controls listing-submission access, not access to public browsing.
      window.location.replace(window.location.pathname);
      return;
    }

    void loadListings();
  }, [session]);

  async function signInOwner(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }

    setSigningIn(true);
    setError("");
    setMessage("");

    const { error: signInError } = await supabase.auth.signInWithPassword({ email: ownerEmail.trim(), password: ownerPassword });

    if (signInError) setError(signInError.message);
    setSigningIn(false);
  }

  async function signInWithGoogle() {
    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }

    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}${window.location.pathname}?admin=1`,
      },
    });

    if (googleError) setError(googleError.message);
  }

  async function changeStatus(listing: AdminListing, status: ListingStatus) {
    if (!supabase) return;

    setWorkingId(listing.id);
    setError("");
    setMessage("");

    const { error: updateError } = await supabase
      .from("listings")
      .update({ status })
      .eq("id", listing.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage(`${listing.title} is now ${status}.`);
      await loadListings();
    }

    setWorkingId(null);
  }

  async function removeListing(listing: AdminListing) {
    if (!supabase) return;

    const confirmed = window.confirm(
      `Permanently remove "${listing.title}"? This cannot be undone.`,
    );
    if (!confirmed) return;

    setWorkingId(listing.id);
    setError("");
    setMessage("");

    const { error: deleteError } = await supabase
      .from("listings")
      .delete()
      .eq("id", listing.id);

    if (deleteError) {
      setError(deleteError.message);
    } else {
      setMessage(`"${listing.title}" was removed.`);
      await loadListings();
    }

    setWorkingId(null);
  }

  async function changeOwnerPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setError("");
    setMessage("");

    if (newPassword.length < 8) {
      setError("Your new password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("The new passwords do not match.");
      return;
    }

    setChangingPassword(true);
    const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword });
    if (passwordError) {
      setError(passwordError.message);
    } else {
      setMessage("Your password has been updated. Use it the next time you log in with your email.");
      setNewPassword("");
      setConfirmNewPassword("");
    }
    setChangingPassword(false);
  }

  async function signOut() {
    if (!supabase) return;
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) setError(signOutError.message);
    else window.location.assign(window.location.pathname);
  }

  const filteredListings =
    activeFilter === "all"
      ? listings
      : listings.filter((listing) => listing.status === activeFilter);

  const pendingCount = listings.filter((listing) => listing.status === "pending").length;
  const approvedCount = listings.filter((listing) => listing.status === "approved").length;
  const rejectedCount = listings.filter((listing) => listing.status === "rejected").length;

  if (!supabase) {
    return (
      <AdminShell>
        <StatusPanel title="Supabase is not configured" detail="Check the VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY environment variables." />
      </AdminShell>
    );
  }

  if (checkingSession) {
    return (
      <AdminShell>
        <p className="rounded-3xl bg-surface p-8 text-center text-sm text-muted shadow-raised">
          Checking owner access…
        </p>
      </AdminShell>
    );
  }

  if (!session) {
    return (
      <AdminShell>
        <section className="mx-auto w-full max-w-lg rounded-[30px] bg-surface p-6 shadow-raised sm:p-9">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-tint text-brand shadow-raised">
            <ShieldCheck size={27} />
          </span>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-brand">
            Personal Account
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">
            Sign in to manage listings
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Sign in to review listings and approve user access.
          </p>

          {message && (
            <p role="status" className="mt-4 rounded-2xl bg-brand-tint p-4 text-sm text-brand-dark">
              {message}
            </p>
          )}
          {error && (
            <p role="alert" className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
              {error}
            </p>
          )}

          <form onSubmit={signInOwner} className="mt-6 space-y-3">
            <label className="block text-sm font-semibold text-ink">Email
              <input
                type="email"
                autoComplete="username"
                required
                value={ownerEmail}
                onChange={(event) => setOwnerEmail(event.target.value)}
                placeholder="Enter your owner email"
                className="mt-1.5 w-full rounded-2xl bg-page px-4 py-3 text-sm text-ink shadow-pressed outline-none focus:ring-2 focus:ring-brand/40"
              />
            </label>
            <label className="block text-sm font-semibold text-ink">Password
              <input
                type="password"
                autoComplete="current-password"
                required
                value={ownerPassword}
                onChange={(event) => setOwnerPassword(event.target.value)}
                className="mt-1.5 w-full rounded-2xl bg-page px-4 py-3 text-sm text-ink shadow-pressed outline-none focus:ring-2 focus:ring-brand/40"
              />
            </label>
            <button type="submit" disabled={signingIn} className={`${buttonBase} w-full bg-brand py-3 text-white shadow-brand hover:brightness-105`}>
              {signingIn ? "Signing in…" : "Log in"}
            </button>
          </form>
          <button
            type="button"
            onClick={() => void signInWithGoogle()}
            className={`${buttonBase} mt-3 w-full border border-slate-200 bg-white text-slate-700 shadow-raised hover:bg-slate-50`}
          >
            <svg aria-hidden="true" viewBox="0 0 48 48" className="size-5">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.45 13.72 17.74 9.5 24 9.5Z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.72 7.18l7.62 5.91c4.45-4.11 7.14-10.16 7.14-17.56Z" />
              <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.12.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19Z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.89l-7.62-5.91c-2.12 1.42-4.84 2.26-8.28 2.26-6.26 0-11.55-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
            </svg>
            Continue with Google
          </button>

          <p className="mt-4 text-center text-xs leading-5 text-muted">
Only the authorized owner account can approve, reject, or remove listings.
          </p>
        </section>
      </AdminShell>
    );
  }

  if ((session.user.email ?? "").toLowerCase() !== OWNER_EMAIL) {
    return (
      <AdminShell>
        <StatusPanel
          title="Owner access required"
          detail="The signed-in account is not authorized to manage these listings."
        />
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="flex flex-col gap-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">Owner workspace</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">Listing management</h1>
            <p className="mt-2 text-sm text-muted">Review submissions, publish rooms, or remove outdated listings.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => void loadListings()} disabled={loadingListings} className={`${buttonBase} bg-surface text-brand-dark shadow-raised`}>
              <RefreshCw size={16} className={loadingListings ? "animate-spin" : ""} />
              Refresh
            </button>
            <button type="button" onClick={() => void signOut()} className={`${buttonBase} bg-page text-muted shadow-pressed`}>
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>

        <UserAccessReview />

        {message && <p role="status" className="rounded-2xl bg-brand-tint p-4 text-sm text-brand-dark">{message}</p>}
        {error && <p role="alert" className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard label="Pending review" value={pendingCount} icon={<Clock3 size={19} />} />
          <SummaryCard label="Published" value={approvedCount} icon={<Check size={19} />} />
          <SummaryCard label="Rejected" value={rejectedCount} icon={<X size={19} />} />
        </div>

        <section className="rounded-[28px] bg-surface p-4 shadow-raised sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-ink">Boarding house submissions</h2>
            <div className="flex flex-wrap gap-2">
              {(["pending", "approved", "rejected", "all"] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-full px-3 py-2 text-xs font-semibold capitalize transition ${activeFilter === filter ? "bg-brand text-white shadow-brand" : "bg-page text-muted shadow-pressed hover:text-ink"}`}
                >
                  {filter === "all" ? "All" : filter}
                </button>
              ))}
            </div>
          </div>

          {loadingListings ? (
            <p className="py-12 text-center text-sm text-muted">Loading submissions…</p>
          ) : filteredListings.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-semibold text-ink">No {activeFilter === "all" ? "" : activeFilter} listings</p>
              <p className="mt-1 text-sm text-muted">New submissions will appear here for review.</p>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {filteredListings.map((listing) => (
                <article key={listing.id} className="grid gap-4 rounded-3xl bg-page p-4 shadow-pressed sm:grid-cols-[150px_minmax(0,1fr)]">
                  {listing.image ? (
                    <img src={listing.image} alt={listing.title} className="h-36 w-full rounded-2xl object-cover sm:h-full" />
                  ) : (
                    <div className="flex h-36 items-center justify-center rounded-2xl bg-brand-tint text-brand sm:h-full">
                      <ShieldCheck size={30} />
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-bold text-ink">{listing.title}</h3>
                        <p className="mt-1 text-sm text-muted">{listing.location}</p>
                      </div>
                      <StatusBadge status={listing.status} />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink">
                      <span className="font-bold">{formatPrice(listing.price)} / month</span>
                      <span>{listing.type}</span>
                      <span>Submitted {formatDate(listing.created_at)}</span>
                    </div>

                    {listing.description && <p className="mt-3 text-sm leading-6 text-muted">{listing.description}</p>}

                    <div className="mt-3 grid gap-1 text-sm text-muted sm:grid-cols-2">
                      {listing.landlord_name && <p>Contact person: {listing.landlord_name}</p>}
                      {listing.contact_phone && <p>Phone: {listing.contact_phone}</p>}
                      {listing.wifi && <p>Wi-Fi: {listing.wifi}</p>}
                      {listing.amenities?.length ? <p>Amenities: {listing.amenities.join(", ")}</p> : null}
                      {listing.rules?.length ? <p>Rules: {listing.rules.join(", ")}</p> : null}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {listing.status !== "approved" && (
                        <button
                          type="button"
                          disabled={workingId === listing.id}
                          onClick={() => void changeStatus(listing, "approved")}
                          className={`${buttonBase} bg-brand text-white shadow-brand`}
                        >
                          <Check size={15} />
                          Approve & publish
                        </button>
                      )}
                      {listing.status !== "rejected" && (
                        <button
                          type="button"
                          disabled={workingId === listing.id}
                          onClick={() => void changeStatus(listing, "rejected")}
                          className={`${buttonBase} bg-surface text-ink shadow-raised`}
                        >
                          <X size={15} />
                          Reject
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={workingId === listing.id}
                        onClick={() => void removeListing(listing)}
                        className={`${buttonBase} bg-red-50 text-red-700 shadow-raised`}
                      >
                        <Trash2 size={15} />
                        Remove permanently
                      </button>
                      {listing.image && (
                        <a href={listing.image} target="_blank" rel="noreferrer" className={`${buttonBase} bg-page text-muted shadow-pressed`}>
                          <ExternalLink size={15} />
                          Open photo
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}

function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-page px-4 py-6 sm:px-8 lg:px-16">
      <div className="mx-auto mb-7 flex max-w-6xl items-center justify-between">
        <a href={window.location.pathname} className="inline-flex items-center gap-2 text-sm font-semibold text-brand-dark">
          <ArrowLeft size={17} />
          Back to website
        </a>
        <span className="rounded-full bg-brand-tint px-3 py-2 text-xs font-semibold text-brand-dark">
          Boarding House Finder
        </span>
      </div>
      <main className="mx-auto max-w-6xl">{children}</main>
    </div>
  );
}

function SummaryCard({ label, value, icon }: { label: string; value: number; icon: ReactNode }) {
  return (
    <div className="rounded-3xl bg-surface p-5 shadow-raised">
      <div className="flex items-center justify-between text-brand">
        <span className="text-sm font-medium text-muted">{label}</span>
        {icon}
      </div>
      <p className="mt-3 text-3xl font-bold tabular-nums text-ink">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: ListingStatus }) {
  const styles: Record<ListingStatus, string> = {
    pending: "bg-amber-50 text-amber-800",
    approved: "bg-brand-tint text-brand-dark",
    rejected: "bg-red-50 text-red-700",
  };

  return (
    <span className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}

function StatusPanel({ title, detail }: { title: string; detail: string }) {
  return (
    <section className="mx-auto max-w-lg rounded-[30px] bg-surface p-8 text-center shadow-raised">
      <h1 className="text-xl font-bold text-ink">{title}</h1>
      <p className="mt-2 text-sm text-muted">{detail}</p>
    </section>
  );
}
