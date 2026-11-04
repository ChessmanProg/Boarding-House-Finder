import { useEffect, useState } from "react";
import { ArrowLeft, Pencil, Trash2, X, Save, House, Clock3, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "../lib/supabase";

type Listing = {
  id: string | number; title: string; location: string; price: number; type: string;
  description: string | null; landlord_name: string | null; contact_phone: string | null;
  image: string | null; images: string[] | null; amenities: string[] | null; wifi: string | null;
  rules: string[] | null; status: string; created_at?: string;
};
type EditValues = { title:string; location:string; price:string; type:string; description:string; landlord_name:string; contact_phone:string; amenities:string; wifi:string; rules:string };
const fields = "title,location,price,type,description,landlord_name,contact_phone,amenities,wifi,rules";
const inputClass = "mt-1.5 w-full rounded-xl bg-page px-3 py-2.5 text-sm text-ink shadow-pressed outline-none focus:ring-2 focus:ring-brand/30";
const listText = (values: string[] | null) => (values || []).join(", ");

export default function MyListings() {
  const [items,setItems] = useState<Listing[]>([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState("");
  const [editing,setEditing] = useState<Listing | null>(null);
  const [values,setValues] = useState<EditValues | null>(null);
  const [saving,setSaving] = useState(false);
  const [removing,setRemoving] = useState<string | number | null>(null);

  async function load() {
    if (!supabase) { setError("The database is not configured."); setLoading(false); return; }
    setLoading(true); setError("");
    const { data,error } = await supabase.from("listings").select("*").order("created_at",{ascending:false});
    if (error) setError(error.message);
    else setItems((data || []) as Listing[]);
    setLoading(false);
  }
  useEffect(()=>{ void load(); },[]);

  function beginEdit(item: Listing) {
    setEditing(item);
    setValues({title:item.title,location:item.location,price:String(item.price),type:item.type,description:item.description||"",landlord_name:item.landlord_name||"",contact_phone:item.contact_phone||"",amenities:listText(item.amenities),wifi:item.wifi||"",rules:listText(item.rules)});
  }
  function update(field:keyof EditValues,value:string) { setValues(current=>current?({...current,[field]:value}):current); }
  async function saveEdit() {
    if (!supabase || !editing || !values) return;
    const price=Number(values.price);
    if (!values.title.trim()||!values.location.trim()||!Number.isFinite(price)||price<=0) { setError("Enter a listing name, location, and valid monthly rent."); return; }
    setSaving(true); setError("");
    const {error} = await supabase.from("listings").update({
      title:values.title.trim(),location:values.location.trim(),price,type:values.type,
      description:values.description.trim()||null,landlord_name:values.landlord_name.trim()||null,
      contact_phone:values.contact_phone.trim()||null,
      amenities:values.amenities.split(",").map(v=>v.trim()).filter(Boolean),
      wifi:values.wifi.trim()||null,rules:values.rules.split(",").map(v=>v.trim()).filter(Boolean),
    }).eq("id",editing.id);
    if (error) setError(error.message);
    else { setEditing(null); setValues(null); await load(); }
    setSaving(false);
  }
  async function removeListing(item: Listing) {
    if (!supabase || !window.confirm(`Remove "${item.title}"? This cannot be undone.`)) return;
    setRemoving(item.id); setError("");
    const {error} = await supabase.from("listings").delete().eq("id",item.id);
    if (error) setError(error.message); else setItems(current=>current.filter(row=>row.id!==item.id));
    setRemoving(null);
  }
  function statusView(status:string) {
    if (status==="approved") return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700"><CheckCircle2 size={14}/>Approved</span>;
    if (status==="rejected") return <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-700"><XCircle size={14}/>Not approved</span>;
    return <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700"><Clock3 size={14}/>Pending review</span>;
  }

  return <main className="mx-auto min-h-screen max-w-[1200px] px-4 py-8 sm:px-8 lg:px-12">
    <a href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-brand"><ArrowLeft size={16}/>Back to listings</a>
    <div className="mt-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-brand">Landlord workspace</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">My Listings</h1><p className="mt-2 text-sm text-muted">Manage the rooms you submitted. Approval status is controlled by the owner.</p></div><span className="rounded-full bg-surface px-4 py-2 text-sm font-semibold text-muted shadow-raised">{items.length} listing{items.length===1?"":"s"}</span></div>
    {error&&<p role="alert" className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    {loading?<p className="py-16 text-center text-sm text-muted">Loading your listings…</p>:items.length===0?<div className="mt-8 rounded-3xl bg-surface p-10 text-center shadow-raised"><House size={32} className="mx-auto text-brand"/><h2 className="mt-3 text-lg font-bold text-ink">No listings yet</h2><p className="mt-1 text-sm text-muted">Once you submit a room, it will appear here for you to manage.</p><a href="/" className="mt-5 inline-flex rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white">Find the homepage</a></div>:<div className="mt-7 grid gap-5 md:grid-cols-2">{items.map(item=><article key={item.id} className="overflow-hidden rounded-3xl bg-surface shadow-raised"><div className="relative h-48 bg-page">{(item.images?.[0]||item.image)?<img src={item.images?.[0]||item.image||""} alt={item.title} className="h-full w-full object-cover"/>:<div className="flex h-full items-center justify-center text-muted"><House size={38}/></div>}<div className="absolute left-3 top-3">{statusView(item.status)}</div></div><div className="p-5"><div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-bold text-ink">{item.title}</h2><p className="mt-1 text-sm text-muted">{item.location} · {item.type}</p></div><p className="shrink-0 text-lg font-bold text-brand">₱{Number(item.price).toLocaleString()}<span className="text-xs font-medium text-muted">/mo</span></p></div>{item.description&&<p className="mt-3 line-clamp-2 text-sm text-muted">{item.description}</p>}<div className="mt-4 flex gap-2"><button type="button" onClick={()=>beginEdit(item)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-page px-3 py-2.5 text-sm font-semibold text-ink shadow-pressed"><Pencil size={15}/>Edit details</button><button type="button" disabled={removing===item.id} onClick={()=>void removeListing(item)} className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"><Trash2 size={15}/>{removing===item.id?"Removing…":"Remove"}</button></div></div></article>)}</div>}
    {editing&&values&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-3 backdrop-blur-sm" onMouseDown={event=>{if(event.target===event.currentTarget&&!saving){setEditing(null);setValues(null);}}}><section role="dialog" aria-modal="true" aria-labelledby="edit-listing-title" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-surface p-5 shadow-raised sm:p-7"><div className="flex items-center justify-between"><h2 id="edit-listing-title" className="text-xl font-bold text-ink">Edit listing details</h2><button type="button" onClick={()=>{setEditing(null);setValues(null);}} disabled={saving} aria-label="Close edit form" className="rounded-full bg-page p-2 text-muted"><X size={18}/></button></div><div className="mt-5 grid gap-4 sm:grid-cols-2">{([["title","Listing name"],["location","Location"],["price","Monthly rent (₱)"],["type","Room type"],["landlord_name","Contact person"],["contact_phone","Contact number"]] as [keyof EditValues,string][]).map(([field,label])=><label key={field} className="text-sm font-semibold text-ink">{label}<input className={inputClass} type={field==="price"?"number":"text"} min={field==="price"?"1":undefined} value={values[field]} onChange={event=>update(field,event.target.value)}/></label>)}</div><label className="mt-4 block text-sm font-semibold text-ink">Description<textarea className={inputClass} rows={3} value={values.description} onChange={event=>update("description",event.target.value)}/></label><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-ink">Amenities (comma-separated)<input className={inputClass} value={values.amenities} onChange={event=>update("amenities",event.target.value)}/></label><label className="text-sm font-semibold text-ink">Wi-Fi<input className={inputClass} value={values.wifi} onChange={event=>update("wifi",event.target.value)}/></label></div><label className="mt-4 block text-sm font-semibold text-ink">House rules (comma-separated)<input className={inputClass} value={values.rules} onChange={event=>update("rules",event.target.value)}/></label>{error&&<p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}<div className="mt-6 flex justify-end gap-3"><button type="button" onClick={()=>{setEditing(null);setValues(null);}} disabled={saving} className="rounded-xl bg-page px-4 py-3 text-sm font-semibold text-muted">Cancel</button><button type="button" onClick={()=>void saveEdit()} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"><Save size={16}/>{saving?"Saving…":"Save changes"}</button></div><p className="mt-3 text-xs text-muted">Photos are kept as-is. Approval status cannot be changed from this form.</p></section></div>}
  </main>;
}
