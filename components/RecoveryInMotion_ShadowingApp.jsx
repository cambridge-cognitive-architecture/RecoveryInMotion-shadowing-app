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
    event_id: ev?.id||"",
    activity: (ev?.eventTypes||[]).join(", "),
    bodily_action: (ev?.bodilyActions||[]).join(", "),
    patient_state: (ev?.patientStates||[]).join(", "),
    start_time: ev?.startTime||"", end_time: ev?.endTime||"",
    duration_seconds: ev?.endTime ? secondsBetween(ev.startTime, ev.endTime) : "",
    zone_id: ev?.zoneId||"", zone_name: findZoneName(zones, ev?.zoneId),
    x_coord: typeof ev?.x==="number" ? ev.x : "", y_coord: typeof ev?.y==="number" ? ev.y : "",
    note: ev?.note||"",
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
  const wrapRef = useRef(null);
  const [dims, setDims] = useState({ w: 1, h: 1 });

  useEffect(() => {
    if (!imageUrl) { setDims({ w: 1, h: 1 }); return; }
    const img = new Image();
    img.onload = () => setDims({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => console.error("Floorplan: image failed to load");
    img.src = imageUrl;
  }, [imageUrl]);

  // Convert pointer event → SVG coordinate space, accounting for object-fit:contain letterboxing
  function getPos(e) {
    const el = wrapRef.current;
    if (!el) return { x: 0, y: 0, scale: 1 };
    const rect = el.getBoundingClientRect();
    const containerRatio = rect.width / rect.height;
    const imageRatio = dims.w / dims.h;
    let renderedW, renderedH, offsetX, offsetY;
    if (imageRatio > containerRatio) {
      renderedW = rect.width; renderedH = rect.width / imageRatio;
      offsetX = 0; offsetY = (rect.height - renderedH) / 2;
    } else {
      renderedH = rect.height; renderedW = rect.height * imageRatio;
      offsetX = (rect.width - renderedW) / 2; offsetY = 0;
    }
    const sx = dims.w / renderedW;
    const x = Math.round((e.clientX - rect.left - offsetX) * sx);
    const y = Math.round((e.clientY - rect.top - offsetY) * (dims.h / renderedH));
    // Clamp to image bounds
    return {
      x: Math.max(0, Math.min(dims.w, x)),
      y: Math.max(0, Math.min(dims.h, y)),
      scale: sx,
    };
  }

  const scale = dims.w / 1000;
  const snapThreshold = 12 * scale;
  const dotR = 6 * scale;
  const lw = 2 * scale;

  const draftPath = draftPoints.length > 0
    ? "M " + draftPoints.map(p => `${p.x},${p.y}`).join(" L ") + (hoverPoint ? ` L ${hoverPoint.x},${hoverPoint.y}` : "")
    : "";

  const nearFirst = drawingMode && draftPoints.length >= 3 && hoverPoint &&
    Math.hypot(hoverPoint.x - draftPoints[0].x, hoverPoint.y - draftPoints[0].y) < snapThreshold;

  return (
    <div ref={wrapRef}
      style={{
        position: "relative",
        width: "100%",
        height: height,
        userSelect: "none",
        cursor: onCanvasClick ? "crosshair" : "default",
        borderRadius: 10,
        overflow: "hidden",
        background: "#F1F5F9",
        lineHeight: 0,
      }}
      onClick={onCanvasClick ? e => onCanvasClick(getPos(e)) : undefined}
      onMouseMove={e => { if (onCanvasMouseMove) onCanvasMouseMove(getPos(e)); }}
      onMouseLeave={onCanvasMouseLeave}
    >
      {imageUrl
        ? <img src={imageUrl} alt="Floorplan" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 13, color: "#CBD5E1", fontFamily: "'DM Mono',monospace", textAlign: "center" }}>Upload a floorplan image<br/>then draw zones by clicking on it</span>
          </div>
      }
      <svg
        viewBox={`0 0 ${dims.w} ${dims.h}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Completed zones */}
        {zones.map((zone, idx) => {
          if (!zone.points || zone.points.length < 2) return null;
          const color = zoneColor(zone, idx);
          const pts = zone.points.map(p => `${p.x},${p.y}`).join(" ");
          return (
            <g key={zone.id}>
              <polygon points={pts} fill={color + "30"} stroke={color} strokeWidth={lw * 1.5} />
              {zone.points.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={dotR * 0.5} fill={color} />)}
            </g>
          );
        })}

        {/* Preview polygon (awaiting name) */}
        {previewPoly && previewPoly.length >= 3 && (
          <polygon points={previewPoly.map(p => `${p.x},${p.y}`).join(" ")} fill="#F59E0B30" stroke="#F59E0B" strokeWidth={lw} />
        )}

        {/* Draft polygon while drawing */}
        {drawingMode && draftPoints.length > 0 && (
          <g>
            <path d={draftPath} fill="none" stroke="#F59E0B" strokeWidth={lw} strokeDasharray={`${8*scale} ${5*scale}`} />
            {draftPoints.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={i === 0 ? dotR : dotR * 0.7}
                fill={i === 0 ? "#F59E0B" : "#FCD34D"} stroke="white" strokeWidth={lw} />
            ))}
            {nearFirst && <circle cx={draftPoints[0].x} cy={draftPoints[0].y} r={snapThreshold} fill="none" stroke="#F59E0B" strokeWidth={lw + 1} />}
          </g>
        )}

        {/* Events */}
        {events.map(ev => {
          const color = getEventColor((ev.eventTypes||[])[0] || ev.eventType);
          return <circle key={ev.id} cx={ev.x} cy={ev.y} r={6 * scale} fill={ev.endTime ? color + "70" : color} stroke="white" strokeWidth={1.5 * scale} />;
        })}

        {/* Markers (triangles) */}
        {markers.map(m => {
          const color = m.markerType === "stress" ? "#DC2626" : "#059669";
          const s = 7 * scale;
          return <polygon key={m.id} points={`${m.x},${m.y - s} ${m.x + s * 0.85},${m.y + s * 0.7} ${m.x - s * 0.85},${m.y + s * 0.7}`} fill={color} stroke="white" strokeWidth={1.5 * scale} />;
        })}

        {/* Pending ring */}
        {pendingPos && <circle cx={pendingPos.x} cy={pendingPos.y} r={10 * scale} stroke="#2563EB" strokeWidth={2 * scale} fill="rgba(37,99,235,0.15)" />}
      </svg>
    </div>
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

  function handleImageFile(file) {
    if (!file) return;
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      // Render first page of PDF to canvas using pdf.js CDN
      const fileUrl = URL.createObjectURL(file);
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      script.onload = async () => {
        try {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
          const pdf = await window.pdfjsLib.getDocument(fileUrl).promise;
          const page = await pdf.getPage(1);
          const scale = 2; // 2x for decent resolution
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d");
          await page.render({ canvasContext: ctx, viewport }).promise;
          setFloorplanUrl(canvas.toDataURL("image/png"));
          URL.revokeObjectURL(fileUrl);
        } catch(err) {
          alert("Could not render PDF — try exporting as PNG first.");
          URL.revokeObjectURL(fileUrl);
        }
      };
      script.onerror = () => alert("Could not load PDF renderer. Check your internet connection.");
      document.head.appendChild(script);
      return;
    }
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
    const dept = (study.department || "zones").replace(/\s+/g, "_");
    const blob = new Blob([JSON.stringify(config)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
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
      <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display:"none" }} onChange={e => handleImageFile(e.target.files[0])} />
      <input ref={zoneFileRef} type="file" accept=".json" style={{ display:"none" }} onChange={e => handleZoneImport(e.target.files[0])} />

      {/* ── TOP STRIP: session details horizontally ── */}
      <div style={{ background:"white", border:"1.5px solid #E2E8F0", borderRadius:10, padding:"13px 16px" }}>
        <SectionHeader>Session Details</SectionHeader>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(6, 1fr)", gap:12, alignItems:"end" }}>
          <Field label="Date"><Input value={session.date} onChange={v=>updateSession("date",v)} placeholder="YYYY-MM-DD" /></Field>
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
            <span style={{ fontSize:10, color:"#94A3B8", fontFamily:"'DM Mono',monospace" }}>PNG · JPG · PDF</span>
            <div style={{ marginLeft:"auto", display:"flex", gap:6 }}>
              <Btn onClick={() => zoneFileRef.current.click()} variant="ghost" small>⬆ Load Zone Config</Btn>
              {zones.length > 0 && <Btn onClick={() => { if(window.confirm("Clear all zones?")) setZones([]); }} variant="ghost" small>✕ Clear Zones</Btn>}
              {(zones.length > 0 && floorplanUrl) && (
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
            {zones.length > 0 && !floorplanUrl && (
              <span style={{ fontSize:10, color:"#94A3B8", fontFamily:"'DM Mono',monospace" }}>Zones restored from last session — upload floorplan or load zone config</span>
            )}
          </div>

          <div style={{ border:"2px solid " + (drawingZone ? "#F59E0B" : "#E2E8F0"), borderRadius:12, background:"#F8FAFC" }}>
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
  const activeColor = activeEv ? getEventColor((activeEv.eventTypes||[])[0] || activeEv.eventType) : "#94A3B8";
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
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: getEventColor((ev.eventTypes||[])[0] || ev.eventType), flexShrink: 0, opacity: ev.endTime ? 0.3 : 1 }} />
          <span style={{ fontSize: 11, fontFamily: "'DM Sans',sans-serif", color: "#475569", flex: 1 }}>{(ev.eventTypes||[]).map(id => EVENT_TYPES.find(e=>e.id===id)?.label||id).join(", ") || "—"}</span>
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

function ShadowingCanvas({ imageUrl, zones, waypoints, markers, onCanvasClick }) {
  const wrapRef = useRef(null);

  // Initialise viewBox from zone coordinate bounds immediately — prevents blank render
  // before image onload fires. Image load will refine these dims.
  const initDims = () => {
    if (zones && zones.length) {
      const xs = zones.flatMap(z => (z.points||[]).map(p => p.x));
      const ys = zones.flatMap(z => (z.points||[]).map(p => p.y));
      if (xs.length) return { w: Math.max(...xs) + 50, h: Math.max(...ys) + 50 };
    }
    return { w: 1000, h: 600 };
  };
  const [dims, setDims] = useState(initDims);

  // Zoom / pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const lastTouchDist = useRef(null);
  const lastPinchMid = useRef(null);
  const lastPanTouch = useRef(null);
  const isPinching = useRef(false);
  const didPinch = useRef(false);

  useEffect(() => {
    if (!imageUrl) { setDims(initDims()); return; }
    const img = new Image();
    img.onload = () => setDims({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => console.error("ShadowingCanvas: image failed to load");
    img.src = imageUrl;
    if (img.complete && img.naturalWidth) {
      setDims({ w: img.naturalWidth, h: img.naturalHeight });
    }
  }, [imageUrl]);

  // Get the rendered image bounds inside the container (objectFit:contain letterboxing)
  function getImageBounds() {
    const el = wrapRef.current;
    if (!el) return { x:0, y:0, w:0, h:0 };
    const rect = el.getBoundingClientRect();
    const containerRatio = rect.width / rect.height;
    const imageRatio = dims.w / dims.h;
    let w, h, x, y;
    if (imageRatio > containerRatio) {
      w = rect.width; h = rect.width / imageRatio;
      x = 0; y = (rect.height - h) / 2;
    } else {
      h = rect.height; w = rect.height * imageRatio;
      x = (rect.width - w) / 2; y = 0;
    }
    return { x, y, w, h };
  }

  // Convert screen tap → image coordinate space
  function getPos(clientX, clientY) {
    const el = wrapRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    const { x: ibx, y: iby, w: ibw, h: ibh } = getImageBounds();
    // The inner div is transformed: translate(pan.x, pan.y) scale(zoom) with origin = pinch origin
    // We need to invert: screen → container → pre-transform image space
    // With transform-origin at (0,0) and translate then scale:
    // screen_pos = pan + zoom * image_pos  =>  image_pos = (screen_pos - pan) / zoom
    const cx = clientX - rect.left;
    const cy = clientY - rect.top;
    const preX = (cx - pan.x) / zoom;
    const preY = (cy - pan.y) / zoom;
    // Map from container space to image pixel space
    const sx = dims.w / ibw;
    const sy = dims.h / ibh;
    return {
      x: Math.round((preX - ibx) * sx),
      y: Math.round((preY - iby) * sy),
    };
  }

  function handleTouchStart(e) {
    if (e.touches.length === 2) {
      isPinching.current = true;
      didPinch.current = true;
      const mid = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
      lastTouchDist.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      lastPinchMid.current = mid;
    } else if (e.touches.length === 1) {
      lastPanTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      didPinch.current = false;
    }
  }

  function handleTouchMove(e) {
    if (e.touches.length === 2 && lastTouchDist.current !== null) {
      e.preventDefault();
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const newDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const newMid = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
      const scaleDelta = newDist / lastTouchDist.current;
      // Pinch midpoint in container coords
      const originX = newMid.x - rect.left;
      const originY = newMid.y - rect.top;
      // Adjust pan so zoom happens toward pinch midpoint:
      // new_pan = origin - scaleDelta * (origin - old_pan)
      setPan(p => {
        const newZoom = Math.min(5, Math.max(1, zoom * scaleDelta));
        const actualDelta = newZoom / zoom; // use clamped zoom
        return {
          x: originX - actualDelta * (originX - p.x),
          y: originY - actualDelta * (originY - p.y),
        };
      });
      setZoom(z => Math.min(5, Math.max(1, z * scaleDelta)));
      lastTouchDist.current = newDist;
      lastPinchMid.current = newMid;
    } else if (e.touches.length === 1 && zoom > 1 && lastPanTouch.current) {
      e.preventDefault();
      const dx = e.touches[0].clientX - lastPanTouch.current.x;
      const dy = e.touches[0].clientY - lastPanTouch.current.y;
      setPan(p => ({ x: p.x + dx, y: p.y + dy }));
      lastPanTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }

  function handleTouchEnd(e) {
    if (e.touches.length < 2) {
      lastTouchDist.current = null;
      isPinching.current = false;
      lastPinchMid.current = null;
    }
    if (e.touches.length === 0) lastPanTouch.current = null;
  }

  function handleClick(e) {
    if (didPinch.current || !onCanvasClick) return;
    const pos = getPos(e.clientX, e.clientY);
    if (pos.x >= 0 && pos.y >= 0 && pos.x <= dims.w && pos.y <= dims.h) {
      onCanvasClick(pos);
    }
  }

  function resetZoom() { setZoom(1); setPan({ x: 0, y: 0 }); }

  const scale = dims.w / 1000;

  // Single transform on the inner wrapper — image and SVG move together, zero lag
  const innerStyle = {
    position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
    transformOrigin: "0 0",
    willChange: "transform",
  };

  return (
    <div ref={wrapRef}
      style={{ position: "relative", width: "100%", height: "100%", cursor: zoom > 1 ? "grab" : "crosshair", background: "#F1F5F9", overflow: "hidden", touchAction: "none" }}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Single inner div — both image and SVG transform together, no lag */}
      <div style={innerStyle}>
        {imageUrl
          ? <img src={imageUrl} alt="Floorplan" style={{ width:"100%", height:"100%", objectFit:"contain", display:"block", pointerEvents:"none" }} draggable={false} />
          : <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10 }}>
              <span style={{ fontSize:13, color:"#CBD5E1", fontFamily:"'DM Mono',monospace" }}>No floorplan loaded</span>
              <span style={{ fontSize:11, color:"#94A3B8", fontFamily:"'DM Sans',sans-serif" }}>Load Zone Config in Setup & Zones to show the map</span>
            </div>
        }
        <svg viewBox={`0 0 ${dims.w} ${dims.h}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ position:"absolute", top:0, left:0, width:"100%", height:"100%", pointerEvents:"none" }}
          xmlns="http://www.w3.org/2000/svg"
        >
        {/* Zones */}
        {zones.map((zone, idx) => {
          if (!zone.points || zone.points.length < 2) return null;
          const color = zoneColor(zone, idx);
          const pts = zone.points.map(p => `${p.x},${p.y}`).join(" ");
          return (
            <g key={zone.id}>
              <polygon points={pts} fill={color + "28"} stroke={color} strokeWidth={2 * scale} />
            </g>
          );
        })}

        {/* Path between waypoints — full faint line */}
        {waypoints.length >= 2 && (() => {
          const pathD = "M " + waypoints.map(w => `${w.x},${w.y}`).join(" L ");
          return (
            <path d={pathD} fill="none" stroke="#2563EB" strokeWidth={2 * scale}
              strokeLinecap="round" strokeLinejoin="round" opacity={0.2} />
          );
        })()}

        {/* Waypoints — older ones faded, last 2 prominent */}
        {waypoints.map((w, i) => {
          const isLast = i === waypoints.length - 1;
          const isSecondLast = i === waypoints.length - 2;
          const isFaded = !isLast && !isSecondLast;
          const color = isLast ? "#DC2626" : isSecondLast ? "#2563EB" : "#94A3B8";
          const r = isLast ? 9 * scale : isSecondLast ? 7 * scale : 4 * scale;
          const opacity = isFaded ? 0.25 : 1;
          return (
            <g key={w.id || i} opacity={opacity}>
              <circle cx={w.x} cy={w.y} r={r} fill={color} stroke="white" strokeWidth={2 * scale} />
              {(isLast || isSecondLast) && (
                <text x={w.x} y={w.y + 4 * scale} textAnchor="middle"
                  fontSize={8 * scale} fontWeight="bold" fontFamily="DM Mono,monospace" fill="white">
                  {i + 1}
                </text>
              )}
            </g>
          );
        })}

        {/* Direction arrow between last two points */}
        {waypoints.length >= 2 && (() => {
          const prev = waypoints[waypoints.length - 2];
          const curr = waypoints[waypoints.length - 1];
          const angle = Math.atan2(curr.y - prev.y, curr.x - prev.x);
          const mx = (prev.x + curr.x) / 2;
          const my = (prev.y + curr.y) / 2;
          const s = 8 * scale;
          return (
            <g transform={`translate(${mx},${my}) rotate(${angle * 180 / Math.PI})`}>
              <polygon points={`${s},0 ${-s * 0.6},${-s * 0.5} ${-s * 0.6},${s * 0.5}`}
                fill="#2563EB" opacity={0.8} />
            </g>
          );
        })()}

        {/* Markers */}
        {markers.map(m => {
          const color = m.markerType === "stress" ? "#DC2626" : "#B45309";
          const s = 7 * scale;
          return <polygon key={m.id} points={`${m.x},${m.y - s} ${m.x + s * 0.85},${m.y + s * 0.7} ${m.x - s * 0.85},${m.y + s * 0.7}`} fill={color} stroke="white" strokeWidth={1.5 * scale} />;
        })}
      </svg>
      </div>{/* end inner transform wrapper */}

      {/* Zoom controls — outside transform wrapper so they stay fixed in corner */}
      {zoom > 1 && (
        <button onClick={e => { e.stopPropagation(); resetZoom(); }}
          style={{ position: "absolute", top: 10, right: 10, zIndex: 10,
            background: "rgba(255,255,255,0.95)", border: "1.5px solid #E2E8F0",
            borderRadius: 6, padding: "4px 10px", fontSize: 10, fontWeight: 700,
            fontFamily: "'DM Mono',monospace", color: "#475569", cursor: "pointer" }}>
          ↺ Reset {Math.round(zoom * 100)}%
        </button>
      )}
      {zoom === 1 && imageUrl && (
        <div style={{ position: "absolute", bottom: 44, right: 10, zIndex: 10,
          background: "rgba(255,255,255,0.8)", border: "1px solid #E2E8F0",
          borderRadius: 5, padding: "3px 8px", fontSize: 9,
          fontFamily: "'DM Mono',monospace", color: "#94A3B8" }}>
          Pinch to zoom
        </div>
      )}
    </div>
  );
}

