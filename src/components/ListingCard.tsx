import { useEffect, useState } from "react";
import { ArrowUpRight, Footprints, Heart, Star } from "lucide-react";
import type { Listing } from "../data";

type Props = { listing: Listing; onViewDetails?: () => void };
const FAVORITES_KEY = "boarding-house-finder:favorites";

function readFavorites(): string[] {
  try {
    const value = JSON.parse(window.localStorage.getItem(FAVORITES_KEY) || "[]");
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export default function ListingCard({ listing, onViewDetails }: Props) {
  const { name, location, distance, roomType, price, rating, reviews, badge, image } = listing;
  const BadgeIcon = badge.icon;
  const favoriteId = `${name}::${location}`;
  const [saved, setSaved] = useState(() => readFavorites().includes(favoriteId));

  useEffect(() => {
    const syncFavorites = () => setSaved(readFavorites().includes(favoriteId));
    window.addEventListener("storage", syncFavorites);
    window.addEventListener("boarding-house-favorites-changed", syncFavorites);
    return () => {
      window.removeEventListener("storage", syncFavorites);
      window.removeEventListener("boarding-house-favorites-changed", syncFavorites);
    };
  }, [favoriteId]);

  function toggleFavorite(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    const favorites = readFavorites();
    const next = saved ? favorites.filter((item) => item !== favoriteId) : [...favorites, favoriteId];
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    setSaved(!saved);
    window.dispatchEvent(new CustomEvent("boarding-house-favorites-changed"));
  }

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-[26px] border border-line/70 bg-card transition duration-200 hover:-translate-y-1 hover:border-brand/35 hover:shadow-[0_16px_38px_rgba(30,70,62,0.10)]">
      <div className="relative h-[220px] overflow-hidden bg-surface sm:h-[205px]">
        <img src={image} alt={`${name} room`} loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-[1.035]" />
        <span className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full border border-white/60 bg-white/95 px-3 py-1.5 text-[10px] font-semibold text-slate-800 shadow-sm">
          <BadgeIcon size={12} strokeWidth={1.8} className="text-brand" />
          {badge.label}
        </span>
        <button
          type="button"
          aria-label={saved ? `Remove ${name} from saved rooms` : `Save ${name}`}
          aria-pressed={saved}
          onClick={toggleFavorite}
          className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-full border border-white/60 bg-white/95 text-slate-800 shadow-sm transition hover:scale-105"
        >
          <Heart size={17} strokeWidth={1.9} className={saved ? "fill-rose-500 text-rose-500" : ""} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="line-clamp-1 text-[15px] font-semibold tracking-[-0.25px] text-ink">{name}</h3>
            <p className="mt-1 line-clamp-1 text-xs text-muted">{location}</p>
          </div>
          {rating && reviews > 0 && (
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-brand-tint px-2 py-1 text-[10px] text-brand-dark">
              <Star size={11} className="text-star" />
              <b className="font-semibold">{rating}</b>
              <span>({reviews})</span>
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
          <span className="flex items-center gap-1"><Footprints size={13} className="text-brand" />{distance}</span>
          <span className="rounded-full bg-surface px-2.5 py-1">{roomType}</span>
        </div>
        <div className="mt-auto flex items-end justify-between gap-2 border-t border-line/70 pt-3">
          <p className="text-[10px] text-muted">
            <span className="block text-[19px] font-bold leading-tight tracking-[-0.6px] text-ink">{price}</span>
            per month
          </p>
          <button type="button" onClick={onViewDetails} className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand px-3.5 py-2.5 text-xs font-semibold text-page transition hover:bg-brand-dark">
            View room <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}
