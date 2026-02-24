import React, { useEffect, useState } from "react";
import ProfileImage from "./ProfileImage";
import {
  Box,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  Chip,
  Button,
} from "@mui/material";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import ListAltRoundedIcon from "@mui/icons-material/ListAltRounded";
import LogoutRoundedIcon from "@mui/icons-material/ListAltRounded";
import { useContext } from "react";
import LoginContext from "../Contexts/LoginContext";

/* ── Keyframes injected once ── */
const STYLES = `
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes rowIn {
    from { opacity: 0; transform: translateX(-12px); }
    to   { opacity: 1; transform: translateX(0);     }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  .al-header-anim { animation: fadeSlideUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
  .al-table-anim  { animation: fadeSlideUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.08s both; }
  .al-empty-anim  { animation: fadeIn 0.4s ease 0.1s both; }
`;
if (typeof document !== "undefined" && !document.getElementById("al-styles")) {
  const tag = document.createElement("style");
  tag.id = "al-styles";
  tag.textContent = STYLES;
  document.head.appendChild(tag);
}

const SIDEBAR_W = 240;

const TODAY = new Date();
const TODAY_LABEL = TODAY.toLocaleDateString("en-US", {
  weekday: "long", year: "numeric", month: "long", day: "numeric",
});

/* ── Status badge config ── */
const STATUS_CONFIG = {
  "on time": { bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.35)", color: "#047857", dot: "#10b981" },
  "late":    { bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.35)",  color: "#b91c1c", dot: "#ef4444" },
  "absent":  { bg: "rgba(100,116,139,0.1)",border: "rgba(100,116,139,0.3)", color: "#475569", dot: "#94a3b8" },
  "leave":   { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.35)", color: "#b45309", dot: "#f59e0b" },
};

const StatusBadge = ({ status }) => {
  if (!status) return <Typography sx={{ fontSize: "0.75rem", color: "#cbd5e1" }}>—</Typography>;
  const key = status.toLowerCase();
  const cfg = STATUS_CONFIG[key] || { bg: "rgba(99,102,241,0.1)", border: "rgba(99,102,241,0.3)", color: "#4f46e5", dot: "#818cf8" };
  return (
    <Box sx={{
      display: "inline-flex", alignItems: "center", gap: "6px",
      px: "10px", py: "4px", borderRadius: "20px",
      bgcolor: cfg.bg, border: `1px solid ${cfg.border}`,
    }}>
      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: cfg.dot, flexShrink: 0 }} />
      <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: cfg.color, textTransform: "capitalize", whiteSpace: "nowrap" }}>
        {status}
      </Typography>
    </Box>
  );
};

/* ── Grid column definition ── */
const GRID = "44px 90px 1.2fr 1fr 1fr 110px 110px 120px 110px";
const HEADERS = ["#", "Emp ID", "Name", "Position", "Schedule", "Time In", "Time Out", "Hours", "Status"];

