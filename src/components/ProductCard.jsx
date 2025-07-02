
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import { getCart, syncCart } from "@/lib/cart";
import { ShoppingCart } from "lucide-react";

export function ProductCard({ product }) {
  const { toast } = useToast();
  const { getCurrentUser } = useAuth();

  const handleAddToCart = async () => {
    try {
      const user = getCurrentUser();
      if (!user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please login to add items to cart",
        });
        return;
      }

      const currentCart = await getCart(user.id);
      const existingItem = currentCart.find(item => item.id === product.id);
      
      let updatedCart;
      if (existingItem) {
        updatedCart = currentCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        updatedCart = [...currentCart, { ...product, quantity: 1 }];
      }

      await syncCart(user.id, updatedCart);
      
      toast({
        title: "Success",
        description: "Item added to cart",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add item to cart",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col card-hover">
        <CardHeader>
          <CardTitle className="text-xl line-clamp-2">{product.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="aspect-square mb-4 overflow-hidden rounded-md">
            <img 
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
              alt={product.name}
              src={product.image_url} 
            />
          </div>
          <p className="text-2xl font-bold text-primary mb-2">₹{product.price}</p>
          <p className="text-gray-600 line-clamp-3">{product.description}</p>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleAddToCart}
            className="w-full button-hover flex items-center justify-center gap-2"
          >
            <ShoppingCart className="h-5 w-5" />
            Add to Cart
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
