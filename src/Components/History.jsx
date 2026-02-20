import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";

const History = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [year, setYear] = useState(new Date().getFullYear());
  const [attendanceDetails, setAttendanceDetails] = useState(null);
  const [days, setDays] = useState([]);
  const [month, setMonth] = useState(null);
  const [showAttendance, setShowAttendance] = useState([]);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // ================= FETCH ATTENDANCE =================
  const getEmployeeAttendanceByYear = async () => {
    try {
      const url = `${API_URL}/attendance/employeeAttendanceByYear?year=${year}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("Token")}`,
        },
      });

      const result = await response.json();
      console.log(result);

      if (!result.isSuccess) {
        toast.error(result.message || "No attendance found");
        setAttendanceDetails(null);
        setShowAttendance([]);
        setMonth(null);
        return;
      }

      const monthly = result?.data?.monthlyAttendance?.[0];

      setMonth(monthly?.month || null);
      setShowAttendance(monthly?.records || []);
      setAttendanceDetails(result?.data || null);
    } catch (error) {
      toast.error("Failed to fetch attendance");
    }
  };

  // ================= DYNAMIC DAYS =================
  const loopForDays = () => {
    if (!month) {
      setDays(Array.from({ length: 31 }, (_, i) => i + 1));
      return;
    }

    const totalDays = new Date(year, month, 0).getDate();
    setDays(Array.from({ length: totalDays }, (_, i) => i + 1));
  };

  // ================= DOWNLOAD EXCEL =================
  const downloadExcelReport = () => {
    if (!showAttendance.length) {
      toast.error("No attendance data found");
      return;
    }

    const excelData = showAttendance.map((item) => ({
      Date: new Date(item.createdAt).toLocaleDateString(),
      Status: item.status === "absent" ? "A" : "P",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(new Blob([excelBuffer]), `attendance-${month}-${year}.xlsx`);
  };

  const currentMonth = month ? months[month - 1] : "-";

  // ================= EFFECT =================
  useEffect(() => {
    getEmployeeAttendanceByYear();
  }, [year]);

  useEffect(() => {
    loopForDays();
  }, [month, year]);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="text-2xl font-bold text-gray-900">
        Attendance History
      </div>

      {/* Year Selector */}
      <div className="bg-white p-4 rounded-xl shadow flex items-center gap-4 w-full max-w-md">
        <p className="font-medium text-gray-700">Year:</p>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="text-gray-800 border rounded-lg px-3 py-2 w-full"
        >
          {[2022, 2023, 2024, 2025, 2026].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ["Present Days", attendanceDetails?.totalPresentDays, "green"],
          ["On-Time Days", attendanceDetails?.totalOnTimeDays, "blue"],
          ["Late Days", attendanceDetails?.totalLateDays, "yellow"],
          ["Leave Days", attendanceDetails?.totalLeaveDays, "red"],
        ].map(([title, value, color]) => (
          <div
            key={title}
            className={`bg-${color}-100 p-4 rounded-xl shadow`}
          >
            <p className="text-sm text-gray-600">{title}</p>
            <p className={`text-2xl font-bold text-${color}-700`}>
              {value || 0}
            </p>
          </div>
        ))}
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full text-center text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2">SN</th>
              <th className="border px-3 py-2">Month</th>
              {days.map((day) => (
                <th key={day} className="border px-2 py-2">
                  {day}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className="border px-3 py-2">1</td>
              <td className="border px-3 py-2 font-medium">{currentMonth}</td>

              {days.map((day) => {
                const record = showAttendance.find(
                  (a) => new Date(a.createdAt).getDate() === day
                );

                const status =
                  record?.status === "absent" ? "A" : record ? "P" : "";

                return (
                  <td
                    key={day}
                    className={`border px-2 py-2 font-bold ${
                      status === "P"
                        ? "text-green-600"
                        : status === "A"
                        ? "text-red-500"
                        : "text-gray-300"
                    }`}
                  >
                    {status}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Download Button */}
      <div className="flex justify-end">
        <button
          onClick={downloadExcelReport}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
        >
          Download Report
        </button>
      </div>
    </div>
  );
};

export default History;
