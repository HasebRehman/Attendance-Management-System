import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomShift from './CustomShift';
import { toast } from 'react-toastify';
import { useContext } from 'react';
import LoginContext from '../Contexts/LoginContext';
import ProfileImage from './ProfileImage';
import {
  Box,
  Typography,
  TextField,
  Toolbar,
  MenuItem,
  Button,
  Paper,
  InputLabel,
  AppBar,
  Chip,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import LogoutRoundedIcon from '@mui/icons-material/PersonAddAltRounded';

// ── Shared MUI input style — matches website palette ──────────────────────────
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
  },
  '& .MuiInputBase-input:-webkit-autofill': {
    WebkitBoxShadow: '0 0 0 100px #f8fafc inset',
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

const SIDEBAR_W = 240;

// ── Field definitions ─────────────────────────────────────────────────────────
const FIELDS = [
  { key: 'name',             label: 'Full Name',            placeholder: 'Enter full name',              type: 'text',   full: false },
  { key: 'guardianName',     label: 'Guardian Name',        placeholder: 'Enter guardian name',          type: 'text',   full: false },
  { key: 'contact',          label: 'Contact #',            placeholder: '11-digit mobile number',       type: 'text',   full: false },
  { key: 'emergencyContact', label: 'Emergency Contact #',  placeholder: '11-digit mobile number',       type: 'text',   full: false },
  { key: 'officialEmail',    label: 'Official Email',       placeholder: 'company@email.com',            type: 'email',  full: false },
  { key: 'personalEmail',    label: 'Personal Email',       placeholder: 'personal@email.com',           type: 'email',  full: false },
  { key: 'position',         label: 'Position',             placeholder: 'Enter job role',               type: 'text',   full: false },
  { key: 'schedule',         label: 'Schedule',             placeholder: '',                             type: 'select', full: false },
  { key: 'bankAccount',      label: 'Bank Account No.',     placeholder: '16-digit bank account number', type: 'text',   full: false },
  { key: 'address',          label: 'Address',              placeholder: 'Enter full address',           type: 'text',   full: true  },
];

const INIT = {
  name: '', guardianName: '', contact: '', emergencyContact: '',
  officialEmail: '', personalEmail: '', schedule: '',
  position: '', bankAccount: '', address: '',
};

// ── Component ─────────────────────────────────────────────────────────────────
const AddEmployee = () => {
  const [form, setForm]           = useState(INIT);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [openCustomShift, setOpenCustomShift] = useState(false);
  const [getDataFromCustomShift, setGetDataFromCustomShift] = useState([]);
  
const { userData } = useContext(LoginContext);

  const API_URL                   = import.meta.env.VITE_API_URL;
  const navigate                  = useNavigate();

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  useEffect(() => {
    (async () => {
      try {
        const res    = await fetch(`${API_URL}/attendance-schedule/getAll`, {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('Token')}` },
        });
        const result = await res.json();
        console.log(result.data);
        
        setSchedules(result.data || []);
      } catch { toast.error('Failed to load schedules'); }
    })();
  }, []);

  const handleSubmit = async () => {
    const { name, guardianName, contact, emergencyContact, officialEmail,
            personalEmail, schedule, position, bankAccount, address } = form;

    if ([name, guardianName, contact, emergencyContact, officialEmail,
         personalEmail, schedule, position, bankAccount, address].some((v) => !v.trim())) {
      toast.error('Please fill in all fields'); return;
    }
    if (contact.trim().length !== 11 || emergencyContact.trim().length !== 11) {
      toast.error('Contact numbers must be 11 digits'); return;
    }
    if (bankAccount.trim().length !== 16) {
      toast.error('Bank account number must be 16 digits'); return;
    }

    try {
      setLoading(true);
      const res    = await fetch(`${API_URL}/auth/createEmployee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('Token')}` },
        body: JSON.stringify({
          fullName: name.trim(), guardianName: guardianName.trim(),
          contactNumber: contact.trim(), emergencyContactNumber: emergencyContact.trim(),
          officialEmail: officialEmail.trim(), personalEmail: personalEmail.trim(),
          scheduleId: form.schedule === "custom_shift"? null: form.schedule, position: position.trim(),
          bankAccount: bankAccount.trim(), address: address.trim(),
          customSchedule: getDataFromCustomShift
        }),
      });
      const result = await res.json();
      console.log(result);
      
      if (result.isSuccess) {
        toast.success('Employee added successfully');
        setForm(INIT);
        navigate('/employees');
      } else {
        toast.error('Failed to add employee');
      }
    } catch { toast.error('Something went wrong'); }
    finally { setLoading(false); }
  };

  const handleOpen = () => {
    setOpenCustomShift(true);

  }

  const handleClose = () => {
    setOpenCustomShift(false);

  }

  const handleDataFromCustomShift = (data) => {
    setGetDataFromCustomShift(data);
    // console.log('data from child in add employee', data);
    

  }

  const userLogout = () => {
    localStorage.removeItem("Token");
    navigate("/login");
  };


  return (
    <Box className="min-h-screen w-full" sx={{ backgroundColor: '#eef0f8' }}>
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

      <Box className="w-full" sx={{ pt: '45px', px: 3.5, pb: 6 }}>

        {/* ── Title card ──────────────────────────────────────────────────── */}
        <Paper
          elevation={0}
          className="flex items-center justify-between"
          sx={{
            mb: 3, px: '32px', py: '24px',
            borderRadius: '14px', bgcolor: '#fff',
            border: '1px solid #e8ecf4',
            boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
            animation: 'aeDown 0.45s cubic-bezier(.4,0,.2,1) both',
          }}
        >
          <Box className="flex items-center justify-between gap-6">
            <Box>
              <Typography
                variant="h3"
                className="font-black text-gray-900 tracking-tight leading-none"
                sx={{ fontWeight: 900, fontSize: "2.5rem" }}
              >
                Add Employees
              </Typography>
              <Typography
                variant="body2"
                className="text-gray-600 font-medium mt-2"
              >
                Fill in the details to register a new team member
              </Typography>
            </Box>
          </Box>

          <Button
            onClick={() => navigate('/employees')}
            startIcon={<ArrowBackRoundedIcon />}
            sx={{
              fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '0.84rem',
              color: '#475569', backgroundColor: '#f1f5f9',
              border: '1px solid #e2e8f0', borderRadius: '100px',
              px: 2.5, py: 1, textTransform: 'none', whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              '&:hover': { backgroundColor: '#e8ecf4', borderColor: '#cbd5e1', color: '#1e293b', transform: 'translateX(-2px)' },
            }}
          >
            Back to Employees
          </Button>
        </Paper>

        {/* ── Form card ───────────────────────────────────────────────────── */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: '14px', bgcolor: '#fff',
            border: '1px solid #e8ecf4',
            boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
            overflow: 'hidden',
            animation: 'aeUp 0.5s 0.08s cubic-bezier(.4,0,.2,1) both',
          }}
        >
          {/* Section header */}
          <Box className="flex items-center gap-3" sx={{ px: '28px', py: '20px', borderBottom: '1px solid #f1f5f9' }}>
            <Box
              className="flex items-center justify-center flex-shrink-0"
              sx={{ width: 38, height: 38, borderRadius: '10px', background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)', fontSize: '18px' }}
            >
              👤
            </Box>
            <Box>
              <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#1a1740', lineHeight: 1.2 }}>
                Employee Details
              </Typography>
              <Typography sx={{ fontSize: '0.76rem', color: '#94a3b8', fontFamily: "'DM Sans', sans-serif", mt: 0.2 }}>
                Personal, contact and schedule information
              </Typography>
            </Box>
          </Box>

          {/* Fields grid */}
          <Box
            className="grid grid-cols-1 md:grid-cols-2"
            sx={{ gap: '20px 24px', p: '26px 28px' }}
          >
            {FIELDS.map((f, i) => (
              <Box
                key={f.key}
                className={f.full ? 'md:col-span-2' : ''}
                sx={{
                  display: 'flex', flexDirection: 'column', gap: '6px',
                  animation: `aeField 0.4s ${0.10 + i * 0.04}s ease both`,
                }}
              >
                <InputLabel sx={labelSx}>
                  {f.label}
                  <Box component="span" sx={{ color: '#ef4444', ml: '2px' }}>*</Box>
                </InputLabel>

                {f.type === 'select' ? (
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={form[f.key]}
                    onChange={(e) => {
                      const value = e.target.value;

                      // custom shift select hua
                      if (value === "custom_shift") {
                        setOpenCustomShift(true);   // modal open
                      }

                      // normal value set
                      setForm((p) => ({ ...p, [f.key]: value }));
                    }}

                    sx={inputSx}
                    SelectProps={{
                      displayEmpty: true,
                      renderValue: (v) => {
                        if (!v) {
                          return <span style={{ color: '#94a3b8' }}>Select Schedule</span>;
                        }

                        if (v === "custom_shift") {
                          return "Custom Shift";
                        }

                        return schedules.find((s) => s._id === v)?.scheduleName || "Select Schedule";
                      },
                      MenuProps: {
                        PaperProps: {
                          sx: {
                            borderRadius: '10px', mt: 0.5,
                            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                            border: '1px solid #e2e8f0',
                            '& .MuiMenuItem-root': {
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: '0.875rem',
                              color: '#1e293b',
                              '&:hover': { backgroundColor: '#f5f3ff' },
                              '&.Mui-selected': { backgroundColor: '#ede9fe', color: '#6d28d9', fontWeight: 600 },
                              '&.Mui-selected:hover': { backgroundColor: '#ddd6fe' },
                            },
                          },
                        },
                      },
                    }}
                  >
                    {schedules.map((s) => (
                      <MenuItem key={s._id} value={s._id}>{s.scheduleName}</MenuItem>
  
                    ))}
                    <MenuItem onClick={handleOpen} value="custom_shift">
                      Custom Shift
                    </MenuItem>

                  </TextField>
                ) : (
                  <TextField
                    fullWidth
                    size="small"
                    type={f.type}
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={set(f.key)}
                    sx={inputSx}
                  />
                )}
              </Box>
            ))}
          </Box>

          {/* Divider + Footer */}
          <Box sx={{ height: '1px', bgcolor: '#f1f5f9', mx: '28px' }} />

          <Box
            className="flex justify-end gap-3"
            sx={{
              px: '28px', py: '20px',
              animation: 'aeField 0.4s 0.54s ease both',
            }}
          >
            <Button
              onClick={() => navigate('/employees')}
              sx={{
                fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '0.87rem',
                color: '#64748b', backgroundColor: '#f8fafc',
                border: '1.5px solid #e2e8f0', borderRadius: '100px',
                px: 3, py: 1.1, textTransform: 'none',
                transition: 'all 0.2s',
                '&:hover': { backgroundColor: '#f1f5f9', borderColor: '#c4b5fd', color: '#475569' },
              }}
            >
              Cancel
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={loading}
              startIcon={<PersonAddAltRoundedIcon />}
              sx={{
                fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '0.87rem',
                color: '#fff',
                background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                borderRadius: '100px',
                px: 3, py: 1.1, textTransform: 'none',
                boxShadow: '0 4px 14px rgba(109,40,217,0.35)',
                transition: 'all 0.25s cubic-bezier(.4,0,.2,1)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #6d28d9, #5b21b6)',
                  boxShadow: '0 6px 22px rgba(109,40,217,0.52)',
                  transform: 'translateY(-2px)',
                },
                '&:active': { transform: 'translateY(0)' },
                '&.Mui-disabled': { background: '#c4b5fd', color: '#fff', boxShadow: 'none' },
              }}
            >
              {loading ? 'Saving…' : 'Add Employee'}
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* ── Global keyframe animations ── */}
      <style>{`
        @keyframes aeDown  { from { opacity:0; transform:translateY(-16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes aeUp    { from { opacity:0; transform:translateY(20px)  } to { opacity:1; transform:translateY(0) } }
        @keyframes aeField { from { opacity:0; transform:translateY(10px)  } to { opacity:1; transform:translateY(0) } }
      `}</style>
      <CustomShift
        open={openCustomShift}
        close={handleClose}
        getData={handleDataFromCustomShift}
      />
    </Box>
  );
  
};
  


export default AddEmployee;