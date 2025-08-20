import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // 本番でも一時的にデバッグを有効化（原因調査のため）
  debug: true,
  // ホスト信頼と公開URLを明示（Vercel等のプロキシ配下での不整合を防止）
  trustHost: process.env.AUTH_TRUST_HOST === 'true',
  basePath: "/api/auth",
  // next-auth v5 互換の AUTH_* を優先し、未設定時は NEXTAUTH_* を利用
  // これにより Configuration エラーを避ける
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string
          },
          select: {
            id: true,
            email: true,
            password: true,
            name: true,
            role: true,
            emailVerified: true
          }
        })

        if (!user || !user.password) {
          return null
        }

        // メール認証が完了していない場合はログインを拒否
        if (!user.emailVerified) {
          throw new Error("メールアドレスの認証が完了していません。確認メールをご確認ください。")
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!passwordMatch) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  // 既知のトラブルを避けるため、明示的に URL/SECRET を指定
  // AUTH_URL/NEXTAUTH_URL はメールテンプレート等でも参照
  // @ts-ignore - 型にないが Auth.js v5 で有効
  url: process.env.AUTH_URL || process.env.NEXTAUTH_URL,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 12)
}

