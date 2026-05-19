import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminHistoryCommitment from './pages/admin/HistoryCommitment';
import AdminTodayTasks from './pages/admin/TodayTasks';
import AdminPendingTasks from './pages/admin/PendingTasks';
import KpiKra from './pages/admin/KpiKra';
import AdminLayout from './layouts/AdminLayout';
import NotFound from './pages/NotFound';
import Report from './pages/admin/Report';

function App() {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isAdminOrSuper = user && (user.role === 'admin' || user.role === 'superadmin');

  return (
    <Routes>
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to={isAdminOrSuper ? '/admin' : '/user'} replace />
          ) : (
            <Login />
          )
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <RequireAuth role="admin">
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="history-commitment" element={<AdminHistoryCommitment />} />
        <Route path="today-tasks" element={<AdminTodayTasks />} />
        <Route path="pending-tasks" element={<AdminPendingTasks />} />
        <Route path="kpi-kra" element={<KpiKra />} />
        <Route path="department" element={<Report />} />
      </Route>

      {/* User Routes */}
      <Route
        path="/user/*"
        element={
          <RequireAuth role="user">
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/user/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="history-commitment" element={<AdminHistoryCommitment />} />
        <Route path="kpi-kra" element={<KpiKra />} />
      </Route>

      {/* Root route */}
      <Route
        path="/"
        element={
          <Navigate to={user ? (isAdminOrSuper ? '/admin' : '/user') : '/login'} replace />
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// Authentication guard component
function RequireAuth({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isAdminOrSuper = user.role === 'admin' || user.role === 'superadmin';

  if (role === 'admin' && !isAdminOrSuper) {
    return <Navigate to="/user" replace />;
  }

  if (role === 'user' && user.role !== 'user' && !isAdminOrSuper) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default App;