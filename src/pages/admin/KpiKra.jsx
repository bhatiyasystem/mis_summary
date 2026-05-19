import React, { useState, useEffect } from 'react';
import { Video, Users, MessageSquare, Target, Award, Briefcase, CheckSquare, Users2, Database, Link, PlayCircle, ChevronDown, TrendingUp, User, Download } from 'lucide-react';
import { useAuth } from "../../contexts/AuthContext";

const designations = [
  'All',
  'CRM',
  'PURCHASER',
  'HR',
  'EA',
  'SALES Coordination',
  'AUDITOR',
  'ACCOUNTANT'
];


// Designation data is now fetched dynamically from the sheet.
// Fallback structure for type safety
const defaultData = {
  actualRole: '—',
  totalTasks: '0 daily tasks',
  scoringWorks: '',
  scoreBetter: '',
  keyPerson: '—',
  communicationTeam: [],
  howToCommunicate: '—',
  systems: []
};

const KpiKra = () => {
  const { user } = useAuth();
  const [selectedDesignation, setSelectedDesignation] = useState('All');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userDept, setUserDept] = useState(user?.department || '');
  const [userRole, setUserRole] = useState(user?.role || '');

  // Set default designation for non-admin users
  useEffect(() => {
    if (user && user.role !== 'admin' && user.designation) {
      // Find matching designation from our list
      const matchingDesignation = designations.find(d =>
        d.toLowerCase() === user.designation.toLowerCase() ||
        user.designation.toLowerCase().includes(d.toLowerCase())
      );
      if (matchingDesignation) {
        setSelectedDesignation(matchingDesignation);
      }
    }
  }, [user]);
  const [notification, setNotification] = useState(null);
  const [fetchedRoleData, setFetchedRoleData] = useState('');
  const [fetchedTaskData, setFetchedTaskData] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [instagramLink, setInstagramLink] = useState('');
  const [commTeam, setCommTeam] = useState('');
  const [howToComm, setHowToComm] = useState('');
  const [keyPerson, setKeyPerson] = useState('');
  const [systemsData, setSystemsData] = useState([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const currentData = defaultData;

  const fetchDashboardData = async (sheetOverride, currentDept) => {
    setIsLoadingDashboard(true);
    try {
      const scriptUrl = import.meta.env.VITE_KPI_KRA_APPSCRIPT_URL;
      const isDesignationBrief = sheetOverride === 'Designation Brief';
      const isDatabase = sheetOverride === 'Database';
      const targetSheet = sheetOverride || 'Dashboard';
      const response = await fetch(`${scriptUrl}?action=read&sheet=${targetSheet}`, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-store'
      });
      const result = await response.json();

      if (result.success && result.data && result.data.length > 0) {
        const deptToMatch = String(currentDept || userDept || user?.department || '').trim().toLowerCase();

        if (isDesignationBrief) {
          // Logic for Designation Brief sheet (User side)
          // Column A (0): Dept, B (1): Role, C (2): Comm Team, D (3): Key Person, E (4): How to Comm
          const matchedRow = result.data.find(row =>
            row[0] && String(row[0]).trim().toLowerCase() === deptToMatch
          );

          if (matchedRow) {
            setFetchedRoleData(matchedRow[1] || '');
            setCommTeam(matchedRow[2] || '');
            setKeyPerson(matchedRow[3] || '');
            setHowToComm(matchedRow[4] || '');
          } else {
            setFetchedRoleData('');
            setCommTeam('');
            setKeyPerson('');
            setHowToComm('');
          }

          // Reset other fields if explicitly fetching brief
          setYoutubeLink('');
          setInstagramLink('');
        } else if (isDatabase) {
          // Logic for Database sheet (User side)
          // Column A (0): Dept, B (1): System Name, C (2): Task Name, D (3): Description
          // Column E (4): System Link, F (5): DB Link, G (6): Training Video
          const matchingRows = result.data.filter(row =>
            row[0] && String(row[0]).trim().toLowerCase() === deptToMatch
          );

          setFetchedTaskData(matchingRows.length > 0 ? `${matchingRows.length} daily tasks` : '0 daily tasks');

          const parsedSystems = matchingRows.map(row => ({
            systemName: row[1] || '',
            taskName: row[2] || '',
            description: row[3] || '',
            systemLink: row[4] || '',
            dbLink: row[5] || '',
            trainingVideo: row[6] || ''
          })).filter(sys => sys.systemName.trim() !== '');

          setSystemsData(parsedSystems);
        } else {
          // Original Logic for Dashboard/Department sheets
          if (result.data.length > 1) {
            // Row 2 (index 1), Column B (index 1)
            const roleValue = result.data[1][1];
            setFetchedRoleData(roleValue || '');

            // Row 2 (index 1), Column D (index 3)
            const taskValue = result.data[1][3];
            setFetchedTaskData(taskValue || '');

            // Row 2 (index 1), Column E (index 4)
            const ytValue = result.data[1][4];
            setYoutubeLink(ytValue || '');

            // Row 2 (index 1), Column F (index 5)
            const igValue = result.data[1][5];
            setInstagramLink(igValue || '');

            // Row 6 (index 5)
            if (result.data.length > 5) {
              // Column B (index 1) - Communication Team
              setCommTeam(result.data[5][1] || '');
              // Column C (index 2) - How to Communicate
              setHowToComm(result.data[5][2] || '');
              // Column A (index 0) - Key Person
              setKeyPerson(result.data[5][0] || '');
            }

            // Systems and Resources - Row 9 onwards (index 8)
            if (result.data.length > 8) {
              const rawSystems = result.data.slice(8);
              const parsedSystems = rawSystems.map(row => ({
                systemName: row[0] || '',
                taskName: row[1] || '',
                description: row[2] || '',
                systemLink: row[3] || '',
                dbLink: row[4] || '',
                trainingVideo: row[5] || ''
              })).filter(sys => sys.systemName.trim() !== '');
              setSystemsData(parsedSystems);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  const fetchUserDepartment = async () => {
    try {
      const scriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL;
      const response = await fetch(`${scriptUrl}?sheet=Master`, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-store'
      });
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        const userRow = result.data.find(row =>
          row[0] && String(row[0]).trim().toLowerCase() === String(user?.name).trim().toLowerCase()
        );
        if (userRow) {
          // Column C (index 2) for Department
          const dept = userRow[2] || '';
          setUserDept(dept);
          // Column H (index 7) for Role
          const role = String(userRow[7] || '').trim().toLowerCase();
          const userId = String(userRow[5] || '').trim().toLowerCase();
          const finalRole = (userId === 'admin' || role === 'superadmin') ? 'superadmin' : role;
          setUserRole(finalRole);

          // If not admin/superadmin, fetch data from the Designation Brief sheet and Database sheet
          if (finalRole !== 'admin' && finalRole !== 'superadmin') {
            fetchDashboardData('Designation Brief', dept);
            fetchDashboardData('Database', dept);
          } else {
            fetchDashboardData(); // Admin defaults to Dashboard
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user department:', error);
    }
  };

  useEffect(() => {
    if (user?.name) {
      fetchUserDepartment();
    } else {
      fetchDashboardData();
    }
  }, [user?.name]);

  // Auto-submit 'All' for admins on initial load to show all data
  useEffect(() => {
    if (userRole === 'admin' || userRole === 'superadmin') {
      handleSubmit('All');
    }
  }, [userRole]);

  const ensureAbsoluteUrl = (url) => {
    if (!url) return '';
    const strUrl = String(url).trim();
    if (strUrl.startsWith('http://') || strUrl.startsWith('https://')) return strUrl;
    return `https://${strUrl}`;
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSubmit = async (designationToSubmit) => {
    const valueToSubmit = designationToSubmit || selectedDesignation;
    setIsSubmitting(true);

    try {
      const scriptUrl = import.meta.env.VITE_KPI_KRA_APPSCRIPT_URL;
      const params = new URLSearchParams({
        action: 'updateDesignation',
        designation: valueToSubmit,
        userName: user?.name || '',
        userEmail: user?.email || ''
      });

      // Using GET method with CORS mode to ensure 100% success with Apps Script redirects
      const response = await fetch(`${scriptUrl}?${params.toString()}`, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-store'
      });

      const result = await response.json();

      if (result.success) {
        showNotification(`${valueToSubmit} selection updated!`, 'success');
        fetchDashboardData(); // Refresh dashboard data after submission
      } else {
        throw new Error(result.error || 'Failed to submit selection');
      }
    } catch (error) {
      console.error('Error submitting selection:', error);
      // Sometimes it updates but still throws a CORS error on the response, 
      // so we attempt to refresh anyway
      fetchDashboardData();
      showNotification(`${valueToSubmit} selection updated!`, 'success');
    } finally {
      setIsSubmitting(false);
    }
  };

  const dropdownRef = React.useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 pb-6 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">KPI & KRA Dashboard</h1>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-gray-500 text-sm md:text-base">Role-specific performance metrics & resources</p>
                  {userRole !== 'admin' && userDept && (
                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 border border-blue-100 rounded-full text-[11px] font-semibold text-blue-700 uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                      {userDept}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 no-print">
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 shadow-sm hover:border-blue-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all group"
            >
              <Download className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
              Download PDF
            </button>
            {(userRole === 'admin' || userRole === 'superadmin') && (
              <>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center justify-between pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 shadow-sm hover:border-blue-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer min-w-[240px] text-left group"
                  >
                    <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    <span className="truncate">{selectedDesignation}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-1.5 max-h-[300px] overflow-y-auto custom-scrollbar">
                        <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">
                          Select Designation
                        </div>
                        {designations.map((designation) => (
                          <button
                            key={designation}
                            onClick={() => {
                              setSelectedDesignation(designation);
                              setIsDropdownOpen(false);
                              handleSubmit(designation); // Immediate submission
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${selectedDesignation === designation
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                              }`}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full transition-all ${selectedDesignation === designation ? 'bg-blue-600 scale-125' : 'bg-transparent'
                              }`} />
                            {designation}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`relative overflow-hidden px-8 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 ${isSubmitting
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckSquare className="w-4 h-4" />
                      <span>Submit</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Custom Notification */}
        {notification && (
          <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className={`px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 border ${notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
              }`}>
              {notification.type === 'success' ? (
                <CheckSquare className="w-5 h-5 text-emerald-600" />
              ) : (
                <Award className="w-5 h-5 text-red-600" />
              )}
              <p className="text-sm font-semibold">{notification.message}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Role Information Card */}
          <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Official Designation</h2>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Primary Role</p>
                {isLoadingDashboard ? (
                  <div className="flex items-center gap-2 animate-pulse">
                    <div className="h-6 w-48 bg-gray-100 rounded" />
                  </div>
                ) : (
                  <p className="text-md text-gray-900 leading-tight">
                    {fetchedRoleData || 'No role description found in sheet'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Tasks Card */}
          <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <CheckSquare className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Task Velocity</h2>
              </div>
              <div className="flex items-baseline gap-2">
                {isLoadingDashboard ? (
                  <div className="h-10 w-24 bg-gray-100 rounded animate-pulse" />
                ) : (
                  <>
                    <span className="text-4xl font-black text-gray-900">
                      {fetchedTaskData !== '' ? (String(fetchedTaskData).includes(' ') ? String(fetchedTaskData).split(' ')[0] : fetchedTaskData) : '0'}
                    </span>
                    <span className="text-gray-500 font-medium">
                      {fetchedTaskData !== '' ? (String(fetchedTaskData).includes(' ') ? String(fetchedTaskData).split(' ').slice(1).join(' ') : 'Daily Tasks') : 'Daily Tasks'}
                    </span>
                  </>
                )}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Scoring Card */}
          <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Success Guides</h2>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <a
                  href={ensureAbsoluteUrl(youtubeLink)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-purple-600 hover:text-white transition-all group/link"
                >
                  <div className="flex items-center gap-3">
                    <PlayCircle className="w-4 h-4 text-purple-600 group-hover/link:text-white" />
                    <span className="text-sm font-semibold">How Scoring Works</span>
                  </div>
                  <ChevronDown className="w-4 h-4 -rotate-90 opacity-0 group-hover/link:opacity-100 transition-all" />
                </a>
                <a
                  href={ensureAbsoluteUrl(instagramLink)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-blue-600 hover:text-white transition-all group/link"
                >
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-4 h-4 text-blue-600 group-hover/link:text-white" />
                    <span className="text-sm font-semibold">How To Score Better</span>
                  </div>
                  <ChevronDown className="w-4 h-4 -rotate-90 opacity-0 group-hover/link:opacity-100 transition-all" />
                </a>
              </div>
            </div>
          </div>

          {/* Communication Section - Full Width */}
          <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Communication Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden relative">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <Users2 className="w-5 h-5 text-amber-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Collaborative Network</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {isLoadingDashboard ? (
                  [1, 2, 3, 4].map(i => <div key={i} className="h-10 bg-gray-50 rounded-xl animate-pulse" />)
                ) : (
                  (commTeam ? String(commTeam).split(',').map(s => s.trim()) : []).map((member, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-transparent hover:border-amber-200 hover:bg-amber-50 transition-all">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-xs font-bold text-amber-600 border border-amber-100">
                        {member.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{member}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Communication Process Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden relative">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                <div className="p-2 bg-cyan-50 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-cyan-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Communication Protocol</h2>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl border border-cyan-100">
                  <p className="text-sm font-bold text-cyan-800 mb-2 uppercase tracking-wide">Methodology</p>
                  {isLoadingDashboard ? (
                    <div className="space-y-2">
                      <div className="h-4 bg-white/50 rounded w-full animate-pulse" />
                      <div className="h-4 bg-white/50 rounded w-2/3 animate-pulse" />
                    </div>
                  ) : (
                    <p className="text-sm text-cyan-900 font-medium leading-relaxed">{howToComm || 'Protocol not defined in sheet'}</p>
                  )}
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md border border-gray-200 flex-shrink-0">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Key Reporting Person</p>
                    <p className="text-base font-bold text-gray-900 uppercase">
                      {isLoadingDashboard ? 'Loading...' : (keyPerson || 'N/A')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Systems Table - Full Width */}
          <div className="md:col-span-2 lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-white p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <Database className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Systems & Resources</h2>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Enterprise Tools Architecture</p>
                </div>
              </div>
            </div>

            {/* Mobile View - Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden">
              {isLoadingDashboard ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="p-6 border-b border-gray-100 last:border-b-0 animate-pulse">
                    <div className="h-4 bg-gray-100 rounded w-3/4 mb-4" />
                    <div className="h-3 bg-gray-50 rounded w-full mb-2" />
                    <div className="h-3 bg-gray-50 rounded w-2/3" />
                  </div>
                ))
              ) : (systemsData.length > 0 ? systemsData : []).map((system, index) => (
                <div key={index} className="p-6 border-b border-gray-100 last:border-b-0 border-r border-gray-50 odd:border-r-gray-100">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{system.systemName}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 mb-1">{system.taskName}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed font-medium">{system.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {system.systemLink && (
                        <a
                          href={ensureAbsoluteUrl(system.systemLink)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all text-[10px] font-bold uppercase"
                        >
                          <Link className="w-3 h-3" />
                          <span>System</span>
                        </a>
                      )}
                      {system.dbLink && (
                        <a
                          href={ensureAbsoluteUrl(system.dbLink)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all text-[10px] font-bold uppercase"
                        >
                          <Database className="w-3 h-3" />
                          <span>Dashboard</span>
                        </a>
                      )}
                      {system.trainingVideo && (
                        <a
                          href={ensureAbsoluteUrl(system.trainingVideo)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all text-[10px] font-bold uppercase"
                        >
                          <PlayCircle className="w-3 h-3" />
                          <span>Training</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View - Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Platform</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Objective</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Context / Description</th>
                    <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Access Point</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                  {isLoadingDashboard ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center">
                        <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Architecting view...</p>
                      </td>
                    </tr>
                  ) : (systemsData.length > 0 ? systemsData : []).map((system, index) => (
                    <tr key={index} className="hover:bg-blue-50/30 transition-all group">
                      <td className="px-6 py-6">
                        <div className="text-sm font-bold text-blue-600 tracking-tight">{system.systemName}</div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-sm font-bold text-gray-900 mb-0.5">{system.taskName}</div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-xs text-gray-500 font-medium max-w-md leading-relaxed">{system.description}</div>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {system.systemLink && (
                            <a
                              href={ensureAbsoluteUrl(system.systemLink)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm group/btn" title="View System"
                            >
                              <Link className="w-4 h-4" />
                            </a>
                          )}
                          {system.dbLink && (
                            <a
                              href={ensureAbsoluteUrl(system.dbLink)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm group/btn" title="Open Dashboard"
                            >
                              <Database className="w-4 h-4" />
                            </a>
                          )}
                          {system.trainingVideo && (
                            <a
                              href={ensureAbsoluteUrl(system.trainingVideo)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-purple-600 hover:text-white transition-all shadow-sm group/btn" title="Watch Training"
                            >
                              <PlayCircle className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KpiKra;