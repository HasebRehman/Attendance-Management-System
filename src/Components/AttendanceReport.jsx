import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { useContext } from 'react';
import LoginContext from '../Contexts/LoginContext';
import ProfileImage from './ProfileImage';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  Chip,
  Button,
} from "@mui/material";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';

/* ── Keyframes injected once ── */
const STYLES = `
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes rowIn {
    from { opacity: 0; transform: translateX(-10px); }
    to   { opacity: 1; transform: translateX(0);     }
  }
  .ar-header-anim { animation: fadeSlideUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
  .ar-table-anim  { animation: fadeSlideUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.08s both; }
  .ar-empty-anim  { animation: fadeIn 0.4s ease 0.1s both; }
`;
if (typeof document !== "undefined" && !document.getElementById("ar-styles")) {
  const tag = document.createElement("style");
  tag.id = "ar-styles";
  tag.textContent = STYLES;
  document.head.appendChild(tag);
}

const SIDEBAR_W = 240;

const TODAY_LABEL = new Date().toLocaleDateString("en-US", {
  weekday: "long", year: "numeric", month: "long", day: "numeric",
});

/* ── Cell value styles ── */
const getCellMeta = (val) => {
  if (val === "P") return { color: "#047857", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.25)", fw: 800 };
  if (val === "A") return { color: "#b91c1c", bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.25)",  fw: 800 };
  if (val === "-") return { color: "#b45309", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)",  fw: 700 };
  return { color: "#94a3b8", bg: "transparent", border: "transparent", fw: 400 };
};

