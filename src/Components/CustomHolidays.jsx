import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useContext } from 'react';
import ProfileImage from './ProfileImage';
import { useNavigate } from 'react-router-dom';
import LoginContext from '../Contexts/LoginContext';
import {
  Box,
  Button,
  Paper,
  IconButton,
  TextField,
  Typography,
  AppBar,
  Toolbar,
  Chip,
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import UpdateRoundedIcon from '@mui/icons-material/UpdateRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import BeachAccessRoundedIcon from '@mui/icons-material/BeachAccessRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import LogoutRoundedIcon           from "@mui/icons-material/LogoutRounded";

/* ── Keyframes ── */
const STYLES = `
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes rowIn {
    from { opacity: 0; transform: translateX(-10px); }
    to   { opacity: 1; transform: translateX(0);     }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  .ch-anim-1 { animation: fadeSlideUp 0.48s cubic-bezier(0.22,1,0.36,1) 0.00s both; }
  .ch-anim-2 { animation: fadeSlideUp 0.48s cubic-bezier(0.22,1,0.36,1) 0.08s both; }
  .ch-anim-3 { animation: fadeSlideUp 0.48s cubic-bezier(0.22,1,0.36,1) 0.16s both; }
  .ch-empty  { animation: fadeIn 0.4s ease 0.1s both; }
`;
if (typeof document !== 'undefined' && !document.getElementById('ch-styles')) {
  const tag = document.createElement('style');
  tag.id = 'ch-styles';
  tag.textContent = STYLES;
  document.head.appendChild(tag);
}

const SIDEBAR_W = 240;
const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

const TODAY_LABEL = new Date().toLocaleDateString('en-US', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
});

const DAY_SHORT = { monday:'Mon', tuesday:'Tue', wednesday:'Wed', thursday:'Thu', friday:'Fri', saturday:'Sat', sunday:'Sun' };

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px', bgcolor: '#f8fafc', fontSize: '0.875rem',
    '& fieldset': { borderColor: '#e2e8f0' },
    '&:hover fieldset': { borderColor: '#c4b5fd' },
    '&.Mui-focused fieldset': { borderColor: '#7c3aed', borderWidth: '1.5px' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#7c3aed' },
};

