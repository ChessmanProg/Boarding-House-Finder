import { useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Listings from "./components/Listings";
import Footer from "./components/Footer";

export default function App() {
  const [listingRefreshKey, setListingRefreshKey] = useState(0);

  return (
    <div className="mx-auto min-h-screen max-w-[1440px] overflow-x-hidden bg-page">
      <Header onListingCreated={() => setListingRefreshKey((key) => key + 1)} />
      <main>
        <Hero />
        <Listings key={listingRefreshKey} />
      </main>
      <Footer />
    </div>
  );
}