const AttendanceReport = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const currentMonth = new Date().toISOString().slice(0, 7);

  const [attendanceMonth, setAttendanceMonth]           = useState(currentMonth);
  const [attendanceDatesAndDays, setAttendanceDatesAndDays] = useState([]);
  const [attendanceReport, setAttendanceReport]         = useState([]);
  const [animKey, setAnimKey]                           = useState(0);
  const [loading, setLoading]                           = useState(false);

  const navigate = useNavigate();

  const getAttendanceReport = async (year, monthNumber) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/attendance/report?count=100&pageNo=1&year=${year}&month=${monthNumber}`,
        { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('Token')}` } }
      );
      const result = await res.json();
      
      setAttendanceReport(result.data || []);
      setAnimKey(k => k + 1);
    } catch (e) {
      console.error(e);
      setAttendanceReport([]);
    } finally { setLoading(false); }
  };

  const getMonthDates = (year, month) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const lastDay = new Date(year, month + 1, 0).getDate();
    const dates = [];
    for (let i = 1; i <= lastDay; i++) {
      const d = new Date(year, month, i);
      dates.push({ dayName: days[d.getDay()], date: i, isWeekend: d.getDay() === 0 || d.getDay() === 6 });
    }
    setAttendanceDatesAndDays(dates);
  };

  useEffect(() => {
    if (!attendanceMonth) return;
    const [year, monthNumber] = attendanceMonth.split('-').map(Number);
    getAttendanceReport(year, monthNumber);
    getMonthDates(year, monthNumber - 1);
  }, [attendanceMonth]);

  const DownloadReport = () => {
    if (!attendanceReport?.length) { toast.error('No attendance data found to download'); return; }

    const headerRow = ['SN', 'Employee', 'Position', ...attendanceDatesAndDays.map(d => `${d.dayName} ${d.date}`)];
    const dataRows = attendanceReport.map((emp, i) => {
      const cols = attendanceDatesAndDays.map(dayItem => {
        const rec = emp.attendance?.find(a => new Date(a.createdAt).getDate() === dayItem.date);
        if (!rec) return 'N/A';
        if (rec.status === 'absent')  return 'A';
        if (rec.status === 'holiday') return '-';
        return 'P';
      });
      return [i + 1, emp.fullName, emp.position, ...cols];
    });

    const ws = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows]);
    const wb = XLSX.utils.book_new();
    ws['!cols'] = [{ wch: 5 }, { wch: 20 }, { wch: 18 }, ...attendanceDatesAndDays.map(() => ({ wch: 7 }))];
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance Report');
    XLSX.writeFile(wb, `Attendance_Report_${attendanceMonth}.xlsx`);
    toast.success('Report downloaded successfully!');
  };

  /* Compute summary counts per employee row */
  const getSummary = (emp) => {
    let p = 0, a = 0, h = 0;
    attendanceDatesAndDays.forEach(dayItem => {
      const rec = emp.attendance?.find(r => new Date(r.createdAt).getDate() === dayItem.date);
      if (!rec) return;
      if (rec.status === 'absent')  a++;
      else if (rec.status === 'holiday') h++;
      else p++;
    });
    return { p, a, h };
  };

  const { userData, setUserData } = useContext(LoginContext);

  const userLogout = () => {
    localStorage.removeItem("Token");
    setUserData(null);
    navigate("/login");
  };

  return (
    <Box className="min-h-screen" sx={{ background: "linear-gradient(135deg,#f8faff 0%,#eef2ff 50%,#f0fdf4 100%)" }}>

      {/* ── TOPBAR ── */}
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
          <ProfileImage />

        </Toolbar>
      </AppBar>

      {/* ── MAIN ── */}
      <Box component="main" sx={{ pt: "32px", minHeight: "100vh" }}>
        <Box sx={{ px: { xs: 2, md: 4 }, py: 3, display: "flex", flexDirection: "column", gap: 3 }}>

          {/* ── Page header ── */}
          <Paper elevation={0} className="ar-header-anim" sx={{
            borderRadius: "20px", border: "1px solid rgba(255,255,255,0.85)",
            bgcolor: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)",
            px: 4, py: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 3,
          }}>
            <Box>
              <Typography sx={{ fontWeight: 900, fontSize: "2.4rem", color: "#0f172a", letterSpacing: "-0.03em", lineHeight: 1 }}>
                Attendance Report
              </Typography>
              <Typography sx={{ fontSize: "0.82rem", color: "#64748b", fontWeight: 500, mt: 0.8 }}>
                {TODAY_LABEL}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>

                {/* Download button */}
              <Button
                onClick={DownloadReport}
                variant="contained"
                startIcon={<DownloadRoundedIcon sx={{ fontSize: "17px !important" }} />}
                sx={{
                  background: "linear-gradient(110deg,#0f0c29,#1a1340 60%,#24243e)",
                  borderRadius: "12px", fontWeight: 700, fontSize: "0.82rem",
                  px: 2.5, py: 1.4, textTransform: "none",
                  boxShadow: "0 4px 14px rgba(15,12,41,0.35)",
                  transition: "all 0.22s ease",
                  "&:hover": { boxShadow: "0 6px 20px rgba(15,12,41,0.45)", transform: "translateY(-1px)" },
                  "&:active": { transform: "scale(0.97)" },
                }}
              >
                Download XLSX
              </Button>


              {/* Month picker */}
              <Box sx={{
                display: "flex", alignItems: "center", gap: "10px",
                bgcolor: "rgba(99,102,241,0.06)", border: "1.5px solid rgba(99,102,241,0.2)",
                borderRadius: "14px", px: 2, py: 1.5,
              }}>
                <Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CalendarMonthRoundedIcon sx={{ color: "#6366f1", fontSize: 18 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "1.1px" }}>
                    Month
                  </Typography>
                  <input
                    type="month"
                    value={attendanceMonth}
                    onChange={e => setAttendanceMonth(e.target.value)}
                    style={{
                      background: "transparent", border: "none", outline: "none",
                      fontSize: "0.85rem", fontWeight: 700, color: "#0f172a", cursor: "pointer", padding: 0,
                    }}
                  />
                </Box>
              </Box>

            </Box>
          </Paper>

          {/* ── Legend ── */}
          <Box className="ar-header-anim" sx={{ marginBottom: '15px', display: "flex", gap: 2, flexWrap: "wrap", animationDelay: "0.05s" }}>
            {[
              { label: "Present", val: "P", ...getCellMeta("P") },
              { label: "Absent",  val: "A", ...getCellMeta("A") },
              { label: "Holiday", val: "–", ...getCellMeta("-") },
              { label: "No Record", val: "N/A", ...getCellMeta("N/A") },
            ].map(item => (
              <Box key={item.label} sx={{
                display: "flex", alignItems: "center", gap: "7px",
                px: "12px", py: "7px", borderRadius: "10px",
                bgcolor: item.bg || "rgba(148,163,184,0.08)",
                border: `1px solid ${item.border || "rgba(148,163,184,0.2)"}`,
              }}>
                <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: item.color }}>{item.val}</Typography>
                <Typography sx={{ fontSize: "0.72rem", fontWeight: 500, color: "#64748b" }}>{item.label}</Typography>
              </Box>
            ))}
          </Box>

          {/* ── Table card ── */}
          <Paper elevation={0} className="ar-table-anim" sx={{
            borderRadius: "20px", border: "1px solid rgba(255,255,255,0.85)",
            bgcolor: "rgba(255,255,255,0.75)", backdropFilter: "blur(12px)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
            overflow: "hidden",
          }}>
            <Box sx={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              <Box sx={{ minWidth: "max-content" }}>

                {/* ── Sticky header ── */}
                <Box sx={{
                  padding: '10px 5px 5px',
                  display: "grid",
                  gridTemplateColumns: `44px 200px 130px repeat(${attendanceDatesAndDays.length}, 46px)`,
                  background: "linear-gradient(110deg,#0f0c29,#1a1340 55%,#24243e)",
                  px: 1, position: "sticky", top: 0, zIndex: 10,
                }}>
                  {/* Fixed cols */}
                  {["#", "Employee", "Position"].map((h, i) => (
                    <Box key={h} sx={{ px: "10px", py: "13px", display: "flex", alignItems: "center" }}>
                      <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: "white", textTransform: "uppercase", letterSpacing: "1.1px", whiteSpace: "nowrap" }}>
                        {h}
                      </Typography>
                    </Box>
                  ))}
                  {/* Date cols */}
                  {attendanceDatesAndDays.map((d, i) => (
                    <Box key={i} sx={{
                      py: "8px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      bgcolor: d.isWeekend ? "rgba(239,68,68,0.15)" : "transparent",
                    }}>
                      <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: d.isWeekend ? "#fca5a5" : "white", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        {d.dayName}
                      </Typography>
                      <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: d.isWeekend ? "#fca5a5" : "white" }}>
                        {d.date}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* ── Rows ── */}
                <Box key={animKey}>
                  {loading ? (
                    <Box className="ar-empty-anim" sx={{ py: 8, display: "flex", justifyContent: "center" }}>
                      <Typography sx={{ color: "#94a3b8", fontWeight: 600, fontSize: "0.875rem" }}>Loading…</Typography>
                    </Box>
                  ) : attendanceReport.length > 0 ? (
                    attendanceReport.map((emp, idx) => {
                      const summary = getSummary(emp);
                      return (
                        <Box
                          key={idx}
                          sx={{
                            display: "grid",
                            gridTemplateColumns: `44px 200px 130px repeat(${attendanceDatesAndDays.length}, 46px)`,
                            px: 1,
                            borderBottom: idx < attendanceReport.length - 1 ? "1px solid #f1f5f9" : "none",
                            transition: "background 0.15s ease",
                            "&:hover": { bgcolor: "rgba(99,102,241,0.025)" },
                            animation: `rowIn 0.36s cubic-bezier(0.22,1,0.36,1) ${idx * 38}ms both`,
                          }}
                        >
                          {/* # */}
                          <Box sx={{ px: "10px", py: "12px", display: "flex", alignItems: "center" }}>
                            <Typography sx={{ fontSize: "0.72rem", color: "black", fontWeight: 600 }}>{idx + 1}</Typography>
                          </Box>

                          {/* Name */}
                          <Box sx={{ px: "10px", py: "12px", display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {emp.fullName}
                              </Typography>
                              <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mt: "2px" }}>
                                <Typography sx={{ fontSize: "0.62rem", color: "#10b981", fontWeight: 700 }}>P:{summary.p}</Typography>
                                <Typography sx={{ fontSize: "0.62rem", color: "#ef4444", fontWeight: 700 }}>A:{summary.a}</Typography>
                                {summary.h > 0 && <Typography sx={{ fontSize: "0.62rem", color: "#f59e0b", fontWeight: 700 }}>H:{summary.h}</Typography>}
                              </Box>
                            </Box>
                          </Box>

                          {/* Position */}
                          <Box sx={{ px: "10px", py: "12px", display: "flex", alignItems: "center", minWidth: 0 }}>
                            <Typography sx={{ fontSize: "0.76rem", color: "#475569", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {emp.position || "—"}
                            </Typography>
                          </Box>

                          {/* Date cells */}
                          {attendanceDatesAndDays.map((dayItem, di) => {
                            const rec = emp.attendance?.find(a => new Date(a.createdAt).getDate() === dayItem.date);
                            let val = "N/A";
                            if (rec) {
                              if (rec.status === "absent")  val = "A";
                              else if (rec.status === "holiday") val = "–";
                              else val = "P";
                            }
                            const meta = getCellMeta(val === "–" ? "-" : val);
                            return (
                              <Box key={di} sx={{
                                display: "flex", alignItems: "center", justifyContent: "center",
                                bgcolor: dayItem.isWeekend ? "rgba(239,68,68,0.03)" : "transparent",
                                borderLeft: "1px solid #f8fafc",
                              }}>
                                {val !== "N/A" ? (
                                  <Box sx={{
                                    width: 26, height: 26, borderRadius: "7px",
                                    bgcolor: meta.bg, border: `1px solid ${meta.border}`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                  }}>
                                    <Typography sx={{ fontSize: "0.68rem", fontWeight: meta.fw, color: meta.color }}>
                                      {val}
                                    </Typography>
                                  </Box>
                                ) : (
                                  <Typography sx={{ fontSize: "0.62rem", color: "#e2e8f0" }}>·</Typography>
                                )}
                              </Box>
                            );
                          })}
                        </Box>
                      );
                    })
                  ) : (
                    <Box className="ar-empty-anim" sx={{ py: 9, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                      <Box sx={{ width: 64, height: 64, borderRadius: "18px", bgcolor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <AssessmentRoundedIcon sx={{ fontSize: 28, color: "#cbd5e1" }} />
                      </Box>
                      <Typography sx={{ color: "#94a3b8", fontWeight: 600, fontSize: "0.9rem" }}>
                        No report data for this month
                      </Typography>
                    </Box>
                  )}
                </Box>

              </Box>
            </Box>

            {/* Footer */}
            {attendanceReport.length > 0 && (
              <Box sx={{
                px: 3, py: "11px", borderTop: "1px solid #f1f5f9",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                bgcolor: "rgba(248,250,252,0.8)",
              }}>
                <Typography sx={{ fontSize: "0.76rem", color: "#94a3b8", fontWeight: 500 }}>
                  Showing{" "}
                  <span style={{ color: "#0f172a", fontWeight: 700 }}>{attendanceReport.length}</span>
                  {" "}employees ·{" "}
                  <span style={{ color: "#6366f1", fontWeight: 700 }}>{attendanceDatesAndDays.length} days</span>
                  {" "}in{" "}
                  <span style={{ color: "#7c3aed", fontWeight: 700 }}>{attendanceMonth}</span>
                </Typography>
                <Button
                  onClick={DownloadReport}
                  size="small"
                  startIcon={<DownloadRoundedIcon sx={{ fontSize: "14px !important" }} />}
                  sx={{
                    color: "#6366f1", border: "1px solid rgba(99,102,241,0.25)",
                    borderRadius: "8px", fontWeight: 600, fontSize: "0.74rem",
                    px: 1.5, py: 0.6, textTransform: "none",
                    "&:hover": { bgcolor: "rgba(99,102,241,0.06)", borderColor: "rgba(99,102,241,0.5)" },
                  }}
                >
                  Export XLSX
                </Button>
              </Box>
            )}
          </Paper>

        </Box>
      </Box>
    </Box>
  );
};

export default AttendanceReport;