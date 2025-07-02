
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getOrders, updateOrderStatus } from "@/lib/orders";
import { ORDER_STATUS } from "@/lib/constants";
import { useToast } from "@/components/ui/use-toast";

export function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data || []);
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
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto p-4"
    >
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Order Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pending Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {orders.filter(order => order.status === ORDER_STATUS.PENDING).length}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Approved Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {orders.filter(order => order.status === ORDER_STATUS.APPROVED).length}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Shipped Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {orders.filter(order => order.status === ORDER_STATUS.SHIPPED).length}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Delivered Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {orders.filter(order => order.status === ORDER_STATUS.DELIVERED).length}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Order List */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Recent Orders</h3>
              <div className="space-y-4">
                {orders.map((order) => (
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
                          Customer: {order.customer_id}
                        </p>
                        <p className="text-sm text-gray-500">
                          Amount: ₹{order.total_amount}
                        </p>
                        <p className="text-sm text-gray-500">
                          Address: {order.shipping_address}
                        </p>
                        <p className="text-sm text-gray-500">
                          Mobile: {order.mobile_number}
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

                    {/* Order Items */}
                    <div className="mt-4">
                      <h5 className="font-semibold mb-2">Order Items:</h5>
                      <div className="space-y-2">
                        {order.order_items?.map((item) => (
                          <div key={item.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
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
                                <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                              </div>
                            </div>
                            <p className="font-medium">₹{item.price * item.quantity}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
