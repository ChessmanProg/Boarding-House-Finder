import { useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Listings from "./components/Listings";
import Footer from "./components/Footer";

export default function App() {
  const [listingRefreshKey, setListingRefreshKey] = useState(0);
  const [submissionNotice, setSubmissionNotice] = useState("");

  function handleListingCreated() {
    setListingRefreshKey((key) => key + 1);
    setSubmissionNotice(
      "Your listing was submitted successfully and is now pending review. It will appear publicly after an administrator approves it.",
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-[1440px] overflow-x-hidden bg-page">
      <Header onListingCreated={handleListingCreated} />
      {submissionNotice && (
        <div
          role="status"
          className="mx-4 mt-5 flex items-start justify-between gap-4 rounded-2xl bg-brand-tint px-5 py-4 text-sm text-brand-dark shadow-raised sm:mx-8 lg:mx-16"
        >
          <p>{submissionNotice}</p>
          <button
            type="button"
            onClick={() => setSubmissionNotice("")}
            className="shrink-0 font-semibold underline underline-offset-2"
          >
            Dismiss
          </button>
        </div>
      )}
      <main>
        <Hero />
        <Listings key={listingRefreshKey} />
      </main>
      <Footer />
    </div>
  );
}
