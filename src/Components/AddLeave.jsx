import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useContext } from 'react';
import LoginContext from '../Contexts/LoginContext';
import {
  Box, Typography, Paper, Button,
  TextField, MenuItem, AppBar, Toolbar, Chip, InputAdornment,
} from '@mui/material';
import ArrowBackRoundedIcon    from '@mui/icons-material/ArrowBackRounded';
import SaveRoundedIcon         from '@mui/icons-material/SaveRounded';
import UpdateRoundedIcon       from '@mui/icons-material/UpdateRounded';
import PersonRoundedIcon       from '@mui/icons-material/PersonRounded';
import WorkRoundedIcon         from '@mui/icons-material/WorkRounded';
import EventNoteRoundedIcon    from '@mui/icons-material/EventNoteRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import AccessTimeRoundedIcon   from '@mui/icons-material/AccessTimeRounded';
import NotesRoundedIcon        from '@mui/icons-material/NotesRounded';
import CheckCircleRoundedIcon  from '@mui/icons-material/CheckCircleRounded';
import LogoutRoundedIcon  from '@mui/icons-material/CheckCircleRounded';

/* ── Keyframes ── */
const STYLES = `
  @keyframes fadeSlideUp {
    from { opacity:0; transform:translateY(22px); }
    to   { opacity:1; transform:translateY(0);    }
  }
  @keyframes fadeSlideRight {
    from { opacity:0; transform:translateX(-16px); }
    to   { opacity:1; transform:translateX(0);     }
  }
  @keyframes fieldIn {
    from { opacity:0; transform:translateY(10px); }
    to   { opacity:1; transform:translateY(0);    }
  }
  .al-header { animation: fadeSlideUp   .48s cubic-bezier(.22,1,.36,1) .00s both; }
  .al-card   { animation: fadeSlideUp   .48s cubic-bezier(.22,1,.36,1) .09s both; }
  .al-f1     { animation: fieldIn .32s cubic-bezier(.22,1,.36,1) .10s both; }
  .al-f2     { animation: fieldIn .32s cubic-bezier(.22,1,.36,1) .16s both; }
  .al-f3     { animation: fieldIn .32s cubic-bezier(.22,1,.36,1) .22s both; }
  .al-f4     { animation: fieldIn .32s cubic-bezier(.22,1,.36,1) .28s both; }
  .al-f5     { animation: fieldIn .32s cubic-bezier(.22,1,.36,1) .34s both; }
  .al-f6     { animation: fieldIn .32s cubic-bezier(.22,1,.36,1) .40s both; }
  .al-f7     { animation: fieldIn .32s cubic-bezier(.22,1,.36,1) .46s both; }
  .al-f8     { animation: fieldIn .32s cubic-bezier(.22,1,.36,1) .52s both; }
`;
if (typeof document !== 'undefined' && !document.getElementById('al-form-styles')) {
  const t = document.createElement('style');
  t.id = 'al-form-styles'; t.textContent = STYLES;
  document.head.appendChild(t);
}

const SIDEBAR_W = 240;

/* shared TextField sx */
const INPUT_SX = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '11px', bgcolor: '#f8fafc', fontSize: '0.875rem',
    '& fieldset': { borderColor: '#e2e8f0' },
    '&:hover fieldset': { borderColor: '#c4b5fd' },
    '&.Mui-focused fieldset': { borderColor: '#7c3aed', borderWidth: '1.5px' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#7c3aed' },
  '& .MuiSelect-icon': { color: '#9ca3af' },
};

const SELECT_SX = {
  ...INPUT_SX,
  '& .MuiOutlinedInput-root': {
    ...INPUT_SX['& .MuiOutlinedInput-root'],
    bgcolor: '#f8fafc',
  },
};

/* ── Section label ── */
const FieldLabel = ({ icon, children }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', mb: '6px' }}>
    {React.cloneElement(icon, { sx: { fontSize: 14, color: '#7c3aed' } })}
    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.7px' }}>
      {children}
    </Typography>
  </Box>
);

