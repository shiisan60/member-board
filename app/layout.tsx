import type { Metadata } from "next"
import "./globals.css"
import { auth } from "@/lib/auth"
import ClientLayout from "@/components/ClientLayout"

export const metadata: Metadata = {
  title: "Member Board",
  description: "A community board for members",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  return (
    <html lang="ja">
      <body suppressHydrationWarning={true}>
        <ClientLayout session={session}>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}
