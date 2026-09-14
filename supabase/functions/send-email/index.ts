import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const requiredEnv = (name: string) => {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

const supabaseUrl = requiredEnv("SUPABASE_URL");
const supabaseServiceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const allowedTemplates = new Set([
  "ORDER_PLACED",
  "ORDER_APPROVED",
  "ORDER_SHIPPED",
  "ORDER_DELIVERED",
]);

const getString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const escapeHtml = (value: unknown) =>
  getString(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const formatDate = (value: unknown) => {
  if (!value) return "To be confirmed";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime())
    ? "To be confirmed"
    : date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
};

const formatCurrency = (value: unknown) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const getCustomerName = (customer: Record<string, unknown>) =>
  [customer.first_name, customer.middle_name, customer.last_name]
    .filter(Boolean)
    .join(" ") || "Customer";

const getTemplate = (template: string, order: Record<string, any>, customer: Record<string, any>) => {
  const name = escapeHtml(getCustomerName(customer));
  const orderId = escapeHtml(order.id);
  const address = escapeHtml(order.shipping_address || "To be confirmed");
  const mobile = escapeHtml(order.mobile_number || customer.mobile_number || "Not provided");
  const deliveryDate = formatDate(order.delivery_date);
  const items = (order.order_items || []).map((item: Record<string, any>) => ({
    name: escapeHtml(item.product?.name || "Turban"),
    quantity: escapeHtml(item.quantity),
    price: formatCurrency(item.price),
  }));
  const itemRows = items.length
    ? items.map((item) => `<li>${item.name} — quantity: ${item.quantity} — ${item.price}</li>`).join("")
    : "<li>Order items are being prepared</li>";

  const details = {
    ORDER_PLACED: {
      subject: "Order confirmation - Pagdiwala",
      heading: "Your rental request has been received",
      message: "Thank you for choosing Pagdiwala - Parampara Safa House. We will contact you to confirm availability and the tying appointment.",
    },
    ORDER_APPROVED: {
      subject: "Order approved - Pagdiwala",
      heading: "Your rental request is approved",
      message: "Your order has been approved. Our team will coordinate the appointment details with you.",
    },
    ORDER_SHIPPED: {
      subject: "Order on the way - Pagdiwala",
      heading: "Your turbans are on the way",
      message: "Our team is preparing for the agreed delivery and turban-tying appointment.",
    },
    ORDER_DELIVERED: {
      subject: "Order delivered - Pagdiwala",
      heading: "Your turbans have been delivered",
      message: "Thank you for choosing Pagdiwala. Please keep the turbans safe and return them according to the agreed rental timeline.",
    },
  }[template as "ORDER_PLACED" | "ORDER_APPROVED" | "ORDER_SHIPPED" | "ORDER_DELIVERED"];

  const text = [
    `Dear ${getCustomerName(customer)},`,
    "",
    details.message,
    "",
    `Order: #${order.id}`,
    `Items: ${items.map((item) => `${item.name} x ${item.quantity}`).join(", ") || "Being prepared"}`,
    `Total: ${formatCurrency(order.total_amount)}`,
    `Delivery address: ${order.shipping_address || "To be confirmed"}`,
    `Contact number: ${order.mobile_number || customer.mobile_number || "Not provided"}`,
    `Expected date: ${deliveryDate}`,
    "",
    "Free-size turbans are adjusted and tied by our team during the appointment.",
    "",
    "For help, contact admin@pagdiwala.com or +91-7770812047.",
    "",
    "Regards,",
    "Team Pagdiwala",
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#172033;max-width:640px;margin:auto">
      <h2 style="color:#7c3aed">${details.heading}</h2>
      <p>Dear ${name},</p>
      <p>${escapeHtml(details.message)}</p>
      <div style="background:#f5f3ff;border-radius:8px;padding:16px">
        <p><strong>Order:</strong> #${orderId}</p>
        <p><strong>Items:</strong></p>
        <ul>${itemRows}</ul>
        <p><strong>Total:</strong> ${formatCurrency(order.total_amount)}</p>
        <p><strong>Delivery address:</strong><br>${address}</p>
        <p><strong>Contact number:</strong> ${mobile}</p>
        <p><strong>Expected date:</strong> ${escapeHtml(deliveryDate)}</p>
      </div>
      <p>All turbans are free size and will be adjusted and tied by our team during the appointment.</p>
      <p>For help, contact <a href="mailto:admin@pagdiwala.com">admin@pagdiwala.com</a> or +91-7770812047.</p>
      <p>Regards,<br>Team Pagdiwala</p>
    </div>
  `;

  return { subject: details.subject, text, html };
};

const isAdmin = async (user: { email?: string }) => {
  if (!user.email) return false;
  const { data, error } = await supabaseAdmin
    .from("admin_users")
    .select("email")
    .eq("email", user.email)
    .maybeSingle();

  if (error) {
    console.error("Admin lookup failed:", error);
    return false;
  }

  return Boolean(data);
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) return json({ error: "Authentication required" }, 401);

    const userClient = createClient(supabaseUrl, requiredEnv("SUPABASE_ANON_KEY"), {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) return json({ error: "Authentication required" }, 401);

    const body = await request.json() as Record<string, unknown>;
    if (body.action !== "order-notification") {
      return json({ error: "Unsupported email action" }, 400);
    }

    const orderId = getString(body.orderId);
    const template = getString(body.template);
    if (!orderId || !allowedTemplates.has(template)) {
      return json({ error: "Invalid order email request" }, 400);
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select(`
        id,
        customer_id,
        total_amount,
        shipping_address,
        mobile_number,
        delivery_date,
        order_items (
          quantity,
          price,
          product:products (name)
        )
      `)
      .eq("id", orderId)
      .single();

    if (orderError || !order) return json({ error: "Order not found" }, 404);

    const callerIsOwner = order.customer_id === userData.user.id;
    const callerIsAdmin = await isAdmin(userData.user);
    if (!callerIsOwner && !callerIsAdmin) return json({ error: "Not allowed" }, 403);

    // Customers may only send the initial confirmation for their own order.
    if (callerIsOwner && !callerIsAdmin && template !== "ORDER_PLACED") {
      return json({ error: "Not allowed" }, 403);
    }

    const { data: customer, error: customerError } = await supabaseAdmin
      .from("customers")
      .select("email, first_name, middle_name, last_name, mobile_number")
      .eq("id", order.customer_id)
      .single();

    if (customerError || !customer?.email) return json({ error: "Customer email not found" }, 404);

    const email = getTemplate(template, order, customer);
    const resendApiKey = requiredEnv("RESEND_API_KEY");
    const emailFrom = requiredEnv("EMAIL_FROM");
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: emailFrom,
        to: [customer.email],
        subject: email.subject,
        html: email.html,
        text: email.text,
      }),
    });

    if (!resendResponse.ok) {
      const responseText = await resendResponse.text();
      console.error("Email provider rejected request:", responseText);
      return json({ error: "Email provider rejected the message" }, 502);
    }

    const resendData = await resendResponse.json();
    return json({ sent: true, id: resendData.id || null });
  } catch (error) {
    console.error("Send email function error:", error);
    return json({ error: "Unable to send email" }, 500);
  }
});
