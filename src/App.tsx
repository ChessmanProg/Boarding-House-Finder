import Header from "./components/Header";
import Hero from "./components/Hero";
import Listings from "./components/Listings";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="mx-auto min-h-screen max-w-[1440px] overflow-x-hidden bg-page">
      <Header />
      <main>
        <Hero />
        <Listings />
      </main>
      <Footer />
    </div>
  );
}
