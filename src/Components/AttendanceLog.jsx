import React, { useEffect, useState } from "react";

const AttendanceLog = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const date = new Date();
  const currentDate = date.toISOString().slice(0, 10);

  const [attendanceDate, setAttendanceDate] = useState(currentDate);
  const [attendanceLogs, setAttendanceLogs] = useState([]);

  const getAttendanceLogs = async (selectedDate) => {
    const url = `${API_URL}/attendance/attendanceLog?count=10&pageNo=1&specificDate=${selectedDate}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("Token")}`,
      },
    });

    const result = await response.json();
    setAttendanceLogs(result.data || []);
  };

  useEffect(() => {
    if (!attendanceDate) return;
    getAttendanceLogs(attendanceDate);
  }, [attendanceDate]);


  const getStatusStyle = (status) => {
    if (!status) return "";

    if (status.toLowerCase() === "late") {
      return "bg-red-500 text-white";
    }

    if (status.toLowerCase() === "on time") {
      return "bg-green-100 text-green-700";
    }

    if (status.toLowerCase() === "absent") {
      return "bg-gray-500 text-white";
    }

    return "";
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-md rounded-xl p-5 mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Attendance Logs
        </h2>
      </div>

      {/* Date Filter */}
      <div className="bg-white shadow-md rounded-xl p-4 mb-6 flex items-center gap-3 w-fit">
        <p className="text-gray-700 font-medium">Date:</p>
        <input
          type="date"
          value={attendanceDate}
          onChange={(e) => setAttendanceDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white shadow-md rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-4 py-3">SN</th>
                <th className="px-4 py-3">Employee ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Position</th>
                <th className="px-4 py-3">Schedule</th>
                <th className="px-4 py-3">Time In</th>
                <th className="px-4 py-3">Time Out</th>
                <th className="px-4 py-3">Working Hours</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {attendanceLogs.map((log, index) => {
                const status = log.attendanceRecords?.[0]?.status;

                return (
                  <tr key={index} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3">{log.employeeId}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {log.fullName}
                    </td>
                    <td className="px-4 py-3">{log.position}</td>
                    <td className="px-4 py-3">
                      {log.scheduleDetails?.scheduleName}
                    </td>
                    <td className="px-4 py-3">
                      {log.attendanceRecords?.[0]?.timeIn}
                    </td>
                    <td className="px-4 py-3">
                      {log.attendanceRecords?.[0]?.timeOut}
                    </td>
                    <td className="px-4 py-3">
                      {log.attendanceRecords?.[0]?.totalWorkingHours}
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3">
                      {status ? (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                            status
                          )}`}
                        >
                          {status}
                        </span>
                      ) : (
                        ""
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceLog;
