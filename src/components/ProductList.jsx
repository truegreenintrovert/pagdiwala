
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/ProductCard";
import { getProducts } from "@/lib/products";
import { useToast } from "@/components/ui/use-toast";
import { Helmet } from "react-helmet";

export function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load products. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Wedding Turbans & Safas for Rent | Pagdiwala</title>
        <meta name="description" content="Browse our collection of premium wedding turbans and safas for rent. Best quality wedding pagdi rental service in Bilaspur. Book your wedding safa today!" />
        <meta name="keywords" content="wedding turban rental, safa on rent, wedding safa, pagdi rental, dulha safa, groom turban" />
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-primary">
          Wedding Turbans & Safas
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </>
  );
}
