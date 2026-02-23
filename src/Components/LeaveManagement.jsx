import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useContext } from 'react';
import LoginContext from '../Contexts/LoginContext';
import {
  Box, Typography, Paper, Button,
  IconButton, AppBar, Toolbar, Chip,
} from '@mui/material';
import DeleteRoundedIcon    from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon      from '@mui/icons-material/EditRounded';
import AddRoundedIcon       from '@mui/icons-material/AddRounded';
import BadgeRoundedIcon     from '@mui/icons-material/BadgeRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import LogoutRoundedIcon  from '@mui/icons-material/EventNoteRounded';

/* ── Keyframes ── */
const STYLES = `
  @keyframes fadeSlideUp {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0);    }
  }
  @keyframes rowIn {
    from { opacity:0; transform:translateX(-12px); }
    to   { opacity:1; transform:translateX(0);     }
  }
  @keyframes fadeIn {
    from { opacity:0; }
    to   { opacity:1; }
  }
  .lm-header-anim { animation: fadeSlideUp .5s  cubic-bezier(.22,1,.36,1) .00s both; }
  .lm-table-anim  { animation: fadeSlideUp .52s cubic-bezier(.22,1,.36,1) .08s both; }
  .lm-empty-anim  { animation: fadeIn .4s ease .1s both; }
`;
if (typeof document !== 'undefined' && !document.getElementById('lm-styles')) {
  const t = document.createElement('style');
  t.id = 'lm-styles'; t.textContent = STYLES;
  document.head.appendChild(t);
}

const SIDEBAR_W = 240;

const TODAY_LABEL = new Date().toLocaleDateString('en-US', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
});

const fmt = (d) => (d ? d.split('T')[0] : '—');

/* ── Status badge ── */
const STATUS_CFG = {
  approved: { bg:'rgba(16,185,129,0.1)',  border:'rgba(16,185,129,0.35)', color:'#047857', dot:'#10b981' },
  pending:  { bg:'rgba(245,158,11,0.1)',  border:'rgba(245,158,11,0.35)', color:'#b45309', dot:'#f59e0b' },
  rejected: { bg:'rgba(239,68,68,0.1)',   border:'rgba(239,68,68,0.35)',  color:'#b91c1c', dot:'#ef4444' },
  leave:    { bg:'rgba(99,102,241,0.08)', border:'rgba(99,102,241,0.3)',  color:'#4f46e5', dot:'#818cf8' },
};
const StatusBadge = ({ status }) => {
  if (!status) return <Typography sx={{ fontSize:'0.75rem', color:'#cbd5e1' }}>—</Typography>;
  const k = status.toLowerCase();
  const c = STATUS_CFG[k] || STATUS_CFG.leave;
  return (
    <Box sx={{ display:'inline-flex', alignItems:'center', gap:'5px', px:'9px', py:'3px', borderRadius:'20px', bgcolor:c.bg, border:`1px solid ${c.border}` }}>
      <Box sx={{ width:6, height:6, borderRadius:'50%', bgcolor:c.dot, flexShrink:0 }} />
      <Typography sx={{ fontSize:'0.68rem', fontWeight:700, color:c.color, textTransform:'capitalize', whiteSpace:'nowrap' }}>
        {status}
      </Typography>
    </Box>
  );
};

