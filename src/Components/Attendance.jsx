import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginContext from '../Contexts/LoginContext';
import { toast } from 'react-toastify';
import ProfileImage from './ProfileImage';
import {
  Modal, Box, AppBar, Toolbar, Chip, Button, Typography, Paper,
} from '@mui/material';
import LogoutRoundedIcon      from '@mui/icons-material/LogoutRounded';
import HistoryRoundedIcon      from '@mui/icons-material/HistoryRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import LoginRoundedIcon        from '@mui/icons-material/LoginRounded';
import MeetingRoomRoundedIcon  from '@mui/icons-material/MeetingRoomRounded';
import AccessTimeRoundedIcon   from '@mui/icons-material/AccessTimeRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import PersonRoundedIcon       from '@mui/icons-material/PersonRounded';
import WorkRoundedIcon         from '@mui/icons-material/WorkRounded';
import CloseRoundedIcon        from '@mui/icons-material/CloseRounded';
import SaveRoundedIcon         from '@mui/icons-material/SaveRounded';
import CheckRoundedIcon        from '@mui/icons-material/CheckRounded';

/* ─────────────────────────────────────────────
   Inject CSS once into <head>
───────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&display=swap');

  @keyframes fadeSlideUp {
    from { opacity:0; transform:translateY(22px); }
    to   { opacity:1; transform:translateY(0);    }
  }
  @keyframes ripple1 {
    0%   { transform:scale(1);    opacity:.55; }
    100% { transform:scale(1.75); opacity:0;   }
  }
  @keyframes ripple2 {
    0%   { transform:scale(1);    opacity:.35; }
    100% { transform:scale(2.15); opacity:0;   }
  }
  @keyframes ripple3 {
    0%   { transform:scale(1);    opacity:.2; }
    100% { transform:scale(2.6);  opacity:0;  }
  }
  @keyframes breathe {
    0%,100% { box-shadow: var(--glow-base); }
    50%      { box-shadow: var(--glow-peak); }
  }
  @keyframes shimmer {
    0%   { left:-120%; }
    55%  { left:140%;  }
    100% { left:140%;  }
  }
  @keyframes spinArc  { to { transform:rotate(360deg); } }
  @keyframes iconPop  {
    0%   { transform:scale(.55) rotate(-20deg); opacity:0; }
    65%  { transform:scale(1.18) rotate(6deg);  opacity:1; }
    100% { transform:scale(1) rotate(0);        opacity:1; }
  }
  @keyframes labelPop {
    0%   { transform:translateY(6px); opacity:0; }
    100% { transform:translateY(0);   opacity:1; }
  }
  @keyframes successPop {
    0%   { transform:scale(0) rotate(-30deg); opacity:0; }
    60%  { transform:scale(1.25) rotate(5deg); opacity:1; }
    100% { transform:scale(1) rotate(0);       opacity:1; }
  }
  @keyframes orb1 {
    0%,100% { transform:translate(0,0)   scale(1);    opacity:.7; }
    33%      { transform:translate(8px,-10px) scale(1.2); opacity:.4; }
    66%      { transform:translate(-6px,8px)  scale(.85); opacity:.6; }
  }
  @keyframes orb2 {
    0%,100% { transform:translate(0,0)   scale(1);    opacity:.5; }
    40%      { transform:translate(-9px,6px) scale(1.15); opacity:.3; }
    70%      { transform:translate(5px,-8px) scale(.9);  opacity:.6; }
  }
  @keyframes orb3 {
    0%,100% { transform:translate(0,0)   scale(1);    opacity:.4; }
    50%      { transform:translate(10px,5px) scale(1.3); opacity:.2; }
  }

  .att-header-anim { animation: fadeSlideUp .5s cubic-bezier(.22,1,.36,1) both; }
  .att-card-anim   { animation: fadeSlideUp .55s cubic-bezier(.22,1,.36,1) .08s both; }
  .att-action-anim { animation: fadeSlideUp .55s cubic-bezier(.22,1,.36,1) .14s both; }

  /* ── The outer stage ── */
  .btn-stage {
    position: relative;
    width: 220px; height: 220px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  /* ripple rings */
  .ring {
    position: absolute; inset: 0; border-radius: 50%;
    border: 2px solid var(--ring-color);
    pointer-events: none;
  }
  .ring1 { animation: ripple1 2.2s ease-out infinite; }
  .ring2 { animation: ripple2 2.2s ease-out .55s infinite; }
  .ring3 { animation: ripple3 2.2s ease-out 1.1s infinite; }

  /* floating orbs */
  .orb { position: absolute; border-radius: 50%; pointer-events: none; filter: blur(1px); }
  .orb1 { width:10px; height:10px; top:22px; left:42px;  background:var(--orb-color); animation: orb1 3.8s ease-in-out infinite; }
  .orb2 { width:7px;  height:7px;  bottom:30px; right:38px; background:var(--orb-color); animation: orb2 4.5s ease-in-out infinite; }
  .orb3 { width:5px;  height:5px;  top:54px; right:28px; background:var(--orb-color); animation: orb3 3.2s ease-in-out infinite; }

  /* main circle button */
  .att-circle {
    position: relative;
    width: 150px; height: 150px;
    border-radius: 50%;
    border: none; cursor: pointer;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 5px;
    overflow: hidden;
    transition: transform .22s cubic-bezier(.34,1.56,.64,1);
    animation: breathe 3.5s ease-in-out infinite;
    outline: none;
    /* border ring */
    box-sizing: border-box;
  }
  /* top gloss */
  .att-circle::before {
    content:'';
    position:absolute; inset:0; border-radius:50%;
    background: radial-gradient(ellipse 65% 40% at 50% 15%, rgba(255,255,255,.32), transparent 70%);
    pointer-events:none;
    z-index:2;
  }
  /* shimmer sweep */
  .att-circle::after {
    content:'';
    position:absolute; top:0; left:-120%; width:55%; height:100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.28), transparent);
    animation: shimmer 4s ease-in-out infinite;
    z-index:3; pointer-events:none;
  }
  .att-circle:hover  { transform: scale(1.08); }
  .att-circle:active { transform: scale(.93); }
  .att-circle:disabled { cursor:not-allowed; opacity:.7; }

  .btn-icon  { animation: iconPop  .4s cubic-bezier(.34,1.56,.64,1) both; z-index:4; position:relative; }
  .btn-label { animation: labelPop .35s cubic-bezier(.34,1.56,.64,1) .08s both; z-index:4; position:relative; }
  .btn-success-icon { animation: successPop .45s cubic-bezier(.34,1.56,.64,1) both; z-index:4; position:relative; }
