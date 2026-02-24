import React, { useEffect, useState } from 'react';
import LoginContext from './LoginContext';

const LoginContextProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchUserData = async (token) => {
    try {
      const response = await fetch(`${API_URL}/user/getUserProfile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (result.isSuccess) {
        setUserData(result.data);
      } else {
        setUserData(null);
      }

    } catch (error) {
      console.error("Failed to fetch user data:", error);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("Token");

    if (!token) {
      setUserData(null);
      setLoading(false);
      return;
    }

    fetchUserData(token);

  }, []);

  return (
    <LoginContext.Provider value={{ userData, setUserData, loading }}>
      {children}
    </LoginContext.Provider>
  );
};

export default LoginContextProvider;