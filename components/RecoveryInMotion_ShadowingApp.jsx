<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Recovery in Motion · Cognitive Load Analysis</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;700&family=DM+Sans:wght@300;400;500;700&display=swap" rel="stylesheet"/>
<style>
:root {
  --ink: #0F172A; --mid: #475569; --soft: #94A3B8; --rule: #E2E8F0;
  --bg: #F8FAFC; --surface: #FFFFFF;
  --blue: #2563EB; --amber: #B45309; --green: #059669; --red: #DC2626; --purple: #7C3AED;
}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--ink);font-size:13px;line-height:1.5;}
.shell{display:grid;grid-template-columns:280px 1fr;min-height:100vh;}
.sidebar{position:sticky;top:0;height:100vh;overflow-y:auto;background:var(--ink);color:white;padding:24px 18px;display:flex;flex-direction:column;gap:0;}
.logo{font-size:13px;font-weight:800;color:white;margin-bottom:2px;}
.logo-sub{font-size:8px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#64748B;margin-bottom:24px;}
.nav-sec{font-size:8px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#64748B;margin-bottom:6px;margin-top:18px;}
.nav-item{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:5px;cursor:pointer;font-size:11px;color:#CBD5E1;border:none;background:none;width:100%;text-align:left;font-family:'DM Mono',monospace;transition:all 0.15s;margin-bottom:2px;}
.nav-item:hover{background:rgba(255,255,255,0.08);color:white;}
.nav-item.active{background:rgba(255,255,255,0.12);color:white;}
.upload-area{background:rgba(255,255,255,0.06);border:1.5px dashed rgba(255,255,255,0.15);border-radius:8px;padding:14px;margin-bottom:12px;cursor:pointer;transition:all 0.15s;}
.upload-area:hover{background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.3);}
.upload-label{font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#94A3B8;margin-bottom:4px;}
.upload-btn{font-size:11px;color:#CBD5E1;font-family:'DM Mono',monospace;}
.session-chip{display:flex;align-items:center;gap:6px;padding:5px 8px;border-radius:5px;margin-bottom:3px;cursor:pointer;border:none;width:100%;text-align:left;font-family:'DM Mono',monospace;font-size:10px;transition:all 0.15s;}
.dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
.stats-footer{margin-top:auto;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);}
.stat-row{display:flex;justify-content:space-between;font-size:9px;color:#64748B;margin-bottom:3px;font-family:'DM Mono',monospace;}

.main{padding:32px 36px;min-height:100vh;}
.page-header{margin-bottom:28px;padding-bottom:20px;border-bottom:2px solid var(--ink);display:flex;align-items:flex-end;justify-content:space-between;}
.page-title{font-size:26px;font-weight:800;letter-spacing:-0.02em;}
.page-title span{color:var(--blue);}
.page-meta{font-size:10px;color:var(--soft);font-family:'DM Mono',monospace;text-align:right;}

.section{margin-bottom:36px;}
.sec-title{font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--soft);margin-bottom:14px;font-family:'DM Mono',monospace;}

/* Metric cards */
.metrics-row{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:28px;}
.metric-card{background:var(--surface);border:1.5px solid var(--rule);border-radius:10px;padding:14px;}
.metric-val{font-size:26px;font-weight:800;letter-spacing:-0.03em;line-height:1;margin-bottom:4px;}
.metric-label{font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--soft);font-family:'DM Mono',monospace;}
.metric-sub{font-size:10px;color:var(--mid);margin-top:3px;}

/* Floorplan */
.fp-wrap{background:var(--surface);border:1.5px solid var(--rule);border-radius:12px;padding:16px;position:relative;}
.fp-title{font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--soft);font-family:'DM Mono',monospace;margin-bottom:10px;}
.fp-legend{display:flex;gap:16px;flex-wrap:wrap;margin-top:10px;}
.legend-item{display:flex;align-items:center;gap:5px;font-size:10px;color:var(--mid);font-family:'DM Mono',monospace;}

/* Charts */
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.three-col{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;}
.chart-card{background:var(--surface);border:1.5px solid var(--rule);border-radius:10px;padding:16px;}
.chart-title{font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--soft);font-family:'DM Mono',monospace;margin-bottom:12px;}
.bar-row{display:flex;align-items:center;gap:8px;margin-bottom:5px;}
.bar-label{font-size:10px;color:var(--mid);width:140px;flex-shrink:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;}
.bar-track{flex:1;background:#F1F5F9;border-radius:99px;height:8px;}
.bar-fill{height:100%;border-radius:99px;transition:width 0.6s ease;}
.bar-val{width:40px;text-align:right;font-size:10px;font-family:'DM Mono',monospace;color:var(--mid);flex-shrink:0;}

/* Table */
.data-table{width:100%;border-collapse:collapse;font-size:11px;}
.data-table th{text-align:left;padding:6px 10px;background:#F8FAFC;color:var(--soft);font-size:8px;text-transform:uppercase;letter-spacing:0.08em;border-bottom:2px solid var(--rule);font-family:'DM Mono',monospace;font-weight:700;}
.data-table td{padding:6px 10px;border-bottom:1px solid #F8FAFC;color:var(--mid);}
.data-table tr:hover td{background:#F8FAFC;}

/* Tooltip */
.tooltip{position:fixed;background:rgba(15,23,42,0.9);color:white;padding:7px 11px;border-radius:6px;font-size:10px;font-family:'DM Mono',monospace;pointer-events:none;z-index:1000;display:none;line-height:1.5;}

/* Empty state */
.empty{text-align:center;padding:32px;color:var(--soft);font-size:12px;}

/* Upload prompt */
.upload-prompt{background:var(--surface);border:2px dashed var(--rule);border-radius:12px;padding:40px;text-align:center;cursor:pointer;transition:all 0.2s;}
.upload-prompt:hover{border-color:var(--blue);background:#EFF6FF;}
.upload-prompt h3{font-size:15px;font-weight:700;margin-bottom:6px;color:var(--ink);}
.upload-prompt p{font-size:12px;color:var(--soft);margin-bottom:16px;}
.upload-prompt .btn{display:inline-block;padding:8px 20px;background:var(--blue);color:white;border-radius:7px;font-size:12px;font-weight:700;font-family:'DM Mono',monospace;border:none;cursor:pointer;}
</style>
</head>
<body>

<div class="tooltip" id="tooltip"></div>
<input type="file" id="eventsInput" accept=".csv" multiple style="display:none"/>
<input type="file" id="markersInput" accept=".csv" multiple style="display:none"/>

<div class="shell">
<nav class="sidebar">
  <div class="logo">Recovery in Motion</div>
  <div class="logo-sub">Cognitive Load Analysis</div>

  <div class="upload-area" onclick="document.getElementById('eventsInput').click()">
    <div class="upload-label">Events CSV</div>
    <div class="upload-btn" id="eventsStatus">⬆ Click to import events_*.csv</div>
  </div>
  <div class="upload-area" onclick="document.getElementById('markersInput').click()">
    <div class="upload-label">Markers CSV</div>
    <div class="upload-btn" id="markersStatus">⬆ Click to import markers_*.csv</div>
  </div>

  <div class="nav-sec">Sessions</div>
  <div id="sessionList"></div>

  <div class="nav-sec">Navigate</div>
  <button class="nav-item active" onclick="scrollTo('overview')">◉ Overview</button>
  <button class="nav-item" onclick="scrollTo('paths')">◎ Movement Paths</button>
  <button class="nav-item" onclick="scrollTo('heatmap')">◎ Zone Heatmap</button>
  <button class="nav-item" onclick="scrollTo('activity')">◎ Activity Distribution</button>
  <button class="nav-item" onclick="scrollTo('environment')">◎ Environment Flags</button>
  <button class="nav-item" onclick="scrollTo('cooccurrence')">◎ Co-occurrence</button>
  <button class="nav-item" onclick="scrollTo('table')">◎ Zone Detail Table</button>
  <button class="nav-item" onclick="window.print()">⬇ Export PDF</button>

  <div class="stats-footer" id="statsFooter">
    <div class="stat-row"><span>Sessions loaded</span><span id="statSessions">0</span></div>
    <div class="stat-row"><span>Total events</span><span id="statEvents">0</span></div>
    <div class="stat-row"><span>Env. flags</span><span id="statFlags">0</span></div>
    <div class="stat-row"><span>Zones active</span><span id="statZones">0</span></div>
  </div>
</nav>

<main class="main">
  <div class="page-header">
    <div>
      <div style="font-size:9px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:var(--soft);margin-bottom:4px;font-family:'DM Mono',monospace;">Recovery in Motion · Stream B · Addenbrooke's A&E</div>
      <div class="page-title"><span>Cognitive Load</span> Analysis</div>
    </div>
    <div class="page-meta" id="reportMeta">Import events CSV to begin</div>
  </div>

  <!-- METRICS -->
  <div id="overview" class="section">
    <div class="metrics-row" id="metricsRow">
      <div class="metric-card"><div class="metric-val" style="color:var(--blue)" id="m-participants">—</div><div class="metric-label">Participants</div></div>
      <div class="metric-card"><div class="metric-val" style="color:var(--purple)" id="m-events">—</div><div class="metric-label">Location taps</div></div>
      <div class="metric-card"><div class="metric-val" style="color:var(--green)" id="m-zones">—</div><div class="metric-label">Zones visited</div></div>
      <div class="metric-card"><div class="metric-val" style="color:var(--amber)" id="m-flags">—</div><div class="metric-label">Env. flags</div></div>
      <div class="metric-card"><div class="metric-val" style="color:var(--red)" id="m-transitions">—</div><div class="metric-label">Zone transitions</div></div>
    </div>
  </div>

  <!-- MOVEMENT PATHS -->
  <div id="paths" class="section">
    <div class="sec-title">Movement Paths</div>
    <div class="fp-wrap">
      <div class="fp-title">Participant routes overlaid on zone map · dot = location tap · colour = participant</div>
      <svg id="pathSvg" viewBox="323 3 1544 1361" style="width:100%;height:auto;max-height:420px;" xmlns="http://www.w3.org/2000/svg">
        <polygon class="zone" data-id="Z-1776333646067" data-name="digital triage" points="1340,23 1340,179 1425,179 1428,56" fill="#2563EB22" stroke="#2563EB" stroke-width="2"/>
<polygon class="zone" data-id="Z-1776333666133" data-name="reception" points="1428,55 1428,166 1509,169 1509,55" fill="#DC262622" stroke="#DC2626" stroke-width="2"/>
<polygon class="zone" data-id="Z-1776333716729" data-name="reception office" points="1510,56 1510,155 1543,188 1570,188 1567,56" fill="#05966922" stroke="#059669" stroke-width="2"/>
<polygon class="zone" data-id="Z-1776333741896" data-name="back offices" points="1569,55 1569,187 1680,187 1680,222 1839,222 1839,54" fill="#D9770622" stroke="#D97706" stroke-width="2"/>
<polygon class="zone" data-id="Z-1776333775330" data-name="waiting room 1" points="1426,165 1426,309 1714,309 1714,222 1678,222 1678,276 1669,276 1669,225 1681,222 1678,186 1540,186 1510,153 1510,168" fill="#7C3AED22" stroke="#7C3AED" stroke-width="2"/>
<polygon class="zone" data-id="Z-1776333801904" data-name="triage 1 examination rooms" points="1425,309 1425,396 1716,399 1713,309" fill="#0891B222" stroke="#0891B2" stroke-width="2"/>
<polygon class="zone" data-id="Z-1776333826801" data-name="triage 1 ECG" points="1715,272 1715,398 1847,398 1844,224 1745,224" fill="#9333EA22" stroke="#9333EA" stroke-width="2"/>
<polygon class="zone" data-id="Z-1776333872960" data-name="waiting room 2" points="1337,179 1425,179 1425,317 1380,317 1371,326 1371,488 1440,488 1355,572 1355,683 1268,686 1271,395 1127,395 1127,323 1151,302 1184,302 1187,230 1268,233 1271,248 1307,248 1307,233 1337,233" fill="#16A34A22" stroke="#16A34A" stroke-width="2"/>
<polygon class="zone" data-id="Z-1776333904697" data-name="triage 2" points="1371,323 1371,488 1440,488 1443,398 1422,395 1422,317" fill="#EA580C22" stroke="#EA580C" stroke-width="2"/>
<polygon class="zone" data-id="Z-1776333923887" data-name="entryway toilet" points="1334,59 1289,59 1289,122 1337,122" fill="#0E749022" stroke="#0E7490" stroke-width="2"/>
<polygon class="zone" data-id="Z-1776333956534" data-name="waiting room 2 toilets" points="1269,245 1269,221 1227,221 1230,56 1284,56 1284,122 1335,125 1335,233 1305,230" fill="#BE185D22" stroke="#BE185D" stroke-width="2"/>
<polygon class="zone" data-id="Z-1776333978093" data-name="hub" points="1126,395 1126,482 1267,482 1267,395" fill="#854D0E22" stroke="#854D0E" stroke-width="2"/>
<polygon class="zone" data-id="Z-1776333992366" data-name="admin offices" points="1126,483 1126,736 1264,736 1267,483" fill="#2563EB22" stroke="#2563EB" stroke-width="2"/>
<polygon class="zone" data-id="Z-1776334034165" data-name="resus" points="1122,398 783,398 783,482 690,482 690,587 702,587 702,632 690,632 693,828 753,828 756,843 957,843 957,717 972,717 972,738 1122,741" fill="#DC262622" stroke="#DC2626" stroke-width="2"/>
<polygon class="zone" data-id="Z-1776334074588" data-name="area D" points="1225,55 943,58 946,220 1222,223" fill="#05966922" stroke="#059669" stroke-width="2"/>
<polygon class="zone" data-id="Z-1776334114650" data-name="area E" points="941,57 526,57 529,183 517,183 520,300 616,300 616,342 878,342 878,288 887,288 890,222 941,222" fill="#D9770622" stroke="#D97706" stroke-width="2"/>
<polygon class="zone" data-id="Z-1776334179957" data-name="corridor 1" points="1124,340 613,346 613,571 481,571 481,604 586,604 586,655 613,655 616,824 677,824 677,800 689,800 689,758 677,758 677,716 686,716 686,676 680,673 680,547 686,547 686,511 667,508 667,481 677,481 677,463 689,463 689,397 692,421 737,418 737,394 1127,397" fill="#7C3AED22" stroke="#7C3AED" stroke-width="2"/>
<polygon class="zone" data-id="Z-1776334246056" data-name="paeds" points="612,431 612,302 522,302 516,242 348,242 348,524 486,527 486,431" fill="#0891B222" stroke="#0891B2" stroke-width="2"/>
<polygon class="zone" data-id="Z-1776334271737" data-name="xray" points="609,434 486,434 486,527 348,527 348,738 414,741 414,708 483,705 483,566 612,569" fill="#9333EA22" stroke="#9333EA" stroke-width="2"/>
<polygon class="zone" data-id="Z-1776334300199" data-name="corridor 2" points="614,823 617,1252 681,1252 681,907 792,907 792,922 927,925 927,904 942,904 942,844 678,847 678,826" fill="#16A34A22" stroke="#16A34A" stroke-width="2"/>
<polygon class="zone" data-id="Z-1776334408883" data-name="majors A" points="689,908 689,1269 806,1266 809,1344 1260,1341 1254,1158 1170,1155 1170,1170 1116,1167 1116,993 1032,996 1032,975 960,975 960,941 930,941 927,923 791,926 788,905" fill="#EA580C22" stroke="#EA580C" stroke-width="2"/>
<polygon class="zone" data-id="Z-1776334434667" data-name="majors B/C" points="1265,1110 1262,1335 1629,1341 1629,1263 1598,1257 1595,1182 1376,1191 1382,1146 1313,1107" fill="#0E749022" stroke="#0E7490" stroke-width="2"/>
<polygon class="zone" data-id="Z-1776334473793" data-name="ambulance reception" points="1266,688 1266,739 1254,739 1257,820 1266,820 1266,850 1362,850 1359,685" fill="#BE185D22" stroke="#BE185D" stroke-width="2"/>
<polygon class="zone" data-id="Z-1776334504513" data-name="ambulance triage" points="1255,736 1128,736 1128,821 1174,824 1174,1031 1228,1034 1252,1013 1252,989 1267,989 1267,824 1252,821" fill="#854D0E22" stroke="#854D0E" stroke-width="2"/>
<polygon class="zone" data-id="Z-1776334526903" data-name="ambulance examination rooms" points="1124,824 1052,824 1055,986 1169,992 1172,824" fill="#2563EB22" stroke="#2563EB" stroke-width="2"/>
<polygon class="zone" data-id="Z-1776334544692" data-name="corridor 1 toilets" points="779,394 737,394 737,421 695,421 695,475 782,478" fill="#DC262622" stroke="#DC2626" stroke-width="2"/>
<polygon class="zone" data-id="Z-1776334563986" data-name="medication nurse" points="1181,228 1121,228 1124,276 1142,300 1184,297" fill="#05966922" stroke="#059669" stroke-width="2"/>
<polygon class="zone" data-id="Z-1776334585437" data-name="unknown 1" points="1115,226 890,223 890,289 878,289 881,343 1124,340 1121,322 1145,304 1115,277" fill="#D9770622" stroke="#D97706" stroke-width="2"/>
<polygon class="zone" data-id="Z-1776334606472" data-name="corridor 3" points="1125,743 972,743 969,845 942,842 942,905 969,905 969,971 1029,971 1032,995 1050,995 1053,821 1125,821" fill="#7C3AED22" stroke="#7C3AED" stroke-width="2"/>
<polygon class="zone" data-id="Z-1776334639105" data-name="unknown 2" points="584,602 482,602 485,749 482,827 615,827 615,659 581,659" fill="#0891B222" stroke="#0891B2" stroke-width="2"/>
<polygon class="zone" data-id="Z-1776334685894" data-name="unknown 3" points="613,831 484,831 484,912 376,912 373,993 343,993 349,1155 481,1158 484,1029 613,1032" fill="#9333EA22" stroke="#9333EA" stroke-width="2"/>
<polygon class="zone" data-id="Z-1776334701943" data-name="toilets corridor 2" points="613,1032 481,1032 484,1245 517,1254 520,1266 616,1269" fill="#16A34A22" stroke="#16A34A" stroke-width="2"/>
<polygon class="zone" data-id="Z-1776334719197" data-name="unknown 4" points="1169,993 1124,990 1121,1161 1169,1167 1169,1152 1253,1152 1253,1017 1229,1035 1175,1035" fill="#EA580C22" stroke="#EA580C" stroke-width="2"/>
        <g id="pathLayer"></g>
      </svg>
      <div class="fp-legend" id="pathLegend"></div>
    </div>
  </div>

  <!-- ZONE HEATMAP -->
  <div id="heatmap" class="section">
    <div class="sec-title">Zone Cognitive Load Heatmap</div>
    <div class="fp-wrap">
      <div class="fp-title">Zone colour intensity = dwell time · orange rings = environment flags · size = flag count</div>
      <svg id="heatSvg" viewBox="323 3 1544 1361" style="width:100%;height:auto;max-height:420px;" xmlns="http://www.w3.org/2000/svg">
        <g id="heatZones"></g>
        <g id="heatFlags"></g>
      </svg>
    </div>
  </div>

  <!-- ACTIVITY + POSTURE -->
  <div id="activity" class="section">
    <div class="sec-title">Activity & Posture Distribution</div>
    <div class="two-col">
      <div class="chart-card">
        <div class="chart-title">Activity breakdown</div>
        <div id="activityChart"></div>
      </div>
      <div class="chart-card">
        <div class="chart-title">Posture / Mobilisation</div>
        <div id="postureChart"></div>
      </div>
    </div>
  </div>

  <!-- ENVIRONMENT FLAGS -->
  <div id="environment" class="section">
    <div class="sec-title">Environment Flags — Spatial & Temporal</div>
    <div class="two-col">
      <div class="chart-card">
        <div class="chart-title">Flags by type</div>
        <div id="envTypeChart"></div>
      </div>
      <div class="chart-card">
        <div class="chart-title">Flags by zone (top 10)</div>
        <div id="envZoneChart"></div>
      </div>
    </div>
  </div>

  <!-- CO-OCCURRENCE -->
  <div id="cooccurrence" class="section">
    <div class="sec-title">Environment × Activity Co-occurrence</div>
    <div class="chart-card" style="margin-bottom:16px;">
      <div class="chart-title">Which activities co-occur most with environment flags? (cognitive load pressure)</div>
      <div id="cooccChart"></div>
    </div>
    <div class="chart-card">
      <div class="chart-title">Spatial pressure index · flags per minute of dwell time per zone</div>
      <div id="pressureChart"></div>
    </div>
  </div>

  <!-- ZONE DETAIL TABLE -->
  <div id="table" class="section">
    <div class="sec-title">Zone Detail Table</div>
    <div class="chart-card" style="overflow-x:auto;">
      <table class="data-table" id="zoneTable">
        <thead><tr>
          <th>Zone</th><th>Events</th><th>Dwell time</th><th>% of session</th>
          <th>Env. flags</th><th>Pressure index</th><th>Top activity</th><th>Top posture</th>
        </tr></thead>
        <tbody id="zoneTableBody"></tbody>
      </table>
    </div>
  </div>

</main>
</div>

<script>
// ── Embedded zone data ──────────────────────────────────────────────────────
const ZONES = [{"id": "Z-1776333646067", "name": "digital triage", "color": "#2563EB", "points": [{"x": 1340, "y": 23, "scale": 3.0043478260869567}, {"x": 1340, "y": 179, "scale": 3.0043478260869567}, {"x": 1425, "y": 179, "scale": 3.0043478260869567}, {"x": 1428, "y": 56, "scale": 3.0043478260869567}]}, {"id": "Z-1776333666133", "name": "reception", "color": "#DC2626", "points": [{"x": 1428, "y": 55, "scale": 3.0043478260869567}, {"x": 1428, "y": 166, "scale": 3.0043478260869567}, {"x": 1509, "y": 169, "scale": 3.0043478260869567}, {"x": 1509, "y": 55, "scale": 3.0043478260869567}]}, {"id": "Z-1776333716729", "name": "reception office", "color": "#059669", "points": [{"x": 1510, "y": 56, "scale": 3.0043478260869567}, {"x": 1510, "y": 155, "scale": 3.0043478260869567}, {"x": 1543, "y": 188, "scale": 3.0043478260869567}, {"x": 1570, "y": 188, "scale": 3.0043478260869567}, {"x": 1567, "y": 56, "scale": 3.0043478260869567}]}, {"id": "Z-1776333741896", "name": "back offices", "color": "#D97706", "points": [{"x": 1569, "y": 55, "scale": 3.0043478260869567}, {"x": 1569, "y": 187, "scale": 3.0043478260869567}, {"x": 1680, "y": 187, "scale": 3.0043478260869567}, {"x": 1680, "y": 222, "scale": 3.0043478260869567}, {"x": 1839, "y": 222, "scale": 3.0043478260869567}, {"x": 1839, "y": 54, "scale": 3.0043478260869567}]}, {"id": "Z-1776333775330", "name": "waiting room 1", "color": "#7C3AED", "points": [{"x": 1426, "y": 165, "scale": 3.0043478260869567}, {"x": 1426, "y": 309, "scale": 3.0043478260869567}, {"x": 1714, "y": 309, "scale": 3.0043478260869567}, {"x": 1714, "y": 222, "scale": 3.0043478260869567}, {"x": 1678, "y": 222, "scale": 3.0043478260869567}, {"x": 1678, "y": 276, "scale": 3.0043478260869567}, {"x": 1669, "y": 276, "scale": 3.0043478260869567}, {"x": 1669, "y": 225, "scale": 3.0043478260869567}, {"x": 1681, "y": 222, "scale": 3.0043478260869567}, {"x": 1678, "y": 186, "scale": 3.0043478260869567}, {"x": 1540, "y": 186, "scale": 3.0043478260869567}, {"x": 1510, "y": 153, "scale": 3.0043478260869567}, {"x": 1510, "y": 168, "scale": 3.0043478260869567}]}, {"id": "Z-1776333801904", "name": "triage 1 examination rooms", "color": "#0891B2", "points": [{"x": 1425, "y": 309, "scale": 3.0043478260869567}, {"x": 1425, "y": 396, "scale": 3.0043478260869567}, {"x": 1716, "y": 399, "scale": 3.0043478260869567}, {"x": 1713, "y": 309, "scale": 3.0043478260869567}]}, {"id": "Z-1776333826801", "name": "triage 1 ECG", "color": "#9333EA", "points": [{"x": 1715, "y": 272, "scale": 3.0043478260869567}, {"x": 1715, "y": 398, "scale": 3.0043478260869567}, {"x": 1847, "y": 398, "scale": 3.0043478260869567}, {"x": 1844, "y": 224, "scale": 3.0043478260869567}, {"x": 1745, "y": 224, "scale": 3.0043478260869567}]}, {"id": "Z-1776333872960", "name": "waiting room 2", "color": "#16A34A", "points": [{"x": 1337, "y": 179, "scale": 3.0043478260869567}, {"x": 1425, "y": 179, "scale": 3.0043478260869567}, {"x": 1425, "y": 317, "scale": 3.0043478260869567}, {"x": 1380, "y": 317, "scale": 3.0043478260869567}, {"x": 1371, "y": 326, "scale": 3.0043478260869567}, {"x": 1371, "y": 488, "scale": 3.0043478260869567}, {"x": 1440, "y": 488, "scale": 3.0043478260869567}, {"x": 1355, "y": 572, "scale": 3.0043478260869567}, {"x": 1355, "y": 683, "scale": 3.0043478260869567}, {"x": 1268, "y": 686, "scale": 3.0043478260869567}, {"x": 1271, "y": 395, "scale": 3.0043478260869567}, {"x": 1127, "y": 395, "scale": 3.0043478260869567}, {"x": 1127, "y": 323, "scale": 3.0043478260869567}, {"x": 1151, "y": 302, "scale": 3.0043478260869567}, {"x": 1184, "y": 302, "scale": 3.0043478260869567}, {"x": 1187, "y": 230, "scale": 3.0043478260869567}, {"x": 1268, "y": 233, "scale": 3.0043478260869567}, {"x": 1271, "y": 248, "scale": 3.0043478260869567}, {"x": 1307, "y": 248, "scale": 3.0043478260869567}, {"x": 1307, "y": 233, "scale": 3.0043478260869567}, {"x": 1337, "y": 233, "scale": 3.0043478260869567}]}, {"id": "Z-1776333904697", "name": "triage 2", "color": "#EA580C", "points": [{"x": 1371, "y": 323, "scale": 3.0043478260869567}, {"x": 1371, "y": 488, "scale": 3.0043478260869567}, {"x": 1440, "y": 488, "scale": 3.0043478260869567}, {"x": 1443, "y": 398, "scale": 3.0043478260869567}, {"x": 1422, "y": 395, "scale": 3.0043478260869567}, {"x": 1422, "y": 317, "scale": 3.0043478260869567}]}, {"id": "Z-1776333923887", "name": "entryway toilet", "color": "#0E7490", "points": [{"x": 1334, "y": 59, "scale": 3.0043478260869567}, {"x": 1289, "y": 59, "scale": 3.0043478260869567}, {"x": 1289, "y": 122, "scale": 3.0043478260869567}, {"x": 1337, "y": 122, "scale": 3.0043478260869567}]}, {"id": "Z-1776333956534", "name": "waiting room 2 toilets", "color": "#BE185D", "points": [{"x": 1269, "y": 245, "scale": 3.0043478260869567}, {"x": 1269, "y": 221, "scale": 3.0043478260869567}, {"x": 1227, "y": 221, "scale": 3.0043478260869567}, {"x": 1230, "y": 56, "scale": 3.0043478260869567}, {"x": 1284, "y": 56, "scale": 3.0043478260869567}, {"x": 1284, "y": 122, "scale": 3.0043478260869567}, {"x": 1335, "y": 125, "scale": 3.0043478260869567}, {"x": 1335, "y": 233, "scale": 3.0043478260869567}, {"x": 1305, "y": 230, "scale": 3.0043478260869567}]}, {"id": "Z-1776333978093", "name": "hub", "color": "#854D0E", "points": [{"x": 1126, "y": 395, "scale": 3.0043478260869567}, {"x": 1126, "y": 482, "scale": 3.0043478260869567}, {"x": 1267, "y": 482, "scale": 3.0043478260869567}, {"x": 1267, "y": 395, "scale": 3.0043478260869567}]}, {"id": "Z-1776333992366", "name": "admin offices", "color": "#2563EB", "points": [{"x": 1126, "y": 483, "scale": 3.0043478260869567}, {"x": 1126, "y": 736, "scale": 3.0043478260869567}, {"x": 1264, "y": 736, "scale": 3.0043478260869567}, {"x": 1267, "y": 483, "scale": 3.0043478260869567}]}, {"id": "Z-1776334034165", "name": "resus", "color": "#DC2626", "points": [{"x": 1122, "y": 398, "scale": 3.0043478260869567}, {"x": 783, "y": 398, "scale": 3.0043478260869567}, {"x": 783, "y": 482, "scale": 3.0043478260869567}, {"x": 690, "y": 482, "scale": 3.0043478260869567}, {"x": 690, "y": 587, "scale": 3.0043478260869567}, {"x": 702, "y": 587, "scale": 3.0043478260869567}, {"x": 702, "y": 632, "scale": 3.0043478260869567}, {"x": 690, "y": 632, "scale": 3.0043478260869567}, {"x": 693, "y": 828, "scale": 3.0043478260869567}, {"x": 753, "y": 828, "scale": 3.0043478260869567}, {"x": 756, "y": 843, "scale": 3.0043478260869567}, {"x": 957, "y": 843, "scale": 3.0043478260869567}, {"x": 957, "y": 717, "scale": 3.0043478260869567}, {"x": 972, "y": 717, "scale": 3.0043478260869567}, {"x": 972, "y": 738, "scale": 3.0043478260869567}, {"x": 1122, "y": 741, "scale": 3.0043478260869567}]}, {"id": "Z-1776334074588", "name": "area D", "color": "#059669", "points": [{"x": 1225, "y": 55, "scale": 3.0043478260869567}, {"x": 943, "y": 58, "scale": 3.0043478260869567}, {"x": 946, "y": 220, "scale": 3.0043478260869567}, {"x": 1222, "y": 223, "scale": 3.0043478260869567}]}, {"id": "Z-1776334114650", "name": "area E", "color": "#D97706", "points": [{"x": 941, "y": 57, "scale": 3.0043478260869567}, {"x": 526, "y": 57, "scale": 3.0043478260869567}, {"x": 529, "y": 183, "scale": 3.0043478260869567}, {"x": 517, "y": 183, "scale": 3.0043478260869567}, {"x": 520, "y": 300, "scale": 3.0043478260869567}, {"x": 616, "y": 300, "scale": 3.0043478260869567}, {"x": 616, "y": 342, "scale": 3.0043478260869567}, {"x": 878, "y": 342, "scale": 3.0043478260869567}, {"x": 878, "y": 288, "scale": 3.0043478260869567}, {"x": 887, "y": 288, "scale": 3.0043478260869567}, {"x": 890, "y": 222, "scale": 3.0043478260869567}, {"x": 941, "y": 222, "scale": 3.0043478260869567}]}, {"id": "Z-1776334179957", "name": "corridor 1", "color": "#7C3AED", "points": [{"x": 1124, "y": 340, "scale": 3.0043478260869567}, {"x": 613, "y": 346, "scale": 3.0043478260869567}, {"x": 613, "y": 571, "scale": 3.0043478260869567}, {"x": 481, "y": 571, "scale": 3.0043478260869567}, {"x": 481, "y": 604, "scale": 3.0043478260869567}, {"x": 586, "y": 604, "scale": 3.0043478260869567}, {"x": 586, "y": 655, "scale": 3.0043478260869567}, {"x": 613, "y": 655, "scale": 3.0043478260869567}, {"x": 616, "y": 824, "scale": 3.0043478260869567}, {"x": 677, "y": 824, "scale": 3.0043478260869567}, {"x": 677, "y": 800, "scale": 3.0043478260869567}, {"x": 689, "y": 800, "scale": 3.0043478260869567}, {"x": 689, "y": 758, "scale": 3.0043478260869567}, {"x": 677, "y": 758, "scale": 3.0043478260869567}, {"x": 677, "y": 716, "scale": 3.0043478260869567}, {"x": 686, "y": 716, "scale": 3.0043478260869567}, {"x": 686, "y": 676, "scale": 3.0043478260869567}, {"x": 680, "y": 673, "scale": 3.0043478260869567}, {"x": 680, "y": 547, "scale": 3.0043478260869567}, {"x": 686, "y": 547, "scale": 3.0043478260869567}, {"x": 686, "y": 511, "scale": 3.0043478260869567}, {"x": 667, "y": 508, "scale": 3.0043478260869567}, {"x": 667, "y": 481, "scale": 3.0043478260869567}, {"x": 677, "y": 481, "scale": 3.0043478260869567}, {"x": 677, "y": 463, "scale": 3.0043478260869567}, {"x": 689, "y": 463, "scale": 3.0043478260869567}, {"x": 689, "y": 397, "scale": 3.0043478260869567}, {"x": 692, "y": 421, "scale": 3.0043478260869567}, {"x": 737, "y": 418, "scale": 3.0043478260869567}, {"x": 737, "y": 394, "scale": 3.0043478260869567}, {"x": 1127, "y": 397, "scale": 3.0043478260869567}]}, {"id": "Z-1776334246056", "name": "paeds", "color": "#0891B2", "points": [{"x": 612, "y": 431, "scale": 3.0043478260869567}, {"x": 612, "y": 302, "scale": 3.0043478260869567}, {"x": 522, "y": 302, "scale": 3.0043478260869567}, {"x": 516, "y": 242, "scale": 3.0043478260869567}, {"x": 348, "y": 242, "scale": 3.0043478260869567}, {"x": 348, "y": 524, "scale": 3.0043478260869567}, {"x": 486, "y": 527, "scale": 3.0043478260869567}, {"x": 486, "y": 431, "scale": 3.0043478260869567}]}, {"id": "Z-1776334271737", "name": "xray", "color": "#9333EA", "points": [{"x": 609, "y": 434, "scale": 3.0043478260869567}, {"x": 486, "y": 434, "scale": 3.0043478260869567}, {"x": 486, "y": 527, "scale": 3.0043478260869567}, {"x": 348, "y": 527, "scale": 3.0043478260869567}, {"x": 348, "y": 738, "scale": 3.0043478260869567}, {"x": 414, "y": 741, "scale": 3.0043478260869567}, {"x": 414, "y": 708, "scale": 3.0043478260869567}, {"x": 483, "y": 705, "scale": 3.0043478260869567}, {"x": 483, "y": 566, "scale": 3.0043478260869567}, {"x": 612, "y": 569, "scale": 3.0043478260869567}]}, {"id": "Z-1776334300199", "name": "corridor 2", "color": "#16A34A", "points": [{"x": 614, "y": 823, "scale": 3.0043478260869567}, {"x": 617, "y": 1252, "scale": 3.0043478260869567}, {"x": 681, "y": 1252, "scale": 3.0043478260869567}, {"x": 681, "y": 907, "scale": 3.0043478260869567}, {"x": 792, "y": 907, "scale": 3.0043478260869567}, {"x": 792, "y": 922, "scale": 3.0043478260869567}, {"x": 927, "y": 925, "scale": 3.0043478260869567}, {"x": 927, "y": 904, "scale": 3.0043478260869567}, {"x": 942, "y": 904, "scale": 3.0043478260869567}, {"x": 942, "y": 844, "scale": 3.0043478260869567}, {"x": 678, "y": 847, "scale": 3.0043478260869567}, {"x": 678, "y": 826, "scale": 3.0043478260869567}]}, {"id": "Z-1776334408883", "name": "majors A", "color": "#EA580C", "points": [{"x": 689, "y": 908, "scale": 3.0043476267708407}, {"x": 689, "y": 1269, "scale": 3.0043476267708407}, {"x": 806, "y": 1266, "scale": 3.0043476267708407}, {"x": 809, "y": 1344, "scale": 3.0043476267708407}, {"x": 1260, "y": 1341, "scale": 3.0043476267708407}, {"x": 1254, "y": 1158, "scale": 3.0043476267708407}, {"x": 1170, "y": 1155, "scale": 3.0043476267708407}, {"x": 1170, "y": 1170, "scale": 3.0043476267708407}, {"x": 1116, "y": 1167, "scale": 3.0043476267708407}, {"x": 1116, "y": 993, "scale": 3.0043476267708407}, {"x": 1032, "y": 996, "scale": 3.0043476267708407}, {"x": 1032, "y": 975, "scale": 3.0043476267708407}, {"x": 960, "y": 975, "scale": 3.0043476267708407}, {"x": 960, "y": 941, "scale": 3.0043476267708407}, {"x": 930, "y": 941, "scale": 3.0043476267708407}, {"x": 927, "y": 923, "scale": 3.0043476267708407}, {"x": 791, "y": 926, "scale": 3.0043476267708407}, {"x": 788, "y": 905, "scale": 3.0043476267708407}]}, {"id": "Z-1776334434667", "name": "majors B/C", "color": "#0E7490", "points": [{"x": 1265, "y": 1110, "scale": 3.0043478260869567}, {"x": 1262, "y": 1335, "scale": 3.0043478260869567}, {"x": 1629, "y": 1341, "scale": 3.0043478260869567}, {"x": 1629, "y": 1263, "scale": 3.0043478260869567}, {"x": 1598, "y": 1257, "scale": 3.0043478260869567}, {"x": 1595, "y": 1182, "scale": 3.0043478260869567}, {"x": 1376, "y": 1191, "scale": 3.0043478260869567}, {"x": 1382, "y": 1146, "scale": 3.0043478260869567}, {"x": 1313, "y": 1107, "scale": 3.0043478260869567}]}, {"id": "Z-1776334473793", "name": "ambulance reception", "color": "#BE185D", "points": [{"x": 1266, "y": 688, "scale": 3.0043476267708407}, {"x": 1266, "y": 739, "scale": 3.0043476267708407}, {"x": 1254, "y": 739, "scale": 3.0043476267708407}, {"x": 1257, "y": 820, "scale": 3.0043478260869567}, {"x": 1266, "y": 820, "scale": 3.0043478260869567}, {"x": 1266, "y": 850, "scale": 3.0043478260869567}, {"x": 1362, "y": 850, "scale": 3.0043478260869567}, {"x": 1359, "y": 685, "scale": 3.0043478260869567}]}, {"id": "Z-1776334504513", "name": "ambulance triage", "color": "#854D0E", "points": [{"x": 1255, "y": 736, "scale": 3.0043478260869567}, {"x": 1128, "y": 736, "scale": 3.0043478260869567}, {"x": 1128, "y": 821, "scale": 3.0043478260869567}, {"x": 1174, "y": 824, "scale": 3.0043476267708407}, {"x": 1174, "y": 1031, "scale": 3.0043476267708407}, {"x": 1228, "y": 1034, "scale": 3.0043476267708407}, {"x": 1252, "y": 1013, "scale": 3.0043476267708407}, {"x": 1252, "y": 989, "scale": 3.0043476267708407}, {"x": 1267, "y": 989, "scale": 3.0043476267708407}, {"x": 1267, "y": 824, "scale": 3.0043476267708407}, {"x": 1252, "y": 821, "scale": 3.0043476267708407}]}, {"id": "Z-1776334526903", "name": "ambulance examination rooms", "color": "#2563EB", "points": [{"x": 1124, "y": 824, "scale": 3.0043478260869567}, {"x": 1052, "y": 824, "scale": 3.0043478260869567}, {"x": 1055, "y": 986, "scale": 3.0043478260869567}, {"x": 1169, "y": 992, "scale": 3.0043478260869567}, {"x": 1172, "y": 824, "scale": 3.0043478260869567}]}, {"id": "Z-1776334544692", "name": "corridor 1 toilets", "color": "#DC2626", "points": [{"x": 779, "y": 394, "scale": 3.0043478260869567}, {"x": 737, "y": 394, "scale": 3.0043478260869567}, {"x": 737, "y": 421, "scale": 3.0043478260869567}, {"x": 695, "y": 421, "scale": 3.0043478260869567}, {"x": 695, "y": 475, "scale": 3.0043478260869567}, {"x": 782, "y": 478, "scale": 3.0043478260869567}]}, {"id": "Z-1776334563986", "name": "medication nurse", "color": "#059669", "points": [{"x": 1181, "y": 228, "scale": 3.0043478260869567}, {"x": 1121, "y": 228, "scale": 3.0043478260869567}, {"x": 1124, "y": 276, "scale": 3.0043478260869567}, {"x": 1142, "y": 300, "scale": 3.0043478260869567}, {"x": 1184, "y": 297, "scale": 3.0043478260869567}]}, {"id": "Z-1776334585437", "name": "unknown 1", "color": "#D97706", "points": [{"x": 1115, "y": 226, "scale": 3.0043476267708407}, {"x": 890, "y": 223, "scale": 3.0043476267708407}, {"x": 890, "y": 289, "scale": 3.0043476267708407}, {"x": 878, "y": 289, "scale": 3.0043478260869567}, {"x": 881, "y": 343, "scale": 3.0043478260869567}, {"x": 1124, "y": 340, "scale": 3.0043478260869567}, {"x": 1121, "y": 322, "scale": 3.0043478260869567}, {"x": 1145, "y": 304, "scale": 3.0043478260869567}, {"x": 1115, "y": 277, "scale": 3.0043478260869567}]}, {"id": "Z-1776334606472", "name": "corridor 3", "color": "#7C3AED", "points": [{"x": 1125, "y": 743, "scale": 3.0043478260869567}, {"x": 972, "y": 743, "scale": 3.0043478260869567}, {"x": 969, "y": 845, "scale": 3.0043478260869567}, {"x": 942, "y": 842, "scale": 3.0043478260869567}, {"x": 942, "y": 905, "scale": 3.0043478260869567}, {"x": 969, "y": 905, "scale": 3.0043478260869567}, {"x": 969, "y": 971, "scale": 3.0043478260869567}, {"x": 1029, "y": 971, "scale": 3.0043478260869567}, {"x": 1032, "y": 995, "scale": 3.0043478260869567}, {"x": 1050, "y": 995, "scale": 3.0043478260869567}, {"x": 1053, "y": 821, "scale": 3.0043478260869567}, {"x": 1125, "y": 821, "scale": 3.0043478260869567}]}, {"id": "Z-1776334639105", "name": "unknown 2", "color": "#0891B2", "points": [{"x": 584, "y": 602, "scale": 3.0043478260869567}, {"x": 482, "y": 602, "scale": 3.0043478260869567}, {"x": 485, "y": 749, "scale": 3.0043478260869567}, {"x": 482, "y": 827, "scale": 3.0043478260869567}, {"x": 615, "y": 827, "scale": 3.0043478260869567}, {"x": 615, "y": 659, "scale": 3.0043478260869567}, {"x": 581, "y": 659, "scale": 3.0043478260869567}]}, {"id": "Z-1776334685894", "name": "unknown 3", "color": "#9333EA", "points": [{"x": 613, "y": 831, "scale": 3.0043478260869567}, {"x": 484, "y": 831, "scale": 3.0043478260869567}, {"x": 484, "y": 912, "scale": 3.0043478260869567}, {"x": 376, "y": 912, "scale": 3.0043478260869567}, {"x": 373, "y": 993, "scale": 3.0043478260869567}, {"x": 343, "y": 993, "scale": 3.0043478260869567}, {"x": 349, "y": 1155, "scale": 3.0043478260869567}, {"x": 481, "y": 1158, "scale": 3.0043478260869567}, {"x": 484, "y": 1029, "scale": 3.0043478260869567}, {"x": 613, "y": 1032, "scale": 3.0043478260869567}]}, {"id": "Z-1776334701943", "name": "toilets corridor 2", "color": "#16A34A", "points": [{"x": 613, "y": 1032, "scale": 3.0043478260869567}, {"x": 481, "y": 1032, "scale": 3.0043478260869567}, {"x": 484, "y": 1245, "scale": 3.0043478260869567}, {"x": 517, "y": 1254, "scale": 3.0043478260869567}, {"x": 520, "y": 1266, "scale": 3.0043478260869567}, {"x": 616, "y": 1269, "scale": 3.0043478260869567}]}, {"id": "Z-1776334719197", "name": "unknown 4", "color": "#EA580C", "points": [{"x": 1169, "y": 993, "scale": 3.0043478260869567}, {"x": 1124, "y": 990, "scale": 3.0043478260869567}, {"x": 1121, "y": 1161, "scale": 3.0043478260869567}, {"x": 1169, "y": 1167, "scale": 3.0043478260869567}, {"x": 1169, "y": 1152, "scale": 3.0043478260869567}, {"x": 1253, "y": 1152, "scale": 3.0043478260869567}, {"x": 1253, "y": 1017, "scale": 3.0043478260869567}, {"x": 1229, "y": 1035, "scale": 3.0043478260869567}, {"x": 1175, "y": 1035, "scale": 3.0043478260869567}]}];
const PT_COLORS = ["#2563EB","#DC2626","#059669","#D97706","#7C3AED","#0891B2","#DB2777","#65A30D","#EA580C","#0284C7"];

const ACTIVITY_LABELS = {
  documentation_admin:"Doc/Admin", break:"Break/Rest", direct_patient_care:"Direct Pt Care",
  handover:"Handover", medication_task:"Medication", pager_phone_screen:"Pager/Phone",
  searching:"Searching", staff_communication:"Staff Comm.", waiting:"Waiting"
};
const POSTURE_LABELS = {
  sitting:"Sitting", standing:"Standing", walking:"Walking", running:"Running",
  pushing_wheelchair:"Pushing wheelchair", pushing_bed:"Pushing bed",
  support_patient_walking:"Supporting pt.", carrying_light:"Carrying light",
  carrying_heavy:"Carrying heavy"
};
const ENV_LABELS = {
  crowding:"Crowding", buzzer:"Buzzer", red_phone:"Red phone", mobile_phone:"Mobile phone",
  interruption:"Interruption", handover_underway:"Handover", equipment_broken:"Equip. broken",
  maintenance_works:"Maintenance"
};

// ── State ────────────────────────────────────────────────────────────────────
let sessions = []; // {id, code, date, color, events:[], markers:[]}
let selected = new Set();

// ── CSV parser ───────────────────────────────────────────────────────────────
function parseCsv(text) {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map(line => {
    const vals = [];
    let cur = "", inQ = false;
    for (const ch of line) {
      if (ch === '"') inQ = !inQ;
      else if (ch === "," && !inQ) { vals.push(cur); cur = ""; }
      else cur += ch;
    }
    vals.push(cur);
    const row = {};
    headers.forEach((h, i) => { row[h] = (vals[i] || "").replace(/^"|"$/g, "").trim(); });
    return row;
  });
}

// ── File imports ─────────────────────────────────────────────────────────────
document.getElementById("eventsInput").addEventListener("change", async e => {
  const files = Array.from(e.target.files);
  for (const file of files) {
    const text = await file.text();
    const rows = parseCsv(text);
    if (!rows.length) continue;
    // group by session
    const bySession = {};
    rows.forEach(r => {
      const sid = r.session_id || (r.date + "_" + r.participant_code);
      if (!bySession[sid]) bySession[sid] = { rows: [], meta: r };
      bySession[sid].rows.push(r);
    });
    Object.entries(bySession).forEach(([sid, {rows, meta}], i) => {
      if (sessions.find(s => s.id === sid)) return;
      const color = PT_COLORS[sessions.length % PT_COLORS.length];
      sessions.push({
        id: sid, color,
        code: meta.participant_code || ("P" + (sessions.length+1)),
        role: meta.participant_role || "",
        seniority: meta.seniority_level || "",
        date: meta.date || "",
        events: rows.map(r => ({
          id: r.event_id, zoneId: r.zone_id, zoneName: r.zone_name,
          activities: r.activity ? r.activity.split(",").map(s=>s.trim()).filter(Boolean) : [],
          postures: r.bodily_action ? r.bodily_action.split(",").map(s=>s.trim()).filter(Boolean) : [],
          patientStates: r.patient_state ? r.patient_state.split(",").map(s=>s.trim()).filter(Boolean) : [],
          x: parseFloat(r.x_coord)||0, y: parseFloat(r.y_coord)||0,
          startTime: r.start_time, endTime: r.end_time,
          duration: r.end_time && r.start_time ? (new Date(r.end_time)-new Date(r.start_time))/1000 : 0
        })),
        markers: []
      });
      selected.add(sid);
    });
  }
  document.getElementById("eventsStatus").textContent = `✓ ${sessions.length} session(s) loaded`;
  render();
});

document.getElementById("markersInput").addEventListener("change", async e => {
  const files = Array.from(e.target.files);
  for (const file of files) {
    const text = await file.text();
    const rows = parseCsv(text);
    rows.forEach(r => {
      const sid = r.session_id;
      const s = sessions.find(s => s.id === sid);
      if (s) s.markers.push({
        id: r.marker_id, category: r.category, zoneId: r.zone_id,
        x: parseFloat(r.x_coord)||0, y: parseFloat(r.y_coord)||0,
        timestamp: r.timestamp
      });
    });
  }
  document.getElementById("markersStatus").textContent = `✓ Markers merged`;
  render();
});

// ── Helpers ──────────────────────────────────────────────────────────────────
function selSessions() { return sessions.filter(s => selected.has(s.id)); }
function selEvents() { return selSessions().flatMap(s => s.events); }
function selMarkers() { return selSessions().flatMap(s => s.markers); }
function fmtDuration(secs) {
  if (!secs || secs < 0) return "—";
  if (secs < 60) return Math.round(secs) + "s";
  if (secs < 3600) return Math.round(secs/60) + "m";
  return (secs/3600).toFixed(1) + "h";
}
function zoneById(id) { return ZONES.find(z => z.id === id); }
function polygonCentroid(pts) {
  return { x: pts.reduce((s,p)=>s+p.x,0)/pts.length, y: pts.reduce((s,p)=>s+p.y,0)/pts.length };
}
function pointInPolygon(px, py, pts) {
  let inside = false;
  for (let i=0, j=pts.length-1; i<pts.length; j=i++) {
    const xi=pts[i].x, yi=pts[i].y, xj=pts[j].x, yj=pts[j].y;
    if (((yi>py)!==(yj>py)) && (px < (xj-xi)*(py-yi)/(yj-yi)+xi)) inside=!inside;
  }
  return inside;
}

function barChart(container, data, colorFn, labelFn, valFn, maxVal) {
  if (!data.length) { container.innerHTML = '<div class="empty">No data</div>'; return; }
  const max = maxVal || Math.max(...data.map(valFn));
  container.innerHTML = data.map(d => `
    <div class="bar-row">
      <div class="bar-label" title="${labelFn(d)}">${labelFn(d)}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${Math.round(valFn(d)/max*100)}%;background:${colorFn(d)}"></div></div>
      <div class="bar-val">${typeof valFn(d)==='number' && valFn(d)<10 ? valFn(d).toFixed(1) : Math.round(valFn(d))}</div>
    </div>`).join("");
}

// ── Tooltip ──────────────────────────────────────────────────────────────────
const tip = document.getElementById("tooltip");
function showTip(e, html) { tip.innerHTML=html; tip.style.display="block"; moveTip(e); }
function moveTip(e) { tip.style.left=(e.clientX+14)+"px"; tip.style.top=(e.clientY-10)+"px"; }
function hideTip() { tip.style.display="none"; }

// ── Main render ───────────────────────────────────────────────────────────────
function render() {
  if (!sessions.length) return;
  const sel = selSessions();
  const evs = selEvents();
  const mks = selMarkers();
  const totalDur = evs.reduce((s,e)=>s+e.duration,0);

  // Session list in sidebar
  document.getElementById("sessionList").innerHTML = sessions.map(s => {
    const active = selected.has(s.id);
    return `<button class="session-chip" onclick="toggleSession('${s.id}')"
      style="background:${active?s.color+'18':'transparent'};border:1.5px solid ${active?s.color:'rgba(255,255,255,0.1)'};color:${active?'white':'#64748B'}">
      <div class="dot" style="background:${active?s.color:'#475569'}"></div>
      ${s.code} · ${s.date}
    </button>`;
  }).join("");

  // Stats footer
  const zoneIds = [...new Set(evs.map(e=>e.zoneId).filter(Boolean))];
  const transitions = evs.length > 1 ? evs.filter((e,i)=>i>0 && e.zoneId!==evs[i-1].zoneId).length : 0;
  document.getElementById("statSessions").textContent = sel.length;
  document.getElementById("statEvents").textContent = evs.length;
  document.getElementById("statFlags").textContent = mks.length;
  document.getElementById("statZones").textContent = zoneIds.length;

  // Metrics row
  document.getElementById("m-participants").textContent = sel.length;
  document.getElementById("m-events").textContent = evs.length;
  document.getElementById("m-zones").textContent = zoneIds.length;
  document.getElementById("m-flags").textContent = mks.length;
  document.getElementById("m-transitions").textContent = transitions;

  // Report meta
  document.getElementById("reportMeta").textContent =
    sel.map(s=>s.code).join(", ") + " · " + new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});

  // ── MOVEMENT PATHS ──
  const pathLayer = document.getElementById("pathLayer");
  pathLayer.innerHTML = "";
  const pathLegend = document.getElementById("pathLegend");
  pathLegend.innerHTML = "";
  sel.forEach(s => {
    const pts = s.events.filter(e=>e.x||e.y);
    if (pts.length < 2) return;
    const d = "M " + pts.map(e=>`${e.x},${e.y}`).join(" L ");
    pathLayer.innerHTML += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity="0.65"/>`;
    pts.forEach((e,i) => {
      const r = i===pts.length-1?9:i===0?9:5;
      pathLayer.innerHTML += `<circle cx="${e.x}" cy="${e.y}" r="${r}" fill="${s.color}" stroke="white" stroke-width="2" opacity="0.85"
        onmouseenter="showTip(event,'<b>${s.code}</b><br>Tap ${i+1} · ${e.zoneName||'?'}<br>${e.activities.join(', ')||'—'}')"
        onmouseleave="hideTip()" onmousemove="moveTip(event)"/>`;
    });
    pathLegend.innerHTML += `<div class="legend-item"><div style="width:18px;height:3px;background:${s.color};border-radius:2px;"></div>${s.code} · ${s.date}</div>`;
  });

  // ── ZONE HEATMAP ──
  const zoneDwell = {};
  ZONES.forEach(z => { zoneDwell[z.id] = {dwell:0, count:0, flags:0}; });
  evs.forEach(e => {
    if (e.zoneId && zoneDwell[e.zoneId]) {
      zoneDwell[e.zoneId].dwell += e.duration;
      zoneDwell[e.zoneId].count++;
    }
  });
  mks.forEach(m => { if (m.zoneId && zoneDwell[m.zoneId]) zoneDwell[m.zoneId].flags++; });
  const maxDwell = Math.max(...Object.values(zoneDwell).map(z=>z.dwell), 1);
  const maxFlags = Math.max(...Object.values(zoneDwell).map(z=>z.flags), 1);

  const heatZones = document.getElementById("heatZones");
  const heatFlags = document.getElementById("heatFlags");
  heatZones.innerHTML = "";
  heatFlags.innerHTML = "";
  ZONES.forEach((zone, idx) => {
    const pts = zone.points;
    if (!pts||pts.length<2) return;
    const d = zoneDwell[zone.id]||{dwell:0,count:0,flags:0};
    const intensity = d.dwell/maxDwell;
    const baseColor = zone.color;
    const poly = document.createElementNS("http://www.w3.org/2000/svg","polygon");
    poly.setAttribute("points", pts.map(p=>`${p.x},${p.y}`).join(" "));
    const alpha = intensity > 0 ? Math.round(30 + intensity*180) : 15;
    poly.setAttribute("fill", baseColor + alpha.toString(16).padStart(2,"0"));
    poly.setAttribute("stroke", baseColor);
    poly.setAttribute("stroke-width", "2");
    poly.style.cursor = "pointer";
    const c = polygonCentroid(pts);
    poly.addEventListener("mouseenter", e => showTip(e,
      `<b>${zone.name}</b><br>Dwell: ${fmtDuration(d.dwell)}<br>Taps: ${d.count}<br>Flags: ${d.flags}`));
    poly.addEventListener("mousemove", moveTip);
    poly.addEventListener("mouseleave", hideTip);
    heatZones.appendChild(poly);

    // Zone label if dwell > 0
    if (d.count > 0) {
      const t = document.createElementNS("http://www.w3.org/2000/svg","text");
      t.setAttribute("x", c.x); t.setAttribute("y", c.y+3);
      t.setAttribute("text-anchor","middle"); t.setAttribute("font-size","9");
      t.setAttribute("font-weight","700"); t.setAttribute("font-family","DM Mono,monospace");
      t.setAttribute("fill", baseColor); t.setAttribute("pointer-events","none");
      t.textContent = fmtDuration(d.dwell);
      heatZones.appendChild(t);
    }

    // Flag rings
    if (d.flags > 0) {
      const r = 8 + (d.flags/maxFlags)*20;
      const circle = document.createElementNS("http://www.w3.org/2000/svg","circle");
      circle.setAttribute("cx",c.x); circle.setAttribute("cy",c.y);
      circle.setAttribute("r",r); circle.setAttribute("fill","none");
      circle.setAttribute("stroke","#B45309"); circle.setAttribute("stroke-width","2.5");
      circle.setAttribute("stroke-dasharray","4,3"); circle.setAttribute("opacity","0.7");
      heatFlags.appendChild(circle);
    }
  });

  // ── ACTIVITY CHART ──
  const actCounts = {};
  evs.forEach(e => e.activities.forEach(a => { actCounts[a] = (actCounts[a]||0)+1; }));
  const actData = Object.entries(actCounts).map(([id,count])=>{id,count}).sort((a,b)=>b.count-a.count);
  barChart(document.getElementById("activityChart"), actData,
    ()=>"#2563EB", d=>(ACTIVITY_LABELS[d.id]||d.id), d=>d.count);

  // ── POSTURE CHART ──
  const postCounts = {};
  evs.forEach(e => e.postures.forEach(p => { postCounts[p] = (postCounts[p]||0)+1; }));
  const postData = Object.entries(postCounts).map(([id,count])=>{id,count}).sort((a,b)=>b.count-a.count);
  barChart(document.getElementById("postureChart"), postData,
    ()=>"#7C3AED", d=>(POSTURE_LABELS[d.id]||d.id), d=>d.count);

  // ── ENV TYPE CHART ──
  const envCounts = {};
  mks.forEach(m => { envCounts[m.category] = (envCounts[m.category]||0)+1; });
  const envData = Object.entries(envCounts).map(([id,count])=>{id,count}).sort((a,b)=>b.count-a.count);
  barChart(document.getElementById("envTypeChart"), envData,
    ()=>"#B45309", d=>(ENV_LABELS[d.id]||d.id), d=>d.count);

  // ── ENV ZONE CHART ──
  const envZoneCounts = {};
  mks.forEach(m => { if(m.zoneId) envZoneCounts[m.zoneId]=(envZoneCounts[m.zoneId]||0)+1; });
  const envZoneData = Object.entries(envZoneCounts)
    .map(([id,count])=>{id,count,zone:zoneById(id)})
    .filter(d=>d.zone).sort((a,b)=>b.count-a.count).slice(0,10);
  barChart(document.getElementById("envZoneChart"), envZoneData,
    d=>d.zone.color, d=>d.zone.name, d=>d.count);

  // ── CO-OCCURRENCE: activities during env flags ──
  // For each event that has a marker linked (same zone, close in time), count activities
  const coAct = {};
  mks.forEach(m => {
    const concurrent = evs.filter(e => e.zoneId===m.zoneId && e.activities.length);
    concurrent.forEach(e => e.activities.forEach(a => { coAct[a]=(coAct[a]||0)+1; }));
  });
  const coData = Object.entries(coAct).map(([id,count])=>{id,count}).sort((a,b)=>b.count-a.count);
  barChart(document.getElementById("cooccChart"), coData,
    ()=>"#DB2777", d=>(ACTIVITY_LABELS[d.id]||d.id), d=>d.count);

  // ── SPATIAL PRESSURE INDEX: flags per minute of dwell ──
  const pressureData = ZONES.map(z => {
    const d = zoneDwell[z.id]||{dwell:0,flags:0};
    const mins = d.dwell/60;
    const pressure = mins > 0 ? d.flags/mins : 0;
    return {zone:z, pressure, dwell:d.dwell, flags:d.flags};
  }).filter(d=>d.dwell>0&&d.flags>0).sort((a,b)=>b.pressure-a.pressure).slice(0,10);
  barChart(document.getElementById("pressureChart"), pressureData,
    d=>d.zone.color, d=>d.zone.name, d=>d.pressure);

  // ── ZONE DETAIL TABLE ──
  const tbody = document.getElementById("zoneTableBody");
  const rows = ZONES.map(zone => {
    const evZone = evs.filter(e=>e.zoneId===zone.id);
    if (!evZone.length) return null;
    const dwell = evZone.reduce((s,e)=>s+e.duration,0);
    const pct = totalDur>0 ? Math.round(dwell/totalDur*100) : 0;
    const flags = mks.filter(m=>m.zoneId===zone.id).length;
    const mins = dwell/60;
    const pressure = mins>0&&flags>0 ? (flags/mins).toFixed(2) : "—";
    const actCnt = {}; evZone.forEach(e=>e.activities.forEach(a=>{actCnt[a]=(actCnt[a]||0)+1}));
    const topAct = Object.entries(actCnt).sort((a,b)=>b[1]-a[1])[0];
    const postCnt = {}; evZone.forEach(e=>e.postures.forEach(p=>{postCnt[p]=(postCnt[p]||0)+1}));
    const topPost = Object.entries(postCnt).sort((a,b)=>b[1]-a[1])[0];
    return {zone, evCount:evZone.length, dwell, pct, flags, pressure, topAct, topPost};
  }).filter(Boolean).sort((a,b)=>b.dwell-a.dwell);

  tbody.innerHTML = rows.map(r => `<tr>
    <td><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${r.zone.color};margin-right:6px;"></span>${r.zone.name}</td>
    <td>${r.evCount}</td>
    <td>${fmtDuration(r.dwell)}</td>
    <td><div style="display:flex;align-items:center;gap:6px;"><div style="width:${r.pct}px;max-width:80px;height:6px;background:${r.zone.color};border-radius:99px;"></div>${r.pct}%</div></td>
    <td>${r.flags}</td>
    <td style="font-family:'DM Mono',monospace;color:${r.pressure!=='—'&&parseFloat(r.pressure)>1?'#DC2626':'#475569'}">${r.pressure}</td>
    <td>${r.topAct?ACTIVITY_LABELS[r.topAct[0]]||r.topAct[0]:'—'}</td>
    <td>${r.topPost?POSTURE_LABELS[r.topPost[0]]||r.topPost[0]:'—'}</td>
  </tr>`).join("");
}

function toggleSession(id) {
  if (selected.has(id)) { if (selected.size > 1) selected.delete(id); }
  else selected.add(id);
  render();
}

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({behavior:"smooth"});
  document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
  event.target.classList.add("active");
}
</script>

<style>
@media print {
  .sidebar { display: none; }
  .shell { grid-template-columns: 1fr; }
  .main { padding: 10mm; }
  .section { page-break-inside: avoid; margin-bottom: 20mm; }
}
</style>
</body>
</html>
