import { supabase } from "@/lib/supabase";

const EMAIL_TEMPLATES = new Set([
  "ORDER_PLACED",
  "ORDER_APPROVED",
  "ORDER_SHIPPED",
  "ORDER_DELIVERED",
]);

/**
 * Ask the protected Edge Function to send an order notification.
 * Order details and email content are assembled server-side so customer data
 * and email credentials never come from the browser.
 */
export const sendOrderEmail = async (order, template) => {
  if (!order?.id || !EMAIL_TEMPLATES.has(template)) {
    console.error("Invalid order email request", { orderId: order?.id, template });
    return false;
  }

  try {
    const { data, error } = await supabase.functions.invoke("send-email", {
      body: {
        action: "order-notification",
        orderId: order.id,
        template,
      },
    });

    if (error) {
      let message = error.message || "Unable to send order email";

      if (error.context instanceof Response) {
        try {
          const response = await error.context.json();
          message = response.error || message;
        } catch {
          // Keep the SDK error when the function response is not JSON.
        }
      }

      throw new Error(message);
    }

    if (!data?.sent) {
      throw new Error(data?.error || "Unable to send order email");
    }

    return true;
  } catch (error) {
    // Email delivery should not undo a successfully created order.
    console.error("Failed to send order email:", error);
    return false;
  }
};
