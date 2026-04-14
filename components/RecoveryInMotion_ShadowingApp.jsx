import React, { useState, useRef, useEffect } from "react";

// ─── Data constants ────────────────────────────────────────────────────────────

// ─── RECOVERY IN MOTION — Study Configuration ─────────────────────────────────
// Stream B: Naturalistic Workflow Observation (Addenbrooke's A&E)
// Edit the lists below to customise categories for your study.

const EVENT_TYPES = [
  { id: "documentation_admin",      label: "Documentation / Admin",      color: "#7C3AED" },
  { id: "break",                    label: "Break / Rest",                color: "#16A34A" },
  { id: "direct_patient_care",      label: "Direct Patient Care",         color: "#2563EB" },
  { id: "handover",                 label: "Handover / Briefing",         color: "#9333EA" },
  { id: "medication_task",          label: "Medication Task",             color: "#0D9488" },
  { id: "pager_phone_screen",       label: "Pager / Phone / Screen",      color: "#DC2626" },
  { id: "searching",                label: "Searching",                   color: "#D97706" },
  { id: "staff_communication",      label: "Staff Communication",         color: "#0891B2" },
  { id: "waiting",                  label: "Waiting",                     color: "#6B7280" },
];

// Bodily action / posture — grouped for sidebar sub-headers
// group: "stationary" | "moving" | "with_patient" | "carrying"
const BODILY_ACTION_TYPES = [
  { id: "sitting",                  label: "Sitting",                   group: "stationary"  },
  { id: "standing",                 label: "Standing",                  group: "stationary"  },
  { id: "walking",                  label: "Walking",                   group: "moving"      },
  { id: "running",                  label: "Running",                   group: "moving"      },
  { id: "pushing_wheelchair",       label: "Pushing wheelchair",        group: "with_patient"},
  { id: "pushing_bed",              label: "Pushing bed",               group: "with_patient"},
  { id: "support_patient_walking",  label: "Supporting patient walking",group: "with_patient"},
  { id: "carrying_light",           label: "Light",                     group: "carrying"    },
  { id: "carrying_heavy",           label: "Heavy",                     group: "carrying"    },
];

const BODILY_ACTION_GROUPS = [
  { id: "stationary",   label: "Stationary"   },
  { id: "moving",       label: "Moving"       },
  { id: "with_patient", label: "With patient" },
  { id: "carrying",     label: "Carrying"     },
];

// Environment flags — grouped by type
// group: "spatial" | "auditory" | "operational"
const ENVIRONMENT_FLAGS = [
  { id: "crowding",           label: "Crowding",          group: "spatial"      },
  { id: "buzzer",             label: "Buzzer",            group: "auditory"     },
  { id: "red_phone",          label: "Red phone",         group: "auditory"     },
  { id: "mobile_phone",       label: "Mobile phone",      group: "auditory"     },
  { id: "interruption",       label: "Interruption",      group: "operational"  },
  { id: "handover_underway",  label: "Handover underway", group: "operational"  },
  { id: "equipment_broken",   label: "Equip. broken",     group: "operational"  },
  { id: "maintenance_works",  label: "Maintenance/works", group: "operational"  },
];

const ENVIRONMENT_GROUPS = [
  { id: "spatial",     label: "Spatial"      },
  { id: "auditory",    label: "Auditory"     },
  { id: "operational", label: "Operational"  },
];

// Patient state at moment of observation
const PATIENT_STATE = [
  { id: "calm",     label: "Calm"     },
  { id: "agitated", label: "Agitated" },
  { id: "acute",    label: "Acute"    },
];

// Room density / people present
const PEOPLE_PRESENT = [
  { id: "alone", label: "Alone" },
  { id: "patient_only", label: "Patient only" },
  { id: "patient_family", label: "Patient + family" },
  { id: "small_team", label: "Small team (2–3)" },
  { id: "large_team", label: "Large team (4+)" },
  { id: "crowded", label: "Crowded space" },
];

// Participant roles — Addenbrooke's A&E staff
const PARTICIPANT_ROLES = ["nurse", "doctor"];

// Gender
const GENDER_OPTIONS = ["female", "male", "non-binary", "prefer not to say"];

// First language
const FIRST_LANGUAGE_OPTIONS = ["English", "Other", "Prefer not to say"];

// Seniority levels (Stream B Table 4) — UK NHS bandings + training grades
const SENIORITY_LEVELS = [
  { id: "band_5",          label: "Band 5"              },
  { id: "band_6",          label: "Band 6"              },
  { id: "band_7",          label: "Band 7"              },
  { id: "st3",             label: "ST3"                 },
  { id: "st4",             label: "ST4"                 },
  { id: "st5",             label: "ST5"                 },
  { id: "st6",             label: "ST6"                 },
  { id: "st7",             label: "ST7"                 },
  { id: "clinical_fellow", label: "Clinical Fellow"     },
  { id: "fy1",             label: "Foundation Year 1"   },
  { id: "fy2",             label: "Foundation Year 2"   },
  { id: "student",         label: "Student"             },
];

// Clinical experience brackets
const EXPERIENCE_CATEGORIES = ["<1 year", "1–2 years", "2–3 years", "3–5 years", "5–10 years", "10+ years"];

// Departmental operational status at session start
const DEPARTMENTAL_STATUS = ["quiet", "moderate", "busy", "overwhelmed"];

// Shift types — Addenbrooke's A&E (Table 2 of protocol)
// Nurses: Early 07:00–14:30, Late 13:30–21:00, Night 21:15–08:00
// Doctors: Day 07:45–16:15, Late 15:15–23:45, Night 10:45–08:45
const SHIFT_TYPES = ["early", "day", "late", "night"];

const ZONE_COLORS = [
  "#2563EB", // blue
  "#DC2626", // red
  "#059669", // green
  "#D97706", // amber
  "#7C3AED", // purple
  "#0891B2", // cyan
  "#9333EA", // violet
  "#16A34A", // emerald
  "#EA580C", // orange
  "#0E7490", // teal
  "#BE185D", // pink
  "#854D0E", // brown
];

// Pick the first colour not already used by an existing zone
function pickZoneColor(existingZones) {
  const used = new Set((existingZones || []).map(z => z.color));
  return ZONE_COLORS.find(c => !used.has(c)) || ZONE_COLORS[existingZones.length % ZONE_COLORS.length];
}

// Render helper — uses stored color, falls back to index for legacy zones
function zoneColor(zone, idx) { return zone?.color || ZONE_COLORS[idx % ZONE_COLORS.length]; }

// ─── Utilities ─────────────────────────────────────────────────────────────────

