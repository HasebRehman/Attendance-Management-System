import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import LoginContext from "../Contexts/LoginContext";
import {
  Box, Typography, Button, Paper, IconButton,
  InputAdornment, TextField, Chip, AppBar, Toolbar, Collapse,
} from "@mui/material";
import EditRoundedIcon            from "@mui/icons-material/EditRounded";
import PersonAddAltRoundedIcon    from "@mui/icons-material/PersonAddAltRounded";
import SearchRoundedIcon          from "@mui/icons-material/SearchRounded";
import PeopleAltRoundedIcon       from "@mui/icons-material/PeopleAltRounded";
import LogoutRoundedIcon          from "@mui/icons-material/LogoutRounded";
import BadgeRoundedIcon           from "@mui/icons-material/BadgeRounded";
import AccessTimeRoundedIcon      from "@mui/icons-material/AccessTimeRounded";
import ExpandMoreRoundedIcon      from "@mui/icons-material/ExpandMoreRounded";
import ScheduleRoundedIcon        from "@mui/icons-material/ScheduleRounded";
import { toast } from "react-toastify";

/* ─── Keyframes ─── */
const STYLES = `
  @keyframes fadeSlideUp {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0);    }
  }
  @keyframes rowSlideIn {
    from { opacity:0; transform:translateX(-10px); }
    to   { opacity:1; transform:translateX(0);     }
  }
  @keyframes fadeIn {
    from { opacity:0; }
    to   { opacity:1; }
  }
  @keyframes shiftRowIn {
    from { opacity:0; transform:translateY(-4px); }
    to   { opacity:1; transform:translateY(0);    }
  }
  .e-header { animation: fadeSlideUp  .50s cubic-bezier(.22,1,.36,1) both; }
  .e-table  { animation: fadeSlideUp  .54s cubic-bezier(.22,1,.36,1) .07s both; }
  .e-empty  { animation: fadeIn .4s ease .1s both; }
`;
if (typeof document !== "undefined" && !document.getElementById("emp-v4")) {
  const s = document.createElement("style");
  s.id = "emp-v4"; s.textContent = STYLES;
  document.head.appendChild(s);
}

const SIDEBAR_W = 240;
const TODAY_LABEL = new Date().toLocaleDateString("en-US", {
  weekday:"long", year:"numeric", month:"long", day:"numeric",
});

const AVATAR_PALETTE = [
  ["#7c3aed","#4f46e5"], ["#0891b2","#0e7490"], ["#d97706","#b45309"],
  ["#059669","#047857"], ["#db2777","#be185d"], ["#2563eb","#1d4ed8"],
  ["#9333ea","#7e22ce"],
];

const DAY_META = {
  monday:    { color:"#4f46e5", bg:"#eef2ff", dot:"#818cf8", border:"#c7d2fe" },
  tuesday:   { color:"#047857", bg:"#ecfdf5", dot:"#34d399", border:"#a7f3d0" },
  wednesday: { color:"#b45309", bg:"#fffbeb", dot:"#fbbf24", border:"#fde68a" },
  thursday:  { color:"#b91c1c", bg:"#fff1f2", dot:"#f87171", border:"#fecaca" },
  friday:    { color:"#7c3aed", bg:"#faf5ff", dot:"#c084fc", border:"#e9d5ff" },
  saturday:  { color:"#be185d", bg:"#fdf2f8", dot:"#f9a8d4", border:"#fbcfe8" },
  sunday:    { color:"#0369a1", bg:"#f0f9ff", dot:"#38bdf8", border:"#bae6fd" },
};

/* ── Emp Avatar ── */
const EmpAvatar = ({ name, idx }) => {
  const [c1, c2] = AVATAR_PALETTE[idx % AVATAR_PALETTE.length];
  const initials = (name || "?").split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase();
  return (
    <Box sx={{
      width:34, height:34, borderRadius:"10px", flexShrink:0,
      background:`linear-gradient(135deg,${c1},${c2})`,
      display:"flex", alignItems:"center", justifyContent:"center",
      boxShadow:`0 2px 8px ${c1}44`,
      transition:"transform .25s cubic-bezier(.34,1.56,.64,1)",
      ".emp-row:hover &":{ transform:"scale(1.08) rotate(-2deg)" },
    }}>
      <Typography sx={{ color:"#fff", fontWeight:800, fontSize:"0.68rem" }}>{initials}</Typography>
    </Box>
  );
};

