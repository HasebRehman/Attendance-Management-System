import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useContext } from 'react';
import LoginContext from '../Contexts/LoginContext';
import {
  Box, Typography, TextField, Button, Paper, InputLabel,
  IconButton, CircularProgress, AppBar, Toolbar, Chip
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import UpdateRoundedIcon from '@mui/icons-material/UpdateRounded';
import LogoutRoundedIcon from '@mui/icons-material/UpdateRounded';

// ── Shared input style ────────────────────────────────────────────────────────
const inputSx = {
  '& .MuiOutlinedInput-root': {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.875rem',
    borderRadius: '10px',
    backgroundColor: '#f8fafc',
    transition: 'all 0.22s ease',
    '& fieldset': { borderColor: '#e2e8f0', borderWidth: '1.5px' },
    '&:hover fieldset': { borderColor: '#c4b5fd' },
    '&:hover': { backgroundColor: '#fff' },
    '&.Mui-focused fieldset': { borderColor: '#7c3aed', borderWidth: '1.5px' },
    '&.Mui-focused': { backgroundColor: '#fff', boxShadow: '0 0 0 3px rgba(124,58,237,0.1)' },
  },
  '& .MuiInputBase-input': {
    padding: '10px 14px',
    color: '#1e293b',
    fontFamily: "'DM Sans', sans-serif",
    '&::placeholder': { color: '#94a3b8', opacity: 1 },
    // Style the time picker icon
    '&::-webkit-calendar-picker-indicator': { opacity: 0.5, cursor: 'pointer' },
  },
};

const labelSx = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '0.78rem',
  fontWeight: 600,
  color: '#374151',
  mb: 0.7,
  display: 'block',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const to12Hour = (t24) => {
  if (!t24) return '';
  let [h, m] = t24.split(':');
  h = Number(h);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
};

const to24Hour = (t12) => {
  if (!t12) return '';
  let [time, period] = t12.split(' ');
  let [h, m] = time.split(':');
  h = Number(h);
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return `${h.toString().padStart(2, '0')}:${m}`;
};

const numOnly = (e) => {
  if (!['0','1','2','3','4','5','6','7','8','9','Backspace','Delete','ArrowLeft','ArrowRight','Tab'].includes(e.key))
    e.preventDefault();
};

const EMPTY = { scheduleName: '', timeIn: '', timeOut: '', timeInFlexibility: '' };

// ── Component ─────────────────────────────────────────────────────────────────
const Schedule = () => {
  const [form, setForm]                     = useState(EMPTY);
  const [schedules, setSchedules]           = useState([]);
  const [isEditing, setIsEditing]           = useState(false);
  const [selectedId, setSelectedId]         = useState(null);
  const [saving, setSaving]                 = useState(false);
  const [deletingId, setDeletingId]         = useState(null);

  const { userData } = useContext(LoginContext);

  const API_URL = import.meta.env.VITE_API_URL;
  const set     = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));
  const userLogout   = ()   => { localStorage.removeItem("Token"); navigate("/login"); };

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('Token')}`,
  };

  // ── Fetch all ───────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res    = await fetch(`${API_URL}/attendance-schedule/getAll`, { headers });
        const result = await res.json();
        setSchedules(result.data || []);
      } catch { toast.error('Failed to load schedules'); }
    })();
  }, []);

  // ── Save / Update ───────────────────────────────────────────────────────────
  const handleSave = async () => {
    const { scheduleName, timeIn, timeOut, timeInFlexibility } = form;
    if (!scheduleName || !timeIn || !timeOut || !timeInFlexibility) {
      toast.error('Please fill in all fields'); return;
    }

    const payload = {
      scheduleName,
      timeIn: to12Hour(timeIn),
      timeOut: to12Hour(timeOut),
      timeInFlexibility: Number(timeInFlexibility),
    };

    try {
      setSaving(true);
      if (!isEditing) {
        // CREATE
        const res    = await fetch(`${API_URL}/attendance-schedule/create`, {
          method: 'POST', headers, body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (result.isSuccess) {
          setSchedules((p) => [...p, result.data]);
          setForm(EMPTY);
          toast.success('Schedule created successfully');
        } else { toast.error('Failed to save schedule'); }
      } else {
        // UPDATE
        const res    = await fetch(`${API_URL}/attendance-schedule/updateById/${selectedId}`, {
          method: 'PUT', headers, body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (result.isSuccess) {
          setSchedules((p) => p.map((s) => s._id === selectedId ? result.data : s));
          setForm(EMPTY);
          setIsEditing(false);
          setSelectedId(null);
          toast.success('Schedule updated successfully');
        } else { toast.error('Failed to update schedule'); }
      }
    } catch { toast.error('Something went wrong'); }
    finally { setSaving(false); }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      const res    = await fetch(`${API_URL}/attendance-schedule/deleteById/${id}`, {
        method: 'DELETE', headers,
      });
      const result = await res.json();
      if (result.isSuccess) {
        setSchedules((p) => p.filter((s) => s._id !== id));
        toast.success('Schedule deleted');
        if (selectedId === id) { setForm(EMPTY); setIsEditing(false); setSelectedId(null); }
      } else { toast.error('Failed to delete schedule'); }
    } catch { toast.error('Something went wrong'); }
    finally { setDeletingId(null); }
  };

  // ── Load into form for editing ──────────────────────────────────────────────
  const startEdit = (s) => {
    setForm({
      scheduleName: s.scheduleName,
      timeIn: to24Hour(s.timeIn),
      timeOut: to24Hour(s.timeOut),
      timeInFlexibility: String(s.timeInFlexibility),
    });
    setIsEditing(true);
    setSelectedId(s._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => { setForm(EMPTY); setIsEditing(false); setSelectedId(null); };

  // ── Flex cell widths for the table ─────────────────────────────────────────
  const COL = ['0 0 44px','1 1 140px','0 0 110px','0 0 110px','0 0 100px','0 0 120px'];

  const FlexCell = ({ flex, children, center }) => (
    <Box sx={{ flex, minWidth: 0, px: '12px', py: '14px', display: 'flex', alignItems: 'center', overflow: 'hidden', justifyContent: center ? 'center' : 'flex-start' }}>
      {children}
    </Box>
  );

  const HeadCell = ({ flex, children, center }) => (
    <Box sx={{ flex, minWidth: 0, px: '12px', py: '11px', display: 'flex', alignItems: 'center', justifyContent: center ? 'center' : 'flex-start' }}>
      <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '1.6px', textTransform: 'uppercase', color: '#64748b', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' }}>
        {children}
      </Typography>
    </Box>
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <Box className="min-h-screen w-full" sx={{ backgroundColor: '#eef0f8' }}>

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


      <Box sx={{ pt: '45px', px: 3.5, pb: 6 }}>

        {/* ── Title card ────────────────────────────────────────────────── */}
        <Paper elevation={0} sx={{
          mb: 4, px: '32px', py: '24px',
          borderRadius: '14px', bgcolor: '#fff',
          border: '1px solid #e8ecf4',
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
          animation: 'aeDown 0.45s cubic-bezier(.4,0,.2,1) both',
        }}>
          <Box className="flex items-center justify-between gap-6">
            <Box>
              <Typography
                variant="h3"
                className="font-black text-gray-900 tracking-tight leading-none"
                sx={{ fontWeight: 900, fontSize: "2.5rem" }}
              >
                Schedules
              </Typography>
              <Typography
                variant="body2"
                className="text-gray-600 font-medium mt-2"
              >
                Create and manage employee work schedules
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* ── Split layout: form + table ────────────────────────────────── */}
        <Box className="grid grid-cols-1 lg:grid-cols-3" sx={{ gap: '22px' }}>

          {/* ── LEFT: Form card ─────────────────────────────────────────── */}
          <Paper elevation={0} sx={{
            gridColumn: 'span 1',
            borderRadius: '14px', bgcolor: '#fff',
            border: `1.5px solid ${isEditing ? '#c4b5fd' : '#e8ecf4'}`,
            boxShadow: isEditing ? '0 2px 20px rgba(124,58,237,0.12)' : '0 2px 12px rgba(0,0,0,0.07)',
            overflow: 'hidden',
            transition: 'border-color 0.3s, box-shadow 0.3s',
            animation: 'aeUp 0.5s 0.08s cubic-bezier(.4,0,.2,1) both',
          }}>
            {/* Form section header */}
            <Box className="flex items-center gap-3" sx={{ px: '22px', py: '18px', borderBottom: '1px solid #f1f5f9' }}>
              <Box className="flex items-center justify-center flex-shrink-0"
                sx={{ width: 36, height: 36, borderRadius: '10px',
                  background: isEditing ? 'linear-gradient(135deg,#fef3c7,#fde68a)' : 'linear-gradient(135deg,#ede9fe,#ddd6fe)' }}>
                {isEditing
                  ? <UpdateRoundedIcon sx={{ fontSize: 18, color: '#d97706' }} />
                  : <CalendarMonthRoundedIcon sx={{ fontSize: 18, color: '#7c3aed' }} />}
              </Box>
              <Box>
                <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.95rem', fontWeight: 700, color: '#1a1740', lineHeight: 1.2 }}>
                  {isEditing ? 'Update Schedule' : 'Create Schedule'}
                </Typography>
                <Typography sx={{ fontSize: '0.74rem', color: '#94a3b8', fontFamily: "'DM Sans', sans-serif", mt: 0.2 }}>
                  {isEditing ? 'Editing existing schedule' : 'Add a new work schedule'}
                </Typography>
              </Box>
            </Box>

            {/* Fields */}
            <Box sx={{ p: '22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

              {[
                { key: 'scheduleName', label: 'Schedule Name', placeholder: 'e.g. Day Shift', type: 'text', delay: '0.12s' },
                { key: 'timeIn',       label: 'Time In',        placeholder: '',               type: 'time', delay: '0.17s' },
                { key: 'timeOut',      label: 'Time Out',       placeholder: '',               type: 'time', delay: '0.22s' },
              ].map((f) => (
                <Box key={f.key} sx={{ animation: `aeField 0.4s ${f.delay} ease both` }}>
                  <InputLabel sx={labelSx}>{f.label} <Box component="span" sx={{ color: '#ef4444', ml: '2px' }}>*</Box></InputLabel>
                  <TextField fullWidth size="small" type={f.type} placeholder={f.placeholder}
                    value={form[f.key]} onChange={set(f.key)} sx={inputSx} />
                </Box>
              ))}

              <Box sx={{ animation: 'aeField 0.4s 0.27s ease both' }}>
                <InputLabel sx={labelSx}>
                  Time In Flexibility (minutes)
                  <Box component="span" sx={{ color: '#ef4444', ml: '2px' }}>*</Box>
                </InputLabel>
                <TextField fullWidth size="small" type="number" placeholder="e.g. 15"
                  value={form.timeInFlexibility} onChange={set('timeInFlexibility')}
                  onKeyDown={numOnly} sx={inputSx}
                  inputProps={{ min: 0 }} />
              </Box>

              {/* Buttons */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', animation: 'aeField 0.4s 0.32s ease both' }}>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  startIcon={saving
                    ? <CircularProgress size={16} sx={{ color: '#fff' }} />
                    : isEditing ? <SaveRoundedIcon /> : <AddRoundedIcon />}
                  fullWidth
                  sx={{
                    fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '0.87rem',
                    color: '#fff',
                    background: isEditing
                      ? 'linear-gradient(135deg,#d97706,#b45309)'
                      : 'linear-gradient(135deg,#7c3aed,#6d28d9)',
                    borderRadius: '100px', textTransform: 'none', py: 1.2,
                    boxShadow: isEditing
                      ? '0 4px 14px rgba(217,119,6,0.35)'
                      : '0 4px 14px rgba(109,40,217,0.35)',
                    transition: 'all 0.25s',
                    '&:hover': {
                      background: isEditing
                        ? 'linear-gradient(135deg,#b45309,#92400e)'
                        : 'linear-gradient(135deg,#6d28d9,#5b21b6)',
                      boxShadow: isEditing
                        ? '0 6px 20px rgba(217,119,6,0.5)'
                        : '0 6px 22px rgba(109,40,217,0.52)',
                      transform: 'translateY(-1px)',
                    },
                    '&.Mui-disabled': { background: '#e2e8f0', color: '#94a3b8', boxShadow: 'none' },
                  }}
                >
                  {saving ? 'Saving…' : isEditing ? 'Update Schedule' : 'Save Schedule'}
                </Button>

                {isEditing && (
                  <Button onClick={cancelEdit} fullWidth
                    sx={{
                      fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '0.85rem',
                      color: '#64748b', backgroundColor: '#f8fafc',
                      border: '1.5px solid #e2e8f0', borderRadius: '100px',
                      textTransform: 'none', py: 1.1,
                      '&:hover': { backgroundColor: '#f1f5f9', borderColor: '#c4b5fd' },
                    }}
                  >
                    Cancel Edit
                  </Button>
                )}
              </Box>
            </Box>
          </Paper>

          {/* ── RIGHT: Table card ─────────────────────────────────────────── */}
          <Paper elevation={0} sx={{
            gridColumn: 'span 2',
            borderRadius: '14px', bgcolor: '#fff',
            border: '1px solid #e8ecf4',
            boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
            overflow: 'hidden',
            animation: 'aeUp 0.5s 0.14s cubic-bezier(.4,0,.2,1) both',
          }}>
            {/* Table header */}
            <Box className="flex items-center justify-between" sx={{ px: '24px', py: '18px', borderBottom: '1px solid #f1f5f9' }}>
              <Box>
                <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#1a1740' }}>
                  Schedule List
                </Typography>
                <Typography sx={{ fontSize: '0.76rem', color: '#94a3b8', fontFamily: "'DM Sans', sans-serif", mt: 0.2 }}>
                  {schedules.length} schedule{schedules.length !== 1 ? 's' : ''} configured
                </Typography>
              </Box>
              <Box sx={{
                px: '12px', py: '5px', borderRadius: '100px',
                background: 'linear-gradient(135deg,#ede9fe,#ddd6fe)',
                border: '1px solid #c4b5fd',
              }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#6d28d9', fontFamily: "'DM Sans', sans-serif" }}>
                  {schedules.length} total
                </Typography>
              </Box>
            </Box>

            {/* Flex table */}
            <Box sx={{ overflowX: 'hidden' }}>
              {/* Head row */}
              <Box sx={{ display: 'flex', px: '4px', bgcolor: '#f8fafc', borderBottom: '2px solid #f1f5f9' }}>
                {['#','Name','Time In','Time Out','Flexibility','Action'].map((h, i) => (
                  <HeadCell key={h} flex={COL[i]} center={i === 5}>{h}</HeadCell>
                ))}
              </Box>

              {/* Body rows */}
              {schedules.length > 0 ? (
                schedules.map((s, idx) => (
                  <Box
                    key={s._id}
                    sx={{
                      display: 'flex', px: '4px',
                      borderBottom: '1px solid #f8fafc',
                      transition: 'background 0.15s',
                      bgcolor: selectedId === s._id ? '#faf5ff' : 'transparent',
                      '&:hover': { bgcolor: selectedId === s._id ? '#faf5ff' : '#f8fafc' },
                      '&:last-child': { borderBottom: 'none' },
                      animation: `aeField 0.35s ${0.05 + idx * 0.06}s ease both`,
                    }}
                  >
                    {/* # */}
                    <FlexCell flex={COL[0]}>
                      <Box sx={{ width: 28, height: 28, borderRadius: '8px', bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.74rem', fontWeight: 600, color: '#64748b', fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}>
                        {idx + 1}
                      </Box>
                    </FlexCell>

                    {/* Name */}
                    <FlexCell flex={COL[1]}>
                      <Typography sx={{ fontSize: '0.855rem', fontWeight: 600, color: '#1e293b', fontFamily: "'DM Sans', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.scheduleName}
                      </Typography>
                    </FlexCell>

                    {/* Time In */}
                    <FlexCell flex={COL[2]}>
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '5px', bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '7px', px: '8px', py: '3px', flexShrink: 0 }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#22c55e', boxShadow: '0 0 4px rgba(34,197,94,0.7)', flexShrink: 0 }} />
                        <Typography sx={{ fontSize: '0.76rem', color: '#15803d', fontWeight: 500, fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' }}>
                          {s.timeIn}
                        </Typography>
                      </Box>
                    </FlexCell>

                    {/* Time Out */}
                    <FlexCell flex={COL[3]}>
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '5px', bgcolor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '7px', px: '8px', py: '3px', flexShrink: 0 }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#f97316', boxShadow: '0 0 4px rgba(249,115,22,0.7)', flexShrink: 0 }} />
                        <Typography sx={{ fontSize: '0.76rem', color: '#c2410c', fontWeight: 500, fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' }}>
                          {s.timeOut}
                        </Typography>
                      </Box>
                    </FlexCell>

                    {/* Flexibility */}
                    <FlexCell flex={COL[4]}>
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '4px', bgcolor: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '7px', px: '8px', py: '3px', flexShrink: 0 }}>
                        <Typography sx={{ fontSize: '0.76rem', color: '#4338ca', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' }}>
                          ±{s.timeInFlexibility} min
                        </Typography>
                      </Box>
                    </FlexCell>

                    {/* Action */}
                    <FlexCell flex={COL[5]} center>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <IconButton
                          onClick={() => startEdit(s)}
                          size="small"
                          sx={{
                            bgcolor: '#fef3c7', border: '1px solid #fde68a', borderRadius: '9px',
                            color: '#d97706', width: 32, height: 32, transition: 'all 0.2s',
                            '&:hover': { bgcolor: '#d97706', borderColor: '#d97706', color: '#fff', boxShadow: '0 4px 12px rgba(217,119,6,0.4)', transform: 'translateY(-1px)' },
                          }}
                        >
                          <EditRoundedIcon sx={{ fontSize: 15 }} />
                        </IconButton>

                        <IconButton
                          onClick={() => handleDelete(s._id)}
                          disabled={deletingId === s._id}
                          size="small"
                          sx={{
                            bgcolor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '9px',
                            color: '#dc2626', width: 32, height: 32, transition: 'all 0.2s',
                            '&:hover': { bgcolor: '#dc2626', borderColor: '#dc2626', color: '#fff', boxShadow: '0 4px 12px rgba(220,38,38,0.4)', transform: 'translateY(-1px)' },
                            '&.Mui-disabled': { bgcolor: '#f1f5f9', borderColor: '#e2e8f0', color: '#94a3b8' },
                          }}
                        >
                          {deletingId === s._id
                            ? <CircularProgress size={13} sx={{ color: '#dc2626' }} />
                            : <DeleteRoundedIcon sx={{ fontSize: 15 }} />}
                        </IconButton>
                      </Box>
                    </FlexCell>
                  </Box>
                ))
              ) : (
                <Box sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 56, height: 56, borderRadius: '14px', bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CalendarMonthRoundedIcon sx={{ fontSize: 26, color: '#94a3b8' }} />
                  </Box>
                  <Typography sx={{ fontWeight: 700, color: '#64748b', fontFamily: "'DM Sans', sans-serif" }}>
                    No schedules yet
                  </Typography>
                  <Typography sx={{ fontSize: '0.82rem', color: '#94a3b8', fontFamily: "'DM Sans', sans-serif" }}>
                    Create your first schedule using the form
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Footer count */}
            {schedules.length > 0 && (
              <Box sx={{ px: 3, py: 1.6, borderTop: '1px solid #f1f5f9' }}>
                <Typography sx={{ fontSize: '0.78rem', color: '#94a3b8', fontFamily: "'DM Sans', sans-serif" }}>
                  Showing <Box component="span" sx={{ fontWeight: 700, color: '#475569' }}>{schedules.length}</Box> schedule{schedules.length !== 1 ? 's' : ''}
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Global keyframes */}
      <style>{`
        @keyframes aeDown  { from { opacity:0; transform:translateY(-16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes aeUp    { from { opacity:0; transform:translateY(20px)  } to { opacity:1; transform:translateY(0) } }
        @keyframes aeField { from { opacity:0; transform:translateY(10px)  } to { opacity:1; transform:translateY(0) } }
      `}</style>
    </Box>
  );
};

export default Schedule;