import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ChevronsUpDown, SlidersHorizontal, House, RefreshCw, Heart } from "lucide-react";
import { listings as sampleListings, type Listing } from "../data";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import ListingCard from "./ListingCard";
import ListingDetailsModal, { type ListingDetails } from "./ListingDetailsModal";
import type { SearchCriteria } from "./SearchBar";

const actionButton = "flex h-[46px] items-center justify-center gap-2 rounded-3xl bg-surface px-4 text-sm font-semibold text-brand-dark shadow-raised";
const FAVORITES_KEY = "boarding-house-finder:favorites";
type SupabaseListing = {
  id:number; owner_id:string|null; title:string; location:string; price:number|string; type:string;
  amenities:string[]|null; image:string|null; images:string[]|null; description:string|null;
  landlord_name:string|null; contact_phone:string|null; wifi:string|null; rules:string[]|null;
};
type Props = { searchCriteria:SearchCriteria };
const fallbackImage = sampleListings[0]?.image ?? "";
function toCardListing(row:SupabaseListing):Listing {
  const amount=Number(row.price);
  return { name:row.title,location:row.location,distance:"Student-friendly location",roomType:row.type,
    price:Number.isFinite(amount)?`₱${amount.toLocaleString("en-PH")}`:`₱${row.price}`,rating:"",reviews:0,
    badge:{label:"Listing",icon:House},image:row.images?.[0]||row.image||fallbackImage };
}
function readFavorites():string[] { try { const v=JSON.parse(window.localStorage.getItem(FAVORITES_KEY)||"[]"); return Array.isArray(v)?v.filter((x):x is string=>typeof x==="string"):[]; } catch{return [];} }
function favoriteKey(room:SupabaseListing){return `${room.title}::${room.location}`;}

