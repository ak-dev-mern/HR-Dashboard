import React, { useState } from "react";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users,
} from "lucide-react";

const Attendance = () => {
  const [selectedMonth, setSelectedMonth] = useState("December 2024");

  const attendanceData = [
    { name: "Sarah Johnson", present: 22, absent: 1, late: 2, overtime: 5 },
    { name: "Michael Chen", present: 23, absent: 0, late: 1, overtime: 8 },
    { name: "Emily Rodriguez", present: 20, absent: 2, late: 1, overtime: 3 },
    { name: "David Kim", present: 21, absent: 1, late: 2, overtime: 4 },
    { name: "Lisa Thompson", present: 19, absent: 3, late: 1, overtime: 2 },
  ];

  const stats = {
    totalEmployees: 45,
    averageAttendance: "94%",
    totalOvertime: "127 hrs",
    onTimeRate: "89%",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Attendance Tracking
          </h2>
          <p className="text-gray-500 mt-1">
            Monitor employee attendance and working hours
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option>December 2024</option>
            <option>November 2024</option>
            <option>October 2024</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.totalEmployees}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Average Attendance</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {stats.averageAttendance}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Overtime</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.totalOvertime}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">On-Time Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.onTimeRate}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">
            Monthly Attendance Report
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Employee
                </th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Present
                </th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Absent
                </th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Late
                </th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Overtime (hrs)
                </th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Attendance %
                </th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((emp, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {emp.name}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      {emp.present}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-red-600">
                    {emp.absent}
                  </td>
                  <td className="px-6 py-4 text-center text-yellow-600">
                    {emp.late}
                  </td>
                  <td className="px-6 py-4 text-center text-purple-600">
                    {emp.overtime}
                  </td>
                  <td className="px-6 py-4 text-center font-semibold">
                    {((emp.present / 23) * 100).toFixed(0)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
