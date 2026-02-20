import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';

const LeaveManagement = () => {

    const API_URL = import.meta.env.VITE_API_URL;

    const [getEmployeeLeave, setGetEmployeeLeave] = useState('');

    const navigate = useNavigate();

    const addLeave = () => {
        navigate('/leave-management/add');
    }

    const getEmployeeLeaveData = async() => {
        const url = `${API_URL}/leave-management/getAll`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('Token')}`
            }
        });
        
            const result = await response.json();
            // console.log(result.data);
            
            setGetEmployeeLeave(result.data);
            
        }

    useEffect(() => {
        getEmployeeLeaveData();

    }, []);

    const empLeaveDelete = async (empId) => {
        const url = `${API_URL}/leave-management/deleteById/${empId}`;

        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('Token')}`
            }
        });
        
            const result = await response.json();

            if (result.isSuccess) {
                setGetEmployeeLeave((prev) => prev.filter((leaveEmp) => leaveEmp._id !== empId));
                toast.success('Leave deleted Successfully');
            }
        }


        const editLeaves = (id) => {
          let url = `/leave-management/edit/${id}`;
          navigate(url);

        }
        

  return (
   <div className="p-6 max-w-7xl mx-auto">
    
  {/* Header */}
  <div className="flex justify-between items-center mb-6">
    <h1 className="text-3xl font-bold text-white-800">Leave Management</h1>
    <button
      onClick={addLeave}
      className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
    >
      + Add Leave
    </button>
  </div>

  {/* Table Container */}
  <div className="overflow-x-auto rounded-lg shadow-lg bg-white">
    <table className="min-w-full text-gray-800">
      <thead className="bg-blue-50">
        <tr>
          <th className="text-left py-3 px-4 font-medium">SN</th>
          <th className="text-left py-3 px-4 font-medium">Employee ID</th>
          <th className="text-left py-3 px-4 font-medium">Name</th>
          <th className="text-left py-3 px-4 font-medium">Leave Type</th>
          <th className="text-left py-3 px-4 font-medium">Reason</th>
          <th className="text-left py-3 px-4 font-medium">Leaves</th>
          <th className="text-left py-3 px-4 font-medium">Start Date</th>
          <th className="text-left py-3 px-4 font-medium">End Date</th>
          <th className="text-left py-3 px-4 font-medium">Status</th>
          <th className="text-center py-3 px-4 font-medium">Action</th>
        </tr>
      </thead>

      <tbody>
        {getEmployeeLeave && getEmployeeLeave.length > 0 ? (
          getEmployeeLeave.map((empLeaveData, index) => (
            <tr
              key={empLeaveData._id}
              className={index % 2 === 0 ? "bg-gray-50 hover:bg-gray-100 transition" : "hover:bg-gray-100 transition"}
            >
              <td className="py-3 px-4">{index + 1}</td>
              <td className="py-3 px-4">CL000{index + 1}</td>
              <td className="py-3 px-4">{empLeaveData.empDocId?.fullName}</td>
              <td className="py-3 px-4">{empLeaveData.leaveType}</td>
              <td className="py-3 px-4">{empLeaveData.reason}</td>
              <td className="py-3 px-4">{empLeaveData.leaves}</td>
              <td className="py-3 px-4">{empLeaveData.startDate.split('T')[0]}</td>
              <td className="py-3 px-4">{empLeaveData.endDate.split('T')[0]}</td>
              <td className="py-3 px-4 capitalize">{empLeaveData.status}</td>
              <td className="py-3 px-4 flex justify-center space-x-2">
                <button className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                onClick={() => empLeaveDelete(empLeaveData._id)}
                >
                  Delete
                </button>
                <button className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
                onClick={() => editLeaves(empLeaveData._id)}
                >
                  Update
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="10" className="py-6 text-center text-gray-500">
              No leave records found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>


  )
}

export default LeaveManagement