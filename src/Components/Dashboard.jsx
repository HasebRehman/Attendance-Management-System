import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Box, Button, Chip, Typography, Paper } from "@mui/material";
import LoginContext from "../Contexts/LoginContext";
import ProfileImage from "./ProfileImage";

import LogoutRoundedIcon           from "@mui/icons-material/LogoutRounded";
import BadgeRoundedIcon            from "@mui/icons-material/BadgeRounded";
import CalendarMonthRoundedIcon    from "@mui/icons-material/CalendarMonthRounded";
import CheckCircleRoundedIcon      from "@mui/icons-material/CheckCircleRounded";
import AccessAlarmRoundedIcon      from "@mui/icons-material/AccessAlarmRounded";
import BeachAccessRoundedIcon      from "@mui/icons-material/BeachAccessRounded";
import PersonOffRoundedIcon        from "@mui/icons-material/PersonOffRounded";
import PeopleAltRoundedIcon        from "@mui/icons-material/PeopleAltRounded";
import DateRangeRoundedIcon        from "@mui/icons-material/DateRangeRounded";
import HowToRegRoundedIcon         from "@mui/icons-material/HowToRegRounded";
import RunningWithErrorsRoundedIcon from "@mui/icons-material/RunningWithErrorsRounded";
import NoAccountsRoundedIcon       from "@mui/icons-material/NoAccountsRounded";

const SIDEBAR_W = 240;

/* ── Keyframe styles injected once ── */
const animationStyles = `
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes countUp {
    from { opacity: 0; transform: scale(0.75); }
    to   { opacity: 1; transform: scale(1);    }
  }
  .dash-header-anim {
    animation: fadeSlideUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .dash-card-anim {
    animation: fadeSlideUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .dash-value-anim {
    animation: countUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    animation-delay: inherit;
  }
`;

if (typeof document !== "undefined" && !document.getElementById("dash-anim-styles")) {
  const tag = document.createElement("style");
  tag.id = "dash-anim-styles";
  tag.textContent = animationStyles;
  document.head.appendChild(tag);
}

const colorConfig = {
  violet:  { bg: "bg-violet-50",  border: "border-violet-200",  iconBg: "bg-violet-100",  iconColor: "text-violet-600" },
  amber:   { bg: "bg-amber-50",   border: "border-amber-200",   iconBg: "bg-amber-100",   iconColor: "text-amber-600"  },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", iconBg: "bg-emerald-100", iconColor: "text-emerald-600"},
  rose:    { bg: "bg-rose-50",    border: "border-rose-200",    iconBg: "bg-rose-100",    iconColor: "text-rose-600"   },
  sky:     { bg: "bg-sky-50",     border: "border-sky-200",     iconBg: "bg-sky-100",     iconColor: "text-sky-600"    },
  indigo:  { bg: "bg-indigo-50",  border: "border-indigo-200",  iconBg: "bg-indigo-100",  iconColor: "text-indigo-600" },
};

