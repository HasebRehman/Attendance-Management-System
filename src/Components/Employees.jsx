import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import LoginContext from "../Contexts/LoginContext";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  AppBar,
  Toolbar,
  Paper,
  IconButton,
  InputAdornment,
  TextField,
  Chip,
  Avatar,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { toast } from "react-toastify";


const today        = new Date();

const todayLabel = today.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

const AVATAR_COLORS = [
  ["#7c3aed","#6d28d9"],
  ["#0891b2","#0e7490"],
  ["#d97706","#b45309"],
  ["#059669","#047857"],
  ["#db2777","#be185d"],
  ["#2563eb","#1d4ed8"],
  ["#9333ea","#7e22ce"],
];

// ── column definitions (label + flex weight) ──────────────────────────────────
// Using flex widths so the row exactly fills the card — no horizontal scroll ever.
const COLS = [
  { label: "#",             flex: "0 0 46px"  },
  { label: "ID",   flex: "0 0 90px"  },
  { label: "Name",          flex: "1 1 160px" },
  { label: "Position",      flex: "1 1 120px" },
  { label: "Contact",       flex: "0 0 118px" },
  { label: "Email",         flex: "1 1 190px" },
  { label: "Time",          flex: "0 0 148px" },
  { label: "Schedule",      flex: "0 0 100px" },
  { label: "Action",        flex: "0 0 56px"  },
];

