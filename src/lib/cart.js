
import { supabase, handleError } from "@/lib/supabase";

export const syncCart = async (userId, items) => {
  try {
    // First, remove existing cart items
    const { error: deleteError } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    if (deleteError) throw deleteError;

    // Then, insert new cart items
    if (items.length > 0) {
      const cartItems = items.map(item => ({
        user_id: userId,
        product_id: item.id,
        quantity: item.quantity
      }));

      const { error: insertError } = await supabase
        .from('cart_items')
        .insert(cartItems);

      if (insertError) throw insertError;
    }
  } catch (error) {
    handleError(error);
  }
};

export const getCart = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        quantity,
        products (
          id,
          name,
          price,
          description,
          image_url
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;

    return data.map(item => ({
      ...item.products,
      quantity: item.quantity
    }));
  } catch (error) {
    handleError(error);
    return [];
  }
};
