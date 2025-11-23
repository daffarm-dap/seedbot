import React, { useState, useEffect } from "react";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { ForgotPasswordPage } from "./components/ForgotPasswordPage";
import { AdminDashboard } from "./components/AdminDashboard";
import { FarmerDashboard } from "./components/FarmerDashboard";
import { NewsPage } from "./components/NewsPage";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

// ✅ API backend
import api from "./services/api";

export default function App() {
  // Initialize currentPage from URL hash or default to "landing"
  const getInitialPage = () => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      // Map hash to page
      const hashToPage = {
        'home': 'landing',
        'landing': 'landing',
        'login': 'login',
        'news': 'news',
        'berita': 'news',
        'forgot-password': 'forgot-password',
        'admin': 'admin',
        'farmer': 'farmer',
      };
      return hashToPage[hash] || 'landing';
    }
    return "landing";
  };

  const [currentPage, setCurrentPage] = useState(getInitialPage());
  const [currentUser, setCurrentUser] = useState({
    username: "",
    fullName: "",
    role: null,
  });
  const [newsArticles, setNewsArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-logout timer (30 minutes)
  useEffect(() => {
    let inactivityTimer;
    const INACTIVITY_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds

    const resetTimer = () => {
      // Clear existing timer
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }

      // Only set timer if user is authenticated and on dashboard
      if (api.auth.isAuthenticated() && (currentPage === "admin" || currentPage === "farmer")) {
        inactivityTimer = setTimeout(() => {
          // Auto logout after 30 minutes of inactivity
          api.auth.logout();
          setCurrentUser({ username: "", fullName: "", role: null });
          setCurrentPage("landing");
          toast.error("Sesi Anda telah habis. Silakan masuk lagi.");
        }, INACTIVITY_TIME);
      }
    };

    // Reset timer on user activity
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    activityEvents.forEach((event) => {
      document.addEventListener(event, resetTimer, true);
    });

    // Initialize timer
    resetTimer();

    // Cleanup
    return () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      activityEvents.forEach((event) => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, [currentPage]);

  // Update URL hash when currentPage changes
  useEffect(() => {
    const pageToHash = {
      'landing': '#home',
      'login': '#login',
      'news': '#news',
      'forgot-password': '#forgot-password',
      'admin': '#admin',
      'farmer': '#farmer',
    };
    const hash = pageToHash[currentPage] || '#home';
    window.location.hash = hash;
  }, [currentPage]);

  // Listen for hash changes (e.g., browser back/forward button)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      
      // If user is authenticated and on dashboard, ignore #home hash
      // (let dashboard handle its own menu routing)
      if (api.auth.isAuthenticated()) {
        const user = api.auth.getCurrentUser();
        if (user) {
          // If hash is #home and user is authenticated, don't change page
          // Dashboard will handle menu routing
          if (hash === 'home') {
            // Check if we're already on a dashboard
            if (currentPage === 'admin' || currentPage === 'farmer') {
              return; // Don't change page, let dashboard handle it
            }
          }
          // If hash is admin/farmer menu hash, stay on current dashboard
          const adminMenuHashes = ['parameter-default', 'manajemen-user', 'kelola-petani', 'berita', 'ganti-password'];
          const farmerMenuHashes = ['dashboard', 'mapping', 'histori-robot', 'parameter', 'kendali-manual', 'ganti-password', 'dummy-data'];
          
          if ((user.role === 'admin' && adminMenuHashes.includes(hash)) ||
              (user.role === 'petani' && farmerMenuHashes.includes(hash))) {
            return; // Don't change page, let dashboard handle menu routing
          }
        }
      }
      
      // Map hash to page
      const hashToPage = {
        'home': 'landing',
        'landing': 'landing',
        'login': 'login',
        'news': 'news',
        'berita': 'news',
        'forgot-password': 'forgot-password',
        'admin': 'admin',
        'farmer': 'farmer',
      };
      const page = hashToPage[hash] || 'landing';
      
      // Only allow admin/farmer pages if authenticated
      if ((page === 'admin' || page === 'farmer') && !api.auth.isAuthenticated()) {
        setCurrentPage('landing');
        return;
      }
      
      setCurrentPage(page);
    };

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [currentPage]);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get initial page from hash
        const initialPage = getInitialPage();
        
        // Check if user is authenticated (has token)
        if (api.auth.isAuthenticated()) {
          // Try to validate token with backend
          try {
            const response = await api.auth.me();
            const userData = response.user;
            
            if (userData && userData.username && userData.role) {
              // Token is valid, restore user session
              setCurrentUser({
                username: userData.username,
                fullName: userData.fullName,
                role: userData.role,
              });
              
              // Update localStorage with latest user data from backend
              localStorage.setItem("user", JSON.stringify({
                id: userData.id,
                username: userData.username,
                fullName: userData.fullName,
                role: userData.role,
              }));
              
              // Redirect to appropriate dashboard only after successful validation
              const role = userData.role;
              // Check if initial page is admin/farmer and matches role
              if (initialPage === 'admin' && role === 'admin') {
                setCurrentPage('admin');
              } else if (initialPage === 'farmer' && role === 'petani') {
                setCurrentPage('farmer');
              } else {
                // If hash doesn't match role or is not admin/farmer, redirect to appropriate dashboard
                setCurrentPage(role === "admin" ? "admin" : "farmer");
              }
            } else {
              // Invalid user data from backend, clear storage
              console.warn("Invalid user data from backend");
              api.auth.logout();
              setCurrentPage(initialPage === 'news' ? 'news' : 'landing');
            }
          } catch (error) {
            // Token is invalid or expired, clear storage
            console.error("Token validation failed:", error);
            api.auth.logout();
            // If trying to access protected page, redirect to landing
            if (initialPage === 'admin' || initialPage === 'farmer') {
              setCurrentPage('landing');
            } else {
              setCurrentPage(initialPage);
            }
          }
        } else {
          // No token, check if user data exists in localStorage and clear it
          const storedUser = api.auth.getCurrentUser();
          if (storedUser) {
            // User data exists but no token, clear it
            api.auth.logout();
          }
          // If trying to access protected page, redirect to landing
          if (initialPage === 'admin' || initialPage === 'farmer') {
            setCurrentPage('landing');
          } else {
            setCurrentPage(initialPage);
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
        api.auth.logout();
        setCurrentPage('landing');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Load news articles on mount
  useEffect(() => {
    const loadNews = async () => {
      try {
        const response = await api.news.getAll();
        const newsData = response.news || response || [];
        setNewsArticles(newsData);
      } catch (error) {
        console.error("Gagal memuat berita:", error);
        // Set empty array on error
        setNewsArticles([]);
      }
    };
    loadNews();
  }, []);

  // ✅ LOGIN backend
  const handleLogin = async (username, password) => {
    const data = await api.auth.login(username, password);

    // Update user state
    setCurrentUser({
      username: data.user.username,
      fullName: data.user.fullName,
      role: data.user.role,
    });

    // Redirect to appropriate dashboard
    const role = data.user.role;
    setCurrentPage(role === "admin" ? "admin" : "farmer");

    toast.success(`Selamat datang, ${data.user.fullName}!`);
  };

  // ✅ LOGOUT backend
  const handleLogout = () => {
    api.auth.logout();
    setCurrentUser({ username: "", fullName: "", role: null });
    setCurrentPage("landing");
    toast.info("Anda telah keluar dari sistem");
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ✅ LANDING PAGE */}
      {currentPage === "landing" && (
        <LandingPage
          onNavigateToLogin={() => setCurrentPage("login")}
          onNavigateToNews={() => setCurrentPage("news")}
        />
      )}

      {/* ✅ LOGIN PAGE */}
      {currentPage === "login" && (
        <LoginPage
          onLogin={handleLogin}
          onBack={() => setCurrentPage("landing")}
          onNavigateToForgotPassword={() => setCurrentPage("forgot-password")}
        />
      )}

      {/* ✅ FORGOT PASSWORD PAGE */}
      {currentPage === "forgot-password" && (
        <ForgotPasswordPage
          onBack={() => setCurrentPage("landing")}
          onBackToLogin={() => setCurrentPage("login")}
        />
      )}

      {/* ✅ ADMIN DASHBOARD */}
      {currentPage === "admin" && (
        <AdminDashboard
          username={currentUser.fullName}
          onLogout={handleLogout}
        />
      )}

      {/* ✅ FARMER DASHBOARD */}
      {currentPage === "farmer" && (
        <FarmerDashboard
          username={currentUser.fullName || currentUser.username}
          onLogout={handleLogout}
        />
      )}

      {/* ✅ NEWS PAGE */}
      {currentPage === "news" && (
        <NewsPage
          onNavigateBack={() => setCurrentPage("landing")}
        />
      )}

      <Toaster position="top-right" />
    </>
  );
}