export default function Listings({searchCriteria}:Props) {
  const [rooms,setRooms]=useState<SupabaseListing[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [selectedListing,setSelectedListing]=useState<SupabaseListing|null>(null);
  const [sortOrder,setSortOrder]=useState("recommended");
  const [wifiOnly,setWifiOnly]=useState(false);
  const [favoritesOnly,setFavoritesOnly]=useState(false);
  const [favoriteIds,setFavoriteIds]=useState<string[]>(()=>readFavorites());
  useEffect(()=>{const sync=()=>setFavoriteIds(readFavorites());window.addEventListener("boarding-house-favorites-changed",sync);window.addEventListener("storage",sync);return()=>{window.removeEventListener("boarding-house-favorites-changed",sync);window.removeEventListener("storage",sync);};},[]);
  async function loadListings(){
    setLoading(true);setError("");
    if(!isSupabaseConfigured||!supabase){setRooms([]);setError("Supabase is not configured yet. Add your project URL and publishable key to the environment variables.");setLoading(false);return;}
    const {data,error:queryError}=await supabase.from("listings").select("id,owner_id,title,location,price,type,amenities,image,images,description,landlord_name,contact_phone,wifi,rules").eq("status","approved").order("created_at",{ascending:false});
    if(queryError){setRooms([]);setError(queryError.message);}else setRooms((data??[]) as SupabaseListing[]);
    setLoading(false);
  }
  useEffect(()=>{void loadListings();},[]);
  const filteredRooms=useMemo(()=>{
    const term=searchCriteria.location.toLocaleLowerCase();const budget=searchCriteria.maxBudget?Number(searchCriteria.maxBudget):null;
    const result=rooms.filter(room=>{
      const locationMatch=!term||room.title.toLocaleLowerCase().includes(term)||room.location.toLocaleLowerCase().includes(term);
      const amount=Number(room.price);const budgetMatch=budget===null||(Number.isFinite(amount)&&amount<=budget);
      const type=room.type.toLocaleLowerCase();const typeMatch=searchCriteria.roomType==="any"||(searchCriteria.roomType==="single"&&type.includes("single"))||(searchCriteria.roomType==="shared"&&type.includes("shared"));
      const amenityText=(room.amenities??[]).join(" ").toLocaleLowerCase();const wifiMatch=!wifiOnly||Boolean(room.wifi?.trim())||amenityText.includes("wifi")||amenityText.includes("wi-fi");
      const favoriteMatch=!favoritesOnly||favoriteIds.includes(favoriteKey(room));return locationMatch&&budgetMatch&&typeMatch&&wifiMatch&&favoriteMatch;
    });
    if(sortOrder==="price-low")result.sort((a,b)=>Number(a.price)-Number(b.price));else if(sortOrder==="price-high")result.sort((a,b)=>Number(b.price)-Number(a.price));return result;
  },[rooms,searchCriteria,sortOrder,wifiOnly,favoritesOnly,favoriteIds]);
  const hasSearch=Boolean(searchCriteria.location||searchCriteria.maxBudget||searchCriteria.roomType!=="any"||wifiOnly||favoritesOnly);
  return <section id="listings" className="flex flex-col gap-7 px-4 pb-12 sm:px-8 lg:px-16">
    <div className="flex flex-col gap-5 border-b border-line/70 pb-5 sm:flex-row sm:items-end sm:justify-between"><div className="flex flex-col gap-2"><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand">Explore available stays</p><h2 className="text-[27px] font-semibold tracking-[-1px] text-ink sm:text-[32px]">Rooms you’ll feel at home in</h2><p className="text-[13px] text-muted">{loading?"Finding available spaces…":`${filteredRooms.length} of ${rooms.length} approved places to stay`}</p></div>
      <div className="flex flex-wrap gap-3"><label className={actionButton}><ChevronsUpDown size={18} className="text-brand"/><span className="sr-only">Sort listings</span><select value={sortOrder} onChange={e=>setSortOrder(e.target.value)} className="max-w-[145px] bg-transparent outline-none" aria-label="Sort listings"><option value="recommended">Recommended</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label>
      <button type="button" className={wifiOnly?"flex h-[46px] items-center gap-2 rounded-3xl bg-brand-tint px-4 text-sm font-semibold text-brand-dark shadow-pressed":actionButton} aria-pressed={wifiOnly} onClick={()=>setWifiOnly(v=>!v)}><SlidersHorizontal size={18} className="text-brand"/>Wi-Fi {wifiOnly?"included":"filter"}</button>
      <button type="button" className={favoritesOnly?"flex h-[46px] items-center gap-2 rounded-3xl bg-brand-tint px-4 text-sm font-semibold text-brand-dark shadow-pressed":actionButton} aria-pressed={favoritesOnly} onClick={()=>setFavoritesOnly(v=>!v)}><Heart size={17} className={favoritesOnly?"fill-rose-500 text-rose-500":"text-brand"}/>Saved ({favoriteIds.length})</button>
      {hasSearch&&<button type="button" className="rounded-3xl px-3 text-sm font-semibold text-brand-dark underline" onClick={()=>{setWifiOnly(false);setFavoritesOnly(false);setSortOrder("recommended");window.dispatchEvent(new CustomEvent("boarding-house-clear-search"));}}>Clear filters</button>}</div></div>
    {loading?<div className="rounded-[28px] bg-card p-10 text-center text-sm text-muted shadow-raised">Loading listings from Supabase…</div>
    :error?<div role="alert" className="flex flex-col items-center gap-3 rounded-[28px] bg-card p-8 text-center shadow-raised"><p className="max-w-xl text-sm text-muted">{error}</p><button type="button" onClick={()=>void loadListings()} className={actionButton}><RefreshCw size={16} className="text-brand"/>Try again</button></div>
    :rooms.length===0?<div className="flex flex-col items-center gap-3 rounded-[28px] bg-card p-10 text-center shadow-raised"><House size={28} className="text-brand"/><h3 className="font-semibold text-ink">No listings yet</h3><p className="max-w-md text-sm text-muted">Approved boarding houses will appear here for students to explore. New submissions are checked before they become public.</p></div>
    :filteredRooms.length===0?<div className="flex flex-col items-center gap-3 rounded-[28px] bg-card p-10 text-center shadow-raised"><House size={28} className="text-brand"/><h3 className="font-semibold text-ink">{favoritesOnly?"No saved rooms here yet":"No matching rooms found"}</h3><p className="max-w-md text-sm text-muted">{favoritesOnly?"Tap the heart on a room to save it for later.":"Try a different location, a higher budget, or another room type."}</p></div>
    :<div className="grid grid-cols-1 gap-x-6 gap-y-[26px] sm:grid-cols-2 lg:grid-cols-4">{filteredRooms.map(room=><ListingCard key={room.id} listing={toCardListing(room)} onViewDetails={()=>setSelectedListing(room)}/>)}</div>}
    <div className="flex flex-col items-center gap-[17px] pt-[13px] pb-1.5 text-center"><p className="text-sm font-medium text-ink">Your next chapter starts with the right room.</p><p className="text-[11px] text-muted">Showing {filteredRooms.length} listing{filteredRooms.length===1?"":"s"}</p></div>
    {selectedListing&&<ListingDetailsModal listing={selectedListing as ListingDetails} onClose={()=>setSelectedListing(null)}/>}
  </section>;
}
