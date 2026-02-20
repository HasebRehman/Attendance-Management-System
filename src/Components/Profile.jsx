import React from 'react'
import { useContext } from 'react'
import LoginContext from '../Contexts/LoginContext'

const Profile = () => {

  const { userData } = useContext(LoginContext);
  console.log(userData);
  
  return (
    <div className="p-6">
      <div className="card">Profile</div>
    </div>
  )
}

export default Profile