// ── component ──────────────────────────────────────────────────────────────────
const Employees = () => {
  const { userData } = useContext(LoginContext);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch]       = useState("");
  const API_URL                   = import.meta.env.VITE_API_URL;
  const navigate                  = useNavigate();

  const addEmployee  = ()   => navigate("/employees/add");
  const editEmployee = (id) => navigate(`/employees/edit/${id}`);
  const userLogout   = ()   => { localStorage.removeItem("Token"); navigate("/login"); };

  const fetchEmployees = async () => {
    try {
      const res    = await fetch(`${API_URL}/user/GetAllEmployees`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("Token")}` },
      });
      const result = await res.json();
      if (!result.data.length) toast.info("No employees found");
      setEmployees(result.data);
    } catch { toast.error("Failed to fetch employees"); }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const filtered = employees.filter((e) =>
    [e.fullName, e.position, e.officialEmail, e.contactNumber]
      .join(" ").toLowerCase().includes(search.toLowerCase())
  );

  // shared cell sx
  const cellSx = (flex) => ({
    flex,
    minWidth: 0,
    px: "10px",
    py: "14px",
    border: "none",
    display: "flex",
    alignItems: "center",
    overflow: "hidden",
  });

  const headCellSx = (flex, center = false) => ({
    ...cellSx(flex),
    py: "11px",
    justifyContent: center ? "center" : "flex-start",
  });

  return (
    <Box sx={{ backgroundColor: "#eef0f8", minHeight: "100vh", width: "100%" }}>

      {/* ── Fixed Topbar ──────────────────────────────────────────────────── */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          left: { xs: 0, md: `240px` },
          width: { xs: "100%", md: `calc(100% - 240px)` },
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

      {/* ── Page body ─────────────────────────────────────────────────────── */}
      <Box sx={{ mt: '25px', pt: "45px", px: 3, pb: 6 }}>

        {/* ── Title card — matches Dashboard style ─── */}
        <Paper elevation={0} sx={{
          mb: 3,
          p: "24px 32px",
          borderRadius: "14px",
          bgcolor: "#fff",
          boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
          border: "1px solid #e8ecf4",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <Box className="flex items-center justify-between gap-6">
            <Box>
              <Typography
                variant="h3"
                className="font-black text-gray-900 tracking-tight leading-none"
                sx={{ fontWeight: 900, fontSize: "2.5rem" }}
              >
                Employees
              </Typography>
              <Typography
                variant="body2"
                className="text-gray-600 font-medium mt-2"
              >
                {todayLabel}
              </Typography>
            </Box>

          </Box>
        </Paper>

        {/* ── Table card ────────────────────────────────────────────────── */}
        <Paper elevation={0} sx={{
          borderRadius: "14px", bgcolor: "#fff",
          border: "1px solid #e8ecf4",
          boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
          overflow: "hidden",
          width: "100%",
          padding: '25px 15px 25px 15px'
        }}>

          {/* Search + Add row */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, py: 2, borderBottom: "1px solid #f1f5f9", gap: 2, marginBottom: '20px', flexWrap: "wrap" }}>
            <TextField
              size="small"
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ color: "#94a3b8", fontSize: 18 }} /></InputAdornment> }}
              sx={{
                width: 260,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "100px", backgroundColor: "#f8fafc",
                  fontSize: "0.84rem", fontFamily: "'DM Sans', sans-serif",
                  "& fieldset": { borderColor: "#e2e8f0" },
                  "&:hover fieldset": { borderColor: "#c4b5fd" },
                  "&.Mui-focused fieldset": { borderColor: "#7c3aed", borderWidth: 1.5 },
                },
              }}
            />
            <Button
              variant="contained"
              startIcon={<PersonAddAltRoundedIcon />}
              onClick={addEmployee}
              sx={{
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)", borderRadius: "100px",
                textTransform: "none", fontWeight: 700, fontSize: "0.85rem",
                fontFamily: "'DM Sans', sans-serif", px: 2.5, py: 1,
                boxShadow: "0 4px 14px rgba(109,40,217,0.35)",
                "&:hover": { background: "linear-gradient(135deg,#6d28d9,#5b21b6)", boxShadow: "0 6px 20px rgba(109,40,217,0.5)" },
              }}
            >
              Add Employee
            </Button>
          </Box>

          {/*
            ── Flex-based "table" — 100 % width, zero horizontal scroll ──
            Each row is a flex row; column widths are controlled by the
            flex shorthand on each cell, NOT by HTML table layout.
          */}
          <Box sx={{ width: "100%", overflowX: "hidden" }}>

            {/* Header */}
            <Box sx={{
              display: "flex", alignItems: "center",
              backgroundColor: "#161137",
              borderBottom: "2px solid #f1f5f9",
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              padding: '15px',
              marginTop: '5px',
              px: "10px",
            }}>
              {COLS.map((c, i) => (
                <Box key={c.label} sx={headCellSx(c.flex, i === COLS.length - 1)}>
                  <Typography sx={{ fontSize: "0.66rem", fontWeight: 700, letterSpacing: "1.6px", textTransform: "uppercase", color: "#ffffff", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}>
                    {c.label}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Rows */}
            {filtered.length > 0 ? (
              filtered.map((emp, idx) => {
                const [c1, c2] = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                return (
                  <Box
                    key={emp._id || idx}
                    sx={{
                      display: "flex", alignItems: "center",
                      px: "4px",
                      borderBottom: "1px solid #f8fafc",
                      transition: "background 0.15s",
                      "&:hover": { backgroundColor: "#faf5ff" },
                      "&:last-child": { borderBottom: "none" },
                    }}
                  >
                    {/* # */}
                    <Box sx={cellSx(COLS[0].flex)}>
                      <Box sx={{ width: 28, height: 28, borderRadius: "8px", bgcolor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.74rem", fontWeight: 600, color: "#64748b", fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}>
                        {idx + 1}
                      </Box>
                    </Box>

                    {/* Employee ID */}
                    <Box sx={cellSx(COLS[1].flex)}>
                      <Box sx={{ bgcolor: "#ede9fe", color: "#6d28d9", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "0.7rem", px: "8px", py: "3px", borderRadius: "6px", letterSpacing: "0.4px", whiteSpace: "nowrap" }}>
                        CL00{idx + 1}
                      </Box>
                    </Box>

                    {/* Name */}
                    <Box sx={cellSx(COLS[2].flex)}>
                      <Typography sx={{ fontSize: "0.855rem", fontWeight: 600, color: "#1e293b", fontFamily: "'DM Sans', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {emp.fullName}
                      </Typography>
                    </Box>

                    {/* Position */}
                    <Box sx={cellSx(COLS[3].flex)}>
                      {emp.position
                        ? <Box sx={{ bgcolor: "#eef2ff", color: "#4338ca", fontWeight: 600, fontSize: "0.74rem", px: "10px", py: "3px", borderRadius: "100px", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis" }}>{emp.position}</Box>
                        : <Typography sx={{ color: "#cbd5e1" }}>—</Typography>}
                    </Box>

                    {/* Contact */}
                    <Box sx={cellSx(COLS[4].flex)}>
                      <Typography sx={{ fontSize: "0.82rem", color: "#475569", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {emp.contactNumber || "—"}
                      </Typography>
                    </Box>

                    {/* Email */}
                    <Box sx={cellSx(COLS[5].flex)}>
                      <Typography sx={{ fontSize: "0.8rem", color: "#64748b", fontFamily: "'DM Sans', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {emp.officialEmail}
                      </Typography>
                    </Box>

                    {/* Time */}
                    <Box sx={cellSx(COLS[6].flex)}>
                      {emp.scheduleId ? (
                        <Box sx={{ display: "inline-flex", alignItems: "center", gap: "5px", bgcolor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "7px", px: "8px", py: "3px", flexShrink: 0 }}>
                          <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#22c55e", boxShadow: "0 0 4px rgba(34,197,94,0.7)", flexShrink: 0 }} />
                          <Typography sx={{ fontSize: "0.75rem", color: "#15803d", fontWeight: 500, fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}>
                            {emp.scheduleId.timeIn} – {emp.scheduleId.timeOut}
                          </Typography>
                        </Box>
                      ) : <Typography sx={{ color: "#cbd5e1" }}>—</Typography>}
                    </Box>

                    {/* Schedule name */}
                    <Box sx={cellSx(COLS[7].flex)}>
                      <Typography sx={{ fontSize: "0.82rem", color: "#64748b", fontFamily: "'DM Sans', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {emp.scheduleId?.scheduleName || "—"}
                      </Typography>
                    </Box>

                    {/* Action */}
                    <Box sx={{ ...cellSx(COLS[8].flex), justifyContent: "center" }}>
                      <IconButton onClick={() => editEmployee(emp._id)} size="small"
                        sx={{ bgcolor: "#ede9fe", border: "1px solid #ddd6fe", borderRadius: "9px", color: "#7c3aed", width: 32, height: 32, flexShrink: 0, transition: "all 0.2s",
                          "&:hover": { bgcolor: "#7c3aed", borderColor: "#7c3aed", color: "#fff", boxShadow: "0 4px 12px rgba(124,58,237,0.4)", transform: "translateY(-1px)" } }}>
                        <EditIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Box>
                  </Box>
                );
              })
            ) : (
              <Box sx={{ py: 8, display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ width: 56, height: 56, borderRadius: "14px", bgcolor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", "& svg": { fontSize: 26, color: "#94a3b8" } }}>
                  <PeopleAltRoundedIcon />
                </Box>
                <Typography sx={{ fontWeight: 700, color: "#64748b", fontFamily: "'DM Sans', sans-serif" }}>
                  {search ? `No results for "${search}"` : "No employees yet"}
                </Typography>
                <Typography sx={{ fontSize: "0.82rem", color: "#94a3b8", fontFamily: "'DM Sans', sans-serif" }}>
                  {search ? "Try a different search term" : "Click 'Add Employee' to get started"}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Footer count */}
          {filtered.length > 0 && (
            <Box sx={{ px: 3, py: 1.6, borderTop: "1px solid #f1f5f9" }}>
              <Typography sx={{ fontSize: "0.78rem", color: "#94a3b8", fontFamily: "'DM Sans', sans-serif" }}>
                Showing{" "}
                <Box component="span" sx={{ fontWeight: 700, color: "#475569" }}>{filtered.length}</Box>
                {" "}of{" "}
                <Box component="span" sx={{ fontWeight: 700, color: "#475569" }}>{employees.length}</Box>
                {" "}employees
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default Employees;