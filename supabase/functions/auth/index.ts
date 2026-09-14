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

const supabaseAdmin = createClient(
  requiredEnv("SUPABASE_URL"),
  requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const getString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const validateSignUp = (body: Record<string, unknown>) => {
  const email = getString(body.email).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  const firstName = getString(body.firstName);
  const middleName = getString(body.middleName);
  const lastName = getString(body.lastName);
  const mobile = getString(body.mobile);
  const address = getString(body.address);

  if (!email || !email.includes("@")) {
    return { error: "Please enter a valid email address" };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long" };
  }
  if (!firstName || !lastName || !address) {
    return { error: "First name, last name, and address are required" };
  }
  if (!/^\d{10}$/.test(mobile)) {
    return { error: "Please enter a valid 10-digit mobile number" };
  }

  return { email, password, firstName, middleName, lastName, mobile, address };
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await request.json() as Record<string, unknown>;

    if (body.action !== "sign-up") {
      return json({ error: "Unsupported auth action" }, 400);
    }

    const input = validateSignUp(body);
    if ("error" in input) return json({ error: input.error }, 400);

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: input.email,
        password: input.password,
        email_confirm: true,
        user_metadata: {
          first_name: input.firstName,
          middle_name: input.middleName || null,
          last_name: input.lastName,
          mobile_number: input.mobile,
          address: input.address,
        },
      });

    if (authError || !authData.user) {
      console.error("Auth user creation failed:", authError);
      return json({ error: "Unable to create account with these details" }, 400);
    }

    const now = new Date().toISOString();
    const { error: customerError } = await supabaseAdmin
      .from("customers")
      .upsert({
        id: authData.user.id,
        email: input.email,
        first_name: input.firstName,
        middle_name: input.middleName,
        last_name: input.lastName,
        mobile_number: input.mobile,
        address: input.address,
        created_at: now,
        updated_at: now,
      }, { onConflict: "id" });

    if (customerError) {
      console.error("Customer profile creation failed:", customerError);
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return json({ error: "Unable to finish account setup" }, 500);
    }

    return json({
      user: { id: authData.user.id, email: authData.user.email },
    }, 201);
  } catch (error) {
    console.error("Auth function error:", error);
    return json({ error: "Unable to process authentication request" }, 500);
  }
});
