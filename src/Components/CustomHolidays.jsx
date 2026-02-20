


import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

// MUI Imports
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Divider,
  Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import UpdateIcon from '@mui/icons-material/Update';
import EventIcon from '@mui/icons-material/Event';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const CustomHolidays = () => {

  const [savedDays, setSavedDays] = useState(() => {
    const saved = localStorage.getItem('selectedDays');
    return saved ? JSON.parse(saved) : ['saturday', 'sunday'];
  });

  const [holidayName, setHolidayName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [holidayData, setHolidayData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editHolidayId, setEditHolidayId] = useState('');
  const [selectedDays, setSelectedDays] = useState(savedDays);
  const [removeDeleteFunctionalty, setRemoveDeleteFunctionalty] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const handleChange = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleWeekOffHolidays = async () => {
    if (JSON.stringify(savedDays) === JSON.stringify(selectedDays)) {
      toast.info('No changes to save!');
      return;
    }

    const url = `${API_URL}/weekly-off-days/create`;
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('Token')}`,
      },
      body: JSON.stringify({ offDays: selectedDays }),
    });

    localStorage.setItem('selectedDays', JSON.stringify(selectedDays));
    setSavedDays(selectedDays);
    toast.success('Week off days saved successfully!');
  };

  useEffect(() => {
    setSelectedDays(savedDays);
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return dateString.split('T')[0];
  };

  const saveHoliday = async () => {
    if (!isEditing) {
      const url = `${API_URL}/custom-holidays/create`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('Token')}`,
        },
        body: JSON.stringify({ holidayName, startDate, endDate }),
      });

      const result = await response.json();

      if (result.isSuccess) {
        setHolidayData((prev) => [...prev, result.data]);
        toast.success('Holiday added successfully');
        setHolidayName('');
        setStartDate('');
        setEndDate('');
      } else if (!holidayName || !startDate || !endDate) {
        toast.error('Enter the Holiday');
      } else {
        toast.error('Holiday not added');
      }

    } else {

      if (!holidayName || !startDate || !endDate) {
        toast.error('All fields are required');
        return;
      }

      const oldHoliday = holidayData.find((h) => h._id === editHolidayId);
      if (
        oldHoliday &&
        oldHoliday.holidayName === holidayName &&
        formatDate(oldHoliday.startDate) === startDate &&
        formatDate(oldHoliday.endDate) === endDate
      ) {
        toast.info('No changes detected');
        return;
      }

      const url = `${API_URL}/custom-holidays/update/${editHolidayId}`;
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('Token')}`,
        },
        body: JSON.stringify({
          holidayName,
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
        }),
      });

      const result = await response.json();

      if (result.isSuccess) {
        setHolidayData((prev) =>
          prev.map((h) => (h._id === editHolidayId ? result.data : h))
        );
        setHolidayName('');
        setStartDate('');
        setEndDate('');
        setIsEditing(false);
        toast.success('Holiday updated successfully');
      } else {
        toast.error('Something went wrong');
      }
    }
  };

  const getHolidayData = async () => {
    const url = `${API_URL}/custom-holidays/get`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('Token')}`,
      },
    });
    const result = await response.json();
    setHolidayData(result.data);
  };

  useEffect(() => {
    getHolidayData();
  }, []);

  const editHoliday = (id) => {
    const holiday = holidayData.find((h) => h._id === id);
    if (holiday) {
      setRemoveDeleteFunctionalty(true);
      setHolidayName(holiday.holidayName);
      setStartDate(formatDate(holiday.startDate));
      setEndDate(formatDate(holiday.endDate));
      setIsEditing(true);
      setEditHolidayId(id);
    }
  };

  const deleteHoliday = async (id) => {
    if (!removeDeleteFunctionalty) {
      const url = `${API_URL}/custom-holidays/delete/${id}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('Token')}`,
        },
      });
      const result = await response.json();

      if (result.isSuccess) {
        setHolidayData((prev) => prev.filter((h) => h._id !== id));
        toast.success('Holiday deleted successfully');
      } else {
        toast.error('Holiday not deleted');
      }
      } else if (removeDeleteFunctionalty) {
        toast.error('You cannot Delete while updating')
      }
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', p: 3, }}>

      {/* Week Off Days Card */}
      <Paper elevation={3} sx={{ maxWidth: 800, mx: 'auto', p: 4, borderRadius: 3, mb: 4 }}>
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <CalendarMonthIcon color="primary" />
          <Typography variant="h5" fontWeight={600} color="text.primary">
            Week Off Days
          </Typography>
        </Box>

        <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
          {DAYS.map((day) => (
            <FormControlLabel
              key={day}
              control={
                <Checkbox
                  checked={selectedDays.includes(day)}
                  onChange={() => handleChange(day)}
                  color="primary"
                />
              }
              label={
                <Typography
                  variant="body2"
                  fontWeight={500}
                  sx={{ textTransform: 'capitalize' }}
                >
                  {day}
                </Typography>
              }
              sx={{
                border: '1px solid',
                borderColor: selectedDays.includes(day) ? 'primary.main' : 'divider',
                borderRadius: 2,
                px: 1.5,
                py: 0.5,
                bgcolor: selectedDays.includes(day) ? 'primary.50' : 'transparent',
                transition: 'all 0.2s',
                m: 0,
              }}
            />
          ))}
        </Box>

        <Box display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            onClick={handleWeekOffHolidays}
            startIcon={<SaveIcon />}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Save
          </Button>
        </Box>
      </Paper>

      {/* Holiday Management Card */}
      <Paper elevation={3} sx={{ maxWidth: 1000, mx: 'auto', p: 4, borderRadius: 3 }}>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <EventIcon color="primary" />
          <Typography variant="h5" fontWeight={600} color="text.primary">
            Holiday Management
          </Typography>
        </Box>

        {isEditing && (
          <Chip
            label={`Editing: ${holidayName}`}
            color="warning"
            size="small"
            onDelete={() => {
              setIsEditing(false);
              setHolidayName('');
              setStartDate('');
              setEndDate('');
            }}
            sx={{ mb: 2 }}
          />
        )}

        <Divider sx={{ mb: 3 }} />

        {/* Form */}
        <Grid container spacing={2} alignItems="flex-end" mb={4}>
          <Grid item xs={12} md={4}>
            <TextField
              label="Holiday Name"
              value={holidayName}
              onChange={(e) => setHolidayName(e.target.value)}
              fullWidth
              size="small"
              placeholder="e.g. Eid ul Fitr"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <Button
              variant="contained"
              onClick={saveHoliday}
              fullWidth
              color={isEditing ? 'warning' : 'primary'}
              startIcon={isEditing ? <UpdateIcon /> : <SaveIcon />}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, py: 1 }}
            >
              {isEditing ? 'Update' : 'Save'}
            </Button>
          </Grid>
        </Grid>

        {/* Table */}
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.800' }}>
                {['SN', 'Holiday Name', 'Start Date', 'End Date', 'Actions'].map((head) => (
                  <TableCell
                    key={head}
                    align={head === 'Actions' ? 'center' : 'left'}
                    sx={{ color: 'white', fontWeight: 600, py: 1.5 }}
                  >
                    {head}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {holidayData && holidayData.length > 0 ? (
                holidayData.map((holiday, index) => (
                  <TableRow
                    key={holiday._id}
                    hover
                    sx={{ '&:last-child td': { border: 0 } }}
                  >
                    <TableCell sx={{ color: 'text.primary', width: 50 }}>
                      {index + 1}
                    </TableCell>
                    <TableCell sx={{ color: 'text.primary', fontWeight: 500 }}>
                      {holiday.holidayName}
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>
                      {formatDate(holiday?.startDate)}
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>
                      {formatDate(holiday?.endDate)}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => editHoliday(holiday._id)}
                        sx={{
                          bgcolor: 'warning.light',
                          color: 'warning.contrastText',
                          mr: 1,
                          '&:hover': { bgcolor: 'warning.main' },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => deleteHoliday(holiday._id)}
                        sx={{
                          bgcolor: 'error.light',
                          color: 'error.contrastText',
                          '&:hover': { bgcolor: 'error.main' },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.disabled' }}>
                    No holidays added yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default CustomHolidays;