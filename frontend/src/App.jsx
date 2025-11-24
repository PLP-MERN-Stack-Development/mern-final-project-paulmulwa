import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Button from './components/Button';

// Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import SearchLand from './pages/Land/SearchLand';
import VerifyTitle from './pages/Land/VerifyTitle';
import ParcelDetails from './pages/Land/ParcelDetails';
import MyParcels from './pages/User/MyParcels';
import InitiateTransfer from './pages/User/TransferLand';
import IncomingTransfers from './pages/User/IncomingTransfers';
import OutgoingTransfers from './pages/User/OutgoingTransfers';
import TransferHistory from './pages/User/TransferHistory';
import TransferDetails from './pages/Transfer/TransferDetails';
import MyTransfers from './pages/Transfer/MyTransfers';
import CountyApprovals from './pages/CountyAdmin/CountyApprovals';
import DocumentVerification from './pages/CountyAdmin/DocumentVerification';
import CountyAdminDashboard from './pages/CountyAdmin/CountyAdminDashboard';
import ManageParcels from './pages/CountyAdmin/ManageParcels';
import CountyTitleDeeds from './pages/CountyAdmin/CountyTitleDeeds';
import CountyTransfers from './pages/CountyAdmin/CountyTransfers';
import FraudReview from './pages/CountyAdmin/FraudReview';
import NLCApprovals from './pages/NLCAdmin/NLCApprovals';
import PendingAdmins from './pages/NLCAdmin/PendingAdmins';
import ManageCountyAdmins from './pages/NLCAdmin/ManageCountyAdmins';
import AllTitleDeeds from './pages/NLCAdmin/AllTitleDeeds';
import ManageNLCAdmins from './pages/SuperAdmin/ManageNLCAdmins';
import Profile from './pages/Profile/Profile';
import NotFound from './pages/NotFound';
// Public Pages
import Home from './pages/Public/Home';
import About from './pages/Public/About';
import Services from './pages/Public/Services';
import Contact from './pages/Public/Contact';

// Protected Route Component
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (user.role === 'county_admin' && !user.isApproved) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="max-w-md p-8 bg-white rounded-lg shadow-lg text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-yellow-100 p-3">
              <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Pending Approval</h2>
          <p className="text-gray-600 mb-6">
            Your County Admin account is awaiting approval from the NLC Admin. 
            You will be notified once your account is approved.
          </p>
          <Button 
            onClick={logout}
            variant="outline"
            className="w-full"
          >
            Logout
          </Button>
        </div>
      </div>
    );
  }

  return children;
};

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/home" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<Services />} />
      <Route path="/contact" element={<Contact />} />

      {/* Public Routes */}
      <Route 
        path="/login" 
        element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={user ? <Navigate to="/dashboard" replace /> : <Register />} 
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <SearchLand />
          </ProtectedRoute>
        }
      />

      <Route
        path="/verify"
        element={
          <ProtectedRoute>
            <VerifyTitle />
          </ProtectedRoute>
        }
      />

      <Route
        path="/parcels/:id"
        element={
          <ProtectedRoute>
            <ParcelDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/user/parcels"
        element={
          <ProtectedRoute roles={['user']}>
            <MyParcels />
          </ProtectedRoute>
        }
      />

      <Route
        path="/user/my-parcels"
        element={
          <ProtectedRoute roles={['user']}>
            <MyParcels />
          </ProtectedRoute>
        }
      />

      <Route
        path="/user/transfer"
        element={
          <ProtectedRoute roles={['user']}>
            <InitiateTransfer />
          </ProtectedRoute>
        }
      />

      <Route
        path="/user/transfers/incoming"
        element={
          <ProtectedRoute roles={['user']}>
            <IncomingTransfers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/user/transfers/outgoing"
        element={
          <ProtectedRoute roles={['user']}>
            <OutgoingTransfers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/user/transfers/history"
        element={
          <ProtectedRoute roles={['user']}>
            <TransferHistory />
          </ProtectedRoute>
        }
      />

      <Route
        path="/transfers/:id"
        element={
          <ProtectedRoute>
            <TransferDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-transfers"
        element={
          <ProtectedRoute>
            <MyTransfers />
          </ProtectedRoute>
        }
      />

      {/* County Admin Routes */}
      <Route
        path="/county-admin/dashboard"
        element={
          <ProtectedRoute roles={['county_admin', 'super_admin']}>
            <CountyAdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/county-admin/parcels"
        element={
          <ProtectedRoute roles={['county_admin', 'super_admin']}>
            <ManageParcels />
          </ProtectedRoute>
        }
      />

      <Route
        path="/county-admin/title-deeds"
        element={
          <ProtectedRoute roles={['county_admin', 'super_admin']}>
            <CountyTitleDeeds />
          </ProtectedRoute>
        }
      />

      <Route
        path="/county-admin/transfers"
        element={
          <ProtectedRoute roles={['county_admin', 'super_admin']}>
            <CountyTransfers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/county-admin/fraud-review"
        element={
          <ProtectedRoute roles={['county_admin', 'super_admin']}>
            <FraudReview />
          </ProtectedRoute>
        }
      />

      <Route
        path="/county/approvals"
        element={
          <ProtectedRoute roles={['county_admin', 'super_admin']}>
            <CountyApprovals />
          </ProtectedRoute>
        }
      />

      <Route
        path="/county/verification"
        element={
          <ProtectedRoute roles={['county_admin', 'super_admin']}>
            <DocumentVerification />
          </ProtectedRoute>
        }
      />

      {/* NLC Admin Routes */}
      <Route
        path="/nlc/approvals"
        element={
          <ProtectedRoute roles={['nlc_admin', 'super_admin']}>
            <NLCApprovals />
          </ProtectedRoute>
        }
      />

      <Route
        path="/nlc/pending-admins"
        element={
          <ProtectedRoute roles={['nlc_admin', 'super_admin']}>
            <PendingAdmins />
          </ProtectedRoute>
        }
      />

      <Route
        path="/nlc/manage-county-admins"
        element={
          <ProtectedRoute roles={['nlc_admin', 'super_admin']}>
            <ManageCountyAdmins />
          </ProtectedRoute>
        }
      />

      <Route
        path="/nlc/all-title-deeds"
        element={
          <ProtectedRoute roles={['nlc_admin', 'super_admin']}>
            <AllTitleDeeds />
          </ProtectedRoute>
        }
      />

      {/* Super Admin Routes */}
      <Route
        path="/super-admin/manage-nlc"
        element={
          <ProtectedRoute roles={['super_admin']}>
            <ManageNLCAdmins />
          </ProtectedRoute>
        }
      />

      {/* Profile */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Default and 404 */}
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