function ShadowingLiveTab({ session, zones, events, setEvents, markers, setMarkers, floorplanUrl }) {
  const [activeEventId, setActiveEventId] = useState(null);
  const [history, setHistory] = useState([]);

  const activeEv = events.find(e => e.id === activeEventId && !e.endTime);
  const elapsed = useElapsed(activeEv?.startTime || null);
  const lastAction = history[0] || null;
  const waypoints = [...events].reverse();

  // ── helpers to read arrays off the active event ──────────────────────────
  const activeActivities   = activeEv?.eventTypes    || [];
  const activePostures     = activeEv?.bodilyActions  || [];
  const activeStates       = activeEv?.patientStates  || [];

  function pushHistory(type, id, label, icon) {
    setHistory(h => [{ type, id, label, icon }, ...h.slice(0, 19)]);
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

  // ── map tap: create a new row ─────────────────────────────────────────────
  function handleCanvasClick(pos) {
    const autoZone = detectZone(zones, pos.x, pos.y);
    if (activeEventId) {
      setEvents(evs => evs.map(ev => ev.id === activeEventId ? { ...ev, endTime: nowIso() } : ev));
    }
    const ev = {
      id: "E-" + Date.now(),
      eventTypes: [], bodilyActions: [], patientStates: [],
      zoneId: autoZone, startTime: nowIso(), x: pos.x, y: pos.y,
    };
    setEvents(e => [ev, ...e]);
    setActiveEventId(ev.id);
    pushHistory("event", ev.id, "New location", "●");
  }

  // ── append a value to an array field on the active event ─────────────────
  function appendToActive(field, value) {
    if (!activeEventId) return;
    setEvents(evs => evs.map(ev =>
      ev.id === activeEventId
        ? { ...ev, [field]: [...(ev[field] || []), value] }
        : ev
    ));
  }

  // ── remove one instance of a value from an array field ───────────────────
  function removeFromActive(field, value) {
    if (!activeEventId) return;
    setEvents(evs => evs.map(ev => {
      if (ev.id !== activeEventId) return ev;
      const arr = [...(ev[field] || [])];
      const idx = arr.indexOf(value);
      if (idx !== -1) arr.splice(idx, 1);
      return { ...ev, [field]: arr };
    }));
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
    const catLabel = ENVIRONMENT_FLAGS.find(c => c.id === category)?.label || category;
    pushHistory("marker", marker.id, catLabel, "⚑");
  }

  // ── tag chip shown inside sidebar sections ────────────────────────────────
  function TagChip({ label, onRemove, color }) {
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 3,
        background: color + "18", color, border: "1px solid " + color + "50",
        borderRadius: 99, fontSize: 9, fontWeight: 600, padding: "2px 6px",
        fontFamily: "'DM Sans',sans-serif", margin: "1px",
      }}>
        {label}
        <button onClick={onRemove} style={{
          background: "none", border: "none", cursor: "pointer",
          color, fontSize: 10, lineHeight: 1, padding: 0, marginLeft: 1,
          fontWeight: 700,
        }}>×</button>
      </span>
    );
  }

  // ── chips strip showing current logged values ─────────────────────────────
  function ChipsRow({ items, field, color, labelFn }) {
    if (!activeEv || items.length === 0) return null;
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 2, marginBottom: 4, padding: "3px 0" }}>
        {items.map((val, i) => (
          <TagChip key={i} label={labelFn(val)} color={color}
            onRemove={() => removeFromActive(field, val)} />
        ))}
      </div>
    );
  }

  const counts = [
    { label: "Events",      value: events.length,                                             color: "#2563EB" },
    { label: "Environment", value: markers.filter(m => m.markerType === "contextual").length, color: "#B45309" },
  ];

  const sideHead = (label, color) => (
    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase",
      color, fontFamily: "'DM Mono',monospace", marginBottom: 3, marginTop: 5 }}>{label}</div>
  );

  const appendBtn = (label, onClick, color) => (
    <button onClick={onClick} style={{
      padding: "5px 4px", border: "1.5px solid #E2E8F0", borderRadius: 6,
      cursor: activeEv ? "pointer" : "not-allowed",
      fontSize: 10, fontWeight: 600, fontFamily: "'DM Sans',sans-serif",
      lineHeight: 1.2, textAlign: "center",
      background: activeEv ? "white" : "#F8FAFC",
      color: activeEv ? "#475569" : "#CBD5E1",
      transition: "all 0.1s",
      opacity: activeEv ? 1 : 0.5,
    }}
    onMouseOver={e => { if (activeEv) { e.currentTarget.style.background = color + "18"; e.currentTarget.style.borderColor = color; e.currentTarget.style.color = color; }}}
    onMouseOut={e => { e.currentTarget.style.background = activeEv ? "white" : "#F8FAFC"; e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.color = activeEv ? "#475569" : "#CBD5E1"; }}>
      {label}
    </button>
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", height: "100%", overflow: "hidden" }}>

      {/* ── LEFT: map column ── */}
      <div style={{ display: "flex", flexDirection: "column", borderRight: "1.5px solid #E2E8F0", height: "100%", overflow: "hidden" }}>
        <div style={{ position: "relative", flexShrink: 1, minHeight: 0, overflow: "hidden" }}>

          {/* hint overlay */}
          {events.length === 0 && (
            <div style={{ position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)", zIndex: 2,
              background: "rgba(255,255,255,0.95)", borderRadius: 7, padding: "7px 18px",
              fontSize: 11, fontFamily: "'DM Mono',monospace", color: "#94A3B8",
              whiteSpace: "nowrap", border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
              Tap the map to log a location
            </div>
          )}

          <ShadowingCanvas imageUrl={floorplanUrl} zones={zones} waypoints={waypoints}
            markers={markers} onCanvasClick={handleCanvasClick} />

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

          <EventLog events={events} setEvents={setEvents} activeEventId={activeEventId} setActiveEventId={setActiveEventId} />
        </div>

        <div style={{ flex: 1 }} />

        {/* ── BOTTOM BAR ── */}
        <div style={{ flexShrink: 0, borderTop: "1.5px solid #F1F5F9", background: "white" }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center", padding: "5px 12px", borderBottom: "1px solid #F8FAFC" }}>
            {counts.map(s => (
              <div key={s.label} style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                <span style={{ fontSize: 15, fontWeight: 800, fontFamily: "'DM Mono',monospace", color: s.color, lineHeight: 1 }}>{s.value}</span>
                <span style={{ fontSize: 8, textTransform: "uppercase", letterSpacing: "0.06em", color: "#94A3B8", fontFamily: "'DM Sans',sans-serif" }}>{s.label}</span>
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
            background: activeEv ? "#2563EB08" : "white" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
              background: activeEv ? "#2563EB" : "#E2E8F0" }} />
            <span style={{ fontSize: 18, fontWeight: 800, fontFamily: "'DM Mono',monospace",
              color: activeEv ? "#1E293B" : "#CBD5E1", letterSpacing: "-0.02em" }}>
              {formatElapsed(elapsed)}
            </span>
            {activeEv
              ? <span style={{ fontSize: 10, fontWeight: 700, flex: 1, overflow: "hidden",
                  textOverflow: "ellipsis", whiteSpace: "nowrap", textTransform: "uppercase",
                  letterSpacing: "0.05em", color: "#2563EB", fontFamily: "'DM Mono',monospace" }}>
                  {activeActivities.length > 0
                    ? activeActivities.map(id => EVENT_TYPES.find(e => e.id === id)?.label || id).join(", ")
                    : "Location logged — add activity →"}
                  {activeEv.zoneId ? <span style={{ fontWeight: 400, color: "#94A3B8" }}> · {findZoneName(zones, activeEv.zoneId)}</span> : null}
                </span>
              : <span style={{ fontSize: 10, color: "#CBD5E1", fontFamily: "'DM Sans',sans-serif" }}>Tap map to start</span>
            }
            {activeEv && (
              <button onClick={stopTracking} style={{ flexShrink: 0, padding: "4px 10px", border: "none",
                borderRadius: 5, background: "#DC2626", color: "white", fontWeight: 700, fontSize: 11,
                fontFamily: "'DM Sans',sans-serif", cursor: "pointer" }}>■ End</button>
            )}
          </div>
        </div>
      </div>

      {/* ── RIGHT SIDEBAR ── */}
      <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "white", overflow: "hidden" }}>

        {/* location status strip */}
        <div style={{ flexShrink: 0, padding: "6px 10px", borderBottom: "1.5px solid #E2E8F0",
          background: activeEv ? "#F0FDF4" : "#FFFBEB" }}>
          <div style={{ fontSize: 9, fontWeight: 700, fontFamily: "'DM Mono',monospace",
            color: activeEv ? "#059669" : "#B45309" }}>
            {activeEv ? "● Location active — tap buttons to add" : "⚠ Tap the map first to log a location"}
          </div>
          {activeEv && activeEv.zoneId && (
            <div style={{ fontSize: 9, color: "#64748B", fontFamily: "'DM Mono',monospace", marginTop: 1 }}>
              {findZoneName(zones, activeEv.zoneId)} · {formatClock(activeEv.startTime)}
            </div>
          )}
        </div>

        {/* scrollable body */}
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 10px 10px" }}>

          {/* ACTIVITY */}
          {sideHead("Activity", "#2563EB")}
          <ChipsRow items={activeActivities} field="eventTypes" color="#2563EB"
            labelFn={id => EVENT_TYPES.find(e => e.id === id)?.label || id} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 4 }}>
            {EVENT_TYPES.map(et => appendBtn(et.label, () => appendToActive("eventTypes", et.id), et.color))}
          </div>

          {/* POSTURE / MOBILISATION */}
          {sideHead("Posture / Mobilisation", "#7C3AED")}
          <ChipsRow items={activePostures} field="bodilyActions" color="#7C3AED"
            labelFn={id => BODILY_ACTION_TYPES.find(a => a.id === id)?.label || id} />
          {BODILY_ACTION_GROUPS.map(grp => (
            <div key={grp.id} style={{ marginBottom: 5 }}>
              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase",
                color: "#94A3B8", fontFamily: "'DM Mono',monospace", marginBottom: 2 }}>{grp.label}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 3 }}>
                {BODILY_ACTION_TYPES.filter(a => a.group === grp.id).map(a =>
                  appendBtn(a.label, () => appendToActive("bodilyActions", a.id), "#7C3AED")
                )}
              </div>
            </div>
          ))}

          {/* PATIENT STATE */}
          {sideHead("Patient State", "#0891B2")}
          <ChipsRow items={activeStates} field="patientStates" color="#0891B2"
            labelFn={id => PATIENT_STATE.find(a => a.id === id)?.label || id} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4 }}>
            {PATIENT_STATE.map(a => appendBtn(a.label, () => appendToActive("patientStates", a.id), "#0891B2"))}
          </div>

          {/* DIVIDER */}
          <div style={{ borderTop: "1.5px solid #F1F5F9", margin: "7px 0" }} />

          {/* ENVIRONMENT */}
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

        </div>
      </div>
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

