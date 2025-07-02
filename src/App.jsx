
import React, { useEffect, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/lib/theme-provider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import { ProductList } from "@/components/ProductList";
import { SignInForm } from "@/components/SignInForm";
import { SignUpForm } from "@/components/SignUpForm";
import { Cart } from "@/components/Cart";
import { AdminDashboard } from "@/components/AdminDashboard";
import { ContactForm } from "@/components/ContactForm";
import { OrderHistory } from "@/components/OrderHistory";
import { UserProfile } from "@/components/UserProfile";
import { Policy } from "@/components/Policy";
import { useAuth } from "@/lib/auth";
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

// Loading component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { getCurrentUser } = useAuth();
  const user = getCurrentUser();
  
  if (!user) {
    return <Navigate to="/signin" />;
  }
  
  return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { getCurrentUser } = useAuth();
  const user = getCurrentUser();
  
  if (!user || user.role !== "admin") {
    return <Navigate to="/" />;
  }
  
  return children;
};

export default function App() {
  useEffect(() => {
    const initApp = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          await StatusBar.setBackgroundColor({ color: '#6D28D9' });
          await SplashScreen.hide();
        } catch (err) {
          console.error('Error initializing app:', err);
        }
      }
    };

    initApp();
  }, []);

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-grow">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<ProductList />} />
              <Route path="/signin" element={<SignInForm />} />
              <Route path="/signup" element={<SignUpForm />} />
              <Route 
                path="/cart" 
                element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/orders" 
                element={
                  <ProtectedRoute>
                    <OrderHistory />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } 
              />
              <Route path="/contact" element={<ContactForm />} />
              <Route path="/terms" element={<Policy type="terms" />} />
              <Route path="/privacy" element={<Policy type="privacy" />} />
              <Route path="/refund" element={<Policy type="refund" />} />
              <Route path="/cancellation" element={<Policy type="cancellation" />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
