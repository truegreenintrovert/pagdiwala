
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export function UserProfile() {
  const { getCurrentUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [user, setUser] = useState(getCurrentUser());
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    mobile: "",
    address: ""
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        console.log('Current user:', user);
        
        if (user.role === 'admin') {
          // Fetch fresh admin data
          const { data: adminData, error: adminError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('email', user.email)
            .single();

          if (adminError) {
            console.error('Admin data fetch error:', adminError);
            throw adminError;
          }

          console.log('Fetched admin data:', adminData);

          // Update form data with admin data
          setFormData({
            firstName: adminData.first_name || "",
            middleName: adminData.middle_name || "",
            lastName: adminData.last_name || "",
            email: user.email,
            mobile: adminData.mobile_number || "",
            address: adminData.address || ""
          });
        } else {
          // For regular users, use existing data
          setFormData({
            firstName: user.first_name || "",
            middleName: user.middle_name || "",
            lastName: user.last_name || "",
            email: user.email,
            mobile: user.mobile_number || "",
            address: user.address || ""
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load user data"
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadUserData();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      // Validate required fields
      if (!formData.firstName.trim()) {
        throw new Error("First name is required");
      }
      if (!formData.lastName.trim()) {
        throw new Error("Last name is required");
      }
      if (!formData.mobile.trim()) {
        throw new Error("Mobile number is required");
      }
      if (!formData.mobile.match(/^[0-9]{10}$/)) {
        throw new Error("Please enter a valid 10-digit mobile number");
      }
      if (!formData.address.trim()) {
        throw new Error("Address is required");
      }

      const updateData = {
        first_name: formData.firstName,
        middle_name: formData.middleName,
        last_name: formData.lastName,
        mobile_number: formData.mobile,
        address: formData.address,
        updated_at: new Date().toISOString()
      };

      console.log('Updating profile with data:', updateData);

      if (user.role === 'admin') {
        console.log('Updating admin profile...');
        
        // Update admin_users table
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .update(updateData)
          .eq('email', user.email)
          .select()
          .single();

        if (adminError) {
          console.error('Admin update error:', adminError);
          throw adminError;
        }

        console.log('Admin profile updated successfully:', adminData);

        // Update local storage and state
        const updatedUser = {
          ...user,
          ...updateData
        };
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        setUser(updatedUser);
      } else {
        console.log('Updating customer profile...');
        
        // Update customers table
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .update(updateData)
          .eq('id', user.id)
          .select()
          .single();

        if (customerError) {
          console.error('Customer update error:', customerError);
          throw customerError;
        }

        console.log('Customer profile updated successfully:', customerData);

        // Update local storage and state
        const updatedUser = {
          ...user,
          ...updateData
        };
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        setUser(updatedUser);
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update profile",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-4"
    >
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">
            {user.role === 'admin' ? 'Admin Profile' : 'User Profile'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                required
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  firstName: e.target.value
                }))}
                placeholder="Enter your first name"
                className="shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="middleName">Middle Name</Label>
              <Input
                id="middleName"
                value={formData.middleName}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  middleName: e.target.value
                }))}
                placeholder="Enter your middle name (optional)"
                className="shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                required
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  lastName: e.target.value
                }))}
                placeholder="Enter your last name"
                className="shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-gray-100 shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number *</Label>
              <Input
                id="mobile"
                type="tel"
                required
                pattern="[0-9]{10}"
                value={formData.mobile}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  mobile: e.target.value
                }))}
                placeholder="Enter 10-digit mobile number"
                className="shadow-sm"
              />
              <p className="text-xs text-gray-500">
                Enter 10-digit mobile number without spaces or special characters
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                required
                value={formData.address}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  address: e.target.value
                }))}
                placeholder="Enter your complete address"
                className="shadow-sm"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full shadow-lg hover:shadow-xl transition-shadow duration-200"
              disabled={updating}
            >
              {updating ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Updating...
                </span>
              ) : (
                'Update Profile'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
