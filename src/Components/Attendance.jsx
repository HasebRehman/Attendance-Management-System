import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LoginContext from '../Contexts/LoginContext';
import { toast } from 'react-toastify';
import { Modal, Box } from '@mui/material';

const Attendance = () => {

    const [employeeName, setEmployeeName] = useState('');
    const [employeePosition, setEmployeePosition] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [employeeLeaveType, setEmployeeLeaveType] = useState('');
    const [employeeLeaves, setEmployeeLeaves] = useState(0);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');    
    const [cloUser, setCloUser] = useState('');
    

    const navigate = useNavigate();
    const {userData} = useContext(LoginContext);

    console.log("data", userData);

    const API_URL = import.meta.env.VITE_API_URL;
    const [showRequestLeavePage, setShowRequestLeavePage] = useState(false);

    const showHistoryPage = () => {
        navigate('/history');

    }

    useEffect(() => {
        setEmployeeName(userData?.fullName);
        setEmployeePosition(userData?.position);
        setEmployeeId(userData?._id);
        setCloUser(userData?.employeeId);

    }, [userData]);


    useEffect(() => {
        if (!startDate || !endDate) return;
    
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        setEmployeeLeaves(diffDays);
      }, [startDate, endDate]);


    
    const saveRequestLeaveData = async () => {
        const url = `${API_URL}/leave-management/create`;
        const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('Token')}`,
        },
        body: JSON.stringify({ 
            empDocId: employeeId,
            leaveType: employeeLeaveType,
            leaves: Number(employeeLeaves),
            startDate: startDate,
            endDate: endDate,
            reason: reason,
            status: 'pending'
         }),
      });

      const result = await response.json();
      console.log(result);

    if (result.isSuccess) {
        toast.success('Leave Request Submitted');
        navigate('/attendance');
        setEmployeeId('');
        setEmployeeLeaveType('');
        setEmployeeLeaves('');
        setStartDate('');
        setEndDate('');
        setReason('');

    } else if (employeeLeaveType === '' || startDate === '' || endDate === '' || reason === '') {
        toast.error('Fill the Leave Form ');

    } else {
        toast.error('something wents wrong');
        
    }
      
    }

    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '95%',
        maxWidth: '1152px',
        maxHeight: '92vh',
        bgcolor: 'background.paper',
        borderRadius: '12px',
        boxShadow: 24,
        overflow: 'auto',
    };

    const employeeAttendance = async () => {
        const url = `${API_URL}/attendance/create`;
        const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('Token')}`
        },
        body: JSON.stringify({
            empId: cloUser,
            reason: 'employee login'
      })
    });

        const result = await response.json();
        console.log(result);
        
        if (result?.isSuccess) {
            toast.success(result?.message);

        } else if (!result?.isSuccess) {
            toast.info(result?.message);

        } else {
            toast.error('Something wents wrong');

        }
        
    }

  return (
    <div className="p-6">

  {/* ================= MODAL ================= */}
  <Modal
    open={showRequestLeavePage}
    onClose={() => setShowRequestLeavePage(false)}
    aria-labelledby="request-leave-modal"
    maxWidth="md"
  >
    <Box sx={modalStyle}>
      <div className="bg-white rounded-2xl p-8 shadow-xl w-full max-w-4xl">

        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Request Leave
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Employee */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Employee</label>
            <input
              type="text"
              readOnly
              value={employeeName}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-800"
            />
          </div>

          {/* Position */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Position</label>
            <input
              type="text"
              readOnly
              value={employeePosition}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-800"
            />
          </div>

          {/* Leave Type */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Leave Type</label>
            <select
              value={employeeLeaveType}
              onChange={(e) => setEmployeeLeaveType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-800"
            >
              <option>Select Leave Type</option>
              <option value="sick leave">Sick Leave</option>
              <option value="annual leave">Annual Leave</option>
              <option value="maternity leave">Maternity Leave</option>
              <option value="paternity leave">Paternity Leave</option>
              <option value="unpaid leave">Unpaid Leave</option>
              <option value="study leave">Study Leave</option>
              <option value="emergency leave">Emergency Leave</option>
              <option value="public holiday">Public Holiday</option>
              <option value="special leave">Special Leave</option>
            </select>
          </div>

          {/* Start */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-800"
            />
          </div>

          {/* End */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-800"
            />
          </div>

          {/* Leaves */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Leaves</label>
            <input
              type="text"
              readOnly
              value={employeeLeaves}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-800"
            />
          </div>
        </div>

        {/* Reason */}
        <div className="mt-5">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Reason</label>
          <textarea
            rows="3"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter Leave Reason"
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-800"
          />
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setShowRequestLeavePage(false)}
            className="px-5 py-2.5 rounded-lg bg-gray-500 text-white hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={saveRequestLeaveData}
            className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Save
          </button>
        </div>
      </div>
    </Box>
  </Modal>

  {/* ================= MAIN CARD ================= */}
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
    <div className="max-w-4xl mx-auto">

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-8">
          <h2 className="text-2xl font-bold text-white">Attendance</h2>
          <p className="text-blue-100 text-sm mt-1">
            Track attendance and manage leave requests
          </p>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">

          {/* Actions */}
          <div className="bg-gray-50 border rounded-xl p-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Quick Actions
            </h3>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={showHistoryPage}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border transition"
              >
                History
              </button>

              <button
                onClick={() => setShowRequestLeavePage(true)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Request Leave
              </button>
            </div>
          </div>

          {/* Biometric Section */}
          <div className="border rounded-xl p-6 text-center bg-white">
            <p className="text-gray-800 font-medium mb-3">
              Register Your Biometric
            </p>

            <button
              onClick={employeeAttendance}
              className="px-6 py-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition shadow-md"
            >
              Attendance
            </button>

            <p className="text-sm text-gray-500 mt-3">
              Click to register your biometric authentication
            </p>
          </div>

        </div>
      </div>
    </div>
  </div>
</div>

  )
}

export default Attendance