/* ── Inline Custom Times Panel ──
   Renders as an expandable row BELOW the employee row.
   No floating, no portal, no positioning math.
   Expands inline — 100% reliable, always in the right place.
── */
const CustomTimesPanel = ({ shifts, open }) => (
  <Collapse in={open} timeout={260} unmountOnExit>
    <Box sx={{
      mx:"12px", mb:"12px",
      borderRadius:"14px",
      border:"1px solid rgba(99,102,241,0.18)",
      overflow:"hidden",
      boxShadow:"0 6px 24px rgba(99,102,241,0.10), 0 1px 4px rgba(0,0,0,0.04)",
    }}>
      {/* Panel header */}
      <Box sx={{
        px:"16px", py:"11px",
        background:"linear-gradient(110deg,#0f0c29,#1a1340 60%,#24243e)",
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <Box sx={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <Box sx={{
            width:26, height:26, borderRadius:"7px", flexShrink:0,
            bgcolor:"rgba(167,139,250,0.18)", border:"1px solid rgba(167,139,250,0.3)",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <ScheduleRoundedIcon sx={{ fontSize:14, color:"#a78bfa" }} />
          </Box>
          <Typography sx={{ fontSize:"0.75rem", fontWeight:800, color:"#e2d9fc", letterSpacing:"0.4px" }}>
            Custom Schedule
          </Typography>
        </Box>
        <Box sx={{
          px:"9px", py:"3px", borderRadius:"6px",
          bgcolor:"rgba(167,139,250,0.18)", border:"1px solid rgba(167,139,250,0.3)",
        }}>
          <Typography sx={{ fontSize:"0.62rem", fontWeight:800, color:"#a78bfa" }}>
            {shifts.length} {shifts.length === 1 ? "day" : "days"}
          </Typography>
        </Box>
      </Box>

      {/* Day cards grid — each card is a vertical stack so day name and time never fight for space */}
      <Box sx={{
        p:"12px",
        display:"grid",
        gridTemplateColumns:"repeat(auto-fill, minmax(190px, 1fr))",
        gap:"8px",
        bgcolor:"rgba(248,250,252,0.9)",
      }}>
        {shifts.map((cs, i) => {
          const meta = DAY_META[cs.day?.toLowerCase()] || DAY_META.monday;
          return (
            <Box key={i} sx={{
              display:"flex",
              flexDirection:"column",
              gap:"6px",
              px:"12px", py:"10px",
              borderRadius:"10px",
              bgcolor: meta.bg,
              border:`1.5px solid ${meta.border}`,
              minWidth:0,
              animation:`shiftRowIn .22s cubic-bezier(.22,1,.36,1) ${i*30}ms both`,
            }}>
              {/* Day name row */}
              <Box sx={{ display:"flex", alignItems:"center", gap:"6px" }}>
                <Box sx={{ width:8, height:8, borderRadius:"50%", bgcolor:meta.dot, flexShrink:0 }} />
                <Typography sx={{
                  fontSize:"0.72rem", fontWeight:800, color:meta.color,
                  textTransform:"capitalize", whiteSpace:"nowrap", lineHeight:1,
                }}>
                  {cs.day}
                </Typography>
              </Box>
              {/* Time pill — sits on its own line, self-sized, never overflows */}
              <Box sx={{
                display:"inline-flex", alignItems:"center", gap:"5px",
                px:"8px", py:"4px", borderRadius:"6px",
                bgcolor:"rgba(255,255,255,0.85)",
                border:`1px solid ${meta.border}`,
                alignSelf:"flex-start",
              }}>
                <AccessTimeRoundedIcon sx={{ fontSize:11, color:meta.color, opacity:0.75, flexShrink:0 }} />
                <Typography sx={{
                  fontSize:"0.71rem", fontWeight:700, color:meta.color,
                  whiteSpace:"nowrap", fontVariantNumeric:"tabular-nums",
                  letterSpacing:"0.2px", lineHeight:1,
                }}>
                  {cs.timeIn} – {cs.timeOut}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  </Collapse>
);


/* ── Grid ── */
const GRID  = "44px 80px 1.3fr 0.9fr 1fr 180px 56px";
const HEADS = ["#","ID","Name","Position","Email","Schedule","Action"];

/* ═══════════════════════════════════════════ */
const Employees = () => {
  const { userData } = useContext(LoginContext);
  const [employees, setEmployees] = useState([]);
  const [search,    setSearch]    = useState("");
  const [expanded,  setExpanded]  = useState(null); // _id of open custom panel
  const [animKey,   setAnimKey]   = useState(0);
  const API_URL  = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const fetchEmployees = async () => {
    try {
      const res    = await fetch(`${API_URL}/user/GetAllEmployees`, {
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${localStorage.getItem("Token")}` },
      });
      const result = await res.json();
      if (!result.data?.length) toast.info("No employees found");
      setEmployees(result.data || []);
      setAnimKey(k => k+1);
    } catch { toast.error("Failed to fetch employees"); }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const filtered = employees.filter(e =>
    [e.fullName, e.position, e.officialEmail, e.contactNumber]
      .join(" ").toLowerCase().includes(search.toLowerCase())
  );

  const toggleExpand = (id) => setExpanded(prev => prev === id ? null : id);

  return (
    <Box className="min-h-screen"
      sx={{ background:"linear-gradient(135deg,#f8faff 0%,#eef2ff 50%,#f0fdf4 100%)" }}>

      {/* ── Topbar ── */}
      <AppBar position="fixed" elevation={0} sx={{
        left:{ xs:0, md:`${SIDEBAR_W}px` },
        width:{ xs:"100%", md:`calc(100% - ${SIDEBAR_W}px)` },
        background:"linear-gradient(110deg,#0f0c29 0%,#1a1340 55%,#24243e 100%)",
        boxShadow:"0 3px 24px rgba(0,0,0,0.3)", zIndex:1200,
      }}>
        <Toolbar sx={{ minHeight:"64px !important", px:{ xs:2, md:4 }, gap:2 }}>
          <Box sx={{ display:"flex", flexDirection:"column", lineHeight:1 }}>
            <Typography sx={{ fontSize:"0.6rem", fontWeight:600, letterSpacing:"2px", textTransform:"uppercase", color:"rgba(255,255,255,0.35)", mb:.3 }}>
              Welcome back
            </Typography>
            <Typography sx={{ fontSize:"1rem", fontWeight:800, color:"#e2d9fc" }}>
              {userData?.fullName ?? "Employee"}
            </Typography>
          </Box>
          <Box sx={{ flex:1 }} />
          <Chip label={userData?.role === "admin" ? "Admin" : "Employee"} size="small" sx={{
            background:"rgba(167,139,250,0.14)", border:"1px solid rgba(167,139,250,0.28)",
            color:"#a78bfa", fontWeight:700, fontSize:"0.65rem", letterSpacing:"1.3px", textTransform:"uppercase",
          }} />
          <Button
            onClick={() => { localStorage.removeItem("Token"); navigate("/login"); }}
            startIcon={<LogoutRoundedIcon sx={{ fontSize:"17px !important" }} />}
            size="small"
            sx={{
              color:"#fca5a5", border:"1.5px solid rgba(251,113,133,0.35)",
              background:"rgba(239,68,68,0.1)", borderRadius:"10px",
              fontWeight:600, fontSize:"0.82rem", px:2, py:1, textTransform:"none",
              transition:"all .25s ease",
              "&:hover":{ color:"#fff", background:"rgba(239,68,68,0.22)", borderColor:"rgba(239,68,68,0.65)", transform:"translateY(-1px)" },
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* ── Main ── */}
      <Box component="main" sx={{ pt:"32px", minHeight:"100vh" }}>
        <Box sx={{ px:{ xs:2, md:4 }, py:3, display:"flex", flexDirection:"column", gap:4 }}>

          {/* Page header */}
          <Paper elevation={0} className="e-header" sx={{
            borderRadius:"20px", border:"1px solid rgba(255,255,255,0.85)",
            bgcolor:"rgba(255,255,255,0.6)", backdropFilter:"blur(12px)",
            px:4, py:3, boxShadow:"0 4px 20px rgba(0,0,0,0.06)",
            display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:3,
          }}>
            <Box>
              <Typography sx={{ fontWeight:900, fontSize:"2.4rem", color:"#0f172a", letterSpacing:"-0.03em", lineHeight:1 }}>
                Employees
              </Typography>
              <Typography sx={{ fontSize:"0.82rem", color:"#64748b", fontWeight:500, mt:.8 }}>
                {TODAY_LABEL}
              </Typography>
            </Box>
            <Box sx={{
              display:"inline-flex", alignItems:"center", gap:"12px",
              bgcolor:"rgba(124,58,237,0.06)", border:"1.5px solid rgba(124,58,237,0.18)",
              borderRadius:"14px", px:2.5, py:1.5,
            }}>
              <Box sx={{ width:40, height:40, borderRadius:"12px", bgcolor:"rgba(124,58,237,0.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <PeopleAltRoundedIcon sx={{ color:"#7c3aed", fontSize:20 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize:"0.62rem", fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:"1.2px" }}>Total</Typography>
                <Typography sx={{ fontSize:"1.5rem", fontWeight:900, color:"#7c3aed", lineHeight:1 }}>{employees.length}</Typography>
              </Box>
            </Box>
          </Paper>

          {/* Table card */}
          <Paper elevation={0} className="e-table" sx={{
            p: '10px',
            borderRadius:"20px", border:"1px solid rgba(255,255,255,0.85)",
            bgcolor:"rgba(255,255,255,0.75)", backdropFilter:"blur(12px)",
            boxShadow:"0 4px 24px rgba(0,0,0,0.07)", overflow:"hidden",
          }}>

            {/* Search + Add */}
            <Box sx={{ mb: '15px', px:3, pt:3, pb:2.5, display:"flex", alignItems:"center", justifyContent:"space-between", gap:2, flexWrap:"wrap" }}>
              <TextField
                size="small"
                placeholder="Search name, position, email…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                InputProps={{ startAdornment:(
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ fontSize:17, color:"#9ca3af" }} />
                  </InputAdornment>
                )}}
                sx={{
                  width:{ xs:"100%", sm:280 },
                  "& .MuiOutlinedInput-root":{
                    borderRadius:"11px", bgcolor:"#f8fafc", fontSize:"0.85rem",
                    "& fieldset":{ borderColor:"#e2e8f0" },
                    "&:hover fieldset":{ borderColor:"#c4b5fd" },
                    "&.Mui-focused fieldset":{ borderColor:"#7c3aed", borderWidth:"1.5px" },
                  },
                }}
              />
              <Button
                variant="contained"
                startIcon={<PersonAddAltRoundedIcon sx={{ fontSize:"17px !important" }} />}
                onClick={() => navigate("/employees/add")}
                sx={{
                  background:"linear-gradient(110deg,#0f0c29,#1a1340 60%,#24243e)",
                  borderRadius:"11px", fontWeight:700, fontSize:"0.82rem",
                  px:2.5, py:1, textTransform:"none",
                  boxShadow:"0 4px 14px rgba(15,12,41,0.35)",
                  transition:"all .22s ease",
                  "&:hover":{ boxShadow:"0 6px 20px rgba(15,12,41,0.45)", transform:"translateY(-1px)" },
                  "&:active":{ transform:"scale(0.97)" },
                }}
              >
                Add Employee
              </Button>
            </Box>

            {/* Column headers */}
            <Box sx={{
              display:"grid", gridTemplateColumns:GRID,
              background:"linear-gradient(110deg,#0f0c29,#1a1340 55%,#24243e)",
              borderTopLeftRadius: "20px", borderTopRightRadius: "20px", mx:2, px:2, py:"12px",
            }}>
              {HEADS.map((h,i) => (
                <Box key={i} sx={{ p: '15px 0px 15px', px:"10px", display:"flex", alignItems:"center" }}>
                  <Typography sx={{ fontSize:"0.70rem", fontWeight:800, color:"white", textTransform:"uppercase", letterSpacing:"1.1px", whiteSpace:"nowrap" }}>
                    {h}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Rows */}
            <Box key={animKey} sx={{ p: '10px 5px 10px 5px', mx:2, mb:2, border:"1px solid #e2e8f0", borderTop:"none", borderRadius:"0 0 14px 14px", overflow:"hidden" }}>
              {filtered.length > 0 ? (
                filtered.map((emp, idx) => {
                  const hasCustom = Array.isArray(emp.customSchedule) && emp.customSchedule.length > 0;
                  const isOpen    = expanded === emp._id;

                  return (
                    <Box key={emp._id || idx}>
                      {/* ── Employee row ── */}
                      <Box
                        className="emp-row"
                        sx={{
                          display:"grid", gridTemplateColumns:GRID,
                          alignItems:"center", px:1, py:"11px",
                          borderBottom: isOpen ? "none" : (idx < filtered.length-1 ? "1px solid #f1f5f9" : "none"),
                          bgcolor: isOpen ? "rgba(99,102,241,0.03)" : "transparent",
                          transition:"background .15s ease",
                          "&:hover":{ bgcolor:"rgba(99,102,241,0.025)" },
                          animation:`rowSlideIn .37s cubic-bezier(.22,1,.36,1) ${idx*38}ms both`,
                        }}
                      >
                        {/* # */}
                        <Box sx={{ px:"10px" }}>
                          <Typography sx={{ fontSize:"0.75rem", color:"black", fontWeight:600 }}>{idx+1}</Typography>
                        </Box>

                        {/* ID */}
                        <Box sx={{ px:"10px" }}>
                          <Box sx={{ display:"inline-flex", alignItems:"center", gap:"4px", bgcolor:"rgba(99,102,241,0.08)", borderRadius:"7px", px:"7px", py:"3px" }}>
                            <BadgeRoundedIcon sx={{ fontSize:11, color:"#6366f1" }} />
                            <Typography sx={{ fontSize:"0.67rem", fontWeight:700, color:"#6366f1" }}>
                              CL{String(idx+1).padStart(3,"0")}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Name + Avatar */}
                        <Box sx={{ px:"10px", display:"flex", alignItems:"center", gap:"10px", minWidth:0 }}>
                          <Typography sx={{ fontSize:"0.84rem", fontWeight:700, color:"#0f172a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            {emp.fullName}
                          </Typography>
                        </Box>

                        {/* Position */}
                        <Box sx={{ px:"10px", minWidth:0 }}>
                          <Typography sx={{ fontSize:"0.78rem", color:"#475569", fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            {emp.position || "—"}
                          </Typography>
                        </Box>

                        {/* Email */}
                        <Box sx={{ px:"10px", minWidth:0 }}>
                          <Typography sx={{ fontSize:"0.76rem", color:"#64748b", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            {emp.officialEmail || "—"}
                          </Typography>
                        </Box>

                        {/* Schedule / Custom Times trigger */}
                        <Box sx={{ px:"10px" }}>
                          {hasCustom ? (
                            /* ── Clickable custom times button ── */
                            <Box
                              onClick={() => toggleExpand(emp._id)}
                              sx={{
                                display:"inline-flex", alignItems:"center", gap: '2px',
                                px:"10px", py:"5px", borderRadius:"9px",
                                cursor:"pointer", userSelect:"none",
                                border:"1.5px solid",
                                borderColor: isOpen ? "rgba(99,102,241,0.55)" : "rgba(99,102,241,0.25)",
                                bgcolor:     isOpen ? "rgba(99,102,241,0.1)"  : "rgba(99,102,241,0.05)",
                                transition:"all .18s ease",
                                "&:hover":{ borderColor:"rgba(99,102,241,0.45)", bgcolor:"rgba(99,102,241,0.09)" },
                              }}
                            >
                              <ScheduleRoundedIcon sx={{ pr: '2px', fontSize:13, color:"#6366f1" }} />
                              <Typography sx={{ fontSize:"0.72rem", fontWeight:700, color:"#4f46e5", whiteSpace:"nowrap" }}>
                                Custom Times
                              </Typography>
                              <Box sx={{
                                borderRadius:"4px",
                                bgcolor:"rgba(99,102,241,0.15)",
                              }}>
                                {/* <Typography sx={{ fontSize:"0.6rem", fontWeight:800, color:"#6366f1" }}>
                                  {emp.customSchedule.length}
                                </Typography> */}
                              </Box>
                              <ExpandMoreRoundedIcon sx={{
                                fontSize:15, color:"#6366f1",
                                transition:"transform .2s ease",
                                transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                              }} />
                            </Box>
                          ) : (
                            /* ── Regular schedule time ── */
                            emp.scheduleId ? (
                              <Box sx={{
                                display:"inline-flex", alignItems:"center", gap:"5px",
                                px:"9px", py:"4px", borderRadius:"8px",
                                bgcolor:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.25)",
                              }}>
                                <Box sx={{ width:6, height:6, borderRadius:"50%", bgcolor:"#10b981" }} />
                                <Typography sx={{ fontSize:"0.72rem", fontWeight:600, color:"#047857", whiteSpace:"nowrap" }}>
                                  {emp.scheduleId.timeIn} – {emp.scheduleId.timeOut}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography sx={{ fontSize:"0.76rem", color:"#cbd5e1" }}>—</Typography>
                            )
                          )}
                        </Box>

                        {/* Edit */}
                        <Box sx={{ px:"10px", display:"flex", justifyContent:"center" }}>
                          <IconButton
                            onClick={() => navigate(`/employees/edit/${emp._id}`)}
                            size="small"
                            sx={{
                              width:30, height:30, bgcolor:"rgba(99,102,241,0.07)",
                              border:"1px solid rgba(99,102,241,0.2)", borderRadius:"8px", color:"#6366f1",
                              transition:"all .18s ease",
                              "&:hover":{ bgcolor:"rgba(99,102,241,0.15)", borderColor:"rgba(99,102,241,0.45)", transform:"scale(1.1)" },
                            }}
                          >
                            <EditRoundedIcon sx={{ fontSize:14 }} />
                          </IconButton>
                        </Box>
                      </Box>

                      {/* ── Inline expanded custom times panel ── */}
                      {hasCustom && (
                        <CustomTimesPanel
                          shifts={emp.customSchedule}
                          open={isOpen}
                        />
                      )}

                      {/* Divider below each row group */}
                      {idx < filtered.length - 1 && (
                        <Box sx={{ height:1, bgcolor:"#f1f5f9", mx:0 }} />
                      )}
                    </Box>
                  );
                })
              ) : (
                <Box className="e-empty" sx={{ py:9, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                  <Box sx={{ width:64, height:64, borderRadius:"18px", bgcolor:"#f1f5f9", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <PeopleAltRoundedIcon sx={{ fontSize:28, color:"#cbd5e1" }} />
                  </Box>
                  <Typography sx={{ color:"#94a3b8", fontWeight:600, fontSize:"0.9rem" }}>
                    {search ? `No results for "${search}"` : "No employees yet"}
                  </Typography>
                  {search && (
                    <Button size="small" onClick={() => setSearch("")}
                      sx={{ color:"#7c3aed", textTransform:"none", fontSize:"0.8rem" }}>
                      Clear search
                    </Button>
                  )}
                </Box>
              )}
            </Box>

            {/* Footer */}
            {filtered.length > 0 && (
              <Box sx={{
                px:3, py:"11px", borderTop:"1px solid #f1f5f9",
                display:"flex", alignItems:"center", justifyContent:"space-between",
                bgcolor:"rgba(248,250,252,0.8)", borderRadius:"0 0 20px 20px",
              }}>
                <Typography sx={{ fontSize:"0.76rem", color:"#94a3b8", fontWeight:500 }}>
                  Showing{" "}
                  <span style={{ color:"#0f172a", fontWeight:700 }}>{filtered.length}</span>
                  {" "}of{" "}
                  <span style={{ color:"#0f172a", fontWeight:700 }}>{employees.length}</span>
                  {" "}employees
                </Typography>
                {search && (
                  <Button size="small" onClick={() => setSearch("")}
                    sx={{ color:"#7c3aed", textTransform:"none", fontSize:"0.74rem", fontWeight:600 }}>
                    Clear filter
                  </Button>
                )}
              </Box>
            )}
          </Paper>

        </Box>
      </Box>
    </Box>
  );
};

export default Employees;