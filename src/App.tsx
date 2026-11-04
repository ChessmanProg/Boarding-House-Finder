import { useEffect, useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Listings from "./components/Listings";
import Footer from "./components/Footer";
import OwnerDashboard from "./components/OwnerDashboard";
import MyListings from "./components/MyListings";
import Messaging from "./components/Messaging";
import type { SearchCriteria } from "./components/SearchBar";

type Theme = "light" | "dark";

export default function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return localStorage.getItem("bhf-theme") === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("bhf-theme", theme);
    } catch {
      // Theme still applies for this session when storage is unavailable.
    }
  }, [theme]);

  const params = new URLSearchParams(window.location.search);
  const isAdminRoute = params.get("admin") === "1";
  const isMyListingsRoute = params.get("my-listings") === "1";
  const isMessagesRoute = params.get("messages") === "1";

  let page = isAdminRoute ? <OwnerDashboard /> : isMyListingsRoute ? <MyListings /> : isMessagesRoute ? <Messaging /> : <HomePage />;

  return (
    <>
      {page}
      <button
        type="button"
        className="theme-toggle"
        onClick={() => setTheme((current) => current === "light" ? "dark" : "light")}
        aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
        title={theme === "light" ? "Dark theme" : "Light theme"}
      >
        <span aria-hidden="true">{theme === "light" ? "☾" : "☀"}</span>
        <span>{theme === "light" ? "Dark" : "Light"} theme</span>
      </button>
    </>
  );
}

function HomePage() {
  const [listingRefreshKey, setListingRefreshKey] = useState(0);
  const [submissionNotice, setSubmissionNotice] = useState("");
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    location: "",
    maxBudget: "",
    roomType: "any",
  });

  useEffect(() => {
    const clearSearch = () =>
      setSearchCriteria({ location: "", maxBudget: "", roomType: "any" });
    window.addEventListener("boarding-house-clear-search", clearSearch);
    return () => window.removeEventListener("boarding-house-clear-search", clearSearch);
  }, []);

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
        <Hero onSearch={setSearchCriteria} />
        <Listings key={listingRefreshKey} searchCriteria={searchCriteria} />
      </main>
      <Footer />
    </div>
  );
}
