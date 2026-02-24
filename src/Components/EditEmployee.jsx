import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useContext } from 'react';
import ProfileImage from './ProfileImage';
import LoginContext from '../Contexts/LoginContext';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Paper,
  InputLabel,
  CircularProgress,
  AppBar,
  Toolbar,
  Chip,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import CustomShift from './CustomShift';

const SIDEBAR_W = 240;

// ── Shared MUI input style ────────────────────────────────────────────────────
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
};

const labelSx = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '0.78rem',
  fontWeight: 600,
  color: '#374151',
  mb: 0.7,
  display: 'block',
};

// ── Field config ──────────────────────────────────────────────────────────────
const FIELDS = [
  { key: 'name',             label: 'Full Name',           placeholder: 'Enter full name',              type: 'text',   full: false },
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
const EditEmployee = () => {
  const [form, setForm]                   = useState(INIT);
  const [originalData, setOriginalData]   = useState({});
  const [schedules, setSchedules]         = useState([]);
  const [employeeSchedule, setEmployeeSchedule] = useState('');
  const [loading, setLoading]             = useState(false);
  const [fetching, setFetching]           = useState(true);
  const [openCustomShift, setOpenCustomShift] = useState(false);
  const [getDataFromCustomShift, setGetDataFromCustomShift] = useState([]);

  const API_URL      = import.meta.env.VITE_API_URL;
  const navigate     = useNavigate();
  const { employeeId } = useParams();

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));
  

  // ── Load schedules ──────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res    = await fetch(`${API_URL}/attendance-schedule/getAll`, {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('Token')}` },
        });
        const result = await res.json();
        setSchedules(result.data || []);
      } catch { toast.error('Failed to load schedules'); }
    })();
  }, []);

  const { userData, setUserData } = useContext(LoginContext);

  // ── Load employee data ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!employeeId) return;
    (async () => {
      try {
        setFetching(true);
        const res    = await fetch(`${API_URL}/user/getUserDatailsById/${employeeId}`, {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('Token')}` },
        });
        const result = await res.json();
        const d      = result?.data;

        const loaded = {
          name:             d?.fullName              || '',
          guardianName:     d?.guardianName          || '',
          contact:          d?.contactNumber         || '',
          emergencyContact: d?.emergencyContactNumber|| '',
          officialEmail:    d?.officialEmail         || '',
          personalEmail:    d?.personalEmail         || '',
          position:         d?.position              || '',
          bankAccount:      d?.bankAccount           || '',
          address:          d?.address               || '',
          schedule: d?.scheduleId?._id 
          ? d.scheduleId._id 
          : d?.customSchedule?.length 
            ? "custom_shift"
            : '',
        };

        setForm(loaded);

        // if (!d?.scheduleId && d?.customSchedule?.length) {
        //   console.log('cs', getDataFromCustomShift);
          
        // }

        setEmployeeSchedule(d?.scheduleId?.scheduleName || '');
        setOriginalData({
          fullName:               d?.fullName              || '',
          guardianName:           d?.guardianName          || '',
          contactNumber:          d?.contactNumber         || '',
          emergencyContactNumber: d?.emergencyContactNumber|| '',
          officialEmail:          d?.officialEmail         || '',
          personalEmail:          d?.personalEmail         || '',
          position:               d?.position              || '',
          bankAccount:            d?.bankAccount           || '',
          address:                d?.address               || '',
          scheduleId:             d?.scheduleId?._id       || '',
        });
      } catch (err) {
        console.error(err);
        toast.error('Failed to load employee details');
      } finally { setFetching(false); }
    })();
  }, [employeeId]);

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const hasChanges =
      form.name             !== originalData.fullName               ||
      form.guardianName     !== originalData.guardianName           ||
      form.contact          !== originalData.contactNumber          ||
      form.emergencyContact !== originalData.emergencyContactNumber ||
      form.officialEmail    !== originalData.officialEmail          ||
      form.personalEmail    !== originalData.personalEmail          ||
      form.position         !== originalData.position               ||
      form.bankAccount      !== originalData.bankAccount            ||
      form.address          !== originalData.address                ||
      form.schedule         !== originalData.scheduleId;

    if (!hasChanges) { toast.info('No changes made'); return; }

    try {
      setLoading(true);
      const res    = await fetch(`${API_URL}/user/updateUser/${employeeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('Token')}` },
        body: JSON.stringify({
          fullName:               form.name.trim(),
          guardianName:           form.guardianName.trim(),
          contactNumber:          form.contact.trim(),
          emergencyContactNumber: form.emergencyContact.trim(),
          officialEmail:          form.officialEmail.trim(),
          personalEmail:          form.personalEmail.trim(),
          position:               form.position.trim(),
          bankAccount:            form.bankAccount.trim(),
          address:                form.address.trim(),
          scheduleId:             form.schedule === "custom_shift"? null: form.schedule,
          customSchedule: getDataFromCustomShift
        }),
      });
      await res.json();
      toast.success('Employee updated successfully');
      setUserData(null);
      navigate('/employees');
    } catch { toast.error('Something went wrong'); }
    finally { setLoading(false); }
  };

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (fetching) {
    return (
      <Box className="min-h-screen w-full flex items-center justify-center" sx={{ backgroundColor: '#eef0f8' }}>
        <Box className="flex flex-col items-center gap-3">
          <CircularProgress sx={{ color: '#7c3aed' }} size={40} thickness={4} />
          <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', color: '#94a3b8' }}>
            Loading employee details…
          </Typography>
        </Box>
      </Box>
    );
  }

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

  // ── Render ──────────────────────────────────────────────────────────────────
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
          className="flex items-center justify-between gap-4"
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
                Edit Employee
              </Typography>
              <Typography sx={{ fontSize: '0.83rem', color: '#94a3b8', fontFamily: "'DM Sans', sans-serif" }}>
                  Update the details for{' '}
                <Box component="span" sx={{ color: '#7c3aed', fontWeight: 600 }}>
                  {form.name || 'this employee'}
                </Box>
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
              px: 2.5, py: 1, textTransform: 'none', whiteSpace: 'nowrap', flexShrink: 0,
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
              sx={{ width: 38, height: 38, borderRadius: '10px', background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)' }}
            >
              <EditNoteRoundedIcon sx={{ fontSize: 20, color: '#7c3aed' }} />
            </Box>
            <Box>
              <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#1a1740', lineHeight: 1.2 }}>
                Employee Details
              </Typography>
              <Typography sx={{ fontSize: '0.76rem', color: '#94a3b8', fontFamily: "'DM Sans', sans-serif", mt: 0.2 }}>
                Edit and save changes below
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
                    value={form.schedule}
                    onChange={set('schedule')}
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
                              fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', color: '#1e293b',
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

          {/* Divider */}
          <Box sx={{ height: '1px', bgcolor: '#f1f5f9', mx: '28px' }} />

          {/* Footer */}
          <Box
            className="flex justify-end gap-3"
            sx={{ px: '28px', py: '20px', animation: 'aeField 0.4s 0.54s ease both' }}
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
              onClick={handleSave}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <SaveRoundedIcon />}
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
              {loading ? 'Saving…' : 'Save Changes'}
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Global keyframes */}
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

export default EditEmployee;  