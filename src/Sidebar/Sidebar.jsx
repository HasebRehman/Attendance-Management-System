import React, { useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { Box, CssBaseline, IconButton, Typography, Drawer } from "@mui/material";

import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import FingerprintRoundedIcon from "@mui/icons-material/FingerprintRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import ListAltRoundedIcon from "@mui/icons-material/ListAltRounded";
import BeachAccessRoundedIcon from "@mui/icons-material/BeachAccessRounded";
import CelebrationRoundedIcon from "@mui/icons-material/CelebrationRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AccessTimeFilledRoundedIcon from "@mui/icons-material/AccessTimeFilledRounded";

import LoginContext from "../Contexts/LoginContext";

const drawerWidth = 240;

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .sidebar-root {
    font-family: 'DM Sans', sans-serif;
  }

  .sidebar-paper {
    width: ${drawerWidth}px;
    background: linear-gradient(160deg, #0f0c29, #1a1340, #24243e) !important;
    border-right: none !important;
    box-shadow: 6px 0 40px rgba(0, 0, 0, 0.45), 2px 0 12px rgba(99, 77, 255, 0.15) !important;
    overflow: hidden;
    z-index: 1300 !important;
  }

  .sidebar-header {
    padding: 28px 20px 20px;
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    margin-bottom: 8px;
  }

  .sidebar-logo-icon {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #a78bfa, #6366f1);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 14px rgba(99, 102, 241, 0.5);
    flex-shrink: 0;
  }

  .sidebar-logo-icon svg {
    color: #fff;
    font-size: 18px !important;
  }

  .sidebar-brand {
    font-family: 'Syne', sans-serif !important;
    font-weight: 700 !important;
    font-size: 1.05rem !important;
    color: #fff !important;
    letter-spacing: 0.5px;
    line-height: 1 !important;
  }

  .sidebar-brand span {
    display: block;
    font-size: 0.65rem;
    font-weight: 400;
    color: rgba(255,255,255,0.4);
    letter-spacing: 1.5px;
    text-transform: uppercase;
    font-family: 'DM Sans', sans-serif;
    margin-top: 3px;
  }

  .menu-section-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.62rem;
    font-weight: 500;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.25);
    padding: 16px 20px 6px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 11px 16px;
    margin: 2px 10px;
    border-radius: 12px;
    text-decoration: none;
    cursor: pointer;
    position: relative;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
  }

  .nav-item::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, rgba(167, 139, 250, 0.12), rgba(99, 102, 241, 0.08));
    opacity: 0;
    transition: opacity 0.25s ease;
    border-radius: 12px;
  }

  .nav-item:hover::before {
    opacity: 1;
  }

  .nav-item:hover {
    transform: translateX(4px);
  }

  .nav-item:hover .nav-icon {
    color: #a78bfa !important;
    transform: scale(1.1);
  }

  .nav-item:hover .nav-label {
    color: rgba(255,255,255,0.95) !important;
  }

  .nav-item.active {
    background: linear-gradient(135deg, rgba(167, 139, 250, 0.25), rgba(99, 102, 241, 0.2));
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 15px rgba(99, 102, 241, 0.15);
  }

  .nav-item.active::after {
    content: '';
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 60%;
    background: linear-gradient(180deg, #a78bfa, #6366f1);
    border-radius: 2px 0 0 2px;
  }

  .nav-icon {
    font-size: 20px !important;
    flex-shrink: 0;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .nav-icon.active-icon {
    color: #a78bfa !important;
    filter: drop-shadow(0 0 6px rgba(167, 139, 250, 0.6));
  }

  .nav-icon.inactive-icon {
    color: rgba(255,255,255,0.38) !important;
  }

  .nav-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.875rem;
    font-weight: 500;
    letter-spacing: 0.1px;
    white-space: nowrap;
    transition: color 0.2s ease;
  }

  .nav-label.active-label {
    color: #e2d9fc !important;
    font-weight: 600;
  }

  .nav-label.inactive-label {
    color: rgba(255,255,255,0.5) !important;
  }

  /* Stagger animation for menu items */
  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-18px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .nav-item-wrapper {
    animation: slideInLeft 0.35s cubic-bezier(0.4, 0, 0.2, 1) both;
  }

  .nav-item-wrapper:nth-child(1)  { animation-delay: 0.04s; }
  .nav-item-wrapper:nth-child(2)  { animation-delay: 0.08s; }
  .nav-item-wrapper:nth-child(3)  { animation-delay: 0.12s; }
  .nav-item-wrapper:nth-child(4)  { animation-delay: 0.16s; }
  .nav-item-wrapper:nth-child(5)  { animation-delay: 0.20s; }
  .nav-item-wrapper:nth-child(6)  { animation-delay: 0.24s; }
  .nav-item-wrapper:nth-child(7)  { animation-delay: 0.28s; }
  .nav-item-wrapper:nth-child(8)  { animation-delay: 0.32s; }

  @keyframes fadeDown {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .sidebar-header {
    animation: fadeDown 0.4s ease both;
  }

  /* Mobile AppBar */
  .mobile-appbar {
    background: linear-gradient(90deg, #0f0c29, #24243e) !important;
    box-shadow: 0 2px 20px rgba(0,0,0,0.4) !important;
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(255,255,255,0.06) !important;
  }

  .mobile-brand {
    font-family: 'Syne', sans-serif !important;
    font-weight: 700 !important;
    font-size: 1rem !important;
    color: #fff !important;
    flex: 1;
    margin-left: 8px;
  }

  .hamburger-btn {
    color: rgba(255,255,255,0.8) !important;
    transition: transform 0.2s ease !important;
  }

  .hamburger-btn:hover {
    transform: scale(1.1);
    color: #a78bfa !important;
  }

  /* Sidebar footer */
  .sidebar-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 14px 20px;
    border-top: 1px solid rgba(255,255,255,0.06);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .sidebar-footer-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #4ade80;
    box-shadow: 0 0 6px rgba(74, 222, 128, 0.7);
    animation: pulse 2s ease infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(0.85); }
  }

  .sidebar-footer-text {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.7rem;
    color: rgba(255,255,255,0.3);
    letter-spacing: 0.5px;
  }

  /* Noise texture overlay */
  .sidebar-noise {
    position: absolute;
    inset: 0;
    opacity: 0.025;
    pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    background-repeat: repeat;
    background-size: 128px;
  }
`;

const NavItem = ({ item, isActive }) => (
  <div className="nav-item-wrapper">
    <Link
      to={item.path}
      className={`nav-item ${isActive ? "active" : ""}`}
      style={{ display: "flex" }}
    >
      <span className={`nav-icon ${isActive ? "active-icon" : "inactive-icon"}`}>
        {item.icon}
      </span>
      <span className={`nav-label ${isActive ? "active-label" : "inactive-label"}`}>
        {item.text}
      </span>
    </Link>
  </div>
);

const DrawerContent = ({ menuItems, location, onClose }) => (
  <Box sx={{ position: "relative", height: "100%", overflow: "hidden" }}>
    <div className="sidebar-noise" />

    {/* Header */}
    <div className="sidebar-header">
      <div className="sidebar-logo-icon">
        <AccessTimeFilledRoundedIcon />
      </div>
      <div>
        <p className="text-white font-bold text-base leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>
          AttendPro
        </p>
        <p className="text-[0.6rem] tracking-[2px] uppercase mt-0.5" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Outfit', sans-serif" }}>
          Management System
        </p>
      </div>
      {onClose && (
        <IconButton onClick={onClose} sx={{ ml: "auto", color: "rgba(255,255,255,0.4)", p: 0.5 }}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      )}
    </div>

    {/* Menu */}
    <div style={{ padding: "35px 0 80px" }}>
      <div className="menu-section-label">Navigation</div>
      {menuItems.map((item) => (
        <NavItem key={item.text} item={item} isActive={location.pathname === item.path} />
      ))}
    </div>

    {/* Footer */}
    {/* <div className="sidebar-footer">
      <div className="sidebar-footer-dot" />
      <span className="sidebar-footer-text">System Online</span>
    </div> */}
  </Box>
);

const Sidebar = () => {
  const { userData } = useContext(LoginContext);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const adminMenu = [
    { text: "Dashboard",        path: "/dashboard",        icon: <DashboardRoundedIcon /> },
    { text: "Employees",        path: "/employees",        icon: <PeopleAltRoundedIcon /> },
    { text: "Schedules",        path: "/schedules",        icon: <CalendarMonthRoundedIcon /> },
    { text: "Attendance Logs",  path: "/attendance-logs",  icon: <ListAltRoundedIcon /> },
    { text: "Report",           path: "/attendance-report",icon: <AssessmentRoundedIcon /> },
    { text: "Holidays",         path: "/custom-holidays",  icon: <CelebrationRoundedIcon /> },
    { text: "Leave",            path: "/leave-management", icon: <BeachAccessRoundedIcon /> },
  ];

  const userMenu = [
    { text: "Dashboard",  path: "/dashboard",  icon: <DashboardRoundedIcon /> },
    { text: "Attendance", path: "/attendance", icon: <FingerprintRoundedIcon /> },
    { text: "History",    path: "/history",    icon: <HistoryRoundedIcon /> },
  ];

  const menuItems = userData?.role === "admin" ? adminMenu : userMenu;

  return (
    <>
      <style>{styles}</style>
      <CssBaseline />

      {/* ── Mobile AppBar ── */}
      <Box
        className="mobile-appbar"
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1400,
          height: 56,
          display: { xs: "flex", md: "none" },
          alignItems: "center",
          px: 1.5,
        }}
      >
        <IconButton
          className="hamburger-btn"
          onClick={() => setMobileOpen(true)}
          edge="start"
        >
          <MenuRoundedIcon />
        </IconButton>
        <Typography className="mobile-brand">AttendPro</Typography>
      </Box>

      {/* ── Desktop Permanent Drawer ── */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: drawerWidth,
          flexShrink: 0,
          zIndex: 1300,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        PaperProps={{ className: "sidebar-paper" }}
        open
      >
        <DrawerContent menuItems={menuItems} location={location} />
      </Drawer>

      {/* ── Mobile Temporary Drawer ── */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          zIndex: 1500,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        PaperProps={{ className: "sidebar-paper" }}
      >
        <DrawerContent
          menuItems={menuItems}
          location={location}
          onClose={() => setMobileOpen(false)}
        />
      </Drawer>
    </>
  );
};

export default Sidebar;