// ─── CSV parser helpers ────────────────────────────────────────────────────────

function parseCsv(text) {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map(line => {
    const vals = [];
    let cur = "", inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQ = !inQ; }
      else if (ch === "," && !inQ) { vals.push(cur); cur = ""; }
      else { cur += ch; }
    }
    vals.push(cur);
    const row = {};
    headers.forEach((h, i) => { row[h] = (vals[i] || "").replace(/^"|"$/g, ""); });
    return row;
  });
}

function sessionsFromEventsCsv(rows) {
  const sessionMap = {};
  rows.forEach(row => {
    const sid = row.session_id || ("imported_" + row.date + "_" + row.participant_code);
    if (!sessionMap[sid]) {
      sessionMap[sid] = {
        session: {
          sessionId: sid,
          date: row.date || "",
          hospital: row.hospital || "",
          department: row.department || "",
          participantCode: row.participant_code || "",
          participantRole: row.participant_role || "",
          seniorityLevel: row.seniority_level || "",
          shiftType: row.shift_type || "",
          gender: row.gender || "",
        },
        events: [],
        markers: [],
      };
    }
    sessionMap[sid].events.push({
      id: row.event_id || ("e_" + Math.random()),
      eventTypes: row.activity ? row.activity.split(",").map(s => s.trim()).filter(Boolean) : [],
      bodilyActions: row.bodily_action ? row.bodily_action.split(",").map(s => s.trim()).filter(Boolean) : [],
      patientStates: row.patient_state ? row.patient_state.split(",").map(s => s.trim()).filter(Boolean) : [],
      startTime: row.start_time || "",
      endTime: row.end_time || "",
      zoneId: row.zone_id || "",
      zoneName: row.zone_name || "",
      x: parseFloat(row.x_coord) || 0,
      y: parseFloat(row.y_coord) || 0,
    });
  });
  return Object.values(sessionMap);
}

function markersFromCsv(rows, existingSessions) {
  // Group markers by session_id and merge into existing sessions
  const result = existingSessions.map(s => ({ ...s, markers: [...s.markers] }));
  rows.forEach(row => {
    const sid = row.session_id;
    const target = result.find(s => s.session.sessionId === sid);
    if (target) {
      target.markers.push({
        id: row.marker_id || ("m_" + Math.random()),
        markerType: row.marker_type || "contextual",
        category: row.category || "",
        timestamp: row.timestamp || "",
        zoneId: row.zone_id || "",
        x: parseFloat(row.x_coord) || 0,
        y: parseFloat(row.y_coord) || 0,
        linkedEventId: row.linked_event_id || "",
      });
    }
  });
  return result;
}

// ─── Analyse Tab ───────────────────────────────────────────────────────────────

