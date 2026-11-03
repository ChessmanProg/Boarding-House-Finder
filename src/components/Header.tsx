import { ChevronDown, House, UserRound } from "lucide-react";

const links = ["Locations", "Amenities", "Help"];

export default function Header() {
  return (
    <header className="px-4 pt-7 sm:px-8 lg:px-16">
      <div className="flex h-[84px] items-center justify-between rounded-full bg-surface px-4 shadow-raised sm:px-6">
        <a href="/" className="flex items-center gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-[18px] bg-brand-tint shadow-raised">
            <House size={27} strokeWidth={1.8} className="text-brand" />
          </span>
          <span className="hidden text-lg font-bold tracking-[-0.6px] text-ink sm:block">
            Boarding House Finder
          </span>
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          <a href="#" className="flex flex-col items-center gap-[7px] pt-2.5 text-sm font-semibold text-brand">
            Find Rooms
            <span className="h-[3px] w-[18px] rounded-sm bg-brand" />
          </a>
          {links.map((link) => (
            <a key={link} href="#" className="text-sm font-medium text-muted">
              {link}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button className="hidden h-[50px] items-center justify-center rounded-3xl bg-surface px-[22px] text-sm font-semibold text-brand-dark shadow-raised sm:flex">
            List Your Room
          </button>
          <button
            aria-label="Account menu"
            className="flex h-[50px] items-center gap-[9px] rounded-full bg-pressed py-0 pr-3 pl-1.5 shadow-pressed"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-avatar">
              <UserRound size={19} strokeWidth={1.8} className="text-avatar-icon" />
            </span>
            <ChevronDown size={15} strokeWidth={1.8} className="text-ink" />
          </button>
        </div>
      </div>
    </header>
  );
}
