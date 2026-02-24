import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import LoginContext from "../Contexts/LoginContext";
import {
  AppBar, Toolbar, Chip, Button, Typography, Paper, Box,
} from "@mui/material";
import LogoutRoundedIcon          from "@mui/icons-material/LogoutRounded";
import DownloadRoundedIcon        from "@mui/icons-material/DownloadRounded";
import CalendarMonthRoundedIcon   from "@mui/icons-material/CalendarMonthRounded";
import CheckCircleOutlineRounded  from "@mui/icons-material/CheckCircleOutlineRounded";
import AccessAlarmRoundedIcon     from "@mui/icons-material/AccessAlarmRounded";
import SnoozeRoundedIcon          from "@mui/icons-material/SnoozeRounded";
import BeachAccessRoundedIcon     from "@mui/icons-material/BeachAccessRounded";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";

/* ── Inject keyframes once ── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&display=swap');
  @keyframes fadeSlideUp {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0);    }
  }
  @keyframes rowIn {
    from { opacity:0; transform:translateX(-10px); }
    to   { opacity:1; transform:translateX(0);     }
  }
  @keyframes cellPop {
    0%   { transform:scale(.7); opacity:0; }
    70%  { transform:scale(1.15); }
    100% { transform:scale(1); opacity:1; }
  }
  @keyframes shimmer {
    0%   { background-position:-200% 0; }
    100% { background-position: 200% 0; }
  }
  .hist-header-anim { animation: fadeSlideUp .5s cubic-bezier(.22,1,.36,1) both; }
  .hist-stats-anim  { animation: fadeSlideUp .5s cubic-bezier(.22,1,.36,1) .06s both; }
  .hist-table-anim  { animation: fadeSlideUp .55s cubic-bezier(.22,1,.36,1) .12s both; }
  .cell-pop { animation: cellPop .3s cubic-bezier(.34,1.56,.64,1) both; }

  /* calendar cell */
  .day-cell {
    width: 32px; height: 32px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: .72rem; font-weight: 800;
    transition: transform .15s ease;
    flex-shrink: 0;
    cursor: default;
  }
  .day-cell:hover { transform: scale(1.12); }
  .day-present  { background: rgba(34,197,94,.14);  color: #15803d; border: 1px solid rgba(34,197,94,.3);  }
  .day-absent   { background: rgba(239,68,68,.12);  color: #b91c1c; border: 1px solid rgba(239,68,68,.28); }
  .day-empty    { background: rgba(0,0,0,.03);       color: #d1d5db; border: 1px dashed #e5e7eb; }
  .day-header   { background: linear-gradient(110deg,#0f0c29,#1a1340,#24243e); color: white; font-size: .65rem; letter-spacing: .5px; }

  /* skeleton */
  .skeleton {
    background: linear-gradient(90deg, rgba(0,0,0,.04) 0%, rgba(0,0,0,.09) 50%, rgba(0,0,0,.04) 100%);
    background-size: 200% 100%;
    animation: shimmer 1.4s ease infinite;
    border-radius: 8px;
  }
`;

if (typeof document !== "undefined" && !document.getElementById("hist-styles")) {
  const s = document.createElement("style");
  s.id = "hist-styles";
  s.textContent = STYLES;
  document.head.appendChild(s);
}

const SIDEBAR_W = 240;
const MONTHS    = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WEEKDAYS  = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

const todayLabel = new Date().toLocaleDateString("en-US", {
  weekday:"long", year:"numeric", month:"long", day:"numeric",
});

/* ── Stat card ── */
const StatCard = ({ icon, label, value, color, border, bg, delay }) => (
  <Box sx={{
    display:"flex", alignItems:"center", gap:"12px",
    bgcolor: bg, border:`1.5px solid ${border}`,
    borderRadius:"14px", px:"18px", py:"14px",
    animation:`fadeSlideUp .5s cubic-bezier(.22,1,.36,1) ${delay} both`,
    transition:"transform .2s ease, box-shadow .2s ease",
    "&:hover":{ transform:"translateY(-2px)", boxShadow:`0 8px 24px ${border}` },
  }}>
    <Box sx={{ width:40, height:40, borderRadius:"10px", bgcolor:`${color}18`, display:"flex", alignItems:"center", justifyContent:"center", color, flexShrink:0 }}>
      {icon}
    </Box>
    <Box>
      <Typography sx={{ fontSize:".65rem", fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:"1px" }}>{label}</Typography>
      <Typography sx={{ fontSize:"1.5rem", fontWeight:900, color, lineHeight:1, fontFamily: "'DM Sans', sans-serif" }}>
        {value ?? <Box className="skeleton" sx={{ width:32, height:24 }} />}
      </Typography>
    </Box>
  </Box>
);

const History = () => {
  const { userData } = useContext(LoginContext);
  const navigate     = useNavigate();
  const API_URL      = import.meta.env.VITE_API_URL;

  const [year,    setYear]    = useState(new Date().getFullYear());
  const [month,   setMonth]   = useState(null);  // 1-based
  const [details, setDetails] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  /* ── Fetch ── */
  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res    = await fetch(`${API_URL}/attendance/employeeAttendanceByYear?year=${year}`, {
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${localStorage.getItem("Token")}` },
      });
      const result = await res.json();
      console.log(result?.data);
      
      if (!result.isSuccess) {
        toast.error(result.message || "No attendance found");
        setDetails(null); setRecords([]); setMonth(null);
        return;
      } else {
        const monthly = result?.data?.monthlyAttendance?.[0];
        setMonth(monthly?.month || null);
        setRecords(monthly?.records || []);
        setDetails(result?.data || null);
        setAnimKey((k) => k + 1);
      }
      
    } catch { toast.error("Failed to fetch attendance"); }
    finally   { setLoading(false); }
  };

  useEffect(() => { fetchAttendance(); }, [year]);

  /* ── Build calendar grid ── */
  const totalDays    = month ? new Date(year, month, 0).getDate() : 31;
  const firstWeekday = month ? new Date(year, month - 1, 1).getDay() : 0; // 0=Sun

  const getStatus = (day) => {
    const rec = records.find((a) => new Date(a.createdAt).getDate() === day);
    if (!rec) return null;
    return rec.status === "absent" ? "A" : "P";
  };

  /* ── Download ── */
  const downloadExcel = () => {
    if (!records.length) { toast.error("No attendance data"); return; }
    const data = records.map((r) => ({
      Date:   new Date(r.createdAt).toLocaleDateString(),
      Status: r.status === "absent" ? "Absent" : "Present",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    saveAs(new Blob([XLSX.write(wb, { bookType:"xlsx", type:"array" })]), `attendance-${MONTHS[month-1]}-${year}.xlsx`);
    toast.success("Report downloaded!");
  };

  const userLogout = () => { localStorage.removeItem("Token"); navigate("/login"); };

  const currentMonthName = month ? MONTHS[month - 1] : "—";
  const yearOptions      = [2022, 2023, 2024, 2025, 2026];

  /* ── Calendar cells ── */
  const calendarCells = [];
  // leading empty cells
  for (let i = 0; i < firstWeekday; i++) calendarCells.push({ type:"pad", i });
  for (let d = 1; d <= totalDays; d++) {
    const status = getStatus(d);
    calendarCells.push({ type:"day", day:d, status });
  }

  return (
    <Box className="min-h-screen" sx={{ background:"linear-gradient(135deg,#f0f4ff 0%,#e8f0fe 50%,#ede9fe 100%)" }}>

      {/* ── TOP BAR ── */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          left: { xs: 0, md: `${SIDEBAR_W}px` },
          width: { xs: "100%", md: `calc(100% - ${SIDEBAR_W}px)` },
          background: "linear-gradient(110deg, #0f0c29 0%, #1a1340 55%, #24243e 100%)",
          boxShadow: "0 3px 24px rgba(0,0,0,0.3)",
          zIndex: 1200,
        }}
      >
        <Toolbar className="flex items-center gap-4 px-8" sx={{ minHeight: "64px !important" }}>

          <Box className="flex flex-col leading-none">
            <span className="text-[0.6rem] font-medium tracking-[2px] uppercase text-white/35 mb-1">
              Welcome back
            </span>
            <span className="text-[1rem] font-bold text-[#e2d9fc]">
              {userData?.fullName ?? "Employee"}
            </span>
          </Box>

          <Box className="flex-1" />

          <Chip
            label={userData?.role === 'admin' ? "Admin" : "Employee"}
            size="small"
            sx={{
              background: "rgba(167,139,250,0.14)",
              border: "1px solid rgba(167,139,250,0.28)",
              color: "#a78bfa",
              fontWeight: 700,
              fontSize: "0.65rem",
              letterSpacing: "1.3px",
              textTransform: "uppercase",
            }}
          />

          <Button
            onClick={userLogout}
            startIcon={<LogoutRoundedIcon sx={{ fontSize: "17px !important", transition: "transform 0.25s ease" }} />}
            size="small"
            sx={{
              color: "#fca5a5",
              border: "1.5px solid rgba(251,113,133,0.35)",
              background: "rgba(239,68,68,0.1)",
              borderRadius: "10px",
              fontWeight: 600,
              fontSize: "0.82rem",
              px: 2,
              py: 1,
              textTransform: "none",
              transition: "all 0.25s ease",
              "&:hover": {
                color: "#fff",
                background: "rgba(239,68,68,0.22)",
                borderColor: "rgba(239,68,68,0.65)",
                boxShadow: "0 0 20px rgba(239,68,68,0.22)",
                transform: "translateY(-1px)",
                "& .MuiButton-startIcon svg": {
                  transform: "translateX(4px) rotate(-10deg)",
                },
              },
              "&:active": { transform: "scale(0.96)" },
            }}
          >
            Logout
          </Button>

        </Toolbar>
      </AppBar>

      {/* ── MAIN ── */}
      <Box component="main" sx={{ mt: '25px', pt:"20px", pb: '20px' }} className="min-h-screen">
        <Box sx={{ px:{ xs:3, lg:4 }, py:3, display:"flex", flexDirection:"column", gap:3, maxWidth:"1100px" }}>

          {/* ── Page header ── */}
          <Paper elevation={0} className="hist-header-anim" sx={{ p:"24px 32px", borderRadius:"16px", border:"1px solid rgba(255,255,255,.8)", backdropFilter:"blur(12px)", background:"rgba(255,255,255,.5)", boxShadow:"0 4px 16px rgba(0,0,0,.06)" }}>
            <Box sx={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:3, flexWrap:"wrap" }}>
              <Box>
                <Typography
                variant="h3"
                className="font-black text-gray-900 tracking-tight leading-none"
                sx={{ fontWeight:900, fontSize:"2.5rem", color:"#111827", lineHeight: '1'}}>
                  Attendance History
                </Typography>
                <Typography sx={{ color:"#6b7280", fontWeight:500, mt:.8, fontSize:".875rem" }}>{todayLabel}</Typography>
              </Box>

              {/* Year selector */}
              <Box sx={{ display:"flex", alignItems:"center", gap:"10px", bgcolor:"rgba(124,58,237,.06)", border:"1.5px solid rgba(124,58,237,.18)", borderRadius:"14px", px:"16px", py:"10px" }}>
                <CalendarMonthRoundedIcon sx={{ fontSize:20, color:"#7c3aed" }} />
                <Typography sx={{ fontSize:".72rem", fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:"1px" }}>Year</Typography>
                <Box sx={{ display:"flex", alignItems:"center", gap:"6px" }}>
                  <Box component="button" onClick={() => setYear((y) => Math.max(2022, y - 1))} sx={{ width:28, height:28, borderRadius:"8px", bgcolor:"rgba(124,58,237,.1)", border:"1px solid rgba(124,58,237,.2)", color:"#7c3aed", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all .18s", "&:hover":{ bgcolor:"rgba(124,58,237,.2)" } }}>
                    <ArrowBackIosNewRoundedIcon sx={{ fontSize:11 }} />
                  </Box>
                  <Typography sx={{ fontSize:"1rem", fontWeight:900, color:"#111827", minWidth:44, textAlign:"center", fontFamily: "'DM Sans', sans-serif" }}>{year}</Typography>
                  <Box component="button" onClick={() => setYear((y) => Math.min(2026, y + 1))} sx={{ width:28, height:28, borderRadius:"8px", bgcolor:"rgba(124,58,237,.1)", border:"1px solid rgba(124,58,237,.2)", color:"#7c3aed", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all .18s", "&:hover":{ bgcolor:"rgba(124,58,237,.2)" } }}>
                    <ArrowForwardIosRoundedIcon sx={{ fontSize:11 }} />
                  </Box>
                </Box>
                {/* or dropdown */}
                <Box component="select" value={year} onChange={(e) => setYear(Number(e.target.value))}
                  sx={{ bgcolor:"transparent", border:"none", outline:"none", color:"#7c3aed", fontWeight:700, fontSize:".8rem", cursor:"pointer", display:{ xs:"block", sm:"none" } }}>
                  {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* ── Stat cards ── */}
          <Box className="hist-stats-anim" sx={{ display:"grid", gridTemplateColumns:{ xs:"1fr 1fr", md:"repeat(4,1fr)" }, gap:2 }}>
            <StatCard icon={<CheckCircleOutlineRounded  sx={{ fontSize:20 }} />} label="Present Days" value={details?.totalPresentDays} color="#10b981" border="rgba(16,185,129,.2)"  bg="rgba(16,185,129,.06)"  delay="0ms"   />
            <StatCard icon={<AccessAlarmRoundedIcon     sx={{ fontSize:20 }} />} label="On-Time Days" value={details?.totalOnTimeDays}  color="#6366f1" border="rgba(99,102,241,.2)"  bg="rgba(99,102,241,.06)"  delay="60ms"  />
            <StatCard icon={<SnoozeRoundedIcon          sx={{ fontSize:20 }} />} label="Late Days"    value={details?.totalLateDays}    color="#f59e0b" border="rgba(245,158,11,.2)"  bg="rgba(245,158,11,.06)"  delay="120ms" />
            <StatCard icon={<BeachAccessRoundedIcon     sx={{ fontSize:20 }} />} label="Leave Days"   value={details?.totalLeaveDays}   color="#ef4444" border="rgba(239,68,68,.2)"   bg="rgba(239,68,68,.06)"   delay="180ms" />
          </Box>

          {/* ── Calendar card ── */}
          <Paper elevation={0} className="hist-table-anim" sx={{ marginTop: '40px', borderRadius:"20px", border:"1px solid rgba(255,255,255,.8)", background:"rgba(255,255,255,.72)", backdropFilter:"blur(16px)", boxShadow:"0 8px 32px rgba(0,0,0,.09)", overflow:"hidden" }}>

            {/* Card header */}
            <Box sx={{ background:"linear-gradient(110deg,#0f0c29 0%,#1a1340 55%,#24243e 100%)", px:4, py:"18px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:2 }}>
              <Box sx={{ display:"flex", alignItems:"center", gap:"10px" }}>
                <CalendarMonthRoundedIcon sx={{ fontSize:15, color:"#a78bfa" }} />
                <Typography sx={{ fontSize:".9rem", fontWeight:800, color:"white", textTransform:"uppercase", letterSpacing:"1.1px" }}>
                  {loading ? "Loading…" : `${currentMonthName} ${year}`}
                </Typography>
                {!loading && records.length > 0 && (
                  <Box sx={{ px:"8px", py:"2px", borderRadius:"999px", bgcolor:"rgba(167,139,250,.2)", border:"1px solid rgba(167,139,250,.3)" }}>
                    <Typography sx={{ fontSize:".62rem", fontWeight:800, color:"#a78bfa" }}>{records.length} records</Typography>
                  </Box>
                )}
              </Box>
              <Button onClick={downloadExcel} disabled={!records.length}
                startIcon={<DownloadRoundedIcon sx={{ fontSize:"16px !important" }} />}
                size="small"
                sx={{ color:"#a78bfa", border:"1px solid rgba(167,139,250,.3)", bgcolor:"rgba(167,139,250,.1)", borderRadius:"8px", fontWeight:700, fontSize:".72rem", px:2, py:.6, textTransform:"none", transition:"all .2s",
                  "&:hover":{ bgcolor:"rgba(167,139,250,.2)", borderColor:"rgba(167,139,250,.5)", boxShadow:"0 0 14px rgba(167,139,250,.3)" },
                  "&:disabled":{ opacity:.4 } }}>
                Download Report
              </Button>
            </Box>

            <Box sx={{ p:{ xs:3, md:4 } }} key={animKey}>

              {loading ? (
                /* Skeleton */
                <Box sx={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"8px" }}>
                  {Array.from({ length:35 }).map((_, i) => (
                    <Box key={i} className="skeleton" sx={{ height:32, borderRadius:"8px" }} />
                  ))}
                </Box>
              ) : !month ? (
                <Box sx={{ py:6, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                  <Box sx={{ width:64, height:64, borderRadius:"16px", bgcolor:"#f3f4f6", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <CalendarMonthRoundedIcon sx={{ fontSize:32, color:"#d1d5db" }} />
                  </Box>
                  <Typography sx={{ color:"#9ca3af", fontWeight:600, fontSize:".95rem" }}>No attendance data for {year}</Typography>
                </Box>
              ) : (
                <>
                  {/* Legend */}
                  <Box sx={{ display:"flex", gap:2, mb:3, flexWrap:"wrap" }}>
                    {[
                      { label:"Present", cls:"day-cell day-present", char:"P" },
                      { label:"Absent",  cls:"day-cell day-absent",  char:"A" },
                      { label:"No record", cls:"day-cell day-empty", char:"·" },
                    ].map((l) => (
                      <Box key={l.label} sx={{ display:"flex", alignItems:"center", gap:"6px" }}>
                        <Box className={l.cls} sx={{ width:24, height:24, fontSize:".6rem" }}>{l.char}</Box>
                        <Typography sx={{ fontSize:".72rem", color:"#6b7280", fontWeight:500 }}>{l.label}</Typography>
                      </Box>
                    ))}
                  </Box>

                  {/* Weekday headers */}
                  <Box sx={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"6px", mb:"6px" }}>
                    {WEEKDAYS.map((w) => (
                      <Box key={w} className="day-cell day-header" sx={{ width:"100%", height:28, borderRadius:"6px", fontSize:".62rem" }}>{w}</Box>
                    ))}
                  </Box>

                  {/* Calendar grid */}
                  <Box sx={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"6px" }}>
                    {calendarCells.map((cell, idx) => {
                      if (cell.type === "pad") return <Box key={`pad-${cell.i}`} />;
                      const cls = cell.status === "P" ? "day-cell day-present cell-pop"
                                : cell.status === "A" ? "day-cell day-absent cell-pop"
                                : "day-cell day-empty";
                      return (
                        <Box key={cell.day} sx={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"2px" }}>
                          <Typography sx={{ fontSize:".6rem", color:"#9ca3af", fontWeight:600, lineHeight:1 }}>{cell.day}</Typography>
                          <Box className={cls} style={{ animationDelay:`${idx * 8}ms` }} sx={{ width:"100%" }}>
                            {cell.status || "·"}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>

                  {/* Summary bar */}
                  <Box sx={{ mt:4, p:"14px 18px", borderRadius:"12px", bgcolor:"rgba(124,58,237,.04)", border:"1px solid rgba(124,58,237,.1)", display:"flex", gap:4, flexWrap:"wrap" }}>
                    {[
                      { label:"Present", count: records.filter((r) => r.status !== "absent").length, color:"#10b981" },
                      { label:"Absent",  count: records.filter((r) => r.status === "absent").length,  color:"#ef4444" },
                      { label:"Total days", count: totalDays, color:"#6366f1" },
                    ].map((s) => (
                      <Box key={s.label} sx={{ display:"flex", alignItems:"center", gap:"8px" }}>
                        <Box sx={{ width:8, height:8, borderRadius:"50%", bgcolor:s.color, boxShadow:`0 0 6px ${s.color}` }} />
                        <Typography sx={{ fontSize:".75rem", color:"#6b7280", fontWeight:500 }}>{s.label}:</Typography>
                        <Typography sx={{ fontSize:".85rem", fontWeight:800, color:s.color, fontFamily: "'DM Sans', sans-serif" }}>{s.count}</Typography>
                      </Box>
                    ))}
                  </Box>
                </>
              )}
            </Box>
          </Paper>

        </Box>
      </Box>
    </Box>
  );
};

export default History;