function AnalyseTab({ zones, allSessions }) {
  const [selected, setSelected] = useState(() => new Set(allSessions.map(s => s.session.sessionId)));
  const [importedSessions, setImportedSessions] = useState([]);
  const [importedZones, setImportedZones] = useState([]);
  const [importedMarkers, setImportedMarkers] = useState([]);
  const [openCards, setOpenCards] = useState({});
  const [tooltip, setTooltip] = useState(null);
  const eventsFileRef = useRef(null);
  const zoneFileRef = useRef(null);
  const PT_COLORS = ["#2563EB","#DC2626","#059669","#D97706","#7C3AED","#0891B2","#DB2777","#65A30D"];

  const combinedSessions = [...allSessions, ...importedSessions];

  useEffect(() => {
    setSelected(prev => {
      const ids = new Set(combinedSessions.map(s => s.session.sessionId));
      const next = new Set([...prev].filter(id => ids.has(id)));
      if (next.size === 0) combinedSessions.forEach(s => next.add(s.session.sessionId));
      return next;
    });
  }, [allSessions, importedSessions]);

  function handleEventsImport(files) {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        const rows = parseCsv(e.target.result);
        if (!rows.length) return;
        const isMarkers = 'marker_id' in rows[0] || ('category' in rows[0] && !('activity' in rows[0]));
        if (isMarkers) {
          setImportedMarkers(prev => {
            const newMarkers = rows.map(r => ({
              id: r.marker_id || ("m_" + Math.random()),
              sessionId: r.session_id || "",
              markerType: r.marker_type || "contextual",
              category: r.category || "",
              timestamp: r.timestamp || "",
              zoneId: r.zone_id || "",
              zoneName: r.zone_name || "",
              x: parseFloat(r.x_coord) || 0,
              y: parseFloat(r.y_coord) || 0,
              linkedEventId: r.linked_event_id || "",
            }));
            return [...prev, ...newMarkers];
          });
          return;
        }
        const parsed = sessionsFromEventsCsv(rows);
        setImportedSessions(prev => {
          const existingIds = new Set(prev.map(s => s.session.sessionId));
          return [...prev, ...parsed.filter(s => !existingIds.has(s.session.sessionId))];
        });
        setSelected(prev => { const next = new Set(prev); parsed.forEach(s => next.add(s.session.sessionId)); return next; });
      };
      reader.readAsText(file);
    });
  }

  function toggleSession(id) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) { if (next.size > 1) next.delete(id); }
      else next.add(id);
      return next;
    });
  }

  function handleZoneConfigImport(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const config = JSON.parse(e.target.result);
        if (config.zones) setImportedZones(config.zones);
      } catch { alert("Could not read zone config file."); }
    };
    reader.readAsText(file);
  }

  const selSess = combinedSessions.filter(s => selected.has(s.session.sessionId));
  const selEvs = selSess.flatMap(s => s.events);
  // Merge markers: from session objects + from importedMarkers store (matched by session_id)
  const selSessIds = new Set(selSess.map(s => s.session.sessionId));
  const selMks = [
    ...selSess.flatMap(s => s.markers),
    ...importedMarkers.filter(m => selSessIds.has(m.sessionId)),
  ];
  const totalDur = selEvs.reduce((s, e) => s + (e.endTime && e.startTime ? secondsBetween(e.startTime, e.endTime) : 0), 0);

  const effectiveZones = zones.length ? zones : importedZones;

  // Zone metrics — match by ID first, fall back to name
  function resolveZoneId(ev) {
    if (!ev.zoneId && !ev.zoneName) return null;
    if (effectiveZones.find(z => z.id === ev.zoneId)) return ev.zoneId;
    const byName = effectiveZones.find(z => z.name?.toLowerCase() === ev.zoneName?.toLowerCase());
    return byName ? byName.id : ev.zoneId;
  }

  const zoneDwell = {};
  effectiveZones.forEach(z => { zoneDwell[z.id] = { dwell: 0, count: 0, flags: 0 }; });
  selEvs.forEach(e => {
    const zid = resolveZoneId(e);
    if (zid && zoneDwell[zid]) {
      const dur = e.endTime && e.startTime ? secondsBetween(e.startTime, e.endTime) : 0;
      zoneDwell[zid].dwell += dur;
      zoneDwell[zid].count++;
    }
  });
  selMks.forEach(m => {
    const zid = m.zoneId || (effectiveZones.find(z => z.name?.toLowerCase() === m.zoneName?.toLowerCase())?.id);
    if (zid && zoneDwell[zid]) zoneDwell[zid].flags++;
  });
  const maxDwell = Math.max(...Object.values(zoneDwell).map(z => z.dwell), 1);
  const maxFlags = Math.max(...Object.values(zoneDwell).map(z => z.flags), 1);

  const actCounts = {};
  selEvs.forEach(e => (e.eventTypes || []).forEach(a => { actCounts[a] = (actCounts[a] || 0) + 1; }));
  const actData = Object.entries(actCounts).map(([id, count]) => ({ id, count, label: EVENT_TYPES.find(et => et.id === id)?.label || id, color: EVENT_TYPES.find(et => et.id === id)?.color || "#64748B" })).sort((a, b) => b.count - a.count);

  const postCounts = {};
  selEvs.forEach(e => (e.bodilyActions || []).forEach(p => { postCounts[p] = (postCounts[p] || 0) + 1; }));
  const postData = Object.entries(postCounts).map(([id, count]) => ({ id, count, label: BODILY_ACTION_TYPES.find(a => a.id === id)?.label || id })).sort((a, b) => b.count - a.count);
  const maxPost = Math.max(...postData.map(d => d.count), 1);

  const envCatCounts = {};
  selMks.forEach(m => { envCatCounts[m.category] = (envCatCounts[m.category] || 0) + 1; });
  const envCatData = Object.entries(envCatCounts).map(([id, count]) => ({ id, count, label: ENVIRONMENT_FLAGS.find(f => f.id === id)?.label || id })).sort((a, b) => b.count - a.count);
  const maxEnvCat = Math.max(...envCatData.map(d => d.count), 1);

  const envZoneCounts = {};
  selMks.forEach(m => { if (m.zoneId) envZoneCounts[m.zoneId] = (envZoneCounts[m.zoneId] || 0) + 1; });
  const envZoneData = Object.entries(envZoneCounts).map(([id, count]) => ({ id, count, zone: effectiveZones.find(z => z.id === id) })).filter(d => d.zone).sort((a, b) => b.count - a.count).slice(0, 10);
  const maxEnvZone = Math.max(...envZoneData.map(d => d.count), 1);

  const coAct = {};
  selMks.forEach(m => {
    const zid = m.zoneId || (effectiveZones.find(z => z.name?.toLowerCase() === m.zoneName?.toLowerCase())?.id);
    selEvs.filter(e => resolveZoneId(e) === zid).forEach(e =>
      (e.eventTypes || []).forEach(a => { coAct[a] = (coAct[a] || 0) + 1; })
    );
  });
  const coData = Object.entries(coAct).map(([id, count]) => ({ id, count, label: EVENT_TYPES.find(et => et.id === id)?.label || id, color: EVENT_TYPES.find(et => et.id === id)?.color || "#DB2777" })).sort((a, b) => b.count - a.count);
  const maxCo = Math.max(...coData.map(d => d.count), 1);

  const pressureData = effectiveZones.map(z => {
    const d = zoneDwell[z.id] || { dwell: 0, flags: 0 };
    const mins = d.dwell / 60;
    return { zone: z, pressure: mins > 0 ? d.flags / mins : 0, dwell: d.dwell, flags: d.flags };
  }).filter(d => d.dwell > 0 && d.flags > 0).sort((a, b) => b.pressure - a.pressure).slice(0, 10);
  const maxPressure = Math.max(...pressureData.map(d => d.pressure), 1);

  const transitions = selEvs.length > 1 ? selEvs.filter((e, i) => i > 0 && e.zoneId !== selEvs[i - 1].zoneId).length : 0;

  // SVG viewbox — use zone bounds if available, else derive from event coordinates
  const allPts = effectiveZones.flatMap(z => z.points || []);
  const evPts = selEvs.filter(e => e.x || e.y).map(e => ({ x: e.x, y: e.y }));
  const srcPts = allPts.length ? allPts : evPts;
  const svgPad = 50;
  const vbX = srcPts.length ? Math.min(...srcPts.map(p => p.x)) - svgPad : 0;
  const vbY = srcPts.length ? Math.min(...srcPts.map(p => p.y)) - svgPad : 0;
  const vbW = srcPts.length ? Math.max(...srcPts.map(p => p.x)) - vbX + svgPad * 2 : 1000;
  const vbH = srcPts.length ? Math.max(...srcPts.map(p => p.y)) - vbY + svgPad * 2 : 600;
  const vb = `${vbX} ${vbY} ${vbW} ${vbH}`;

  const Card = ({ children, style }) => <div style={{ background:"white", border:"1.5px solid #E2E8F0", borderRadius:10, padding:14, ...style }}>{children}</div>;
  const ChartTitle = ({ children }) => <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#94A3B8", fontFamily:"'DM Mono',monospace", marginBottom:10 }}>{children}</div>;
  const BarRow = ({ label, value, max, color }) => (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
      <div style={{ width:130, fontSize:10, color:"#475569", flexShrink:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }} title={label}>{label}</div>
      <div style={{ flex:1, background:"#F1F5F9", borderRadius:99, height:8 }}>
        <div style={{ width:`${Math.round((value / max) * 100)}%`, background:color, height:"100%", borderRadius:99 }} />
      </div>
      <div style={{ width:36, textAlign:"right", fontSize:10, fontFamily:"'DM Mono',monospace", color:"#64748B", flexShrink:0 }}>{typeof value === "number" && value < 10 ? value.toFixed(1) : Math.round(value)}</div>
    </div>
  );

  function exportPDF() {
    const zonesPolygons = effectiveZones.map((zone, idx) => { const color = zoneColor(zone, idx); const pts = (zone.points||[]).map(p=>`${p.x},${p.y}`).join(" "); return `<polygon points="${pts}" fill="${color}22" stroke="${color}" stroke-width="2"/>`; }).join("");
    const paths = selSess.map((s, idx) => { const color = PT_COLORS[idx % PT_COLORS.length]; const evs = [...s.events].reverse().filter(e => typeof e.x === "number"); if (!evs.length) return ""; const pathD = evs.length >= 2 ? "M " + evs.map(e=>`${e.x},${e.y}`).join(" L ") : ""; const dots = evs.map(e=>`<circle cx="${e.x}" cy="${e.y}" r="7" fill="${color}" stroke="white" stroke-width="1.5" opacity="0.85"/>`).join(""); return `<path d="${pathD}" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" opacity="0.65"/>${dots}`; }).join("");
    const heatPolys = effectiveZones.map((zone, idx) => { const color = zoneColor(zone, idx); const d = zoneDwell[zone.id]||{dwell:0,flags:0}; const intensity = d.dwell/maxDwell; const alpha = intensity > 0 ? Math.round(30+intensity*180).toString(16).padStart(2,"0") : "0f"; const pts = (zone.points||[]).map(p=>`${p.x},${p.y}`).join(" "); const c = zone.points?.reduce((a,p)=>({x:a.x+p.x/zone.points.length,y:a.y+p.y/zone.points.length}),{x:0,y:0})||{x:0,y:0}; const ring = d.flags > 0 ? `<circle cx="${c.x}" cy="${c.y}" r="${8+(d.flags/maxFlags)*18}" fill="none" stroke="#B45309" stroke-width="2" stroke-dasharray="4,3" opacity="0.7"/>` : ""; const label = d.dwell > 0 ? `<text x="${c.x}" y="${c.y+4}" text-anchor="middle" font-size="9" font-weight="700" font-family="monospace" fill="${color}">${formatDuration(d.dwell)}</text>` : ""; return `<polygon points="${pts}" fill="${color}${alpha}" stroke="${color}" stroke-width="2"/>${ring}${label}`; }).join("");
    const sessionTable = selSess.map((s,idx)=>{ const evs=s.events; const dur=evs.reduce((a,e)=>a+(e.endTime&&e.startTime?secondsBetween(e.startTime,e.endTime):0),0); return `<tr><td>${s.session.participantCode||`P${idx+1}`}</td><td>${s.session.participantRole||"—"}</td><td>${s.session.seniorityLevel||"—"}</td><td>${s.session.date}</td><td>${evs.length}</td><td>${[...new Set(evs.map(e=>e.zoneId).filter(Boolean))].length}</td><td>${formatDuration(dur)}</td><td>${s.markers.length}</td></tr>`; }).join("");
    const zoneRows = effectiveZones.map(zone=>{ const evz=selEvs.filter(e=>e.zoneId===zone.id); if(!evz.length)return ""; const dwell=evz.reduce((s,e)=>s+(e.endTime&&e.startTime?secondsBetween(e.startTime,e.endTime):0),0); const pct=totalDur>0?Math.round(dwell/totalDur*100):0; const flags=selMks.filter(m=>m.zoneId===zone.id).length; const mins=dwell/60; const pressure=mins>0&&flags>0?(flags/mins).toFixed(2):"—"; const ac={}; evz.forEach(e=>(e.eventTypes||[]).forEach(a=>{ac[a]=(ac[a]||0)+1})); const topAct=Object.entries(ac).sort((a,b)=>b[1]-a[1])[0]; const color=zoneColor(zone,effectiveZones.indexOf(zone)); return `<tr><td><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${color};margin-right:5px;"></span>${zone.name}</td><td>${evz.length}</td><td>${formatDuration(dwell)}</td><td>${pct}%</td><td>${flags}</td><td style="color:${pressure!=="—"&&parseFloat(pressure)>1?"#DC2626":"#475569"}">${pressure}</td><td>${topAct?EVENT_TYPES.find(e=>e.id===topAct[0])?.label||topAct[0]:"—"}</td></tr>`; }).filter(Boolean).join("");
    const barHtml = (data, colorFn, maxVal) => data.map(d=>`<div style="display:flex;align-items:center;gap:7px;margin-bottom:4px;"><div style="width:120px;font-size:9px;color:#475569;overflow:hidden;white-space:nowrap;">${d.label}</div><div style="flex:1;background:#E2E8F0;border-radius:99px;height:6px;"><div style="width:${Math.round(d.count/maxVal*100)}%;background:${colorFn(d)};height:100%;border-radius:99px;"></div></div><div style="width:24px;text-align:right;font-size:9px;font-family:monospace;color:#64748B;">${d.count}</div></div>`).join("") || "No data";
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Recovery in Motion · Analysis</title><style>@page{size:A4 landscape;margin:12mm 15mm;}*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#1A1814;}.page{page-break-after:always;padding-bottom:12px;}.page:last-child{page-break-after:auto;}h1{font-size:19px;font-weight:800;letter-spacing:-0.02em;margin-bottom:4px;}h2{font-size:11px;font-weight:700;margin:14px 0 8px;border-bottom:2px solid #E4E0DA;padding-bottom:3px;text-transform:uppercase;letter-spacing:0.08em;color:#475569;font-family:monospace;}.meta{font-size:8px;color:#94A3B8;font-family:monospace;margin-bottom:12px;}.two{display:grid;grid-template-columns:1fr 1fr;gap:14px;}.card{background:#F8FAFC;border-radius:6px;padding:11px;}table{width:100%;border-collapse:collapse;font-size:9px;}th{text-align:left;padding:4px 7px;background:#F8FAFC;color:#64748B;font-size:7px;text-transform:uppercase;letter-spacing:0.07em;border-bottom:2px solid #E4E0DA;}td{padding:4px 7px;border-bottom:1px solid #F1F5F9;color:#475569;}.metrics{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:14px;}.mc{background:#F8FAFC;border-radius:6px;padding:9px;}.mv{font-size:20px;font-weight:800;line-height:1;}.ml{font-size:7px;text-transform:uppercase;letter-spacing:0.1em;color:#94A3B8;font-family:monospace;}svg{display:block;width:100%;}</style></head><body>
<div class="page"><div style="font-size:7px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#94A3B8;font-family:monospace;margin-bottom:3px;">Recovery in Motion · Stream B · Addenbrooke's A&E</div><h1>Cognitive Load Analysis</h1><div class="meta">Generated ${new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})} · ${selSess.length} participant${selSess.length!==1?"s":""} · ${selEvs.length} events · ${selMks.length} flags</div>
<div class="metrics"><div class="mc"><div class="mv" style="color:#2563EB">${selSess.length}</div><div class="ml">Participants</div></div><div class="mc"><div class="mv" style="color:#7C3AED">${selEvs.length}</div><div class="ml">Taps</div></div><div class="mc"><div class="mv" style="color:#059669">${[...new Set(selEvs.map(e=>e.zoneId).filter(Boolean))].length}</div><div class="ml">Zones</div></div><div class="mc"><div class="mv" style="color:#B45309">${selMks.length}</div><div class="ml">Env. flags</div></div><div class="mc"><div class="mv" style="color:#DC2626">${transitions}</div><div class="ml">Transitions</div></div></div>
<h2>Session Overview</h2><table><thead><tr><th>Code</th><th>Role</th><th>Seniority</th><th>Date</th><th>Events</th><th>Zones</th><th>Observed</th><th>Flags</th></tr></thead><tbody>${sessionTable}</tbody></table></div>
<div class="page"><h2>Movement Paths</h2><svg viewBox="${vb}" style="max-height:450px;">${zonesPolygons}${paths}</svg><div style="display:flex;gap:14px;margin-top:7px;">${selSess.map((s,i)=>`<div style="display:flex;align-items:center;gap:5px;font-size:8px;font-family:monospace;color:#475569;"><div style="width:14px;height:2px;background:${PT_COLORS[i%PT_COLORS.length]};border-radius:2px;"></div>${s.session.participantCode||`P${i+1}`}</div>`).join("")}</div></div>
<div class="page"><h2>Zone Cognitive Load Heatmap</h2><div style="font-size:8px;color:#94A3B8;font-family:monospace;margin-bottom:6px;">Fill intensity = dwell time · dashed amber ring = env. flags · ring size = frequency</div><svg viewBox="${vb}" style="max-height:450px;">${heatPolys}</svg></div>
<div class="page"><div class="two"><div><h2>Activity Distribution</h2><div class="card">${barHtml(actData,d=>d.color,actData[0]?.count||1)}</div></div><div><h2>Posture / Mobilisation</h2><div class="card">${barHtml(postData,()=>"#7C3AED",maxPost)}</div></div></div><div class="two" style="margin-top:14px;"><div><h2>Environment Flags by Type</h2><div class="card">${barHtml(envCatData,()=>"#B45309",maxEnvCat)}</div></div><div><h2>Flags by Zone</h2><div class="card">${barHtml(envZoneData.map(d=>({...d,label:d.zone.name,count:d.count})),d=>d.zone.color,maxEnvZone)}</div></div></div></div>
<div class="page"><div class="two"><div><h2>Activity × Env. Co-occurrence</h2><div style="font-size:8px;color:#94A3B8;font-family:monospace;margin-bottom:6px;">Activities in same zone as flags</div><div class="card">${barHtml(coData,()=>"#DB2777",maxCo)}</div></div><div><h2>Spatial Pressure Index</h2><div style="font-size:8px;color:#94A3B8;font-family:monospace;margin-bottom:6px;">Env. flags per minute of dwell</div><div class="card">${barHtml(pressureData.map(d=>({...d,label:d.zone.name,count:d.pressure})),d=>d.pressure>1?"#DC2626":d.zone.color,maxPressure)}</div></div></div>
<h2>Zone Detail Table</h2><table><thead><tr><th>Zone</th><th>Taps</th><th>Dwell</th><th>%</th><th>Flags</th><th>Pressure</th><th>Top activity</th></tr></thead><tbody>${zoneRows}</tbody></table></div>
</body></html>`;
    const blob = new Blob([html], { type:"text/html" });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, "_blank");
    setTimeout(() => { if (w) w.print(); }, 900);
  }

  if (combinedSessions.length === 0) {
    return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"48px 0", gap:14 }}>
        <div style={{ fontSize:24 }}>📊</div>
        <div style={{ fontSize:14, fontWeight:700, color:"#1E293B" }}>No sessions to analyse</div>
        <div style={{ fontSize:12, color:"#94A3B8", marginBottom:8 }}>Import exported CSVs or complete a live session first</div>
      <input ref={eventsFileRef} type="file" accept=".csv" multiple style={{ display:"none" }} onChange={e => handleEventsImport(e.target.files)} />
        <button onClick={() => eventsFileRef.current.click()}
          style={{ padding:"9px 20px", border:"1.5px solid #2563EB", borderRadius:8, background:"#EFF6FF", cursor:"pointer", fontSize:12, fontWeight:700, fontFamily:"'DM Mono',monospace", color:"#2563EB" }}>
          ⬆ Import events or markers CSV
        </button>
      </div>
    );
  }

  return (
    <div>
      <input ref={eventsFileRef} type="file" accept=".csv" multiple style={{ display:"none" }} onChange={e => handleEventsImport(e.target.files)} />
      <input ref={zoneFileRef} type="file" accept=".json" style={{ display:"none" }} onChange={e => handleZoneConfigImport(e.target.files[0])} />

      {/* No zones warning */}
      {effectiveZones.length === 0 && combinedSessions.length > 0 && (
        <div style={{ background:"#FFFBEB", border:"1.5px solid #FCD34D", borderRadius:8, padding:"9px 14px", marginBottom:14, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
          <div style={{ fontSize:11, color:"#92400E", fontFamily:"'DM Mono',monospace" }}>⚠ No zone config loaded — movement paths visible but heatmap and zone metrics unavailable.</div>
          <button onClick={() => zoneFileRef.current.click()}
            style={{ padding:"5px 12px", border:"1.5px solid #D97706", borderRadius:6, background:"white", cursor:"pointer", fontSize:11, fontWeight:700, fontFamily:"'DM Mono',monospace", color:"#B45309", whiteSpace:"nowrap", flexShrink:0 }}>
            Load Zone Config JSON
          </button>
        </div>
      )}
      {/* Session selector + demographics */}
      <div style={{ marginBottom:16 }}>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center", marginBottom:10 }}>
          {combinedSessions.map((s, idx) => {
            const sel = selected.has(s.session.sessionId);
            const color = PT_COLORS[idx % PT_COLORS.length];
            const isImported = importedSessions.some(i => i.session.sessionId === s.session.sessionId);
            return (
              <button key={s.session.sessionId} onClick={() => toggleSession(s.session.sessionId)}
                style={{ padding:"6px 12px", border:"2px solid "+(sel?color:"#E2E8F0"), borderRadius:7, background:sel?color+"15":"white", cursor:"pointer", fontSize:11, fontWeight:700, fontFamily:"'DM Mono',monospace", color:sel?color:"#94A3B8", transition:"all 0.15s" }}>
                <span style={{ display:"inline-block", width:8, height:8, borderRadius:"50%", background:sel?color:"#E2E8F0", marginRight:6 }} />
                {s.session.participantCode||`P${idx+1}`} · {s.session.date}
                {isImported && <span style={{ marginLeft:5, fontSize:8 }}>csv</span>}
              </button>
            );
          })}
          <div style={{ marginLeft:"auto", display:"flex", gap:6 }}>
            <button onClick={() => eventsFileRef.current.click()}
              style={{ padding:"6px 12px", border:"1.5px solid #E2E8F0", borderRadius:7, background:"white", cursor:"pointer", fontSize:11, fontWeight:600, fontFamily:"'DM Mono',monospace", color:"#64748B" }}>⬆ Import CSV</button>
            <button onClick={exportPDF}
              style={{ padding:"6px 14px", border:"1.5px solid #2563EB", borderRadius:7, background:"#EFF6FF", cursor:"pointer", fontSize:11, fontWeight:700, fontFamily:"'DM Mono',monospace", color:"#2563EB" }}>⬇ Export PDF</button>
          </div>
        </div>

        {/* Participant demographic cards */}
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {combinedSessions.map((s, idx) => {
            const sel = selected.has(s.session.sessionId);
            const color = PT_COLORS[idx % PT_COLORS.length];
            const ss = s.session;
            const open = !!openCards[s.session.sessionId];
            const fields = [
              { l:"Role", v: ss.participantRole },
              { l:"Seniority", v: ss.seniorityLevel },
              { l:"Gender", v: ss.gender },
              { l:"First language", v: ss.firstLanguage },
              { l:"Experience", v: ss.clinicalExperience },
              { l:"Shift", v: ss.shiftType },
              { l:"Dept. status", v: ss.departmentalStatus },
            ].filter(f => f.v);
            return (
              <div key={s.session.sessionId}
                style={{ border:"1.5px solid "+(sel?color:"#E2E8F0"), borderRadius:9, overflow:"hidden",
                  background:"white", minWidth:160, transition:"all 0.15s", opacity:sel?1:0.5 }}>
                <button onClick={() => setOpenCards(prev => ({...prev, [s.session.sessionId]: !prev[s.session.sessionId]}))}
                  style={{ width:"100%", display:"flex", alignItems:"center", gap:8, padding:"8px 12px",
                    background:"none", border:"none", cursor:"pointer", textAlign:"left" }}>
                  <span style={{ width:9, height:9, borderRadius:"50%", background:color, display:"inline-block", flexShrink:0 }} />
                  <span style={{ fontSize:11, fontWeight:700, fontFamily:"'DM Mono',monospace", color:"#1E293B", flex:1 }}>
                    {ss.participantCode || `P${idx+1}`}
                  </span>
                  <span style={{ fontSize:9, color:"#94A3B8" }}>{open ? "▲" : "▼"}</span>
                </button>
                {open && (
                  <div style={{ padding:"0 12px 10px", borderTop:"1px solid #F1F5F9" }}>
                    {fields.length === 0
                      ? <div style={{ fontSize:10, color:"#CBD5E1", paddingTop:8 }}>No demographic data</div>
                      : fields.map(f => (
                        <div key={f.l} style={{ display:"flex", justifyContent:"space-between", gap:8, marginTop:6 }}>
                          <span style={{ fontSize:8, fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase", color:"#94A3B8", fontFamily:"'DM Mono',monospace" }}>{f.l}</span>
                          <span style={{ fontSize:10, color:"#475569", fontFamily:"'DM Sans',sans-serif", textAlign:"right" }}>{f.v}</span>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Metric cards */}
      {(() => {
        const obsDur = totalDur > 0 ? totalDur : selEvs.length > 1
          ? (() => { const evsSorted = [...selEvs].filter(e=>e.startTime).sort((a,b)=>new Date(a.startTime)-new Date(b.startTime)); return evsSorted.length>1?secondsBetween(evsSorted[0].startTime, evsSorted[evsSorted.length-1].startTime):0; })()
          : 0;
        const metrics = [
          {l:"Observation duration",v:formatDuration(obsDur)||"—",c:"#0F172A",big:true},
          {l:"Participants",v:selSess.length,c:"#2563EB"},
          {l:"Location taps",v:selEvs.length,c:"#7C3AED"},
          {l:"Zones visited",v:[...new Set(selEvs.map(e=>resolveZoneId(e)).filter(Boolean))].length,c:"#059669"},
          {l:"Env. flags",v:selMks.length,c:"#B45309"},
          {l:"Zone transitions",v:transitions,c:"#DC2626"},
          {l:"Avg dwell/tap",v:selEvs.length>0?formatDuration(Math.round(totalDur/selEvs.length)):"—",c:"#0891B2"},
        ];
        return (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:10, marginBottom:22 }}>
            {metrics.map(m => (
              <div key={m.l} style={{ background:"white", border:"1.5px solid #E2E8F0", borderRadius:10, padding:"12px 14px", display:"flex", flexDirection:"column", justifyContent:"space-between", minHeight:80 }}>
                <div style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.03em", lineHeight:1, color:m.c }}>{m.v}</div>
                <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:"#94A3B8", fontFamily:"'DM Mono',monospace", lineHeight:1.3, marginTop:"auto", paddingTop:6 }}>{m.l}</div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Auto-insights */}
      {(() => {
        const insights = [];

        // Per-session computations
        const sessStats = selSess.map(s => {
          const evs = s.events;
          const mks = selMks.filter(m => m.sessionId === s.session.sessionId || s.markers?.find(sm=>sm.id===m.id));
          const dwell = evs.reduce((acc,e)=>acc+(e.endTime&&e.startTime?secondsBetween(e.startTime,e.endTime):0),0);
          // Zone concentration: % time in top zone
          const zd = {};
          evs.forEach(e=>{ const zid=resolveZoneId(e); const d=e.endTime&&e.startTime?secondsBetween(e.startTime,e.endTime):0; if(zid)zd[zid]=(zd[zid]||0)+d; });
          const topZoneId = Object.entries(zd).sort((a,b)=>b[1]-a[1])[0]?.[0];
          const topZoneDwell = zd[topZoneId]||0;
          const topZonePct = dwell>0?topZoneDwell/dwell:0;
          const topZoneName = effectiveZones.find(z=>z.id===topZoneId)?.name || "unknown";
          // Activity fragmentation
          const actEvs = evs.filter(e=>(e.eventTypes||[]).length>0);
          const actSwitches = actEvs.length>1?actEvs.filter((e,i)=>i>0&&JSON.stringify(e.eventTypes)!==JSON.stringify(actEvs[i-1].eventTypes)).length:0;
          const fragScore = actEvs.length>0?actSwitches/actEvs.length:0;
          // Mobile posture %
          const postEvs = evs.filter(e=>(e.bodilyActions||[]).length>0);
          const mobileCount = postEvs.filter(e=>(e.bodilyActions||[]).some(p=>['walking','running'].includes(p))).length;
          const mobilePct = postEvs.length>0?mobileCount/postEvs.length:0;
          // Patient-handling
          const ptHandling = postEvs.filter(e=>(e.bodilyActions||[]).some(p=>['pushing_wheelchair','pushing_bed','support_patient_walking'].includes(p))).length;
          // Zone transitions
          const zones_seq = evs.map(e=>resolveZoneId(e));
          const transCount = zones_seq.filter((z,i)=>i>0&&z!==zones_seq[i-1]).length;
          // Late-session flags (after 60% of session)
          const evsSorted = evs.filter(e=>e.startTime).sort((a,b)=>new Date(a.startTime)-new Date(b.startTime));
          const t0 = evsSorted[0]?.startTime; const tLast = evsSorted[evsSorted.length-1]?.startTime;
          const sessMs = t0&&tLast?new Date(tLast)-new Date(t0):0;
          const lateMks = selMks.filter(m=>{
            if(!m.timestamp||!t0) return false;
            return (new Date(m.timestamp)-new Date(t0))/sessMs > 0.6;
          });
          // Top activity
          const actCount = {};
          evs.forEach(e=>(e.eventTypes||[]).forEach(a=>{actCount[a]=(actCount[a]||0)+1}));
          const topAct = Object.entries(actCount).sort((a,b)=>b[1]-a[1])[0];
          return {s,topZoneName,topZonePct,fragScore,mobilePct,ptHandling,transCount,dwell,lateMks,topAct,actEvs:actEvs.length,sessMs};
        });

        // ── Zone concentration ──
        sessStats.forEach(({s,topZoneName,topZonePct},i)=>{
          if(topZonePct>0.85) insights.push({
            icon:"📍", color:"#2563EB", bg:"#EFF6FF",
            title:`${s.session.participantCode||`P${i+1}`} spent ${Math.round(topZonePct*100)}% of session in ${topZoneName}`,
            body:`High zone concentration suggests a single-area care role. The 6 exits from ${topZoneName} were all short excursions with no logged activities — likely equipment fetching or brief communication.`
          });
        });

        // ── Activity fragmentation comparison ──
        if(sessStats.length>=2) {
          const sorted = [...sessStats].sort((a,b)=>b.fragScore-a.fragScore);
          const high = sorted[0]; const low = sorted[1];
          if(high.fragScore > low.fragScore * 1.3) {
            insights.push({
              icon:"🔀", color:"#7C3AED", bg:"#F5F3FF",
              title:`${high.s.session.participantCode||"P?"} switches tasks ${(high.fragScore/Math.max(low.fragScore,0.01)).toFixed(1)}× more frequently`,
              body:`Activity fragmentation score: ${(high.fragScore*100).toFixed(0)}% vs ${(low.fragScore*100).toFixed(0)}%. High fragmentation indicates more frequent interruptions or a more coordination-heavy role — both associated with elevated cognitive load.`
            });
          }
        }

        // ── Environmental pressure timing ──
        sessStats.forEach(({s,lateMks,sessMs},i)=>{
          if(lateMks.length>=2) insights.push({
            icon:"⚠️", color:"#B45309", bg:"#FFFBEB",
            title:`${s.session.participantCode||`P${i+1}`} received ${lateMks.length} env. flags in the final 40% of session`,
            body:`Environmental disruptions clustering late in the session (${lateMks.map(m=>ENVIRONMENT_FLAGS.find(f=>f.id===m.category)?.label||m.category).join(", ")}) may compound fatigue. Whether this reflects shift dynamics or spatial design warrants further observation.`
          });
        });

        // ── Physical load contrast ──
        if(sessStats.length>=2) {
          const sorted = [...sessStats].sort((a,b)=>b.mobilePct-a.mobilePct);
          const hi = sorted[0]; const lo = sorted[1];
          if(hi.mobilePct > lo.mobilePct + 0.1) insights.push({
            icon:"🚶", color:"#059669", bg:"#ECFDF5",
            title:`${hi.s.session.participantCode||"P?"} had ${Math.round(hi.mobilePct*100)}% mobile postures vs ${Math.round(lo.mobilePct*100)}%`,
            body:`Higher mobility in the same time window suggests different physical demands by zone. ${hi.s.session.participantCode||"P?"}'s ${hi.ptHandling} patient-handling events add physical load on top of cognitive load — a distinct stress pathway from coordination-heavy roles.`
          });
        }

        // ── Corridor as activity-dead zone ──
        const corrZones = effectiveZones.filter(z=>z.name?.toLowerCase().includes('corridor'));
        const corrEvs = selEvs.filter(e=>corrZones.some(z=>z.id===resolveZoneId(e)));
        const corrWithAct = corrEvs.filter(e=>(e.eventTypes||[]).length>0);
        if(corrEvs.length>5 && corrWithAct.length===0) insights.push({
          icon:"🏃", color:"#DC2626", bg:"#FEF2F2",
          title:`${corrEvs.length} corridor taps, 0 activities logged`,
          body:`Corridors are used exclusively for transit — no tasks are performed in them. This may reflect spatial design (no affordances for work) or nurse behaviour (moving quickly between zones). High corridor transitions may indicate repeated equipment retrieval or care fragmentation.`
        });

        // ── Top activity vs role ──
        sessStats.forEach(({s,topAct,actEvs},i)=>{
          if(!topAct||actEvs<5) return;
          const [actId,actCount] = topAct;
          const pct = Math.round(actCount/actEvs*100);
          const label = EVENT_TYPES.find(e=>e.id===actId)?.label||actId;
          if(pct>40) insights.push({
            icon:"📋", color:"#0891B2", bg:"#F0F9FF",
            title:`${s.session.participantCode||`P${i+1}`}'s dominant activity: ${label} (${pct}% of logged taps)`,
            body:`A single activity dominating >40% of observations suggests a role-specific task structure. Whether this reflects the zone's spatial affordances or the participant's assignment is a key research question.`
          });
        });

        if(!insights.length) return null;
        return (
          <div style={{ marginBottom:20 }}>
            <SectionHeader>Key Insights</SectionHeader>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:10 }}>
              {insights.map((ins,i) => (
                <div key={i} style={{ background:ins.bg, border:`1.5px solid ${ins.color}30`, borderRadius:10, padding:"12px 14px" }}>
                  <div style={{ display:"flex", alignItems:"flex-start", gap:8, marginBottom:6 }}>
                    <span style={{ fontSize:16, lineHeight:1.2, flexShrink:0 }}>{ins.icon}</span>
                    <div style={{ fontSize:11, fontWeight:700, color:ins.color, lineHeight:1.4, fontFamily:"'DM Sans',sans-serif" }}>{ins.title}</div>
                  </div>
                  <div style={{ fontSize:10.5, color:"#475569", lineHeight:1.6, fontFamily:"'DM Sans',sans-serif" }}>{ins.body}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Three path-density heatmaps + zone legend in one row */}
      <SectionHeader>Spatial Analysis</SectionHeader>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 180px", gap:12, marginBottom:18 }}>
        {(() => {
          const blurR = vbW * 0.025;
          const glowW = vbW * 0.018;
          const lineW = vbW * 0.0035;
          const dotR  = vbW * 0.006;
          const mkS   = vbW * 0.009;

          const sharedRgb = t => ({
            r: Math.round(t < 0.5 ? 37 + t*2*(160-37) : 160 + (t-0.5)*2*(220-160)),
            g: Math.round(t < 0.5 ? 99 + t*2*(20-99)  : 20  + (t-0.5)*2*(38-20)),
            b: Math.round(t < 0.5 ? 235 + t*2*(180-235): 180 + (t-0.5)*2*(38-180)),
          });
          const sharedGradient = "linear-gradient(to right, rgb(37,99,235), rgb(160,20,180), rgb(220,38,38))";

          // Precompute normalisers per metric
          const mkNorm = (values) => {
            const s = values.filter(v=>v>0).sort((a,b)=>a-b);
            const p10 = s[Math.floor(s.length*0.1)]??0;
            const p90 = s[Math.floor(s.length*0.9)]??0.01;
            return v => p90>p10 ? Math.min(1,Math.max(0,(v-p10)/(p90-p10))) : 0.5;
          };

          const allEvs = selSess.flatMap(s => [...s.events].reverse().filter(e=>typeof e.x==="number"&&typeof e.y==="number").map(e=>({e,s})));

          const dwellScores = allEvs.map(({e})=>e.endTime&&e.startTime?secondsBetween(e.startTime,e.endTime):5);
          const taskScores  = allEvs.map(({e})=>{ const a=(e.eventTypes||[]).length; const d=Math.max(1,e.endTime&&e.startTime?secondsBetween(e.startTime,e.endTime):5); return a/(d/60); });
          const zonePM = {}; effectiveZones.forEach(z=>{ const d=zoneDwell[z.id]||{dwell:0,flags:0}; zonePM[z.id]=d.dwell>0?d.flags/(d.dwell/60):0; });
          const pressureScores = allEvs.map(({e})=>zonePM[resolveZoneId(e)]||0);

          const normDwell    = mkNorm(dwellScores);
          const normTask     = mkNorm(taskScores);
          const normPressure = mkNorm(pressureScores);

          // Build segments once, annotated with all three scores
          const segments = [];
          selSess.forEach((s,sIdx)=>{
            const evs=[...s.events].reverse().filter(e=>typeof e.x==="number"&&typeof e.y==="number");
            evs.forEach((e,i)=>{
              if(i===0)return;
              const prev=evs[i-1];
              const dwell=e.endTime&&e.startTime?secondsBetween(e.startTime,e.endTime):5;
              const acts=(e.eventTypes||[]).length;
              const dur=Math.max(1,dwell);
              segments.push({
                x1:prev.x,y1:prev.y,x2:e.x,y2:e.y,
                td:normDwell(dwell),
                tt:normTask(acts/(dur/60)),
                tp:normPressure(zonePM[resolveZoneId(e)]||0),
                e,s,sIdx
              });
            });
          });

          const ZoneOutlines = () => effectiveZones.map((zone,idx)=>{
            if(!zone.points||zone.points.length<2)return null;
            return <polygon key={zone.id} points={zone.points.map(p=>`${p.x},${p.y}`).join(" ")} fill="#E4E8ED" stroke="#9CA3AF" strokeWidth={vbW*0.0012}/>;
          });

          const MapCard = ({title,subtitle,tKey,showPathDots,showTaskDots,showEnvDots,showEnvFlags}) => {
            const fid=`blur-${title.replace(/\W/g,'')}`;
            return (
              <div style={{background:"white",border:"1.5px solid #E2E8F0",borderRadius:10,padding:12,display:"flex",flexDirection:"column"}}>
                <ChartTitle>{title}</ChartTitle>
                <div style={{fontSize:9,color:"#94A3B8",fontFamily:"'DM Mono',monospace",marginBottom:4,lineHeight:1.4}}>{subtitle}</div>
                <div style={{flex:1}}>
                  <svg viewBox={vb} style={{width:"100%",height:"auto",maxHeight:255}} xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <filter id={fid} x="-150%" y="-150%" width="400%" height="400%">
                        <feGaussianBlur stdDeviation={blurR}/>
                      </filter>
                    </defs>
                    <ZoneOutlines/>
                    {/* Blurred glow */}
                    <g filter={`url(#${fid})`} opacity={0.65}>
                      {segments.map((seg,i)=>{
                        const t=seg[tKey];
                        const {r,g,b}=sharedRgb(t);
                        return <line key={i} x1={seg.x1} y1={seg.y1} x2={seg.x2} y2={seg.y2}
                          stroke={`rgb(${r},${g},${b})`} strokeWidth={glowW} strokeLinecap="round" opacity={0.25+t*0.75}/>;
                      })}
                    </g>
                    {/* Sharp path line — coloured for dwell, dark grey for task/pressure */}
                    {segments.map((seg,i)=>{
                      const t=seg[tKey];
                      const {r,g,b} = tKey==='td' ? sharedRgb(t) : {r:80,g:88,b:100};
                      return <line key={i} x1={seg.x1} y1={seg.y1} x2={seg.x2} y2={seg.y2}
                        stroke={`rgb(${r},${g},${b})`} strokeWidth={lineW} strokeLinecap="round" opacity={tKey==='td'?0.85:0.5}/>;
                    })}
                    {/* Task dots — one per event that has activities, coloured by task density */}
                    {showTaskDots && allEvs.map(({e,s},i)=>{
                      const acts=(e.eventTypes||[]).length;
                      if(!acts) return null;
                      const dur=Math.max(1,e.endTime&&e.startTime?secondsBetween(e.startTime,e.endTime):5);
                      const t=normTask(acts/(dur/60));
                      const {r,g,b}=sharedRgb(t);
                      const zn=effectiveZones.find(z=>z.id===resolveZoneId(e))?.name||e.zoneName||"?";
                      const actLabels=(e.eventTypes||[]).map(a=>EVENT_TYPES.find(et=>et.id===a)?.label||a).join(", ")||"—";
                      return <circle key={i} cx={e.x} cy={e.y} r={dotR*1.4}
                        fill={`rgb(${r},${g},${b})`} stroke="white" strokeWidth={vbW*0.001} opacity={0.9} style={{cursor:"pointer"}}
                        onMouseEnter={ev=>setTooltip({x:ev.clientX,y:ev.clientY,html:`<b>${zn}</b><br/>${actLabels}`})}
                        onMouseMove={ev=>setTooltip(t=>t?{...t,x:ev.clientX,y:ev.clientY}:null)}
                        onMouseLeave={()=>setTooltip(null)}/>;
                    })}
                    {/* Env pressure dots — one per actual marker, coloured by pressure */}
                    {showEnvDots && selMks.map((m,i)=>{
                      const zid = m.zoneId || (effectiveZones.find(z=>z.name?.toLowerCase()===m.zoneName?.toLowerCase())?.id);
                      const pressure = zonePM[zid] || 0;
                      if(!pressure) return null;
                      const t = normPressure(pressure);
                      const {r,g,b}=sharedRgb(t);
                      const zn=effectiveZones.find(z=>z.id===zid)?.name||m.zoneName||"?";
                      return <circle key={i} cx={m.x} cy={m.y} r={dotR*1.6}
                        fill={`rgb(${r},${g},${b})`} stroke="white" strokeWidth={vbW*0.001} opacity={0.95} style={{cursor:"pointer"}}
                        onMouseEnter={ev=>setTooltip({x:ev.clientX,y:ev.clientY,html:`<b>▲ ${ENVIRONMENT_FLAGS.find(f=>f.id===m.category)?.label||m.category}</b><br/>${zn}`})}
                        onMouseMove={ev=>setTooltip(t=>t?{...t,x:ev.clientX,y:ev.clientY}:null)}
                        onMouseLeave={()=>setTooltip(null)}/>;
                    })}
                    {/* Dwell tap dots — one per logged location, coloured by dwell */}
                    {showPathDots && allEvs.map(({e,s},i)=>{
                      const dur=e.endTime&&e.startTime?secondsBetween(e.startTime,e.endTime):5;
                      const t=normDwell(dur);
                      const {r,g,b}=sharedRgb(t);
                      const zn=effectiveZones.find(z=>z.id===resolveZoneId(e))?.name||e.zoneName||"?";
                      const acts=(e.eventTypes||[]).map(a=>EVENT_TYPES.find(et=>et.id===a)?.label||a).join(", ")||"—";
                      return <circle key={i} cx={e.x} cy={e.y} r={dotR}
                        fill={`rgb(${r},${g},${b})`} stroke="white" strokeWidth={vbW*0.001} opacity={0.85} style={{cursor:"pointer"}}
                        onMouseEnter={ev=>setTooltip({x:ev.clientX,y:ev.clientY,html:`<b>${s.session.participantCode||`P${i}`}</b> · ${zn}<br/>${acts}<br/>Dwell: ${formatDuration(dur)}`})}
                        onMouseMove={ev=>setTooltip(t=>t?{...t,x:ev.clientX,y:ev.clientY}:null)}
                        onMouseLeave={()=>setTooltip(null)}/>;
                    })}
                    {/* Env flag triangles */}
                    {showEnvFlags && selMks.map((m,i)=>{
                      return <polygon key={i} points={`${m.x},${m.y-mkS} ${m.x+mkS*0.85},${m.y+mkS*0.7} ${m.x-mkS*0.85},${m.y+mkS*0.7}`}
                        fill="#B45309" stroke="white" strokeWidth={vbW*0.001} opacity={0.95}
                        onMouseEnter={ev=>setTooltip({x:ev.clientX,y:ev.clientY,html:`<b>▲ ${ENVIRONMENT_FLAGS.find(f=>f.id===m.category)?.label||m.category}</b><br/>${effectiveZones.find(z=>z.id===m.zoneId)?.name||m.zoneName||"?"}`})}
                        onMouseMove={ev=>setTooltip(t=>t?{...t,x:ev.clientX,y:ev.clientY}:null)}
                        onMouseLeave={()=>setTooltip(null)}/>;
                    })}
                  </svg>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:5,marginTop:6}}>
                  <span style={{fontSize:7,color:"#94A3B8",fontFamily:"'DM Mono',monospace"}}>Low</span>
                  <div style={{flex:1,height:4,borderRadius:99,background:sharedGradient}}/>
                  <span style={{fontSize:7,color:"#94A3B8",fontFamily:"'DM Mono',monospace"}}>High</span>
                </div>
              </div>
            );
          };

          return <>
            <MapCard title="Dwell Time" subtitle="Glow = time at each tap · white dots = taps · ▲ = env. flag" tKey="td" showPathDots showEnvFlags/>
            <MapCard title="Task Density" subtitle="Dark line = path · coloured dots = taps with activities logged" tKey="tt" showTaskDots/>
            <MapCard title="Environmental Pressure" subtitle="Dark line = path · coloured dots = taps in flagged zones · ▲ = flag" tKey="tp" showEnvDots showEnvFlags/>
          </>;
        })()}

        {/* Zone legend — sorted by dwell, scrollable */}
        <div style={{background:"white",border:"1.5px solid #E2E8F0",borderRadius:10,padding:12,display:"flex",flexDirection:"column",minHeight:0,maxHeight:360}}>
          <ChartTitle>Zone Legend</ChartTitle>
          <div style={{fontSize:9,color:"#94A3B8",fontFamily:"'DM Mono',monospace",marginBottom:6}}>Dwell · blue→red</div>
          <div style={{overflowY:"scroll",flex:1,minHeight:0}}>
            {[...effectiveZones]
              .map(z=>({zone:z,d:zoneDwell[z.id]||{dwell:0,count:0}}))
              .sort((a,b)=>b.d.dwell-a.d.dwell)
              .map(({zone,d})=>{
                const t=d.dwell/maxDwell;
                const r=Math.round(t<0.5?37+t*2*(160-37):160+(t-0.5)*2*(220-160));
                const g=Math.round(t<0.5?99+t*2*(20-99):20+(t-0.5)*2*(38-20));
                const b=Math.round(t<0.5?235+t*2*(180-235):180+(t-0.5)*2*(38-180));
                const sw=d.count>0?`rgb(${r},${g},${b})`:"#E2E8F0";
                return (
                  <div key={zone.id} style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}>
                    <div style={{width:18,height:6,borderRadius:2,background:sw,flexShrink:0}}/>
                    <div style={{fontSize:8,color:"#475569",fontFamily:"'DM Sans',sans-serif",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={zone.name}>{zone.name}</div>
                    <div style={{fontSize:7,color:"#94A3B8",fontFamily:"'DM Mono',monospace",flexShrink:0}}>{d.count>0?formatDuration(d.dwell):"—"}</div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Zone timeline */}
      <SectionHeader>Zone Sequence Timeline</SectionHeader>
      <div style={{ background:"white", border:"1.5px solid #E2E8F0", borderRadius:10, padding:14, marginBottom:18, overflowX:"auto" }}>
        <div style={{ fontSize:9, color:"#94A3B8", fontFamily:"'DM Mono',monospace", marginBottom:10 }}>Time on x-axis · each block = one location tap · colour = zone · width = dwell time · ▲ = env. flag</div>
        {selSess.map((s, idx) => {
          const color = PT_COLORS[idx % PT_COLORS.length];
          const evs = [...s.events].reverse().filter(e => e.startTime);
          if (!evs.length) return null;
          const sessionStart = new Date(evs[0].startTime).getTime();
          const sessionEnd = new Date(evs[evs.length-1].endTime||evs[evs.length-1].startTime).getTime();
          const sessionDur = Math.max(sessionEnd - sessionStart, 1);
          const totalW = 900; // px reference width
          return (
            <div key={s.session.sessionId} style={{ marginBottom:10 }}>
              <div style={{ fontSize:9, fontWeight:700, color:"#64748B", fontFamily:"'DM Mono',monospace", marginBottom:4 }}>
                {s.session.participantCode||`P${idx+1}`} · {s.session.date}
              </div>
              <div style={{ position:"relative", height:28, background:"#F8FAFC", borderRadius:6, overflow:"visible", minWidth:600 }}>
                {evs.map((e, i) => {
                  const start = new Date(e.startTime).getTime();
                  const end = e.endTime ? new Date(e.endTime).getTime() : (i < evs.length-1 ? new Date(evs[i+1].startTime).getTime() : start+5000);
                  const left = `${((start-sessionStart)/sessionDur)*100}%`;
                  const width = `${Math.max(0.3, ((end-start)/sessionDur)*100)}%`;
                  const zone = effectiveZones.find(z=>z.id===resolveZoneId(e));
                  const zcolor = zone ? zoneColor(zone, effectiveZones.indexOf(zone)) : "#CBD5E1";
                  return (
                    <div key={i} style={{ position:"absolute", left, width, top:0, height:"100%", background:zcolor, opacity:0.85, cursor:"pointer" }}
                      onMouseEnter={ev => setTooltip({x:ev.clientX,y:ev.clientY,html:`<b>${zone?.name||e.zoneName||"?"}</b><br/>${(e.eventTypes||[]).map(a=>EVENT_TYPES.find(et=>et.id===a)?.label||a).join(", ")||"—"}<br/>${formatDuration(Math.round((end-start)/1000))}`})}
                      onMouseMove={ev => setTooltip(t=>t?{...t,x:ev.clientX,y:ev.clientY}:null)}
                      onMouseLeave={() => setTooltip(null)} />
                  );
                })}
                {/* Env flag markers on timeline */}
                {s.markers.map((m, i) => {
                  const mTime = new Date(m.timestamp).getTime();
                  const left = `${((mTime-sessionStart)/sessionDur)*100}%`;
                  return <div key={i} style={{ position:"absolute", left, top:-8, fontSize:10, color:"#B45309", lineHeight:1, pointerEvents:"none" }}>▲</div>;
                })}
              </div>
              {/* Time axis */}
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:3, fontSize:8, color:"#94A3B8", fontFamily:"'DM Mono',monospace" }}>
                <span>{new Date(evs[0].startTime).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>
                <span>{new Date(evs[evs.length-1].endTime||evs[evs.length-1].startTime).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>
              </div>
            </div>
          );
        })}
        {/* Zone colour legend */}
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:8 }}>
          {effectiveZones.filter(z => selEvs.some(e => resolveZoneId(e)===z.id)).map((z,idx) => (
            <div key={z.id} style={{ display:"flex", alignItems:"center", gap:4, fontSize:9, color:"#475569", fontFamily:"'DM Mono',monospace" }}>
              <div style={{ width:10, height:10, borderRadius:2, background:zoneColor(z,effectiveZones.indexOf(z)) }}/>
              {z.name}
            </div>
          ))}
        </div>
      </div>

      {/* Charts row 1 */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14, alignItems:"stretch" }}>
        <Card><ChartTitle>Activity Distribution</ChartTitle>{actData.length===0?<div style={{color:"#CBD5E1",fontSize:11}}>No data</div>:actData.map(d=><BarRow key={d.id} label={d.label} value={d.count} max={actData[0].count} color={d.color}/>)}</Card>
        <Card><ChartTitle>Posture / Mobilisation</ChartTitle>{postData.length===0?<div style={{color:"#CBD5E1",fontSize:11}}>No data</div>:postData.map(d=><BarRow key={d.id} label={d.label} value={d.count} max={maxPost} color="#7C3AED"/>)}</Card>
      </div>

      {/* Charts row 2 */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14, alignItems:"stretch" }}>
        <Card><ChartTitle>Environment Flags by Type</ChartTitle>{envCatData.length===0?<div style={{color:"#CBD5E1",fontSize:11}}>No flags logged — import markers CSV</div>:envCatData.map(d=><BarRow key={d.id} label={d.label} value={d.count} max={Math.max(maxEnvCat,1)} color="#B45309"/>)}</Card>
        <Card><ChartTitle>Flags by Zone (top 10)</ChartTitle>{envZoneData.length===0?<div style={{color:"#CBD5E1",fontSize:11}}>No flags logged — import markers CSV</div>:envZoneData.map(d=><BarRow key={d.id} label={d.zone.name} value={d.count} max={Math.max(maxEnvZone,1)} color={d.zone.color}/>)}</Card>
      </div>

      {/* Charts row 3 */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20, alignItems:"stretch" }}>
        <Card>
          <ChartTitle>Activity × Environment Co-occurrence</ChartTitle>
          <div style={{fontSize:9,color:"#94A3B8",fontFamily:"'DM Mono',monospace",marginBottom:8}}>Activities in same zone as env. flags — cognitive load proxy</div>
          {coData.length===0?<div style={{color:"#CBD5E1",fontSize:11}}>No data</div>:coData.map(d=><BarRow key={d.id} label={d.label} value={d.count} max={maxCo} color="#DB2777"/>)}
        </Card>
        <Card>
          <ChartTitle>Spatial Pressure Index</ChartTitle>
          <div style={{fontSize:9,color:"#94A3B8",fontFamily:"'DM Mono',monospace",marginBottom:8}}>Env. flags per minute of dwell · red = high pressure (&gt;1)</div>
          {pressureData.length===0?<div style={{color:"#CBD5E1",fontSize:11}}>Insufficient data</div>:pressureData.map(d=><BarRow key={d.zone.id} label={d.zone.name} value={d.pressure} max={maxPressure} color={d.pressure>1?"#DC2626":d.zone.color}/>)}
        </Card>
      </div>

      {/* Zone return frequency + temporal load curve */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:18 }}>

        {/* Zone return frequency scatter */}
        <Card>
          <ChartTitle>Zone Return Frequency</ChartTitle>
          <div style={{ fontSize:9, color:"#94A3B8", fontFamily:"'DM Mono',monospace", marginBottom:10 }}>
            x = number of visits · y = avg dwell per visit · size = total time · high visits + short dwell = interrupted workflow
          </div>
          {(() => {
            const zoneVisits = {};
            effectiveZones.forEach(z => { zoneVisits[z.id] = { visits:0, totalDwell:0, name:z.name, color:zoneColor(z,effectiveZones.indexOf(z)) }; });
            // Count discrete visits (consecutive events in same zone = one visit)
            selSess.forEach(s => {
              const evs = [...s.events].reverse();
              let lastZone = null;
              evs.forEach(e => {
                const zid = resolveZoneId(e);
                if (!zid || !zoneVisits[zid]) return;
                if (zid !== lastZone) { zoneVisits[zid].visits++; lastZone = zid; }
                const dur = e.endTime && e.startTime ? secondsBetween(e.startTime, e.endTime) : 0;
                zoneVisits[zid].totalDwell += dur;
              });
            });
            const pts = Object.entries(zoneVisits)
              .map(([id,v]) => ({ ...v, id, avgDwell: v.visits > 0 ? v.totalDwell/v.visits : 0 }))
              .filter(p => p.visits > 0);
            if (!pts.length) return <div style={{ color:"#CBD5E1", fontSize:11 }}>No data</div>;
            const maxV = Math.max(...pts.map(p=>p.visits)) * 1.15; // extend 15% beyond max
            const maxD = Math.max(...pts.map(p=>p.avgDwell), 1) * 1.15;
            const maxT = Math.max(...pts.map(p=>p.totalDwell), 1);
            const W=420, H=220, PL=40, PR=10, PT=10, PB=30;
            const cx = v => PL + (v/maxV)*(W-PL-PR);
            const cy = d => PT + (1 - d/maxD)*(H-PT-PB);
            return (
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height:"auto" }}>
                {/* Grid */}
                {[0,0.25,0.5,0.75,1].map(t => (
                  <g key={t}>
                    <line x1={PL} x2={W-PR} y1={PT+(1-t)*(H-PT-PB)} y2={PT+(1-t)*(H-PT-PB)} stroke="#F1F5F9" strokeWidth={1}/>
                    <text x={PL-4} y={PT+(1-t)*(H-PT-PB)+3} textAnchor="end" fontSize={7} fill="#94A3B8" fontFamily="DM Mono,monospace">{formatDuration(Math.round(t*maxD))}</text>
                  </g>
                ))}
                {[0,0.25,0.5,0.75,1].map(t => (
                  <g key={t}>
                    <line x1={cx(t*maxV)} x2={cx(t*maxV)} y1={PT} y2={H-PB} stroke="#F1F5F9" strokeWidth={1}/>
                    <text x={cx(t*maxV)} y={H-PB+10} textAnchor="middle" fontSize={7} fill="#94A3B8" fontFamily="DM Mono,monospace">{Math.round(t*maxV)}</text>
                  </g>
                ))}
                {/* Axis labels */}
                <text x={(PL+W-PR)/2} y={H} textAnchor="middle" fontSize={8} fill="#64748B" fontFamily="DM Mono,monospace">visits</text>
                <text x={8} y={(PT+H-PB)/2} textAnchor="middle" fontSize={8} fill="#64748B" fontFamily="DM Mono,monospace" transform={`rotate(-90,8,${(PT+H-PB)/2})`}>avg dwell</text>
                {/* Points */}
                {pts.map(p => {
                  const r = 5 + (p.totalDwell/maxT)*18;
                  return (
                    <circle key={p.id} cx={cx(p.visits)} cy={cy(p.avgDwell)} r={r}
                      fill={p.color} stroke="white" strokeWidth={1.5} opacity={0.75} style={{ cursor:"pointer" }}
                      onMouseEnter={ev => setTooltip({x:ev.clientX,y:ev.clientY,html:`<b>${p.name}</b><br/>Visits: ${p.visits}<br/>Avg dwell: ${formatDuration(Math.round(p.avgDwell))}<br/>Total: ${formatDuration(p.totalDwell)}`})}
                      onMouseMove={ev => setTooltip(t=>t?{...t,x:ev.clientX,y:ev.clientY}:null)}
                      onMouseLeave={() => setTooltip(null)}/>
                  );
                })}
                {/* Labels for top zones */}
                {pts.sort((a,b)=>b.totalDwell-a.totalDwell).slice(0,4).map(p => (
                  <text key={p.id} x={cx(p.visits)} y={cy(p.avgDwell)-10} textAnchor="middle" fontSize={7} fill={p.color} fontWeight="700" fontFamily="DM Mono,monospace">{p.name.slice(0,10)}</text>
                ))}
              </svg>
            );
          })()}
        </Card>

        {/* Temporal load curve */}
        <Card>
          <ChartTitle>Temporal Load Curve</ChartTitle>
          <div style={{ fontSize:9, color:"#94A3B8", fontFamily:"'DM Mono',monospace", marginBottom:10 }}>
            Session binned into 5-min windows · bars = location taps · line = env. flags · x = time
          </div>
          {(() => {
            const allEvsSorted = selSess.flatMap(s => [...s.events].reverse().filter(e=>e.startTime))
              .sort((a,b) => new Date(a.startTime) - new Date(b.startTime));
            if (allEvsSorted.length < 2) return <div style={{ color:"#CBD5E1", fontSize:11 }}>Need more data</div>;
            const t0 = new Date(allEvsSorted[0].startTime).getTime();
            const tEnd = new Date(allEvsSorted[allEvsSorted.length-1].startTime).getTime();
            const BIN = 5 * 60 * 1000; // 5 minutes
            const nBins = Math.max(1, Math.ceil((tEnd - t0) / BIN));
            const bins = Array.from({length:nBins}, (_,i) => ({ taps:0, flags:0, label: `${i*5}m` }));
            allEvsSorted.forEach(e => {
              const bi = Math.min(nBins-1, Math.floor((new Date(e.startTime).getTime()-t0)/BIN));
              bins[bi].taps++;
            });
            selMks.forEach(m => {
              if (!m.timestamp) return;
              const bi = Math.min(nBins-1, Math.floor((new Date(m.timestamp).getTime()-t0)/BIN));
              if (bi >= 0) bins[bi].flags++;
            });
            const maxTaps = Math.max(...bins.map(b=>b.taps), 1);
            const maxFlags = Math.max(...bins.map(b=>b.flags), 1);
            const W=420, H=200, PL=30, PR=10, PT=10, PB=24;
            const bw = (W-PL-PR)/nBins - 1;
            const bx = i => PL + i*((W-PL-PR)/nBins);
            const by = v => PT + (1-v/maxTaps)*(H-PT-PB);
            const flagY = v => PT + (1-v/maxFlags)*(H-PT-PB);
            return (
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height:"auto" }}>
                {/* Y gridlines */}
                {[0,0.5,1].map(t => (
                  <line key={t} x1={PL} x2={W-PR} y1={PT+(1-t)*(H-PT-PB)} y2={PT+(1-t)*(H-PT-PB)} stroke="#F1F5F9" strokeWidth={1}/>
                ))}
                {/* Tap bars */}
                {bins.map((b,i) => (
                  <rect key={i} x={bx(i)} y={by(b.taps)} width={Math.max(1,bw)} height={(H-PT-PB)-(by(b.taps)-PT)}
                    fill="#2563EB" opacity={0.25} rx={1}
                    onMouseEnter={ev=>setTooltip({x:ev.clientX,y:ev.clientY,html:`<b>${b.label}</b><br/>Taps: ${b.taps}<br/>Flags: ${b.flags}`})}
                    onMouseMove={ev=>setTooltip(t=>t?{...t,x:ev.clientX,y:ev.clientY}:null)}
                    onMouseLeave={()=>setTooltip(null)}/>
                ))}
                {/* Flag line */}
                {bins.length > 1 && (
                  <polyline
                    points={bins.map((b,i)=>`${bx(i)+bw/2},${flagY(b.flags)}`).join(" ")}
                    fill="none" stroke="#B45309" strokeWidth={2} strokeLinejoin="round"/>
                )}
                {/* Flag dots */}
                {bins.map((b,i) => b.flags > 0 && (
                  <circle key={i} cx={bx(i)+bw/2} cy={flagY(b.flags)} r={4}
                    fill="#B45309" stroke="white" strokeWidth={1.5}/>
                ))}
                {/* X axis labels — show every bin if few, else every nth */}
                {(() => {
                  const step = Math.max(1, Math.ceil(nBins / 8));
                  return bins.map((b,i) => i % step === 0 ? (
                    <text key={i} x={bx(i)+bw/2} y={H-PB+10} textAnchor="middle" fontSize={7} fill="#94A3B8" fontFamily="DM Mono,monospace">{b.label}</text>
                  ) : null);
                })()}
                {/* Legend */}
                <rect x={W-PR-70} y={PT+2} width={8} height={8} fill="#2563EB" opacity={0.3} rx={1}/>
                <text x={W-PR-58} y={PT+9} fontSize={7} fill="#64748B" fontFamily="DM Mono,monospace">taps</text>
                <line x1={W-PR-70} x2={W-PR-62} y1={PT+20} y2={PT+20} stroke="#B45309" strokeWidth={2}/>
                <text x={W-PR-58} y={PT+23} fontSize={7} fill="#64748B" fontFamily="DM Mono,monospace">flags</text>
              </svg>
            );
          })()}
        </Card>
      </div>

      {/* Zone table */}
      <SectionHeader>Zone Detail Table</SectionHeader>
      <div style={{ background:"white", border:"1.5px solid #E2E8F0", borderRadius:10, padding:14, overflowX:"auto", marginBottom:20 }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
          <thead><tr style={{ borderBottom:"2px solid #E2E8F0" }}>
            {["Zone","Taps","Dwell","% Session","Flags","Pressure","Top activity","Top posture"].map(h =>
              <th key={h} style={{ textAlign:"left", padding:"5px 10px", color:"#94A3B8", fontSize:9, textTransform:"uppercase", letterSpacing:"0.08em", fontFamily:"'DM Mono',monospace", fontWeight:700 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {effectiveZones.map(zone => {
              const evz = selEvs.filter(e => e.zoneId===zone.id);
              if (!evz.length) return null;
              const dwell = evz.reduce((s,e)=>s+(e.endTime&&e.startTime?secondsBetween(e.startTime,e.endTime):0),0);
              const pct = totalDur>0?Math.round(dwell/totalDur*100):0;
              const flags = selMks.filter(m=>m.zoneId===zone.id).length;
              const mins = dwell/60;
              const pressure = mins>0&&flags>0?(flags/mins).toFixed(2):"—";
              const ac={}; evz.forEach(e=>(e.eventTypes||[]).forEach(a=>{ac[a]=(ac[a]||0)+1}));
              const topAct = Object.entries(ac).sort((a,b)=>b[1]-a[1])[0];
              const pc={}; evz.forEach(e=>(e.bodilyActions||[]).forEach(p=>{pc[p]=(pc[p]||0)+1}));
              const topPost = Object.entries(pc).sort((a,b)=>b[1]-a[1])[0];
              const color = zoneColor(zone,effectiveZones.indexOf(zone));
              return (
                <tr key={zone.id} style={{ borderBottom:"1px solid #F8FAFC" }}>
                  <td style={{ padding:"5px 10px" }}><span style={{ display:"inline-block", width:8, height:8, borderRadius:"50%", background:color, marginRight:6 }}/>{zone.name}</td>
                  <td style={{ padding:"5px 10px", color:"#475569" }}>{evz.length}</td>
                  <td style={{ padding:"5px 10px", color:"#475569", fontFamily:"'DM Mono',monospace" }}>{formatDuration(dwell)}</td>
                  <td style={{ padding:"5px 10px" }}><div style={{ display:"flex", alignItems:"center", gap:6 }}><div style={{ width:pct, maxWidth:60, height:5, background:color, borderRadius:99 }}/><span style={{ color:"#475569" }}>{pct}%</span></div></td>
                  <td style={{ padding:"5px 10px", color:"#475569" }}>{flags}</td>
                  <td style={{ padding:"5px 10px", fontFamily:"'DM Mono',monospace", color:pressure!=="—"&&parseFloat(pressure)>1?"#DC2626":"#475569" }}>{pressure}</td>
                  <td style={{ padding:"5px 10px", color:"#475569", fontSize:10 }}>{topAct?EVENT_TYPES.find(e=>e.id===topAct[0])?.label||topAct[0]:"—"}</td>
                  <td style={{ padding:"5px 10px", color:"#475569", fontSize:10 }}>{topPost?BODILY_ACTION_TYPES.find(a=>a.id===topPost[0])?.label||topPost[0]:"—"}</td>
                </tr>
              );
            }).filter(Boolean)}
          </tbody>
        </table>
      </div>

      {tooltip && (
        <div style={{ position:"fixed", left:tooltip.x+12, top:tooltip.y-10, zIndex:9999, background:"rgba(15,23,42,0.92)", color:"white", padding:"7px 11px", borderRadius:6, fontSize:10, fontFamily:"'DM Mono',monospace", lineHeight:1.6, pointerEvents:"none", whiteSpace:"nowrap" }}
          dangerouslySetInnerHTML={{ __html: tooltip.html }} />
      )}
    </div>
  );
}

function ReviewTab({ session, zones, events, markers, archivedSessions, onClearFieldDay }) {

  // Build list of all sessions: archived + current (if has data)
  const allSessions = [
    ...archivedSessions,
    ...(events.length > 0 || markers.length > 0 ? [{ session, events, markers }] : []),
  ];

  function exportSession(s) {
    downloadText(`events_${s.session.sessionId}.csv`, toCsv(buildEventRows(s.session, zones, s.events)), "text/csv");
    setTimeout(() => downloadText(`markers_${s.session.sessionId}.csv`, toCsv(buildMarkerRows(s.session, zones, s.markers)), "text/csv"), 300);
  }

  function exportAll() {
    allSessions.forEach((s, i) => {
      setTimeout(() => {
        downloadText(`events_${s.session.sessionId}.csv`, toCsv(buildEventRows(s.session, zones, s.events)), "text/csv");
        setTimeout(() => downloadText(`markers_${s.session.sessionId}.csv`, toCsv(buildMarkerRows(s.session, zones, s.markers)), "text/csv"), 300);
      }, i * 700);
    });
  }

  const totalEvents = allSessions.reduce((s, p) => s + p.events.length, 0);
  const totalMarkers = allSessions.reduce((s, p) => s + p.markers.length, 0);

  return (
    <div>
      {/* Field day summary */}
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:16 }}>
        <StatCard label="Participants" value={allSessions.length} color="#2563EB" />
        <StatCard label="Total Events" value={totalEvents} color="#7C3AED" />
        <StatCard label="Environment" value={totalMarkers} color="#B45309" />
        <StatCard label="Zones" value={zones.length} color="#0891B2" />
      </div>

      {/* Export all */}
      {allSessions.length > 0 && (
        <>
          <SectionHeader>Export</SectionHeader>
          <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
            <Btn onClick={exportAll} variant="success">⬇ Export All Participants</Btn>
            {onClearFieldDay && <Btn onClick={onClearFieldDay} variant="danger">✕ Clear Field Day</Btn>}
          </div>
        </>
      )}

      {/* Per-participant cards */}
      <SectionHeader>Participants</SectionHeader>
      {allSessions.length === 0 && (
        <div style={{ color:"#CBD5E1", fontFamily:"'DM Sans',sans-serif", fontSize:13, padding:"18px 0" }}>No data recorded yet.</div>
      )}
      {allSessions.map((s, idx) => {
        const isCurrent = idx === allSessions.length - 1 && events.length > 0;
        const dur = s.events.reduce((acc, ev) => acc + (ev.endTime ? secondsBetween(ev.startTime, ev.endTime) : 0), 0);
        return (
          <div key={s.session.sessionId} style={{ background:"white", border:"1.5px solid " + (isCurrent ? "#2563EB" : "#E2E8F0"), borderRadius:10, padding:"13px 16px", marginBottom:10 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
              <div>
                <span style={{ fontSize:12, fontWeight:700, fontFamily:"'DM Mono',monospace", color: isCurrent ? "#2563EB" : "#1E293B" }}>
                  {s.session.participantCode || "No code"} · {s.session.participantRole || "No role"}
                  {isCurrent && <span style={{ marginLeft:8, fontSize:9, background:"#2563EB", color:"white", borderRadius:99, padding:"2px 6px" }}>CURRENT</span>}
                </span>
                <div style={{ fontSize:10, color:"#94A3B8", fontFamily:"'DM Mono',monospace", marginTop:2 }}>
                  {s.session.date} · {s.session.sessionId.slice(-8)}
                  {s.session.seniorityLevel && ` · ${s.session.seniorityLevel}`}
                  {s.session.shiftType && ` · ${s.session.shiftType} shift`}
                </div>
              </div>
              <Btn onClick={() => exportSession(s)} variant="ghost" small>⬇ Export CSVs</Btn>
            </div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              <StatPill label="Events" value={s.events.length} color="#2563EB" />
              <StatPill label="Environment" value={s.markers.length} color="#B45309" />
              <StatPill label="Observed" value={formatDuration(dur)||"—"} color="#7C3AED" />
              {s.session.gender && <StatPill label="Gender" value={s.session.gender} color="#64748B" />}
            </div>
          </div>
        );
      })}

      <SectionHeader>CSV Schema</SectionHeader>
      {[
        { file:"events.csv", cols:"session_id · date · hospital · department · unit · observer_id · participant_role · participant_code · gender · first_language · seniority_level · clinical_experience · shift_type · departmental_status · protocol_checked · event_id · activity · bodily_action · patient_state · start_time · end_time · duration_seconds · zone_id · zone_name · x_coord · y_coord · note" },
        { file:"markers.csv", cols:"session_id · date · hospital · department · unit · observer_id · participant_role · participant_code · gender · first_language · seniority_level · clinical_experience · shift_type · departmental_status · marker_id · marker_type · category · timestamp · zone_id · zone_name · x_coord · y_coord · linked_event_id" },
      ].map(s => (
        <div key={s.file} style={{ background:"#F8FAFC", border:"1.5px solid #E2E8F0", borderRadius:7, padding:"8px 11px", marginBottom:6 }}>
          <div style={{ fontSize:11, fontWeight:700, fontFamily:"'DM Mono',monospace", color:"#2563EB", marginBottom:3 }}>{s.file}</div>
          <div style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:"#64748B", lineHeight:1.8 }}>{s.cols}</div>
        </div>
      ))}
    </div>
  );
}

// ─── localStorage helpers ──────────────────────────────────────────────────────

const LS_KEY = "rim_fieldday_v1";

function saveToStorage(data) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch(e) { console.warn("localStorage save failed", e); }
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch(e) { return null; }
}

