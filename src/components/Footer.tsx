import { House } from "lucide-react";

const links = ["Privacy", "Terms", "Get in touch", "Philippines · PHP ₱"];

export default function Footer() {
  return (
    <footer className="flex flex-col items-center justify-between gap-4 border-t border-line px-4 py-8 sm:px-8 md:min-h-[104px] md:flex-row lg:px-16">
      <div className="flex items-center gap-2.5 text-xs text-muted">
        <House size={19} strokeWidth={1.8} className="shrink-0 text-brand" />
        © 2026 Boarding House Finder. Find your place.
      </div>
      <ul className="flex flex-wrap justify-center gap-x-[25px] gap-y-2 text-xs text-muted">
        {links.map((link) => (
          <li key={link}>
            <a href="#">{link}</a>
          </li>
        ))}
      </ul>
    </footer>
  );
}
