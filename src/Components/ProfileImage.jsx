import * as React from "react";
import { useState, useEffect, useRef } from "react";
import Avatar from "@mui/material/Avatar";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { toast } from "react-toastify";
import CameraAltRoundedIcon    from "@mui/icons-material/CameraAltRounded";
import CloudUploadRoundedIcon  from "@mui/icons-material/CloudUploadRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import CloseRoundedIcon        from "@mui/icons-material/CloseRounded";
import CheckRoundedIcon        from "@mui/icons-material/CheckRounded";
import PersonRoundedIcon       from "@mui/icons-material/PersonRounded";

/* ── Inject styles once ── */
const STYLES = `
  @keyframes fadeSlideUp {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0);    }
  }
  @keyframes rotateBorder {
    to { transform: rotate(360deg); }
  }
  @keyframes pulseRing {
    0%,100% { box-shadow: 0 0 0 0 rgba(124,58,237,0); }
    50%      { box-shadow: 0 0 0 6px rgba(124,58,237,.18); }
  }
  @keyframes spinArc {
    to { transform: rotate(360deg); }
  }
  @keyframes shimmerDrop {
    0%   { background-position: -200% 0; }
    100% { background-position:  200% 0; }
  }
  @keyframes checkPop {
    0%   { transform:scale(0) rotate(-20deg); opacity:0; }
    65%  { transform:scale(1.2) rotate(5deg); }
    100% { transform:scale(1) rotate(0);      opacity:1; }
  }
  @keyframes overlayFadeIn {
    from { opacity:0; }
    to   { opacity:1; }
  }

  .profile-avatar-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  .profile-avatar-wrap::before {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    background: linear-gradient(135deg, #7c3aed, #6366f1, #a78bfa, #7c3aed);
    background-size: 300% 300%;
    z-index: 0;
    animation: rotateBorder 3s linear infinite;
  }
  .profile-avatar-inner {
    position: relative;
    z-index: 1;
    border-radius: 50%;
    padding: 2.5px;
    background: white;
    line-height: 0;
  }
  .profile-avatar-overlay {
    position: absolute;
    inset: 2.5px;
    border-radius: 50%;
    background: rgba(15,12,41,.55);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    z-index: 2;
    transition: opacity .22s ease;
    animation: none;
  }
  .profile-avatar-wrap:hover .profile-avatar-overlay { opacity: 1; }
  .profile-avatar-wrap:hover::before { background-size: 200% 200%; }

  .drop-zone {
    border: 2px dashed rgba(124,58,237,.35);
    border-radius: 14px;
    background: rgba(124,58,237,.04);
    transition: all .2s ease;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .drop-zone.drag-over {
    border-color: rgba(124,58,237,.7);
    background: rgba(124,58,237,.09);
  }
  .drop-zone::after {
    content:'';
    position:absolute; top:0; left:-200%; width:60%; height:100%;
    background: linear-gradient(90deg, transparent, rgba(124,58,237,.08), transparent);
    background-size: 200% 100%;
    animation: shimmerDrop 2.5s ease-in-out infinite;
  }
  .drop-zone:hover {
    border-color: rgba(124,58,237,.6);
    background: rgba(124,58,237,.07);
  }

  .modal-anim { animation: fadeSlideUp .3s cubic-bezier(.22,1,.36,1) both; }
  .check-pop  { animation: checkPop .4s cubic-bezier(.34,1.56,.64,1) both; }
`;

if (typeof document !== "undefined" && !document.getElementById("profile-img-styles")) {
  const s = document.createElement("style");
  s.id = "profile-img-styles";
  s.textContent = STYLES;
  document.head.appendChild(s);
}

