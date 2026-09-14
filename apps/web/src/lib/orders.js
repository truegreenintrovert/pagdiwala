import { supabase, handleError } from "@/lib/supabase";
import { ORDER_STATUS } from "@/lib/constants";
import { sendOrderEmail } from "@/lib/email";

export const createOrder = async (orderData) => {
  try {
    console.log('Creating order with data:', { ...orderData, items: 'hidden' });

    // First create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: orderData.userId,
        total_amount: orderData.total,
        shipping_address: orderData.shipping_address,
        mobile_number: orderData.mobile_number,
        status: ORDER_STATUS.PENDING,
        payment_method: 'cash_on_delivery',
        payment_status: 'pending'
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      throw orderError;
    }

    console.log('Order created:', order);

    // Then create order items
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Order items creation error:', itemsError);
      // Try to clean up the order if items creation fails
      await supabase
        .from('orders')
        .delete()
        .eq('id', order.id);
      throw itemsError;
    }

    // Send order confirmation email
    await sendOrderEmail(order, 'ORDER_PLACED');

    return order;
  } catch (error) {
    console.error('Order creation failed:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, { status, delivery_date }) => {
  try {
    const statusUpdate = {
      status,
      updated_at: new Date().toISOString()
    };

    // Keep the approved appointment date when moving an order to shipped or
    // delivered. Only an explicit date update should change this field.
    if (delivery_date !== undefined) {
      statusUpdate.delivery_date = delivery_date;
    }

    const { data, error } = await supabase
      .from('orders')
      .update(statusUpdate)
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    // Send status update email
    let emailTemplate;
    switch (status) {
      case ORDER_STATUS.APPROVED:
        emailTemplate = 'ORDER_APPROVED';
        break;
      case ORDER_STATUS.SHIPPED:
        emailTemplate = 'ORDER_SHIPPED';
        break;
      case ORDER_STATUS.DELIVERED:
        emailTemplate = 'ORDER_DELIVERED';
        break;
      default:
        emailTemplate = null;
    }

    if (emailTemplate) {
      await sendOrderEmail(data, emailTemplate);
    }

    return data;
  } catch (error) {
    handleError(error);
  }
};

export const getOrders = async (userId = null) => {
  try {
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          product: products (*)
        )
      `);

    if (userId) {
      query = query.eq('customer_id', userId);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error);
    return [];
  }
};
