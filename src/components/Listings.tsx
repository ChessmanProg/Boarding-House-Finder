import { useEffect, useState } from "react";
import { ArrowRight, ChevronsUpDown, SlidersHorizontal, House, RefreshCw } from "lucide-react";
import { listings as sampleListings, type Listing } from "../data";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import ListingCard from "./ListingCard";

const actionButton =
  "flex h-[50px] items-center justify-center gap-2.5 rounded-3xl bg-surface px-[22px] text-sm font-semibold text-brand-dark shadow-raised";

type SupabaseListing = {
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
};

const fallbackImage = sampleListings[0]?.image ?? "";

function toCardListing(row: SupabaseListing): Listing {
  const numericPrice = Number(row.price);
  return {
    name: row.title,
    location: row.location,
    distance: "Student-friendly location",
    roomType: row.type,
    price: Number.isFinite(numericPrice)
      ? `₱${numericPrice.toLocaleString("en-PH")}`
      : `₱${row.price}`,
    rating: "",
    reviews: 0,
    badge: { label: "Listing", icon: House },
    image: row.image || fallbackImage,
  };
}

export default function Listings() {
  const [rooms, setRooms] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadListings() {
    setLoading(true);
    setError("");

    if (!isSupabaseConfigured || !supabase) {
      setRooms([]);
      setError("Supabase is not configured yet. Add your project URL and publishable key to the environment variables.");
      setLoading(false);
      return;
    }

    const { data, error: queryError } = await supabase
      .from("listings")
      .select("id, title, location, price, type, amenities, image, description, landlord_name, contact_phone, wifi, rules")
      .order("created_at", { ascending: false });

    if (queryError) {
      setRooms([]);
      setError(queryError.message);
    } else {
      setRooms(((data ?? []) as SupabaseListing[]).map(toCardListing));
    }
    setLoading(false);
  }

  useEffect(() => {
    void loadListings();
  }, []);

  return (
    <section id="listings" className="flex flex-col gap-7 px-4 pb-12 sm:px-8 lg:px-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-[9px]">
          <h2 className="text-[25px] font-semibold tracking-[-0.7px] text-ink">
            Rooms you’ll feel at home in
          </h2>
          <p className="text-[13px] text-muted">
            {loading ? "Finding available student spaces…" : `${rooms.length} student spaces from the community`}
          </p>
        </div>
        <div className="flex gap-3">
          <button type="button" className={actionButton} disabled>
            <ChevronsUpDown size={18} strokeWidth={1.8} className="text-brand" />
            Recommended
          </button>
          <button type="button" className={actionButton} disabled>
            <SlidersHorizontal size={18} strokeWidth={1.8} className="text-brand" />
            Filters
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-[28px] bg-card p-10 text-center text-sm text-muted shadow-raised">
          Loading listings from Supabase…
        </div>
      ) : error ? (
        <div role="alert" className="flex flex-col items-center gap-3 rounded-[28px] bg-card p-8 text-center shadow-raised">
          <p className="max-w-xl text-sm text-muted">{error}</p>
          <button type="button" onClick={() => void loadListings()} className={actionButton}>
            <RefreshCw size={16} className="text-brand" />
            Try again
          </button>
        </div>
      ) : rooms.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[28px] bg-card p-10 text-center shadow-raised">
          <House size={28} className="text-brand" />
          <h3 className="font-semibold text-ink">No listings yet</h3>
          <p className="max-w-md text-sm text-muted">
            When a boarding house is submitted and saved, it will appear here for students to explore.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-[26px] sm:grid-cols-2 lg:grid-cols-4">
          {rooms.map((listing, index) => (
            <ListingCard key={`${listing.name}-${index}`} listing={listing} />
          ))}
        </div>
      )}

      <div className="flex flex-col items-center gap-[17px] pt-[13px] pb-1.5 text-center">
        <p className="text-sm font-medium text-ink">Your next chapter starts with the right room.</p>
        <button type="button" className={actionButton} disabled>
          <ArrowRight size={18} strokeWidth={1.8} className="text-brand" />
          Explore more rooms
        </button>
        <p className="text-[11px] text-muted">Showing {rooms.length} listing{rooms.length === 1 ? "" : "s"}</p>
      </div>
    </section>
  );
}
