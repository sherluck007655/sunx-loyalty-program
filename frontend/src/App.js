import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminLoginPage from './pages/AdminLoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';


// Installer Pages
import InstallerDashboard from './pages/installer/Dashboard';
import InstallerProfile from './pages/installer/Profile';
import PasswordSettings from './pages/PasswordSettings';
import SerialNumbers from './pages/installer/SerialNumbers';
import AddSerial from './pages/installer/AddSerial';
import PaymentHistory from './pages/installer/PaymentHistory';
import Promotions from './pages/installer/Promotions';
import PromotionProgress from './pages/installer/PromotionProgress';
import PromotionHistory from './pages/installer/PromotionHistory';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminInstallers from './pages/admin/Installers';
import AdminPayments from './pages/admin/Payments';
import AdminSerialNumbers from './pages/admin/SerialNumbers';
import AdminPromotions from './pages/admin/Promotions';
import AdminPromotionDetails from './pages/admin/PromotionDetails';
import AdminAnalytics from './pages/admin/Analytics';
import AdminReports from './pages/admin/Reports';
import AdminSettings from './pages/admin/Settings';
import AdminActivities from './pages/admin/Activities';
import AdminNotifications from './pages/admin/Notifications';
import Chat from './pages/Chat';
import AdminValidSerials from './pages/admin/ValidSerials';
import BackupManagement from './pages/admin/BackupManagement';

// Training & Download Pages
import Training from './pages/Training';
import TrainingCategory from './pages/TrainingCategory';
import VideoPlayer from './pages/VideoPlayer';
import DownloadCenter from './pages/DownloadCenter';
import DocumentCategory from './pages/DocumentCategory';

// Error Pages
import NotFound from './pages/NotFound';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-200">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />


              {/* Protected Installer Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <InstallerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <InstallerProfile />
                </ProtectedRoute>
              } />
              <Route path="/password-settings" element={
                <ProtectedRoute>
                  <PasswordSettings />
                </ProtectedRoute>
              } />
              <Route path="/serials" element={
                <ProtectedRoute>
                  <SerialNumbers />
                </ProtectedRoute>
              } />
              <Route path="/serials/add" element={
                <ProtectedRoute>
                  <AddSerial />
                </ProtectedRoute>
              } />
              <Route path="/payments" element={
                <ProtectedRoute>
                  <PaymentHistory />
                </ProtectedRoute>
              } />
              <Route path="/promotions" element={
                <ProtectedRoute>
                  <Promotions />
                </ProtectedRoute>
              } />
              <Route path="/promotions/:promotionId/progress" element={
                <ProtectedRoute>
                  <PromotionProgress />
                </ProtectedRoute>
              } />
              <Route path="/promotions/history" element={
                <ProtectedRoute>
                  <PromotionHistory />
                </ProtectedRoute>
              } />

              {/* Training & Download Center Routes */}
              <Route path="/training" element={<Training />} />
              <Route path="/training/category/:categoryId" element={<TrainingCategory />} />
              <Route path="/training/video/:videoId" element={<VideoPlayer />} />
              <Route path="/downloads" element={<DownloadCenter />} />
              <Route path="/downloads/category/:categoryId" element={<DocumentCategory />} />

              {/* Protected Admin Routes */}
              <Route path="/admin/dashboard" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              <Route path="/admin/installers" element={
                <AdminRoute>
                  <AdminInstallers />
                </AdminRoute>
              } />
              <Route path="/admin/payments" element={
                <AdminRoute>
                  <AdminPayments />
                </AdminRoute>
              } />
              <Route path="/admin/serials" element={
                <AdminRoute>
                  <AdminSerialNumbers />
                </AdminRoute>
              } />
              <Route path="/admin/valid-serials" element={
                <AdminRoute>
                  <AdminValidSerials />
                </AdminRoute>
              } />
              <Route path="/admin/promotions" element={
                <AdminRoute>
                  <AdminPromotions />
                </AdminRoute>
              } />
              <Route path="/admin/promotions/:promotionId" element={
                <AdminRoute>
                  <AdminPromotionDetails />
                </AdminRoute>
              } />
              <Route path="/admin/analytics" element={
                <AdminRoute>
                  <AdminAnalytics />
                </AdminRoute>
              } />
              <Route path="/admin/reports" element={
                <AdminRoute>
                  <AdminReports />
                </AdminRoute>
              } />
              <Route path="/admin/settings" element={
                <AdminRoute>
                  <AdminSettings />
                </AdminRoute>
              } />
              <Route path="/admin/activities" element={
                <AdminRoute>
                  <AdminActivities />
                </AdminRoute>
              } />
              <Route path="/admin/notifications" element={
                <AdminRoute>
                  <AdminNotifications />
                </AdminRoute>
              } />

              {/* Backup Management Route - Admin only */}
              <Route path="/admin/backup" element={
                <AdminRoute>
                  <BackupManagement />
                </AdminRoute>
              } />

              {/* Chat Route - Admin only */}
              <Route path="/chat" element={
                <AdminRoute>
                  <Chat />
                </AdminRoute>
              } />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>

            {/* Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--toast-bg)',
                  color: 'var(--toast-color)',
                  border: '1px solid var(--toast-border)',
                },
                success: {
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#ffffff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#ffffff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