function nowIso() { return new Date().toISOString(); }
function safeDate(v) { const d = new Date(v); return isNaN(d.getTime()) ? null : d; }
function formatClock(v) { const d = safeDate(v); if (!d) return ""; return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }); }
function formatDuration(sec) { if (!sec) return "—"; const m = Math.floor(sec/60), s = sec%60; return m > 0 ? `${m}m ${s}s` : `${s}s`; }
function secondsBetween(a, b) { const s = safeDate(a), e = safeDate(b); if (!s || !e) return 0; return Math.max(0, Math.round((e-s)/1000)); }
function csvEscape(v) { if (v == null) return ""; const s = String(v); if (s.includes(",") || s.includes("\n") || s.includes('"')) return '"' + s.replace(/"/g,'""') + '"'; return s; }
function toCsv(rows) { if (!rows || !rows.length) return ""; const h = [...new Set(rows.flatMap(r => Object.keys(r)))]; return [h.join(","), ...rows.map(r => h.map(k => csvEscape(r[k])).join(","))].join("\n"); }
function findZoneName(zones, id) { return (zones||[]).find(z => z.id === id)?.name || ""; }
function getEventColor(t) { return EVENT_TYPES.find(e => e.id === t)?.color || "#94A3B8"; }

function pointInPolygon(pt, poly) {
  if (!poly || poly.length < 3) return false;
  let inside = false;
  for (let i = 0, j = poly.length-1; i < poly.length; j = i++) {
    const xi=poly[i].x, yi=poly[i].y, xj=poly[j].x, yj=poly[j].y;
    if (((yi > pt.y) !== (yj > pt.y)) && pt.x < ((xj-xi)*(pt.y-yi))/(yj-yi)+xi) inside = !inside;
  }
  return inside;
}

function detectZone(zones, x, y) {
  for (let i = zones.length-1; i >= 0; i--)
    if (zones[i].points && pointInPolygon({x,y}, zones[i].points)) return zones[i].id;
  return "";
}

function polygonCentroid(pts) {
  if (!pts || !pts.length) return {x:0,y:0};
  return { x: pts.reduce((s,p)=>s+p.x,0)/pts.length, y: pts.reduce((s,p)=>s+p.y,0)/pts.length };
}

function buildEventRows(session, zones, events) {
  return (events||[]).map(ev => ({
    session_id: session?.sessionId||"", date: session?.date||"", hospital: session?.hospital||"",
    department: session?.department||"", unit: session?.unit||"", observer_id: session?.observerId||"",
    participant_role: session?.participantRole||"", participant_code: session?.participantCode||"",
    gender: session?.gender||"", first_language: session?.firstLanguage||"",
    seniority_level: session?.seniorityLevel||"", clinical_experience: session?.clinicalExperience||"",
    shift_type: session?.shiftType||"", departmental_status: session?.departmentalStatus||"",
    protocol_checked: !!(session?.protocolChecked),
    event_id: ev?.id||"", event_type: ev?.eventType||"",
    bodily_action: ev?.bodilyAction||"", patient_state: ev?.patientState||"",
    start_time: ev?.startTime||"", end_time: ev?.endTime||"",
    duration_seconds: ev?.endTime ? secondsBetween(ev.startTime, ev.endTime) : "",
    zone_id: ev?.zoneId||"", zone_name: findZoneName(zones, ev?.zoneId),
    x_coord: typeof ev?.x==="number" ? ev.x : "", y_coord: typeof ev?.y==="number" ? ev.y : "",
    people_present: ev?.peoplePresent||"", interruption_flag: !!(ev?.interruptionFlag),
    interruption_type: ev?.interruptionType||"", note: ev?.note||"",
  }));
}

function buildMarkerRows(session, zones, markers) {
  return (markers||[]).map(m => ({
    session_id: session?.sessionId||"", date: session?.date||"", hospital: session?.hospital||"",
    department: session?.department||"", unit: session?.unit||"", observer_id: session?.observerId||"",
    participant_role: session?.participantRole||"", participant_code: session?.participantCode||"",
    gender: session?.gender||"", first_language: session?.firstLanguage||"",
    seniority_level: session?.seniorityLevel||"", clinical_experience: session?.clinicalExperience||"",
    shift_type: session?.shiftType||"", departmental_status: session?.departmentalStatus||"",
    marker_id: m?.id||"", marker_type: m?.markerType||"",
    category: m?.category||"", intensity_1_5: typeof m?.intensity==="number" ? m.intensity : "",
    timestamp: m?.timestamp||"", zone_id: m?.zoneId||"", zone_name: findZoneName(zones, m?.zoneId),
    x_coord: typeof m?.x==="number" ? m.x : "", y_coord: typeof m?.y==="number" ? m.y : "",
    linked_event_id: m?.linkedEventId||"", note: m?.note||"",
  }));
}

function downloadText(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

// ─── Shared UI ─────────────────────────────────────────────────────────────────

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <label style={{ display:"block", fontSize:10, fontWeight:700, letterSpacing:"0.09em", textTransform:"uppercase", color:"#64748B", marginBottom:4, fontFamily:"'DM Mono',monospace" }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type="text" }) {
  return <input type={type} value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
    style={{ width:"100%", boxSizing:"border-box", padding:"7px 10px", height:"36px", border:"1.5px solid #E2E8F0", borderRadius:6, fontSize:13, fontFamily:"'DM Sans',sans-serif", background:"#F8FAFC", color:"#1E293B", outline:"none" }}
    onFocus={e=>e.target.style.borderColor="#2563EB"} onBlur={e=>e.target.style.borderColor="#E2E8F0"} />;
}

function Select({ value, onChange, options }) {
  return (
    <select value={value||""} onChange={e=>onChange(e.target.value)}
      style={{ width:"100%", boxSizing:"border-box", padding:"7px 10px", height:"36px", border:"1.5px solid #E2E8F0", borderRadius:6, fontSize:13, fontFamily:"'DM Sans',sans-serif", background:"#F8FAFC", color:"#1E293B", cursor:"pointer", outline:"none" }}>
      <option value="">— select —</option>
      {options.map(o => <option key={typeof o==="string"?o:o.id} value={typeof o==="string"?o:o.id}>{typeof o==="string"?o:o.label}</option>)}
    </select>
  );
}

function Btn({ onClick, children, variant="primary", small=false, disabled=false }) {
  const base = { border:"none", borderRadius:6, cursor:disabled?"not-allowed":"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:small?11:13, padding:small?"4px 10px":"7px 15px", transition:"opacity 0.15s", opacity:disabled?0.4:1, whiteSpace:"nowrap" };
  const v = { primary:{background:"#2563EB",color:"#fff"}, danger:{background:"#DC2626",color:"#fff"}, ghost:{background:"#F1F5F9",color:"#1E293B"}, success:{background:"#059669",color:"#fff"}, warn:{background:"#D97706",color:"#fff"}, outline:{background:"white",color:"#2563EB",border:"1.5px solid #2563EB"} };
  return <button onClick={disabled?undefined:onClick} style={{...base,...v[variant]}}>{children}</button>;
}

function Badge({ color, children }) {
  return <span style={{ display:"inline-block", padding:"2px 7px", borderRadius:99, fontSize:10, fontWeight:700, fontFamily:"'DM Mono',monospace", background:color+"20", color, letterSpacing:"0.04em" }}>{children}</span>;
}

function IntensityPicker({ value, onChange }) {
  return (
    <div style={{ display:"flex", gap:5, marginTop:4 }}>
      {[1,2,3,4,5].map(n => (
        <button key={n} onClick={()=>onChange(n)}
          style={{ width:32, height:32, border:"none", borderRadius:5, cursor:"pointer", fontWeight:700, fontSize:12, background:n<=(value||0)?`hsl(${220-n*30},80%,50%)`:"#E2E8F0", color:n<=(value||0)?"#fff":"#94A3B8", transition:"all 0.12s" }}>
          {n}
        </button>
      ))}
    </div>
  );
}

function SectionHeader({ children, style={} }) {
  return <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:"#2563EB", borderBottom:"2px solid #DBEAFE", paddingBottom:5, marginBottom:11, fontFamily:"'DM Mono',monospace", ...style }}>{children}</div>;
}

function Panel({ title, children, onClose }) {
  return (
    <div style={{ marginTop:12, background:"white", border:"1.5px solid #DBEAFE", borderRadius:10, padding:"13px 15px", boxShadow:"0 4px 20px rgba(37,99,235,0.08)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:11 }}>
        <span style={{ fontSize:11, fontWeight:700, fontFamily:"'DM Mono',monospace", color:"#1E293B", textTransform:"uppercase", letterSpacing:"0.07em" }}>{title}</span>
        <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"#94A3B8", fontSize:17, lineHeight:1 }}>×</button>
      </div>
      {children}
    </div>
  );
}

function StatPill({ label, value, color }) {
  return (
    <div style={{ display:"flex", gap:5, alignItems:"center", background:"#F8FAFC", border:"1.5px solid #E2E8F0", borderRadius:20, padding:"3px 10px" }}>
      <span style={{ width:7, height:7, borderRadius:"50%", background:color, display:"inline-block" }} />
      <span style={{ fontSize:11, fontFamily:"'DM Mono',monospace", color:"#475569" }}>{label}: </span>
      <span style={{ fontSize:12, fontWeight:700, fontFamily:"'DM Mono',monospace", color:"#1E293B" }}>{value}</span>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ background:"#F8FAFC", border:"1.5px solid #E2E8F0", borderRadius:10, padding:"11px 16px", minWidth:85 }}>
      <div style={{ fontSize:19, fontWeight:800, fontFamily:"'DM Mono',monospace", color }}>{value}</div>
      <div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.07em", color:"#94A3B8", marginTop:2, fontFamily:"'DM Sans',sans-serif" }}>{label}</div>
    </div>
  );
}

// ─── FloorplanCanvas ───────────────────────────────────────────────────────────

function FloorplanCanvas({ imageUrl, zones, drawingMode=false, draftPoints=[], hoverPoint=null, onCanvasClick, onCanvasMouseMove, onCanvasMouseLeave, events=[], markers=[], pendingPos=null, height=480, previewPoly=null }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [canvasDims, setCanvasDims] = useState({ width: 1000, height: 600 });

  useEffect(() => {
    if (!imageUrl) { setImgLoaded(false); setCanvasDims({ width: 1000, height: 600 }); return; }
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setCanvasDims({ width: img.naturalWidth, height: img.naturalHeight });
      setImgLoaded(true);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Constrain width so the canvas never stretches beyond its natural aspect ratio
  const aspectRatio = canvasDims.width / canvasDims.height;
  const maxWidth = Math.round(height * aspectRatio);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    if (imageUrl && imgRef.current && imgLoaded) {
      ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = "#F1F5F9";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Grid lines
      ctx.strokeStyle = "#E2E8F0"; ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke(); }
      for (let y = 0; y < canvas.height; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); ctx.stroke(); }
      ctx.fillStyle = "#CBD5E1"; ctx.font = "13px DM Mono,monospace"; ctx.textAlign = "center";
      ctx.fillText("Upload a floorplan image in the Setup tab", canvas.width/2, canvas.height/2 - 10);
      ctx.fillText("then draw zones by clicking on it", canvas.width/2, canvas.height/2 + 10);
      ctx.textAlign = "left";
    }

    // Completed zones
    zones.forEach((zone, idx) => {
      if (!zone.points || zone.points.length < 2) return;
      const color = zoneColor(zone, idx);
      ctx.beginPath();
      ctx.moveTo(zone.points[0].x, zone.points[0].y);
      zone.points.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
      ctx.closePath();
      ctx.fillStyle = color + "30"; ctx.fill();
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.setLineDash([]); ctx.stroke();
      // Label
      const c = polygonCentroid(zone.points);
      ctx.font = "bold 11px DM Mono,monospace"; ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      const tw = ctx.measureText(zone.name).width;
      ctx.fillRect(c.x - tw/2 - 4, c.y - 11, tw + 8, 16);
      ctx.fillStyle = color; ctx.fillText(zone.name, c.x, c.y); ctx.textAlign = "left";
      // Vertices
      zone.points.forEach(p => { ctx.beginPath(); ctx.arc(p.x,p.y,3,0,Math.PI*2); ctx.fillStyle=color; ctx.fill(); });
    });

    // Preview polygon (completed but not yet named — shown in amber)
    if (previewPoly && previewPoly.length >= 3) {
      ctx.beginPath();
      ctx.moveTo(previewPoly[0].x, previewPoly[0].y);
      previewPoly.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
      ctx.closePath();
      ctx.fillStyle = "#F59E0B30"; ctx.fill();
      ctx.strokeStyle = "#F59E0B"; ctx.lineWidth = Math.max(2, 2 * (canvasDims.width / 1000));
      ctx.setLineDash([]); ctx.stroke();
    }

    // Draft polygon
    if (drawingMode && draftPoints.length > 0) {
      // Scale-aware sizes: lineWidth and snap threshold in canvas pixels
      const scale = canvasDims.width / 1000; // relative to a 1000px reference
      const lw = Math.max(2, 2 * scale);
      const snapThreshold = 12 * scale;
      const dotR = Math.max(6, 6 * scale);
      const snapRingR = Math.max(14, 14 * scale);

      ctx.strokeStyle = "#F59E0B"; ctx.lineWidth = lw; ctx.setLineDash([8 * scale, 5 * scale]);
      ctx.beginPath(); ctx.moveTo(draftPoints[0].x, draftPoints[0].y);
      draftPoints.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
      if (hoverPoint) ctx.lineTo(hoverPoint.x, hoverPoint.y);
      ctx.stroke(); ctx.setLineDash([]);
      draftPoints.forEach((p, i) => {
        ctx.beginPath(); ctx.arc(p.x, p.y, i===0 ? dotR : dotR * 0.6, 0, Math.PI*2);
        ctx.fillStyle = i===0?"#F59E0B":"#FCD34D"; ctx.strokeStyle="white"; ctx.lineWidth=lw; ctx.fill(); ctx.stroke();
      });
      if (draftPoints.length >= 3 && hoverPoint) {
        const fp = draftPoints[0];
        if (Math.hypot(hoverPoint.x-fp.x, hoverPoint.y-fp.y) < snapThreshold) {
          ctx.beginPath(); ctx.arc(fp.x,fp.y,snapRingR,0,Math.PI*2); ctx.strokeStyle="#F59E0B"; ctx.lineWidth=lw+1; ctx.stroke();
        }
      }
    }

    // Events
    events.forEach(ev => {
      const color = getEventColor(ev.eventType);
      ctx.beginPath(); ctx.arc(ev.x, ev.y, 6, 0, Math.PI*2);
      ctx.fillStyle = ev.endTime ? color+"70" : color; ctx.fill();
      ctx.strokeStyle = "white"; ctx.lineWidth = 1.5; ctx.stroke();
    });

    // Markers (triangles)
    markers.forEach(m => {
      const color = m.markerType==="stress" ? "#DC2626" : "#059669";
      ctx.beginPath(); ctx.moveTo(m.x, m.y-7); ctx.lineTo(m.x+6, m.y+5); ctx.lineTo(m.x-6, m.y+5); ctx.closePath();
      ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle="white"; ctx.lineWidth=1.5; ctx.stroke();
    });

    // Pending ring
    if (pendingPos) {
      ctx.beginPath(); ctx.arc(pendingPos.x, pendingPos.y, 10, 0, Math.PI*2);
      ctx.strokeStyle="#2563EB"; ctx.lineWidth=2; ctx.stroke();
      ctx.fillStyle="rgba(37,99,235,0.15)"; ctx.fill();
    }
  }, [imageUrl, imgLoaded, zones, drawingMode, draftPoints, hoverPoint, events, markers, pendingPos, canvasDims, previewPoly]);

  function getPos(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const sx = canvasRef.current.width / rect.width;
    const sy = canvasRef.current.height / rect.height;
    return { x: Math.round((e.clientX - rect.left) * sx), y: Math.round((e.clientY - rect.top) * sy), scale: sx };
  }

  // Always wire mousemove so React doesn't drop events when drawingMode toggles
  function handleMouseMove(e) {
    if (onCanvasMouseMove) onCanvasMouseMove(getPos(e));
  }

  return (
    <canvas ref={canvasRef} width={canvasDims.width} height={canvasDims.height}
      onClick={onCanvasClick ? e => onCanvasClick(getPos(e)) : undefined}
      onMouseMove={handleMouseMove}
      onMouseLeave={onCanvasMouseLeave}
      style={{ width:"100%", maxWidth:maxWidth, height:"auto", maxHeight:height, borderRadius:10, display:"block", cursor: onCanvasClick ? "crosshair" : "default" }}
    />
  );
}

