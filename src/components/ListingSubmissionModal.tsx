import { useEffect, useRef, useState, type FormEvent } from "react";
import { X, ImagePlus, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabase";

type Props = { onClose: () => void; onCreated: () => void };
type FormValues = { title:string; location:string; price:string; type:string; description:string; landlord_name:string; contact_phone:string; image:string; amenities:string; wifi:string; rules:string; latitude:string; longitude:string };
const initialValues:FormValues = { title:"",location:"",price:"",type:"Single Room",description:"",landlord_name:"",contact_phone:"",image:"",amenities:"",wifi:"",rules:"",latitude:"",longitude:"" };
const fieldClass = "mt-1.5 w-full rounded-2xl bg-page px-4 py-3 text-sm text-ink shadow-pressed outline-none transition placeholder:text-muted/70 focus:ring-2 focus:ring-brand/40";
function toArray(value:string) { return value.split(",").map(x=>x.trim()).filter(Boolean); }

declare global { interface Window { L?: any } }
let leafletLoader: Promise<any> | null = null;
function loadLeaflet(): Promise<any> {
  if (window.L) return Promise.resolve(window.L);
  if (!leafletLoader) {
    leafletLoader = new Promise((resolve, reject) => {
      if (!document.querySelector('link[data-leaflet-css="true"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        link.dataset.leafletCss = "true";
        document.head.appendChild(link);
      }
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => window.L ? resolve(window.L) : reject(new Error("Map library did not initialize."));
      script.onerror = () => reject(new Error("The interactive map could not load. Please try again."));
      document.head.appendChild(script);
    });
  }
  return leafletLoader;
}

export default function ListingSubmissionModal({onClose,onCreated}:Props) {
  const [form,setForm] = useState<FormValues>(initialValues);
  const [photos,setPhotos] = useState<File[]>([]);
  const [saving,setSaving] = useState(false);
  const [locating,setLocating] = useState(false);
  const [manualMapOpen,setManualMapOpen] = useState(false);
  const manualMapRef = useRef<HTMLDivElement|null>(null);
  const leafletMapRef = useRef<any>(null);
  const leafletMarkerRef = useRef<any>(null);
  const [error,setError] = useState("");
  function updateField(field:keyof FormValues,value:string) { setForm(current=>({...current,[field]:value})); }
  function choosePhotos(files:FileList|null) {
    if (!files) return;
    const picked = Array.from(files);
    if (picked.some(file=>!["image/jpeg","image/png","image/webp"].includes(file.type))) { setError("Please select JPG, PNG, or WebP photos only."); return; }
    if (picked.some(file=>file.size>5*1024*1024)) { setError("Each photo must be 5 MB or smaller."); return; }
    setError("");
    setPhotos(current=>[...current,...picked].slice(0,8));
  }
  async function locateBoardingHouse() {
    const query = form.location.trim();
    if (!query) { setError("Enter the barangay, city, or street address first so we can find it on the map."); return; }
    setLocating(true); setError("");
    try {
      const response = await fetch("https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=" + encodeURIComponent(query), { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error("The map search is temporarily unavailable. Please try again.");
      const results = await response.json() as Array<{lat:string;lon:string;display_name:string}>;
      if (!results.length) { setError("We couldn't find that address. Try adding the barangay and city."); return; }
      setForm(current => ({...current, latitude: results[0].lat, longitude: results[0].lon}));
    } catch (e) { setError(e instanceof Error ? e.message : "Could not find this location."); }
    finally { setLocating(false); }
  }
  useEffect(() => {
    if (!manualMapOpen || !manualMapRef.current) return;
    let cancelled = false;
    void loadLeaflet().then((L) => {
      if (cancelled || !manualMapRef.current) return;
      if (leafletMapRef.current) { leafletMapRef.current.invalidateSize(); return; }
      const hasCoordinates = Boolean(form.latitude.trim() && form.longitude.trim());
      const center: [number, number] = hasCoordinates ? [Number(form.latitude), Number(form.longitude)] : [12.8797, 121.774];
      const map = L.map(manualMapRef.current).setView(center, hasCoordinates ? 16 : 6);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      leafletMapRef.current = map;
      if (hasCoordinates) leafletMarkerRef.current = L.marker(center).addTo(map);
      map.on("click", (event: any) => {
        updateField("latitude", String(event.latlng.lat));
        updateField("longitude", String(event.latlng.lng));
      });
      map.invalidateSize();
    }).catch((mapError) => {
      if (!cancelled) setError(mapError instanceof Error ? mapError.message : "Could not load the interactive map.");
    });
    return () => { cancelled = true; };
  }, [manualMapOpen]);

  useEffect(() => {
    const map = leafletMapRef.current, L = window.L;
    if (!map || !L || !form.latitude.trim() || !form.longitude.trim()) return;
    const point: [number, number] = [Number(form.latitude), Number(form.longitude)];
    if (leafletMarkerRef.current) leafletMarkerRef.current.setLatLng(point);
    else leafletMarkerRef.current = L.marker(point).addTo(map);
  }, [form.latitude, form.longitude]);

  async function handleSubmit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    if (!supabase) { setError("Supabase is not configured. Please check your environment variables."); return; }
    const amount=Number(form.price);
    if (!Number.isFinite(amount)||amount<=0) { setError("Please enter a monthly rent greater than zero."); return; }
    setSaving(true);
    try {
      const {data:{user},error:userError}=await supabase.auth.getUser();
      if (userError||!user) { setError("Please sign in again before submitting your listing."); return; }
      const uploaded:string[]=[];
      for (const [index,file] of photos.entries()) {
        const ext=file.type==="image/png"?"png":file.type==="image/webp"?"webp":"jpg";
        const path=`${user.id}/${crypto.randomUUID()}-${index}.${ext}`;
        const {error:uploadError}=await supabase.storage.from("listing-gallery").upload(path,file,{contentType:file.type,cacheControl:"3600",upsert:false});
        if (uploadError) { setError(`Photo upload failed: ${uploadError.message}`); return; }
        const {data}=supabase.storage.from("listing-gallery").getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
      const imageUrls=uploaded.length?uploaded:(form.image.trim()?[form.image.trim()]:[]);
      const {error:insertError}=await supabase.from("listings").insert({
        owner_id:user.id,title:form.title.trim(),location:form.location.trim(),price:amount,type:form.type,
        description:form.description.trim()||null,landlord_name:form.landlord_name.trim()||null,
        contact_phone:form.contact_phone.trim()||null,image:imageUrls[0]||null,images:imageUrls,
        latitude:form.latitude.trim()?Number(form.latitude):null,longitude:form.longitude.trim()?Number(form.longitude):null,
        amenities:toArray(form.amenities),wifi:form.wifi.trim()||null,rules:toArray(form.rules),
      });
      if(insertError) { setError(insertError.message); return; }
      onCreated(); onClose();
    } catch (submissionError) {
      setError(submissionError instanceof Error?submissionError.message:"Something went wrong while submitting your listing.");
    } finally { setSaving(false); }
  }
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/35 p-3 backdrop-blur-sm sm:p-6" onMouseDown={event=>{if(event.target===event.currentTarget&&!saving)onClose();}}>
    <section role="dialog" aria-modal="true" aria-labelledby="listing-form-title" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[30px] bg-surface p-5 shadow-raised sm:p-8">
      <div className="mb-6 flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">For landlords</p><h2 id="listing-form-title" className="mt-1 text-2xl font-bold tracking-tight text-ink">List your room</h2><p className="mt-1 text-sm text-muted">Share the details of your boarding house with students.</p></div><button type="button" onClick={onClose} disabled={saving} aria-label="Close listing form" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-page text-muted shadow-pressed"><X size={18}/></button></div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-ink">Boarding house / listing name *<input className={fieldClass} value={form.title} onChange={e=>updateField("title",e.target.value)} placeholder="e.g. Casa Maria Boarding House" required maxLength={100}/></label>
          <label className="block text-sm font-semibold text-ink">Location *<input className={fieldClass} value={form.location} onChange={e=>updateField("location",e.target.value)} placeholder="Barangay, city" required maxLength={160}/></label>
          <label className="block text-sm font-semibold text-ink">Monthly rent (₱) *<input className={fieldClass} type="number" min="1" step="1" value={form.price} onChange={e=>updateField("price",e.target.value)} placeholder="3500" required/></label>
          <label className="block text-sm font-semibold text-ink">Room type *<select className={fieldClass} value={form.type} onChange={e=>updateField("type",e.target.value)} required>{["Single Room","Shared Room","Bedspace","Studio","Apartment","Other"].map(x=><option key={x}>{x}</option>)}</select></label>
          <label className="block text-sm font-semibold text-ink">Landlord / contact person<input className={fieldClass} value={form.landlord_name} onChange={e=>updateField("landlord_name",e.target.value)} placeholder="Full name" maxLength={100}/></label>
          <label className="block text-sm font-semibold text-ink">Contact number<input className={fieldClass} type="tel" value={form.contact_phone} onChange={e=>updateField("contact_phone",e.target.value)} placeholder="09XX XXX XXXX" maxLength={30}/></label>
        </div>
        <div className="rounded-2xl bg-page p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="text-sm font-semibold text-ink">Boarding house location on map</p><p className="mt-1 text-xs text-muted">Search the address, or pick the exact spot manually.</p></div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={()=>void locateBoardingHouse()} disabled={locating} className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{locating?"Finding location…":"Navigate on map"}</button>
              <button type="button" onClick={()=>setManualMapOpen(open=>!open)} className="rounded-xl bg-surface px-4 py-2.5 text-sm font-semibold text-ink shadow-pressed">{manualMapOpen?"Hide manual map":"Choose manually"}</button>
            </div>
          </div>
          {manualMapOpen && <div className="mt-3">
            <p className="mb-2 text-xs text-muted">Move and zoom the map, then click the exact boarding-house location to place its pin.</p>
            <div ref={manualMapRef} className="h-72 w-full overflow-hidden rounded-xl border border-line" />
            {form.latitude && form.longitude && <p className="mt-2 break-all text-xs text-muted">Selected coordinates: {Number(form.latitude).toFixed(6)}, {Number(form.longitude).toFixed(6)}</p>}
          </div>}
          {form.latitude && form.longitude ? <><div className="mt-3 overflow-hidden rounded-xl border border-line"><iframe title="Selected boarding house location" className="h-64 w-full" loading="lazy" src={"https://www.openstreetmap.org/export/embed.html?bbox="+(Number(form.longitude)-0.006)+"%2C"+(Number(form.latitude)-0.004)+"%2C"+(Number(form.longitude)+0.006)+"%2C"+(Number(form.latitude)+0.004)+"&layer=mapnik&marker="+form.latitude+"%2C"+form.longitude}/></div><p className="mt-2 text-xs text-muted">Pin selected. You can refine it by clicking the manual map above.</p></> : <div className="mt-3 flex h-28 items-center justify-center rounded-xl border border-dashed border-line text-center text-sm text-muted">Your selected location will appear here.</div>}
        </div>
        <label className="block text-sm font-semibold text-ink">Description<textarea className={fieldClass} rows={3} value={form.description} onChange={e=>updateField("description",e.target.value)} placeholder="Describe the room, nearby landmarks, and what makes it a good place to stay." maxLength={1500}/></label>
        <div className="rounded-2xl bg-page p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink"><ImagePlus size={17} className="text-brand"/>Listing photos <span className="text-xs font-normal text-muted">(up to 8)</span></div>
          <p className="mt-1 text-xs text-muted">Upload bedroom, bathroom, kitchen, and exterior photos. JPG, PNG, or WebP; max 5 MB each.</p>
          <input className="mt-3 block w-full text-sm text-muted file:mr-3 file:rounded-xl file:border-0 file:bg-brand-tint file:px-3 file:py-2 file:text-xs file:font-semibold file:text-brand-dark" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e=>choosePhotos(e.target.files)} />
          {photos.length>0 && <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{photos.map((file,index)=><div key={`${file.name}-${index}`} className="relative overflow-hidden rounded-xl bg-white"><img src={URL.createObjectURL(file)} alt={file.name} className="h-24 w-full object-cover"/><button type="button" aria-label={`Remove ${file.name}`} onClick={()=>setPhotos(current=>current.filter((_,i)=>i!==index))} className="absolute right-1 top-1 rounded-full bg-white p-1 text-red-600"><Trash2 size={13}/></button></div>)}</div>}
          <label className="mt-3 block text-xs font-semibold text-muted">Or use a single public photo URL<input className={fieldClass} type="url" value={form.image} onChange={e=>updateField("image",e.target.value)} placeholder="https://example.com/room-photo.jpg"/></label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-semibold text-ink">Amenities<input className={fieldClass} value={form.amenities} onChange={e=>updateField("amenities",e.target.value)} placeholder="Aircon, furnished, kitchen"/><span className="mt-1 block text-xs font-normal text-muted">Separate items with commas.</span></label><label className="block text-sm font-semibold text-ink">Wi-Fi details<input className={fieldClass} value={form.wifi} onChange={e=>updateField("wifi",e.target.value)} placeholder="Included, available, or not available"/></label></div>
        <label className="block text-sm font-semibold text-ink">House rules<input className={fieldClass} value={form.rules} onChange={e=>updateField("rules",e.target.value)} placeholder="Curfew at 10 PM, no smoking"/><span className="mt-1 block text-xs font-normal text-muted">Separate rules with commas.</span></label>
        {error&&<p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} disabled={saving} className="h-12 rounded-2xl bg-page px-5 text-sm font-semibold text-muted shadow-pressed">Cancel</button><button type="submit" disabled={saving} className="h-12 rounded-2xl bg-brand px-6 text-sm font-semibold text-white shadow-brand disabled:opacity-60">{saving?"Uploading photos and submitting…":"Submit listing"}</button></div>
        <p className="text-center text-xs text-muted">Every submission stays pending until an administrator approves it.</p>
      </form>
    </section>
  </div>;
}
