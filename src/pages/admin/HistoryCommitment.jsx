import React, { useState, useEffect, useMemo } from "react";
import { Search, Loader2, History } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const AdminHistoryCommitment = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [records, setRecords] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [nameFilter, setNameFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("all");

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                setLoading(true);
                const scriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL;
                if (!scriptUrl) {
                    console.error("VITE_APPS_SCRIPT_URL not set");
                    setLoading(false);
                    return;
                }

                const [recordsResponse, masterResponse] = await Promise.all([
                    fetch(`${scriptUrl}?sheet=Records`),
                    fetch(`${scriptUrl}?sheet=Master`)
                ]);
                const result = await recordsResponse.json();
                const masterResult = await masterResponse.json();

                const reportedByMap = {};
                if (masterResult.success && Array.isArray(masterResult.data)) {
                    masterResult.data.slice(1).forEach(row => {
                        const name = row[0] ? String(row[0]).trim().toLowerCase() : "";
                        const reportedBy = row[9] ? String(row[9]).trim().toLowerCase() : "";
                        if (name && reportedBy) {
                            reportedByMap[name] = reportedBy;
                        }
                    });
                }

                if (result.success && Array.isArray(result.data)) {
                    // Skip header row (index 0), map each row to an object using user-specified column indices
                    const parsed = result.data.slice(1).map((row, idx) => ({
                        id: idx,
                        dateStart: row[0] || "",         // Column A (index 0)
                        dateEnd: row[1] || "",           // Column B (index 1)
                        name: row[2] || "",              // Column C (index 2)
                        target: row[3] || "",            // Column D (index 3)
                        actualWorkDone: row[4] || "",    // Column E (index 4)
                        workNotDone: row[5] || "",       // Column F (index 5)
                        workNotDoneOnTime: row[6] || "", // Column G (index 6)
                        totalWorkDone: row[7] || "",     // Column H (index 7)
                        weekPending: row[8] || "",       // Column I (index 8)
                        allPendingTillDate: row[9] || "", // Column J (index 9)
                        lastWeekPlannedNotDone: row[10] || "", // Column K (index 10)
                        lastWeekPlannedNotDoneOnTime: row[11] || "", // Column L (index 11)
                        lastWeekCommitment: row[12] || "", // Column M (index 12)
                        linkWithName: row[13] || "", // Column N (index 13)
                        nextWeekPlannedNotDone: row[14] || "", // Column O (index 14)
                        nextWeekPlannedNotDoneOnTime: row[15] || "", // Column P (index 15)
                        nextWeekCommitment: row[16] || "" // Column Q (index 16)
                    })).filter(r => r.name.trim() !== "");

                    const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin');
                    const lowerName = (user?.name || "").toLowerCase().trim();
                    const lowerId = (user?.id || "").toLowerCase().trim();

                    // Filter based on role (Admin/Superadmin sees all, HOD sees self + reportees, Ordinary User sees self only)
                    const finalRecords = isAdmin
                        ? parsed
                        : parsed.filter(r => {
                            const empLowerName = r.name.toLowerCase().trim();
                            const empManager = reportedByMap[empLowerName] || "";
                            return empLowerName === lowerName || empManager === lowerName || empManager === lowerId;
                          });

                    setRecords(finalRecords);
                }
            } catch (error) {
                console.error("Error fetching Records & Master sheet:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecords();
    }, []);

    const uniqueNames = useMemo(() => {
        return [...new Set(records.map(r => r.name))].sort();
    }, [records]);

    const uniqueDates = useMemo(() => {
        return [...new Set(records.map(r => r.dateStart))].filter(Boolean).sort((a, b) => new Date(b) - new Date(a));
    }, [records]);

    const filteredRecords = useMemo(() => {
        return records.filter(r => {
            const matchesSearch =
                r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.dateStart.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.dateEnd.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesName = nameFilter === "all" || r.name === nameFilter;
            const matchesDate = dateFilter === "all" || r.dateStart === dateFilter;
            return matchesSearch && matchesName && matchesDate;
        });
    }, [records, searchQuery, nameFilter, dateFilter]);

    const formatValue = (val) => {
        if (val === "" || val === null || val === undefined) return "-";
        return String(val);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                    <p className="text-gray-600 font-medium">Loading History...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
            <div className="max-w-full mx-auto">
                {/* Page Header */}
                <div className="mb-5 flex items-center gap-3">
                    <History className="w-6 h-6 text-blue-600" />
                    <h1 className="text-xl font-bold text-gray-900">History</h1>
                    <span className="ml-auto text-sm text-gray-500 bg-white border border-gray-200 rounded px-3 py-1 shadow-sm">
                        {filteredRecords.length} of {records.length} records
                    </span>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-5">
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search by name or date..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div className="w-full md:w-56">
                            <select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 bg-white"
                            >
                                <option value="all">All Dates</option>
                                {uniqueDates.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                        <div className="w-full md:w-56">
                            <select
                                value={nameFilter}
                                onChange={(e) => setNameFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 bg-white"
                            >
                                <option value="all">All Names</option>
                                {uniqueNames.map(n => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-5">
                    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                        <p className="text-xs text-gray-500 font-medium uppercase">Total Records</p>
                        <p className="text-xl font-bold text-gray-900 mt-1">{records.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                        <p className="text-xs text-gray-500 font-medium uppercase">Unique Persons</p>
                        <p className="text-xl font-bold text-gray-900 mt-1">{uniqueNames.length}</p>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-base font-bold text-gray-800">Records</h2>
                    </div>
                    <div className="overflow-auto max-h-[calc(100vh-320px)] relative border border-gray-200 rounded-lg">
                        <table className="w-full text-sm border-separate border-spacing-0">
                            <thead className="bg-gray-50 sticky top-0 z-30 shadow-sm">
                                <tr>
                                    <th className="w-12 px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap sticky left-0 top-0 bg-gray-50 z-40 border-b border-gray-200">S.No</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-50 border-b border-gray-200">Date Start</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-50 border-b border-gray-200">Date End</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap sticky left-12 top-0 bg-gray-50 z-40 border-l border-b border-gray-200">Name</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">Target</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">Actual Work Done</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">% Work Not Done</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">% Not Done On Time</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">Total Work Done</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">Week Pending</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">All Pending Till Date</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold bg-red-100 text-red-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">LW Planned % Not Done</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold bg-red-100 text-red-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">LW % Not Done On Time</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold bg-red-100 text-red-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">LW Commitment</th>
                                    {/* <th className="px-4 py-3 text-center text-xs font-bold bg-gray-100 text-gray-700 uppercase tracking-wider whitespace-nowrap">Link</th> */}
                                    <th className="px-4 py-3 text-right text-xs font-bold bg-green-100 text-green-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">NW Planned % Not Done</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold bg-green-100 text-green-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">NW % Not Done On Time</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold bg-green-100 text-green-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">NW Commitment</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {filteredRecords.length > 0 ? (
                                    filteredRecords.map((r, idx) => (
                                        <tr key={r.id} className="hover:bg-blue-50/40 transition-colors">
                                            <td className="px-4 py-3 text-gray-500 font-medium text-center sticky left-0 bg-white z-10">{idx + 1}</td>
                                            <td className="px-4 py-3 text-gray-700 whitespace-nowrap bg-white">{formatValue(r.dateStart)}</td>
                                            <td className="px-4 py-3 text-gray-700 whitespace-nowrap bg-white">{formatValue(r.dateEnd)}</td>
                                            <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap sticky left-12 bg-white z-10 border-l border-gray-200">{formatValue(r.name)}</td>
                                            <td className="px-4 py-3 text-right text-gray-700">{formatValue(r.target)}</td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800 min-w-[3rem]">
                                                    {formatValue(r.actualWorkDone)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-semibold min-w-[3rem] ${parseFloat(r.workNotDone) > 30
                                                    ? "bg-red-100 text-red-800"
                                                    : parseFloat(r.workNotDone) > 10
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : "bg-green-100 text-green-800"
                                                    }`}>
                                                    {formatValue(r.workNotDone)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-semibold min-w-[3rem] ${parseFloat(r.workNotDoneOnTime) > 30
                                                    ? "bg-red-100 text-red-800"
                                                    : parseFloat(r.workNotDoneOnTime) > 10
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : "bg-green-100 text-green-800"
                                                    }`}>
                                                    {formatValue(r.workNotDoneOnTime)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 min-w-[3rem]">
                                                    {formatValue(r.totalWorkDone)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-semibold min-w-[3rem] ${parseFloat(r.weekPending) > 5
                                                    ? "bg-red-100 text-red-800"
                                                    : parseFloat(r.weekPending) > 0
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : "bg-green-100 text-green-800"
                                                    }`}>
                                                    {formatValue(r.weekPending)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-semibold min-w-[3rem] ${parseFloat(r.allPendingTillDate) > 10
                                                    ? "bg-red-100 text-red-800"
                                                    : parseFloat(r.allPendingTillDate) > 3
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : "bg-green-100 text-green-800"
                                                    }`}>
                                                    {formatValue(r.allPendingTillDate)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right bg-red-50/30">
                                                <span className="text-red-700 font-medium">{formatValue(r.lastWeekPlannedNotDone)}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right bg-red-50/30">
                                                <span className="text-red-700 font-medium">{formatValue(r.lastWeekPlannedNotDoneOnTime)}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right bg-red-50/30">
                                                <span className="text-red-700 font-bold">{formatValue(r.lastWeekCommitment)}</span>
                                            </td>
                                            {/* <td className="px-4 py-3 text-center bg-gray-50/30">
                                                {r.linkWithName ? (
                                                    <a
                                                        href={r.linkWithName.startsWith('http') ? r.linkWithName : `https://${r.linkWithName}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 underline font-medium"
                                                    >
                                                        View
                                                    </a>
                                                ) : "-"}
                                            </td> */}
                                            <td className="px-4 py-3 text-right bg-green-50/30">
                                                <span className="text-green-700 font-medium">{formatValue(r.nextWeekPlannedNotDone)}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right bg-green-50/30">
                                                <span className="text-green-700 font-medium">{formatValue(r.nextWeekPlannedNotDoneOnTime)}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right bg-green-50/30">
                                                <span className="text-green-700 font-bold">{formatValue(r.nextWeekCommitment)}</span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="11" className="px-6 py-12 text-center text-gray-400">
                                            No records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHistoryCommitment;
