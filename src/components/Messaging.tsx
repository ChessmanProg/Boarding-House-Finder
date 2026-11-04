import { useEffect, useState } from "react";
import { ArrowLeft, Send, MessageCircle } from "lucide-react";
import { supabase } from "../lib/supabase";

type Thread = { id:string; listing_id:number; renter_id:string; landlord_id:string; last_message_at:string; listing?:{title:string;location:string} };
type Message = { id:string; sender_id:string; body:string; created_at:string };
type Props = { listingId?:number; landlordId?:string; listingTitle?:string; onClose?:()=>void };

export default function Messaging({ listingId, landlordId, listingTitle, onClose }:Props) {
 const [userId,setUserId]=useState(""); const [threads,setThreads]=useState<Thread[]>([]);
 const [thread,setThread]=useState<Thread|null>(null); const [messages,setMessages]=useState<Message[]>([]);
 const [body,setBody]=useState(""); const [busy,setBusy]=useState(false); const [error,setError]=useState("");
 async function loadMessages(id:string){ if(!supabase)return; const {data,error}=await supabase.from("messages").select("id,sender_id,body,created_at").eq("conversation_id",id).order("created_at",{ascending:true}); if(error)setError(error.message);else setMessages((data||[]) as Message[]); }
 async function loadThreads(uid:string){ if(!supabase)return; const {data,error}=await supabase.from("conversations").select("id,listing_id,renter_id,landlord_id,last_message_at").or("renter_id.eq."+uid+",landlord_id.eq."+uid).order("last_message_at",{ascending:false}); if(error){setError(error.message);return;} const rows=(data||[]) as Thread[]; for(const row of rows){const {data:listing}=await supabase.from("listings").select("title,location").eq("id",row.listing_id).maybeSingle();row.listing=listing||undefined;} setThreads(rows); }
 useEffect(()=>{let active=true;(async()=>{if(!supabase){setError("Messaging is not configured.");return;}const {data:{user}}=await supabase.auth.getUser();if(!active)return;if(!user){setError("Please sign in with an approved account to use messages.");return;}setUserId(user.id);const {data:access}=await supabase.from("user_access").select("status").eq("user_id",user.id).maybeSingle();if(access?.status!=="approved"){setError("Messaging is available after the owner approves your account.");return;}if(listingId&&landlordId){if(user.id===landlordId){setError("You cannot message yourself about your own listing.");return;}let {data:existing}=await supabase.from("conversations").select("*").eq("listing_id",listingId).eq("renter_id",user.id).maybeSingle();if(!existing){const {data:created,error}=await supabase.from("conversations").insert({listing_id:listingId,renter_id:user.id,landlord_id:landlordId}).select("*").single();if(error){const retry=await supabase.from("conversations").select("*").eq("listing_id",listingId).eq("renter_id",user.id).maybeSingle();existing=retry.data;if(!existing){setError(error.message);return;}}else existing=created;}if(active&&existing){setThread(existing as Thread);await loadMessages(existing.id);}}else await loadThreads(user.id);})();return()=>{active=false;};},[listingId,landlordId]);
 // Keep an open conversation current while the other participant is replying.
 useEffect(()=>{
  if(!thread?.id)return;
  const timer=window.setInterval(()=>{void loadMessages(thread.id);},5000);
  return ()=>window.clearInterval(timer);
 },[thread?.id]);

 // Refresh the inbox so new conversations and latest activity appear without reloading.
 useEffect(()=>{
  if(!userId||thread)return;
  const timer=window.setInterval(()=>{void loadThreads(userId);},15000);
  return ()=>window.clearInterval(timer);
 },[userId,thread?.id]);

 async function send(){if(!supabase||!thread||!body.trim()||busy)return;setBusy(true);setError("");const {error}=await supabase.from("messages").insert({conversation_id:thread.id,sender_id:userId,body:body.trim()});if(error)setError(error.message);else{setBody("");await loadMessages(thread.id);}setBusy(false);}
 return <div className="fixed inset-0 z-[70] overflow-y-auto bg-page p-4 sm:p-8"><div className="mx-auto max-w-3xl rounded-3xl bg-surface p-5 shadow-raised sm:p-8">
 <div className="mb-5 flex items-center gap-3"><button onClick={()=>thread&&!listingId?setThread(null):onClose?.()} className="rounded-full bg-page p-2 text-ink"><ArrowLeft size={18}/></button><div><h2 className="text-xl font-bold text-ink">{thread?(listingTitle||thread.listing?.title||"Conversation"):"Your messages"}</h2><p className="text-xs text-muted">Private renter–landlord conversations</p></div></div>
 {error&&<p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
 {!thread?<div className="space-y-2">{threads.length?threads.map(t=><button key={t.id} onClick={()=>{setThread(t);void loadMessages(t.id);}} className="flex w-full items-center gap-3 rounded-2xl bg-page p-4 text-left"><MessageCircle className="text-brand"/><span className="min-w-0 flex-1"><b className="block truncate text-sm text-ink">{t.listing?.title||"Listing conversation"}</b><small className="text-muted">{t.listing?.location||"Boarding House Finder"}</small></span><span className="text-xs text-muted">Open</span></button>):<p className="rounded-2xl bg-page p-8 text-center text-sm text-muted">No conversations yet. Open a listing and choose Message Landlord to start.</p>}</div>
 :<><div className="mb-4 max-h-[55vh] space-y-3 overflow-y-auto rounded-2xl bg-page p-4">{messages.map(m=><div key={m.id} className={m.sender_id===userId?"ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-brand p-3 text-sm text-white":"max-w-[85%] rounded-2xl rounded-bl-sm bg-surface p-3 text-sm text-ink shadow-raised"}><p className="whitespace-pre-wrap break-words">{m.body}</p><time className="mt-1 block text-[10px] opacity-70">{new Date(m.created_at).toLocaleString()}</time></div>)}</div><form onSubmit={e=>{e.preventDefault();void send();}} className="flex gap-2"><input value={body} onChange={e=>setBody(e.target.value)} maxLength={5000} placeholder="Write a message…" className="min-w-0 flex-1 rounded-full bg-page px-4 py-3 text-sm text-ink outline-none focus:ring-2 focus:ring-brand/30"/><button disabled={busy||!body.trim()} className="flex size-12 items-center justify-center rounded-full bg-brand text-white disabled:opacity-50" aria-label="Send message"><Send size={17}/></button></form></>}
 </div></div>;
}