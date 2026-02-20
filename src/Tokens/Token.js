import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';

const Token = ({children}) => {

    const navigate = useNavigate();

  useEffect(() => {
    const checkToken = localStorage.getItem('Token');

    if (!checkToken) {
        navigate('/login');
        
    }
  }, []);

  return children;
}

export default Token