import { categories } from "../data";

export default function CategoryChips() {
  return (
    <div className="-mx-4 w-[calc(100%+2rem)] overflow-x-auto px-4 py-4 sm:-mx-8 sm:w-[calc(100%+4rem)] sm:px-8 lg:mx-0 lg:w-full lg:overflow-visible lg:p-0">
      <ul className="flex gap-4 lg:grid lg:grid-cols-6">
        {categories.map(({ label, icon: Icon, active }) => (
          <li key={label} className="shrink-0 lg:shrink">
            <button
              className={
                active
                  ? "flex h-[54px] w-full items-center justify-center gap-[9px] rounded-3xl border border-brand-border bg-brand-tint px-5 text-xs font-semibold whitespace-nowrap text-brand-dark shadow-pressed"
                  : "flex h-[54px] w-full items-center justify-center gap-[9px] rounded-3xl border border-white bg-page px-5 text-xs font-medium whitespace-nowrap text-ink shadow-raised"
              }
            >
              <Icon size={19} strokeWidth={1.8} className={active ? "text-brand" : "text-muted"} />
              {label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
