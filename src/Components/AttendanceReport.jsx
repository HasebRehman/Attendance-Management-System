import React, { useEffect, useState } from 'react'
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';

const AttendanceReport = () => {

    const API_URL = import.meta.env.VITE_API_URL;
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    const [attendanceMonth, setAttendanceMonth] = useState(currentMonth);
    const [attendanceDatesAndDays, setAttendanceDatesAndDays] = useState([]);
    const [attendanceReport, setAttendanceReport] = useState([]);

    const getAttendanceReport = async (year, monthNumber) => {
        try {
            const response = await fetch(`${API_URL}/attendance/report?count=10&pageNo=1&year=${year}&month=${monthNumber}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('Token')}`
                }
            });

            const result = await response.json();
            console.log('Attendance Report:', result);
            setAttendanceReport(result.data);

        } catch (error) {
            console.error('Error fetching attendance report:', error);
        }
    }

    const getMonthDates = (year, month) => {
        const dates = [];
        const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const lastDay = new Date(year, month + 1, 0).getDate();

        for (let i = 1; i <= lastDay; i++) {
            const date = new Date(year, month, i);
            dates.push({
                dayName: daysOfWeek[date.getDay()],
                date: i
            });
        }

        setAttendanceDatesAndDays(dates);
    };

    useEffect(() => {
        if (!attendanceMonth) return;

        const [year, monthNumber] = attendanceMonth.split('-').map(Number);

        getAttendanceReport(year, monthNumber);
        getMonthDates(year, monthNumber - 1); 
        
    }, [attendanceMonth]);

    const showToast = (message, type = 'error') => {
        setToast({ visible: true, message, type });
        setTimeout(() => setToast({ visible: false, message: '', type: '' }), 3000);
    };

    const DownloadReport = () => {

        // Guard: no data at all
        const isEmpty = !attendanceReport || attendanceReport.length === 0;
        if (isEmpty) {
            toast.error('No attendance data found to download');
            return;
        }

        const headerRow = [
            'SN',
            'Employee',
            'Position',
            ...attendanceDatesAndDays.map(d => `${d.dayName} ${d.date}`)
        ];

        const dataRows = attendanceReport.map((empItem, index) => {
            const dateColumns = attendanceDatesAndDays.map((dayItem) => {

                const record = empItem.attendance?.find((a) => {
                    const recordDate = new Date(a.createdAt).getDate();
                    return recordDate === dayItem.date;
                });

                if (!record) return 'N/A';
                if (record.status === 'absent') return 'A';
                if (record.status === 'holiday') return '-';
                return 'P';
            });

            return [
                index + 1,
                empItem.fullName,
                empItem.position,
                ...dateColumns
            ];
        });

        const worksheetData = [headerRow, ...dataRows];

        // Create worksheet and workbook
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        const workbook  = XLSX.utils.book_new();

        // Column widths
        worksheet['!cols'] = [
            { wch: 5  },  // SN
            { wch: 20 },  // Employee
            { wch: 18 },  // Position
            ...attendanceDatesAndDays.map(() => ({ wch: 8 }))  // date columns
        ];

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Report');

        // File name:  Attendance_Report_2026-02.xlsx
        const fileName = `Attendance_Report_${attendanceMonth}.xlsx`;
        XLSX.writeFile(workbook, fileName);

        showToast('✅ Report downloaded successfully!', 'success');
    };

    
  return (
    <div className="p-6">

        {/* ── Toast ── */}
        {toast.visible && (
            <div style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                padding: '12px 20px',
                borderRadius: '8px',
                color: 'white',
                fontWeight: '500',
                fontSize: '14px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                zIndex: 9999,
                background: toast.type === 'success' ? '#22c55e' : '#ef4444',
                transition: 'all 0.3s ease',
            }}>
                {toast.message}
            </div>
        )}

      <div className="card">Attendance Report</div>

      <div>
        <p>Month</p>
        <input 
            type="month" 
            name="attendanceMonth" 
            id="attendanceMonth" 
            value={attendanceMonth} 
            onChange={(e) => setAttendanceMonth(e.target.value)} 
        />
      </div>

      <div>
        <table>
        <thead>
            <tr>
            <th>SN</th>
            <th>Employee</th>
            <th>Position</th>
            {attendanceDatesAndDays &&
                attendanceDatesAndDays.map((item, index) => (
                <th key={index}>
                    {item.dayName} {item.date}
                </th>
                ))}
            </tr>
        </thead>

        <tbody>
            {attendanceReport &&
            attendanceReport.map((empItem, index) => (
                <tr key={index}>
                <td>{index + 1}</td>
                <td>{empItem.fullName}</td>
                <td>{empItem.position}</td>

                {attendanceDatesAndDays.map((dayItem, dayIndex) => {
                    
                    const record = empItem.attendance?.find((a) => {
                    const recordDate = new Date(a.createdAt).getDate();
                    return recordDate === dayItem.date;
                    });

                    let displayValue;
                    if (!record) {
                        displayValue = "N/A";
                    } else if (record.status === "absent") {
                        displayValue = "A";
                    } else if (record.status === "holiday") {
                        displayValue = "-";
                    } else {
                        displayValue = "P";
                    }

                    const cellStyle =
                    displayValue === "A"
                        ? { color: "red", fontWeight: "bold" }
                        : displayValue === "P"
                        ? { color: "green", fontWeight: "bold" }
                        : {};

                    return (
                    <td key={dayIndex} style={cellStyle}>
                        {displayValue}
                    </td>
                    );
                })}
                </tr>
            ))}
        </tbody>
        </table>

        <div>
            <button onClick={DownloadReport}>Download Report</button>
        </div>
      </div>
    </div>
  )
}

export default AttendanceReport