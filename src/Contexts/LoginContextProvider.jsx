import React, { useEffect, useState } from 'react';
import LoginContext from './LoginContext';

const LoginContextProvider = ({ children }) => {
  const [name, setName] = useState();
  const [userData, setUserData] = useState('');
  const [loading, setLoading] = useState(true); // ⬅️ loader state

  

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL;
    

    const fetchUserData = async () => {
      setLoading(true); // loader start
      try {
        const url = `${API_URL}/user/getUserProfile`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('Token')}`
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
        setLoading(false); // loader stop
      }
    };

    fetchUserData();
  }, []);

  return (
    <LoginContext.Provider value={{ name, setName, userData, setUserData, loading }}>
      {children}
    </LoginContext.Provider>
  );
};

export default LoginContextProvider;