const StatCard = ({ label, value, icon, color, animDelay = 0 }) => {
  const cfg = colorConfig[color];



  return (
    <Paper
      elevation={0}
      className={`dash-card-anim relative overflow-hidden rounded-3xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-default group h-full ${cfg.bg} ${cfg.border}`}
      style={{ animationDelay: `${animDelay}ms` }}
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "32px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        "&:hover": {
          boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
        }
      }}
    >
      {/* Top section: Icon and Label */}
      <Box className="flex items-start gap-4 mb-6">
        <Box
          className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${cfg.iconBg}`}
          sx={{ transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
        >
          <span className={`${cfg.iconColor} [&>svg]:text-[32px]`}>{icon}</span>
        </Box>
        <Box className="flex-1">
          <Typography
            className="text-base font-semibold text-gray-800 leading-snug"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
            }}
          >
            {label}
          </Typography>
        </Box>
      </Box>

      {/* Bottom section: Large Value */}
      <Box className="flex items-end justify-start pt-6 border-t border-gray-200/50">
        <Typography
          className="dash-value-anim text-5xl font-black text-gray-900 leading-none pt-4"
          style={{ animationDelay: `${animDelay + 120}ms` }}
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {value ?? "—"}
        </Typography>
      </Box>
    </Paper>
  );
};

const Dashboard = () => {
  const navigate     = useNavigate();
  const { userData, setUserData } = useContext(LoginContext);
  const API_URL      = import.meta.env.VITE_API_URL;

  const today        = new Date();
  const currentMonth = today.toISOString().slice(0, 7);
  const currentDate  = today.toISOString().slice(0, 10);
  const isAdmin      = userData?.role === "admin";

  const [selectedMonth,  setSelectedMonth]  = useState(isAdmin ? currentDate : currentMonth);
  const [attendanceTime, setAttendanceTime] = useState(null);
  const [employeeCount,  setEmployeeCount]  = useState(null);
  const [year, setYear] = useState(0);
  const [month, setMonth] = useState(0);
  const [empDocId, setEmpDocId] = useState('');

  // Re-trigger card animations when data refreshes
  const [animKey, setAnimKey] = useState(0);

  // const { name } = useContext(LoginContext);
  // console.log(name);
  

  const userLogout = () => {
    localStorage.removeItem("Token");
    navigate("/login");
  };

  useEffect(() => {
    if (!userData) return;
    setSelectedMonth(userData.role === "admin" ? currentDate : currentMonth);
  }, [userData]);

  useEffect(() => {
    if (!isAdmin || !selectedMonth) return;
    (async () => {
      try {
        const r = await fetch(
          `${API_URL}/attendance/dashboardStats?specificDate=${selectedMonth}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("Token")}` } }
        );
        const d = await r.json();
        setEmployeeCount(d?.data);
        setAnimKey(k => k + 1); // re-trigger animations on new data
      } catch (e) { console.error(e); }
    })();
  }, [selectedMonth, userData]);

  const employeeYear = today.getFullYear();
  const employeeMonth = today.getMonth();

  // console.log('empMonth', employeeMonth);
  

  useEffect(() => {
    if (!userData || isAdmin || !selectedMonth) return;

    const [y, m] = selectedMonth.split("-");

    setYear(Number(y));
    setMonth(Number(m));
    setEmpDocId(userData._id);

  }, [selectedMonth, userData]);


  useEffect(() => {
    if (isAdmin) return;
    if (!year || !month || !empDocId) return;

    (async () => {
      try {
        const r = await fetch(
          `${API_URL}/attendance/employeeStats?year=${year}&month=${month}&empDocId=${empDocId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("Token")}`
            }
          }
        );

        const d = await r.json();
        setAttendanceTime(d?.data);
        setAnimKey(k => k + 1);

      } catch (e) {
        console.error(e);
      }
    })();

  }, [year, month, empDocId, isAdmin]);


  const adminStats = [
    { label: "Total Employees",  value: employeeCount?.totalEmployees, icon: <PeopleAltRoundedIcon />,           color: "violet"  },
    { label: "Total Schedules",  value: employeeCount?.totalSchedules,  icon: <DateRangeRoundedIcon />,           color: "amber"   },
    { label: "On Time Today",    value: employeeCount?.onTimeToday,     icon: <HowToRegRoundedIcon />,            color: "emerald" },
    { label: "Late Today",       value: employeeCount?.lateToday,       icon: <RunningWithErrorsRoundedIcon />,   color: "rose"    },
    { label: "On Leave Today",   value: employeeCount?.onLeaveToday,    icon: <BeachAccessRoundedIcon />,         color: "sky"     },
    { label: "Absent Today",     value: employeeCount?.absentToday,     icon: <NoAccountsRoundedIcon />,          color: "indigo"  },
  ];

  const userStats = [
    { label: "Employee ID",       value: attendanceTime?.employeeId,               icon: <BadgeRoundedIcon />,          color: "violet"  },
    { label: "Assigned Schedule", value: attendanceTime?.assignedSchedule, icon: <CalendarMonthRoundedIcon />,  color: "amber"   },
    { label: "On Time Days",      value: attendanceTime?.onTimeDays,    icon: <CheckCircleRoundedIcon />,    color: "emerald" },
    { label: "Late Days",         value: attendanceTime?.lateDays,      icon: <AccessAlarmRoundedIcon />,    color: "rose"    },
    { label: "On Leave Days",     value: attendanceTime?.onLeaveDays,     icon: <BeachAccessRoundedIcon />,    color: "sky"     },
    { label: "Absent Days",       value: attendanceTime?.absentDays,    icon: <PersonOffRoundedIcon />,      color: "indigo"  },
  ];

  const stats = isAdmin ? adminStats : userStats;

  const todayLabel = today.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <Box className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">

      {/* ── TOPBAR: UNCHANGED ── */}
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

      {/* ── MAIN CONTENT ── */}
      <Box
        component="main"
        sx={{ pt: "32px" }}
        className="min-h-screen"
      >
        <Box className="w-full px-6 lg:px-8 py-6 flex flex-col gap-8">

          {/* Header Card — subtle fade + slide up on mount */}
          <Paper
            elevation={0}
            className="dash-header-anim rounded-2xl border border-white/80 backdrop-blur-sm bg-white/40"
            sx={{
              padding: "24px 32px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
              animationDelay: "0ms",
            }}
          >
            <Box className="flex items-center justify-between gap-6">
              <Box>
                <Typography
                  variant="h3"
                  className="font-black text-gray-900 tracking-tight leading-none"
                  sx={{ fontWeight: 900, fontSize: "2.5rem" }}
                >
                  Dashboard
                </Typography>
                <Typography
                  variant="body2"
                  className="text-gray-600 font-medium mt-2"
                >
                  {todayLabel}
                </Typography>
              </Box>

              <Box className="flex items-center gap-4 bg-blue-50 rounded-xl px-4 py-3 border border-blue-200">
                <span className="text-sm font-bold text-gray-700">
                  {isAdmin ? "Date:" : "Month:"}
                </span>
                <input
                  type={isAdmin ? "date" : "month"}
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent border-0 px-2 py-1 text-sm font-bold text-gray-900 outline-none cursor-pointer focus:ring-0"
                />
              </Box>
            </Box>
          </Paper>

          {/* Stats grid — staggered card entrance animation */}
          <Box
            key={animKey}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-max"
          >
            {stats.map((s, i) => (
              <Box key={s.label} className="aspect-square">
                <StatCard {...s} animDelay={i * 80} />
              </Box>
            ))}
          </Box>

        </Box>
      </Box>

    </Box>
  );
};

export default Dashboard;