// ─── Setup Tab ─────────────────────────────────────────────────────────────────

function SetupTab({ session, setSession, study, updateStudy, zones, setZones, floorplanUrl, setFloorplanUrl }) {
  const [drawingZone, setDrawingZone] = useState(false);
  const [draftPoints, setDraftPoints] = useState([]);
  const [hoverPoint, setHoverPoint] = useState(null);
  const [pendingName, setPendingName] = useState("");
  const [awaitingName, setAwaitingName] = useState(false);
  const [completedPoly, setCompletedPoly] = useState(null);
  const fileRef = useRef(null);
  const zoneFileRef = useRef(null);

  function updateSession(key, val) { setSession(s => ({...s, [key]: val})); }

  function handleImageFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => setFloorplanUrl(e.target.result);
    reader.readAsDataURL(file);
  }

  function exportZoneConfig() {
    const config = {
      version: 1,
      exportedAt: new Date().toISOString(),
      hospital: study.hospital,
      department: study.department,
      floorplanUrl: floorplanUrl || null,
      zones,
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dept = (study.department || "zones").replace(/\s+/g, "_");
    a.href = url; a.download = `rim_zones_${dept}.json`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  }

  function handleZoneImport(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const config = JSON.parse(e.target.result);
        if (config.zones) setZones(config.zones);
        if (config.floorplanUrl) setFloorplanUrl(config.floorplanUrl);
        if (config.hospital) updateStudy("hospital", config.hospital);
        if (config.department) updateStudy("department", config.department);
      } catch {
        alert("Could not read zone file — make sure it's a valid Recovery in Motion zone export.");
      }
    };
    reader.readAsText(file);
  }

  function handleCanvasClick(pos) {
    if (!drawingZone) return;
    if (draftPoints.length >= 3) {
      const fp = draftPoints[0];
      // 12 CSS pixels converted to canvas pixels via scale factor
      const threshold = (pos.scale || 1) * 12;
      if (Math.hypot(pos.x - fp.x, pos.y - fp.y) < threshold) {
        setCompletedPoly([...draftPoints]);
        setDraftPoints([]); setHoverPoint(null);
        setDrawingZone(false); setAwaitingName(true); setPendingName("");
        return;
      }
    }
    setDraftPoints(pts => [...pts, pos]);
  }

  function confirmZoneName() {
    if (!pendingName.trim() || !completedPoly) return;
    setZones(z => {
      const color = pickZoneColor(z);
      return [...z, { id: "Z-" + Date.now(), name: pendingName.trim(), points: completedPoly, color }];
    });
    setCompletedPoly(null); setPendingName(""); setAwaitingName(false);
  }

  function cancelDraft() {
    setDraftPoints([]); setHoverPoint(null);
    setDrawingZone(false); setAwaitingName(false); setCompletedPoly(null);
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* Hidden file input — kept at top level so ref is always mounted */}
      <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={e => handleImageFile(e.target.files[0])} />
      <input ref={zoneFileRef} type="file" accept=".json" style={{ display:"none" }} onChange={e => handleZoneImport(e.target.files[0])} />

      {/* ── TOP STRIP: session details horizontally ── */}
      <div style={{ background:"white", border:"1.5px solid #E2E8F0", borderRadius:10, padding:"13px 16px" }}>
        <SectionHeader>Session Details</SectionHeader>
        <div style={{ display:"grid", gridTemplateColumns:"180px 160px 1fr 1fr 160px 160px", gap:12, alignItems:"end" }}>
          <Field label="Date"><Input value={session.date} onChange={v=>updateSession("date",v)} type="date" /></Field>
          <Field label="Observer ID"><Input value={session.observerId} onChange={v=>updateSession("observerId",v)} placeholder="OBS-01" /></Field>
          <Field label="Hospital"><Input value={study.hospital} onChange={v=>updateStudy("hospital",v)} placeholder="Trust / Hospital" /></Field>
          <Field label="Department"><Input value={study.department} onChange={v=>updateStudy("department",v)} placeholder="ED, ICU…" /></Field>
          <Field label="Shift Type"><Select value={session.shiftType} onChange={v=>updateSession("shiftType",v)} options={SHIFT_TYPES} /></Field>
          <Field label="Dept. Status"><Select value={session.departmentalStatus} onChange={v=>updateSession("departmentalStatus",v)} options={DEPARTMENTAL_STATUS} /></Field>
        </div>
        <div style={{ marginTop:6, marginBottom:4, fontSize:10, color:"#94A3B8", fontFamily:"'DM Mono',monospace" }}>
          Hospital &amp; Department are shared across participants and will not reset on New Participant.
        </div>
        <div style={{ display:"flex", gap:16, alignItems:"center", marginTop:10, flexWrap:"wrap" }}>
          {/* Observation mode inline */}
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:"#64748B", fontFamily:"'DM Mono',monospace" }}>Mode</span>
            {[{ id:"zone", label:"⬡ Zone Observation" }, { id:"person", label:"◎ Person Tracking" }].map(mode => {
              const active = session.observationMode === mode.id;
              return (
                <button key={mode.id} onClick={() => updateSession("observationMode", mode.id)}
                  style={{ border:"1.5px solid "+(active?"#2563EB":"#E2E8F0"), borderRadius:6, background:active?"#EFF6FF":"white", padding:"5px 12px", cursor:"pointer", fontSize:11, fontWeight:700, fontFamily:"'DM Sans',sans-serif", color:active?"#2563EB":"#94A3B8", transition:"all 0.12s" }}>
                  {mode.label}
                </button>
              );
            })}
          </div>
          <label style={{ display:"flex", gap:7, alignItems:"center", fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", color:"#475569", marginLeft:"auto" }}>
            <input type="checkbox" checked={!!session.protocolChecked} onChange={e=>updateSession("protocolChecked", e.target.checked)} />
            Protocol compliance confirmed
          </label>
          <div style={{ padding:"4px 10px", background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:5, fontSize:10, color:"#166534", fontFamily:"'DM Mono',monospace" }}>
            ID: {session.sessionId}
          </div>
        </div>
      </div>

      {/* ── MAIN ROW: floorplan left, participant + zones right ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 380px", gap:24, alignItems:"start" }}>

        {/* Left: floorplan & zone drawing */}
        <div>
          <SectionHeader>Floorplan & Zone Drawing</SectionHeader>

          <div style={{ display:"flex", gap:8, marginBottom:10, alignItems:"center", flexWrap:"wrap" }}>
            <Btn onClick={() => fileRef.current.click()} variant="outline">⬆ Upload Floorplan</Btn>
            {floorplanUrl && <Btn onClick={() => setFloorplanUrl(null)} variant="ghost" small>Remove</Btn>}
            <span style={{ fontSize:10, color:"#94A3B8", fontFamily:"'DM Mono',monospace" }}>PNG · JPG · GIF</span>
            <div style={{ marginLeft:"auto", display:"flex", gap:6 }}>
              <Btn onClick={() => zoneFileRef.current.click()} variant="ghost" small>⬆ Load Zone Config</Btn>
              {(zones.length > 0 || floorplanUrl) && (
                <Btn onClick={exportZoneConfig} variant="ghost" small>⬇ Save Zone Config</Btn>
              )}
            </div>
          </div>

          <div style={{ display:"flex", gap:8, marginBottom:9, alignItems:"center", flexWrap:"wrap" }}>
            {!drawingZone && !awaitingName && (
              <Btn onClick={() => { setDrawingZone(true); setDraftPoints([]); }} variant="primary" small disabled={!floorplanUrl}>
                ✏ Draw Zone
              </Btn>
            )}
            {drawingZone && (
              <>
                <div style={{ fontSize:11, color:"#D97706", fontFamily:"'DM Mono',monospace", background:"#FFFBEB", border:"1.5px solid #FCD34D", borderRadius:5, padding:"3px 9px" }}>
                  {draftPoints.length === 0 ? "Click to place first point" : draftPoints.length < 3 ? `${draftPoints.length} point${draftPoints.length>1?"s":""} — keep clicking` : "Click near ⬤ first point to close polygon"}
                </div>
                <Btn onClick={cancelDraft} variant="ghost" small>Cancel</Btn>
              </>
            )}
            {zones.length > 0 && !drawingZone && !awaitingName && (
              <span style={{ fontSize:11, color:"#059669", fontFamily:"'DM Mono',monospace" }}>✓ {zones.length} zone{zones.length>1?"s":""} defined</span>
            )}
          </div>

          <div style={{ border:"2px solid " + (drawingZone ? "#F59E0B" : "#E2E8F0"), borderRadius:12, overflow:"hidden", lineHeight:0, alignSelf:"start" }}>
            <FloorplanCanvas
              imageUrl={floorplanUrl} zones={zones}
              drawingMode={drawingZone} draftPoints={draftPoints} hoverPoint={hoverPoint}
              onCanvasClick={handleCanvasClick}
              onCanvasMouseMove={setHoverPoint}
              onCanvasMouseLeave={() => setHoverPoint(null)}
              height={460}
              previewPoly={completedPoly}
            />
          </div>

          {awaitingName && (
            <div style={{ marginTop:10, background:"#FFFBEB", border:"1.5px solid #FCD34D", borderRadius:8, padding:"11px 14px", display:"flex", gap:8, alignItems:"center" }}>
              <span style={{ fontSize:11, color:"#92400E", fontFamily:"'DM Mono',monospace", fontWeight:700, flexShrink:0 }}>Name this zone:</span>
              <div style={{ flex:1 }}>
                <input autoFocus value={pendingName} onChange={e => setPendingName(e.target.value)} onKeyDown={e => e.key==="Enter" && confirmZoneName()}
                  placeholder="e.g. Nurses' Station, Corridor A…"
                  style={{ width:"100%", boxSizing:"border-box", padding:"6px 10px", border:"1.5px solid #FCD34D", borderRadius:6, fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:"none" }} />
              </div>
              <Btn onClick={confirmZoneName} variant="warn" small>Save Zone</Btn>
              <Btn onClick={cancelDraft} variant="ghost" small>Discard</Btn>
            </div>
          )}
        </div>

        {/* Right: participant information + zones */}
        <div>
          <SectionHeader>Participant Information</SectionHeader>
          <Field label="Participant Code"><Input value={session.participantCode} onChange={v=>updateSession("participantCode",v)} placeholder="P-01" /></Field>
          <Field label="Participant Role"><Select value={session.participantRole} onChange={v=>updateSession("participantRole",v)} options={PARTICIPANT_ROLES} /></Field>
          <Field label="Gender"><Select value={session.gender} onChange={v=>updateSession("gender",v)} options={GENDER_OPTIONS} /></Field>
          <Field label="Seniority Level"><Select value={session.seniorityLevel} onChange={v=>updateSession("seniorityLevel",v)} options={SENIORITY_LEVELS} /></Field>
          <Field label="Clinical Experience"><Select value={session.clinicalExperience} onChange={v=>updateSession("clinicalExperience",v)} options={EXPERIENCE_CATEGORIES} /></Field>
          <Field label="First Language"><Select value={session.firstLanguage} onChange={v=>updateSession("firstLanguage",v)} options={FIRST_LANGUAGE_OPTIONS} /></Field>

          <SectionHeader style={{ marginTop:18 }}>Zones ({zones.length})</SectionHeader>
          {zones.length === 0 && <p style={{ fontSize:12, color:"#94A3B8", fontFamily:"'DM Sans',sans-serif", marginTop:0 }}>No zones yet. Upload a floorplan and click "Draw Zone".</p>}
          <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
            {zones.map((z, idx) => (
              <div key={z.id} style={{ display:"flex", alignItems:"center", gap:8, background:"#F8FAFC", border:"1.5px solid #E2E8F0", borderRadius:6, padding:"5px 9px" }}>
                <span style={{ width:9, height:9, borderRadius:3, background:zoneColor(z, idx), display:"inline-block", flexShrink:0 }} />
                <span style={{ fontSize:12, fontFamily:"'DM Sans',sans-serif", color:"#1E293B", fontWeight:600, flex:1 }}>{z.name}</span>
                <span style={{ fontSize:9, color:"#94A3B8", fontFamily:"'DM Mono',monospace" }}>{z.points?.length||0}pt</span>
                <button onClick={() => setZones(zs => zs.filter(x => x.id !== z.id))} style={{ background:"none", border:"none", cursor:"pointer", color:"#CBD5E1", fontSize:14, lineHeight:1, padding:0 }}>×</button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Live timer hook ───────────────────────────────────────────────────────────

function useElapsed(startIso) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!startIso) { setElapsed(0); return; }
    function tick() {
      setElapsed(Math.max(0, Math.round((Date.now() - new Date(startIso).getTime()) / 1000)));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startIso]);
  return elapsed;
}

function formatElapsed(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

// ─── Shared: Quick Marker Panel ───────────────────────────────────────────────

function QuickMarkerPanel({ markers, setMarkers, activeEventId, activeEv, zones }) {

  function stampMarker(markerType, category) {
    const ref = activeEv || null;
    const x = ref ? ref.x + (Math.random() * 16 - 8) : 500;
    const y = ref ? ref.y + (Math.random() * 16 - 8) : 240;
    const autoZone = ref?.zoneId || detectZone(zones, x, y);
    setMarkers(ms => [{
      id: "M-" + Date.now(), markerType, category, intensity: 3,
      timestamp: nowIso(), zoneId: autoZone,
      x: Math.round(x), y: Math.round(y),
      linkedEventId: activeEventId || "",
    }, ...ms]);
  }


  return (
    <div style={{ background: "white", border: "1.5px solid #E2E8F0", borderRadius: 10, padding: "10px 11px" }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748B", fontFamily: "'DM Mono',monospace", marginBottom: 8 }}>
        Quick Markers {activeEv && <span style={{ color: "#059669", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>↳ linked</span>}
      </div>

      {/* ── ENVIRONMENT — grouped ── */}
      <div style={{ fontSize: 10, fontWeight: 700, color: "#B45309", fontFamily: "'DM Mono',monospace", marginBottom: 4, letterSpacing: "0.05em" }}>⚑ Environment</div>
      {ENVIRONMENT_GROUPS.map(grp => (
        <div key={grp.id} style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase",
            color: "#94A3B8", fontFamily: "'DM Mono',monospace", marginBottom: 2 }}>{grp.label}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
            {ENVIRONMENT_FLAGS.filter(f => f.group === grp.id).map(cat => (
              <button key={cat.id} onClick={() => stampMarker("contextual", cat.id)}
                style={{ padding: "5px 2px", border: "1.5px solid #FEF3C7", borderRadius: 5, cursor: "pointer", fontSize: 10, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", background: "#FFFBEB", color: "#B45309", lineHeight: 1.2, textAlign: "center" }}
                onMouseOver={e => { e.currentTarget.style.background = "#D97706"; e.currentTarget.style.color = "white"; }}
                onMouseOut={e => { e.currentTarget.style.background = "#FFFBEB"; e.currentTarget.style.color = "#B45309"; }}>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* ── Recent log ── */}
      {markers.length > 0 && (
        <div style={{ marginTop: 8, borderTop: "1px solid #F1F5F9", paddingTop: 6, display: "flex", flexDirection: "column", gap: 3 }}>
          {markers.slice(0, 4).map(m => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, fontFamily: "'DM Mono',monospace" }}>
              <span style={{ color: "#B45309" }}>⚑</span>
              <span style={{ color: "#475569", flex: 1 }}>{ENVIRONMENT_FLAGS.find(c => c.id === m.category)?.label || m.category}</span>
              <span style={{ color: "#CBD5E1" }}>{formatClock(m.timestamp)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Shared: Timer block ───────────────────────────────────────────────────────

function TimerBlock({ activeEv, elapsed, zones, onEnd }) {
  const activeColor = activeEv ? getEventColor(activeEv.eventType) : "#94A3B8";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, background: activeEv ? activeColor + "0C" : "#F8FAFC", border: "1.5px solid " + (activeEv ? activeColor + "50" : "#E2E8F0"), borderRadius: 8, padding: "7px 10px", transition: "all 0.25s" }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: activeEv ? activeColor : "#E2E8F0", flexShrink: 0 }} />
      <span style={{ fontSize: 18, fontWeight: 800, fontFamily: "'DM Mono',monospace", color: activeEv ? "#1E293B" : "#CBD5E1", letterSpacing: "-0.02em", minWidth: 52 }}>
        {formatElapsed(elapsed)}
      </span>
      {activeEv && (
        <span style={{ fontSize: 10, fontWeight: 700, color: activeColor, fontFamily: "'DM Mono',monospace", textTransform: "uppercase", letterSpacing: "0.06em", flex: 1, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
          {EVENT_TYPES.find(e => e.id === activeEv.eventType)?.label}
          {activeEv.zoneId ? <span style={{ fontWeight: 400, color: "#94A3B8" }}> · {findZoneName(zones, activeEv.zoneId)}</span> : null}
        </span>
      )}
      {!activeEv && <span style={{ fontSize: 11, color: "#CBD5E1", fontFamily: "'DM Sans',sans-serif", flex: 1 }}>No active event</span>}
      {activeEv && onEnd && (
        <button onClick={onEnd} style={{ flexShrink: 0, padding: "4px 10px", border: "none", borderRadius: 5, background: "#DC2626", color: "white", fontWeight: 700, fontSize: 11, fontFamily: "'DM Sans',sans-serif", cursor: "pointer" }}>■ End</button>
      )}
    </div>
  );
}

// ─── Shared: Session counts ────────────────────────────────────────────────────

function SessionCounts({ events, markers }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6 }}>
      {[
        { label: "Events",    value: events.length,                                             color: "#2563EB" },
        { label: "Stress",    value: markers.filter(m => m.markerType === "stress").length,     color: "#DC2626" },
        { label: "Recovery",  value: markers.filter(m => m.markerType === "recovery").length,   color: "#059669" },
        { label: "Context",   value: markers.filter(m => m.markerType === "contextual").length, color: "#B45309" },
      ].map(s => (
        <div key={s.label} style={{ background: "white", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "8px 6px", textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'DM Mono',monospace", color: s.color, lineHeight: 1 }}>{s.value}</div>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.07em", color: "#94A3B8", marginTop: 3, fontFamily: "'DM Sans',sans-serif" }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Shared: Event log ─────────────────────────────────────────────────────────

function EventLog({ events, setEvents, activeEventId, setActiveEventId }) {
  if (!events.length) return null;

  function deleteEvent(id) {
    setEvents(evs => evs.filter(e => e.id !== id));
    if (activeEventId === id && setActiveEventId) setActiveEventId(null);
  }

  return (
    <div style={{ background: "white", borderTop: "1.5px solid #E2E8F0", overflow: "hidden" }}>
      <div style={{ padding: "4px 12px", borderBottom: "1px solid #F1F5F9", fontSize: 9, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Log</div>
      {events.slice(0, 6).map((ev, i) => (
        <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 12px", borderBottom: i < Math.min(5, events.length - 1) ? "1px solid #F8FAFC" : "none" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: getEventColor(ev.eventType), flexShrink: 0, opacity: ev.endTime ? 0.3 : 1 }} />
          <span style={{ fontSize: 11, fontFamily: "'DM Sans',sans-serif", color: "#475569", flex: 1 }}>{EVENT_TYPES.find(e => e.id === ev.eventType)?.label || "—"}</span>
          <span style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: "#94A3B8" }}>{formatClock(ev.startTime)}</span>
          {ev.endTime
            ? <span style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: "#CBD5E1" }}>{formatDuration(secondsBetween(ev.startTime, ev.endTime))}</span>
            : <span style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: "#2563EB", fontWeight: 700 }}>LIVE</span>}
          <button onClick={() => deleteEvent(ev.id)}
            title="Delete this event"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#CBD5E1", fontSize: 14, lineHeight: 1, padding: "0 2px", flexShrink: 0 }}
            onMouseOver={e => e.currentTarget.style.color = "#DC2626"}
            onMouseOut={e => e.currentTarget.style.color = "#CBD5E1"}>
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── ZONE OBSERVATION Live Tab ─────────────────────────────────────────────────

function ZoneLiveTab({ session, zones, events, setEvents, markers, setMarkers, floorplanUrl }) {
  const [activeEventId, setActiveEventId] = useState(null);
  const [awaitingPlace, setAwaitingPlace] = useState(false);
  const [eventType, setEventType] = useState("");
  const [peoplePresent, setPeoplePresent] = useState("");
  const [bodilyAction, setBodilyAction] = useState("");
  const [patientState, setPatientState] = useState("");
  const [interruptionFlag, setInterruptionFlag] = useState(false);

  const activeEv = events.find(e => e.id === activeEventId && !e.endTime);
  const elapsed = useElapsed(activeEv?.startTime || null);

  function handleCanvasClick(pos) {
    if (!awaitingPlace) return;
    const autoZone = detectZone(zones, pos.x, pos.y);
    const ev = { id: "E-" + Date.now(), eventType, peoplePresent, bodilyAction, patientState, interruptionFlag, zoneId: autoZone, startTime: nowIso(), x: pos.x, y: pos.y };
    setEvents(e => [ev, ...e]);
    setActiveEventId(ev.id);
    setAwaitingPlace(false);
    setInterruptionFlag(false);
  }

  function endEvent() {
    setEvents(evs => evs.map(ev => ev.id === activeEventId ? { ...ev, endTime: nowIso() } : ev));
    setActiveEventId(null);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 290px", gap: 14, alignItems: "start" }}>
      {/* Map */}
      <div>
        <div style={{ border: "2px solid " + (awaitingPlace ? "#F59E0B" : "#E2E8F0"), borderRadius: 12, overflow: "hidden", position: "relative", transition: "border-color 0.2s" }}>
          {awaitingPlace && (
            <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", zIndex: 2, background: "rgba(245,158,11,0.96)", borderRadius: 6, padding: "5px 16px", fontSize: 11, fontFamily: "'DM Mono',monospace", color: "white", fontWeight: 700, whiteSpace: "nowrap", boxShadow: "0 2px 8px rgba(0,0,0,0.18)" }}>
              Click on the map to place & start event
            </div>
          )}
          <FloorplanCanvas imageUrl={floorplanUrl} zones={zones} events={events} markers={markers} onCanvasClick={handleCanvasClick} />
        </div>
        <EventLog events={events} setEvents={setEvents} activeEventId={activeEventId} setActiveEventId={setActiveEventId} />
      </div>

      {/* Controls */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <TimerBlock activeEv={activeEv} elapsed={elapsed} zones={zones} onEnd={endEvent} />

        {!activeEv && (
          <div style={{ background: "white", border: "1.5px solid #E2E8F0", borderRadius: 10, padding: "12px 13px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748B", fontFamily: "'DM Mono',monospace", marginBottom: 9 }}>Start New Event</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 10 }}>
              {EVENT_TYPES.map(et => (
                <button key={et.id} onClick={() => setEventType(et.id)}
                  style={{ padding: "5px 3px", border: "1.5px solid " + (eventType === et.id ? et.color : "#E2E8F0"), borderRadius: 5, cursor: "pointer", fontSize: 10, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", background: eventType === et.id ? et.color + "15" : "white", color: eventType === et.id ? et.color : "#94A3B8", textAlign: "center" }}>
                  {et.label}
                </button>
              ))}
            </div>
            <Field label="People present"><Select value={peoplePresent} onChange={setPeoplePresent} options={PEOPLE_PRESENT} /></Field>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748B", fontFamily: "'DM Mono',monospace", marginBottom: 5 }}>Posture / Mobilisation</div>
            {BODILY_ACTION_GROUPS.map(grp => (
              <div key={grp.id} style={{ marginBottom: 5 }}>
                <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "#94A3B8", fontFamily: "'DM Mono',monospace", marginBottom: 2 }}>{grp.label}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 3 }}>
                  {BODILY_ACTION_TYPES.filter(a => a.group === grp.id).map(a => (
                    <button key={a.id} onClick={() => setBodilyAction(a.id)}
                      style={{ padding: "5px 3px", border: "1.5px solid " + (bodilyAction === a.id ? "#7C3AED" : "#E2E8F0"), borderRadius: 5, cursor: "pointer", fontSize: 10, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", background: bodilyAction === a.id ? "#EDE9FE" : "white", color: bodilyAction === a.id ? "#7C3AED" : "#94A3B8", textAlign: "center" }}>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748B", fontFamily: "'DM Mono',monospace", marginBottom: 5 }}>Patient State</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, marginBottom: 10 }}>
              {PATIENT_STATE.map(a => (
                <button key={a.id} onClick={() => setPatientState(a.id)}
                  style={{ padding: "5px 3px", border: "1.5px solid " + (patientState === a.id ? "#0891B2" : "#E2E8F0"), borderRadius: 5, cursor: "pointer", fontSize: 10, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", background: patientState === a.id ? "#E0F2FE" : "white", color: patientState === a.id ? "#0891B2" : "#94A3B8", textAlign: "center" }}>
                  {a.label}
                </button>
              ))}
            </div>
            <label style={{ display: "flex", gap: 7, alignItems: "center", fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", color: "#475569", marginBottom: 10 }}>
              <input type="checkbox" checked={interruptionFlag} onChange={e => setInterruptionFlag(e.target.checked)} />
              Flag as interruption
            </label>
            <button onClick={() => setAwaitingPlace(true)} disabled={!!awaitingPlace}
              style={{ width: "100%", padding: "10px", border: "none", borderRadius: 8, background: awaitingPlace ? "#93C5FD" : "#2563EB", color: "white", fontWeight: 800, fontSize: 13, fontFamily: "'DM Sans',sans-serif", cursor: awaitingPlace ? "default" : "pointer" }}>
              {awaitingPlace ? "→ Click the map…" : "▶ Place on Map & Start"}
            </button>
            {awaitingPlace && (
              <button onClick={() => setAwaitingPlace(false)} style={{ width: "100%", marginTop: 5, padding: "6px", border: "1px solid #E2E8F0", borderRadius: 6, background: "white", color: "#94A3B8", fontSize: 11, fontFamily: "'DM Sans',sans-serif", cursor: "pointer" }}>Cancel</button>
            )}
          </div>
        )}

        <QuickMarkerPanel markers={markers} setMarkers={setMarkers} activeEventId={activeEventId} activeEv={activeEv} zones={zones} />
        <SessionCounts events={events} markers={markers} />
      </div>
    </div>
  );
}

// ─── SHADOWING Live Tab ────────────────────────────────────────────────────────

// Extended canvas that also draws a path between shadowing waypoints
function ShadowingCanvas({ imageUrl, zones, waypoints, markers, onCanvasClick, height = 530 }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [canvasDims, setCanvasDims] = useState({ width: 1000, height: 600 });

  useEffect(() => {
    if (!imageUrl) { setImgLoaded(false); return; }
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setCanvasDims({ width: img.naturalWidth, height: img.naturalHeight });
      setImgLoaded(true);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    if (imageUrl && imgRef.current && imgLoaded) {
      ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = "#F1F5F9"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let x = 0; x < canvas.width; x += 40) { ctx.beginPath(); ctx.strokeStyle = "#E2E8F0"; ctx.lineWidth = 1; ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
      for (let y = 0; y < canvas.height; y += 40) { ctx.beginPath(); ctx.strokeStyle = "#E2E8F0"; ctx.lineWidth = 1; ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
      ctx.fillStyle = "#CBD5E1"; ctx.font = "13px DM Mono,monospace"; ctx.textAlign = "center";
      ctx.fillText("Upload a floorplan in Setup", canvas.width / 2, canvas.height / 2);
      ctx.textAlign = "left";
    }

    // Zones
    zones.forEach((zone, idx) => {
      if (!zone.points || zone.points.length < 2) return;
      const color = zoneColor(zone, idx);
      ctx.beginPath(); ctx.moveTo(zone.points[0].x, zone.points[0].y);
      zone.points.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
      ctx.closePath(); ctx.fillStyle = color + "28"; ctx.fill();
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.setLineDash([]); ctx.stroke();
      const c = polygonCentroid(zone.points);
      ctx.font = "bold 11px DM Mono,monospace"; ctx.textAlign = "center";
      const tw = ctx.measureText(zone.name).width;
      ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.fillRect(c.x - tw / 2 - 4, c.y - 11, tw + 8, 16);
      ctx.fillStyle = color; ctx.fillText(zone.name, c.x, c.y); ctx.textAlign = "left";
    });

    // Path between waypoints
    if (waypoints.length >= 2) {
      // Shadow
      ctx.beginPath(); ctx.moveTo(waypoints[0].x, waypoints[0].y);
      waypoints.slice(1).forEach(w => ctx.lineTo(w.x, w.y));
      ctx.strokeStyle = "rgba(0,0,0,0.12)"; ctx.lineWidth = 6; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.setLineDash([]); ctx.stroke();
      // Main path — gradient-like via segments
      for (let i = 0; i < waypoints.length - 1; i++) {
        const t = i / (waypoints.length - 1);
        const r = Math.round(37 + t * (124 - 37));
        const g = Math.round(99 + t * (58 - 99));
        const b = Math.round(235 + t * (189 - 235));
        ctx.beginPath(); ctx.moveTo(waypoints[i].x, waypoints[i].y); ctx.lineTo(waypoints[i + 1].x, waypoints[i + 1].y);
        ctx.strokeStyle = `rgb(${r},${g},${b})`; ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.stroke();
      }
      // Direction arrows every ~3 waypoints
      for (let i = 1; i < waypoints.length; i += Math.max(1, Math.floor(waypoints.length / 6))) {
        const prev = waypoints[i - 1], curr = waypoints[i];
        const angle = Math.atan2(curr.y - prev.y, curr.x - prev.x);
        const mx = (prev.x + curr.x) / 2, my = (prev.y + curr.y) / 2;
        ctx.save(); ctx.translate(mx, my); ctx.rotate(angle);
        ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(-4, -4); ctx.lineTo(-4, 4); ctx.closePath();
        ctx.fillStyle = "#2563EB"; ctx.fill(); ctx.restore();
      }
    }

    // Waypoint dots
    waypoints.forEach((w, i) => {
      const isFirst = i === 0, isLast = i === waypoints.length - 1;
      const color = isFirst ? "#059669" : isLast ? "#DC2626" : getEventColor(w.eventType || "other");
      ctx.beginPath(); ctx.arc(w.x, w.y, isFirst || isLast ? 8 : 6, 0, Math.PI * 2);
      ctx.fillStyle = color; ctx.fill();
      ctx.strokeStyle = "white"; ctx.lineWidth = 2; ctx.stroke();
      // Sequence number
      ctx.fillStyle = "white"; ctx.font = `bold ${isFirst || isLast ? 10 : 9}px DM Mono,monospace`; ctx.textAlign = "center";
      ctx.fillText(i + 1, w.x, w.y + 3.5); ctx.textAlign = "left";
    });

    // Markers (triangles)
    markers.forEach(m => {
      const color = m.markerType === "stress" ? "#DC2626" : "#059669";
      ctx.beginPath(); ctx.moveTo(m.x, m.y - 7); ctx.lineTo(m.x + 6, m.y + 5); ctx.lineTo(m.x - 6, m.y + 5); ctx.closePath();
      ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = "white"; ctx.lineWidth = 1.5; ctx.stroke();
    });
  }, [imageUrl, imgLoaded, zones, waypoints, markers, canvasDims]);

  function getPos(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const sx = canvasRef.current.width / rect.width, sy = canvasRef.current.height / rect.height;
    return { x: Math.round((e.clientX - rect.left) * sx), y: Math.round((e.clientY - rect.top) * sy) };
  }

  return (
    <canvas ref={canvasRef} width={canvasDims.width} height={canvasDims.height}
      onClick={onCanvasClick ? e => onCanvasClick(getPos(e)) : undefined}
      style={{ width: "100%", height: "auto", maxHeight: "100%", display: "block", cursor: "crosshair" }}
    />
  );
}

function ShadowingLiveTab({ session, zones, events, setEvents, markers, setMarkers, floorplanUrl }) {
  const [activeEventId, setActiveEventId] = useState(null);
  const [eventType, setEventType] = useState("");
  const [bodilyAction, setBodilyAction] = useState("");
  const [patientState, setPatientState] = useState("");
  const [history, setHistory] = useState([]); // [{type:"event"|"marker", id, label, icon}]

  const activeEv = events.find(e => e.id === activeEventId && !e.endTime);
  const elapsed = useElapsed(activeEv?.startTime || null);
  const lastAction = history[0] || null;

  const waypoints = [...events].reverse();

  function pushHistory(type, id, label, icon, detail1 = null, detail2 = null) {
    setHistory(h => [{ type, id, label, icon, detail1, detail2 }, ...h.slice(0, 19)]);
  }

  function undoLast() {
    if (!lastAction) return;
    if (lastAction.type === "event") {
      setEvents(evs => evs.filter(e => e.id !== lastAction.id));
      if (activeEventId === lastAction.id) setActiveEventId(null);
    } else {
      setMarkers(ms => ms.filter(m => m.id !== lastAction.id));
    }
    setHistory(h => h.slice(1));
  }

  function handleCanvasClick(pos) {
    const autoZone = detectZone(zones, pos.x, pos.y);
    if (activeEventId) {
      setEvents(evs => evs.map(ev => ev.id === activeEventId ? { ...ev, endTime: nowIso() } : ev));
    }
    const ev = { id: "E-" + Date.now(), eventType, bodilyAction, patientState, zoneId: autoZone, startTime: nowIso(), x: pos.x, y: pos.y };
    setEvents(e => [ev, ...e]);
    setActiveEventId(ev.id);
    const actLabel = EVENT_TYPES.find(e => e.id === eventType)?.label || "Event";
    const postLabel = BODILY_ACTION_TYPES.find(a => a.id === bodilyAction)?.label || null;
    const stateLabel = PATIENT_STATE.find(a => a.id === patientState)?.label || null;
    pushHistory("event", ev.id, actLabel, "●", postLabel, stateLabel);
  }

  function logActivityHere() {
    if (!activeEv) return;
    setEvents(evs => evs.map(ev => ev.id === activeEventId ? { ...ev, endTime: nowIso() } : ev));
    const ev = { id: "E-" + Date.now(), eventType, bodilyAction, patientState, zoneId: activeEv.zoneId, startTime: nowIso(), x: activeEv.x, y: activeEv.y };
    setEvents(e => [ev, ...e]);
    setActiveEventId(ev.id);
    const actLabel = EVENT_TYPES.find(e => e.id === eventType)?.label || "Event";
    const postLabel = BODILY_ACTION_TYPES.find(a => a.id === bodilyAction)?.label || null;
    const stateLabel = PATIENT_STATE.find(a => a.id === patientState)?.label || null;
    pushHistory("event", ev.id, actLabel, "●", postLabel, stateLabel);
  }

  function stopTracking() {
    if (activeEventId) {
      setEvents(evs => evs.map(ev => ev.id === activeEventId ? { ...ev, endTime: nowIso() } : ev));
      setActiveEventId(null);
    }
  }

  function stampMarker(markerType, category) {
    const ref = activeEv || null;
    const x = ref ? ref.x + (Math.random() * 16 - 8) : 500;
    const y = ref ? ref.y + (Math.random() * 16 - 8) : 240;
    const autoZone = ref?.zoneId || detectZone(zones, x, y);
    const marker = {
      id: "M-" + Date.now(), markerType, category, intensity: 3,
      timestamp: nowIso(), zoneId: autoZone,
      x: Math.round(x), y: Math.round(y),
      linkedEventId: activeEventId || "",
    };
    setMarkers(ms => [marker, ...ms]);
    const allCats = [...ENVIRONMENT_FLAGS];
    const catLabel = allCats.find(c => c.id === category)?.label || category;
    const icon = markerType === "stress" ? "⚡" : markerType === "contextual" ? "⚑" : "🌿";
    pushHistory("marker", marker.id, catLabel, icon);
  }

  // ── shared pill button styles ──────────────────────────────────────────────
  const pill = (active, color, bg) => ({
    padding: "6px 4px", border: "1.5px solid " + (active ? color : "#E2E8F0"),
    borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 700,
    fontFamily: "'DM Sans',sans-serif", lineHeight: 1.2, textAlign: "center",
    background: active ? bg : "white", color: active ? color : "#94A3B8",
    transition: "all 0.1s",
  });
  const subLabel = (color) => ({
    fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
    color, fontFamily: "'DM Mono',monospace", marginBottom: 3, marginTop: 5,
  });
  const markerBtn = (type) => {
    const cfg = {
      stress:     { bg: "#FFF5F5", border: "#FECACA", color: "#DC2626" },
      recovery:   { bg: "#F0FDF4", border: "#BBF7D0", color: "#059669" },
      contextual: { bg: "#FFFBEB", border: "#FDE68A", color: "#B45309" },
    }[type];
    return {
      padding: "5px 3px", border: "1.5px solid " + cfg.border, borderRadius: 5,
      cursor: "pointer", fontSize: 10, fontWeight: 600,
      fontFamily: "'DM Sans',sans-serif", background: cfg.bg, color: cfg.color,
      lineHeight: 1.2, textAlign: "center",
    };
  };

  const counts = [
    { label: "Events",   value: events.length,                                             color: "#2563EB" },
    { label: "Stress",   value: markers.filter(m => m.markerType === "stress").length,     color: "#DC2626" },
    { label: "Recovery", value: markers.filter(m => m.markerType === "recovery").length,   color: "#059669" },
    { label: "Context",  value: markers.filter(m => m.markerType === "contextual").length, color: "#B45309" },
  ];

  // ── Sidebar section header helper ──────────────────────────────────────────
  const sideHead = (label, color) => (
    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase",
      color, fontFamily: "'DM Mono',monospace", marginBottom: 3, marginTop: 5 }}>{label}</div>
  );

  return (
    // Landscape-optimised: map left (~65%), controls sidebar right (~35%)
    <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", height: "100%", overflow: "hidden" }}>

      {/* ── LEFT: flex column so canvas sits at top, bar pins to bottom ── */}
      <div style={{ display: "flex", flexDirection: "column", borderRight: "1.5px solid #E2E8F0", height: "100%", overflow: "hidden" }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
        {events.length === 0 && (
          <div style={{ position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)", zIndex: 2,
            background: "rgba(255,255,255,0.93)", borderRadius: 7, padding: "7px 18px",
            fontSize: 12, fontFamily: "'DM Mono',monospace", color: "#94A3B8",
            whiteSpace: "nowrap", border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
            Select an activity → then tap the map
          </div>
        )}
        <ShadowingCanvas imageUrl={floorplanUrl} zones={zones} waypoints={waypoints}
          markers={markers} onCanvasClick={handleCanvasClick} />

        {/* Waypoint counter overlay — bottom-left */}
        {waypoints.length > 1 && (
          <div style={{ position: "absolute", bottom: 10, left: 10, display: "flex", gap: 5 }}>
            <div style={{ background: "rgba(255,255,255,0.92)", border: "1px solid #E2E8F0", borderRadius: 5,
              padding: "3px 9px", fontSize: 10, fontFamily: "'DM Mono',monospace", color: "#475569" }}>
              <span style={{ color: "#7C3AED", fontWeight: 700 }}>{waypoints.length}</span> pts
            </div>
            <div style={{ background: "rgba(255,255,255,0.92)", border: "1px solid #E2E8F0", borderRadius: 5,
              padding: "3px 9px", fontSize: 10, fontFamily: "'DM Mono',monospace", color: "#475569" }}>
              <span style={{ color: "#7C3AED", fontWeight: 700 }}>
                {[...new Set(waypoints.map(w => w.zoneId).filter(Boolean))].length}
              </span> zones
            </div>
          </div>
        )}

        {/* Recent event log */}
        <EventLog events={events} setEvents={setEvents} activeEventId={activeEventId} setActiveEventId={setActiveEventId} />
        </div>{/* end canvas wrapper */}

        {/* Spacer pushes bar to bottom */}
        <div style={{ flex: 1 }} />

        {/* ── BOTTOM BAR: under floorplan, aligns with bottom of sidebar ── */}
        <div style={{ flexShrink: 0, borderTop: "1.5px solid #F1F5F9", background: "white" }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center", padding: "5px 12px",
            borderBottom: "1px solid #F8FAFC" }}>
            {counts.map(s => (
              <div key={s.label} style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                <span style={{ fontSize: 15, fontWeight: 800, fontFamily: "'DM Mono',monospace",
                  color: s.color, lineHeight: 1 }}>{s.value}</span>
                <span style={{ fontSize: 8, textTransform: "uppercase", letterSpacing: "0.06em",
                  color: "#94A3B8", fontFamily: "'DM Sans',sans-serif" }}>{s.label}</span>
              </div>
            ))}
            {lastAction && (
              <button onClick={undoLast}
                style={{ marginLeft: "auto", padding: "2px 8px", border: "1.5px solid #E2E8F0",
                  borderRadius: 5, background: "white", color: "#64748B", fontSize: 9, fontWeight: 700,
                  fontFamily: "'DM Mono',monospace", cursor: "pointer" }}
                onMouseOver={e => { e.currentTarget.style.borderColor="#DC2626"; e.currentTarget.style.color="#DC2626"; }}
                onMouseOut={e => { e.currentTarget.style.borderColor="#E2E8F0"; e.currentTarget.style.color="#64748B"; }}>
                ↩ Undo
              </button>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px",
            background: activeEv ? getEventColor(activeEv.eventType) + "08" : "white" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
              background: activeEv ? getEventColor(activeEv.eventType) : "#E2E8F0" }} />
            <span style={{ fontSize: 18, fontWeight: 800, fontFamily: "'DM Mono',monospace",
              color: activeEv ? "#1E293B" : "#CBD5E1", letterSpacing: "-0.02em" }}>
              {formatElapsed(elapsed)}
            </span>
            {activeEv
              ? <span style={{ fontSize: 10, fontWeight: 700, flex: 1, overflow: "hidden",
                  textOverflow: "ellipsis", whiteSpace: "nowrap", textTransform: "uppercase",
                  letterSpacing: "0.05em", color: getEventColor(activeEv.eventType),
                  fontFamily: "'DM Mono',monospace" }}>
                  {EVENT_TYPES.find(e => e.id === activeEv.eventType)?.label}
                  {activeEv.zoneId
                    ? <span style={{ fontWeight: 400, color: "#94A3B8" }}> · {findZoneName(zones, activeEv.zoneId)}</span>
                    : null}
                </span>
              : <span style={{ fontSize: 10, color: "#CBD5E1", fontFamily: "'DM Sans',sans-serif" }}>
                  No active event
                </span>
            }
          </div>
        </div>
      </div>{/* end left column */}

      {/* ── RIGHT SIDEBAR: all controls, scrollable ── */}
      <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "white", overflow: "hidden" }}>

        {/* ── SCROLLABLE BODY ── */}
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 10px 10px" }}>

          {/* ACTIVITY */}
          {sideHead("Activity", "#475569")}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 4 }}>
            {EVENT_TYPES.map(et => (
              <button key={et.id} onClick={() => setEventType(et.id)}
                style={{ ...pill(eventType === et.id, et.color, et.color + "18"), padding: "6px 4px", fontSize: 11 }}>
                {et.label}
              </button>
            ))}
          </div>

          {/* POSTURE / MOBILISATION — grouped with sub-headers */}
          {sideHead("Posture / Mobilisation", "#475569")}
          {BODILY_ACTION_GROUPS.map(grp => (
            <div key={grp.id} style={{ marginBottom: 5 }}>
              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase",
                color: "#94A3B8", fontFamily: "'DM Mono',monospace", marginBottom: 2 }}>{grp.label}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 3 }}>
                {BODILY_ACTION_TYPES.filter(a => a.group === grp.id).map(a => (
                  <button key={a.id} onClick={() => setBodilyAction(a.id)}
                    style={{ ...pill(bodilyAction === a.id, "#7C3AED", "#EDE9FE"), padding: "5px 2px", fontSize: 10 }}>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* PATIENT STATE */}
          {sideHead("Patient State", "#475569")}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4 }}>
            {PATIENT_STATE.map(a => (
              <button key={a.id} onClick={() => setPatientState(a.id)}
                style={{ ...pill(patientState === a.id, "#0891B2", "#E0F2FE"), padding: "6px 2px", fontSize: 11 }}>
                {a.label}
              </button>
            ))}
          </div>

          {/* END ACTIONS — only shown when an event is active */}
          {activeEv && (
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              <button onClick={logActivityHere}
                style={{ flex: 1, padding: "8px 0", border: "1.5px solid #7C3AED", borderRadius: 8,
                  background: "#EDE9FE", color: "#7C3AED", fontWeight: 800, fontSize: 12,
                  fontFamily: "'DM Sans',sans-serif", cursor: "pointer" }}>
                ◎ Log Here
              </button>
              <button onClick={stopTracking}
                style={{ flex: 1, padding: "8px 0", border: "none", borderRadius: 8,
                  background: "#DC2626", color: "white", fontWeight: 800, fontSize: 12,
                  fontFamily: "'DM Sans',sans-serif", cursor: "pointer" }}>
                ■ End
              </button>
            </div>
          )}

          {/* DIVIDER */}
          <div style={{ borderTop: "1.5px solid #F1F5F9", margin: "7px 0" }} />

          {/* ⚑ ENVIRONMENT — grouped */}
          <div style={{ fontSize: 11, fontWeight: 700, color: "#B45309", fontFamily: "'DM Mono',monospace",
            letterSpacing: "0.05em", marginBottom: 5 }}>
            ⚑ Environment
          </div>
          {ENVIRONMENT_GROUPS.map(grp => (
            <div key={grp.id} style={{ marginBottom: 5 }}>
              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase",
                color: "#94A3B8", fontFamily: "'DM Mono',monospace", marginBottom: 2 }}>{grp.label}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 3 }}>
                {ENVIRONMENT_FLAGS.filter(f => f.group === grp.id).map(cat => (
                  <button key={cat.id} onClick={() => stampMarker("contextual", cat.id)}
                    style={{ padding: "5px 3px", border: "1.5px solid #FEF3C7", borderRadius: 6,
                      cursor: "pointer", fontSize: 10, fontWeight: 600,
                      fontFamily: "'DM Sans',sans-serif", background: "#FFFBEB", color: "#B45309",
                      lineHeight: 1.2, textAlign: "center" }}
                    onMouseOver={e => { e.currentTarget.style.background="#D97706"; e.currentTarget.style.color="white"; }}
                    onMouseOut={e => { e.currentTarget.style.background="#FFFBEB"; e.currentTarget.style.color="#B45309"; }}>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

        </div>{/* end scrollable body */}

      </div>{/* end right sidebar */}
    </div>
  );
}

// ─── LiveTab router ────────────────────────────────────────────────────────────

function LiveTab({ session, zones, events, setEvents, markers, setMarkers, floorplanUrl }) {
  const mode = session.observationMode;

  if (!mode) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320, gap: 12, color: "#94A3B8", fontFamily: "'DM Sans',sans-serif" }}>
        <div style={{ fontSize: 32 }}>⬡</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#64748B" }}>No observation mode selected</div>
        <div style={{ fontSize: 13 }}>Go to Setup & Zones and choose Zone Observation or Person Tracking.</div>
      </div>
    );
  }

  if (mode === "zone") return <ZoneLiveTab session={session} zones={zones} events={events} setEvents={setEvents} markers={markers} setMarkers={setMarkers} floorplanUrl={floorplanUrl} />;
  if (mode === "person") return <ShadowingLiveTab session={session} zones={zones} events={events} setEvents={setEvents} markers={markers} setMarkers={setMarkers} floorplanUrl={floorplanUrl} />;
  return null;
}

// ─── Review Tab ────────────────────────────────────────────────────────────────

function ReviewTab({ session, zones, events, markers }) {
  function exportAll() {
    downloadText(`events_${session.sessionId}.csv`, toCsv(buildEventRows(session, zones, events)), "text/csv");
    setTimeout(() => downloadText(`markers_${session.sessionId}.csv`, toCsv(buildMarkerRows(session, zones, markers)), "text/csv"), 300);
  }
  const totalDur = events.reduce((s,ev) => s + (ev.endTime ? secondsBetween(ev.startTime,ev.endTime) : 0), 0);
  const byType = EVENT_TYPES.map(et => ({...et, count:events.filter(ev=>ev.eventType===et.id).length})).filter(et=>et.count>0).sort((a,b)=>b.count-a.count);
  return (
    <div>
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:16 }}>
        <StatCard label="Total Events" value={events.length} color="#2563EB" />
        <StatCard label="Completed" value={events.filter(e=>e.endTime).length} color="#059669" />
        <StatCard label="Stress" value={markers.filter(m=>m.markerType==="stress").length} color="#DC2626" />
        <StatCard label="Recovery" value={markers.filter(m=>m.markerType==="recovery").length} color="#059669" />
        <StatCard label="Context" value={markers.filter(m=>m.markerType==="contextual").length} color="#B45309" />
        <StatCard label="Observed" value={formatDuration(totalDur)} color="#7C3AED" />
        <StatCard label="Zones" value={zones.length} color="#0891B2" />
      </div>

      {byType.length > 0 && <>
        <SectionHeader>Event Breakdown</SectionHeader>
        <div style={{ display:"flex", flexDirection:"column", gap:5, marginBottom:16 }}>
          {byType.map(et => {
            const pct = Math.round((et.count/events.length)*100);
            return (
              <div key={et.id} style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:115, fontSize:11, fontFamily:"'DM Sans',sans-serif", color:"#475569", flexShrink:0 }}>{et.label}</div>
                <div style={{ flex:1, background:"#F1F5F9", borderRadius:99, height:8 }}>
                  <div style={{ width:`${pct}%`, background:et.color, height:"100%", borderRadius:99 }} />
                </div>
                <div style={{ width:34, textAlign:"right", fontSize:10, fontFamily:"'DM Mono',monospace", color:"#64748B" }}>{pct}%</div>
                <Badge color={et.color}>{et.count}</Badge>
              </div>
            );
          })}
        </div>
      </>}

      <SectionHeader>Recent Events</SectionHeader>
      <div style={{ overflowX:"auto", marginBottom:16 }}>
        <table style={{ borderCollapse:"collapse", width:"100%", fontSize:11, fontFamily:"'DM Mono',monospace" }}>
          <thead><tr style={{ borderBottom:"2px solid #E2E8F0" }}>
            {["ID","Type","Start","End","Duration","Zone","People"].map(h => <th key={h} style={{ textAlign:"left", padding:"5px 8px", color:"#64748B", fontWeight:700, textTransform:"uppercase", fontSize:9, letterSpacing:"0.07em" }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {events.slice(0,14).map((ev,i) => (
              <tr key={ev.id} style={{ borderBottom:"1px solid #F1F5F9", background:i%2===0?"#FAFAFA":"white" }}>
                <td style={{ padding:"4px 8px", color:"#94A3B8" }}>{ev.id.slice(-5)}</td>
                <td style={{ padding:"4px 8px" }}><Badge color={getEventColor(ev.eventType)}>{EVENT_TYPES.find(e=>e.id===ev.eventType)?.label||ev.eventType}</Badge></td>
                <td style={{ padding:"4px 8px", color:"#475569" }}>{formatClock(ev.startTime)}</td>
                <td style={{ padding:"4px 8px", color:"#475569" }}>{ev.endTime?formatClock(ev.endTime):<span style={{color:"#2563EB"}}>ongoing</span>}</td>
                <td style={{ padding:"4px 8px", color:"#475569" }}>{ev.endTime?formatDuration(secondsBetween(ev.startTime,ev.endTime)):"—"}</td>
                <td style={{ padding:"4px 8px", color:"#475569" }}>{findZoneName(zones,ev.zoneId)||"—"}</td>
                <td style={{ padding:"4px 8px", color:"#475569" }}>{ev.peoplePresent||"—"}</td>
              </tr>
            ))}
            {events.length===0 && <tr><td colSpan={7} style={{ padding:"18px", textAlign:"center", color:"#CBD5E1" }}>No events recorded.</td></tr>}
          </tbody>
        </table>
      </div>

      <SectionHeader>Export</SectionHeader>
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        <Btn onClick={exportAll} variant="success">⬇ Export All CSVs</Btn>
        <Btn onClick={() => downloadText(`events_${session.sessionId}.csv`, toCsv(buildEventRows(session,zones,events)), "text/csv")} variant="ghost">Events only</Btn>
        <Btn onClick={() => downloadText(`markers_${session.sessionId}.csv`, toCsv(buildMarkerRows(session,zones,markers)), "text/csv")} variant="ghost">Markers only</Btn>
      </div>

      <SectionHeader>CSV Schema</SectionHeader>
      {[
        { file:"events.csv", cols:"session_id · date · hospital · department · unit · observer_id · participant_role · participant_code · gender · first_language · seniority_level · clinical_experience · shift_type · departmental_status · protocol_checked · event_id · event_type · bodily_action · patient_state · start_time · end_time · duration_seconds · zone_id · zone_name · x_coord · y_coord · people_present · interruption_flag · interruption_type · note" },
        { file:"markers.csv", cols:"session_id · date · hospital · department · unit · observer_id · participant_role · participant_code · gender · first_language · seniority_level · clinical_experience · shift_type · departmental_status · marker_id · marker_type (stress / recovery / contextual) · category · intensity_1_5 · timestamp · zone_id · zone_name · x_coord · y_coord · linked_event_id" },
      ].map(s => (
        <div key={s.file} style={{ background:"#F8FAFC", border:"1.5px solid #E2E8F0", borderRadius:7, padding:"8px 11px", marginBottom:6 }}>
          <div style={{ fontSize:11, fontWeight:700, fontFamily:"'DM Mono',monospace", color:"#2563EB", marginBottom:3 }}>{s.file}</div>
          <div style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:"#64748B", lineHeight:1.8 }}>{s.cols}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Root ──────────────────────────────────────────────────────────────────────

export default function HospitalShadowingApp() {
  const [tab, setTab] = useState("setup");
  const navRef = useRef(null);

  // ── Measure nav height and expose as CSS var so all children adapt ──
  useEffect(() => {
    function updateNavHeight() {
      if (navRef.current) {
        const h = navRef.current.getBoundingClientRect().height;
        document.documentElement.style.setProperty('--nav-h', h + 'px');
      }
    }
    updateNavHeight();
    window.addEventListener('resize', updateNavHeight);
    return () => window.removeEventListener('resize', updateNavHeight);
  }, []);

  // ── Study-level state: persists across all participants in a field day ──
  const [floorplanUrl, setFloorplanUrl] = useState(null);
  const [zones, setZones] = useState([]);
  const [study, setStudy] = useState({ hospital:"Addenbrooke's", department:"A&E" });

  // ── Session-level state: reset between participants ──
  const freshSession = () => ({
    sessionId: "S-" + Date.now(),
    date: new Date().toISOString().slice(0, 10),
    hospital: study.hospital,
    department: study.department,
    observationMode: "person",
  });
  const [session, setSession] = useState(freshSession());
  const [events, setEvents] = useState([]);
  const [markers, setMarkers] = useState([]);

  function newParticipant() {
    if (!window.confirm("Start a new participant session? The floorplan and zones will be kept. Event and marker data for the current participant should be exported first.")) return;
    setSession({ ...freshSession(), hospital: study.hospital, department: study.department });
    setEvents([]);
    setMarkers([]);
    setTab("setup");
  }

  // Keep study fields in sync with session so CSV exports carry them
  function updateStudy(key, val) {
    setStudy(s => ({ ...s, [key]: val }));
    setSession(s => ({ ...s, [key]: val }));
  }

  const tabs = [
    { id:"setup", label:"Setup & Zones" },
    { id:"live", label:"Live" },
    { id:"review", label:"Review & Export" },
  ];

  return (
    <div style={{ height:"100dvh", overflow:"hidden", background:"#F0F4F8" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500;700&display=swap'); *{box-sizing:border-box;} body{margin:0; overflow:hidden;} :root{--sat:env(safe-area-inset-top,0px);--sab:env(safe-area-inset-bottom,0px);}`}</style>
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />

      <div ref={navRef} style={{ background:"white", borderBottom:"1.5px solid #E2E8F0" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 22px", display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
          <div style={{ paddingTop:8, paddingBottom:6 }}>
            <div style={{ fontSize:14, fontWeight:800, color:"#1E293B", letterSpacing:"-0.02em", fontFamily:"'DM Sans',sans-serif" }}>
              <span style={{ color:"#2563EB" }}>Recovery in Motion</span> · Stream B Shadowing
            </div>
            <div style={{ fontSize:10, color:"#94A3B8", fontFamily:"'DM Mono',monospace", marginTop:2 }}>
              {session.hospital||"No hospital"} · {session.date} · {session.participantCode||"No participant"}
              {floorplanUrl && <span style={{ color:"#059669", marginLeft:8 }}>● Floorplan loaded</span>}
              {zones.length > 0 && <span style={{ color:"#7C3AED", marginLeft:8 }}>● {zones.length} zone{zones.length!==1?"s":""}</span>}
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"flex-end", gap:0 }}>
            {(events.length > 0 || markers.length > 0) && (
              <button onClick={newParticipant}
                style={{ background:"none", border:"1.5px solid #E2E8F0", borderRadius:6, padding:"6px 12px", marginBottom:10, marginRight:12, cursor:"pointer", fontSize:11, fontWeight:700, fontFamily:"'DM Mono',monospace", color:"#059669", whiteSpace:"nowrap" }}>
                + New Participant
              </button>
            )}
            <div style={{ display:"flex" }}>
              {tabs.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  style={{ background:"none", border:"none", borderBottom:tab===t.id?"2.5px solid #2563EB":"2.5px solid transparent", padding:"11px 15px", cursor:"pointer", fontSize:11, fontWeight:700, fontFamily:"'DM Mono',monospace", textTransform:"uppercase", letterSpacing:"0.07em", color:tab===t.id?"#2563EB":"#94A3B8", transition:"all 0.15s", whiteSpace:"nowrap" }}>
                  {t.label}
                  {t.id==="live" && events.length>0 && <span style={{ marginLeft:4, background:"#2563EB", color:"white", borderRadius:99, fontSize:8, padding:"1px 5px", fontWeight:700 }}>{events.length}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Setup & Review — scrollable content area */}
      {(tab==="setup" || tab==="review") && (
        <div style={{ height:"calc(100dvh - var(--nav-h, 52px))", overflowY:"auto", padding:"16px 32px" }}>
          {tab==="setup" && <SetupTab session={session} setSession={setSession} study={study} updateStudy={updateStudy} zones={zones} setZones={setZones} floorplanUrl={floorplanUrl} setFloorplanUrl={setFloorplanUrl} />}
          {tab==="review" && <ReviewTab session={session} zones={zones} events={events} markers={markers} />}
        </div>
      )}
      {/* Live — fills exactly the remaining height, no gaps */}
      {tab==="live" && (
        <div style={{ height:"calc(100dvh - var(--nav-h, 52px))", overflow:"hidden" }}>
          <LiveTab session={session} zones={zones} events={events} setEvents={setEvents} markers={markers} setMarkers={setMarkers} floorplanUrl={floorplanUrl} />
        </div>
      )}
    </div>
  );
}
