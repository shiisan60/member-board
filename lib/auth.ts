import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

const getPublicUrl = () => {
  // AUTH_URL を最優先。未設定なら NEXTAUTH_URL、最後に Vercel 環境変数から導出
  const explicit = process.env.AUTH_URL || process.env.NEXTAUTH_URL
  if (explicit) return explicit
  const vercelUrl = process.env.VERCEL_URL
  if (vercelUrl) {
    const normalized = vercelUrl.startsWith('http') ? vercelUrl : `https://${vercelUrl}`
    return normalized
  }
  return undefined
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // 本番でも一時的にデバッグを有効化（原因調査のため）
  debug: true,
  // ホスト信頼と公開URLを明示（Vercel等のプロキシ配下での不整合を防止）
  trustHost: process.env.AUTH_TRUST_HOST === 'true' || !!process.env.VERCEL,
  basePath: "/api/auth",
  // next-auth v5 互換の AUTH_* を優先し、未設定時は NEXTAUTH_* を利用
  // これにより Configuration エラーを避ける
  providers: [
    Google({
      // 複数の環境変数にフォールバック + JSON貼り付け誤りにも耐性を持たせる
      clientId: (() => {
        const raw =
          process.env.GOOGLE_CLIENT_ID ||
          process.env.AUTH_GOOGLE_ID ||
          ""
        try {
          // GoogleのJSONをそのまま貼ったケースに対応
          const obj = JSON.parse(raw)
          if (obj?.web?.client_id) return obj.web.client_id as string
        } catch {}
        return raw
      })(),
      clientSecret: (() => {
        const raw =
          process.env.GOOGLE_CLIENT_SECRET ||
          process.env.AUTH_GOOGLE_SECRET ||
          ""
        try {
          const obj = JSON.parse(raw)
          if (obj?.web?.client_secret) return obj.web.client_secret as string
        } catch {}
        return raw
      })(),
      // 学習/検証用途: 同一メールの既存アカウントにGoogleを自動リンク
      // 本番運用ではメール乗っ取りリスクを避けるためオフ推奨
      allowDangerousEmailAccountLinking: false,
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
  // AUTH_URL/NEXTAUTH_URL が無ければ VERCEL_URL から導出
  // @ts-ignore - 型にないが Auth.js v5 で有効
  url: getPublicUrl(),
  callbacks: {
    async signIn({ user, account, profile }) {
      // Google OAuth で同一メールの既存ユーザーが居る場合、強制的にアカウントをリンク
      try {
        if (account?.provider === 'google' && user?.email) {
          // email_verified を厳格チェック (profile または id_token から判定)
          let emailVerified = false
          const prof: any = profile || {}
          if (typeof prof.email_verified === 'boolean') {
            emailVerified = prof.email_verified
          } else if ((account as any)?.id_token) {
            try {
              const idToken = (account as any).id_token as string
              const payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString())
              if (typeof payload?.email_verified === 'boolean') {
                emailVerified = payload.email_verified
              }
            } catch {}
          }

          if (!emailVerified) {
            // 未確認メールのアカウントはリンク/サインインを拒否
            return false
          }

          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: { accounts: true },
          })

          if (existingUser) {
            const alreadyLinked = existingUser.accounts.some(
              (a) => a.provider === 'google'
            )

            if (!alreadyLinked) {
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: 'oauth',
                  provider: 'google',
                  providerAccountId: account.providerAccountId!,
                  access_token: (account as any).access_token ?? null,
                  refresh_token: (account as any).refresh_token ?? null,
                  expires_at: (account as any).expires_at ?? null,
                  token_type: (account as any).token_type ?? null,
                  scope: (account as any).scope ?? null,
                  id_token: (account as any).id_token ?? null,
                  session_state: (account as any).session_state ?? null,
                },
              })
            }
          } else {
            // 既存ユーザーが存在しない場合は新規作成を許可しない
            return false
          }
        }
      } catch (e) {
        console.error('[signIn:autoLink] failed:', e)
        // 失敗してもサインイン自体は継続（既存のNextAuth挙動を阻害しない）
      }
      return true
    },
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

