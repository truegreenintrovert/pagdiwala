import React, { useEffect, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from "@/lib/theme-provider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import { ProductList } from "@/components/ProductList";
import { SignInForm } from "@/components/SignInForm";
import { SignUpForm } from "@/components/SignUpForm";
import { PasswordRecovery } from "@/components/PasswordRecovery";
import { ResetPassword } from "@/components/ResetPassword";
import { Cart } from "@/components/Cart";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { ProductManagement } from "@/components/admin/ProductManagement";
import { PolicyManagement } from "@/components/admin/PolicyManagement";
import { OrdersManagement } from "@/components/admin/OrdersManagement";
import { MessagesManagement } from "@/components/admin/MessagesManagement";
import { UsersManagement } from "@/components/admin/UsersManagement";
import { SocialMediaManagement } from "@/components/admin/SocialMediaManagement";
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
    <HelmetProvider>
      <ThemeProvider>
        <div className="min-h-screen flex flex-col bg-background text-foreground">
          <Navbar />
          <main className="flex-grow">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<ProductList />} />
                <Route path="/signin" element={<SignInForm />} />
                <Route path="/signup" element={<SignUpForm />} />
                <Route path="/recover-password" element={<PasswordRecovery />} />
                <Route path="/reset-password" element={<ResetPassword />} />
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
                      <AdminLayout />
                    </AdminRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<ProductManagement />} />
                  <Route path="policies" element={<PolicyManagement />} />
                  <Route path="orders" element={<OrdersManagement />} />
                  <Route path="messages" element={<MessagesManagement />} />
                  <Route path="users" element={<UsersManagement />} />
                  <Route path="social-media" element={<SocialMediaManagement />} />
                </Route>
                <Route path="/contact" element={<ContactForm />} />
                <Route path="/terms" element={<Policy type="terms" />} />
                <Route path="/privacy" element={<Policy type="privacy" />} />
                <Route path="/refund" element={<Policy type="refund" />} />
                <Route path="/cancellation" element={<Policy type="cancellation" />} />
                <Route path="/shipping" element={<Policy type="shipping" />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
          <Toaster />
        </div>
      </ThemeProvider>
    </HelmetProvider>
  );
}