const AttendanceLog = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const currentDate = new Date().toISOString().slice(0, 10);

  const { userData } = useContext(LoginContext);

  const [attendanceDate, setAttendanceDate] = useState(currentDate);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [animKey, setAnimKey] = useState(0);
  const [loading, setLoading] = useState(false);

  const userLogout = () => {
    localStorage.removeItem("Token");
    navigate("/login");
  };

  const getAttendanceLogs = async (selectedDate) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/attendance/attendanceLog?count=100&pageNo=1&specificDate=${selectedDate}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("Token")}` } }
      );
      const result = await res.json();
      setAttendanceLogs(result.data || []);
      setAnimKey(k => k + 1);
    } catch { setAttendanceLogs([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!attendanceDate) return;
    getAttendanceLogs(attendanceDate);
  }, [attendanceDate]);

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
        <Box sx={{ px: { xs: 2, md: 4 }, py: 3, display: "flex", flexDirection: "column", gap: 5 }}>

          {/* ── Page header ── */}
          <Paper
            elevation={0}
            className="al-header-anim"
            sx={{
              borderRadius: "20px",
              border: "1px solid rgba(255,255,255,0.85)",
              bgcolor: "rgba(255,255,255,0.6)",
              backdropFilter: "blur(12px)",
              px: 4, py: 3,
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 3,
            }}
          >
            <Box>
              <Typography sx={{ fontWeight: 900, fontSize: "2.4rem", color: "#0f172a", letterSpacing: "-0.03em", lineHeight: 1 }}>
                Attendance Logs
              </Typography>
              <Typography sx={{ fontSize: "0.82rem", color: "#64748b", fontWeight: 500, mt: 0.8 }}>
                {TODAY_LABEL}
              </Typography>
            </Box>

            {/* Date picker */}
            <Box sx={{
              display: "flex", alignItems: "center", gap: "10px",
              bgcolor: "rgba(99,102,241,0.06)", border: "1.5px solid rgba(99,102,241,0.2)",
              borderRadius: "14px", px: 2, py: 1.5,
            }}>
              <Box sx={{
                width: 36, height: 36, borderRadius: "10px",
                bgcolor: "rgba(99,102,241,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <CalendarTodayRoundedIcon sx={{ color: "#6366f1", fontSize: 18 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "1.1px" }}>
                  Viewing Date
                </Typography>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={e => setAttendanceDate(e.target.value)}
                  style={{
                    background: "transparent", border: "none", outline: "none",
                    fontSize: "0.85rem", fontWeight: 700, color: "#0f172a",
                    cursor: "pointer", padding: 0,
                  }}
                />
              </Box>
            </Box>
      
          </Paper>

          <Paper
            elevation={0}
            className="al-table-anim"
            sx={{
              borderRadius: "20px",
              border: "1px solid rgba(255,255,255,0.85)",
              bgcolor: "rgba(255,255,255,0.75)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
              overflow: "hidden",
            }}
          >
            {/* Column headers */}
            <Box sx={{
              display: "grid",
              gridTemplateColumns: GRID,
              alignItems: "center",
              background: "linear-gradient(110deg,#0f0c29,#1a1340 55%,#24243e)",
              px: 2, py: "13px",
            }}>
              {HEADERS.map((h, i) => (
                <Box key={h} sx={{ p: '10px 0px 10px', px: "10px", display: "flex", alignItems: "center", justifyContent: i === 8 ? "center" : "flex-start" }}>
                  <Typography sx={{
                    fontSize: "0.70rem", fontWeight: 800, color: "white",
                    textTransform: "uppercase", letterSpacing: "1.1px", whiteSpace: "nowrap",
                  }}>
                    {h}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Rows */}
            <Box key={animKey}>
              {loading ? (
                <Box className="al-empty-anim" sx={{ py: 8, display: "flex", justifyContent: "center" }}>
                  <Typography sx={{ color: "#94a3b8", fontWeight: 600, fontSize: "0.875rem" }}>
                    Loading…
                  </Typography>
                </Box>
              ) : attendanceLogs.length > 0 ? (
                attendanceLogs.map((log, idx) => {
                  const rec    = log.attendanceRecords?.[0];
                  const status = rec?.status;


                  return (
                    <Box
                      key={idx}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: GRID,
                        alignItems: "center",
                        px: 2, py: "11px",
                        borderBottom: idx < attendanceLogs.length - 1 ? "1px solid #f1f5f9" : "none",
                        transition: "background 0.15s ease",
                        "&:hover": { bgcolor: "rgba(99,102,241,0.025)" },
                        animation: `rowIn 0.38s cubic-bezier(0.22,1,0.36,1) ${idx * 40}ms both`,
                        margin: '15px 5px 15px 5px',
                      }}
                    >
                      {/* # */}
                      <Box sx={{ px: "10px" }}>
                        <Typography sx={{ fontSize: "0.75rem", color: "black", fontWeight: 600 }}>
                          {idx + 1}
                        </Typography>
                      </Box>

                      {/* Emp ID */}
                      <Box sx={{ px: "10px" }}>
                        <Box sx={{
                          display: "inline-flex", alignItems: "center", gap: "4px",
                          bgcolor: "rgba(99,102,241,0.08)", borderRadius: "7px", px: "7px", py: "3px",
                        }}>
                          <BadgeRoundedIcon sx={{ fontSize: 11, color: "#6366f1" }} />
                          <Typography sx={{ fontSize: "0.67rem", fontWeight: 700, color: "#6366f1", whiteSpace: "nowrap" }}>
                            {log.employeeId || "—"}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Name */}
                      <Box sx={{ px: "10px", minWidth: 0 }}>
                        <Typography sx={{
                          fontSize: "0.85rem", fontWeight: 700, color: "#0f172a",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {log.fullName || "—"}
                        </Typography>
                      </Box>

                      {/* Position */}
                      <Box sx={{ px: "10px", minWidth: 0 }}>
                        <Typography sx={{
                          fontSize: "0.78rem", color: "#475569", fontWeight: 500,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {log.position || "—"}
                        </Typography>
                      </Box>

                      {/* Schedule */}
                      <Box sx={{ px: "10px", minWidth: 0 }}>
                        <Typography sx={{
                          fontSize: "0.78rem", color: "#475569", fontWeight: 500,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {log.scheduleId === null || !log.scheduleId? 'Custom Schedule' : log.scheduleDetails?.scheduleName}
                          {/* {log.scheduleDetails?.scheduleName || "-"} */}
                        </Typography>
                      </Box>

                      {/* Time In */}
                      <Box sx={{ px: "10px" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          {rec?.timeIn && <AccessTimeRoundedIcon sx={{ fontSize: 11, color: "#10b981" }} />}
                          <Typography sx={{ fontSize: "0.77rem", color: rec?.timeIn ? "#047857" : "black", fontWeight: rec?.timeIn ? 600 : 400, whiteSpace: "nowrap" }}>
                            {rec?.timeIn || "—"}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Time Out */}
                      <Box sx={{ px: "10px" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          {rec?.timeOut && <AccessTimeRoundedIcon sx={{ fontSize: 11, color: "#f59e0b" }} />}
                          <Typography sx={{ fontSize: "0.77rem", color: rec?.timeOut ? "#b45309" : "black", fontWeight: rec?.timeOut ? 600 : 400, whiteSpace: "nowrap" }}>
                            {rec?.timeOut || "—"}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Working Hours */}
                      <Box sx={{ px: "10px" }}>
                        <Typography sx={{
                          fontSize: "0.77rem",
                          color: rec?.totalWorkingHours ? "#0f172a" : "black",
                          fontWeight: rec?.totalWorkingHours ? 600 : 400,
                          whiteSpace: "nowrap",
                        }}>
                          {rec?.totalWorkingHours || "—"}
                        </Typography>
                      </Box>

                      {/* Status */}
                      <Box sx={{ px: "10px", display: "flex", justifyContent: "center" }}>
                        <StatusBadge status={status} />
                      </Box>

                    </Box>
                  );
                })
              ) : (
                <Box className="al-empty-anim" sx={{ py: 9, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <Box sx={{
                    width: 64, height: 64, borderRadius: "18px", bgcolor: "#f1f5f9",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <ListAltRoundedIcon sx={{ fontSize: 28, color: "#cbd5e1" }} />
                  </Box>
                  <Typography sx={{ color: "#94a3b8", fontWeight: 600, fontSize: "0.9rem" }}>
                    No attendance records for this date
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Footer */}
            {attendanceLogs.length > 0 && (
              <Box sx={{
                px: 3, py: "11px",
                borderTop: "1px solid #f1f5f9",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                bgcolor: "rgba(248,250,252,0.8)",
              }}>
                <Typography sx={{ fontSize: "0.76rem", color: "#94a3b8", fontWeight: 500 }}>
                  Showing{" "}
                  <span style={{ color: "#0f172a", fontWeight: 700 }}>{attendanceLogs.length}</span>
                  {" "}records for{" "}
                  <span style={{ color: "#6366f1", fontWeight: 700 }}>{attendanceDate}</span>
                </Typography>
              </Box>
            )}
          </Paper>

        </Box>
      </Box>
    </Box>
  );
};

export default AttendanceLog;