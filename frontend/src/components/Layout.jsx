import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { 
  FiHome, FiSearch, FiCheckCircle, FiPackage, FiSend, 
  FiList, FiUsers, FiLogOut, FiMenu, FiX, FiBell,
  FiFileText, FiDownload, FiUpload, FiClock, FiMap,
  FiRefreshCw, FiAlertTriangle
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../services/api';
import { useEffect } from 'react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      setUnreadCount(response.data.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getNavigationLinks = () => {
    const commonLinks = [
      { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
      { to: '/search', icon: FiSearch, label: 'Search Land' },
      { to: '/verify', icon: FiCheckCircle, label: 'Verify Title' },
      { to: '/my-transfers', icon: FiList, label: 'My Transfers' },
    ];

    const userLinks = [
      { to: '/user/parcels', icon: FiPackage, label: 'My Parcels' },
      { to: '/user/transfer', icon: FiSend, label: 'Transfer Land' },
      { to: '/user/transfers/incoming', icon: FiDownload, label: 'Incoming Transfers' },
      { to: '/user/transfers/outgoing', icon: FiUpload, label: 'Outgoing Transfers' },
      { to: '/user/transfers/history', icon: FiClock, label: 'Transfer History' },
    ];

    const countyAdminLinks = [
      { to: '/county-admin/dashboard', icon: FiHome, label: 'County Dashboard' },
      { to: '/county-admin/parcels', icon: FiMap, label: 'Manage Parcels' },
      { to: '/county-admin/title-deeds', icon: FiFileText, label: 'Title Deeds' },
      { to: '/county-admin/transfers', icon: FiRefreshCw, label: 'Transfer Requests' },
      { to: '/county-admin/fraud-review', icon: FiAlertTriangle, label: 'Fraud Review' },
      { to: '/county/approvals', icon: FiCheckCircle, label: 'Transfer Approvals' },
      { to: '/county/verification', icon: FiFileText, label: 'Document Verification' },
    ];

    const nlcAdminLinks = [
      { to: '/nlc/approvals', icon: FiCheckCircle, label: 'NLC Approvals' },
      { to: '/nlc/pending-admins', icon: FiUsers, label: 'Pending Admins' },
    ];

    if (user?.role === 'user') {
      return [...commonLinks, ...userLinks];
    } else if (user?.role === 'county_admin') {
      return [...commonLinks.slice(0, 2), ...countyAdminLinks];
    } else if (user?.role === 'nlc_admin') {
      return [...commonLinks.slice(0, 2), ...nlcAdminLinks];
    }

    return commonLinks;
  };

  const navigationLinks = getNavigationLinks();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white shadow-lg transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b flex items-center justify-between">
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-primary-600">Ardhisasa</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigationLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary-50 text-gray-700 hover:text-primary-600 transition-colors"
            >
              <link.icon size={20} />
              {sidebarOpen && <span>{link.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t">
          <Link
            to="/profile"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 mb-2"
          >
            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-gray-500 capitalize">
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
            )}
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
          >
            <FiLogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-800">
            Welcome, {user?.firstName}!
          </h2>
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2 rounded-lg hover:bg-gray-100"
          >
            <FiBell size={24} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