/* ── Days counter display ── */
const DaysCounter = ({ days }) => {
  if (!days || days < 1) return null;
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      px: '10px', py: '4px', borderRadius: '8px',
      bgcolor: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.25)',
      mt: '6px',
    }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#7c3aed' }} />
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed' }}>
        {days} day{days !== 1 ? 's' : ''} of leave
      </Typography>
    </Box>
  );
};

/* ════════════════════════════════ */
const AddLeave = () => {
  const [employeeList, setEmployeeList]   = useState([]);
  const [employeeId,   setEmployeeId]     = useState('');
  const [position,     setPosition]       = useState('');
  const [leaveType,    setLeaveType]       = useState('');
  const [startDate,    setStartDate]       = useState('');
  const [endDate,      setEndDate]         = useState('');
  const [leaves,       setLeaves]          = useState(0);
  const [reason,       setReason]          = useState('');
  const [leaveStatus,  setLeaveStatus]     = useState('');
  const [leaveData,    setLeaveData]       = useState({});
  const [compareData,  setCompareData]     = useState({});

  const { userData } = useContext(LoginContext);

  const API_URL  = import.meta.env.VITE_API_URL;
  const { id }   = useParams();
  const isEdit   = !!id;
  const navigate = useNavigate();

  /* fetch employees */
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API_URL}/user/GetAllEmployees`, {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('Token')}` },
        });
        const result = await r.json();
        setEmployeeList(result.data || []);
      } catch (e) { console.error(e); }
    })();
  }, []);

  /* auto-fill position */
  useEffect(() => {
    const emp = employeeList.find(e => e._id === employeeId);
    if (emp) setPosition(emp.position || '');
  }, [employeeId, employeeList]);

  /* auto-calculate days */
  useEffect(() => {
    if (!startDate || !endDate) return;
    const diff = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
    setLeaves(diff);
  }, [startDate, endDate]);

  /* fetch leave for edit */
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const r = await fetch(`${API_URL}/leave-management/getOneById/${id}`, {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('Token')}` },
        });
        const result = await r.json();
        setLeaveData(result.data);
        setCompareData({
          empDocId:  result.data?.empDocId?._id,
          leaveType: result.data?.leaveType,
          leaves:    Number(result.data?.leaves),
          startDate: result.data?.startDate?.split('T')[0],
          endDate:   result.data?.endDate?.split('T')[0],
          reason:    result.data?.reason,
          status:    result.data?.status,
        });
      } catch (e) { console.error(e); }
    })();
  }, [isEdit, id]);

  /* populate edit fields */
  useEffect(() => {
    if (isEdit && leaveData._id === id) {
      setEmployeeId(leaveData?.empDocId?._id || '');
      setLeaveType(leaveData?.leaveType || '');
      setStartDate(leaveData?.startDate?.split('T')[0] || '');
      setEndDate(leaveData?.endDate?.split('T')[0] || '');
      setReason(leaveData?.reason || '');
      setLeaveStatus(leaveData?.status || '');
    }
  }, [isEdit, leaveData]);

  const fmt = (d) => {
    if (!d) return '';
    const dt = new Date(d);
    return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
  };

  const handleSubmit = async () => {
    if (!employeeId || !leaveStatus || !reason || !startDate || !endDate || !leaveType) {
      toast.error('All fields are required'); return;
    }
    if (leaves < 1)   { toast.error('End date must be after start date'); return; }
    if (leaves > 365) { toast.error('Leave cannot exceed 365 days'); return; }
    if (reason.trim().length < 10) { toast.info('Reason must be at least 10 characters'); return; }

    const payload = { empDocId: employeeId, leaveType, leaves: Number(leaves), startDate, endDate, reason, status: leaveStatus };

    if (isEdit) {
      if (JSON.stringify(payload) === JSON.stringify(compareData)) { toast.info('No changes detected'); return; }
      try {
        const r = await fetch(`${API_URL}/leave-management/updateById/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('Token')}` },
          body: JSON.stringify(payload),
        });
        const result = await r.json();
        if (result.isSuccess) { toast.success('Leave updated successfully'); navigate('/leave-management'); }
        else toast.error('Could not update leave');
      } catch (e) { console.error(e); }
    } else {
      try {
        const r = await fetch(`${API_URL}/leave-management/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('Token')}` },
          body: JSON.stringify({ ...payload, startDate: fmt(startDate), endDate: fmt(endDate) }),
        });
        const result = await r.json();
        if (result.isSuccess) { toast.success('Leave added successfully'); navigate('/leave-management'); }
      } catch (e) { console.error(e); }
    }
  };

  const userLogout = () => {
    localStorage.removeItem("Token");
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

        </Toolbar>
      </AppBar>

      {/* ── MAIN ── */}
      <Box component="main" sx={{ pt: '32px', minHeight: '100vh' }}>
        <Box sx={{ px: { xs: 2, md: 4 }, py: 3, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>

          {/* ── Page header ── */}
          <Paper elevation={0} className="al-header" sx={{
            borderRadius: '20px', border: '1px solid rgba(255,255,255,0.85)',
            bgcolor: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)',
            px: 4, py: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2,
          }}>
            <Box>
              <Typography sx={{ fontWeight: 900, fontSize: '2.2rem', color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1 }}>
                {isEdit ? 'Edit Leave' : 'Add Leave'}
              </Typography>
              <Typography sx={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500, mt: .8 }}>
                {isEdit ? 'Update existing leave record' : 'Create a new leave record for an employee'}
              </Typography>
            </Box>
            <Button
              onClick={() => navigate('/leave-management')}
              startIcon={<ArrowBackRoundedIcon sx={{ fontSize: '16px !important' }} />}
              sx={{
                color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '11px',
                fontWeight: 600, fontSize: '0.82rem', px: 2.5, py: 1, textTransform: 'none',
                bgcolor: '#f8fafc', transition: 'all 0.18s ease',
                '&:hover': { bgcolor: '#f1f5f9', borderColor: '#cbd5e1' },
              }}
            >
              Back
            </Button>
          </Paper>

          {/* ── Form card ── */}
          <Paper elevation={0} className="al-card" sx={{
            mt: '10px',
            borderRadius: '20px', border: '1px solid rgba(255,255,255,0.85)',
            bgcolor: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.07)', overflow: 'hidden',
          }}>
            {/* Card header strip */}
            <Box sx={{
              px: 3, py: '14px',
              background: 'linear-gradient(110deg,#0f0c29,#1a1340 55%,#24243e)',
              display: 'flex', alignItems: 'center', gap: '13px',
            }}>
              <Box sx={{
                width: 34, height: 34, borderRadius: '9px',
                bgcolor: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <EventNoteRoundedIcon sx={{ fontSize: 17, color: '#a78bfa' }} />
              </Box>
              <Box>
                <Typography sx={{ pt: '10px', color: '#e2d9fc', fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.2 }}>
                  Leave Details
                </Typography>
                <Typography sx={{ pb: '10px', color: 'rgba(255,255,255,0.38)', fontSize: '0.68rem', mt: '2px' }}>
                  Fill in all required fields
                </Typography>
              </Box>
            </Box>

            {/* Fields */}
            <Box sx={{ px: 3, py: 3, display: 'flex', flexDirection: 'column', gap: 3.5 }}>

              {/* Employee + Position — 2 col */}
              <Box sx={{ pt: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="al-f1">
                <Box>
                  <FieldLabel icon={<PersonRoundedIcon />}>Employee</FieldLabel>
                  <TextField
                    select fullWidth size="small"
                    value={employeeId}
                    onChange={e => setEmployeeId(e.target.value)}
                    sx={SELECT_SX}
                    SelectProps={{ displayEmpty: true }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><PersonRoundedIcon sx={{ fontSize: 16, color: '#9ca3af' }} /></InputAdornment>
                    }}
                  >
                    <MenuItem value="" disabled>Select Employee</MenuItem>
                    {employeeList.map(emp => (
                      <MenuItem key={emp._id} value={emp._id}>{emp.fullName}</MenuItem>
                    ))}
                  </TextField>
                </Box>

                <Box>
                  <FieldLabel icon={<WorkRoundedIcon />}>Position</FieldLabel>
                  <TextField
                    fullWidth size="small"
                    value={position}
                    InputProps={{
                      readOnly: true,
                      startAdornment: <InputAdornment position="start"><WorkRoundedIcon sx={{ fontSize: 16, color: '#9ca3af' }} /></InputAdornment>,
                    }}
                    placeholder="Auto-filled"
                    sx={{
                      ...INPUT_SX,
                      '& .MuiOutlinedInput-root': {
                        ...INPUT_SX['& .MuiOutlinedInput-root'],
                        bgcolor: '#f1f5f9',
                        cursor: 'default',
                      },
                    }}
                  />
                </Box>
              </Box>

              {/* Leave Type */}
              <Box className="al-f2">
                <FieldLabel icon={<EventNoteRoundedIcon />}>Leave Type</FieldLabel>
                <TextField
                  select fullWidth size="small"
                  value={leaveType}
                  onChange={e => setLeaveType(e.target.value)}
                  sx={SELECT_SX}
                  SelectProps={{ displayEmpty: true }}
                >
                  <MenuItem value="" disabled>Select Leave Type</MenuItem>
                  {['sick leave','annual leave','maternity leave','paternity leave','unpaid leave','study leave','emergency leave','public holiday','special leave'].map(t => (
                    <MenuItem key={t} value={t} sx={{ textTransform: 'capitalize' }}>{t.charAt(0).toUpperCase() + t.slice(1)}</MenuItem>
                  ))}
                </TextField>
              </Box>

              {/* Start + End Date — 2 col */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="al-f3">
                <Box>
                  <FieldLabel icon={<CalendarTodayRoundedIcon />}>Start Date</FieldLabel>
                  <TextField
                    fullWidth size="small" type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={INPUT_SX}
                  />
                </Box>
                <Box>
                  <FieldLabel icon={<CalendarTodayRoundedIcon />}>End Date</FieldLabel>
                  <TextField
                    fullWidth size="small" type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={INPUT_SX}
                  />
                </Box>
              </Box>

              {/* Days counter */}
              <Box className="al-f4">
                <FieldLabel icon={<AccessTimeRoundedIcon />}>Total Days</FieldLabel>
                <Box sx={{
                  px: '14px', py: '10px', borderRadius: '11px',
                  bgcolor: '#f8fafc', border: '1px solid #e2e8f0',
                  display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                  <AccessTimeRoundedIcon sx={{ fontSize: 16, color: '#9ca3af' }} />
                  <Typography sx={{ fontSize: '0.875rem', color: leaves >= 1 ? '#0f172a' : '#9ca3af', fontWeight: leaves >= 1 ? 600 : 400 }}>
                    {leaves >= 1 ? `${leaves} day${leaves !== 1 ? 's' : ''}` : 'Select start & end date'}
                  </Typography>
                  {/* {leaves >= 1 && (
                    <Box sx={{ ml: 'auto', px: '8px', py: '3px', borderRadius: '7px', bgcolor: 'rgba(124,58,237,0.09)', border: '1px solid rgba(124,58,237,0.25)' }}>
                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#7c3aed' }}>
                        {leaves} {leaves !== 1 ? 'days' : 'day'}
                      </Typography>
                    </Box>
                  )} */}
                </Box>
              </Box>

              {/* Reason */}
              <Box className="al-f5">
                <FieldLabel icon={<NotesRoundedIcon />}>Reason</FieldLabel>
                <TextField
                  fullWidth size="small"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Enter reason (min. 10 characters)"
                  multiline rows={3}
                  InputProps={{
                    sx: { alignItems: 'flex-start' },
                  }}
                  sx={{
                    ...INPUT_SX,
                    '& .MuiOutlinedInput-root': {
                      ...INPUT_SX['& .MuiOutlinedInput-root'],
                      alignItems: 'flex-start',
                    },
                  }}
                />
                {reason.length > 0 && reason.trim().length < 10 && (
                  <Typography sx={{ fontSize: '0.7rem', color: '#ef4444', mt: '4px', fontWeight: 500 }}>
                    {10 - reason.trim().length} more character{10 - reason.trim().length !== 1 ? 's' : ''} needed
                  </Typography>
                )}
              </Box>

              {/* Leave Status */}
              <Box className="al-f6">
                <FieldLabel icon={<CheckCircleRoundedIcon />}>Leave Status</FieldLabel>
                <TextField
                  select fullWidth size="small"
                  value={leaveStatus}
                  onChange={e => setLeaveStatus(e.target.value)}
                  sx={SELECT_SX}
                  SelectProps={{ displayEmpty: true }}
                >
                  <MenuItem value="" disabled>Select Status</MenuItem>
                  {[
                    { val: 'pending',  color: '#b45309' },
                    { val: 'approved', color: '#047857' },
                    { val: 'rejected', color: '#b91c1c' },
                  ].map(s => (
                    <MenuItem key={s.val} value={s.val}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: s.color }} />
                        <Typography sx={{ fontSize: '0.875rem', textTransform: 'capitalize', color: s.color, fontWeight: 600 }}>
                          {s.val.charAt(0).toUpperCase() + s.val.slice(1)}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

            </Box>

            {/* ── Action footer ── */}
            <Box sx={{
              px: 3, py: 2,
              borderTop: '1px solid #f1f5f9',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              bgcolor: 'rgba(248,250,252,0.8)',
            }}>
              <Button
                onClick={() => navigate('/leave-management')}
                startIcon={<ArrowBackRoundedIcon sx={{ fontSize: '16px !important' }} />}
                sx={{
                  color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '11px',
                  fontWeight: 600, fontSize: '0.82rem', px: 2.5, py: 1, textTransform: 'none',
                  bgcolor: '#f8fafc',
                  '&:hover': { bgcolor: '#f1f5f9', borderColor: '#cbd5e1' },
                }}
              >
                Cancel
              </Button>

              <Button
                variant="contained"
                onClick={handleSubmit}
                startIcon={
                  isEdit
                    ? <UpdateRoundedIcon sx={{ fontSize: '17px !important' }} />
                    : <SaveRoundedIcon   sx={{ fontSize: '17px !important' }} />
                }
                sx={{
                  mb: '20px',
                  background: isEdit
                    ? 'linear-gradient(110deg,#78350f,#b45309)'
                    : 'linear-gradient(110deg,#0f0c29,#1a1340 60%,#24243e)',
                  borderRadius: '11px', fontWeight: 700, fontSize: '0.85rem',
                  px: 3, py: 1, textTransform: 'none',
                  boxShadow: '0 4px 14px rgba(15,12,41,0.3)',
                  transition: 'all 0.22s ease',
                  '&:hover': { boxShadow: '0 6px 20px rgba(15,12,41,0.4)', transform: 'translateY(-1px)' },
                  '&:active': { transform: 'scale(0.97)' },
                }}
              >
                {isEdit ? 'Update Leave' : 'Save Leave'}
              </Button>
            </Box>
          </Paper>

        </Box>
      </Box>
    </Box>
  );
};

export default AddLeave;