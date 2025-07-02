
import { supabase, handleError } from "@/lib/supabase";

export const getProducts = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*');

    if (error) throw error;
    return data || [];
  } catch (error) {
    handleError(error);
    return [];
  }
};

export const updateProduct = async (product) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({
        name: product.name,
        description: product.description,
        price: product.price,
        stock_quantity: product.stock_quantity,
        image_url: product.image_url
      })
      .eq('id', product.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error);
  }
};
