import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/AuthContext';
import Navigation from '@/components/Navigation';
import ScrollToTop from '@/components/ScrollToTop';
import LoadingFallback from '@/components/LoadingFallback';
import { initPerformanceMonitoring } from '@/utils/performanceReporter';
import { setupScriptLoader } from '@/utils/scriptLoader';

// Tidio Chat Integration - Lazy Loaded logic inside
import TidioScript from '@/components/TidioScript';
import TidioDebugPanel from '@/components/TidioDebugPanel';

// Eager Pages (Critical Path)
import HomePage from '@/pages/HomePage';

// Lazy Pages
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const SignupPage = lazy(() => import('@/pages/SignupPage'));
const PropertyListPage = lazy(() => import('@/pages/PropertyListPage'));
const PropertyDetailPage = lazy(() => import('@/pages/PropertyDetailPage'));
const PropertyMapPage = lazy(() => import('@/pages/PropertyMapPage'));
const NeighborhoodPage = lazy(() => import('@/pages/NeighborhoodPage'));
const BlogPage = lazy(() => import('@/pages/BlogPage'));
const BlogDetailPage = lazy(() => import('@/pages/BlogDetailPage'));
const UserProfilePage = lazy(() => import('@/pages/UserProfilePage'));
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const BrokerDashboard = lazy(() => import('@/pages/BrokerDashboard'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const ProtectedRoute = lazy(() => import('@/components/ProtectedRoute'));

// Initialize monitoring
initPerformanceMonitoring();

function App() {
  useEffect(() => {
    // Initialize deferred scripts
    setupScriptLoader();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <TidioScript />
        <TidioDebugPanel />
        
        <div className="min-h-screen bg-[#f5f7fa] font-sans">
          <Navigation />
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Home is Eager */}
              <Route path="/" element={<HomePage />} />
              
              {/* All other routes Lazy */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/cadastro" element={<SignupPage />} />
              <Route path="/imoveis" element={<PropertyListPage />} />
              <Route path="/properties/map" element={<PropertyMapPage />} />
              <Route path="/imovel/:slug" element={<PropertyDetailPage />} />
              <Route path="/neighborhood/:neighborhoodSlug" element={<NeighborhoodPage />} /> 
              <Route path="/search" element={<SearchPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogDetailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              
              <Route path="/perfil" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
              <Route path="/favoritos" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
              <Route path="/broker/dashboard" element={<ProtectedRoute><BrokerDashboard /></ProtectedRoute>} />
              <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard initialTab="properties" /></ProtectedRoute>} />
              <Route path="/admin/seo-management" element={<ProtectedRoute><AdminDashboard initialTab="seo" /></ProtectedRoute>} />
              
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </Suspense>
          <ScrollToTop />
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;