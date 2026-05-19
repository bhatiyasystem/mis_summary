import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDisplayableImageUrl } from '../utils/imageUtils';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /* New: User Cache for optimized login */
  const [userCache, setUserCache] = useState(null);

  // Check for existing user session on mount AND pre-fetch users
  useEffect(() => {
    const storedUser = localStorage.getItem('mis_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    preloadUsers();
    setLoading(false);
  }, []);

  const preloadUsers = async () => {
    try {
      const scriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL;
      if (scriptUrl) {
        const response = await fetch(`${scriptUrl}?sheet=Master`);
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setUserCache(result.data);
          console.log("Users pre-loaded for fast login");

          // Dynamic sync: Update current user's image from Master sheet based on name match (Column A)
          setUser(prevUser => {
            if (!prevUser) return prevUser;

            const userRow = result.data.find(row =>
              row[0] && String(row[0]).trim().toLowerCase() === String(prevUser.name).trim().toLowerCase()
            );

            if (userRow) {
              // Find actual index in result.data
              const rowIndex = result.data.findIndex(row =>
                row[0] && String(row[0]).trim().toLowerCase() === String(prevUser.name).trim().toLowerCase()
              ) + 1; // +1 for 1-based indexing in sheets

              const freshImage = getDisplayableImageUrl(userRow[4]);

              // Sync role as well from Column H (index 7)
              const rawRole = String(userRow[7] || "").trim().toLowerCase();
              const userId = String(userRow[5] || "").trim().toLowerCase();
              
              let syncedRole = prevUser.role;
              if (userId === 'admin' || rawRole === 'superadmin') syncedRole = 'superadmin';
              else if (rawRole === 'admin') syncedRole = 'admin';
              else if (rawRole === 'user') syncedRole = 'user';

              const freshReportedBy = userRow[9] || "";

              if (freshImage !== prevUser.image || rowIndex !== prevUser.rowIndex || syncedRole !== prevUser.role || freshReportedBy !== prevUser.reportedBy) {
                const updated = { ...prevUser, image: freshImage, rowIndex: rowIndex, role: syncedRole, reportedBy: freshReportedBy };
                localStorage.setItem('mis_user', JSON.stringify(updated));
                return updated;
              }
            }
            return prevUser;
          });
        }
      }
    } catch (err) {
      console.warn("User pre-load failed:", err);
    }
  };

  // Login function
  const login = async (username, password) => {
    setLoading(true);

    try {
      let usersData = userCache;

      // If cache missed or failed, fetch now
      if (!usersData) {
        const scriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL;
        if (!scriptUrl) {
          console.error("VITE_APPS_SCRIPT_URL is not defined in .env");
          setLoading(false);
          return false;
        }
        // Fetch users (Master tab)
        const response = await fetch(`${scriptUrl}?sheet=Master`);
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          usersData = result.data;
          setUserCache(usersData); // Cache for next time
        }
      }

      if (usersData) {
        // Data structure: [Name, Email, Dept, Designation, Profile, ID, Pass, Role, ..., Reported By]
        // Indices:        0     1      2     3            4        5   6     7             9

        // Find matching user (skip header row if it exists, but strict match handles it)
        const userRow = usersData.find(row =>
          String(row[5]).trim() === username && String(row[6]).trim() === password
        );

        if (userRow) {
          // Determine role based on Column H (index 7) or designation if H is empty
          const rawRole = String(userRow[7] || "").trim().toLowerCase();
          const designation = String(userRow[3]).toLowerCase();
          const userId = String(userRow[5] || "").trim().toLowerCase();

          let role = 'user'; // Default
          if (userId === 'admin' || rawRole === 'superadmin') {
            role = 'superadmin';
          } else if (rawRole === 'admin') {
            role = 'admin';
          } else if (rawRole === 'user') {
            role = 'user';
          } else {
            // Fallback to designation if Column H is not explicitly 'Admin' or 'User'
            role = (designation.includes('admin') || designation.includes('manager')) ? 'admin' : 'user';
          }

          // Get rowIndex (1-based)
          const rowIndex = usersData.findIndex(row => row === userRow) + 1;

          const verifiedUser = {
            id: userRow[5],
            name: userRow[0],
            role: role,
            rowIndex: rowIndex,
            image: getDisplayableImageUrl(userRow[4]) || `https://ui-avatars.com/api/?name=${encodeURIComponent(userRow[0])}&background=0D8ABC&color=fff`,
            email: userRow[1],
            department: userRow[2],
            designation: userRow[3],
            reportedBy: userRow[9] || ""
          };

          setUser(verifiedUser);
          localStorage.setItem('mis_user', JSON.stringify(verifiedUser));
          setLoading(false);
          return true;
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
    }

    // If we get here, login failed
    setLoading(false);
    return false;
  };

  // Update profile image function
  const updateProfileImage = async (file) => {
    if (!user || !user.rowIndex) return { success: false, error: "User not identified" };

    const scriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL;
    if (!scriptUrl) return { success: false, error: "Server URL missing" };

    try {
      // 1. Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const base64Data = await base64Promise;

      const genericUpload = async (base64) => {
        const response = await fetch(scriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            action: 'uploadFile',
            fileName: `profile_${user.name.replace(/\s+/g, '_')}`,
            mimeType: file.type,
            base64Data: base64,
            folderId: import.meta.env.VITE_DRIVE_FOLDER_ID || '10-mJ-H5P0jp67gX0A7gc6TGlyyku3thB'
          })
        });
        return await response.json();
      };

      const uploadResult = await genericUpload(base64Data);

      if (uploadResult.success && uploadResult.fileUrl) {
        const newImageUrl = uploadResult.fileUrl;

        // 3. Update Master Sheet (Column E is index 4)
        // We use 'update' action with rowIndex and rowData (as array)
        // Data structure: [0:Name, 1:Email, 2:Dept, 3:Designation, 4:Profile, 5:ID, 6:Pass]
        const rowUpdate = ["", "", "", "", newImageUrl, "", ""];

        const updateRes = await fetch(scriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            action: 'update',
            sheetName: 'Master',
            rowIndex: user.rowIndex,
            rowData: JSON.stringify(rowUpdate)
          })
        });

        const updateResult = await updateRes.json();

        if (updateResult.success) {
          const displayImage = getDisplayableImageUrl(newImageUrl);
          const updatedUser = { ...user, image: displayImage };
          setUser(updatedUser);
          localStorage.setItem('mis_user', JSON.stringify(updatedUser));
          return { success: true, image: displayImage };
        }
      }
      return { success: false, error: uploadResult.error || "Upload failed" };
    } catch (err) {
      console.error("Profile update error:", err);
      return { success: false, error: err.message };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('mis_user');
    setUser(null);
    navigate('/login');
    // Re-fetch users for next login
    preloadUsers();
  };

  const value = {
    user,
    login,
    logout,
    loading,
    updateProfileImage
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}