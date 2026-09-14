import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

const authenticateUser = async (email, password) => {
  try {
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    if (!user) {
      throw new Error('Authentication failed');
    }

    // Check if user is admin
    const { data: adminData } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();

    if (adminData) {
      return {
        id: user.id,
        email: user.email,
        role: 'admin',
        ...adminData
      };
    }

    // Get customer data
    const { data: customerData } = await supabase
      .from('customers')
      .select('*')
      .eq('email', email)
      .single();

    return {
      id: user.id,
      email: user.email,
      role: 'customer',
      ...customerData
    };
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    const { data, error } = await supabase.functions.invoke('auth', {
      body: {
        action: 'sign-up',
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        middleName: userData.middleName,
        lastName: userData.lastName,
        mobile: userData.mobile,
        address: userData.address,
      },
    });

    if (error) {
      let message = error.message || 'Registration failed';

      if (error.context instanceof Response) {
        try {
          const response = await error.context.json();
          message = response.error || message;
        } catch {
          // Keep the SDK error when the function response is not JSON.
        }
      }

      throw new Error(message);
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    return Boolean(data?.user);
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const useAuth = () => {
  const { toast } = useToast();

  const login = async (email, password) => {
    try {
      const user = await authenticateUser(email, password);
      
      if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user));
        toast({
          title: "Success",
          description: "Logged in successfully",
        });
        return user;
      }
      throw new Error("Invalid credentials");
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear local storage first
      localStorage.removeItem("currentUser");

      // Sign out from Supabase
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      } catch (signOutError) {
        console.warn('Supabase sign out error:', signOutError);
      }

      // Show success message
      toast({
        title: "Success",
        description: "Logged out successfully",
      });

      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      
      // Show error message
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to logout properly",
      });
      
      // Force cleanup and redirect
      localStorage.removeItem("currentUser");
      window.location.href = '/';
    }
  };

  const getCurrentUser = () => {
    try {
      const user = localStorage.getItem("currentUser");
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      localStorage.removeItem("currentUser");
      return null;
    }
  };

  return { login, logout, getCurrentUser };
};
