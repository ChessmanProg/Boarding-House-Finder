import { ArrowRight, ChevronsUpDown, SlidersHorizontal } from "lucide-react";
import { listings } from "../data";
import ListingCard from "./ListingCard";

const actionButton =
  "flex h-[50px] items-center justify-center gap-2.5 rounded-3xl bg-surface px-[22px] text-sm font-semibold text-brand-dark shadow-raised";

export default function Listings() {
  return (
    <section className="flex flex-col gap-7 px-4 pb-12 sm:px-8 lg:px-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-[9px]">
          <h2 className="text-[25px] font-semibold tracking-[-0.7px] text-ink">
            Rooms you’ll feel at home in
          </h2>
          <p className="text-[13px] text-muted">128 verified spaces near your favorite campuses</p>
        </div>
        <div className="flex gap-3">
          <button className={actionButton}>
            <ChevronsUpDown size={18} strokeWidth={1.8} className="text-brand" />
            Recommended
          </button>
          <button className={actionButton}>
            <SlidersHorizontal size={18} strokeWidth={1.8} className="text-brand" />
            Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-[26px] sm:grid-cols-2 lg:grid-cols-4">
        {listings.map((listing) => (
          <ListingCard key={listing.name} listing={listing} />
        ))}
      </div>

      <div className="flex flex-col items-center gap-[17px] pt-[13px] pb-1.5 text-center">
        <p className="text-sm font-medium text-ink">Your next chapter starts with the right room.</p>
        <button className={actionButton}>
          <ArrowRight size={18} strokeWidth={1.8} className="text-brand" />
          Explore more rooms
        </button>
        <p className="text-[11px] text-muted">Showing 8 of 128 rooms</p>
      </div>
    </section>
  );
}