const ProfileImage = () => {
  const [avatarSrc,    setAvatarSrc]    = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [open,         setOpen]         = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [isDragging,   setIsDragging]   = useState(false);
  const [uploaded,     setUploaded]     = useState(false);
  const fileInputRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const saved = localStorage.getItem("profileImage");
    if (saved) setAvatarSrc(saved);
  }, []);

  const handleClose = () => {
    setOpen(false);
    setPreviewImage("");
    setSelectedFile(null);
    setUploaded(false);
  };

  const processFile = (file) => {
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreviewImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => processFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const saveImage = async () => {
    if (!selectedFile) { toast.error("Please select an image first"); return; }
    const formData = new FormData();
    formData.append("file", selectedFile);
    try {
      setLoading(true);
      const res    = await fetch(`${API_URL}/user/uploadProfilePic`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("Token")}` },
        body: formData,
      });
      const result = await res.json();
      if (res.ok) {
        const finalImage = result.url || previewImage;
        setAvatarSrc(finalImage);
        localStorage.setItem("profileImage", finalImage);
        setUploaded(true);
        setTimeout(() => { toast.success("Profile picture updated!"); handleClose(); }, 900);
      } else { toast.error("Upload failed"); }
    } catch { toast.error("Something went wrong"); }
    finally { setLoading(false); }
  };

  const removeImage = async () => {
    try {
      setLoading(true);
      setAvatarSrc("");
      localStorage.removeItem("profileImage");
      toast.success("Profile picture removed");
      handleClose();
    } catch { toast.error("Failed to remove image"); }
    finally { setLoading(false); }
  };

  return (
    <>
      {/* ── Trigger avatar ── */}
      <Box onClick={() => setOpen(true)}  sx={{
            position: "relative",
            display: "inline-flex",
            cursor: "pointer",   // ✅ pointer added
        }}>
        <Box sx={{ border: "1.5px solid #7c3aed", borderRadius:'50%', padding: '2px' }}>
          <Avatar
            src={avatarSrc || undefined}
            sx={{ width: 45, height: 45, bgcolor:"rgba(124,58,237,.15)", color:"#7c3aed" }}
          >
            {!avatarSrc && <PersonRoundedIcon sx={{ fontSize:20 }} />}
          </Avatar>
        </Box>
        {/* hover overlay */}
        <Box className="profile-avatar-overlay">
          <CameraAltRoundedIcon sx={{ fontSize:14, color:"white" }} />
        </Box>
      </Box>

      {/* ── Modal ── */}
      <Modal
        open={open}
        onClose={handleClose}
        sx={{ display:"flex", alignItems:"center", justifyContent:"center", p:2, backdropFilter:"blur(4px)" }}
      >
        <Box className="modal-anim" sx={{
          position:"relative", width:"100%", maxWidth:440,
          borderRadius:"22px", overflow:"hidden", outline:"none",
          boxShadow:"0 30px 90px rgba(0,0,0,.28), 0 0 0 1px rgba(255,255,255,.08)",
        }}>

          {/* ── Modal top bar ── */}
          <Box sx={{ background:"linear-gradient(110deg,#0f0c29 0%,#1a1340 55%,#24243e 100%)", px:3.5, py:2, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <Box sx={{ display:"flex", alignItems:"center", gap:"10px" }}>
              <Box sx={{ width:28, height:28, borderRadius:"8px", bgcolor:"rgba(167,139,250,.15)", border:"1px solid rgba(167,139,250,.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <CameraAltRoundedIcon sx={{ fontSize:14, color:"#a78bfa" }} />
              </Box>
              <Typography sx={{ fontSize:".9rem", fontWeight:800, color:"white", letterSpacing:".01em" }}>
                Profile Picture
              </Typography>
            </Box>
            <Box component="button" onClick={handleClose} sx={{ width:30, height:30, borderRadius:"8px", border:"1px solid rgba(255,255,255,.12)", bgcolor:"rgba(255,255,255,.07)", color:"rgba(255,255,255,.6)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all .18s", "&:hover":{ bgcolor:"rgba(255,255,255,.14)", color:"white" } }}>
              <CloseRoundedIcon sx={{ fontSize:15 }} />
            </Box>
          </Box>

          {/* ── Modal body ── */}
          <Box sx={{ bgcolor:"white", p:3.5, display:"flex", flexDirection:"column", gap:3 }}>

            {/* Preview area */}
            <Box sx={{ display:"flex", justifyContent:"center" }}>
              <Box sx={{ position:"relative" }}>
                {/* spinning gradient ring */}
                <Box sx={{
                  position:"absolute", inset:-4, borderRadius:"50%",
                  background:"linear-gradient(135deg,#7c3aed,#6366f1,#a78bfa,#7c3aed)",
                  backgroundSize:"300% 300%",
                  animation:"rotateBorder 3s linear infinite",
                  opacity: previewImage || avatarSrc ? 1 : 0.4,
                }} />
                <Box sx={{ position:"relative", zIndex:1, borderRadius:"50%", p:"3px", bgcolor:"white" }}>
                  <Avatar
                    src={previewImage || avatarSrc || undefined}
                    sx={{ width:96, height:96, bgcolor:"rgba(124,58,237,.08)", color:"#7c3aed" }}
                  >
                    {!previewImage && !avatarSrc && <PersonRoundedIcon sx={{ fontSize:42 }} />}
                  </Avatar>
                  {/* uploaded flash */}
                  {uploaded && (
                    <Box className="check-pop" sx={{
                      position:"absolute", inset:0, borderRadius:"50%",
                      bgcolor:"rgba(16,185,129,.88)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2,
                    }}>
                      <CheckRoundedIcon sx={{ fontSize:38, color:"white" }} />
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Drop zone */}
            <Box
              className={`drop-zone${isDragging ? " drag-over" : ""}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              sx={{ p:3, display:"flex", flexDirection:"column", alignItems:"center", gap:1.5 }}
            >
              <Box sx={{ width:44, height:44, borderRadius:"12px", bgcolor:"rgba(124,58,237,.1)", border:"1.5px solid rgba(124,58,237,.2)", display:"flex", alignItems:"center", justifyContent:"center", color:"#7c3aed", transition:"transform .2s", ".drop-zone:hover &":{ transform:"scale(1.1)" } }}>
                <CloudUploadRoundedIcon sx={{ fontSize:22 }} />
              </Box>
              <Box sx={{ textAlign:"center" }}>
                <Typography sx={{ fontSize:".82rem", fontWeight:700, color:"#374151" }}>
                  {selectedFile ? selectedFile.name : "Drop your image here"}
                </Typography>
                <Typography sx={{ fontSize:".72rem", color:"#9ca3af", mt:.3 }}>
                  {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : "or click to browse · PNG, JPG up to 5MB"}
                </Typography>
              </Box>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display:"none" }} />
            </Box>

            {/* File chip if selected */}
            {selectedFile && (
              <Box sx={{ display:"flex", alignItems:"center", justifyContent:"space-between", px:"12px", py:"8px", bgcolor:"rgba(99,102,241,.06)", border:"1px solid rgba(99,102,241,.18)", borderRadius:"10px" }}>
                <Box sx={{ display:"flex", alignItems:"center", gap:"8px" }}>
                  <Box sx={{ width:8, height:8, borderRadius:"50%", bgcolor:"#6366f1", boxShadow:"0 0 6px #6366f1" }} />
                  <Typography sx={{ fontSize:".75rem", fontWeight:600, color:"#374151", maxWidth:260, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{selectedFile.name}</Typography>
                </Box>
                <Box component="button" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setPreviewImage(""); }}
                  sx={{ background:"none", border:"none", color:"#9ca3af", cursor:"pointer", display:"flex", alignItems:"center", p:0, "&:hover":{ color:"#ef4444" }, transition:"color .15s" }}>
                  <CloseRoundedIcon sx={{ fontSize:15 }} />
                </Box>
              </Box>
            )}

            {/* Action buttons */}
            <Box sx={{ display:"flex", gap:1.5, flexWrap:"wrap" }}>
              <Button onClick={handleClose} sx={{
                flex:1, py:1, borderRadius:"10px", textTransform:"none", fontWeight:600, fontSize:".82rem",
                color:"#6b7280", border:"1.5px solid #e5e7eb", bgcolor:"#f9fafb",
                "&:hover":{ bgcolor:"#f3f4f6", borderColor:"#d1d5db" },
              }}>
                Cancel
              </Button>

              <Button onClick={saveImage} disabled={loading || !selectedFile || uploaded} variant="contained"
                startIcon={loading
                  ? <Box sx={{ width:14, height:14, borderRadius:"50%", border:"2px solid rgba(255,255,255,.3)", borderTopColor:"white", animation:"spinArc .7s linear infinite" }} />
                  : uploaded
                  ? <CheckRoundedIcon sx={{ fontSize:"15px !important" }} />
                  : <CloudUploadRoundedIcon sx={{ fontSize:"15px !important" }} />
                }
                sx={{
                  flex:2, py:1, borderRadius:"10px", textTransform:"none", fontWeight:700, fontSize:".82rem",
                  background:"linear-gradient(110deg,#0f0c29 0%,#1a1340 60%,#24243e 100%)",
                  boxShadow:"0 4px 14px rgba(15,12,41,.35)", transition:"all .22s ease",
                  "&:hover":{ boxShadow:"0 6px 20px rgba(15,12,41,.45)", transform:"translateY(-1px)" },
                  "&:active":{ transform:"scale(.97)" },
                  "&:disabled":{ opacity:.55 },
                }}>
                {loading ? "Uploading…" : uploaded ? "Saved!" : "Save Picture"}
              </Button>

              {avatarSrc && !selectedFile && (
                <Button onClick={removeImage} disabled={loading}
                  startIcon={<DeleteOutlineRoundedIcon sx={{ fontSize:"15px !important" }} />}
                  sx={{
                    flex:1, py:1, borderRadius:"10px", textTransform:"none", fontWeight:600, fontSize:".82rem",
                    color:"#ef4444", border:"1.5px solid rgba(239,68,68,.25)", bgcolor:"rgba(239,68,68,.05)",
                    "&:hover":{ bgcolor:"rgba(239,68,68,.1)", borderColor:"rgba(239,68,68,.45)" },
                    "&:disabled":{ opacity:.45 },
                  }}>
                  Remove
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default ProfileImage;