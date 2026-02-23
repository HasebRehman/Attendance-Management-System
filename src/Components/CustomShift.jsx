import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
  Slide,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";

/* ── Keyframes injected once ── */
const STYLES = `
  @keyframes modalFadeIn {
    from { opacity: 0; transform: translateY(20px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)    scale(1);    }
  }
  @keyframes dayCardIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes fieldsFadeIn {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  .modal-anim   { animation: modalFadeIn 0.32s cubic-bezier(0.22,1,0.36,1) both; }
  .day-card-in  { animation: dayCardIn   0.28s cubic-bezier(0.22,1,0.36,1) both; }
  .fields-in    { animation: fieldsFadeIn 0.22s cubic-bezier(0.22,1,0.36,1) both; }
`;
if (typeof document !== "undefined" && !document.getElementById("cs-modal-styles")) {
  const tag = document.createElement("style");
  tag.id = "cs-modal-styles";
  tag.textContent = STYLES;
  document.head.appendChild(tag);
}

const DAYS = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];

const DAY_COLORS = {
  monday:    { color: "#4f46e5", bg: "#eef2ff", border: "#c7d2fe", dot: "#818cf8" },
  tuesday:   { color: "#047857", bg: "#ecfdf5", border: "#a7f3d0", dot: "#34d399" },
  wednesday: { color: "#b45309", bg: "#fffbeb", border: "#fde68a", dot: "#fbbf24" },
  thursday:  { color: "#b91c1c", bg: "#fff1f2", border: "#fecaca", dot: "#f87171" },
  friday:    { color: "#7c3aed", bg: "#faf5ff", border: "#e9d5ff", dot: "#c084fc" },
  saturday:  { color: "#be185d", bg: "#fdf2f8", border: "#fbcfe8", dot: "#f9a8d4" },
  sunday:    { color: "#0369a1", bg: "#f0f9ff", border: "#bae6fd", dot: "#38bdf8" },
};

const EMPTY_SHIFT = () => ({ timeIn: "", timeOut: "", flexibility: "" });

