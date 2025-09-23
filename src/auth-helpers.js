import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";

// Server side auth Helper function
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  console.log(`[Auth Helper] Checking admin access for user: ${session?.user?.email}, role: ${session?.user?.role}`);
  
  if (!session) {
    console.log(`[Auth Helper] No session found - redirecting to signin`);
    redirect("/auth/signin");
  }
  
  if (session.user?.role !== "admin") {
    console.log(`[Auth Helper] Non-admin user tried to access admin area - redirecting to access denied`);
    redirect("/access-denied");
  }
  
  console.log(`[Auth Helper] Admin access granted`);
  return session;
}

// Server side auth Helper function
export async function requireCustomer() {
  const session = await getServerSession(authOptions);
  console.log(`[Auth Helper] Checking customer access for user: ${session?.user?.email}, role: ${session?.user?.role}`);
  
  if (!session) {
    console.log(`[Auth Helper] No session found - redirecting to signin`);
    redirect("/auth/signin");
  }
  
  if (session.user?.role !== "customer") {
    console.log(`[Auth Helper] Non-customer user tried to access customer area - redirecting to access denied`);
    redirect("/access-denied");
  }
  
  console.log(`[Auth Helper] Customer access granted`);
  return session;
}

// Server side auth Helper function
export async function requireSession() {
  const session = await getServerSession(authOptions);
  console.log(`[Auth Helper] Checking session for user: ${session?.user?.email}`);
  
  if (!session) {
    console.log(`[Auth Helper] No session found - redirecting to signin`);
    redirect("/auth/signin");
  }
  
  console.log(`[Auth Helper] Session found`);
  return session;
}