`;

if (typeof document !== 'undefined' && !document.getElementById('att-styles-v3')) {
  const s = document.createElement('style');
  s.id = 'att-styles-v3';
  s.textContent = STYLES;
  document.head.appendChild(s);
}

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const SIDEBAR_W = 240;
const todayStr  = new Date().toDateString(); // e.g. "Mon Jun 09 2025"
const todayLabel = new Date().toLocaleDateString('en-US', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
});

/** Key scoped to employee + date so it resets each new day automatically */
const storageKey = (empId) => `att_status_${empId}_${todayStr}`;

/** Possible values stored: 'in' | 'out' | null */
const readStatus  = (empId) => empId ? localStorage.getItem(storageKey(empId)) : null;
const writeStatus = (empId, val) => empId && localStorage.setItem(storageKey(empId), val);

/* Live clock */
const LiveClock = () => {
  const [t, setT] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setT(new Date()), 1000); return () => clearInterval(id); }, []);
  return (
    <Typography sx={{
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '3.6rem', fontWeight: 900, color: '#111827',
      lineHeight: 1, fontVariantNumeric: 'tabular-nums',
    }}>
      {t.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </Typography>
  );
};

/* Info chip */
const InfoChip = ({ icon, label, value }) => (
  <Box sx={{ display:'flex', alignItems:'center', gap:'10px', bgcolor:'rgba(124,58,237,.06)', border:'1.5px solid rgba(124,58,237,.15)', borderRadius:'12px', px:'16px', py:'10px' }}>
    <Box sx={{ color:'#7c3aed', display:'flex' }}>{icon}</Box>
    <Box>
      <Typography sx={{ fontSize:'.6rem', fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'1px' }}>{label}</Typography>
      <Typography sx={{ fontSize:'.875rem', fontWeight:700, color:'#111827', lineHeight:1.2 }}>{value || '—'}</Typography>
    </Box>
  </Box>
);

/* Form field wrapper */
const Field = ({ label, children }) => (
  <Box>
    <Typography sx={{ fontSize:'.78rem', fontWeight:600, color:'#374151', mb:'6px', display:'block' }}>{label}</Typography>
    {children}
  </Box>
);

const inputSx = {
  width:'100%', borderRadius:'10px', border:'1.5px solid #e5e7eb',
  background:'#f9fafb', padding:'10px 14px',
  fontSize:'.875rem', color:'#111827', outline:'none',
  fontFamily:'inherit', transition:'border-color .2s ease', boxSizing:'border-box',
};

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
const Attendance = () => {
  const { userData }  = useContext(LoginContext);
  const API_URL       = import.meta.env.VITE_API_URL;
  const navigate      = useNavigate();

  const [empName, setEmpName]       = useState('');
  const [empPos,  setEmpPos]        = useState('');
  const [empDocId, setEmpDocId]     = useState('');
  const [cloUser,  setCloUser]      = useState('');

  // 'idle' | 'in' | 'out'   (reflects today's state, persisted)
  const [attState, setAttState]     = useState('idle');
  const [attLoading, setAttLoading] = useState(false);
  // flash a success checkmark briefly after click
  const [justDone, setJustDone]     = useState(false);

  // Leave modal
  const [showModal, setShowModal]   = useState(false);
  const [leaveType, setLeaveType]   = useState('');
  const [leaves, setLeaves]         = useState(0);
  const [startDate, setStartDate]   = useState('');
  const [endDate, setEndDate]       = useState('');
  const [reason, setReason]         = useState('');

  /* ── Bootstrap user ── */
  useEffect(() => {
    if (!userData) return;
    const name = userData.fullName || '';
    const pos  = userData.position || '';
    const did  = userData._id      || '';
    const cid  = userData.employeeId || '';
    setEmpName(name); setEmpPos(pos); setEmpDocId(did); setCloUser(cid);

    // Restore today's status from localStorage
    const saved = readStatus(did);
    if (saved === 'in')  setAttState('in');
    else if (saved === 'out') setAttState('out');
    else setAttState('idle');
  }, [userData]);

  /* ── Leave days calc ── */
  useEffect(() => {
    if (!startDate || !endDate) return;
    const d = Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000) + 1;
    setLeaves(d > 0 ? d : 0);
  }, [startDate, endDate]);

  /* ── Attendance handler ── */
  const handleAttendance = async () => {
    if (attLoading) return;
    const isTimingIn = attState !== 'in'; // 'idle' or 'out' → time-in; 'in' → time-out
    setAttLoading(true);
    try {
      const res    = await fetch(`${API_URL}/attendance/create`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', Authorization:`Bearer ${localStorage.getItem('Token')}` },
        body: JSON.stringify({ empId: cloUser, reason: isTimingIn ? 'employee login' : 'employee logout' }),
      });
      const result = await res.json();
      if (result?.isSuccess) {
        toast.success(result.message);
        const next = isTimingIn ? 'in' : 'out';
        writeStatus(empDocId, next);
        setAttState(next);
        setJustDone(true);
        setTimeout(() => setJustDone(false), 1400);
      } else {
        toast.info(result?.message || 'Already recorded');
      }
    } catch { toast.error('Something went wrong'); }
    finally  { setAttLoading(false); }
  };

  /* ── Leave submit ── */
  const submitLeave = async () => {
    if (!leaveType || !startDate || !endDate || !reason) { toast.error('Please fill in all fields'); return; }
    const res    = await fetch(`${API_URL}/leave-management/create`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', Authorization:`Bearer ${localStorage.getItem('Token')}` },
      body: JSON.stringify({ empDocId: empDocId, leaveType, leaves: Number(leaves), startDate, endDate, reason, status:'pending' }),
    });
    const result = await res.json();
    if (result.isSuccess) {
      toast.success('Leave request submitted');
      setShowModal(false);
      setLeaveType(''); setLeaves(0); setStartDate(''); setEndDate(''); setReason('');
    } else { toast.error('Something went wrong'); }
  };

  const userLogout = () => { localStorage.removeItem('Token'); navigate('/login'); };

  /* ── Derive button visuals from attState ── */
  const isIn       = attState === 'in';
  const btnColors  = isIn
    ? { g1:'#ff5e5e', g2:'#ef4444', g3:'#c81e1e', glow:'rgba(239,68,68,.45)', ring:'rgba(239,68,68,.5)',  orb:'rgba(255,120,120,.7)',  border:'rgba(255,255,255,.18)' }
    : { g1:'#4ade80', g2:'#22c55e', g3:'#15803d', glow:'rgba(34,197,94,.45)',  ring:'rgba(34,197,94,.5)',  orb:'rgba(100,255,160,.7)',  border:'rgba(255,255,255,.18)' };
  const btnLabel   = isIn ? 'TIME OUT' : 'TIME IN';
  const BtnIcon    = isIn ? MeetingRoomRoundedIcon : LoginRoundedIcon;
  const statusText = attState === 'idle' ? 'Not yet clocked in'
                   : attState === 'in'   ? 'Clocked in — active'
                   :                       'Clocked out for today';
  const statusColor = attState === 'in' ? '#16a34a' : attState === 'out' ? '#9ca3af' : '#b45309';
  const statusBg    = attState === 'in' ? 'rgba(34,197,94,.08)'  : attState === 'out' ? 'rgba(156,163,175,.08)' : 'rgba(245,158,11,.08)';
  const statusBord  = attState === 'in' ? 'rgba(34,197,94,.25)'  : attState === 'out' ? 'rgba(156,163,175,.2)'  : 'rgba(245,158,11,.25)';
  const dotColor    = attState === 'in' ? '#22c55e' : attState === 'out' ? '#9ca3af' : '#f59e0b';

  return (
    <Box className="min-h-screen" sx={{ background:'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 50%, #ede9fe 100%)' }}>

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
          <ProfileImage />

        </Toolbar>
      </AppBar>

      {/* ── MAIN ── */}
      <Box component="main" sx={{ mt: '25px', pt:'20px', pb: '20px' }} className="min-h-screen">
        <Box sx={{ px:{ xs:3, lg:2 }, py:3, display:'flex', flexDirection:'column', gap:4, maxWidth:'1200px' }}>

          {/* ── Page header ── */}
          {/* <Paper elevation={0} className="att-header-anim" sx={{ p:'24px 32px', borderRadius:'16px', border:'1px solid rgba(255,255,255,.8)', backdropFilter:'blur(12px)', background:'rgba(255,255,255,.5)', boxShadow:'0 4px 16px rgba(0,0,0,.06)' }}>
            <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:3, flexWrap:'wrap' }}>
              <Box>
                <Typography sx={{ fontFamily:"'Syne',sans-serif", fontWeight:900, fontSize:'2.5rem', color:'#111827', letterSpacing:'-.02em', lineHeight:1 }}>Attendance</Typography>
                <Typography sx={{ color:'#6b7280', fontWeight:500, mt:.8, fontSize:'.875rem' }}>{todayLabel}</Typography>
              </Box>
              <Box sx={{ display:'flex', gap:1.5, flexWrap:'wrap' }}>
                <InfoChip icon={<PersonRoundedIcon sx={{ fontSize:18 }} />} label="Employee" value={empName} />
                <InfoChip icon={<WorkRoundedIcon   sx={{ fontSize:18 }} />} label="Position"  value={empPos}  />
              </Box>
            </Box>
          </Paper> */}

          {/* ── Attendance card ── */}
          <Paper elevation={0} className="att-card-anim" sx={{ borderRadius:'20px', border:'1px solid rgba(255,255,255,.8)', background:'rgba(255,255,255,.72)', backdropFilter:'blur(16px)', boxShadow:'0 8px 32px rgba(0,0,0,.09)', overflow:'hidden' }}>

            {/* Header strip */}
            {/* <Box sx={{ background:'linear-gradient(110deg, #0f0c29 0%, #1a1340 55%, #24243e 100%)', px:4, py:'14px', display:'flex', alignItems:'center', gap:'8px' }}>
              <AccessTimeRoundedIcon sx={{ fontSize:14, color:'#a78bfa' }} />
              <Typography sx={{ fontSize:'.7rem', fontWeight:800, color:'white', textTransform:'uppercase', letterSpacing:'1.1px' }}>Mark Attendance</Typography>
            </Box> */}

            <Box sx={{ p:{ xs:4, md:5 }, display:'flex', flexDirection:{ xs:'column', md:'row' }, alignItems:'center', gap:{ xs:4, md:6 } }}>

              {/* ── Left: clock + status ── */}
              <Box sx={{ display:'flex', flexDirection:'column', alignItems:{ xs:'center', md:'flex-start' }, gap:1, flex:1 }}>
                <Box sx={{ display:'flex', alignItems:'center', gap:'6px', mb:'2px' }}>
                  <CalendarTodayRoundedIcon sx={{ fontSize:13, color:'#9ca3af' }} />
                  <Typography sx={{ fontSize:'.72rem', color:'#9ca3af', fontWeight:500 }}>Current Time</Typography>
                </Box>
                <LiveClock />
                <Typography sx={{ fontSize:'.78rem', color:'#6b7280', fontWeight:500, mt:'2px' }}>
                  {new Date().toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' })}
                </Typography>

                {/* Status pill */}
                <Box sx={{ mt:2, display:'inline-flex', alignItems:'center', gap:'8px', px:'14px', py:'6px', borderRadius:'999px', bgcolor: statusBg, border:`1px solid ${statusBord}` }}>
                  <Box sx={{ width:8, height:8, borderRadius:'50%', bgcolor: dotColor, boxShadow:`0 0 7px ${dotColor}` }} />
                  <Typography sx={{ fontSize:'.75rem', fontWeight:700, color: statusColor }}>{statusText}</Typography>
                </Box>

                {/* Time-in timestamp (if timed in today) */}
                {attState === 'in' && (
                  <Typography sx={{ mt:.5, fontSize:'.7rem', color:'#9ca3af' }}>
                    Session started · {new Date().toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })}
                  </Typography>
                )}
              </Box>

              {/* divider */}
              <Box sx={{ width:{ xs:'100%', md:'1px' }, height:{ xs:'1px', md:'160px' }, bgcolor:'rgba(0,0,0,.07)', flexShrink:0 }} />

              {/* ── Right: THE BUTTON ── */}
              <Box sx={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2.5, flex:1 }}>

                {/* Question line */}
                <Typography sx={{ fontSize:'.8rem', color:'#6b7280', fontWeight:600, textAlign:'center' }}>
                  {attState === 'in' ? 'Ready to wrap up for today?' : attState === 'out' ? 'All done for today 🎉' : 'Ready to start your day?'}
                </Typography>

                {/* ── Button stage ── */}
                {attState !== 'out' ? (
                  <Box
                    className="btn-stage"
                    style={{ '--ring-color': btnColors.ring, '--orb-color': btnColors.orb }}
                  >
                    {/* pulse rings */}
                    {!attLoading && <><Box className="ring ring1" /><Box className="ring ring2" /><Box className="ring ring3" /></>}

                    {/* floating orbs */}
                    {!attLoading && <><Box className="orb orb1" /><Box className="orb orb2" /><Box className="orb orb3" /></>}

                    {/* outer glow border ring */}
                    <Box sx={{
                      position:'absolute', inset: -6, borderRadius:'50%',
                      border:`2px solid ${isIn ? 'rgba(239,68,68,.22)' : 'rgba(34,197,94,.22)'}`,
                      pointerEvents:'none',
                    }} />

                    <button
                      className="att-circle"
                      onClick={handleAttendance}
                      disabled={attLoading}
                      style={{
                        '--glow-base': isIn
                          ? '0 0 30px 6px rgba(239,68,68,.3), 0 8px 30px rgba(239,68,68,.35), inset 0 1px 0 rgba(255,255,255,.2)'
                          : '0 0 30px 6px rgba(34,197,94,.3),  0 8px 30px rgba(34,197,94,.35),  inset 0 1px 0 rgba(255,255,255,.2)',
                        '--glow-peak': isIn
                          ? '0 0 55px 14px rgba(239,68,68,.45), 0 12px 45px rgba(239,68,68,.5), inset 0 1px 0 rgba(255,255,255,.2)'
                          : '0 0 55px 14px rgba(34,197,94,.45),  0 12px 45px rgba(34,197,94,.5),  inset 0 1px 0 rgba(255,255,255,.2)',
                        background: isIn
                          ? `radial-gradient(circle at 40% 35%, ${btnColors.g1}, ${btnColors.g2} 55%, ${btnColors.g3})`
                          : `radial-gradient(circle at 40% 35%, ${btnColors.g1}, ${btnColors.g2} 55%, ${btnColors.g3})`,
                        border: `3px solid ${btnColors.border}`,
                      }}
                    >
                      {attLoading ? (
                        <Box sx={{ width:34, height:34, borderRadius:'50%', border:'3.5px solid rgba(255,255,255,.3)', borderTopColor:'white', animation:'spinArc .7s linear infinite' }} />
                      ) : justDone ? (
                        <Box className="btn-success-icon" sx={{ color:'white', display:'flex', alignItems:'center' }}>
                          <CheckRoundedIcon sx={{ fontSize:52, filter:'drop-shadow(0 2px 6px rgba(0,0,0,.25))' }} />
                        </Box>
                      ) : (
                        <>
                          <Box className="btn-icon" key={isIn ? 'out' : 'in'} sx={{ color:'white', display:'flex', alignItems:'center' }}>
                            <BtnIcon sx={{ fontSize:44, filter:'drop-shadow(0 3px 6px rgba(0,0,0,.28))' }} />
                          </Box>
                          <Typography className="btn-label" sx={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize:'0.8rem', fontWeight:900, color:'white',
                            textTransform:'uppercase', letterSpacing:'5.5px',
                            textShadow:'0 1px 4px rgba(0,0,0,.25)',
                          }}>
                            {btnLabel}
                          </Typography>
                        </>
                      )}
                    </button>
                  </Box>
                ) : (
                  /* ── All-done state ── */
                  <Box sx={{
                    width:150, height:150, borderRadius:'50%',
                    background:'radial-gradient(circle at 40% 35%, #a3e635, #84cc16 55%, #4d7c0f)',
                    border:'3px solid rgba(255,255,255,.2)',
                    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'5px',
                    boxShadow:'0 0 36px rgba(132,204,22,.35), 0 8px 24px rgba(132,204,22,.3)',
                  }}>
                    <CheckRoundedIcon sx={{ fontSize:46, color:'white', filter:'drop-shadow(0 2px 6px rgba(0,0,0,.2))' }} />
                    <Typography sx={{ fontFamily:"'Syne',sans-serif", fontSize:'.65rem', fontWeight:900, color:'white', letterSpacing:'2px', textTransform:'uppercase' }}>
                      Done
                    </Typography>
                  </Box>
                )}

                {/* Sub caption */}
                <Typography sx={{ fontSize:'.72rem', color:'#9ca3af', textAlign:'center', maxWidth:200, lineHeight:1.5 }}>
                  {attState === 'out'
                    ? 'Your attendance for today is complete'
                    : attState === 'in'
                    ? 'Tap to record your time out'
                    : 'Tap to record your time in'}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* ── Quick Actions ── */}
          <Paper elevation={0} className="att-action-anim" sx={{ borderRadius:'16px', border:'1px solid rgba(255,255,255,.8)', background:'rgba(255,255,255,.72)', backdropFilter:'blur(12px)', boxShadow:'0 4px 24px rgba(0,0,0,.07)', overflow:'hidden' }}>
            <Box sx={{ background:'linear-gradient(110deg, #0f0c29 0%, #1a1340 55%, #24243e 100%)', px:4, py:'18px', display:'flex', alignItems:'center', gap:'8px' }}>
              <EventAvailableRoundedIcon sx={{ fontSize:14, color:'#a78bfa' }} />
              <Typography sx={{ fontSize:'0.9rem', fontWeight:800, color:'white', textTransform:'uppercase', letterSpacing:'1.1px' }}>Quick Actions</Typography>
            </Box>
            <Box sx={{ p:3, display:'flex', gap:2, flexWrap:'wrap' }}>
              {[
                { label:'Attendance History', sub:'View your past records', icon:<HistoryRoundedIcon sx={{ fontSize:20 }} />, color:'#6366f1', action:() => navigate('/history') },
                { label:'Request Leave',      sub:'Submit a leave request',  icon:<EventAvailableRoundedIcon sx={{ fontSize:20 }} />, color:'#7c3aed', action:() => setShowModal(true) },
              ].map((a) => (
                <Box key={a.label} onClick={a.action} sx={{
                  flex:'1 1 200px', display:'flex', alignItems:'center', gap:'12px',
                  p:'16px 20px', borderRadius:'12px', cursor:'pointer',
                  bgcolor:`${a.color}0d`, border:`1.5px solid ${a.color}2e`,
                  transition:'all .2s ease',
                  '&:hover':{ bgcolor:`${a.color}1a`, borderColor:`${a.color}55`, transform:'translateY(-2px)', boxShadow:`0 6px 20px ${a.color}22` },
                  '&:active':{ transform:'scale(.97)' },
                }}>
                  <Box sx={{ width:40, height:40, borderRadius:'10px', bgcolor:`${a.color}18`, display:'flex', alignItems:'center', justifyContent:'center', color:a.color }}>
                    {a.icon}
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize:'.875rem', fontWeight:700, color:'#111827' }}>{a.label}</Typography>
                    <Typography sx={{ fontSize:'.72rem', color:'#9ca3af', mt:'1px' }}>{a.sub}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>

        </Box>
      </Box>

      {/* ── REQUEST LEAVE MODAL ── */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: "880px",
            height: "90vh",             
            bgcolor: "white",
            borderRadius: "20px",
            boxShadow: "0 25px 80px rgba(0,0,0,.3)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",          
            animation: "fadeSlideUp .3s cubic-bezier(.22,1,.36,1) both",
          }}
        >
          {/* Modal top bar */}
          <Box sx={{ background:'linear-gradient(110deg, #0f0c29 0%, #1a1340 55%, #24243e 100%)', px:4, py:'18px', display:'flex', alignItems:'center', justifyContent:'space-between', borderTopLeftRadius:'20px', borderTopRightRadius:'20px' }}>
            <Box sx={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <EventAvailableRoundedIcon sx={{ fontSize:18, color:'#a78bfa' }} />
              <Typography sx={{ fontSize:'1rem', fontWeight:800, color:'white' }}>Request Leave</Typography>
            </Box>
            <Box component="button" onClick={() => setShowModal(false)} sx={{ width:32, height:32, borderRadius:'8px', border:'1px solid rgba(255,255,255,.15)', bgcolor:'rgba(255,255,255,.08)', color:'rgba(255,255,255,.7)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'all .2s', '&:hover':{ bgcolor:'rgba(255,255,255,.15)', color:'white' } }}>
              <CloseRoundedIcon sx={{ fontSize:16 }} />
            </Box>
          </Box>

          <Box
            sx={{
              flex: 1,
              p: 4,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            <Box sx={{ display:'grid', gridTemplateColumns:{ xs:'1fr', sm:'1fr 1fr' }, gap:2.5 }}>
              <Field label="Employee Name"><input readOnly value={empName} style={{ ...inputSx, color:'#6b7280', cursor:'default' }} /></Field>
              <Field label="Position"><input readOnly value={empPos} style={{ ...inputSx, color:'#6b7280', cursor:'default' }} /></Field>
              <Field label="Leave Type">
                <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} style={{ ...inputSx, cursor:'pointer' }}
                  onFocus={(e) => e.target.style.borderColor='#7c3aed'} onBlur={(e) => e.target.style.borderColor='#e5e7eb'}>
                  <option value="">Select Leave Type</option>
                  {['Sick Leave','Annual Leave','Maternity Leave','Paternity Leave','Unpaid Leave','Study Leave','Emergency Leave','Public Holiday','Special Leave'].map((t) => (
                    <option key={t} value={t.toLowerCase()}>{t}</option>
                  ))}
                </select>
              </Field>
              <Field label="Number of Days"><input readOnly value={leaves ? `${leaves} day${leaves > 1 ? 's' : ''}` : '—'} style={{ ...inputSx, color:'#6366f1', fontWeight:700, cursor:'default' }} /></Field>
              <Field label="Start Date"><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputSx} onFocus={(e) => e.target.style.borderColor='#7c3aed'} onBlur={(e) => e.target.style.borderColor='#e5e7eb'} /></Field>
              <Field label="End Date"><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={inputSx} onFocus={(e) => e.target.style.borderColor='#7c3aed'} onBlur={(e) => e.target.style.borderColor='#e5e7eb'} /></Field>
            </Box>
            <Field label="Reason">
              <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Describe the reason for your leave…"
                style={{ ...inputSx, resize:'vertical', minHeight:'80px' }}
                onFocus={(e) => e.target.style.borderColor='#7c3aed'} onBlur={(e) => e.target.style.borderColor='#e5e7eb'} />
            </Field>
            <Box sx={{ display:'flex', justifyContent:'flex-end', gap:1.5, mt:1 }}>
              <Button onClick={() => setShowModal(false)} sx={{ px:3, py:1, borderRadius:'10px', textTransform:'none', fontWeight:600, color:'#6b7280', border:'1.5px solid #e5e7eb', bgcolor:'#f9fafb', '&:hover':{ bgcolor:'#f3f4f6' } }}>Cancel</Button>
              <Button onClick={submitLeave} variant="contained"
                startIcon={<SaveRoundedIcon sx={{ fontSize:'16px !important' }} />}
                sx={{ px:3, py:1, borderRadius:'10px', textTransform:'none', fontWeight:700, background:'linear-gradient(110deg,#0f0c29 0%,#1a1340 60%,#24243e 100%)', boxShadow:'0 4px 14px rgba(15,12,41,.35)', '&:hover':{ boxShadow:'0 6px 20px rgba(15,12,41,.45)', transform:'translateY(-1px)' }, '&:active':{ transform:'scale(.97)' } }}>
                Submit Request
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Attendance;