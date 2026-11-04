import { ArrowDown, Sparkles } from "lucide-react";
import SearchBar, { type SearchCriteria } from "./SearchBar";
import CategoryChips from "./CategoryChips";

type Props = { onSearch: (criteria: SearchCriteria) => void };

export default function Hero({ onSearch }: Props) {
  return (
    <section className="px-4 pt-12 pb-10 sm:px-8 sm:pt-16 lg:px-16 lg:pt-[76px]">
      <div className="mx-auto flex max-w-[1120px] flex-col items-center text-center">
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-tint px-4 py-2 text-[11px] font-semibold tracking-[0.08em] text-brand-dark">
          <Sparkles size={14} className="text-brand" /> FIND A PLACE THAT FEELS LIKE HOME
        </span>
        <h1 className="max-w-[850px] text-[38px] leading-[1.08] font-bold tracking-[-1.8px] text-ink sm:text-[54px] lg:text-[66px] lg:tracking-[-2.8px]">
          Your next home is <span className="text-brand">closer</span> than you think.
        </h1>
        <p className="mt-5 max-w-[580px] text-[15px] leading-7 text-muted sm:text-[17px]">
          Discover welcoming boarding houses, compare monthly rates, and find a space that fits your life in Dumaguete and beyond.
        </p>
        <div className="mt-9 w-full max-w-[1040px]">
          <SearchBar onSearch={onSearch} />
        </div>
        <div className="mt-4 flex items-center gap-2 text-[11px] font-medium text-muted">
          <ArrowDown size={13} className="text-brand" /> Explore available rooms below
        </div>
        <div className="mt-8 w-full"><CategoryChips /></div>
      </div>
    </section>
  );
}
