import { BedDouble, CalendarDays, MapPin, Search, Wallet, type LucideIcon } from "lucide-react";

const fields: { icon: LucideIcon; label: string; value: string }[] = [
  { icon: MapPin, label: "Location/University", value: "Where do you want to stay?" },
  { icon: Wallet, label: "Budget Range", value: "₱2,000 – ₱8,000" },
  { icon: BedDouble, label: "Room Type", value: "Single / Shared" },
  { icon: CalendarDays, label: "Move-in Date", value: "Add a date" },
];

export default function SearchBar() {
  return (
    <form
      role="search"
      onSubmit={(e) => e.preventDefault()}
      className="w-full px-0 py-4 lg:px-3"
    >
      <div className="flex flex-col gap-4 rounded-[32px] bg-surface p-4 shadow-raised lg:min-h-[98px] lg:flex-row lg:items-center lg:justify-between lg:rounded-full">
        {fields.map(({ icon: Icon, label, value }, i) => (
          <div key={label} className="flex items-center lg:contents">
            {i > 0 && <span className="hidden h-10 w-px shrink-0 bg-line lg:block" />}
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-[13px] pl-3 text-left lg:w-[200px] lg:flex-none first:lg:w-[280px]"
            >
              <Icon size={21} strokeWidth={1.8} className="shrink-0 text-brand" />
              <span className="flex min-w-0 flex-col gap-2">
                <span className="text-xs font-semibold text-ink">{label}</span>
                <span className="truncate text-[13px] text-muted">{value}</span>
              </span>
            </button>
          </div>
        ))}
        <button
          type="submit"
          className="flex h-[50px] items-center justify-center gap-2.5 rounded-3xl bg-brand px-[22px] text-sm font-semibold text-white shadow-brand lg:w-[152px] lg:shrink-0"
        >
          <Search size={18} strokeWidth={1.8} />
          Search
        </button>
      </div>
    </form>
  );
}
