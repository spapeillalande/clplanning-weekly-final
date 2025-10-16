\"use client\";
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
  for(const ev of events){ lines.push("BEGIN:VEVENT"); lines.push(`UID:${ev.id}@clplanning`); lines.push(`DTSTAMP:${dt(ev.date,ev.start)}`); lines.push(`DTSTART:${dt(ev.date,ev.start)}`); lines.push(`DTEND:${dt(ev.date,ev.end)}`); lines.push(`SUMMARY:${esc(ev.title)}`); if(ev.location) lines.push(`LOCATION:${esc(ev.location)}`); if(ev.description) lines.push(`DESCRIPTION:${esc(ev.description)}`); lines.push("END:VEVENT"); }
  lines.push("END:VCALENDAR"); return lines.join("\r\n");
}

export default function CalendarPage(){
  const [baseDate,setBaseDate]=useState(()=> new Date().toISOString().slice(0,10));
  const [events,setEvents]=useState<EventItem[]>([]);
  const week=useMemo(()=>weekOf(baseDate),[baseDate]);
  const hours=Array.from({length:13},(_,i)=>8+i);

  function addEvent(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const item: EventItem = {
      id: Math.random().toString(36).slice(2),
      title: String(fd.get("title")||"Sans titre"),
      date: String(fd.get("date")||week[0]),
      start: String(fd.get("start")||"09:00"),
      end: String(fd.get("end")||"10:00"),
      location: String(fd.get("location")||""),
      description: String(fd.get("description")||""),
      category: String(fd.get("category")||"Cours"),
      color: String(fd.get("color")||"#60a5fa")
    };
    setEvents(prev=>[...prev,item]);
    (e.target as HTMLFormElement).reset();
  }
  function exportICS(){ const text=icsFor(events); const blob=new Blob([text],{type:"text/calendar;charset=utf-8"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="planning.ics"; a.click(); URL.revokeObjectURL(a.href); }
  function printPDF(){ window.print(); }
  function remove(id:string){ setEvents(prev=> prev.filter(e=> e.id!==id)); }

  return (<main className="space-y-6">
    <h1 className="text-3xl font-bold">Calendrier — Vue semaine</h1>
    <div className="flex flex-wrap items-end gap-3">
      <label className="text-sm">Semaine de</label>
      <input type="date" value={baseDate} onChange={e=>setBaseDate(e.target.value)} className="border rounded px-2 py-1"/>
      <button onClick={exportICS} className="rounded-lg px-3 py-2 border bg-white shadow-sm">Exporter ICS</button>
      <button onClick={printPDF} className="rounded-lg px-3 py-2 border bg-white shadow-sm">Imprimer / PDF</button>
    </div>

    <form onSubmit={addEvent} className="grid grid-cols-2 md:grid-cols-7 gap-3 p-3 border rounded-xl bg-white shadow-sm print:hidden">
      <input name="title" placeholder="Titre (ex: Maths)" className="border rounded px-2 py-1 col-span-2 md:col-span-2" required/>
      <select name="category" className="border rounded px-2 py-1"><option>Cours</option><option>Trajet</option><option>Révision</option><option>Sport</option><option>Autre</option></select>
      <input name="date" type="date" defaultValue={week[0]} className="border rounded px-2 py-1" required/>
      <input name="start" type="time" defaultValue="09:00" className="border rounded px-2 py-1" required/>
      <input name="end" type="time" defaultValue="10:00" className="border rounded px-2 py-1" required/>
      <input name="location" placeholder="Lieu" className="border rounded px-2 py-1 col-span-1 md:col-span-2"/>
      <input name="description" placeholder="Description" className="border rounded px-2 py-1 col-span-2 md:col-span-3"/>
      <div className="flex items-center gap-2 col-span-2 md:col-span-1"><label className="text-sm">Couleur</label><input name="color" type="color" defaultValue="#60a5fa" className="h-9 w-9 p-0 border rounded"/></div>
      <button type="submit" className="col-span-2 md:col-span-1 rounded-lg px-3 py-2 bg-blue-600 text-white">Ajouter</button>
    </form>

    <div className="grid" style={{gridTemplateColumns: "5rem repeat(7, 1fr)"}}>
      <div></div>{week.map((d,i)=>(<div key={i} className="p-2 font-semibold">{['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'][i]}<div className="text-xs text-gray-600">{d}</div></div>))}
      {Array.from({length:13},(_,i)=>8+i).map((hRow)=>(<>
        <div key={`h-${hRow}`} className="border-t text-xs text-gray-600 p-2">{String(hRow).padStart(2,'0')}:00</div>
        {week.map((d,i)=>(
          <div key={`${d}-${hRow}`} className="relative border-t min-h-[3rem]">
            {events.filter(ev=>ev.date===d && toMinutes(ev.start)<(hRow+1)*60 && toMinutes(ev.end)>hRow*60).map(ev=>{
              const startM=toMinutes(ev.start); const endM=toMinutes(ev.end);
              const top=Math.max(0,(startM-hRow*60)/60*48); const height=Math.max(10,Math.min(60,(Math.min((hRow+1)*60,endM)-Math.max(hRow*60,startM)))/60*48);
              return (<div key={ev.id} className="absolute left-1 right-1 rounded-md text-xs text-white p-1 shadow" style={{backgroundColor:ev.color||'#60a5fa', top, height}}>
                <div className="font-semibold truncate">{ev.title}</div>
                <div className="opacity-90">{ev.start}–{ev.end}</div>
                {ev.location && <div className="opacity-90 truncate">{ev.location}</div>}
                <button onClick={()=>remove(ev.id)} className="absolute top-1 right-1 text-white/90">×</button>
              </div>);
            })}
          </div>
        ))}
      </>))}
    </div>
  </main>);
}
