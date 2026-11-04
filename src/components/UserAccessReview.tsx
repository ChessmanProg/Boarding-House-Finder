import { useCallback, useEffect, useState } from "react";
import { Check, RefreshCw, X } from "lucide-react";
import { supabase } from "../lib/supabase";

type AccessRequest = {
  user_id: string;
  email: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

export default function UserAccessReview() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadRequests = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    setError("");
    const { data, error: queryError } = await supabase
      .from("user_access")
      .select("user_id, email, status, created_at")
      .order("created_at", { ascending: false });
    if (queryError) {
      setError(queryError.message);
      setRequests([]);
    } else {
      setRequests((data ?? []) as AccessRequest[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { void loadRequests(); }, [loadRequests]);

  async function review(request: AccessRequest, status: "approved" | "rejected") {
    if (!supabase) return;
    setWorking(request.user_id);
    setMessage("");
    setError("");
    const { data: { user } } = await supabase.auth.getUser();
    const { error: updateError } = await supabase
      .from("user_access")
      .update({ status, reviewed_at: new Date().toISOString(), reviewed_by: user?.id ?? null })
      .eq("user_id", request.user_id);
    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage(request.email + " was " + status + ".");
      await loadRequests();
    }
    setWorking(null);
  }

  const pending = requests.filter((request) => request.status === "pending");
  return (
    <section className="rounded-[28px] bg-surface p-4 shadow-raised sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-ink">User access requests</h2>
          <p className="mt-1 text-sm text-muted">Approve accounts before they can submit room listings.</p>
        </div>
        <button type="button" onClick={() => void loadRequests()} disabled={loading} className="inline-flex min-h-10 items-center gap-2 rounded-2xl bg-surface px-4 py-2 text-sm font-semibold text-brand-dark shadow-raised disabled:opacity-50">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>
      {message && <p role="status" className="mt-4 rounded-2xl bg-brand-tint p-3 text-sm text-brand-dark">{message}</p>}
      {error && <p role="alert" className="mt-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading ? <p className="py-8 text-center text-sm text-muted">Loading account requests…</p> :
        pending.length === 0 ? <p className="py-8 text-center text-sm text-muted">There are no pending user requests.</p> :
        <div className="mt-4 space-y-3">
          {pending.map((request) => (
            <div key={request.user_id} className="flex flex-col gap-3 rounded-2xl bg-page p-4 shadow-pressed sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="break-all font-semibold text-ink">{request.email}</p>
                <p className="mt-1 text-xs text-muted">Requested {new Date(request.created_at).toLocaleString("en-PH")}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" disabled={working === request.user_id} onClick={() => void review(request, "approved")} className="inline-flex min-h-10 items-center gap-2 rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-brand disabled:opacity-50"><Check size={15} /> Approve</button>
                <button type="button" disabled={working === request.user_id} onClick={() => void review(request, "rejected")} className="inline-flex min-h-10 items-center gap-2 rounded-2xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 shadow-raised disabled:opacity-50"><X size={15} /> Reject</button>
              </div>
            </div>
          ))}
        </div>
      }
    </section>
  );
}
