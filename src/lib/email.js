
import { supabase } from "@/lib/supabase";

const EMAIL_TEMPLATES = {
  ORDER_PLACED: {
    subject: "Order Confirmation - Pagdiwala",
    getBody: (order) => `
      Dear ${order.customer_name},

      Thank you for choosing Pagdiwala - Parampara Safa House!

      Your order #${order.id} has been successfully placed.

      Order Details:
      ${order.items.map(item => `
      - ${item.product.name}
        Quantity: ${item.quantity}
        Price: ₹${item.price}
      `).join('\n')}

      Total Amount: ₹${order.total_amount}

      Delivery Address:
      ${order.shipping_address}

      Contact Number: ${order.mobile_number}

      We will process your order soon and update you about the delivery.

      For any queries, please contact us:
      Phone: ${CONTACT_INFO.phone}
      Email: ${CONTACT_INFO.email}

      Best Regards,
      Team Pagdiwala
    `
  },
  ORDER_APPROVED: {
    subject: "Order Approved - Pagdiwala",
    getBody: (order) => `
      Dear ${order.customer_name},

      Your order #${order.id} has been approved!

      Expected Delivery Date: ${new Date(order.delivery_date).toLocaleDateString()}

      Order Details:
      ${order.items.map(item => `
      - ${item.product.name}
        Quantity: ${item.quantity}
      `).join('\n')}

      Delivery Address:
      ${order.shipping_address}

      We'll notify you once your order is shipped.

      For any queries, please contact us:
      Phone: ${CONTACT_INFO.phone}
      Email: ${CONTACT_INFO.email}

      Best Regards,
      Team Pagdiwala
    `
  },
  ORDER_SHIPPED: {
    subject: "Order Shipped - Pagdiwala",
    getBody: (order) => `
      Dear ${order.customer_name},

      Great news! Your order #${order.id} has been shipped.

      Expected Delivery: ${new Date(order.delivery_date).toLocaleDateString()}

      Delivery Address:
      ${order.shipping_address}

      Contact Number: ${order.mobile_number}

      For any queries, please contact us:
      Phone: ${CONTACT_INFO.phone}
      Email: ${CONTACT_INFO.email}

      Best Regards,
      Team Pagdiwala
    `
  },
  ORDER_DELIVERED: {
    subject: "Order Delivered - Pagdiwala",
    getBody: (order) => `
      Dear ${order.customer_name},

      Your order #${order.id} has been delivered successfully.

      Thank you for choosing Pagdiwala - Parampara Safa House. We hope you enjoy our service.

      For rental items, please remember:
      - Return the items in the same condition
      - Follow the return timeline
      - Contact us if you need any assistance

      For any queries, please contact us:
      Phone: ${CONTACT_INFO.phone}
      Email: ${CONTACT_INFO.email}

      Best Regards,
      Team Pagdiwala
    `
  }
};

export const sendOrderEmail = async (order, template) => {
  try {
    const emailTemplate = EMAIL_TEMPLATES[template];
    if (!emailTemplate) {
      throw new Error('Invalid email template');
    }

    // Get customer details
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('first_name, last_name, email')
      .eq('id', order.customer_id)
      .single();

    if (customerError) throw customerError;

    const customer_name = `${customerData.first_name} ${customerData.last_name}`;
    const orderWithCustomer = { ...order, customer_name };

    // Get order items with product details
    const { data: itemsData, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        quantity,
        price,
        product:products (
          name
        )
      `)
      .eq('order_id', order.id);

    if (itemsError) throw itemsError;

    orderWithCustomer.items = itemsData;

    // Send email using Supabase's email service
    const { error: emailError } = await supabase.auth.admin.sendEmail(
      customerData.email,
      emailTemplate.subject,
      emailTemplate.getBody(orderWithCustomer)
    );

    if (emailError) throw emailError;

    return true;
  } catch (error) {
    console.error('Failed to send order email:', error);
    return false;
  }
};
