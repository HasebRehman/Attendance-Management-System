import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import Login from './Components/Login'
import Dashboard from './Components/Dashboard'
import LoginContextProvider from './Contexts/LoginContextProvider'
import Token from './Tokens/Token'
import Home from './Components/Home'
import Schedule from './Components/Schedule'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Employees from './Components/Employees'
import AddEmployee from './Components/AddEmployee'
import EditEmployee from './Components/EditEmployee'
import CustomHolidays from './Components/CustomHolidays'
import LeaveManagement from './Components/LeaveManagement'
import AddLeave from './Components/AddLeave'
import Attendance from './Components/Attendance'
import History from './Components/History'
import ProtectedRoute from './ProtectedRoutes/ProtectedRoutes'
import Profile from './Components/Profile'
import AttendanceLog from './Components/AttendanceLog'
import AttendanceReport from './Components/AttendanceReport'
import { useContext } from 'react'
import LoginContext from './Contexts/LoginContext'
import Loader from './Loader/Loader'


function AppContent({ router }) {
  const { loading } = useContext(LoginContext); // ⬅️ login context se loader state

  return (
    <>
      {loading && <Loader message="Loading..." />} {/* Loader show */}
      <RouterProvider router={router} />
    </>
  );
}

function App() {

  const router = createBrowserRouter([
    {
      path: "/login",
      element: <Login />
    },
    {
      path: "/",
      element: <Token> <Home /> </Token> ,
      children: [
        {
          index: true,
          element: <Navigate to="dashboard" replace />
        },
        {
          path: "dashboard",
          element: 
            <ProtectedRoute roles={['admin', 'user']}>
              <Dashboard />
            </ProtectedRoute>
        },
        {
          path: "employees",
          element: <Token> <Employees /> </Token>,
        },
        {
          path: "employees/add",
          element: <Token> <AddEmployee /> </Token>
        },
        {
          path: "employees/edit/:employeeId",
          element: <Token> <EditEmployee /> </Token>
        },
        {
          path: 'schedules',
          element: <Token> <Schedule /> </Token>
        },
        {
          path: 'custom-holidays',
          element: <Token> <CustomHolidays /> </Token>
        },
        {
          path: 'leave-management',
          element: <Token> <LeaveManagement /> </Token>
        },
        {
          path: 'leave-management/add',
          element: <Token> <AddLeave /> </Token>
        },
        {
          path: 'leave-management/edit/:id',
          element: <Token> <AddLeave /> </Token>
        },
        {
          path: 'attendance',
          element: <Token> <Attendance /> </Token>
        },
        {
          path: 'history',
          element: <Token> <History /> </Token>
        },
        {
          path: 'profile',
          element: <Token> <Profile /> </Token>
        },
        {
          path: 'attendance-logs',
          element: <Token> <AttendanceLog /> </Token>
        },
        {
          path: 'attendance-report',
          element: <Token> <AttendanceReport /> </Token>
        }
      ]
    }
  ])

  return (
    <LoginContextProvider>
      <AppContent router={router} />  {/* ⬅️ loader integrated */}
      <ToastContainer />
    </LoginContextProvider>
  )
}

export default App
