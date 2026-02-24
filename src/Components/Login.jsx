import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import LoginContext from "../Contexts/LoginContext";

import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Paper,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import AccessTimeFilledRoundedIcon from "@mui/icons-material/AccessTimeFilledRounded";
// import FingerprintRoundedIcon      from "@mui/icons-material/FingerprintRounded";
import LockRoundedIcon             from "@mui/icons-material/LockRounded";
import MailRoundedIcon             from "@mui/icons-material/MailRounded";
import ArrowForwardRoundedIcon     from "@mui/icons-material/ArrowForwardRounded";

const Login = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [year, setYear] = useState('');

  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  const navigate   = useNavigate();
  const { setName } = useContext(LoginContext);
  const loginYear = new Date().getFullYear();
  

  useEffect(() => {
    setYear(loginYear);
    const token = localStorage.getItem("Token");
    console.log(token);
    
    if (token) {
      navigate("/dashboard", { replace: true });
      
    } 

  }, []);

  const togglePassword = () => setShowPassword((p) => !p);

  const userLogin = async () => {
    setError("");
    if (!email && !password) return setError("Enter email and password");
    if (!email)              return setError("Enter your email");
    if (!password)           return setError("Enter your password");
    if (!gmailRegex.test(email)) return setError("Enter a valid Gmail address");

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
    
      
      if (result.isSuccess) {
        localStorage.setItem("Token", result.data.token.accessToken);
        setName(result.data.userObject);
        navigate("/dashboard");
      } else {
        setError(result.message);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") userLogin();
  };

  // Shared MUI TextField sx override to match dark-indigo theme
  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      backgroundColor: "#f8f7ff",
      fontFamily: "'Outfit', sans-serif",
      "& fieldset": { borderColor: "rgba(99,102,241,0.2)" },
      "&:hover fieldset": { borderColor: "rgba(99,102,241,0.4)" },
      "&.Mui-focused fieldset": { borderColor: "#6366f1", borderWidth: "2px" },
    },
    "& .MuiInputLabel-root": {
      fontFamily: "'Outfit', sans-serif",
      color: "rgba(15,12,41,0.45)",
      "&.Mui-focused": { color: "#6366f1" },
    },
    "& .MuiInputBase-input": {
      fontFamily: "'Outfit', sans-serif",
      color: "#0f0c29",
      fontWeight: 500,
    },
  };

  return (
    <>
      {/* Outfit font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap"
        rel="stylesheet"
      />

      <Box className="w-screen h-screen flex overflow-hidden">

        {/* ── LEFT PANEL — dark indigo brand side ── */}
        <Box
          className="hidden md:flex flex-col justify-between p-10 w-[42%] flex-shrink-0 relative overflow-hidden"
          sx={{
            background: "linear-gradient(160deg, #0f0c29 0%, #1a1340 50%, #24243e 100%)",
          }}
        >
          {/* Decorative blobs */}
          <div className="absolute top-[-60px] left-[-60px] w-64 h-64 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #a78bfa, transparent)" }} />
          <div className="absolute bottom-[-40px] right-[-40px] w-48 h-48 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #6366f1, transparent)" }} />
          <div className="absolute top-[40%] right-[-30px] w-32 h-32 rounded-full opacity-5"
            style={{ background: "radial-gradient(circle, #a78bfa, transparent)" }} />

          {/* Logo */}
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #a78bfa, #6366f1)", boxShadow: "0 4px 14px rgba(99,102,241,0.5)" }}>
              <AccessTimeFilledRoundedIcon sx={{ color: "#fff", fontSize: 20 }} />
            </div>
            <div>
              <p className="text-white font-bold text-base leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>
                AttendPro
              </p>
              <p className="text-[0.6rem] tracking-[2px] uppercase mt-0.5" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Outfit', sans-serif" }}>
                Management System
              </p>
            </div>
          </div>

          {/* Center content */}
          <div className="relative z-10 space-y-8 mt-20">
            {/* <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.25)" }}>
              <FingerprintRoundedIcon sx={{ color: "#a78bfa", fontSize: 32 }} />
            </div> */}

            <div>
              <h1 className="mt-6 text-4xl font-black leading-tight text-white" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "-1px" }}>
                Attendance Management.<br />
                <span style={{ color: "#a78bfa" }}>System.</span>
              </h1>
              <p className="mt-4 text-sm font-normal leading-relaxed" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'Outfit', sans-serif" }}>
                A smarter way to handle employee attendance, schedules, and leave all in one place.
              </p>
            </div>

            {/* Feature pills */}
            <div className="flex flex-col gap-3">
              {["Real-time attendance tracking", "Smart leave management", "Detailed reports & analytics"].map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#a78bfa" }} />
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Outfit', sans-serif" }}>{f}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-[0.65rem] relative z-10" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "'Outfit', sans-serif" }}>
            © {year} AttendPro. All rights reserved.
          </p>
        </Box>

        {/* ── RIGHT PANEL — login form ── */}
        <Box
          className="flex-1 flex items-center justify-center p-6 md:p-12"
          sx={{ background: "#eef0f8" }}
        >
          <Paper
            elevation={0}
            className="w-full rounded-3xl p-8 md:p-10"
            sx={{
              maxWidth: 440,
              background: "#fff",
              border: "1px solid rgba(255,255,255,0.9)",
              boxShadow: "0 8px 40px rgba(15,12,41,0.1), 0 1px 4px rgba(15,12,41,0.05)",
              borderRadius: "24px",
            }}
          >
            {/* Mobile logo */}
            <div className="flex md:hidden items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #a78bfa, #6366f1)" }}>
                <AccessTimeFilledRoundedIcon sx={{ color: "#fff", fontSize: 16 }} />
              </div>
              <span className="font-bold text-sm text-[#0f0c29]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                AttendPro
              </span>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <Typography
                variant="h5"
                sx={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 800,
                  color: "#0f0c29",
                  letterSpacing: "-0.5px",
                  lineHeight: 1.1,
                  mb: 1,
                }}
              >
                Welcome back
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: "'Outfit', sans-serif",
                  color: "rgba(15,12,41,0.4)",
                  fontWeight: 400,
                }}
              >
                Sign in to your account to continue
              </Typography>
            </div>

            {/* Email field */}
            <Box className="mb-4">
              <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
                style={{ color: "rgba(15,12,41,0.4)", fontFamily: "'Outfit', sans-serif" }}>
                Email Address
              </label>
              <TextField
                fullWidth
                placeholder="you@gmail.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                onKeyDown={handleKeyDown}
                size="small"
                sx={fieldSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailRoundedIcon sx={{ fontSize: 18, color: "rgba(99,102,241,0.5)" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Password field */}
            <Box className="mb-2">
              <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
                style={{ color: "rgba(15,12,41,0.4)", fontFamily: "'Outfit', sans-serif" }}>
                Password
              </label>
              <TextField
                fullWidth
                placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                onKeyDown={handleKeyDown}
                size="small"
                sx={fieldSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockRoundedIcon sx={{ fontSize: 18, color: "rgba(99,102,241,0.5)" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={togglePassword} edge="end" size="small">
                        {showPassword
                          ? <VisibilityOff sx={{ fontSize: 18, color: "rgba(15,12,41,0.35)" }} />
                          : <Visibility   sx={{ fontSize: 18, color: "rgba(15,12,41,0.35)" }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Error */}
            {error && (
              <Box className="mt-3 px-4 py-2.5 rounded-xl flex items-start gap-2"
                sx={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
                <span className="text-red-500 text-xs mt-0.5">⚠</span>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "0.8rem",
                    color: "#dc2626",
                    fontWeight: 500,
                  }}
                >
                  {error}
                </Typography>
              </Box>
            )}

            <button>Forgot Password</button>

            {/* Login button */}
            <Button
              fullWidth
              onClick={userLogin}
              disabled={loading}
              endIcon={!loading && <ArrowForwardRoundedIcon sx={{ fontSize: "18px !important" }} />}
              sx={{
                mt: 4,
                py: 1.5,
                borderRadius: "12px",
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700,
                fontSize: "0.95rem",
                textTransform: "none",
                letterSpacing: "0.3px",
                background: loading
                  ? "rgba(99,102,241,0.5)"
                  : "linear-gradient(135deg, #a78bfa 0%, #6366f1 100%)",
                color: "#fff",
                boxShadow: loading ? "none" : "0 4px 20px rgba(99,102,241,0.35)",
                transition: "all 0.25s ease",
                "&:hover": {
                  background: "linear-gradient(135deg, #9d74f7 0%, #5558e8 100%)",
                  boxShadow: "0 6px 24px rgba(99,102,241,0.45)",
                  transform: "translateY(-1px)",
                },
                "&:active": { transform: "scale(0.98)" },
                "&:disabled": { cursor: "not-allowed", color: "#fff" },
              }}
            >
              {loading ? "Signing in…" : "Sign In"}
            </Button>

            {/* Divider hint */}
            <p className="text-center text-xs mt-5" style={{ color: "rgba(15,12,41,0.25)", fontFamily: "'Outfit', sans-serif" }}>
              Protected by enterprise-grade security
            </p>
          </Paper>
        </Box>

      </Box>
    </>
  );
};

export default Login;