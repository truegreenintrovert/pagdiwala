import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getOrders, updateOrderStatus } from "@/lib/orders";
import { ORDER_STATUS } from "@/lib/constants";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Mail, Phone, User, Package, ShoppingCart, MessageSquare, Users } from "lucide-react";

export function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load all data in parallel
      const [ordersData, messagesData, usersData, productsData] = await Promise.all([
        getOrders(),
        loadMessages(),
        loadUsers(),
        loadProducts()
      ]);

      setOrders(ordersData || []);
      setMessages(messagesData || []);
      setUsers(usersData || []);
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dashboard data"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  };

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  };

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*');

    if (error) throw error;
    return data;
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      let updateData = {
        status,
        delivery_date: null
      };

      if (status === ORDER_STATUS.APPROVED) {
        if (!deliveryDate) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Please select a delivery date",
          });
          return;
        }
        updateData.delivery_date = new Date(deliveryDate).toISOString();
      }

      await updateOrderStatus(orderId, updateData);
      toast({
        title: "Success",
        description: `Order ${status} successfully`,
      });
      loadDashboardData();
      setSelectedOrder(null);
      setDeliveryDate("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case ORDER_STATUS.PENDING:
        return "bg-yellow-100 text-yellow-800";
      case ORDER_STATUS.APPROVED:
        return "bg-green-100 text-green-800";
      case ORDER_STATUS.SHIPPED:
        return "bg-blue-100 text-blue-800";
      case ORDER_STATUS.DELIVERED:
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(order => order.status !== ORDER_STATUS.DELIVERED).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Messages */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {messages.slice(0, 5).map((message) => (
              <Card key={message.id} className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-semibold">{message.name}</h4>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(message.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={`mailto:${message.email}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {message.email}
                    </a>
                  </div>
                  <p className="text-foreground bg-muted p-3 rounded-lg border border-border mt-2">
                    {message.message}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.slice(0, 5).map((order) => (
              <Card key={order.id} className="p-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">Order #{order.id}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Amount: ₹{order.total_amount}
                    </p>
                    <p className="text-sm text-gray-500">
                      Contact: {order.mobile_number}
                    </p>
                    {order.delivery_date && (
                      <p className="text-sm text-gray-500">
                        Delivery Date: {new Date(order.delivery_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 w-full md:w-auto">
                    {order.status === ORDER_STATUS.PENDING && (
                      <div className="space-y-2">
                        <Label htmlFor={`delivery-date-${order.id}`}>Delivery Date</Label>
                        <Input
                          id={`delivery-date-${order.id}`}
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          value={deliveryDate}
                          onChange={(e) => setDeliveryDate(e.target.value)}
                          className="mb-2"
                        />
                        <Button
                          onClick={() => handleStatusUpdate(order.id, ORDER_STATUS.APPROVED)}
                          className="w-full md:w-auto"
                        >
                          Approve Order
                        </Button>
                      </div>
                    )}
                    {order.status === ORDER_STATUS.APPROVED && (
                      <Button
                        onClick={() => handleStatusUpdate(order.id, ORDER_STATUS.SHIPPED)}
                        className="w-full md:w-auto"
                      >
                        Mark as Shipped
                      </Button>
                    )}
                    {order.status === ORDER_STATUS.SHIPPED && (
                      <Button
                        onClick={() => handleStatusUpdate(order.id, ORDER_STATUS.DELIVERED)}
                        className="w-full md:w-auto"
                      >
                        Mark as Delivered
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Users */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.slice(0, 5).map((user) => (
              <Card key={user.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-semibold">
                      {user.first_name} {user.middle_name} {user.last_name}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Mail className="h-4 w-4" />
                      <span>{user.email}</span>
                    </div>
                    {user.mobile_number && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Phone className="h-4 w-4" />
                        <span>{user.mobile_number}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    Joined: {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
