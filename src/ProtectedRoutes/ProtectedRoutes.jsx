import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import LoginContext from "../Contexts/LoginContext";

const ProtectedRoutes = ({ roles = [], children }) => {
  const { userData, loading } = useContext(LoginContext);

  // jab tak user load ho raha hai
  if (loading) return null; // ya loader

  // login nahi hai
  if (!userData) {
    return <Navigate to="/login" replace />;
  }

  // role check (sirf agar roles diye gaye hain)
  if (roles.length > 0 && !roles.includes(userData.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoutes;
