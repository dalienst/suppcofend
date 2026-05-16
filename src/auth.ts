import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import api from "@/lib/api"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const response = await api.post("/api/v1/auth/login/", {
            email: credentials.email,
            password: credentials.password,
          })

          const user = response.data

          if (user && user.token) {
            // Map Django response to NextAuth user object
            return {
              id: user.id,
              email: user.email,
              name: user.username,
              token: user.token,
              is_contractor: user.is_contractor,
              is_supplier: user.is_supplier,
              account_type: user.account_type,
              reference: user.reference,
            }
          }
          return null
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).token
        token.is_contractor = (user as any).is_contractor
        token.is_supplier = (user as any).is_supplier
        token.account_type = (user as any).account_type
        token.reference = (user as any).reference
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        (session as any).accessToken = token.accessToken;
        (session as any).user.is_contractor = token.is_contractor;
        (session as any).user.is_supplier = token.is_supplier;
        (session as any).user.account_type = token.account_type;
        (session as any).user.reference = token.reference;
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
})
