import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { supabase } from "../lib/supabase";

type Props = {
  onClose: () => void;
  onCreated: () => void;
};

type FormValues = {
  title: string;
  location: string;
  price: string;
  type: string;
  description: string;
  landlord_name: string;
  contact_phone: string;
  image: string;
  amenities: string;
  wifi: string;
  rules: string;
};

const initialValues: FormValues = {
  title: "",
  location: "",
  price: "",
  type: "Single Room",
  description: "",
  landlord_name: "",
  contact_phone: "",
  image: "",
  amenities: "",
  wifi: "",
  rules: "",
};

const fieldClass =
  "mt-1.5 w-full rounded-2xl bg-page px-4 py-3 text-sm text-ink shadow-pressed outline-none transition placeholder:text-muted/70 focus:ring-2 focus:ring-brand/40";

function toArray(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function ListingSubmissionModal({ onClose, onCreated }: Props) {
  const [form, setForm] = useState<FormValues>(initialValues);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateField(field: keyof FormValues, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!supabase) {
      setError("Supabase is not configured. Please check your environment variables.");
      return;
    }

    const price = Number(form.price);
    if (!Number.isFinite(price) || price <= 0) {
      setError("Please enter a monthly rent greater than zero.");
      return;
    }

    setSaving(true);
    try {
      const { error: insertError } = await supabase.from("listings").insert({
        title: form.title.trim(),
        location: form.location.trim(),
        price,
        type: form.type,
        description: form.description.trim() || null,
        landlord_name: form.landlord_name.trim() || null,
        contact_phone: form.contact_phone.trim() || null,
        image: form.image.trim() || null,
        amenities: toArray(form.amenities),
        wifi: form.wifi.trim() || null,
        rules: toArray(form.rules),
      });

      if (insertError) {
        setError(insertError.message);
        return;
      }

      onCreated();
      onClose();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Something went wrong while submitting your listing.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/35 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="listing-form-title"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[30px] bg-surface p-5 shadow-raised sm:p-8"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">For landlords</p>
            <h2 id="listing-form-title" className="mt-1 text-2xl font-bold tracking-tight text-ink">
              List your room
            </h2>
            <p className="mt-1 text-sm text-muted">
              Share the details of your boarding house with students.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close listing form"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-page text-muted shadow-pressed hover:text-ink disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-ink">
              Boarding house / listing name *
              <input
                className={fieldClass}
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                placeholder="e.g. Casa Maria Boarding House"
                required
                maxLength={100}
              />
            </label>
            <label className="block text-sm font-semibold text-ink">
              Location *
              <input
                className={fieldClass}
                value={form.location}
                onChange={(event) => updateField("location", event.target.value)}
                placeholder="Barangay, city"
                required
                maxLength={160}
              />
            </label>
            <label className="block text-sm font-semibold text-ink">
              Monthly rent (₱) *
              <input
                className={fieldClass}
                type="number"
                min="1"
                step="1"
                value={form.price}
                onChange={(event) => updateField("price", event.target.value)}
                placeholder="3500"
                required
              />
            </label>
            <label className="block text-sm font-semibold text-ink">
              Room type *
              <select
                className={fieldClass}
                value={form.type}
                onChange={(event) => updateField("type", event.target.value)}
                required
              >
                <option>Single Room</option>
                <option>Shared Room</option>
                <option>Bedspace</option>
                <option>Studio</option>
                <option>Apartment</option>
                <option>Other</option>
              </select>
            </label>
            <label className="block text-sm font-semibold text-ink">
              Landlord / contact person
              <input
                className={fieldClass}
                value={form.landlord_name}
                onChange={(event) => updateField("landlord_name", event.target.value)}
                placeholder="Full name"
                maxLength={100}
              />
            </label>
            <label className="block text-sm font-semibold text-ink">
              Contact number
              <input
                className={fieldClass}
                type="tel"
                value={form.contact_phone}
                onChange={(event) => updateField("contact_phone", event.target.value)}
                placeholder="09XX XXX XXXX"
                maxLength={30}
              />
            </label>
          </div>

          <label className="block text-sm font-semibold text-ink">
            Description
            <textarea
              className={fieldClass}
              rows={3}
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="Describe the room, nearby landmarks, and what makes it a good place to stay."
              maxLength={1500}
            />
          </label>

          <label className="block text-sm font-semibold text-ink">
            Photo URL
            <input
              className={fieldClass}
              type="url"
              value={form.image}
              onChange={(event) => updateField("image", event.target.value)}
              placeholder="https://example.com/room-photo.jpg"
            />
            <span className="mt-1 block text-xs font-normal text-muted">
              Use a publicly accessible image link for now. Photo upload can be added separately.
            </span>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-ink">
              Amenities
              <input
                className={fieldClass}
                value={form.amenities}
                onChange={(event) => updateField("amenities", event.target.value)}
                placeholder="Aircon, furnished, kitchen"
              />
              <span className="mt-1 block text-xs font-normal text-muted">Separate items with commas.</span>
            </label>
            <label className="block text-sm font-semibold text-ink">
              Wi-Fi details
              <input
                className={fieldClass}
                value={form.wifi}
                onChange={(event) => updateField("wifi", event.target.value)}
                placeholder="Included, available, or not available"
              />
            </label>
          </div>

          <label className="block text-sm font-semibold text-ink">
            House rules
            <input
              className={fieldClass}
              value={form.rules}
              onChange={(event) => updateField("rules", event.target.value)}
              placeholder="Curfew at 10 PM, no smoking"
            />
            <span className="mt-1 block text-xs font-normal text-muted">Separate rules with commas.</span>
          </label>

          {error && (
            <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-12 rounded-2xl bg-page px-5 text-sm font-semibold text-muted shadow-pressed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-12 rounded-2xl bg-brand px-6 text-sm font-semibold text-white shadow-brand transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Submitting…" : "Submit listing"}
            </button>
          </div>
          <p className="text-center text-xs text-muted">
            Required fields are marked with an asterisk. Every submission stays pending until an administrator approves it.
          </p>
        </form>
      </section>
    </div>
  );
}
