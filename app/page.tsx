"use client";
import { useMemo, useState } from "react";

type EventItem = {
  id: string;
  title: string;
  date: string;
  start: string;
  end: string;
  location?: string;
  description?: string;
  color?: string;
  category?: string;
};

const days = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];

function toMinutes(t: string){ const [h,m] = t.split(":").map(Number); return h*60+m; }
function weekOf(dateStr: string){
  const d = new Date(dateStr);
  const day = (d.getDay()+6)%7;
  const monday = new Date(d); monday.setDate(d.getDate()-day);
  return Array.from({length:7},(_,i)=>{ const x=new Date(monday); x.setDate(monday.getDate()+i); return x.toISOString().slice(0,10); });
}

function icsFor(events: EventItem[]) {
  const esc = (s:string)=> (s||"").replace(/\n/g,"\\n");
  const lines = ["BEGIN:VCALENDAR","VERSION:2.0","CALSCALE:GREGORIAN","PRODID:-//CLPlanning//FR"];
  const dt = (d:string,t:string)=>{ const z=new Date(`${d}T${t}:00`); return `${z.getUTCFullYear()}${String(z.getUTCMonth()+1).padStart(2,"0")}${String(z.getUTCDate()).padStart(2,"0")}T${String(z.getUTCHours()).padStart(2,"0")}${String(z.getUTCMinutes()).padStart(2,"0")}${String(z.getUTCSeconds()).padStart(2,"0")}Z`; };
  for(const ev of events){ lines.push("BEGIN:VEVENT"); lines.push(`UID:${ev.id}@clplanning`); lines.push(`DTSTAMP:${dt(ev.date,ev.start)}`); lines.push(`DTSTART:${dt(ev.date,ev.start)}`); lines.push(`DTEND:${dt(ev.date,ev.end)}`); lines.push(`SUMMARY:${esc(ev.title)}`); if(ev.location) lines.push(`LOCATION:${esc(ev.location)}`); if(ev.description) lines.push(`DESCRIPTI
