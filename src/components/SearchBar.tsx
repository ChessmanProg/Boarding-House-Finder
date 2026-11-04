import { useState, type FormEvent } from "react";
import { BedDouble, MapPin, Search, Wallet } from "lucide-react";

export type SearchCriteria = { location: string; maxBudget: string; roomType: string };
type Props = { onSearch: (criteria: SearchCriteria) => void };

const fieldClass = "mt-2 w-full min-w-0 rounded-xl border border-line bg-page/70 px-3.5 py-3 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10";

export default function SearchBar({ onSearch }: Props) {
  const [location, setLocation] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [roomType, setRoomType] = useState("any");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch({ location: location.trim(), maxBudget, roomType });
    document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <form role="search" onSubmit={handleSubmit} className="w-full">
      <div className="grid grid-cols-1 gap-3 rounded-[28px] border border-line/80 bg-surface p-3 shadow-[0_18px_55px_rgba(31,72,65,0.09)] sm:grid-cols-2 lg:grid-cols-[1.45fr_1fr_1fr_auto] lg:items-end lg:gap-2 lg:rounded-full lg:p-3">
        <label className="min-w-0 px-2 py-1 text-left">
          <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.09em] text-muted"><MapPin size={15} className="text-brand" /> Location</span>
          <input className={fieldClass} value={location} onChange={event => setLocation(event.target.value)} placeholder="City, school, or neighborhood" aria-label="Search location or university" />
        </label>
        <label className="min-w-0 px-2 py-1 text-left">
          <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.09em] text-muted"><Wallet size={15} className="text-brand" /> Monthly budget</span>
          <input className={fieldClass} type="number" min="0" step="100" value={maxBudget} onChange={event => setMaxBudget(event.target.value)} placeholder="Max budget (₱)" aria-label="Maximum monthly budget in pesos" />
        </label>
        <label className="min-w-0 px-2 py-1 text-left">
          <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.09em] text-muted"><BedDouble size={15} className="text-brand" /> Room type</span>
          <select className={fieldClass} value={roomType} onChange={event => setRoomType(event.target.value)} aria-label="Room type">
            <option value="any">Any room type</option><option value="single">Single room</option><option value="shared">Shared room</option>
          </select>
        </label>
        <button type="submit" className="flex h-[50px] items-center justify-center gap-2 rounded-full bg-brand px-7 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"><Search size={18} /> Find a room</button>
      </div>
    </form>
  );
}