/* ── Leave type chip ── */
const LEAVE_TYPE_CFG = {
  sick:     { bg:'rgba(239,68,68,0.08)',   border:'rgba(239,68,68,0.25)',   color:'#b91c1c' },
  casual:   { bg:'rgba(99,102,241,0.08)',  border:'rgba(99,102,241,0.25)',  color:'#4f46e5' },
  annual:   { bg:'rgba(16,185,129,0.08)',  border:'rgba(16,185,129,0.25)',  color:'#047857' },
  maternity:{ bg:'rgba(236,72,153,0.08)',  border:'rgba(236,72,153,0.25)',  color:'#be185d' },
  unpaid:   { bg:'rgba(245,158,11,0.08)',  border:'rgba(245,158,11,0.25)',  color:'#b45309' },
};
const LeaveTypeBadge = ({ type }) => {
  if (!type) return <Typography sx={{ fontSize:'0.75rem', color:'#cbd5e1' }}>—</Typography>;
  const k = type.toLowerCase();
  const c = LEAVE_TYPE_CFG[k] || { bg:'rgba(124,58,237,0.08)', border:'rgba(124,58,237,0.25)', color:'#7c3aed' };
  return (
    <Box sx={{ display:'inline-flex', px:'8px', py:'3px', borderRadius:'7px', bgcolor:c.bg, border:`1px solid ${c.border}` }}>
      <Typography sx={{ fontSize:'0.7rem', fontWeight:700, color:c.color, textTransform:'capitalize', whiteSpace:'nowrap' }}>
        {type}
      </Typography>
    </Box>
  );
};

/* ── Grid cols ── */
const GRID = '44px 80px 1fr 110px 1fr 60px 110px 110px 100px 80px';
const HEADERS = ['#','ID','Name','Leave Type','Reason','Days','Start Date','End Date','Status','Actions'];

