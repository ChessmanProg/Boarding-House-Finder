import { useEffect, useRef, useState } from "react";
import { Camera, ChevronDown, House, LogOut, Trash2, UserRound } from "lucide-react";
import ListingSubmissionModal from "./ListingSubmissionModal";
import UserAuthModal from "./UserAuthModal";
import { supabase } from "../lib/supabase";

const links = ["Locations", "Amenities", "Help"];

type HeaderProps = { onListingCreated: () => void };
type AccessStatus = "pending" | "approved" | "rejected" | null;

export default function Header({ onListingCreated }: HeaderProps) {
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [accessStatus, setAccessStatus] = useState<AccessStatus>(null);
  const [accessNotice, setAccessNotice] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const avatarInput = useRef<HTMLInputElement>(null);
  const customAvatar = currentUser?.user_metadata?.custom_avatar_url as string | undefined;
  const providerAvatar = (currentUser?.user_metadata?.avatar_url || currentUser?.user_metadata?.picture) as string | undefined;
  const avatarUrl = customAvatar || providerAvatar;
  const displayName = (currentUser?.user_metadata?.full_name || currentUser?.user_metadata?.name || "Your account") as string;

  async function refreshAccess() {
    if (!supabase) {
      setAccessStatus(null);
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
    if (!user) {
      setAccessStatus(null);
      return;
    }
    const { data, error } = await supabase
      .from("user_access")
      .select("status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      setAccessNotice("Could not check your account approval. Please try again.");
      setAccessStatus(null);
      return;
    }
    const status = (data?.status ?? "pending") as AccessStatus;
    setAccessStatus(status);
    setAccessNotice(status === "approved" ? "Your account is approved." : status === "rejected" ? "Your account request was not approved. Contact the owner if you believe this is an error." : "Your account is awaiting owner approval.");
  }

  useEffect(() => {
    if (!supabase) return;
    void refreshAccess();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      window.setTimeout(() => void refreshAccess(), 0);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function uploadAvatar(file?: File) {
    if (!supabase || !currentUser || !file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setAccessNotice("Please choose a JPG, PNG, or WebP image."); return; }
    if (file.size > 3 * 1024 * 1024) { setAccessNotice("Your profile picture must be 3 MB or smaller."); return; }
    setAvatarBusy(true); setAccessNotice("");
    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${currentUser.id}/avatar.${extension}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type, cacheControl: "3600" });
    if (uploadError) { setAccessNotice(`Could not upload profile picture: ${uploadError.message}`); setAvatarBusy(false); return; }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const { data: updatedUser, error: updateError } = await supabase.auth.updateUser({ data: { custom_avatar_url: `${data.publicUrl}?v=${Date.now()}` } });
    if (updateError) setAccessNotice(`Photo uploaded, but profile update failed: ${updateError.message}`); else setCurrentUser(updatedUser.user);
    setAvatarBusy(false);
  }

  async function removeAvatar() {
    if (!supabase || !currentUser) return;
    setAvatarBusy(true);
    const { data: files } = await supabase.storage.from("avatars").list(currentUser.id);
    if (files?.length) await supabase.storage.from("avatars").remove(files.map((file) => `${currentUser.id}/${file.name}`));
    const { data, error } = await supabase.auth.updateUser({ data: { custom_avatar_url: null } });
    if (error) setAccessNotice(`Could not remove profile picture: ${error.message}`); else setCurrentUser(data.user);
    setAvatarBusy(false);
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut(); setCurrentUser(null); setProfileOpen(false); setAccessStatus(null); setAccessNotice("");
  }

  async function startListing() {
    setAccessNotice("");
    if (!supabase) {
      setIsAuthModalOpen(true);
      return;
    }

    // Check the active session and approval directly instead of trusting
    // potentially stale component state after sign-in or OAuth redirect.
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setCurrentUser(null);
      setAccessStatus(null);
      setIsAuthModalOpen(true);
      return;
    }

    setCurrentUser(user);
    const { data, error } = await supabase
      .from("user_access")
      .select("status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      setAccessNotice("We couldn't verify your approval status. Please try again.");
      return;
    }

    const status = (data?.status ?? "pending") as AccessStatus;
    setAccessStatus(status);
    if (status === "approved") {
      setIsListingModalOpen(true);
      return;
    }

    setAccessNotice(
      status === "rejected"
        ? "Your account request was not approved. Please contact the owner."
        : "Your account is awaiting owner approval.",
    );
    setIsAuthModalOpen(false);
  }

  return (
    <>
      <header className="px-4 pt-7 sm:px-8 lg:px-16">
        <div className="flex h-[84px] items-center justify-between rounded-full bg-surface px-4 shadow-raised sm:px-6">
          <a href="/" className="flex items-center gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-[18px] bg-brand-tint shadow-raised">
              <House size={27} strokeWidth={1.8} className="text-brand" />
            </span>
            <span className="hidden text-lg font-bold tracking-[-0.6px] text-ink sm:block">Boarding House Finder</span>
          </a>

          <nav className="hidden items-center gap-7 md:flex">
            <a href="#listings" className="flex flex-col items-center gap-[7px] pt-2.5 text-sm font-semibold text-brand">
              Find Rooms
              <span className="h-[3px] w-[18px] rounded-sm bg-brand" />
            </a>
            {links.map((link) => <a key={link} href="#listings" className="text-sm font-medium text-muted">{link}</a>)}
          </nav>

          <div className="flex items-center gap-3 sm:gap-4">
            <button type="button" onClick={startListing} className="flex h-[50px] items-center justify-center rounded-3xl bg-surface px-4 text-xs font-semibold text-brand-dark shadow-raised transition hover:-translate-y-0.5 hover:shadow-brand sm:px-[22px] sm:text-sm">
              List Your Room
            </button>
            <div className="relative">
              <button type="button" onClick={() => setProfileOpen((open) => !open)} aria-label="Account menu" aria-expanded={profileOpen} className="flex h-[50px] items-center gap-[9px] rounded-full bg-pressed py-0 pr-3 pl-1.5 shadow-pressed transition hover:shadow-raised">
                <span className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-avatar">{avatarUrl ? <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" /> : <UserRound size={19} strokeWidth={1.8} className="text-avatar-icon" />}</span>
                <ChevronDown size={15} strokeWidth={1.8} className="text-ink" />
              </button>
              {profileOpen && <div className="absolute right-0 top-[58px] z-50 w-64 rounded-3xl bg-surface p-4 shadow-raised">
                <div className="flex items-center gap-3"><span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-avatar">{avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : <UserRound size={21} className="text-avatar-icon" />}</span><div className="min-w-0"><p className="truncate text-sm font-bold text-ink">{currentUser ? displayName : "Welcome"}</p><p className="text-xs text-muted">{currentUser ? "Your account" : "Sign in to manage your profile"}</p></div></div>
                {currentUser ? <><input ref={avatarInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadAvatar(file); event.currentTarget.value = ""; }} /><button type="button" disabled={avatarBusy} onClick={() => avatarInput.current?.click()} className="mt-4 flex w-full items-center gap-2 rounded-xl bg-page px-3 py-2.5 text-left text-sm font-semibold text-ink disabled:opacity-50"><Camera size={16} />{avatarBusy ? "Saving photo…" : "Change profile picture"}</button>{customAvatar && <button type="button" disabled={avatarBusy} onClick={() => void removeAvatar()} className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-muted hover:bg-page"><Trash2 size={16} />Remove custom picture</button>}{accessStatus === "approved" && <a href="?messages=1" className="mt-2 block rounded-xl px-3 py-2.5 text-sm font-semibold text-brand-dark hover:bg-page">Messages</a>}{accessStatus === "approved" && <a href="?my-listings=1" className="mt-2 block rounded-xl px-3 py-2.5 text-sm font-semibold text-brand-dark hover:bg-page">My Listings</a>}<a href="?admin=1" className="mt-2 block rounded-xl px-3 py-2.5 text-sm font-semibold text-brand-dark hover:bg-page">Owner dashboard</a><button type="button" onClick={() => void signOut()} className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-muted hover:bg-page"><LogOut size={16} />Sign out</button></> : <button type="button" onClick={() => { setProfileOpen(false); setIsAuthModalOpen(true); }} className="mt-4 w-full rounded-xl bg-brand px-3 py-2.5 text-sm font-semibold text-white">Log in / Create account</button>}
              </div>}
            </div>
          </div>
        </div>
        {accessNotice && <p role="status" className="mx-4 mt-3 text-center text-xs text-muted">{accessNotice}</p>}
      </header>

      {isAuthModalOpen && <UserAuthModal onClose={() => setIsAuthModalOpen(false)} onSignedIn={() => { setIsAuthModalOpen(false); void refreshAccess(); }} />}
      {isListingModalOpen && <ListingSubmissionModal onClose={() => setIsListingModalOpen(false)} onCreated={onListingCreated} />}
    </>
  );
}
