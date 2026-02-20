import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Box,
} from "@mui/material";

const CustomShift = ({ open, onClose, sendCustomShiftData }) => {
  // har day ka object: { timeIn, timeOut, flexibility }
  const [shift, setShift] = useState({
    Mon: null,
    Tue: null,
    Wed: null,
    Thu: null,
    Fri: null,
    Sat: null,
    Sun: null,
  });

  // toggle day selection
  const toggleDay = (day, checked) => {
    setShift((prev) => ({
      ...prev,
      [day]: checked
        ? { timeIn: "", timeOut: "", flexibility: "" } // new fields visible
        : null, // remove day if unchecked
    }));
  };

  // update specific field for a day
  const handleFieldChange = (day, field, value) => {
    setShift((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  // convert 24h time to "HH:MM AM/PM" format
  const formatTime = (time24) => {
    if (!time24) return "";
    const [hourStr, min] = time24.split(":");
    let hour = parseInt(hourStr);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour.toString().padStart(2, "0")}:${min} ${ampm}`;
  };

  // final data to send to parent
  const getShiftData = () => {
    const data = [];
    Object.entries(shift).forEach(([day, val]) => {
      if (val) {
        data.push({
          day,
          timeIn: formatTime(val.timeIn),
          timeOut: formatTime(val.timeOut),
          timeInFlexibility: val.flexibility.toString(),
        });
      }
    });
    return data;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Custom Shift</DialogTitle>

      <DialogContent>
        <Typography sx={{ mb: 1.5, fontWeight: 600 }}>Select Days</Typography>

        <Box className="flex flex-wrap gap-2 mb-4">
          {Object.keys(shift).map((day) => (
            <FormControlLabel
              key={day}
              control={
                <Checkbox
                  checked={!!shift[day]}
                  onChange={(e) => toggleDay(day, e.target.checked)}
                />
              }
              label={day}
            />
          ))}
        </Box>

        {/* render fields for each selected day */}
        {Object.entries(shift).map(([day, data]) => {
          if (!data) return null;
          return (
            <Box
              key={day}
              sx={{ mb: 3, border: "1px solid #e2e8f0", p: 2, borderRadius: 1 }}
            >
              <Typography sx={{ fontWeight: 600, mb: 1 }}>{day}</Typography>

              <TextField
                fullWidth
                label="Time In"
                type="time"
                sx={{ mb: 2 }}
                value={data.timeIn}
                onChange={(e) => handleFieldChange(day, "timeIn", e.target.value)}
              />

              <TextField
                fullWidth
                label="Time Out"
                type="time"
                sx={{ mb: 2 }}
                value={data.timeOut}
                onChange={(e) => handleFieldChange(day, "timeOut", e.target.value)}
              />

              <TextField
                fullWidth
                label="Flexibility (minutes)"
                type="number"
                value={data.flexibility}
                onChange={(e) => handleFieldChange(day, "flexibility", e.target.value)}
              />
            </Box>
          );
        })}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={() => {
            const finalData = getShiftData();
            sendCustomShiftData(finalData); // send data to parent
            console.log("Custom Shift Data:", finalData);
            onClose();
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomShift;
