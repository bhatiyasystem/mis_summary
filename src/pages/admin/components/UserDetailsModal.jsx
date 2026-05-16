import React from "react";
import ReactDOM from "react-dom";
import { X, Loader2, Filter, Calendar, ChevronDown, Printer } from "lucide-react";

const UserDetailsModal = ({
    selectedUserDetails,
    setSelectedUserDetails,
    activeDrillDown,
    setActiveDrillDown,
    handleDrillDown,
}) => {
    const [timeFilter, setTimeFilter] = React.useState("all");
    const [statusFilter, setStatusFilter] = React.useState("all");

    const handlePrint = () => {
        if (!selectedUserDetails) return;

        const printWindow = window.open('', '_blank');
        const tasks = selectedUserDetails.tasks || [];
        const today = new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        const formatPercent = (val) => {
            if (val === undefined || val === null || val === '') return '0%';
            const str = String(val).trim();
            if (str.endsWith('%')) return str;
            return `${str}%`;
        };

        const html = `
            <html>
                <head>
                    <title>Performance Report - ${selectedUserDetails.name}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                        
                        body { 
                            font-family: 'Inter', sans-serif; 
                            padding: 30px; 
                            color: #1e293b;
                            line-height: 1.4;
                            background: #fff;
                        }
                        
                        .report-container {
                            max-width: 1000px;
                            margin: 0 auto;
                        }

                        .report-header {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            border-bottom: 3px solid #2563eb;
                            padding-bottom: 15px;
                            margin-bottom: 25px;
                        }

                        .brand {
                            display: flex;
                            flex-direction: column;
                        }

                        .brand-name {
                            font-size: 32px;
                            font-weight: 800;
                            color: #2563eb;
                            letter-spacing: -0.04em;
                            margin: 0;
                            line-height: 1;
                        }

                        .brand-sub {
                            font-size: 11px;
                            font-weight: 700;
                            color: #64748b;
                            text-transform: uppercase;
                            letter-spacing: 0.15em;
                            margin-top: 4px;
                        }

                        .report-title-box {
                            text-align: right;
                        }

                        .report-title {
                            font-size: 13px;
                            font-weight: 800;
                            color: #0f172a;
                            margin: 0;
                            text-transform: uppercase;
                            letter-spacing: 0.05em;
                        }

                        .report-date {
                            font-size: 11px;
                            color: #64748b;
                            margin-top: 4px;
                            font-weight: 500;
                        }

                        .emp-card {
                            background: #f8fafc;
                            border-radius: 10px;
                            padding: 20px;
                            display: flex;
                            align-items: center;
                            gap: 20px;
                            margin-bottom: 25px;
                            border: 1px solid #e2e8f0;
                        }

                        .emp-photo {
                            width: 70px;
                            height: 70px;
                            border-radius: 50%;
                            object-fit: cover;
                            border: 2px solid #fff;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                        }

                        .emp-details h2 {
                            margin: 0;
                            font-size: 22px;
                            font-weight: 700;
                            color: #0f172a;
                            letter-spacing: -0.02em;
                        }

                        .emp-details p {
                            margin: 2px 0 0;
                            font-size: 14px;
                            color: #64748b;
                            font-weight: 500;
                        }

                        .stats-grid {
                            display: grid;
                            grid-template-columns: repeat(4, 1fr);
                            gap: 12px;
                            margin-bottom: 25px;
                        }

                        .stat-item {
                            background: #fff;
                            border: 1px solid #e2e8f0;
                            padding: 12px;
                            border-radius: 8px;
                            text-align: center;
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                        }

                        .stat-label {
                            font-size: 9px;
                            font-weight: 800;
                            color: #64748b;
                            text-transform: uppercase;
                            margin-bottom: 4px;
                            letter-spacing: 0.05em;
                        }

                        .stat-value {
                            font-size: 18px;
                            font-weight: 800;
                            color: #1e293b;
                        }

                        .stat-value.highlight {
                            color: #2563eb;
                        }

                        .section-title {
                            font-size: 12px;
                            font-weight: 800;
                            color: #475569;
                            text-transform: uppercase;
                            letter-spacing: 0.05em;
                            margin-bottom: 12px;
                            border-left: 4px solid #2563eb;
                            padding-left: 10px;
                        }

                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-top: 5px;
                            font-size: 10.5px;
                            table-layout: fixed;
                        }

                        th {
                            background-color: #f1f5f9;
                            color: #475569;
                            font-weight: 700;
                            text-transform: uppercase;
                            font-size: 9px;
                            letter-spacing: 0.025em;
                            padding: 10px 6px;
                            text-align: center;
                            border: 1px solid #e2e8f0;
                            vertical-align: middle;
                        }

                        th:first-child { text-align: left; width: 25%; }
                        th.num-col { width: 9%; }
                        th.red-header { background-color: #fee2e2; color: #991b1b; }

                        td {
                            padding: 10px 6px;
                            border: 1px solid #e2e8f0;
                            color: #334155;
                            text-align: center;
                            vertical-align: middle;
                            word-wrap: break-word;
                        }

                        td:first-child { text-align: left; font-weight: 500; }

                        .badge {
                            display: inline-block;
                            padding: 2px 6px;
                            border-radius: 4px;
                            font-weight: 700;
                        }

                        .badge-blue { background: #dbeafe; color: #1e40af; }
                        .badge-red { background: #fee2e2; color: #991b1b; }
                        .badge-green { background: #dcfce7; color: #166534; }

                        .red-col {
                            background-color: #fff1f2 !important;
                            color: #991b1b;
                            font-weight: 700;
                        }

                        .footer {
                            margin-top: 40px;
                            padding-top: 15px;
                            border-top: 1px solid #e2e8f0;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            font-size: 9px;
                            color: #94a3b8;
                            font-weight: 500;
                        }

                        .sign-section {
                            display: flex;
                            justify-content: space-between;
                            margin-top: 50px;
                            padding: 0 40px;
                        }

                        .signature-line {
                            width: 180px;
                            border-top: 1.5px solid #334155;
                            padding-top: 8px;
                            text-align: center;
                            font-weight: 700;
                            font-size: 11px;
                            color: #1e293b;
                        }

                        @media print {
                            body { padding: 0; }
                            .report-container { width: 100%; max-width: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="report-container">
                        <div class="report-header">
                            <div class="brand">
                                <h1 class="brand-name">ACEMARK</h1>
                                <span class="brand-sub">STATIONERS & SYSTEMS</span>
                            </div>
                            <div class="report-title-box">
                                <h2 class="report-title">Employee Performance Audit</h2>
                                <p class="report-date">Audit Date: ${today}</p>
                            </div>
                        </div>

                        <div class="emp-card">
                            <img src="${selectedUserDetails.image}" alt="${selectedUserDetails.name}" class="emp-photo">
                            <div class="emp-details">
                                <h2>${selectedUserDetails.name}</h2>
                                <p>${selectedUserDetails.department || 'Operations Management'}</p>
                                <p style="font-size: 12px; color: #94a3b8;">User ID: ${selectedUserDetails.id || 'N/A'}</p>
                            </div>
                        </div>

                        <div class="stats-grid">
                            <div class="stat-item">
                                <span class="stat-label">Performance Score</span>
                                <span class="stat-value highlight">${selectedUserDetails.score || 0}%</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Weekly Done</span>
                                <span class="stat-value">${formatPercent(selectedUserDetails.weeklyWorkDone)}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">On-Time %</span>
                                <span class="stat-value">${formatPercent(selectedUserDetails.weeklyWorkDoneOnTime)}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Pending Backlog</span>
                                <span class="stat-value" style="color: #ef4444;">${selectedUserDetails.allPendingTillDate || 0}</span>
                            </div>
                        </div>

                        <h3 class="section-title">Individual Task Breakdown</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>FMS & TASK DESCRIPTION</th>
                                    <th class="num-col">TARGET</th>
                                    <th class="num-col">ACTUAL</th>
                                    <th class="num-col">DONE %</th>
                                    <th class="num-col">LATE %</th>
                                    <th class="num-col red-header">PLANNED NOT DONE</th>
                                    <th class="num-col red-header">PLANNED LATE %</th>
                                    <th class="num-col red-header">COMMITMENT</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tasks.map(task => {
                                    const achievement = parseFloat(task.totalAchievement) || 0;
                                    const target = parseFloat(task.target) || 0;
                                    const isTargetMet = achievement >= target && target > 0;
                                    
                                    return `
                                    <tr>
                                        <td>
                                            <div style="font-weight: 700; color: #0f172a; font-size: 11px;">${task.fmsName}</div>
                                            <div style="font-size: 9px; color: #64748b; margin-top: 1px;">${task.taskName}</div>
                                        </td>
                                        <td><span class="badge ${target > 0 ? 'badge-blue' : ''}">${task.target}</span></td>
                                        <td><span class="badge ${isTargetMet ? 'badge-green' : (achievement > 0 ? 'badge-blue' : 'badge-red')}">${task.totalAchievement}</span></td>
                                        <td>${formatPercent(task.workNotDone)}</td>
                                        <td>${formatPercent(task.workNotDoneOnTime)}</td>
                                        <td class="red-col">${formatPercent(selectedUserDetails.plannedWorkNotDone)}</td>
                                        <td class="red-col">${formatPercent(selectedUserDetails.plannedWorkNotDoneOnTime)}</td>
                                        <td class="red-col">${selectedUserDetails.commitment || 0}</td>
                                    </tr>
                                `}).join('')}
                            </tbody>
                        </table>

                        <div class="sign-section">
                            <div class="signature-line">
                                Supervisor Signature
                                <div style="font-size: 8px; margin-top: 15px; border-top: 0.5px solid #e2e8f0; width: 60%; margin-left: 20%; padding-top: 2px;">Date</div>
                            </div>
                            <div class="signature-line">
                                Employee Signature
                                <div style="font-size: 8px; margin-top: 15px; border-top: 0.5px solid #e2e8f0; width: 60%; margin-left: 20%; padding-top: 2px;">Date</div>
                            </div>
                        </div>

                        <div class="footer">
                            <span>System Auth: MIS-RPT-${new Date().getTime().toString().slice(-8)}</span>
                            <span>Report Generated by MIS Intelligence Portal • Powered by Botivate</span>
                            <span>Page 1 of 1</span>
                        </div>
                    </div>
                </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 800);
    };

    const parseDate = (dateStr) => {
        if (!dateStr) return null;
        // Expected format: dd/mm/yyyy hh:mm:ss
        const parts = dateStr.split(" ");
        const dateParts = parts[0].split("/");
        if (dateParts.length !== 3) return null;
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1;
        const year = parseInt(dateParts[2], 10);

        if (parts.length > 1) {
            const timeParts = parts[1].split(":");
            const hours = parseInt(timeParts[0], 10) || 0;
            const minutes = parseInt(timeParts[1], 10) || 0;
            const seconds = parseInt(timeParts[2], 10) || 0;
            return new Date(year, month, day, hours, minutes, seconds);
        }
        return new Date(year, month, day);
    };

    const isOnTimeRow = (row) => {
        const delay = String(row.delay || "").trim();
        const actual = String(row.actual || "").trim();
        // On Time: actual is filled AND delay is zero, empty, or 00:00:00
        return actual !== "" && (delay === "00:00:00" || delay === "0" || delay === "00:00" || delay === "");
    };

    const isPendingRow = (row) => {
        const actual = String(row.actual || "").trim();
        return actual === "";
    };

    const isDelayRow = (row) => {
        const delay = String(row.delay || "").trim();
        const actual = String(row.actual || "").trim();
        // Delay: has a real delay value (not empty, not zero) AND is NOT pending (actual is NOT blank)
        return actual !== "" && delay !== "" && delay !== "00:00:00" && delay !== "0";
    };

    const getRowBg = (row) => {
        // Pending (actual blank) takes highest priority — even if delay exists
        if (isPendingRow(row)) return "bg-rose-100 hover:bg-rose-200";
        if (isDelayRow(row)) return "bg-orange-100 hover:bg-orange-200";
        if (isOnTimeRow(row)) return "bg-green-100 hover:bg-green-200";
        return "hover:bg-gray-50";
    };

    const filteredRows = React.useMemo(() => {
        if (!activeDrillDown || !activeDrillDown.rows) return [];

        let rows = activeDrillDown.rows;

        // Status filter
        if (statusFilter === "ontime") rows = rows.filter(isOnTimeRow);
        else if (statusFilter === "pending") rows = rows.filter(isPendingRow);
        else if (statusFilter === "delay") rows = rows.filter(isDelayRow);

        // Time filter
        if (timeFilter === "all") return rows;

        const now = new Date();
        const todayAtMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return rows.filter(row => {
            const rowDate = parseDate(row.actual) || parseDate(row.planned);
            if (!rowDate) return false;

            if (timeFilter === "today") {
                return rowDate >= todayAtMidnight;
            } else if (timeFilter === "week") {
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return rowDate >= weekAgo;
            } else if (timeFilter === "month") {
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                return rowDate >= monthAgo;
            }
            return true;
        });
    }, [activeDrillDown, timeFilter, statusFilter]);

    return (
        <>
            {/* User Details Modal - Rendered via Portal to cover header/sidebar */}
            {selectedUserDetails && ReactDOM.createPortal(
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] flex items-center justify-center p-2 md:p-4">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-3 min-w-0">
                                <img
                                    className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                                    src={selectedUserDetails.image}
                                    alt={selectedUserDetails.name}
                                />
                                <div className="min-w-0">
                                    <h2 className="text-base font-bold text-gray-900 truncate">
                                        {selectedUserDetails.name}
                                    </h2>
                                    <p className="text-xs text-gray-500 truncate">
                                        {selectedUserDetails.department}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handlePrint}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    <Printer className="w-4 h-4" />
                                    <span>Print Tasks</span>
                                </button>
                                <button
                                    onClick={() => setSelectedUserDetails(null)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                                >
                                    <X className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="p-4 space-y-4">
                                {/* Tasks Details Section */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                                        Task Details
                                    </h3>

                                    {/* Desktop View - Table */}
                                    <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-lg">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">FMS Name</th>
                                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Task Name</th>
                                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Department</th>
                                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Target</th>
                                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Total Achievement</th>
                                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">% Work Not Done</th>
                                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">% Work Not Done on Time</th>
                                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">All Pending Till Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {selectedUserDetails.tasks && selectedUserDetails.tasks.length > 0 ? (
                                                    selectedUserDetails.tasks.map((task, idx) => (
                                                        <tr
                                                            key={idx}
                                                            onClick={(e) => handleDrillDown(task, "Total Achievement", task.totalAchievement, e)}
                                                            className="hover:bg-blue-50 cursor-pointer transition-colors"
                                                        >
                                                            <td className="px-3 py-2 text-xs text-gray-900">{task.fmsName}</td>
                                                            <td className="px-3 py-2 text-xs text-gray-900">{task.taskName}</td>
                                                            <td className="px-3 py-2 text-xs text-gray-900">{task.department}</td>
                                                            <td className="px-3 py-2 text-xs text-gray-900 font-medium">{task.target}</td>
                                                            <td className="px-3 py-2 text-xs font-medium">
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${parseFloat(task.totalAchievement) < parseFloat(task.target) ? "bg-red-100 text-red-800" : parseFloat(task.totalAchievement) === parseFloat(task.target) ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>
                                                                    {task.totalAchievement}
                                                                </span>
                                                            </td>
                                                            <td className="px-3 py-2 text-xs text-gray-900">{task.workNotDone}</td>
                                                            <td className="px-3 py-2 text-xs text-gray-900">{task.workNotDoneOnTime}</td>
                                                            <td className="px-3 py-2 text-xs text-gray-900">{task.allPendingTillDate}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr><td colSpan="8" className="px-3 py-2 text-center text-xs text-gray-500">No tasks available</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile View - Cards */}
                                    <div className="md:hidden space-y-3">
                                        {selectedUserDetails.tasks && selectedUserDetails.tasks.length > 0 ? (
                                            selectedUserDetails.tasks.map((task, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={(e) => handleDrillDown(task, "Total Achievement", task.totalAchievement, e)}
                                                    className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm active:bg-blue-50 transition-colors"
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider truncate mb-0.5">{task.fmsName}</p>
                                                            <h4 className="text-sm font-bold text-gray-900 truncate">{task.taskName}</h4>
                                                        </div>
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${parseFloat(task.totalAchievement) < parseFloat(task.target) ? "bg-red-100 text-red-800" : parseFloat(task.totalAchievement) === parseFloat(task.target) ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>
                                                            {task.totalAchievement} / {task.target}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 border-t border-gray-50 pt-2">
                                                        <div>
                                                            <p className="text-[10px] text-gray-400 font-medium uppercase">Dept</p>
                                                            <p className="text-xs text-gray-700 font-semibold truncate">{task.department}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-gray-400 font-medium uppercase">All Pending</p>
                                                            <p className="text-xs text-gray-700 font-semibold">{task.allPendingTillDate}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-gray-400 font-medium uppercase">% Not Done</p>
                                                            <p className="text-xs text-gray-700 font-semibold">{task.workNotDone}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-gray-400 font-medium uppercase">% Late</p>
                                                            <p className="text-xs text-gray-700 font-semibold">{task.workNotDoneOnTime}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                                <p className="text-xs text-gray-500">No tasks available</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-3 flex justify-end gap-2 flex-shrink-0">
                            <button
                                onClick={() => setSelectedUserDetails(null)}
                                className="px-3 py-2 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
                , document.body)}

            {/* Drill Down Modal - Rendered via Portal above User Details Modal */}
            {activeDrillDown && ReactDOM.createPortal(
                <div className="fixed inset-0 bg-black/25 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-fadeIn border-2 border-gray-100">
                        <div className="flex items-center justify-between gap-2 p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg flex-wrap">
                            {/* Title */}
                            <div className="min-w-0">
                                <h3 className="text-base font-bold text-gray-900 leading-tight">
                                    {activeDrillDown.title}
                                </h3>
                                <p className="text-xs text-gray-500 truncate">
                                    {activeDrillDown.taskId} • <span className="font-bold text-blue-600">Total Tasks: {filteredRows.length}</span>
                                </p>
                            </div>
                            {/* Filters + Close */}
                            <div className="flex items-center gap-2 flex-wrap">
                                {!activeDrillDown.loading && !activeDrillDown.error && (
                                    <>
                                        {/* Status Buttons */}
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => setStatusFilter("all")} className={`px-2 py-1 text-xs font-medium rounded transition-all ${statusFilter === "all" ? "bg-gray-800 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"}`}>All</button>
                                            <button onClick={() => setStatusFilter("ontime")} className={`px-2 py-1 text-xs font-medium rounded transition-all ${statusFilter === "ontime" ? "bg-green-600 text-white" : "bg-green-50 text-green-700 hover:bg-green-100"}`}>On Time</button>
                                            <button onClick={() => setStatusFilter("pending")} className={`px-2 py-1 text-xs font-medium rounded transition-all ${statusFilter === "pending" ? "bg-rose-600 text-white" : "bg-rose-50 text-rose-700 hover:bg-rose-100"}`}>Pending</button>
                                            <button onClick={() => setStatusFilter("delay")} className={`px-2 py-1 text-xs font-medium rounded transition-all ${statusFilter === "delay" ? "bg-orange-600 text-white" : "bg-orange-50 text-orange-700 hover:bg-orange-100"}`}>Delay</button>
                                        </div>
                                    </>
                                )}
                                {/* Close Button */}
                                <button onClick={() => setActiveDrillDown(null)} className="p-1 hover:bg-gray-200 rounded-full transition-colors ml-1">
                                    <X className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>
                        </div>
                        <div className="overflow-y-auto flex-1">
                            {activeDrillDown.loading ? (
                                <div className="flex flex-col items-center justify-center py-10 space-y-3">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                    <p className="text-sm text-gray-500">Loading data...</p>
                                </div>
                            ) : activeDrillDown.error ? (
                                <div className="flex flex-col items-center justify-center py-10">
                                    <p className="text-sm text-red-500">Error: {activeDrillDown.error}</p>
                                </div>
                            ) : (
                                <div className="p-4">
                                    {/* Desktop View - Table */}
                                    <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-lg">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50 sticky top-0">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Task Name</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Planned</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actual</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Delay</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {filteredRows && filteredRows.length > 0 ? (
                                                    filteredRows.map((row, idx) => (
                                                        <tr key={idx} className={`${getRowBg(row)} transition-colors`}>
                                                            <td className="px-4 py-3 text-sm text-gray-700">{row.taskName}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-700">{row.planned}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-500">{row.actual || '-'}</td>
                                                            <td className={`px-4 py-3 text-sm font-medium ${isDelayRow(row) ? 'text-orange-600' : 'text-gray-700'}`}>{row.delay || '00:00:00'}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr><td colSpan="4" className="px-4 py-10 text-center text-sm text-gray-500">No data available</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile View - Cards */}
                                    <div className="md:hidden space-y-3">
                                        {filteredRows && filteredRows.length > 0 ? (
                                            filteredRows.map((row, idx) => (
                                                <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                                                    <h4 className="text-sm font-bold text-gray-900 mb-2">{row.taskName}</h4>
                                                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 border-t border-gray-50 pt-2">
                                                        <div>
                                                            <p className="text-[10px] text-gray-400 font-medium uppercase">Planned</p>
                                                            <p className="text-xs text-gray-700 font-semibold">{row.planned}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-gray-400 font-medium uppercase">Actual</p>
                                                            <p className="text-xs text-gray-700 font-semibold">{row.actual}</p>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <p className="text-[10px] text-gray-400 font-medium uppercase">Delay</p>
                                                            <p className={`text-xs font-semibold ${row.delay && String(row.delay).toLowerCase().includes('late') ? 'text-red-600' : 'text-emerald-600'}`}>
                                                                {row.delay || 'On Time'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                                <p className="text-xs text-gray-500">No data available</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg flex justify-end">
                            <button
                                onClick={() => setActiveDrillDown(null)}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
                , document.body)}
        </>
    );
};

export default UserDetailsModal;
