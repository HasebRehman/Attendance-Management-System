import React from 'react'
import Sidebar from '../Sidebar/Sidebar'
import { Outlet } from 'react-router-dom'

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <div className="ml-0 lg:ml-60 pt-20 p-6">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Home