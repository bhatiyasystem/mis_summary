import React, { useState, useEffect, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { Settings, Users, Search, Loader2, Save, Check, AlertCircle, RefreshCw, ChevronDown, ShieldAlert, Plus, Edit2, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const SuperadminSettings = () => {
    const { user } = useAuth();
    
    // Safety guard: only superadmin can access this page
    if (!user || user.role !== "superadmin") {
        return <Navigate to="/admin/dashboard" replace />;
    }

    const [loading, setLoading] = useState(true);
    const [usersList, setUsersList] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [deptFilter, setDeptFilter] = useState("all");
    const [savingStates, setSavingStates] = useState({}); // key: rowIndex, value: 'idle' | 'saving' | 'saved' | 'error'
    const [originalSupervisors, setOriginalSupervisors] = useState({}); // key: rowIndex, value: original supervisor name
    const [modifiedSupervisors, setModifiedSupervisors] = useState({}); // key: rowIndex, value: modified supervisor name
    const [notification, setNotification] = useState(null);

    // User Edit / Add Modal States
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add"); // 'add' | 'edit'
    const [selectedUserRow, setSelectedUserRow] = useState(null); // the user object being edited
    const [modalForm, setModalForm] = useState({
        name: "",
        email: "",
        department: "",
        designation: "",
        id: "",
        password: "",
        role: "user",
        reportedBy: ""
    });
    const [modalSaving, setModalSaving] = useState(false);

    const showNotification = (message, type = "success") => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const scriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL;
            if (!scriptUrl) {
                console.error("VITE_APPS_SCRIPT_URL not set");
                showNotification("VITE_APPS_SCRIPT_URL is missing in environment variables.", "error");
                setLoading(false);
                return;
            }

            const response = await fetch(`${scriptUrl}?sheet=Master`);
            const result = await response.json();

            if (result.success && Array.isArray(result.data)) {
                // Parse rows from Master sheet. Index 0 is header row.
                // Row format: [Name, Email, Dept, Designation, Profile, ID, Pass, Role, ..., Reported By]
                const parsed = result.data.slice(1).map((row, idx) => ({
                    rowIndex: idx + 2, // 1-based indexing, plus 1 for the skipped header row
                    name: row[0] ? String(row[0]).trim() : "",
                    email: row[1] ? String(row[1]).trim() : "",
                    department: row[2] ? String(row[2]).trim() : "",
                    designation: row[3] ? String(row[3]).trim() : "",
                    profileImageUrl: row[4] ? String(row[4]).trim() : "",
                    id: row[5] ? String(row[5]).trim() : "",
                    password: row[6] ? String(row[6]).trim() : "",
                    role: row[7] ? String(row[7]).trim().toLowerCase() : "user",
                    reportedBy: row[9] ? String(row[9]).trim() : "" // Column J (index 9)
                })).filter(u => u.name !== "");

                setUsersList(parsed);

                // Initialize supervisor states
                const supervisorsObj = {};
                parsed.forEach(u => {
                    supervisorsObj[u.rowIndex] = u.reportedBy;
                });
                setOriginalSupervisors(supervisorsObj);
                setModifiedSupervisors(supervisorsObj);
            } else {
                showNotification("Failed to load users list.", "error");
            }
        } catch (error) {
            console.error("Error fetching Master sheet:", error);
            showNotification(`Error: ${error.message}`, "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Get unique departments for filtering
    const uniqueDepartments = useMemo(() => {
        return ["all", ...new Set(usersList.map(u => u.department).filter(Boolean))].sort();
    }, [usersList]);

    // List of potential supervisors (only admin, superadmin, and HODs/managers)
    const supervisorOptions = useMemo(() => {
        return usersList
            .filter(u => {
                const roleLower = String(u.role).toLowerCase();
                const desigLower = String(u.designation).toLowerCase();
                const isIdAdmin = String(u.id).toLowerCase() === 'admin';
                return (
                    roleLower === "admin" || 
                    roleLower === "superadmin" || 
                    isIdAdmin ||
                    desigLower.includes("hod") || 
                    desigLower.includes("manager") || 
                    desigLower.includes("head") || 
                    desigLower.includes("lead")
                );
            })
            .map(u => u.name)
            .sort();
    }, [usersList]);

    // Filtering logic
    const filteredUsers = useMemo(() => {
        return usersList.filter(u => {
            const matchesSearch =
                u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.email.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesDept = deptFilter === "all" || u.department === deptFilter;

            return matchesSearch && matchesDept;
        });
    }, [usersList, searchQuery, deptFilter]);

    // Handle supervisor dropdown change
    const handleSupervisorChange = (rowIndex, value) => {
        setModifiedSupervisors(prev => ({
            ...prev,
            [rowIndex]: value === "None" ? "" : value
        }));

        // Reset saving state for this row if it was in 'saved' or 'error' state
        if (savingStates[rowIndex] === "saved" || savingStates[rowIndex] === "error") {
            setSavingStates(prev => ({
                ...prev,
                [rowIndex]: "idle"
            }));
        }
    };

    // Save individual user supervisor settings
    const handleSaveSupervisor = async (rowIndex, userName) => {
        const selectedSupervisor = modifiedSupervisors[rowIndex] || "";
        
        // If it's the user trying to report to themselves, show alert
        if (selectedSupervisor.toLowerCase() === userName.toLowerCase()) {
            showNotification("A user cannot report to themselves!", "error");
            return;
        }

        setSavingStates(prev => ({ ...prev, [rowIndex]: "saving" }));

        try {
            const scriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL;
            if (!scriptUrl) throw new Error("Server URL is missing");

            // Overwrite Column J (index 9) with selectedSupervisor. 
            // We set index 9 to supervisor name and others to empty strings (which is ignored by our Apps Script)
            // Array length is 10 to include index 9
            const rowUpdate = ["", "", "", "", "", "", "", "", "", selectedSupervisor || "-"]; // Send "-" for none to overwrite cell

            const response = await fetch(scriptUrl, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    action: "update",
                    sheetName: "Master",
                    rowIndex: rowIndex.toString(),
                    rowData: JSON.stringify(rowUpdate)
                })
            });

            const result = await response.json();

            if (result.success) {
                // Update local storage/states
                setOriginalSupervisors(prev => ({
                    ...prev,
                    [rowIndex]: selectedSupervisor
                }));
                setSavingStates(prev => ({
                    ...prev,
                    [rowIndex]: "saved"
                }));
                showNotification(`Supervisor for ${userName} updated successfully!`, "success");
            } else {
                throw new Error(result.error || "Failed to save supervisor settings");
            }
        } catch (error) {
            console.error("Error saving supervisor settings:", error);
            setSavingStates(prev => ({
                ...prev,
                [rowIndex]: "error"
            }));
            showNotification(`Failed to save: ${error.message}`, "error");
        }
    };

    // Open modal to add a new user
    const handleAddUserClick = () => {
        setModalMode("add");
        setSelectedUserRow(null);
        setModalForm({
            name: "",
            email: "",
            department: "",
            designation: "",
            id: "",
            password: "",
            role: "user",
            reportedBy: ""
        });
        setIsUserModalOpen(true);
    };

    // Open modal to edit an existing user
    const handleEditUserClick = (u) => {
        setModalMode("edit");
        setSelectedUserRow(u);
        setModalForm({
            name: u.name,
            email: u.email,
            department: u.department,
            designation: u.designation,
            id: u.id,
            password: u.password,
            role: u.role,
            reportedBy: u.reportedBy
        });
        setIsUserModalOpen(true);
    };

    // Handle form submission
    const handleModalSubmit = async (e) => {
        e.preventDefault();
        
        if (!modalForm.name || !modalForm.id || !modalForm.password) {
            showNotification("Name, ID, and Password are required!", "error");
            return;
        }

        setModalSaving(true);

        try {
            const scriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL;
            if (!scriptUrl) throw new Error("Server URL is missing");

            const rowData = [
                modalForm.name,
                modalForm.email || "-",
                modalForm.department || "-",
                modalForm.designation || "-",
                selectedUserRow?.profileImageUrl || "", // keep original or blank
                modalForm.id,
                modalForm.password,
                modalForm.role,
                "",
                modalForm.reportedBy || "-"
            ];

            const bodyParams = {
                sheetName: "Master",
                rowData: JSON.stringify(rowData)
            };

            if (modalMode === "edit") {
                bodyParams.action = "update";
                bodyParams.rowIndex = selectedUserRow.rowIndex.toString();
            } else {
                bodyParams.action = "insert";
            }

            const response = await fetch(scriptUrl, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams(bodyParams)
            });

            const result = await response.json();

            if (result.success) {
                showNotification(
                    modalMode === "edit"
                        ? `User ${modalForm.name} updated successfully!`
                        : `User ${modalForm.name} added successfully!`,
                    "success"
                );
                setIsUserModalOpen(false);
                fetchUsers(); // Refresh the table
            } else {
                throw new Error(result.error || "Server update failed");
            }
        } catch (error) {
            console.error("Error saving user:", error);
            showNotification(`Error: ${error.message}`, "error");
        } finally {
            setModalSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Modern Ultra-Clean Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 pb-6 border-b border-slate-200">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-2xl shadow-lg shadow-purple-100 shrink-0">
                            <Settings className="w-5 h-5 text-white animate-spin-slow" />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                                    System Console
                                </h1>
                                <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-100 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                    Superadmin Privilege
                                </span>
                            </div>
                            <p className="text-slate-500 text-xs sm:text-sm mt-1">Manage reporting hierarchy, department routing, and system variables.</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={handleAddUserClick}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-purple-100 transition-all cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            Add User
                        </button>
                        <button
                            onClick={fetchUsers}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                            Refresh Registry
                        </button>
                    </div>
                </div>

                {/* Toast Notification */}
                {notification && (
                    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className={`px-6 py-3.5 rounded-2xl shadow-xl shadow-slate-200/50 flex items-center gap-3 border ${
                            notification.type === "success"
                                ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                                : "bg-rose-50 border-rose-100 text-rose-800"
                        }`}>
                            {notification.type === "success" ? (
                                <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                                <AlertCircle className="w-4 h-4 text-rose-600" />
                            )}
                            <p className="text-xs sm:text-sm font-bold">{notification.message}</p>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="min-h-[45vh] flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                        <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
                        <p className="text-slate-500 text-sm font-bold mt-4">Syncing system hierarchy...</p>
                    </div>
                ) : (
                    <>
                        {/* Search & Filter Panel */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Quick search by name, designation, email or ID..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 rounded-xl text-xs sm:text-sm focus:outline-none transition-all"
                                    />
                                </div>
                                <div className="w-full sm:w-64">
                                    <select
                                        value={deptFilter}
                                        onChange={(e) => setDeptFilter(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 bg-white transition-all capitalize cursor-pointer text-slate-700 font-semibold"
                                    >
                                        <option value="all">All Departments</option>
                                        {uniqueDepartments.filter(d => d !== "all").map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* User Registry List */}
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div>
                                    <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-purple-600" />
                                        User Relations Matrix
                                    </h2>
                                    <p className="text-xs text-slate-400 mt-0.5">Assign supervisors to configure organizational access.</p>
                                </div>
                                <span className="text-[10px] bg-slate-100 rounded-lg px-2.5 py-1 text-slate-600 font-extrabold uppercase">
                                    Active Records: {filteredUsers.length}
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead>
                                        <tr className="bg-slate-50/70 border-b border-slate-100">
                                            <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider w-[80px]">S.No</th>
                                            <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">User Details</th>
                                            <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Department & Role</th>
                                            <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Designation</th>
                                            <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider w-[240px]">Reported To (HOD)</th>
                                            <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider text-right w-[160px]">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredUsers.length > 0 ? (
                                            filteredUsers.map((u, idx) => {
                                                const hasChanges = (modifiedSupervisors[u.rowIndex] ?? u.reportedBy) !== (originalSupervisors[u.rowIndex] ?? u.reportedBy);
                                                const state = savingStates[u.rowIndex] || "idle";
                                                const currentVal = modifiedSupervisors[u.rowIndex] === "-" ? "" : (modifiedSupervisors[u.rowIndex] ?? u.reportedBy);

                                                return (
                                                    <tr key={u.rowIndex} className="hover:bg-slate-50/50 transition-colors group">
                                                        <td className="px-6 py-5 text-xs font-semibold text-slate-400">{idx + 1}</td>
                                                        <td className="px-6 py-5">
                                                            <div className="space-y-0.5">
                                                                <p className="text-sm font-bold text-slate-800 leading-tight">{u.name}</p>
                                                                <p className="text-[11px] text-slate-400 font-medium">ID: {u.id || "N/A"} • {u.email}</p>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="flex flex-wrap items-center gap-1.5">
                                                                <span className="text-[10px] font-extrabold text-slate-600 capitalize bg-slate-100/80 px-2 py-0.5 rounded-md border border-slate-200/20">
                                                                    {u.department || "N/A"}
                                                                </span>
                                                                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wide ${
                                                                    u.role === "superadmin" 
                                                                        ? "bg-purple-50 text-purple-700 border border-purple-100" 
                                                                        : u.role === "admin"
                                                                            ? "bg-blue-50 text-blue-700 border border-blue-100"
                                                                            : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                                                }`}>
                                                                    {u.role}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5 text-xs font-bold text-slate-500 capitalize">{u.designation || "N/A"}</td>
                                                        <td className="px-6 py-5">
                                                            <div className="relative">
                                                                <select
                                                                    value={currentVal || "None"}
                                                                    onChange={(e) => handleSupervisorChange(u.rowIndex, e.target.value)}
                                                                    className="w-full pl-3 pr-8 py-2 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 focus:bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 rounded-xl text-xs font-bold text-slate-700 focus:outline-none transition-all appearance-none cursor-pointer"
                                                                >
                                                                    <option value="None">None (No Supervisor)</option>
                                                                    {supervisorOptions.filter(opt => opt.toLowerCase() !== u.name.toLowerCase()).map(opt => (
                                                                        <option key={opt} value={opt}>{opt}</option>
                                                                    ))}
                                                                </select>
                                                                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                {state === "saving" && (
                                                                    <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
                                                                )}
                                                                {state === "saved" && (
                                                                    <span className="inline-flex items-center gap-1 text-emerald-600 text-[10px] font-extrabold bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg">
                                                                        <Check className="w-3 h-3" /> Saved
                                                                    </span>
                                                                )}
                                                                {state === "error" && (
                                                                    <span className="inline-flex items-center gap-1 text-rose-600 text-[10px] font-extrabold bg-rose-50 border border-rose-100 px-2 py-1 rounded-lg" title="Failed to save">
                                                                        <AlertCircle className="w-3.5 h-3.5" /> Fail
                                                                    </span>
                                                                )}
                                                                <button
                                                                    onClick={() => handleEditUserClick(u)}
                                                                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200/50 hover:bg-slate-100 hover:border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
                                                                >
                                                                    <Edit2 className="w-3 h-3 text-slate-500" />
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleSaveSupervisor(u.rowIndex, u.name)}
                                                                    disabled={!hasChanges || state === "saving"}
                                                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 ${
                                                                        hasChanges && state !== "saving"
                                                                            ? "bg-purple-600 text-white hover:bg-purple-700 hover:shadow-md cursor-pointer"
                                                                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                                                    }`}
                                                                >
                                                                    <Save className="w-3 h-3" />
                                                                    Save
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-16 text-center text-slate-400 text-xs font-semibold">
                                                    No matches found in the employee registry.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Access Control Information */}
                        <div className="bg-purple-50/50 border border-purple-100 rounded-3xl p-5 flex items-start gap-4 shadow-sm">
                            <ShieldAlert className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5 animate-pulse" />
                            <div>
                                <h3 className="text-sm font-extrabold text-purple-900 leading-tight">Access Control Rules & Privileges</h3>
                                <ul className="list-disc list-inside text-xs text-purple-800/80 space-y-1.5 mt-3 font-semibold">
                                    <li><strong>Ordinary User:</strong> Can strictly access their own dashboard and weekly task profiles.</li>
                                    <li><strong>HOD (Head of Department):</strong> Accesses their own data and any user reporting directly to them (assigned above).</li>
                                    <li><strong>Admin:</strong> Complete operational view over dashboard indices, department logs, and files, excluding settings.</li>
                                    <li><strong>Superadmin:</strong> Unrestricted master control over the registry, supervisor definitions, and settings dashboard.</li>
                                </ul>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Add/Edit User Modal */}
            {isUserModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
                            <div>
                                <h3 className="text-base font-extrabold text-slate-800">
                                    {modalMode === "edit" ? "Modify User Registry" : "Register New Account"}
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {modalMode === "edit" ? "Update access credentials and employee profile metadata." : "Provision a new active employee profile on Google Sheets."}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsUserModalOpen(false)}
                                className="p-1.5 bg-slate-200/50 hover:bg-slate-200 rounded-full text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body / Form */}
                        <form onSubmit={handleModalSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Name */}
                                <div className="space-y-1">
                                    <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Full Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={modalForm.name}
                                        onChange={(e) => setModalForm(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-500/10 transition-all"
                                        placeholder="John Doe"
                                    />
                                </div>

                                {/* User ID */}
                                <div className="space-y-1">
                                    <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">User ID *</label>
                                    <input
                                        type="text"
                                        required
                                        value={modalForm.id}
                                        onChange={(e) => setModalForm(prev => ({ ...prev, id: e.target.value }))}
                                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-500/10 transition-all"
                                        placeholder="johndoe"
                                    />
                                </div>

                                {/* Email */}
                                <div className="space-y-1">
                                    <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Email Address</label>
                                    <input
                                        type="email"
                                        value={modalForm.email}
                                        onChange={(e) => setModalForm(prev => ({ ...prev, email: e.target.value }))}
                                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-500/10 transition-all"
                                        placeholder="john@example.com"
                                    />
                                </div>

                                {/* Password */}
                                <div className="space-y-1">
                                    <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Password *</label>
                                    <input
                                        type="text"
                                        required
                                        value={modalForm.password}
                                        onChange={(e) => setModalForm(prev => ({ ...prev, password: e.target.value }))}
                                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-500/10 transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>

                                {/* Department */}
                                <div className="space-y-1">
                                    <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Department</label>
                                    <input
                                        type="text"
                                        value={modalForm.department}
                                        onChange={(e) => setModalForm(prev => ({ ...prev, department: e.target.value }))}
                                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-500/10 transition-all"
                                        placeholder="Operations"
                                    />
                                </div>

                                {/* Designation */}
                                <div className="space-y-1">
                                    <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Designation</label>
                                    <input
                                        type="text"
                                        value={modalForm.designation}
                                        onChange={(e) => setModalForm(prev => ({ ...prev, designation: e.target.value }))}
                                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-500/10 transition-all"
                                        placeholder="Senior Executive"
                                    />
                                </div>

                                {/* System Role */}
                                <div className="space-y-1">
                                    <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Access Role</label>
                                    <select
                                        value={modalForm.role}
                                        onChange={(e) => setModalForm(prev => ({ ...prev, role: e.target.value }))}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-500/10 transition-all cursor-pointer"
                                    >
                                        <option value="user">User (Standard Access)</option>
                                        <option value="admin">Admin (All Records access)</option>
                                        <option value="superadmin">Superadmin (All access & settings)</option>
                                    </select>
                                </div>

                                {/* Reported To */}
                                <div className="space-y-1">
                                    <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Reported To (Supervisor)</label>
                                    <select
                                        value={modalForm.reportedBy || "None"}
                                        onChange={(e) => setModalForm(prev => ({ ...prev, reportedBy: e.target.value === "None" ? "" : e.target.value }))}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-500/10 transition-all cursor-pointer"
                                    >
                                        <option value="None">None (No Supervisor)</option>
                                        {supervisorOptions.filter(opt => opt.toLowerCase() !== modalForm.name.toLowerCase()).map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Modal Footer Buttons */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setIsUserModalOpen(false)}
                                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={modalSaving}
                                    className="flex items-center gap-1.5 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-100 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                                >
                                    {modalSaving ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-3.5 h-3.5" /> Save Account
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperadminSettings;