const CustomHolidays = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [savedDays, setSavedDays]     = useState(() => {
    const s = localStorage.getItem('selectedDays');
    return s ? JSON.parse(s) : ['saturday','sunday'];
  });
  const [selectedDays, setSelectedDays]   = useState(savedDays);
  const [holidayName, setHolidayName]     = useState('');
  const [startDate, setStartDate]         = useState('');
  const [endDate, setEndDate]             = useState('');
  const [holidayData, setHolidayData]     = useState([]);
  const [isEditing, setIsEditing]         = useState(false);
  const [editHolidayId, setEditHolidayId] = useState('');
  const [removeDelete, setRemoveDelete]   = useState(false);
  const [rowAnimKey, setRowAnimKey]       = useState(0);

  const navigate = useNavigate();

  useEffect(() => { setSelectedDays(savedDays); }, []);
  useEffect(() => { getHolidayData(); }, []);

  const formatDate = (d) => (d ? d.split('T')[0] : '');

  const toggleDay = (day) =>
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );

  const handleWeekOffHolidays = async () => {
    if (JSON.stringify(savedDays) === JSON.stringify(selectedDays)) {
      toast.info('No changes to save!'); return;
    }
    await fetch(`${API_URL}/weekly-off-days/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('Token')}` },
      body: JSON.stringify({ offDays: selectedDays }),
    });
    localStorage.setItem('selectedDays', JSON.stringify(selectedDays));
    setSavedDays(selectedDays);
    toast.success('Week off days saved successfully!');
  };

  const getHolidayData = async () => {
    const res    = await fetch(`${API_URL}/custom-holidays/get`, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('Token')}` },
    });
    const result = await res.json();
    setHolidayData(result.data || []);
  };

  const saveHoliday = async () => {
    if (!isEditing) {
      const res    = await fetch(`${API_URL}/custom-holidays/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('Token')}` },
        body: JSON.stringify({ holidayName, startDate, endDate }),
      });
      const result = await res.json();
      if (result.isSuccess) {
        setHolidayData(prev => [...prev, result.data]);
        setRowAnimKey(k => k + 1);
        toast.success('Holiday added successfully');
        setHolidayName(''); setStartDate(''); setEndDate('');
      } else if (!holidayName || !startDate || !endDate) {
        toast.error('Enter the Holiday');
      } else { toast.error('Holiday not added'); }
    } else {
      if (!holidayName || !startDate || !endDate) { toast.error('All fields are required'); return; }
      const old = holidayData.find(h => h._id === editHolidayId);
      if (old && old.holidayName === holidayName && formatDate(old.startDate) === startDate && formatDate(old.endDate) === endDate) {
        toast.info('No changes detected'); return;
      }
      const res    = await fetch(`${API_URL}/custom-holidays/update/${editHolidayId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('Token')}` },
        body: JSON.stringify({ holidayName, startDate: formatDate(startDate), endDate: formatDate(endDate) }),
      });
      const result = await res.json();
      if (result.isSuccess) {
        setHolidayData(prev => prev.map(h => h._id === editHolidayId ? result.data : h));
        setRowAnimKey(k => k + 1);
        toast.success('Holiday updated successfully');
        setHolidayName(''); setStartDate(''); setEndDate('');
        setIsEditing(false); setRemoveDelete(false);
      } else { toast.error('Something went wrong'); }
    }
  };

  const editHoliday = (id) => {
    const h = holidayData.find(h => h._id === id);
    if (h) {
      setRemoveDelete(true); setIsEditing(true); setEditHolidayId(id);
      setHolidayName(h.holidayName); setStartDate(formatDate(h.startDate)); setEndDate(formatDate(h.endDate));
    }
  };

  const cancelEdit = () => {
    setIsEditing(false); setRemoveDelete(false);
    setHolidayName(''); setStartDate(''); setEndDate('');
  };

  const deleteHoliday = async (id) => {
    if (removeDelete) { toast.error('Cannot delete while updating'); return; }
    const res    = await fetch(`${API_URL}/custom-holidays/delete/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('Token')}` },
    });
    const result = await res.json();
    if (result.isSuccess) {
      setHolidayData(prev => prev.filter(h => h._id !== id));
      setRowAnimKey(k => k + 1);
      toast.success('Holiday deleted successfully');
    } else { toast.error('Holiday not deleted'); }
  };

  const { userData, setUserData } = useContext(LoginContext);

  const userLogout = () => {
    localStorage.removeItem("Token");
    setUserData(null);
    navigate("/login");
  };

  return (
    <Box className="min-h-screen" sx={{ background: 'linear-gradient(135deg,#f8faff 0%,#eef2ff 50%,#f0fdf4 100%)' }}>

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

      <Box component="main" sx={{ pt: '32px', minHeight: '100vh' }}>
        <Box sx={{ px: { xs: 2, md: 4 }, py: 3, display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 1100, mx: 'auto' }}>

          {/* ── Page header ── */}
          <Paper elevation={0} className="ch-anim-1" sx={{
            borderRadius: '20px', border: '1px solid rgba(255,255,255,0.85)',
            bgcolor: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)',
            px: 4, py: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2,
          }}>
            <Box>
              <Typography sx={{ fontWeight: 900, fontSize: '2.4rem', color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1 }}>
                Holidays
              </Typography>
              <Typography sx={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500, mt: 0.8 }}>
                {TODAY_LABEL}
              </Typography>
            </Box>
          </Paper>

          {/* ── Week Off Days ── */}
          <Paper elevation={0} className="ch-anim-2" sx={{
            marginTop: '15px',
            borderRadius: '20px', border: '1px solid rgba(255,255,255,0.85)',
            bgcolor: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden',
          }}>
            {/* Card header */}
            <Box sx={{
              px: 3, py: '14px',
              background: 'linear-gradient(110deg,#0f0c29,#1a1340 55%,#24243e)',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <Box sx={{ width: 32, height: 32, borderRadius: '9px', bgcolor: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CalendarMonthRoundedIcon sx={{ fontSize: 16, color: '#a78bfa' }} />
              </Box>
              <Typography sx={{ color: '#e2d9fc', fontWeight: 800, fontSize: '0.95rem' }}>Week Off Days</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', ml: 'auto' }}>
                Select which days are weekly off
              </Typography>
            </Box>

            <Box sx={{ px: 3, py: 3 }}>
              {/* Day pills */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px', mb: 3 }}>
                {DAYS.map((day, i) => {
                  const active = selectedDays.includes(day);
                  return (
                    <Box
                      key={day}
                      onClick={() => toggleDay(day)}
                      sx={{
                        px: '14px', py: '8px', borderRadius: '20px', cursor: 'pointer',
                        userSelect: 'none', transition: 'all 0.2s ease',
                        display: 'flex', alignItems: 'center', gap: '6px',
                        border: '1.5px solid',
                        borderColor: active ? 'rgba(99,102,241,0.5)' : '#e2e8f0',
                        bgcolor: active ? 'rgba(99,102,241,0.08)' : '#f8fafc',
                        boxShadow: active ? '0 2px 8px rgba(99,102,241,0.2)' : 'none',
                        '&:hover': { borderColor: 'rgba(99,102,241,0.4)', bgcolor: 'rgba(99,102,241,0.05)' },
                        animation: `fadeSlideUp 0.3s cubic-bezier(0.22,1,0.36,1) ${i * 30}ms both`,
                      }}
                    >
                      {active
                        ? <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <CheckRoundedIcon sx={{ fontSize: 10, color: '#fff' }} />
                          </Box>
                        : <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#cbd5e1', flexShrink: 0 }} />
                      }
                      <Typography sx={{ fontSize: '0.78rem', fontWeight: active ? 700 : 500, color: active ? '#4f46e5' : '#64748b', textTransform: 'capitalize' }}>
                        {DAY_SHORT[day]}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handleWeekOffHolidays}
                  startIcon={<SaveRoundedIcon sx={{ fontSize: '17px !important' }} />}
                  sx={{
                    background: 'linear-gradient(110deg,#0f0c29,#1a1340 60%,#24243e)',
                    borderRadius: '10px', fontWeight: 700, fontSize: '0.82rem',
                    px: 2.5, py: 1, textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(15,12,41,0.3)',
                    transition: 'all 0.22s ease',
                    '&:hover': { boxShadow: '0 6px 20px rgba(15,12,41,0.4)', transform: 'translateY(-1px)' },
                    '&:active': { transform: 'scale(0.97)' },
                  }}
                >
                  Save Week Offs
                </Button>
              </Box>
            </Box>
          </Paper>

          {/* ── Holiday Management ── */}
          <Paper elevation={0} className="ch-anim-3" sx={{
            marginTop: '10px',
            borderRadius: '20px', border: '1px solid rgba(255,255,255,0.85)',
            bgcolor: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden',
          }}>
            {/* Card header */}
            <Box sx={{
              px: 3, py: '14px',
              background: 'linear-gradient(110deg,#0f0c29,#1a1340 55%,#24243e)',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <Box sx={{ width: 32, height: 32, borderRadius: '9px', bgcolor: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BeachAccessRoundedIcon sx={{ fontSize: 16, color: '#a78bfa' }} />
              </Box>
              <Typography sx={{ color: '#e2d9fc', fontWeight: 800, fontSize: '0.95rem' }}>Holiday Management</Typography>
              {isEditing && (
                <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: '6px', px: '10px', py: '4px', borderRadius: '8px', bgcolor: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#fbbf24' }}>Editing mode</Typography>
                  <IconButton size="small" onClick={cancelEdit} sx={{ color: '#fbbf24', width: 18, height: 18, '&:hover': { color: '#fff' } }}>
                    <CloseRoundedIcon sx={{ fontSize: 12 }} />
                  </IconButton>
                </Box>
              )}
            </Box>

            {/* Form */}
            <Box sx={{ px: 3, pt: 3, pb: 2 }}>
              <Box sx={{ padding: '15px 0px 15px', display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr auto', gap: '12px', alignItems: 'flex-end' }}>
                <TextField
                  label="Holiday Name"
                  value={holidayName}
                  onChange={e => setHolidayName(e.target.value)}
                  size="small"
                  placeholder="e.g. Eid ul Fitr"
                  InputLabelProps={{ shrink: true }}
                  sx={inputSx}
                />
                <TextField
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={inputSx}
                />
                <TextField
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={inputSx}
                />
                <Button
                  variant="contained"
                  onClick={saveHoliday}
                  startIcon={isEditing
                    ? <UpdateRoundedIcon sx={{ fontSize: '16px !important' }} />
                    : <SaveRoundedIcon  sx={{ fontSize: '16px !important' }} />
                  }
                  sx={{
                    background: isEditing
                      ? 'linear-gradient(110deg,#92400e,#b45309)'
                      : 'linear-gradient(110deg,#0f0c29,#1a1340 60%,#24243e)',
                    borderRadius: '10px', fontWeight: 700, fontSize: '0.82rem',
                    px: 2.5, py: '8.5px', textTransform: 'none', whiteSpace: 'nowrap',
                    boxShadow: '0 4px 14px rgba(15,12,41,0.25)',
                    transition: 'all 0.22s ease',
                    '&:hover': { boxShadow: '0 6px 18px rgba(15,12,41,0.35)', transform: 'translateY(-1px)' },
                    '&:active': { transform: 'scale(0.97)' },
                  }}
                >
                  {isEditing ? 'Update' : 'Add Holiday'}
                </Button>
              </Box>
            </Box>

            {/* Table header */}
            <Box sx={{
              display: 'grid', gridTemplateColumns: '48px 1fr 130px 130px 90px',
              background: 'linear-gradient(110deg,#0f0c29,#1a1340 55%,#24243e)',
              px: 3, py: '11px', mx: 3, borderRadius: '12px', mb: 0, mt: 4,
            }}>
              {['#','Holiday Name','Start Date','End Date','Actions'].map((h, i) => (
                <Box key={h} sx={{ padding: '10px 0px 5px', display: 'flex', alignItems: 'center', justifyContent: i === 4 ? 'center' : 'flex-start' }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '1.1px', whiteSpace: 'nowrap' }}>
                    {h}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Table rows */}
            <Box key={rowAnimKey} sx={{ mx: 3, mb: 3, border: '1px solid #e2e8f0', borderTop: 'none', borderRadius: '0 0 14px 14px', overflow: 'hidden' }}>
              {holidayData.length > 0 ? (
                holidayData.map((holiday, idx) => (
                  <Box
                    key={holiday._id}
                    sx={{
                      display: 'grid', gridTemplateColumns: '48px 1fr 130px 130px 90px',
                      alignItems: 'center', px: 3, py: '11px',
                      borderBottom: idx < holidayData.length - 1 ? '1px solid #f1f5f9' : 'none',
                      transition: 'background 0.15s ease',
                      '&:hover': { bgcolor: 'rgba(99,102,241,0.025)' },
                      animation: `rowIn 0.35s cubic-bezier(0.22,1,0.36,1) ${idx * 40}ms both`,
                    }}
                  >
                    {/* # */}
                    <Typography sx={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 600 }}>{idx + 1}</Typography>

                    {/* Holiday Name */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#7c3aed', flexShrink: 0 }} />
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {holiday.holidayName}
                      </Typography>
                    </Box>

                    {/* Start Date */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Box sx={{ px: '8px', py: '3px', borderRadius: '7px', bgcolor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                        <Typography sx={{ fontSize: '0.73rem', fontWeight: 600, color: '#047857', whiteSpace: 'nowrap' }}>
                          {formatDate(holiday.startDate)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* End Date */}
                    <Box>
                      <Box sx={{ px: '8px', py: '3px', borderRadius: '7px', display: 'inline-flex', bgcolor: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                        <Typography sx={{ fontSize: '0.73rem', fontWeight: 600, color: '#4f46e5', whiteSpace: 'nowrap' }}>
                          {formatDate(holiday.endDate)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Actions */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <IconButton
                        size="small"
                        onClick={() => editHoliday(holiday._id)}
                        sx={{
                          width: 30, height: 30, borderRadius: '8px',
                          bgcolor: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#b45309',
                          transition: 'all 0.18s ease',
                          '&:hover': { bgcolor: 'rgba(245,158,11,0.2)', borderColor: 'rgba(245,158,11,0.5)', transform: 'scale(1.1)' },
                        }}
                      >
                        <EditRoundedIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => deleteHoliday(holiday._id)}
                        sx={{
                          width: 30, height: 30, borderRadius: '8px',
                          bgcolor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)', color: '#b91c1c',
                          transition: 'all 0.18s ease',
                          '&:hover': { bgcolor: 'rgba(239,68,68,0.16)', borderColor: 'rgba(239,68,68,0.45)', transform: 'scale(1.1)' },
                        }}
                      >
                        <DeleteRoundedIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  </Box>
                ))
              ) : (
                <Box className="ch-empty" sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 60, height: 60, borderRadius: '16px', bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BeachAccessRoundedIcon sx={{ fontSize: 26, color: '#cbd5e1' }} />
                  </Box>
                  <Typography sx={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.88rem' }}>
                    No holidays added yet
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Footer */}
            {holidayData.length > 0 && (
              <Box sx={{ px: 3, py: '10px', borderTop: '1px solid #f1f5f9', bgcolor: 'rgba(248,250,252,0.8)' }}>
                <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>
                  <span style={{ color: '#0f172a', fontWeight: 700 }}>{holidayData.length}</span> holiday{holidayData.length !== 1 ? 's' : ''} configured
                </Typography>
              </Box>
            )}
          </Paper>

        </Box>
      </Box>
    </Box>
  );
};

export default CustomHolidays;