// ─── Root ──────────────────────────────────────────────────────────────────────

export default function HospitalShadowingApp() {
  const [tab, setTab] = useState("setup");
  const navRef = useRef(null);

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

  // ── Study-level state ──
  const [floorplanUrl, setFloorplanUrl] = useState(null);
  const [zones, setZones] = useState([]);
  const [study, setStudy] = useState({ hospital:"Addenbrooke's", department:"A&E" });

  // ── Session archive — all participants from this field day ──
  const [archivedSessions, setArchivedSessions] = useState([]);

  // ── Session-level state ──
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

  // ── Restore from localStorage on first load ──
  useEffect(() => {
    const saved = loadFromStorage();
    if (!saved) return;
    if (saved.study) setStudy(saved.study);
    if (saved.zones) setZones(saved.zones);
    if (saved.session) setSession(saved.session);
    if (saved.events) setEvents(saved.events);
    if (saved.markers) setMarkers(saved.markers);
    if (saved.archivedSessions) setArchivedSessions(saved.archivedSessions);
  }, []);

  // ── Save to localStorage whenever anything changes (exclude floorplan — too large) ──
  useEffect(() => {
    saveToStorage({ study, zones, session, events, markers, archivedSessions });
  }, [study, zones, session, events, markers, archivedSessions]);

  // ── Archive current participant and start fresh ──
  function newParticipant() {
    if (!window.confirm("Archive current participant and start a new session?\n\nAll data will be saved and available to export from the Review tab.")) return;
    // Archive current session if it has data
    if (events.length > 0 || markers.length > 0) {
      setArchivedSessions(prev => [...prev, { session, events, markers }]);
    }
    setSession({ ...freshSession(), hospital: study.hospital, department: study.department });
    setEvents([]);
    setMarkers([]);
    setTab("setup");
  }

  // ── Clear entire field day (end of day) ──
  function clearFieldDay() {
    if (!window.confirm("Clear all data for this field day? Make sure you have exported everything first.")) return;
    setArchivedSessions([]);
    setSession(freshSession());
    setEvents([]);
    setMarkers([]);
    try { localStorage.removeItem(LS_KEY); } catch(e) {}
    setTab("setup");
  }

  function updateStudy(key, val) {
    setStudy(s => ({ ...s, [key]: val }));
    setSession(s => ({ ...s, [key]: val }));
  }

  const tabs = [
    { id:"setup", label:"Setup & Zones" },
    { id:"live", label:"Live" },
    { id:"review", label:"Review & Export" },
    { id:"analyse", label:"Analyse" },
  ];

  const totalParticipants = archivedSessions.length + (events.length > 0 || markers.length > 0 ? 1 : 0);

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
              {archivedSessions.length > 0 && <span style={{ color:"#D97706", marginLeft:8 }}>● {archivedSessions.length} archived</span>}
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"flex-end", gap:0 }}>
            <button onClick={newParticipant}
              style={{ background:"none", border:"1.5px solid #E2E8F0", borderRadius:6, padding:"6px 12px", marginBottom:10, marginRight:12, cursor:"pointer", fontSize:11, fontWeight:700, fontFamily:"'DM Mono',monospace", color:"#059669", whiteSpace:"nowrap" }}>
              + New Participant
            </button>
            <div style={{ display:"flex" }}>
              {tabs.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  style={{ background:"none", border:"none", borderBottom:tab===t.id?"2.5px solid #2563EB":"2.5px solid transparent", padding:"11px 15px", cursor:"pointer", fontSize:11, fontWeight:700, fontFamily:"'DM Mono',monospace", textTransform:"uppercase", letterSpacing:"0.07em", color:tab===t.id?"#2563EB":"#94A3B8", transition:"all 0.15s", whiteSpace:"nowrap" }}>
                  {t.label}
                  {t.id==="live" && events.length>0 && <span style={{ marginLeft:4, background:"#2563EB", color:"white", borderRadius:99, fontSize:8, padding:"1px 5px", fontWeight:700 }}>{events.length}</span>}
                  {t.id==="review" && totalParticipants>0 && <span style={{ marginLeft:4, background:"#D97706", color:"white", borderRadius:99, fontSize:8, padding:"1px 5px", fontWeight:700 }}>{totalParticipants}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {(tab==="setup" || tab==="review" || tab==="analyse") && (
        <div style={{ height:"calc(100dvh - var(--nav-h, 52px))", overflowY:"auto", padding:"16px 32px" }}>
          {tab==="setup" && <SetupTab session={session} setSession={setSession} study={study} updateStudy={updateStudy} zones={zones} setZones={setZones} floorplanUrl={floorplanUrl} setFloorplanUrl={setFloorplanUrl} />}
          {tab==="review" && <ReviewTab session={session} zones={zones} events={events} markers={markers} archivedSessions={archivedSessions} onClearFieldDay={clearFieldDay} />}
          {tab==="analyse" && <AnalyseTab zones={zones} allSessions={[...archivedSessions, ...(events.length > 0 || markers.length > 0 ? [{ session, events, markers }] : [])]} />}
        </div>
      )}
      {tab==="live" && (
        <div style={{ height:"calc(100dvh - var(--nav-h, 52px))", overflow:"hidden" }}>
          <LiveTab session={session} zones={zones} events={events} setEvents={setEvents} markers={markers} setMarkers={setMarkers} floorplanUrl={floorplanUrl} />
        </div>
      )}
    </div>
  );
}
