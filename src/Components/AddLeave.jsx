import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const AddLeave = () => {
  const [employeeNameDataApi, setEmployeeNameDataApi] = useState([]);
  const [employeeId, setEmployeeId] = useState('');
  const [position, setPosition] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaves, setLeaves] = useState(0);
  const [reason, setReason] = useState('');
  const [leaveStatus, setLeaveStatus] = useState('');
  const [leaveData, setLeaveData] = useState({});
  const [compareUpdatedData, setCompareUpdatedData] = useState({});

  const API_URL = import.meta.env.VITE_API_URL;
  const { id } = useParams();
  const isEditMode = !!id; 

  const navigate = useNavigate();

 
  const handleSelectEmployee = (e) => {
    setEmployeeId(e.target.value);
  };


  useEffect(() => {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    setLeaves(diffDays);
  }, [startDate, endDate]);


  const showEmployeeNameAndPosition = async () => {
    try {
      const response = await fetch(`${API_URL}/user/GetAllEmployees`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('Token')}`,
        },
      });

      const result = await response.json();
      setEmployeeNameDataApi(result.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    showEmployeeNameAndPosition();
  }, []);

  useEffect(() => {
    const emp = employeeNameDataApi.find((e) => e._id === employeeId);
    if (emp) setPosition(emp.position);

  }, [employeeId, employeeNameDataApi]);


  useEffect(() => {
    if (isEditMode) {
      const fetchLeaveData = async () => {
        try {
          const url = `${API_URL}/leave-management/getOneById/${id}`
          const response = await fetch(url, {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('Token')}`
            }
        });

        const result = await response.json();
        
        setLeaveData(result.data);
        setCompareUpdatedData({
          empDocId: result?.data?.empDocId?._id,
          leaveType: result?.data?.leaveType,
          leaves: Number(result?.data?.leaves),
          startDate: result?.data?.startDate?.split('T')[0],
          endDate: result?.data?.endDate?.split('T')[0],
          reason: result?.data?.reason,
          status: result?.data?.status
        });

           
        } catch (error) {
          console.error(error);
        }
      };

      fetchLeaveData();
    }
  }, [isEditMode, id]);


  function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }


  const addLeaveForEmployee = async () => {
    if (!employeeId || !leaveStatus || !reason || !startDate || !endDate) {
      toast.error('All fields are required');
      return;
    }

    if (leaves < 1) {
      toast.error('Leaves must be greater than 1 day');
      return;
    }

    if (leaves > 365) {
      toast.error('Leaves must be less than 365 days');
      return;
    }

    if (reason.trim().length < 10) {
      toast.info('Reason must be at least 10 characters');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/leave-management/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('Token')}`,
        },
        body: JSON.stringify({
          empDocId: employeeId,
          leaveType,
          leaves: Number(leaves),
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
          reason,
          status: leaveStatus,
        }),
      });

      const result = await response.json();
      if (result.isSuccess) {
        toast.success('Leave added successfully');
        navigate('/leave-management');
      }
    } catch (error) {
      console.error(error);
    }
  };


  useEffect(() => {
    if (isEditMode) {
      if (leaveData._id === id) {
        setEmployeeId(leaveData?.empDocId?._id);
        setLeaveType(leaveData?.leaveType);
        setStartDate(leaveData?.startDate?.split('T')[0]);
        setEndDate(leaveData?.endDate?.split('T')[0]);
        setReason(leaveData?.reason);
        setLeaveStatus(leaveData?.status);
      }
      
      
    }
  }, [isEditMode, leaveData]);

  
  const updateLeaveForEmployee = async () => {

    const payload = {
      empDocId: employeeId,
      leaveType: leaveType,
      leaves: Number(leaves),
      startDate: startDate,
      endDate: endDate,
      reason: reason,
      status: leaveStatus
    }

    if (JSON.stringify(payload) === JSON.stringify(compareUpdatedData)) {
        toast.info('Leave data not changed');
        return;

      } else if(JSON.stringify(payload) !== JSON.stringify(compareUpdatedData)) {

        try {

        const url = `${API_URL}/leave-management/updateById/${id}`;
        const response = await fetch(url, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('Token')}`,
          },
          body: JSON.stringify(
            payload
          ),
        });

        const result = await response.json();
        
        if (result.isSuccess) {
          toast.success('Leave data updated successfully');
          setEmployeeId('');
          setLeaveType('');
          setStartDate('');
          setEndDate('');
          setReason('');
          setLeaveStatus('');
          setPosition('');
          setLeaves('');
          navigate('/leave-management');

        } else if (!result.isSuccess) {
          toast.error('Leave data not updated');

        } else {
          toast.error('Something wents wrong');

        }
        
        
      } catch (error) {
        console.error(error);
      }
        } else {
          toast.error('Something wents wrong');

        }
    }


  const handleSubmit = () => {
    if (isEditMode) {
      updateLeaveForEmployee();
    } else {
      addLeaveForEmployee();
    }
  };

  const backPage = () => {
    navigate('/leave-management');
  };


  return (
    <div className="pb-20 max-w-3xl mx-auto">
      <div className="text-xl font-semibold mb-6 text-gray-800 shadow-md p-4 rounded-lg bg-white">
        {isEditMode ? 'Edit Leave Detail' : 'Add Leave Detail'}
      </div>

      <div className="space-y-5 bg-white p-6 rounded-lg shadow-md">
        {/* Employee */}
        <div className="flex flex-col">
          <label className="mb-1 text-gray-800 font-medium">Employee</label>
          <select
            value={employeeId}
            onChange={handleSelectEmployee}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Employee</option>
            {employeeNameDataApi.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.fullName}
              </option>
            ))}
          </select>
        </div>

        {/* Position */}
        <div className="flex flex-col">
          <label className="mb-1 text-gray-800 font-medium">Position</label>
          <input
            type="text"
            value={position}
            readOnly
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Leave Type */}
        <div className="flex flex-col">
          <label className="mb-1 text-gray-800 font-medium">Leave Type</label>
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Leave Type</option>
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

        {/* Start Date */}
        <div className="flex flex-col">
          <label className="mb-1 text-gray-800 font-medium">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* End Date */}
        <div className="flex flex-col">
          <label className="mb-1 text-gray-800 font-medium">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Leaves */}
        <div className="flex flex-col">
          <label className="mb-1 text-gray-800 font-medium">Leaves</label>
          <input
            type="text"
            value={leaves}
            readOnly
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Reason */}
        <div className="flex flex-col">
          <label className="mb-1 text-gray-800 font-medium">Reason</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter Leave Reason"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Leave Status */}
        <div className="flex flex-col">
          <label className="mb-1 text-gray-800 font-medium">Leave Status</label>
          <select
            value={leaveStatus}
            onChange={(e) => setLeaveStatus(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Leave Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-4">
          <button
            onClick={backPage}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
          >
            Back
          </button>
          <button
            onClick={() => handleSubmit(id)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            {isEditMode ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddLeave;
