import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";

// Server side auth Helper function
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    redirect("/auth/signin");
  }
  return session;
}

// Server side auth Helper function
export async function requireCustomer() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "customer") {
    redirect("/auth/signin");
  }
  return session;
}

// Server side auth Helper function
export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/signin");
  }
  return session;
}