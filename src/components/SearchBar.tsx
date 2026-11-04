import { useState, type FormEvent } from "react";
import { BedDouble, MapPin, Search, Wallet } from "lucide-react";

export type SearchCriteria = {
  location: string;
  maxBudget: string;
  roomType: string;
};

type Props = {
  onSearch: (criteria: SearchCriteria) => void;
};

const fieldClass =
  "min-w-0 w-full rounded-xl border border-line bg-page px-3 py-2 text-sm text-ink outline-none focus:border-brand";

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
    <form
      role="search"
      onSubmit={handleSubmit}
      className="w-full px-0 py-4 lg:px-3"
    >
      <div className="grid grid-cols-1 gap-3 rounded-[32px] bg-surface p-4 shadow-raised sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_auto] lg:items-end lg:rounded-full lg:p-5">
        <label className="flex min-w-0 flex-col gap-2 px-2">
          <span className="flex items-center gap-2 text-xs font-semibold text-ink">
            <MapPin size={17} className="text-brand" /> Location or university
          </span>
          <input
            className={fieldClass}
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="e.g. Dumaguete, Silliman"
            aria-label="Search location or university"
          />
        </label>
        <label className="flex min-w-0 flex-col gap-2 px-2">
          <span className="flex items-center gap-2 text-xs font-semibold text-ink">
            <Wallet size={17} className="text-brand" /> Maximum monthly budget
          </span>
          <input
            className={fieldClass}
            type="number"
            min="0"
            step="100"
            value={maxBudget}
            onChange={(event) => setMaxBudget(event.target.value)}
            placeholder="Any budget (₱)"
            aria-label="Maximum monthly budget in pesos"
          />
        </label>
        <label className="flex min-w-0 flex-col gap-2 px-2">
          <span className="flex items-center gap-2 text-xs font-semibold text-ink">
            <BedDouble size={17} className="text-brand" /> Room type
          </span>
          <select
            className={fieldClass}
            value={roomType}
            onChange={(event) => setRoomType(event.target.value)}
            aria-label="Room type"
          >
            <option value="any">Any room type</option>
            <option value="single">Single room</option>
            <option value="shared">Shared room</option>
          </select>
        </label>
        <button
          type="submit"
          className="flex h-[46px] items-center justify-center gap-2 rounded-3xl bg-brand px-6 text-sm font-semibold text-white shadow-brand hover:brightness-95"
        >
          <Search size={18} strokeWidth={1.8} />
          Search
        </button>
      </div>
    </form>
  );
}