/* ════════════════════════════════════════ */
const LeaveManagement = () => {
  const API_URL  = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [leaves, setLeaves]   = useState([]);
  const [animKey, setAnimKey] = useState(0);

  const { userData } = useContext(LoginContext);

  const fetchLeaves = async () => {
    try {
      const res    = await fetch(`${API_URL}/leave-management/getAll`, {
        headers: { 'Content-Type':'application/json', Authorization:`Bearer ${localStorage.getItem('Token')}` },
      });
      const result = await res.json();
      setLeaves(result.data || []);
      setAnimKey(k => k + 1);
    } catch { setLeaves([]); }
  };

  useEffect(() => { fetchLeaves(); }, []);

  const deleteLeave = async (id) => {
    const res    = await fetch(`${API_URL}/leave-management/deleteById/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type':'application/json', Authorization:`Bearer ${localStorage.getItem('Token')}` },
    });
    const result = await res.json();
    if (result.isSuccess) {
      setLeaves(prev => prev.filter(l => l._id !== id));
      setAnimKey(k => k + 1);
      toast.success('Leave deleted successfully');
    }
  };

  const userLogout = () => {
    localStorage.removeItem("Token");
    navigate("/login");
  };

  return (
    <Box className="min-h-screen" sx={{ background:'linear-gradient(135deg,#f8faff 0%,#eef2ff 50%,#f0fdf4 100%)' }}>

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

        </Toolbar>
      </AppBar>

      {/* ── MAIN ── */}
      <Box component="main" sx={{ pt:'32px', minHeight:'100vh' }}>
        <Box sx={{ px:{ xs:2, md:4 }, py:3, display:'flex', flexDirection:'column', gap:3 }}>

          {/* ── Page header ── */}
          <Paper elevation={0} className="lm-header-anim" sx={{
            borderRadius:'20px', border:'1px solid rgba(255,255,255,0.85)',
            bgcolor:'rgba(255,255,255,0.6)', backdropFilter:'blur(12px)',
            px:4, py:3, boxShadow:'0 4px 20px rgba(0,0,0,0.06)',
            display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:3,
          }}>
            {/* Title */}
            <Box>
              <Typography sx={{ fontWeight:900, fontSize:'2.4rem', color:'#0f172a', letterSpacing:'-0.03em', lineHeight:1 }}>
                Leave Management
              </Typography>
              <Typography sx={{ fontSize:'0.82rem', color:'#64748b', fontWeight:500, mt:.8 }}>
                {TODAY_LABEL}
              </Typography>
            </Box>

            <Box sx={{ display:'flex', alignItems:'center', gap:2, flexWrap:'wrap' }}>
              

              {/* Add button */}
              <Button
                variant="contained"
                onClick={() => navigate('/leave-management/add')}
                startIcon={<AddRoundedIcon sx={{ fontSize:'17px !important' }} />}
                sx={{
                  background:'linear-gradient(110deg,#0f0c29,#1a1340 60%,#24243e)',
                  borderRadius:'11px', fontWeight:700, fontSize:'0.82rem',
                  px:2.5, py:1.2, textTransform:'none',
                  boxShadow:'0 4px 14px rgba(15,12,41,0.35)',
                  transition:'all 0.22s ease',
                  '&:hover':{ boxShadow:'0 6px 20px rgba(15,12,41,0.45)', transform:'translateY(-1px)' },
                  '&:active':{ transform:'scale(0.97)' },
                }}
              >
                Add Leave
              </Button>
            </Box>
          </Paper>

          {/* ── Table card ── */}
          <Paper elevation={0} className="lm-table-anim" sx={{
            marginTop: '15px',
            borderRadius:'20px', border:'1px solid rgba(255,255,255,0.85)',
            bgcolor:'rgba(255,255,255,0.75)', backdropFilter:'blur(12px)',
            boxShadow:'0 4px 24px rgba(0,0,0,0.07)', overflow:'hidden',
          }}>
            {/* Column header */}
            <Box sx={{
              display:'grid', gridTemplateColumns:GRID,
              background:'linear-gradient(110deg,#0f0c29,#1a1340 55%,#24243e)',
              px:2, py:'13px',
            }}>
              {HEADERS.map((h, i) => (
                <Box key={h} sx={{ px:'9px', display:'flex', alignItems:'center', justifyContent: i===9 ? 'center' : 'flex-start' }}>
                  <Typography sx={{ padding: '10px 0px 10px', fontSize:'0.70rem', fontWeight:800, color:'white', textTransform:'uppercase', letterSpacing:'1.1px', whiteSpace:'nowrap' }}>
                    {h}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Rows */}
            <Box key={animKey}>
              {leaves.length > 0 ? (
                leaves.map((leave, idx) => (
                  <Box
                    key={leave._id}
                    sx={{
                      display:'grid', gridTemplateColumns:GRID,
                      alignItems:'center', px:2, py:'16px',
                      borderBottom: idx < leaves.length-1 ? '1px solid #f1f5f9' : 'none',
                      transition:'background 0.15s ease',
                      '&:hover':{ bgcolor:'rgba(124,58,237,0.025)' },
                      animation:`rowIn .37s cubic-bezier(.22,1,.36,1) ${idx*42}ms both`,
                    }}
                  >
                    {/* # */}
                    <Box sx={{ px:'9px' }}>
                      <Typography sx={{ fontSize:'0.75rem', color:'black', fontWeight:600 }}>{idx+1}</Typography>
                    </Box>

                    {/* ID */}
                    <Box sx={{ px:'9px' }}>
                      <Box sx={{ display:'inline-flex', alignItems:'center', gap:'4px', bgcolor:'rgba(99,102,241,0.08)', borderRadius:'7px', px:'7px', py:'3px' }}>
                        <BadgeRoundedIcon sx={{ fontSize:11, color:'#6366f1' }} />
                        <Typography sx={{ fontSize:'0.67rem', fontWeight:700, color:'#6366f1', whiteSpace:'nowrap' }}>
                          CL{String(idx+1).padStart(3,'0')}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Name */}
                    <Box sx={{ px:'9px', minWidth:0 }}>
                      <Typography sx={{ fontSize:'0.84rem', fontWeight:700, color:'#0f172a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {leave.empDocId?.fullName || '—'}
                      </Typography>
                    </Box>

                    {/* Leave Type */}
                    <Box sx={{ px:'9px' }}>
                      <LeaveTypeBadge type={leave.leaveType} />
                    </Box>

                    {/* Reason */}
                    <Box sx={{ px:'9px', minWidth:0 }}>
                      <Typography sx={{ fontSize:'0.78rem', color:'#475569', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {leave.reason || '—'}
                      </Typography>
                    </Box>

                    {/* Days */}
                    <Box sx={{ px:'9px' }}>
                      <Box sx={{ display:'inline-flex', px:'8px', py:'3px' }}>
                        <Typography sx={{ fontSize:'0.72rem', fontWeight:800, color:'black' }}>
                          {leave.leaves ?? '—'}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Start Date */}
                    <Box sx={{ px:'9px' }}>
                      <Box sx={{ display:'inline-flex', px:'8px', py:'3px', borderRadius:'7px', bgcolor:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)' }}>
                        <Typography sx={{ fontSize:'0.72rem', fontWeight:600, color:'#047857', whiteSpace:'nowrap' }}>
                          {fmt(leave.startDate)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* End Date */}
                    <Box sx={{ px:'9px' }}>
                      <Box sx={{ display:'inline-flex', px:'8px', py:'3px', borderRadius:'7px', bgcolor:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.2)' }}>
                        <Typography sx={{ fontSize:'0.72rem', fontWeight:600, color:'#4f46e5', whiteSpace:'nowrap' }}>
                          {fmt(leave.endDate)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Status */}
                    <Box sx={{ px:'9px' }}>
                      <StatusBadge status={leave.status} />
                    </Box>

                    {/* Actions */}
                    <Box sx={{ px:'9px', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/leave-management/edit/${leave._id}`)}
                        sx={{
                          width:28, height:28, borderRadius:'8px',
                          bgcolor:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.28)', color:'#b45309',
                          transition:'all 0.18s ease',
                          '&:hover':{ bgcolor:'rgba(245,158,11,0.2)', borderColor:'rgba(245,158,11,0.55)', transform:'scale(1.12)' },
                        }}
                      >
                        <EditRoundedIcon sx={{ fontSize:13 }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => deleteLeave(leave._id)}
                        sx={{
                          width:28, height:28, borderRadius:'8px',
                          bgcolor:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.22)', color:'#b91c1c',
                          transition:'all 0.18s ease',
                          '&:hover':{ bgcolor:'rgba(239,68,68,0.18)', borderColor:'rgba(239,68,68,0.5)', transform:'scale(1.12)' },
                        }}
                      >
                        <DeleteRoundedIcon sx={{ fontSize:13 }} />
                      </IconButton>
                    </Box>
                  </Box>
                ))
              ) : (
                <Box className="lm-empty-anim" sx={{ py:9, display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
                  <Box sx={{ width:64, height:64, borderRadius:'18px', bgcolor:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <EventNoteRoundedIcon sx={{ fontSize:28, color:'#cbd5e1' }} />
                  </Box>
                  <Typography sx={{ color:'#94a3b8', fontWeight:600, fontSize:'0.9rem' }}>
                    No leave records found
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => navigate('/leave-management/add')}
                    startIcon={<AddRoundedIcon />}
                    sx={{
                      background:'linear-gradient(110deg,#0f0c29,#1a1340 60%,#24243e)',
                      borderRadius:'10px', fontWeight:700, textTransform:'none', mt:1,
                      fontSize:'0.8rem', px:2.5, py:1,
                      boxShadow:'0 4px 14px rgba(15,12,41,0.25)',
                    }}
                  >
                    Add First Leave
                  </Button>
                </Box>
              )}
            </Box>

            {/* Footer */}
            {leaves.length > 0 && (
              <Box sx={{
                px:3, py:'11px', borderTop:'1px solid #f1f5f9',
                display:'flex', alignItems:'center', justifyContent:'space-between',
                bgcolor:'rgba(248,250,252,0.8)',
              }}>
                <Typography sx={{ fontSize:'0.76rem', color:'#94a3b8', fontWeight:500 }}>
                  Showing{' '}
                  <span style={{ color:'#0f172a', fontWeight:700 }}>{leaves.length}</span>
                  {' '}leave record{leaves.length !== 1 ? 's' : ''}
                </Typography>
              </Box>
            )}
          </Paper>

        </Box>
      </Box>
    </Box>
  );
};

export default LeaveManagement;