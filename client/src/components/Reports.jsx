import React, { useState } from "react";
import {
  FileText,
  Download,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
} from "lucide-react";

const Reports = () => {
  const [reportType, setReportType] = useState("employee");

  const reports = [
    {
      id: 1,
      title: "Employee Performance Report",
      type: "performance",
      date: "2024-12-01",
      size: "2.4 MB",
    },
    {
      id: 2,
      title: "Salary Summary Report",
      type: "salary",
      date: "2024-12-01",
      size: "1.8 MB",
    },
    {
      id: 3,
      title: "Attendance Report - November",
      type: "attendance",
      date: "2024-11-30",
      size: "3.2 MB",
    },
    {
      id: 4,
      title: "Department Budget Report",
      type: "budget",
      date: "2024-11-28",
      size: "1.5 MB",
    },
    {
      id: 5,
      title: "Hiring Analytics Q4",
      type: "hiring",
      date: "2024-11-25",
      size: "2.1 MB",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
          <p className="text-gray-500 mt-1">Generate and download HR reports</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <FileText className="w-4 h-4" />
          Generate New Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 cursor-pointer hover:shadow-md transition">
          <div className="p-3 bg-blue-100 rounded-lg w-fit mb-3">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Employee Report</h3>
          <p className="text-sm text-gray-500 mt-1">
            Employee demographics and turnover
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 cursor-pointer hover:shadow-md transition">
          <div className="p-3 bg-green-100 rounded-lg w-fit mb-3">
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Salary Report</h3>
          <p className="text-sm text-gray-500 mt-1">
            Salary distribution and analysis
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 cursor-pointer hover:shadow-md transition">
          <div className="p-3 bg-purple-100 rounded-lg w-fit mb-3">
            <Calendar className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Attendance Report</h3>
          <p className="text-sm text-gray-500 mt-1">
            Monthly attendance summary
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 cursor-pointer hover:shadow-md transition">
          <div className="p-3 bg-yellow-100 rounded-lg w-fit mb-3">
            <TrendingUp className="w-6 h-6 text-yellow-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Performance Report</h3>
          <p className="text-sm text-gray-500 mt-1">
            Employee performance metrics
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Recent Reports</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {reports.map((report) => (
            <div
              key={report.id}
              className="p-6 hover:bg-gray-50 transition flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <FileText className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{report.title}</h4>
                  <p className="text-sm text-gray-500">
                    Generated on {report.date} • {report.size}
                  </p>
                </div>
              </div>
              <button className="flex items-center gap-2 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;
