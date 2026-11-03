import { Sparkles } from "lucide-react";
import SearchBar from "./SearchBar";
import CategoryChips from "./CategoryChips";

export default function Hero() {
  return (
    <section className="flex flex-col items-center gap-8 px-4 pt-[46px] pb-10 sm:px-8 lg:px-16">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex items-center gap-[7px] rounded-full bg-brand-tint px-[13px] py-[7px] text-[11px] font-semibold tracking-[0.2px] text-brand-dark">
          <Sparkles size={14} strokeWidth={1.8} className="text-brand" />A place to stay. A space to belong.
        </span>
        <h1 className="max-w-[1010px] text-[32px] leading-[1.18] font-bold tracking-[-1.2px] text-ink sm:text-[40px] lg:text-[47px] lg:tracking-[-1.8px]">
          Find your ideal boarding house
          <br className="hidden sm:block" /> near campus or work.
        </h1>
        <p className="text-[17px] text-muted">
          Affordable rooms, verified landlords, hassle-free stays.
        </p>
      </div>

      <SearchBar />
      <CategoryChips />
    </section>
  );
}
