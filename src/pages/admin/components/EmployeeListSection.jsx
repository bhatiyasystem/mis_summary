import React from "react";
import { Filter, ChevronDown, Loader2, MessageSquare } from "lucide-react";

const EmployeeListSection = ({
    user,
    // Column visibility
    ALL_COLUMNS,
    visibleColumns,
    showColumnFilter,
    setShowColumnFilter,
    toggleColumn,
    toggleAllColumns,
    columnLabels,
    // Filter state
    filterName,
    setFilterName,
    filterDepartment,
    setFilterDepartment,
    uniqueDesignations,
    // Submit
    onMainSubmit,
    onWhatsAppSubmit,
    selectedEmployees,
    mainSubmitting,
    whatsappSubmitting,
    // Table data
    loading,
    filteredEmployees,
    // Checkbox
    selectAll,
    handleSelectAll,
    handleCheckboxChange,
    handleEmployeeSelect,
    handleRowClick,
    // Editable inputs
    editableData,
    handleInputChange,
    // Mobile expand
    expandedEmployee,
    setExpandedEmployee,
    // Commitments (mobile expanded view)
    employeeCommitments,
    handleCommitmentChange,
}) => {
    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-3 md:p-4 border-b border-gray-200">
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-base md:text-lg font-semibold text-gray-800">
                            List of People
                        </h2>
                        <div className="flex items-center gap-2">
                            {selectedEmployees.length > 0 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onWhatsAppSubmit(e);
                                        }}
                                        disabled={whatsappSubmitting || mainSubmitting}
                                        className="inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-[#25D366] hover:bg-[#128C7E] transition-all transform active:scale-95 disabled:bg-green-300 disabled:cursor-not-allowed"
                                    >
                                        {whatsappSubmitting ? (
                                            <Loader2 className="animate-spin h-4 w-4" />
                                        ) : (
                                            <>
                                                <MessageSquare className="h-4 w-4 mr-2" />
                                                WhatsApp
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onMainSubmit(e);
                                        }}
                                        disabled={whatsappSubmitting || mainSubmitting}
                                        className={`inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white transition-all transform active:scale-95 ${mainSubmitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                                            }`}
                                    >
                                        {mainSubmitting ? (
                                            <>
                                                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                                Submitting...
                                            </>
                                        ) : (
                                            "Submit Selection"
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 md:gap-3">
                        <div className="relative w-full sm:w-auto order-1">
                            <button
                                onClick={() => setShowColumnFilter(!showColumnFilter)}
                                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                Columns
                            </button>
                            {showColumnFilter && (
                                <div className="absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
                                    <div className="p-2 border-b border-gray-100 sticky top-0 bg-white z-10">
                                        <label className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={Object.values(visibleColumns).every(Boolean)}
                                                onChange={toggleAllColumns}
                                                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-900 font-semibold">Select All</span>
                                        </label>
                                    </div>
                                    <div className="p-2 space-y-1">
                                        {ALL_COLUMNS.map((col) => (
                                            <label
                                                key={col.key}
                                                className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={visibleColumns[col.key]}
                                                    onChange={() => toggleColumn(col.key)}
                                                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">
                                                    {col.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-[200px] sm:min-w-[150px] order-2">
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={filterName}
                                onChange={(e) => setFilterName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div className="flex-1 min-w-[200px] sm:min-w-[150px] order-3">
                            <select
                                value={filterDepartment}
                                onChange={(e) => setFilterDepartment(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">All Designations</option>
                                {uniqueDesignations.map((desig) => (
                                    <option key={desig} value={desig}>
                                        {desig}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-y-auto max-h-[700px] relative">
                <table className="min-w-full divide-y divide-gray-200 border-separate border-spacing-0">
                    <thead className="bg-gray-50 sticky top-0 z-20 shadow-sm">
                        <tr>
                            <th className="w-12 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <input
                                    type="checkbox"
                                    checked={selectAll}
                                    onChange={handleSelectAll}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                            </th>

                            {visibleColumns.name && (
                                <th className="px-2 min-w-24 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {columnLabels.name}
                                </th>
                            )}
                            {visibleColumns.designation && (
                                <th className="px-2 min-w-24 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {columnLabels.designation}
                                </th>
                            )}
                            {visibleColumns.target && (
                                <th className="px-2 min-w-24 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {columnLabels.target}
                                </th>
                            )}
                            {visibleColumns.actualWork && (
                                <th className="px-2 min-w-24 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {columnLabels.actualWork}
                                </th>
                            )}
                            {visibleColumns.weeklyDone && (
                                <th className="px-2 min-w-24 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {columnLabels.weeklyDone}
                                </th>
                            )}
                            {visibleColumns.weeklyOnTime && (
                                <th className="px-2 min-w-24 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {columnLabels.weeklyOnTime}
                                </th>
                            )}
                            {visibleColumns.totalWork && (
                                <th className="px-2 min-w-24 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {columnLabels.totalWork}
                                </th>
                            )}
                            {visibleColumns.weekPending && (
                                <th className="px-2 min-w-24 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {columnLabels.weekPending}
                                </th>
                            )}
                            {visibleColumns.allPending && (
                                <th className="px-2 min-w-24 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {columnLabels.allPending}
                                </th>
                            )}
                            {visibleColumns.lastWeekPlannedNotDone && (
                                <th className="px-2 min-w-24 text-center py-3  text-xs font-bold uppercase tracking-wider bg-red-100 text-red-700">
                                    Planned % Work Not Done
                                </th>
                            )}
                            {visibleColumns.lastWeekPlannedNotDoneOnTime && (
                                <th className="px-2 min-w-24 text-center py-3  text-xs font-bold uppercase tracking-wider bg-red-100 text-red-700">
                                    Planned % Work Not Done On Time
                                </th>
                            )}
                            {visibleColumns.lastWeekCommitment && (
                                <th className="px-2 min-w-24 text-center py-3  text-xs font-bold uppercase tracking-wider bg-red-100 text-red-700">
                                    Commitment
                                </th>
                            )}
                            {visibleColumns.nextWeekPlannedNotDone && (
                                <th className="px-2  min-w-24 text-center py-3  text-xs font-bold uppercase tracking-wider bg-green-100 text-green-700">
                                    Planned % Work Not Done
                                </th>
                            )}
                            {visibleColumns.nextWeekPlannedNotDoneOnTime && (
                                <th className="px-2 min-w-24 text-center py-3  text-xs font-bold uppercase tracking-wider bg-green-100 text-green-700">
                                    Planned % Work Not Done On Time
                                </th>
                            )}
                            {visibleColumns.nextWeekCommitment && (
                                <th className="px-2 min-w-24 text-center py-3  text-xs font-bold uppercase tracking-wider bg-green-100 text-green-700">
                                    Commitment
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 relative">
                        {loading && filteredEmployees.length === 0 ? (
                            <tr>
                                <td colSpan={ALL_COLUMNS.length + 1} className="px-6 py-10 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-3">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        <p className="text-sm text-gray-500 font-medium">Loading employee data...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredEmployees.length === 0 ? (
                            <tr>
                                <td colSpan={ALL_COLUMNS.length + 1} className="px-6 py-10 text-center text-sm text-gray-500">
                                    No employees found matching the filters.
                                </td>
                            </tr>
                        ) : (
                            <>
                                {loading && (
                                    <tr className="bg-blue-50/30">
                                        <td colSpan={ALL_COLUMNS.length + 1} className="px-3 py-1 text-center">
                                            <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider animate-pulse">
                                                Refreshing Data...
                                            </span>
                                        </td>
                                    </tr>
                                )}
                                {filteredEmployees.map((employee) => (
                                    <tr
                                        key={employee.id}
                                        onClick={() => handleRowClick(employee)}
                                        className={`hover:bg-gray-50 cursor-pointer ${selectedEmployees.includes(employee.id) ? "bg-blue-50" : ""
                                            }`}
                                    >
                                        <td
                                            className="w-12 px-3 py-4"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedEmployees.includes(employee.id)}
                                                onChange={() => handleCheckboxChange(employee.id)}
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </td>

                                        {visibleColumns.name && (
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <img
                                                        className="h-8 w-8 rounded-full object-cover"
                                                        src={employee.image}
                                                        alt={employee.name}
                                                    />
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {employee.name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        )}
                                        {visibleColumns.designation && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {employee.designation}
                                            </td>
                                        )}
                                        {visibleColumns.target && (
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                                {employee.target}
                                            </td>
                                        )}
                                        {visibleColumns.actualWork && (
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                                {employee.actualWorkDone}
                                            </td>
                                        )}
                                        {visibleColumns.weeklyDone && (
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                                {employee.weeklyWorkDone}
                                            </td>
                                        )}
                                        {visibleColumns.weeklyOnTime && (
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                                {employee.weeklyWorkDoneOnTime}
                                            </td>
                                        )}
                                        {visibleColumns.totalWork && (
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                                {employee.totalWorkDone}
                                            </td>
                                        )}
                                        {visibleColumns.weekPending && (
                                            <td className="px-3 py-4 whitespace-nowrap text-center">
                                                <span
                                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${employee.weekPending > 3
                                                        ? "bg-red-100 text-red-800"
                                                        : employee.weekPending > 1
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : "bg-green-100 text-green-800"
                                                        }`}
                                                >
                                                    {employee.weekPending}
                                                </span>
                                            </td>
                                        )}
                                        {visibleColumns.allPending && (
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                                {employee.allPendingTillDate}
                                            </td>
                                        )}
                                        {visibleColumns.lastWeekPlannedNotDone && (
                                            <td className="px-3 py-4 whitespace-nowrap text-sm bg-red-50 text-red-800 font-medium text-center">
                                                {employee.plannedWorkNotDone}
                                            </td>
                                        )}
                                        {visibleColumns.lastWeekPlannedNotDoneOnTime && (
                                            <td className="px-3 py-4 whitespace-nowrap text-sm bg-red-50 text-red-800 font-medium text-center">
                                                {employee.plannedWorkNotDoneOnTime}
                                            </td>
                                        )}
                                        {visibleColumns.lastWeekCommitment && (
                                            <td className="px-3 py-4 whitespace-nowrap text-sm bg-red-50 text-red-800 font-medium text-center">
                                                {employee.commitment}
                                            </td>
                                        )}
                                        {visibleColumns.nextWeekPlannedNotDone && (
                                            <td className="px-3 py-4 whitespace-nowrap bg-green-50 text-center">
                                                {selectedEmployees.includes(employee.id) ? (
                                                    <input
                                                        type="text"
                                                        placeholder="0"
                                                        value={editableData[employee.id]?.nextWeekPlannedNotDone || ""}
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                employee.id,
                                                                "nextWeekPlannedNotDone",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                ) : (
                                                    <span className="text-sm text-green-800 font-medium">{employee.nextWeekPlannedWorkNotDone || 0}</span>
                                                )}
                                            </td>
                                        )}
                                        {visibleColumns.nextWeekPlannedNotDoneOnTime && (
                                            <td className="px-3 py-4 whitespace-nowrap bg-green-50 text-center">
                                                {selectedEmployees.includes(employee.id) ? (
                                                    <input
                                                        type="text"
                                                        placeholder="0"
                                                        value={editableData[employee.id]?.nextWeekPlannedNotDoneOnTime || ""}
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                employee.id,
                                                                "nextWeekPlannedNotDoneOnTime",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                ) : (
                                                    <span className="text-sm text-green-800 font-medium">{employee.nextWeekPlannedWorkNotDoneOnTime || 0}</span>
                                                )}
                                            </td>
                                        )}
                                        {visibleColumns.nextWeekCommitment && (
                                            <td className="px-3 py-4 whitespace-nowrap bg-green-50 text-center">
                                                {selectedEmployees.includes(employee.id) ? (
                                                    <input
                                                        type="text"
                                                        placeholder="enter your commitment"
                                                        value={editableData[employee.id]?.nextWeekCommitment || ""}
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                employee.id,
                                                                "nextWeekCommitment",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-48 px-2 py-1 border border-gray-300 rounded text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                ) : (
                                                    <span className="text-sm text-green-800 font-medium">{employee.nextWeekCommitment || 0}</span>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden">
                <div className="px-3 py-3 bg-gray-50 flex items-center gap-3 border-b border-gray-200 sticky top-0 z-10">
                    <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                        Select All ({filteredEmployees.length})
                    </span>
                </div>

                <div className="max-h-[80vh] overflow-y-auto">
                    {filteredEmployees.map((employee) => (
                        <div
                            key={employee.id}
                            className={`border-b border-gray-200 ${selectedEmployees.includes(employee.id) ? "bg-blue-50" : ""
                                }`}
                        >
                            <div className="p-3">
                                <div className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedEmployees.includes(employee.id)}
                                        onChange={() => handleEmployeeSelect(employee.id)}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1 flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div
                                            className="flex items-center gap-2 cursor-pointer"
                                            onClick={() => handleRowClick(employee)}
                                        >
                                            <img
                                                className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                                                src={employee.image}
                                                alt={employee.name}
                                            />
                                            <div className="min-w-0 flex-1">
                                                <div className="text-sm font-medium text-gray-900 truncate">
                                                    {employee.name}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quick Stats */}
                                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Target:</span>
                                                <span className="font-semibold">
                                                    {employee.target}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Actual:</span>
                                                <span className="font-semibold">
                                                    {employee.actualWorkDone}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Pending:</span>
                                                <span
                                                    className={`font-semibold ${employee.weekPending > 3
                                                        ? "text-red-600"
                                                        : employee.weekPending > 1
                                                            ? "text-yellow-600"
                                                            : "text-green-600"
                                                        }`}
                                                >
                                                    {employee.weekPending}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Commitment:</span>
                                                <span className="font-semibold">
                                                    {employee.commitment}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() =>
                                            setExpandedEmployee(
                                                expandedEmployee === employee.id ? null : employee.id
                                            )
                                        }
                                        className="p-2 hover:bg-gray-200 rounded flex-shrink-0"
                                    >
                                        <ChevronDown
                                            className={`w-4 h-4 transition-transform ${expandedEmployee === employee.id ? "rotate-180" : ""
                                                }`}
                                        />
                                    </button>
                                </div>

                                {/* Expanded Content */}
                                {expandedEmployee === employee.id && (
                                    <div className="mt-4 space-y-4 border-t border-gray-200 pt-4">
                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                            <div className="bg-gray-50 p-2 rounded">
                                                <p className="text-gray-500">% Weekly Not Done</p>
                                                <p className="font-semibold text-gray-900">
                                                    {employee.weeklyWorkDone}%
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 p-2 rounded">
                                                <p className="text-gray-500">Weekly On Time Not Done %</p>
                                                <p className="font-semibold text-gray-900">
                                                    {employee.weeklyWorkDoneOnTime}%
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 p-2 rounded">
                                                <p className="text-gray-500">Total Work</p>
                                                <p className="font-semibold text-gray-900">
                                                    {employee.totalWorkDone}%
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 p-2 rounded">
                                                <p className="text-gray-500">All Pending</p>
                                                <p className="font-semibold text-gray-900">
                                                    {employee.allPendingTillDate}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Red Background Section - Last Week Performance */}
                                        <div className="bg-red-50 p-3 rounded-lg border border-red-100 space-y-3">
                                            <p className="text-xs font-bold text-red-700 uppercase tracking-wider">
                                                Last Week Performance
                                            </p>
                                            <div className="grid grid-cols-2 gap-3 text-xs">
                                                <div>
                                                    <p className="text-red-600 font-medium">% Work Not Done</p>
                                                    <p className="text-sm font-bold text-red-800">
                                                        {employee.plannedWorkNotDone || 0}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-red-600 font-medium">Not Done On Time</p>
                                                    <p className="text-sm font-bold text-red-800">
                                                        {employee.plannedWorkNotDoneOnTime || 0}
                                                    </p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-red-600 font-medium">Commitment</p>
                                                    <p className="text-sm font-bold text-red-800">
                                                        {employee.commitment || 0}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Green Background Section - Next Week Planning */}
                                        <div className="bg-green-50 p-3 rounded-lg border border-green-100 space-y-3">
                                            <p className="text-xs font-bold text-green-700 uppercase tracking-wider">
                                                Next Week Planning
                                            </p>

                                            {selectedEmployees.includes(employee.id) ? (
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="text-xs text-green-700 font-medium block mb-1">
                                                            Work Not Done %
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            value={
                                                                employeeCommitments[employee.id]
                                                                    ?.nextWeekPlannedWorkNotDone || 0
                                                            }
                                                            onChange={(e) =>
                                                                handleCommitmentChange(
                                                                    employee.id,
                                                                    "nextWeekPlannedWorkNotDone",
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="w-full px-2 py-1.5 border border-green-200 rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-green-700 font-medium block mb-1">
                                                            Work Not Done On Time %
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            value={
                                                                employeeCommitments[employee.id]
                                                                    ?.nextWeekPlannedWorkNotDoneOnTime || 0
                                                            }
                                                            onChange={(e) =>
                                                                handleCommitmentChange(
                                                                    employee.id,
                                                                    "nextWeekPlannedWorkNotDoneOnTime",
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="w-full px-2 py-1.5 border border-green-200 rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-green-700 font-medium block mb-1">
                                                            Commitment %
                                                        </label>
                                                        <input
                                                            type="text"
                                                            placeholder="enter your commitment"
                                                            value={
                                                                employeeCommitments[employee.id]
                                                                    ?.commitment || ""
                                                            }
                                                            onChange={(e) =>
                                                                handleCommitmentChange(
                                                                    employee.id,
                                                                    "commitment",
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="w-full px-2 py-1.5 border border-green-200 rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-3 text-xs">
                                                    <div>
                                                        <p className="text-green-600 font-medium">% Work Not Done</p>
                                                        <p className="text-sm font-bold text-green-800">
                                                            {employee.nextWeekPlannedWorkNotDone || 0}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-green-600 font-medium">Not Done On Time</p>
                                                        <p className="text-sm font-bold text-green-800">
                                                            {employee.nextWeekPlannedWorkNotDoneOnTime || 0}
                                                        </p>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <p className="text-green-600 font-medium">Commitment</p>
                                                        <p className="text-sm font-bold text-green-800">
                                                            {employee.nextWeekCommitment || 0}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EmployeeListSection;
