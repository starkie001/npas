// auth.js
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"

// Demo users – replace with DB in real project
async function getUserByEmail(email) {
  const users = [
    { id: "1", name: "Admin User", email: "admin@example.com", password: "admin123", role: "admin" },
    { id: "2", name: "Customer User", email: "customer@example.com", password: "customer123", role: "customer" },
  ]
  return users.find((u) => u.email === email)
}

export const authOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await getUserByEmail(credentials.email)
        if (user && user.password === credentials.password) return user
        return null
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, profile }) {
      if (user) {
        token.role = user.role || "customer";
        token.picture = user.image || profile?.picture || null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.image = token.picture || null;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
  },
}
