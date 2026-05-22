import React from "react";
import { Download } from "lucide-react";
import { generateDashboardPDF } from "../../../utils/pdfGenerator";
import DailyReportButton from "./DailyReportButton";

const DashboardHeader = ({
    user,
    ALL_COLUMNS,
    visibleColumns,
    filteredEmployees,
    employeeCommitments,
    topWorstPerformers,
    topBestPerformers,
    pendingTasks,
    departmentScores = [],
    dataSheetRows = [],
}) => {
    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h1 className="text-lg md:text-2xl font-bold text-gray-800">
                {isAdmin ? "Admin Dashboard" : (user?.role === 'hod' ? "HOD Dashboard" : "Employee Dashboard")}
            </h1>
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-start sm:justify-end">
                <DailyReportButton dataSheetRows={dataSheetRows} />
                <button
                    onClick={() => {
                        const visibleColsList = ALL_COLUMNS.filter(col =>
                            visibleColumns[col.key] &&
                            !["nextWeekPlannedNotDone", "nextWeekPlannedNotDoneOnTime", "nextWeekCommitment"].includes(col.key)
                        );
                        const exportData = filteredEmployees.map(emp => ({
                            ...emp,
                            nextWeekPlannedWorkNotDone: employeeCommitments[emp.id]?.nextWeekPlannedWorkNotDone || emp.nextWeekPlannedWorkNotDone,
                            nextWeekPlannedWorkNotDoneOnTime: employeeCommitments[emp.id]?.nextWeekPlannedWorkNotDoneOnTime || emp.nextWeekPlannedWorkNotDoneOnTime,
                            nextWeekCommitment: employeeCommitments[emp.id]?.commitment || emp.nextWeekCommitment
                        }));
                        generateDashboardPDF(
                            visibleColsList,
                            exportData,
                            topBestPerformers,
                            pendingTasks,
                            topWorstPerformers,
                            departmentScores
                        );
                    }}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF Report
                </button>
            </div>
        </div>
    );
};

export default DashboardHeader;
