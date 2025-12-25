import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import { CartProvider } from './contexts/CartContext';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';
import Suggestions from './components/Suggestions';
import Footer from './components/Footer';
import Store from './components/Store';
import Customise from './components/Customise';
import ReadyMade from './components/ReadyMade';
import { Toaster } from 'react-hot-toast';

// Lazy load components
const Login = lazy(() => import('./components/Login'));
const Profile = lazy(() => import('./components/Profile'));
const LandingPage = lazy(() => import('./components/LandingPage'));
const Designer = lazy(() => import('./components/Designer'));
const Cart = lazy(() => import('./components/Cart'));
const Contact = lazy(() => import('./components/Contact'));
const OTPVerification = lazy(() => import('./components/OTPVerification'));
const Privacy = lazy(() => import('./components/PrivacyPolicy'));
const Terms = lazy(() => import('./components/TermsOfService'));

// Loading spinner
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
  </div>
);

// Configure axios to send credentials
axios.defaults.withCredentials = true;

// Custom Link component
const Link = ({ to, children, ...props }) => {
  const isInternalLink = to && !to.startsWith('http');

  return isInternalLink ? (
    <RouterLink to={to} {...props}>{children}</RouterLink>
  ) : (
    <a href={to} {...props}>{children}</a>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/api/auth/user');
      setUser(response.data.success ? response.data.user : null);
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setAuthChecked(true);
    }
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  if (!authChecked) return <PageLoader />;

  return (
    <ErrorBoundary>
      <Toaster position="bottom-right" reverseOrder={false} />
      <CartProvider>
        <Router>
          {/* MAIN LAYOUT */}
          <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">

            {/* NAVBAR */}
            <Navbar user={user} onLogout={handleLogout} />

            {/* PAGE CONTENT */}
            <main className="flex-1">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<LandingPage user={user} />} />

                  <Route
                    path="/login"
                    element={
                      user ? <Navigate to="/profile" replace /> :
                      <Login onLoginSuccess={handleLoginSuccess} />
                    }
                  />

                  <Route
                    path="/otp-verification"
                    element={
                      user ? <Navigate to="/profile" replace /> :
                      <OTPVerification />
                    }
                  />

                  <Route
                    path="/profile"
                    element={
                      user ? <Profile user={user} updateUser={updateUser} /> :
                      <Navigate to="/login" replace />
                    }
                  />

                  <Route
                    path="/designer"
                    element={
                      user ? <Designer user={user} /> :
                      <Navigate to="/login" replace />
                    }
                  />

                  <Route
                    path="/suggestion"
                    element={
                      user ? <Suggestions user={user} /> :
                      <Navigate to="/login" replace />
                    }
                  />
                  <Route
                    path="/store"
                    element={
                      user ? <Store user={user} /> :
                      <Navigate to="/store" replace />
                    }
                  />
                  <Route
                    path="/customise"
                    element={
                      user ? <Customise user={user} /> :
                      <Navigate to="/customise" replace />
                    }
                  />
                  <Route
                    path="/ready-made"
                    element={
                      user ? <ReadyMade user={user} /> :
                      <Navigate to="/ready-made" replace />
                    }
                  />
                  <Route
                    path="/cart"
                    element={
                      user ? <Cart user={user} /> :
                      <Navigate to="/login" replace />
                    }
                  />


                  <Route path="/contact" element={<Contact />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </main>

            {/* FOOTER */}
            <Footer/>

          </div>
        </Router>
      </CartProvider>
    </ErrorBoundary>
  );
}

export default App;
