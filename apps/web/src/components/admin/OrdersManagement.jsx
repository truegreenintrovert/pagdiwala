import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getOrders, updateOrderStatus } from "@/lib/orders";
import { ORDER_STATUS } from "@/lib/constants";
import { useToast } from "@/components/ui/use-toast";
import { Search, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function OrdersManagement() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [filters, setFilters] = useState({
    name: "",
    mobile: "",
    email: ""
  });
  const [customerDetails, setCustomerDetails] = useState({});

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [filters, orders]);

  const loadOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data || []);
      setFilteredOrders(data || []);

      // Fetch customer details for all orders
      const customerIds = [...new Set(data.map(order => order.customer_id))];
      const { data: customers, error } = await supabase
        .from('customers')
        .select('id, first_name, middle_name, last_name, email, mobile_number')
        .in('id', customerIds);

      if (error) throw error;

      const customerMap = {};
      customers.forEach(customer => {
        customerMap[customer.id] = customer;
      });
      setCustomerDetails(customerMap);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load orders",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    if (filters.name.trim()) {
      filtered = filtered.filter(order => {
        const customer = customerDetails[order.customer_id];
        if (!customer) return false;
        const fullName = `${customer.first_name} ${customer.middle_name || ''} ${customer.last_name}`.toLowerCase();
        return fullName.includes(filters.name.toLowerCase());
      });
    }

    if (filters.mobile.trim()) {
      filtered = filtered.filter(order => {
        const customer = customerDetails[order.customer_id];
        return customer?.mobile_number?.includes(filters.mobile);
      });
    }

    if (filters.email.trim()) {
      filtered = filtered.filter(order => {
        const customer = customerDetails[order.customer_id];
        return customer?.email?.toLowerCase().includes(filters.email.toLowerCase());
      });
    }

    setFilteredOrders(filtered);
  };

  const clearFilters = () => {
    setFilters({
      name: "",
      mobile: "",
      email: ""
    });
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      let updateData = { status };

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
      loadOrders();
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
      <h1 className="text-3xl font-bold">Orders Management</h1>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filter Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nameFilter">Customer Name</Label>
              <Input
                id="nameFilter"
                placeholder="Search by name..."
                value={filters.name}
                onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobileFilter">Mobile Number</Label>
              <Input
                id="mobileFilter"
                placeholder="Search by mobile..."
                value={filters.mobile}
                onChange={(e) => setFilters(prev => ({ ...prev, mobile: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailFilter">Email</Label>
              <Input
                id="emailFilter"
                placeholder="Search by email..."
                value={filters.email}
                onChange={(e) => setFilters(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
          </div>
          {(filters.name || filters.mobile || filters.email) && (
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {filteredOrders.filter(order => order.status === ORDER_STATUS.PENDING).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Approved Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {filteredOrders.filter(order => order.status === ORDER_STATUS.APPROVED).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Shipped Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {filteredOrders.filter(order => order.status === ORDER_STATUS.SHIPPED).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Delivered Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {filteredOrders.filter(order => order.status === ORDER_STATUS.DELIVERED).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Order List */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No orders found</p>
            ) : (
              filteredOrders.map((order) => (
                <Card key={order.id} className="p-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">Order #{order.id}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      {customerDetails[order.customer_id] && (
                        <>
                          <p className="text-sm text-muted-foreground">
                            Customer: {customerDetails[order.customer_id].first_name} {customerDetails[order.customer_id].middle_name} {customerDetails[order.customer_id].last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Email: {customerDetails[order.customer_id].email}
                          </p>
                        </>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Amount: ₹{order.total_amount}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Contact: {order.mobile_number}
                      </p>
                      {order.delivery_date && (
                        <p className="text-sm text-muted-foreground">
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

                  {/* Order Items */}
                  <div className="mt-4">
                    <h5 className="font-semibold mb-2">Order Items:</h5>
                    <div className="space-y-2">
                      {order.order_items?.map((item) => (
                        <div key={item.id} className="flex justify-between items-center bg-muted border border-border p-2 rounded">
                          <div className="flex items-center gap-4">
                            {item.product?.image_url && (
                              <img
                                src={item.product.image_url}
                                alt={item.product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div>
                              <p className="font-medium">{item.product?.name}</p>
                              <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                            </div>
                          </div>
                          <p className="font-medium">₹{item.price * item.quantity}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
