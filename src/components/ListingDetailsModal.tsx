import { X, MapPin, Wifi, UserRound, Phone, CheckCircle2, House, MessageCircle } from "lucide-react";

export type ListingDetails = {
  title: string;
  location: string;
  price: number | string;
  type: string;
  image: string | null;
  description: string | null;
  landlord_name: string | null;
  contact_phone: string | null;
  amenities: string[] | null;
  wifi: string | null;
  rules: string[] | null;
};

type Props = { listing: ListingDetails; onClose: () => void };

function formatPrice(value: number | string) {
  const amount = Number(value);
  return Number.isFinite(amount) ? `₱${amount.toLocaleString("en-PH")}` : `₱${value}`;
}

function whatsappNumber(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = `63${digits.slice(1)}`;
  else if (digits.startsWith("9") && digits.length === 10) digits = `63${digits}`;
  return digits;
}

export default function ListingDetailsModal({ listing, onClose }: Props) {
  const phone = listing.contact_phone?.trim();
  const phoneHref = phone?.replace(/[^+\d]/g, "");
  const waNumber = phone ? whatsappNumber(phone) : "";
  const waMessage = encodeURIComponent(
    `Hi ${listing.landlord_name || "there"}! I saw your listing “${listing.title}” on Boarding House Finder in ${listing.location}. Is it still available? I'd like to know more. Thank you!`,
  );

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/45 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <section role="dialog" aria-modal="true" aria-labelledby="listing-details-title" className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[30px] bg-surface shadow-raised">
        <button type="button" onClick={onClose} aria-label="Close listing details" className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-surface/95 text-ink shadow-raised">
          <X size={19} />
        </button>
        {listing.image ? (
          <img src={listing.image} alt={`${listing.title} boarding house`} className="h-64 w-full object-cover sm:h-80" />
        ) : (
          <div className="flex h-64 items-center justify-center bg-brand-tint text-brand sm:h-80"><House size={48} /></div>
        )}
        <div className="space-y-6 p-5 sm:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">Boarding house details</p>
            <h2 id="listing-details-title" className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">{listing.title}</h2>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted"><MapPin size={16} className="shrink-0 text-brand" />{listing.location}</p>
            <p className="mt-4 text-2xl font-bold text-ink">{formatPrice(listing.price)} <span className="text-sm font-medium text-muted">/ month</span></p>
            <p className="mt-1 text-sm text-muted">{listing.type}</p>
          </div>

          {listing.description && <section><h3 className="mb-2 font-semibold text-ink">About this place</h3><p className="whitespace-pre-line text-sm leading-6 text-muted">{listing.description}</p></section>}

          {listing.amenities?.length ? <section><h3 className="mb-3 font-semibold text-ink">Amenities</h3><div className="flex flex-wrap gap-2">{listing.amenities.map((item) => <span key={item} className="rounded-full bg-brand-tint px-3 py-2 text-xs font-medium text-brand-dark">{item}</span>)}</div></section> : null}

          {listing.wifi && <section><h3 className="mb-2 flex items-center gap-2 font-semibold text-ink"><Wifi size={17} className="text-brand" />Wi-Fi</h3><p className="text-sm text-muted">{listing.wifi}</p></section>}

          {listing.rules?.length ? <section><h3 className="mb-3 font-semibold text-ink">House rules</h3><ul className="space-y-2">{listing.rules.map((rule) => <li key={rule} className="flex items-start gap-2 text-sm text-muted"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-brand" />{rule}</li>)}</ul></section> : null}

          {(listing.landlord_name || phone) && <section className="rounded-2xl bg-page p-4"><h3 className="mb-3 font-semibold text-ink">Contact information</h3>{listing.landlord_name && <p className="mb-2 flex items-center gap-2 text-sm text-muted"><UserRound size={16} className="text-brand" />{listing.landlord_name}</p>}{phone && <div className="flex flex-wrap gap-2"><a href={`tel:${phoneHref}`} className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white shadow-brand"><Phone size={16} />Call ${phone}</a>{waNumber.length >= 10 && <a href={`https://wa.me/${waNumber}?text=${waMessage}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-brand/20 bg-surface px-4 py-3 text-sm font-semibold text-brand-dark hover:bg-brand-tint"><MessageCircle size={16} />Message on WhatsApp</a>}</div>}</section>}
        </div>
      </section>
    </div>
  );
}