const formatTime = (time24) => {
  if (!time24) return "";
  const [hourStr, min] = time24.split(":");
  let hour = parseInt(hourStr);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour.toString().padStart(2, "0")}:${min} ${ampm}`;
};

/* ── Day toggle pill ── */
const DayPill = ({ day, active, onClick, animDelay }) => {
  const meta = DAY_COLORS[day];
  return (
    <Box
      onClick={onClick}
      className="day-card-in"
      style={{ animationDelay: `${animDelay}ms` }}
      sx={{
        px: "14px", py: "7px", borderRadius: "20px", cursor: "pointer",
        userSelect: "none", transition: "all 0.2s ease",
        display: "flex", alignItems: "center", gap: "6px",
        border: "1.5px solid",
        borderColor: active ? meta.border : "#e2e8f0",
        bgcolor: active ? meta.bg : "#f8fafc",
        boxShadow: active ? `0 2px 8px ${meta.dot}44` : "none",
        "&:hover": {
          borderColor: meta.border,
          bgcolor: meta.bg,
        },
      }}
    >
      {active && (
        <Box sx={{
          width: 16, height: 16, borderRadius: "50%",
          bgcolor: meta.color,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <CheckRoundedIcon sx={{ fontSize: 10, color: "#fff" }} />
        </Box>
      )}
      {!active && (
        <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#cbd5e1", flexShrink: 0 }} />
      )}
      <Typography sx={{
        fontSize: "0.75rem", fontWeight: active ? 700 : 500,
        color: active ? meta.color : "#64748b",
        textTransform: "capitalize",
      }}>
        {day.slice(0,3).toUpperCase()}
      </Typography>
    </Box>
  );
};

/* ── Time input field ── */
const TimeField = ({ label, value, onChange }) => (
  <TextField
    fullWidth
    label={label}
    type="time"
    value={value}
    onChange={onChange}
    InputLabelProps={{ shrink: true }}
    sx={{
      "& .MuiOutlinedInput-root": {
        borderRadius: "10px",
        fontSize: "0.875rem",
        "& fieldset": { borderColor: "#e2e8f0" },
        "&:hover fieldset": { borderColor: "#c4b5fd" },
        "&.Mui-focused fieldset": { borderColor: "#7c3aed", borderWidth: "1.5px" },
      },
      "& .MuiInputLabel-root.Mui-focused": { color: "#7c3aed" },
    }}
  />
);

/* ── Main component ── */
const CustomShift = ({ open, close, getData }) => {
  const [shift, setShift] = useState(
    Object.fromEntries(DAYS.map(d => [d, null]))
  );

  // Reset when modal opens
  useEffect(() => {
    if (open) setShift(Object.fromEntries(DAYS.map(d => [d, null])));
  }, [open]);

  const toggleDay = (day, checked) => {
    setShift(prev => ({ ...prev, [day]: checked ? EMPTY_SHIFT() : null }));
  };

  const handleField = (day, field, value) => {
    setShift(prev => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  };

  const handleSave = () => {
    const data = DAYS.flatMap(day => {
      const val = shift[day];
      if (!val) return [];
      return [{
        day,
        timeIn: formatTime(val.timeIn),
        timeOut: formatTime(val.timeOut),
        timeInFlexibility: val.flexibility.toString(),
      }];
    });
    getData(data);
    close();
  };

  const activeDays   = DAYS.filter(d => shift[d] !== null);
  const canSave      = activeDays.length > 0 &&
    activeDays.every(d => shift[d].timeIn && shift[d].timeOut);

  return (
    <Dialog
      open={open}
      onClose={close}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        className: "modal-anim",
        sx: {
          borderRadius: "20px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.6)",
        },
      }}
      BackdropProps={{
        sx: { backdropFilter: "blur(4px)", bgcolor: "rgba(15,12,41,0.55)" },
      }}
    >
      {/* ── Header ── */}
      <Box sx={{
        background: "linear-gradient(110deg,#0f0c29 0%,#1a1340 55%,#24243e 100%)",
        px: 3, py: 2.5,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: "10px",
            bgcolor: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <AccessTimeRoundedIcon sx={{ fontSize: 18, color: "#a78bfa" }} />
          </Box>
          <Box>
            <Typography sx={{ paddingTop: '10px', color: "#e2d9fc", fontWeight: 800, fontSize: "1rem", lineHeight: 1.2 }}>
              Custom Shift
            </Typography>
            <Typography sx={{ paddingBottom: '5px', color: "rgba(255,255,255,0.38)", fontSize: "0.7rem", fontWeight: 500, mt: 0.2 }}>
              Configure per-day schedules
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={close}
          size="small"
          sx={{
            color: "rgba(255,255,255,0.45)", bgcolor: "rgba(255,255,255,0.07)",
            borderRadius: "8px", width: 32, height: 32,
            "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.14)" },
            transition: "all 0.18s ease",
          }}
        >
          <CloseRoundedIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3, bgcolor: "#fafbff" }}>

        {/* ── Day selector ── */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{
            fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8",
            textTransform: "uppercase", letterSpacing: "1px", mb: 1.5,
          }}>
            Select Days
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {DAYS.map((day, i) => (
              <DayPill
                key={day}
                day={day}
                active={!!shift[day]}
                onClick={() => toggleDay(day, !shift[day])}
                animDelay={i * 35}
              />
            ))}
          </Box>
        </Box>

        {/* ── Per-day time fields ── */}
        {activeDays.length === 0 && (
          <Box sx={{
            py: 5, display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5,
            border: "1.5px dashed #e2e8f0", borderRadius: "14px",
          }}>
            <Box sx={{
              width: 48, height: 48, borderRadius: "14px", bgcolor: "#f1f5f9",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <AccessTimeRoundedIcon sx={{ fontSize: 22, color: "#cbd5e1" }} />
            </Box>
            <Typography sx={{ color: "#94a3b8", fontWeight: 600, fontSize: "0.85rem" }}>
              Select days above to set shift times
            </Typography>
          </Box>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {activeDays.map((day, idx) => {
            const meta = DAY_COLORS[day];
            const data = shift[day];
            return (
              <Box
                key={day}
                className="fields-in"
                style={{ animationDelay: `${idx * 40}ms` }}
                sx={{
                  borderRadius: "14px",
                  border: `1.5px solid ${meta.border}`,
                  bgcolor: "#fff",
                  overflow: "hidden",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                {/* Day header strip */}
                <Box sx={{
                  px: 2, py: "10px",
                  bgcolor: meta.bg,
                  borderBottom: `1px solid ${meta.border}`,
                  display: "flex", alignItems: "center", gap: "8px",
                }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: meta.dot }} />
                  <Typography sx={{
                    fontSize: "0.8rem", fontWeight: 800,
                    color: meta.color, textTransform: "capitalize",
                  }}>
                    {day}
                  </Typography>
                  <Box sx={{ flex: 1 }} />
                  <IconButton
                    size="small"
                    onClick={() => toggleDay(day, false)}
                    sx={{
                      width: 22, height: 22, borderRadius: "6px",
                      color: meta.color, bgcolor: `${meta.dot}22`,
                      "&:hover": { bgcolor: `${meta.dot}44` },
                    }}
                  >
                    <CloseRoundedIcon sx={{ fontSize: 12 }} />
                  </IconButton>
                </Box>

                {/* Fields */}
                <Box sx={{
                  px: 2, py: 2,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "10px",
                }}>
                  <TimeField
                    label="Time In"
                    value={data.timeIn}
                    onChange={e => handleField(day, "timeIn", e.target.value)}
                  />
                  <TimeField
                    label="Time Out"
                    value={data.timeOut}
                    onChange={e => handleField(day, "timeOut", e.target.value)}
                  />
                  <TextField
                    fullWidth
                    label="Flexibility (min)"
                    type="number"
                    value={data.flexibility}
                    onChange={e => handleField(day, "flexibility", e.target.value)}
                    inputProps={{ min: 0 }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px", fontSize: "0.875rem",
                        "& fieldset": { borderColor: "#e2e8f0" },
                        "&:hover fieldset": { borderColor: "#c4b5fd" },
                        "&.Mui-focused fieldset": { borderColor: "#7c3aed", borderWidth: "1.5px" },
                      },
                      "& .MuiInputLabel-root.Mui-focused": { color: "#7c3aed" },
                    }}
                  />
                </Box>
              </Box>
            );
          })}
        </Box>
      </DialogContent>

      {/* ── Footer ── */}
      <Box sx={{
        px: 3, py: 2,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        bgcolor: "#fff",
        borderTop: "1px solid #f1f5f9",
      }}>
        <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 500 }}>
          {activeDays.length > 0
            ? `${activeDays.length} day${activeDays.length > 1 ? "s" : ""} selected`
            : "No days selected"}
        </Typography>
        <Box sx={{ display: "flex", gap: "10px" }}>
          <Button
            onClick={close}
            sx={{
              color: "#64748b", fontWeight: 600, fontSize: "0.82rem",
              borderRadius: "10px", px: 2.5, py: 1, textTransform: "none",
              border: "1px solid #e2e8f0",
              "&:hover": { bgcolor: "#f8fafc", borderColor: "#cbd5e1" },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={!canSave}
            onClick={handleSave}
            sx={{
              background: canSave
                ? "linear-gradient(110deg,#0f0c29 0%,#1a1340 55%,#24243e 100%)"
                : undefined,
              borderRadius: "10px", fontWeight: 700, fontSize: "0.82rem",
              px: 2.5, py: 1, textTransform: "none",
              boxShadow: canSave ? "0 4px 14px rgba(15,12,41,0.35)" : "none",
              transition: "all 0.22s ease",
              "&:hover": canSave ? {
                boxShadow: "0 6px 20px rgba(15,12,41,0.45)",
                transform: "translateY(-1px)",
              } : {},
              "&:active": { transform: "scale(0.97)" },
            }}
          >
            Save Shifts
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default CustomShift;