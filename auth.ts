import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Resend({ apiKey: process.env.AUTH_RESEND_KEY, from: process.env.EMAIL_FROM })],
  pages: { signIn: "/entrar", verifyRequest: "/entrar?enviado=1" },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = adminEmails.includes(user.email?.toLowerCase() ?? "") ? "ADMIN" : (user as { role?: string }).role ?? "USER";
      }
      return session;
    }
  },
  session: { strategy: "database" },
  trustHost: true
});

declare module "next-auth" {
  interface Session { user: { id: string; role: string; name?: string | null; email?: string | null; image?: string | null } }
}
