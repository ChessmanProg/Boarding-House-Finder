import { ArrowUpRight, Footprints, Heart, Star } from "lucide-react";
import type { Listing } from "../data";

type Props = { listing: Listing; onViewDetails?: () => void };

export default function ListingCard({ listing, onViewDetails }: Props) {
  const { name, location, distance, roomType, price, rating, reviews, badge, image } = listing;
  const BadgeIcon = badge.icon;

  return (
    <article className="flex flex-col gap-[15px] rounded-[28px] bg-card p-2.5 shadow-raised">
      <div className="relative h-[214px]">
        <img src={image} alt={`${name} room`} className="size-full rounded-[22px] object-cover" />
        <span className="absolute top-[13px] left-3 flex items-center gap-[5px] rounded-full bg-card px-2.5 py-[7px] text-[10px] font-semibold text-ink">
          <BadgeIcon size={12} strokeWidth={1.8} className="text-brand" />
          {badge.label}
        </span>
        <button
          type="button"
          aria-label={`Save ${name}`}
          onClick={(event) => event.stopPropagation()}
          className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-full bg-surface shadow-raised"
        >
          <Heart size={18} strokeWidth={1.8} className="text-ink" />
        </button>
      </div>

      <div className="flex flex-col gap-[9px] px-1.5 pb-[9px]">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-[15px] font-semibold text-ink">{name}</h3>
          {rating && reviews > 0 && (
            <span className="flex shrink-0 items-center gap-1 text-[11px] text-muted">
              <Star size={12} strokeWidth={1.8} className="text-star" />
              <span><b className="font-semibold text-ink">{rating}</b> ({reviews})</span>
            </span>
          )}
        </div>
        <p className="text-xs text-muted">{location}</p>
        <p className="flex items-center gap-[5px] text-[11px] text-brand-dark">
          <Footprints size={13} strokeWidth={1.8} className="shrink-0 text-brand" />
          {distance}
        </p>
        <p className="text-[11px] text-muted">{roomType}</p>
        <div className="flex items-center justify-between gap-2 pt-[5px]">
          <p className="text-[11px] tracking-[-0.5px] text-muted">
            <span className="text-[19px] font-bold text-ink">{price}</span> / month
          </p>
          <button type="button" onClick={onViewDetails} className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-brand-tint px-3 py-2 text-xs font-semibold text-brand-dark hover:brightness-95">
            View details <ArrowUpRight size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}
