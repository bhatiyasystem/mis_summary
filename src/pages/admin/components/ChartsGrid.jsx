import React from "react";
import HalfCircleChart from "../../../components/charts/HalfCircleChart";
import VerticalBarChart from "../../../components/charts/VerticalBarChart";
import { Clock, User as UserIcon, CheckCircle2, Loader2 } from "lucide-react";

const ChartsGrid = ({
    user,
    loading,
    topScorersData,
    topScorersLabels,
    pendingTasksData,
    pendingTasksLabels,
    pendingTasksTotalData,
    topBestData,
    topBestLabels,
    topBestTotalData,
}) => {
    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

    return (
        <div className={`grid grid-cols-1 ${isAdmin ? 'lg:grid-cols-2 xl:grid-cols-3' : ''} gap-4 lg:gap-6`}>
            {/* Top 5 Best Performers - Admin Only */}
            {isAdmin && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 lg:p-8 bg-gradient-to-br from-white to-gray-50/50">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm md:text-base font-bold text-gray-800 flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-green-500 rounded-full" />
                            Top 5 Best Performers
                        </h2>
                    </div>
                    <div className="h-48 md:h-64 lg:h-80 w-full">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
                                <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                                <span className="text-sm font-medium text-gray-500">Loading data...</span>
                            </div>
                        ) : topBestData && topBestData.length > 0 ? (
                            <VerticalBarChart
                                data={topBestData}
                                labels={topBestLabels}
                                colors={["#22c55e", "#4ade80", "#86efac", "#bbf7d0", "#dcfce7"]}
                                subValues={topBestTotalData}
                                maxValue={Math.max(...topBestData, 1)}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400 text-sm italic">No data available</div>
                        )}
                    </div>
                </div>
            )}

            {/* Pending Tasks by User - Everyone */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 lg:p-8 bg-gradient-to-br from-white to-gray-50/50 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-sm md:text-base font-bold text-gray-800 flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-red-500 rounded-full" />
                        Pending Tasks by User
                    </h2>
                    <div className="text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                        Live Tracking
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                    {pendingTasksLabels && pendingTasksLabels.length > 0 ? (
                        pendingTasksLabels.map((label, index) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-50 shadow-sm hover:shadow-md transition-all duration-300">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                                        <UserIcon size={14} />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700 truncate max-w-[150px]">
                                        {label}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Pending</span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-sm font-bold text-red-600">
                                                {pendingTasksData[index]}
                                            </span>
                                            <span className="text-xs text-gray-300">/</span>
                                            <span className="text-xs font-medium text-gray-500">
                                                {pendingTasksTotalData[index]}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-1.5 h-8 bg-red-100 rounded-full overflow-hidden">
                                        <div
                                            className="w-full bg-red-500 rounded-full"
                                            style={{
                                                height: `${Math.round((pendingTasksData[index] / (pendingTasksTotalData[index] || 1)) * 100)}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full py-10 text-gray-400 gap-3">
                            <CheckCircle2 size={32} className="text-green-400 opacity-50" />
                            <p className="text-sm font-medium italic">All tasks completed! ✅</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Top 5 Worst Performers - Admin Only */}
            {isAdmin && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 lg:p-8 bg-gradient-to-br from-white to-gray-50/50">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm md:text-base font-bold text-gray-800 flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
                            Top 5 Worst Performers
                        </h2>
                    </div>
                    <div className="h-48 md:h-64 lg:h-80 w-full">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
                                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                                <span className="text-sm font-medium text-gray-500">Loading data...</span>
                            </div>
                        ) : topScorersData && topScorersData.length > 0 ? (
                            <HalfCircleChart
                                data={topScorersData}
                                labels={topScorersLabels}
                                colors={["#8DD9D5", "#6BBBEA", "#BEA1E8", "#FFB77D", "#FF99A8"]}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400 text-sm italic">No data available</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChartsGrid;
