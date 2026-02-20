import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";

const Loader = ({ message = "Loading...", isVisible = true }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setFadeOut(true);
    }
  }, [isVisible]);

  return (
    <Box
      className={`fixed top-0 left-0 w-full h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-blue-50 to-indigo-50 z-50 transition-opacity duration-500 pointer-events-none ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
      sx={{ backdropFilter: "blur(2px)" }}
    >
      {/* Animated loader dots */}
      <Box className="relative w-20 h-20 mb-6">
        <Box
          className="absolute inset-0 rounded-full"
          sx={{
            border: "3px solid transparent",
            borderTop: "3px solid #6366f1",
            borderRight: "3px solid #818cf8",
            animation: "spin 1s linear infinite",
          }}
        />
        <Box
          className="absolute inset-2 rounded-full"
          sx={{
            border: "2px solid transparent",
            borderBottom: "2px solid #a78bfa",
            animation: "spinReverse 2s linear infinite",
          }}
        />
        <Box className="absolute inset-0 flex items-center justify-center">
          <Box className="text-2xl font-bold text-indigo-600">•</Box>
        </Box>
      </Box>

      {/* Loading text with fade animation */}
      <Typography
        sx={{
          mt: 2,
          fontWeight: 700,
          color: "#0f0c29",
          fontSize: "1rem",
          letterSpacing: "0.5px",
          animation: "fadeInOut 1.5s ease-in-out infinite",
        }}
      >
        {message}
      </Typography>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes spinReverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }

        @keyframes fadeInOut {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        body.loader-active {
          overflow: hidden;
        }

        body.loader-hidden {
          overflow: auto;
        }
      `}</style>
    </Box>
  );
};

export default Loader;
