
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, ShoppingBag, Truck, Phone, CreditCard, MapPin } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getCart, syncCart } from "@/lib/cart";
import { createOrder } from "@/lib/orders";

export function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    shipping_address: "",
    mobile_number: ""
  });
  const { getCurrentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    const loadCart = async () => {
      try {
        const items = await getCart(user.id);
        setCartItems(items);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load cart items",
        });
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [user.id, toast]);

  const removeFromCart = async (productId) => {
    try {
      const updatedCart = cartItems.filter(item => item.id !== productId);
      setCartItems(updatedCart);
      await syncCart(user.id, updatedCart);
      toast({
        title: "Success",
        description: "Item removed from cart",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove item",
      });
    }
  };

  const handleCheckout = async () => {
    try {
      // Validate checkout data
      if (!checkoutData.shipping_address.trim()) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please enter shipping address",
        });
        return;
      }

      if (!checkoutData.mobile_number.trim() || !/^\d{10}$/.test(checkoutData.mobile_number)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please enter a valid 10-digit mobile number",
        });
        return;
      }

      setCheckingOut(true);
      const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const orderData = {
        userId: user.id,
        items: cartItems.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        total: total,
        shipping_address: checkoutData.shipping_address,
        mobile_number: checkoutData.mobile_number
      };

      const order = await createOrder(orderData);
      
      if (!order) {
        throw new Error("Failed to create order");
      }

      // Clear cart after successful order
      await syncCart(user.id, []);
      setCartItems([]);
      
      toast({
        title: "Success",
        description: "Order placed successfully! You will receive the delivery details soon.",
      });
      
      navigate("/orders");
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to place order",
      });
    } finally {
      setCheckingOut(false);
    }
  };

  const handleContinueShopping = () => {
    navigate("/");
  };

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading cart...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-4"
    >
      <Card>
        <CardHeader>
          <CardTitle>Your Cart</CardTitle>
        </CardHeader>
        <CardContent>
          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <ShoppingBag className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-6">Your cart is empty</p>
              <Button 
                onClick={handleContinueShopping}
                className="flex items-center gap-2"
              >
                <ShoppingBag className="h-5 w-5" />
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                        <p className="font-medium">₹{item.price}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
              </div>

              {showCheckoutForm && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8"
                >
                  <Card className="bg-gray-50">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Delivery Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Shipping Address Section */}
                      <div className="bg-white p-4 rounded-lg border space-y-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-gray-500" />
                          <Label htmlFor="shipping_address" className="text-lg font-semibold">
                            Shipping Address
                          </Label>
                        </div>
                        <div className="space-y-2">
                          <textarea
                            id="shipping_address"
                            value={checkoutData.shipping_address}
                            onChange={(e) => setCheckoutData(prev => ({
                              ...prev,
                              shipping_address: e.target.value
                            }))}
                            placeholder="Enter your complete delivery address"
                            className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            required
                          />
                          <p className="text-sm text-gray-500">
                            Please provide complete address including:
                            <ul className="list-disc ml-5 mt-1">
                              <li>House/Flat number</li>
                              <li>Street name</li>
                              <li>Locality/Area</li>
                              <li>City</li>
                              <li>PIN code</li>
                            </ul>
                          </p>
                        </div>
                      </div>

                      {/* Contact Number Section */}
                      <div className="bg-white p-4 rounded-lg border space-y-3">
                        <div className="flex items-center gap-2">
                          <Phone className="h-5 w-5 text-gray-500" />
                          <Label htmlFor="mobile_number" className="text-lg font-semibold">
                            Contact Number
                          </Label>
                        </div>
                        <div className="space-y-2">
                          <Input
                            id="mobile_number"
                            type="tel"
                            pattern="[0-9]{10}"
                            value={checkoutData.mobile_number}
                            onChange={(e) => setCheckoutData(prev => ({
                              ...prev,
                              mobile_number: e.target.value
                            }))}
                            placeholder="Enter 10-digit mobile number"
                            className="text-lg"
                            required
                          />
                          <p className="text-sm text-gray-500">
                            This number will be used for:
                            <ul className="list-disc ml-5 mt-1">
                              <li>Delivery updates</li>
                              <li>Order confirmation</li>
                              <li>Delivery coordination</li>
                            </ul>
                          </p>
                        </div>
                      </div>

                      {/* Payment Method Section */}
                      <div className="bg-white p-4 rounded-lg border space-y-3">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-gray-500" />
                          <h3 className="text-lg font-semibold">Payment Method</h3>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-3 rounded-md">
                          <CreditCard className="h-4 w-4" />
                          <span>Cash on Delivery</span>
                        </div>
                      </div>

                      {/* Order Summary Section */}
                      <div className="bg-white p-4 rounded-lg border space-y-3">
                        <h3 className="text-lg font-semibold">Order Summary</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Items Total</span>
                            <span>₹{total}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Delivery Fee</span>
                            <span className="text-green-600">Free</span>
                          </div>
                          <div className="flex justify-between font-semibold pt-2 border-t">
                            <span>Total Amount</span>
                            <span>₹{total}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </>
          )}
        </CardContent>
        {cartItems.length > 0 && (
          <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="text-lg font-semibold">
              Total: ₹{total}
            </div>
            {showCheckoutForm ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCheckoutForm(false)}
                  className="flex items-center gap-2"
                >
                  <ShoppingBag className="h-5 w-5" />
                  Continue Shopping
                </Button>
                <Button
                  disabled={checkingOut}
                  onClick={handleCheckout}
                  className="flex items-center gap-2"
                >
                  {checkingOut ? (
                    "Processing..."
                  ) : (
                    <>
                      <Truck className="h-5 w-5" />
                      Place Order
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setShowCheckoutForm(true)}
                className="flex items-center gap-2"
              >
                <Truck className="h-5 w-5" />
                Proceed to Checkout
              </Button>
            )}
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}
